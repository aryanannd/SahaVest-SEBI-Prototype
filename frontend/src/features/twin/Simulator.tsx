import React, { useState, useMemo } from 'react';
import { Activity, Play, ArrowLeft } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';

export function Simulator() {
  const [sip, setSip] = useState(25000);
  const [years, setYears] = useState(15);
  const [rate, setRate] = useState(12);
  const [simulated, setSimulated] = useState(false);

  const navigate = useNavigate();

  const data = useMemo(() => {
    let current = 1450000;
    const pts = [];
    for (let i = 0; i <= years; i++) {
      pts.push({ year: i, value: Math.round(current) });
      current = (current + (sip * 12)) * (1 + rate / 100);
    }
    return pts;
  }, [sip, years, rate]);

  const finalValue = data[data.length - 1]?.value || 0;

  return (
    <div className="flex-1 flex flex-col bg-surface overflow-y-auto px-4 pt-6 pb-20">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-surface-container-low transition-colors">
          <ArrowLeft size={24} className="text-on-surface" />
        </button>
        <div>
          <h1 className="font-display-lg-mobile text-primary mb-1">Investor Twin Simulator</h1>
          <p className="font-body-md text-on-surface-variant text-sm">Model potential futures based on historical data.</p>
        </div>
      </div>

      {!simulated ? (
        <div className="flex flex-col gap-6">
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-5 shadow-sm">
            <h2 className="font-headline-sm text-on-surface mb-6">Simulation Parameters</h2>
            
            <div className="mb-6">
              <div className="flex justify-between items-end mb-2">
                <label className="font-label-md text-on-surface">Monthly SIP Amount (₹)</label>
                <span className="font-headline-sm text-primary">{sip.toLocaleString('en-IN')}</span>
              </div>
              <input 
                type="range" min="5000" max="200000" step="1000" 
                value={sip} onChange={e => setSip(Number(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="flex justify-between mt-1 text-xs text-outline">
                <span>₹5K</span><span>₹200K</span>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-end mb-2">
                <label className="font-label-md text-on-surface">Investment Duration (Years)</label>
                <span className="font-headline-sm text-primary">{years}</span>
              </div>
              <input 
                type="range" min="5" max="40" step="1" 
                value={years} onChange={e => setYears(Number(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="flex justify-between mt-1 text-xs text-outline">
                <span>5 Yrs</span><span>40 Yrs</span>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-end mb-2">
                <label className="font-label-md text-on-surface">Expected Annual Return (%)</label>
                <span className="font-headline-sm text-primary">{rate.toFixed(1)}%</span>
              </div>
              <input 
                type="range" min="6" max="20" step="0.5" 
                value={rate} onChange={e => setRate(Number(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="flex justify-between mt-1 text-xs text-outline">
                <span>6%</span><span className="text-secondary text-[10px]">Historical Avg (10-15%)</span><span>20%</span>
              </div>
            </div>

            <button 
              onClick={() => setSimulated(true)}
              className="w-full h-[56px] bg-primary text-on-primary rounded-full font-headline-sm transition-transform active:scale-[0.98] flex items-center justify-center gap-2 mt-4 shadow-sm"
            >
              <Play size={20} /> Run Simulation
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-5 shadow-sm">
            <h2 className="font-headline-sm text-on-surface mb-2">Projected Value in {years} years</h2>
            <p className="font-display-lg-mobile text-primary mb-6">₹{(finalValue / 10000000).toFixed(2)} Cr</p>
            
            <div className="h-64 w-full -ml-4 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                  <XAxis dataKey="year" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis tickFormatter={(val) => `₹${(val / 10000000).toFixed(1)}Cr`} fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip formatter={(value: number) => `₹${(value / 10000000).toFixed(2)} Cr`} labelFormatter={l => `Year ${l}`} />
                  <Line type="monotone" dataKey="value" stroke="#006d42" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-surface-container p-3 rounded-lg flex items-start gap-2 mb-4">
              <span className="text-secondary font-bold text-lg mt-[-2px]">ⓘ</span>
              <p className="font-label-md text-on-surface-variant text-xs">
                This is a projection based on assumed rates, not a guarantee or recommendation. Actual returns will fluctuate.
              </p>
            </div>

            <button 
              onClick={() => setSimulated(false)}
              className="w-full h-[48px] bg-surface-container-high text-on-surface border border-outline-variant rounded-full font-label-md transition-transform active:scale-[0.98]"
            >
              Recalculate
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
