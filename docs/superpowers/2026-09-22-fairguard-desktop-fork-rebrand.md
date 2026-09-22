# FairGuard Desktop — Fork Ferdium + Rebrand — Implementation Plan

> **For the implementing engineer:** execute tasks in order. Each task ends with a
> commit. Do not batch tasks. If a task's verify step fails, stop and fix before
> moving on.

**Goal:** Produce a Windows + Linux Electron desktop app named **FairGuard** — a
fork of `ferdium/ferdium-app` with the visible shell rebranded — that runs
several organic WhatsApp numbers in one window, each with its own FairGuard coach
badge.

**Spec:** `docs/superpowers/specs/2026-09-22-fairguard-desktop-fork-rebrand-design.md`

**Architecture (two decoupled layers):**
- **Shell layer** — the ferdium-app Electron/React codebase, rebranded at every
  string a CS can see. User-agent and technical identifiers preserved.
- **Recipe layer** — `whatsapp-fairguard`, seeded from the official `whatsapp`
  recipe, with FairGuard's already-tested modules copied in verbatim and the
  `webview.js` init appended.

**Tech stack:** Electron 44, React, MobX, esbuild, electron-builder 26,
Node **24.18.1**, pnpm **11.20.0** (pinned by the `v7.2.3` tag via `.nvmrc` +
`volta` + `packageManager` + `engine-strict`; the `develop` branch pins newer
versions — we follow the tag we forked).

> **Corrections found while executing (Task 1–2):**
> - The fork's base tag `v7.2.3` pins **Node 24.18.1 / pnpm 11.20.0**, not the
>   24.20.0 / 12.3.4 that `develop` pins. Use the tag's numbers.
> - The recipe submodule path is `recipes/` → and *inside* it the folder of
>   recipes is also `recipes/`. So the real path is
>   `fairguard-desktop/recipes/recipes/whatsapp/`, and our recipe goes to
>   `fairguard-desktop/recipes/recipes/whatsapp-fairguard/`.

---

## Ground rules for this plan

1. **Never edit files in `wa-guard/src/`** except where a task says so. FairGuard
   logic lives there; the fork holds *copies*.
2. **Byte-identical copies must stay byte-identical.** After copying
   `rules/counter/hash/wa-dom/badge`, run the checksum check in Task 6. If it
   fails, the copy drifted — re-copy, never hand-edit.
3. **No `Ferdium` string may remain on a CS-visible surface** (Task 9 verifies).
4. **The user-agent strip in `recipes/whatsapp/index.js` must survive verbatim**
   (Task 5 verifies). Removing it raises WhatsApp detection risk.
5. Upstream Ferdium is tracked as a git remote (`upstream`), never merged into
   `master` — see `UPSTREAM.md` (Task 4).

---

## File structure (decisions locked here)

```
/home/crm-sinergi/ClaudeCode/fairguard-desktop/        NEW repo (fork)
├── package.json                     edited: name/productName/desktopName/appId/description
├── electron-builder.yml             edited: appId, publish provider→github repo, snap description
├── branding/                        edited: Ferdium.svg → fairguard logo, logo.png, gradient
├── build-helpers/images/            edited: icon.icns, icon.ico, icons/ (512, 1024)
├── src/                             rebrand pass: grep -ri ferdium, edit visible strings
│   ├── (React shell — menus, settings, splash, about, onboarding, tray)
│   └── ...
├── recipes/                         SUBMODULE → ferdium/ferdium-recipes
│   └── whatsapp-fairguard/          NEW recipe folder, added to the submodule tree
│       ├── package.json             from official whatsapp, edited (id/name/version)
│       ├── index.js                 from official, UNCHANGED (user-agent strip kept)
│       ├── icon.svg                 from official
│       ├── service.css              from official, UNCHANGED
│       ├── darkmode.css             from official, UNCHANGED
│       ├── webview-unsafe.js        from official, UNCHANGED
│       ├── webview.js               official body + FairGuard init appended
│       ├── badge.css                copy of wa-guard/src/badge.css, UNCHANGED
│       └── fairguard/
│           ├── rules.js             copy verbatim
│           ├── counter.js           copy verbatim
│           ├── hash.js              copy verbatim
│           ├── wa-dom.js            copy verbatim
│           ├── badge.js             copy verbatim
│           ├── glue.js              NEW (ex-content.js, storage swapped)
│           └── settings-panel.js    NEW (replaces options.html + options.js)
├── UPSTREAM.md                      NEW — sync procedure
└── docs/superpowers/specs/          spec copied in
```

