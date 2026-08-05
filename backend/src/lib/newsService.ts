import { supabase } from './supabase';
import dotenv from 'dotenv';

dotenv.config();

export interface NewsArticle {
  title: string;
  description: string | null;
  url: string;
  published_at: string;
  source_name: string;
}

const NEWS_TTL_MS = 60 * 60 * 1000; // 1 hour cache

/**
 * Fetches recent news articles for a company using NewsData.io.
 * Caches results in Supabase market_cache table.
 * Gracefully falls back to stale cache on API failure.
 */
export async function getCompanyNews(
  companyName: string,
  symbol?: string
): Promise<{
  articles: NewsArticle[];
  cached_at: string;
  source: 'LIVE' | 'CACHE_STALE' | 'NO_DATA';
  live_fetch_failed?: boolean;
}> {
  const apiKey = process.env.NEWS_API_KEY;
  const cacheKey = `news:${(symbol || companyName).toUpperCase().replace(/\s+/g, '_')}`;

  // 1. Check cache
  const { data: cachedRow } = await supabase
    .from('market_cache')
    .select('payload, cached_at')
    .eq('cache_key', cacheKey)
    .single();

  const isCacheFresh =
    cachedRow && Date.now() - new Date(cachedRow.cached_at).getTime() < NEWS_TTL_MS;

  if (isCacheFresh && cachedRow) {
    return {
      articles: cachedRow.payload as NewsArticle[],
      cached_at: cachedRow.cached_at,
      source: 'LIVE',
    };
  }

  // 2. Fetch from NewsData.io
  if (!apiKey || apiKey.includes('your_newsdata')) {
    console.warn('[NewsService] NEWS_API_KEY not configured — returning empty news');
    return { articles: [], cached_at: new Date().toISOString(), source: 'NO_DATA' };
  }

  // Build query — use company name + "India stock" for better relevance
  const query = encodeURIComponent(`${companyName} India`);
  const url = `https://newsdata.io/api/1/latest?apikey=${apiKey}&q=${query}&language=en&category=business`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`NewsData.io returned ${response.status}`);
    }
    const data: any = await response.json();

    if (data.status !== 'success' || !Array.isArray(data.results)) {
      throw new Error(`NewsData.io unexpected response: ${data.message || 'unknown error'}`);
    }

    const articles: NewsArticle[] = data.results
      .slice(0, 8) // Cap at 8 articles
      .map((r: any) => ({
        title: r.title || 'Untitled',
        description: r.description || r.content || null,
        url: r.link || '',
        published_at: r.pubDate || new Date().toISOString(),
        source_name: r.source_name || 'Unknown',
      }));

    const cached_at = new Date().toISOString();
    await supabase
      .from('market_cache')
      .upsert(
        { cache_key: cacheKey, payload: articles, cached_at },
        { onConflict: 'cache_key' }
      );

    return { articles, cached_at, source: 'LIVE' };
  } catch (err: any) {
    console.warn(`[NewsService] News fetch failed for "${companyName}":`, err.message);

    // Fallback: stale cache
    if (cachedRow) {
      return {
        articles: cachedRow.payload as NewsArticle[],
        cached_at: cachedRow.cached_at,
        source: 'CACHE_STALE',
        live_fetch_failed: true,
      };
    }

    return { articles: [], cached_at: new Date().toISOString(), source: 'NO_DATA', live_fetch_failed: true };
  }
}
