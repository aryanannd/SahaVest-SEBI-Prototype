import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { ArrowLeft, MoreVertical, Info, Bot, GraduationCap, BadgeCheck, TrendingUp, Send, Loader2, Image as ImageIcon, X } from "lucide-react";

export function AiChatAssistant() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<{role: string, content: string, image?: string}[]>([]);
  const [input, setInput] = useState('');
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    async function fetchInsights() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const headers: HeadersInit = {};
        if (session) headers['Authorization'] = `Bearer ${session.access_token}`;
        
        const res = await fetch('http://localhost:3000/api/insights/me', { headers });
        const result = await res.json();
        if (result.insights && result.insights.length > 0) {
           const greeting = result.insights.find((i: any) => i.type === 'greeting');
           if (greeting) {
             setMessages([{ role: 'assistant', content: greeting.message }]);
           } else {
             setMessages([{ role: 'assistant', content: "Hello! I'm your SahaVest assistant. I can help clarify financial terms, explain portfolio metrics, or guide you on how to find a verified advisor." }]);
           }
        } else {
           setMessages([{ role: 'assistant', content: "Hello! I'm your SahaVest assistant. I can help clarify financial terms, explain portfolio metrics, or guide you on how to find a verified advisor." }]);
        }
      } catch (err) {
        console.error(err);
        setMessages([{ role: 'assistant', content: "Hello! I'm your SahaVest assistant. I can help clarify financial terms, explain portfolio metrics, or guide you on how to find a verified advisor." }]);
      } finally {
        setLoading(false);
      }
    }
    fetchInsights();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride !== undefined ? textOverride : input;
    if (!textToSend.trim() && !imageBase64) return;
    
    const userMsg = { role: 'user', content: textToSend, image: imageBase64 || undefined };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setImageBase64(null);
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (session) headers['Authorization'] = `Bearer ${session.access_token}`;

      const history = messages.map(m => ({ role: m.role, content: m.content }));
      
      const res = await fetch('http://localhost:3000/api/ai/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({ message: userMsg.content, image: userMsg.image, history })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

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
      <div className="bg-surface-container-low px-4 py-2 border-b border-outline-variant flex items-start space-x-2 shrink-0">
        <Info className="text-outline shrink-0 mt-0.5" size={18} />
        <p className="font-label-sm text-on-surface-variant">I can help explain concepts, but I do not provide direct buy/sell advice. Consult a verified advisor for specific recommendations.</p>
      </div>

      {/* Chat Canvas */}
      <main className="flex-grow flex flex-col bg-surface-bright relative overflow-hidden">
        <div className="overflow-y-auto px-4 py-4 flex flex-col space-y-6 flex-grow pb-[160px]">
          {/* Time Divider */}
          <div className="flex justify-center">
            <span className="font-label-sm text-outline bg-surface-container-lowest px-3 py-1 rounded-full shadow-sm border border-outline-variant">Today</span>
          </div>
          
          {messages.map((msg, i) => (
            msg.role === 'assistant' ? (
              <div key={i} className="flex items-end space-x-3 max-w-[85%] self-start">
                <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center flex-shrink-0">
                  <Bot className="text-on-primary-container" size={18} />
                </div>
                <div className="bg-surface-container rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm border border-outline-variant space-y-2">
                  <p className="font-body-md text-on-surface whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ) : (
              <div key={i} className="flex flex-col items-end max-w-[85%] self-end">
                <div className="bg-primary rounded-2xl rounded-br-sm px-4 py-3 shadow-sm">
                  {msg.image && <img src={msg.image} className="w-full max-w-[200px] rounded-lg mb-2" alt="Uploaded" />}
                  {msg.content && <p className="font-body-md text-on-primary whitespace-pre-wrap">{msg.content}</p>}
                </div>
              </div>
            )
          ))}
          
          {loading && messages.length > 0 && messages[messages.length-1].role === 'user' && (
              <div className="flex items-end space-x-3 max-w-[85%] self-start">
                <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center flex-shrink-0">
                  <Bot className="text-on-primary-container" size={18} />
                </div>
                <div className="bg-surface-container rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm border border-outline-variant">
                   <Loader2 className="animate-spin text-primary" size={16} />
                </div>
              </div>
          )}
          
          <div ref={chatEndRef} />
        </div>
        
        {/* Sticky Bottom Area: Suggestions & Input */}
        <div className="w-full bg-surface border-t border-outline-variant absolute bottom-0 left-0">
          {/* Suggested Questions (Horizontal Scroll) */}
          <div className="w-full overflow-x-auto px-4 py-3 flex space-x-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <button onClick={() => handleSend("Explain XIRR")} className="flex-shrink-0 bg-surface-container-low border border-outline-variant hover:bg-surface-container-high text-on-surface font-label-md px-4 py-2 rounded-full transition-colors active:scale-95 duration-100 flex items-center">
              <GraduationCap size={16} className="mr-1" />
              Explain XIRR
            </button>
            <button onClick={() => handleSend("Is this advisor verified?")} className="flex-shrink-0 bg-surface-container-low border border-outline-variant hover:bg-surface-container-high text-on-surface font-label-md px-4 py-2 rounded-full transition-colors active:scale-95 duration-100 flex items-center">
              <BadgeCheck size={16} className="mr-1" />
              Is this advisor verified?
            </button>
            <button onClick={() => handleSend("What is a good SIP amount?")} className="flex-shrink-0 bg-surface-container-low border border-outline-variant hover:bg-surface-container-high text-on-surface font-label-md px-4 py-2 rounded-full transition-colors active:scale-95 duration-100 flex items-center">
              <TrendingUp size={16} className="mr-1" />
              What is a good SIP amount?
            </button>
          </div>
          
          {/* Input Area */}
          <div className="px-4 pb-4 pt-2 flex items-end space-x-2 bg-surface">
            <label className="w-[48px] h-[48px] flex items-center justify-center flex-shrink-0 cursor-pointer text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors">
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              <ImageIcon size={24} />
            </label>
            <div className="flex-grow bg-surface-container-low border border-outline-variant rounded-xl flex flex-col px-3 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
              {imageBase64 && (
                <div className="relative w-16 h-16 mt-2 ml-1">
                  <img src={imageBase64} className="w-full h-full object-cover rounded" alt="Preview" />
                  <button onClick={() => setImageBase64(null)} className="absolute -top-2 -right-2 bg-error text-on-error rounded-full p-1 shadow-sm">
                    <X size={12} />
                  </button>
                </div>
              )}
              <textarea 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                className="w-full bg-transparent border-none outline-none focus:ring-0 resize-none font-body-md text-on-surface py-3 max-h-[120px] overflow-y-auto" 
                placeholder="Type a message..." 
                rows={1}
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              />
            </div>
            <button onClick={() => handleSend()} disabled={loading || (!input.trim() && !imageBase64)} aria-label="Send Message" className="w-[48px] h-[48px] bg-primary text-on-primary rounded-xl flex items-center justify-center flex-shrink-0 active:scale-95 transition-transform shadow-sm disabled:opacity-50">
              <Send size={20} fill="currentColor" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
