import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Bell, Lightbulb, CheckCircle2, AlertTriangle, CheckCheck, TrendingUp, PieChart, Search, Shield } from "lucide-react";

interface AlertData {
  id: string;
  type: string;
  severity: string;
  title: string;
  message: string;
  timestamp: string;
  actionUrl: string;
}

export function BehavioralAlertCenter() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/trust/alerts')
      .then(res => res.json())
      .then(data => {
        if (data.alerts) {
          setAlerts(data.alerts);
        }
      })
      .catch(err => console.error("Failed to fetch alerts:", err))
      .finally(() => setLoading(false));
  }, []);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'overtrading': return <TrendingUp size={20} />;
      case 'panic_sell': return <AlertTriangle size={20} />;
      default: return <Lightbulb size={20} />;
    }
  };

  const getAlertColors = (severity: string) => {
    switch (severity) {
      case 'high': return { bg: 'bg-error-container', text: 'text-on-error-container', pill: 'bg-error/10 text-error' };
      case 'medium': return { bg: 'bg-secondary-container', text: 'text-on-secondary-container', pill: 'bg-surface-container text-primary' };
      default: return { bg: 'bg-primary-container', text: 'text-on-primary-container', pill: 'bg-surface-container text-primary' };
    }
  };

  return (
    <div className="bg-background text-on-background min-h-screen pb-32 font-body-md antialiased">
      {/* TopAppBar */}
      <header className="w-full top-0 sticky bg-surface dark:bg-surface-dim shadow-sm dark:shadow-none border-b border-outline-variant dark:border-outline z-50">
        <div className="flex justify-between items-center h-14 px-4 transition-colors duration-200">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-surface-container-high flex items-center justify-center cursor-pointer" onClick={() => navigate('/profile')}>
            <User size={20} className="text-on-surface-variant" />
          </div>
          <h1 className="font-display-lg-mobile font-bold text-primary dark:text-primary-fixed-dim cursor-pointer" onClick={() => navigate('/')}>
            SahaVest
          </h1>
          <button className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container dark:hover:bg-surface-container-high transition-colors duration-200">
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

        {/* Vertical Timeline List */}
        <div className="relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-outline-variant before:to-transparent">
          
          {loading ? (
            <div className="text-center text-on-surface-variant">Loading insights...</div>
          ) : alerts.length > 0 ? (
            alerts.map((alert, index) => {
              const colors = getAlertColors(alert.severity);
              const dateStr = new Date(alert.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
              
              return (
                <div key={alert.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active mb-8">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-background ${colors.bg} ${colors.text} shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10`}>
                    {getAlertIcon(alert.type)}
                  </div>
                  
                  <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl bg-surface-container-lowest shadow-sm border border-outline-variant/50 hover:shadow-md transition-shadow duration-300">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-label-sm text-on-surface-variant">{dateStr}</span>
                      <span className={`px-2 py-1 rounded font-label-sm ${colors.pill}`}>{alert.type.replace('_', ' ').toUpperCase()}</span>
                    </div>
                    <h3 className="font-headline-sm text-on-surface mb-2">{alert.title}</h3>
                    <p className="font-body-md text-on-surface-variant mb-3">{alert.message}</p>
                    <div className="flex items-center text-on-surface-variant">
                      <CheckCheck size={16} className="mr-1" />
                      <span className="font-label-md">Outcome: Pending Action</span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center text-on-surface-variant">No alerts at this time.</div>
          )}

          {/* Fallback Static Alert just to show timeline layout if alerts are empty or few */}
          <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active mb-8">
            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-secondary-container text-on-secondary-container shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
              <Lightbulb size={20} />
            </div>
            <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl bg-surface-container-lowest shadow-sm border border-outline-variant/50 hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center justify-between mb-3">
                <span className="font-label-sm text-on-surface-variant">Oct 24, 2023</span>
                <span className="px-2 py-1 bg-surface-container rounded font-label-sm text-primary">Suitability Nudge</span>
              </div>
              <h3 className="font-headline-sm text-on-surface mb-2">High Risk Re-evaluation</h3>
              <p className="font-body-md text-on-surface-variant mb-3">Suggested reviewing risk tolerance based on recent volatile trades.</p>
              <div className="flex items-center text-secondary">
                <CheckCircle2 size={16} className="mr-1" />
                <span className="font-label-md">Outcome: Reviewed Profile</span>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* BottomNavBar */}
      <nav className="md:hidden fixed bottom-0 w-full z-50 bg-surface-container-lowest dark:bg-inverse-surface border-t border-outline-variant dark:border-outline shadow-lg dark:shadow-none pb-safe">
        <div className="flex justify-around items-center h-16 w-full px-2">
          <button onClick={() => navigate('/portfolio')} className="flex flex-col items-center justify-center text-on-surface-variant px-4 py-1 hover:bg-surface-container active:scale-95 transition-transform duration-150 rounded-full w-[min-content] min-w-[64px]">
            <PieChart size={24} className="mb-1" />
            <span className="font-label-sm truncate">Portfolio</span>
          </button>
          <button onClick={() => navigate('/explore')} className="flex flex-col items-center justify-center text-on-surface-variant px-4 py-1 hover:bg-surface-container active:scale-95 transition-transform duration-150 rounded-full w-[min-content] min-w-[64px]">
            <Search size={24} className="mb-1" />
            <span className="font-label-sm truncate">Explore</span>
          </button>
          <button onClick={() => navigate('/protection')} className="flex flex-col items-center justify-center bg-secondary-container text-on-secondary-container rounded-full px-4 py-1 active:scale-95 transition-transform duration-150 w-[min-content] min-w-[64px]">
            <Shield size={24} className="mb-1" fill="currentColor" />
            <span className="font-label-sm truncate">Shield</span>
          </button>
          <button onClick={() => navigate('/profile')} className="flex flex-col items-center justify-center text-on-surface-variant px-4 py-1 hover:bg-surface-container active:scale-95 transition-transform duration-150 rounded-full w-[min-content] min-w-[64px]">
            <User size={24} className="mb-1" />
            <span className="font-label-sm truncate">Profile</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
