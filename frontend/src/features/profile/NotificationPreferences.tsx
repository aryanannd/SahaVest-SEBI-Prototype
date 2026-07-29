import React, { useState, useEffect } from 'react';
import { ArrowLeft, ShieldAlert, LineChart, ClipboardCheck, GraduationCap, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

export function NotificationPreferences() {
  const navigate = useNavigate();
  const [portfolioUpdates, setPortfolioUpdates] = useState(true);
  const [grievanceStatus, setGrievanceStatus] = useState(true);
  const [learningReminders, setLearningReminders] = useState(false);

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        if (session) headers['Authorization'] = `Bearer ${session.access_token}`;
        const res = await fetch('http://localhost:3000/api/profile/notifications/me', { headers });
        const data = await res.json();
        if (data.email_alerts !== undefined) setPortfolioUpdates(data.email_alerts);
        if (data.push_alerts !== undefined) setGrievanceStatus(data.push_alerts);
      } catch (err) {
        console.error(err);
      }
    }
    fetchNotifications();
  }, []);

  return (
    <div className="bg-background text-on-background antialiased md:bg-surface-container-low min-h-screen">
      {/* Top App Bar */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 h-[56px] bg-surface shadow-sm border-b border-outline-variant md:max-w-2xl md:mx-auto md:relative md:mt-8 md:rounded-t-xl md:border-t md:border-x">
        <button 
          onClick={() => navigate(-1)}
          aria-label="Go back" 
          className="w-[44px] h-[44px] flex items-center justify-center text-on-surface hover:bg-surface-container-low rounded-full transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="font-headline-sm-mobile text-on-surface font-semibold flex-1 text-center mr-[44px]">Notification Preferences</h1>
      </header>

      {/* Main Content Canvas */}
      <main className="pt-[72px] pb-[96px] px-4 md:max-w-2xl md:mx-auto md:pt-0 md:bg-surface md:border-x md:border-b md:rounded-b-xl md:shadow-sm md:px-6 min-h-screen md:min-h-0">
        <div className="mb-6 mt-3">
          <p className="font-body-md text-on-surface-variant">
            Manage how and when SahaVest communicates with you. We prioritize your security and focus, delivering only what matters.
          </p>
        </div>

        {/* Section: Critical Alerts */}
        <section className="mb-8 bg-surface-container-lowest rounded-xl border border-outline-variant/50 shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-surface-container-low border-b border-outline-variant/50">
            <h2 className="font-label-md text-on-surface-variant uppercase tracking-wider">Critical</h2>
          </div>
          {/* Item: Trust & Safety */}
          <div className="flex items-start justify-between p-4 hover:bg-surface-container-low/50 transition-colors">
            <div className="flex-1 pr-4">
              <div className="flex items-center gap-2 mb-1">
                <ShieldAlert className="text-error fill-current stroke-white" size={20} />
                <h3 className="font-headline-sm text-on-surface text-[16px]">Trust & Safety Alerts</h3>
              </div>
              <p className="font-body-md text-on-surface-variant text-[14px]">
                Immediate alerts for unusual login attempts, changes to banking details, and critical account security events. <span className="text-error font-medium">Cannot be disabled.</span>
              </p>
            </div>
            <div className="flex items-center h-[44px]">
              <Lock size={20} className="text-on-surface-variant/50" />
            </div>
          </div>
        </section>

        {/* Section: Portfolio & Operations */}
        <section className="mb-8 bg-surface-container-lowest rounded-xl border border-outline-variant/50 shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-surface-container-low border-b border-outline-variant/50">
            <h2 className="font-label-md text-on-surface-variant uppercase tracking-wider">Investments & Support</h2>
          </div>
          
          {/* Item: Portfolio Updates */}
          <div className="flex items-start justify-between p-4 border-b border-outline-variant/30 hover:bg-surface-container-low/50 transition-colors">
            <div className="flex-1 pr-4">
              <div className="flex items-center gap-2 mb-1">
                <LineChart className="text-primary fill-current" size={20} />
                <h3 className="font-headline-sm text-on-surface text-[16px]">Portfolio Updates</h3>
              </div>
              <p className="font-body-md text-on-surface-variant text-[14px]">
                Weekly summaries of your portfolio's performance, dividend credits, and rebalancing recommendations.
              </p>
            </div>
            <div className="flex items-center h-[44px]">
              <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                <input 
                  type="checkbox" 
                  checked={portfolioUpdates}
                  onChange={(e) => setPortfolioUpdates(e.target.checked)}
                  className={`absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer z-10 transition-all ${portfolioUpdates ? 'right-0 border-primary' : 'left-0 border-outline-variant'}`}
                />
                <div className={`block overflow-hidden h-6 rounded-full cursor-pointer transition-colors ${portfolioUpdates ? 'bg-primary' : 'bg-outline-variant'}`}></div>
              </div>
            </div>
          </div>

          {/* Item: Grievance Status */}
          <div className="flex items-start justify-between p-4 hover:bg-surface-container-low/50 transition-colors">
            <div className="flex-1 pr-4">
              <div className="flex items-center gap-2 mb-1">
                <ClipboardCheck className="text-secondary fill-current stroke-white" size={20} />
                <h3 className="font-headline-sm text-on-surface text-[16px]">Grievance Status</h3>
              </div>
              <p className="font-body-md text-on-surface-variant text-[14px]">
                Real-time updates on active support tickets, resolution timelines, and regulatory compliance queries.
              </p>
            </div>
            <div className="flex items-center h-[44px]">
              <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                <input 
                  type="checkbox" 
                  checked={grievanceStatus}
                  onChange={(e) => setGrievanceStatus(e.target.checked)}
                  className={`absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer z-10 transition-all ${grievanceStatus ? 'right-0 border-primary' : 'left-0 border-outline-variant'}`}
                />
                <div className={`block overflow-hidden h-6 rounded-full cursor-pointer transition-colors ${grievanceStatus ? 'bg-primary' : 'bg-outline-variant'}`}></div>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Education */}
        <section className="mb-8 bg-surface-container-lowest rounded-xl border border-outline-variant/50 shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-surface-container-low border-b border-outline-variant/50">
            <h2 className="font-label-md text-on-surface-variant uppercase tracking-wider">Education</h2>
          </div>
          
          {/* Item: Learning Reminders */}
          <div className="flex items-start justify-between p-4 hover:bg-surface-container-low/50 transition-colors">
            <div className="flex-1 pr-4">
              <div className="flex items-center gap-2 mb-1">
                <GraduationCap className="text-tertiary fill-current" size={20} />
                <h3 className="font-headline-sm text-on-surface text-[16px]">Learning Reminders</h3>
              </div>
              <p className="font-body-md text-on-surface-variant text-[14px]">
                Nudges to complete pending modules in the SahaVest Academy and updates on new financial literacy courses.
              </p>
            </div>
            <div className="flex items-center h-[44px]">
              <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                <input 
                  type="checkbox" 
                  checked={learningReminders}
                  onChange={(e) => setLearningReminders(e.target.checked)}
                  className={`absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer z-10 transition-all ${learningReminders ? 'right-0 border-primary' : 'left-0 border-outline-variant'}`}
                />
                <div className={`block overflow-hidden h-6 rounded-full cursor-pointer transition-colors ${learningReminders ? 'bg-primary' : 'bg-outline-variant'}`}></div>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-6">
          <button className="w-full bg-primary text-on-primary h-[56px] rounded-full font-label-md font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center min-h-[44px]">
            Save Preferences
          </button>
        </div>
      </main>
    </div>
  );
}
