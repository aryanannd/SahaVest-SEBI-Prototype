# SahaVest — FULLY DETAILED FINAL BLUEPRINT (v3)
### Unified DPI-Native Multi-Asset Investing & Investor Protection Platform
**Team:** Aether Lab | **Date:** July 2026 | **Status:** Complete — nothing deferred to "figure out later"

> Ye document v1 + v2 ka superset hai, plus har cheez jo ek real build ke liye chahiye: API contracts, full DB schema, vendor names + pricing tiers, sprint-wise timeline, cost estimate, risk register, QA plan, analytics taxonomy, DevOps pipeline. Agar kuch is doc mein nahi mila, wo Section 30 (Honest Open Questions) mein explicitly likha hai — "missing" aur "explicitly deferred with reason" alag cheezein hain.

---

## Table of Contents
0. Executive Summary
1. Market & Competitive Landscape
2. Product Vision, Scope & Non-Goals
3. Complete Feature Matrix
4. Screen-by-Screen Specification (all 58 screens, full detail)
5. Complete User Flows (with error/edge paths)
6. Design System (full)
7. Information Architecture & Navigation Map
8. System Architecture (detailed, sequence-level)
9. AI Multi-Agent Architecture (full)
10. Trust Score Engine (full, gaming-resistance)
11. API Contract Specifications
12. Database Schema (complete, every field)
13. Third-Party Vendor Matrix (real names, pricing tiers)
14. Tech Stack (final, every layer)
15. DevOps, Infra & Deployment Pipeline
16. Security Architecture & Threat Model
17. Regulatory & Compliance Mapping (deep)
18. QA & Testing Strategy
19. Analytics & Telemetry Taxonomy
20. Notification Strategy
21. Localization & Accessibility
22. Business Model & Unit Economics
23. Go-to-Market Strategy
24. Team Structure
25. Full Development Roadmap (sprint-by-sprint)
26. Cost Estimate
27. Risk Register
28. Success Metrics / KPI Dashboard Spec
29. Disaster Recovery & SLAs
30. Honest Open Questions (explicitly unresolved, with reason)

---

## 0. Executive Summary

SahaVest ek DPI-native (Account Aggregator + DigiLocker + CKYC + UPI) super-app hai jo retail investor ke saare investments (Equity, MF, Bonds, G-Sec, SGB, REIT/InvIT, NPS) ko ek jagah unify karta hai, AI multi-agent system se portfolio insights aur ek visible **Trust Score** deta hai (advisor/tip/recommendation verify karne ke liye), aur SEBI SCORES ke sath grievance filing integrate karta hai. Platform khud broker nahi banta, custody nahi leta — sirf orchestration + protection layer hai. Full build 3 phases mein hota hai (~12 months), estimated team 11-14 log, estimated first-year cost breakdown Section 26 mein hai.

---

## 1. Market & Competitive Landscape

| Player | Kya karte hain | Gap jo SahaVest fill karta hai |
|---|---|---|
| Zerodha Kite/Console | Equity/F&O broking + basic portfolio view | Single-asset-class, no MF/NPS/Bonds unification, no trust-score/fraud layer |
| Groww | MF + Equity, beginner-friendly UI | Broker-locked (apna hi account), no multi-broker aggregation, no fraud-detection layer |
| INDmoney | Multi-asset tracking (incl. US stocks) | Aggregation-focused but weak on investor-protection/fraud-detection/trust-scoring; monetization heavily nudges toward their own broking |
| NSE goBID / RBI Retail Direct | Bonds/G-Sec/SGB direct portals | Siloed, no unification with other asset classes, poor UX for retail |
| SEBI SCORES | Grievance redressal only | No pre-emptive protection, purely reactive/post-facto |
| Setu/Perfios (AA-TSPs) | Infra providers, not consumer apps | SahaVest ek consumer product hai jo inko backend mein use karta hai |

**Positioning:** SahaVest is not "another portfolio tracker" — differentiator hai Trust Score Engine + multi-agent fraud-protection + no-custody architecture (fast to build, low regulatory overhead vs becoming a broker).

**Competitive risk (honest):** INDmoney already multi-asset aggregation kar raha hai — SahaVest ka moat sirf **Trust Score + explainable AI + audit-trail** hona chahiye, sirf "aggregation" moat nahi hai (that part is replicable within 6-12 months by any funded competitor).

---

## 2. Product Vision, Scope & Non-Goals

**Vision:** (unchanged from v1/v2) — unify + protect + educate retail investors via DPI rails.

**Explicit Non-Goals (naya, is version mein clear kiya):**
- SahaVest **broker nahi banega** — no demat account opening, no order book, no custody of funds/securities.
- SahaVest **Registered Investment Adviser nahi banega** (at least not in Phase 1-2) — no personalized buy/sell recommendations, only educational simulations.
- SahaVest **lending/credit product nahi hai** — no loans against securities, no BNPL, scope creep avoid karna hai.
- SahaVest **crypto/international assets ko Phase 1-3 mein cover nahi karega** — Indian-regulated asset classes only, is scope ke bahar.

---

## 3. Complete Feature Matrix (Every Feature, Phase-Tagged)

| # | Feature | Phase | Priority | Depends On |
|---|---|---|---|---|
| 1 | Mobile OTP login | 1 | P0 | — |
| 2 | DigiLocker e-KYC | 1 | P0 | DigiLocker API |
| 3 | CKYC verification | 1 | P0 | CKYC Registry |
| 4 | PAN verification | 1 | P0 | NSDL PAN API |
| 5 | Video KYC fallback | 1 | P1 | HyperVerge/Signzy |
| 6 | Risk profiling questionnaire | 1 | P0 | — |
| 7 | Nominee addition | 1 | P1 | — |
| 8 | AA consent flow (Equity+MF) | 1 | P0 | Finvu/OneMoney/Setu |
| 9 | Unified dashboard (Equity+MF) | 1 | P0 | Feature 8 |
| 10 | Asset allocation view | 1 | P0 | Feature 9 |
| 11 | Scam Checker (text) | 1 | P0 | Scam Detection Agent |
| 12 | Registry Verification (SEBI) | 1 | P0 | SEBI data partner |
| 13 | Trust Score (basic) | 1 | P0 | Features 11+12 |
| 14 | Learning modules (basic, 3 languages) | 1 | P1 | — |
| 15 | Consent management dashboard | 1 | P0 | Feature 8 |
| 16 | CAS PDF upload/parser (full history) | 2 | P1 | — |
| 17 | NPS integration (via CRA-AA) | 2 | P0 | PFRDA CRA |
| 18 | Bonds/SGB (CAS-parsed) | 2 | P2 | Feature 16 |
| 19 | Investor Twin simulator | 2 | P0 | Deterministic calc engine |
| 20 | Goal planning | 2 | P1 | Feature 19 |
| 21 | Scam Checker (image/OCR) | 2 | P1 | OCR service |
| 22 | Suitability nudges pre-trade | 2 | P1 | Suitability Agent |
| 23 | Behavioral alert engine | 2 | P2 | Portfolio Analysis Agent |
| 24 | Blockchain audit trail | 2 | P0 | Hyperledger Fabric |
| 25 | SCORES grievance integration | 2 | P1 | SEBI SCORES |
| 26 | Vernacular expansion (12+ languages) | 2 | P1 | — |
| 27 | Full explainability panels | 2 | P0 | All AI agents |
| 28 | Multi-account/family view | 3 | P2 | — |
| 29 | B2B2C RegTech licensing API | 3 | P1 | Full Trust Score Engine |
| 30 | Referral program | 3 | P2 | — |
| 31 | Tax/capital-gains module | 3 | P1 | — |
| 32 | Leaderboard/community | 3 | P3 | — |
| 33 | Advanced confidence-threshold settings | 3 | P2 | Section 9/10 agents |

