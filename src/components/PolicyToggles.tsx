import React, { useState } from 'react';
import {
  Shield,
  FileText,
  Lock,
  Terminal,
  Globe,
  Database,
  Eye,
  RefreshCw,
  Sparkles,
  Check,
  Copy,
  AlertTriangle,
  RotateCcw,
  Sliders,
  ArrowRight,
} from 'lucide-react';
import { SecurityPolicies } from '../types/watchdogs.ts';

const PRESET_CONFIGS = [
  {
    id: 'zero_trust',
    name: 'Strict Zero-Trust',
    description: 'Enforces all 8 security invariants. Maximum protection posture.',
    config: {
      blockPiiExtraction: true,
      enforceReadOnlyFs: true,
      blockUnauthorizedIpEgress: true,
      preventShellExecution: true,
      honeypotSpecGaming: true,
      contextWipeOnExploit: true,
      dynamicParamRedaction: true,
      strictSqlInjection: true,
    },
  },
  {
    id: 'enterprise_agent',
    name: 'Standard Enterprise',
    description: 'PII, Egress, Redaction, and Honeypot traps enabled with selective tool flexibility.',
    config: {
      blockPiiExtraction: true,
      enforceReadOnlyFs: false,
      blockUnauthorizedIpEgress: true,
      preventShellExecution: false,
      honeypotSpecGaming: true,
      contextWipeOnExploit: true,
      dynamicParamRedaction: true,
      strictSqlInjection: true,
    },
  },
  {
    id: 'read_only_auditor',
    name: 'Read-Only Auditor',
    description: 'Immutable filesystem, PII blocked, shell execution prohibited.',
    config: {
      blockPiiExtraction: true,
      enforceReadOnlyFs: true,
      blockUnauthorizedIpEgress: true,
      preventShellExecution: true,
      honeypotSpecGaming: true,
      contextWipeOnExploit: true,
      dynamicParamRedaction: true,
      strictSqlInjection: true,
    },
  },
  {
    id: 'dev_sandbox',
    name: 'Dev Research Sandbox',
    description: 'Permissive shell and FS access with active Redaction and Canary tripwires.',
    config: {
      blockPiiExtraction: false,
      enforceReadOnlyFs: false,
      blockUnauthorizedIpEgress: false,
      preventShellExecution: false,
      honeypotSpecGaming: true,
      contextWipeOnExploit: true,
      dynamicParamRedaction: true,
      strictSqlInjection: false,
    },
  },
];

interface PolicyTogglesProps {
  policies: SecurityPolicies;
  compiledPrompt: string;
  onUpdatePolicies: (newPolicies: SecurityPolicies) => Promise<void>;
  isLoading?: boolean;
}

interface PolicyDefinition {
  id: keyof SecurityPolicies;
  title: string;
  description: string;
  tierTarget: 'Tier 1 & Tier 3' | 'Tier 1' | 'Tier 3' | 'All Tiers';
  category: 'Access Control' | 'Data Protection' | 'Execution Guard' | 'Adaptive Defense';
  icon: React.ElementType;
  criticality: 'CRITICAL' | 'HIGH' | 'MEDIUM';
}

const POLICY_DEFINITIONS: PolicyDefinition[] = [
  {
    id: 'blockPiiExtraction',
    title: 'Block PII Extraction',
    description: 'Intercepts attempts to extract, scrape, or leak SSNs, credentials, API secrets, and unhashed authorization tokens.',
    tierTarget: 'Tier 1 & Tier 3',
    category: 'Data Protection',
    icon: Lock,
    criticality: 'CRITICAL',
  },
  {
    id: 'enforceReadOnlyFs',
    title: 'Enforce Read-Only File Access',
    description: 'Restricts filesystem write, delete, and overwrite operations. Prohibits traversal into /etc, /root, and system configurations.',
    tierTarget: 'Tier 1 & Tier 3',
    category: 'Access Control',
    icon: FileText,
    criticality: 'HIGH',
  },
  {
    id: 'blockUnauthorizedIpEgress',
    title: 'Block Unauthorized IP Egress',
    description: 'Instantly terminates outbound network connections to unwhitelisted external IPs, C2 servers, and AWS/GCP metadata endpoints (169.254.169.254).',
    tierTarget: 'Tier 1',
    category: 'Access Control',
    icon: Globe,
    criticality: 'CRITICAL',
  },
  {
    id: 'preventShellExecution',
    title: 'Prevent Shell Execution Tools',
    description: 'Prohibits autonomous agents from invoking raw terminal/bash tools with destructive commands (rm, mkfs, dd, fork bombs, piped scripts).',
    tierTarget: 'Tier 1',
    category: 'Execution Guard',
    icon: Terminal,
    criticality: 'CRITICAL',
  },
  {
    id: 'dynamicParamRedaction',
    title: 'Dynamic Parameter Auto-Redaction',
    description: 'Surgically strips malicious chained commands or injection suffixes from valid tool calls, allowing safe operations to execute cleanly.',
    tierTarget: 'Tier 3',
    category: 'Adaptive Defense',
    icon: Sparkles,
    criticality: 'HIGH',
  },
  {
    id: 'honeypotSpecGaming',
    title: 'Honeypot Reroute on Spec Gaming',
    description: 'Silently diverts agents attempting safety invariant tampering or deception into a synthetic sandbox with canary data to log adversarial intent.',
    tierTarget: 'Tier 3',
    category: 'Adaptive Defense',
    icon: Eye,
    criticality: 'HIGH',
  },
  {
    id: 'contextWipeOnExploit',
    title: 'Auto Context-Wipe on Exploit Discovery',
    description: 'Forcefully purges the primary agent\'s conversation window upon jailbreak or exploit discovery, erasing exploit memory and restarting state.',
    tierTarget: 'All Tiers',
    category: 'Adaptive Defense',
    icon: RotateCcw,
    criticality: 'CRITICAL',
  },
  {
    id: 'strictSqlInjection',
    title: 'Strict SQL Injection Guard',
    description: 'Inspects structured database queries to catch UNION SELECTs, stacked statement drops, and blind data exfiltration injections.',
    tierTarget: 'Tier 1 & Tier 3',
    category: 'Execution Guard',
    icon: Database,
    criticality: 'HIGH',
  },
];

