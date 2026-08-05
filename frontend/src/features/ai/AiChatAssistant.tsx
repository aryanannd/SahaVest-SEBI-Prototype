import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { ArrowLeft, MoreVertical, Info, Bot, GraduationCap, BadgeCheck, TrendingUp, Send, Loader2, Image as ImageIcon, X, Mic, MicOff, Building2 } from "lucide-react";

// ---- Web Speech API types ----
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export function AiChatAssistant() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<{role: string, content: string, image?: string, isError?: boolean}[]>([]);
  const [input, setInput] = useState('');
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Stage 1: Voice input state
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Check voice support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setVoiceSupported(true);
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'hi-IN,en-IN,en-US'; // Support Hindi + English
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setInput(transcript);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
    }
  }, []);

  const toggleVoice = () => {
    if (!voiceSupported) {
      alert('Voice input is not supported in your browser. Please use Chrome or Edge.');
      return;
    }
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setInput(''); // Clear before listening
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [input]);

  useEffect(() => {
    async function fetchInsights() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const headers: HeadersInit = {};
        if (session) headers['Authorization'] = `Bearer ${session.access_token}`;
        
        const res = await fetch('/api/insights/me', { headers });
        const result = await res.json();
        if (result.insights && result.insights.length > 0) {
           const greeting = result.insights.find((i: any) => i.type === 'greeting');
           if (greeting) {
             setMessages([{ role: 'assistant', content: greeting.message }]);
           } else {
             setMessages([{ role: 'assistant', content: "Hello! I'm your SahaVest assistant. Ask me anything in **any language** — Hindi, Gujarati, Marathi, Tamil, or English. I can explain financial terms, analyze your portfolio, help verify an advisor, and more." }]);
           }
        } else {
           setMessages([{ role: 'assistant', content: "Hello! I'm your SahaVest assistant. Ask me anything in **any language** — Hindi, Gujarati, Marathi, Tamil, or English. I can explain financial terms, analyze your portfolio, help verify an advisor, and more." }]);
        }
      } catch (err) {
        console.error(err);
        setMessages([{ role: 'assistant', content: "Hello! I'm your SahaVest assistant. Ask me anything in **any language** — Hindi, Gujarati, Marathi, Tamil, or English. I can explain financial terms, analyze your portfolio, help verify an advisor, and more." }]);
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
    
    // Stop voice if active
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }

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
      
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({ message: userMsg.content, image: userMsg.image, history })
      });
      const data = await res.json();
      
      if (!res.ok || data.error === true) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.message || 'AI service temporarily unavailable', isError: true }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered a network error. Please try again.', isError: true }]);
    } finally {
      setLoading(false);
    }
  };

  // Render markdown-lite: bold (**text**) and newlines
  const renderContent = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
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
            <span className="w-2 h-2 rounded-full bg-secondary mr-1"></span> Online · Multilingual
          </span>
        </div>
        <button aria-label="More options" className="w-[44px] h-[44px] flex items-center justify-center active:bg-surface-container-high rounded-full transition-colors">
          <MoreVertical className="text-on-surface" size={24} />
        </button>
      </header>

      {/* Disclaimer Banner */}
      <div className="bg-surface-container-low px-4 py-2 border-b border-outline-variant flex items-start space-x-2 shrink-0">
        <Info className="text-outline shrink-0 mt-0.5" size={18} />
        <p className="font-label-sm text-on-surface-variant">Educational guidance only — not investment advice. For personalized recommendations, consult a SEBI-registered advisor.</p>
      </div>

      {/* Chat Canvas */}
      <main className="flex-grow flex flex-col bg-surface-bright relative overflow-hidden">
        <div className="overflow-y-auto px-4 py-4 flex flex-col space-y-6 flex-grow pb-[185px]">
          {/* Time Divider */}
          <div className="flex justify-center">
            <span className="font-label-sm text-outline bg-surface-container-lowest px-3 py-1 rounded-full shadow-sm border border-outline-variant">Today</span>
          </div>
          
          {messages.map((msg, i) => (
            msg.role === 'assistant' ? (
              <div key={i} className="flex items-end space-x-3 max-w-[88%] self-start">
                <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center flex-shrink-0">
                  <Bot className="text-on-primary-container" size={18} />
                </div>
                <div className={`rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm border space-y-2 ${msg.isError ? 'bg-error-container border-error text-on-error-container' : 'bg-surface-container border-outline-variant'}`}>
                  <p className="font-body-md whitespace-pre-wrap leading-relaxed">{renderContent(msg.content)}</p>
                </div>
              </div>
            ) : (
              <div key={i} className="flex flex-col items-end max-w-[88%] self-end">
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
                <div className="bg-surface-container rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm border border-outline-variant flex items-center gap-2">
                   <div className="flex gap-1">
                     <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0ms'}}/>
                     <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '150ms'}}/>
                     <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '300ms'}}/>
                   </div>
                </div>
              </div>
          )}
          
          <div ref={chatEndRef} />
        </div>
        
        {/* Sticky Bottom Area: Suggestions & Input */}
        <div className="w-full bg-surface border-t border-outline-variant absolute bottom-0 left-0">
          {/* Suggested Questions (Horizontal Scroll) */}
          <div className="w-full overflow-x-auto px-4 py-2 flex space-x-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <button onClick={() => handleSend("Explain XIRR in simple terms")} className="flex-shrink-0 bg-surface-container-low border border-outline-variant hover:bg-surface-container-high text-on-surface font-label-md px-3 py-1.5 rounded-full transition-colors active:scale-95 duration-100 flex items-center text-sm">
              <GraduationCap size={14} className="mr-1" />
              Explain XIRR
            </button>
            <button onClick={() => handleSend("What is my portfolio value?")} className="flex-shrink-0 bg-surface-container-low border border-outline-variant hover:bg-surface-container-high text-on-surface font-label-md px-3 py-1.5 rounded-full transition-colors active:scale-95 duration-100 flex items-center text-sm">
              <TrendingUp size={14} className="mr-1" />
              My Portfolio
            </button>
            <button onClick={() => handleSend("How do I verify if an advisor is SEBI registered?")} className="flex-shrink-0 bg-surface-container-low border border-outline-variant hover:bg-surface-container-high text-on-surface font-label-md px-3 py-1.5 rounded-full transition-colors active:scale-95 duration-100 flex items-center text-sm">
              <BadgeCheck size={14} className="mr-1" />
              Verify Advisor
            </button>
            <button onClick={() => handleSend("How does IPO investing work?")} className="flex-shrink-0 bg-surface-container-low border border-outline-variant hover:bg-surface-container-high text-on-surface font-label-md px-3 py-1.5 rounded-full transition-colors active:scale-95 duration-100 flex items-center text-sm">
              <Building2 size={14} className="mr-1" />
              How IPOs work
            </button>
            <button onClick={() => handleSend("SIP ke baare mein batao")} className="flex-shrink-0 bg-surface-container-low border border-outline-variant hover:bg-surface-container-high text-on-surface font-label-md px-3 py-1.5 rounded-full transition-colors active:scale-95 duration-100 flex items-center text-sm">
              🇮🇳 SIP in Hindi
            </button>
          </div>
          
          {/* Voice Listening Indicator */}
          {isListening && (
            <div className="mx-4 mb-2 bg-error-container border border-error rounded-xl px-4 py-2 flex items-center gap-2">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-error rounded-full animate-bounce" style={{animationDelay: '0ms'}}/>
                <span className="w-1.5 h-1.5 bg-error rounded-full animate-bounce" style={{animationDelay: '100ms'}}/>
                <span className="w-1.5 h-1.5 bg-error rounded-full animate-bounce" style={{animationDelay: '200ms'}}/>
              </div>
              <span className="font-label-sm text-on-error-container">Listening... speak now</span>
              <span className="font-label-sm text-on-error-container ml-auto opacity-70">Tap mic to stop</span>
            </div>
          )}
          
          {/* Input Area */}
          <div className="px-4 pb-4 pt-1 flex items-end space-x-2 bg-surface">
            {/* Image upload */}
            <label className="w-[44px] h-[44px] flex items-center justify-center flex-shrink-0 cursor-pointer text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors" title="Upload image or document">
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              <ImageIcon size={22} />
            </label>
            
            {/* Text input container */}
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
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                className="w-full bg-transparent border-none outline-none focus:ring-0 resize-none font-body-md text-on-surface py-3 overflow-y-auto" 
                placeholder={isListening ? "Listening..." : "Ask anything in any language..."}
                rows={1}
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', maxHeight: '120px' }}
              />
            </div>
            
            {/* Mic button (Stage 1) */}
            <button 
              onClick={toggleVoice}
              title={voiceSupported ? (isListening ? 'Stop listening' : 'Voice input') : 'Voice not supported in this browser'}
              className={`w-[44px] h-[44px] rounded-xl flex items-center justify-center flex-shrink-0 active:scale-95 transition-all shadow-sm ${
                isListening 
                  ? 'bg-error text-on-error animate-pulse' 
                  : voiceSupported 
                    ? 'bg-secondary-container text-on-secondary-container hover:bg-secondary/20' 
                    : 'bg-surface-container text-on-surface-variant opacity-50'
              }`}
            >
              {isListening ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
            
            {/* Send button */}
            <button 
              onClick={() => handleSend()} 
              disabled={loading || (!input.trim() && !imageBase64)} 
              aria-label="Send Message" 
              className="w-[44px] h-[44px] bg-primary text-on-primary rounded-xl flex items-center justify-center flex-shrink-0 active:scale-95 transition-transform shadow-sm disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} fill="currentColor" />}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