**Why the recipe lives in the `recipes/` submodule:** ferdium-app mounts
`ferdium/ferdium-recipes` as a git submodule at `recipes/`. That is where the
app actually reads recipes from. Placing `whatsapp-fairguard` there is what makes
the app load it.

> **CRITICAL architectural correction (found during Task 4 review):** `recipes/`
> is a **git submodule** (`.gitmodules` → `ferdium/ferdium-recipes`, mode
> `160000`, currently pinned to `bc708f6a`). Files under `recipes/` are tracked
> by the **submodule's** repo, NOT the fork. So the recipe cannot simply be
> `git add`-ed on the `fairguard` branch.
>
> **Decided (Fai, 2026-09-22):** fork `ferdium-recipes` too →
> `mnfaiwork-ops/ferdium-recipes` (done). The fork's `.gitmodules` is repointed
> to our fork. The recipe is authored + committed **inside the submodule repo**,
> pushed to `mnfaiwork-ops/ferdium-recipes`, and the outer fork records the new
> gitlink SHA. Full procedure in Task 5.
>
> Recipe real path: `fairguard-desktop/recipes/recipes/whatsapp-fairguard/`
> (submodule root `recipes/`, then the recipes folder `recipes/` inside it).

---

## Task 1 — Toolchain: Node 24.20.0 + pnpm 12.3.4

Ferdium enforces `engine-strict` with Node 24.20.0 / pnpm 12.3.4. The dev machine
has Node 22 / npm 10. Without this, `pnpm install` refuses to run.

- [ ] Install volta (if absent) or nvm, and pin:
  ```
  curl https://get.volta.sh | bash      # if volta absent
  volta install node@24.20.0
  volta install pnpm@12.3.4
  ```
- [ ] Verify in a fresh shell:
  ```
  node -v      # v24.20.0
  pnpm -v      # 12.3.4
  ```
- [ ] **Commit:** none (machine setup, not repo content).

> **EXECUTED 2026-09-22 with nvm instead of volta** (nvm was already installed;
> using it avoids adding a new tool). Actual pins = the fork tag's
> **Node 24.18.1 + pnpm 11.20.0**:
> ```
> nvm install 24.18.1 && nvm use 24.18.1
> corepack enable && corepack prepare pnpm@11.20.0 --activate
> ```
> Verified: global shell stays Node v22 (nvm default), Node 24.18.1 only active
> under `nvm use`. No global toolchain change.

## Task 2 — Fork the repo

- [ ] Create the fork on GitHub: `mnfaiwork-ops/fairguard-desktop` (fork of
      `ferdium/ferdium-app`). Do NOT fork via "Copy the branch" — fork so upstream
      stays linked.
- [ ] Clone into the working folder:
      `git clone git@github.com:mnfaiwork-ops/fairguard-desktop.git /home/crm-sinergi/ClaudeCode/fairguard-desktop`
- [ ] Add upstream: `git remote add upstream https://github.com/ferdium/ferdium-app.git`
- [ ] Pin the base commit to the released tag so the fork is reproducible:
      `git checkout -b fairguard v7.2.3` (v7.2.3 = latest stable, 2026-09-07).
- [ ] **Verify:** `git log -1 --oneline` shows the v7.2.3 commit;
      `git remote -v` shows both `origin` and `upstream`.
- [ ] **Commit:** none (branch creation is the checkpoint).

## Task 3 — Baseline build proves the untouched fork runs

Do this **before** any edit, so later failures are attributable.

