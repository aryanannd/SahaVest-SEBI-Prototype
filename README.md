# SahaVest (सह-Vest) 🚀
### Unified DPI-Native Multi-Asset Wealth Management & Financial Trust Platform

SahaVest is an AI-powered financial trust and portfolio intelligence platform designed for Indian retail investors. It leverages India's Digital Public Infrastructure (RBI's Account Aggregator framework, DigiLocker, and CKYC) to unify scattered bank, mutual fund, and demat accounts into a single dashboard, while providing real-time AI scam detection, behavioral guardrails, jargon explainability, and immutable regulatory audit trails.

---

## 1. Prerequisites

Before running SahaVest locally, ensure you have:
- **Node.js**: `v20.x` or higher (tested on Node v20/v22)
- **npm**: `v10.x` or higher
- **Supabase Account**: A free Supabase PostgreSQL project with SQL editor access (or local Supabase CLI)
- **Upstash Redis** *(Optional for local dev, fallback in-memory queue included)*: For BullMQ background portfolio sync workers

---

## 2. Complete Setup Instructions

### Step 1: Clone & Install Dependencies
Clone the repository and install packages across root, frontend, and backend:

```bash
# Clone repository
git clone https://github.com/aryanannd/SahaVest-SEBI-Prototype.git
cd SahaVest-SEBI-Prototype

# Install root dependencies
npm install

# Install frontend dependencies
cd frontend && npm install

# Install backend dependencies
cd ../backend && npm install
cd ..
```

---

