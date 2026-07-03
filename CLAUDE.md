# Repository Workflow

## Branch strategy

- **`Quality-Assurance-Branch` is the release branch.** It represents the
  current, intended, deployable state of the site — not `main`.
- **`main` is periodically synchronised from QA**, historically via
  squash-merge PRs (e.g. PR #23, merged 1 July 2026). It is not
  continuously kept in sync.
- **Never assume `main` is the latest deployable code.** Always check
  `Quality-Assurance-Branch` first.
- **All PRs target `Quality-Assurance-Branch`** unless explicitly stated
  otherwise.

## Why `git compare main...Quality-Assurance-Branch` looks alarming (it usually isn't)

Because syncs to `main` happen via **squash merge**, `main` ends up with a
single new commit representing dozens or hundreds of QA commits. Squash
merges do not share commit ancestry with the original commits, so git's
`ahead_by`/`behind_by` count between the two branches will show QA as
hugely "ahead" even immediately after a sync — this reflects git's commit
graph mechanics, not a real backlog of unreleased work.

**Before treating a large `ahead_by` count as meaningful:** find the most
recent squash-merge commit on `main` (check `main`'s current deploy commit
message on Netlify, or the PR history) and only treat QA commits *after*
that point as genuinely unreleased.

## Standard edit → release flow

1. All edits happen in **StackBlitz**, on `Quality-Assurance-Branch`
   (confirm the branch before editing — StackBlitz has silently reverted
   to `main` in past sessions; see ANT-58).
2. Push → auto-deploys to **`stagingmf.netlify.app`** (QA Supabase:
   `plrtjpqltfhsnpmcjwox`).
3. Run the full Playwright suite against staging:
   ```bash
   TEST_BASE_URL=https://stagingmf.netlify.app TEST_ADMIN_PASS='<pass>' npx playwright test
   ```
4. Once green, open a PR from `Quality-Assurance-Branch` → `main`.
   Branch protection requires a PR even for the repo owner
   (`enforce_admins: true`) — no direct pushes to `main`.
5. Merging to `main` auto-deploys to **`movillefestival.com`** (live
   Supabase: `bsaohsmanqxyzwttlgrh`, live Stripe).

## Netlify site → branch → database mapping

| Netlify site | Branch | URL | Supabase |
|---|---|---|---|
| `stagingmf` | `Quality-Assurance-Branch` | stagingmf.netlify.app | QA (`plrtjpqltfhsnpmcjwox`) |
| `moville` | `main` | movillefestival.com | Live (`bsaohsmanqxyzwttlgrh`) |

## Before merging to `main`

- Full Playwright suite green on staging (not just the tests touched by
  the current change).
- Visual regression baselines reviewed and current (see the policy
  comment in `tests/visual.spec.ts`).
- Local environment verified in sync: `git status` clean, `npm ci` clean,
  Playwright/browser versions unchanged since last known-good run.
