# Auth0 for AI Agents Security Suite

Built for **MLH Global Hack Week: Builders Week** Auth0 challenges:

1. **Set up your first Auth0 log-in flow (`src/auth0-login-flow.mjs`)**: OAuth 2.0 / OIDC Authorization Code + PKCE (`S256`) Universal Login flow with state validation and session token verification.
2. **The Context-Preserving Assistant (`src/context-preserving-assistant.mjs`)**: Full-stack personal assistant that authenticates the user with Universal Login, verifies the user's `sub` and bearer token against a First-Party User Settings API (`/api/v1/user/settings`), and exchanges the token via **Auth0 Token Vault** (`urn:auth0:params:oauth:token-type:federated-connection-access-token`) to query a Third-Party Weather and Calendar API within delegated permissions.
3. **The Veto Agent (`src/veto-agent-ciba.mjs`)**: AI agent integrated with third-party workspace APIs via **Auth0 Token Vault** and **Client-Initiated Backchannel Authentication (CIBA)** (`/bc-authorize`). Read-only actions execute immediately, while sensitive commands (`delete_unread_emails`, `schedule_ceo_meeting`) halt execution and trigger an out-of-band push/email consent request with a binding code.
4. **The Privacy-Aware RAG Bot (`src/privacy-aware-rag-fga.mjs`)**: Internal knowledge assistant enforcing **Auth0 FGA (Fine-Grained Authorization)** relationship tuples (`can_view`) on retrieved documents prior to LLM synthesis. Proves that `user:alice` (Engineering Manager) can retrieve `document:budget_Q4` and `document:salary_bands_2026`, while `user:bob` (General Employee) is denied access to confidential salary and budget documents.

## Quick Start

```bash
# Verify all 4 Auth0 flows in the terminal
npm test

# Launch the interactive Auth0 Security Suite dashboard on http://localhost:4578
npm start
```
