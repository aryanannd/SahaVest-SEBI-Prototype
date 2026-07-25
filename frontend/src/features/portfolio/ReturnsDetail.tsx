import React from 'react';
import { ArrowUpRight, Activity, PieChart, Diamond, Globe, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function ReturnsDetail() {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col bg-surface overflow-y-auto px-4 pt-6 pb-20">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/portfolio')} className="p-2 -ml-2 rounded-full hover:bg-surface-container-low transition-colors">
          <ArrowLeft size={24} className="text-on-surface" />
        </button>
        <div>
          <h1 className="font-display-lg-mobile text-on-surface mb-1">XIRR & Returns</h1>
          <p className="font-body-md text-on-surface-variant text-sm">Detailed performance breakdown.</p>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 mb-6 relative overflow-hidden shadow-sm">
        <div className="flex flex-col gap-1 mb-4">
          <span className="font-label-sm text-on-surface-variant uppercase tracking-wider">Total Portfolio XIRR</span>
          <div className="flex items-center gap-2">
            <span className="font-display-lg-mobile text-secondary">14.82%</span>
            <ArrowUpRight className="text-secondary" size={24} />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <span className="font-label-sm text-on-surface-variant uppercase tracking-wider">Absolute Returns</span>
          <div className="font-headline-md text-secondary">+₹3,42,890</div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {/* Equity */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 shadow-sm">
          <div className="flex items-center gap-3 border-b border-surface-variant pb-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-[#d7e3ff] flex items-center justify-center text-[#001b3f]">
              <Activity size={20} />
            </div>
            <h3 className="font-headline-sm text-on-surface">Direct Equity</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-label-sm text-on-surface-variant">XIRR</p>
              <p className="font-headline-sm text-secondary">18.4%</p>
            </div>
            <div>
              <p className="font-label-sm text-on-surface-variant">Absolute</p>
              <p className="font-body-lg text-secondary">+₹2,10,400</p>
            </div>
          </div>
        </div>

        {/* Mutual Funds */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 shadow-sm">
          <div className="flex items-center gap-3 border-b border-surface-variant pb-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-[#ffddb8] flex items-center justify-center text-[#2a1700]">
              <PieChart size={20} />
            </div>
            <h3 className="font-headline-sm text-on-surface">Mutual Funds</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-label-sm text-on-surface-variant">XIRR</p>
              <p className="font-headline-sm text-secondary">12.1%</p>
            </div>
            <div>
              <p className="font-label-sm text-on-surface-variant">Absolute</p>
              <p className="font-body-lg text-secondary">+₹1,45,600</p>
            </div>
          </div>
        </div>

        {/* SGB */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 shadow-sm">
          <div className="flex items-center gap-3 border-b border-surface-variant pb-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-[#405e92]/20 flex items-center justify-center text-[#405e92]">
              <Diamond size={20} />
            </div>
            <h3 className="font-headline-sm text-on-surface">Digital Gold (SGB)</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-label-sm text-on-surface-variant">XIRR</p>
              <p className="font-headline-sm text-secondary">8.5%</p>
            </div>
            <div>
              <p className="font-label-sm text-on-surface-variant">Absolute</p>
              <p className="font-body-lg text-secondary">+₹12,450</p>
            </div>
          </div>
        </div>

        {/* Int. Equity */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 shadow-sm">
          <div className="flex items-center gap-3 border-b border-surface-variant pb-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-error-container flex items-center justify-center text-on-error-container">
              <Globe size={20} />
            </div>
            <h3 className="font-headline-sm text-on-surface">International Equity</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-label-sm text-on-surface-variant">XIRR</p>
              <p className="font-headline-sm text-error">-4.2%</p>
            </div>
            <div>
              <p className="font-label-sm text-on-surface-variant">Absolute</p>
              <p className="font-body-lg text-error">-₹25,560</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
