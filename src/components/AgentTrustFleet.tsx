import React, { useState, useEffect } from 'react';
import {
  Users,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  RotateCcw,
  Lock,
  Unlock,
  ExternalLink,
  Bot,
  Activity,
  Cpu,
  Search,
  Filter,
} from 'lucide-react';
import { AgentFleetProfile } from '../types/watchdogs.ts';

interface AgentTrustFleetProps {
  onSelectAgentForMemory?: (agentId: string) => void;
}

export const AgentTrustFleet: React.FC<AgentTrustFleetProps> = ({ onSelectAgentForMemory }) => {
  const [agents, setAgents] = useState<AgentFleetProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'HEALTHY' | 'ELEVATED_RISK' | 'QUARANTINED' | 'HONEYPOT_ISOLATED'>('ALL');
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchFleet = async () => {
    try {
      const res = await fetch('/api/fleet/agents');
      if (res.ok) {
        const data = await res.json();
        setAgents(data);
      }
    } catch (e) {
      console.error('Failed to load fleet agents:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFleet();
    const interval = setInterval(fetchFleet, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleResetTrust = async (agentId: string) => {
    try {
      const res = await fetch('/api/fleet/reset-trust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId }),
      });
      if (res.ok) {
        setActionMessage(`Trust score for ${agentId} reset to 95 (Healthy Baseline).`);
        setTimeout(() => setActionMessage(null), 4000);
        fetchFleet();
      }
    } catch (e) {
      console.error('Failed to reset trust:', e);
    }
  };

  const handleToggleQuarantine = async (agentId: string, currentQuarantine: boolean) => {
    try {
      const res = await fetch('/api/fleet/quarantine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId, quarantine: !currentQuarantine }),
      });
      if (res.ok) {
        setActionMessage(`Agent ${agentId} ${!currentQuarantine ? 'placed into strict Quarantine' : 'released from Quarantine'}.`);
        setTimeout(() => setActionMessage(null), 4000);
        fetchFleet();
      }
    } catch (e) {
      console.error('Failed to toggle quarantine:', e);
    }
  };

  const filteredAgents = agents.filter((agent) => {
    const matchesSearch =
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.agentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || agent.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const avgTrustScore = agents.length
    ? Math.round(agents.reduce((acc, a) => acc + a.trustScore, 0) / agents.length)
    : 0;
  const quarantinedCount = agents.filter(
    (a) => a.status === 'QUARANTINED' || a.status === 'HONEYPOT_ISOLATED'
  ).length;
  const totalCalls = agents.reduce((acc, a) => acc + a.totalCalls, 0);
  const totalBlocked = agents.reduce((acc, a) => acc + a.blockedCalls, 0);

  const getStatusBadge = (status: AgentFleetProfile['status']) => {
    switch (status) {
      case 'HEALTHY':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            HEALTHY
          </span>
        );
      case 'ELEVATED_RISK':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            ELEVATED RISK
          </span>
        );
      case 'QUARANTINED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <Lock className="w-3 h-3 text-rose-400" />
            QUARANTINED
          </span>
        );
      case 'HONEYPOT_ISOLATED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/30">
            <ShieldAlert className="w-3 h-3 text-fuchsia-400" />
            HONEYPOT ISOLATED
          </span>
        );
    }
  };

  const getTrustColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getTrustProgressBg = (score: number) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 60) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="space-y-6">
      {/* Top Banner KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#090d16] border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Fleet Size</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-white">{agents.length} Active</div>
          <p className="mt-1 text-[11px] text-slate-500">Autonomous multi-agent instances</p>
        </div>

        <div className="p-4 rounded-xl bg-[#090d16] border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Avg Trust Score</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className={`mt-2 text-2xl font-bold font-mono ${getTrustColor(avgTrustScore)}`}>
            {avgTrustScore} <span className="text-sm text-slate-400">/ 100</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Dynamic behavioral reputation</p>
        </div>

        <div className="p-4 rounded-xl bg-[#090d16] border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Quarantine & Decoy</span>
            <Lock className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-rose-400">{quarantinedCount} Isolated</div>
          <p className="mt-1 text-[11px] text-slate-500">Sub-threshold or honeypot trapped</p>
        </div>

        <div className="p-4 rounded-xl bg-[#090d16] border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Dispatch Calls</span>
            <Activity className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-white">
            {totalCalls} <span className="text-xs text-rose-400">({totalBlocked} blocked)</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Monitored through cascade proxy</p>
        </div>
      </div>

      {actionMessage && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between animate-in fade-in">
          <span>{actionMessage}</span>
          <button
            onClick={() => setActionMessage(null)}
            className="text-slate-400 hover:text-white text-xs underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between p-3.5 bg-[#090d16] border border-slate-800 rounded-xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search agent fleet by name, ID, or task role..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#05070d] border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(['ALL', 'HEALTHY', 'ELEVATED_RISK', 'QUARANTINED', 'HONEYPOT_ISOLATED'] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setStatusFilter(filter)}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer shrink-0 ${
                statusFilter === filter
                  ? 'bg-slate-700 text-white border border-slate-600'
                  : 'bg-[#05070d] text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {filter.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Agent Cards Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-400">Loading agent reputation telemetry...</div>
      ) : filteredAgents.length === 0 ? (
        <div className="p-12 text-center text-slate-500 bg-[#090d16] rounded-xl border border-slate-800">
          No agent profiles match current search and status filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAgents.map((agent) => {
            const isQuarantined = agent.status === 'QUARANTINED' || agent.status === 'HONEYPOT_ISOLATED';
            return (
              <div
                key={agent.agentId}
                className={`p-5 rounded-xl border transition-all ${
                  isQuarantined
                    ? 'bg-[#0c0812] border-rose-900/60 shadow-lg shadow-rose-950/20'
                    : 'bg-[#090d16] border-slate-800/80 hover:border-slate-700'
                }`}
              >
                {/* Agent Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                      <Bot className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white flex items-center gap-1.5">
                        {agent.name}
                      </h4>
                      <p className="text-[11px] font-mono text-slate-400">{agent.agentId}</p>
                    </div>
                  </div>
                  {getStatusBadge(agent.status)}
                </div>

                <p className="mt-3 text-xs text-slate-300 leading-relaxed min-h-[32px]">
                  {agent.role}
                </p>

                {/* Model & Metadata Strip */}
                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 bg-[#05070d] p-2 rounded-lg border border-slate-800/80">
                  <span className="flex items-center gap-1">
                    <Cpu className="w-3 h-3 text-purple-400" />
                    <span className="font-mono text-slate-300">{agent.model}</span>
                  </span>
                  <span className="font-mono text-[10px] text-slate-500">
                    Active: {new Date(agent.lastActiveTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>

                {/* Trust Meter */}
                <div className="mt-4">
                  <div className="flex justify-between items-center text-xs mb-1.5">
                    <span className="text-slate-400 font-medium">Reputation Trust Score</span>
                    <span className={`font-mono font-bold ${getTrustColor(agent.trustScore)}`}>
                      {agent.trustScore}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${getTrustProgressBg(agent.trustScore)}`}
                      style={{ width: `${Math.max(4, agent.trustScore)}%` }}
                    />
                  </div>
                </div>

                {/* Dispatch Statistics */}
                <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[11px]">
                  <div className="p-2 bg-[#05070d] rounded-lg border border-slate-800/60">
                    <div className="font-mono font-bold text-white">{agent.totalCalls}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Total Calls</div>
                  </div>
                  <div className="p-2 bg-[#05070d] rounded-lg border border-slate-800/60">
                    <div className="font-mono font-bold text-rose-400">{agent.blockedCalls}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Blocked</div>
                  </div>
                  <div className="p-2 bg-[#05070d] rounded-lg border border-slate-800/60">
                    <div className="font-mono font-bold text-amber-400">{agent.quarantineCount}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Quarantines</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleResetTrust(agent.agentId)}
                    title="Reset trust score to 95 baseline"
                    className="flex-1 py-1.5 px-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-[11px] font-medium text-slate-300 hover:text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3 text-cyan-400" />
                    Reset Trust
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleQuarantine(agent.agentId, agent.status === 'QUARANTINED')}
                    title={isQuarantined ? 'Release agent from quarantine' : 'Force quarantine lock'}
                    className={`py-1.5 px-3 rounded-lg text-[11px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                      isQuarantined
                        ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/40'
                    }`}
                  >
                    {isQuarantined ? (
                      <>
                        <Unlock className="w-3 h-3" />
                        Release
                      </>
                    ) : (
                      <>
                        <Lock className="w-3 h-3" />
                        Quarantine
                      </>
                    )}
                  </button>

                  {onSelectAgentForMemory && (
                    <button
                      type="button"
                      onClick={() => onSelectAgentForMemory(agent.agentId)}
                      title="Inspect agent context memory window"
                      className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
