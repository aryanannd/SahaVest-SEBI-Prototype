import { getCandles, getQuote } from '../src/lib/marketData';
import { getCompanyNews } from '../src/lib/newsService';
import { generateContextSummary } from '../src/lib/aiContextSummary';
import dotenv from 'dotenv';
dotenv.config();

const TEST_SYMBOLS = [
  { symbol: 'RELIANCE', name: 'Reliance Industries' },
  { symbol: 'INFY', name: 'Infosys Ltd' },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd' },
];

async function run() {
  console.log('====================================================');
  console.log('STAGE B: Market Data & News Service Layer Verification');
  console.log('====================================================\n');

  for (const { symbol, name } of TEST_SYMBOLS) {
    console.log(`\n─────────────────────────────────────────────`);
    console.log(`Testing: ${name} (${symbol})`);
    console.log(`─────────────────────────────────────────────`);

    // 1. Candle data
    console.log('\n[TEST 1] OHLC Candle Data (3-month, daily)');
    const candles = await getCandles(symbol, '1d', '3mo');
    console.log(`  Yahoo symbol: ${candles.symbol}`);
    console.log(`  Source: ${candles.source}`);
    console.log(`  Candles fetched: ${candles.candles.length}`);
    if (candles.candles.length > 0) {
      const last = candles.candles[candles.candles.length - 1];
      console.log(`  Latest candle: time=${new Date(last.time * 1000).toISOString().split('T')[0]}, open=${last.open}, high=${last.high}, low=${last.low}, close=${last.close}, volume=${last.volume}`);
    }
    if (candles.live_fetch_failed) {
      console.log(`  ⚠️ Live fetch failed — stale cache used. Error: ${candles.error_hint}`);
    }
    console.log(`  Cached at: ${candles.cached_at}`);
    if (candles.candles.length > 0) {
      console.log(`  [PASS] Candle data present`);
    } else {
      console.log(`  [FAIL/PARTIAL] No candle data returned (source: ${candles.source})`);
    }

    // 2. Quote
    console.log('\n[TEST 2] Delayed Quote');
    const quote = await getQuote(symbol);
    console.log(`  Price: ₹${quote.price}  Change: ${quote.dayChange} (${quote.dayChangePercent}%)`);
    console.log(`  Day range: ₹${quote.dayLow} – ₹${quote.dayHigh}`);
    console.log(`  Source: ${quote.source}`);
    console.log(`  Cached at: ${quote.cached_at}`);
    if (quote.price > 0) {
      console.log(`  [PASS] Quote available`);
    } else {
      console.log(`  [FAIL/PARTIAL] Quote unavailable (source: ${quote.source})`);
    }

    // 3. News
    console.log('\n[TEST 3] Company News (NewsData.io)');
    const news = await getCompanyNews(name, symbol);
    console.log(`  Source: ${news.source}`);
    console.log(`  Articles fetched: ${news.articles.length}`);
    if (news.articles.length > 0) {
      console.log(`  Top headline: "${news.articles[0].title}" — ${news.articles[0].source_name}`);
    }
    if (news.live_fetch_failed) {
      console.log(`  ⚠️ Live fetch failed — stale cache used.`);
    }
    if (news.articles.length > 0) {
      console.log(`  [PASS] News articles fetched`);
    } else {
      console.log(`  [FAIL/PARTIAL] No news articles returned`);
    }

    // 4. AI Summary
    console.log('\n[TEST 4] AI Context Summary');
    const summary = await generateContextSummary(
      symbol,
      name,
      news.articles,
      candles.candles.slice(-60)
    );
    console.log(`  Source: ${summary.source}`);
    console.log(`  Sentiment: "${summary.sentiment_summary}"`);
    console.log(`  Volatility: "${summary.volatility_context}"`);
    console.log(`  Key themes: ${summary.key_themes.join(', ')}`);
    console.log(`  Disclaimer present: ${summary.disclaimer.length > 0}`);
    console.log(`  Disclaimer text: "${summary.disclaimer.slice(0, 80)}..."`);

    // Safety check — no prediction language in LLM-GENERATED fields only
    // (We exclude news headline titles which may legitimately contain financial terms)
    const predictionKeywords = ['will rise', 'will fall', 'will increase', 'will decrease', 'recommend', 'probability', '% chance', 'predict', 'forecast'];
    const llmGeneratedText = `${summary.sentiment_summary} ${summary.volatility_context}`.toLowerCase();
    const detected = predictionKeywords.filter(kw => llmGeneratedText.includes(kw));
    if (detected.length === 0) {
      console.log(`  [PASS] No prediction/advice language detected in AI output`);
    } else {
      console.log(`  [FAIL] Detected prohibited language: ${detected.join(', ')}`);
    }
  }

  console.log('\n====================================================');
  console.log('Stage B Verification Complete');
  console.log('====================================================\n');
}

run().catch(console.error);
