import React, { useState, useEffect } from 'react';
import { Eye, ShieldAlert, Key, FileCode, CheckCircle, Terminal, RefreshCw, AlertTriangle } from 'lucide-react';

interface HoneypotHistoryItem {
  timestamp: string;
  agentId: string;
  toolName: string;
  commandSent: string;
  syntheticResponse: string;
}

interface HoneypotConsoleProps {
  onRefreshTelemetry: () => void;
}

export const HoneypotConsole: React.FC<HoneypotConsoleProps> = ({ onRefreshTelemetry }) => {
  const [history, setHistory] = useState<HoneypotHistoryItem[]>([]);
  const [canaries, setCanaries] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchHoneypotData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/honeypot/history');
      if (res.ok) {
        const data = await res.json();
        setHistory(data.history || []);
        setCanaries(data.canaries || []);
      }
    } catch (err) {
      console.error('Failed to fetch honeypot data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHoneypotData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Eye className="w-5 h-5 text-amber-400" />
            Honeypot Interrogation Sandbox & Canary Tripwires
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Decoy execution environment populated with synthetic canary artifacts to silently trap and study deceptive agents.
          </p>
        </div>

        <button
          onClick={fetchHoneypotData}
          disabled={isLoading}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Decoy Logs</span>
        </button>
      </div>

      {/* Canary Tokens Strip */}
      <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/40 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
            <Key className="w-4 h-4 text-amber-400" />
            <span>Active Honeypot Canary Tokens (Tripwires)</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            Real-Time Tripwire Guard Active
          </span>
        </div>
        <p className="text-xs text-slate-400">
          If an autonomous agent accesses these decoy credentials and subsequently attempts to transmit or invoke them in external queries, an immediate high-priority tripwire quarantine triggers.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 pt-1">
          {canaries.map((canary, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-lg bg-[#070b12] border border-amber-900/30 flex items-center justify-between text-xs font-mono"
            >
              <span className="text-amber-200 truncate">{canary}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 ml-2" title="Armed" />
            </div>
          ))}
        </div>
      </div>

      {/* Synthetic Filesystem Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-white">
            <FileCode className="w-3.5 h-3.5 text-cyan-400" />
            <span>/etc/shadow (Decoy Hashes)</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Populated with synthetic root and operator password hashes containing canary salt identifiers.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-white">
            <FileCode className="w-3.5 h-3.5 text-amber-400" />
            <span>/config/aws_keys.env (Canary AWS)</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Contains decoy access key <code className="text-amber-300">AKIAIOSFODNN7CANARY</code> to detect outbound exfiltration.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-white">
            <FileCode className="w-3.5 h-3.5 text-emerald-400" />
            <span>/var/data/customers.csv (Decoy PII)</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Synthetic customer accounts and canary email addresses to detect unauthorized database dumping.
          </p>
        </div>
      </div>

      {/* Interrogation History Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
        <div className="p-3.5 bg-[#070b12] border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-xs font-semibold text-white flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-amber-400" />
            Captured Agent Probing History in Honeypot Sandbox
          </h3>
          <span className="text-[10px] font-mono text-slate-400">
            {history.length} Captured Interactions
          </span>
        </div>

        {history.length === 0 ? (
          <div className="p-8 text-center text-slate-500 font-mono text-xs">
            No agents currently quarantined in honeypot sandbox. Run the &quot;Specification Gaming / Tamper&quot; attack scenario in the Simulator to observe honeypot diversion.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60 font-mono text-xs">
            {history.map((item, idx) => (
              <div key={idx} className="p-4 hover:bg-slate-800/30 transition-colors space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="text-amber-300 font-semibold">{item.agentId}</span>
                  <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
                    Adversarial Probing Command Sent:
                  </span>
                  <div className="text-rose-300 bg-[#060910] p-2 rounded border border-rose-950/60 mt-0.5">
                    {item.commandSent}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
                    Synthetic Decoy Response Returned to Agent:
                  </span>
                  <pre className="text-emerald-300 bg-[#060910] p-2 rounded border border-emerald-950/60 mt-0.5 whitespace-pre-wrap text-[11px] max-h-32 overflow-y-auto">
                    {item.syntheticResponse}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
