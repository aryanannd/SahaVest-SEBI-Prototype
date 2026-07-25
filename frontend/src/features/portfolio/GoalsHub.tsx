import React from 'react';
import { Target, Home, ShieldPlus, ArrowUpRight, Plus, MoreVertical } from 'lucide-react';

export function GoalsHub() {
  return (
    <div className="flex-1 flex flex-col bg-surface overflow-y-auto px-4 pt-6 pb-20">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="font-display-lg-mobile text-primary mb-1">Your Financial Goals</h2>
          <p className="font-body-md text-on-surface-variant max-w-[280px]">Track and manage the milestones that matter.</p>
        </div>
        <button className="bg-primary text-on-primary rounded-full w-10 h-10 flex flex-shrink-0 items-center justify-center transition-colors active:scale-95 shadow-sm">
          <Plus size={24} />
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {/* Goal 1 */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 flex flex-col gap-4 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center">
                <Target size={20} />
              </div>
              <h3 className="font-headline-sm text-on-surface">Retirement Fund</h3>
            </div>
            <button className="text-outline hover:text-on-surface-variant">
              <MoreVertical size={20} />
            </button>
          </div>
          
          <div>
            <div className="flex justify-between items-end mb-2">
              <span className="font-headline-md text-primary">₹ 45L</span>
              <span className="font-label-md text-on-surface-variant">of ₹ 2Cr</span>
            </div>
            <div className="w-full bg-surface-container-high rounded-full h-2 mb-3 overflow-hidden">
              <div className="bg-primary h-2 rounded-full" style={{ width: '22.5%' }} />
            </div>
            <div className="flex justify-between items-center">
              <span className="font-label-sm text-secondary flex items-center gap-1">
                <ArrowUpRight size={16} /> On Track
              </span>
              <span className="font-label-sm text-on-surface-variant">
                Target: 2045
              </span>
            </div>
          </div>
        </div>

        {/* Goal 2 */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 flex flex-col gap-4 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center">
                <Home size={20} />
              </div>
              <h3 className="font-headline-sm text-on-surface">House Down Payment</h3>
            </div>
            <button className="text-outline hover:text-on-surface-variant">
              <MoreVertical size={20} />
            </button>
          </div>
          
          <div>
            <div className="flex justify-between items-end mb-2">
              <span className="font-headline-md text-primary">₹ 12.5L</span>
              <span className="font-label-md text-on-surface-variant">of ₹ 20L</span>
            </div>
            <div className="w-full bg-surface-container-high rounded-full h-2 mb-3 overflow-hidden">
              <div className="bg-secondary h-2 rounded-full" style={{ width: '62.5%' }} />
            </div>
            <div className="flex justify-between items-center">
              <span className="font-label-sm text-secondary flex items-center gap-1">
                <ArrowUpRight size={16} /> Ahead
              </span>
              <span className="font-label-sm text-on-surface-variant">
                Target: 2026
              </span>
            </div>
          </div>
        </div>

        {/* Goal 3 */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 flex flex-col gap-4 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#ffddb8] text-[#573500] flex items-center justify-center">
                <ShieldPlus size={20} />
              </div>
              <h3 className="font-headline-sm text-on-surface">Emergency Fund</h3>
            </div>
            <button className="text-outline hover:text-on-surface-variant">
              <MoreVertical size={20} />
            </button>
          </div>
          
          <div>
            <div className="flex justify-between items-end mb-2">
              <span className="font-headline-md text-primary">₹ 5L</span>
              <span className="font-label-md text-on-surface-variant">of ₹ 5L</span>
            </div>
            <div className="w-full bg-surface-container-high rounded-full h-2 mb-3 overflow-hidden">
              <div className="bg-[#e89500] h-2 rounded-full" style={{ width: '100%' }} />
            </div>
            <div className="flex justify-between items-center">
              <span className="font-label-sm text-secondary flex items-center gap-1">
                Completed
              </span>
              <span className="font-label-sm text-on-surface-variant">
                Target: Achieved
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
