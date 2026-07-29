import React from 'react';
import { ArrowLeft, User, Landmark, Smartphone, Bell, Download, Trash2, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function PrivacyCenter() {
  const navigate = useNavigate();

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md">
      {/* TopAppBar */}
      <header className="bg-surface dark:bg-surface-dim w-full sticky top-0 z-50 border-b border-outline-variant dark:border-outline">
        <div className="flex items-center justify-between px-4 py-3 w-full max-w-7xl mx-auto">
          <button 
            onClick={() => navigate(-1)}
            className="text-on-surface-variant hover:bg-surface-container-low transition-colors active:scale-95 duration-100 p-2 rounded-full flex items-center justify-center min-w-[44px] min-h-[44px]"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="font-headline-md text-primary dark:text-primary-fixed tracking-tight">Data Privacy Center</h1>
          <div className="w-[44px]"></div> {/* Spacer for centering */}
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 py-6 grid grid-cols-4 md:grid-cols-8 gap-4 md:gap-6 pb-32">
        <div className="col-span-4 md:col-span-8 mb-4">
          <h2 className="font-headline-sm text-on-surface mb-2">Your Data, Your Control</h2>
          <p className="font-body-md text-on-surface-variant">Review the information SahaVest uses to provide you with secure financial services. We believe in complete transparency and give you full control over your data footprint.</p>
        </div>

        {/* Data Categories List */}
        <section className="col-span-4 md:col-span-5 flex flex-col gap-3">
          
          <div className="bg-surface-container-lowest rounded-lg border border-outline-variant p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="bg-primary-container text-on-primary-container p-3 rounded-full flex items-center justify-center">
                <User size={24} className="fill-current text-primary-container stroke-on-primary-container" />
              </div>
              <div>
                <h3 className="font-headline-sm text-on-surface">Personal Information</h3>
                <p className="font-body-md text-on-surface-variant">Name, Date of Birth, PAN, KYC details.</p>
              </div>
            </div>
            <button className="font-label-md text-primary bg-surface-container-low hover:bg-surface-container-high px-4 py-2 rounded-full transition-colors min-h-[44px]">Manage</button>
          </div>

          <div className="bg-surface-container-lowest rounded-lg border border-outline-variant p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="bg-primary-container text-on-primary-container p-3 rounded-full flex items-center justify-center">
                <Landmark size={24} className="fill-current text-primary-container stroke-on-primary-container" />
              </div>
              <div>
                <h3 className="font-headline-sm text-on-surface">Financial Data</h3>
                <p className="font-body-md text-on-surface-variant">Linked bank accounts, transaction history, portfolio holdings.</p>
              </div>
            </div>
            <button className="font-label-md text-primary bg-surface-container-low hover:bg-surface-container-high px-4 py-2 rounded-full transition-colors min-h-[44px]">Manage</button>
          </div>

          <div className="bg-surface-container-lowest rounded-lg border border-outline-variant p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="bg-primary-container text-on-primary-container p-3 rounded-full flex items-center justify-center">
                <Smartphone size={24} className="fill-current text-primary-container stroke-on-primary-container" />
              </div>
              <div>
                <h3 className="font-headline-sm text-on-surface">Device & Usage</h3>
                <p className="font-body-md text-on-surface-variant">App usage patterns, device type, IP address for security.</p>
              </div>
            </div>
            <button className="font-label-md text-primary bg-surface-container-low hover:bg-surface-container-high px-4 py-2 rounded-full transition-colors min-h-[44px]">Manage</button>
          </div>

          <div className="bg-surface-container-lowest rounded-lg border border-outline-variant p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="bg-primary-container text-on-primary-container p-3 rounded-full flex items-center justify-center">
                <Bell size={24} className="fill-current text-primary-container stroke-on-primary-container" />
              </div>
              <div>
                <h3 className="font-headline-sm text-on-surface">Communication Preferences</h3>
                <p className="font-body-md text-on-surface-variant">Marketing emails, push notifications, alerts.</p>
              </div>
            </div>
            <button className="font-label-md text-primary bg-surface-container-low hover:bg-surface-container-high px-4 py-2 rounded-full transition-colors min-h-[44px]">Manage</button>
          </div>

        </section>

        {/* Actions Sidebar */}
        <section className="col-span-4 md:col-span-3 flex flex-col gap-6">
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-sm flex flex-col gap-4">
            <div>
              <h3 className="font-headline-sm text-on-surface mb-2">Data Portability</h3>
              <p className="font-body-md text-on-surface-variant text-sm">Request a copy of your personal and financial data stored with us. The export will be available in a secure format.</p>
            </div>
            <button className="w-full flex items-center justify-center gap-2 bg-primary text-on-primary font-label-md rounded-full h-[48px] hover:bg-primary/90 transition-colors">
              <Download size={20} />
              Download My Data
            </button>
          </div>

          <div className="bg-surface-container-lowest rounded-xl border border-error-container p-6 shadow-sm flex flex-col gap-4">
            <div>
              <h3 className="font-headline-sm text-error mb-2 flex items-center gap-2">
                <AlertTriangle size={24} className="fill-current text-error stroke-white" />
                Danger Zone
              </h3>
              <p className="font-body-md text-on-surface-variant text-sm">Deleting your data or account is irreversible. Please proceed with caution.</p>
            </div>
            <button className="w-full flex items-center justify-center gap-2 border border-outline-variant text-on-surface bg-transparent font-label-md rounded-full h-[48px] hover:bg-surface-container-low transition-colors">
              <Trash2 size={20} />
              Delete Specific Data
            </button>
            <div className="mt-2 pt-4 border-t border-error-container">
              <p className="font-body-md text-error text-sm mb-4 font-medium">This will permanently delete your profile and revoke all active data sharing consents.</p>
              <button className="w-full flex items-center justify-center gap-2 bg-error text-on-error font-label-md rounded-full h-[48px] hover:bg-error/90 transition-colors">
                Delete Account
              </button>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
