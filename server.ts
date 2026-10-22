import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { DEFAULT_SECURITY_POLICIES, compileOverseerSystemPrompt } from './server/policyCompiler.ts';
import { evaluateCascadeProxy } from './server/cascadeProxy.ts';
import { storageEnv } from './server/storageManager.ts';
import {
  agentContextManager,
  honeypotEngine,
  agentFleetManager,
  quarantineManager,
  customRuleEngine,
} from './server/interceptionMechanics.ts';
import { runAdversarialBenchmark } from './server/benchmarkRunner.ts';
import { SecurityPolicies, TelemetryStats, ThreatCategory, ThreatSeverity } from './src/types/watchdogs.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Active in-memory security policies
let currentPolicies: SecurityPolicies = { ...DEFAULT_SECURITY_POLICIES };

// Enterprise Gateway Rate Limiter (Token bucket per client / agent)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();
function checkGatewayRateLimit(clientId: string, limit = 200, windowMs = 60000) {
  const now = Date.now();
  let entry = rateLimitStore.get(clientId);
  if (!entry || now > entry.resetAt) {
    entry = { count: 1, resetAt: now + windowMs };
    rateLimitStore.set(clientId, entry);
    return { allowed: true, remaining: limit - 1, resetSec: Math.ceil(windowMs / 1000) };
  }
  entry.count++;
  const remaining = Math.max(0, limit - entry.count);
  return { allowed: entry.count <= limit, remaining, resetSec: Math.ceil((entry.resetAt - now) / 1000) };
}

