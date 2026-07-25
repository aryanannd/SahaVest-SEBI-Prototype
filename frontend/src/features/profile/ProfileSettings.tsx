import React from 'react';
import { User, Shield, Bell, Settings, Lock, HelpCircle, FileText, Scale, LogOut, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function ProfileSettings() {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/onboarding');
  };

  return (
    <div className="flex-1 flex flex-col bg-surface overflow-y-auto px-4 pt-4 pb-32">
      <h1 className="font-headline-md text-on-surface mb-6">Profile & Settings</h1>

      {/* User Info Card */}
      <div className="bg-primary-container rounded-xl p-5 mb-6 shadow-sm">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-primary text-on-primary rounded-full flex items-center justify-center font-headline-md">
            AV
          </div>
          <div>
            <h2 className="font-headline-sm text-on-primary-container">Anand V.</h2>
            <p className="font-body-md text-on-primary-container/80 text-sm">+91 98765 43210</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-[#E6F4EA] text-[#0D532A] px-3 py-1.5 rounded-lg w-fit">
          <CheckCircle2 size={16} />
          <span className="font-label-sm uppercase tracking-wider">KYC Verified</span>
        </div>
      </div>

      {/* Risk Profile */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 mb-6 shadow-sm">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-label-md text-on-surface-variant uppercase tracking-wider">Risk Profile</h3>
          <span className="bg-primary text-on-primary px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider">Moderate</span>
        </div>
        <p className="font-body-md text-sm text-on-surface-variant">
          Retail investor focused on long-term wealth creation. Primary investment interests include mutual funds and sovereign gold bonds.
        </p>
      </div>

      {/* Settings Sections */}
      <div className="space-y-4">
        {/* Account & Security */}
        <div>
          <h3 className="font-label-md text-on-surface-variant uppercase tracking-wider mb-2 px-1">Account & Security</h3>
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
            <button className="w-full flex items-center justify-between p-4 hover:bg-surface-container-low transition-colors border-b border-surface-variant">
              <div className="flex items-center gap-3">
                <Lock className="text-primary" size={20} />
                <span className="font-body-md text-on-surface">App Lock & Biometrics</span>
              </div>
              <ChevronRight size={20} className="text-on-surface-variant" />
            </button>
            <button className="w-full flex items-center justify-between p-4 hover:bg-surface-container-low transition-colors border-b border-surface-variant">
              <div className="flex items-center gap-3">
                <Bell className="text-primary" size={20} />
                <span className="font-body-md text-on-surface">Notification Preferences</span>
              </div>
              <ChevronRight size={20} className="text-on-surface-variant" />
            </button>
            <button className="w-full flex items-center justify-between p-4 hover:bg-surface-container-low transition-colors">
              <div className="flex items-center gap-3">
                <Settings className="text-primary" size={20} />
                <span className="font-body-md text-on-surface">Language & Accessibility</span>
              </div>
              <ChevronRight size={20} className="text-on-surface-variant" />
            </button>
          </div>
        </div>

        {/* Compliance & Trust */}
        <div>
          <h3 className="font-label-md text-on-surface-variant uppercase tracking-wider mb-2 px-1">Compliance & Trust</h3>
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
            <button onClick={() => navigate('/audit')} className="w-full flex items-center justify-between p-4 hover:bg-surface-container-low transition-colors border-b border-surface-variant">
              <div className="flex items-center gap-3">
                <Shield className="text-primary" size={20} />
                <span className="font-body-md text-on-surface">AI Audit Trail</span>
              </div>
              <ChevronRight size={20} className="text-on-surface-variant" />
            </button>
            <button onClick={() => navigate('/grievance')} className="w-full flex items-center justify-between p-4 hover:bg-surface-container-low transition-colors border-b border-surface-variant">
              <div className="flex items-center gap-3">
                <Scale className="text-primary" size={20} />
                <span className="font-body-md text-on-surface">File a Grievance (SCORES)</span>
              </div>
              <ChevronRight size={20} className="text-on-surface-variant" />
            </button>
            <button onClick={() => navigate('/privacy')} className="w-full flex items-center justify-between p-4 hover:bg-surface-container-low transition-colors">
              <div className="flex items-center gap-3">
                <FileText className="text-primary" size={20} />
                <span className="font-body-md text-on-surface">Privacy Center (DPDP Act)</span>
              </div>
              <ChevronRight size={20} className="text-on-surface-variant" />
            </button>
          </div>
        </div>

        {/* Support */}
        <div>
          <h3 className="font-label-md text-on-surface-variant uppercase tracking-wider mb-2 px-1">Support</h3>
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
            <button className="w-full flex items-center justify-between p-4 hover:bg-surface-container-low transition-colors">
              <div className="flex items-center gap-3">
                <HelpCircle className="text-primary" size={20} />
                <span className="font-body-md text-on-surface">Help & Support Chat</span>
              </div>
              <ChevronRight size={20} className="text-on-surface-variant" />
            </button>
          </div>
        </div>
      </div>

      <button 
        onClick={handleLogout}
        className="mt-8 w-full bg-error/10 text-error font-label-md py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-error/20 transition-colors"
      >
        <LogOut size={18} /> Log Out
      </button>
      
      <p className="text-center text-[10px] text-on-surface-variant mt-4 mb-8">
        SahaVest v1.0.0 (Build 42)
      </p>
    </div>
  );
}
