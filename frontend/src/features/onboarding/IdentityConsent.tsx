import React from 'react';
import { ArrowLeft, ArrowRightLeft, Shield, CheckCircle2, FileText, Fingerprint, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function IdentityConsent() {
  const navigate = useNavigate();

  return (
    <div className="bg-background text-on-background antialiased flex flex-col min-h-screen">
      {/* Content Canvas */}
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant overflow-hidden flex flex-col">
          
          {/* Header Section */}
          <div className="p-6 bg-surface-container-low border-b border-outline-variant text-center relative">
            {/* Decorative elements for trust */}
            <div className="flex justify-center items-center gap-4 mb-4">
              <img 
                alt="Emblem"
                className="h-12 w-auto object-contain" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBuLwRzCYc66_8Z_n4nJpsamrSr0L3EbQmCkbHhPxYMm9n-u1ClpQHtRY437jsNb-RO_9wd5SgNylAbDmjP5YC2qdTifq0hH8AXAvKHk46ccH2j6rmEPh0kbiRjdAPoUiu3Fk4VRqLLjr9QjEfJuwjpVV3foTFYU1RnHbTni7ioUlA-uphgrTVv9w7pWnMyQr9_n7xQWW0yYY8LyevF69EJ0qwXigCvH4OY8Ix2wFSE892JdABkzLSDsbGAG0H9bD4yXvfcjpKVeMQ" 
              />
              <span className="text-on-surface-variant">
                <ArrowRightLeft size={32} />
              </span>
              <img 
                alt="Vault"
                className="h-12 w-auto object-contain" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBfJc_65woxAMWeQ2N8kstNBqXfaCuo0BCpXbDo6JXhCE6u5bw-sNIkMH_V_ilynhWvbKOnrntgd8hSIdvnuw-bOHa6FYm3AUtuvK3-lJzGqorZs0_VZfE-UjMp71OSeH1myBWthmHr1JMvPiJPwHBezZZxMWtiBFCSOonlOL0MsaSWka1lz4t0yEZbYks39LzlRpmXGSJcgfkJgFc8fY6ms6kjX590CLCNFP4DeUerDReKQmOY6qJMZiKCoOBiUPRO-EHyvD2P30g" 
              />
            </div>
            <h1 className="font-headline-md text-on-surface mb-2">DigiLocker Consent</h1>
            <p className="font-body-md text-on-surface-variant">
              SahaVest requires access to your official documents to complete your KYC securely.
            </p>
          </div>

          {/* Content Section */}
          <div className="p-6 flex flex-col gap-6">
            <div className="bg-primary-container/10 rounded-lg p-4 border border-primary-container/20 flex items-start gap-3">
              <Shield className="text-primary-container mt-1 fill-current" size={24} />
              <div>
                <p className="font-label-md text-on-surface mb-1">Secure & Encrypted</p>
                <p className="font-body-md text-on-surface-variant text-sm">SahaVest will use this only for identity verification. We do not store your raw document files.</p>
              </div>
            </div>

            <div>
              <h2 className="font-label-md text-on-surface mb-2 uppercase tracking-wider text-xs">Requested Information</h2>
              <ul className="flex flex-col border border-outline-variant rounded-lg divide-y divide-outline-variant">
                
                <li className="flex items-center gap-4 p-4 bg-surface-container-lowest">
                  <div className="bg-surface-container-low rounded-full p-2 flex items-center justify-center text-on-surface-variant">
                    <FileText size={20} />
                  </div>
                  <div className="flex-grow">
                    <p className="font-body-md text-on-surface font-medium">PAN Record</p>
                    <p className="font-label-sm text-on-surface-variant font-normal">Income Tax Department</p>
                  </div>
                  <CheckCircle2 size={24} className="text-secondary" />
                </li>

                <li className="flex items-center gap-4 p-4 bg-surface-container-lowest">
                  <div className="bg-surface-container-low rounded-full p-2 flex items-center justify-center text-on-surface-variant">
                    <Fingerprint size={20} />
                  </div>
                  <div className="flex-grow">
                    <p className="font-body-md text-on-surface font-medium">Aadhaar Card</p>
                    <p className="font-label-sm text-on-surface-variant font-normal">UIDAI</p>
                  </div>
                  <CheckCircle2 size={24} className="text-secondary" />
                </li>

                <li className="flex items-center gap-4 p-4 bg-surface-container-lowest">
                  <div className="bg-surface-container-low rounded-full p-2 flex items-center justify-center text-on-surface-variant">
                    <MapPin size={20} />
                  </div>
                  <div className="flex-grow">
                    <p className="font-body-md text-on-surface font-medium">Permanent Address</p>
                    <p className="font-label-sm text-on-surface-variant font-normal">From Aadhaar/Driving License</p>
                  </div>
                  <CheckCircle2 size={24} className="text-secondary" />
                </li>

              </ul>
            </div>
          </div>

          {/* Action Section */}
          <div className="p-6 pt-0 flex flex-col gap-3">
            <button 
              onClick={() => navigate('/onboarding/kyc-processing')}
              className="w-full h-[56px] min-h-[56px] bg-primary text-on-primary rounded-lg font-label-md flex items-center justify-center transition-transform active:scale-[0.98] hover:bg-primary/90 shadow-sm"
            >
              Approve Request
            </button>
            <button 
              onClick={() => navigate(-1)}
              className="w-full h-[48px] min-h-[48px] bg-transparent text-on-surface-variant border border-outline-variant rounded-lg font-label-md flex items-center justify-center transition-colors hover:bg-surface-container-low"
            >
              Deny
            </button>
            <div className="text-center mt-2">
              <a className="font-label-sm text-primary hover:underline" href="#">Privacy Policy</a>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}
