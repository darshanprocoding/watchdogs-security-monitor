# WATCHDOGS AI Runtime Security Monitor — Enterprise Architecture & Implementation Plan

WATCHDOGS is an enterprise-grade AI runtime security proxy and guardrail system designed to intercept, evaluate, and neutralize malicious multi-agent actions, specification gaming, and prompt injection attacks with sub-millisecond to deep semantic scrutiny before execution.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural decisions and real-world enterprise additions are incorporated:
> - **Tier 3 Overseer Execution**: Dual-mode engine utilizing Groq Llama 3 when configured, with automated fallback to Gemini Flash (`gemini-flash-latest`) via `@google/genai` for 100% out-of-the-box operational readiness.
> - **Interactive Threat Simulator**: Real-world attack suite (destructive shell commands, PII harvesting, speculative prompt injections, parameter pollution, spec gaming) to trigger and visualize the 3-tier cascade and interception mechanics live.
> - **Real-World Production Enhancements**:
>   1. **Agent Integration SDK Hub**: Drop-in client snippets for LangChain (`WatchdogsCallbackHandler`), LangGraph, and native Gemini/OpenAI proxies.
>   2. **Canary Tripwires & Synthetic Honey-Data**: Canary AWS keys and customer records inside the Honeypot to detect exfiltration downstream.
>   3. **Financial & Latency ROI Engine**: Live tracker of API cost dollars saved and p50/p95/p99 latency improvements from Tier 1/2 short-circuiting.
>   4. **Cryptographic SHA-256 Immutable Audit Ledger**: Verifiable tamper-evident logs backed by 5 TB Google AI Pro storage simulation with SOC 2 / EU AI Act compliance export.
> - **Visual SOC Aesthetic**: Dark tactical cyber-defense operations console featuring deep obsidian slate surfaces (`#0B0F17`), neon emerald/cyan/amber/crimson telemetry accents, and high-density monospace tabular telemetry (`tabular-nums`).

---

## 1. Overview & Core Concept

### What It Does
WATCHDOGS operates as an intelligent intercepting reverse-proxy between an autonomous AI agent (e.g. LangChain / Gemini agent) and its execution environment (tools, shell, database, APIs). Instead of routing every single agent tool call to an expensive, high-latency LLM evaluator, WATCHDOGS cascades requests through three distinct filtering tiers:
1. **Tier 1 — Zero-Latency Heuristics Engine**: Intercepts regex patterns for catastrophic commands (`rm -rf`, `chmod 777`, fork bombs, unauthorized IP egress, SQL injections) in `< 1ms`.
2. **Tier 2 — Semantic Vector Cache**: Queries an indexed vector store of previously evaluated and blocked intents backed by the 5 TB Google AI Pro persistent storage abstraction. Matches with $>98\%$ cosine similarity are immediately blocked or quarantined in $\approx 5\text{ms}$ with zero model inference cost.
3. **Tier 3 — Groq / Gemini Overseer**: Deep semantic reasoning for ambiguous, novel agent intents. Returns granular remediation decisions beyond simple block/allow:
   - **Dynamic Parameter Redaction**: Strips malicious arguments while allowing safe tool calls to proceed without disruption.
   - **Honeypot Interrogation Mode**: Silently diverts deceptive agents to synthetic decoy sandboxes with fake credentials to study attack patterns.
   - **Contextual Memory Wipe**: Purges compromised agent context windows upon exploit discovery and restarts clean states with protective constraints.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Live Security Dashboard & Threat Heatmap**:
   - Real-time KPI strip: Intercepted Requests, Cascade Tier Distribution (% Tier 1 / Tier 2 / Tier 3), Cost & Latency Savings ($ saved vs 100% LLM evaluation), Redacted Payloads, Honeypot Captures.
   - Threat matrix heatmap: Attack Vector vs. Severity & Frequency matrix.
   - Latency distribution: Tier 1 ($<1\text{ms}$) vs Tier 2 ($5\text{ms}$) vs Tier 3 ($180\text{ms}$) showing p50/p95/p99 metrics.
