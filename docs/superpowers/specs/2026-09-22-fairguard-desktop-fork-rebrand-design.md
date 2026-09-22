# FairGuard Desktop — Fork Ferdium + Rebrand — Design

Turn Ferdium into a FairGuard-branded Electron desktop app that runs several
organic WhatsApp numbers in one window, each with its own FairGuard coach badge.

Status: design approved in chat. No code written yet.
Date: 2026-09-22
Supersedes (in part): `2026-09-22-fairguard-ferdium-recipe-design.md` (Approach A,
recipe-in-stock-Ferdium). That spec assumed **no fork**. This one forks, because
Fai now wants an app carrying FairGuard's own name and icon. The FairGuard
*implantation* mechanism from Approach A is unchanged and still authoritative.

---

## 1. Context

FairGuard (`wa-guard`) is a Chrome MV3 extension: a read-only coach badge on
WhatsApp Web that counts new chats, sent messages, and pause-between-contacts,
and colours a warning so CS on **organic** numbers can pace themselves below
Meta's ban thresholds. It never types, sends, blocks buttons, or reads message
content. Fase A logic is done and passes 47 unit tests but has **not** yet been
proven against live WhatsApp Web (see `TESTING.md`).

The September spike (`04 Specs Archive/fairguard/2026-09-22-spike-fork-ferdium-multiwha.md`)
asked: "fork Ferdium?" Answer: multi-WhatsApp is **built into** Ferdium, and a
recipe can carry FairGuard, so a fork is **not needed for capability**. The only
legitimate reason to fork is a **product** one: Fai wants an app that is
FairGuard end-to-end — its own name, icon, and copy, not "Ferdium".

**Fai's decision (2026-09-22, this session): fork + full visual rebrand.** The
ban-risk trade-off (Electron = third-party client) was already accepted in the
spike; the fork does not change it.

Scope this round: **fork + rebrand, running locally.** Prove it works on one
machine before rolling to 13 laptops. Sync with FairTrack CS is a **separate
later project** (see §11).

## 2. Hard limits (unchanged, non-negotiable)

The fork preserves FairGuard's boundaries exactly:

| Allowed | Not allowed |
|---|---|
| Read the WhatsApp Web screen | Type / send messages |
| Count and display numbers | Blast, broadcast, send queues |
| Store numbers locally | Send any data off the machine |
| Show warning colours | Block / disable the send button |

Message content is never read. No network requests from FairGuard. Customer
numbers are never stored — only a salted hash, and the salt differs per store.

## 3. Approach (decided)

**Fork `ferdium/ferdium-app` (Apache-2.0) → rebrand the visible shell → lock to
WhatsApp → implant FairGuard via the existing recipe/webview mechanism.**

Two layers, deliberately decoupled:

- **Shell layer (Electron + React + MobX)** — rebrand: name, icon, splash,
  window title, menus, settings, About, tray, updater. **User-agent and technical
  identifiers are NOT changed** (see §5) so WhatsApp's detection surface does not
  grow.
- **Recipe layer (`whatsapp-fairguard`)** — carried over verbatim from Approach A.
  `rules.js`, `counter.js`, `hash.js`, `wa-dom.js`, `badge.js` are copied
  byte-for-byte from `wa-guard/src/`; only `content.js`→`glue.js` and the options
  page are rewritten.

Considered and rejected:

- **Recipe in stock Ferdium, no fork** (Approach A) — cheapest, but leaves the
  product branded "Ferdium". Fai explicitly wants the FairGuard brand.
- **Standalone Electron wrapper from scratch** — re-derives multi-service
  isolation, updater, tray, session partitioning that the fork inherits for free.

**Honest note:** the fork is more maintenance than Approach A — Electron app must
be rebuilt per OS and upstream changes followed manually. This is accepted as the
price of the brand.

## 4. Repository & layout

**Where this spec lives now:** in `wa-guard/docs/superpowers/specs/`, because the
fork repo does not exist yet. Once `fairguard-desktop` is forked, this spec is
copied into its `docs/superpowers/specs/`. `wa-guard` keeps the original.

New repo, a clean fork so upstream can be tracked:

