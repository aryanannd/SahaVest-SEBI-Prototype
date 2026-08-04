import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const languages = [
  { id: 'en', code: 'English', label: 'English', native: 'English' },
  { id: 'hi', code: 'Hindi', label: 'Hindi', native: 'हिंदी' },
  { id: 'mr', code: 'Marathi', label: 'Marathi', native: 'मराठी' },
  { id: 'bn', code: 'Bengali', label: 'Bengali', native: 'বাংলা' },
  { id: 'gu', code: 'Gujarati', label: 'Gujarati', native: 'ગુજરાતી' },
  { id: 'ta', code: 'Tamil', label: 'Tamil', native: 'தமிழ்' },
  { id: 'te', code: 'Telugu', label: 'Telugu', native: 'తెలుగు' },
  { id: 'kn', code: 'Kannada', label: 'Kannada', native: 'ಕನ್ನಡ' },
  { id: 'ml', code: 'Malayalam', label: 'Malayalam', native: 'മലയാളം' },
  { id: 'pa', code: 'Punjabi', label: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { id: 'or', code: 'Odia', label: 'Odia', native: 'ଓଡ଼ିଆ' },
  { id: 'as', code: 'Assamese', label: 'Assamese', native: 'অসমীয়া' },
];

export function LanguageSelection() {
  const [selectedLang, setSelectedLang] = useState('en');
  const navigate = useNavigate();

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col items-center justify-center font-body-md antialiased md:p-6 p-0">
      {/* Main Container */}
      <main className="w-full max-w-md bg-surface-container-lowest md:rounded-xl md:shadow-sm flex flex-col h-[100dvh] md:h-[800px] overflow-hidden relative border border-outline-variant md:border-solid border-none">
        {/* Header area */}
        <header className="flex justify-between items-center p-6 pt-8 sticky top-0 bg-surface-container-lowest z-10">
          <h1 className="font-headline-md text-on-surface">Choose Language</h1>
          <button 
            className="font-label-md text-on-surface-variant hover:text-on-surface transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            onClick={() => navigate('/onboarding/mobile')}
          >
            Skip
          </button>
        </header>

        {/* Content Area - Scrollable */}
        <div className="flex-1 overflow-y-auto hide-scrollbar px-6 pb-32">
          <p className="font-body-md text-on-surface-variant mb-6">Select your preferred language for a personalized experience.</p>
          
          <div className="grid grid-cols-2 gap-3">
            {languages.map((lang) => {
              const isSelected = selectedLang === lang.id;
              
              return (
                <button 
                  key={lang.id}
                  onClick={() => setSelectedLang(lang.id)}
                  className={`flex flex-col items-start p-4 rounded-lg transition-all h-[100px] justify-between relative overflow-hidden group ${
                    isSelected 
                      ? 'border-2 border-primary bg-primary-fixed text-on-primary-fixed-variant' 
                      : 'border border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-surface-container-low'
                  }`}
                >
                  {isSelected ? (
                    <CheckCircle2 size={24} className="text-primary mb-2" />
                  ) : (
                    <div className="h-6 w-6 mb-2"></div>
                  )}
                  
                  <span className={`font-headline-sm ${isSelected ? 'font-semibold' : ''}`}>
                    {lang.native}
                  </span>
                  <span className={`font-label-sm mt-1 ${isSelected ? 'opacity-80' : 'text-on-surface-variant'}`}>
                    {lang.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sticky Bottom CTA */}
        <div className="absolute bottom-0 w-full p-6 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest to-transparent pb-8 border-t border-outline-variant md:border-none flex flex-col gap-3">
          {selectedLang !== 'en' && (
            <div className="bg-surface-container border border-outline-variant/50 rounded-lg px-3 py-2 text-center shadow-sm">
              <p className="font-label-sm text-outline">
                Full translation rolling out — currently showing English content.
              </p>
            </div>
          )}
          <button 
            className="w-full bg-primary text-on-primary h-[56px] rounded-full font-label-md flex items-center justify-center hover:bg-primary/90 transition-colors shadow-sm active:scale-[0.98]"
            onClick={() => navigate('/onboarding/mobile')}
          >
            Continue
          </button>
        </div>
      </main>
    </div>
  );
}
