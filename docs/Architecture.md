# System Architecture & Technical Design
## RevLoop AI: Autonomous Closed-Loop Revenue Recovery Engine
**Hackathon Track:** Razorpay Buildathon — Track 03: AI Revenue Recovery  
**Target Platform:** Razorpay Ecosystem (100% Open-Source & Free-Tier Toolchain)  
**Document Version:** 2.4.0-VERIFIED-BENCHMARK  
**Status:** Approved Master Architecture  

---

## 1. Architectural Design Invariants

RevLoop AI is built around four non-negotiable architectural invariants:

1. **"The LLM Proposes, The Code Disposes"**: Language models (Gemini 2.5 Flash / Groq Llama 3.3) read telemetry, classify unstructured text, and draft conversational messages. They are *never* the component that authorizes an action. Every action must pass through a pure, deterministic, unit-tested policy engine that never invokes an LLM.
2. **Event-Sourced Case Projections with Per-Case Hash Chaining**: Case state is not a mutable column in a database. Case state is a read-only projection computed over an append-only, immutable, per-case SHA-256 hash-chained log (`case_events`).
3. **Closed-Loop Razorpay Verification**: A case is marked `RECOVERED` only when verified against authoritative Razorpay payment and settlement webhooks — never on the basis of a sent message or a verbal promise.
4. **Counterfactual Batch Measurement**: The architecture includes a native **Randomized Holdout Controller (10%)** that isolates the agent's incremental recovery yield from natural self-curing transactions.

---

## 2. End-to-End System Architecture Diagram

```mermaid
graph TD
    A["Razorpay Webhooks and Events"] --> B["HMAC-SHA256 Auth and Idempotency"]
    B --> C["Passive Bank Health Sentinel"]
    
    C --> D["Tier-0: Fast Rule Classifier (Sub-5ms)"]
    D -->|Ambiguous Cases| E["Tier-1: Gemini 2.5 Flash and Groq LLM"]
    D -->|Deterministic| F["DGN-01 to DGN-12 Root Cause Diagnosis"]
    E --> F
    
    F --> G["Policy Gatekeeper (Deterministic Code)"]
    G --> H{"Stopping Rules and Safety Gates"}
    H -->|Holdout Control| I["A11: Suppress and Measure"]
    H -->|Disputed or High Value| J["A10: Escalate to Human Console"]
    H -->|Approved Policy| K["A1 to A9: Recovery Action Catalog"]
    
    K --> L["WhatsApp 1-Click Payment Links"]
    K --> M["B2B Staged Dunning Email"]
    K --> N["LiveKit WebRTC Voice Agent"]
    K --> O["Mandate Auto-Retry Scheduler"]
    
    L --> P["Authoritative Settlement Webhook"]
    M --> P
    N --> P
    O --> P
    
    P --> Q["Sub-100ms Settlement Abort"]
    Q --> R["Immutable SHA-256 Hash Chain Ledger"]
    R --> S["Next.js 15 Operator Revenue Radar"]
```

---

## 3. Ten-Layer System Component Breakdown

| # | System Layer | Primary Responsibility | Zero-Cost / Open-Source Tool |
| :--- | :--- | :--- | :--- |
| **1** | **Ingestion Gateway** | Ingests authentic webhooks (`payment.failed`, `order.paid`, `invoice.expired`). | Fastify / Node.js 22 (Open Source) |
| **2** | **Passive Bank Health Sentinel** | Computes sliding 50-event failure rate over incoming `payment.failed` webhooks. | In-Memory Redis 7.4 Ring Buffer (Zero Polling) |
| **3** | **Event Deduplicator** | Redis Bloom filter + atomic `SETNX` mutex. | Redis 7.4 / BullMQ |
| **4** | **Diagnostic Core** | Classifies failure root cause (`DGN-01` to `DGN-12`) via rule bypass + LLM micro-batching. | V8 Matcher + Gemini 2.5 Flash / Groq Llama 3.3 |
| **5** | **Policy Gatekeeper** | Pure function mapping $(Case, Diagnosis) \rightarrow Action$ (`A1`..`A11`). | Pure TypeScript (Zero Network Calls) |
| **6** | **Governance Guard** | Enforces TRAI hours, NPCI non-peak windows, and stopping triggers. | Deterministic State Evaluator |
| **7** | **Execution Adapters** | Dispatches WhatsApp, Voice, Email, or Mandate Retries. | Meta Cloud Sandbox + Mock WhatsApp Adapter |
| **8** | **Voice Audio Bridge** | Full-duplex WebRTC browser-to-agent conversational bridge. | **LiveKit Open-Source Server + Gemini Live Audio** |
| **9** | **Verification Service** | Reconciles recovery against Razorpay payment entities. | Razorpay REST API (Test Sandbox) |
| **10** | **Per-Case Audit Ledger** | Append-only `case_events` with per-case SHA-256 chaining. | PostgreSQL 16 (Local Docker / Neon Free) |

