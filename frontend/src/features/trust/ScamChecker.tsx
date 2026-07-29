import { Header } from '../../components/common/Header';
import React, { useState } from 'react';
import { Search, User, Image as ImageIcon, AlertTriangle, ShieldCheck, Info, ArrowLeft, Lightbulb, BookOpen, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

export function ScamChecker() {
  const [tip, setTip] = useState('');
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [result, setResult] = useState<'idle' | 'loading' | 'scam'>('idle');
  const [apiData, setApiData] = useState<any>(null);
  const navigate = useNavigate();

  const handleCheck = async () => {
    if (!tip && !imageBase64) return;
    setResult('loading');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (session) headers['Authorization'] = `Bearer ${session.access_token}`;
      
      const payload: any = { type: 'text', content: tip };
      if (imageBase64) payload.image = imageBase64;

      const res = await fetch('http://localhost:3000/api/trust/scam-check', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      setApiData(data);
      setResult('scam');
    } catch (e) {
      console.error(e);
      setResult('scam');
    }
  };

  if (result === 'loading') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 bg-background min-h-screen">
        <div className="w-12 h-12 border-4 border-outline-variant border-t-primary rounded-full animate-spin" />
        <p className="font-headline-sm text-on-surface">Analyzing for red flags...</p>
      </div>
    );
  }

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col pb-[64px] md:pb-0 font-body-md antialiased selection:bg-primary-container selection:text-on-primary-container">
      {result !== 'scam' ? (
        <>
          <header className="w-full sticky top-0 z-50 bg-surface dark:bg-surface-dim border-b border-outline-variant dark:border-outline">
            <div className="flex items-center justify-between px-4 py-2 w-full max-w-7xl mx-auto">
              <button aria-label="Search" className="flex items-center justify-center min-w-[44px] min-h-[44px] text-on-surface-variant hover:bg-surface-container-low transition-colors active:scale-95 duration-100 rounded-full">
                <Search size={24} />
              </button>
              <Header />
              <button aria-label="Account" className="flex items-center justify-center min-w-[44px] min-h-[44px] text-on-surface-variant hover:bg-surface-container-low transition-colors active:scale-95 duration-100 rounded-full">
                <User size={24} />
              </button>
            </div>
          </header>

          <main className="flex-grow flex flex-col items-center px-4 md:px-6 py-8 max-w-3xl mx-auto w-full gap-8">
            <section className="w-full text-center space-y-3">
              <h2 className="font-display-lg-mobile md:font-display-lg text-primary">Verify Before You Invest</h2>
              <p className="font-body-md text-on-surface-variant max-w-lg mx-auto">
                Paste suspicious messages, investment tips, or advisor claims below. Our system will analyze them for potential risks and common scam patterns.
              </p>
            </section>

            <section className="w-full bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant p-4 md:p-6 flex flex-col gap-4">
              <div className="relative">
                <label className="sr-only" htmlFor="scam-input">Paste message here</label>
                <textarea 
                  id="scam-input"
                  value={tip}
                  onChange={(e) => setTip(e.target.value)}
                  placeholder="Paste SMS, WhatsApp message, email, or advisor claim here..." 
                  rows={5}
                  className="w-full bg-surface text-on-surface font-body-md rounded-lg border border-outline-variant p-4 focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-y placeholder:text-outline"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
                <div className="flex gap-3 w-full sm:w-auto">
                  <label className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-full border border-outline-variant text-on-surface hover:bg-surface-container-low transition-colors min-h-[44px] cursor-pointer">
                    <ImageIcon size={20} />
                    <span className="font-label-md">Upload Image</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setTip((prev) => `[Attached Image] ${prev}`);
                            setImageBase64(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                  <button className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2 rounded-full text-primary hover:bg-primary-fixed transition-colors min-h-[44px]">
                    <span className="font-label-md">Try an Example</span>
                  </button>
                </div>
                <button onClick={handleCheck} className="w-full sm:w-auto flex items-center justify-center px-8 py-2 rounded-full bg-primary text-on-primary hover:bg-primary-container transition-colors min-h-[44px] shadow-sm">
                  <span className="font-label-md">Analyze Text</span>
                </button>
              </div>
            </section>

            <section className="w-full mt-6">
              <h3 className="font-headline-sm text-on-surface mb-4">Recent Checks</h3>
              <div className="flex flex-col gap-2">
                <div className="bg-surface-container-lowest rounded-lg border border-outline-variant p-4 flex items-start gap-4 hover:bg-surface-container-low transition-colors cursor-pointer">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-error-container flex items-center justify-center">
                    <AlertTriangle size={20} className="text-on-error-container fill-error-container" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h4 className="font-label-md text-on-surface truncate">"Guaranteed 20% monthly returns on..."</h4>
                      <span className="font-label-sm text-outline whitespace-nowrap ml-3">Today, 10:42 AM</span>
                    </div>
                    <p className="font-body-md text-on-surface-variant line-clamp-1">Analyzed SMS text message</p>
                    <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-error-container text-on-error-container uppercase tracking-wider">
                      High Risk
                    </div>
                  </div>
                </div>

                <div className="bg-surface-container-lowest rounded-lg border border-outline-variant p-4 flex items-start gap-4 hover:bg-surface-container-low transition-colors cursor-pointer">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center">
                    <ShieldCheck size={20} className="text-on-secondary-container fill-secondary-container" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h4 className="font-label-md text-on-surface truncate">Screenshot_20231025.png</h4>
                      <span className="font-label-sm text-outline whitespace-nowrap ml-3">Yesterday</span>
                    </div>
                    <p className="font-body-md text-on-surface-variant line-clamp-1">Analyzed image from WhatsApp</p>
                    <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-secondary-container text-on-secondary-container uppercase tracking-wider">
                      Safe
                    </div>
                  </div>
                </div>

                <div className="bg-surface-container-lowest rounded-lg border border-outline-variant p-4 flex items-start gap-4 hover:bg-surface-container-low transition-colors cursor-pointer">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center">
                    <Info size={20} className="text-on-surface-variant fill-surface-variant" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h4 className="font-label-md text-on-surface truncate">"Hi, I am calling from your bank regarding..."</h4>
                      <span className="font-label-sm text-outline whitespace-nowrap ml-3">Oct 22</span>
                    </div>
                    <p className="font-body-md text-on-surface-variant line-clamp-1">Analyzed transcribed call</p>
                    <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-surface-variant text-on-surface-variant uppercase tracking-wider">
                      Inconclusive
                    </div>
                  </div>
                </div>
              </div>
              <button className="w-full mt-3 py-3 text-center font-label-md text-primary hover:bg-surface-container-low rounded-lg transition-colors">
                View All History
              </button>
            </section>
          </main>
        </>
      ) : (
        <>
          <header className="w-full sticky top-0 z-50 bg-surface dark:bg-surface-dim border-b border-outline-variant dark:border-outline flex items-center justify-between px-4 py-2 max-w-7xl mx-auto">
            <button onClick={() => setResult('idle')} aria-label="Go back" className="w-[44px] h-[44px] flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low transition-colors rounded-full active:scale-95 duration-100">
              <ArrowLeft size={24} />
            </button>
            <Header />
            <div className="w-[44px] h-[44px] flex items-center justify-center text-on-surface-variant"></div>
          </header>

          <main className="flex-grow w-full max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8 flex flex-col gap-6 pb-32">
            <section className="bg-surface-container-lowest rounded-xl border border-error-container shadow-sm p-6 flex flex-col items-center justify-center text-center relative overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="absolute inset-0 bg-error-container/20 animate-pulse pointer-events-none"></div>
              <div className="relative z-10 flex flex-col items-center">
                {apiData?.risk_category === 'HIGH_TRUST' ? <ShieldCheck size={64} className="text-secondary mb-3 fill-secondary/20" /> : <AlertTriangle size={64} className="text-error mb-3 fill-error/20" />}
                <h1 className="font-display-lg-mobile md:font-display-lg text-on-surface mb-1">{apiData?.risk_category === 'HIGH_TRUST' ? 'Low' : 'High'} Risk Detected</h1>
                <p className="font-body-lg text-on-surface-variant mb-4 max-w-md text-center">
                  {apiData?.explainability?.why || apiData?.analysis || "This message shows strong signs of a 'Pump and Dump' scheme."}
                </p>
                
                <div className="relative w-48 h-48 flex items-center justify-center my-4">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle className="text-surface-variant" cx="50" cy="50" fill="transparent" r="40" stroke="currentColor" strokeWidth="8" />
                    <circle className="text-error transition-all duration-1000 ease-out" cx="50" cy="50" fill="transparent" r="40" stroke="currentColor" strokeDasharray="251.2" strokeDashoffset={`${251.2 - (251.2 * (apiData?.trust_score || 20)) / 100}`} strokeWidth="8" />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="font-display-lg text-error">{apiData?.trust_score ?? 20}</span>
                    <span className="font-label-sm text-on-surface-variant uppercase tracking-wider">Trust Score</span>
                  </div>
                </div>
              </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 animate-in slide-in-from-bottom-8 duration-500 delay-150 fill-mode-both">
              <section className="md:col-span-7 bg-surface-container-lowest rounded-xl border border-outline-variant p-4 flex flex-col">
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-surface-variant">
                  <Search size={24} className="text-primary fill-primary/20" />
                  <h2 className="font-headline-sm text-on-surface">Analysis Report</h2>
                </div>
                <div className="bg-surface-container-low rounded-lg p-4 overflow-y-auto max-h-[300px] font-body-md text-on-surface leading-relaxed relative">
                  <p>
                    "URGENT: <mark className="bg-error-container text-on-error-container px-1 rounded font-medium cursor-help group relative">Guaranteed 500% returns<span className="absolute hidden group-hover:block bottom-full left-0 mb-1 w-48 bg-inverse-surface text-inverse-on-surface font-label-sm p-2 rounded shadow-lg z-20">Red Flag: Unrealistic guarantee of returns.</span></mark> on a secret micro-cap stock! Insider information reveals institutional buying starts TOMORROW. 
                    <mark className="bg-tertiary-fixed text-on-tertiary-fixed px-1 rounded font-medium cursor-help group relative ml-1">Act now before it's too late.<span className="absolute hidden group-hover:block bottom-full left-0 mb-1 w-48 bg-inverse-surface text-inverse-on-surface font-label-sm p-2 rounded shadow-lg z-20">Yellow Flag: Creates false sense of urgency.</span></mark> 
                    Click the link below to download the app and deposit your funds directly to secure your shares. 
                    <mark className="bg-error-container text-on-error-container px-1 rounded font-medium cursor-help group relative ml-1">Zero risk involved.<span className="absolute hidden group-hover:block bottom-full right-0 mb-1 w-48 bg-inverse-surface text-inverse-on-surface font-label-sm p-2 rounded shadow-lg z-20">Red Flag: All investments carry risk.</span></mark>"
                  </p>
                </div>
                <div className="mt-4 flex gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-error-container border border-error"></div>
                    <span className="font-label-sm text-on-surface-variant">Critical Red Flags</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-tertiary-fixed border border-tertiary"></div>
                    <span className="font-label-sm text-on-surface-variant">Suspicious Phrasing</span>
                  </div>
                </div>
              </section>

              <section className="md:col-span-5 flex flex-col gap-4">
                <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Lightbulb size={24} className="text-tertiary fill-tertiary/20" />
                    <h3 className="font-headline-sm text-on-surface">What is a 'Pump and Dump'?</h3>
                  </div>
                  <p className="font-body-md text-on-surface-variant mb-4">
                    Scammers heavily promote ("pump") an obscure stock using false or misleading statements to artificially inflate its price. Once the price rises, they sell ("dump") their shares, causing the price to crash and leaving new investors with massive losses.
                  </p>
                  <button className="w-full flex items-center justify-center gap-2 bg-surface-container text-on-surface font-label-md py-3 px-4 rounded-full hover:bg-surface-container-highest transition-colors min-h-[48px]">
                    <BookOpen size={18} />
                    Learn More About This Scam
                  </button>
                </div>

                <div className="bg-error-container rounded-xl border border-error/20 p-4 flex flex-col items-center text-center">
                  <ShieldAlert size={40} className="text-on-error-container mb-3" />
                  <h3 className="font-headline-sm text-on-error-container mb-2">Help Protect Others</h3>
                  <p className="font-body-md text-on-error-container/80 mb-4">
                    Reporting this helps authorities track down scammers and prevents other investors from falling victim.
                  </p>
                  <button onClick={() => navigate('/trust/report')} className="w-full flex items-center justify-center gap-2 bg-error text-on-error font-label-md py-3 px-4 rounded-full hover:bg-error/90 transition-colors shadow-sm min-h-[48px] active:scale-[0.98]">
                    <AlertTriangle size={18} />
                    Report to Authorities
                  </button>
                </div>
              </section>
            </div>
          </main>
        </>
      )}
    </div>
  );
}
