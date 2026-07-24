# SahaVest — Complete Final Product Blueprint
### Unified DPI-Native Multi-Asset Investing & Investor Protection Platform
**Version:** 1.0 Full Build Blueprint | **Team:** Aether Lab | **Date:** July 2026

---

## 0. Reality Check Pehle (Zaroori — Warna Baad Mein Dhoka Lagega)

Blueprint likhne se pehle 3 hard truths clear kar deta hoon, kyunki inko ignore karke banaya gaya plan sirf slide pe achha lagega, ground pe nahi chalega:

1. **AA se sab data turant nahi milta.** CDSL/NSDL (equity, MF, ETF, AIF, REIT/InvIT) 13 AAs ke sath live hai — solid. NPS bhi live hai kyunki PFRDA ne CRAs ko FIP banaya hai (2022 se). Lekin depository transaction history sirf **2 saal tak capped** hai AA ke through — puri history CAS statement se leni padegi. Bonds (NSE goBID) aur SGB (RBI Retail Direct) **AA framework mein FIP nahi hain abhi** — inko scrape/manual link ya CAS-parsing se hi lana padega, seedha AA se nahi.
2. **SahaVest broker nahi banega, custody nahi lega.** Ye conscious architectural decision hai — custody lene ka matlab hai apna khud ka SEBI broker/depository license chahiye, jo year lag jayega aur capital-heavy hai. Isliye order execution hamesha linked broker/AMC ke through hi jayega (redirect ya API-partnership), SahaVest sirf orchestration layer hai.
3. **AI advisory = regulatory landmine.** SEBI ke Investment Adviser (IA) Regulations ke under, agar app "recommend" karta hai kya kharido, to wo **Registered Investment Adviser** ban jata hai — alag heavy compliance, net-worth requirement, exam-passed adviser chahiye. Isliye product legally "advice" nahi, balki **"educational simulation + information"** ke naam se design hoga — ye har jagah wording aur disclaimers mein reflect hoga. Ye sirf compliance-safety ke liye nahi, judges bhi isko dekh kar samjhenge ki team ne regulatory risk socha hai.

Ab pura blueprint isi reality ke upar bana hai — koi feature aisa nahi jo "AA se sab kuch milega" wale fantasy pe based ho.

---

## 1. Product Vision & Full Scope

**Vision:** Ek app jahan koi bhi retail investor apne saare investments (jahan bhi hon) ek jagah dekh sake, samajh sake, aur safe rehte hue grow kar sake — bina kisi naye broker account ya scattered logins ke.

**Full and final feature scope (sab phases combine karke) — 6 pillars:**

| Pillar | Kya karta hai |
|---|---|
| **P1 — Unified Access** | Single KYC, AA-based account linking, unified portfolio across asset classes |
| **P2 — Intelligence Layer** | Portfolio simulation ("Investor Twin"), goal planning, tax insights |
| **P3 — Trust & Safety** | Real-time scam detection, intermediary verification, suitability checks |
| **P4 — Awareness Engine** | Gamified vernacular learning, nudges, behavioral coaching |
| **P5 — Compliance & Audit** | Blockchain audit trail, SCORES integration, consent management |
| **P6 — Execution Bridge** | Deep-linked/API-based order routing to linked broker/AMC (no custody) |

---

## 2. Complete Feature List (Final, Categorized)

### 2.1 Onboarding & Identity
- Mobile number + OTP login
- DigiLocker-based Aadhaar e-KYC
- CKYC number fetch/verification
- PAN verification (NSDL PAN API)
- Video KYC fallback (for edge cases where digital KYC fails — SEBI requires this option)
- Risk profiling questionnaire (SEBI-style risk assessment — mandatory before any suitability score can be shown)
- Nominee addition flow (regulatory requirement across MF/demat)

### 2.2 Account Aggregator Linking
- AA app selection screen (Finvu, OneMoney, CAMS AA — user picks or already has one)
- Consent creation flow (data types, purpose, duration, FIPs selected)
- FIP selection: Banks, Depositories (CDSL/NSDL), MF RTAs (CAMS/KFintech), NPS CRAs
- Consent dashboard (active/expired/revoked consents, renew/revoke actions)
- Data refresh scheduler (daily/on-demand pull)
- Fallback: CAS (Consolidated Account Statement) PDF upload + parser for full history / bonds / SGB where AA doesn't reach

