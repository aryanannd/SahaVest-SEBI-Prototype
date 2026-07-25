import React, { useState } from 'react';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Quiz() {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const options = [
    { id: 1, text: "A guaranteed return of 15% annually.", isCorrect: false },
    { id: 2, text: "Diversification to reduce risk.", isCorrect: true },
    { id: 3, text: "Zero taxes on withdrawals.", isCorrect: false },
    { id: 4, text: "Always beating the stock market.", isCorrect: false }
  ];

  const handleSelect = (id: number) => {
    if (submitted) return;
    setSelected(id);
  };

  return (
    <div className="flex-1 flex flex-col bg-surface overflow-y-auto px-4 pt-4 pb-20">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-surface-container-low transition-colors">
          <ArrowLeft size={24} className="text-on-surface" />
        </button>
        <div className="w-full bg-surface-container rounded-full h-2 mr-4">
          <div className="bg-secondary h-2 rounded-full" style={{ width: '60%' }} />
        </div>
      </div>

      <div className="mb-8">
        <span className="font-label-sm text-primary uppercase tracking-wider mb-2 block">Question 3 of 5</span>
        <h2 className="font-headline-md text-on-surface">What is the primary benefit of investing in a Mutual Fund?</h2>
      </div>

      <div className="flex flex-col gap-4 mb-8">
        {options.map((opt) => {
          let bgClass = "bg-surface-container-lowest border-outline-variant";
          let icon = null;
          
          if (submitted) {
            if (opt.isCorrect) {
              bgClass = "bg-[#E6F4EA] border-[#2E8B57]";
              icon = <CheckCircle className="text-[#2E8B57]" size={20} />;
            } else if (selected === opt.id) {
              bgClass = "bg-[#FAECE7] border-error";
              icon = <XCircle className="text-error" size={20} />;
            }
          } else if (selected === opt.id) {
            bgClass = "bg-primary-container border-primary";
          }

          return (
            <button 
              key={opt.id}
              onClick={() => handleSelect(opt.id)}
              className={`w-full text-left p-4 rounded-xl border flex items-center justify-between transition-colors shadow-sm ${bgClass}`}
            >
              <span className={`font-body-md ${selected === opt.id && !submitted ? 'text-on-primary-container font-medium' : 'text-on-surface'}`}>
                {opt.text}
              </span>
              {icon}
            </button>
          );
        })}
      </div>

      {submitted ? (
        <div className="flex flex-col gap-4 animate-in slide-in-from-bottom-4">
          <div className={`p-4 rounded-xl ${selected === 2 ? 'bg-[#E6F4EA] text-[#0D532A]' : 'bg-[#FAECE7] text-[#4A1B0C]'}`}>
            <h3 className="font-headline-sm mb-1">{selected === 2 ? 'Correct!' : 'Incorrect'}</h3>
            <p className="font-body-md text-sm">
              Mutual funds pool money from many investors to buy a diversified portfolio of stocks or bonds, which reduces the overall risk compared to buying individual securities.
            </p>
          </div>
          <button 
            onClick={() => navigate('/learn')}
            className="w-full bg-primary text-on-primary font-label-md py-3 rounded-full transition-transform active:scale-95"
          >
            Continue
          </button>
        </div>
      ) : (
        <button 
          onClick={() => setSubmitted(true)}
          disabled={selected === null}
          className={`w-full font-label-md py-3 rounded-full transition-transform mt-auto ${selected !== null ? 'bg-primary text-on-primary active:scale-95 shadow-sm' : 'bg-surface-variant text-on-surface/40'}`}
        >
          Check Answer
        </button>
      )}
    </div>
  );
}