P0 = launch-blocking, P1 = important but not blocking, P2 = nice-to-have, P3 = growth/engagement only.

---

## 4. Screen-by-Screen Specification (Representative Full Detail — All 58 Screens)

> Har screen ke liye: Purpose | Key Components | States | Edge Cases | Analytics Events. Space ki wajah se sab 58 screens ko is depth mein pura likhna is document ko 3x lamba karega bina naya insight add kiye — isliye **flow-critical 15 screens** yahan full depth mein hain, baaki 43 ka structured summary table Section 4.2 mein hai (screen list already v1/v2 mein final hai, yahan detail-density add ki gayi hai).

### 4.1 Full-Depth Screens (Flow-Critical)

**Screen 1 — Splash Screen**
- Purpose: Brand load + session check (logged-in vs not)
- Components: Logo, loading indicator
- States: Normal load (<1.5s target), slow-network fallback (show after 3s: "Taking longer than usual...")
- Edge cases: No internet → immediate offline banner, don't hang indefinitely
- Analytics: `app_open`, `session_check_result`

**Screen 7 — DigiLocker KYC Consent Screen**
- Purpose: Explicit consent before redirecting to DigiLocker
- Components: Data-types requested list, purpose text, Approve/Deny buttons, link to privacy policy
- States: Default, Processing (post-approve, waiting for DigiLocker redirect-back), Timeout
- Edge cases: User denies → graceful fallback to Video KYC option, not a dead-end; DigiLocker service down → clear error + retry + alternate path (manual PAN+Aadhaar upload with Video KYC)
- Analytics: `kyc_consent_shown`, `kyc_consent_approved`, `kyc_consent_denied`, `kyc_fallback_triggered`

**Screen 9 — Risk Profiling Questionnaire**
- Purpose: SEBI-style risk categorization (mandatory before any suitability check can run)
- Components: 8-step multi-page form, progress indicator, back/next
- States: In-progress (saves partial answers), Complete
- Edge cases: User abandons mid-way → resumable on next login (not restart from scratch); answers must be re-confirmed if >12 months old (risk profile can change — force re-take annually, this is a compliance-driven edge case, not just UX)
- Analytics: `risk_quiz_started`, `risk_quiz_step_completed{step}`, `risk_quiz_abandoned{step}`, `risk_quiz_completed{profile_result}`

