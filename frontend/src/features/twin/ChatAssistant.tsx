import React, { useState } from 'react';
import { Send, Sparkles } from 'lucide-react';

export function ChatAssistant() {
  const [messages, setMessages] = useState([
    { id: 1, type: 'bot', text: 'Hi! I am your SahaVest Investor Twin. Ask me anything about your portfolio or general finance. (For demo purposes, I have a few preset answers.)' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { id: Date.now(), type: 'user', text: input };
    setMessages([...messages, userMsg]);
    setInput('');

    setTimeout(() => {
      let botResponse = "I'm a demo bot, but in the real app, I'd analyze your portfolio and give a personalized, educational answer based on SEBI-compliant guidelines.";
      let actionRoute = "";
      let actionText = "";

      if (userMsg.text.toLowerCase().includes('tax') || userMsg.text.toLowerCase().includes('elss')) {
        botResponse = "Based on your current investments, you have ₹1.2L in ELSS this year. You can invest ₹30,000 more to max out your Section 80C limit of ₹1.5L.";
      } else if (userMsg.text.toLowerCase().includes('risk')) {
        botResponse = "Your profile is Moderate, but your recent ₹50k investment in Small Cap funds slightly increased your overall portfolio risk. Make sure this aligns with your goals!";
      } else if (userMsg.text.toLowerCase().includes('buy') && userMsg.text.toLowerCase().includes('bond')) {
        botResponse = "I can help you initiate a purchase of Sovereign Gold Bonds (SGB) via your connected Zerodha account. 10 units of SGB Series IV 2023-24 currently cost ~₹62,450. Would you like to proceed?";
        actionRoute = "/trade/redirect";
        actionText = "Proceed to Broker";
      }

      setMessages(prev => [...prev, { id: Date.now() + 1, type: 'bot', text: botResponse, actionRoute, actionText }]);
    }, 1000);
  };

  return (
    <div className="flex-1 flex flex-col bg-surface relative h-full">
      <div className="flex items-center px-4 py-4 bg-primary text-on-primary shadow-sm z-10">
        <Sparkles size={24} className="mr-3 text-secondary-container" />
        <span className="font-headline-sm">Investor Twin AI</span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-6 pb-[140px] flex flex-col gap-4">
        {messages.map(m => (
          <div key={m.id} className={`flex ${m.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${
              m.type === 'user' 
                ? 'bg-primary text-on-primary rounded-tr-sm' 
                : 'bg-surface-container-lowest border border-outline-variant text-on-surface rounded-tl-sm'
            }`}>
              <p className="font-body-md text-[15px]">{m.text}</p>
              
              {m.actionRoute && m.actionText && (
                <button
                  onClick={() => window.location.href = m.actionRoute}
                  className="mt-3 w-full bg-primary text-on-primary font-label-md py-2 rounded-lg transition-transform active:scale-95 shadow-sm"
                >
                  {m.actionText}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="absolute bottom-0 w-full bg-surface border-t border-outline-variant p-4 pb-safe z-20">
        <form onSubmit={handleSend} className="flex items-center gap-2 bg-surface-container-lowest border border-outline-variant rounded-full p-1 pl-4 shadow-sm focus-within:border-primary">
          <input 
            type="text" 
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask about your portfolio..."
            className="flex-1 bg-transparent font-body-md outline-none text-on-surface"
          />
          <button 
            type="submit"
            className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center transition-transform active:scale-95"
          >
            <Send size={18} className="ml-1" />
          </button>
        </form>
      </div>
    </div>
  );
}
