import React, { useState, useMemo } from "react";
import {
  Home, BookOpen, ShieldAlert, MessageCircle, ScrollText, Lock,
  CheckCircle2, XCircle, ChevronLeft, User, Bell, TrendingUp,
  AlertTriangle, Send, Landmark, Wallet, Sparkles, BadgeCheck, Link2
} from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line,
  XAxis, YAxis, Tooltip, CartesianGrid
} from "recharts";

const NAVY = "#0B2545";
const TEAL = "#13A89E";
const AMBER = "#F5A623";
const DANGER = "#D64545";
const SUCCESS = "#2E9E5B";
const BG = "#F7F8FA";

function simpleHash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  const hex = Math.abs(h).toString(16).padStart(8, "0");
  return hex.slice(0, 4) + "..." + hex.slice(4, 8);
}

const REGISTRY = ["Anand Financial Advisors (RIA/00234)", "Nency Wealth Partners (RA/00891)", "Aether Capital Services (RIA/00456)"];

const LOCKED_ASSETS = [
  { label: "Bonds", sub: "NSE goBID" },
  { label: "SGB", sub: "RBI Retail Direct" },
  { label: "NPS", sub: "PFRDA" },
  { label: "REIT/InvIT", sub: "Exchange listed" },
];

const LESSONS = [
  { id: 1, title: "What is a Mutual Fund?", body: "A mutual fund pools money from many investors and a professional manager invests it in stocks, bonds, or other assets on their behalf. You own units of the fund, not the underlying assets directly." },
  { id: 2, title: "Understanding NAV", body: "Net Asset Value is the per-unit price of a mutual fund, calculated daily. It reflects the fund's total assets minus liabilities, divided by the number of outstanding units." },
  { id: 3, title: "Risk vs Return", body: "Higher potential returns almost always come with higher risk of loss. Small-cap equity funds can swing 25-40% in a bad year; debt funds are steadier but grow slower." },
];

const CHAT_KB = [
  { keys: ["sip", "sip kya"], en: "A SIP (Systematic Investment Plan) lets you invest a fixed amount regularly...", hi: "SIP ka matlab hai..." },
  { keys: ["nav", "net asset"], en: "NAV is the price of one unit...", hi: "NAV ek mutual fund unit..." },
  { keys: ["risk", "safe"], en: "No investment is fully risk-free...", hi: "Koi bhi investment 100% risk-free nahi hoti..." },
];

function PhoneFrame({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center py-6" style={{ background: "#E7E9EE" }}>
      <div className="w-[380px] h-[780px] rounded-[36px] overflow-hidden shadow-2xl flex flex-col" style={{ background: BG, border: `8px solid ${NAVY}` }}>
        {children}
      </div>
    </div>
  );
}

function StatusBar() {
  return (
    <div className="flex items-center justify-between px-5 pt-2 pb-1 text-[11px] font-medium" style={{ background: NAVY, color: "#fff" }}>
      <span>9:41</span>
      <span className="tracking-wide">SahaVest</span>
      <span>100%</span>
    </div>
  );
}

function TopBar({ title, onBack, right }) {
  return (
    <div className="flex items-center justify-between px-4 py-3" style={{ background: NAVY, color: "#fff" }}>
      <div className="flex items-center gap-2 w-8">
        {onBack && <button onClick={onBack} aria-label="Back"><ChevronLeft size={20} /></button>}
      </div>
      <span className="font-semibold text-[15px]">{title}</span>
      <div className="w-8 flex justify-end">{right}</div>
    </div>
  );
}

