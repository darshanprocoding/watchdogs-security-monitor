import React, { useState } from 'react';
import {
  BookOpen,
  Shield,
  Zap,
  Layers,
  Sparkles,
  Eye,
  RotateCcw,
  Terminal,
  CheckCircle,
  HelpCircle,
  Play,
  ArrowRight,
  Code,
  HardDrive,
  Cpu,
  FileCheck,
} from 'lucide-react';

interface GuideTabProps {
  onNavigateToSimulator: () => void;
  onNavigateToPolicies: () => void;
  onNavigateToAudit: () => void;
}

export const GuideTab: React.FC<GuideTabProps> = ({
  onNavigateToSimulator,
  onNavigateToPolicies,
  onNavigateToAudit,
}) => {
  const [activeSection, setActiveSection] = useState<'quickstart' | 'cascade' | 'mechanics' | 'demo' | 'faq'>('quickstart');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-3 border-b border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-400" />
              Operational Guide & Defense Playbook
            </h2>
            <p className="text-sm text-slate-400 mt-0.5">
              Learn how the WATCHDOGS 3-tier cascade operates, explore advanced interception mechanics, and follow the demonstration checklist.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onNavigateToSimulator}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Launch Simulator</span>
            </button>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'quickstart', label: '1. Quick-Start (3 Steps)' },
            { id: 'cascade', label: '2. The 3-Tier Cascade' },
            { id: 'mechanics', label: '3. Interception Mechanics' },
            { id: 'demo', label: '4. Live Demo Checklist' },
            { id: 'faq', label: '5. Security FAQs' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer transition-colors ${
                activeSection === tab.id
                  ? 'bg-slate-800 text-emerald-400 border border-slate-700 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-950/40 border border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* SECTION 1: Quick-Start */}
      {activeSection === 'quickstart' && (
        <div className="space-y-5">
          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              How WATCHDOGS Works in Your Architecture
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              WATCHDOGS sits as an intelligent, zero-friction interceptor between autonomous AI agents (built on LangChain, LangGraph, CrewAI, AutoGPT, or Gemini function calling) and runtime tools (Bash, Databases, Python, APIs).
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-lg bg-[#060910] border border-slate-800/80 space-y-2">
                <div className="w-7 h-7 rounded-md bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold text-xs font-mono">
                  01
                </div>
                <h4 className="text-sm font-semibold text-white">Agent Generates Tool Call</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  The primary agent selects an action (e.g. running a shell script, querying customer records, or making an HTTP request).
                </p>
              </div>

              <div className="p-4 rounded-lg bg-[#060910] border border-slate-800/80 space-y-2">
                <div className="w-7 h-7 rounded-md bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs font-mono">
                  02
                </div>
                <h4 className="text-sm font-semibold text-white">WATCHDOGS Cascades In &lt;5ms</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Tier 1 Heuristics evaluate regex and IP blocklists in &lt;1ms. If novel, Tier 2 queries the 5 TB persistent vector cache in ~5ms.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-[#060910] border border-slate-800/80 space-y-2">
                <div className="w-7 h-7 rounded-md bg-violet-500/10 text-violet-400 flex items-center justify-center font-bold text-xs font-mono">
                  03
                </div>
                <h4 className="text-sm font-semibold text-white">Adaptive Remediation</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Instead of crashing pipelines, WATCHDOGS redacts bad parameters, reroutes deceptive agents to honeypots, or wipes memory.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Integration Callout */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/20 via-slate-900 to-slate-900 border border-emerald-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">
                Plug into LangChain or LangGraph
              </h4>
              <p className="text-xs text-slate-400">
                Install our single-file callback handler or point your REST client to <code className="text-emerald-300 font-mono">/api/proxy/evaluate</code>.
              </p>
            </div>
            <button
              onClick={onNavigateToPolicies}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors whitespace-nowrap cursor-pointer"
            >
              Configure Policy Invariants &rarr;
            </button>
          </div>
        </div>
      )}

      {/* SECTION 2: 3-Tier Cascade */}
      {activeSection === 'cascade' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Tier 1 Card */}
            <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    <Zap className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold text-white">Tier 1: Heuristics</h4>
                </div>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
                  &lt; 1ms Latency
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Zero-latency regex evaluators and IP blocklists. Immediately catches catastrophic shell commands (<code className="text-slate-300">rm -rf</code>, fork bombs, <code className="text-slate-300">chmod 777</code>) and unauthorized egress (<code className="text-slate-300">185.220.101.5</code>, cloud metadata SSRF).
              </p>
              <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-500 font-mono">
                Cost: <span className="text-emerald-400">$0.00 (Zero LLM calls)</span>
              </div>
            </div>

            {/* Tier 2 Card */}
            <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Layers className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold text-white">Tier 2: Vector Cache</h4>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                  ~3-8ms Latency
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Semantic vector cache backed by the <strong>5 TB Google AI Pro storage environment</strong>. If a novel intent matches a previously quarantined attack cluster by <strong>&ge; 98% cosine similarity</strong>, it is blocked instantly without model inference.
              </p>
              <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-500 font-mono">
                Cost: <span className="text-emerald-400">$0.00 (Zero LLM calls)</span>
              </div>
            </div>

            {/* Tier 3 Card */}
            <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold text-white">Tier 3: Overseer LLM</h4>
                </div>
                <span className="text-[10px] font-mono text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded border border-violet-500/30">
                  ~150ms Latency
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Dual-mode deep semantic evaluator running Groq Llama 3 with seamless Gemini Flash fallback. Only evaluated when an intent safely passes Tiers 1 and 2 and requires nuanced reasoning against active policy invariants.
              </p>
              <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-500 font-mono">
                Selectivity: <span className="text-cyan-400">&lt; 15% of total traffic</span>
              </div>
            </div>
          </div>

          {/* Latency & Cost Comparison */}
          <div className="p-5 rounded-xl bg-[#070b12] border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Traditional Guardrail vs. WATCHDOGS Cascade Architecture
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="text-[10px] font-mono text-slate-500 border-b border-slate-800 uppercase">
                  <tr>
                    <th className="py-2">Architecture Model</th>
                    <th className="py-2">Common Attack Latency</th>
                    <th className="py-2">Cost per 10k Invocations</th>
                    <th className="py-2">Failure Mode</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300 text-[11px]">
                  <tr>
                    <td className="py-2.5 font-sans font-medium text-slate-400">Single-LLM Guardrail</td>
                    <td className="py-2.5 text-rose-400">300ms - 600ms</td>
                    <td className="py-2.5 text-rose-400">~$35.00</td>
                    <td className="py-2.5 text-slate-400 font-sans">Throws generic exception (crashes pipeline)</td>
                  </tr>
                  <tr className="bg-emerald-950/20 text-emerald-200">
                    <td className="py-2.5 font-sans font-semibold text-emerald-300">WATCHDOGS Cascade Proxy</td>
                    <td className="py-2.5 text-emerald-400 font-bold">&lt; 1ms to 5ms</td>
                    <td className="py-2.5 text-emerald-400 font-bold">~$4.20 (88% reduction)</td>
                    <td className="py-2.5 text-slate-300 font-sans">Surgical Redaction + Honeypot Decoys</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: Interception Mechanics */}
      {activeSection === 'mechanics' && (
        <div className="space-y-4">
          {/* Dynamic Parameter Redaction */}
          <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h4 className="text-sm font-bold text-white">Dynamic Parameter Redaction</h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              When a rogue or prompt-injected agent submits a legitimate tool request that contains an appended malicious suffix (such as <code className="text-rose-300 font-mono">export_path: &quot;/tmp/report.csv; cat /etc/passwd&quot;</code>), traditional systems fail the entire task. WATCHDOGS parses the arguments, strips the command injection suffix, and executes the sanitized safe parameter.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-900/40 font-mono text-xs text-rose-300">
                <span className="text-[10px] text-slate-500 uppercase block mb-1">Incoming Adversarial Payload:</span>
                export_path: &quot;/tmp/report.csv; cat /etc/passwd&quot;
              </div>
              <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-900/40 font-mono text-xs text-emerald-300">
                <span className="text-[10px] text-slate-500 uppercase block mb-1">Sanitized Executed Payload:</span>
                export_path: &quot;/tmp/report.csv&quot;
              </div>
            </div>
          </div>

          {/* Honeypot Sandbox */}
          <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-amber-400" />
              <h4 className="text-sm font-bold text-white">Honeypot Interrogation Mode & Canary Tripwires</h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              If an agent attempts specification gaming (such as attempting to modify safety scores, disable monitoring, or escalate privileges), throwing an error warns the adversary. WATCHDOGS silently diverts the agent to a decoy sandbox container with synthetic canary credentials (<code className="text-amber-300 font-mono">AKIAIOSFODNN7CANARY</code>). If the agent attempts to use these canaries elsewhere, an instant tripwire triggers.
            </p>
          </div>

          {/* Contextual Memory Wiping */}
          <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-rose-400" />
              <h4 className="text-sm font-bold text-white">Contextual Memory Wiping Protocol</h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              When an agent discovers a bypass prompt or jailbreak, it retains that sequence in its short-term memory window. WATCHDOGS forcefully overwrites the agent&apos;s conversation history buffer, erasing the memory of the exploit and rebooting its state with verified safety constraints.
            </p>
          </div>
        </div>
      )}

      {/* SECTION 4: Live Demo Checklist */}
      {activeSection === 'demo' && (
        <div className="space-y-4">
          <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              5-Step Live Demonstration Checklist
            </h3>
            <p className="text-xs text-slate-400">
              Follow these exact steps when showcasing WATCHDOGS to judges, executives, or security auditors:
            </p>

            <div className="space-y-3">
              {[
                {
                  step: 'Step 1',
                  title: 'Show the Telemetry & ROI Dashboard',
                  desc: 'Highlight sub-millisecond average latency and dollars saved vs 100% LLM evaluation.',
                  tab: 'telemetry',
                },
                {
                  step: 'Step 2',
                  title: 'Trigger Tier 1 Destruction (rm -rf /)',
                  desc: 'Execute Scenario 1 in the Attack Simulator. Show that Tier 1 terminates it in <0.5ms.',
                  tab: 'simulator',
                },
                {
                  step: 'Step 3',
                  title: 'Trigger Tier 2 Vector Repeat Attack',
                  desc: 'Execute Scenario 3. Watch the >98% cosine similarity match in ~5ms from the 5 TB storage pool.',
                  tab: 'simulator',
                },
                {
                  step: 'Step 4',
                  title: 'Demonstrate Dynamic Parameter Redaction',
                  desc: 'Execute Scenario 4. Point out the cyan diff box showing surgical suffix stripping.',
                  tab: 'simulator',
                },
                {
                  step: 'Step 5',
                  title: 'Demonstrate Honeypot Decoys & Memory Wipe',
                  desc: 'Execute Scenario 5 & 6. Verify synthetic decoy response and context window purge.',
                  tab: 'simulator',
                },
                {
                  step: 'Step 6',
                  title: 'Execute Automated 12-Vector OWASP Benchmark',
                  desc: 'Switch to the Red Team tab and click "Run 12-Vector Benchmark" to prove 100% defense accuracy across ASI-01 to ASI-08.',
                  tab: 'benchmark',
                },
                {
                  step: 'Step 7',
                  title: 'Inspect HITL Quarantine Queue & Fleet Trust Scores',
                  desc: 'Review pending quarantined actions and observe how suspicious agents dynamically decay in trust score.',
                  tab: 'fleet',
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-lg bg-[#060910] border border-slate-800 flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <span className="font-mono text-emerald-400 font-bold text-xs shrink-0 mt-0.5">
                      {item.step}
                    </span>
                    <div>
                      <h4 className="text-xs font-semibold text-white">{item.title}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                  <button
                    onClick={onNavigateToSimulator}
                    className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 font-mono shrink-0 cursor-pointer"
                  >
                    <span>Test</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 5: FAQs */}
      {activeSection === 'faq' && (
        <div className="space-y-4">
          <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-emerald-400" />
              Frequently Asked Questions
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-lg bg-[#060910] border border-slate-800 space-y-1.5">
                <h4 className="font-semibold text-slate-200">How does Tier 2 Vector Caching work without a slow database?</h4>
                <p className="text-slate-400 leading-relaxed">
                  We generate 64-dimensional semantic projection embeddings in real time and compute cosine distance against indexed malicious clusters in memory, backed by the 5 TB Google AI Pro storage environment. This takes ~3-8ms—faster than any external API call.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-[#060910] border border-slate-800 space-y-1.5">
                <h4 className="font-semibold text-slate-200">What happens if an external LLM is offline or times out?</h4>
                <p className="text-slate-400 leading-relaxed">
                  Tier 3 features built-in dual-engine resilience: it checks for Groq Llama 3 first, falls back to Gemini Flash, and wraps all external network calls in an automated timeout to ensure zero hang time.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-[#060910] border border-slate-800 space-y-1.5">
                <h4 className="font-semibold text-slate-200">How is compliance verified for SOC 2 and the EU AI Act?</h4>
                <p className="text-slate-400 leading-relaxed">
                  Every audit log block contains its own SHA-256 hash chained to the previous block. When exported via the Audit tab, the system calculates a Merkle Aggregate Root over all entries and writes cryptographic verification headers compliant with SOC 2 Trust Criteria and EU AI Act Article 12.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
