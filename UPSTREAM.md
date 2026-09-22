# Staying in Sync with Upstream Ferdium

This repository is a fork of [`ferdium/ferdium-app`](https://github.com/ferdium/ferdium-app) (Apache-2.0).
It is a FairGuard-branded desktop app (WhatsApp only) that plants the FairGuard coach
badge through the Ferdium recipe mechanism.

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

## FairGuard logic: fix in `wa-guard` first, then re-copy

The FairGuard logic itself does **not** live in this repository. It lives in a separate repo:

```
/home/crm-sinergi/ClaudeCode/wa-guard/src/
```

`wa-guard/src/*.js` is **copied verbatim** into the recipe directory of this fork:

```
recipes/recipes/whatsapp-fairguard/fairguard/
```

Do not hand-edit FairGuard logic inside the recipe. Any change made only in the copied recipe
will be overwritten by the next copy, and the two copies will silently drift apart.

**After any FairGuard logic fix, re-copy `wa-guard/src/*.js` into the recipe.** The order
matters:

1. Fix the logic in `/home/crm-sinergi/ClaudeCode/wa-guard/src/` and commit it there.
2. Re-copy the files into this fork's recipe:

   ```bash
   cd /home/crm-sinergi/ClaudeCode/fairguard-desktop
   cp /home/crm-sinergi/ClaudeCode/wa-guard/src/*.js \
      recipes/recipes/whatsapp-fairguard/fairguard/
   ```

3. Stage, commit, and push the refreshed copy on the `fairguard` branch.

Only re-copy `.js` files. Assets and metadata that live only in the recipe (icons, manifest,
recipe `index.js` / `package.json` plumbing) are maintained directly in this repo and must not
be overwritten by the copy step.
