import React, { useState } from 'react';
import {
  ShieldAlert,
  Play,
  RotateCw,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Cpu,
  Layers,
  Award,
  Zap,
} from 'lucide-react';
import { BenchmarkResult } from '../types/watchdogs.ts';

export const RedTeamBenchmark: React.FC = () => {
  const [benchmarkResult, setBenchmarkResult] = useState<BenchmarkResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [expandedTestId, setExpandedTestId] = useState<string | null>(null);

  const runBenchmark = async () => {
    setIsRunning(true);
    try {
      const res = await fetch('/api/benchmark/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const data: BenchmarkResult = await res.json();
        setBenchmarkResult(data);
      }
    } catch (e) {
      console.error('Benchmark execution failed:', e);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <div className="p-5 rounded-xl bg-[#090d16] border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <h3 className="text-base font-semibold text-white">
              Automated Adversarial Red-Teaming & Benchmark Suite
            </h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-300 border border-rose-500/30">
              OWASP Top 10 for Agentic AI
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Fires automated multi-vector jailbreaks, indirect prompt injections, SSRF probes, and specification gaming attacks to mathematically verify cascade interception efficacy and latency percentiles.
          </p>
        </div>

        <button
          type="button"
          disabled={isRunning}
          onClick={runBenchmark}
          className="px-4 py-2.5 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-semibold rounded-lg text-xs flex items-center gap-2 shadow-lg shadow-rose-950/40 transition-all cursor-pointer disabled:opacity-50 shrink-0"
        >
          {isRunning ? (
            <>
              <RotateCw className="w-4 h-4 animate-spin" />
              Running Adversarial Battery...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" />
              Run 12-Vector Benchmark
            </>
          )}
        </button>
      </div>

      {/* KPI Scores strip if results are available */}
      {benchmarkResult ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in">
          <div className="p-4 rounded-xl bg-[#090d16] border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Defense Accuracy</span>
              <Award className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-emerald-400">
              {benchmarkResult.accuracyPercent}%
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              {benchmarkResult.totalTests} OWASP attacks evaluated
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#090d16] border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Median Latency (p50)</span>
              <Zap className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-cyan-400">
              {benchmarkResult.p50LatencyMs} <span className="text-sm font-normal text-slate-400">ms</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-500">Sub-millisecond short-circuit</p>
          </div>

          <div className="p-4 rounded-xl bg-[#090d16] border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Tail Latency (p95)</span>
              <Clock className="w-4 h-4 text-purple-400" />
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-purple-400">
              {benchmarkResult.p95LatencyMs} <span className="text-sm font-normal text-slate-400">ms</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-500">95th percentile worst-case</p>
          </div>

          <div className="p-4 rounded-xl bg-[#090d16] border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Interceptions</span>
              <Layers className="w-4 h-4 text-amber-400" />
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-white">
              {benchmarkResult.blockedCount} Blocked / {benchmarkResult.redactedCount} Redacted
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              {benchmarkResult.passedCount} verified benign baselines
            </p>
          </div>
        </div>
      ) : (
        <div className="p-8 rounded-xl bg-[#090d16] border border-slate-800 text-center space-y-3">
          <Cpu className="w-10 h-10 text-slate-600 mx-auto" />
          <h4 className="text-sm font-semibold text-slate-300">Adversarial Benchmark Standing By</h4>
          <p className="text-xs text-slate-500 max-w-lg mx-auto">
            Click &ldquo;Run 12-Vector Benchmark&rdquo; to launch automated exploits against the 3-tier cascade.
            Each test measures real response times and defense accuracy across OWASP ASI-01 through ASI-08.
          </p>
        </div>
      )}

      {/* Test Cases Table */}
      {benchmarkResult && (
        <div className="bg-[#090d16] border border-slate-800 rounded-xl overflow-hidden animate-in fade-in">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-white">Execution Battery Results & Waterfall Breakdown</h4>
            <span className="text-xs font-mono text-slate-500">Run ID: {benchmarkResult.runId}</span>
          </div>

          <div className="divide-y divide-slate-800/80">
            {benchmarkResult.testDetails.map((test) => {
              const isExpanded = expandedTestId === test.testId;

              return (
                <div key={test.testId} className="hover:bg-slate-800/20 transition-colors">
                  <div
                    onClick={() => setExpandedTestId(isExpanded ? null : test.testId)}
                    className="p-4 flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      {test.passedExpected ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                      )}

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-white">{test.name}</span>
                          <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                            {test.owaspCode}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{test.reasoning}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                        {test.tier.replace('TIER_', 'T').replace('_HEURISTICS', ' Heuristics').replace('_VECTOR_CACHE', ' Cache').replace('_GROQ_OVERSEER', ' Overseer')}
                      </span>

                      <span
                        className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
                          test.verdict === 'BLOCK'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            : test.verdict === 'REDACT_EXECUTE'
                            ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                            : test.verdict === 'HONEYPOT_REROUTE'
                            ? 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/30'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        }`}
                      >
                        {test.verdict}
                      </span>

                      <span className="text-xs font-mono text-slate-400 w-16 text-right">
                        {test.latencyMs} ms
                      </span>

                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-500" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-500" />
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-4 pt-0 border-t border-slate-800/80 bg-[#060910]">
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <span>Evaluated Verdict: <strong className="text-white">{test.verdict}</strong></span>
                          <span>Passed Criteria: <strong className={test.passedExpected ? 'text-emerald-400' : 'text-rose-400'}>{test.passedExpected ? 'YES (DEFENDED)' : 'FAILED'}</strong></span>
                        </div>
                        <p className="text-xs text-slate-300 font-mono bg-slate-900/60 p-2.5 rounded border border-slate-800">
                          {test.reasoning}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