function BottomNav({ screen, setScreen }) {
  const items = [
    { id: "home", icon: Home, label: "Home" },
    { id: "learn", icon: BookOpen, label: "Learn" },
    { id: "fraud", icon: ShieldAlert, label: "Check tip" },
    { id: "chat", icon: MessageCircle, label: "Ask AI" },
    { id: "audit", icon: ScrollText, label: "Audit" },
  ];
  return (
    <div className="flex justify-around items-center py-2 border-t" style={{ background: "#fff", borderColor: "#E5E7EB" }}>
      {items.map((it) => {
        const Icon = it.icon;
        const active = screen === it.id;
        return (
          <button key={it.id} onClick={() => setScreen(it.id)} className="flex flex-col items-center gap-0.5 px-1">
            <Icon size={20} color={active ? TEAL : "#8A93A3"} />
            <span className="text-[10px]" style={{ color: active ? TEAL : "#8A93A3" }}>{it.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ---------------- ONBOARDING ----------------
function Onboarding({ onDone }) {
  const [step, setStep] = useState(0);
  const [lang, setLang] = useState("English");
  const [fips, setFips] = useState({ bank: true, demat: true, mf: true });
  const [answers, setAnswers] = useState({});

  const questions = [
    { q: "If your portfolio dropped 20% in a month, you would:", opts: ["Sell everything", "Sell some", "Hold", "Invest more"] },
    { q: "Your primary investing goal is:", opts: ["Capital protection", "Steady growth", "High growth, can accept swings"] },
    { q: "Your investment horizon is:", opts: ["Under 1 year", "1-5 years", "5+ years"] },
  ];

  const riskScore = () => {
    const vals = Object.values(answers);
    const sum = vals.reduce((a, b) => a + b, 0);
    if (sum <= 2) return "Conservative";
    if (sum <= 4) return "Moderate";
    return "Aggressive";
  };

  const steps = [
    <div key="splash" className="flex-1 flex flex-col items-center justify-center gap-3 px-8">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: TEAL }}>
        <Sparkles color="#fff" size={30} />
      </div>
      <p className="text-xl font-semibold" style={{ color: NAVY }}>SahaVest</p>
      <p className="text-sm text-center" style={{ color: "#6B7280" }}>One app for every investment you make, and every risk you should know about.</p>
    </div>,
    <div key="lang" className="flex-1 flex flex-col px-6 pt-8 gap-3">
      <p className="font-semibold mb-2" style={{ color: NAVY }}>Choose your language</p>
      {["English", "हिन्दी", "ગુજરાતી", "मराठी"].map((l) => (
        <button key={l} onClick={() => setLang(l)} className="text-left px-4 py-3 rounded-xl border" style={{ borderColor: lang === l ? TEAL : "#E5E7EB", background: lang === l ? "#E1F5EE" : "#fff" }}>{l}</button>
      ))}
    </div>,
    <div key="otp" className="flex-1 flex flex-col px-6 pt-8 gap-3">
      <p className="font-semibold mb-2" style={{ color: NAVY }}>Verify your mobile number</p>
      <input placeholder="+91 98765 43210" className="border rounded-xl px-4 py-3 text-sm" style={{ borderColor: "#E5E7EB" }} />
      <input placeholder="Enter OTP" className="border rounded-xl px-4 py-3 text-sm" style={{ borderColor: "#E5E7EB" }} />
    </div>,
    <div key="ckyc" className="flex-1 flex flex-col px-6 pt-8 gap-3">
      <div className="flex items-center gap-2 mb-1">
        <BadgeCheck color={TEAL} size={20} />
        <p className="font-semibold" style={{ color: NAVY }}>One-time KYC via DigiLocker</p>
      </div>
      <p className="text-[13px]" style={{ color: "#6B7280" }}>SahaVest will fetch your CKYC record via DigiLocker consent. This unlocks Equity, Mutual Funds and (soon) Bonds, SGB, NPS and REIT/InvIT — no repeat paperwork with each provider.</p>
      <div className="mt-2 rounded-xl px-4 py-3 text-[13px]" style={{ background: "#E1F5EE", color: "#085041" }}>PAN, Aadhaar-linked identity and address proof will be pulled with your explicit consent only.</div>
    </div>,
    <div key="aa" className="flex-1 flex flex-col px-6 pt-8 gap-3">
      <p className="font-semibold mb-1" style={{ color: NAVY }}>Link your accounts</p>
      <p className="text-[13px] mb-2" style={{ color: "#6B7280" }}>Via Account Aggregator consent — your existing broker and AMC stay the same, SahaVest only reads balances.</p>
      {[["bank", "Bank accounts"], ["demat", "Demat / broker holdings"], ["mf", "Mutual fund folios"]].map(([k, label]) => (
        <label key={k} className="flex items-center gap-3 px-4 py-3 rounded-xl border" style={{ borderColor: "#E5E7EB" }}>
          <input type="checkbox" checked={fips[k]} onChange={(e) => setFips({ ...fips, [k]: e.target.checked })} />
          <span className="text-sm">{label}</span>
        </label>
      ))}
    </div>,
    <div key="risk" className="flex-1 flex flex-col px-6 pt-6 gap-4 overflow-y-auto">
      <p className="font-semibold" style={{ color: NAVY }}>A few questions about you</p>
      {questions.map((qq, qi) => (
        <div key={qi}>
          <p className="text-sm mb-2" style={{ color: "#374151" }}>{qq.q}</p>
          <div className="flex flex-col gap-2">
            {qq.opts.map((o, oi) => (
              <button key={oi} onClick={() => setAnswers({ ...answers, [qi]: oi })}
                className="text-left text-[13px] px-3 py-2 rounded-lg border"
                style={{ borderColor: answers[qi] === oi ? TEAL : "#E5E7EB", background: answers[qi] === oi ? "#E1F5EE" : "#fff" }}>
                {o}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>,
  ];

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 flex flex-col">{steps[step]}</div>
      <div className="px-6 pb-6">
        <button
          onClick={() => (step === steps.length - 1 ? onDone(riskScore()) : setStep(step + 1))}
          className="w-full py-3 rounded-xl font-medium text-sm"
          style={{ background: TEAL, color: "#fff" }}
        >
          {step === steps.length - 1 ? "Finish setup" : "Continue"}
        </button>
        <div className="flex justify-center gap-1 mt-3">
          {steps.map((_, i) => (
            <div key={i} className="h-1 rounded-full" style={{ width: 16, background: i === step ? TEAL : "#D1D5DB" }} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------- APP ----------------
export default function App() {
  const [onboarded, setOnboarded] = useState(false);
  const [risk, setRisk] = useState("Moderate");

  if (!onboarded) {
    return (
      <PhoneFrame>
        <StatusBar />
        <Onboarding onDone={(r) => { setRisk(r); setOnboarded(true); }} />
      </PhoneFrame>
    );
  }

  return (
    <PhoneFrame>
      <StatusBar />
      <TopBar title="SahaVest" />
      <div className="p-4">
        <p>App Content - Risk Profile: {risk}</p>
      </div>
    </PhoneFrame>
  );
}
