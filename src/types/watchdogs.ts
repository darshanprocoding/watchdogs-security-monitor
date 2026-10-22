/**
 * WATCHDOGS AI Runtime Security Monitor
 * Type Definitions & Schema Contracts
 */

export type TierLevel = 'TIER_1_HEURISTICS' | 'TIER_2_VECTOR_CACHE' | 'TIER_3_GROQ_OVERSEER';

export type InterceptionVerdict = 'ALLOW' | 'BLOCK' | 'REDACT_EXECUTE' | 'HONEYPOT_REROUTE';

export type ThreatCategory = 
  | 'COMMAND_INJECTION'
  | 'PII_EXFILTRATION'
  | 'SPECIFICATION_GAMING'
  | 'UNAUTHORIZED_NETWORK'
  | 'JAILBREAK_EXPLORE'
  | 'PRIVILEGE_ESCALATION'
  | 'BENIGN';

export type ThreatSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';

export interface SecurityPolicies {
  blockPiiExtraction: boolean;
  enforceReadOnlyFs: boolean;
  blockUnauthorizedIpEgress: boolean;
  preventShellExecution: boolean;
  honeypotSpecGaming: boolean;
  contextWipeOnExploit: boolean;
  dynamicParamRedaction: boolean;
  strictSqlInjection: boolean;
}

export interface CascadeStepResult {
  tier: TierLevel;
  name: string;
  evaluated: boolean;
  passed: boolean;
  latencyMs: number;
  reason?: string;
  metadata?: Record<string, any>;
}

export interface InterceptionResult {
  id: string;
  timestamp: string;
  agentId: string;
  toolName: string;
  inputPayload: Record<string, any>;
  verdict: InterceptionVerdict;
  threatCategory: ThreatCategory;
  threatSeverity: ThreatSeverity;
  tierEvaluated: TierLevel;
  cascadeTrace: CascadeStepResult[];
  totalLatencyMs: number;
  actionTaken: string;
  reasoning: string;
  sanitizedPayload?: Record<string, any>;
  redactedParams?: string[];
  similarityScore?: number;
  matchedVectorId?: string;
  honeypotTriggered: boolean;
  contextWipeTriggered: boolean;
  sha256Hash: string;
  overseerEngine?: 'groq-llama3' | 'gemini-flash' | 'heuristic' | 'cache';
}

export interface AuditLogEntry extends InterceptionResult {
  previousHash: string;
  storageBlockId: string;
}

export interface CachedVector {
  id: string;
  intentPattern: string;
  embedding: number[];
  verdict: InterceptionVerdict;
  threatCategory: ThreatCategory;
  category: string;
  createdAt: string;
  hitCount: number;
}

export interface StorageMetrics {
  totalCapacityBytes: number; // 5 TB = 5 * 1024^4
  usedBytes: number;
  cachedVectorsCount: number;
  auditBlocksCount: number;
  storageProvider: string; // 'Google AI Pro 5 TB Environment'
  lastSyncTimestamp: string;
}

export interface TelemetryStats {
  totalRequests: number;
  tier1Intercepts: number;
  tier2CacheHits: number;
  tier3Evaluations: number;
  blockedCount: number;
  redactedCount: number;
  honeypotCaptures: number;
  contextWipes: number;
  avgLatencyMs: number;
  estimatedCostSavedUsd: number;
  vectorSimilarityDistribution: { range: string; count: number }[];
  threatVectorHeatmap: { category: ThreatCategory; severity: ThreatSeverity; count: number }[];
  timeSeriesData: {
    time: string;
    tier1: number;
    tier2: number;
    tier3: number;
    blocked: number;
  }[];
}

export interface AgentContextState {
  agentId: string;
  status: 'HEALTHY' | 'COMPROMISED' | 'HONEYPOT_ISOLATED';
  wipeCount: number;
  lastWipeTimestamp?: string;
  conversationTurns: {
    role: 'user' | 'assistant' | 'tool';
    content: string;
    timestamp: string;
    toolCall?: { name: string; args: Record<string, any> };
  }[];
  activeCanariesDiscovered: string[];
}

export interface AgentFleetProfile {
  agentId: string;
  name: string;
  role: string;
  model: string;
  trustScore: number; // 0 - 100
  status: 'HEALTHY' | 'ELEVATED_RISK' | 'QUARANTINED' | 'HONEYPOT_ISOLATED';
  totalCalls: number;
  blockedCalls: number;
  quarantineCount: number;
  lastActiveTimestamp: string;
}

export interface QuarantineIncident {
  id: string;
  timestamp: string;
  agentId: string;
  toolName: string;
  payload: Record<string, any>;
  riskScore: number;
  threatCategory: ThreatCategory;
  threatSeverity: ThreatSeverity;
  status: 'PENDING_REVIEW' | 'APPROVED_RELEASED' | 'REJECTED_BLOCKED' | 'SANITIZED_RELEASED';
  analystNotes?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  suggestedAction: string;
}

export interface CustomSecurityRule {
  id: string;
  name: string;
  description: string;
  pattern: string; // Regex or keyword
  toolTarget: string; // 'all' or specific tool like 'execute_shell'
  action: 'BLOCK' | 'REDACT' | 'ALERT';
  enabled: boolean;
  createdAt: string;
  hits: number;
}

export interface BenchmarkTestCase {
  id: string;
  name: string;
  category: string;
  owaspCode: string;
  toolName: string;
  payload: Record<string, any>;
  expectedVerdict: InterceptionVerdict;
}

export interface BenchmarkResult {
  runId: string;
  timestamp: string;
  totalTests: number;
  blockedCount: number;
  redactedCount: number;
  passedCount: number;
  accuracyPercent: number;
  avgLatencyMs: number;
  p50LatencyMs: number;
  p95LatencyMs: number;
  testDetails: {
    testId: string;
    name: string;
    owaspCode: string;
    verdict: InterceptionVerdict;
    passedExpected: boolean;
    latencyMs: number;
    tier: TierLevel;
    reasoning: string;
  }[];
}

