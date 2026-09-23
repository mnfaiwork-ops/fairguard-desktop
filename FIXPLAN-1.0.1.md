# Fix plan — FairGuard 1.0.1

Goal (user): fix the GUI bugs found after installing 1.0.0, build a fresh `.deb`
(no `.exe` here — CI does that), publish a new release, then upgrade this laptop.

## Checklist (each item verified with evidence, not memory)

- [x] **F1 / G3 fatal** — Add Service list showed nothing ("can't add WhatsApp").
      Root cause: list came only from `api.ferdium.org`, which does not know
      `whatsapp-fairguard`. Fix: build previews from the bundled `recipes/all.json`,
      fall back to local when the server is unreachable.
      Evidence: `_getLocalRecipePreviews` present in the packaged
      `app.asar` (`api/server/ServerApi.js`); `tsc` clean; runtime harness found
      exactly 1 allowed recipe + local icon + archive present.
- [x] **F2 / G2** — "Internal Ferdium Server" page + Ferdium logo.
      Evidence (inside the shipped `.deb`): `<title>FairGuard</title>`, 0 "Ferdium" in
      the internal-server views, `logo.png` colour sample = FairGuard palette
      (purple + green, not Ferdium teal).
- [x] **F3 / G1** — App asked to log in to a Ferdium server.
      Fix: `DEFAULT_APP_SETTINGS.server` -> `LOCAL_SERVER`; `Welcome.tsx` reduced to
      one focus + one action; `WelcomeScreen.tsx` prop cleanup.
      Evidence: packaged `config.js` contains "You are using FairGuard without a
      server"; `tsc` clean; `eslint` clean.
- [x] **Visual rebrand to green** — `$raw-theme-brand-primary` -> `18,140,126`;
      `DEFAULT_ACCENT_COLOR` -> `#128C7E`; `welcome.scss` rewritten; light neutral
      auth background (was a dark gradient).
      Evidence: packaged `styles/main.css` has 32x `18,140,126` and 0x old
      `114,102,240`; packaged `config.js` has `#128C7E`.
- [x] **F5 — i18n** — 46 locale files, 1806 value replacements, keys preserved.
      Evidence: 0 "Ferdium" value hits outside `en-US`; all JSON parses.
- [x] **Tests** — `npx jest`: 14 suites, 119 passed, 2 skipped, 0 failed
      (also re-run by the pre-commit hook).
- [x] **Build `.deb` 1.0.1** — `out/FairGuard-linux-1.0.1-amd64.deb`
      (132,376,244 B, sha256 `d8623748605e76449ed24809a20661b5718ba9cc5d09d74f6d6350c86f3cef09`).
- [x] **Publish release v1.0.1** — https://github.com/mnfaiwork-ops/fairguard-desktop-releases/releases/tag/v1.0.1
      4 assets: win AutoSetup + Portable `.exe`, linux `.deb`, `latest.yml`.
      CI run `35809133419` (tag) success. Orphan draft `394244764` deleted;
      live release id `394244763`. Public download: HTTP 200, sha256 matches build.
- [ ] **Upgrade this laptop** — blocked: `sudo` needs a terminal to authenticate.
      Package staged at `~/Downloads/FairGuard-linux-1.0.1-amd64.deb`.
      Command: `sudo apt install ~/Downloads/FairGuard-linux-1.0.1-amd64.deb`
- [ ] **Verify the installed app by eye** — after the user installs: Add Service
      shows "WhatsApp (FairGuard)", no Ferdium page, green accent.

## Still open (user-visible, not yet proven)

- [ ] FairGuard settings UI inside the shell (only the in-recipe panel exists today).
- [ ] Confirm multi-account: two WhatsApp (FairGuard) services, each with its own
      coach badge.