- [ ] Init submodules: `git submodule update --init --recursive`
- [ ] `pnpm install` (expect engine check to pass now).
- [ ] `pnpm test` — record the baseline pass/fail count.
- [ ] `pnpm dev` in one shell, `pnpm start` in another; wait for the app window.
- [ ] **Verify:** app opens showing Ferdium branding; no console errors that
      weren't there before. Close it.
- [ ] **Commit:** none (baseline is a state, not a diff).

## Task 4 — `UPSTREAM.md`

- [ ] Create `UPSTREAM.md` at repo root documenting:
  - the fork's base tag (`v7.2.3`) and fork-base date (2026-09-22),
  - `git fetch upstream && git rebase upstream/develop` as the sync recipe,
  - that rebrand edits are *local commits* expected to conflict on each sync,
  - **the submodule topology**: `recipes/` is a git submodule → our fork of
    `ferdium-recipes`, so recipe edits are committed/pushed in the *submodule*
    repo and the outer fork records the gitlink SHA,
  - "re-copy `wa-guard/src/*.js` (and `badge.css`) into the recipe after any
    FairGuard logic fix — fix wa-guard first, then recopy."
- [ ] **Commit:** `docs: cara sync balik ke upstream Ferdium`

## Task 5 — Recipe: fork recipes repo, seed recipe, edit package.json

**Prerequisite (done):** `ferdium/ferdium-recipes` is forked to
`mnfaiwork-ops/ferdium-recipes`; the fork's `.gitmodules` points the `recipes`
submodule at our fork.

- [ ] In the submodule, work directly on `main` (that is what `.gitmodules` tracks; a
      separate branch would never be seen by `git submodule update`). Add the recipe:
  ```bash
  cd /home/crm-sinergi/ClaudeCode/fairguard-desktop/recipes
  git checkout main
  cp -r recipes/whatsapp recipes/whatsapp-fairguard
  ```
- [ ] Edit `recipes/recipes/whatsapp-fairguard/package.json`:
      ```json
      {
        "id": "whatsapp-fairguard",
        "name": "WhatsApp (FairGuard)",
        "version": "1.0.0",
        "license": "MIT",
        "config": {
          "serviceURL": "https://web.whatsapp.com",
          "hasNotificationSound": true,
          "hasIndirectMessages": true
        }
      }
      ```
- [ ] `recipes/recipes/whatsapp-fairguard/index.js` — copy of the official file
      **unchanged**. It contains the user-agent strip
      (`replaceAll(/(Ferdium|Electron)\/\S+ \([^)]+\)/g, '')`).
- [ ] **Verify:** `grep -n 'Ferdium\|Electron' recipes/recipes/whatsapp-fairguard/index.js`
      shows the two `replaceAll` lines still present.
- [ ] Commit **inside the submodule repo**:
      `cd recipes && git add recipes/whatsapp-fairguard && git commit -m "feat: recipe whatsapp-fairguard (seed dari resmi)"`
- [ ] Push `main` to our recipes fork:
      `git push origin main`
- [ ] Back in the outer fork, record the new gitlink SHA:
      `cd .. && git add recipes && git commit -m "feat(recipe): tunjuk submodule recipes ke fork kita + whatsapp-fairguard"`

> **Why two commits:** the recipe files belong to the *submodule's* repo
> (`mnfaiwork-ops/ferdium-recipes`). The outer fork only tracks a gitlink SHA.
> Editing `recipes/…` and committing on `fairguard` without committing inside the
> submodule would capture nothing (or an opaque gitlink with uncommitted content
> that a later `git submodule update` discards).

## Task 6 — Recipe: copy FairGuard modules verbatim (with checksum proof)

All paths below are inside the submodule: `fairguard-desktop/recipes/recipes/whatsapp-fairguard/`.

- [ ] Copy into `recipes/recipes/whatsapp-fairguard/fairguard/`:
      `wa-guard/src/{rules,counter,hash,wa-dom,badge}.js` and
      `wa-guard/src/badge.css` → `recipes/recipes/whatsapp-fairguard/badge.css`.
