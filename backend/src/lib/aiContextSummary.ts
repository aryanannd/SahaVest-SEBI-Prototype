import { supabase } from './supabase';
import dotenv from 'dotenv';
import type { NewsArticle } from './newsService';
import { generateAIResponse } from './llm';

dotenv.config();

export interface AiContextSummary {
  symbol: string;
  company_name: string;
  sentiment_summary: string;
  volatility_context: string;
  key_themes: string[];
  news_sources_used: string[];
  disclaimer: string;
  generated_at: string;
  source: 'LIVE' | 'CACHE' | 'UNAVAILABLE';
}

const SUMMARY_TTL_MS = 60 * 60 * 1000; // 1 hour

export const PROHIBITED_SAFETY_PATTERNS: Array<{ regex: RegExp; label: string }> = [
  { regex: /\bprobabilit(?:y|ies)\b/i, label: 'probability' },
  { regex: /\bguaranteed?\b/i, label: 'guarantee' },
  { regex: /\bwill\s+(?:rise|fall|surge|drop|increase|decrease|gain|lose|skyrocket|plummet|rally|crash)\b/i, label: 'will rise/fall prediction' },
  { regex: /\b(?:buy|sell|accumulate|exit|dump)\s+(?:now|immediately|today|shares|stock)\b/i, label: 'buy/sell call' },
  { regex: /\b(?:strong\s+buy|strong\s+sell|price\s+target|target\s+price)\b/i, label: 'target price/rating' },
  { regex: /\b(?:recommend(?:ed)?\s+to\s+(?:buy|sell|hold|invest))\b/i, label: 'recommendation' },
  { regex: /\b\d+(?:\.\d+)?%\s+(?:chance|likelihood|probability)\b/i, label: 'percentage probability' },
];

/**
 * Scans text against regex safety guardrails for prohibited financial advice/prediction terms.
 */
export function scanForProhibitedLanguage(text: string): string[] {
  const violations: string[] = [];
  for (const { regex, label } of PROHIBITED_SAFETY_PATTERNS) {
    if (regex.test(text)) {
      violations.push(label);
    }
  }
  return violations;
}

const STRICT_PROMPT_TEMPLATE = (
  companyName: string,
  symbol: string,
  newsSnippets: string,
  priceContext: string
) => `You are a financial information assistant for SahaVest, an Indian personal finance app.

Your task is to write a brief, factual AI Context Summary for ${companyName} (${symbol}) based ONLY on the information provided below. 

STRICT RULES — you MUST follow ALL of these without exception:
1. Do NOT predict price direction (up, down, bullish, bearish, likely to rise/fall).
2. Do NOT give a buy, sell, or hold recommendation.
3. Do NOT state any probability or percentage chance of price movement.
4. Do NOT suggest what action a user should take with their investment.
5. ONLY summarize what the recent news says and describe historical price volatility as context.
6. Use neutral, factual language throughout.
7. Keep the total response concise — 3 to 5 sentences maximum.

Recent news headlines for ${companyName}:
${newsSnippets}

Price context (historical):
${priceContext}

Respond in the following JSON format ONLY (no markdown, no extra text):
{
  "sentiment_summary": "A 2-3 sentence factual summary of what the recent news articles say about this company. Do not predict or advise.",
  "volatility_context": "A 1-2 sentence description of the recent price behaviour (e.g., '${companyName} has shown moderate fluctuations over the past 3 months, with a price range of ...'). Do NOT predict.",
  "key_themes": ["theme1", "theme2", "theme3"]
}`;

/**
 * Generates an AI Context Summary for a company's stock.
 * Uses OpenRouter/Gemini (same as Scam Checker) with a strict no-prediction prompt.
 * Cached for 1 hour. Never includes price predictions or advice.
 */
