# Security remediation backlog

Static review of the repository at commit `ca998ab1a700eac77b82a9abeeed14640f2e0a5e` (2026-11-10). These are review findings and recommended work items, not results from a live penetration test. Check each item against current production configuration before changing access behavior.

## P0 — Enforce authorization and integrity in Firestore

- [ ] **Restrict user profile updates.** In `firestore.rules`, owners can currently update any fields in their own `/users/{userId}` document. Any signed-in user can also change selected fields such as `karmaScore` and `trustTier` on another user's document. Permit only narrowly defined owner-editable profile fields from clients; move karma, trust tiers, and counters to trusted server-side code.
- [ ] **Restrict listing updates and state transitions.** A listing owner can currently change any fields. Any signed-in user can change selected fields including `status`, `selectedRecipientId`, and `handshakePin`. Enforce caller role, allowed changed fields, and valid state transitions; do not allow clients to set or change security-sensitive pickup secrets broadly.
- [ ] **Protect the karma transaction ledger.** Any signed-in user can create a `karma_transactions` entry with their own `awardedBy` value and arbitrary `points`/`userId`. Make ledger writes server-only (for example, through a trusted backend/Cloud Function) and validate the exchange before awarding points.
- [ ] **Test rules with the Firebase Emulator.** Add tests for unauthenticated, anonymous, unrelated authenticated, owner, giver, recipient, and authorized server cases. Include attempts to alter another user's score, take over listings, forge a pickup handshake, and create false ledger entries.

## P1 — Protect personal and transaction data

- [ ] **Minimize Firestore reads.** Current signed-in users can `get` and `list` all user documents and listings. Identify fields that are public versus private, and store sensitive fields (such as exact pickup information or handshake secrets) separately with participant-only access. Firestore rules do not redact individual fields from a readable document.
- [ ] **Review data minimization and retention.** Confirm profile, location, activity, and exchange data are necessary; document retention/deletion expectations and ensure logs do not unnecessarily retain personal data.

## P1 — Limit abuse of AI API endpoints

- [ ] **Add authentication/authorization where appropriate.** The `/api/gemini/*` routes in `server.ts` currently accept requests without checking a Firebase ID token or other caller identity. Decide which endpoints are intentionally public and protect the rest.
- [ ] **Add rate limits, quotas, and cost controls.** Apply per-IP and, when authenticated, per-user limits; cap concurrent and expensive video generation; set provider budget alerts and monitor usage.
- [ ] **Validate request bodies and lengths.** Define schemas and strict size/length limits for `messages`, `query`, `prompt`, `textPrompt`, and related values. Reject malformed or oversized input before calling the provider.
- [ ] **Avoid returning raw provider errors.** Return generic client errors with a request ID; keep detailed errors in access-controlled server logs and avoid logging user prompts or personal data unnecessarily.

## P2 — Clarify guest identity and account trust

- [ ] **Constrain anonymous accounts.** Anonymous Firebase authentication is not proof of a real-world identity. Decide which actions guests may perform and require account linking or stronger verification before trust-sensitive actions (for example, vouches or reputation-affecting exchanges). Enforce this in rules/backend, not only in the UI.
- [ ] **Review Firebase configuration and project settings.** The web API key in `firebase-applet-config.json` is client configuration, not a server secret. Still restrict its use where supported, configure authorized domains, and rely on restrictive Firebase rules rather than key secrecy.

## P2 — Add baseline server hardening

- [ ] **Set security headers and a deployment policy.** Add appropriate headers (for example, Helmet), configure allowed origins if browser CORS is needed, and verify production proxy/TLS settings. CORS is not a substitute for authentication.
- [ ] **Review request parsing and operational limits.** Revisit the 10 MB JSON body limit, set request timeouts and concurrency limits, and ensure the deployment platform has appropriate resource limits.
- [ ] **Review logging in `src/firebase/config.ts`.** Firestore errors currently serialize user ID, email, verification state, and other auth metadata into console logs. Remove or minimize personal data and avoid showing raw internal errors to end users.

## Suggested order

1. Fix and test Firestore authorization/integrity rules.
2. Protect and rate-limit AI endpoints; add validation and safe error responses.
3. Separate public profile/listing data from private pickup and identity data.
4. Define guest permissions, then add server/header/logging hardening.

## References reviewed

- `firestore.rules`
- `server.ts`
- `src/firebase/config.ts`
- `firebase-applet-config.json`
- `package.json`