### 2.3 Unified Portfolio Dashboard
- Net worth summary (all asset classes combined)
- Asset allocation breakdown (pie/treemap: Equity, MF, Bonds, G-Sec, SGB, REIT/InvIT, NPS, Cash)
- Asset-class-wise drill-down screens
- Performance view (XIRR, absolute returns, benchmark comparison)
- Historical trend (net worth over time)
- Multi-account consolidation (e.g., 3 demat accounts → 1 view)
- Family/dependent portfolio view (optional, consent-based, for joint household tracking)

### 2.4 AI Intelligence Layer ("Investor Twin")
- Goal-based planning (retirement, house, education — maps existing holdings to goal gap)
- "What-if" simulator (e.g., SIP change impact) — clearly labeled as **projection, not advice**
- Portfolio concentration/risk analysis (sector, single-stock, single-AMC overexposure flags)
- Tax-loss harvesting insights (informational, not auto-executed)
- Capital gains estimator for ITR season
- Vernacular AI chatbot (12+ languages) for document simplification (SID, scheme docs, contract notes)

### 2.5 Trust & Safety
- Real-time scam/tip detector — user forwards a message/screenshot, AI flags red flags (input: text/image, uses NLP + pattern matching, not "prediction" of scam certainty)
- Live intermediary registry check (SEBI RIA/RA/broker registration number verification)
- Suitability nudge before trade (based on declared risk profile) — soft warning, not a block
- Behavioral alert engine (overtrading frequency, herd-behavior pattern e.g. sudden influx into one small-cap, portfolio concentration breach)
- "Verify before you trust" tool — paste any advisor's SEBI reg number / app name, instant registry cross-check

### 2.6 Awareness Engine
- Gamified learning modules (bite-sized, asset-class specific, quizzes)
- Certificates/badges (unlock advanced dashboard views only after literacy checkpoints — gating, not blocking access to own money)
- Daily/weekly nudge notifications (market literacy tips, not stock tips)
- Community leaderboard (opt-in, gamification)
- Regional language toggle throughout app