```
/home/crm-sinergi/ClaudeCode/fairguard-desktop/     ← NEW repo (fork of ferdium/ferdium-app)
├── (ferdium-app source, rebranded at the shell layer)
├── recipes/
│   └── whatsapp-fairguard/            ← FairGuard recipe (bundled, not in recipes/dev/)
│       ├── package.json               id/name/version edited; serviceURL unchanged
│       ├── index.js                   from official, UNCHANGED (user-agent fix inherited)
│       ├── icon.svg                   from official
│       ├── service.css                from official, UNCHANGED
│       ├── darkmode.css               from official, UNCHANGED
│       ├── webview-unsafe.js          from official, UNCHANGED
│       ├── webview.js                 official body + FairGuard init appended (one edit)
│       ├── badge.css                  copied from wa-guard, UNCHANGED
│       └── fairguard/
│           ├── rules.js               copied verbatim
│           ├── counter.js             copied verbatim
│           ├── hash.js                copied verbatim
│           ├── wa-dom.js              copied verbatim
│           ├── badge.js               copied verbatim
│           ├── glue.js                NEW — ex-content.js, storage swapped
│           └── settings-panel.js      NEW — replaces options.html + options.js
├── UPSTREAM.md                        how to sync back to ferdium/ferdium-app
└── docs/superpowers/specs/            this spec is COPIED here once the fork exists

/home/crm-sinergi/ClaudeCode/wa-guard/    ← STAYS the source of truth for FairGuard logic
└── src/{rules,counter,hash,wa-dom,badge}.js , badge.css
```

**Why a new repo, not a folder in `wa-guard`:** a fork must track `ferdium-app`
as its git upstream; mixing it into `wa-guard` (which tracks its own history)
makes both harder. `wa-guard` remains the place FairGuard logic is fixed; the
recipe in the fork holds verbatim copies. When WhatsApp breaks the DOM, the fix
is "fix `wa-dom.js` once in `wa-guard`, recopy into the fork, rebuild."

The recipe goes in `recipes/` (bundled in the fork), **not** `recipes/dev/`:
`recipes/dev/` is Ferdium's developer mechanism, and this app is ours to ship.

## 5. Rebrand — surface to be swept

App is **locked to WhatsApp only**, so copy that can never appear (Add-Service
catalog, 100+ service names) is de-prioritised. Sweep scope = **every string CS
can see in the normal flow.**

| Surface | From | To |
|---|---|---|
| App name | `Ferdium` | `FairGuard` |
| App icon (Linux 512px, Windows `.ico`) | ferdium.svg/png | upscaled FairGuard PNG |
| Splash screen | Ferdium logo | FairGuard logo |
| Window title | `Ferdium` | `FairGuard — WhatsApp` |
| App menus (File/Edit/View/Help) | `Ferdium...` | `FairGuard...` |
| Settings (About/Version/app-name, all visible tabs) | Ferdium | FairGuard |
| Onboarding / first-run setup | Ferdium | FairGuard, straight to WhatsApp |
| Tray tooltip + menu | Ferdium | FairGuard |
| Update notifications | Ferdium | FairGuard |
| Error dialogs that surface | Ferdium | FairGuard |
| **User-agent & technical identifiers** | `Ferdium/Electron` | **NOT changed — preserved** |
| Add-Service catalog | 100+ services | **locked: WhatsApp only** |

**Method:** `grep -ri ferdium` across the repo, classify every hit (visible /
not-visible), edit only visible ones. The lock to WhatsApp-only is enforced by
restricting the service list, not by deleting the catalog machinery (keeps the
fork closer to upstream = easier syncs).

**Icon limitation (accepted):** the only FairGuard master is PNG ≤128×128
(`wa-guard/src/icons/`), no SVG. Electron needs up to 1024px plus `.ico`/`.icns`.
Icons will be **upscaled** — slightly soft at large sizes. Acceptable for an
internal 13-laptop tool; can be replaced later if a higher-resolution master
appears. Recorded as a known trade-off, not hidden.

## 6. FairGuard implantation (carried over from Approach A)

Mechanism unchanged. Summary (details in Approach A §5–§8):

- `webview.js` = official recipe body **plus** FairGuard init appended. Init order:
  `require rules/hash/counter/wa-dom/badge/glue` → `injectCSS(badge.css)` →
  `FairGuardGlue.mulai(document)` → hook `FairGuardGlue.gambar()` into the existing
  1-second `Ferdium.loop`.
- `glue.js` = `content.js` with three surgical changes: startup reads
  `localStorage` synchronously; writes use `localStorage.setItem`; the
  `chrome.storage.onChanged` listener is dropped and replaced by
  `setSetelan(next)`.
- Everything runs in `webview.js`'s isolated world. FairGuard only reads DOM and
  writes its own overlay, so context isolation is fine; `injectJSUnsafe` is not
  needed for FairGuard (kept for the official notification counter).

## 7. Storage & multi-account isolation

