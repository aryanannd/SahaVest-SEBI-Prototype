import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Sparkles, CheckCircle2, BookOpen, Loader2, ClipboardPaste, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

const SAMPLE_TEXT = `The Scheme shall be subject to an Expense Ratio, which is calculated as a percentage of the daily net assets of the scheme. The AMC may charge the scheme with investment and advisory fees which shall be within the limits prescribed under Regulation 52 of the SEBI (Mutual Funds) Regulations, 1996. Furthermore, an Exit Load may be applicable if units are redeemed or switched out before the completion of a specified holding period from the date of allotment. The Total Expense Ratio (TER) encompasses all recurring expenses including the investment management and advisory fee, sales and routing charges, audit fees, custodian fees, registrar and transfer agent fees, and marketing and selling expenses.`;

type SimplifyResult = {
  summary: string;
  points: { title: string; explanation: string }[];
  terms: { term: string; definition: string }[];
  source: 'LIVE' | 'UNAVAILABLE';
};

export function DocumentSimplifier() {
  const navigate = useNavigate();
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SimplifyResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSimplify = async (textOverride?: string) => {
    const text = textOverride ?? inputText;
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (session) headers['Authorization'] = `Bearer ${session.access_token}`;

      const res = await fetch('/api/learning/simplify', {
        method: 'POST',
        headers,
        body: JSON.stringify({ text })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Simplification failed. Please try again.');
      } else {
        setResult(data);
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const loadSample = () => {
    setInputText(SAMPLE_TEXT);
    setResult(null);
    setError(null);
  };

  return (
    <div className="bg-background text-on-background min-h-screen pb-[80px] md:pb-0 font-body-md antialiased">
      {/* Header */}
      <header className="w-full sticky top-0 z-50 bg-surface border-b border-outline-variant">
        <div className="flex items-center gap-3 px-4 py-3 w-full max-w-7xl mx-auto h-14">
          <button
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="w-11 h-11 flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors active:scale-95"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex items-center gap-2 flex-1">
            <FileText size={20} className="text-primary" />
            <h1 className="font-headline-sm text-on-surface">Document Simplifier</h1>
          </div>
          <div className="flex items-center gap-1 bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full">
            <Sparkles size={14} />
            <span className="font-label-sm">AI Powered</span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 flex flex-col gap-6">
        {/* Intro */}
        <div>
          <h2 className="font-display-lg-mobile text-primary mb-1">Understand Any Document</h2>
          <p className="font-body-md text-on-surface-variant">
            Paste any complex financial text below — SID, KIM, offer document, terms — and get a plain-English breakdown in seconds.
          </p>
        </div>

        {/* Input Panel */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant bg-surface-container-low">
            <h3 className="font-headline-sm text-on-surface">Paste Financial Text</h3>
            <button
              onClick={loadSample}
              className="flex items-center gap-2 text-primary font-label-sm hover:bg-primary-fixed px-3 py-1 rounded-full transition-colors"
            >
              <ClipboardPaste size={14} />
              Try Sample
            </button>
          </div>
          <div className="p-4 flex flex-col gap-3">
            <textarea
              value={inputText}
              onChange={(e) => { setInputText(e.target.value); setResult(null); setError(null); }}
              placeholder="e.g. The scheme shall be subject to an Expense Ratio, calculated as a percentage of the daily net assets..."
              rows={7}
              className="w-full bg-surface text-on-surface font-body-md rounded-lg border border-outline-variant p-4 focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-y placeholder:text-outline"
            />
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-on-surface-variant">
                {inputText.length > 0 ? `${inputText.length} characters` : 'Min 20 characters required'}
              </span>
              <button
                onClick={() => handleSimplify()}
                disabled={loading || inputText.trim().length < 20}
                className="flex items-center gap-2 bg-primary text-on-primary font-label-md px-6 py-2.5 rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] shadow-sm min-h-[44px]"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                {loading ? 'Simplifying...' : 'Simplify'}
              </button>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="flex items-start gap-3 bg-error-container text-on-error-container rounded-xl p-4 border border-error/20">
            <AlertTriangle size={20} className="shrink-0 mt-0.5" />
            <p className="font-body-md">{error}</p>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && (
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 flex flex-col gap-4 animate-pulse">
            <div className="h-4 bg-surface-container rounded w-3/4"></div>
            <div className="h-4 bg-surface-container rounded w-full"></div>
            <div className="h-4 bg-surface-container rounded w-5/6"></div>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div className="h-20 bg-surface-container rounded-lg"></div>
              <div className="h-20 bg-surface-container rounded-lg"></div>
            </div>
          </div>
        )}

        {/* Result Panel */}
        {result && !loading && (
          <div className="flex flex-col gap-4 animate-in slide-in-from-bottom-4 duration-500">
            {/* Summary */}
            <div className="bg-primary-container rounded-xl border border-primary-fixed p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-secondary-fixed opacity-20 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none"></div>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={20} className="text-on-primary-container" />
                <h3 className="font-headline-sm text-on-primary-container">Plain-English Summary</h3>
              </div>
              <p className="font-body-md text-on-primary-container leading-relaxed">{result.summary}</p>
            </div>

            {/* Simplified Points */}
            {result.points && result.points.length > 0 && (
              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-outline-variant bg-surface-container-low">
                  <h3 className="font-headline-sm text-on-surface">Key Points Explained</h3>
                </div>
                <ul className="p-4 flex flex-col gap-3">
                  {result.points.map((point, i) => (
                    <li key={i} className="flex items-start gap-3 bg-surface-container-low p-3 rounded-lg">
                      <CheckCircle2 size={22} className="text-secondary mt-0.5 shrink-0" />
                      <div>
                        <span className="font-label-md font-bold text-on-surface block mb-1">{point.title}</span>
                        <span className="font-body-md text-on-surface-variant">{point.explanation}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Key Terms */}
            {result.terms && result.terms.length > 0 && (
              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-outline-variant bg-surface-container-low flex items-center gap-2">
                  <BookOpen size={18} className="text-primary" />
                  <h3 className="font-headline-sm text-on-surface">Key Terms Defined</h3>
                </div>
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {result.terms.map((t, i) => (
                    <div key={i} className="bg-surface-container border border-outline-variant rounded-lg p-4">
                      <h4 className="font-headline-sm text-primary mb-1">{t.term}</h4>
                      <p className="font-body-md text-on-surface-variant">{t.definition}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <p className="font-label-sm text-on-surface-variant text-center px-4">
              ⓘ This is an AI-generated simplification for educational purposes only. Always read the full official document.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
