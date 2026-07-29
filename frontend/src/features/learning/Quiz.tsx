import React, { useState } from 'react';
import { Shield, CheckCircle, XCircle, X, ArrowRight, CheckCircle2, XIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Quiz() {
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const navigate = useNavigate();

  const options = [
    { id: 1, letter: 'A', text: "Click the link provided in the email and enter your details quickly to secure your account.", isCorrect: false },
    { id: 2, letter: 'B', text: "Reply to the email asking if the request is genuinely from the bank before proceeding.", isCorrect: false },
    { id: 3, letter: 'C', text: "Do not click any links. Independently navigate to your bank's official website or app to check for alerts.", isCorrect: true },
    { id: 4, letter: 'D', text: "Forward the email to a friend to see if they think it looks legitimate.", isCorrect: false }
  ];

  const handleSelect = (id: number) => {
    if (answered) return;
    setSelected(id);
    setAnswered(true);
  };

  const isCorrect = selected !== null && options.find(o => o.id === selected)?.isCorrect;

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md antialiased">
      {/* TopAppBar */}
      <header className="w-full sticky top-0 z-50 bg-surface dark:bg-surface-dim border-b border-outline-variant dark:border-outline">
        <div className="flex items-center justify-between px-4 py-2 w-full max-w-7xl mx-auto h-[56px]">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-low transition-colors text-on-surface-variant active:scale-95"
          >
            <X size={24} />
          </button>
          <div className="font-headline-sm text-primary dark:text-primary-fixed">Knowledge Check</div>
          <div className="w-10"></div> {/* Spacer */}
        </div>
      </header>

      <main className="flex-grow flex flex-col px-4 py-6 max-w-3xl mx-auto w-full md:px-6">
        
        {/* Progress Indicator */}
        <div className="mb-6 w-full">
          <div className="flex justify-between items-center mb-2">
            <span className="font-label-sm text-on-surface-variant">Question 3 of 5</span>
            <span className="font-label-sm text-primary">60%</span>
          </div>
          <div className="w-full bg-surface-container-highest rounded-full h-2">
            <div className="bg-primary h-2 rounded-full" style={{ width: '60%' }}></div>
          </div>
        </div>

        {/* Question Section */}
        <section className="mb-8">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-surface-container-low text-on-surface-variant font-label-sm mb-4 border border-outline-variant">
            <Shield size={16} className="mr-1" />
            Financial Safety
          </div>
          <h1 className="font-display-lg-mobile md:font-display-lg text-on-surface mb-4 tracking-tight">
            Which action is considered the safest approach when receiving an unexpected email asking to verify your bank login details?
          </h1>
          <p className="font-body-md text-on-surface-variant">
            Select the single best answer.
          </p>
        </section>

        {/* Options Grid */}
        <section className="flex flex-col gap-3 md:gap-4 mb-8 flex-grow">
          {options.map((opt) => {
            let stateClass = "bg-surface-container-lowest border-outline-variant text-on-surface hover:shadow-sm hover:-translate-y-[2px]";
            let letterClass = "border-outline-variant";
            let statusIcon = null;

            if (answered) {
              if (opt.isCorrect) {
                // Correct option is always highlighted green if answered
                stateClass = "bg-secondary-container border-secondary border-[2px] text-on-secondary-fixed shadow-sm";
                letterClass = "border-secondary";
                statusIcon = <CheckCircle2 size={24} className="text-secondary" />;
              } else if (selected === opt.id) {
                // Incorrect selected option is highlighted red
                stateClass = "bg-error-container border-error border-[2px] text-on-error-container shadow-sm";
                letterClass = "border-error";
                statusIcon = <XIcon size={24} className="text-error" />;
              } else {
                // Unselected incorrect options are faded out
                stateClass = "bg-surface-container-lowest border-outline-variant text-on-surface opacity-70";
              }
            } else if (selected === opt.id) {
              // Should not really happen since selected immediately sets answered, but just in case
              stateClass = "bg-primary-container border-primary border-[2px] text-on-primary-container shadow-sm";
              letterClass = "border-primary";
            }

            return (
              <button 
                key={opt.id}
                onClick={() => handleSelect(opt.id)}
                disabled={answered}
                className={`w-full text-left rounded-xl p-4 flex items-start min-h-[min(44px,auto)] transition-all duration-200 border ${stateClass}`}
              >
                <div className={`flex-shrink-0 w-8 h-8 rounded-full border flex items-center justify-center mr-4 mt-1 ${letterClass}`}>
                  <span className="font-label-md">{opt.letter}</span>
                </div>
                <div className="flex-grow">
                  <p className={`font-body-md ${opt.isCorrect && answered ? 'font-medium' : ''}`}>
                    {opt.text}
                  </p>
                </div>
                {statusIcon && (
                  <div className="ml-3 mt-1.5 flex-shrink-0 animate-in zoom-in duration-200">
                    {statusIcon}
                  </div>
                )}
              </button>
            );
          })}
        </section>

        {/* Score Summary / Actions (Appears after selection) */}
        {answered && (
          <section className="mt-auto bg-surface-container-low rounded-xl p-4 border border-outline-variant animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center w-full md:w-auto">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 shrink-0 ${isCorrect ? 'bg-secondary-container text-on-secondary-container' : 'bg-error-container text-on-error-container'}`}>
                  {isCorrect ? <CheckCircle2 size={28} /> : <XIcon size={28} />}
                </div>
                <div>
                  <h3 className={`font-headline-sm ${isCorrect ? 'text-secondary' : 'text-error'}`}>
                    {isCorrect ? 'Excellent!' : 'Not quite'}
                  </h3>
                  <p className="font-body-md text-on-surface-variant text-sm">
                    Phishing emails often create a false sense of urgency.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3 w-full md:w-auto mt-2 md:mt-0">
                {!isCorrect && (
                  <button 
                    onClick={() => { setSelected(null); setAnswered(false); }}
                    className="flex-1 md:flex-none px-6 py-2 rounded-full border border-outline text-on-surface font-label-md hover:bg-surface-container-highest transition-colors min-h-[48px] flex items-center justify-center active:scale-95"
                  >
                    Retry
                  </button>
                )}
                <button 
                  onClick={() => navigate('/learn')} // Should ideally go to result, but we can return to learn
                  className="flex-1 md:flex-none px-6 py-2 rounded-full bg-primary text-on-primary font-label-md hover:bg-primary-container transition-colors min-h-[48px] flex items-center justify-center active:scale-95"
                >
                  Next
                  <ArrowRight size={18} className="ml-2" />
                </button>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
