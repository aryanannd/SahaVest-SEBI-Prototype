import React, { useState } from 'react';
import { ArrowLeft, MoreVertical, Info, Bot, GraduationCap, CheckCircle2, TrendingUp, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function ChatAssistant() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      type: 'bot', 
      text: 'Hello! I\'m your SahaVest assistant. I can help clarify financial terms, explain portfolio metrics, or guide you on how to find a verified advisor.',
      time: '10:24 AM'
    },
    { 
      id: 2, 
      type: 'user', 
      text: 'I was looking at a mutual fund and it mentioned XIRR. What does that mean?',
      time: '10:25 AM'
    },
    { 
      id: 3, 
      type: 'bot', 
      text: 'XIRR (Extended Internal Rate of Return) is a way to calculate returns on investments where you make multiple transactions at different times (like SIPs).',
      subtext: 'Unlike simple annualized return, it accounts for the exact dates of your cash flows, giving a more accurate picture of your true return.',
      time: '10:25 AM',
      isRich: true
    }
  ]);
  const [input, setInput] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { 
      id: Date.now(), 
      type: 'user', 
      text: input,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([...messages, userMsg]);
    setInput('');

    setTimeout(() => {
      let botResponse = "I can help explain concepts, but I do not provide direct buy/sell advice. Consult a verified advisor for specific recommendations.";
      let subtext = "";
      
      if (userMsg.text.toLowerCase().includes('tax') || userMsg.text.toLowerCase().includes('elss')) {
        botResponse = "Based on your current investments, you have ₹1.2L in ELSS this year. You can invest ₹30,000 more to max out your Section 80C limit of ₹1.5L.";
      } else if (userMsg.text.toLowerCase().includes('risk')) {
        botResponse = "Your profile is Moderate, but your recent ₹50k investment in Small Cap funds slightly increased your overall portfolio risk. Make sure this aligns with your goals!";
      } else if (userMsg.text.toLowerCase().includes('advisor verified')) {
        botResponse = "Yes! You can verify an advisor by entering their SEBI registration number (e.g., INA000012345) in our Trust & Safety section.";
        subtext = "If you encounter an unregistered entity offering guaranteed returns, report them immediately.";
      }

      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        type: 'bot', 
        text: botResponse, 
        subtext,
        isRich: !!subtext,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 1000);
  };

  const handleSuggestion = (text: string) => {
    setInput(text);
  };

  return (
    <div className="bg-background text-on-background font-body-md min-h-[max(884px,100dvh)] flex flex-col antialiased">
      {/* Header */}
      <header className="bg-surface w-full sticky top-0 z-50 border-b border-outline-variant flex items-center px-4 py-3 h-[64px]">
        <button 
          onClick={() => navigate(-1)}
          aria-label="Go Back" 
          className="w-11 h-11 flex items-center justify-center mr-2 active:bg-surface-container-high rounded-full transition-colors"
        >
          <ArrowLeft size={24} className="text-on-surface" />
        </button>
        <div className="flex flex-col flex-grow">
          <h1 className="font-headline-sm text-on-surface">SahaVest Assistant</h1>
          <span className="font-label-sm text-secondary flex items-center">
            <span className="w-2 h-2 rounded-full bg-secondary mr-1"></span> Online
          </span>
        </div>
        <button aria-label="More options" className="w-11 h-11 flex items-center justify-center active:bg-surface-container-high rounded-full transition-colors">
          <MoreVertical size={24} className="text-on-surface" />
        </button>
      </header>

      {/* Disclaimer Banner */}
      <div className="bg-surface-container-low px-4 py-2 border-b border-outline-variant flex items-start space-x-2">
        <Info size={18} className="text-outline mt-0.5 flex-shrink-0" />
        <p className="font-label-sm text-on-surface-variant">I can help explain concepts, but I do not provide direct buy/sell advice. Consult a verified advisor for specific recommendations.</p>
      </div>

      {/* Chat Canvas */}
      <main className="flex-grow flex flex-col bg-surface-bright relative">
        <div className="overflow-y-auto px-4 py-4 flex flex-col space-y-6 pb-8" style={{ height: 'calc(100vh - 64px - 140px)' }}>
          {/* Time Divider */}
          <div className="flex justify-center">
            <span className="font-label-sm text-outline bg-surface-container-lowest px-3 py-1 rounded-full shadow-sm border border-outline-variant">Today, 10:24 AM</span>
          </div>

          {messages.map((m) => (
            m.type === 'bot' ? (
              /* AI Message */
              <div key={m.id} className="flex items-end space-x-3 max-w-[85%] self-start">
                <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center flex-shrink-0">
                  <Bot size={18} className="text-on-primary-container" />
                </div>
                <div className={`bg-surface-container rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm border border-outline-variant ${m.isRich ? 'space-y-2' : ''}`}>
                  {m.isRich ? (
                    <>
                      <p className="font-body-md text-on-surface"><strong>{m.text.split(' is a ')[0]}</strong> is a {m.text.split(' is a ')[1]}</p>
                      {m.subtext && <p className="font-body-md text-on-surface text-sm">{m.subtext}</p>}
                    </>
                  ) : (
                    <p className="font-body-md text-on-surface">{m.text}</p>
                  )}
                </div>
              </div>
            ) : (
              /* User Message */
              <div key={m.id} className="flex flex-col items-end max-w-[85%] self-end">
                <div className="bg-primary rounded-2xl rounded-br-sm px-4 py-3 shadow-sm">
                  <p className="font-body-md text-on-primary">{m.text}</p>
                </div>
                <span className="font-label-sm text-outline mt-1 mr-1">{m.time}</span>
              </div>
            )
          ))}
        </div>

        {/* Sticky Bottom Area: Suggestions & Input */}
        <div className="w-full bg-surface border-t border-outline-variant pb-safe absolute bottom-0">
          {/* Suggested Questions (Horizontal Scroll) */}
          <div className="w-full overflow-x-auto hide-scrollbar px-4 py-3 flex space-x-2">
            <button 
              type="button"
              onClick={() => handleSuggestion('Explain XIRR')}
              className="flex-shrink-0 bg-surface-container-low border border-outline-variant hover:bg-surface-container-high text-on-surface font-label-md px-4 py-2 rounded-full transition-colors active:scale-95 duration-100 flex items-center"
            >
              <GraduationCap size={16} className="mr-1" />
              Explain XIRR
            </button>
            <button 
              type="button"
              onClick={() => handleSuggestion('Is this advisor verified?')}
              className="flex-shrink-0 bg-surface-container-low border border-outline-variant hover:bg-surface-container-high text-on-surface font-label-md px-4 py-2 rounded-full transition-colors active:scale-95 duration-100 flex items-center"
            >
              <CheckCircle2 size={16} className="mr-1" />
              Is this advisor verified?
            </button>
            <button 
              type="button"
              onClick={() => handleSuggestion('What is a good SIP amount?')}
              className="flex-shrink-0 bg-surface-container-low border border-outline-variant hover:bg-surface-container-high text-on-surface font-label-md px-4 py-2 rounded-full transition-colors active:scale-95 duration-100 flex items-center"
            >
              <TrendingUp size={16} className="mr-1" />
              What is a good SIP amount?
            </button>
          </div>

          {/* Input Area */}
          <div className="px-4 pb-3 pt-2 flex items-end space-x-2">
            <div className="flex-grow bg-surface-container-low border border-outline-variant rounded-xl flex items-center px-3 min-h-[48px] focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
              <textarea 
                className="w-full bg-transparent border-none outline-none focus:ring-0 resize-none font-body-md text-on-surface py-3 max-h-[120px] overflow-y-auto hide-scrollbar" 
                placeholder="Type a message..." 
                rows={1} 
                style={{ fieldSizing: 'content' } as any}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(e);
                  }
                }}
              />
            </div>
            <button 
              onClick={handleSend}
              aria-label="Send Message" 
              className="w-[48px] h-[48px] bg-primary text-on-primary rounded-xl flex items-center justify-center flex-shrink-0 active:scale-95 transition-transform shadow-sm"
            >
              <Send size={20} className="fill-current" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
