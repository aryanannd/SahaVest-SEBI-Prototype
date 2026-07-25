import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MoreVertical, Info, Bot, GraduationCap, BadgeCheck, TrendingUp, Send } from "lucide-react";

export function AiChatAssistant() {
  const navigate = useNavigate();

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col antialiased">
      {/* Header */}
      <header className="bg-surface w-full sticky top-0 z-50 border-b border-outline-variant flex items-center px-4 py-3 h-[64px]">
        <button 
          onClick={() => navigate(-1)}
          aria-label="Go Back" 
          className="w-[44px] h-[44px] flex items-center justify-center mr-2 active:bg-surface-container-high rounded-full transition-colors"
        >
          <ArrowLeft className="text-on-surface" size={24} />
        </button>
        <div className="flex flex-col flex-grow">
          <h1 className="font-headline-sm text-on-surface">SahaVest Assistant</h1>
          <span className="font-label-sm text-secondary flex items-center">
            <span className="w-2 h-2 rounded-full bg-secondary mr-1"></span> Online
          </span>
        </div>
        <button aria-label="More options" className="w-[44px] h-[44px] flex items-center justify-center active:bg-surface-container-high rounded-full transition-colors">
          <MoreVertical className="text-on-surface" size={24} />
        </button>
      </header>

      {/* Disclaimer Banner */}
      <div className="bg-surface-container-low px-4 py-2 border-b border-outline-variant flex items-start space-x-2">
        <Info className="text-outline shrink-0 mt-0.5" size={18} />
        <p className="font-label-sm text-on-surface-variant">I can help explain concepts, but I do not provide direct buy/sell advice. Consult a verified advisor for specific recommendations.</p>
      </div>

      {/* Chat Canvas */}
      <main className="flex-grow flex flex-col bg-surface-bright relative">
        <div className="overflow-y-auto px-4 py-4 flex flex-col space-y-6 pb-8" style={{ height: 'calc(100vh - 64px - 140px)' }}>
          {/* Time Divider */}
          <div className="flex justify-center">
            <span className="font-label-sm text-outline bg-surface-container-lowest px-3 py-1 rounded-full shadow-sm border border-outline-variant">Today, 10:24 AM</span>
          </div>
          
          {/* AI Message 1 */}
          <div className="flex items-end space-x-3 max-w-[85%] self-start">
            <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center flex-shrink-0">
              <Bot className="text-on-primary-container" size={18} />
            </div>
            <div className="bg-surface-container rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm border border-outline-variant">
              <p className="font-body-md text-on-surface">Hello! I'm your SahaVest assistant. I can help clarify financial terms, explain portfolio metrics, or guide you on how to find a verified advisor.</p>
            </div>
          </div>
          
          {/* User Message 1 */}
          <div className="flex flex-col items-end max-w-[85%] self-end">
            <div className="bg-primary rounded-2xl rounded-br-sm px-4 py-3 shadow-sm">
              <p className="font-body-md text-on-primary">I was looking at a mutual fund and it mentioned XIRR. What does that mean?</p>
            </div>
            <span className="font-label-sm text-outline mt-1 mr-1">10:25 AM</span>
          </div>
          
          {/* AI Message 2 */}
          <div className="flex items-end space-x-3 max-w-[85%] self-start">
            <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center flex-shrink-0">
              <Bot className="text-on-primary-container" size={18} />
            </div>
            <div className="bg-surface-container rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm border border-outline-variant space-y-2">
              <p className="font-body-md text-on-surface"><strong>XIRR (Extended Internal Rate of Return)</strong> is a way to calculate returns on investments where you make multiple transactions at different times (like SIPs).</p>
              <p className="font-body-md text-on-surface text-sm">Unlike simple annualized return, it accounts for the exact dates of your cash flows, giving a more accurate picture of your true return.</p>
            </div>
          </div>
        </div>
        
        {/* Sticky Bottom Area: Suggestions & Input */}
        <div className="w-full bg-surface border-t border-outline-variant absolute bottom-0 left-0">
          {/* Suggested Questions (Horizontal Scroll) */}
          <div className="w-full overflow-x-auto px-4 py-3 flex space-x-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <button className="flex-shrink-0 bg-surface-container-low border border-outline-variant hover:bg-surface-container-high text-on-surface font-label-md px-4 py-2 rounded-full transition-colors active:scale-95 duration-100 flex items-center">
              <GraduationCap size={16} className="mr-1" />
              Explain XIRR
            </button>
            <button className="flex-shrink-0 bg-surface-container-low border border-outline-variant hover:bg-surface-container-high text-on-surface font-label-md px-4 py-2 rounded-full transition-colors active:scale-95 duration-100 flex items-center">
              <BadgeCheck size={16} className="mr-1" />
              Is this advisor verified?
            </button>
            <button className="flex-shrink-0 bg-surface-container-low border border-outline-variant hover:bg-surface-container-high text-on-surface font-label-md px-4 py-2 rounded-full transition-colors active:scale-95 duration-100 flex items-center">
              <TrendingUp size={16} className="mr-1" />
              What is a good SIP amount?
            </button>
          </div>
          
          {/* Input Area */}
          <div className="px-4 pb-3 pt-2 flex items-end space-x-2">
            <div className="flex-grow bg-surface-container-low border border-outline-variant rounded-xl flex items-center px-3 min-h-[48px] focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
              <textarea 
                className="w-full bg-transparent border-none outline-none focus:ring-0 resize-none font-body-md text-on-surface py-3 max-h-[120px] overflow-y-auto" 
                placeholder="Type a message..." 
                rows={1}
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              />
            </div>
            <button aria-label="Send Message" className="w-[48px] h-[48px] bg-primary text-on-primary rounded-xl flex items-center justify-center flex-shrink-0 active:scale-95 transition-transform shadow-sm">
              <Send size={20} fill="currentColor" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
