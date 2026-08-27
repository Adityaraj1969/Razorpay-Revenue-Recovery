# Engineering Standards, Testing & Security (`code_quality.md`)
## RevLoop AI: Autonomous Closed-Loop Revenue Recovery Engine
**Hackathon Track:** Razorpay Buildathon — Track 03: AI Revenue Recovery  
**Target Platform:** Razorpay Ecosystem (100% Open-Source & Free-Tier Toolchain)  
**Document Version:** 2.4.0-VERIFIED-BENCHMARK  
**Status:** Approved Master Quality Standard  

---

## 1. Zero-Cost & Open-Source Engineering Tenets

RevLoop AI is engineered to be **100% reproducible for enterprise developers, technical auditors, and evaluators** without requiring paid subscriptions, corporate API licenses, or proprietary carrier trunks:

1. **Zero-Cost Local Orchestration:** The entire stack (Node.js API, Python Voice Bridge, PostgreSQL 16, Redis 7.4, and LiveKit WebRTC Server) spins up locally via a single `docker compose up` command.
2. **Generous Free-Tier Cloud Fallbacks:** Designed out-of-the-box with Google AI Studio Gemini Flash (Free Tier), Groq Cloud (Free Tier), Neon Postgres (Free Tier), and Meta WhatsApp Cloud Sandbox (Free Tier).
3. **Strict Type Safety & Schema Validation:** 100% strict TypeScript (`strict: true`) and Pydantic V2 schemas ensuring zero runtime type drift.
4. **Zero Unmasked Financial PII in Logs:** Credit card numbers, CVVs, bank PINs, and raw passwords never enter logging streams or LLM prompt contexts.

---

## 2. Local Zero-Cost Docker Compose Infrastructure (`docker-compose.yml`)

```yaml
version: '3.8'

services:
  # 1. PostgreSQL 16 (Event-Sourced Ledger & Projections)
  postgres:
    image: postgres:16-alpine
    container_name: revloop-postgres
    environment:
      POSTGRES_DB: revloop_db
      POSTGRES_USER: revloop_user
      POSTGRES_PASSWORD: revloop_local_pass
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  # 2. Redis 7.4 (BullMQ Event Queue & Concurrency Redlock)
  redis:
    image: redis:7.4-alpine
    container_name: revloop-redis
    ports:
      - "6379:6379"

  # 3. LiveKit Open-Source WebRTC Audio Server (Free Voice Bridge)
  livekit:
    image: livekit/livekit-server:latest
    container_name: revloop-livekit
    command: --dev
    ports:
      - "7880:7880"
      - "7881:7881"
      - "7882:7882/udp"

  # 4. Fastify Core API & Orchestration Engine
  api:
    build:
      context: .
      dockerfile: apps/api/Dockerfile
    environment:
      DATABASE_URL: "postgresql://revloop_user:revloop_local_pass@postgres:5432/revloop_db"
      REDIS_URL: "redis://redis:6379"
      GEMINI_API_KEY: "${GEMINI_API_KEY}" # Free tier from Google AI Studio
      GROQ_API_KEY: "${GROQ_API_KEY}"     # Free tier from Groq Cloud
      RAZORPAY_KEY_ID: "${RAZORPAY_KEY_ID}" # Free Sandbox key
      RAZORPAY_KEY_SECRET: "${RAZORPAY_KEY_SECRET}"
    ports:
      - "3001:3001"
    depends_on:
      - postgres
      - redis

volumes:
  pgdata:
```

---

## 3. Monorepo Directory Topology

```
razorpay-revenue-recovery/
├── apps/
│   ├── api/                    # Fastify / Node.js 22 Ingestion & Orchestration Core
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── webhooks/   # Razorpay Webhook Ingestion & HMAC Verification
│   │   │   │   ├── diagnosis/  # Gemini 2.5 Flash / Groq Root-Cause Engine
│   │   │   │   ├── governance/ # Deterministic Policy & Stopping Guardrails
│   │   │   │   ├── channels/   # WhatsApp, LiveKit Voice Agent, Mandate Retrier
│   │   │   │   ├── ptp/        # Promise-To-Pay Temporal Tracker
│   │   │   │   └── audit/      # Cryptographic Per-Case SHA-256 Hash Chain Ledger
│   │   │   └── server.ts
│   ├── web/                    # Next.js 15 Recovery Radar & Operator Cockpit
│   │   ├── src/
│   │   │   ├── app/            # App Router (Dashboard, Radar, Invoices, Audits)
│   │   │   └── components/     # Shadcn UI + Tailwind CSS Components
│   └── voice-agent/            # LiveKit Python Agents Worker + Gemini Live / Kokoro
├── packages/
│   ├── db/                     # Prisma / Kysely PostgreSQL Schema & Migrations
│   ├── sdk/                    # Razorpay Typed API Gateway Client
│   └── shared-types/           # Shared Event Envelopes, DGN-01..12 & Zod Schemas
├── tests/
│   ├── unit/                   # Policy Gatekeeper, Stopping Rules, Clamping
│   ├── integration/            # Razorpay Webhook Handlers, BullMQ Queues
│   └── chaos/                  # 150 Chaos Scenarios, Passive Bank Degradations
└── docs/                       # Complete System Documentation Suite
```

