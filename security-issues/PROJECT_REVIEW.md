# Additional project-wide security review findings

Reviewed repository tree at commit `48e0d41a14c2e6746397ab3b77dc861bf0cc2e6d` (2026-11-10), including application state/flows, UI components, services, Firebase configuration/rules, server, and project metadata. This is a static code review, not a live penetration test or a review of deployed Firebase/Cloud Run settings. Findings below supplement `security-issues/README.md` and should be verified against the intended demo/production boundary.

## P0 — Handshake completion can be forged in the client

- [ ] **Move exchange completion and PIN validation to trusted code.** `src/components/PickupCoordinatorModal.tsx` displays a hard-coded fallback PIN (`739-241`), exposes the PIN in the UI and calendar export, accepts the literal `DEMO`, and offers a one-tap completion path that does not verify a PIN. `src/App.tsx`'s `handleConfirmHandshake` ignores its `pin` argument and writes `FULFILLED` without checking authentication identity, giver/recipient participation, selected recipient, prior status, or a valid single-use code. The success state and karma changes are also applied in client state before any trusted validation. Implement an authenticated server/Cloud Function transaction that verifies the caller is a participant, validates a short-lived one-time secret without revealing it to unauthorized users, enforces an allowed state transition, and atomically records completion/rewards. Remove demo bypasses and the fixed fallback from production.
- [ ] **Limit access to pickup information and PINs.** The pickup UI defaults to exposing exact coordinates/location details to any viewer who can open the modal. App notification navigation can open pickup coordination when a listing has status `GIVER_SELECTED` even if the viewer is not the selected recipient. Ensure the UI checks are only convenience; enforce participant-only reads server-side and separate secrets/private pickup details from public listing documents.

## P1 — Sensitive location and handshake data are shipped in public client assets

- [ ] **Remove real-looking private location/handshake examples from production bundles.** `src/data/seedData.ts` includes exact coordinates, street-address pickup notes, claim pitches, identity/profile data, and a selected listing's PIN (`739-241`). The app imports this data into the client bundle. Regardless of whether the sample identities are fictional, these examples demonstrate and expose precisely the private data the product says it protects; replace with clearly synthetic non-sensitive data and never ship actual user records in seed assets.
- [ ] **Do not place the PIN or private location in calendar exports.** `src/components/PickupCoordinatorModal.tsx` includes the handshake PIN and pickup note/location in generated `.ics` and Google Calendar URLs. Calendar files/URLs may be stored, synced, forwarded, or visible in browser/provider history. Exclude the secret and minimize location detail; reveal required pickup information through a participant-authorized channel with appropriate expiry.

## P1 — Local persona selection is not bound to Firebase identity

- [ ] **Remove the production persona switcher and bind every operation to verified auth.** `src/components/TopNav.tsx` lets users choose any `allUsers` persona; `src/App.tsx` initializes `currentUserId` as `user_elena` and many workflows use `currentUser.id` for ownership, claims, vouches, and rewards, while Firebase authentication is tracked separately. A client-selected profile is not proof of identity. Derive the active actor only from `auth.currentUser.uid`, fetch the matching profile, and reject privileged actions until authenticated/authorized. Keep persona switching only in an isolated demo mode with no production writes.

## P1 — Anti-hoarding and business rules are client-only

- [ ] **Enforce eligibility, uniqueness, and limits on the backend.** Claim caps and cooldown checks in `src/services/antiHoardingEngine.ts` are client-side only. `src/App.tsx` increments local counters and performs full-array listing updates; there is no server-side validation in those flows. Concurrent requests or a modified client can bypass limits, submit repeated claims/offers, forge requester/helper names and scores, or race selection/completion. Recompute from trusted data and enforce deduplication, limits, and transitions in Firestore rules/server transactions.

## P1 — Offline draft “sync” currently discards rather than uploads drafts

- [ ] **Implement real offline synchronization and conflict handling.** In `src/App.tsx`, reconnecting reads local drafts and deletes them via `removeOfflineDraft` while showing “Synced” but does not upload them to Firestore. This creates data loss and a false state to users. Authenticate and validate queued operations, persist until server acknowledgment, use idempotency keys, handle conflicts/rejections, and only then remove drafts. Avoid persisting private addresses or PINs in browser storage unless necessary and protected.

## P2 — User-generated text is not bounded consistently before persistence/use

- [ ] **Add client and server-side field size/type validation for listing, claim, offer, vouch, and karma text.** The create-listing UI has no `maxLength` on several fields, and pitch/offer/vouch/gratitude inputs likewise lack visible limits. Firestore rules validate some listing title/description lengths on create, but do not validate nested claim/offer fields or enforce equivalent constraints on updates. Add schema validation at trusted boundaries, limit nested arrays and text sizes, validate URLs/media, and reject malformed values. React text rendering is escaped by default in reviewed components; no `dangerouslySetInnerHTML` use was identified in the inspected source.

## P2 — Image upload/compression needs resource and privacy controls

- [ ] **Validate uploaded images before decoding and bound memory use.** `src/services/offlineSync.ts` reads any selected file fully as a data URL and decodes it into an image without checking MIME type, file size, or image dimensions before allocation. Set strict upload size/type/dimension limits, handle decompression-bomb-like dimensions safely, revoke object URLs if used, and strip EXIF metadata (which may contain GPS/location) before any future upload/sharing. Current reviewed flow stores the data URL in local state; verify whether/how image data is later persisted.

## P2 — External image URLs and generated media should be constrained

- [ ] **Restrict untrusted media sources when user-controlled URLs are introduced.** Components render image/video URLs from listing/user objects. Current seed/sample URLs are fixed, but future persisted or user-provided URLs should use an allowlist or controlled media storage, validate schemes/hosts, and avoid sending referrer or private query data to third parties. Do not treat arbitrary remote media as trusted.

## Review notes and verification limits

- The inspected React components render user text as text nodes; no direct HTML injection sink was found in the files inspected. Continue using safe React rendering and review any future markdown/HTML rendering separately.
- `firebase-applet-config.json` contains browser Firebase configuration, not a server-side secret. Verify Firebase authorized domains, API restrictions, authentication providers, App Check, database configuration, and deployed rules in the actual Firebase project; these cannot be confirmed from repository source alone.
- Dependency versions are declared in `package.json` and `bun.lock`; this static review did not validate advisories against a current vulnerability database. Run an up-to-date dependency audit and keep a lockfile-based update process.
- The full source tree was enumerated and key application, service, UI, Firebase, and server files were reviewed. This does not establish that every runtime path, deployment configuration, or third-party integration is safe.

## Suggested next steps

1. Treat client-side handshake completion and private data exposure as the immediate remediation priority.
2. Bind all writes and trust/claim state changes to authenticated identities and trusted server-side validation.
3. Remove production persona/demo behavior and sensitive sample records.
4. Fix offline synchronization to avoid silent draft loss.
5. Add automated Firestore rules and server authorization tests, then run dependency and deployment-configuration audits.
