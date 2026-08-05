import { Header } from '../../components/common/Header';
import React, { useState, useEffect } from 'react';
import { Menu, Bell, CloudOff, Plus, Clock, Search, CheckCircle, ArrowRight, Building, Store, Landmark } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

export function GrievanceTracker() {
  const navigate = useNavigate();
  const [timer, setTimer] = useState(45);
  const [grievances, setGrievances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGrievances() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        if (session) headers['Authorization'] = `Bearer ${session.access_token}`;
        
        const res = await fetch('/api/compliance/grievances/me', { headers });
        const data = await res.json();
        if (data.grievances) {
          setGrievances(data.grievances);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchGrievances();

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 0) {
          // Reset timer to simulate retry
          return 45;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTimer = (seconds: number) => {
    const formatted = seconds < 10 ? '0' + seconds : seconds;
    return `00:${formatted}`;
  };

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen pt-[56px] pb-[80px] md:pb-0 md:pt-[64px] selection:bg-primary-container selection:text-on-primary-container">
      {/* TopAppBar */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 h-[56px] md:h-[64px] bg-surface border-b border-outline-variant shadow-sm transition-transform duration-150">
        <div className="flex items-center gap-2">
          <button aria-label="Menu" className="flex items-center justify-center w-[44px] h-[44px] text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors">
            <Menu size={24} />
          </button>
          <Header />
        </div>
        <div className="flex items-center gap-2 hidden md:flex text-on-surface-variant">
          <button onClick={() => navigate('/dashboard')} className="px-4 py-3 rounded-full font-label-md hover:bg-surface-container-low transition-colors">Dashboard</button>
          <button onClick={() => navigate('/portfolio')} className="px-4 py-3 rounded-full font-label-md hover:bg-surface-container-low transition-colors">Portfolio</button>
          <button className="px-4 py-3 rounded-full font-label-md bg-primary-container text-on-primary-container transition-colors">Protection</button>
          <button className="px-4 py-3 rounded-full font-label-md hover:bg-surface-container-low transition-colors">Profile</button>
        </div>
        <button aria-label="Notifications" className="flex items-center justify-center w-[44px] h-[44px] text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors">
          <Bell size={24} />
        </button>
      </header>

      {/* Main Content Canvas */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        
        {/* Page Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="font-display-lg-mobile md:font-display-lg text-on-background mb-1">Grievance Tracker</h1>
            <p className="font-body-md text-on-surface-variant">Monitor the status of your SCORES filings.</p>
          </div>
          <button 
            onClick={() => navigate('/grievance/file')}
            className="flex items-center justify-center gap-2 bg-primary text-on-primary px-6 h-[48px] rounded-full font-label-md hover:bg-primary/90 transition-colors shadow-sm w-full md:w-auto"
          >
            <Plus size={24} className="fill-current" />
            File New Grievance
          </button>
        </div>

        {/* Connection Status Banner (Simulation) */}
        <div className="mb-6 bg-surface-container-low border border-outline-variant rounded-lg p-4 flex items-start gap-3 shadow-sm" role="alert">
          <CloudOff size={24} className="text-outline mt-[2px] shrink-0" />
          <div className="flex-1">
            <h3 className="font-label-md text-on-surface font-semibold">SCORES Portal Unreachable</h3>
            <p className="font-body-sm text-on-surface-variant mt-1 text-sm">We are currently unable to sync real-time updates from SEBI SCORES. Displaying last known statuses. Retrying in <span className="font-semibold text-primary">{timer <= 0 ? 'Retrying...' : formatTimer(timer)}</span>...</p>
          </div>
          <button 
            onClick={() => setTimer(0)}
            className="font-label-sm text-primary hover:bg-surface-variant px-3 py-2 rounded transition-colors uppercase tracking-wider shrink-0"
          >
            Retry Now
          </button>
        </div>

        {/* Grievance Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {loading ? (
            <div className="col-span-1 md:col-span-2 lg:col-span-3 flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-outline-variant border-t-primary rounded-full animate-spin" />
            </div>
          ) : grievances.length === 0 ? (
            <div className="col-span-1 md:col-span-2 lg:col-span-3 p-8 text-center bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm text-on-surface-variant font-body-md">
              No grievances filed yet.
            </div>
          ) : (
            grievances.map((grievance, idx) => {
              let Icon = Clock;
              let statusLabel = 'Submitted';
              let badgeColors = 'bg-primary-fixed text-on-primary-fixed';
              let bgDecal = 'bg-primary-fixed-dim';

              if (grievance.status === 'IN_PROGRESS') {
                Icon = Search;
                statusLabel = 'Under Review';
                badgeColors = 'bg-tertiary-fixed text-on-tertiary-fixed';
                bgDecal = 'bg-tertiary-fixed-dim';
              } else if (grievance.status === 'RESOLVED') {
                Icon = CheckCircle;
                statusLabel = 'Resolved';
                badgeColors = 'bg-secondary-container text-on-secondary-container';
                bgDecal = 'bg-secondary-fixed';
              }

              return (
                <div key={grievance.id || idx} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                  <div className={`absolute top-0 right-0 w-24 h-24 ${bgDecal} opacity-10 rounded-bl-full -z-10 group-hover:scale-110 transition-transform`}></div>
                  <div className="flex justify-between items-start">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${badgeColors} font-label-sm uppercase tracking-wider`}>
                      <Icon size={16} className={grievance.status !== 'FILED' ? "fill-current" : ""} />
                      {statusLabel}
                    </span>
                    <span className="font-label-md text-on-surface-variant font-mono">{grievance.scores_ref_id}</span>
                  </div>
                  <div>
                    <h3 className="font-headline-sm text-on-background line-clamp-2">{grievance.category}</h3>
                    <p className="font-body-sm text-on-surface-variant mt-1 flex items-center gap-1.5 text-sm">
                      <Building size={16} />
                      {grievance.broker_name || 'N/A'}
                    </p>
                  </div>
                  <div className="mt-auto pt-3 border-t border-surface-variant flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="font-label-sm text-outline uppercase tracking-wider">Filed On</span>
                      <span className="font-label-md text-on-surface font-medium">
                        {new Date(grievance.filed_at || Date.now()).toLocaleDateString('en-IN', { month: 'short', day: '2-digit', year: 'numeric' })}
                      </span>
                    </div>
                    <button aria-label="View Details" className="w-[44px] h-[44px] flex items-center justify-center rounded-full text-primary hover:bg-surface-container-low transition-colors">
                      <ArrowRight size={24} />
                    </button>
                  </div>
                </div>
              );
            })
          )}

        </div>

      </main>
    </div>
  );
}