### 2.7 Compliance & Audit
- Immutable audit log for every AI-generated insight/nudge shown to user (hashed, permissioned ledger)
- SCORES grievance filing (deep integration — pre-filled complaint using user's held data)
- Consent history log (every AA consent, when given/revoked)
- Data privacy center (download my data, delete my data — DPDP Act 2023 compliance)

### 2.8 Execution Bridge
- Deep-link to linked broker app for equity order (SahaVest doesn't place the order itself)
- MF order via BSE StAR MF / MFU API (RTA-routed, not custodied)
- Order status sync-back into unified dashboard (via AA refresh, not real-time push — this is a known lag, be honest about it in demo)

### 2.9 Platform / Account Management
- Profile & settings
- Multi-device/session management, biometric app-lock
- Notification preferences
- Help & support / FAQ / live chat escalation
- Referral program (growth mechanic, phase 2 monetization touchpoint)

---

## 3. Complete Screen List (All Screens, Organized by Flow)

### A. Onboarding (9 screens)
1. Splash Screen
2. Language Selector
3. Mobile Number Entry
4. OTP Verification
5. Welcome / Value Prop Carousel (3 slides)
6. DigiLocker KYC Consent Screen
7. KYC Processing / Status Screen
8. Risk Profiling Questionnaire (multi-step, ~8 questions)
9. Risk Profile Result Screen ("You are a Moderate Investor")

### B. Account Linking (7 screens)
10. "Link Your Accounts" Intro Screen
11. AA Provider Selection (Finvu/OneMoney/CAMS AA/etc.)
12. FIP Selection Checklist (Bank / Demat-CDSL / Demat-NSDL / MF-CAMS / MF-KFintech / NPS-CRA)
13. Consent Detail & Approval Screen (redirects to AA app/webview)
14. Linking-in-Progress Screen
15. Linked Accounts Summary Screen
16. Consent Management Dashboard (active/revoke/renew)

### C. Home / Dashboard (6 screens)
17. Home Dashboard (net worth + quick actions + nudge banner)
18. Asset Allocation Detail (interactive chart)
19. Asset-Class Drill-down (e.g., "Mutual Funds" → list of folios)
20. Individual Holding Detail Screen (e.g., one stock/fund detail)
21. Performance & Returns Screen (XIRR, trend graph)
22. Net Worth History Screen (timeline view)

### D. Investor Twin / Intelligence (6 screens)
23. Goals Hub (list of financial goals)
24. Goal Detail & Gap Analysis Screen
25. What-If Simulator Screen (sliders: SIP amount, tenure, expected return)
26. Simulation Result Screen (with mandatory disclaimer banner)
27. Concentration Risk Alert Screen
28. Tax Summary / Capital Gains Screen

### E. Trust & Safety (6 screens)
29. Scam Checker Home (paste text / upload screenshot)
30. Scam Check Result Screen (risk flags explained in plain language)
31. Verify an Advisor Screen (SEBI reg number lookup)
32. Advisor Verification Result Screen
33. Pre-Trade Suitability Nudge (modal/interstitial before execution redirect)
34. Behavioral Alert Center (list of past nudges/alerts)

### F. Awareness Engine (5 screens)
35. Learning Home (modules grid, progress bar)
36. Module/Lesson Screen (bite-sized content + quiz)
37. Quiz Result Screen
38. Badges & Achievements Screen
39. Leaderboard Screen (opt-in)

### G. Chatbot / NLP (2 screens)
40. AI Chat Assistant Screen (persistent, accessible via FAB across app)
41. Document Simplifier Screen (upload SID/offer doc → simplified summary)

### H. Compliance & Grievance (4 screens)
42. Data Privacy Center (download/delete data)
43. Audit Trail Viewer (my recommendations/nudges log, timestamped, hash-verifiable)
44. SCORES Grievance Filing Screen
45. Grievance Status Tracker

### I. Execution Bridge (3 screens)
46. Order Intent Screen (pre-fill from linked broker/AMC context)
47. Redirect/Handoff Screen ("Continue on Zerodha/Groww to place order")
48. Post-Order Sync Confirmation Screen

### J. Account & Settings (6 screens)
49. Profile Screen
50. Security Settings (biometric, PIN, sessions)
51. Notification Preferences
52. Language & Accessibility Settings
53. Help / FAQ / Support Chat
54. Referral Screen

**Total: ~54 screens** across 10 flows — this is the complete production app, not a cut-down demo.

---

## 4. Core User Flows

### Flow 1: First-Time Onboarding → First Dashboard View
```
Splash → Language → Mobile+OTP → Welcome carousel → DigiLocker KYC consent
→ KYC processing (async, may take time — show status, don't block)
→ Risk questionnaire → Risk result → "Link your accounts" prompt
→ AA provider selection → FIP checklist → Consent approval (redirect to AA app)
→ Linking in progress (data pull, async — can take minutes for first pull)
→ Linked accounts summary → Home Dashboard (first real view of net worth)
```
**Critical UX note:** KYC + AA data pull are NOT instant. First-time dashboard should show a **progressive loading state** ("Bank data linked ✓, Demat data linked ✓, MF data pulling...") rather than a blank spinner — users abandon apps that look stuck.

### Flow 2: Daily Use — Check Portfolio → Get Nudge → Act
```
Open app (biometric unlock) → Home Dashboard shows updated net worth
→ Nudge banner appears (e.g., "3 of your MF folios overlap 60% in same sector")
→ Tap nudge → Concentration Risk Alert Screen (detail + explanation)
→ "See suggestion" → What-If Simulator (educational, not prescriptive)
→ User decides → if action needed → Order Intent Screen → Redirect to broker/AMC
```

### Flow 3: Scam Protection (the emotionally strong demo flow)
```
User receives WhatsApp tip → Opens SahaVest → Scam Checker Home
→ Pastes forwarded message / uploads screenshot
→ AI processes (NLP pattern match: unregistered advisor claim, guaranteed-return language,
   urgency pressure tactics, unverifiable SEBI reg number)
→ Scam Check Result Screen: Risk flags shown in plain language + cross-check against
   SEBI intermediary registry (via API)
→ If advisor name/number present → auto-runs Verify an Advisor Screen in background
→ Result: "⚠️ This claim could not be verified against SEBI's registry" + educational note
→ Optional: "Report to SCORES" CTA
```

### Flow 4: Learning-Gated Feature Unlock
```
New user tries to access "Derivatives/F&O view" (if held) → Locked screen
→ "Complete Level 1: Understanding Risk" prompt → Learning Home → Module → Quiz
→ Pass → Badge awarded → Feature unlocked → Redirected back to original screen
```
**Honesty note:** Gating should NEVER lock a user out of seeing their own money/holdings — only advanced analytical/simulation features can be gated. Blocking visibility of one's own portfolio for "literacy" reasons is a dark pattern and also legally questionable (it's the user's own data via consent).

### Flow 5: Grievance Filing
```
Home → Help → "File a Complaint" → SCORES Grievance Screen (pre-filled with
linked entity details) → Submit → Grievance Status Tracker (polls SCORES API/portal)
```

---

## 5. Wireframe-Level Detail (Key Screens)

### 5.1 Home Dashboard (Screen 17) — the most important screen in the app
```
┌─────────────────────────────────────┐
│ [Avatar]  Good Morning, Anand   [🔔] │  ← header, greeting + notification bell
├─────────────────────────────────────┤
│  NET WORTH                           │
│  ₹12,45,320        ▲ 2.3% (1M)       │  ← hero number, large font
│  [Line chart: 6M trend, tap to expand]│
├─────────────────────────────────────┤
│  ASSET ALLOCATION                    │
│  [Donut chart]  Equity 45% MF 30%    │
│                 Bonds 10% NPS 10%    │
│                 SGB 5%               │
├─────────────────────────────────────┤
│  ⚠️ NUDGE: "3 MF folios overlap 60%  │  ← dismissible nudge card
│     in Banking sector" [View →]      │
├─────────────────────────────────────┤
│  QUICK ACTIONS                       │
│  [Link Account] [Scam Check] [Learn] │
├─────────────────────────────────────┤
│  RECENT ACTIVITY                     │
│  - SIP debited: HDFC Flexicap ₹5,000 │
│  - New nudge generated               │
├─────────────────────────────────────┤
│ [Home] [Portfolio] [AI Chat] [Learn] │  ← bottom nav, 4 tabs + FAB for chat
│                        [Profile]     │
└─────────────────────────────────────┘
```
Design principles: net worth is the hero (largest, boldest element); nudges are visible but dismissible (never a modal blocking the dashboard); bottom nav max 4-5 items per mobile UX convention.

### 5.2 Consent Detail & Approval Screen (Screen 13)
```
┌─────────────────────────────────────┐
│ ← Back        Review Consent         │
├─────────────────────────────────────┤
│  SahaVest is requesting:             │
│  📊 Data: Holdings, Transactions     │
│  🏦 From: HDFC Bank, CDSL, CAMS      │
│  ⏱️ Duration: 1 Year (renewable)     │
│  🎯 Purpose: Portfolio Consolidation │
│  📅 Data range: Last 2 years         │
├─────────────────────────────────────┤
│  You can revoke this anytime from    │
│  Consent Management.                 │
├─────────────────────────────────────┤
│  [Deny]              [Approve →]     │  ← Approve redirects to AA app/webview
└─────────────────────────────────────┘
```
This screen is legally mandated to be explicit (RBI Master Direction requires purpose, duration, data-type transparency) — cannot be simplified away for "better UX."

### 5.3 Scam Check Result Screen (Screen 30)
```
┌─────────────────────────────────────┐
│ ← Back      Scam Check Result        │
├─────────────────────────────────────┤
│  🔴 HIGH RISK — 4 red flags found    │
├─────────────────────────────────────┤
│  ⚠️ Guaranteed-return language       │
│     detected ("2x in 30 days")       │
│  ⚠️ Urgency/pressure phrasing        │
│  ⚠️ Advisor name not found in SEBI   │
│     intermediary registry            │
│  ⚠️ Unofficial payment/UPI request   │
│     for "advisory fee"               │
├─────────────────────────────────────┤
│  What this means (plain language     │
│  explanation, 2-3 lines)             │
├─────────────────────────────────────┤
│  [Report to SCORES]  [Learn: Spotting│
│                        Investment    │
│                        Scams]        │
└─────────────────────────────────────┘
```

### 5.4 What-If Simulator (Screen 25)
```
┌─────────────────────────────────────┐
│ ← Back      SIP What-If               │
├─────────────────────────────────────┤
│  Current SIP: ₹5,000/month            │
│  [Slider: ₹1,000 ─────●──── ₹20,000] │
│  Tenure: [Slider: 1yr ──●── 20yr]     │
│  Assumed return: 10% p.a.              │
│  ⓘ This is a projection based on      │
│     historical averages, not a        │
│     guarantee or recommendation.      │
├─────────────────────────────────────┤
│  [Chart: current path vs new path]    │
│  Projected difference: +₹8,40,000     │
│  by 2036                              │
├─────────────────────────────────────┤
│  [Recalculate]                        │
└─────────────────────────────────────┘
```
Disclaimer text is non-negotiable and must appear **every single time** a projection is shown — this is what keeps the product in "educational tool" territory instead of "investment advice" territory.

---

## 6. UI Design System

- **Typography:** Inter or Noto Sans (Noto Sans mandatory for multi-script vernacular support — Devanagari, Gujarati, Tamil, Bengali, etc. must render correctly)
- **Color system:**
  - Primary: Deep Teal `#0B6E4F` (trust, money, calm — avoids the generic "fintech blue")
  - Risk/Warning: Amber `#F5A623` (nudges), Red `#D64545` (scam alerts, reserved ONLY for genuine risk — overuse kills trust)
  - Success/Growth: Green `#2E8B57`
  - Neutral background: Off-white `#FAFAF7`, Dark mode: `#121417`
- **Iconography:** Rounded, friendly line icons (not sharp corporate) — reduces intimidation for first-time investors, aligns with financial-inclusion positioning
- **Component library:** Cards for every data unit (holding, nudge, module) — consistent shadow/radius tokens
- **Charts:** Recharts/D3 for web dashboard, native chart libs (Victory Native / React Native SVG Charts) for mobile
- **Accessibility:** WCAG AA minimum, text scaling support, screen-reader labels on all financial figures (critical for genuine inclusion, not just checkbox compliance)
- **Vernacular-first:** Every screen's string table is externalized from day one (not retrofitted later) — 12+ language toggle from Settings, plus auto-detect from device locale on first launch

---

## 7. System Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                            CLIENT LAYER                              │
│   React Native (iOS/Android)         React + TypeScript (Web)        │
└───────────────────────────────┬────────────────────────────────────--┘
                                 │ HTTPS/TLS 1.3, JWT auth
┌───────────────────────────────▼──────────────────────────────────────┐
│                          API GATEWAY (Kong/AWS API GW)                │
│         Rate limiting · Auth · Request routing · Logging              │
└──────┬─────────┬──────────┬───────────┬────────────┬──────────────────┘
       │         │          │           │            │
┌──────▼───┐ ┌───▼────┐ ┌───▼─────┐ ┌───▼──────┐ ┌───▼─────────┐
│ Identity │ │ Portfolio│ │ AI/ML   │ │ Trust &  │ │ Compliance/ │
│ Service  │ │ Aggreg.  │ │ Service │ │ Safety   │ │ Audit Svc   │
│ (KYC,    │ │ Service  │ │ (Twin,  │ │ Service  │ │ (Blockchain │
│ AA-consent│ │(normalize│ │ NLP,    │ │(fraud,   │ │ ledger,     │
│ mgmt)    │ │data across│ │ simul-  │ │ registry │ │ SCORES API) │
│          │ │asset cls) │ │ ation)  │ │ checks)  │ │             │
└──────┬───┘ └────┬─────┘ └───┬─────┘ └────┬─────┘ └──────┬──────┘
       │          │            │            │              │
┌──────▼──────────▼────────────▼────────────▼──────────────▼───────┐
│                    MESSAGE QUEUE (Redis + BullMQ / Kafka)          │
│         async jobs: AA data pull, nudge generation, audit hash     │
└──────┬─────────────────────────────────────────────────────────---┘
       │
┌──────▼─────────────────────────────────────────────────────────────┐
│                          DATA LAYER                                 │
│  PostgreSQL (core txn data) │ pgvector (embeddings for NLP/RAG)     │
│  Redis (cache, sessions)    │ S3/Blob (documents, screenshots)      │
│  Permissioned Ledger (Hyperledger Fabric — audit trail only)        │
└──────┬───────────────────────────────────────────────────────────--┘
       │
┌──────▼───────────────────────────────────────────────────────────--┐
│                  EXTERNAL INTEGRATIONS LAYER                        │
│  Account Aggregator (Finvu/OneMoney/CAMS-AA — via TSP or direct)    │
│  DigiLocker API │ CKYC Registry │ NSDL PAN API                      │
│  CDSL/NSDL (via AA, depository data) │ CAMS/KFintech (MF via AA)    │
│  PFRDA CRA (NPS via AA) │ SEBI Intermediary Registry (scraping/API) │
│  BSE StAR MF / MFU (order routing) │ Broker deep-link APIs          │
│  SCORES portal (grievance API/RPA bridge)                           │
└──────────────────────────────────────────────────────────────────--┘
```

**Key architectural decisions & why:**
- **Microservices, not monolith** — Trust & Safety and Compliance services have very different scaling/audit needs than Portfolio Aggregation; separating them lets each be audited independently (important since SEBI/RBI auditors will want to inspect specific data flows).
- **Async-first for AA/data-pull** — AA data pulls are NOT synchronous/instant in practice; the entire UX and backend must assume eventual consistency, not real-time. Building this as sync-blocking will make the app feel broken.
- **Permissioned blockchain used narrowly** — only for the audit-trail of AI-generated recommendations/nudges (immutability + tamper-evidence for SEBI investigation), NOT as a buzzword layer everywhere. Full Hyperledger Fabric network with 3+ organizational nodes (SahaVest, an independent auditor node, optionally a regulator-observer node).
- **No custody, no order book** — reinforced at the architecture level: there is no "Order Management System" holding client funds; execution always hands off to the linked broker/AMC's own systems.

---

## 8. Database Schema (Core Tables, Simplified)

```sql
users (id, mobile_hash, pan_hash, ckyc_id, risk_profile, created_at)
kyc_records (id, user_id, digilocker_ref, ckyc_status, video_kyc_status, verified_at)
aa_consents (id, user_id, aa_provider, consent_id, fip_list[], data_types[],
             purpose, valid_from, valid_till, status[active/revoked/expired])
linked_accounts (id, user_id, fip_type[bank/demat/mf/nps], provider_name,
                 masked_account_ref, last_synced_at)
holdings (id, linked_account_id, asset_class, isin/scheme_code, quantity,
          avg_cost, current_value, last_updated)
transactions (id, holding_id, txn_type, amount, txn_date, source[AA/CAS])
goals (id, user_id, goal_type, target_amount, target_date, linked_holdings[])
nudges (id, user_id, nudge_type, payload, generated_at, dismissed_at, hash_ref)
scam_checks (id, user_id, input_type[text/image], flags[], risk_score,
             registry_check_result, created_at)
audit_log (id, ref_type, ref_id, content_hash, blockchain_tx_id, created_at)
learning_progress (id, user_id, module_id, status, quiz_score, badge_earned)
grievances (id, user_id, scores_ref_id, category, status, filed_at)
```

---

## 9. Tech Stack (Final)

| Layer | Technology | Why |
|---|---|---|
| Mobile | React Native + TypeScript | Single codebase iOS/Android, large talent pool |
| Web | React + TypeScript, Next.js | SEO for marketing pages + dashboard SPA |
| Backend | Node.js (Fastify) microservices | Fast I/O for API-heavy, async-first workload |
| API Gateway | Kong / AWS API Gateway | Rate limiting, centralized auth |
| Database | PostgreSQL + pgvector | Relational integrity for financial data + embeddings for NLP in one engine |
| Cache/Queue | Redis + BullMQ | Async job processing for AA pulls, nudge generation |
| Search/Analytics | Elasticsearch (optional, for scam-pattern search) | Fast text pattern matching at scale |
| AI/ML | Python (FastAPI microservice) — scikit-learn/XGBoost for risk models, transformer-based NLP (fine-tuned multilingual model) for chatbot & scam detection | Python ecosystem is stronger for ML than Node |
| Blockchain | Hyperledger Fabric (permissioned) | Enterprise-grade, no public gas fees, permissioned nodes fit regulator-auditor model |
| Infra | AWS (Mumbai region — data residency), Kubernetes (EKS) | RBI/SEBI data localization requirements |
| Security | Vault (secrets), mTLS between services, field-level encryption for PII, SHA-256 audit hashing | Financial data = highest security bar |
| Monitoring | Grafana + Prometheus, Sentry | Observability for an async-heavy system |

---

## 10. Compliance Mapping (Judges/Regulator-Facing)

| Module | Regulator | Regulation Reference |
|---|---|---|
| KYC / Onboarding | RBI, SEBI | CKYC norms, DigiLocker guidelines |
| AA Consent Flow | RBI | Master Direction on NBFC-Account Aggregator |
| Portfolio Data (Equity/MF/REIT) | SEBI | Via CDSL/NSDL as FIP under AA |
| NPS Data | PFRDA | CRA-as-FIP circular (Sept 2022) |
| AI "Advisory" Wording | SEBI | Investment Adviser Regulations 2013 — must stay "educational/informational" to avoid IA registration trigger |
| Data Privacy | MeitY | Digital Personal Data Protection (DPDP) Act 2023 |
| Grievance Redressal | SEBI | SCORES platform integration |
| Advisory Audit Trail | SEBI (self-imposed best practice) | Not currently mandated, but positions product ahead of expected future RegTech norms |

---

## 11. Business Model (Final)

- **Freemium core:** Unified dashboard + awareness modules free forever (drives adoption, aligns with SEBI financial inclusion mandate)
- **Premium subscription:** Advanced AI Twin simulations, tax optimization insights, priority chatbot access
- **B2B2C RegTech licensing:** White-label the fraud-detection + intermediary-verification engine to brokers/AMCs/RIAs who need it for their own SEBI compliance
- **Referral/partner commissions:** Pass-through fee-sharing arrangements with linked brokers/AMCs for facilitated (not executed) order flow
- **No ads, no data-selling** — AA framework explicitly prohibits FIUs from onward-selling consented data; this is a hard legal boundary, not a marketing choice

---

## 12. Phased Rollout (Because Building All 54 Screens Simultaneously Is Not Realistic)

**Phase 1 (0-4 months):** Onboarding + KYC + AA linking (Equity + MF only) + Unified Dashboard + Scam Checker + basic Learning modules. This is the smallest slice that proves the "unified + protect" thesis end-to-end.

**Phase 2 (4-8 months):** NPS + Bonds/SGB (via CAS-parsing since not AA-native) + Investor Twin simulator + Goal planning + Audit trail (blockchain) + SCORES integration.

**Phase 3 (8-12 months):** B2B2C RegTech licensing product, community/leaderboard, referral program, multi-account family view, advanced tax module.

Each phase is a fully working, shippable product — not a broken partial build. This phasing is what makes the "full blueprint" actually buildable instead of a wishlist.

---

## 13. What Still Needs Real-World Validation (Honest Gaps)

- **SEBI intermediary registry** does not currently expose a clean public API — real-time cross-check will likely require a licensed data-partner or periodic scraped/cached dataset with a refresh SLA. Budget engineering time for this specifically.
- **TSP (Technology Service Provider) costs** for AA integration are commercially negotiated, not published — get quotes from at least 2 TSPs (e.g., Setu, Perfios, FinBit) before finalizing cost projections.
- **Bonds/SGB data** genuinely has no AA rail today — decide explicitly whether Phase 2 handles this via CAS-parsing, manual entry, or simply defers it further.
- **Video KYC infra** needs a licensed KYC-as-a-service vendor (e.g., HyperVerge, Signzy) — building this in-house is not worth it for a single feature.

---

*End of Blueprint.*
