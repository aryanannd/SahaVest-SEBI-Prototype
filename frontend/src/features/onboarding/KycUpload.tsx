import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { ArrowLeft, ArrowRight, Loader2, Upload, FileText, CheckCircle2, ShieldAlert } from 'lucide-react';

export function KycUpload() {
  const navigate = useNavigate();
  const [files, setFiles] = useState<{ [key: string]: File | null }>({
    aadhaarFront: null,
    aadhaarBack: null,
    panCard: null
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(prev => ({ ...prev, [key]: e.target.files![0] }));
    }
  };

  const uploadFile = async (file: File, path: string) => {
    const { error } = await supabase.storage.from('kyc-documents').upload(path, file, {
      upsert: true
    });
    if (error) throw error;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!files.aadhaarFront || !files.aadhaarBack || !files.panCard) {
      setErrorMsg('Please upload all required documents.');
      return;
    }
    
    setIsProcessing(true);
    setErrorMsg('');
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const timestamp = Date.now();
      
      // Upload to private bucket
      await uploadFile(files.aadhaarFront, `${user.id}/aadhaar_front_${timestamp}`);
      await uploadFile(files.aadhaarBack, `${user.id}/aadhaar_back_${timestamp}`);
      await uploadFile(files.panCard, `${user.id}/pan_card_${timestamp}`);
      
      // Update kyc_status in users table
      const { error } = await supabase.from('users').update({ 
        kyc_status: 'pending',
        onboarding_status: 'kyc_pending', // Will transition to next phase soon
        kyc_method: 'manual'
      }).eq('id', user.id);
      
      if (error) throw error;
      
      navigate('/onboarding/selfie');
      
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to upload documents');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md antialiased md:items-center md:justify-center">
      <main className="flex-1 flex flex-col px-4 pt-16 pb-8 w-full max-w-md mx-auto relative z-10 md:bg-surface-container-lowest md:rounded-xl md:shadow-sm md:border md:border-outline-variant md:min-h-[600px] md:pt-8">
        
        {/* Progress Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm font-label-md text-on-surface-variant mb-2">
            <span>Identity Verification</span>
            <span>Step 2 of 3</span>
          </div>
          <div className="w-full h-1 bg-surface-variant rounded-full overflow-hidden">
            <div className="w-2/3 h-full bg-primary rounded-full"></div>
          </div>
        </div>

        <button 
          aria-label="Go back" 
          onClick={() => navigate(-1)}
          className="w-[44px] h-[44px] flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors absolute top-4 left-4 md:static md:mb-6"
        >
          <ArrowLeft size={24} />
        </button>

        <header className="mb-6">
          <h1 className="font-display-lg-mobile text-on-surface mb-2">
            Upload Documents
          </h1>
          <p className="font-body-md text-on-surface-variant">
            Please upload clear, readable photos of your original ID documents.
          </p>
        </header>

        {errorMsg && (
          <div className="mb-4 p-3 bg-error-container text-on-error-container text-sm rounded-lg border border-error-container/20">
            {errorMsg}
          </div>
        )}

        <form className="flex-1 flex flex-col gap-5" onSubmit={handleSubmit}>
          
          <div className="space-y-4">
            <h2 className="font-label-lg text-on-surface border-b border-outline-variant pb-2">Aadhaar Card</h2>
            
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="font-label-sm text-on-surface-variant mb-1 block">Front Side</label>
                <div className="relative h-24 border-2 border-dashed border-outline-variant rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors flex flex-col items-center justify-center overflow-hidden">
                  <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'aadhaarFront')} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                  {files.aadhaarFront ? (
                    <div className="flex flex-col items-center text-primary">
                      <CheckCircle2 size={24} className="mb-1" />
                      <span className="font-label-sm truncate w-full px-2 text-center">{files.aadhaarFront.name}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-on-surface-variant pointer-events-none">
                      <Upload size={20} className="mb-1" />
                      <span className="font-label-sm">Upload Front</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-1">
                <label className="font-label-sm text-on-surface-variant mb-1 block">Back Side</label>
                <div className="relative h-24 border-2 border-dashed border-outline-variant rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors flex flex-col items-center justify-center overflow-hidden">
                  <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'aadhaarBack')} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                  {files.aadhaarBack ? (
                    <div className="flex flex-col items-center text-primary">
                      <CheckCircle2 size={24} className="mb-1" />
                      <span className="font-label-sm truncate w-full px-2 text-center">{files.aadhaarBack.name}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-on-surface-variant pointer-events-none">
                      <Upload size={20} className="mb-1" />
                      <span className="font-label-sm">Upload Back</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 mt-2">
            <h2 className="font-label-lg text-on-surface border-b border-outline-variant pb-2">PAN Card</h2>
            <div className="relative h-24 border-2 border-dashed border-outline-variant rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors flex flex-col items-center justify-center overflow-hidden">
              <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'panCard')} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
              {files.panCard ? (
                <div className="flex flex-col items-center text-primary">
                  <CheckCircle2 size={24} className="mb-1" />
                  <span className="font-label-sm truncate w-full px-2 text-center">{files.panCard.name}</span>
                </div>
              ) : (
                <div className="flex flex-col items-center text-on-surface-variant pointer-events-none">
                  <Upload size={20} className="mb-1" />
                  <span className="font-label-sm">Upload PAN Front</span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 bg-surface-container-low rounded-lg p-3 flex gap-2 items-start border border-outline-variant/50">
            <ShieldAlert size={16} className="text-primary mt-0.5 shrink-0" />
            <p className="font-body-sm text-on-surface-variant leading-tight">
              Documents are stored securely in a private, encrypted vault and only accessible by authorized compliance personnel.
            </p>
          </div>

          <div className="mt-auto pt-6 pb-2">
            <button 
              disabled={isProcessing || !files.aadhaarFront || !files.aadhaarBack || !files.panCard}
              className="w-full h-[56px] bg-primary text-on-primary font-headline-sm rounded-full flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-30 disabled:pointer-events-none shadow-sm" 
              type="submit"
            >
              {isProcessing ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  Upload and Continue
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </div>
        </form>
      </main>

      <div 
        className="hidden md:block fixed inset-0 z-0 pointer-events-none opacity-20" 
        style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, var(--tw-colors-outline-variant) 1px, transparent 0)', backgroundSize: '32px 32px' }}
      ></div>
    </div>
  );
}
