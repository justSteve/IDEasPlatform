# tmuxPlans/README.md

# tmuxPlans

This directory contains a structured set of development plans for integrating **tmux** into the IDEAsPlatform workflow. The goal is to support agent‑driven development inside VSCode using persistent, scriptable, multi‑pane execution environments.

These documents capture both the **product** (the tmux layout and scripts) and the **process** (how layouts evolve, how scripts are designed, and how agents should interact with them).

## Files

- **01-overview.md**  
  High-level explanation of why tmux is part of the platform and what problems it solves.

- **02-scripting-process.md**  
  A detailed guide to the methodology of designing, prototyping, and evolving tmux scripts.

- **03-layout-spec.md**  
  A formal specification of the tmux layout used for agent demonstrations, including a complete annotated script.

- **04-agent-integration.md**  
  A contract describing how agents should interact with the tmux environment.

## Purpose

These plans are intended to:

- Provide a reproducible foundation for agent-driven development.
- Document the reasoning behind architectural decisions.
- Enable future contributors (human or agent) to extend the system safely.
- Establish conventions for layout, naming, and pane/window semantics.

## How to Use

1. Read **01-overview.md** to understand the big picture.
2. Study **02-scripting-process.md** to learn how tmux scripts should be developed.
3. Use **03-layout-spec.md** as the authoritative reference for the current layout.
4. Follow **04-agent-integration.md** when building or modifying agent workflows.

Future updates should follow the conventions described in `02-scripting-process.md`.


# tmuxPlans/01-overview.md

# Overview: Why tmux in the IDEAsPlatform

## Purpose

This document explains the role of **tmux** in the IDEAsPlatform architecture and why it is essential for agent-driven development inside VSCode.

## The Core Problem

Agents need to:

- Execute code in multiple languages (Python, JavaScript, Go, etc.)
- Demonstrate code step-by-step
- Maintain state across interactions
- Run long-lived processes
- Show logs, tests, and runtime behavior in real time
- Survive editor restarts, SSH disconnects, and environment changes

VSCode’s integrated terminal is not designed for this. It lacks:

- Persistence  
- Multi-session awareness  
- Scriptable layouts  
- Reliable state retention  

## Why tmux Solves This

tmux provides:

### 1. Persistent Execution Environments
Sessions survive:

- VSCode restarts  
- SSH disconnects  
- Crashes  
- Workspace changes  

Agents can run servers, REPLs, watchers, and demos without interruption.

### 2. Scriptable, Reproducible Layouts
A tmux script can define:

- Which windows exist  
- How panes are arranged  
- What each pane runs  
- Pane titles and semantics  

This creates a deterministic environment that agents can rely on.

### 3. Multi-Language Isolation
Each pane can run a different runtime:

- Python in one  
- Node.js in another  
- Go in a third  

No interference. No clutter.

### 4. Agent-Friendly I/O
Agents can:

- Send commands to specific panes  
- Read output  
- Demonstrate workflows  
- Pause between steps  
- Answer questions interactively  

### 5. VSCode as the UI Layer
VSCode becomes:

- The editor  
- The visualization layer  
- The communication hub  

tmux becomes:

- The execution substrate  
- The stateful runtime environment  

## Architectural Summary

**VSCode = UI + editing**  
**tmux = execution + persistence**  
**Agents = orchestrators**

This separation of concerns is clean, robust, and future-proof.


# tmuxPlans/02-scripting-process.md

# The tmux Scripting Process

## Purpose

This document captures the *process* of designing, prototyping, and evolving tmux scripts. The goal is to preserve the reasoning, not just the final script.

## Philosophy

Treat tmux scripts like:

- Infrastructure-as-code  
- A reproducible environment definition  
- A contract between humans and agents  

The script should be:

- Declarative in intent  
- Safe to re-run  
- Easy to extend  
- Fully documented  

## Step 1: Prototype Interactively

Start manually:

```bash
tmux new -s agent-demo
```

Experiment with:

- Creating windows  
- Splitting panes  
- Running commands  
- Observing behavior  

Use introspection:

```bash
tmux list-sessions
tmux list-windows -t agent-demo
tmux list-panes -t agent-demo:run -F '#{pane_index} #{pane_title}'
```

Document your findings in a scratch file.

## Step 2: Capture a Minimal Script

Begin with a simple, linear script:

```bash
tmux new-session -d -s "$SESSION_NAME" -n dev
tmux new-window -t "$SESSION_NAME" -n run
tmux new-window -t "$SESSION_NAME" -n logs
```

This encodes the *existence* of the layout.

## Step 3: Add Panes

Extend the script to recreate your manual layout:

```bash
tmux select-window -t "$SESSION_NAME:dev"
tmux split-window -h
```

Test repeatedly.

## Step 4: Add Idempotency

Avoid destroying active work.

Check for:

- Existing sessions  
- Existing windows  
- Existing panes  

Use helpers:

```bash
tmux_has_session() { ... }
tmux_in() { ... }
```

These helpers document intent.

## Step 5: Document Semantics, Not Mechanics

Instead of:

```bash
# split window
```

Write:

```bash
# Pane 1: agent REPL
# Pane 0: developer shell
```

Agents rely on these semantics.

## Step 6: Seed Commands Carefully

Use commented examples:

```bash
# tmux_in send-keys -t run.0 'python app.py' C-m
```

This provides templates without forcing behavior.

## Step 7: Version the Layout

Treat layout changes like schema migrations.

Example:

```bash
# Layout version: 3
# - Added scratch pane
# - Named panes for agent use
```

## Step 8: Organize Scripts

Use a directory structure:

```
tmux/
  layout.sh
  layout.dev.sh
  README.md
```

Document evolution in the README.


