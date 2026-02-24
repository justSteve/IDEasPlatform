# IDEasPlatform — VS Code UI Control Mechanisms

**Zgent Status:** zgent (in-process toward Zgent certification)
**Role:** Consumer — VS Code extension providing UI control for the enterprise
**Bead Prefix:** `ide`

## STOP — Beads Gate (Read This First)

**This repo is beads-first. You MUST authorize work before doing it.**

Before making ANY substantive changes (creating/modifying files, installing deps, changing config), do this:

```bash
bd ready                    # See if there is already an open bead for this work
bd create -t "Short title"  # Create one if not — YOU own this, do not ask the user
bd update <id> --status in_progress  # Claim it
```

When done:
```bash
bd close <id>               # Mark complete
bd sync                     # Sync with git
```

Reference the bead ID in your commit messages: `[ide-xxx] description`.

**No bead = no work.** Minor housekeeping (typos, status fields) is exempt. Everything else gets a bead. If in doubt, create one — it is cheap. See `.claude/rules/beads-first.md` for the full rule.

**This is not optional. This is not a Gas Town thing. This is how THIS repo works, every session, every instance.**

## What This Is

IDEasPlatform is the enterprise VS Code extension zgent. It provides UI control mechanisms that enable agent-driven IDE interactions across the Gas Town enterprise.

Features include:
- **Detached Console** — Launch independent command prompts via `tasks.json`
- **UI Probe** — Real-time logging of VS Code UI events (editors, terminals, etc.)
- **Dev Container** — Standardized Node.js + TypeScript development environment

The extension (`ui-probe`) activates in VS Code and probes UI state, providing the foundation for programmatic IDE control across the zgent ecosystem.

## What Every Claude Instance Must Understand

1. **Beads-first is non-negotiable.** Read the gate at the top of this file. Use `bd` commands. No exceptions.
2. **Consumer permissions.** Standard zgent access — read enterprise, write own repo. See `.claude/rules/zgent-permissions.md`.
3. **This is a VS Code extension.** Written in TypeScript, targets VS Code ^1.90.0. Build with `npm run compile`, watch with `npm run watch`.

## Graduation Status

- **Standard artifacts deployed** — beads-first, zgent-permissions, settings.json, .gitattributes ✓

## Conventions

- Beads-first: self-bead for non-trivial work, reference bead ID in commits
- Enterprise permissions: read sibling repos, write only own path
