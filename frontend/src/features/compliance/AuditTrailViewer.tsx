import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Bell, Filter, ShieldCheck, ChevronDown, ChevronUp, Link, TrendingUp, FileCheck, ChevronLeft, ChevronRight, LayoutGrid, Wallet, Shield, User, FileWarning, Loader2 } from "lucide-react";
import { Header } from '../../components/common/Header';
import { supabase } from '../../lib/supabaseClient';

interface AuditEntry {
  id: string;
  type: 'scam_check' | 'rebalance' | 'verification' | 'grievance' | 'consent' | 'general';
  ref_type: string;
  title: string;
  date: string;
  summary: string;
  hash: string;
  blockchain_tx_id?: string | null;
}

export function AuditTrailViewer() {
  const navigate = useNavigate();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    async function fetchLogs() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        if (session) headers['Authorization'] = `Bearer ${session.access_token}`;

        const res = await fetch('/api/compliance/audit/me', { headers });
        const data = await res.json();
        if (data.events) {
          setLogs(data.events);
        }
      } catch (err) {
        console.error('Failed to fetch audit logs', err);
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, []);

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'scam_check': return <ShieldCheck size={20} fill="currentColor" />;
      case 'rebalance': return <TrendingUp size={20} />;
      case 'verification': return <FileCheck size={20} />;
      case 'grievance': return <FileWarning size={20} />;
      case 'consent': return <Shield size={20} />;
      default: return <ShieldCheck size={20} />;
    }
  };

  const getIconColors = (type: string) => {
    switch (type) {
      case 'scam_check': return 'bg-secondary-container text-on-secondary-container';
      case 'rebalance': return 'bg-primary-container text-on-primary-container';
      case 'verification': return 'bg-surface-variant text-on-surface-variant';
      case 'grievance': return 'bg-error-container text-on-error-container';
      case 'consent': return 'bg-tertiary-container text-on-tertiary-container';
      default: return 'bg-surface-container text-on-surface-variant';
    }
  };

  const filterOptions = [
    { key: 'all', label: 'All Activity' },
    { key: 'scam_check', label: 'Scam Checks' },
    { key: 'grievance', label: 'Grievances' },
    { key: 'consent', label: 'Consents' },
  ];

  const filteredLogs = filter === 'all' ? logs : logs.filter(l => l.type === filter);

  return (
    <div className="bg-background text-on-background min-h-screen pt-[56px] pb-[80px] md:pb-0 font-body-md antialiased">
      {/* TopAppBar */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 h-[56px] bg-surface dark:bg-on-background border-b border-outline-variant dark:border-outline shadow-sm">
        <div className="flex items-center">
          <button className="w-11 h-11 flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low rounded-full transition-transform duration-150 active:scale-95">
            <Menu size={24} />
          </button>
          <Header />
        </div>
        <div>
          <button className="w-11 h-11 flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low rounded-full transition-transform duration-150 active:scale-95">
            <Bell size={24} />
          </button>
        </div>
      </header>
      
      <main className="max-w-4xl mx-auto px-4 md:px-6 py-6">
        <div className="mb-6">
          <h2 className="font-display-lg-mobile md:font-display-lg text-primary mb-2">Audit Trail</h2>
          <p className="font-body-md text-on-surface-variant">An immutable log of your security events, AI interactions, and compliance actions — each cryptographically hashed.</p>
        </div>
        
        {/* Filter/Controls */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button className="px-4 py-2 rounded-full bg-surface-container-low text-on-surface border border-outline-variant font-label-md flex items-center gap-2 hover:bg-surface-variant transition-colors">
            <Filter size={18} /> Filter
          </button>
          {filterOptions.map(opt => (
            <button
              key={opt.key}
              onClick={() => setFilter(opt.key)}
              className={`px-4 py-2 rounded-full font-label-md flex items-center gap-2 transition-colors ${filter === opt.key ? 'bg-primary-container text-on-primary-container' : 'bg-surface-container-low text-on-surface border border-outline-variant hover:bg-surface-variant'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        
        {/* Audit Log List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant gap-3">
              <Loader2 size={32} className="animate-spin text-primary" />
              <p className="font-body-md">Loading audit trail from secure ledger…</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-16 text-on-surface-variant">
              <ShieldCheck size={48} className="mx-auto mb-4 opacity-30" />
              <p className="font-headline-sm text-on-surface mb-2">No audit events yet</p>
              <p className="font-body-md">Events from scam checks, grievances, and AI interactions will appear here.</p>
            </div>
          ) : (
            filteredLogs.map(log => {
              const isExpanded = expandedIds.has(log.id);
              return (
                <div key={log.id} className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden group">
                  <div 
                    className="p-4 md:p-6 cursor-pointer hover:bg-surface-bright transition-colors"
                    onClick={() => toggleExpand(log.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${getIconColors(log.type)}`}>
                          {getIcon(log.type)}
                        </div>
                        <div>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-1">
                            <h3 className="font-headline-sm text-primary">{log.title}</h3>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-surface-variant text-on-surface-variant w-fit">{log.date}</span>
                          </div>
                          <p className="font-body-md text-on-surface-variant line-clamp-1">{log.summary}</p>
                        </div>
                      </div>
                      <div className="text-outline transition-transform ml-2 shrink-0">
                        {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                      </div>
                    </div>
                  </div>
                  
                  {/* Expanded Detail */}
                  {isExpanded && (
                    <div className="border-t border-surface-variant bg-surface p-4 md:p-6 animate-in fade-in duration-200">
                      <p className="font-body-md text-on-surface mb-4">{log.summary}</p>
                      
                      <div className="flex items-center gap-3 pt-4 border-t border-surface-variant mt-4">
                        <Link size={16} className="text-outline shrink-0" />
                        <code className="font-mono text-xs text-outline select-all break-all">SHA-256: {log.hash}</code>
                      </div>
                      {log.blockchain_tx_id && (
                        <div className="mt-2 flex items-center gap-2">
                          <span className="font-label-sm text-secondary">On-chain TX: {log.blockchain_tx_id}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
        
        {/* Entry count */}
        {!loading && filteredLogs.length > 0 && (
          <p className="text-center font-label-sm text-on-surface-variant mt-6">
            Showing {filteredLogs.length} verified audit event{filteredLogs.length !== 1 ? 's' : ''}
          </p>
        )}
      </main>
      
      {/* BottomNavBar */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 pb-safe h-[80px] bg-surface-container dark:bg-on-background shadow-lg rounded-t-xl md:hidden">
        <button onClick={() => navigate('/dashboard')} className="flex flex-col items-center justify-center text-on-surface-variant px-5 py-1 hover:bg-surface-variant rounded-full transition-all duration-200">
          <LayoutGrid size={24} className="mb-1" />
          <span className="font-label-sm">Dashboard</span>
        </button>
        <button onClick={() => navigate('/portfolio')} className="flex flex-col items-center justify-center text-on-surface-variant px-5 py-1 hover:bg-surface-variant rounded-full transition-all duration-200">
          <Wallet size={24} className="mb-1" />
          <span className="font-label-sm">Portfolio</span>
        </button>
        <button onClick={() => navigate('/protection')} className="flex flex-col items-center justify-center bg-primary-container text-on-primary-container rounded-full px-5 py-1 scale-90 transition-all duration-200">
          <Shield size={24} className="mb-1" fill="currentColor" />
          <span className="font-label-sm">Protection</span>
        </button>
        <button onClick={() => navigate('/profile')} className="flex flex-col items-center justify-center text-on-surface-variant px-5 py-1 hover:bg-surface-variant rounded-full transition-all duration-200">
          <User size={24} className="mb-1" />
          <span className="font-label-sm">Profile</span>
        </button>
      </nav>
    </div>
  );
}
