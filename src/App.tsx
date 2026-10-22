/**
 * WATCHDOGS AI Runtime Security Monitor
 * Main Application Shell & Real-Time Orchestrator
 */

import React, { useState, useEffect, useCallback } from 'react';
import { TopBar } from './components/TopBar.tsx';
import { ThreatTelemetry } from './components/ThreatTelemetry.tsx';
import { PolicyToggles } from './components/PolicyToggles.tsx';
import { AttackSimulator } from './components/AttackSimulator.tsx';
import { AuditLogViewer } from './components/AuditLogViewer.tsx';
import { HoneypotConsole } from './components/HoneypotConsole.tsx';
import { IntegrationHub } from './components/IntegrationHub.tsx';
import { GuideTab } from './components/GuideTab.tsx';
import { AgentContextController } from './components/AgentContextController.tsx';
import { AgentTrustFleet } from './components/AgentTrustFleet.tsx';
import { IncidentQuarantine } from './components/IncidentQuarantine.tsx';
import { CustomRuleStudio } from './components/CustomRuleStudio.tsx';
import { RedTeamBenchmark } from './components/RedTeamBenchmark.tsx';
import {
  SecurityPolicies,
  TelemetryStats,
  StorageMetrics,
  AuditLogEntry,
  AgentContextState,
  InterceptionResult,
} from './types/watchdogs.ts';
import {
  Shield,
  Zap,
  Activity,
  Layers,
  HardDrive,
  RefreshCw,
  Bell,
  Lock,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('telemetry');
  const [policies, setPolicies] = useState<SecurityPolicies>({
    blockPiiExtraction: true,
    enforceReadOnlyFs: true,
    blockUnauthorizedIpEgress: true,
    preventShellExecution: true,
    honeypotSpecGaming: true,
    contextWipeOnExploit: true,
    dynamicParamRedaction: true,
    strictSqlInjection: true,
  });
  const [compiledPrompt, setCompiledPrompt] = useState<string>('');
  const [stats, setStats] = useState<TelemetryStats | null>(null);
  const [storage, setStorage] = useState<StorageMetrics | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [agentState, setAgentState] = useState<AgentContextState | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'alert' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'alert' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Fetch initial telemetry and policy data
  const fetchAllData = useCallback(async () => {
    try {
      const [policiesRes, telemetryRes, storageRes, logsRes, agentRes] = await Promise.all([
        fetch('/api/policies'),
        fetch('/api/telemetry'),
        fetch('/api/storage/metrics'),
        fetch('/api/audit-logs'),
        fetch('/api/agent/state'),
      ]);

      if (policiesRes.ok) {
        const data = await policiesRes.json();
        setPolicies(data.policies);
        setCompiledPrompt(data.compiledPrompt);
      }

      if (telemetryRes.ok) {
        setStats(await telemetryRes.json());
      }

      if (storageRes.ok) {
        setStorage(await storageRes.json());
      }

      if (logsRes.ok) {
        const data = await logsRes.json();
        setAuditLogs(data.logs || []);
      }

      if (agentRes.ok) {
        setAgentState(await agentRes.json());
      }
    } catch (err) {
      console.error('Error fetching WATCHDOGS data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Handle policy updates
  const handleUpdatePolicies = async (newPolicies: SecurityPolicies) => {
    try {
      const res = await fetch('/api/policies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ policies: newPolicies }),
      });

      if (res.ok) {
        const data = await res.json();
        setPolicies(data.policies);
        setCompiledPrompt(data.compiledPrompt);
        showNotification('Security invariants updated and recompiled into Overseer prompt.');
      }
    } catch (err) {
      console.error('Failed to update policies:', err);
      showNotification('Failed to update security policies', 'alert');
    }
  };

  // Handle executing a tool invocation through the cascade proxy
  const handleExecuteTool = async (
    toolName: string,
    payload: Record<string, any>
  ): Promise<InterceptionResult> => {
    const res = await fetch('/api/proxy/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agentId: 'agent_gemini_primary',
        toolName,
        payload,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Evaluation proxy request failed');
    }

    const result: InterceptionResult = await res.json();

    // Refresh telemetry and logs
    fetchAllData();

    if (result.verdict === 'BLOCK') {
      showNotification(`Threat Intercepted: ${result.actionTaken}`, 'alert');
    } else if (result.verdict === 'REDACT_EXECUTE') {
      showNotification('Surgical Parameter Redaction Applied: Malicious tokens stripped', 'success');
    } else if (result.verdict === 'HONEYPOT_REROUTE') {
      showNotification('Specification Gaming Trapped: Agent silently rerouted to Honeypot', 'alert');
    }

    return result;
  };

  // Handle emergency context memory wipe
  const handleEmergencyWipe = async (reason?: string) => {
    try {
      const res = await fetch('/api/agent/wipe-context', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: 'agent_gemini_primary',
          reason: reason || 'Emergency security operator context purge',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        showNotification(data.message || 'Primary agent context window forcefully purged.');
        fetchAllData();
      }
    } catch (err) {
      console.error('Failed to wipe agent context:', err);
      showNotification('Context wipe failed', 'alert');
    }
  };

  return (
    <div className="min-h-screen bg-[#070a11] text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top Navigation Bar */}
      <TopBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        systemHealthy={true}
        onEmergencyWipe={() => handleEmergencyWipe('Manual topbar emergency context wipe')}
      />

      {/* Floating Notification Toast */}
      {notification && (
        <div className="fixed top-18 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-lg border shadow-xl backdrop-blur-md transition-all duration-300 text-xs font-semibold animate-in fade-in slide-in-from-top-2 bg-[#0c121e] border-slate-700 text-white">
          {notification.type === 'alert' ? (
            <Shield className="w-4 h-4 text-rose-400 shrink-0" />
          ) : (
            <Zap className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Cascade Architecture Ribbon Banner */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900/90 via-[#0a101b] to-slate-900/90 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white uppercase tracking-wide">
                  Cascade Interception Pipeline Active
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                  Sub-Millisecond Guard
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Tier 1 Heuristics (&lt;1ms) · Tier 2 Semantic Cache (~5ms / 5 TB Google AI Pro) · Tier 3 Groq/Gemini Overseer
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <button
              onClick={() => setActiveTab('guide')}
              className="px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 font-sans font-semibold transition-colors cursor-pointer"
            >
              How It Works (Guide)
            </button>
            <div className="px-3 py-1.5 rounded-lg bg-slate-950/70 border border-slate-800 text-slate-300">
              Avg Latency: <span className="text-emerald-400 font-bold">{stats?.avgLatencyMs || 0.4}ms</span>
            </div>
            <button
              onClick={fetchAllData}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
              title="Refresh telemetry"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Viewport Content */}
        {activeTab === 'telemetry' && (
          <ThreatTelemetry
            stats={stats}
            storage={storage}
            onRefresh={fetchAllData}
          />
        )}

        {activeTab === 'fleet' && (
          <AgentTrustFleet />
        )}

        {activeTab === 'quarantine' && (
          <IncidentQuarantine />
        )}

        {activeTab === 'benchmark' && (
          <RedTeamBenchmark />
        )}

        {activeTab === 'custom_rules' && (
          <CustomRuleStudio />
        )}

        {activeTab === 'policies' && (
          <PolicyToggles
            policies={policies}
            compiledPrompt={compiledPrompt}
            onUpdatePolicies={handleUpdatePolicies}
          />
        )}

        {activeTab === 'simulator' && (
          <AttackSimulator onExecuteTool={handleExecuteTool} />
        )}

        {activeTab === 'audit' && (
          <AuditLogViewer logs={auditLogs} onRefresh={fetchAllData} />
        )}

        {activeTab === 'honeypot' && (
          <HoneypotConsole onRefreshTelemetry={fetchAllData} />
        )}

        {activeTab === 'integration' && <IntegrationHub />}

        {activeTab === 'guide' && (
          <GuideTab
            onNavigateToSimulator={() => setActiveTab('simulator')}
            onNavigateToPolicies={() => setActiveTab('policies')}
            onNavigateToAudit={() => setActiveTab('audit')}
          />
        )}

        {/* Primary Agent Context Window Controller Section */}
        <AgentContextController
          agentState={agentState}
          onWipeContext={handleEmergencyWipe}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#070b12] py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-mono">
          <div>
            WATCHDOGS Runtime Security Monitor · 5 TB Google AI Pro Persistent Environment
          </div>
          <div>
            SHA-256 Chained Ledger · SOC 2 / ISO 27001 Compliance Ready
          </div>
        </div>
      </footer>
    </div>
  );
}
