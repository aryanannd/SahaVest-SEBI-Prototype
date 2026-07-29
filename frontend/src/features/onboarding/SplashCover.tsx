import React, { useEffect } from 'react';
import { ShieldCheck, TrendingUp, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/common/Header';

export function SplashCover() {
  const navigate = useNavigate();

  useEffect(() => {
    // Automatically navigate to language selection after a short delay
    const timer = setTimeout(() => {
      navigate('/onboarding/language');
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="bg-primary-container h-screen w-full flex flex-col justify-between overflow-hidden antialiased">
      {/* Top padding spacer */}
      <div className="flex-1"></div>

      {/* Main Content Cluster */}
      <main className="flex flex-col items-center justify-center space-y-6 px-4 text-center">
        {/* Logo Asset */}
        <div className="relative flex items-center justify-center w-24 h-24 bg-on-primary rounded-full shadow-lg overflow-hidden">
          <ShieldCheck size={48} className="text-primary-container" />
          <TrendingUp size={24} className="absolute text-on-primary bg-primary-container rounded-full p-1 border-2 border-on-primary" />
        </div>

        {/* Typography */}
        <div className="space-y-3">
          <Header />
          <p className="font-body-md text-primary-fixed-dim max-w-sm mx-auto opacity-90">
            Ek jagah dekho, safe rehke badho
          </p>
        </div>
      </main>

      {/* Bottom Loading Section */}
      <footer className="flex-1 flex flex-col justify-end items-center pb-8">
        <Loader2 className="animate-spin w-8 h-8 text-on-primary" />
      </footer>
    </div>
  );
}
