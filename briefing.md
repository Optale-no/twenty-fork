---
project: twenty-fork-source
target: packages/twenty-front + packages/twenty-ui + packages/twenty-emails (source-level rebrand)
ticket: OPT-1021
phase: A-v2 (source-level rebrand continuation — addresses code-reviewer FAIL 2026-04-19T02:13)
prerequisite: Phase A-v1 staged (this folder). Phase B (public repo push + GHCR build + VPS2 deploy) is Thor-manual and NOT in scope for this pass.
---

## Eval criteria
- [ ] Solar Eclipse v3 palette applied AT SOURCE in `packages/twenty-ui/src/theme/constants/*.ts` (ThemeLight.ts + ThemeDark.ts). Overlay CSS retained only for cases the source theme cannot express.
- [ ] Button component uses `--accent-gradient` from source theme tokens, not via `!important` global selectors. See `packages/twenty-ui/src/input/button/components/Button/Button.tsx` — the computed CSS vars path (lines ~486–509) is the right hook.
- [ ] `packages/twenty-front/src/locales/no-NO.po` — all user-visible `\bTwenty\b` references replaced with `Optale CRM` (Lingui source catalog). Regenerate compiled catalogs afterward.
- [ ] `packages/twenty-emails/src/locales/no-NO.po` — same, email Norwegian catalog.
- [ ] `packages/twenty-front/src/modules/ui/navigation/navigation-drawer/constants/DefaultWorkspaceLogo.ts` — replace `twenty-logo.png` reference with Optale eclipse glyph.
- [ ] `packages/twenty-emails/src/constants/DefaultWorkspaceLogo.ts` — same for emails.
- [ ] `packages/twenty-front/public/manifest.json` — PWA icons regenerated/replaced with Optale eclipse set (multiple sizes per PWA manifest spec).
- [ ] `packages/twenty-front/index.html:12` — iOS touch icon replaced (currently upstream).
- [ ] `packages/twenty-front/public/optale-social-card.png` — 1200×630 OG card present (currently metadata points at a missing file).
- [ ] Pre-hydration shell defaults to DARK void background (`#0a0a0a` or `var(--void-0)`). Fix `packages/twenty-front/index.html:2` (currently `class="light"`) and the light media block at lines 77–80 so initial paint never flashes `#f1f1f1` or `#ffffff`.
- [ ] Email default URLs: replace hardcoded `app.twenty.com` with `https://crm.optale.no` (or a runtime env var with that default) in `clean-suspended-workspace.email.tsx:49`, `password-update-notify.email.tsx:56`, `send-email-verification-link.email.tsx:46`, and any others grep surfaces.
- [ ] No regression in Phase A deliverables: `UPSTREAM_VERSION`, `REBRAND.md`, `DELEGATION.md`, `optale-brand.css` overlay, favicon, `index.html` metadata, `manifest.json` name/short_name remain valid.
- [ ] Final grep: zero production-surface `\bTwenty\b` in `packages/twenty-front/src/**`, `packages/twenty-front/public/**`, `packages/twenty-emails/src/**` excluding tests, stories, auto-generated locale compile outputs, and the deliberate AGPL-attribution aria-label in `Footer.tsx`.

## Spec
Continuation of OPT-1021 Phase A. Prior developer-gpt pass staged an additive overlay (`optale-brand.css` + `!important`) but the code reviewer correctly required edits at source theme level because the Button component passes only `className` + computed CSS vars, so global `data-variant`/`.primary` selectors never match runtime-generated emotion-css class names.

This pass moves the palette + gradient into the source theme constants and plumbs them through the button helpers, then closes the locale / logo / PWA-icon / social-card / dark-flash / email-default gaps that the reviewer flagged.