- [ ] **Also** add a provenance marker to the recipe's `package.json` (review follow-up
      from Task 5): a `"repository"` field pointing at the fork, so it is auditable that
      this is a fork of the official `whatsapp` recipe — do not change `id`/`name`/`version`.
- [ ] **Verify byte-identity:**
      ```
      cd /home/crm-sinergi/ClaudeCode/fairguard-desktop
      for f in rules counter hash wa-dom badge; do
        cmp wa-guard/../wa-guard/src/$f.js recipes/recipes/whatsapp-fairguard/fairguard/$f.js && echo "$f OK"
      done
      cmp /home/crm-sinergi/ClaudeCode/wa-guard/src/badge.css recipes/recipes/whatsapp-fairguard/badge.css && echo "badge.css OK"
      ```
      Every line must print `OK`. Any diff = a bad copy; re-copy.
- [ ] **Commit (inside the submodule):**
      `cd recipes && git add recipes/whatsapp-fairguard && git commit -m "feat: salin modul FairGuard verbatim + badge.css"`

## Task 7 — Recipe: `glue.js` (ex-content.js, storage swapped)

This is the only logic file that changes. Take `wa-guard/src/content.js` and make
exactly three surgical changes; **everything else stays identical** (the
`onPesan` flow, diagnostics `d16`, calibration, rollover, the dead `.catch`).

- [ ] Create `recipes/recipes/whatsapp-fairguard/fairguard/glue.js` from `content.js` with:

  **Change 1 — storage helpers (new top of IIFE):**
  ```js
  var KUNCI = { state: 'fairguard.state', setelan: 'fairguard.setelan', salt: 'fairguard.salt' };
  function bacaKunci(k, dflt) {
    try { var raw = localStorage.getItem(KUNCI[k]); return raw ? JSON.parse(raw) : dflt; }
    catch (e) { return dflt; }
  }
  function tulisKunci(k, v) { localStorage.setItem(KUNCI[k], JSON.stringify(v)); }
  ```
  Replace `simpanState()`'s body with `tulisKunci('state', state)`.

  **Change 2 — startup becomes synchronous:** replace
  `chrome.storage.local.get(['state','setelan','salt'], mulai)` with
  ```js
  mulai({ state: bacaKunci('state', null),
          setelan: bacaKunci('setelan', null),
          salt: bacaKunci('salt', null) });
  ```
  Inside `mulai`, replace the salt-persist line
  (`if (!tersimpan.salt) chrome.storage.local.set({ salt: salt });`) with
  `if (!tersimpan.salt) tulisKunci('salt', salt);`.

  **Change 3 — drop `chrome.storage.onChanged`, expose the setter:**
  ```js
  function setSetelan(next) {
    setelan = Object.assign({}, SETELAN_DEFAULT, next || {});
    tulisKunci('setelan', setelan);
    gambar();
  }
  ```
  Delete the `chrome.storage.onChanged.addListener(...)` block entirely.
  Export at the end of the IIFE: `globalThis.FairGuardGlue = { mulai: mulai, gambar: gambar, setSetelan: setSetelan };`

- [ ] **Verify:** `grep -n 'chrome\.' recipes/recipes/whatsapp-fairguard/fairguard/glue.js`
      returns **nothing**.
- [ ] **Commit (inside the submodule):**
      `cd recipes && git add recipes/whatsapp-fairguard && git commit -m "feat: glue.js ganti chrome.storage → localStorage"`

## Task 8 — Recipe: `settings-panel.js` + wire `webview.js`

> **Architecture decision (confirmed with Fai, 2026-09-22 after code review):**
> FairGuard runs via plain `require('./fairguard/*.js')` inside `webview.js`
> (the normal recipe mechanism), **not** `injectJSUnsafe` into the main world.
> Justification: the official WhatsApp recipe already uses `document`,
> `window.indexedDB`, and `document.body.classList` directly in `webview.js`
> (verified in `recipes/whatsapp/webview.js` and `RecipeWebview.injectCSS`), so
> that context is the renderer with the WhatsApp DOM. `injectJSUnsafe` stays
> reserved for the official `webview-unsafe.js` (pushState throttle).
>
> **Residual risk to TEST at Task 17 (GUI step):** whether `localStorage` in the
> `webview.js` (preload) context is the same store as WhatsApp Web's own — i.e.
> whether per-partition isolation (spec §7) actually holds. If Task 17 shows the
> two WhatsApp accounts share one FairGuard store, fall back to injecting
> `glue.js` into the main world via `injectJSUnsafe`. `crypto.subtle` is expected
> present (Electron renderer has WebCrypto) but confirm alongside.

