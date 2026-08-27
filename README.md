# RevLoop AI: Autonomous Closed-Loop Revenue Recovery Engine
### Razorpay Buildathon 2026 — Track 03: AI Revenue Recovery
> **"Find revenue that’s slipping away and win it back."**  
> *Core Architectural Invariant: "The LLM Proposes, The Code Disposes."*  
> *Version:* `2.4.0-VERIFIED-BENCHMARK` (100% Open-Source & Free-Tier Stack)

---

## 📖 Master Documentation & Architecture Suite

This repository contains the complete, production-grade documentation, architectural specifications, AI strategies, governance guardrails, validation suites, interactive mockup, and demo pitch for **RevLoop AI**.

| Document | Core Focus & Master Contents | Direct Link |
| :--- | :--- | :--- |
| **1. PRD.md** | Complete Product Requirements Document, user personas, functional & non-functional requirements, formal diagnosis taxonomy (`DGN-01..12`), action catalog (`A1..A11`), and statutory compliance. | [`PRD.md`](./docs/PRD.md) |
| **2. Architecture.md** | End-to-end 10-layer micro-agent architecture, event streaming (BullMQ/Redis), event-sourced `case_events` with per-case hash chaining, sequence diagrams, and Passive Bank Health Sentinel. | [`Architecture.md`](./docs/Architecture.md) |
| **3. Rules.md** | Bounded governance, deterministic hard-stopping rules (<100ms on settlement), TRAI quiet-hours (21:00–09:00 IST), RBI notification RBI/2022-23/108, NPCI AutoPay circulars, and concession floor sandbox. | [`Rules.md`](./docs/Rules.md) |
| **4. Design.md** | PostgreSQL 16 schema DDL with paise `BIGINT`, per-case monotonic sequence numbers, Redis key patterns, RESTful API contracts, and Razorpay SDK mappings. | [`Design.md`](./docs/Design.md) |
| **5. Phases.md** | 5-Phase development roadmap, workstream execution matrix, prioritized fallback cut-line plan, and open-source LiveKit voice deliverables. | [`Phases.md`](./docs/Phases.md) |
| **6. Evaluation.md** | Quantitative batch benchmarking across 1,000 cases (**RevRecover-1000**), 10% randomized held-out control group, Net Recovery Rate (66.80% Treated), Incremental Recovery Yield (+49.30%), 1,542.2x ROI, and chaos results. | [`Evaluation.md`](./docs/Evaluation.md) |
| **7. AI_Strategy.md** | Hybrid 4-tier LLM routing (Gemini 2.5 Flash / Groq), structured diagnostic prompts, LiveKit WebRTC voice pipeline (<780ms latency), PTP temporal parsing, and rate-limit mitigation. | [`AI_Strategy.md`](./docs/AI_Strategy.md) |
| **8. code_quality.md** | Strict TypeScript/Fastify standards, testing pyramid (unit, integration, chaos), security (DPDP Act 2023, PCI-DSS Level 1 isolation), and `docker-compose.yml` for local zero-cost running. | [`code_quality.md`](./docs/code_quality.md) |
| **9. UI_UX_design.md** | Comprehensive Control Plane specification: Next.js 15 Merchant Radar, Live Action Stream (SSE), WhatsApp 1-click interactive templates, mobile dynamic checkout, and Human Console. | [`UI_UX_design.md`](./docs/UI_UX_design.md) |
| **10. Validation.md** | 150 chaos injection test cases, benchmark methodology (N=1,500 trials with `benchmark_runner.js`), prompt injection defense, race-condition mitigation (call dropped in 85ms on payment), and TRAI/RBI compliance tests. | [`Validation.md`](./docs/Validation.md) |
| **11. Demo.md** | 3-minute hackathon pitch script with timecodes, in-browser LiveKit live demo flows (Checkout, B2B Voice Chaser, Radar), batch recovery story, and technical judges Q&A defense. | [`Demo.md`](./docs/Demo.md) |
| **12. Dashboard Mockup** | Standalone, interactive HTML/CSS/JS prototype of the Merchant Revenue Radar with live event feed and clickable case drawer. | [`dashboard-mockup.html`](./dashboard-mockup.html) |

---

## 🎯 Track 03 Evaluation Alignment Matrix

```
┌────────────────────────────────────────────────────────────────────────┐
│                        EVALUATION CRITERIA MATRIX                      │
├────────────────────────────┬───────────────────────────────────────────┤
│ Hackathon Requirement      │ RevLoop AI Delivery & Evidence            │
├────────────────────────────┼───────────────────────────────────────────┤
│ 1. Revenue Risk Detection  │ Webhooks + Passive Bank Telemetry Sentinel│
│ 2. Right Intervention      │ Gemini 2.5 Flash Root-Cause (DGN-01..12)  │
│ 3. Bounded Workflow        │ Bounded Action Catalog (A1..A11) + LiveKit│
│ 4. Measured Batch Recovery │ ₹74.85L Recovered (+49.30% Incremental)   │
│ 5. Compliant Escalation    │ TRAI hours + RBI/2022-23/108 + NPCI Auto  │
│ 6. Stopping Rules          │ Immediate abort on settlement in 64–85ms  │
│ 7. Audit Trail             │ Cryptographically chained SHA-256 ledger  │
└────────────────────────────┴───────────────────────────────────────────┘
```
