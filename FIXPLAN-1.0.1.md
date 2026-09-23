# Fix plan — FairGuard 1.0.1

Goal (user): fix the GUI bugs found after installing 1.0.0, build a fresh `.deb` (no `.exe`
here — CI does that), publish a new release, then upgrade this laptop.

## Checklist (verify each with evidence, not memory)

- [x] **F1 / G3 fatal** — Add Service list showed nothing ("can't add WhatsApp").
      Root cause: list came only from `api.ferdium.org`, which does not know
      `whatsapp-fairguard`. Fix: build previews from the bundled `recipes/all.json`,
      fall back to local when the server is unreachable.
      Evidence: `_getLocalRecipePreviews` in `src/api/server/ServerApi.ts`; `tsc` clean;
      runtime harness found exactly 1 allowed recipe + local icon + archive present.
- [x] **F2 / G2** — "Internal Ferdium Server" page + Ferdium logo.
      Fix: rebranded `main.edge`/`index.edge`/`transfer.edge`; replaced
      `src/internal-server/public/images/logo.png` with the FairGuard mark.
      Evidence: asar extract shows `<title>FairGuard</title>`, 0 "Ferdium" in `index.edge`,
      logo.png sha256 identical source==build==asar, colour sample = FairGuard palette.
- [x] **F3 / G1** — App asked to log in to a Ferdium server.
      Fix: `DEFAULT_APP_SETTINGS.server` -> `LOCAL_SERVER` (no-account out of the box);
      `Welcome.tsx` reduced to one focus + one action; `WelcomeScreen.tsx` prop cleanup.
      Evidence: `tsc` clean, `eslint` clean, jest 119 pass / 2 skip / 0 fail.
- [x] **Visual rebrand to green** — `$raw-theme-brand-primary` -> `18,140,126`;
      `DEFAULT_ACCENT_COLOR` -> `#128C7E`; `welcome.scss` rewritten.
      Evidence: built `main.css` has 32x `18,140,126`, 0x old `114,102,240`;
      built `config.js` has `#128C7E`.
- [x] **F5 — i18n** — 46 locale files, 1806 value replacements, keys preserved.
      Evidence: 0 "Ferdium" value hits outside `en-US`; all JSON parses; prettier clean.
- [x] **Build `.deb` 1.0.1** — `out/FairGuard-linux-1.0.1-amd64.deb` (132,376,184 B,
      sha256 `64be8f03f8bf7c4163e10160a92d3d7fa3c07c0c415267916fd4788a356c043f`).
- [ ] **Publish release v1.0.1** to `mnfaiwork-ops/fairguard-desktop-releases`
      (tag -> CI builds `.exe` draft -> upload `.deb` -> `--draft=false --latest`).
- [ ] **Upgrade this laptop** via `sudo apt install ./FairGuard-linux-1.0.1-amd64.deb`.
- [ ] Verify the installed app: Add Service shows "WhatsApp (FairGuard)", no Ferdium
      page, green accent.

## Still open (user-visible, not yet proven)

- [ ] Sidebar / service-tab icon still shows the Ferdium mark (seen in 1.0.0 screenshots).
      Not yet traced. Investigate `src/assets/images/icons/` + `build-helpers/images/`.
- [ ] FairGuard settings UI inside the shell (only in-recipe panel exists today).
