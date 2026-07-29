import { Header } from '../../components/common/Header';
import React, { useState, useEffect } from 'react';
import { Search, User, Landmark, LineChart, ShieldBan, History, TimerOff, Ban, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

export function ManageConsents() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'active' | 'revoked' | 'expired'>('active');
  const [consents, setConsents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchConsents() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        if (session) headers['Authorization'] = `Bearer ${session.access_token}`;
        const res = await fetch('http://localhost:3000/api/compliance/consents/me', { headers });
        const data = await res.json();
        if (data.consents) setConsents(data.consents);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchConsents();
  }, []);

  const filteredConsents = consents.filter(c => c.status.toLowerCase() === activeTab);

  return (
    <div className="bg-background text-on-background h-full flex flex-col font-body-md antialiased min-h-screen">
      {/* TopAppBar */}
      <header className="bg-surface dark:bg-surface-dim w-full sticky top-0 z-50 border-b border-outline-variant dark:border-outline">
        <div className="flex items-center justify-between px-4 py-3 w-full max-w-7xl mx-auto">
          <button className="text-primary dark:text-primary-fixed hover:bg-surface-container-low dark:hover:bg-surface-container-highest transition-colors active:scale-95 duration-100 p-2 rounded-full flex items-center justify-center w-[44px] h-[44px]">
            <Search size={24} />
          </button>
          <Header />
          <button className="text-primary dark:text-primary-fixed hover:bg-surface-container-low dark:hover:bg-surface-container-highest transition-colors active:scale-95 duration-100 p-2 rounded-full flex items-center justify-center w-[44px] h-[44px]">
            <User size={24} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 md:px-6 py-6 pb-32">
        <div className="mb-6">
          <h1 className="font-display-lg-mobile md:font-display-lg text-primary mb-2">Consent Management</h1>
          <p className="font-body-md text-on-surface-variant">Review and manage data access granted to Financial Information Providers (FIPs).</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-outline-variant mb-6">
          <button 
            className={`font-label-md px-4 py-3 flex-1 text-center focus:outline-none transition-colors duration-200 min-h-[44px] ${activeTab === 'active' ? 'border-b-2 border-primary text-primary' : 'text-on-surface-variant border-b-2 border-transparent'}`}
            onClick={() => setActiveTab('active')}
          >
            Active
          </button>
          <button 
            className={`font-label-md px-4 py-3 flex-1 text-center focus:outline-none transition-colors duration-200 min-h-[44px] ${activeTab === 'revoked' ? 'border-b-2 border-primary text-primary' : 'text-on-surface-variant border-b-2 border-transparent'}`}
            onClick={() => setActiveTab('revoked')}
          >
            Revoked
          </button>
          <button 
            className={`font-label-md px-4 py-3 flex-1 text-center focus:outline-none transition-colors duration-200 min-h-[44px] ${activeTab === 'expired' ? 'border-b-2 border-primary text-primary' : 'text-on-surface-variant border-b-2 border-transparent'}`}
            onClick={() => setActiveTab('expired')}
          >
            Expired
          </button>
        </div>

        {/* Tab Content */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 size={40} className="animate-spin text-primary" />
          </div>
        ) : filteredConsents.length > 0 ? (
          <div className="space-y-4">
            {filteredConsents.map((consent, idx) => (
              <div key={consent.id || idx} className="bg-surface-container-lowest rounded-lg border border-outline-variant p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-sm transition-shadow duration-200">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Landmark className="text-primary" size={20} />
                    <h2 className="font-headline-sm text-on-surface">{consent.entity}</h2>
                  </div>
                  <p className="font-body-md text-on-surface-variant mb-3">{consent.purpose}</p>
                  <div className="grid grid-cols-2 gap-4 font-label-md text-on-surface-variant">
                    <div>
                      <span className="block text-outline text-[11px] uppercase tracking-wider mb-[2px]">Granted On</span>
                      Recent
                    </div>
                    <div>
                      <span className="block text-outline text-[11px] uppercase tracking-wider mb-[2px]">Expires On</span>
                      {consent.expiry ? new Date(consent.expiry).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                </div>
                {activeTab === 'active' && (
                  <div className="w-full md:w-auto mt-3 md:mt-0">
                    <button className="w-full md:w-auto min-w-[120px] h-[48px] px-4 rounded border border-error text-error hover:bg-error-container/20 transition-colors duration-200 font-label-md flex items-center justify-center gap-2">
                      <Ban size={18} />
                      Revoke
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mb-4">
              {activeTab === 'active' ? <ShieldBan className="text-outline" size={32} /> : 
               activeTab === 'revoked' ? <History className="text-outline" size={32} /> : 
               <TimerOff className="text-outline" size={32} />}
            </div>
            <h3 className="font-headline-sm text-on-surface mb-2">No {activeTab} Consents</h3>
            <p className="font-body-md text-on-surface-variant max-w-sm">
              {activeTab === 'active' ? "You don't have any active data access permissions." : 
               activeTab === 'revoked' ? "You haven't revoked any data access permissions recently." : 
               "All your past consents have either been renewed or are still active."}
            </p>
          </div>
        )}

      </main>

    </div>
  );
}
