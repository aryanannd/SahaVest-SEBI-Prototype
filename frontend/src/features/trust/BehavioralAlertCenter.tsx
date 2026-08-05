import { Header } from '../../components/common/Header';
import React, { useEffect, useState } from 'react';
import { User, Bell, Lightbulb, CheckCircle, AlertTriangle, CheckCircle2, TrendingUp, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

export function BehavioralAlertCenter() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    async function fetchAlerts() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        if (session) headers['Authorization'] = `Bearer ${session.access_token}`;
        
        const res = await fetch('/api/trust/alerts', { headers });
        const data = await res.json();
        if (data && data.alerts) setAlerts(data.alerts);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchAlerts();
  }, []);

  const getIconForType = (type: string) => {
    switch (type) {
      case 'overtrading': return <TrendingUp size={20} />;
      case 'panic_sell': return <AlertTriangle size={20} className="fill-error-container" />;
      default: return <Lightbulb size={20} className="fill-secondary-container" />;
    }
  };

  const getColorClassForSeverity = (severity: string, type: string) => {
    if (type === 'panic_sell' || severity === 'high') {
      return 'bg-error-container text-on-error-container';
    }
    if (type === 'overtrading') {
      return 'bg-primary-container text-on-primary-container';
    }
    return 'bg-secondary-container text-on-secondary-container';
  };

  return (
    <div className="bg-background text-on-background min-h-screen pb-32 font-body-md antialiased">
      {/* TopAppBar */}
      <header className="w-full top-0 sticky bg-surface dark:bg-surface-dim shadow-sm dark:shadow-none border-b border-outline-variant dark:border-outline z-50">
        <div className="flex justify-between items-center h-14 px-4 transition-colors duration-200">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-surface-container-high flex items-center justify-center">
            <User className="text-on-surface-variant" size={20} />
          </div>
          <Header />
          <button className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant dark:text-on-surface-variant hover:bg-surface-container dark:hover:bg-surface-container-high transition-colors duration-200">
            <Bell size={24} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 max-w-3xl mx-auto">
        <div className="mb-6">
          <h2 className="font-headline-md text-primary mb-2">Alert History</h2>
          <p className="font-body-md text-on-surface-variant">Your recent behavioral nudges and safety alerts.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 size={40} className="animate-spin text-primary" />
          </div>
        ) : (
          <div className="relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-outline-variant before:to-transparent">
            {alerts.length === 0 ? (
              <p className="text-center text-on-surface-variant mt-8">No behavioral alerts found.</p>
            ) : (
              alerts.map((alert, index) => (
                <div key={alert.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group mb-8">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-background shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 ${getColorClassForSeverity(alert.severity, alert.type)}`}>
                    {getIconForType(alert.type)}
                  </div>
                  <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl bg-surface-container-lowest shadow-sm border border-outline-variant/50 hover:shadow-md transition-shadow duration-300">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-label-sm text-on-surface-variant">
                        {alert.date ? new Date(alert.date).toLocaleDateString() : 'Recent'}
                      </span>
                      <span className="px-2 py-1 bg-surface-container rounded font-label-sm text-primary capitalize">
                        {alert.type.replace('_', ' ')}
                      </span>
                    </div>
                    <h3 className="font-headline-sm text-on-surface mb-2">{alert.title}</h3>
                    <p className="font-body-md text-on-surface-variant mb-3">{alert.message}</p>
                    <div className="flex items-center text-secondary">
                      <CheckCircle size={16} className="mr-1" />
                      <span className="font-label-md">Outcome: Pending Review</span>
                    </div>
                    {alert.actionUrl && (
                      <button onClick={() => navigate(alert.actionUrl)} className="mt-3 text-primary font-label-md hover:underline">
                        Learn More →
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
            
            {/* Keeping one hardcoded historic item to show the timeline nature visually if mock is empty */}
            {alerts.length > 0 && (
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group mb-8">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-secondary-container text-on-secondary-container shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  <CheckCircle2 size={20} className="fill-secondary-container" />
                </div>
                <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl bg-surface-container-lowest shadow-sm border border-outline-variant/50 hover:shadow-md transition-shadow duration-300">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-label-sm text-on-surface-variant">Oct 24, 2023</span>
                    <span className="px-2 py-1 bg-surface-container rounded font-label-sm text-primary">Suitability Nudge</span>
                  </div>
                  <h3 className="font-headline-sm text-on-surface mb-2">High Risk Re-evaluation</h3>
                  <p className="font-body-md text-on-surface-variant mb-3">Suggested reviewing risk tolerance based on recent volatile trades.</p>
                  <div className="flex items-center text-secondary">
                    <CheckCircle size={16} className="mr-1" />
                    <span className="font-label-md">Outcome: Reviewed Profile</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
