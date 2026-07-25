import React from 'react';
import { ArrowLeft, CheckCircle, FileText, Globe, Phone, Mail, FileBadge, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function RegistryVerification() {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col bg-surface overflow-y-auto px-4 pt-4 pb-20">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-surface-container-low transition-colors">
          <ArrowLeft size={24} className="text-on-surface" />
        </button>
        <h1 className="font-headline-sm text-on-surface">Registry Details</h1>
      </div>

      <div className="bg-[#002653] text-white rounded-xl p-5 mb-4 shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="font-headline-md mb-1">AlphaTech Solutions</h2>
            <div className="inline-flex items-center gap-1 bg-[#2E8B57] text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
              <CheckCircle size={12} /> SEBI Registered
            </div>
          </div>
          <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
            <FileBadge size={24} className="text-white" />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 border-t border-white/20 pt-4 mt-2">
          <div>
            <p className="text-white/60 text-[10px] uppercase tracking-wider mb-1">Reg Number</p>
            <p className="font-label-md">INA000012345</p>
          </div>
          <div>
            <p className="text-white/60 text-[10px] uppercase tracking-wider mb-1">Type</p>
            <p className="font-label-md">Investment Advisor</p>
          </div>
          <div>
            <p className="text-white/60 text-[10px] uppercase tracking-wider mb-1">Valid Till</p>
            <p className="font-label-md">Perpetual</p>
          </div>
          <div>
            <p className="text-white/60 text-[10px] uppercase tracking-wider mb-1">Principal Officer</p>
            <p className="font-label-md">Anand V.</p>
          </div>
        </div>
      </div>

      <button 
        onClick={() => navigate('/trust/score')}
        className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex items-center justify-between shadow-sm mb-6 hover:bg-surface-container-low transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-secondary-container text-[#087347] flex items-center justify-center">
            <span className="font-bold">85</span>
          </div>
          <div className="text-left">
            <h3 className="font-label-md text-on-surface">Trust Score Available</h3>
            <p className="text-[11px] text-on-surface-variant">View detailed integrity analysis</p>
          </div>
        </div>
        <ArrowRight size={20} className="text-on-surface-variant" />
      </button>

      <h3 className="font-headline-sm text-on-surface mb-3">Contact Information</h3>
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-4 border-b border-surface-variant pb-4">
          <Globe className="text-on-surface-variant" size={20} />
          <div className="flex-1 text-sm font-label-md text-primary">www.alphatech-advisory.in</div>
        </div>
        <div className="flex items-center gap-4 border-b border-surface-variant pb-4">
          <Phone className="text-on-surface-variant" size={20} />
          <div className="flex-1 text-sm font-label-md text-on-surface">+91 22 4567 8900</div>
        </div>
        <div className="flex items-center gap-4 border-b border-surface-variant pb-4">
          <Mail className="text-on-surface-variant" size={20} />
          <div className="flex-1 text-sm font-label-md text-on-surface">compliance@alphatech.in</div>
        </div>
        <div className="flex items-start gap-4">
          <FileText className="text-on-surface-variant mt-1" size={20} />
          <div className="flex-1 text-sm font-label-md text-on-surface leading-snug">
            802, One BKC, C-Wing, G Block, Bandra Kurla Complex, Mumbai, Maharashtra 400051
          </div>
        </div>
      </div>
      
      <div className="mt-6 text-center">
        <p className="text-xs text-on-surface-variant max-w-[280px] mx-auto">
          Source: SEBI Official Intermediary Registry. Last synced today at 09:30 AM.
        </p>
      </div>
    </div>
  );
}
