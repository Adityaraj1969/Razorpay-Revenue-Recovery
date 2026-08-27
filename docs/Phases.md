# Implementation Phases & Development Roadmap (`Phases.md`)
## RevLoop AI: Autonomous Closed-Loop Revenue Recovery Engine
**Hackathon Track:** Razorpay Buildathon — Track 03: AI Revenue Recovery  
**Target Platform:** Razorpay Ecosystem (100% Open-Source & Free-Tier Toolchain)  
**Document Version:** 2.4.0-VERIFIED-BENCHMARK  
**Status:** Approved Master Roadmap  

---

## 1. Development Strategy: Shared Spine First, Deep Vertical Slices

The Razorpay Buildathon rewards deep, verified systems with measured recovery over broad, shallow prototypes. RevLoop AI's build strategy is organized around a **Shared Spine** (Ingestion $\rightarrow$ Diagnosis $\rightarrow$ Policy $\rightarrow$ Audit $\rightarrow$ Verification) supporting three deep vertical slices:
1. **D2C E-Commerce Checkout Recovery** (Passive Bank Telemetry + WhatsApp 1-Click UPI Intent).
2. **Involuntary Subscription & Mandate Churn** (Smart Retrier + UPI AutoPay Non-Peak Sequencer).
3. **B2B Receivables & Invoicing** (In-Browser LiveKit Voice Agent + Promise-to-Pay Tracker + Smart Collect).

```
       ┌─────────────────────────────────────────────────────────────┐
       │             5-PHASE SPRINT ROADMAP TOPOLOGY                 │
       └──────────────────────────────┬──────────────────────────────┘
                                      │
     ┌──────────────────┬─────────────┴──────┬──────────────────┐
     ▼                  ▼                    ▼                  ▼
[Phase 1: Ingestion] [Phase 2: Diagnosis] [Phase 3: Intervene] [Phase 4: Guard]
     │                  │                    │                  │
     └──────────────────┴─────────────┬──────┴──────────────────┘
                                      │
                                      ▼
                         [Phase 5: Evaluate & Demo]
```

---

## 2. Phase Breakdown & Deliverables

### Phase 1: Ingestion, Telemetry & Event-Sourced Spine
- **Objective:** Establish the real-time event pipeline, Razorpay webhook ingestors, passive bank telemetry feeds, and PostgreSQL/Redis state management.
- **Key Deliverables:**
  - `POST /api/v1/webhooks/razorpay` with sub-100ms HMAC-SHA256 verification.
  - Redis BullMQ event broker with token-bucket rate limiting (14 RPM) and deduplication (`idemp:webhook:*`).
  - PostgreSQL schema migration (`cases`, `case_events` with per-case monotonic sequence numbers).
  - Passive Bank Health Sentinel aggregating sliding 50-event failure rate ($\ge 30.0\%$ hold, $\ge 90.0\%$ resume) without external polling.
  - Abandonment Watcher detecting uncompleted checkouts after 15 minutes.
- **Exit Gate:** 1,000 synthetic failure webhooks ingested with 0 dropped events and 100% deduplication.

---

### Phase 2: Diagnostic Reasoning & Pure Policy Engine
- **Objective:** Implement root-cause classification (`DGN-01`..`DGN-12`), rule-first bypass, micro-batching, and the deterministic policy engine.
- **Key Deliverables:**
  - Two-stage diagnostic classifier (Rule-based mapping for 78% of cases in $<5\text{ms}$, Gemini 2.5 Flash / Groq fallback for ambiguous cases).
  - Structured Pydantic/Zod JSON schema validation with confidence scoring.
  - Pure deterministic Policy Engine: $(Case, Diagnosis, Config) \rightarrow Action$.
  - Low-confidence ($< 0.70$) and dispute routing to Human Console queue.
- **Exit Gate:** 98%+ classification accuracy across test dataset of 250 edge-case error logs.

---

### Phase 3: Bounded Multi-Channel Execution Mesh
- **Objective:** Build and connect the bounded execution channels directly with Razorpay APIs and open-source voice bridge.
- **Key Deliverables:**
  - **Smart Mandate Retrier:** Subscriptions API integration with NPCI non-peak clearing window optimizer.
  - **WhatsApp 1-Click Agent:** Interactive WhatsApp templates with dynamic Razorpay UPI Intent payment links (Meta Sandbox + Mock Adapter).
  - **In-Browser Hinglish AI Voice Agent:** Full-duplex voice agent using **LiveKit Open-Source WebRTC Server + Gemini Live Audio / Kokoro-82M**.
  - **Promise-to-Pay (PTP) Tracker:** Automated temporal entity parsing and hold-state scheduler.
