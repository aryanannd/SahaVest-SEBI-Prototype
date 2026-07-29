import { Header } from '../../components/common/Header';
import React, { useState, useEffect } from 'react';
import { Search, Shield, User, ArrowLeft, ChevronRight, CheckCircle, Database, PlusCircle, Bell, User as UserIcon, Building2, ShieldCheck, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

export function AdvisorVerification() {
  const [regNo, setRegNo] = useState('');
  const [result, setResult] = useState<'idle' | 'loading' | 'success' | 'fail'>('idle');
  const [apiData, setApiData] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      let minutes: any = now.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      minutes = minutes < 10 ? '0' + minutes : minutes;
      setCurrentTime(`${hours}:${minutes} ${ampm} IST`);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleVerify = async (searchVal = regNo) => {
    if (!searchVal) return;
    setRegNo(searchVal);
    setResult('loading');
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers: HeadersInit = {};
      if (session) headers['Authorization'] = `Bearer ${session.access_token}`;
      
      const response = await fetch(`http://localhost:3000/api/trust/verify-advisor/${searchVal}`, { headers });
      
      if (response.ok) {
        const data = await response.json();
        setApiData(data);
        setResult('success');
      } else {
        setResult('fail');
      }
    } catch (error) {
      console.error("Failed to verify advisor:", error);
      setResult('fail');
    }
  };

  const handleRecentSearch = (searchVal: string) => {
    setRegNo(searchVal);
    handleVerify(searchVal);
  };

  if (result === 'loading') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 bg-background min-h-screen">
        <div className="w-12 h-12 border-4 border-outline-variant border-t-primary rounded-full animate-spin" />
        <p className="font-label-md text-on-surface-variant">Checking SEBI Registry...</p>
      </div>
    );
  }

  return (
    <div className="bg-background text-on-surface antialiased min-h-screen flex flex-col font-body-md">
      <header className="w-full top-0 sticky z-40 bg-surface dark:bg-surface-dim border-b border-outline-variant dark:border-outline shadow-sm dark:shadow-none transition-colors duration-200">
        <div className="flex justify-between items-center h-14 px-4 max-w-screen-md mx-auto w-full">
          <div className="flex items-center gap-2">
            <button onClick={() => result === 'idle' ? navigate(-1) : setResult('idle')} aria-label="Go back" className="w-[44px] h-[44px] flex items-center justify-center rounded-full hover:bg-surface-container active:bg-surface-container-high transition-colors">
              <ArrowLeft className="text-on-surface" size={24} />
            </button>
            <div className="flex items-center">
              <Header />
            </div>
          </div>
          <button aria-label="notifications" className="w-[44px] h-[44px] flex items-center justify-center rounded-full hover:bg-surface-container active:bg-surface-container-high transition-colors text-on-surface-variant dark:text-on-surface-variant">
            <Bell size={24} />
          </button>
        </div>
      </header>

      <main className="flex-1 w-full max-w-screen-md mx-auto px-4 py-6 pb-32 flex flex-col gap-6 relative">
        <div className="absolute inset-0 bg-[radial-gradient(var(--tw-colors-outline-variant)_1px,transparent_1px)] [background-size:24px_24px] bg-center opacity-15 pointer-events-none z-[-1]"></div>

        {result === 'idle' && (
          <div className="flex flex-col gap-6 animate-in fade-in">
            <div className="flex flex-col gap-1">
              <h1 className="font-headline-md text-on-surface">Verify Advisor</h1>
              <p className="font-body-md text-on-surface-variant">Ensure your financial advisor is registered with SEBI to protect your investments.</p>
            </div>

            <div className="relative w-full group focus-within:ring-2 focus-within:ring-primary-container rounded-2xl bg-surface border border-outline-variant flex items-center h-14 px-3 overflow-hidden shadow-sm transition-all duration-200">
              <Search className="text-outline ml-3 mr-2" size={24} />
              <input 
                aria-label="Search Advisor" 
                className="w-full h-full bg-transparent border-none focus:ring-0 text-on-surface font-body-md placeholder:text-outline-variant outline-none" 
                placeholder="Search by Name or SEBI Reg No." 
                type="text"
                value={regNo}
                onChange={(e) => setRegNo(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
              />
            </div>

            <section className="flex flex-col gap-3 mt-4">
              <h2 className="font-label-sm text-on-surface-variant uppercase tracking-wider">Recent Searches</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button onClick={() => handleRecentSearch('INA000012345')} className="flex items-center justify-between p-3 bg-surface-container-lowest border border-outline-variant rounded-lg hover:bg-surface-container transition-colors shadow-sm min-h-[44px]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center">
                      <User className="text-on-surface-variant" size={20} />
                    </div>
                    <div className="text-left">
                      <p className="font-label-md text-on-surface">Ravi Kumar</p>
                      <p className="font-label-sm text-outline">INA000012345</p>
                    </div>
                  </div>
                  <ChevronRight className="text-outline-variant" size={20} />
                </button>
                
                <button onClick={() => handleRecentSearch('INA000098765')} className="flex items-center justify-between p-3 bg-surface-container-lowest border border-outline-variant rounded-lg hover:bg-surface-container transition-colors shadow-sm min-h-[44px]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center">
                      <Building2 className="text-on-surface-variant" size={20} />
                    </div>
                    <div className="text-left">
                      <p className="font-label-md text-on-surface">FinWealth Advisors</p>
                      <p className="font-label-sm text-outline">INA000098765</p>
                    </div>
                  </div>
                  <ChevronRight className="text-outline-variant" size={20} />
                </button>

                <button onClick={() => handleRecentSearch('INA000054321')} className="flex items-center justify-between p-3 bg-surface-container-lowest border border-outline-variant rounded-lg hover:bg-surface-container transition-colors shadow-sm min-h-[44px]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center">
                      <User className="text-on-surface-variant" size={20} />
                    </div>
                    <div className="text-left">
                      <p className="font-label-md text-on-surface">Sneha Desai</p>
                      <p className="font-label-sm text-outline">INA000054321</p>
                    </div>
                  </div>
                  <ChevronRight className="text-outline-variant" size={20} />
                </button>
              </div>
            </section>

            <div className="mt-auto pt-8 flex justify-center w-full">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-surface-container-low rounded-full border border-surface-container">
                <ShieldCheck className="text-secondary fill-secondary/20" size={20} />
                <span className="font-label-sm text-on-surface-variant">Powered by SEBI Registry</span>
              </div>
            </div>
          </div>
        )}

        {result === 'success' && (
          <div className="flex flex-col gap-6 animate-in slide-in-from-bottom-4">
            <div className="text-center">
              <h1 className="font-headline-md text-on-surface mb-1">Verification Result</h1>
              <p className="font-body-md text-on-surface-variant">Live query as of <span>{currentTime}</span></p>
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden relative group">
              <div className="bg-secondary-container px-4 py-6 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-on-secondary rounded-full flex items-center justify-center mb-3 shadow-sm relative">
                  <div className="absolute inset-0 bg-secondary rounded-full animate-ping opacity-20"></div>
                  <ShieldCheck className="text-secondary fill-secondary/20" size={36} />
                </div>
                <h2 className="font-headline-sm text-on-secondary-container font-bold mb-1">Verified Advisor</h2>
                <p className="font-body-md text-on-secondary-container opacity-90">Official SEBI Registration Found</p>
              </div>

              <div className="p-4 bg-surface-container-lowest">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-surface-container shrink-0 border border-outline-variant flex items-center justify-center">
                    <UserIcon size={32} className="text-outline" />
                  </div>
                  <div>
                    <h3 className="font-headline-sm text-on-surface font-bold">{apiData?.principal_officer || 'Verified Officer'}</h3>
                    <p className="font-label-md text-on-surface-variant flex items-center gap-1 mt-1">
                      <Building2 size={16} />
                      {apiData?.type || 'Registered Advisor'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-surface-container-low p-3 rounded-lg">
                    <p className="font-label-sm text-on-surface-variant mb-1 uppercase tracking-wider">SEBI Reg No.</p>
                    <p className="font-body-md text-on-surface font-semibold font-mono">{regNo.toUpperCase()}</p>
                  </div>
                  <div className="bg-surface-container-low p-3 rounded-lg">
                    <p className="font-label-sm text-on-surface-variant mb-1 uppercase tracking-wider">Validity</p>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="text-secondary" size={16} />
                      <p className="font-body-md text-on-surface font-semibold">{apiData?.valid_till ? new Date(apiData.valid_till).toLocaleDateString('en-US', {month: 'short', year: 'numeric'}) : 'Valid'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-surface-container px-4 py-3 border-t border-outline-variant flex items-center justify-between">
                <div className="flex items-center gap-2 text-on-surface-variant">
                  <Database size={18} />
                  <span className="font-label-sm">Source: SEBI Public Registry</span>
                </div>
                <button onClick={() => navigate('/trust/registry')} className="text-primary font-label-md hover:underline underline-offset-4 focus:outline-none min-h-[44px] flex items-center">
                  View Certificate
                </button>
              </div>
            </div>

            <div className="mt-3">
              <h3 className="font-headline-sm text-on-surface mb-3 px-2">Registry Details</h3>
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm">
                <ul className="flex flex-col">
                  <li className="px-4 py-3 border-b border-outline-variant last:border-b-0 flex justify-between items-center">
                    <span className="font-body-md text-on-surface-variant">Registered Entity</span>
                    <span className="font-body-md text-on-surface font-medium text-right max-w-[60%]">{apiData?.name || 'N/A'}</span>
                  </li>
                  <li className="px-4 py-3 border-b border-outline-variant last:border-b-0 flex justify-between items-center">
                    <span className="font-body-md text-on-surface-variant">Principal Officer</span>
                    <span className="font-body-md text-on-surface font-medium text-right max-w-[60%]">{apiData?.principal_officer || 'N/A'}</span>
                  </li>
                  <li className="px-4 py-3 border-b border-outline-variant last:border-b-0 flex justify-between items-start">
                    <span className="font-body-md text-on-surface-variant mt-1">Registered Address</span>
                    <span className="font-body-md text-on-surface font-medium text-right max-w-[60%]">{apiData?.address || 'N/A'}</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3">
              <button className="w-full h-14 bg-primary text-on-primary rounded-full font-label-md font-bold flex items-center justify-center gap-2 hover:bg-primary-container active:scale-[0.98] transition-all shadow-sm">
                <PlusCircle size={20} />
                Add to Watchlist
              </button>
              <button onClick={() => setResult('idle')} className="w-full h-12 bg-surface text-primary border border-outline-variant rounded-full font-label-md font-semibold flex items-center justify-center hover:bg-surface-container active:scale-[0.98] transition-all">
                Search Another Advisor
              </button>
            </div>
          </div>
        )}

        {result === 'fail' && (
          <div className="flex flex-col gap-6 animate-in slide-in-from-bottom-4">
            <div className="text-center">
              <h1 className="font-headline-md text-on-surface mb-1">Verification Result</h1>
              <p className="font-body-md text-on-surface-variant">Live query as of <span>{currentTime}</span></p>
            </div>

            <div className="bg-[#FAECE7] border border-error-container rounded-xl p-5 shadow-sm">
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
            
            <div className="mt-4 flex flex-col gap-3">
              <button onClick={() => setResult('idle')} className="w-full h-12 bg-surface text-primary border border-outline-variant rounded-full font-label-md font-semibold flex items-center justify-center hover:bg-surface-container active:scale-[0.98] transition-all">
                Search Another Advisor
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}


