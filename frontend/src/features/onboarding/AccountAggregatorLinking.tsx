import React, { useRef, useState } from 'react';
import { X, Building2, Landmark, LineChart, Wallet, Shield, FileText, Loader2, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

export function AccountAggregatorLinking() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const password = prompt('Enter CAS Password (usually your PAN in uppercase):') || '';

    setUploading(true);
    const formData = new FormData();
    formData.append('casFile', file);
    formData.append('userId', 'me');
    formData.append('password', password);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = {};
      if (session) headers['Authorization'] = `Bearer ${session.access_token}`;

      const res = await fetch('/api/portfolio/upload-cas', {
        method: 'POST',
        headers,
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        if (data.partialDataWarning) {
          alert(data.partialDataWarning);
        }
        setUploadSuccess(true);
        setTimeout(() => {
          navigate('/onboarding/linking-summary');
        }, 1500);
      } else {
        console.error('Upload failed:', data.error);
        alert(data.error || 'Failed to parse CAS file.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error while uploading CAS file.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col items-center justify-center font-body-md antialiased p-4">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant p-6 md:p-8 flex flex-col">
        
        {/* Close / Back Action */}
        <div className="flex justify-end mb-3">
          <button 
            onClick={() => navigate(-1)}
            className="w-[44px] h-[44px] flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors active:scale-95 duration-100"
          >
            <X size={24} />
          </button>
        </div>
        
        {/* Graphic Area */}
        <div className="relative w-full h-[200px] mb-6 flex items-center justify-center overflow-hidden rounded-lg bg-surface-container-lowest">
          
          {/* Connecting Lines (SVG) */}
          <svg className="absolute inset-0 w-full h-full text-outline-variant opacity-50" preserveAspectRatio="none" viewBox="0 0 100 100">
            <path d="M 50,50 L 20,20" stroke="currentColor" strokeDasharray="2,2" strokeWidth="1"></path>
            <path d="M 50,50 L 80,80" stroke="currentColor" strokeDasharray="2,2" strokeWidth="1"></path>
            <path d="M 50,50 L 30,80" stroke="currentColor" strokeDasharray="2,2" strokeWidth="1"></path>
          </svg>

          {/* Center Node (SahaVest) */}
          <div className="z-10 bg-primary text-on-primary w-20 h-20 rounded-full flex items-center justify-center shadow-lg absolute">
            <Building2 size={40} className="fill-current" />
          </div>
          
          {/* Peripheral Nodes (Banks/Brokers) */}
          <div className="absolute left-4 top-4 bg-surface-container-highest w-14 h-14 rounded-full flex items-center justify-center animate-pulse">
            <Landmark size={24} className="text-on-surface-variant" />
          </div>
          <div className="absolute right-4 bottom-4 bg-surface-container-highest w-14 h-14 rounded-full flex items-center justify-center animate-pulse" style={{ animationDelay: '0.5s' }}>
            <LineChart size={24} className="text-on-surface-variant" />
          </div>
          <div className="absolute left-8 bottom-8 bg-surface-container-highest w-12 h-12 rounded-full flex items-center justify-center animate-pulse" style={{ animationDelay: '1s' }}>
            <Wallet size={20} className="text-on-surface-variant" />
          </div>
          
        </div>

        {/* Content */}
        <div className="text-center flex-grow flex flex-col justify-center">
          <h1 className="font-headline-md text-primary mb-3 tracking-tight">Link your accounts securely</h1>
          <p className="font-body-md text-on-surface-variant mb-6 px-2">
            SahaVest uses the RBI-regulated Account Aggregator (AA) framework. It is read-only and ensures you stay in control of your data.
          </p>
          
          <div className="flex items-center justify-center space-x-2 text-warning mb-6 bg-warning-container/20 py-2 px-4 rounded-lg inline-flex self-center w-full max-w-xs border border-warning/30">
            <Shield size={18} className="text-warning flex-shrink-0" />
            <span className="font-label-sm text-on-warning-container text-left leading-tight">
              <b>Sandbox Mode:</b> This connects to mock data providers. No real financial credentials are required.
            </span>
          </div>
          <div className="flex items-center justify-center space-x-2 text-secondary mb-8 bg-secondary-container/20 py-2 px-4 rounded-full inline-flex self-center">
            <Shield size={18} className="fill-current" />
            <span className="font-label-md text-on-secondary-container">Bank-Grade Security</span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-auto flex flex-col gap-3">
          <button 
            onClick={() => navigate('/onboarding/select-institutions')}
            className="w-full h-[48px] bg-primary text-on-primary font-label-md rounded-lg flex items-center justify-center hover:bg-surface-tint transition-colors active:scale-95 duration-100 shadow-sm"
          >
            Link via Account Aggregator
          </button>
          
          <div className="relative flex py-3 items-center">
            <div className="flex-grow border-t border-outline-variant"></div>
            <span className="flex-shrink-0 mx-4 text-on-surface-variant font-label-sm uppercase tracking-wider">Or</span>
            <div className="flex-grow border-t border-outline-variant"></div>
          </div>

          <input 
            type="file" 
            accept="application/pdf"
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileUpload}
          />
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || uploadSuccess}
            className="w-full h-[48px] text-on-surface-variant font-label-md flex items-center justify-center gap-2 hover:bg-surface-container-low border border-outline-variant rounded-lg transition-colors active:scale-95 duration-100 disabled:opacity-50"
          >
            {uploading ? (
              <><Loader2 size={18} className="animate-spin" /> Parsing PDF...</>
            ) : uploadSuccess ? (
              <><CheckCircle size={18} className="text-primary" /> Parse Complete</>
            ) : (
              <><FileText size={18} /> Upload CAS PDF (for Bonds/SGB)</>
            )}
          </button>
        </div>
        
      </div>
    </div>
  );
}
