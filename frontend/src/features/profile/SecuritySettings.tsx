import React, { useState, useEffect } from 'react';
import { ArrowLeft, Shield, KeyRound, Fingerprint, Info, Smartphone, Laptop, LogOut, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

export function SecuritySettings() {
  const navigate = useNavigate();
  const [pinEnabled, setPinEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [apiData, setApiData] = useState<any>(null);

  useEffect(() => {
    async function fetchSecurity() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        if (session) headers['Authorization'] = `Bearer ${session.access_token}`;
        const res = await fetch('/api/profile/security/me', { headers });
        const data = await res.json();
        setApiData(data);
        if (data.two_factor_enabled !== undefined) {
          setPinEnabled(data.two_factor_enabled);
          setBiometricEnabled(data.two_factor_enabled);
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchSecurity();
  }, []);

  return (
    <div className="bg-background text-on-background antialiased min-h-screen pt-[56px] pb-[80px] md:pb-0">
      {/* TopAppBar */}
      <header className="bg-surface dark:bg-on-background fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 h-[56px] border-b border-outline-variant dark:border-outline shadow-sm">
        <div className="flex items-center">
          <button 
            onClick={() => navigate(-1)}
            className="w-[44px] h-[44px] flex items-center justify-center mr-2 text-primary dark:text-primary-fixed-dim hover:bg-surface-container-low dark:hover:bg-surface-variant rounded-full active:scale-95 transition-transform duration-150"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="font-headline-md font-bold text-primary dark:text-primary-fixed-dim ml-2">Security Settings</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 grid gap-6">
        
        {/* Security Status Banner */}
        <section className="bg-primary-container text-on-primary-container rounded-xl p-4 flex items-start gap-4 shadow-sm">
          <div className="mt-1">
            <Shield size={24} className="fill-current text-secondary-fixed stroke-secondary-fixed" />
          </div>
          <div>
            <h2 className="font-headline-sm text-primary mb-1">Account Protected</h2>
            <p className="font-body-md text-on-primary-container">Your account security is up to date. Review your settings below to ensure maximum protection.</p>
          </div>
        </section>

        {/* Authentication Methods Card */}
        <section className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
          <div className="p-4 border-b border-surface-variant">
            <h2 className="font-headline-sm text-primary">Authentication</h2>
            <p className="font-body-md text-on-surface-variant mt-1">Manage how you access your SahaVest account.</p>
          </div>
          <div className="p-0">
            {/* App PIN Toggle */}
            <div className="flex items-center justify-between p-4 border-b border-surface-variant hover:bg-surface-container-low transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary">
                  <KeyRound size={20} />
                </div>
                <div>
                  <h3 className="font-label-md text-on-surface">App PIN</h3>
                  <p className="font-body-md text-on-surface-variant text-sm mt-1">Require a 6-digit PIN to open the app.</p>
                </div>
              </div>
              <div className="relative inline-block w-12 align-middle select-none h-6">
                <input 
                  type="checkbox" 
                  checked={pinEnabled} 
                  onChange={(e) => setPinEnabled(e.target.checked)}
                  className={`absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer z-10 transition-all ${pinEnabled ? 'right-0 border-primary' : 'left-0 border-outline-variant'}`}
                />
                <div className={`block overflow-hidden h-6 rounded-full cursor-pointer transition-colors ${pinEnabled ? 'bg-primary' : 'bg-outline-variant'}`}></div>
              </div>
            </div>

            {/* Biometric Login Toggle */}
            <div className="flex items-center justify-between p-4 hover:bg-surface-container-low transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary">
                  <Fingerprint size={20} />
                </div>
                <div>
                  <h3 className="font-label-md text-on-surface">Biometric Unlock</h3>
                  <p className="font-body-md text-on-surface-variant text-sm mt-1">Use Fingerprint or Face ID for faster access.</p>
                </div>
              </div>
              <div className="relative inline-block w-12 align-middle select-none h-6">
                <input 
                  type="checkbox" 
                  checked={biometricEnabled}
                  onChange={(e) => setBiometricEnabled(e.target.checked)}
                  className={`absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer z-10 transition-all ${biometricEnabled ? 'right-0 border-primary' : 'left-0 border-outline-variant'}`}
                />
                <div className={`block overflow-hidden h-6 rounded-full cursor-pointer transition-colors ${biometricEnabled ? 'bg-primary' : 'bg-outline-variant'}`}></div>
              </div>
            </div>
          </div>
          
          <div className="bg-surface-container-low p-3 px-4 flex items-start gap-3 border-t border-surface-variant">
            <Info size={16} className="text-outline mt-0.5 shrink-0" />
            <p className="font-label-sm text-on-surface-variant font-normal">If biometric hardware is unavailable or fails, your 6-digit App PIN will act as a fallback method.</p>
          </div>
        </section>

        {/* Session Management Card */}
        <section className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
          <div className="p-4 border-b border-surface-variant flex justify-between items-center">
            <div>
              <h2 className="font-headline-sm text-primary">Active Sessions ({apiData?.active_sessions || 2})</h2>
              <p className="font-body-md text-on-surface-variant mt-1">Devices currently logged into your account.</p>
            </div>
            <button className="font-label-md text-error hover:bg-error-container hover:text-on-error-container px-3 py-1.5 rounded-lg transition-colors">
              Sign Out All
            </button>
          </div>
          <div className="p-0">
            {/* Current Device */}
            <div className="flex items-start justify-between p-4 border-b border-surface-variant">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container mt-1">
                  <Smartphone size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-label-md text-on-surface">iPhone 14 Pro</h3>
                    <span className="bg-secondary-container text-on-secondary-container text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">This Device</span>
                  </div>
                  <p className="font-body-md text-on-surface-variant text-sm mt-1">Mumbai, India • Active Now</p>
                  <p className="font-label-sm text-outline font-normal mt-1">SahaVest App v2.4.1</p>
                </div>
              </div>
            </div>

            {/* Other Device */}
            <div className="flex items-start justify-between p-4 hover:bg-surface-container-low transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant mt-1">
                  <Laptop size={20} />
                </div>
                <div>
                  <h3 className="font-label-md text-on-surface">MacBook Air M2</h3>
                  <p className="font-body-md text-on-surface-variant text-sm mt-1">Delhi, India • Last active: 2 hours ago</p>
                  <p className="font-label-sm text-outline font-normal mt-1">Web Browser (Chrome)</p>
                </div>
              </div>
              <button aria-label="Sign out device" className="w-[44px] h-[44px] flex items-center justify-center text-outline hover:text-error transition-colors rounded-full">
                <LogOut size={24} />
              </button>
            </div>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="mt-8 mb-8">
          <button className="w-full h-[56px] flex items-center justify-center gap-3 bg-surface-container border border-outline-variant text-on-surface font-label-md rounded-xl hover:bg-surface-variant transition-colors active:scale-[0.98]">
            <RotateCcw size={24} />
            Change Account Password
          </button>
        </section>

      </main>
    </div>
  );
}
