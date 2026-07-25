import React from 'react';
import { ShieldCheck, ArrowLeft, Download, Trash2, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function PrivacyCenter() {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col bg-surface overflow-y-auto px-4 pt-4 pb-20">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-surface-container-low transition-colors">
          <ArrowLeft size={24} className="text-on-surface" />
        </button>
        <h1 className="font-headline-sm text-on-surface">Privacy Center</h1>
      </div>

      <div className="bg-[#E6F4EA] rounded-xl p-4 mb-6 flex gap-3 items-start border border-[#2E8B57]/20">
        <ShieldCheck className="text-[#0D532A] mt-0.5 flex-shrink-0" size={20} />
        <div>
          <h2 className="font-label-md text-[#0D532A] mb-1">DPDP Act Compliant</h2>
          <p className="font-body-md text-sm text-[#0D532A]/80 leading-relaxed">
            Your financial data is fetched via Account Aggregator. We do not sell your data. You have full control to download or delete it at any time.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Download className="text-primary" size={20} />
            </div>
            <div className="flex-1">
              <h3 className="font-label-md text-on-surface mb-1">Download My Data</h3>
              <p className="font-body-md text-xs text-on-surface-variant mb-4">
                Export a copy of all your financial holdings, AI simulations, and activity logs in JSON format.
              </p>
              <button className="font-label-md text-primary border border-primary/30 rounded-lg px-4 py-2 hover:bg-primary/5 transition-colors w-full">
                Request Archive
              </button>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-error/30 rounded-xl p-5 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-error/5 rounded-bl-full -z-10" />
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center flex-shrink-0">
              <Trash2 className="text-error" size={20} />
            </div>
            <div className="flex-1">
              <h3 className="font-label-md text-on-surface mb-1 text-error">Delete Account & Data</h3>
              <p className="font-body-md text-xs text-on-surface-variant mb-4">
                Permanently revoke Account Aggregator consent and erase all stored data from SahaVest servers.
              </p>
              <button className="font-label-md text-error border border-error/30 rounded-lg px-4 py-2 hover:bg-error/5 transition-colors w-full flex items-center justify-center gap-2">
                <ShieldAlert size={16} /> Delete My Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
