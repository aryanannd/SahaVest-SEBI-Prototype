import React from 'react';
import { FileKey, FileCheck, ArrowLeft, Info, Server } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function AuditTrail() {
  const navigate = useNavigate();

  const logs = [
    {
      id: 1,
      date: "Oct 24, 2026, 09:41 AM",
      action: "Pre-Trade Suitability Nudge",
      description: "User warned about concentration risk before HDFC MF trade intent.",
      hash: "0x8f4a...3b92",
      status: "Verified on Ledger"
    },
    {
      id: 2,
      date: "Oct 22, 2026, 02:15 PM",
      action: "Tax Optimization Simulation",
      description: "User ran ELSS tax-saving simulator.",
      hash: "0x2c1d...8f11",
      status: "Verified on Ledger"
    },
    {
      id: 3,
      date: "Oct 20, 2026, 11:30 AM",
      action: "Chat Assistant Query",
      description: "Response generated for query about Sovereign Gold Bonds.",
      hash: "0x5e9b...1a4c",
      status: "Verified on Ledger"
    }
  ];

  return (
    <div className="flex-1 flex flex-col bg-surface overflow-y-auto px-4 pt-4 pb-20">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-surface-container-low transition-colors">
          <ArrowLeft size={24} className="text-on-surface" />
        </button>
        <h1 className="font-headline-sm text-on-surface">Audit Trail</h1>
      </div>

      <div className="bg-primary-container rounded-xl p-4 mb-6 flex gap-3 items-start">
        <Server className="text-primary mt-0.5 flex-shrink-0" size={20} />
        <div>
          <h2 className="font-label-md text-primary mb-1">Blockchain Verified</h2>
          <p className="font-body-md text-sm text-on-primary-container leading-relaxed">
            For your protection and SEBI compliance, every AI recommendation and suitability nudge is permanently hashed to a secure, permissioned ledger.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {logs.map((log) => (
          <div key={log.id} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <span className="font-label-md text-on-surface">{log.action}</span>
              <span className="text-[10px] bg-[#E6F4EA] text-[#0D532A] px-2 py-0.5 rounded font-medium flex items-center gap-1">
                <FileCheck size={10} /> {log.status}
              </span>
            </div>
            <p className="font-body-md text-sm text-on-surface-variant mb-3">{log.description}</p>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-on-surface-variant/70">{log.date}</span>
              <div className="flex items-center gap-1 text-primary bg-primary/5 px-2 py-1 rounded font-mono">
                <FileKey size={12} /> {log.hash}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