### Step 2: Database Setup & Migrations
1. Create a new project on [Supabase](https://supabase.com/).
2. In your Supabase dashboard, open the **SQL Editor**.
3. Run the schema migrations located in the repository in order:
   - `backend/stage1_schema_update.sql` — Core tables (`aa_consents`, `linked_accounts`, `holdings`, `transactions`, `audit_log`, `agent_execution_logs`, `scam_checks`).
   - `backend/stage2_profile_schema.sql` — User profile, risk assessment, and notification tables.
   - `backend/supabase/migrations/20260729000001_create_aa_consent_events.sql` — Immutable ledger for consent state changes.
   - `backend/supabase/migrations/20260729000002_create_sync_attempts.sql` — Queue & sync attempt audit logging.
   - `backend/supabase/migrations/20260729000003_create_simulation_runs.sql` — Simulation and what-if scenario tracking.
   - `backend/migrations/003_broker_connections.sql` — Broker OAuth & token connection tables.

---

### Step 3: Environment Variables Setup

Copy `.env.example` to `.env` in both `backend/` and `frontend/`:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

#### Backend Environment Variables (`backend/.env`):
| Variable | Description | Where to Get |
|---|---|---|
| `PORT` | Backend HTTP server port (`3000`) | Default `3000` |
| `SUPABASE_URL` | Supabase Project API URL | Supabase Dashboard -> Project Settings -> API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Secret Key | Supabase Dashboard -> Project Settings -> API -> `service_role` secret |
| `AA_LIVE` | `false` for Sandbox/Simulated AA sync; `true` for Live Setu API | Set `false` for local hackathon demo |
| `SETU_CLIENT_ID` | Setu Account Aggregator Client ID | [Setu Bridge Portal](https://bridge.setu.co/) -> Sandbox App |
| `SETU_CLIENT_SECRET` | Setu AA Client Secret | [Setu Bridge Portal](https://bridge.setu.co/) -> Sandbox App |
| `SETU_PRODUCT_INSTANCE_ID` | Setu Product Instance ID | [Setu Bridge Portal](https://bridge.setu.co/) |
| `SETU_BASE_URL` | Setu API Endpoint (`https://fiu-sandbox.setu.co/v2`) | Setu Docs / Default sandbox URL |
| `SETU_WEBHOOK_SECRET` | Webhook verification secret for Setu callbacks | Setu App Webhook configuration |
| `OPENROUTER_API_KEY` | Primary LLM gateway for AI Scam Checker & Explainability | [OpenRouter.ai](https://openrouter.ai/keys) |
| `GEMINI_API_KEY` | Secondary fallback LLM key | [Google AI Studio](https://aistudio.google.com/app/apikey) |
| `REDIS_URL` / `UPSTASH_REDIS_URL` | Upstash Redis connection URI for BullMQ queues | [Upstash Console](https://console.upstash.com/) -> Redis Database |
| `UPSTASH_REDIS_REST_URL` | Upstash REST API endpoint for rate limiting | [Upstash Console](https://console.upstash.com/) |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash REST bearer token | [Upstash Console](https://console.upstash.com/) |
| `CORS_ORIGIN` | Allowed client origins (`http://localhost:5173`) | Localhost or deployed frontend URL |
| `SENTRY_DSN` / `SENTRY_DSN_BACKEND` | Sentry DSN for backend error tracking | [Sentry.io](https://sentry.io/) |
| `KITE_API_KEY` | Zerodha Kite Connect API key | [Kite Developer](https://kite.trade/) |
| `KITE_API_SECRET` | Zerodha Kite Connect API secret | [Kite Developer](https://kite.trade/) |
| `KITE_REDIRECT_URL` | Zerodha OAuth redirect callback URL | `http://localhost:3000/api/broker/zerodha/callback` |
| `UPSTOX_API_KEY` | Upstox API key for broker integration | [Upstox Developer](https://upstox.com/developer/) |
| `UPSTOX_API_SECRET` | Upstox API secret | [Upstox Developer](https://upstox.com/developer/) |
| `UPSTOX_REDIRECT_URL` | Upstox OAuth redirect callback URL | `http://localhost:3000/api/broker/upstox/callback` |
| `TOKEN_ENCRYPTION_KEY` | 32-byte secret for AES-256-GCM token encryption | Random 32-char hex string |
| `CASPARSER_API_KEY` | Key for parsing CAS statements | CASParser API |
| `NEWS_API_KEY` | Key for market news & stock drill-down | [NewsData.io](https://newsdata.io/) |

#### Frontend Environment Variables (`frontend/.env`):
| Variable | Description | Where to Get |
|---|---|---|
| `VITE_API_BASE_URL` | Backend API URL (`http://localhost:3000/api`) | Default local backend URL |
| `VITE_SUPABASE_URL` | Supabase project URL | Supabase Dashboard -> Project Settings |
| `VITE_SUPABASE_ANON_KEY` | Supabase public anonymous API key | Supabase Dashboard -> Project Settings -> API |
| `VITE_SENTRY_DSN` | Sentry DSN for frontend crash reporting | Sentry.io |
| `VITE_MOCK_OTP` | `true` to allow any 6-digit OTP during onboarding | `true` for demo |
| `VITE_AA_LIVE` | Mirrors backend AA live toggle on UI | `false` for demo |

---

### Step 4: Run Development Servers

Run both Frontend and Backend concurrently from the root directory:

```bash
# Starts Frontend (http://localhost:5173) and Backend (http://localhost:3000)
npm run dev
```

Or run them in separate terminal windows:
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev
```

---

## 3. Current Feature Status

| Feature Area | Current Status | Description |
|---|---|---|
| **AI Scam Checker** | 🟢 **Fully Live** | Multi-modal text & image fraud detection using OpenRouter LLMs with Gemini fallback and regex rules. Logs to `agent_execution_logs`. |
| **Financial Jargon Explainer** | 🟢 **Fully Live** | Contextual financial term simplifier (<50 words) with structured AI explanations. |
| **Portfolio & Exposure Analytics** | 🟢 **Fully Live** | Real DB aggregation of sector, asset class, and concentration risk from `holdings`. |
| **Behavioral Alerts Engine** | 🟢 **Fully Live** | Overtrading and panic-selling pattern detector analyzing `transactions` table. |
| **Consent Revocation & Audit Trail**| 🟢 **Fully Live** | SHA256 hashed append-only audit trail (`audit_log` & `aa_consent_events`) with instant local revocation. |
| **Account Aggregator (Setu)** | 🟡 **Sandbox / Demo Mode** | Full end-to-end AA architecture built (`lib/setuAA.ts`, BullMQ queue in `lib/queue.ts`). With `AA_LIVE=false`, it simulates the consent flow and populates realistic multi-asset holdings while logging `sync_attempts`. UI includes explicit "Sandbox Mode" labels. |
| **Direct Broker Connect** | 🟡 **Prototype** | Kite and Upstox OAuth routes implemented in backend with AES-256 token encryption. |

---

## 4. Note on Demo & Mock Modes

- **`VITE_MOCK_OTP=true`**: Bypasses SMS delivery gateway constraints during live evaluations. Any 6-digit number (e.g., `123456`) authenticates the user instantly.
- **`AA_LIVE=false`**: Financial institutions in the RBI Account Aggregator sandbox require pre-whitelisted test credentials and OTPs. Setting `AA_LIVE=false` allows evaluators to experience the full consent approval and background queue syncing lifecycle without external network flakiness. The database writes (`sync_attempts`, `aa_consents`, `holdings`) mirror the live Setu API payload 1:1.

---

## 5. Project Structure

```text
SahaVest_Full_Clickable_Prototype/
├── backend/
│   ├── src/
│   │   ├── index.ts               # Primary Express API server & routes
│   │   ├── lib/
│   │   │   ├── setuAA.ts          # Setu Account Aggregator integration client
│   │   │   ├── queue.ts           # BullMQ portfolio sync workers & fallback queue
│   │   │   ├── llm.ts             # OpenRouter & Gemini AI routing & fallbacks
│   │   │   ├── kiteConnect.ts     # Zerodha broker integration
│   │   │   ├── upstoxConnect.ts   # Upstox broker integration
│   │   │   └── redis.ts           # Upstash Redis & Rate limiter client
│   ├── supabase/
│   │   └── migrations/            # Versioned SQL migrations for AA events & sync attempts
│   ├── scripts/                   # Backfill, testing, and migration verification scripts
│   ├── stage1_schema_update.sql   # Core DB schema definitions
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx                # App layout & React Router routing
│   │   ├── features/
│   │   │   ├── onboarding/        # Mobile auth, Risk profiling, AA consent flow screens
│   │   │   ├── dashboard/         # Net worth & portfolio summary widgets
│   │   │   ├── portfolio/         # Asset drill-downs, Sector exposure, Tax summary
│   │   │   ├── trust/             # AI Scam Checker, Behavioral alerts, Audit trail
│   │   │   ├── compliance/        # Consent manager & Privacy center
│   │   │   ├── ai/                # Jargon explainability & AI chat
│   │   │   └── trading/           # Broker connection & order simulation
│   │   └── components/            # Reusable UI components & guards
│   ├── vite.config.ts
│   └── package.json
│
├── reference/                     # Product blueprints & architecture specifications
└── README.md
```

---

## 6. Regulatory & SEBI Alignment

- **Investor Protection**: Real-time scam warning against unregistered "guaranteed return" investment schemes.
- **Market Integrity**: Behavioral alerts to deter speculative overtrading and panic selling.
- **RegTech & Consent Architecture**: Compliant with RBI Master Directions on Account Aggregators (explicit consent, time-bound validity, instant revocation).
- **Auditability**: Complete data provenance with SHA256 hashed ledger entries for every critical data access and AI decision.