---

## 4. Passive Bank Health Sentinel: Zero-Polling Architecture

To comply strictly with NPCI and payment gateway access policies (which prohibit third-party status polling), the **Bank Health Sentinel** operates purely on **self-observed passive event telemetry**:
1. **Rolling Ingestion Window Aggregation**: A sliding 50-event in-memory Redis ring buffer analyzes incoming `payment.failed` webhooks containing `error.source = 'issuer_bank'` and standard error codes (`BAD_REQUEST_PAYMENT_TIMED_OUT`, `BANK_SYSTEM_ERROR`, `GATEWAY_ERROR`).
2. **Degradation Detection**: If the failure rate for a specific issuer bank (e.g., HDFC UPI) reaches $\ge 30.0\%$ over 50 consecutive transactions, the local sentinel marks that issuer route as `DEGRADED` with zero external polling.
3. **Automatic Retry Deferral**: When an issuer is degraded, mandate retries and checkout links are temporarily deferred until the rolling success rate recovers to $\ge 90.0\%$.

---

## 5. Free-Tier Rate Limit & Batch Ingestion Mitigation

```mermaid
graph TD
    BATCH["Inbound 1,000-Case Batch"] --> RULE_ENG["Deterministic Rule Engine<br/>(Fast V8 Regex Match)"]
    RULE_ENG -->|78% Standard Codes| DIRECT["Instant Direct Resolution<br/>(780 Cases Resolved in 5ms)"]
    RULE_ENG -->|22% Ambiguous Cases| LLM_Q["Micro-Batched LLM Queue<br/>(Grouped 10 cases per request)"]
    DIRECT --> ACTION_CAT["Recovery Action Execution Catalog (A1 to A11)"]
    LLM_Q --> ACTION_CAT
```

| Action Code | Name | Dominant Diagnosis | Policy Guardrails & Execution Parameters |
| :--- | :--- | :--- | :--- |
| **A1** | Smart Mandate Retrier | `DGN-01`, `DGN-03` | Max 3 retries, NPCI clearing windows only |
| **A2** | WhatsApp 1-Click Payment Link | `DGN-01`, `DGN-02` | Max 3 messages, 12h cooldown, no discount |
| **A3** | WhatsApp Instrument Switcher | `DGN-02` | Prompts card update via Hosted Checkout |
| **A4** | Telemetry Cooldown + Deep-Link | `DGN-05`, `DGN-06` | Holds outreach until bank uptime recovers |
| **A5** | Cart Recovery + Dynamic Waiver | `DGN-04` | Max 5.0% discount, 15-minute token TTL |
| **A6** | UPI AutoPay Smart Sequencer | `DGN-01` | Sequenced at 08:30 AM / 18:30 PM IST |
| **A7** | Smart Collect Virtual Account | `DGN-08`, `DGN-10` | Dynamic NEFT/RTGS payment instructions |
| **A8** | B2B Staged Dunning Escalation | `DGN-08` | Day 1 WhatsApp -> Day 5 Email -> Day 10 Voice |
| **A9** | In-Browser Hinglish Voice Agent | `DGN-08`, `DGN-11` | LiveKit WebRTC, PTP extraction |
| **A10** | Escalate to Human Console Desk | `DGN-09`, `DGN-12` | High-value threshold (> Rs 2,00,000) or dispute |
| **A11** | Randomized Holdout (Control) | All Categories | 10% isolated control group, zero outreach |

---

## 6. Cryptographic Audit Ledger & Per-Case Hash Chaining

Every transition in a case lifecycle generates an append-only event record cryptographically chained via SHA-256:

$$H_0 = \text{SHA-256}(\text{"GENESIS"} \parallel \text{CaseID} \parallel T_0)$$
$$H_n = \text{SHA-256}(H_{n-1} \parallel \text{EventType} \parallel \text{PayloadHash} \parallel T_n)$$

This guarantees mathematical non-repudiation: any alteration of diagnostic data, policy decisions, or concession values invalidates the hash chain and triggers an alert on the Operator Dashboard.

---

## 7. End-to-End Sequence Workflows

