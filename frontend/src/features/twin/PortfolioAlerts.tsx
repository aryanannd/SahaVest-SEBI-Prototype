import React, { useEffect, useState } from 'react';
import { AlertTriangle, X, ShieldCheck, Lightbulb, Info, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function PortfolioAlerts() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [alertData, setAlertData] = useState<{
    totalValue: number;
    flags: string[];
    sectorBreakdown: any[];
  } | null>(null);

  useEffect(() => {
    fetch('http://localhost:3000/api/portfolio/exposure/me')
      .then(res => res.json())
      .then(data => {
        setAlertData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="bg-surface text-on-surface font-body-md h-screen w-full flex items-center justify-center">
        <Loader2 size={48} className="animate-spin text-primary" />
      </div>
    );
  }

  // Determine what to show based on flags
  const hasConcentrationRisk = alertData && alertData.flags && alertData.flags.length > 0;
  
  // If no risk, just show an all clear state, but for the UI's sake, we might parse the first flag
  const mainAlert = hasConcentrationRisk ? alertData.flags[0] : "Your portfolio is well diversified.";
  
  // Parse something like "High Sector Concentration: Banking makes up 45.0% of your portfolio."
  const isHighSector = mainAlert.includes("High Sector Concentration");
  const isHighHolding = mainAlert.includes("High Holding Concentration");
  
  // Extract percentage from string if possible (e.g. 45.0%)
  const pctMatch = mainAlert.match(/([\d.]+)%/);
  const percentageStr = pctMatch ? pctMatch[1] : (hasConcentrationRisk ? "40" : "15");
  const percentageNum = parseFloat(percentageStr);

  return (
    <div className="bg-surface text-on-surface font-body-md h-screen w-full flex flex-col overflow-hidden">
      {/* Scrim / Overlay for Modal Context */}
      <div className="fixed inset-0 bg-inverse-surface/60 backdrop-blur-sm z-40 flex items-center justify-center p-4 md:p-8">
        
        {/* Main Alert Modal */}
        <main className="w-full max-w-3xl bg-surface-container-lowest rounded-xl shadow-lg border border-outline-variant z-50 flex flex-col max-h-full overflow-hidden animate-in fade-in zoom-in-95 duration-300">
          
          {/* Modal Header */}
          <header className="flex items-center justify-between p-6 border-b border-surface-variant bg-surface-container-lowest sticky top-0">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${hasConcentrationRisk ? 'bg-tertiary-fixed text-on-tertiary-fixed' : 'bg-secondary-container text-on-secondary-container'}`}>
                {hasConcentrationRisk ? (
                  <AlertTriangle size={24} className="fill-current" strokeWidth={1.5} />
                ) : (
                  <ShieldCheck size={24} className="fill-current" strokeWidth={1.5} />
                )}
              </div>
              <div>
                <h1 className="font-headline-sm text-on-surface">Portfolio Check-in</h1>
                <p className="font-label-md text-on-surface-variant">
                  {hasConcentrationRisk ? 'Concentration Alert' : 'All Clear'}
                </p>
              </div>
            </div>
            <button onClick={() => navigate(-1)} aria-label="Close alert" className="w-[44px] h-[44px] flex items-center justify-center rounded-full hover:bg-surface-container-low transition-colors text-on-surface-variant">
              <X size={24} />
            </button>
          </header>

          {/* Modal Body */}
          <div className="overflow-y-auto p-6 flex flex-col gap-6">
            
            {/* Primary Insight Card */}
            <div className="bg-surface rounded-lg p-6 border border-surface-variant flex flex-col md:flex-row gap-6 items-start">
              {/* CSS Donut Chart */}
              <div className="relative w-32 h-32 flex-shrink-0 mx-auto md:mx-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path className="text-surface-variant" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                  <path className={`${hasConcentrationRisk ? 'text-on-tertiary-container' : 'text-secondary'}`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray={`${percentageNum}, 100`} strokeWidth="4" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="font-headline-md text-on-surface">{percentageNum}%</span>
                </div>
              </div>

              <div className="flex-1 space-y-3">
                <h2 className="font-headline-sm text-on-surface">
                  {hasConcentrationRisk 
                    ? (isHighHolding ? "High Holding Concentration" : "High Sector Exposure") 
                    : "Optimal Diversification"}
                </h2>
                <p className="font-body-md text-on-surface-variant">
                  {mainAlert}
                </p>
                {hasConcentrationRisk && (
                  <button className="inline-flex items-center gap-1 font-label-md text-primary hover:text-primary-container transition-colors mt-3">
                    <Info size={18} />
                    Learn why this matters
                  </button>
                )}
              </div>
            </div>

            {hasConcentrationRisk && (
              <>
                {/* Bento Grid for Details & Action */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-surface-container-low rounded-lg p-4 border border-surface-variant flex flex-col gap-3">
                    <h3 className="font-label-sm uppercase text-on-surface-variant tracking-wider">Current Allocation</h3>
                    <div className="flex justify-between items-baseline">
                      <span className="font-headline-md text-on-surface">{percentageNum}%</span>
                    </div>
                    <div className="w-full bg-surface-variant rounded-full h-2 mt-auto">
                      <div className="bg-on-tertiary-container h-2 rounded-full" style={{ width: `${percentageNum}%` }}></div>
                    </div>
                  </div>

                  <div className="bg-surface-container-lowest border-l-4 border-l-secondary rounded-r-lg p-4 shadow-sm flex flex-col gap-3">
                    <h3 className="font-label-sm uppercase text-on-surface-variant tracking-wider">Guided Target</h3>
                    <div className="flex justify-between items-baseline">
                      <span className="font-headline-md text-on-surface">&lt; {isHighSector ? '30%' : '20%'}</span>
                      <span className="font-label-md text-secondary flex items-center gap-1">
                        <ShieldCheck size={16} />
                        Recommended
                      </span>
                    </div>
                    <p className="font-label-md text-on-surface-variant mt-auto">
                      Most robust portfolios cap exposure to maintain stability across market cycles.
                    </p>
                  </div>
                </div>

                {/* Educational Nudge */}
                <div className="bg-primary-fixed rounded-lg p-4 flex items-start gap-4">
                  <div className="mt-1 text-primary-container shrink-0">
                    <Lightbulb size={24} className="fill-primary-container" />
                  </div>
                  <div>
                    <h4 className="font-label-md text-primary-container font-semibold mb-1">Diversification Step</h4>
                    <p className="font-body-md text-on-primary-fixed-variant text-sm">
                      You don't need to sell immediately. Consider directing future investments into other sectors or broad-market index funds to naturally dilute this concentration over time.
                    </p>
                  </div>
                </div>
              </>
            )}

          </div>

          {/* Modal Footer */}
          <footer className="p-6 border-t border-surface-variant bg-surface-container-lowest flex flex-col md:flex-row gap-3 md:justify-end">
            <button onClick={() => navigate(-1)} className="min-h-[48px] px-6 rounded-full font-label-md text-primary bg-transparent hover:bg-surface-container-low transition-colors border border-outline-variant md:border-none w-full md:w-auto">
              Acknowledge
            </button>
            {hasConcentrationRisk && (
              <button onClick={() => navigate('/portfolio')} className="min-h-[48px] px-6 rounded-full font-label-md text-on-primary bg-primary hover:bg-primary-container transition-colors shadow-sm w-full md:w-auto">
                Explore Diversification Options
              </button>
            )}
          </footer>
        </main>
      </div>
    </div>
  );
}
