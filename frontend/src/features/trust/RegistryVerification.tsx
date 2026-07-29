import React from 'react';
import { ArrowLeft, Bell, Search, Shield, User, Gavel, Clock, BadgeCheck, Network, History, ScrollText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/common/Header';

export function RegistryVerification() {
  const navigate = useNavigate();

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col antialiased pb-24 md:pb-0">
      <header className="w-full top-0 sticky z-40 bg-surface border-b border-outline-variant flex items-center h-14 px-4 transition-colors duration-200">
        <button onClick={() => navigate(-1)} className="w-10 h-10 -ml-2 flex items-center justify-center text-on-surface-variant hover:bg-surface-container rounded-full active:scale-95 transition-all">
          <ArrowLeft size={24} />
        </button>
        <Header />
        <h1 className="font-headline-sm text-on-surface ml-2 md:hidden">Registry Details</h1>
        
        <div className="ml-auto hidden md:flex items-center">
          <button className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container transition-colors duration-200">
            <Bell size={24} />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 md:px-8 pt-6 md:pt-8 pb-8 space-y-6 w-full flex-grow">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-display-lg-mobile md:font-display-lg text-on-surface">FinSecure Advisors LLP</h2>
              <p className="font-body-lg text-on-surface-variant mt-1">SEBI Registered Investment Advisor (RIA)</p>
            </div>
            <div className="hidden sm:flex flex-col items-end">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-sm">
                <BadgeCheck size={16} className="fill-secondary-container" />
                Active
              </span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 pt-3">
            <div className="flex items-center gap-1 text-outline font-label-sm">
              <Gavel size={16} />
              <span>Source: SEBI Official Registry</span>
            </div>
            <div className="flex items-center gap-1 text-outline font-label-sm">
              <Clock size={16} />
              <span>Last synced: Today, 09:41 AM</span>
            </div>
          </div>
          
          <div className="sm:hidden mt-3">
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm">
              <BadgeCheck size={16} className="fill-secondary-container" />
              Status: Active Registration
            </span>
          </div>
        </div>

        <section className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 md:p-6">
          <h3 className="font-headline-sm text-on-surface flex items-center gap-2 mb-4 border-b border-outline-variant pb-2">
            <BadgeCheck className="text-primary" size={24} />
            Registration Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
            <div className="space-y-1">
              <p className="font-label-sm text-on-surface-variant">SEBI Registration Number</p>
              <p className="font-body-md text-on-surface font-medium tracking-wide">INA000012345</p>
            </div>
            <div className="space-y-1">
              <p className="font-label-sm text-on-surface-variant">Principal Officer</p>
              <p className="font-body-md text-on-surface">Arun Sharma</p>
            </div>
            <div className="space-y-1">
              <p className="font-label-sm text-on-surface-variant">Registered Office</p>
              <p className="font-body-md text-on-surface">401, Nariman Bhavan, Nariman Point, Mumbai, Maharashtra 400021</p>
            </div>
            <div className="space-y-1">
              <p className="font-label-sm text-on-surface-variant">Entity Type</p>
              <p className="font-body-md text-on-surface">Limited Liability Partnership</p>
            </div>
          </div>
        </section>

        <section className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 md:p-6">
          <h3 className="font-headline-sm text-on-surface flex items-center gap-2 mb-4 border-b border-outline-variant pb-2">
            <Network className="text-primary" size={24} />
            Authorized Service Scope
          </h3>
          <p className="font-body-md text-on-surface-variant mb-4">
            This entity is authorized by SEBI to provide the following services. Engaging them for services outside this scope is not protected under SEBI regulations.
          </p>
          <ul className="space-y-3">
            <li className="flex items-start gap-3 p-3 rounded-lg bg-surface-container-low">
              <BadgeCheck className="text-secondary mt-0.5 shrink-0" size={20} />
              <div>
                <p className="font-label-md text-on-surface font-semibold">Investment Advisory</p>
                <p className="font-body-md text-on-surface-variant text-sm mt-0.5">Advice relating to investing in, purchasing, selling or otherwise dealing in securities or investment products.</p>
              </div>
            </li>
            <li className="flex items-start gap-3 p-3 rounded-lg bg-surface-container-low">
              <BadgeCheck className="text-secondary mt-0.5 shrink-0" size={20} />
              <div>
                <p className="font-label-md text-on-surface font-semibold">Financial Planning</p>
                <p className="font-body-md text-on-surface-variant text-sm mt-0.5">Comprehensive financial planning, risk profiling, and asset allocation strategies.</p>
              </div>
            </li>
            <li className="flex items-start gap-3 p-3 rounded-lg bg-surface-container-low opacity-60">
              <div className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-error flex items-center justify-center">
                <span className="w-3 h-0.5 bg-white rounded-full"></span>
              </div>
              <div>
                <p className="font-label-md text-on-surface font-semibold">Execution Services (Direct)</p>
                <p className="font-body-md text-on-surface-variant text-sm mt-0.5">Not authorized to directly execute trades on behalf of clients without separate brokerage registration.</p>
              </div>
            </li>
          </ul>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 md:p-6 flex flex-col">
            <h3 className="font-headline-sm text-on-surface flex items-center gap-2 mb-4 border-b border-outline-variant pb-2">
              <ScrollText className="text-primary" size={24} />
              Complaints History
            </h3>
            <div className="flex-grow flex flex-col justify-center items-center py-6 bg-surface-container-low rounded-lg border border-dashed border-outline-variant">
              <BadgeCheck className="text-outline mb-3" size={36} />
              <p className="font-body-md text-on-surface font-medium text-center">No SEBI Complaints</p>
              <p className="font-label-sm text-on-surface-variant text-center mt-1">Zero unresolved grievances on SCORES portal as of last sync.</p>
            </div>
            <a className="mt-4 text-primary font-label-md flex items-center justify-center gap-1 hover:underline min-h-[44px]" href="#">
              View Detailed SCORES Report
            </a>
          </section>

          <section className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 md:p-6">
            <h3 className="font-headline-sm text-on-surface flex items-center gap-2 mb-4 border-b border-outline-variant pb-2">
              <History className="text-primary" size={24} />
              Registration Timeline
            </h3>
            <div className="relative border-l-2 border-surface-variant ml-3 mt-4 space-y-6 pb-3">
              <div className="relative pl-6">
                <div className="absolute w-3 h-3 bg-secondary rounded-full -left-[7px] top-1.5 ring-4 ring-surface-container-lowest"></div>
                <p className="font-label-sm text-secondary font-semibold">Active Status</p>
                <p className="font-body-md text-on-surface">Valid until Dec 31, 2028</p>
              </div>
              <div className="relative pl-6">
                <div className="absolute w-3 h-3 bg-outline-variant rounded-full -left-[7px] top-1.5 ring-4 ring-surface-container-lowest"></div>
                <p className="font-label-sm text-on-surface-variant">Last Renewal</p>
                <p className="font-body-md text-on-surface">Jan 01, 2024</p>
              </div>
              <div className="relative pl-6">
                <div className="absolute w-3 h-3 bg-outline-variant rounded-full -left-[7px] top-1.5 ring-4 ring-surface-container-lowest"></div>
                <p className="font-label-sm text-on-surface-variant">Initial Registration</p>
                <p className="font-body-md text-on-surface">Jan 01, 2014</p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
