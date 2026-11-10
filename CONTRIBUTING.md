# Contributing to KijijiShare

Thanks for helping improve KijijiShare. Contributions can include fixing an issue, improving tests or documentation, reporting a bug, or reviewing a pull request.

## Choose an issue

1. Browse [open issues](https://github.com/Christian3788/kijijiShare/issues).
2. Read the issue description and acceptance criteria. For security work, review the [security remediation backlog](https://github.com/Christian3788/kijijiShare/tree/main/security-issues) as context.
3. Comment on the issue to say what you plan to do and coordinate with the maintainer before starting substantial or overlapping work. Ask questions if the expected behavior or scope is unclear.
4. If the issue is not assigned to you, ask before assuming ownership. The maintainer can assign it or split large work into smaller issues.

## Set up the project

- Install Node.js 20 or later and npm (or Bun).
- Clone the repository and install dependencies:

  ```bash
  git clone https://github.com/Christian3788/kijijiShare.git
  cd kijijiShare
  npm install
  ```

- Copy `.env.example` to `.env` and add your own development API key if you need AI features. Never commit `.env`, API keys, service-account credentials, real user records, or private pickup details.
- Run the app locally with `npm run dev`.

## Make a change

1. Create a focused branch from the current default branch, for example `fix/issue-1-ai-api-limits`.
2. Keep the change scoped to the issue and avoid bundling unrelated refactors.
3. Add or update tests for behavior you change. For Firestore rules or authorization changes, include tests for both permitted and denied access where feasible.
4. Run the available checks before opening a PR:

   ```bash
   npm run lint
   npm run build
   ```

5. Review your diff for secrets, personal information, exact household coordinates, pickup notes, and generated files before pushing.

## Open a pull request

- Push your branch (or submit a pull request from your fork if you do not have write access).
- Describe what changed, why, how you tested it, and any limitations or follow-up work.
- Link the issue in the PR description, for example: `Closes #1`.
- Keep the PR focused and respond to review feedback. Do not merge your own change unless the maintainer has asked you to.

## Security reports

Please do not publish exploitable details, credentials, personal data, or sensitive vulnerability information in a public issue. Contact the repository owner privately through GitHub to coordinate a responsible report. For routine security hardening tasks already tracked publicly, discuss the issue first and avoid testing against production systems or real users without explicit authorization.

## Good first contributions

- Improve setup instructions or clarify project behavior.
- Add tests for a specific existing issue.
- Fix a small, well-scoped bug with a regression test.
- Improve accessibility or input validation.
- Review an open pull request and provide actionable feedback.
