---
ticket: OPT-1021
phase: A (source rebrand, paperclip-sandbox-feasible portion)
generated: 2026-04-19
upstream_commit: 1f3defa7b35530e1584f0267a49fcfd9373954a6
fork_target: github.com/Optale-no/twenty-fork (public, AGPL-3.0)
license: AGPL-3.0 (preserved)
---

# Twenty fork — rebrand pass (Phase A)

## What this folder is

A fresh shallow clone of `https://github.com/twentyhq/twenty.git` (HEAD pinned in `UPSTREAM_VERSION`) with all sandbox-feasible Optale rebrand work applied in place. **Not yet pushed anywhere.** Phase B (fork creation, GHCR build, VPS2 deploy) is delegated to an agent / human with the credentials this paperclip sandbox does not have.

## What was changed (Phase A)

### Page metadata + PWA shell

| File | Change |
|------|--------|
| `packages/twenty-front/index.html` | `<title>Optale CRM</title>`, OG title/desc/img, Twitter card, theme-color `#0a0a0a`, favicon → `/optale-favicon.svg`, font link → Plus Jakarta Sans + Instrument Serif + IBM Plex Mono (Optale trinity). One "Twenty" reference retained in the BEGIN/END comment as origin attribution. |
| `packages/twenty-front/public/manifest.json` | `name`/`short_name` → "Optale CRM"; `theme_color`/`background_color` → `#0a0a0a` |
| `packages/twenty-front/public/optale-favicon.svg` | Copied from `/home/thor/AI-OS/Business/Soul/assets/optale-favicon.svg` (eclipse glyph, gradient, 614 bytes) |

### Optale brand override layer

Added `packages/twenty-front/src/optale-brand.css` and imported it from `packages/twenty-front/src/index.tsx` AFTER the upstream theme imports. This is an **additive overlay** — no upstream theme files are edited, which keeps weekly upstream rebases conflict-free.

What it overrides:
- `--accent-gradient: linear-gradient(90deg, #ff4f81 0%, #ff5c5c 50%, #ff6b2c 100%)` and a soft variant
- Cream `#faf8f4`, void surfaces `#0a0a0a` / `#0f0d0b` / `#1a1714` / `#221d18` as CSS vars
- Body font → Plus Jakarta Sans; mono → IBM Plex Mono
- Primary buttons: full gradient fill + cream text
- Secondary ghost buttons: gradient text-clip
- Active nav indicators (`[aria-current="page"]`, `[aria-selected="true"]`, `[data-active="true"]`): soft-gradient tint background + 2px gradient `::after` underline
- Login/sign-in card surface: void-1 background + cream text

Uses `!important` to beat Twenty's emotion-css runtime CSS (proven pattern from OPT-1009).

### User-visible string rebrand (twenty-front)

Word-boundary sed `\bTwenty\b` → `Optale CRM` across these production files (excluded `__tests__`, `__stories__`, `*.spec.*`, `/locales/generated/`, `/testing/`, `/mock-data/`):

- `pages/not-found/NotFound.tsx` — `Page Not Found | Optale CRM`
- `pages/onboarding/SyncEmails.tsx` — `Sync your Emails and Calendar with Optale CRM`
- `pages/auth/SignInUp.tsx` — `Welcome to Optale CRM`
- `modules/auth/sign-in-up/components/FooterNote.tsx` — `By using Optale CRM, you agree to the…`, links → `optale.no/legal/{terms,privacy}`
- `modules/workflow/workflow-trigger/utils/cron-to-human/types/cronDescriptionOptions.ts` — comment
- `modules/ui/navigation/navigation-drawer/constants/DefaultWorkspaceName.ts` — default workspace name
- `modules/apollo/services/apollo.factory.ts` — logger label
- `modules/activities/timeline-activities/utils/getTimelineActivityAuthorFullName.ts` — fallback author
- `modules/auth/services/AuthService.ts` — `Optale CRM-Refresh` logger label
- `modules/settings/billing/hooks/useHandleCheckoutSession.ts` + `useEndSubscriptionTrialPeriod.ts` — error toast text
- `modules/spreadsheet-import/.../ColumnGrid.tsx` — `Optale CRM fields` header
- `modules/settings/data-model/constants/SettingsCompositeFieldTypeConfigs.ts` — sample data labels
- `utils/title-utils.ts` — default title fallback

### User-visible string rebrand (twenty-emails)

Targeted edits + word-boundary sed across the source email templates and shared components (excluding generated locale catalogs which regenerate on build):