### 7.1 Scenario 1: Bank Degradation and WhatsApp 1-Click Recovery
```mermaid
sequenceDiagram
    autonumber
    actor Payer as End Customer (Rahul)
    participant Checkout as Merchant Checkout
    participant RZP as Razorpay Gateway
    participant Sentinel as Passive Bank Health Sentinel
    participant Core as RevLoop Core and Policy
    participant WA as WhatsApp Execution Mesh

    Payer->>Checkout: Submits Rs 3,499 Order (HDFC UPI)
    Checkout->>RZP: Process Payment Request
    RZP-->>Checkout: Failed (BAD_REQUEST_PAYMENT_TIMED_OUT)
    RZP->>Core: Webhook: payment.failed (HDFC UPI)

    Sentinel->>Core: Passive Telemetry: HDFC UPI degraded (Failure rate >= 30%)
    Core->>Core: Classify: DGN-05 (technical_gateway_timeout) via Rule Engine (3.8ms)
    Core->>Core: Policy Rule POL-03: Hold 8 mins until Bank Uptime recovers (>= 90%)

    Note over Core: 8-Min Wait and Health Check (HDFC Uptime Now 96%)
    Core->>WA: Action A4: Send WhatsApp 1-Click Interactive Link
    WA->>Payer: Hi Rahul! Your payment got stuck due to HDFC latency. Cart reserved for 15 mins. Tap below to complete via UPI.
    Payer->>WA: Clicks Complete Payment via UPI
    WA->>RZP: Dynamic Payment Link (Pre-routed via ICICI UPI)
    Payer->>RZP: Authorizes Rs 3,499 via Google Pay
    RZP->>Core: Webhook: payment.authorized (Rs 3,499)
    Core->>Core: Hard Stop Triggered: Cancel all scheduled reminders in 64ms
    Core->>Core: Verification Service: Confirm state and Mark RECOVERED
```

---

### 7.2 Scenario 2: B2B Receivables In-Browser Voice Chaser with PTP Lock
```mermaid
sequenceDiagram
    autonumber
    actor Client as B2B Client (Procurement Head)
    participant ERP as Merchant Invoicing
    participant Agent as LiveKit Voice Agent
    participant LK as LiveKit WebRTC Server (Docker)
    participant Gemini as Gemini Live Audio (Free Tier)
    participant PTP as PTP State Machine
    participant RZP as Razorpay Smart Collect

    ERP->>Agent: Invoice INV-8821 Overdue by 18 Days (Rs 85,000)
    Agent->>Agent: Evaluate Governance - Calling window valid (11:30 AM IST), Attempts 0/2
    Agent->>LK: Open WebRTC Voice Room
    LK->>Client: In-Browser Simulated Call Connected
    
    Client->>LK: Audio Stream - Haanji, kaun bol raha hai?
    LK->>Gemini: Bidirectional Audio Stream
    Gemini-->>LK: Streamed Hinglish Audio - Namaste Sharma ji, TechServe Finance se Aarav bol raha hoon. Rs 85,000 ka invoice pending hai.
    LK-->>Client: Natural Hinglish Audio (p95 Sub-785ms turnaround)

    Client->>LK: Arre bhai, abhi account manager bahar hai. Main parso subah 11 baje tak RTGS karwa dunga pakka.
    LK->>Agent: Captured Transcript
    Agent->>Agent: Extract Temporal Entity - 2026-08-26 11:00 AM, Rs 85,000, RTGS
    
    Agent->>PTP: Lock PTP Commitment (2026-08-26 11:00 AM)
    Gemini-->>LK: Theek hai Sharma ji, maine 26 August subah 11 baje note kar liya hai. Virtual Account details WhatsApp kar di hain.
    Agent->>Client: WhatsApp - Razorpay Smart Collect Details (IFSC RAZR0000001, Acc RAZRINV8821)

    Note over PTP: Active outreach suspended until 2 hours before PTP deadline
    PTP->>Client: WhatsApp Gentle Reminder (26 Aug, 09:00 AM)
    Client->>RZP: RTGS Rs 85,000 transferred to Virtual Account
    RZP->>Agent: Webhook - virtual_account.credited (Rs 85,000)
    Agent->>PTP: Mark PTP Fulfilled and Resolve Recovery Case
```

---

## 8. Distributed Concurrency & Locking Architecture

$$\text{LockKey} = \text{"lock:recovery:case:"} + \text{CaseID}$$

1. **Pre-Execution Lock Acquisition:** Worker acquires an atomic Redis lock with a 30-second lease time before processing any case.
2. **State & Stopping Rule Check:** Queries Postgres projection to ensure `status NOT IN ('RECOVERED', 'SUPPRESSED', 'CLOSED_UNRECOVERED')`.
3. **Execution & Release:** On completion or receipt of settlement webhook, the job updates `case_events` atomically and releases the mutex.
