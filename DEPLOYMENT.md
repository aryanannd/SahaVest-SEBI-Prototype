# SahaVest Production & Sandbox Deployment Guide

This guide outlines the exact steps to deploy the SahaVest Full Stack Application to production.

---

## 1. Environment Variables Reference

### Backend (`backend/.env` or Render / Railway / Fly.io Dashboard)
| Variable Name | Description | Example / Default |
| :--- | :--- | :--- |
| `PORT` | HTTP Server listening port | `3000` |
| `NODE_ENV` | Environment mode | `production` |
| `SUPABASE_URL` | Supabase Project URL | `https://pqqdkzdsnonlndgrfyfj.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Secret Key | `eyJh...` |
| `SETU_CLIENT_ID` | Setu API Client ID | `your_setu_client_id` |
| `SETU_CLIENT_SECRET` | Setu API Client Secret | `your_setu_client_secret` |
| `SETU_PRODUCT_INSTANCE_ID` | Setu Account Aggregator Product ID | `your_instance_id` |
| `SETU_BASE_URL` | Setu API Endpoint | `https://fiu-sandbox.setu.co/v2` |
| `SETU_WEBHOOK_SECRET` | Setu Webhook HMAC verification secret | `your_webhook_secret` |
| `AA_LIVE` | Flag for live Setu API vs fallback | `true` |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL (Cache & Rate Limiting) | `https://your-endpoint.upstash.io` |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST Auth Token | `your_upstash_token` |
| `UPSTASH_REDIS_URL` | Upstash Redis TLS connection string (BullMQ Queue) | `rediss://default:pwd@endpoint.upstash.io:6379` |
| `SENTRY_DSN` | Sentry Node / Express DSN | `https://...` |
| `CORS_ORIGIN` | Comma-separated allowed web origins | `https://sahavest.vercel.app,http://localhost:5173` |

### Frontend (`frontend/.env` or Vercel / Netlify Dashboard)
| Variable Name | Description | Example / Default |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Deployed Backend API root URL | `https://sahavest-backend.onrender.com/api` |
| `VITE_SENTRY_DSN` | Sentry React DSN | `https://...` |
| `VITE_MOCK_OTP` | Bypass SMS OTP for demo days | `false` |
| `VITE_AA_LIVE` | Enable live Setu redirect mode | `true` |

---

## 2. Deploying Backend (Render / Railway / Docker)

### Option A: Render (Web Service)
1. Link your GitHub repository to Render.
2. Select **Web Service** with root directory `backend`.
3. Set **Build Command**: `npm install`
4. Set **Start Command**: `npm start`
5. Fill in the required environment variables in the Render Environment tab.

### Option B: Docker
```bash
cd backend
docker build -t sahavest-backend .
docker run -p 3000:3000 --env-file .env sahavest-backend
```

---

## 3. Deploying Frontend (Vercel)

1. Import the repository into Vercel.
2. Select **Root Directory**: `frontend`.
3. Set **Framework Preset**: `Vite`.
4. Configure Build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Add Environment Variables:
   - `VITE_API_BASE_URL` = `https://your-backend-domain.com/api`
   - `VITE_SENTRY_DSN` = `your_sentry_frontend_dsn`
6. Deploy!

---

## 4. Post-Deployment Verification Checklist

1. **Backend Health Check**:
   - `curl https://your-backend.com/api/health` -> `{"status":"ok"}`
2. **Redis & Cache Verification**:
   - `curl https://your-backend.com/api/redis/health` -> `{"cache_test":"SUCCESS"}`
3. **Setu Webhook Endpoint**:
   - Verify Setu portal points webhook callback to `https://your-backend.com/api/webhooks/setu-aa`.
4. **Sentry Error Reporting**:
   - Visit `https://your-backend.com/api/debug-sentry` to verify errors trigger in your Sentry dashboard.
