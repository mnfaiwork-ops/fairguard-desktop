# Staying in Sync with Upstream Ferdium (and the `wa-guard` copy source)

This repository is a fork of [`ferdium/ferdium-app`](https://github.com/ferdium/ferdium-app) (Apache-2.0).
It is a FairGuard-branded desktop app (WhatsApp only) that plants the FairGuard coach
badge through the Ferdium recipe mechanism.

Keeping this app healthy means tracking **two** upstreams, not one:

1. **`ferdium/ferdium-app`** — the Electron/React shell we forked (this repo).
2. **`wa-guard`** — the separate repository that is the *source of truth* for the FairGuard
   logic copied verbatim into our recipe (see [below](#fairguard-logic-fix-in-wa-guard-first-then-re-copy)).
   It is **not** merged or rebased; it is copied.

A third repo sits underneath this one as a git submodule (`recipes/`) and is where the recipe
files actually live — see [The `recipes/` submodule](#the-recipes-submodule).

All absolute paths below are the canonical locations on the internal **CRM-Sinergi** machine.
If you are working on another clone, substitute your own clone root for
`/home/crm-sinergi/ClaudeCode/`.

- **Fork base:** tag `v7.2.3` (commit `a44bc7d8`)
- **Fork base date:** 2026-09-22
- **Our branch:** `fairguard`
- **Our fork (remote `origin`):** <https://github.com/mnfaiwork-ops/fairguard-desktop.git>
- **Upstream (remote `upstream`):** <https://github.com/ferdium/ferdium-app.git>
- **Upstream default branch (integration target):** `develop` — **not** `main`

The remote names used below (`origin`, `upstream`) are the ones already configured in this
clone. Confirm them at any time with:

```bash
git remote -v
```

## Sync recipe

To pull the latest upstream work onto our `fairguard` branch:

```bash
cd /home/crm-sinergi/ClaudeCode/fairguard-desktop

git fetch upstream
git checkout fairguard
git rebase upstream/develop
```

Resolve conflicts as described below, then push to our fork:

```bash
git push --force-with-lease origin fairguard
```

`--force-with-lease` is required because rebasing rewrites the branch history. It refuses to
push if someone else has updated `origin/fairguard` since your last fetch, which protects
against clobbering a teammate's work.

> **Recipes are not updated by this rebase.** `recipes/` is a git submodule (a separate
> repository — see [The `recipes/` submodule](#the-recipes-submodule)). `git rebase upstream/develop`
> moves the *outer* commit pointer only; it does **not** pull in recipe content. To refresh
> recipe contents you must work *inside* the submodule.

## The `recipes/` submodule

`recipes/` is **not** a normal directory in this repo — it is a **git submodule**. Confirm it:

```bash
cat .gitmodules
#   [submodule "recipes"]
#           path = recipes
#           url = https://github.com/mnfaiwork-ops/ferdium-recipes.git
#           branch = main

git ls-files -s recipes
#   160000 bc708f6a... 0  recipes      <-- mode 160000 == a gitlink, not a tree
```

The consequences are easy to trip over:

- The recipe files live in the **submodule's** own repository, not in `fairguard-desktop`.
- Editing `recipes/…` and committing on the outer `fairguard` branch captures **nothing**
  (at best it records an opaque gitlink while the content stays uncommitted; a later
  `git submodule update` throws that content away).
- Committing **inside** the submodule records the recipe content in the recipes repo, and
  leaves the outer repo with a dirty gitlink that you then commit to record the new SHA.

The submodule is our fork of the Ferdium recipes repo
(<https://github.com/mnfaiwork-ops/ferdium-recipes.git>, repointed from upstream). Our recipe
lives at:

```
fairguard-desktop/recipes/                  <- submodule root (its own git repo)
└── recipes/                                <- the recipes folder inside the submodule
    └── whatsapp-fairguard/                 <- our recipe
```

So the real recipe path is `fairguard-desktop/recipes/recipes/whatsapp-fairguard/` — the
submodule root `recipes/`, then the recipes folder `recipes/` inside it.

> **Note:** `whatsapp-fairguard/` is created by Task 5 of the implementation plan. Until then
> only the official `whatsapp/` recipe exists at that level, so the paths below are the
> *intended* layout, not yet materialised.

## What conflicts, and why

The FairGuard rebrand (app name, icons, colours, product strings, the Electron/React shell)
is applied as **local commits** on top of the upstream base — it is *not* done with a
Ferdium plugin or build-time patch. Because the rebrand edits the same files upstream keeps
touching, **those local commits are expected to conflict on every sync.** This is normal and
not a sign that something is broken.

When a rebase stops on a conflict:

```bash
git status                 # see which files conflicted
# edit the files, keeping the upstream changes plus our FairGuard rebrand
git add <resolved-files>
git rebase --continue
```

Useful escape hatches:

```bash
git rebase --abort         # bail out and return to the pre-rebase state
git rebase --skip          # drop the current commit entirely
```

Keep the rebrand commit(s) small and focused so each conflict stays easy to resolve.

## FairGuard logic: fix in wa-guard first, then re-copy

The FairGuard logic itself does **not** live in this repository. It lives in a separate repo:

```
/home/crm-sinergi/ClaudeCode/wa-guard/src/
```

### What is copied, and what is not

The recipe directory holds files from **two different provenances**. Do not blur the line:

**Copied verbatim from `wa-guard/src/`** — byte-for-byte, including the stylesheet:

| File | Notes |
| --- | --- |
| `rules.js` | verbatim |
| `counter.js` | verbatim |
| `hash.js` | verbatim |
| `wa-dom.js` | verbatim |
| `badge.js` | verbatim |
| `badge.css` | verbatim — **not a `.js` file, but it must be copied too** |

**Not copied from `wa-guard`** — derived from the official Ferdium *whatsapp* recipe or
authored directly in the recipe, and maintained there:

- `index.js`, `package.json`, `service.css`, `darkmode.css`, `webview-unsafe.js` — derived
  from the official Ferdium whatsapp recipe (manifest / plumbing / base styling).
- `webview.js`, `glue.js`, `settings-panel.js` — authored in the recipe itself.

Do not hand-edit the verbatim set inside the recipe: the next copy overwrites it and the two
copies drift apart silently. To catch drift in the verbatim set, compare bytes:

```bash
cmp /home/crm-sinergi/ClaudeCode/wa-guard/src/badge.js \
    /home/crm-sinergi/ClaudeCode/fairguard-desktop/recipes/recipes/whatsapp-fairguard/fairguard/badge.js
```

(`cmp` prints nothing when the files are identical.)

### Corrected copy procedure

**After any FairGuard logic fix, re-copy the verbatim set and commit it inside the submodule.**
The order matters — the content must be committed *inside* `recipes/` (the submodule), and only
then is the new gitlink recorded in the outer fork.

1. Fix the logic in `/home/crm-sinergi/ClaudeCode/wa-guard/src/` and commit it there.

2. Re-copy the verbatim set into the submodule's recipe. The `.js` modules go into the
   `fairguard/` subdir; `badge.css` goes to the **recipe root** (it sits next to `webview.js`,
   which does `injectCSS(path.join(__dirname, 'badge.css'))`):

   ```bash
   R=/home/crm-sinergi/ClaudeCode/fairguard-desktop/recipes/recipes/whatsapp-fairguard
   cp /home/crm-sinergi/ClaudeCode/wa-guard/src/rules.js \
      /home/crm-sinergi/ClaudeCode/wa-guard/src/hash.js \
      /home/crm-sinergi/ClaudeCode/wa-guard/src/counter.js \
      /home/crm-sinergi/ClaudeCode/wa-guard/src/wa-dom.js \
      /home/crm-sinergi/ClaudeCode/wa-guard/src/badge.js  "$R/fairguard/"
   cp /home/crm-sinergi/ClaudeCode/wa-guard/src/badge.css  "$R/badge.css"
   ```

3. Commit **inside the submodule** and push it to our recipes fork (branch `main`, which is
   what `.gitmodules` tracks — do NOT invent a separate branch, or the outer fork's
   `git submodule update` will never see it):

   ```bash
   cd /home/crm-sinergi/ClaudeCode/fairguard-desktop/recipes
   git add recipes/whatsapp-fairguard
   git commit -m "fix(fairguard): sync verbatim copy from wa-guard"
   git push origin main
   ```

4. Back in the outer fork, record the new gitlink SHA and push:

   ```bash
   cd /home/crm-sinergi/ClaudeCode/fairguard-desktop
   git add recipes
   git commit -m "chore(recipe): bump gitlink to latest recipe commit"
   git push
   ```

   The outer commit contains only the pointer bump (`recipes` → new SHA) — the recipe content
   itself lives in step 3's commit.

Remember: `git rebase upstream/develop` on the outer fork does **not** update recipe contents.
The submodule is a separate repository, so recipe changes only travel through the submodule.
