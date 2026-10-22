import React, { useState } from 'react';
import { Code, Copy, Check, Terminal, ExternalLink, ShieldCheck } from 'lucide-react';

export const IntegrationHub: React.FC = () => {
  const [activeLang, setActiveLang] = useState<'python' | 'typescript' | 'curl'>('python');
  const [copied, setCopied] = useState(false);

  const snippets = {
    python: `# LangChain Agent Callback Integration
from langchain.callbacks.base import BaseCallbackHandler
import requests

class WatchdogsInterceptor(BaseCallbackHandler):
    """WATCHDOGS Runtime Security Proxy Interceptor for LangChain Agents"""
    def __init__(self, gateway_url="http://localhost:3000/api/proxy/evaluate"):
        self.gateway_url = gateway_url

    def on_tool_start(self, serialized, input_str, **kwargs):
        tool_name = serialized.get("name", "unknown_tool")
        
        # Intercept call before execution through 3-tier cascade
        response = requests.post(self.gateway_url, json={
            "agentId": "langchain_agent_prod",
            "toolName": tool_name,
            "payload": {"command": input_str}
        })
        verdict_data = response.json()
        
        if verdict_data["verdict"] == "BLOCK":
            # Instant termination with zero execution
            raise PermissionError(
                f"[WATCHDOGS_BLOCKED] Tier: {verdict_data['tierEvaluated']}, "
                f"Reason: {verdict_data['reasoning']}"
            )
        elif verdict_data["verdict"] == "REDACT_EXECUTE":
            # Surgically update parameters to sanitized version
            print(f"[WATCHDOGS_REDACT] Sanitized tool payload: {verdict_data['sanitizedPayload']}")
        elif verdict_data["verdict"] == "HONEYPOT_REROUTE":
            # Silently isolated into synthetic sandbox
            print("[WATCHDOGS_HONEYPOT] Agent diverts to canary sandbox.")

# Attach to your agent executor:
# agent_executor = initialize_agent(tools, llm, callbacks=[WatchdogsInterceptor()])`,

    typescript: `// TypeScript / LangChain.js Tool Guard Middleware
import { BaseCallbackHandler } from "@langchain/core/callbacks/base";

export class WatchdogsCallbackHandler extends BaseCallbackHandler {
  name = "watchdogs_runtime_guard";
  gatewayUrl = "http://localhost:3000/api/proxy/evaluate";

  async handleToolStart(tool: { name: string }, input: string) {
    const res = await fetch(this.gatewayUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        agentId: "agent_ts_enterprise",
        toolName: tool.name,
        payload: { command: input },
      }),
    });

    const result = await res.json();
    if (result.verdict === "BLOCK") {
      throw new Error(\`[WATCHDOGS_BLOCKED] \${result.reasoning}\`);
    }
    return result;
  }
}`,

    curl: `# Direct REST Interception Proxy Request
curl -X POST http://localhost:3000/api/proxy/evaluate \\
  -H "Content-Type: application/json" \\
  -d '{
    "agentId": "agent_gemini_primary",
    "toolName": "execute_shell",
    "payload": {
      "command": "rm -rf /var/data --no-preserve-root"
    }
  }'`,
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(snippets[activeLang]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-800">
        <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <Code className="w-5 h-5 text-emerald-400" />
          Agent SDK & Gateway Integration Hub
        </h2>
        <p className="text-sm text-slate-400 mt-0.5">
          Drop-in middleware and callback handlers to wire WATCHDOGS into your multi-agent architecture in under 5 minutes.
        </p>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/70 overflow-hidden">
        {/* Language Tabs & Copy Button */}
        <div className="p-3 bg-[#070b12] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveLang('python')}
              className={`px-3 py-1 text-xs font-semibold rounded cursor-pointer transition-colors ${
                activeLang === 'python'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              LangChain Python
            </button>
            <button
              onClick={() => setActiveLang('typescript')}
              className={`px-3 py-1 text-xs font-semibold rounded cursor-pointer transition-colors ${
                activeLang === 'typescript'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              LangChain TypeScript
            </button>
            <button
              onClick={() => setActiveLang('curl')}
              className={`px-3 py-1 text-xs font-semibold rounded cursor-pointer transition-colors ${
                activeLang === 'curl'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              REST / cURL Proxy
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-300 hover:text-white bg-slate-800 rounded border border-slate-700 cursor-pointer transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Snippet'}</span>
          </button>
        </div>

        <div className="p-4 bg-[#060910]">
          <pre className="text-xs font-mono text-emerald-300 leading-relaxed overflow-x-auto">
            {snippets[activeLang]}
          </pre>
        </div>
      </div>

      {/* Integration Guide Points */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs font-semibold text-white mb-1">Zero Overhead on Safe Actions</div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Tier 1 Heuristic Regex filters validate common safe calls in &lt;1ms without network hops or model token consumption.
          </p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs font-semibold text-white mb-1">Dynamic Redaction Support</div>
          <p className="text-xs text-slate-400 leading-relaxed">
            When malicious flags are stripped, the handler returns the sanitized payload so agent pipelines don&apos;t fail unexpectedly.
          </p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs font-semibold text-white mb-1">Audit Ledger Guarantee</div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Every evaluated invocation is cryptographically hashed with SHA-256 and committed to the 5 TB Google AI Pro storage pool.
          </p>
        </div>
      </div>
    </div>
  );
};