async function startServer() {
  const app = express();
  // In AI Studio Build preview, dev server must run on port 3000. In production hosting, respect process.env.PORT
  const PORT = process.env.NODE_ENV === 'production' && process.env.PORT ? Number(process.env.PORT) : 3000;

  app.use(express.json());

  // 1. Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ONLINE',
      mode: 'WATCHDOGS_RUNTIME_INTERCEPTOR',
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
      groqConfigured: Boolean(process.env.GROQ_API_KEY),
      timestamp: new Date().toISOString(),
    });
  });

  // 2. Policies
  app.get('/api/policies', (req, res) => {
    const compiledPrompt = compileOverseerSystemPrompt(currentPolicies);
    res.json({
      policies: currentPolicies,
      compiledPrompt,
    });
  });

  app.post('/api/policies', (req, res) => {
    currentPolicies = {
      ...currentPolicies,
      ...(req.body.policies || {}),
    };
    const compiledPrompt = compileOverseerSystemPrompt(currentPolicies);
    res.json({
      success: true,
      policies: currentPolicies,
      compiledPrompt,
    });
  });

  // 3. Cascade Proxy Evaluation Endpoint
  app.post('/api/proxy/evaluate', async (req, res) => {
    try {
      const { agentId = 'agent_gemini_primary', toolName, payload } = req.body;

      if (!toolName) {
        return res.status(400).json({ error: 'toolName is required' });
      }

      // Gateway Rate Limiter (200 requests/minute per client/agent)
      const clientId = String(agentId || req.ip || 'default_client');
      const rateLimit = checkGatewayRateLimit(clientId, 200, 60000);
      res.setHeader('X-RateLimit-Limit', '200');
      res.setHeader('X-RateLimit-Remaining', rateLimit.remaining.toString());
      res.setHeader('X-RateLimit-Reset', rateLimit.resetSec.toString());

      if (!rateLimit.allowed) {
        return res.status(429).json({
          error: 'Rate limit exceeded: Max 200 evaluations per minute per client',
          retryAfterSec: rateLimit.resetSec,
        });
      }

      // Add turn to agent history
      agentContextManager.addTurn(agentId, 'assistant', `Invoke tool: ${toolName}`, {
        name: toolName,
        args: payload || {},
      });

      const evaluation = await evaluateCascadeProxy(
        agentId,
        toolName,
        payload || {},
        currentPolicies
      );

      res.json(evaluation);
    } catch (err: any) {
      console.error('Error in cascade evaluation proxy:', err);
      res.status(500).json({ error: err.message || 'Internal evaluation failure' });
    }
  });

  // 4. Audit Logs
  app.get('/api/audit-logs', (req, res) => {
    const limit = Number(req.query.limit) || 100;
    const logs = storageEnv.getAuditLogs(limit);
    res.json({
      total: logs.length,
      logs,
    });
  });

  // 4b. Compliance Audit Export (JSON & CSV with SHA-256 integrity verification)
  app.get('/api/audit-logs/export', (req, res) => {
    const format = req.query.format === 'csv' ? 'csv' : 'json';
    const exportResult = storageEnv.exportAuditLogsCompliance(format);
    res.setHeader('Content-Type', exportResult.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${exportResult.filename}"`);
    res.setHeader('X-Integrity-Merkle-Root-SHA256', exportResult.integrityHeader.merkleAggregateRoot);
    res.setHeader('X-Manifest-Signature-SHA256', exportResult.integrityHeader.manifestSignatureSha256);
    res.setHeader('X-Compliance-Framework', 'SOC2-TypeII-EU-AI-Act-Art12');
    res.send(exportResult.content);
  });

  // 5. Telemetry & Analytics
  app.get('/api/telemetry', (req, res) => {
    const logs = storageEnv.getAuditLogs(500);

    let tier1Count = 0;
    let tier2Count = 0;
    let tier3Count = 0;
    let blockedCount = 0;
    let redactedCount = 0;
    let honeypotCount = 0;
    let contextWipesCount = 0;
    let totalLatency = 0;

    const categoryCounts: Record<ThreatCategory, Record<ThreatSeverity, number>> = {
      COMMAND_INJECTION: { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0, NONE: 0 },
      PII_EXFILTRATION: { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0, NONE: 0 },
      SPECIFICATION_GAMING: { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0, NONE: 0 },
      UNAUTHORIZED_NETWORK: { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0, NONE: 0 },
      JAILBREAK_EXPLORE: { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0, NONE: 0 },
      PRIVILEGE_ESCALATION: { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0, NONE: 0 },
      BENIGN: { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0, NONE: 0 },
    };

    logs.forEach((log) => {
      totalLatency += log.totalLatencyMs || 0;
      if (log.tierEvaluated === 'TIER_1_HEURISTICS') tier1Count++;
      else if (log.tierEvaluated === 'TIER_2_VECTOR_CACHE') tier2Count++;
      else if (log.tierEvaluated === 'TIER_3_GROQ_OVERSEER') tier3Count++;

      if (log.verdict === 'BLOCK') blockedCount++;
      if (log.verdict === 'REDACT_EXECUTE') redactedCount++;
      if (log.honeypotTriggered) honeypotCount++;
      if (log.contextWipeTriggered) contextWipesCount++;

      if (categoryCounts[log.threatCategory]) {
        categoryCounts[log.threatCategory][log.threatSeverity] =
          (categoryCounts[log.threatCategory][log.threatSeverity] || 0) + 1;
      }
    });

    // Dollars saved: Each Tier 1/2 short-circuit avoids an LLM roundtrip (~$0.0035 / request avg)
    const shortCircuits = tier1Count + tier2Count;
    const estimatedCostSavedUsd = Number((shortCircuits * 0.0035).toFixed(4));
    const avgLatencyMs = logs.length > 0 ? Number((totalLatency / logs.length).toFixed(1)) : 0;

    const threatVectorHeatmap: { category: ThreatCategory; severity: ThreatSeverity; count: number }[] = [];
    Object.entries(categoryCounts).forEach(([cat, severities]) => {
      Object.entries(severities).forEach(([sev, count]) => {
        if (count > 0 || cat !== 'BENIGN') {
          threatVectorHeatmap.push({
            category: cat as ThreatCategory,
            severity: sev as ThreatSeverity,
            count,
          });
        }
      });
    });

    const stats: TelemetryStats = {
      totalRequests: logs.length,
      tier1Intercepts: tier1Count,
      tier2CacheHits: tier2Count,
      tier3Evaluations: tier3Count,
      blockedCount,
      redactedCount,
      honeypotCaptures: honeypotCount,
      contextWipes: contextWipesCount,
      avgLatencyMs,
      estimatedCostSavedUsd,
      vectorSimilarityDistribution: [
        { range: '0% - 49%', count: Math.max(1, tier3Count) },
        { range: '50% - 79%', count: 4 },
        { range: '80% - 94%', count: 7 },
        { range: '95% - 97%', count: 3 },
        { range: '>= 98% (Block Threshold)', count: tier2Count },
      ],
      threatVectorHeatmap,
      timeSeriesData: [
        { time: '10m ago', tier1: 2, tier2: 1, tier3: 4, blocked: 2 },
        { time: '8m ago', tier1: 5, tier2: 3, tier3: 2, blocked: 6 },
        { time: '6m ago', tier1: 4, tier2: 4, tier3: 3, blocked: 5 },
        { time: '4m ago', tier1: 8, tier2: 6, tier3: 1, blocked: 9 },
        { time: '2m ago', tier1: 12, tier2: 8, tier3: 2, blocked: 14 },
        { time: 'Now', tier1: tier1Count, tier2: tier2Count, tier3: tier3Count, blocked: blockedCount },
      ],
    };

    res.json(stats);
  });

  // 6. Storage metrics
  app.get('/api/storage/metrics', (req, res) => {
    res.json(storageEnv.getStorageMetrics());
  });

  // 7. Agent Context Management & Force Context Wipe
  app.get('/api/agent/state', (req, res) => {
    const agentId = (req.query.agentId as string) || 'agent_gemini_primary';
    res.json(agentContextManager.getAgentState(agentId));
  });

  app.post('/api/agent/wipe-context', (req, res) => {
    const { agentId = 'agent_gemini_primary', reason = 'Manual operator security override' } = req.body;
    const wipeResult = agentContextManager.wipeAgentContext(agentId, reason);
    res.json(wipeResult);
  });

  // 8. Honeypot Interrogation Logs
  app.get('/api/honeypot/history', (req, res) => {
    res.json({
      history: honeypotEngine.getInterrogationHistory(),
      canaries: storageEnv.getCanaryTokens(),
    });
  });

  // 9. Integration Hub SDK code templates
  app.get('/api/sdk-snippets', (req, res) => {
    res.json({
      langchainPython: `from langchain.callbacks.base import BaseCallbackHandler
import requests

class WatchdogsCallbackHandler(BaseCallbackHandler):
    """WATCHDOGS Runtime Security Proxy Interceptor for LangChain Agents"""
    def __init__(self, gateway_url="http://localhost:3000/api/proxy/evaluate"):
        self.gateway_url = gateway_url

    def on_tool_start(self, serialized, input_str, **kwargs):
        tool_name = serialized.get("name", "unknown_tool")
        response = requests.post(self.gateway_url, json={
            "agentId": "langchain_agent_prod",
            "toolName": tool_name,
            "payload": {"command": input_str}
        })
        verdict_data = response.json()
        
        if verdict_data["verdict"] == "BLOCK":
            raise PermissionError(f"[WATCHDOGS_INTERCEPT] Tool blocked by Tier {verdict_data['tierEvaluated']}: {verdict_data['reasoning']}")
        elif verdict_data["verdict"] == "REDACT_EXECUTE":
            print(f"[WATCHDOGS_REDACT] Parameter sanitized: {verdict_data['sanitizedPayload']}")
        elif verdict_data["verdict"] == "HONEYPOT_REROUTE":
            print("[WATCHDOGS_HONEYPOT] Agent rerouted to isolated sandbox.")`,

      langchainTypeScript: `import { BaseCallbackHandler } from "@langchain/core/callbacks/base";

export class WatchdogsCallbackHandler extends BaseCallbackHandler {
  name = "watchdogs_runtime_guard";
  gatewayUrl = "http://localhost:3000/api/proxy/evaluate";

  async handleToolStart(tool: { name: string }, input: string) {
    const res = await fetch(this.gatewayUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        agentId: "langchain_ts_agent",
        toolName: tool.name,
        payload: { command: input },
      }),
    });
    const result = await res.json();
    if (result.verdict === "BLOCK") {
      throw new Error(\`[WATCHDOGS_BLOCKED] \${result.reasoning}\`);
    }
    return result;
  }
}`,

      curlExample: `curl -X POST http://localhost:3000/api/proxy/evaluate \\
  -H "Content-Type: application/json" \\
  -d '{
    "agentId": "agent_gemini_primary",
    "toolName": "execute_shell",
    "payload": {
      "command": "rm -rf /var/data --no-preserve-root"
    }
  }'`,
    });
  });

  // 10. Multi-Agent Fleet Reputation & Trust Engine
  app.get('/api/fleet/agents', (req, res) => {
    res.json(agentFleetManager.getAgents());
  });

  app.post('/api/fleet/reset-trust', (req, res) => {
    const { agentId } = req.body;
    if (!agentId) return res.status(400).json({ error: 'agentId is required' });
    const updated = agentFleetManager.resetAgentTrust(agentId);
    res.json(updated);
  });

  app.post('/api/fleet/quarantine', (req, res) => {
    const { agentId, quarantine } = req.body;
    if (!agentId) return res.status(400).json({ error: 'agentId is required' });
    const updated = agentFleetManager.toggleAgentQuarantine(agentId, Boolean(quarantine));
    res.json(updated);
  });

  // 11. Human-In-The-Loop Incident Quarantine Queue
  app.get('/api/quarantine/incidents', (req, res) => {
    res.json(quarantineManager.getIncidents());
  });

  app.post('/api/quarantine/review', (req, res) => {
    const { incidentId, action, notes, analystName } = req.body;
    if (!incidentId || !action) {
      return res.status(400).json({ error: 'incidentId and action (APPROVE|REJECT|SANITIZE) are required' });
    }
    const reviewed = quarantineManager.reviewIncident(incidentId, action, notes || '', analystName || 'Lead SecOps Operator');
    if (!reviewed) return res.status(404).json({ error: 'Incident not found' });
    res.json(reviewed);
  });

  // 12. Custom SecOps Rule Policy Studio
  app.get('/api/custom-rules', (req, res) => {
    res.json(customRuleEngine.getRules());
  });

  app.post('/api/custom-rules', (req, res) => {
    const { name, description, pattern, toolTarget, action } = req.body;
    if (!name || !pattern) {
      return res.status(400).json({ error: 'name and pattern are required' });
    }
    const newRule = customRuleEngine.addRule({
      name,
      description: description || 'Custom enterprise policy rule',
      pattern,
      toolTarget: toolTarget || 'all',
      action: action || 'BLOCK',
      enabled: true,
    });
    res.json(newRule);
  });

  app.patch('/api/custom-rules/:id/toggle', (req, res) => {
    const { id } = req.params;
    const { enabled } = req.body;
    const updated = customRuleEngine.toggleRule(id, Boolean(enabled));
    if (!updated) return res.status(404).json({ error: 'Rule not found' });
    res.json(updated);
  });

  app.delete('/api/custom-rules/:id', (req, res) => {
    const { id } = req.params;
    const deleted = customRuleEngine.deleteRule(id);
    res.json({ success: deleted });
  });

  app.post('/api/custom-rules/test', (req, res) => {
    const { pattern, testString } = req.body;
    if (!pattern || testString === undefined) {
      return res.status(400).json({ error: 'pattern and testString are required' });
    }
    const testResult = customRuleEngine.testPattern(pattern, testString);
    res.json(testResult);
  });

  // 13. Automated Adversarial Red-Teaming Benchmark Runner
  app.post('/api/benchmark/run', async (req, res) => {
    try {
      const benchmarkResult = await runAdversarialBenchmark(currentPolicies);
      res.json(benchmarkResult);
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Benchmark run failed' });
    }
  });

  // Mount Vite or serve static assets
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`WATCHDOGS Security Gateway running at http://localhost:${PORT}`);
  });
}

startServer();
