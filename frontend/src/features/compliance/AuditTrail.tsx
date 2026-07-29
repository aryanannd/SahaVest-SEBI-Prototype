import { Header } from '../../components/common/Header';
import React, { useState, useEffect } from 'react';
import { Menu, Bell, Filter, ChevronLeft, ChevronRight, ShieldCheck, TrendingUp, ShieldAlert, Link as LinkIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

export function AuditTrail() {
  const navigate = useNavigate();
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAuditLogs() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        if (session) headers['Authorization'] = `Bearer ${session.access_token}`;
        
        const res = await fetch('http://localhost:3000/api/compliance/audit/me', { headers });
        const data = await res.json();
        if (data.events) {
          setLogs(data.events);
        }
      } catch (err) {
        console.error("Failed to fetch audit logs", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAuditLogs();
  }, []);

  const toggleRow = (index: number) => {
    setExpandedRow(expandedRow === index ? null : index);
  };

  return (
    <div className="bg-background text-on-background min-h-screen pt-[56px] pb-[80px] md:pb-0 font-body-md antialiased">
      {/* TopAppBar */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 h-[56px] bg-surface dark:bg-on-background border-b border-outline-variant dark:border-outline shadow-sm">
        <div className="flex items-center">
          <button 
            onClick={() => navigate(-1)}
            aria-label="Menu" 
            className="w-[44px] h-[44px] flex items-center justify-center text-on-surface-variant dark:text-outline hover:bg-surface-container-low dark:hover:bg-surface-variant rounded-full transition-transform duration-150 active:scale-95"
          >
            <ChevronLeft size={24} />
          </button>
          <Header />
        </div>
        <div>
          <button aria-label="Notifications" className="w-[44px] h-[44px] flex items-center justify-center text-on-surface-variant dark:text-outline hover:bg-surface-container-low dark:hover:bg-surface-variant rounded-full transition-transform duration-150 active:scale-95">
            <Bell size={24} />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 md:px-6 py-6">
        <div className="mb-6">
          <h2 className="font-display-lg-mobile md:font-display-lg text-primary mb-2">Audit Trail</h2>
          <p className="font-body-md text-on-surface-variant">A verifiable log of your AI-generated recommendations and advisory interactions, securely hashed.</p>
        </div>
        
        {/* Filter/Controls (Optional) */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button className="px-4 py-3 rounded-full bg-surface-container-low text-on-surface border border-outline-variant font-label-md flex items-center gap-2 hover:bg-surface-variant transition-colors">
            <Filter size={18} /> Filter
          </button>
          <button className="px-4 py-3 rounded-full bg-primary-container text-on-primary-container font-label-md flex items-center gap-2 hover:opacity-90 transition-opacity">
            All Activity
          </button>
          <button className="px-4 py-3 rounded-full bg-surface-container-low text-on-surface border border-outline-variant font-label-md flex items-center gap-2 hover:bg-surface-variant transition-colors">
            Scam Checks
          </button>
        </div>
        
        {/* Audit Log List */}
        <div className="space-y-4">
          
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="w-8 h-8 border-4 border-outline-variant border-t-primary rounded-full animate-spin" />
            </div>
          ) : logs.length === 0 ? (
            <div className="p-8 text-center bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm text-on-surface-variant font-body-md">
              No audit logs found.
            </div>
          ) : (
            logs.map((log, idx) => {
              const isExpanded = expandedRow === idx;
              let Icon = ShieldCheck;
              let iconBg = 'bg-secondary-container text-on-secondary-container';
              let iconStroke = 'text-secondary-container stroke-on-secondary-container';
              
              if (log.ref_type === 'AI_NUDGE' && log.payload?.action?.includes('Scam')) {
                 Icon = ShieldAlert;
                 iconBg = 'bg-surface-variant text-on-surface-variant';
                 iconStroke = 'text-surface-variant stroke-on-surface-variant';
              } else if (log.payload?.action?.includes('Alert')) {
                 Icon = TrendingUp;
                 iconBg = 'bg-primary-container text-on-primary-container';
                 iconStroke = 'text-primary-container stroke-on-primary-container';
              }
              
              return (
                <div key={log.id || idx} className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden group">
                  <div 
                    className="p-4 md:p-6 cursor-pointer hover:bg-surface-bright transition-colors" 
                    onClick={() => toggleRow(idx)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-full ${iconBg} flex items-center justify-center shrink-0`}>
                          <Icon size={20} className={`fill-current ${iconStroke}`} />
                        </div>
                        <div>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-1">
                            <h3 className="font-headline-sm text-primary">{log.payload?.action || 'System Action'}</h3>
                            <span className="w-fit px-2 py-0.5 rounded text-[10px] font-bold bg-surface-variant text-on-surface-variant">
                              {new Date(log.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                            </span>
                          </div>
                          <p className="font-body-md text-on-surface-variant line-clamp-1">
                            {JSON.stringify(log.payload).substring(0, 100)}...
                          </p>
                        </div>
                      </div>
                      {isExpanded ? <ChevronUp size={24} className="text-outline shrink-0 transition-transform" /> : <ChevronDown size={24} className="text-outline shrink-0 transition-transform" />}
                    </div>
                  </div>
                  
                  {/* Expanded Detail */}
                  {isExpanded && (
                    <div className="border-t border-surface-variant bg-surface p-4 md:p-6">
                      <div className="mb-4">
                        <h4 className="font-label-md text-on-surface-variant mb-2 uppercase tracking-wider">Payload Data</h4>
                        <pre className="font-mono text-sm bg-surface-container-low p-3 rounded-lg border border-outline-variant text-on-surface whitespace-pre-wrap">
                          {JSON.stringify(log.payload, null, 2)}
                        </pre>
                      </div>
                      <div className="flex items-center gap-3 mt-4 pt-4 border-t border-surface-variant">
                        <LinkIcon size={16} className="text-outline shrink-0" />
                        <code className="font-mono text-xs text-outline select-all break-all">Hash: 0x{log.content_hash}</code>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
          
        </div>
        
        {/* Pagination */}
        <div className="mt-6 flex justify-center items-center gap-3">
          <button className="w-10 h-10 flex items-center justify-center rounded border border-outline-variant text-on-surface-variant hover:bg-surface-variant transition-colors disabled:opacity-50" disabled>
            <ChevronLeft size={24} />
          </button>
          <span className="font-label-md text-primary">Page 1 of 12</span>
          <button className="w-10 h-10 flex items-center justify-center rounded border border-outline-variant text-on-surface-variant hover:bg-surface-variant transition-colors">
            <ChevronRight size={24} />
          </button>
        </div>
      </main>

    </div>
  );
}