export async function generateContextSummary(
  symbol: string,
  companyName: string,
  newsArticles: NewsArticle[],
  recentCandles?: { open: number; high: number; low: number; close: number }[]
): Promise<AiContextSummary> {
  const cacheKey = `ai_summary:${symbol.toUpperCase()}`;

  // 1. Check cache
  const { data: cachedRow } = await supabase
    .from('market_cache')
    .select('payload, cached_at')
    .eq('cache_key', cacheKey)
    .single();

  const isCacheFresh =
    cachedRow && Date.now() - new Date(cachedRow.cached_at).getTime() < SUMMARY_TTL_MS;

  if (isCacheFresh && cachedRow) {
    return { ...(cachedRow.payload as AiContextSummary), source: 'CACHE' };
  }

  // 2. Build context strings for LLM
  const newsSnippets = newsArticles.length > 0
    ? newsArticles
        .slice(0, 5)
        .map((a, i) => `${i + 1}. "${a.title}" (${a.source_name}, ${new Date(a.published_at).toLocaleDateString('en-IN')})`)
        .join('\n')
    : 'No recent news articles available.';

  let priceContext = 'No recent price history available.';
  if (recentCandles && recentCandles.length >= 5) {
    const prices = recentCandles.map((c) => c.close);
    const high = Math.max(...prices);
    const low = Math.min(...prices);
    const first = prices[0];
    const last = prices[prices.length - 1];
    const pctChange = (((last - first) / first) * 100).toFixed(1);
    priceContext = `Over the past ${recentCandles.length} trading days, ${companyName} traded between ₹${low.toFixed(2)} and ₹${high.toFixed(2)}, with a net change of ${pctChange}% over this period.`;
  }

  // 3. Build prompt
  const prompt = STRICT_PROMPT_TEMPLATE(companyName, symbol, newsSnippets, priceContext);

  // 4. Call LLM (using shared generateAIResponse with OpenRouter -> Gemini fallback)
  let llmResponse: string | null = null;
  try {
    llmResponse = await generateAIResponse([
      { role: 'user', content: prompt }
    ]);
  } catch (e: any) {
    console.warn('[AIContextSummary] LLM call failed:', e.message);
  }

  // 5. Parse response
  const DISCLAIMER =
    'This is informational context only, not investment advice or a prediction. Past market behaviour and news sentiment do not guarantee future results. Consult a SEBI-registered financial advisor before making investment decisions.';

  const newsSources = newsArticles.slice(0, 5).map((a) => a.source_name);

  if (llmResponse) {
    try {
      // Strip any markdown fences the LLM may have added
      const cleaned = llmResponse.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(cleaned);

      // Automated Regex Safety Guardrail
      let rawText = `${parsed.sentiment_summary || ''} ${parsed.volatility_context || ''}`;
      let safetyViolations = scanForProhibitedLanguage(rawText);

      let finalSentiment = parsed.sentiment_summary || 'Summary unavailable.';
      let finalVolatility = parsed.volatility_context || priceContext;
      let finalThemes = Array.isArray(parsed.key_themes) ? parsed.key_themes.slice(0, 5) : [];

      if (safetyViolations.length > 0) {
        console.warn(`[AIContextSummary] Safety guardrail triggered (${safetyViolations.join(', ')}). Initiating full regeneration with strict re-prompt...`);
        try {
          const retryPrompt = `${prompt}\n\nSTRICT SAFETY CORRECTION REQUIRED: Your previous attempt contained prohibited terms (${safetyViolations.join(', ')}). Completely regenerate the summary from scratch. You MUST strictly describe historical events and news facts ONLY. Absolutely NO predictions, NO probabilities, and NO investment recommendations.`;
          const retryResponse = await generateAIResponse([
            { role: 'user', content: retryPrompt }
          ]);
          if (retryResponse) {
            const cleanedRetry = retryResponse.replace(/```json\n?|\n?```/g, '').trim();
            const parsedRetry = JSON.parse(cleanedRetry);
            const retryRawText = `${parsedRetry.sentiment_summary || ''} ${parsedRetry.volatility_context || ''}`;
            const retryViolations = scanForProhibitedLanguage(retryRawText);

            if (retryViolations.length === 0 && parsedRetry.sentiment_summary) {
              console.log('[AIContextSummary] Full regeneration succeeded cleanly.');
              finalSentiment = parsedRetry.sentiment_summary;
              finalVolatility = parsedRetry.volatility_context || priceContext;
              finalThemes = Array.isArray(parsedRetry.key_themes) ? parsedRetry.key_themes.slice(0, 5) : finalThemes;
            } else {
              console.warn('[AIContextSummary] Retry also contained violations or failed. Using safe deterministic template.');
              finalSentiment = newsArticles.length > 0
                ? `Recent news articles provide operational updates and market reporting for ${companyName}.`
                : `Recent news coverage for ${companyName} is informational.`;
              finalVolatility = priceContext;
            }
          }
        } catch (retryErr: any) {
          console.warn('[AIContextSummary] Full regeneration attempt failed:', retryErr.message);
          finalSentiment = newsArticles.length > 0
            ? `Recent news articles provide operational updates and market reporting for ${companyName}.`
            : `Recent news coverage for ${companyName} is informational.`;
          finalVolatility = priceContext;
        }
      }

      const summary: AiContextSummary = {
        symbol,
        company_name: companyName,
        sentiment_summary: finalSentiment,
        volatility_context: finalVolatility,
        key_themes: finalThemes,
        news_sources_used: newsSources,
        disclaimer: DISCLAIMER,
        generated_at: new Date().toISOString(),
        source: 'LIVE',
      };

      // Cache it
      await supabase
        .from('market_cache')
        .upsert(
          { cache_key: cacheKey, payload: summary, cached_at: new Date().toISOString() },
          { onConflict: 'cache_key' }
        );

      return summary;
    } catch (parseErr) {
      console.warn('[AIContextSummary] Failed to parse LLM JSON response');
    }
  }

  // 6. Graceful fallback — return template-based summary without LLM
  const fallback: AiContextSummary = {
    symbol,
    company_name: companyName,
    sentiment_summary: newsArticles.length > 0
      ? `Recent news coverage for ${companyName} includes: "${newsArticles[0].title}". ${newsArticles.length > 1 ? `Other notable topics include "${newsArticles[1].title}".` : ''}`
      : `No recent news articles were found for ${companyName} at this time.`,
    volatility_context: priceContext,
    key_themes: ['Market News', 'Indian Equities'],
    news_sources_used: newsSources,
    disclaimer: DISCLAIMER,
    generated_at: new Date().toISOString(),
    source: 'UNAVAILABLE',
  };

  return fallback;
}
