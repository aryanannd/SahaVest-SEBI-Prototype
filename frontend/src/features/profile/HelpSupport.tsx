import React from 'react';
import { Menu, Bell, Search, Bot, MessageSquare, Link as LinkIcon, ShieldAlert, ShieldCheck, Landmark, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/common/Header';

export function HelpSupport() {
  const navigate = useNavigate();

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col pt-[56px] pb-[80px] md:pb-0">
      {/* TopAppBar */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 h-[56px] bg-surface border-b border-outline-variant shadow-sm transition-transform duration-150">
        <div className="flex items-center gap-4">
          <button className="text-on-surface-variant hover:bg-surface-container-low p-2 rounded-full min-h-[44px] min-w-[44px] flex items-center justify-center">
            <Menu size={24} />
          </button>
          <Header />
        </div>
        <div>
          <button className="text-on-surface-variant hover:bg-surface-container-low p-2 rounded-full min-h-[44px] min-w-[44px] flex items-center justify-center">
            <Bell size={24} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow px-4 py-6 max-w-4xl mx-auto w-full">
        <div className="mb-6">
          <h2 className="font-display-lg-mobile md:font-display-lg text-primary mb-3">How can we help?</h2>
          <p className="font-body-md text-on-surface-variant">Find answers to common questions or reach out to our support team.</p>
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" size={24} />
          <input 
            className="w-full pl-12 pr-4 py-4 bg-surface-container-lowest border border-outline-variant rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none font-body-md transition-shadow shadow-sm" 
            placeholder="Search for articles..." 
            type="text"
          />
        </div>

        {/* AI Assistant Banner */}
        <div className="bg-primary-container rounded-xl p-4 mb-8 flex flex-col md:flex-row items-center gap-4 relative overflow-hidden shadow-sm border border-outline-variant">
          <div className="absolute -right-12 -top-12 opacity-10">
            <Bot size={120} />
          </div>
          <div className="bg-surface-container-lowest p-3 rounded-full flex-shrink-0 z-10 shadow-sm">
            <MessageSquare size={32} className="text-primary fill-current" />
          </div>
          <div className="flex-grow text-center md:text-left z-10">
            <h3 className="font-headline-sm text-on-primary-container mb-1">Ask our AI Assistant</h3>
            <p className="font-body-md text-on-primary-container opacity-90">Get instant answers to your questions 24/7.</p>
          </div>
          <button 
            className="bg-primary text-on-primary font-label-md px-6 py-3 rounded-lg min-h-[44px] whitespace-nowrap z-10 hover:opacity-90 transition-opacity"
            onClick={() => navigate('/ai')}
          >
            Start Chat
          </button>
        </div>

        {/* FAQ Categories */}
        <h3 className="font-headline-sm text-primary mb-4">FAQ Categories</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          
          <button className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex items-start gap-4 hover:bg-surface-container-low transition-colors shadow-sm min-h-[44px] text-left">
            <div className="bg-surface-container p-2 rounded-lg text-primary mt-1">
              <LinkIcon size={24} />
            </div>
            <div>
              <h4 className="font-label-md text-on-surface mb-1">Linking Accounts</h4>
              <p className="font-body-md text-on-surface-variant text-sm">Bank linking, troubleshooting, verified accounts.</p>
            </div>
          </button>

          <button className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex items-start gap-4 hover:bg-surface-container-low transition-colors shadow-sm min-h-[44px] text-left">
            <div className="bg-surface-container p-2 rounded-lg text-primary mt-1">
              <ShieldAlert size={24} />
            </div>
            <div>
              <h4 className="font-label-md text-on-surface mb-1">Scam Checker</h4>
              <p className="font-body-md text-on-surface-variant text-sm">Identifying fraud, reporting suspicious activity.</p>
            </div>
          </button>

          <button className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex items-start gap-4 hover:bg-surface-container-low transition-colors shadow-sm min-h-[44px] text-left">
            <div className="bg-surface-container p-2 rounded-lg text-primary mt-1">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 className="font-label-md text-on-surface mb-1">KYC & Verification</h4>
              <p className="font-body-md text-on-surface-variant text-sm">Document requirements, verification process times.</p>
            </div>
          </button>

          <button className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex items-start gap-4 hover:bg-surface-container-low transition-colors shadow-sm min-h-[44px] text-left">
            <div className="bg-surface-container p-2 rounded-lg text-primary mt-1">
              <Landmark size={24} />
            </div>
            <div>
              <h4 className="font-label-md text-on-surface mb-1">Deposits & Withdrawals</h4>
              <p className="font-body-md text-on-surface-variant text-sm">Processing times, limits, missing transfers.</p>
            </div>
          </button>

        </div>

        {/* Contact Support */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 text-center shadow-sm">
          <h3 className="font-headline-sm text-on-surface mb-3">Still need help?</h3>
          <p className="font-body-md text-on-surface-variant mb-6">Our dedicated support team is available Mon-Fri, 9am - 6pm IST.</p>
          <button className="bg-primary text-on-primary font-label-md px-8 py-3 rounded-lg min-h-[44px] w-full md:w-auto hover:bg-on-primary-fixed-variant transition-colors flex items-center justify-center gap-2 mx-auto">
            <Mail size={20} className="fill-current stroke-white" />
            Contact Support
          </button>
        </div>

      </main>
    </div>
  );
}