Each WhatsApp account is a separate service instance with its own session
partition (`persist:service-<id>`). `localStorage` is scoped per partition and
origin, so **each account gets its own FairGuard store automatically** — separate
counts, separate salt, separate thresholds, at zero code cost.

Keys (namespaced to never collide with WhatsApp's own localStorage):

```
fairguard.state     today's counts (tanggal, pesanTerkirim, chatBaru, idTerakhir[], …)
fairguard.setelan   { batasChatBaru, jedaMinDetik, diagnosa }
fairguard.salt      per-store random salt, generated once, never leaves the machine
```

## 8. Settings panel

`options.html` + `options.js` become `settings-panel.js`, a DOM overlay injected
into the page. The badge click is taken (expand/collapse), so a standalone gear
button is injected **next to** the badge — its own element, **not** inside the
badge DOM, so `badge.js` stays a verbatim copy (matches the commit on Approach A).
Same three fields as the Chrome options page: `batasChatBaru`, `jedaMinDetik`,
`diagnosa`, plus the privacy copy. Save writes `localStorage` then calls
`FairGuardGlue.setSetelan(next)`.

## 9. UX — switching numbers

Sidebar list of WhatsApp accounts (one entry per number, e.g. "CS Reglow 1",
"CS 2"), click to switch. Each entry keeps its own badge. This is how Ferdium
already presents services, so the shell change is minimal — mainly relabelling
and locking the list to WhatsApp.

## 10. Distribution & updates

- Public GitHub release repo (pattern already used: `fairguard-dist`,
  `fairtrack-cs-releases`).
- Electron auto-updater repointed from Ferdium's server to ours.
- **Build targets: Windows (.exe/NSIS) and Linux (AppImage/deb).** Two build
  pipelines. Current dev machine is Linux (Ubuntu, Node 22) — Linux builds can be
  done here; Windows builds need a Windows runner or CI.

## 11. Out of scope (this round)

- **Sync with FairTrack CS** (record which CS holds which number, and when) — a
  separate project, brainstormed and specced later. Explicitly deferred by Fai.
- Rollout to the 13 laptops beyond designing the mechanism.
- Fase B/C FairGuard features.
- `.icns` / macOS build.
- A higher-resolution master logo.

## 12. Testing

- **47 unit tests stay green** — pure modules are byte-identical copies, so
  `npm test` in `wa-guard` still covers `rules`/`counter`/`hash`.
- Add a small test for `glue.js` storage functions against a `localStorage` shim:
  round-trip `state`/`setelan`/`salt`, default-on-empty.
- **DOM proving unchanged** from `SPEC.md`/`TESTING.md`: run one account for a
  day, watch counts, use the diagnosa row if numbers stall. Fase A being unproven
  live is a pre-existing risk the fork neither adds nor removes.
- **Multi-account check:** add the recipe twice, confirm two independent badges
  with independent counts — validates per-partition isolation.
- **Rebrand check:** open every visible surface (§5) and confirm no "Ferdium"
  string remains; confirm the app runs WhatsApp-only.

## 13. Risks & honest notes

- **Fork maintenance** — heavier than Approach A; upstream changes followed by
  hand. Accepted as the price of the brand.
- **Icon softness** — upscaled from ≤128px (§5). Accepted.
- **WhatsApp DOM churn** — the real long-term cost, same as today. Isolated to
  `wa-dom.js`; fix once, recopy, rebuild.
- **Fase A still unproven on live WhatsApp Web** — the fork does not change this;
  local testing doubles as both prove-out and the fork-works check.
- **This supersedes the "no fork needed" conclusion** of the Approach A spec and
  the September spike — intentionally, on product grounds, not technical ones.
- **"Coach, not sender" is fully preserved.**

## 14. Open items (for plan time)

- Exact list of shell files to edit for the rebrand (from the `grep -ri ferdium`
  sweep) — enumerated at plan time, not here.
- Where the recipe copy lives inside the fork vs pulled at build time (vendored
  copy recommended, with a sync note in `UPSTREAM.md`).
- Windows build runner (local Wine vs GitHub Actions Windows runner).
- CI for both OS builds.

## 15. Related

- `docs/superpowers/specs/2026-09-22-fairguard-ferdium-recipe-design.md` — Approach A (recipe mechanism; still authoritative for the FairGuard layer)
- `SPEC.md` — FairGuard Fase A spec
- `TESTING.md` — manual test checklist
- Obsidian: `04 Specs Archive/fairguard/2026-09-22-spike-fork-ferdium-multiwha.md`
- Obsidian: `02 Areas/Internal Tooling & Projects.md` — FairGuard log
