import React, { useState } from 'react';
import {
  Activity,
  Zap,
  DollarSign,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Server,
  Layers,
  HardDrive,
  TrendingUp,
  Calculator,
  Sliders,
  Sparkles,
  Info,
} from 'lucide-react';
import { TelemetryStats, StorageMetrics, ThreatCategory, ThreatSeverity } from '../types/watchdogs.ts';

interface ThreatTelemetryProps {
  stats: TelemetryStats | null;
  storage: StorageMetrics | null;
  onRefresh: () => void;
}

const THREAT_CATEGORIES: { id: ThreatCategory; label: string; desc: string }[] = [
  { id: 'COMMAND_INJECTION', label: 'Command Injection', desc: 'Shell command chaining, destructive wipes, or process spawns' },
  { id: 'PII_EXFILTRATION', label: 'PII Exfiltration', desc: 'Unauthorized exfiltration of customer records, passwords, or tokens' },
  { id: 'SPECIFICATION_GAMING', label: 'Specification Gaming', desc: 'Deceptive attempts to alter safety invariants or probe canary tripwires' },
  { id: 'UNAUTHORIZED_NETWORK', label: 'Unauthorized Egress', desc: 'Outbound TCP sockets to rogue C2 IPs or Cloud Metadata SSRF' },
  { id: 'JAILBREAK_EXPLORE', label: 'Jailbreak & Exploit', desc: 'DAN mode, context confusion, and indirect prompt injection attempts' },
  { id: 'PRIVILEGE_ESCALATION', label: 'Privilege Escalation', desc: 'Root permissions elevation (chmod 777) or sudoers tampering' },
];

const SEVERITIES: { id: ThreatSeverity; desc: string }[] = [
  { id: 'CRITICAL', desc: 'Immediate host compromise, data loss, or invariant override' },
  { id: 'HIGH', desc: 'Significant risk requiring interception and context wipe' },
  { id: 'MEDIUM', desc: 'Parameter tampering stripped via surgical redaction' },
  { id: 'LOW', desc: 'Minor anomaly flagged for SOC review' },
];

