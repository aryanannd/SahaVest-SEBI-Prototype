import React, { useState, useEffect } from 'react';
import { Menu, Bell, Settings, Sliders, Info, Brain, Search, AlertTriangle, Gavel, ArrowRight, CheckCircle, Shield, Loader2, RefreshCw, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/common/Header';
import { supabase } from '../../lib/supabaseClient';

// Map agent names to icons and colors
const AGENT_META: Record<string, { icon: React.ReactNode; colorClass: string; label: string }> = {
  TrustScoreAgent: {
    icon: <Shield size={20} />,
    colorClass: 'bg-primary-container text-on-primary-container',
    label: 'Trust Score'
  },
  AdvisorVerificationAgent: {
    icon: <Search size={20} />,
    colorClass: 'bg-secondary-container text-on-secondary-container',
    label: 'Advisor Verify'
  },
  ScamCheckAgent: {
    icon: <AlertTriangle size={20} />,
    colorClass: 'bg-error-container text-on-error-container',
    label: 'Scam Check'
  },
  GrievanceAgent: {
    icon: <Gavel size={20} />,
    colorClass: 'bg-tertiary-container text-on-tertiary-container',
    label: 'Grievance'
  },
  SahaVestChatAgent: {
    icon: <Brain size={20} />,
    colorClass: 'bg-primary-container text-on-primary-container',
    label: 'AI Chat'
  },
};

const DEFAULT_META = {
  icon: <Activity size={20} />,
  colorClass: 'bg-surface-container-high text-on-surface',
  label: 'Agent'
};

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return 'Today';
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

function buildSummary(log: any): string {
  const input = log.input_ref || {};
  const output = log.output_ref || {};
  switch (log.agent_name) {
    case 'TrustScoreAgent':
      return `Analyzed "${input.entity || 'entity'}": score ${output.score ?? '—'} (${output.risk_category || '—'}). Registry match: ${output.registry_match ? 'Yes' : 'No'}.`;
    case 'AdvisorVerificationAgent':
      return `Verified reg no ${input.reg_no || '—'}: ${output.found ? `Found — ${output.name || 'Verified'}` : 'Not found in SEBI registry'}.`;
    case 'ScamCheckAgent':
      return `Scam check on message (${(input.message || '').slice(0, 40)}...): ${output.isSuspicious ? '⚠ SUSPICIOUS' : '✓ Clear'}.`;
    case 'GrievanceAgent':
      return `Grievance filed (category: ${input.category || '—'}), ref ${output.ref_id || '—'}.`;
    case 'SahaVestChatAgent':
      return `Chat session processed. Response generated in ${log.latency_ms}ms.`;
    default:
      return `${log.agent_name} executed. Status: ${log.status}.`;
  }
}

export function AIExplainability() {
  const [threshold, setThreshold] = useState(85);
  const navigate = useNavigate();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getThresholdColor = () => {
    if (threshold < 70) return 'text-error';
    if (threshold < 85) return 'text-tertiary';
    return 'text-primary';
  };

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers: HeadersInit = {};
      if (session) headers['Authorization'] = `Bearer ${session.access_token}`;
      const res = await fetch('/api/agent-logs/me?limit=15', { headers });
      const data = await res.json();
      if (data.logs) {
        setLogs(data.logs);
      } else {
        setError('Failed to load agent logs');
      }
    } catch (err) {
      setError('Network error loading logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="min-h-screen pb-safe bg-background text-on-background antialiased">
      <header className="bg-surface fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 h-[56px] border-b border-outline-variant shadow-sm">
        <button className="text-on-surface-variant hover:bg-surface-container-low w-[44px] h-[44px] flex items-center justify-center rounded-full transition-colors active:scale-95 duration-150">
          <Menu size={24} />
        </button>
        <Header />
        <button className="text-on-surface-variant hover:bg-surface-container-low w-[44px] h-[44px] flex items-center justify-center rounded-full transition-colors active:scale-95 duration-150">
          <Bell size={24} />
        </button>
      </header>

      <main className="pt-[72px] pb-[96px] px-4 max-w-4xl mx-auto md:px-6 grid grid-cols-4 md:grid-cols-8 gap-3 md:gap-4">
        <div className="col-span-4 md:col-span-8 mb-3">
          <div className="flex items-center gap-2 text-primary mb-1">
            <Settings size={20} />
            <span className="font-label-md uppercase tracking-wider text-on-surface-variant">Advanced Settings</span>
          </div>
          <h2 className="font-display-lg-mobile md:font-display-lg text-on-surface mb-2">Explainability Panel</h2>
          <p className="font-body-md text-on-surface-variant">Review the autonomous decisions made by your SahaVest agent and adjust sensitivity parameters to match your risk profile.</p>
        </div>

        <div className="col-span-4 md:col-span-3 flex flex-col gap-3">
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-headline-sm text-primary flex items-center gap-2">
                <Sliders size={24} /> AI Confidence Threshold
              </h3>
            </div>
            <p className="font-body-md text-on-surface-variant mb-6">Determine the minimum certainty required for the AI to execute an automated alert or block a high-risk transaction.</p>
            
            <div className="mb-6">
              <div className="flex justify-between items-end mb-2">
                <span className="font-label-md text-on-surface-variant">Conservative</span>
                <span className={`font-headline-md ${getThresholdColor()}`}>{threshold}%</span>
              </div>
              <input 
                type="range" min="50" max="99" value={threshold} 
                onChange={e => setThreshold(Number(e.target.value))} 
                className="w-full h-2 bg-surface-variant rounded-lg appearance-none cursor-pointer accent-primary" 
              />
              <div className="flex justify-between mt-2 font-label-sm text-outline">
                <span>50% (High Alert)</span>
                <span>99% (Strict)</span>
              </div>
            </div>

            <div className="bg-surface-container-low rounded-lg p-3 border border-outline-variant/50">
              <div className="flex items-start gap-3">
                <Info className="text-secondary shrink-0 mt-0.5" size={20} />
                <div>
                  <span className="font-label-md text-on-surface block mb-1">Current Setting: Guarded</span>
                  <span className="font-body-sm text-on-surface-variant text-sm">Alerts will trigger only when the AI is highly confident ({threshold}%+) that a transaction contains speculative risk patterns.</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 shadow-sm">
            <h3 className="font-headline-sm text-primary mb-4">Agent Focus Areas</h3>
            <div className="flex flex-wrap gap-2">
              <button className="px-4 py-2 rounded-full border-2 border-primary bg-primary-container text-on-primary-container font-label-md transition-colors">FOMO Detection</button>
              <button className="px-4 py-2 rounded-full border border-outline-variant text-on-surface-variant hover:bg-surface-container font-label-md transition-colors">Volatility</button>
              <button className="px-4 py-2 rounded-full border border-outline-variant text-on-surface-variant hover:bg-surface-container font-label-md transition-colors">Liquidity Risk</button>
              <button className="px-4 py-2 rounded-full border border-outline-variant text-on-surface-variant hover:bg-surface-container font-label-md transition-colors">Scam Patterns</button>
            </div>
          </div>
        </div>

        <div className="col-span-4 md:col-span-5 bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-outline-variant bg-surface-bright flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Brain className="text-primary" size={24} />
              <h3 className="font-headline-sm text-primary">Live Agent Log</h3>
              {!loading && logs.length > 0 && (
                <span className="font-label-sm text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">{logs.length} entries</span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchLogs}
                className="text-on-surface-variant hover:bg-surface-container-low w-[36px] h-[36px] flex items-center justify-center rounded-full transition-colors"
                title="Refresh logs"
              >
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              </button>
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary"></span>
                </span>
                <span className="font-label-sm text-on-surface-variant uppercase tracking-wider">Live</span>
              </div>
            </div>
          </div>

          <div className="p-4 flex-grow overflow-y-auto max-h-[600px] relative">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 text-on-surface-variant">
                <Loader2 size={32} className="animate-spin mb-3 text-primary" />
                <p className="font-body-md">Loading real agent logs...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="font-body-md text-error mb-2">{error}</p>
                <button onClick={fetchLogs} className="text-primary font-label-md hover:underline">Retry</button>
              </div>
            ) : logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Brain size={40} className="text-outline mb-3" />
                <p className="font-headline-sm text-on-surface mb-1">No agent activity yet</p>
                <p className="font-body-md text-on-surface-variant max-w-xs">Run a scam check, trust score lookup, or chat with the AI to generate log entries here.</p>
              </div>
            ) : (
              <div>
                {logs.map((log, idx) => {
                  const meta = AGENT_META[log.agent_name] || DEFAULT_META;
                  const isLast = idx === logs.length - 1;
                  return (
                    <div key={log.id} className="relative mb-6">
                      {!isLast && (
                        <div className="absolute left-[23px] top-[40px] bottom-[-24px] w-[2px] bg-outline-variant"></div>
                      )}
                      <div className="flex gap-4 relative z-10">
                        <div className={`w-12 h-12 rounded-full ${meta.colorClass} flex items-center justify-center border-4 border-surface-container-lowest shrink-0`}>
                          {meta.icon}
                        </div>
                        <div className="flex-grow pt-1">
                          <div className="flex justify-between items-start mb-1">
                            <div>
                              <span className="font-label-md text-on-surface block">{meta.label}</span>
                              <span className="font-label-sm text-outline text-xs">{log.agent_name}</span>
                            </div>
                            <div className="text-right">
                              <span className="font-label-sm text-outline block">{formatTime(log.created_at)}</span>
                              <span className="font-label-sm text-outline text-xs">{formatDate(log.created_at)}</span>
                            </div>
                          </div>
                          <div className="bg-surface-container-low rounded-lg p-3 border border-outline-variant/30">
                            <p className="font-body-md text-on-surface-variant font-mono text-sm leading-relaxed mb-2">
                              {buildSummary(log)}
                            </p>
                            <div className="flex items-center gap-2 flex-wrap">
                              {log.confidence != null && (
                                <span className={`px-2 py-0.5 rounded font-label-sm text-xs ${log.confidence >= 0.8 ? 'bg-secondary-container text-on-secondary-container' : log.confidence >= 0.5 ? 'bg-tertiary-container text-on-tertiary-container' : 'bg-error-container text-on-error-container'}`}>
                                  Confidence: {Math.round(log.confidence * 100)}%
                                </span>
                              )}
                              {log.latency_ms != null && (
                                <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-label-sm text-xs">
                                  {log.latency_ms}ms
                                </span>
                              )}
                              <span className={`px-2 py-0.5 rounded font-label-sm text-xs ${log.status === 'success' ? 'bg-secondary-container text-on-secondary-container' : log.status === 'not_found' ? 'bg-surface-container text-on-surface-variant' : 'bg-error-container text-on-error-container'}`}>
                                {log.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