- **Exit Gate:** End-to-end interactive voice call and WhatsApp recovery flows executing in live sandbox.

---

### Phase 4: Governance, Stopping Rules & Reconciliation
- **Objective:** Implement hard-coded regulatory guardrails, stopping rules, and closed-loop reconciliation.
- **Key Deliverables:**
  - **Governance Interceptor:** Hard-stop on `payment.authorized` in $<100\text{ ms}$ (64ms in-flight cancellation, 85ms WebRTC drop).
  - **Regulatory Enforcer:** TRAI quiet hours (21:00–09:00 IST), frequency rate-limits (max 2 calls, max 3 WhatsApp messages), and 24h cooldowns.
  - **Smart Collect Virtual Account Reconciler:** Instant credit matching for B2B bank transfers.
  - **Cryptographic Audit Logger:** Per-case SHA-256 chained transaction logs for tamper-proof verification.
- **Exit Gate:** 100% compliance score: 0 out-of-hours messages, 0 double-charges, 100% verified audit log chain.

---

### Phase 5: Batch Benchmarking, Cockpit UI & Demo
- **Objective:** Build the merchant radar UI, run full batch recovery simulations, and record demo pitch.
- **Key Deliverables:**
  - **Merchant Recovery Radar (Next.js 15):** Real-time dashboard with Server-Sent Events showing live recovered GMV, active voice calls, and PTP timeline.
  - **Batch Evaluation Engine:** Process the **RevRecover-1000** benchmark batch, isolating Incremental Recovery Yield (+49.30% IRY) against a 10% held-out control group.
  - **Demo Walkthrough Video & Pitch Deck:** 3-minute hackathon pitch with live interactive Hinglish voice recovery demo.
  - **Exit Gate:** Working, production-grade repository with comprehensive test suite, interactive UI, and live demonstration.

---

## 3. Workstream Execution Matrix

| Workstream | Lead | Phase 1 | Phase 2 | Phase 3 | Phase 4 | Phase 5 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Spine & Backend** | Lead Architect | Webhooks, Redis, DB | Event Routing, Queue | Razorpay APIs Sync | Stopping Interceptor | Load & Stress Testing |
| **AI & Voice Agent** | AI / Voice Eng | Audio bridge setup | Diagnostic prompts | LiveKit + Gemini Live | PTP temporal parser | Voice latency optimization |
| **Frontend & UI** | Full-Stack Eng | Wireframes, Next.js | API hooks, State | Radar Dashboard UI | Human Cockpit / Logs | Polish, Charts & SSE |
| **QA & Compliance** | Security / QA | Test harnesses | Mock failure data | Channel mock testing | Regulatory audit tests | Batch simulation run |

---

## 4. Prioritized Fallback & Cut-Line Execution Plan

```
┌────────────────────────────────────────────────────────────────────────┐
│                   PRIORITIZED FEATURE CUT-LINE MATRIX                  │
├─────────────────┬──────────────────────────────────────────────────────┤
│ MUST HAVE (P0)  │ • Razorpay Webhook Ingestion + Deduplication         │
│ Core Foundation │ • Rule-based Diagnosis + Deterministic Policy        │
│                 │ • WhatsApp 1-Click UPI Payment Link Dispatch         │
│                 │ • Sub-100ms Stopping Rule on Settlement              │
│                 │ • Batch Evaluation (500 cases) + Audit Log           │
├─────────────────┼──────────────────────────────────────────────────────┤
│ SHOULD HAVE (P1)│ • Passive Bank Health Sentinel                       │
│ High-Impact     │ • LiveKit WebRTC Voice Agent (In-Browser)            │
│ Interventions   │ • Promise-to-Pay (PTP) State Tracker                 │
│                 │ • Next.js 15 Recovery Radar Dashboard                │
├─────────────────┼──────────────────────────────────────────────────────┤
│ COULD HAVE (P2) │ • Multi-stage B2B Dunning Ladder                     │
│ Extended Polish │ • Cryptographic Per-Case Hash Chain Explorer         │
└─────────────────┴──────────────────────────────────────────────────────┘
```
