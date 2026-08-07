import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { ArrowLeft, ArrowRight, Loader2, Camera, RefreshCw, CheckCircle2 } from 'lucide-react';

export function SelfieCapture() {
  const navigate = useNavigate();
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const startCamera = async () => {
    setErrorMsg('');
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      setErrorMsg('Could not access camera. Please allow camera permissions.');
    }
  };

  const takePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setPhoto(dataUrl);
        stopCamera();
      }
    }
  };

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  const retake = () => {
    setPhoto(null);
    startCamera();
  };

  const handleSubmit = async () => {
    if (!photo) return;
    setIsProcessing(true);
    setErrorMsg('');
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Convert base64 to Blob
      const res = await fetch(photo);
      const blob = await res.blob();
      
      const fileName = `${user.id}/selfie_${Date.now()}.jpg`;

      const { data: uploadData, error: uploadError } = await supabase.storage.from('profile-pics').upload(fileName, blob, {
        upsert: true,
        contentType: 'image/jpeg'
      });
      
      if (uploadError) throw uploadError;

      // Get public URL
      const { data: publicUrlData } = supabase.storage.from('profile-pics').getPublicUrl(fileName);

      // Update profile pic and final KYC status
      const { error: updateError } = await supabase.from('users').update({ 
        profile_pic_url: publicUrlData.publicUrl,
        kyc_status: 'complete', // In production, this would be 'pending_video_review'
        onboarding_status: 'complete'
      }).eq('id', user.id);
      
      if (updateError) throw updateError;
      
      // Proceed to processing screen
      navigate('/onboarding/kyc-processing');
      
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to upload selfie');
    } finally {
      setIsProcessing(false);
    }
  };

  // Start camera on mount if no photo
  React.useEffect(() => {
    if (!photo && !stream && !errorMsg) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [photo, stream, errorMsg, stopCamera]);

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md antialiased md:items-center md:justify-center">
      <main className="flex-1 flex flex-col px-4 pt-16 pb-8 w-full max-w-md mx-auto relative z-10 md:bg-surface-container-lowest md:rounded-xl md:shadow-sm md:border md:border-outline-variant md:min-h-[600px] md:pt-8">
        
        {/* Progress Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm font-label-md text-on-surface-variant mb-2">
            <span>Live Verification</span>
            <span>Step 3 of 3</span>
          </div>
          <div className="w-full h-1 bg-surface-variant rounded-full overflow-hidden">
            <div className="w-full h-full bg-primary rounded-full"></div>
          </div>
        </div>

        <button 
          aria-label="Go back" 
          onClick={() => {
            stopCamera();
            navigate(-1);
          }}
          className="w-[44px] h-[44px] flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors absolute top-4 left-4 md:static md:mb-6"
        >
          <ArrowLeft size={24} />
        </button>

        <header className="mb-6 text-center">
          <h1 className="font-display-lg-mobile text-on-surface mb-2">
            Take a Selfie
          </h1>
          <p className="font-body-md text-on-surface-variant">
            Position your face in the oval and ensure good lighting.
          </p>
        </header>

        {errorMsg && (
          <div className="mb-4 p-3 bg-error-container text-on-error-container text-sm rounded-lg border border-error-container/20">
            {errorMsg}
          </div>
        )}

        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="relative w-[280px] h-[360px] rounded-full overflow-hidden border-4 border-outline bg-surface-container flex items-center justify-center shadow-inner">
            {!photo ? (
              <>
                <video 
                  ref={videoRef}
                  autoPlay 
                  playsInline
                  muted
                  className="w-full h-full object-cover transform -scale-x-100"
                />
                <div className="absolute inset-0 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] rounded-full pointer-events-none"></div>
              </>
            ) : (
              <img src={photo} alt="Selfie" className="w-full h-full object-cover transform -scale-x-100" />
            )}
          </div>
        </div>

        <div className="mt-8 pt-6 pb-2 space-y-4">
          {!photo ? (
            <button 
              onClick={takePhoto}
              className="w-full h-[56px] bg-primary text-on-primary font-headline-sm rounded-full flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-[0.98] transition-all shadow-sm" 
            >
              <Camera size={20} />
              Capture Photo
            </button>
          ) : (
            <div className="flex gap-4">
              <button 
                onClick={retake}
                disabled={isProcessing}
                className="flex-1 h-[56px] bg-surface-container-high text-on-surface font-headline-sm rounded-full flex items-center justify-center gap-2 hover:bg-surface-container-highest active:scale-[0.98] transition-all disabled:opacity-50" 
              >
                <RefreshCw size={20} />
                Retake
              </button>
              <button 
                onClick={handleSubmit}
                disabled={isProcessing}
                className="flex-1 h-[56px] bg-primary text-on-primary font-headline-sm rounded-full flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-50 shadow-sm" 
              >
                {isProcessing ? <Loader2 size={20} className="animate-spin" /> : <><CheckCircle2 size={20} /> Use Photo</>}
              </button>
            </div>
          )}
        </div>
      </main>

      <div 
        className="hidden md:block fixed inset-0 z-0 pointer-events-none opacity-20" 
        style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, var(--tw-colors-outline-variant) 1px, transparent 0)', backgroundSize: '32px 32px' }}
      ></div>
    </div>
  );
}