- [ ] Create `recipes/recipes/whatsapp-fairguard/fairguard/settings-panel.js`:
  - Renders its own gear button **appended to `document.body`** (NOT inside the
    badge DOM — keeps `badge.js` byte-identical).
  - Clicking the gear toggles a panel overlay with the three fields
    (`batasChatBaru`, `jedaMinDetik`, `diagnosa`) + privacy copy.
  - Save → `globalThis.FairGuardGlue.setSetelan(next)`.
  - Self-contains its CSS (inject a `<style>` tag). Match badge styling.
- [ ] Edit `recipes/recipes/whatsapp-fairguard/webview.js` — **append after the existing
      `Ferdium.injectCSS(...)` line**, leaving the official body untouched:
  ```js
  // --- FairGuard: append-only init ---
  require('./fairguard/rules.js');
  require('./fairguard/hash.js');
  require('./fairguard/counter.js');
  require('./fairguard/wa-dom.js');
  require('./fairguard/badge.js');
  require('./fairguard/glue.js');
  require('./fairguard/settings-panel.js');

  Ferdium.injectCSS(_path.default.join(__dirname, 'badge.css'));

  window.addEventListener('DOMContentLoaded', () => {
    if (globalThis.FairGuardSettings) {
      globalThis.FairGuardSettings.mount();   // gear button + panel
    }
  });
  ```
  > **CORRECTION (found while implementing Task 8):** `globalThis.FairGuardGlue.mulai`
  > takes the **persisted storage blob**, not `document` — glue.js already calls
  > `mulai({state,setelan,salt})` itself at module-eval time (see Task 7 Change 2), and
  > `gambar()` closes over the webview's own `document`. So do **NOT** call
  > `mulai(document)` (that would clobber storage with a `document` object). The init
  > block only needs to mount the settings panel.
- [ ] Hook the redraw into the existing loop: modify `loopFunc` minimally:
  ```js
  const loopFunc = () => {
    getMessages();
    getActiveDialogTitle();
    if (globalThis.FairGuardGlue) globalThis.FairGuardGlue.gambar();
  };
  ```
- [ ] **Verify:** `webview.js` still contains the original
      `Ferdium.injectJSUnsafe`, `handleDarkMode`, `Ferdium.loop(loopFunc)`, and
      `injectCSS(service.css)` lines unmodified.
- [ ] **Commit (inside the submodule):**
      `cd recipes && git add recipes/whatsapp-fairguard && git commit -m "feat: settings panel + init FairGuard di webview.js" && git push`

## Task 9 — Unit test for `glue.js` storage

- [ ] In `wa-guard`, add `test/glue.test.js` loading `glue.js` against a
      `localStorage` shim: round-trip `state`/`setelan`/`salt`, and
      default-on-empty returns `null` (not throw).
- [ ] **Verify:** `node --test test/*.test.js` — all existing tests still pass
      (baseline was **109 pass, 0 fail**) plus the new ones.
- [ ] **Commit:** `test: glue.js round-trip storage pakai shim localStorage`

## Task 10 — Rebrand sweep: find every surface

**EXECUTED 2026-09-22.** Command used (excludes deps, coverage junk, lockfiles):
```
grep -rin 'ferdium' . \
  --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=out \
  --exclude-dir=coverage --exclude-dir=.tmp --exclude=pnpm-lock.yaml \
  --exclude=.eslintcache --exclude-dir=recipes | sed 's|^\./||' > /tmp/ferdium-audit/all.txt
```
Result: **2877 hits.** Breakdown: `src/` 2593 (of which `src/i18n/` 2093),
`.github/` 73, `docs/` 37, `scripts/` 24, `test/` 19, root config 20, `branding/` 6, `UPSTREAM.md` 10.

