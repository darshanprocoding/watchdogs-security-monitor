import React, { useState } from 'react';
import { RotateCcw, Bot, ShieldAlert, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { AgentContextState } from '../types/watchdogs.ts';

interface AgentContextControllerProps {
  agentState: AgentContextState | null;
  onWipeContext: (reason?: string) => Promise<void>;
  isLoading?: boolean;
}

export const AgentContextController: React.FC<AgentContextControllerProps> = ({
  agentState,
  onWipeContext,
  isLoading = false,
}) => {
  const [wipeReason, setWipeReason] = useState('Manual security operator context purge');
  const [isWiping, setIsWiping] = useState(false);
  const [wipeSuccessMsg, setWipeSuccessMsg] = useState<string | null>(null);

  const handleWipe = async () => {
    setIsWiping(true);
    setWipeSuccessMsg(null);
    try {
      await onWipeContext(wipeReason);
      setWipeSuccessMsg('Context memory window wiped clean. Primary agent reset to invariant baseline.');
      setTimeout(() => setWipeSuccessMsg(null), 4000);
    } catch (err: any) {
      console.error('Failed to wipe agent context:', err);
    } finally {
      setIsWiping(false);
    }
  };

  if (!agentState) return null;

  return (
    <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white">Primary Agent Context Window</h3>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30">
                {agentState.agentId}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Status: <span className="text-emerald-400 font-semibold">{agentState.status}</span> · Memory Wipes: <span className="font-mono text-slate-200">{agentState.wipeCount}</span>
            </p>
          </div>
        </div>

        <button
          onClick={handleWipe}
          disabled={isWiping || isLoading}
          className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/40 transition-colors cursor-pointer disabled:opacity-50"
        >
          <RotateCcw className={`w-3.5 h-3.5 text-rose-400 ${isWiping ? 'animate-spin' : ''}`} />
          <span>{isWiping ? 'Purging Window...' : 'Force Context Wipe'}</span>
        </button>
      </div>

      {wipeSuccessMsg && (
        <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-800/40 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>{wipeSuccessMsg}</span>
        </div>
      )}

      {/* Active Conversation Turns */}
      <div className="space-y-2">
        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
          Current In-Memory Turns ({agentState.conversationTurns.length} turns)
        </span>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {agentState.conversationTurns.map((turn, idx) => (
            <div
              key={idx}
              className={`p-2.5 rounded-lg text-xs font-mono border ${
                turn.role === 'user'
                  ? 'bg-slate-950/80 border-slate-800 text-slate-300'
                  : turn.role === 'tool'
                  ? 'bg-cyan-950/20 border-cyan-900/40 text-cyan-200'
                  : 'bg-emerald-950/20 border-emerald-900/40 text-emerald-200'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                <span className="uppercase font-bold">{turn.role}</span>
                <span>{new Date(turn.timestamp).toLocaleTimeString()}</span>
              </div>
              <p className="whitespace-pre-wrap">{turn.content}</p>
              {turn.toolCall && (
                <div className="mt-1 pt-1 border-t border-slate-800/60 text-[10px] text-slate-400">
                  Tool: <span className="text-cyan-300">{turn.toolCall.name}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