- `components/Logo.tsx` — `<Img src="https://crm.optale.no/optale-favicon.svg" alt="Optale CRM logo" />`
- `components/BaseHead.tsx` — `<title>Optale CRM email</title>`
- `components/Footer.tsx` — Replaced 4 Twenty links with 2 Optale links (`optale.no/`, `github.com/Optale-no/twenty-fork`); footer credit → `Optale AS · org.nr. 933 367 781 · Bergen, Norway`. One "Twenty" retained as AGPL attribution in the source-link aria-label.
- `components/WhatIsTwenty.tsx` — JSX text `What is Optale CRM?` (component name kept as `WhatIsTwenty` — code identifier, no upstream-rebase pain)
- `emails/clean-suspended-workspace.email.tsx`, `password-update-notify.email.tsx`, `send-email-verification-link.email.tsx`, `send-invite-link.email.tsx`, `warn-suspended-workspace.email.tsx` — sed pass

### What was NOT changed (deliberate)

- **Code identifiers containing "Twenty" as substring** — `IconTwentyStarFilled`, `WhatIsTwenty` (component), `useTwentyXxx`, `allowRequestsToTwentyIcons*`, `TwentyORM*` etc. Word-boundary regex correctly preserves these. Renaming would create massive rebase surface with zero user benefit. (See `feedback_rebrand_word_boundary_sed.md` in vault memory.)
- **`packages/twenty-ui/src/theme/constants/*.ts`** — palette files left untouched. Brand-color override done via additive `optale-brand.css` overlay instead. Reduces upstream-rebase conflicts.
- **Storybook stories (`__stories__/`, `*.stories.tsx`)** — these run only in storybook UI, not production. Not user-visible to crm.optale.no users.
- **Auto-generated locale files (`/locales/generated/`)** — these regenerate from i18n source catalogs on build. Editing them would just be churn.
- **Test files (`__tests__/`, `*.spec.*`)** — fixture data; not user-visible.
- **`packages/twenty-front/public/images/icons/**`** — the windows11/iOS/android icon set (~50 PNGs at various sizes). Replaced with `optale-favicon.svg` for the favicon link, but the PWA install icons still point at upstream Twenty PNGs. Phase B should bake a proper PWA icon set or generate them from the eclipse SVG.

## Verification (counts after Phase A)

| Check | Count |
|-------|-------|
| `\bTwenty\b` in production twenty-front tsx/ts (non-test/story/locale/mock) | **0** |
| `\bTwenty\b` in twenty-emails source (non-generated) | 1 (intentional AGPL-attribution in Footer aria-label) |
| `Optale CRM` references added | 25+ across tsx/ts/html/json |
| `accent-gradient` references in `optale-brand.css` | 7 |
| `Optale CRM` in `index.html` | 8 (title, og x2, twitter x2, description x2, attribution) |
| `Optale CRM` in `manifest.json` | 2 (name, short_name) |
| `optale-favicon.svg` in `public/` | 614 bytes, eclipse glyph |
| `UPSTREAM_VERSION` file | 301 bytes |
| `.rebrand-backups/` per-file backups | 17 files |

## Known follow-ups for Phase B / future passes

1. **Social card PNG** — `index.html` references `https://crm.optale.no/optale-social-card.png` for OG/Twitter previews. Card itself not yet generated. Option: render a 1200×630 PNG from the brand mark + tagline. Until then OG previews will 404.
2. **PWA icon set** — `manifest.json` still references the upstream Twenty PNG icon set under `images/icons/{windows11,ios,android}/`. Should be regenerated from the Optale eclipse SVG at all required sizes (71x71, 89x89, 107x107, 142x142, etc).
3. **Storybook stories** — text fixtures contain "Twenty Website", "Twenty Eng", etc. Not user-visible but should be cleaned up if anyone uses storybook for design review.
4. **Locale catalogs** — when a translator regenerates locale files, the new strings (`Welcome to Optale CRM`, etc.) will need re-translation. Until that pass runs, non-English users see the new English strings.
5. **`SettingsCompositeFieldTypeConfigs.ts`** — sample data for the URL-field demo. Now reads `Optale CRM Repo` / `Optale CRM` — fine for our context but may need a more SubCo-friendly demo dataset later.

## Rollback (single file)

Each sed pass wrote a `.bak` file under `.rebrand-backups/`. To revert any single file:

```bash
cp .rebrand-backups/<basename>.bak <original-path>
```

To revert everything (Phase A entirely): the cloned tree is fresh from upstream. Just `rm -rf` the folder and re-clone.

See `DELEGATION.md` for what Phase B needs to do to land this on `crm.optale.no`.
