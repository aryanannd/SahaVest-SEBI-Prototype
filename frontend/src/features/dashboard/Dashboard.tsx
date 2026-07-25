import React from 'react';
import { Bell, TrendingUp, Wallet, Lock, BookOpen, AlertTriangle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';

const NAVY = "#0B2545";
const TEAL = "#13A89E";

const LOCKED_ASSETS = [
  { label: "Bonds", sub: "NSE goBID" },
  { label: "SGB", sub: "RBI Retail Direct" },
  { label: "NPS", sub: "PFRDA" },
  { label: "REIT/InvIT", sub: "Exchange listed" },
];

export function Dashboard() {
  const navigate = useNavigate();
  // Mock data for now
  const risk = "Moderate";
  const portfolio = { equity: 260000, mf: 192300 };
  const flagged = true; // Set to true to show the concentration alert

  const total = portfolio.equity + portfolio.mf;
  const data = [
    { name: "Equity", value: portfolio.equity },
    { name: "Mutual Funds", value: portfolio.mf },
  ];
  const colors = [TEAL, NAVY];

  return (
    <div className="flex-1 flex flex-col bg-surface overflow-y-auto px-4 pt-4 pb-20">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="font-label-sm text-on-surface-variant uppercase tracking-wider">Total net worth</p>
          <p className="font-display-lg-mobile text-primary">₹{total.toLocaleString("en-IN")}</p>
        </div>
        <button className="p-2 rounded-full hover:bg-surface-container-low transition-colors">
          <Bell size={24} className="text-primary" />
        </button>
      </div>

      <div className="rounded-2xl p-4 mb-4 flex items-center bg-surface-container-lowest border border-outline-variant shadow-sm">
        <div style={{ width: 100, height: 100 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie data={data} innerRadius={30} outerRadius={46} paddingAngle={2} dataKey="value" stroke="none">
                {data.map((_, i) => <Cell key={i} fill={colors[i]} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="ml-4 flex flex-col gap-2 flex-1">
          {data.map((d, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: colors[i] }} />
                <span className="text-on-surface font-medium">{d.name}</span>
              </div>
              <span className="text-on-surface font-semibold">₹{(d.value/1000).toFixed(1)}k</span>
            </div>
          ))}
          <div className="mt-1 pt-2 border-t border-outline-variant/30 flex justify-between items-center">
            <span className="text-[11px] text-on-surface-variant font-medium">Risk Profile</span>
            <span className="text-[11px] font-bold text-primary">{risk}</span>
          </div>
        </div>
      </div>

      {flagged && (
        <button 
          onClick={() => navigate('/alerts')} 
          className="w-full flex items-center gap-3 rounded-xl px-4 py-3 mb-4 text-left border border-error-container bg-[#FAECE7] text-[#4A1B0C] shadow-sm"
        >
          <AlertTriangle size={20} className="text-error" />
          <span className="font-label-md">3 MF folios overlap 60% in Banking sector</span>
        </button>
      )}

      <p className="font-label-md text-primary mb-3">Quick access</p>
      <div className="grid grid-cols-3 gap-3 mb-5">
        <button onClick={() => navigate('/fund/equity')} className="rounded-xl p-3 flex flex-col items-start gap-2 bg-surface-container-lowest border border-outline-variant shadow-sm hover:bg-surface-container-low transition-colors">
          <TrendingUp size={20} className="text-secondary" />
          <span className="font-label-sm text-on-surface text-left">Equity</span>
        </button>
        <button onClick={() => navigate('/fund/mf')} className="rounded-xl p-3 flex flex-col items-start gap-2 bg-surface-container-lowest border border-outline-variant shadow-sm hover:bg-surface-container-low transition-colors">
          <Wallet size={20} className="text-secondary" />
          <span className="font-label-sm text-on-surface text-left">Mutual funds</span>
        </button>
        {LOCKED_ASSETS.map((a) => (
          <div key={a.label} className="rounded-xl p-3 flex flex-col items-start gap-1 bg-surface-container-lowest border border-outline-variant shadow-sm opacity-60">
            <Lock size={16} className="text-on-surface-variant" />
            <span className="font-label-sm text-on-surface">{a.label}</span>
            <span className="text-[10px] text-on-surface-variant leading-tight">Coming soon</span>
          </div>
        ))}
      </div>

      <button onClick={() => navigate('/twin/simulator')} className="w-full rounded-xl p-4 mb-4 flex items-center justify-between bg-primary text-on-primary shadow-sm hover:opacity-95 transition-opacity">
        <div className="text-left">
          <p className="font-label-md mb-0.5">Ask your Investor Twin</p>
          <p className="text-xs text-primary-fixed-dim">"What if I SIP ₹500 more?"</p>
        </div>
        <TrendingUp className="text-secondary-fixed" size={24} />
      </button>

      <button onClick={() => navigate('/learn')} className="w-full rounded-xl p-4 flex items-center justify-between bg-surface-container-lowest border border-outline-variant shadow-sm hover:bg-surface-container-low transition-colors">
        <div className="text-left flex-1 mr-4">
          <p className="font-label-md text-primary mb-2">Continue learning: MF basics</p>
          <div className="w-full h-1.5 rounded-full bg-surface-variant overflow-hidden">
            <div className="h-full rounded-full bg-secondary w-[40%]" />
          </div>
        </div>
        <BookOpen className="text-secondary" size={24} />
      </button>
    </div>
  );
}