**Screen 13 — Consent Detail & Approval Screen** (AA)
- Purpose: RBI-mandated explicit consent artifact display
- Components: Data types, FIP list, duration, purpose, data-range, Approve/Deny
- States: Default, Redirecting-to-AA-app, Consent-returned-success, Consent-returned-failure
- Edge cases: User approves in AA app but network drops before callback → system must poll/reconcile via AA status API rather than assume failure (a very real failure mode — don't just show a generic error, actively re-check status before declaring failure)
- Analytics: `consent_screen_viewed`, `consent_approved`, `consent_denied`, `consent_callback_failed`, `consent_reconciled`

**Screen 15 — Linking-in-Progress Screen**
- Purpose: Show async data-pull progress (this is the single most important UX moment for trust — first impression of whether the app "works")
- Components: Per-FIP progress checklist (Bank ✓, Demat ✓, MF ⏳, NPS ⏳), estimated time, "notify me when done" option to leave screen
- States: In-progress (partial data arriving), Complete, Partial-failure (some FIPs succeeded, some didn't)
- Edge cases: One FIP fails (e.g., KFintech API timeout) — do NOT block the whole flow; show partial dashboard with a clear "MF data pending — retry" card, let user proceed to see what did come through
- Analytics: `linking_started`, `linking_fip_success{fip}`, `linking_fip_failed{fip, reason}`, `linking_completed_partial`, `linking_completed_full`

**Screen 17 — Home Dashboard** (full detail already in v1/v2 wireframe)
- Additional states not previously covered: **Empty state** (zero accounts linked yet — CTA-forward, not a blank dashboard), **Stale-data state** (last sync >48h ago — show a visible "last updated" timestamp + manual refresh, never silently show old data as if current)
- Analytics: `dashboard_viewed`, `nudge_card_shown{type}`, `nudge_card_dismissed{type}`, `quick_action_tapped{action}`, `manual_refresh_triggered`

**Screen 29 — Scam Checker Home**
- Purpose: Entry point for the demo-critical trust flow
- Components: Text-paste field, image-upload button, recent-checks history, example/sample tip for first-time users ("Try an example")
- States: Empty, Input-in-progress, Submitted-processing
- Edge cases: Very short/ambiguous input (e.g., just "buy TCS") → system must not force a verdict on insufficient data; should return low-confidence "insufficient context" rather than guessing
- Analytics: `scam_check_started{input_type}`, `scam_check_submitted`

**Screen 30 — Scam Check Result Screen**
- Full detail already in v1/v2; additional edge case: if Registry Verification Agent's external API times out, screen must show partial result ("Pattern analysis complete — registry check pending") rather than blocking entirely on the slowest dependency
- Analytics: `scam_result_shown{risk_level}`, `scam_result_report_tapped`, `scam_result_learn_more_tapped`

**Screen 55 — Trust Score Detail Screen**
- Full wireframe already in v2; additional edge case: score recalculation — if underlying data changes (e.g., registry status changes from Verified to Expired between checks), previous score entries in history must NOT be silently overwritten — versioned score history for audit integrity
- Analytics: `trust_score_viewed`, `trust_score_explain_tapped`, `trust_score_disputed`

**Screen 46/47/48 — Execution Bridge (Order Intent → Redirect → Sync)**
- Purpose: Hand-off to linked broker/AMC without custody
- Components: Pre-filled order context, "Continue on [Broker Name]" button, expected-sync-delay notice
- States: Pre-redirect, Redirected (app backgrounded), Returned-unconfirmed (user came back but we don't yet know if order was placed), Synced-confirmed
- Edge cases: **This is a genuinely hard problem** — SahaVest has no real-time visibility into whether the order actually executed on the broker's side until the next AA data refresh (which could be hours). UI must explicitly communicate this lag ("We'll update your portfolio within the next sync — usually within a few hours") rather than implying real-time confirmation it cannot provide.
- Analytics: `order_intent_created`, `redirect_to_broker`, `return_from_broker_unconfirmed`, `order_synced`

### 4.2 Remaining 43 Screens — Structured Summary

| Screen # | Name | Key State to Design For | Key Edge Case |
|---|---|---|---|
| 2 | Language Selector | Auto-detect + manual override | Device locale not in supported 12 → default to English/Hindi choice screen |
| 3-4 | Mobile+OTP | Resend timer, rate-limiting | OTP fraud/brute-force — rate-limit + captcha after 3 fails |
| 5 | Welcome carousel | Skip option | — |
| 6 | KYC Processing | Async polling | DigiLocker down → fallback path shown, not stuck spinner |
| 8 | Risk Result | Explain category plainly | Edge: borderline scores need clear tie-break rule, documented |
| 10-12 | AA linking setup | Multi-FIP checklist | Partial provider outage |
| 14 | Consent Mgmt Dashboard | Active/revoked/expired tabs | Revoke must sync AA-side immediately, not just locally |
| 18 | Asset Allocation Detail | Interactive drill | Empty asset class shouldn't show as "0% error", just omit |
| 19-20 | Drill-down/Holding Detail | Per-instrument view | ISIN not found in reference DB → graceful "details unavailable" |
| 21-22 | Performance/Net worth history | XIRR calc edge cases | Negative XIRR, very short history (<3mo) — disclaim insufficient data |
| 23-24 | Goals Hub/Detail | Multi-goal prioritization | Conflicting goals (2 goals same timeframe) — show both honestly |
| 25-26 | Simulator/Result | Slider bounds | Unrealistic inputs (50% return assumption) — cap sliders to sane historical ranges |
| 27 | Concentration Risk Alert | Threshold-based | False-positive from a single large recent lumpsum — contextualize, don't just flag raw % |
| 28 | Tax Summary | STCG/LTCG breakdown | Multi-year holding straddling tax-rule changes — flag "consult a CA," don't compute authoritative tax advice |
| 31 | Verify an Advisor | Manual lookup | Name-matching ambiguity (common names) — show multiple matches, don't auto-pick |
| 32 | Advisor Verification Result | — | Registry API stale cache — show "as of" timestamp |
| 33 | Pre-Trade Suitability Nudge | Modal, dismissible | Must never hard-block — always allow "Proceed anyway" |
| 34 | Behavioral Alert Center | History list | — |
| 35-38 | Learning Home/Module/Quiz/Badges | Progress persistence | Content localization gaps — fallback to English with a visible notice, not silently blank |
| 39 | Leaderboard | Opt-in only | Privacy — no real name shown by default, handle/initials |
| 40-41 | AI Chat/Doc Simplifier | Persistent FAB | Chat must refuse to give direct buy/sell advice — hard rule enforced by Compliance Agent |
| 42 | Data Privacy Center | Download/delete | Deletion request must cascade to AA-consent revocation too, not just app DB |
| 43 | Audit Trail Viewer | Timestamped log | Very high-volume users — pagination, not one giant list |
| 44-45 | SCORES filing/tracker | Pre-filled form | SCORES portal downtime — queue submission, retry |
| 49-54 | Profile/Settings/Security/Notifications/Help/Referral | Standard | Biometric unavailable devices → PIN fallback mandatory |
| 56-58 | Explainability Panel/Agent Log/Confidence Settings | Power-user views | Should be genuinely readable by non-technical users too — no raw JSON dumps |

---

## 5. Complete User Flows (With Error/Edge Paths)

All 5 flows from v1 remain valid. **New addition — Failure & Recovery Flow (previously missing):**

```
AA data-pull fails for one FIP (e.g., KFintech timeout)
   → System retries automatically (exponential backoff, max 3 attempts, background job)
   → If still failing after 3 attempts → Nudge Agent generates a user-facing card:
      "We couldn't fetch your MF data from KFintech — [Retry] [Contact Support]"
   → User's dashboard still shows all OTHER successfully-linked data (partial success ≠ total failure)
   → Support ticket auto-created if failure persists >24h (proactive, not user-initiated)
```

```
Trust Score Agent pipeline — Compliance Agent rejects a draft response
   → Flagged response does NOT reach the user
   → Automatically routed to a rewrite attempt (LLM rewrite pass)
   → If rewrite still fails compliance check (2nd rejection) → pipeline falls back to a
     pre-approved static template response + flags the case for human review queue
   → User NEVER sees a raw/unreviewed AI output — this is a hard architectural guarantee
```

```
User disputes a Trust Score ("Trust Score Disputed" tap on Screen 55)
   → Creates a review ticket with the full audit-hash reference attached
   → Routed to a human review queue (Compliance team)
   → If genuine error found → score corrected, correction ALSO logged to audit chain
     (never silently edited — corrections are themselves auditable events)
```

---

## 6. Design System (Full)

- **Typography scale:** Display 32/40, H1 24/32, H2 20/28, Body 16/24, Caption 12/16, Micro 10/14 (all in Noto Sans + Inter fallback)
- **Spacing scale:** 4/8/12/16/24/32/48/64 px (8pt grid system)
- **Color tokens (full):**
  - `--color-primary`: #0B6E4F
  - `--color-primary-light`: #DCEFE7
  - `--color-warning`: #F5A623
  - `--color-danger`: #D64545
  - `--color-success`: #2E8B57
  - `--color-bg`: #FAFAF7 (light) / #121417 (dark)
  - `--color-surface`: #FFFFFF (light) / #1C1F23 (dark)
  - `--color-text-primary`: #1A1A1A (light) / #F2F2F2 (dark)
  - `--color-text-secondary`: #6B6B6B
- **Elevation:** 3 levels (card, modal, floating-action) with consistent shadow tokens
- **Motion:** 150ms ease-out for micro-interactions, 300ms for screen transitions, no motion >400ms (accessibility — avoid disorientation)
- **Component library (final list):** Button (primary/secondary/text/danger), Card, Badge (trust-score color-coded), Modal/Bottom-sheet, Toast, Progress-checklist, Chart-wrapper (donut/line/bar), Form-input (text/OTP/slider), Empty-state, Skeleton-loader
- **Iconography:** Phosphor Icons or Lucide (rounded style), 24px default grid
- **Accessibility:** WCAG 2.1 AA minimum — color contrast ≥4.5:1 for body text, all interactive elements ≥44x44px tap target, screen-reader labels mandatory on every financial figure and chart (charts must have a text-table fallback, not just visual)

---

## 7. Information Architecture & Navigation Map

```
Bottom Nav (4 tabs + FAB):
├── Home (Dashboard, Nudges, Quick Actions)
├── Portfolio (Asset Allocation, Drill-downs, Performance, Goals)
├── [FAB: AI Chat Assistant] — persistent, accessible from any tab
├── Protect (Scam Checker, Verify Advisor, Trust Scores, Behavioral Alerts)
└── Learn (Modules, Badges, Leaderboard)

Profile icon (top-right, all screens) →
├── Settings (Security, Notifications, Language, Confidence Threshold)
├── Consent Management
├── Data Privacy Center
├── Audit Trail Viewer
├── Grievance/SCORES
├── Help & Support
└── Referral
```
Navigation principle: **Protect tab is co-equal with Portfolio**, not buried in settings — this is a deliberate IA decision reflecting that trust/safety is a core pillar, not an add-on feature.

---

## 8. System Architecture (Sequence-Level Detail)

### 8.1 Sequence: Dashboard Load (Cold Start)
```
Client → API Gateway: GET /v1/portfolio/summary (JWT)
API Gateway → Portfolio Aggregation Service: forward request
Portfolio Aggregation Service → Redis: check cache (TTL 15 min)
  cache HIT → return cached summary immediately
  cache MISS → query PostgreSQL for last-synced holdings
    → if last_synced_at > 6h ago → trigger async refresh job (BullMQ) in background
       (do NOT block the response waiting for a fresh AA pull — return best-available
        data immediately + a "last updated" timestamp + a background refresh indicator)
Portfolio Aggregation Service → Client: 200 OK { summary, last_synced_at, refresh_in_progress: bool }
```

### 8.2 Sequence: Scam Check Request
```
Client → API Gateway: POST /v1/trust/scam-check { text | image_ref }
API Gateway → Coordinator Agent Service
Coordinator → [parallel] Scam Detection Agent, Registry Verification Agent (if advisor ref found),
                          Suitability Agent (if trade-context present)
Coordinator → Trust Score Agent (once above complete or timeout at 8s)
Trust Score Agent → Compliance Agent (final wording gate)
Compliance Agent → Audit Agent (must succeed, else pipeline returns 503 + queued retry)
Audit Agent → Blockchain ledger write + Postgres audit_log insert
Coordinator → Client: 200 OK { trust_score, confidence, flags[], explainability }
```
**Timeout policy:** Each agent has a max 8-second SLA; if Registry Verification (external API) exceeds this, response proceeds with a partial result and a "registry check pending, will update" flag — never lets one slow dependency block the entire user-facing response indefinitely.

---

## 9. AI Multi-Agent Architecture (Full — carried forward from v2, unchanged, referenced here for completeness)

See detailed 10-agent spec, prompts, guardrails, and pipeline diagram as defined in v2 Section 6 — retained in full without modification; the architecture itself was already complete. Added in v3: the **sequence-level timeout/fallback behavior** (Section 8.2 above), which was the missing operational detail.

---

## 10. Trust Score Engine — Gaming-Resistance (New Detail, Previously Missing)

A visible, formulaic trust score creates an obvious adversarial incentive: bad actors will try to game it. This must be explicitly designed against:

- **Weight obfuscation for adversaries, not users:** the *categories* and *general logic* are public (transparency), but exact live weight values can be periodically re-tuned (versioned, logged) so a static gaming strategy decays over time.
- **Registry verification cannot be gamed** — it is a live external-authority lookup, not influenced by app-side signals at all.
- **Historical Fraud Indicators are community + SEBI-enforcement sourced**, not self-reported — a bad actor cannot simply claim good history.
- **Rate-limiting on repeated score-checks of the same entity from the same or clustered accounts** — prevents "trying different phrasings until a high score appears" pattern.
- **Score-dispute audit trail (Section 5)** ensures any manual correction is itself logged — prevents quiet manipulation of scores by insiders.

---

## 11. API Contract Specifications (Representative Endpoints)

### `POST /v1/auth/otp/request`
```json
Request:  { "mobile": "+91XXXXXXXXXX" }
Response: { "request_id": "otp_8f2...", "expires_in": 300 }
```

### `POST /v1/kyc/digilocker/initiate`
```json
Request:  { "user_id": "usr_123" }
Response: { "redirect_url": "https://digilocker.gov.in/...", "session_ref": "dlk_abc" }
```

### `POST /v1/aa/consent`
```json
Request: {
  "user_id": "usr_123",
  "fip_list": ["CDSL", "NSDL", "CAMS", "PFRDA-CRA"],
  "data_types": ["holdings", "transactions"],
  "purpose": "portfolio_consolidation",
  "duration_days": 365
}
Response: { "consent_id": "cst_789", "aa_redirect_url": "https://finvu.../consent/cst_789" }
```

### `GET /v1/portfolio/summary`
```json
Response: {
  "net_worth": 1245320.50,
  "as_of": "2026-07-23T18:30:00+05:30",
  "refresh_in_progress": false,
  "allocation": {
    "equity": 0.45, "mutual_funds": 0.30, "bonds": 0.10, "nps": 0.10, "sgb": 0.05
  }
}
```

### `POST /v1/trust/scam-check`
```json
Request: { "user_id": "usr_123", "input_type": "text", "content": "..." }
Response: {
  "trust_score": 18,
  "confidence": 0.91,
  "risk_category": "LOW_TRUST",
  "flags": [
    { "type": "guaranteed_return_language", "severity": "high", "excerpt_ref": "span_1" },
    { "type": "advisor_not_in_registry", "severity": "high" }
  ],
  "explainability": {
    "why": "Message contains guaranteed-return language and unverifiable advisor claim",
    "data_sources": ["SEBI intermediary registry (as of 2026-07-23T18:00)", "NLP scan"],
    "disclaimer": "This is informational only, not investment advice.",
    "audit_hash": "sha256:9f8a...",
    "blockchain_tx_id": "0xa1b2..."
  }
}
```

### `POST /v1/grievance/scores`
```json
Request: { "user_id": "usr_123", "category": "unregistered_advisor", "details": "...", "evidence_ref": "scan_456" }
Response: { "scores_ref_id": "SC2026070001", "status": "submitted" }
```

All endpoints: JWT bearer auth, rate-limited per user (e.g., 60 req/min general, 10 req/min for scam-check to prevent abuse), versioned via URL path (`/v1/`), errors follow RFC 7807 problem-details format.

---

## 12. Database Schema (Complete — Every Field)

```sql
-- USERS & IDENTITY
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mobile_number_encrypted BYTEA NOT NULL,
  mobile_hash VARCHAR(64) UNIQUE NOT NULL,   -- for lookup without decrypting
  pan_encrypted BYTEA,
  ckyc_id VARCHAR(50),
  preferred_language VARCHAR(10) DEFAULT 'en',
  risk_profile VARCHAR(20),                  -- Conservative/Moderate/Aggressive
  risk_profile_updated_at TIMESTAMPTZ,       -- force re-take after 12 months
  account_status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE kyc_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  digilocker_ref VARCHAR(100),
  ckyc_status VARCHAR(20),
  video_kyc_status VARCHAR(20),
  video_kyc_vendor VARCHAR(50),              -- e.g. 'hyperverge'
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- AA CONSENT & LINKING
CREATE TABLE aa_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  aa_provider VARCHAR(50) NOT NULL,          -- Finvu / OneMoney / Setu / CAMSFinserv
  consent_id VARCHAR(100) UNIQUE NOT NULL,
  fip_list TEXT[] NOT NULL,
  data_types TEXT[] NOT NULL,
  purpose VARCHAR(100),
  valid_from TIMESTAMPTZ,
  valid_till TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'active',       -- active/revoked/expired
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE linked_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  consent_id UUID REFERENCES aa_consents(id),
  fip_type VARCHAR(20) NOT NULL,             -- bank/demat/mf/nps
  provider_name VARCHAR(50),
  masked_account_ref VARCHAR(50),
  last_synced_at TIMESTAMPTZ,
  sync_status VARCHAR(20) DEFAULT 'pending', -- pending/success/failed
  sync_failure_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- PORTFOLIO DATA
CREATE TABLE holdings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  linked_account_id UUID REFERENCES linked_accounts(id),
  asset_class VARCHAR(30) NOT NULL,          -- equity/mf/bond/gsec/sgb/reit/invit/nps
  isin_or_scheme_code VARCHAR(30),
  instrument_name VARCHAR(200),
  quantity NUMERIC(20,6),
  avg_cost NUMERIC(20,4),
  current_value NUMERIC(20,4),
  currency VARCHAR(3) DEFAULT 'INR',
  data_source VARCHAR(20) DEFAULT 'AA',      -- AA/CAS_UPLOAD/MANUAL
  last_updated TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  holding_id UUID REFERENCES holdings(id),
  txn_type VARCHAR(20),                      -- buy/sell/dividend/sip
  amount NUMERIC(20,4),
  units NUMERIC(20,6),
  txn_date DATE,
  source VARCHAR(20)                          -- AA/CAS
);

-- GOALS
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  goal_type VARCHAR(30),
  target_amount NUMERIC(20,4),
  target_date DATE,
  linked_holding_ids UUID[],
  created_at TIMESTAMPTZ DEFAULT now()
);

-- AI / TRUST SCORE
CREATE TABLE trust_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  entity_type VARCHAR(20),                   -- advisor/tip/recommendation
  entity_ref TEXT,
  score INTEGER CHECK (score BETWEEN 0 AND 100),
  confidence NUMERIC(4,3),
  risk_category VARCHAR(20),
  score_breakdown JSONB,                      -- {registry: x, scam_pattern: y, ...}
  weights_version VARCHAR(10),                -- e.g. 'v1.2' — versioned formula weights
  audit_hash VARCHAR(64),
  blockchain_tx_id VARCHAR(100),
  is_disputed BOOLEAN DEFAULT false,
  superseded_by UUID REFERENCES trust_scores(id),  -- for corrections, never overwrite
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE agent_execution_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_run_id UUID NOT NULL,
  agent_name VARCHAR(50),
  input_ref JSONB,
  output_ref JSONB,
  confidence NUMERIC(4,3),
  latency_ms INTEGER,
  status VARCHAR(20),                         -- success/timeout/error
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE scam_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  input_type VARCHAR(10),                      -- text/image
  content_ref TEXT,                            -- pointer to S3, not raw content in DB
  flags JSONB,
  trust_score_id UUID REFERENCES trust_scores(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- AUDIT & COMPLIANCE
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ref_type VARCHAR(30),
  ref_id UUID,
  content_hash VARCHAR(64),
  blockchain_tx_id VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE grievances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  scores_ref_id VARCHAR(30),
  category VARCHAR(50),
  status VARCHAR(20) DEFAULT 'submitted',
  evidence_ref UUID REFERENCES scam_checks(id),
  filed_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

-- LEARNING
CREATE TABLE learning_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  module_id VARCHAR(50),
  status VARCHAR(20),
  quiz_score INTEGER,
  badge_earned VARCHAR(50),
  completed_at TIMESTAMPTZ
);

-- CONSENT/PRIVACY (DPDP compliance)
CREATE TABLE data_privacy_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  request_type VARCHAR(20),                    -- download/delete
  status VARCHAR(20) DEFAULT 'pending',
  requested_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);
```

**Indexing notes:** `mobile_hash`, `consent_id`, `linked_account_id` on holdings, `user_id` everywhere — all indexed. `trust_scores.entity_ref` needs a GIN/trigram index if fuzzy advisor-name search is required.

---

## 13. Third-Party Vendor Matrix (Real Names, Selection Guidance)

| Need | Options | Notes |
|---|---|---|
| AA-TSP (Account Aggregator connectivity) | Setu, Perfios, FinBit, CAMSFinserv | Get 2+ quotes; commercial terms not public, negotiate volume-based pricing |
| KYC/Video-KYC | HyperVerge, Signzy, IDfy | Needed for the mandatory non-digital KYC fallback path |
| DigiLocker Integration | Direct via DigiLocker Partner API (gov) | Free/gov-provided, but requires empanelment approval |
| SEBI Intermediary Registry Data | No official public API — options: manual scraped+cached dataset (own maintenance), or a licensed compliance-data vendor if one exists at build time | Budget for a dedicated small team/process to keep this current — this is a real operational cost, not a one-time integration |
| SMS/OTP | MSG91, Twilio Verify, AWS SNS | Volume-based pricing, choose based on DLT-registration ease in India |
| Push Notifications | Firebase Cloud Messaging | Free, standard |
| Blockchain/Ledger | Hyperledger Fabric (self-hosted) or a managed offering (e.g., via a cloud marketplace) | Self-hosted gives more control for the regulator-observer-node design |
| Cloud Infra | AWS (ap-south-1, Mumbai) | Chosen specifically for RBI/SEBI data-localization requirements |
| Error Monitoring | Sentry | Standard |
| Analytics | Mixpanel or Amplitude (self-hosted/EU-alternative if data-residency concerns arise) | Must NOT send PII to third-party analytics — event payloads scrubbed |
| NLP/LLM | Open-weight multilingual model fine-tuned in-house (for Scam Detection/Compliance agents, for data-residency + cost control) + a hosted API model for lower-stakes agents (Learning Agent content generation) | Mixing self-hosted (sensitive) + hosted-API (low-stakes) balances cost and compliance |

---

## 14. Tech Stack (Final — Unchanged from v1, Confirmed Correct, Repeated for Completeness)

Mobile: React Native + TypeScript · Web: Next.js + React + TypeScript · Backend: Node.js (Fastify) microservices · AI services: Python (FastAPI) · DB: PostgreSQL + pgvector · Cache/Queue: Redis + BullMQ · Orchestration: LangGraph (agent DAG) · Blockchain: Hyperledger Fabric · Infra: AWS ap-south-1, Kubernetes (EKS) · Secrets: HashiCorp Vault · Monitoring: Grafana + Prometheus + Sentry.

---

## 15. DevOps, Infrastructure & Deployment Pipeline (New — Previously Missing)

- **Environments:** dev → staging → pre-prod (with masked production-like data for AA-flow testing) → production
- **CI/CD:** GitHub Actions — lint → unit tests → build → container scan (Trivy) → deploy to staging (auto) → deploy to prod (manual approval gate, mandatory for a financial app)
- **Infra-as-code:** Terraform for all AWS resources, versioned in repo
- **Kubernetes:** Separate namespaces per microservice family (identity, portfolio, ai-agents, compliance) for blast-radius containment
- **Database migrations:** Versioned via a migration tool (e.g., Flyway/Prisma Migrate), never manual schema changes in production
- **Feature flags:** LaunchDarkly or self-hosted equivalent — critical for rolling out AI-agent changes gradually (e.g., new Trust Score weight version to 5% of users first)
- **Release cadence:** Bi-weekly for app updates, but AI-agent/prompt changes go through a **separate, faster-but-gated pipeline** (since prompt changes can be deployed without app-store review, but still need Compliance sign-off given regulatory sensitivity)

---

## 16. Security Architecture & Threat Model (Expanded)

**Threat model — key adversaries considered:**
1. **External attacker** trying to exfiltrate AA-linked financial data → mitigated by field-level encryption, Zero Trust, mTLS, Vault-managed secrets
2. **Malicious insider** trying to quietly alter a trust score or audit log → mitigated by append-only audit design (`superseded_by`, never `UPDATE`/`DELETE` on trust_scores or audit_log tables), blockchain-anchored hashes
3. **Bad actor gaming the Trust Score** → mitigated per Section 10
4. **Prompt-injection attack** against the AI Chat Assistant (e.g., a malicious document uploaded to the Document Simplifier trying to make the LLM ignore its system prompt) → mitigated by: strict input/output schema validation, the Compliance Agent as a hard gate that doesn't trust any upstream agent's framing, and sandboxing (agents have no tool-access to execute anything beyond their declared scope)
5. **Account takeover** (SIM-swap, OTP interception) → mitigated by device-binding + biometric re-auth for sensitive actions (consent approval, data deletion requests)

**Penetration testing plan:** Mandatory third-party pen-test before each major production release (at minimum before Phase 1 launch and before Phase 2 launch), plus an ongoing bug-bounty program once past MVP.

---

## 17. Regulatory & Compliance Mapping (Deep — Expanded from v1's table)

| Area | Regulator | Specific Obligation | How SahaVest Meets It |
|---|---|---|---|
| KYC | SEBI/RBI | CKYC record reuse, video-KYC option mandatory | Screens 6-7, video-KYC vendor integration |
| AA Consent | RBI (NBFC-AA Master Direction) | Explicit purpose/duration/data-type disclosure, revocability | Screen 13, `aa_consents` table with revocation timestamp |
| Data Localization | RBI/MeitY | Sensitive personal data processing within India | AWS ap-south-1 exclusively |
| Investment Advice Boundary | SEBI (IA Regulations 2013) | Personalized buy/sell recommendations require RIA registration | Compliance Agent hard-gate, "educational only" framing enforced everywhere |
| Data Privacy | DPDP Act 2023 | Consent, purpose limitation, right to erasure, breach notification | `data_privacy_requests` table, cascading deletion including AA-consent revocation |
| Grievance Redressal | SEBI (SCORES) | Investor complaint channel | Screens 44-45, API integration |
| Audit/Recordkeeping | Best-practice (self-imposed, positions ahead of expected future RegTech norms) | Immutable, inspectable AI-decision trail | Hyperledger Fabric + `audit_log` + `agent_execution_logs` |
| Advertising/Marketing Claims | SEBI (general false-advertising provisions) | No guaranteed-return claims in any marketing | Marketing copy review process, same banned-phrase list as Compliance Agent applied to external comms too |

---

## 18. QA & Testing Strategy (New — Previously Missing)

- **Unit testing:** every deterministic service (Portfolio Analysis rules, Trust Score formula, Suitability logic) — target 85%+ coverage on these specifically, since they're the audit-defensible core
- **Integration testing:** AA sandbox environments (Finvu/Setu provide sandbox/UAT environments) — test consent flow, FIP linking, and failure scenarios (timeout, partial data, malformed responses) before touching real user data
- **AI/Agent testing (specialized, not standard QA):**
  - **Golden-set regression testing** — a curated set of ~200+ known scam-message examples and ~200+ known legitimate-advisor examples, re-run against Scam Detection + Trust Score Agent on every model/prompt change to catch regressions
  - **Adversarial testing** — red-team attempts at prompt injection, trust-score gaming, edge-case phrasing (Section 10, 16 threat #3/#4)
  - **Confidence-calibration testing** — verify that when the system says "91% confidence," it's actually right ~91% of the time on held-out data (calibration curve, not just accuracy)
- **Load/performance testing:** Simulate Phase-1 target concurrent users (define target explicitly — e.g., 50,000 DAU as an initial planning number) against the async AA-pull architecture — specifically test what happens when many users trigger simultaneous refreshes (queue backpressure behavior)
- **Accessibility testing:** Screen-reader pass (VoiceOver/TalkBack) on all core flows, not just automated contrast-checking
- **UAT (User Acceptance Testing):** A closed beta cohort (recommend: 200-500 real users across at least 3 languages) before Phase 1 public launch, specifically testing the KYC/AA-linking flow since that's the highest-drop-off risk area

---

## 19. Analytics & Telemetry Taxonomy (New — Previously Missing)

**Event naming convention:** `{domain}_{object}_{action}` — e.g., `onboarding_kyc_completed`, `trust_score_result_viewed`.

**Core funnels to instrument end-to-end:**
1. Onboarding funnel: `app_open → mobile_entered → otp_verified → kyc_consent_shown → kyc_completed → risk_quiz_completed → aa_consent_shown → aa_linking_completed → dashboard_first_view`
2. Scam-check funnel: `scam_check_started → scam_check_submitted → scam_result_shown → (report_tapped | dismissed)`
3. Learning funnel: `module_started → quiz_attempted → quiz_passed/failed → badge_earned`

**PII handling in analytics:** event payloads must NEVER include raw mobile numbers, PAN, account numbers, or holdings values — only hashed user IDs and categorical/bucketed data (e.g., net-worth bucketed into ranges, not exact figures) sent to third-party analytics tools.

---

## 20. Notification Strategy (New — Previously Missing)

| Type | Channel | Trigger | Frequency Cap |
|---|---|---|---|
| Nudge (concentration risk, etc.) | Push + in-app card | Portfolio analysis detects new flag | Max 1/day per nudge-type to avoid alert fatigue |
| Scam-alert follow-up | Push | User's previously-checked entity gets newly flagged in registry | Immediate (time-sensitive, safety-critical) |
| Learning reminder | Push | User inactive on a started-but-incomplete module for 3 days | Max 2/week |
| Consent expiry warning | Push + Email | 7 days before AA consent expiry | Once, then reminder at 1 day |
| Grievance status update | Push + Email | SCORES status change | Immediate |
| Marketing/engagement | Push | Feature announcements, referral prompts | Opt-in only, max 1/week |

**Do-not-disturb respect:** notification scheduling should honor device-level DND and a user-configurable quiet-hours setting — this matters more for a finance app than a typical consumer app, since anxiety-inducing "portfolio alert" pushes at odd hours actively harm user trust.

---

## 21. Localization & Accessibility (Expanded)

- 12+ languages: Hindi, English, Gujarati, Marathi, Tamil, Telugu, Kannada, Malayalam, Bengali, Punjabi, Odia, Assamese (prioritize based on actual user-base geography once known — this priority order is a placeholder, not fixed)
- All financial/regulatory disclaimer text must go through **certified translation review**, not just machine translation — mistranslated disclaimers are a compliance risk, not just a UX quality issue
- String externalization from day 1 (i18n framework: `react-i18next` or equivalent) — retrofitting localization later is significantly more expensive
- Font rendering tested per script (Noto Sans family covers all target scripts, but must be explicitly bundled per-language to avoid tofu/box characters)
- Accessibility: full screen-reader pass, dynamic text-sizing support, one-handed-reachable bottom nav, color is never the only signal (Trust Score badges use color + explicit text label "HIGH TRUST" not just green)

---

## 22. Business Model & Unit Economics (Expanded With Illustrative Numbers)

> Numbers below are **illustrative planning assumptions**, not verified market data — flagged explicitly so the team doesn't mistake them for research findings.

| Metric | Illustrative Assumption |
|---|---|
| Target Phase-1 DAU (6mo post-launch) | 50,000 |
| Freemium → Premium conversion | 3-5% (typical fintech benchmark range) |
| Premium ARPU/month | ₹99-₹199 |
| B2B2C RegTech licensing (Phase 3) | Per-seat or per-API-call pricing to brokers/RIAs, needs direct sales motion, not self-serve |
| CAC | Should be low relative to typical broker CAC since no new account-opening friction — but this is a hypothesis to validate, not assumed |

**Revenue streams (unchanged from v1, retained):** Freemium subscription, B2B2C RegTech licensing, pass-through fee-sharing with linked brokers/AMCs. **No ads, no data-selling** — hard legal + ethical boundary (AA framework explicitly prohibits onward data-sale).

---

## 23. Go-to-Market Strategy (New — Previously Missing)

- **Phase 1 launch:** Closed beta via financial-literacy communities, personal-finance content creators (vernacular-language creators specifically, given the accessibility positioning), and direct outreach to co-operative/regional bank customer bases
- **Positioning line:** "Ek jagah dekho, safe rehke badho" (one place to see everything, grow safely) — leads with protection, not just convenience, since that's the actual differentiator
- **Regulatory relationship-building:** proactive engagement with SEBI's Investor Education and Protection Fund initiatives — positions SahaVest as a partner to the mandate, not just a commercial app riding on it
- **Partnership motion:** approach 2-3 mid-size brokers/AMCs early for the linked-account/fee-share arrangement — this needs lead time (legal/commercial negotiation), start in Phase 1 even though revenue only materializes later

---

## 24. Team Structure (New — Previously Missing)

| Role | Count | Phase |
|---|---|---|
| Product Manager | 1 | 1 |
| Backend Engineers (Node.js) | 3 | 1 |
| ML/AI Engineer (Python, agents) | 2 | 1 |
| Mobile Engineers (React Native) | 2 | 1 |
| Frontend Engineer (Web) | 1 | 2 |
| DevOps/Infra Engineer | 1 | 1 |
| UI/UX Designer | 1 | 1 |
| QA Engineer | 1 | 1 |
| Compliance/Legal Advisor (part-time/consultant) | 1 | 1 |
| Data/Content person (vernacular content, registry data upkeep) | 1 | 2 |
| **Total core team** | **~11-14** | across Phase 1-2 |

---

## 25. Full Development Roadmap (Sprint-by-Sprint, 2-Week Sprints)

**Phase 1 (Sprints 1-8, ~4 months):**
- Sprint 1-2: Architecture setup, CI/CD, base infra, design system foundation
- Sprint 3-4: Onboarding + KYC (DigiLocker, CKYC, PAN, video-KYC fallback)
- Sprint 5-6: AA consent + linking (Equity+MF only), unified dashboard v1
- Sprint 7: Scam Checker (text) + Registry Verification + basic Trust Score
- Sprint 8: Closed-beta hardening, UAT, pen-test #1, launch

**Phase 2 (Sprints 9-16, ~4 months):**
- Sprint 9-10: NPS integration, CAS-parser for full history + bonds/SGB
- Sprint 11-12: Investor Twin simulator, Goal planning
- Sprint 13-14: Full agent pipeline (all 10 agents), explainability panels, blockchain audit trail
- Sprint 15: SCORES integration, vernacular expansion to 12 languages
- Sprint 16: Pen-test #2, public launch hardening

**Phase 3 (Sprints 17-24, ~4 months):**
- Sprint 17-18: Family/multi-account view, tax module
- Sprint 19-20: B2B2C RegTech API productization
- Sprint 21-22: Referral, leaderboard, community features
- Sprint 23-24: Confidence-threshold advanced settings, performance optimization, scale-hardening

---

## 26. Cost Estimate (Illustrative, India-Based Team)

| Category | Phase 1 (4mo) | Phase 2 (4mo) | Phase 3 (4mo) |
|---|---|---|---|
| Team salaries (11-14 people, India market rates) | ~₹80-100L | ~₹90-110L | ~₹90-110L |
| Cloud infra (AWS) | ~₹4-8L | ~₹10-15L | ~₹15-25L |
| Third-party vendors (AA-TSP, KYC, SMS) | ~₹5-10L | ~₹10-15L | ~₹15-20L |
| Compliance/legal consulting | ~₹5-8L | ~₹8-10L | ~₹8-10L |
| Pen-testing/security audit | ~₹3-5L | ~₹3-5L | ~₹3-5L |
| **Total (illustrative)** | **~₹97L-131L** | **~₹121L-155L** | **~₹131L-170L** |

Flagged explicitly: these are **rough planning ranges**, not vendor-quoted figures — actual TSP/AA commercial terms and India-market salary bands must be confirmed directly before using these in an investor-facing document.

---

## 27. Risk Register

| Risk | Category | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| SEBI reclassifies the product as requiring IA registration | Regulatory | Medium | High | Compliance Agent hard-gate, legal counsel review before every major feature launch, "educational only" framing baked into architecture not just copy |
| AA-TSP integration takes longer/costs more than budgeted | Technical/Commercial | Medium | Medium | Get quotes from 2+ vendors early, build sandbox integration in Sprint 1-2 not later |
| SEBI registry has no clean API, manual dataset goes stale | Operational | High | High | Dedicated ongoing process/small team to refresh registry cache, clear "as of" timestamps everywhere so staleness is visible not hidden |
| Competitor (INDmoney etc.) replicates aggregation before Trust Score differentiation lands | Business | Medium | Medium | Prioritize Trust Score + explainability (the actual moat) earlier in roadmap, don't over-invest in aggregation polish first |
| AI agent hallucination/bad output reaches a user | Product/Reputational | Low (with guardrails) | Very High | Compliance Agent hard-gate, golden-set regression testing, human-review fallback (Section 5 failure flow) |
| Low onboarding completion due to KYC/AA friction | Product | Medium | High | Progressive-loading UX (Section 4.1 Screen 15), partial-success handling, closed-beta UAT specifically targeting this funnel |
| Data breach of financial PII | Security | Low (with controls) | Very High | Zero Trust, field-level encryption, regular pen-testing, Vault-managed secrets |
| Trust Score gaming by bad actors | Security/Product | Medium | Medium | Section 10 gaming-resistance design |

---

## 28. Success Metrics / KPI Dashboard Spec

(Full metrics table already defined in v2 Section 8 — retained. New addition: **dashboard spec** — these metrics should be visualized on an internal Grafana/Metabase dashboard with the following minimum views: Funnel view (onboarding drop-off by step), Trust & Safety view (precision/false-positive rate trend over time, score-dispute rate), Engagement view (retention cohorts, learning completion), Compliance view (audit-log completeness %, agent-timeout rate) — reviewed weekly by Product + Compliance jointly, not just Product alone.)

---

## 29. Disaster Recovery & SLAs (New — Previously Missing)

- **RTO (Recovery Time Objective):** 4 hours for core services (auth, portfolio-read)
- **RPO (Recovery Point Objective):** 15 minutes for transactional data (Postgres continuous WAL archiving + point-in-time recovery)
- **Backup strategy:** Automated daily full backups + continuous incremental, cross-region replication (Mumbai primary, Hyderabad/secondary AWS region for DR)
- **Blockchain ledger:** Multi-node replication inherent to Hyperledger Fabric design — no single point of failure for audit data specifically
- **Incident response:** On-call rotation from Sprint 1 onward (even in beta) given financial-data sensitivity, documented runbooks for top failure scenarios (AA-provider outage, registry-data staleness, agent-pipeline failure)
- **External-dependency SLA tracking:** explicit uptime tracking for AA-TSP, DigiLocker, SEBI-registry-data-source — since SahaVest's own SLA is only as good as its weakest external dependency, this must be monitored and communicated transparently to users during outages (status page)

---

## 30. Honest Open Questions (Explicitly Unresolved — Not Missing, Deferred With Reason)

1. **Exact SEBI registry data-access mechanism** — no confirmed public API exists as of this writing; final approach (licensed vendor vs. self-maintained scraped cache) needs a direct conversation with SEBI/a compliance-data vendor before Sprint 1, since it affects both architecture and Section 26 cost estimates materially.
2. **Exact AA-TSP commercial pricing** — genuinely not public; needs 2+ vendor quotes before Section 26 numbers can be finalized.
3. **Whether Bonds/SGB should be CAS-parsed in Phase 2 or deferred further** — depends on actual user demand signal from Phase-1 beta, not decidable in advance; recommend making this decision based on Phase-1 usage data, not upfront.
4. **Final target-market language priority order (Section 21)** — should be set based on actual early user-base geography, not guessed pre-launch.
5. **Actual DAU/conversion assumptions (Section 22)** — explicitly illustrative; needs real beta-cohort data to replace before being used in any investor-facing materials.

These five are the genuine "we don't know yet and shouldn't pretend to" items — everything else in this document is a firm design/architecture decision, not a placeholder.

---

*End of Blueprint v3 — Fully Detailed.*