2. **Interactive Attack Simulator & Cascade Pipeline Inspector**:
   - One-click exploit launcher:
     - `Destructive Shell (Tier 1 Catch)`: `rm -rf /var/data --no-preserve-root`
     - `Blocked Vector Repeat (Tier 2 Cache Hit)`: Variations of known credential dumping attacks matching $>98\%$ vector similarity.
     - `Malicious Parameter Injection (Redaction)`: `query_user_records(filter='active', export_path='/tmp/report.csv; cat /etc/passwd')`
     - `Specification Gaming (Honeypot Trap)`: Agent attempting to manipulate safety score files silently rerouted to synthetic canary files.
     - `Jailbreak & Exploit Discovery (Context Wipe)`: Agent attempting prompt leakage triggers immediate memory wipe and reset.
   - Live Cascade Trace Visualizer showing step-by-step traversal through Tier 1 $\rightarrow$ Tier 2 $\rightarrow$ Tier 3.
3. **No-Code Security Policy Studio**:
   - Interactive policy toggle matrix:
     - `Block PII Extraction (SSN, credit cards, emails)`
     - `Enforce Read-Only File System Access`
     - `Block Outbound Network Egress to Unwhitelisted IPs`
     - `Prevent Code / Shell Execution Tools`
     - `Honeypot Reroute on Spec Gaming`
     - `Auto Context-Wipe on Exploit Discovery`
     - `Dynamic Parameter Auto-Redaction`
   - Real-time compiled System Prompt Preview showing how active toggles dynamically compile into the Overseer's prompt and regex rules.
4. **Agent Integration & SDK Hub**:
   - Ready-to-copy code snippets for LangChain `BaseCallbackHandler`, LangGraph tool middleware, and Node.js/Python SDK clients with gateway URL configuration.
5. **Immutable Audit Ledger & Canary Tripwires**:
   - Filterable security ledger with SHA-256 tamper-evident verification, storage allocation indicators (5 TB Google AI Pro storage quota), canary token trip alerts, and one-click JSON/CSV compliance export.

### Visual Identity & Theme
- **Theme**: Dark Tactical Cyber-Defense SOC.
- **Canvas Neutrals**: Deep obsidian canvas (`#090D16`), card surfaces (`#111827` with hairline border `rgba(255,255,255,0.08)`), sub-panels (`#162032`).
- **Telemetry Accents**:
  - Safe / Passed: Emerald (`#10B981`)
  - Redacted / Sanitized: Cyan (`#06B6D4`)
  - Honeypot Active: Amber (`#F59E0B`)
  - Blocked / Memory Wipe: Crimson (`#EF4444`)
  - Semantic Overseer: Violet (`#8B5CF6`)
- **Typography**: Clean display sans (`Plus Jakarta Sans`) for headers paired with tabular numerals (`font-mono tabular-nums`) for metric counts, latencies, and vector similarity percentages.

---

## 3. Key Product Decisions & Trade-Offs

### Decision 1: Cascade Evaluation Pipeline Routing
- **Chosen Approach**: Three-tier sequential short-circuiting:
  $$\text{Incoming Agent Action} \longrightarrow \text{Tier 1 (Regex/IP)} \longrightarrow \text{Tier 2 (Vector Cache)} \longrightarrow \text{Tier 3 (Overseer)}$$
- **Why**: Evaluates $\approx 70\text{–}85\%$ of common attacks at Tier 1/2 in $<5\text{ms}$ at $\$0$ LLM cost, reserving Tier 3 only for novel, nuanced agent behavior.

### Decision 2: Dual-Engine Tier 3 Overseer (Groq + Gemini Flash)
- **Chosen Approach**: Server-side proxy natively checks for `GROQ_API_KEY`; if present, routes to Groq Llama 3 for high-speed inference; if absent or on network timeout, seamlessly falls back to Gemini Flash (`gemini-flash-latest`) via `@google/genai` using the existing injected `GEMINI_API_KEY`.
- **Why**: Ensures zero-configuration out-of-the-box reliability while honoring the Groq requirement.

### Decision 3: Interception Mechanics Beyond Binary Block/Allow
- **Chosen Approach**: Implement 4 active verdict types: `ALLOW`, `BLOCK`, `REDACT_EXECUTE` (surgically clean parameters), and `HONEYPOT_REROUTE` (synthetic environment diversion). Plus triggerable `CONTEXT_WIPE` signal.
- **Why**: Binary blocking causes primary agents to retry stubbornly or hallucinate. Redaction keeps workflows alive while nullifying threats; Honeypots collect adversarial behavioral data.