---

## 4. Static Analysis, Linting & Type Standards

### 4.1 TypeScript Configuration (`tsconfig.json`)
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
```

---

## 5. Comprehensive Testing Pyramid

```mermaid
flowchart TD
    subgraph PYRAMID["Quality Assurance &amp; Testing Pyramid"]
        direction TB
        CHAOS["<b>Top Tier: Chaos &amp; Batch Simulation (15%)</b><br/>• RevRecover-1000 Batch Evaluation<br/>• 150 Chaos Scenarios across 6 Stress Domains"]
        INT["<b>Middle Tier: Integration Tests (35%)</b><br/>• Razorpay Webhook Signatures &amp; Deduplication<br/>• BullMQ Queues, Redis Redlock &amp; SSE Feeds"]
        UNIT["<b>Foundation Tier: Unit Tests (50%)</b><br/>• Deterministic Policy Gatekeeper<br/>• Concession Sanitizer Floor Clamping<br/>• Per-Case SHA-256 Hash Chaining"]
        
        CHAOS --> INT
        INT --> UNIT
    end
```

### 5.1 Unit Test Specifications

#### 1. Policy Gatekeeper & Stopping Rule Unit Test (`policyGate.spec.ts`)
```typescript
describe("Policy Gatekeeper Determinism", () => {
  it("should immediately abort scheduled outreach if payment.authorized is verified", async () => {
    const activeCase = createMockCase({ status: "AWAITING_POLICY", attemptCount: 1 });
    const webhookEvent = { event: "payment.authorized", entityId: activeCase.rzpEntityId };

    const decision = await GovernanceInterceptor.evaluate(activeCase, webhookEvent);
    
    expect(decision.shouldStop).toBe(true);
    expect(decision.reason).toBe("RESOLVED_SETTLED");
    expect(decision.nextStatus).toBe("RECOVERED");
  });

  it("should mathematically clamp LLM proposed discount to merchant margin floor", () => {
    const merchantFloor = 5.0; // Max 5% allowed
    const llmProposedDiscount = 15.0; // 15% proposed by model

    const sanctionedDiscount = ConcessionSanitizer.clamp(llmProposedDiscount, merchantFloor);

    expect(sanctionedDiscount).toBe(5.0);
  });
});
```

#### 2. HMAC-SHA256 Razorpay Webhook Verification Test (`webhookAuth.spec.ts`)
```typescript
describe("Razorpay Webhook Cryptographic Verification", () => {
  it("should reject tampered webhook payloads with 401 Unauthorized", () => {
    const secret = "live_secret_key_88921";
    const rawPayload = JSON.stringify({ event: "payment.failed", id: "pay_123" });
    const forgedSignature = "invalid_hash_signature_abcdef123456";

    const isValid = verifyRazorpaySignature(rawPayload, forgedSignature, secret);
    
    expect(isValid).toBe(false);
  });
});
```

---

## 6. Security & Statutory Compliance (DPDP Act 2023)

| Security Domain | RevLoop AI Implementation |
| :--- | :--- |
| **PCI-DSS Level 1 Isolation** | Card numbers & CVVs are never handled directly; uses Razorpay Hosted Checkout / Tokenized Mandates. |
| **PII Data Masking in Logs** | Customer phone numbers logged as `+91 98765*****`, emails as `v***m@example.com`. |
| **Secrets Management** | Injected via environment variables / `.env.local`; zero credentials checked into git. |
| **Rate Limiting** | Redis Sliding Window rate-limiter: 100 req/min per IP on public endpoints. |
| **DDoS & Webhook Tampering** | Cloudflare WAF + strict HMAC-SHA256 signature validation before queue insertion. |
