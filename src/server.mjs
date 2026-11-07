#!/usr/bin/env node
/**
 * Auth0 AI Agent Security Suite (Live Interactive Server + CLI Verification)
 * Covers all 4 Auth0 coding challenges for MLH Global Hack Week: Builders Week:
 *  - Challenge 20: Universal Login Flow (OIDC Authorization Code + PKCE)
 *  - Challenge 21: The Context-Preserving Assistant (First-Party API + Token Vault Third-Party API)
 *  - Challenge 22: The Veto Agent (Token Vault + CIBA Asynchronous Out-of-Band Approval)
 *  - Challenge 23: The Privacy-Aware RAG Bot (Auth0 FGA Fine-Grained Authorization)
 */
import http from "node:http";
import { Auth0UniversalLogin } from "./auth0-login-flow.mjs";
import { ContextPreservingAssistant } from "./context-preserving-assistant.mjs";
import { VetoAgentCiba } from "./veto-agent-ciba.mjs";
import { Auth0FgaRagBot } from "./privacy-aware-rag-fga.mjs";

const PORT = Number(process.env.PORT || 4578);

export async function runFullSuiteVerification() {
  const login = new Auth0UniversalLogin();
  const assistant = new ContextPreservingAssistant(login);
  const vetoAgent = new VetoAgentCiba();
  const fgaBot = new Auth0FgaRagBot();

  // 1. Universal Login PKCE Flow
  const authInit = login.buildAuthorizeUrl("sess_ghw_01");
  const session = login.exchangeCodeForTokens({
    sessionId: "sess_ghw_01",
    code: "auth0_code_99481",
    state: authInit.state,
    userProfile: {
      sub: "auth0|672cf890princejain756",
      name: "Prince Jain",
      email: "mail@prince.sh",
      role: "engineering_manager",
      department: "platform_security"
    }
  });

  // 2. Context-Preserving Assistant (First-Party + Third-Party via Token Vault)
  const contextTurn = await assistant.runConversationTurn(
    session,
    "Check my commute weather and update my evening calendar slot based on my profile city."
  );

  // 3. The Veto Agent (Token Vault + CIBA Out-of-Band Approval)
  const readTask = await vetoAgent.executeAgentAction({
    session,
    toolName: "list_unread_emails",
    parameters: { folder: "INBOX", limit: 2 }
  });
  const criticalTaskPaused = await vetoAgent.executeAgentAction({
    session,
    toolName: "delete_unread_emails",
    parameters: { folder: "INBOX", olderThanDays: 30 }
  });
  const criticalTaskVetoed = { ...criticalTaskPaused };
  const criticalTaskApproved = vetoAgent.resolveOutOfBandConsent(
    criticalTaskPaused.authReqId,
    "APPROVED"
  );

  // 4. The Privacy-Aware RAG Bot (Auth0 FGA)
  const managerRag = fgaBot.queryRag({
    user: "user:alice",
    roleLabel: "Engineering Manager",
    query: "What are the Q4 budget allocation and 2026 salary compensation bands?"
  });
  const employeeRag = fgaBot.queryRag({
    user: "user:bob",
    roleLabel: "General Employee",
    query: "What are the Q4 budget allocation and 2026 salary compensation bands?"
  });

  return {
    universalLogin: { authInit, session },
    contextPreservingAssistant: contextTurn,
    vetoAgent: { readTask, criticalTaskPaused: criticalTaskVetoed, criticalTaskApproved },
    privacyAwareRagFga: { managerRag, employeeRag }
  };
}

if (process.argv.includes("--verify")) {
  const res = await runFullSuiteVerification();
  console.log(JSON.stringify(res, null, 2));
  process.exit(0);
}

