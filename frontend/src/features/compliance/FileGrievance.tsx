import { Header } from '../../components/common/Header';
import React, { useState } from 'react';
import { ArrowLeft, Landmark, ShieldCheck, UploadCloud, Send, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

export function FileGrievance() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [category, setCategory] = useState('Unregistered Investment Advisory');
  const [entityName, setEntityName] = useState('Alpha Profit Solutions (Unregistered)');
  const [description, setDescription] = useState('I was contacted via Telegram by an entity claiming to provide guaranteed returns of 5% daily. I transferred ₹50,000 to their account, after which they blocked my number. SahaVest scam check confirms they are not a SEBI registered entity.');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (session) headers['Authorization'] = `Bearer ${session.access_token}`;
      
      const res = await fetch('/api/compliance/grievance', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          category,
          description,
          entity: entityName
        })
      });
      if (res.ok) {
        navigate('/compliance/grievance/track');
      } else {
        alert('Failed to submit grievance');
      }
    } catch (error) {
      console.error(error);
      alert('Error submitting grievance');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-background text-on-background min-h-screen font-body-md antialiased pb-24 md:pb-8">
      {/* TopAppBar */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 h-[56px] bg-surface dark:bg-on-background border-b border-outline-variant dark:border-outline shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="text-on-surface-variant dark:text-outline hover:bg-surface-container-low dark:hover:bg-surface-variant rounded-full p-2 h-[44px] w-[44px] flex items-center justify-center transition-transform duration-150 active:scale-95"
          >
            <ArrowLeft size={24} />
          </button>
          <Header />
        </div>
        <div>
          <span className="font-label-md text-on-surface-variant flex items-center gap-1">
            <ShieldCheck size={18} />
            Secure Filing
          </span>
        </div>
      </header>
      
      {/* Main Content Canvas */}
      <main className="pt-[80px] px-4 max-w-3xl mx-auto">
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2 text-primary">
            <Landmark size={28} className="fill-current" />
            <h2 className="font-display-lg-mobile md:font-display-lg">SEBI SCORES Grievance</h2>
          </div>
          <p className="font-body-md text-on-surface-variant">
            File a formal complaint with the Securities and Exchange Board of India (SEBI). This form is pre-filled with data from your SahaVest analysis.
          </p>
        </div>
        
        {/* Form Card */}
        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant p-6 md:p-8 space-y-8">
          
          {/* Section: Complainant Details (Pre-filled, read-only appearance) */}
          <section>
            <h3 className="font-headline-sm border-b border-surface-variant pb-2 mb-4 text-primary">Complainant Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-label-md text-on-surface-variant mb-1">Full Name</label>
                <div className="bg-surface-container-low px-4 py-3 rounded-lg border border-surface-variant font-body-md">
                  Rahul Sharma
                </div>
              </div>
              <div>
                <label className="block font-label-md text-on-surface-variant mb-1">PAN Number</label>
                <div className="bg-surface-container-low px-4 py-3 rounded-lg border border-surface-variant font-body-md">
                  ABCDE1234F
                </div>
              </div>
              <div>
                <label className="block font-label-md text-on-surface-variant mb-1">Email Address</label>
                <div className="bg-surface-container-low px-4 py-3 rounded-lg border border-surface-variant font-body-md">
                  rahul.sharma@example.com
                </div>
              </div>
              <div>
                <label className="block font-label-md text-on-surface-variant mb-1">Mobile Number</label>
                <div className="bg-surface-container-low px-4 py-3 rounded-lg border border-surface-variant font-body-md">
                  +91 98765 43210
                </div>
              </div>
            </div>
          </section>
          
          {/* Section: Complaint Details */}
          <section>
            <h3 className="font-headline-sm border-b border-surface-variant pb-2 mb-4 text-primary">Complaint Details</h3>
            <form className="space-y-4" onSubmit={handleSubmit} id="grievance-form">
              <div>
                <label className="block font-label-md text-on-surface-variant mb-1">Complaint Category <span className="text-error">*</span></label>
                <select 
                  className="w-full bg-surface-container-lowest px-4 py-3 rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary font-body-md appearance-none"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="Unregistered Investment Advisory">Unregistered Investment Advisory</option>
                  <option value="Non-receipt of Dividend/Interest">Non-receipt of Dividend/Interest</option>
                  <option value="Delay in Demat of Shares">Delay in Demat of Shares</option>
                  <option value="Other Market Manipulation">Other Market Manipulation</option>
                </select>
              </div>
              <div>
                <label className="block font-label-md text-on-surface-variant mb-1">Entity Name (Against whom complaint is filed) <span className="text-error">*</span></label>
                <input 
                  className="w-full bg-surface-container-lowest px-4 py-3 rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary font-body-md" 
                  type="text" 
                  value={entityName}
                  onChange={(e) => setEntityName(e.target.value)}
                />
              </div>
              <div>
                <label className="block font-label-md text-on-surface-variant mb-1">Grievance Description <span className="text-error">*</span></label>
                <textarea 
                  className="w-full bg-surface-container-lowest px-4 py-3 rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary font-body-md" 
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </form>
          </section>
          
          {/* Section: Evidence & Attachments */}
          <section>
            <h3 className="font-headline-sm border-b border-surface-variant pb-2 mb-4 text-primary">Evidence & Attachments</h3>
            
            {/* Pre-attached SahaVest Evidence */}
            <div className="bg-primary-fixed/20 border border-primary-fixed-dim rounded-lg p-4 mb-4 flex items-start gap-4">
              <div className="bg-primary rounded-full p-2 flex-shrink-0">
                <ShieldCheck size={20} className="text-on-primary fill-current" />
              </div>
              <div>
                <h4 className="font-label-md text-primary font-bold">Attached: SahaVest Scam Check Result #SHV-8829</h4>
                <p className="font-body-md text-on-surface-variant mt-1 text-sm">Automated evidence generated from your recent scan, confirming the entity is unverified and associated with known scam indicators.</p>
              </div>
            </div>
            
            {/* Manual Upload */}
            <div>
              <label className="block font-label-md text-on-surface-variant mb-2">Additional Supporting Documents (Screenshots, Bank Statements)</label>
              <div className="border-2 border-dashed border-outline-variant rounded-lg p-6 text-center bg-surface-container-low hover:bg-surface-variant transition-colors cursor-pointer flex flex-col items-center justify-center">
                <UploadCloud size={32} className="text-outline mb-2" />
                <p className="font-label-md text-primary">Click to upload or drag and drop</p>
                <p className="font-label-sm text-on-surface-variant mt-1">PDF, JPG, PNG (Max 5MB per file)</p>
              </div>
            </div>
          </section>
          
          {/* Actions */}
          <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-end border-t border-surface-variant">
            <button type="button" className="h-[44px] px-6 rounded-full font-label-md border border-outline text-primary hover:bg-surface-container transition-colors">
              Save Draft
            </button>
            <button 
              type="submit" 
              form="grievance-form" 
              disabled={isSubmitting}
              className="h-[44px] px-8 rounded-full font-label-md bg-primary text-on-primary hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send size={18} />
                  Submit to SCORES
                </>
              )}
            </button>
          </div>
          
        </div>
        
        {/* Trust Indicator */}
        <div className="mt-6 mb-8 text-center flex flex-col items-center justify-center gap-2 text-on-surface-variant opacity-70">
          <div className="flex items-center gap-2">
            <Lock size={16} />
            <span className="font-label-sm">Your data is transmitted securely to SEBI APIs.</span>
          </div>
          <div className="bg-surface-container border border-outline-variant/50 rounded-lg px-3 py-1.5 mt-2">
            <span className="font-label-sm text-outline">
              🔬 Demo mode — Your grievance is saved securely in SahaVest's audit trail with a tracking ID. Submission to SEBI's SCORES portal requires manual/API partnership access (SEBI does not currently expose a public REST API for this).
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
