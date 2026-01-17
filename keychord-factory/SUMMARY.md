# Keychord Factory - Conversation Summary

## Origin
Conversation on 2026-01-16 exploring shared executable spaces between Claude and user.

## What Was Built

### 1. TMux Controller (`/root/gt/daemon/tmux_controller.py`)
Python module to programmatically control TMux sessions:
- `send_keys()` / `send_command()` - inject keystrokes/commands
- `capture_pane()` - read terminal content
- `execute_and_capture()` - run command and get output
- Works from CLI or as importable library

### 2. VSCode Command Bridge (`/root/gt/daemon/vscode-bridge/`)
VSCode extension enabling external control of the IDE:
- Watches `/tmp/vscode-bridge-commands` for instructions
- Executes VSCode commands (open panels, terminals, files)
- Commands: `TMUX`, `TERMINAL`, `PANEL`, `FOCUS`, `EDITOR`, `VSCODE`

### 3. Bridge Client (`/root/gt/daemon/vscode_bridge.py`)
Python client to send commands to VSCode via the bridge.

## Key Discovery
**Shared Executable Space**: TMux session visible in VSCode terminal where:
- Claude sends commands via `tmux send-keys`
- Claude reads output via `tmux capture-pane`
- User sees all activity in real-time
- User can type and Claude sees it
- Full bidirectional transparency

## Proven Capabilities
- Created TMux session `claude-test` in VSCode
- Sent commands, captured output including `gt status`
- Toggled VSCode panels programmatically
- TMux `display-popup` available for floating windows with position/size control

## Gap Identified
VSCode keybindings only work when VSCode has focus. Need system-wide keyboard shortcuts that work across:
- Windows desktop
- WSL2 environment
- Multiple applications

This led to the Keychord Factory concept.