Font stack decision: **keep** Plus Jakarta Sans + Instrument Serif + IBM Plex Mono (this is the current Optale trinity per `AI-OS/Personal/Identity/voice-profile-general.md` and the ticket description — the reviewer's Sentient/Geist/JetBrains checklist is from an older brand spec). Do NOT change fonts; the reviewer's font note is superseded by the OPT-1021 ticket description.

## Tools
- Node 22 / Yarn (repo uses Yarn Berry per `.yarn/` folder). Do NOT run `yarn install` unless required — `node_modules` is absent and a fresh install in sandbox takes ~20 min and is usually not needed for text/theme edits.
- Use `rg` / `grep` for locating `\bTwenty\b` occurrences.
- Per `feedback_rebrand_word_boundary_sed.md`: word-boundary regex, case-sensitive, skip code identifiers. Emit `.bak` backups under `.rebrand-backups/`.
- `git status --short` and `git diff --stat` between passes.
- For PWA icon regeneration: source is `/home/thor/AI-OS/Business/Soul/assets/optale-favicon.svg` (eclipse glyph). Sizes needed (from manifest): 192×192, 512×512, plus iOS touch icon 180×180. Use `rsvg-convert` or equivalent; do not introduce a new image-gen pipeline.
- For social card: if an approved OG card PNG exists in `AI-OS/Business/Soul/assets/`, copy it. If not, flag as blocked and proceed with the rest.

## Scope boundaries
- **IN scope for this pass:** the eval-criteria checklist above. Source-level theme edits. Locale catalog fixes (Norwegian). Default workspace logos. PWA/touch icons. Social card file. Dark-flash fix. Email default-URL fixes.
- **OUT of scope (Phase B — Thor-manual):** Pushing to `github.com/Optale-no/twenty-fork`. Building the Docker image. Publishing to `ghcr.io/optale-no/twenty-fork`. Updating the VPS2 `docker-compose.yml`. SSH-to-`ops`. Playwright screenshots of `crm.optale.no`. These require `gh auth`, Docker socket, SSH keys, and Authelia credentials that the paperclip sandbox does not have. `DELEGATION.md` already documents the copy-paste commands for Thor to run manually.
- Do NOT rename code identifiers containing "Twenty" as a substring (e.g. `TwentyWorkspace`, `IconTwentyStarFilled`, `useTwentyXxx`). Word-boundary regex preserves these per standing feedback memory.
- Do NOT touch Storybook `__stories__/`, test `__tests__/`, or generated locale `locales/generated/` files — not user-visible on `crm.optale.no`.
- Do NOT add dependencies. No new packages. No design-token library. Use what's already in the repo.
- Do NOT attempt `yarn build` or `docker build` — not required for the deliverable, and `node_modules` install is expensive/not-needed.

## References
- Project root: `/home/thor/projects/twenty-fork-source`
- Phase A rebrand report: `/home/thor/projects/twenty-fork-source/REBRAND.md`
- Phase B delegation (Thor-manual): `/home/thor/projects/twenty-fork-source/DELEGATION.md`
- Code reviewer FAIL (2026-04-19T02:13): comment `3489af01-a467-4694-8307-699f94ea06f1` on [OPT-1021](/OPT/issues/OPT-1021). Contains line-numbered pointers for every flag in the eval criteria.
- Upstream commit: `1f3defa7b35530e1584f0267a49fcfd9373954a6` (recorded in `UPSTREAM_VERSION`).
- Optale eclipse favicon (canonical): `/home/thor/AI-OS/Business/Soul/assets/optale-favicon.svg`
- Solar Eclipse v3 palette / accent gradient: documented in the ticket description of [OPT-1021](/OPT/issues/OPT-1021) and in `packages/twenty-front/src/optale-brand.css` (current overlay — reuse the values).
- Standing feedback memories: `feedback_rebrand_word_boundary_sed.md` (word-boundary regex), `feedback_paperclip_no_docker_or_env.md` (sandbox capabilities).
- Prior comparable fork: `github.com/Optale-no/trace` (Langfuse fork, same "source rebrand + public repo + GHCR + VPS deploy" shape).

## Handoff expected
PATCH to `in_review` with a work-product comment summarizing source-level changes, locale diff counts, icon-set regeneration status, and a final `\bTwenty\b` grep run. Do NOT self-close — the reviewer re-runs, then Thor picks up Phase B manually.
