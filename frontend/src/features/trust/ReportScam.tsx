import React, { useState } from 'react';
import { ArrowLeft, ChevronDown, Flag, UploadCloud, CheckCircle, Bell, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/common/Header';

export function ReportScam() {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [hasEvidence, setHasEvidence] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const closeModal = () => {
    setSubmitted(false);
    navigate(-1);
  };

  return (
    <div className="bg-background text-on-background min-h-screen pb-24 md:pb-0 antialiased flex flex-col font-body-md">
      <header className="w-full top-0 sticky z-40 bg-surface dark:bg-surface-dim border-b border-outline-variant dark:border-outline flex justify-between items-center h-14 px-4">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)} aria-label="Go back" className="w-[44px] h-[44px] flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low transition-colors rounded-full active:scale-95 duration-100">
            <ArrowLeft size={24} />
          </button>
        </div>
        <Header />
        <button aria-label="notifications" className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container transition-colors duration-200">
          <Bell size={24} />
        </button>
      </header>

      <main className="flex-grow flex flex-col items-center w-full px-4 pt-6 pb-8 max-w-3xl mx-auto">
        <div className="w-full mb-6 text-center md:text-left">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-error-container text-on-error-container mb-2">
            <ShieldIcon />
          </div>
          <h1 className="font-headline-md text-on-background mb-1">Report an Issue</h1>
          <p className="font-body-md text-on-surface-variant max-w-xl">
            Your report helps protect the entire community. Please provide as much detail as possible to assist our security team.
          </p>
        </div>

        <div className="w-full bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container-high p-4 md:p-6">
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-1">
              <label className="font-label-md text-on-surface-variant" htmlFor="scamType">Type of Issue *</label>
              <div className="relative">
                <select 
                  className="w-full appearance-none bg-surface border border-outline-variant rounded-lg px-4 py-3 font-body-md text-on-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-shadow min-h-[44px]" 
                  id="scamType" 
                  required
                  defaultValue=""
                >
                  <option disabled value="">Select a category</option>
                  <option value="phishing">Phishing Attempt</option>
                  <option value="fake_investment">Fake Investment Opportunity</option>
                  <option value="impersonation">Account Impersonation</option>
                  <option value="spam">Suspicious Spam</option>
                  <option value="other">Other</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-on-surface-variant">
                  <ChevronDown size={24} />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-label-md text-on-surface-variant" htmlFor="description">Description *</label>
              <textarea 
                className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-3 font-body-md text-on-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-shadow resize-y min-h-[100px]" 
                id="description" 
                placeholder="Describe what happened, when it occurred, and any suspicious links or messages." 
                required 
                rows={4}
              />
            </div>

            <div className="flex flex-col gap-3 p-3 rounded-lg bg-surface-container-low border border-surface-container-high mt-2">
              <div className="flex items-start gap-3">
                <div className="flex items-center h-6">
                  <input 
                    className="w-5 h-5 text-primary border-outline rounded focus:ring-primary bg-surface min-w-[44px] min-h-[44px] md:min-w-[20px] md:min-h-[20px]" 
                    id="linkEvidence" 
                    type="checkbox"
                    checked={hasEvidence}
                    onChange={(e) => setHasEvidence(e.target.checked)}
                  />
                </div>
                <div className="flex flex-col">
                  <label className="font-label-md text-on-background cursor-pointer" htmlFor="linkEvidence">I have evidence to attach (Optional)</label>
                  <p className="font-label-sm text-on-surface-variant mt-1">Upload screenshots, documents, or link original checks to support your claim.</p>
                </div>
              </div>

              {hasEvidence && (
                <div className="mt-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-outline-variant border-dashed rounded-lg cursor-pointer bg-surface hover:bg-surface-container transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <UploadCloud className="text-on-surface-variant mb-1" size={24} />
                      <p className="font-label-sm text-on-surface-variant">Tap to select a file</p>
                    </div>
                    <input accept="image/*,.pdf" className="hidden" type="file" />
                  </label>
                </div>
              )}
            </div>

            <div className="mt-4">
              <button 
                className="w-full bg-primary text-on-primary font-label-md rounded-lg py-3 px-4 flex items-center justify-center gap-2 min-h-[44px] hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm" 
                type="submit"
              >
                <Flag size={20} className="fill-current" />
                Submit Report
              </button>
            </div>
          </form>
        </div>
      </main>

      {submitted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-background/40 backdrop-blur-sm px-4 animate-in fade-in duration-300">
          <div className="bg-surface-container-lowest rounded-xl shadow-lg p-6 w-full max-w-sm flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center mb-4">
              <CheckCircle size={40} className="fill-secondary-container text-on-secondary-container" />
            </div>
            <h2 className="font-headline-sm text-on-background mb-2">Report Submitted</h2>
            <p className="font-body-md text-on-surface-variant mb-6">
              Thank you. We have received your report and our security team will review it shortly to keep SahaVest safe.
            </p>
            <button 
              onClick={closeModal}
              className="w-full bg-surface-container-high text-on-surface font-label-md rounded-lg py-3 px-4 min-h-[44px] hover:bg-surface-variant transition-colors"
            >
              Return to Safety Center
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ShieldIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
      <path d="M480-120q-121-66-192.5-179T216-560v-212l264-96 264 96v212q0 148-71.5 261T480-120Zm0-86q97-54 152.5-146.5T688-560v-145l-208-76-208 76v145q0 115 55.5 207.5T480-206Zm0-294Z"/>
    </svg>
  );
}
