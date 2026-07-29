import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Bell, Filter, ShieldCheck, ChevronDown, ChevronUp, Link, TrendingUp, FileCheck, ChevronLeft, ChevronRight, LayoutGrid, Wallet, Shield, User } from "lucide-react";
import { Header } from '../../components/common/Header';

interface AuditEntry {
  id: string;
  type: 'scam_check' | 'rebalance' | 'verification';
  title: string;
  date: string;
  summary: string;
  inputData?: string;
  aiAnalysis?: string;
  aiAnalysisStatus?: 'error' | 'info';
  detailsText?: string;
  detailsStatusText?: string;
  hash: string;
}

const MOCK_AUDIT_LOGS: AuditEntry[] = [
  {
    id: '1',
    type: 'scam_check',
    title: 'Scam Check: Mutual Fund Offer',
    date: 'Oct 24, 2023 - 14:32',
    summary: "Analyzed 'Guaranteed 20% Returns Fund' and flagged as high risk due to unrealistic promises.",
    inputData: `"I received a WhatsApp message offering a guaranteed 20% monthly return on a new mutual fund called 'Prime Wealth Growth'. Is this safe?"`,
    aiAnalysis: `HIGH RISK. SEBI regulations prohibit guaranteed returns on mutual funds. This exhibits classic signs of a Ponzi scheme or phishing attempt. Do not engage.`,
    aiAnalysisStatus: 'error',
    hash: '0x7a2f9b3e1c4d5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0'
  },
  {
    id: '2',
    type: 'rebalance',
    title: 'Portfolio Rebalancing Advice',
    date: 'Oct 20, 2023 - 09:15',
    summary: 'Suggested shifting 5% from Mid-Cap Equities to Sovereign Gold Bonds for risk mitigation.',
    detailsText: 'Based on current market volatility and your stated \'Moderate\' risk profile, the AI recommended increasing defensive assets.',
    hash: '0xb4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4'
  },
  {
    id: '3',
    type: 'verification',
    title: 'Advisor Verification',
    date: 'Oct 15, 2023 - 11:45',
    summary: 'Verified SEBI registration number for \'Rahul Desai Financial Services\'.',
    detailsStatusText: 'Status: Verified Active. Registration #INA000012345.',
    hash: '0xf1e2d3c4b5a69788796a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5'
  }
];

export function AuditTrailViewer() {
  const navigate = useNavigate();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

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
      default: return <ShieldCheck size={20} />;
    }
  };

  const getIconColors = (type: string) => {
    switch (type) {
      case 'scam_check': return 'bg-secondary-container text-on-secondary-container';
      case 'rebalance': return 'bg-primary-container text-on-primary-container';
      case 'verification': return 'bg-surface-variant text-on-surface-variant';
      default: return 'bg-secondary-container text-on-secondary-container';
    }
  };

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
          <p className="font-body-md text-on-surface-variant">A verifiable log of your AI-generated recommendations and advisory interactions, securely hashed.</p>
        </div>
        
        {/* Filter/Controls (Optional) */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button className="px-4 py-2 rounded-full bg-surface-container-low text-on-surface border border-outline-variant font-label-md flex items-center gap-2 hover:bg-surface-variant transition-colors">
            <Filter size={18} /> Filter
          </button>
          <button className="px-4 py-2 rounded-full bg-primary-container text-on-primary-container font-label-md flex items-center gap-2 hover:opacity-90 transition-opacity">
            All Activity
          </button>
          <button className="px-4 py-2 rounded-full bg-surface-container-low text-on-surface border border-outline-variant font-label-md flex items-center gap-2 hover:bg-surface-variant transition-colors">
            Scam Checks
          </button>
        </div>
        
        {/* Audit Log List */}
        <div className="space-y-4">
          {MOCK_AUDIT_LOGS.map(log => {
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
                    
                    {log.inputData && log.aiAnalysis && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                        <div>
                          <h4 className="font-label-md text-on-surface-variant mb-2 uppercase tracking-wider">Input Data</h4>
                          <p className="font-body-md bg-surface-container-low p-3 rounded-lg border border-outline-variant text-on-surface">
                            {log.inputData}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-label-md text-on-surface-variant mb-2 uppercase tracking-wider">AI Analysis Result</h4>
                          <p className={`font-body-md p-3 rounded-lg border ${log.aiAnalysisStatus === 'error' ? 'text-on-error-container bg-error-container border-error' : 'bg-surface-container-low border-outline-variant'}`}>
                            {log.aiAnalysisStatus === 'error' && <strong>HIGH RISK. </strong>}
                            {log.aiAnalysis.replace('HIGH RISK. ', '')}
                          </p>
                        </div>
                      </div>
                    )}

                    {log.detailsText && (
                      <p className="font-body-md text-on-surface mb-4">{log.detailsText}</p>
                    )}

                    {log.detailsStatusText && (
                      <p className="font-body-md text-on-surface mb-4">
                        {log.detailsStatusText.split('Verified Active').map((part, i, arr) => 
                           i === arr.length - 1 ? part : <span key={i}>{part}<span className="text-secondary font-bold">Verified Active</span></span>
                        )}
                      </p>
                    )}
                    
                    <div className={`flex items-center gap-3 pt-4 border-t border-surface-variant ${(!log.inputData && !log.detailsText && !log.detailsStatusText) ? '' : 'mt-4'}`}>
                      <Link size={16} className="text-outline" />
                      <code className="font-mono text-xs text-outline select-all break-all">Hash: {log.hash}</code>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
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