### Classification (what the sweep must do)

| # | Surface | Kind | Action |
|---|---|---|---|
| 1 | `package.json`: `name`, `productName`, `desktopName`, `appId`, `description`, `author`, `copyright` | VISIBLE + build identity | **CHANGE** → FairGuard |
| 2 | `package.json`: `homepage`, `repository`, deps `github:ferdium/...` | INTERNAL | keep |
| 3 | `electron-builder.yml`: `appId`, `productName`, `executableName`, `unpackDirName`, `artifactName`, snap `description`, `publisherName`, `linux.desktop.Name/Comment` | VISIBLE + build identity | **CHANGE** → FairGuard (keep scheme? see #7) |
| 4 | `src/lib/Menu.ts` + `src/lib/Tray.ts` + `src/lib/LinuxTray.ts` labels/tooltips | VISIBLE (menus, tray) | **CHANGE** |
| 5 | `src/stores/ServicesStore.ts:1279` `document.title = 'Ferdium - ...'` | VISIBLE (window title) | **CHANGE** |
| 6 | **`src/**/*.{ts,tsx}` `defaultMessage: '...Ferdium...'` (42 hits, ~30 files)** — the *real* i18n source | VISIBLE (all app copy) | **CHANGE** |
| 6b | `src/i18n/locales/en-US.json` (**generated** — `formatjs extract`+`compile` from #6) | VISIBLE, derived | **DO NOT hand-edit** — regenerated by `pnpm prepare-code` on every commit |
| 6c | `src/i18n/locales/{other 54}.json` (Crowdin translations, keyed by ID) | VISIBLE, derived | **DO NOT hand-edit** — Crowdin-owned; they fall back to en-US for the Ferdium token only if untranslated. Leave them (they are upstream translations; rewriting 54 files fights every sync). The app ships en-US as the base. |
| 6d | `src/i18n/locales/defaultMessages.json` | derived (extract output) | regenerated by prepare-code; do not hand-edit |
| 7 | `electron-builder.yml` `schemes: [ferdium]` | build identity, **wired to code** | **KEEP `ferdium`** — `src/environment-remote.ts:80` `protocolClient = 'ferdium'` and `src/config.ts` `ALLOWED_PROTOCOLS` include `'ferdium:'`; changing the scheme breaks deep-linking unless 3 code sites change too. No CS sees a URI scheme. (Guard rule: ambiguous → keep.) |
| 8 | Module/class/type names: `FerdiumRoutes`, `FerdiumStores`, `FerdiumApi`, `class Ferdium` (dbus), `SupportFerdium*`, `supportFerdium/` dir | INTERNAL identifiers | **KEEP** (renaming is churn, not branding; no CS ever sees them) |
| 9 | `window['ferdium']` / `globalThis.Ferdium` injected API object | INTERNAL API | **KEEP — load-bearing** |
| 10 | `preload-safe-debug('Ferdium:...')` namespaces | INTERNAL debug | keep |
| 11 | i18n **KEYS** like `menu.view.reloadFerdium`, `settings.supportFerdium.about` | INTERNAL (code ↔ key) | **KEEP keys** (renaming means touching every `intl.formatMessage` call + all 55 locales; zero CS benefit) |
| 12 | Comments, `.github/` templates, `docs/`, `README.md`, `CHANGELOG.md`, `CONTRIBUTING.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md`, `LICENSE.md`, `Dockerfile`, `.all-contributorsrc`, `CLAUDE.md` | INTERNAL docs | **KEEP** (upstream docs; rewriting them fights every future sync) |
| 13 | `scripts/*` (`build-unix.sh`, `build-windows.ps1`, migration scripts, crowdin) | INTERNAL build tooling | keep except where a script hardcodes the artifact name used by electron-builder (check #3) |
| 14 | `test/*` (19 hits) | INTERNAL tests | keep (update only tests that assert on a changed branding string) |

**Guard rule applied:** anything ambiguous → KEEP. Correctness (app still builds/runs)
beats completeness (no Ferdium string anywhere). Task 16 (with Fai, GUI) is the
completeness gate.

- [x] **Commit:** none (analysis artifact in `/tmp/ferdium-audit/all.txt`).

## Task 11 — Rebrand sweep: apply edits to VISIBLE strings

Priority surfaces (from spec §5). Edit **only** VISIBLE hits (see Task 10 table).

- [ ] `package.json`: `name` `ferdium`→`fairguard`,
      `productName` `Ferdium`→`FairGuard`,
      `desktopName` `ferdium.desktop`→`fairguard.desktop`,
      `appId` `org.ferdium.ferdium-app`→`org.fairguard.fairguard-desktop`,
      `description` → FairGuard's, `author` → our team, `copyright`→`org.fairguard`.
      **Keep** `homepage`/`repository`/`github:ferdium/...` deps.
- [ ] `electron-builder.yml`: `appId` (same as above), `productName`,
      `executableName` → `fairguard`, `unpackDirName` → `FairGuard-Unpacked`,
      `publish.provider: github` + `publish.owner/repo` →
      `mnfaiwork-ops/fairguard-desktop-releases`, snap `description` → FairGuard's,
      `publisherName` → FairGuard. **Keep** `schemes: [ferdium]` (wired to code).
- [ ] **The real copy surface — `defaultMessage` strings in source (42 hits, ~30 files):**
      replace the word `Ferdium` → `FairGuard` inside `defaultMessage: '...'` only.
      Files: `src/containers/settings/EditSettingsScreen.tsx`, `EditServiceScreen.tsx`,
      `EditUserScreen.tsx`, `src/lib/Menu.ts`, `src/lib/Tray.ts`, `src/components/**`,
      `src/features/**`, `src/containers/settings/**`, etc.
      ⚠️ Do NOT touch `id:` values (i18n keys) or the `defaultMessage` keys used
      elsewhere; only the human-readable text.
- [ ] After source edits: run `pnpm prepare-code` (or `pnpm extract && pnpm compile`)
      so `en-US.json` + `defaultMessages.json` regenerate with the new copy.
      **Commit the regenerated files together with the source edits** — that is the
      correct way to update i18n here.
- [ ] `src/lib/Menu.ts:986-987` (`title: 'Ferdium'`, `message: 'Ferdium'`) — visible
      dialog; change.
- [ ] `src/stores/ServicesStore.ts:1279` `document.title = \`Ferdium - ...\`` → `FairGuard`.
- [ ] `src/lib/Tray.ts` / `src/lib/LinuxTray.ts` tooltips/labels → FairGuard.
- [ ] **Do NOT touch:** `index.js` (recipe) user-agent strings, `window['ferdium']` /
      `globalThis.Ferdium` injected API, module/class/type names (`FerdiumRoutes`,
      `FerdiumStores`, `class Ferdium` dbus), `preload-safe-debug('Ferdium:...')`
      namespaces, i18n `id:` keys, `ferdium:` URI scheme, upstream URLs, docs,
      `.github/`, `scripts/`, `test/`.
- [ ] **Verify:** `node --test` still green; `pnpm prepare-code` produces no unexpected
      diff beyond the intended copy change; app still parses (`pnpm lint` or tsc if fast).
- [ ] **Commit:** `chore(brand): rebrand shell Ferdium → FairGuard` (body lists
      the classified surfaces from Task 10).

## Task 12 — Logo assets (upscale ≤128px, accept softness)

- [ ] Generate from `wa-guard/src/icons/icon-128.png` (only master available):
  - `branding/logo.png` (512×512), `branding/fairguard.svg` if a vector trace is
    done (optional), `build-helpers/images/icon.ico` (Windows, multi-res:
    16/32/48/256), `build-helpers/images/icons/512x512.png` (Linux),
    `build-helpers/images/icon.icns` for completeness.
- [ ] Replace `branding/Ferdium.svg` usage; keep the file only if referenced by
      build config that we also repoint.
- [ ] **Verify:** app window icon + tray icon show the FairGuard mark.
- [ ] **Commit:** `chore(brand): aset ikon FairGuard (upscale dari 128px)`

## Task 13 — Lock to WhatsApp only

- [ ] In the shell, restrict the add-service list so only `whatsapp-fairguard`
      is offered (per spec §5: restrict the list, do not delete the catalog —
      keeps upstream merges easier).
- [ ] **Verify:** the Add-Service UI offers WhatsApp only.
- [ ] **Commit:** `feat(shell): kunci daftar layanan ke WhatsApp saja`

## Task 14 — Updater repoint

- [ ] Point electron-updater at `mnfaiwork-ops/fairguard-desktop-releases`
      (create that release repo, empty, first).
- [ ] Remove/repoint any Ferdium-hosted update feed.
- [ ] **Verify in dev:** updater logs show our repo as the feed; no request to
      Ferdium's servers.
- [ ] **Commit:** `chore(updater): arahkan auto-update ke repo rilis sendiri`

## Task 15 — Copied spec + docs into the fork

- [ ] Copy `wa-guard/docs/superpowers/specs/2026-09-22-fairguard-desktop-fork-rebrand-design.md`
      into `fairguard-desktop/docs/superpowers/specs/` (spec §4 note).
- [ ] **Commit:** `docs: spec desain FairGuard Desktop`

## Task 16 — Run rebrand verification

- [ ] Launch the app. Open every VISIBLE surface (splash, onboarding, settings
      tabs, About/version, menus, tray, window title, an update notice, an error
      dialog). Confirm **no "Ferdium" string appears**.
- [ ] `grep -rin 'ferdium' src/ --include='!*.test.*'` — every remaining hit is
      INTERNAL and documented.
- [ ] Confirm the app offers WhatsApp only.
- [ ] **Commit:** none (verification; fixes become their own commits).

## Task 17 — Multi-account FairGuard proof

- [ ] Add the `whatsapp-fairguard` service **twice** (two WhatsApp logins).
- [ ] **Verify:** two independent badges, each counting only its own account;
      editing one's settings does not affect the other (per-partition
      `localStorage`).
- [ ] **Critical check (from Task 8 decision):** confirm the two accounts do NOT
      share one FairGuard store. If they do, switch `glue.js` to `injectJSUnsafe`
      into the main world (see Task 8 note). Also confirm `crypto.subtle` works
      (hash.js) — if hashing fails, the badge shows HASHGAGAL in the diagnosa row.
- [ ] Run one account for a day (spec §12 / `TESTING.md`) and confirm counts move;
      if stalled, use the `diagnosa` row.
- [ ] **Commit:** none (proving step; findings appended to `TESTING.md`).

## Task 18 — Build Windows + Linux

- [ ] Linux build on this machine: `pnpm build` → AppImage/deb in `./out`.
- [ ] Windows build: needs a Windows runner (GitHub Actions `windows-latest`) or
      Wine. Decide at this task; do not fake it.
- [ ] **Commit:** `build: konfigurasi build Windows + Linux`
- [ ] **Verify:** both installers launch on a clean profile and show FairGuard.

---

## Self-review notes

- **Spec coverage:** every §3–§10 spec item maps to a task (toolchain→1, forking→2,
  baseline→3, repo layout→4, recipe mechanics→5–8, storage→7, settings→8, tests→9,
  rebrand→10–12, WhatsApp lock→13, updater→14, distribution→18, copy of spec→15).
- **Out of scope honored:** no task touches FairTrack CS sync (spec §11).
- **Open items from spec §14 resolved here:** where the spec was copied (§4),
  where the recipe lives (submodule `recipes/`), Windows runner (§18),
  shell file list (Task 10's grep).
- **Known-unknown to resolve during Task 2/10:** the shell is large; the exact
  list of VISIBLE `ferdium` hits is only knowable after cloning. The plan forces
  that discovery (Task 10) *before* edits (Task 11) rather than guessing.
- **Checksums** (Task 6) are the guard against silent drift of the verbatim
  modules.
