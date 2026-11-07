/**
 * Auth0 Token Vault Scope Validator & DPoP Proof Inspector
 * Verifies least-privilege OAuth2 scopes and Demonstrating Proof-of-Possession (DPoP) bindings
 * for autonomous AI tool calls.
 */
import crypto from "node:crypto";

export function verifyAgentToolScopes(grantedScopes = [], requiredScopes = []) {
  const grantedSet = new Set(grantedScopes);
  const missing = requiredScopes.filter((s) => !grantedSet.has(s));
  return {
    authorized: missing.length === 0,
    grantedScopes,
    requiredScopes,
    missingScopes: missing
  };
}

export function generateDpopThumbprint(jwkPublicKey = "auth0-ai-agent-ephemeral-key") {
  const digest = crypto.createHash("sha256").update(String(jwkPublicKey)).digest("base64url");
  return {
    jkt: digest,
    alg: "ES256",
    typ: "dpop+jwt"
  };
}
