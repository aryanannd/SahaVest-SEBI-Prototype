import React, { useState } from 'react';
import { ShieldAlert, CheckCircle, Search, UploadCloud, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function ScamChecker() {
  const [tip, setTip] = useState('');
  const [result, setResult] = useState<'idle' | 'loading' | 'scam'>('idle');
  const navigate = useNavigate();

  const handleCheck = () => {
    if (!tip) return;
    setResult('loading');
    setTimeout(() => {
      setResult('scam');
    }, 1500);
  };

  return (
    <div className="flex-1 flex flex-col bg-surface overflow-y-auto px-4 pt-4 pb-20">
      {result !== 'scam' && (
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/dashboard')} className="p-2 -ml-2 rounded-full hover:bg-surface-container-low transition-colors">
            <ArrowLeft size={24} className="text-on-surface" />
          </button>
          <h1 className="font-headline-sm text-on-surface">Scam Tip Checker</h1>
        </div>
      )}

      {result === 'idle' && (
        <div className="flex flex-col gap-6 animate-in fade-in">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-error-container text-on-error-container flex items-center justify-center">
                <ShieldAlert size={20} />
              </div>
              <h2 className="font-headline-sm text-on-surface">Verify a tip</h2>
            </div>
            <p className="font-body-md text-on-surface-variant text-sm mb-4">
              Got a WhatsApp message or SMS promising high returns? Paste it below to check for red flags.
            </p>
            
            <textarea 
              value={tip}
              onChange={(e) => setTip(e.target.value)}
              placeholder="e.g. Guaranteed 200% returns in 3 days! Join VIP group now..."
              className="w-full bg-surface-container p-4 rounded-xl border border-outline-variant focus:border-primary outline-none min-h-[120px] resize-none mb-4 font-body-md"
            />
            
            <div className="flex gap-3">
              <button 
                onClick={handleCheck}
                className="flex-1 bg-primary text-on-primary font-label-md py-3 rounded-full flex items-center justify-center gap-2 transition-transform active:scale-95"
              >
                <Search size={18} /> Analyze Tip
              </button>
              <button className="w-12 h-12 bg-surface-container-high text-on-surface border border-outline-variant rounded-full flex items-center justify-center transition-transform active:scale-95">
                <UploadCloud size={20} />
              </button>
            </div>
          </div>
          
          <button 
            onClick={() => navigate('/trust/advisor')}
            className="bg-secondary-container text-on-secondary-container border border-secondary/20 rounded-xl p-5 flex items-center justify-between shadow-sm hover:bg-secondary-container/80 transition-colors"
          >
            <div>
              <h3 className="font-headline-sm">Verify an Advisor</h3>
              <p className="font-label-sm mt-1 opacity-80">Check SEBI registration</p>
            </div>
            <Search size={24} />
          </button>
        </div>
      )}

      {result === 'loading' && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 border-4 border-outline-variant border-t-primary rounded-full animate-spin" />
          <p className="font-headline-sm text-on-surface">Analyzing for red flags...</p>
        </div>
      )}

      {result === 'scam' && (
        <div className="flex flex-col gap-6 animate-in slide-in-from-bottom-4">
          <div className="flex items-center gap-3 mb-2">
            <button onClick={() => setResult('idle')} className="p-2 -ml-2 rounded-full hover:bg-surface-container-low transition-colors">
              <ArrowLeft size={24} className="text-on-surface" />
            </button>
            <h1 className="font-headline-sm text-on-surface">Analysis Result</h1>
          </div>
          
          <div className="bg-[#FAECE7] border border-error-container rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-4 border-b border-error/20 pb-4">
              <AlertTriangle className="text-error" size={32} />
              <h2 className="font-display-lg-mobile text-error text-2xl">HIGH RISK</h2>
            </div>
            
            <p className="font-body-md text-[#4A1B0C] mb-4">We found multiple red flags in this message:</p>
            
            <ul className="space-y-3 mb-6">
              <li className="flex gap-3">
                <AlertTriangle className="text-error mt-0.5 flex-shrink-0" size={18} />
                <span className="font-body-md text-sm text-[#4A1B0C]"><strong>Guaranteed-return language:</strong> SEBI-registered advisors cannot guarantee returns.</span>
              </li>
              <li className="flex gap-3">
                <AlertTriangle className="text-error mt-0.5 flex-shrink-0" size={18} />
                <span className="font-body-md text-sm text-[#4A1B0C]"><strong>Urgency/pressure phrasing:</strong> Tactics designed to make you act without thinking.</span>
              </li>
              <li className="flex gap-3">
                <AlertTriangle className="text-error mt-0.5 flex-shrink-0" size={18} />
                <span className="font-body-md text-sm text-[#4A1B0C]"><strong>Unregistered entity:</strong> Advisor name not found in SEBI registry.</span>
              </li>
            </ul>
            
            <div className="bg-white/60 p-4 rounded-lg flex gap-3">
              <ShieldAlert className="text-[#4A1B0C] flex-shrink-0" size={20} />
              <p className="font-label-md text-[#4A1B0C]">Do not click any links or transfer money based on this tip. You can report this to SCORES.</p>
            </div>
          </div>
          
          <div className="flex flex-col gap-3">
            <button onClick={() => navigate('/grievance', { state: { source: 'scam_check', tip } })} className="bg-surface-container text-on-surface font-label-md py-3 rounded-full border border-outline-variant transition-transform active:scale-95">
              Report to SCORES
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
