---
ticket: OPT-1021
phase: B (fork creation + GHCR build + VPS2 deploy — needs gh-auth + docker + SSH)
generated: 2026-04-19
prerequisite: Phase A complete (this folder is the staged source)
delegate_to: agent or human with gh auth, docker access, and SSH-to-VPS2
---

# Phase B — what paperclip sandbox cannot do

This file describes the steps required to ship the rebranded fork live to `crm.optale.no`. None of these can run from the paperclip sandbox (per `feedback_paperclip_no_docker_or_env.md` in vault memory): no `gh auth`, no docker socket access, no SSH key for the `ops` host. The trace fork (`Optale-no/trace`) followed the same delegation pattern.

## Step 1 — Create the public GitHub fork repo

```bash
cd /home/thor/projects/twenty-fork-source

# Auth as a user with permission to create repos in Optale-no org
gh auth login

# Create the public repo (AGPL-3.0 preserved). Use a description that makes the
# fork relationship explicit for AGPL transparency.
gh repo create Optale-no/twenty-fork \
  --public \
  --description "Optale's rebranded fork of Twenty CRM (AGPL-3.0). Source for crm.optale.no." \
  --source . \
  --remote origin \
  --push

# Verify
gh repo view Optale-no/twenty-fork
```

Notes:
- AGPL-3.0 requires source disclosure if we serve modified code to external users. Since Authelia gates access, our staff are not "external" — but TV 2 Invest team members and SubCo leads who log in MIGHT be. Public-from-day-one is the safe default. Match the precedent.
- Do NOT set this up as a "GitHub fork" relationship via `gh repo fork twentyhq/twenty`. Keep upstream as a remote only — same pattern as Optale-no/trace (gives commercial flexibility per `project_trace_licensing_path_1_5.md`).

## Step 2 — Add upstream remote + first push

The clone in this folder is `--depth 1`. Phase B should re-clone with full history before pushing if you want to preserve the upstream's commit history. OR push the squashed single-commit version (cheaper, smaller). Trace did the latter.

```bash
git remote add upstream https://github.com/twentyhq/twenty.git
git fetch upstream
# Decide: push full history (slow + 1GB+) OR squash. Trace squashed.
```

## Step 3 — Add CI build workflow

Copy `.github/workflows/build.yml` pattern from `Optale-no/trace`:
- Trigger on push to main + manual dispatch
- Two jobs: `mit-compliance` (or AGPL equivalent — verify all `@license Enterprise`-marked files are not modified by us; Twenty has commercial-licensed files mixed in, see `LICENSE` file at the root)
- `build` job: `docker buildx build` for amd64+arm64, push to `ghcr.io/optale-no/twenty-fork:v2026-04-19` + `:latest`
- Tag format suggested: `v<upstream-version>-optale-<YYYY-MM-DD>` matching the trace convention

The base Dockerfile lives at `packages/twenty-docker/twenty/Dockerfile` in the upstream. Verify it builds the front + server in a single image (Twenty is a monorepo).

## Step 4 — First build

After the workflow lands and pushes the first image:

```bash
# As VPS2 docker user
docker pull ghcr.io/optale-no/twenty-fork:v2026-04-19
docker pull ghcr.io/optale-no/twenty-fork:latest
```

GHCR auth: `docker login ghcr.io` with a PAT scoped to `read:packages` (or use `gh auth token` short-term, swap later — same caveat as trace).

## Step 5 — VPS2 deploy ticket

File a `[DEPLOY]` Paperclip ticket assigned to `deploy-runner` (`fb9ba544-833c-4eb7-b9ce-5eaa4e5c67a8`) with an `apply.sh` that:

1. Updates `/home/thor/projects/twenty-deploy/docker-compose.yml` on VPS2 (via `ssh ops`):
   - Replace upstream `twenty/twenty:latest` (or whatever pin) with `ghcr.io/optale-no/twenty-fork:v2026-04-19`
   - REMOVE the old volume mounts pointing at `optale-theme.css` / `index.html` / `optale-favicon.svg` (those were the OPT-1009 overlay approach — now obsolete because the rebrand is baked into the image)
2. `docker compose pull twenty-server`
3. `docker compose up -d twenty-server`
4. Verify inside container:
   ```
   docker exec twenty-server head -50 /app/packages/twenty-server/dist/front/index.html | grep -q 'Optale CRM' && echo OK
   docker exec twenty-server test -f /app/packages/twenty-server/dist/front/optale-favicon.svg && echo OK
   docker exec twenty-server test -f /app/packages/twenty-server/dist/front/assets/optale-brand-*.css && echo OK
   ```
5. External chain check: `curl -sI https://crm.optale.no/` returns 302 to auth.optale.no (Authelia chain intact)

## Step 6 — Visual verification (Playwright)

Per the OPT-1021 ticket "WP links" section, run Playwright (or any headless browser) against `https://crm.optale.no` AFTER Authelia login and capture screenshots of:
- Login page (Authelia → Twenty sign-in handoff)
- Workspace dashboard
- Sidebar navigation
- Record list page (any object)
- Record detail page (drill into any record)
- Settings page
- User profile dropdown
- Logout flow

Save under `/home/thor/projects/twenty-fork-source/screenshots-live/` and attach to the OPT-1021 work product.

## Open questions for human review

1. **Brand label:** I used "Optale CRM" everywhere. The ticket says "Optale branding" without a specific label. Confirm "Optale CRM" is the chosen product name, or supply alternative ("Optale", "Optale Customers", etc.) before Phase B builds.
2. **Social card:** Need a 1200×630 PNG generated from brand mark + tagline. Currently a placeholder URL — OG previews will 404 until it ships.
3. **PWA icons:** Manifest still references upstream Twenty PNG icon set. Should be regenerated from eclipse SVG at all sizes. Not blocking for v1 ship.
4. **Email "from" address:** Footer credits Optale AS / org.nr / Bergen. The actual SMTP-from header is configured server-side via env vars (`EMAIL_FROM_ADDRESS`) — ensure that's set to `noreply@optale.no` or similar in VPS2's `.env` before sending real transactional emails.

## Upstream sync cadence (after deployment)

Per OPT-1021: weekly upstream rebase + re-run the rebrand sed. Because we used an additive `optale-brand.css` overlay (not editing upstream theme constants), the rebase should be conflict-free unless upstream renames `index.html`, `manifest.json`, or moves the theme-import line in `index.tsx`. The rebrand sed pass against new strings can be automated:

```bash
# After rebase
sed -i 's/\bTwenty\b/Optale CRM/g' \
  packages/twenty-front/src/pages/**/*.tsx \
  packages/twenty-emails/src/**/*.tsx
# (then audit + rebuild)
```

Add this as a GitHub Action that runs on a weekly cron + opens a PR.

## Cancellation note

OPT-1009 (original surface fix via docker-compose overlay) and its delegate ticket OPT-1018 are SUPERSEDED. Comments posted to both, OPT-1009 already moved to `cancelled` status, OPT-1018 should be cancelled by deploy-runner before they execute the now-obsolete `apply.sh`.
