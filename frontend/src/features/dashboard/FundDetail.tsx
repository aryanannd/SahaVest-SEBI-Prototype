import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, CheckCircle2, AlertTriangle } from 'lucide-react';

export function FundDetail() {
  const { type } = useParams();
  const navigate = useNavigate();
  const risk = "Conservative"; // Mocked user risk

  const [stage, setStage] = useState("detail"); // detail, warning, confirmed
  
  const fund = type === "equity"
    ? { name: "Blue Chip Growth Equity", riskLevel: "High" }
    : { name: "Small Cap Opportunities Fund", riskLevel: "Very High" };

  const mismatch = risk === "Conservative" && (fund.riskLevel === "High" || fund.riskLevel === "Very High");

  const placeOrder = () => {
    if (mismatch && stage === "detail") { 
      setStage("warning"); 
      return; 
    }
    setStage("confirmed");
    // In a real app we'd log this simulated order to the audit trail
  };

  return (
    <div className="flex-1 flex flex-col bg-surface relative">
      {/* Top Bar */}
      <div className="flex items-center px-4 py-4 bg-primary text-on-primary">
        <button onClick={() => navigate(-1)} className="p-1 -ml-1 mr-2 rounded-full hover:bg-surface-container-low/20 transition-colors">
          <ChevronLeft size={24} />
        </button>
        <span className="font-headline-sm flex-1 truncate">{fund.name}</span>
      </div>

      <div className="flex-1 px-4 pt-6 overflow-y-auto pb-20">
        <div className="rounded-xl p-4 mb-6 bg-surface-container-lowest border border-outline-variant shadow-sm flex flex-col gap-4">
          <div className="flex justify-between items-center pb-4 border-b border-outline-variant/50">
            <p className="font-label-sm text-on-surface-variant uppercase tracking-wider">Risk level</p>
            <p className={`font-label-md ${fund.riskLevel.includes("Very") ? 'text-error' : 'text-on-surface'}`}>
              {fund.riskLevel}
            </p>
          </div>
          <div className="flex justify-between items-center">
            <p className="font-label-sm text-on-surface-variant uppercase tracking-wider">Your risk profile</p>
            <p className="font-label-md text-primary">{risk}</p>
          </div>
        </div>

        {stage === "confirmed" ? (
          <div className="rounded-xl p-6 flex flex-col items-center gap-3 bg-secondary-container/20 border border-secondary-container">
            <CheckCircle2 className="text-secondary" size={40} />
            <p className="font-headline-sm text-on-secondary-container text-center">Order simulated successfully</p>
            <p className="font-body-md text-on-secondary-container/80 text-center text-sm">
              Logged to your audit trail. Real execution requires linking a broker — coming in a later phase.
            </p>
            <button 
              onClick={() => navigate('/dashboard')}
              className="mt-4 w-full h-[48px] bg-secondary text-on-secondary rounded-full font-label-md transition-transform active:scale-[0.98]"
            >
              Back to Dashboard
            </button>
          </div>
        ) : (
          <button 
            onClick={placeOrder} 
            className="w-full h-[56px] bg-primary text-on-primary rounded-full font-headline-sm transition-transform active:scale-[0.98] shadow-sm"
          >
            Invest ₹5,000 (simulated)
          </button>
        )}
      </div>

      {/* Warning Overlay */}
      {stage === "warning" && (
        <div className="absolute inset-0 z-50 flex flex-col justify-end px-4 pb-6 bg-[#0B2545]/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="rounded-2xl p-6 bg-surface-container-lowest shadow-xl animate-in slide-in-from-bottom-8 duration-300">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="text-[#F5A623] shrink-0 mt-0.5" size={24} />
              <div>
                <p className="font-headline-sm text-primary mb-1">Suitability mismatch</p>
                <p className="font-body-md text-on-surface-variant text-sm leading-relaxed">
                  Your risk profile is <span className="font-semibold text-on-surface">{risk}</span>, but this fund is <span className="font-semibold text-on-surface">{fund.riskLevel}</span> risk. Funds like this have historically shown 25–40% drawdowns in bad years.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col gap-3 mt-6">
              <button 
                onClick={() => setStage("confirmed")}
                className="w-full h-[56px] bg-[#F5A623] text-[#412402] rounded-xl font-label-md transition-transform active:scale-[0.98] shadow-sm"
              >
                I understand the risk, proceed
              </button>
              <button 
                onClick={() => setStage("detail")} 
                className="w-full h-[56px] bg-surface-container-low text-on-surface-variant border border-outline-variant rounded-xl font-label-md transition-transform active:scale-[0.98]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