export const PolicyToggles: React.FC<PolicyTogglesProps> = ({
  policies,
  compiledPrompt,
  onUpdatePolicies,
  isLoading = false,
}) => {
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const handleToggle = async (key: keyof SecurityPolicies) => {
    setSavingKey(key);
    const updated = {
      ...policies,
      [key]: !policies[key],
    };
    try {
      await onUpdatePolicies(updated);
    } finally {
      setSavingKey(null);
    }
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(compiledPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const activeCount = Object.values(policies).filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            No-Code Security Policy Studio
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Configure guardrail invariants. Active toggles dynamically compile into the Tier 3 Overseer system prompt and Tier 1 heuristic rules.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs text-slate-400 font-mono tabular-nums">
            <span className="text-emerald-400 font-semibold">{activeCount}</span> / {POLICY_DEFINITIONS.length} Policies Active
          </div>
          <button
            onClick={() => setShowPromptModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
            <span>View Compiled Prompt</span>
          </button>
        </div>
      </div>

      {/* Enterprise Policy Presets Strip */}
      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
          <Sliders className="w-3.5 h-3.5 text-emerald-400" />
          <span>One-Click Role-Based Invariant Presets</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {PRESET_CONFIGS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              disabled={isLoading}
              onClick={() => onUpdatePolicies({ ...policies, ...preset.config })}
              className="p-2.5 rounded-lg bg-[#060910] hover:bg-slate-800/80 border border-slate-800 text-left transition-colors cursor-pointer group disabled:opacity-50"
            >
              <div className="text-xs font-semibold text-white group-hover:text-emerald-300 flex items-center justify-between">
                <span>{preset.name}</span>
                <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                {preset.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Policy Toggle Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {POLICY_DEFINITIONS.map((def) => {
          const isEnabled = policies[def.id];
          const isSaving = savingKey === def.id || isLoading;
          const IconComponent = def.icon;

          return (
            <div
              key={def.id}
              className={`p-4 rounded-xl border transition-all duration-200 ${
                isEnabled
                  ? 'bg-slate-900/80 border-slate-700/80 shadow-sm'
                  : 'bg-slate-950/40 border-slate-800/60 opacity-80'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                      isEnabled
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-slate-800/50 text-slate-500 border border-slate-800'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-white">{def.title}</h3>
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700/60">
                        {def.tierTarget}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {def.description}
                    </p>
                  </div>
                </div>

                {/* Toggle Switch */}
                <button
                  type="button"
                  role="switch"
                  aria-checked={isEnabled}
                  disabled={isSaving}
                  onClick={() => handleToggle(def.id)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500/40 ${
                    isEnabled ? 'bg-emerald-500' : 'bg-slate-700'
                  } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      isEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                <span>{def.category}</span>
                <span
                  className={
                    def.criticality === 'CRITICAL'
                      ? 'text-rose-400'
                      : def.criticality === 'HIGH'
                      ? 'text-amber-400'
                      : 'text-slate-400'
                  }
                >
                  {def.criticality} INVARIANT
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Compiled System Prompt Modal */}
      {showPromptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0b0f19] border border-slate-700 rounded-xl w-full max-w-3xl overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-white">
                  Tier 3 Overseer Dynamic System Prompt
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyPrompt}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-300 hover:text-white bg-slate-800 rounded border border-slate-700 cursor-pointer transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  onClick={() => setShowPromptModal(false)}
                  className="px-2.5 py-1 text-xs text-slate-400 hover:text-white bg-slate-800 rounded border border-slate-700 cursor-pointer transition-colors"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="p-4 max-h-[60vh] overflow-y-auto">
              <pre className="font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed bg-[#060910] p-4 rounded-lg border border-slate-800/80">
                {compiledPrompt}
              </pre>
            </div>

            <div className="p-3 bg-slate-900/60 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
              <span>Dynamic compile status: Synchronized with active policy toggles</span>
              <span className="text-emerald-400 font-mono">200 OK</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