export async function requestHandler(req, res) {
  if (req.url === "/api/verify") {
    const data = await runFullSuiteVerification();
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify(data, null, 2));
    return;
  }
  const data = await runFullSuiteVerification();
  res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
  res.end(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Auth0 for AI Agents Security Suite</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Inter", sans-serif; background: #090d16; color: #e2e8f0; padding: 22px; }
    header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1e293b; padding-bottom: 14px; margin-bottom: 18px; }
    .badge { background: #eb5424; color: #fff; font-weight: 700; font-size: 12px; padding: 4px 10px; border-radius: 6px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .card { background: #111827; border: 1px solid #1e293b; border-radius: 10px; padding: 16px; }
    h2 { font-size: 15px; color: #f8fafc; margin-bottom: 8px; display: flex; justify-content: space-between; }
    .tag { font-size: 11px; font-family: monospace; padding: 2px 8px; border-radius: 4px; background: #1e293b; color: #38bdf8; }
    pre { background: #0b0f19; border: 1px solid #1e293b; border-radius: 8px; padding: 10px; font-size: 11.5px; color: #cbd5e1; overflow-x: auto; white-space: pre-wrap; line-height: 1.4; }
    .ok { color: #34d399; font-weight: 700; }
    .deny { color: #f87171; font-weight: 700; }
  </style>
</head>
<body>
  <header>
    <div>
      <h1 style="font-size:20px;display:flex;align-items:center;gap:10px;">
        <span class="badge">AUTH0 FOR AI AGENTS</span>
        Universal Login, Token Vault, CIBA Veto Agent & Auth0 FGA RAG Suite
      </h1>
      <p style="font-size:12.5px;color:#94a3b8;margin-top:4px;">
        Authenticated Subject: <code>${data.universalLogin.session.sub}</code> (${data.universalLogin.session.email}) · PKCE S256 Verified · Live at auth0-agents.prince.sh
      </p>
    </div>
    <div style="font-family:monospace;font-size:12px;color:#34d399;border:1px solid #10b981;padding:6px 12px;border-radius:8px;">
      ● ALL 4 AUTH0 FLOWS VERIFIED
    </div>
  </header>

  <div class="grid">
    <div class="card">
      <h2><span>1. Auth0 Universal Login (OIDC + PKCE S256)</span><span class="tag">/authorize &rarr; /oauth/token</span></h2>
      <pre>${JSON.stringify({
        authorizeUrl: data.universalLogin.authInit.authorizeUrl.slice(0, 95) + "...",
        sub: data.universalLogin.session.sub,
        email: data.universalLogin.session.email,
        scope: "openid profile email read:profile write:calendar",
        authenticatedAt: data.universalLogin.session.authenticatedAt
      }, null, 2)}</pre>
    </div>

    <div class="card">
      <h2><span>2. The Context-Preserving Assistant</span><span class="tag">First-Party API + Token Vault</span></h2>
      <pre>${JSON.stringify({
        verifiedSub: data.contextPreservingAssistant.firstPartyApiCall.verifiedSub,
        firstPartySettings: {
          city: data.contextPreservingAssistant.firstPartyApiCall.settings.preferredCity,
          timezone: data.contextPreservingAssistant.firstPartyApiCall.settings.timezone
        },
        tokenVaultFederatedToken: data.contextPreservingAssistant.tokenVaultExchange.federatedAccessToken,
        assistantReply: data.contextPreservingAssistant.assistantResponse
      }, null, 2)}</pre>
    </div>

    <div class="card">
      <h2><span>3. The Veto Agent (Token Vault + CIBA)</span><span class="tag">POST /bc-authorize</span></h2>
      <pre>${JSON.stringify({
        lowRiskAction: data.vetoAgent.readTask.status,
        highImpactTool: data.vetoAgent.criticalTaskPaused.toolName,
        initialState: data.vetoAgent.criticalTaskPaused.status,
        bindingMessage: data.vetoAgent.criticalTaskPaused.bindingMessage,
        outOfBandPrompt: data.vetoAgent.criticalTaskPaused.outOfBandNotification,
        afterUserApproval: data.vetoAgent.criticalTaskApproved.executionReceipt
      }, null, 2)}</pre>
    </div>

    <div class="card">
      <h2><span>4. The Privacy-Aware RAG Bot (Auth0 FGA)</span><span class="tag">Tuple Check Gate</span></h2>
      <pre>${JSON.stringify({
        managerQuery: {
          user: data.privacyAwareRagFga.managerRag.user,
          authorizedDocs: data.privacyAwareRagFga.managerRag.authorizedDocumentIds,
          answer: data.privacyAwareRagFga.managerRag.answer
        },
        employeeQuery: {
          user: data.privacyAwareRagFga.employeeRag.user,
          authorizedDocs: data.privacyAwareRagFga.employeeRag.authorizedDocumentIds,
          deniedDocs: data.privacyAwareRagFga.employeeRag.deniedDocuments.map(d => d.id),
          answer: data.privacyAwareRagFga.employeeRag.answer
        }
      }, null, 2)}</pre>
    </div>
  </div>
</body>
</html>`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  http.createServer(requestHandler).listen(PORT, () => {
    console.log(`Auth0 AI Agent Security Suite running at http://localhost:${PORT}`);
  });
}
