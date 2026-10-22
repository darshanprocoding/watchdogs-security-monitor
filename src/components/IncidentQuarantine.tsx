import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  CheckCircle,
  XCircle,
  AlertOctagon,
  Clock,
  Terminal,
  Bot,
  UserCheck,
  ChevronDown,
  ChevronUp,
  FileCheck,
  Layers,
  Sparkles,
} from 'lucide-react';
import { QuarantineIncident } from '../types/watchdogs.ts';

export const IncidentQuarantine: React.FC = () => {
  const [incidents, setIncidents] = useState<QuarantineIncident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('PENDING_REVIEW');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<QuarantineIncident | null>(null);
  const [analystNotes, setAnalystNotes] = useState('');
  const [analystName, setAnalystName] = useState('SecOps Lead Operator');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const fetchIncidents = async () => {
    try {
      const res = await fetch('/api/quarantine/incidents');
      if (res.ok) {
        const data = await res.json();
        setIncidents(data);
        if (!expandedId && data.length > 0) {
          setExpandedId(data[0].id);
        }
      }
    } catch (e) {
      console.error('Failed to load incidents:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
    const interval = setInterval(fetchIncidents, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleReview = async (incidentId: string, action: 'APPROVE' | 'REJECT' | 'SANITIZE') => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/quarantine/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incidentId,
          action,
          notes: analystNotes || `Incident ${action.toLowerCase()}ed via operator dashboard override.`,
          analystName,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setNotification(`Incident #${incidentId} updated to ${updated.status}.`);
        setTimeout(() => setNotification(null), 4000);
        setSelectedIncident(null);
        setAnalystNotes('');
        fetchIncidents();
      }
    } catch (e) {
      console.error('Failed to review incident:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredIncidents = incidents.filter((inc) => {
    if (statusFilter === 'ALL') return true;
    return inc.status === statusFilter;
  });

  const pendingCount = incidents.filter((i) => i.status === 'PENDING_REVIEW').length;

  const getStatusBadge = (status: QuarantineIncident['status']) => {
    switch (status) {
      case 'PENDING_REVIEW':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Clock className="w-3 h-3 text-amber-400 animate-pulse" />
            PENDING REVIEW
          </span>
        );
      case 'APPROVED_RELEASED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle className="w-3 h-3 text-emerald-400" />
            APPROVED & RELEASED
          </span>
        );
      case 'REJECTED_BLOCKED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <XCircle className="w-3 h-3 text-rose-400" />
            REJECTED & BLOCKED
          </span>
        );
      case 'SANITIZED_RELEASED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            SANITIZED & EXECUTED
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="p-5 rounded-xl bg-[#090d16] border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-semibold text-white">Human-In-The-Loop (HITL) Quarantine Queue</h3>
            {pendingCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                {pendingCount} Pending
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Elevated-risk agent tool calls held for cryptographic SecOps approval before execution to prevent goal hijacking and tool abuse.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {['ALL', 'PENDING_REVIEW', 'APPROVED_RELEASED', 'REJECTED_BLOCKED', 'SANITIZED_RELEASED'].map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
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

      {notification && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between animate-in fade-in">
          <span>{notification}</span>
          <button
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-white text-xs underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Incident List */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-400">Loading quarantine incidents...</div>
      ) : filteredIncidents.length === 0 ? (
        <div className="p-12 text-center text-slate-500 bg-[#090d16] rounded-xl border border-slate-800">
          No incidents found under status &ldquo;{statusFilter.replace('_', ' ')}&rdquo;.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredIncidents.map((incident) => {
            const isExpanded = expandedId === incident.id;
            const isPending = incident.status === 'PENDING_REVIEW';

            return (
              <div
                key={incident.id}
                className={`rounded-xl border transition-all ${
                  isPending
                    ? 'bg-[#0b0e17] border-amber-500/30 shadow-lg shadow-amber-950/10'
                    : 'bg-[#090d16] border-slate-800'
                }`}
              >
                {/* Header Row */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : incident.id)}
                  className="p-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-800/20 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg border font-mono font-bold text-xs ${
                        incident.riskScore >= 85
                          ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                          : incident.riskScore >= 60
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                          : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                      }`}
                    >
                      RISK {incident.riskScore}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white font-mono">{incident.id}</span>
                        <span className="text-xs text-slate-500">•</span>
                        <span className="text-xs text-slate-300 flex items-center gap-1 font-mono">
                          <Bot className="w-3.5 h-3.5 text-cyan-400" />
                          {incident.agentId}
                        </span>
                        <span className="text-xs text-slate-500">•</span>
                        <span className="text-xs font-mono text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                          {incident.toolName}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                        {incident.suggestedAction}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {getStatusBadge(incident.status)}
                    <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
                      {new Date(incident.timestamp).toLocaleTimeString()}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-4 pt-0 border-t border-slate-800/80 space-y-4">
                    {/* Payload inspector */}
                    <div className="mt-3">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                        Interception Payload Arguments
                      </span>
                      <pre className="p-3 bg-[#05070d] border border-slate-800 rounded-lg text-xs font-mono text-slate-200 overflow-x-auto max-h-48 leading-relaxed">
                        {JSON.stringify(incident.payload, null, 2)}
                      </pre>
                    </div>

                    {/* Reviewer / Resolution metadata */}
                    {incident.reviewedAt && (
                      <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-300 space-y-1">
                        <div className="flex items-center justify-between text-slate-400">
                          <span className="flex items-center gap-1">
                            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                            Reviewed By: <strong className="text-white ml-1">{incident.reviewedBy}</strong>
                          </span>
                          <span className="font-mono text-[11px]">
                            {new Date(incident.reviewedAt).toLocaleString()}
                          </span>
                        </div>
                        {incident.analystNotes && (
                          <p className="mt-1 text-slate-300 italic">
                            &ldquo;{incident.analystNotes}&rdquo;
                          </p>
                        )}
                      </div>
                    )}

                    {/* Action Bar for Pending Incidents */}
                    {isPending && (
                      <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                        <div className="flex-1 flex gap-2">
                          <input
                            type="text"
                            value={analystNotes}
                            onChange={(e) => setAnalystNotes(e.target.value)}
                            placeholder="Add signed SecOps rationale or compliance override note..."
                            className="flex-1 px-3 py-1.5 bg-[#05070d] border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={() => handleReview(incident.id, 'APPROVE')}
                            className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            Approve (Release)
                          </button>

                          <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={() => handleReview(incident.id, 'SANITIZE')}
                            className="px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            Sanitize & Release
                          </button>

                          <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={() => handleReview(incident.id, 'REJECT')}
                            className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Reject & Block
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