export const ThreatTelemetry: React.FC<ThreatTelemetryProps> = ({
  stats,
  storage,
  onRefresh,
}) => {
  const [simulatedDailyCalls, setSimulatedDailyCalls] = useState(100000);
  const [activeCellTooltip, setActiveCellTooltip] = useState<string | null>(null);

  if (!stats) {
    return (
      <div className="p-8 text-center text-slate-500 font-mono">
        Loading real-time telemetry metrics...
      </div>
    );
  }

  const total = Math.max(1, stats.totalRequests);
  const tier1Pct = Math.round((stats.tier1Intercepts / total) * 100);
  const tier2Pct = Math.round((stats.tier2CacheHits / total) * 100);
  const tier3Pct = Math.round((stats.tier3Evaluations / total) * 100);
  const shortCircuitPct = tier1Pct + tier2Pct || 75; // default benchmark 75% if fresh

  // ROI Calculator derived metrics
  const monthlyInvocations = simulatedDailyCalls * 30;
  const avoidedLLMCallsMonthly = Math.round(monthlyInvocations * (shortCircuitPct / 100));
  const monthlyCostSavedUsd = avoidedLLMCallsMonthly * 0.0035; // ~$0.0035 avg cost per full LLM guardrail check
  const monthlyLatencyHoursSaved = Math.round((avoidedLLMCallsMonthly * 0.42) / 3600); // 420ms saved per short-circuit

  // Format bytes helper
  const formatBytes = (bytes: number) => {
    if (bytes >= 1024 * 1024 * 1024 * 1024) {
      return (bytes / (1024 * 1024 * 1024 * 1024)).toFixed(2) + ' TB';
    }
    if (bytes >= 1024 * 1024 * 1024) {
      return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
    }
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Helper for heatmap cell lookup
  const getHeatmapCount = (cat: ThreatCategory, sev: ThreatSeverity) => {
    const match = stats.threatVectorHeatmap.find(
      (m) => m.category === cat && m.severity === sev
    );
    return match ? match.count : 0;
  };

  return (
    <div className="space-y-6">
      {/* KPI Top Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Total Intercepted */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Evaluated Invocations</span>
            <Activity className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-white tabular-nums">
            {stats.totalRequests}
          </div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <span className="font-semibold">{shortCircuitPct}%</span> short-circuited (T1+T2)
          </div>
        </div>

        {/* Tier 1 Heuristics */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Tier 1 Regex Catch</span>
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-cyan-400 tabular-nums">
            {stats.tier1Intercepts}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            &lt; 1ms latency · {tier1Pct}% share
          </div>
        </div>

        {/* Tier 2 Vector Cache */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Tier 2 Vector Hits</span>
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-400 tabular-nums">
            {stats.tier2CacheHits}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            ~5ms latency · &gt;98% match
          </div>
        </div>

        {/* Cost Dollars Saved ROI */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>API Cost Savings</span>
            <DollarSign className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-amber-400 tabular-nums">
            ${stats.estimatedCostSavedUsd.toFixed(3)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Zero LLM cost on T1/T2
          </div>
        </div>

        {/* Active Defenses */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Redactions / Decoys</span>
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-rose-400 tabular-nums">
            {stats.redactedCount + stats.honeypotCaptures}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {stats.redactedCount} redacted · {stats.honeypotCaptures} honeypots
          </div>
        </div>
      </div>

      {/* Two Column Layout: Heatmap & Time Series */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Threat Matrix Heatmap */}
        <div className="lg:col-span-7 p-5 rounded-xl bg-slate-900/70 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                Attack Vector vs. Severity Heatmap
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Matrix representation of intercepted adversarial threats by attack category and impact severity
              </p>
            </div>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
              Live Intercept Ledger
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="text-left py-2 font-medium">Attack Vector</th>
                  {SEVERITIES.map((sev) => (
                    <th
                      key={sev.id}
                      title={sev.desc}
                      className="text-center py-2 px-3 font-medium font-mono cursor-help"
                    >
                      {sev.id}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono tabular-nums">
                {THREAT_CATEGORIES.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-800/30">
                    <td
                      className="py-2.5 text-slate-300 font-sans font-medium text-xs cursor-help"
                      title={cat.desc}
                    >
                      {cat.label}
                    </td>
                    {SEVERITIES.map((sev) => {
                      const count = getHeatmapCount(cat.id, sev.id);
                      let cellBg = 'bg-slate-950/40 text-slate-600';
                      if (count > 0) {
                        if (sev.id === 'CRITICAL') cellBg = 'bg-rose-500/25 text-rose-300 border border-rose-500/40 font-bold';
                        else if (sev.id === 'HIGH') cellBg = 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold';
                        else if (sev.id === 'MEDIUM') cellBg = 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30';
                        else cellBg = 'bg-slate-800/80 text-slate-300';
                      }

                      return (
                        <td key={sev.id} className="py-2 px-3 text-center">
                          <span
                            title={`${count} intercepted incidents in ${cat.label} [${sev.id}]. ${sev.desc}`}
                            className={`inline-block min-w-8 py-0.5 px-1.5 rounded text-center text-[11px] cursor-help ${cellBg}`}
                          >
                            {count}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Time-Series Graph and Anomaly Spikes */}
        <div className="lg:col-span-5 p-5 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                  Time-Series Anomaly Spikes
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Real-time tool invocations and cascade tier distribution over rolling intervals
                </p>
              </div>
            </div>

            {/* Time series bars */}
            <div className="space-y-3 pt-2">
              {stats.timeSeriesData.map((pt, idx) => {
                const totalInInterval = Math.max(1, pt.tier1 + pt.tier2 + pt.tier3);
                const t1Width = Math.round((pt.tier1 / totalInInterval) * 100);
                const t2Width = Math.round((pt.tier2 / totalInInterval) * 100);
                const t3Width = Math.round((pt.tier3 / totalInInterval) * 100);

                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span>{pt.time}</span>
                      <span className="text-slate-300">
                        {totalInInterval} calls · <span className="text-rose-400">{pt.blocked} blocked</span>
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-950 rounded-full flex overflow-hidden">
                      <div
                        style={{ width: `${t1Width}%` }}
                        className="bg-cyan-500 h-full"
                        title={`Tier 1: ${pt.tier1}`}
                      />
                      <div
                        style={{ width: `${t2Width}%` }}
                        className="bg-emerald-500 h-full"
                        title={`Tier 2: ${pt.tier2}`}
                      />
                      <div
                        style={{ width: `${t3Width}%` }}
                        className="bg-violet-500 h-full"
                        title={`Tier 3: ${pt.tier3}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-4 mt-4 border-t border-slate-800">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-cyan-500 inline-block" />
                Tier 1 Heuristic (&lt;1ms)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />
                Tier 2 Vector Cache (~5ms)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-violet-500 inline-block" />
                Tier 3 Overseer (~180ms)
              </span>
            </div>
          </div>

          {/* Storage Quota Card (Google AI Pro 5 TB Environment) */}
          {storage && (
            <div className="mt-5 p-3.5 rounded-lg bg-[#070b12] border border-slate-800/80">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <HardDrive className="w-4 h-4 text-emerald-400" />
                  <span className="font-semibold">{storage.storageProvider}</span>
                </div>
                <span className="font-mono text-emerald-400 text-[11px]">
                  {formatBytes(storage.usedBytes)} / {formatBytes(storage.totalCapacityBytes)}
                </span>
              </div>
              <div className="w-full bg-slate-950 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full"
                  style={{
                    width: `${Math.max(1, (storage.usedBytes / storage.totalCapacityBytes) * 100)}%`,
                  }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 font-mono">
                <span>{storage.cachedVectorsCount} Indexed Vectors</span>
                <span>{storage.auditBlocksCount} SHA-256 Chained Blocks</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Enterprise Cost & Latency ROI Calculator */}
      <div className="p-5 rounded-xl bg-[#090d16] border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-semibold text-white">
                Enterprise ROI & Compute Savings Projection
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                Cascade Architecture Advantage
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Traditional AI guardrails invoke a full LLM for every single tool invocation. WATCHDOGS intercepts obvious and repetitive attacks in Tier 1 (&lt;1ms) and Tier 2 (~5ms) with zero model costs.
            </p>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-slate-400 block">Current Short-Circuit Efficiency</span>
            <span className="text-xl font-bold font-mono text-emerald-400">{shortCircuitPct}%</span>
          </div>
        </div>

        {/* Simulation Slider */}
        <div className="p-4 bg-[#05070d] rounded-xl border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium">Daily Agent Tool Invocations Across Fleet:</span>
            <span className="font-mono text-cyan-400 font-bold text-sm">
              {simulatedDailyCalls.toLocaleString()} calls / day
            </span>
          </div>

          <input
            type="range"
            min="1000"
            max="1000000"
            step="5000"
            value={simulatedDailyCalls}
            onChange={(e) => setSimulatedDailyCalls(Number(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />

          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>1K (Startup)</span>
            <span>50K (Growth)</span>
            <span>250K (Enterprise)</span>
            <span>1M (Hyperscale)</span>
          </div>
        </div>

        {/* Results Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3.5 bg-slate-900/50 rounded-lg border border-slate-800">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>Monthly API Dollars Saved</span>
            </div>
            <div className="mt-1.5 text-2xl font-bold font-mono text-emerald-400">
              ${monthlyCostSavedUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Avoids {avoidedLLMCallsMonthly.toLocaleString()} LLM roundtrips ($0.0035/call)
            </p>
          </div>

          <div className="p-3.5 bg-slate-900/50 rounded-lg border border-slate-800">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Compute Latency Shaved</span>
            </div>
            <div className="mt-1.5 text-2xl font-bold font-mono text-cyan-400">
              {monthlyLatencyHoursSaved.toLocaleString()} Hours
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              ~420ms saved per short-circuit vs full LLM check
            </p>
          </div>

          <div className="p-3.5 bg-slate-900/50 rounded-lg border border-slate-800">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Scalability Multiplier</span>
            </div>
            <div className="mt-1.5 text-2xl font-bold font-mono text-purple-300">
              {(1 / (1 - shortCircuitPct / 100)).toFixed(1)}x Capacity
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Protects against rate-limit throttling under attack spikes
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
