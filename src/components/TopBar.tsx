import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Zap,
  Activity,
  Users,
  AlertTriangle,
  Play,
  Sliders,
  FileText,
  Lock,
  Code2,
  BookOpen,
} from 'lucide-react';

interface TopBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  systemHealthy: boolean;
  onEmergencyWipe: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  setActiveTab,
  systemHealthy,
  onEmergencyWipe,
}) => {
  const [pendingQuarantineCount, setPendingQuarantineCount] = useState<number>(0);

  useEffect(() => {
    const fetchQuarantineCount = async () => {
      try {
        const res = await fetch('/api/quarantine/incidents');
        if (res.ok) {
          const data = await res.json();
          const pending = data.filter((i: any) => i.status === 'PENDING_REVIEW').length;
          setPendingQuarantineCount(pending);
        }
      } catch {
        // Ignore polling errors
      }
    };

    fetchQuarantineCount();
    const interval = setInterval(fetchQuarantineCount, 6000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'telemetry', label: 'Telemetry & ROI', icon: Activity },
    { id: 'fleet', label: 'Agent Fleet Trust', icon: Users },
    {
      id: 'quarantine',
      label: 'Quarantine Queue',
      icon: AlertTriangle,
      badge: pendingQuarantineCount > 0 ? pendingQuarantineCount : undefined,
    },
    { id: 'simulator', label: 'Attack Simulator', icon: Zap },
    { id: 'benchmark', label: 'Red Team Benchmark', icon: Play },
    { id: 'custom_rules', label: 'Custom Rule Studio', icon: Sliders },
    { id: 'policies', label: 'Policy Invariants', icon: ShieldCheck },
    { id: 'audit', label: 'Audit Ledger', icon: FileText },
    { id: 'honeypot', label: 'Honeypot Sandbox', icon: Lock },
    { id: 'integration', label: 'Agent SDK', icon: Code2 },
    { id: 'guide', label: 'Operational Guide', icon: BookOpen },
  ];

  return (
    <header className="border-b border-slate-800 bg-[#070b12] sticky top-0 z-40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-white font-sans uppercase">
                WATCHDOGS
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30 hidden sm:inline">
                v2.5 PRO
              </span>
            </div>
            <span className="text-xs text-slate-400 hidden lg:inline">
              AI Runtime Security Proxy
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links (Scrollable with icons & badges) */}
        <nav className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-slate-800 text-emerald-400 border border-emerald-500/40 font-semibold shadow-sm shadow-emerald-950/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950 animate-pulse">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Action */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onEmergencyWipe}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-500/15 border border-rose-500/40 text-rose-300 hover:bg-rose-500/25 transition-colors whitespace-nowrap cursor-pointer"
            title="Forcefully purge primary agent short-term context memory"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">Emergency Context Wipe</span>
            <span className="sm:hidden">Wipe</span>
          </button>
        </div>
      </div>
    </header>
  );
};
