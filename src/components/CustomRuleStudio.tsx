import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Plus,
  Trash2,
  Check,
  AlertTriangle,
  Play,
  Terminal,
  Shield,
  Layers,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { CustomSecurityRule } from '../types/watchdogs.ts';

export const CustomRuleStudio: React.FC = () => {
  const [rules, setRules] = useState<CustomSecurityRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [pattern, setPattern] = useState('');
  const [toolTarget, setToolTarget] = useState('all');
  const [action, setAction] = useState<'BLOCK' | 'REDACT' | 'ALERT'>('BLOCK');

  // Sandbox Tester states
  const [testPattern, setTestPattern] = useState('\\.(?:env|pem|key|id_rsa)');
  const [testPayload, setTestPayload] = useState('cat /app/configs/.env.production');
  const [testResult, setTestResult] = useState<{ matches: boolean; error?: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fetchRules = async () => {
    try {
      const res = await fetch('/api/custom-rules');
      if (res.ok) {
        const data = await res.json();
        setRules(data);
      }
    } catch (e) {
      console.error('Failed to load custom rules:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleToggleRule = async (id: string, currentEnabled: boolean) => {
    try {
      const res = await fetch(`/api/custom-rules/${id}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !currentEnabled }),
      });
      if (res.ok) {
        fetchRules();
      }
    } catch (e) {
      console.error('Failed to toggle rule:', e);
    }
  };

  const handleDeleteRule = async (id: string) => {
    try {
      const res = await fetch(`/api/custom-rules/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setStatusMessage('Custom rule deleted.');
        setTimeout(() => setStatusMessage(null), 3000);
        fetchRules();
      }
    } catch (e) {
      console.error('Failed to delete rule:', e);
    }
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !pattern) return;

    try {
      const res = await fetch('/api/custom-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          pattern,
          toolTarget,
          action,
        }),
      });

      if (res.ok) {
        setStatusMessage(`Rule "${name}" deployed to Tier 1 Heuristics.`);
        setTimeout(() => setStatusMessage(null), 4000);
        setName('');
        setDescription('');
        setPattern('');
        setShowAddForm(false);
        fetchRules();
      }
    } catch (err) {
      console.error('Failed to create rule:', err);
    }
  };

  const runSandboxTest = async () => {
    setIsTesting(true);
    try {
      const res = await fetch('/api/custom-rules/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pattern: testPattern,
          testString: testPayload,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setTestResult(data);
      }
    } catch (err) {
      console.error('Regex test failed:', err);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-xl bg-[#090d16] border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-semibold text-white">Custom SecOps Rule Studio & Sandbox</h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
              Tier-1 Low Latency (&lt;1ms)
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Define domain-specific Regular Expressions and invariants that are evaluated deterministically before LLM invocation.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-3.5 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          {showAddForm ? 'Close Builder' : 'Create Custom Invariant'}
        </button>
      </div>

      {statusMessage && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between animate-in fade-in">
          <span>{statusMessage}</span>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-slate-400 hover:text-white text-xs underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Authoring Form */}
      {showAddForm && (
        <form
          onSubmit={handleCreateRule}
          className="p-5 rounded-xl bg-[#0b0e17] border border-cyan-500/30 space-y-4 animate-in fade-in"
        >
          <h4 className="text-sm font-semibold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            Author New Invariant Rule
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Rule Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Block Kubernetes Secret Files"
                className="w-full px-3 py-1.5 bg-[#05070d] border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Target Tool</label>
              <select
                value={toolTarget}
                onChange={(e) => setToolTarget(e.target.value)}
                className="w-full px-3 py-1.5 bg-[#05070d] border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                <option value="all">All Tools (Global)</option>
                <option value="execute_shell">execute_shell / bash</option>
                <option value="read_file">read_file / cat</option>
                <option value="query_database">query_database / sql</option>
                <option value="http_request">http_request / curl</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Regular Expression Pattern
            </label>
            <input
              type="text"
              required
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="e.g. \/var\/run\/secrets\/kubernetes\.io"
              className="w-full px-3 py-1.5 bg-[#05070d] border border-slate-800 rounded-lg text-xs font-mono text-cyan-300 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Enforcement Action</label>
              <select
                value={action}
                onChange={(e) => setAction(e.target.value as any)}
                className="w-full px-3 py-1.5 bg-[#05070d] border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                <option value="BLOCK">BLOCK (Immediate Zero-Latency Intercept)</option>
                <option value="REDACT">REDACT (Surgically Strip Malicious Parameter)</option>
                <option value="ALERT">ALERT (Flag to SOC Queue but Allow)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Description / Rationale</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Prevents pods from probing container service tokens"
                className="w-full px-3 py-1.5 bg-[#05070d] border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-lg text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-lg text-xs cursor-pointer transition-colors"
            >
              Deploy Rule
            </button>
          </div>
        </form>
      )}

      {/* Rules Table */}
      <div className="bg-[#090d16] border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h4 className="text-sm font-semibold text-white">Active Custom Security Invariants</h4>
          <span className="text-xs text-slate-500 font-mono">{rules.length} configured</span>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-slate-400">Loading custom rules...</div>
        ) : rules.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No custom rules registered.</div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-800/20 transition-colors"
              >
                <div className="flex items-start gap-3 flex-1">
                  <div
                    onClick={() => handleToggleRule(rule.id, rule.enabled)}
                    className={`mt-0.5 w-8 h-4.5 rounded-full p-0.5 cursor-pointer transition-colors ${
                      rule.enabled ? 'bg-cyan-500' : 'bg-slate-800'
                    }`}
                  >
                    <div
                      className={`w-3.5 h-3.5 rounded-full bg-white transition-transform ${
                        rule.enabled ? 'translate-x-3.5' : 'translate-x-0'
                      }`}
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">{rule.name}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          rule.action === 'BLOCK'
                            ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                            : rule.action === 'REDACT'
                            ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                            : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                        }`}
                      >
                        {rule.action}
                      </span>
                      <span className="text-[10px] font-mono text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                        {rule.toolTarget}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 mt-0.5">{rule.description}</p>
                    <code className="text-[11px] font-mono text-cyan-300/90 bg-[#05070d] px-2 py-0.5 rounded border border-slate-800 inline-block mt-2">
                      /{rule.pattern}/i
                    </code>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 pl-11 md:pl-0">
                  <div className="text-right">
                    <div className="font-mono text-xs font-bold text-white">{rule.hits}</div>
                    <div className="text-[10px] text-slate-500">Hits Intercepted</div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteRule(rule.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                    title="Delete rule"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Interactive Regex Sandbox Tester */}
      <div className="p-5 rounded-xl bg-[#090d16] border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-purple-400" />
            <h4 className="text-sm font-semibold text-white">Live RegEx Sandbox Tester</h4>
          </div>
          <span className="text-[11px] text-slate-500">Test patterns against mock payloads before deployment</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Test Regex Pattern</label>
            <input
              type="text"
              value={testPattern}
              onChange={(e) => setTestPattern(e.target.value)}
              className="w-full px-3 py-1.5 bg-[#05070d] border border-slate-800 rounded-lg text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Sample Agent Payload Input</label>
            <input
              type="text"
              value={testPayload}
              onChange={(e) => setTestPayload(e.target.value)}
              className="w-full px-3 py-1.5 bg-[#05070d] border border-slate-800 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isTesting}
              onClick={runSandboxTest}
              className="px-3.5 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 font-semibold rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5" />
              Run Sandbox Test
            </button>
          </div>

          {testResult && (
            <div className="flex items-center gap-2">
              {testResult.error ? (
                <span className="text-xs text-rose-400 font-mono">
                  Syntax Error: {testResult.error}
                </span>
              ) : testResult.matches ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  MATCH DETECTED &mdash; INVARIANT TRIGGERED (INTERCEPTED)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  PASSED &mdash; NO MALICIOUS PATTERN MATCHED
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
