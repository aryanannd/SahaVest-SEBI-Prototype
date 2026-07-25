import React, { useState } from 'react';
import { Scale, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Grievance() {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="flex-1 flex flex-col bg-surface overflow-y-auto px-4 pt-4 pb-20">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-surface-container-low transition-colors">
          <ArrowLeft size={24} className="text-on-surface" />
        </button>
        <h1 className="font-headline-sm text-on-surface">File a Grievance</h1>
      </div>

      {!submitted ? (
        <div className="flex flex-col flex-1 animate-in fade-in duration-300">
          <div className="bg-[#FAECE7] rounded-xl p-4 mb-6 flex gap-3 items-start border border-error/20">
            <Scale className="text-[#4A1B0C] mt-0.5 flex-shrink-0" size={20} />
            <div>
              <h2 className="font-label-md text-[#4A1B0C] mb-1">SEBI SCORES Integration</h2>
              <p className="font-body-md text-sm text-[#4A1B0C]/80 leading-relaxed">
                This form submits your complaint directly to the SEBI Complaints Redress System (SCORES). We pre-fill your linked intermediary details to speed up the process.
              </p>
            </div>
          </div>

          <div className="space-y-4 mb-8 flex-1">
            <div>
              <label className="font-label-sm text-on-surface-variant uppercase tracking-wider mb-1.5 block">Against Intermediary</label>
              <select className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-3 font-body-md text-on-surface outline-none focus:border-primary">
                <option>Select an entity...</option>
                <option>Zerodha Broking Ltd. (Broker)</option>
                <option>HDFC Asset Management (AMC)</option>
                <option>Anand Financial Advisors (RIA)</option>
              </select>
            </div>
            
            <div>
              <label className="font-label-sm text-on-surface-variant uppercase tracking-wider mb-1.5 block">Category of Complaint</label>
              <select className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-3 font-body-md text-on-surface outline-none focus:border-primary">
                <option>Non-receipt of funds/securities</option>
                <option>Unauthorised trades</option>
                <option>Mis-selling / Poor advice</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <label className="font-label-sm text-on-surface-variant uppercase tracking-wider mb-1.5 block">Description</label>
              <textarea 
                rows={4}
                placeholder="Briefly describe the issue..."
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-3 font-body-md text-on-surface outline-none focus:border-primary resize-none"
              ></textarea>
            </div>
          </div>

          <button 
            onClick={() => setSubmitted(true)}
            className="w-full h-12 bg-primary text-on-primary font-label-md rounded-full shadow-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          >
            <Send size={18} /> Submit to SCORES
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center text-center py-10 animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 bg-[#E6F4EA] rounded-full flex items-center justify-center mb-6 shadow-sm">
            <CheckCircle2 className="text-[#0D532A]" size={40} />
          </div>
          <h2 className="font-headline-sm text-on-surface mb-2">Grievance Filed</h2>
          <p className="font-body-md text-on-surface-variant text-sm mb-6 max-w-[280px]">
            Your complaint has been securely transmitted to SEBI SCORES.
          </p>
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 w-full">
            <p className="text-[11px] text-on-surface-variant uppercase tracking-wider mb-1">SCORES Registration Number</p>
            <p className="font-mono text-primary font-bold tracking-widest text-lg">SEB-2610-8A9X</p>
          </div>
          <button 
            onClick={() => navigate('/dashboard')}
            className="mt-8 font-label-md text-primary h-11 px-6 rounded-full hover:bg-primary/5 transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      )}
    </div>
  );
}