# tmuxPlans/03-layout-spec.md

# tmux Layout Specification

## Purpose

This document defines the authoritative tmux layout used for agent-driven demonstrations. It includes naming conventions, pane semantics, and the complete annotated script.

## Session Naming

Sessions are named after the project:

```
agent-demo
myproject
```

## Windows and Roles

### `dev` Window
- Pane 0: Developer shell  
- Pane 1: Agent REPL / CLI  

### `run` Window
- Pane 0: App runtime  
- Pane 1: Test runner  
- Pane 2: Scratch shell  

### `logs` Window
- Pane 0: Application logs  
- Pane 1: System monitor  

## Pane Titles

Pane titles communicate semantics to agents:

- `dev-shell`
- `agent-repl`
- `app-runtime`
- `tests`
- `scratch`
- `app-logs`
- `system-monitor`

## Complete Annotated Script

```bash
#!/usr/bin/env bash
#
# tmux-agent-demo.sh
#
# Purpose:
#   Create or attach to a tmux session for agent-driven demos.
#   Layout:
#     - dev window: editor / agent REPL
#     - run window: app runtime panes
#     - logs window: logs and monitoring
#
# Usage:
#   ./tmux-agent-demo.sh myproject
#
# Notes:
#   - Idempotent: running it again should not destroy existing work.
#   - Safe: only creates windows/panes if they don't already exist.

set -euo pipefail

SESSION_NAME="${1:-agent-demo}"

tmux_has_session() {
  tmux has-session -t "$SESSION_NAME" 2>/dev/null
}

tmux_in() {
  tmux "$@" -t "$SESSION_NAME"
}

if ! tmux_has_session; then
  tmux new-session -d -s "$SESSION_NAME" -n dev
fi

if ! tmux list-windows -t "$SESSION_NAME" -F '#W' | grep -qx 'dev'; then
  tmux_in new-window -n dev
fi

tmux_in select-window -n dev

DEV_PANE_COUNT=$(tmux list-panes -t "$SESSION_NAME:dev" | wc -l)
if [ "$DEV_PANE_COUNT" -eq 1 ]; then
  tmux_in split-window -h -t dev
  tmux_in select-layout -t dev tiled
fi

tmux_in select-pane -t dev.0 \; select-pane -T 'dev-shell' || true
tmux_in select-pane -t dev.1 \; select-pane -T 'agent-repl' || true

if ! tmux list-windows -t "$SESSION_NAME" -F '#W' | grep -qx 'run'; then
  tmux_in new-window -n run
fi

tmux_in select-window -n run

RUN_PANE_COUNT=$(tmux list-panes -t "$SESSION_NAME:run" | wc -l)
if [ "$RUN_PANE_COUNT" -eq 1 ]; then
  tmux_in split-window -h -t run
  tmux_in split-window -v -t run.1
  tmux_in select-layout -t run tiled
fi

tmux_in select-pane -t run.0 \; select-pane -T 'app-runtime' || true
tmux_in select-pane -t run.1 \; select-pane -T 'tests' || true
tmux_in select-pane -t run.2 \; select-pane -T 'scratch' || true

if ! tmux list-windows -t "$SESSION_NAME" -F '#W' | grep -qx 'logs'; then
  tmux_in new-window -n logs
fi

tmux_in select-window -n logs

LOGS_PANE_COUNT=$(tmux list-panes -t "$SESSION_NAME:logs" | wc -l)
if [ "$LOGS_PANE_COUNT" -eq 1 ]; then
  tmux_in split-window -v -t logs
  tmux_in select-layout -t logs even-vertical
fi

tmux_in select-pane -t logs.0 \; select-pane -T 'app-logs' || true
tmux_in select-pane -t logs.1 \; select-pane -T 'system-monitor' || true

if [ -n "${TMUX:-}" ]; then
  tmux switch-client -t "$SESSION_NAME"
else
  tmux attach-session -t "$SESSION_NAME"
fi
```


# tmuxPlans/04-agent-integration.md

# Agent Integration with tmux

## Purpose

This document defines how agents should interact with the tmux environment. It establishes a contract for safe, predictable, and explainable behavior.

## Principles

Agents must:

- Respect window and pane semantics  
- Avoid destroying user work  
- Use pane titles to locate execution surfaces  
- Prefer `send-keys` for command execution  
- Avoid creating duplicate windows unless intentional  
- Document any layout modifications  

## Pane Discovery

Agents should locate panes by title:

```bash
tmux list-panes -a -F '#{pane_id} #{pane_title}'
```

Example:

- `app-runtime` → run the application  
- `tests` → execute test suites  
- `agent-repl` → interactive agent shell  

## Running Commands

Agents should use:

```bash
tmux send-keys -t app-runtime 'python app.py' C-m
```

This ensures:

- Commands run in the correct pane  
- Output is visible to the user  
- State persists across interactions  

## Demonstrations

When demonstrating code:

1. Start the app in `app-runtime`  
2. Tail logs in `app-logs`  
3. Run tests in `tests`  
4. Narrate each step  
5. Pause for user questions  
6. Continue execution  

## Modifying the Layout

Agents may:

- Add new windows  
- Add new panes  
- Title panes appropriately  

Agents must not:

- Delete existing panes  
- Rename windows without updating documentation  
- Destroy sessions  

## VSCode Integration

VSCode acts as:

- The editor  
- The visualization layer  
- The communication channel  

tmux acts as:

- The execution substrate  
- The persistent runtime  

Agents should assume VSCode terminals are attached to tmux sessions.

## Extensibility

Future enhancements may include:

- Workspace-aware session naming  
- Automated demo scripts  
- Agent-generated layout diffs  
- Multi-agent coordination via pane roles  