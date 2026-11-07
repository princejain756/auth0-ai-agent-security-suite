import test from "node:test";
import assert from "node:assert/strict";
import { verifyAgentToolScopes, generateDpopThumbprint } from "../src/token-vault-scope-validator.mjs";

test("Token Vault scope validator enforces least-privilege OAuth2 scopes", () => {
  const allowed = verifyAgentToolScopes(["read:calendar", "read:tasks"], ["read:calendar"]);
  assert.equal(allowed.authorized, true);
  assert.equal(allowed.missingScopes.length, 0);

  const denied = verifyAgentToolScopes(["read:calendar"], ["read:calendar", "write:wire_transfer"]);
  assert.equal(denied.authorized, false);
  assert.deepEqual(denied.missingScopes, ["write:wire_transfer"]);
});

test("DPoP thumbprint generator produces deterministic RFC 9449 jkt binding", () => {
  const dpop1 = generateDpopThumbprint("agent-session-key-01");
  const dpop2 = generateDpopThumbprint("agent-session-key-01");
  assert.equal(dpop1.jkt, dpop2.jkt);
  assert.equal(dpop1.typ, "dpop+jwt");
});
