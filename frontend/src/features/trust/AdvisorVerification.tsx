import React, { useState } from 'react';
import { Search, ShieldCheck, UserCheck, ShieldAlert, ArrowLeft, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function AdvisorVerification() {
  const [regNo, setRegNo] = useState('');
  const [result, setResult] = useState<'idle' | 'loading' | 'success' | 'fail'>('idle');
  const navigate = useNavigate();

  const handleVerify = () => {
    if (!regNo) return;
    setResult('loading');
    setTimeout(() => {
      // Mock logic: if starts with INA, success, else fail
      if (regNo.toUpperCase().startsWith('INA')) {
        setResult('success');
      } else {
        setResult('fail');
      }
    }, 1500);
  };

  return (
    <div className="flex-1 flex flex-col bg-surface overflow-y-auto px-4 pt-4 pb-20">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-surface-container-low transition-colors">
          <ArrowLeft size={24} className="text-on-surface" />
        </button>
        <h1 className="font-headline-sm text-on-surface">Verify an Advisor</h1>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm mb-6">
        <p className="font-body-md text-on-surface-variant text-sm mb-4">
          Check if an advisor or research analyst is registered with SEBI. Always verify before paying any advisory fees.
        </p>
        
        <div className="relative mb-4">
          <input 
            type="text" 
            value={regNo}
            onChange={(e) => setRegNo(e.target.value)}
            placeholder="e.g. INA000000000"
            className="w-full bg-surface-container py-3 pl-4 pr-12 rounded-xl border border-outline-variant focus:border-primary outline-none font-body-md uppercase"
          />
          <button 
            onClick={handleVerify}
            className="absolute right-2 top-2 p-1.5 bg-primary text-on-primary rounded-lg transition-transform active:scale-95"
          >
            <Search size={18} />
          </button>
        </div>
      </div>

      {result === 'loading' && (
        <div className="flex flex-col items-center justify-center gap-4 py-8">
          <div className="w-8 h-8 border-4 border-outline-variant border-t-primary rounded-full animate-spin" />
          <p className="font-label-md text-on-surface-variant">Checking SEBI Registry...</p>
        </div>
      )}

      {result === 'success' && (
        <div className="bg-[#E6F4EA] border border-[#2E8B57] rounded-xl p-5 shadow-sm animate-in slide-in-from-bottom-4">
          <div className="flex items-center gap-3 mb-3 border-b border-[#2E8B57]/20 pb-3">
            <ShieldCheck className="text-[#2E8B57]" size={28} />
            <h2 className="font-headline-sm text-[#0D532A]">Verified Advisor</h2>
          </div>
          
          <div className="space-y-3">
            <div>
              <p className="text-[11px] text-[#0D532A]/70 uppercase tracking-wider">Registration Number</p>
              <p className="font-label-md text-[#0D532A]">{regNo.toUpperCase()}</p>
            </div>
            <div>
              <p className="text-[11px] text-[#0D532A]/70 uppercase tracking-wider">Status</p>
              <div className="inline-flex items-center gap-1 bg-[#2E8B57] text-white px-2 py-0.5 rounded text-xs font-medium">
                <CheckCircle size={12} /> Active
              </div>
            </div>
          </div>
        </div>
      )}

      {result === 'fail' && (
        <div className="bg-[#FAECE7] border border-error-container rounded-xl p-5 shadow-sm animate-in slide-in-from-bottom-4">
          <div className="flex items-center gap-3 mb-3 border-b border-error/20 pb-3">
            <ShieldAlert className="text-error" size={28} />
            <h2 className="font-headline-sm text-[#4A1B0C]">Not Found in Registry</h2>
          </div>
          
          <p className="font-body-md text-sm text-[#4A1B0C] mb-3">
            We could not find the registration number <strong className="uppercase">{regNo}</strong> in the SEBI intermediary registry.
          </p>
          <p className="font-label-md text-error text-sm">
            Caution: Dealing with unregistered entities carries high risk of fraud.
          </p>
        </div>
      )}
    </div>
  );
}