### Decision 4: Real-World Enterprise Feasibility (Canary Tokens + ROI Telemetry)
- **Chosen Approach**: Inject active canary artifacts into honeypot responses and calculate live cost/latency savings against standard single-LLM evaluation.
- **Why**: Proves real-world ROI to security executives and provides hard evidence of downstream data leakage attempts.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│               PRIMARY AI AGENT (LANGCHAIN / GEMINI AGENT)               │
│                   State: Context Window & Tool Calls                   │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │ Tool Invocation Request (/api/proxy)
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│             WATCHDOGS THREE-TIER CASCADE EVALUATION PROXY              │
│                                                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │ Tier 1: Zero-Latency Heuristics Engine (< 1ms)                 │   │
│   │ - Regex blocklists (rm -rf, fork bomb, reverse shell, SQLi)    │   │
│   │ - IP / CIDR blacklists & unauthorized port access              │   │
│   └───────────────┬────────────────────────────────────────────────┘   │
│                   │ (If Clean)                                         │
│                   ▼                                                    │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │ Tier 2: Semantic Vector Cache (~5ms)                           │   │
│   │ - Cosine similarity against indexed blocked vectors (>= 0.98)  │   │
│   │ - Immutable audit log stream (5 TB Google AI Pro Storage)      │   │
│   └───────────────┬────────────────────────────────────────────────┘   │
│                   │ (If Novel / Ambiguous)                             │
│                   ▼                                                    │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │ Tier 3: Groq / Gemini Overseer Deep Semantic Evaluator         │   │
│   │ - Dynamic policy compiled system prompt                        │   │
│   │ - Verdict: ALLOW | BLOCK | REDACT_EXECUTE | HONEYPOT_REROUTE   │   │
│   └───────────────┬────────────────────────────────────────────────┘   │
└───────────────────┼────────────────────────────────────────────────────┘
                    │
         ┌──────────┴──────────────┬───────────────────┐
         ▼                         ▼                   ▼
┌─────────────────┐       ┌─────────────────┐ ┌─────────────────┐
│ Dynamic         │       │ Honeypot        │ │ Context Memory  │
│ Parameter       │       │ Interrogation   │ │ Wipe & Reset    │
│ Redaction       │       │ + Canary Tokens │ │ Protocol        │
└─────────────────┘       └─────────────────┘ └─────────────────┘
```

### Core Server & Client Modules
1. `server/cascadeProxy.ts`: The three-tier interceptor pipeline with Tier 1 regex/IP rules, Tier 2 vector similarity matcher, and Tier 3 Groq/Gemini evaluator.
2. `server/interceptionMechanics.ts`: Dynamic parameter redaction algorithms, synthetic Honeypot sandbox state with canary tokens, and agent context-wiping routine.
3. `server/storageManager.ts`: Abstraction representing the 5 TB Google AI Pro high-capacity storage environment with immutable SHA-256 audit logs and vector cache persistence.
4. `server/policyCompiler.ts`: Compiles UI policy toggle flags into dynamic regex rules and Tier 3 Overseer system instructions.
5. `src/components/PolicyToggles.tsx`: The requested React component with no-code switches, compiled prompt preview, and instant policy sync.
6. `src/components/ThreatTelemetry.tsx`: Visual analytics with attack vector heatmaps, tier distribution graphs, and cost/latency ROI calculator.
7. `src/components/AttackSimulator.tsx`: Live playground to trigger exploits and trace cascade proxy actions in real time.
8. `src/components/AuditLogDrawer.tsx`: Tamper-evident ledger with SHA-256 hashes, canary detection, and compliance export.
9. `src/components/IntegrationHub.tsx`: Drop-in SDK middleware generator for LangChain, LangGraph, and REST.

---

## 5. Verification & Testing Plan

1. **Compilation & Linting**: Run `compile_applet` to verify TypeScript compliance across all server and React components.
2. **Cascade Tier Verification**:
   - Test Tier 1 with `rm -rf /` $\rightarrow$ must block in $< 1\text{ms}$ with zero model call.
   - Test Tier 2 with repeat or slightly varied blocked intent $\rightarrow$ must hit vector cache ($>98\%$ match) in $\approx 5\text{ms}$.
   - Test Tier 3 with parameter pollution $\rightarrow$ verify surgical redaction and safe execution.
   - Test Tier 3 with spec gaming $\rightarrow$ verify silent diversion to synthetic honeypot.
   - Test exploit detection $\rightarrow$ verify primary agent context memory wipe.
3. **UI Reactivity**: Verify no-code policy toggles update the compiled Overseer instructions live and immediate test attacks reflect new policies.
