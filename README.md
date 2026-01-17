# IDEasPlatform

Exploration of VS Code UI control mechanisms for agent-based development workflows. This project contains two VS Code extensions at different stages of development.

## Extensions

### ui-probe

A preliminary exploration of VS Code UI state introspection. Logs real-time information about editors, terminals, tabs, and UI events.

**Location:** `ui-probe/`

**Commands:**

- `UI Probe: Log State` - Capture current UI state to output channel and file
- `UI Probe: Test Chameleon Capabilities` - Test editor decoration and positioning

**Purpose:** POC for understanding what UI state is accessible to extensions, informing future agent-UI interaction patterns.

### vscode-command-bridge

File-based IPC bridge allowing external processes (including tmux sessions) to trigger VS Code commands.

**Location:** `keychord-factory/src/vscode-bridge/`

**Commands:**

- `Bridge: Open TMux Terminal` - Create/attach to a tmux session
- `Bridge: Execute Command from File` - Process commands from the bridge file

**Supported bridge commands:**

- `TMUX` - Open tmux terminal
- `TERMINAL` - Open standard terminal
- `PANEL` - Toggle panels (terminal, output, problems, debug)
- `FOCUS` - Focus UI elements (editor, terminal, sidebar, explorer)
- `EDITOR` - Open files at specific locations
- `VSCODE` - Execute arbitrary VS Code commands

**Purpose:** Foundation for keyboard-first, cross-platform workspace control via keychord-factory.

## Development

Both extensions use Bun for package management and TypeScript for type safety.

```bash
# ui-probe
cd ui-probe
bun install
bun run compile

# vscode-command-bridge
cd keychord-factory/src/vscode-bridge
bun install
bun run compile
```

## Project Structure

```text
IDEasPlatform/
├── ui-probe/                    # UI state logging extension
│   ├── src/extension.ts
│   ├── package.json
│   └── tsconfig.json
├── keychord-factory/            # Keyboard shortcut management system
│   ├── PLAN.md                  # Architecture and roadmap
│   ├── SUMMARY.md
│   └── src/
│       ├── vscode-bridge/       # VS Code extension for IPC
│       │   ├── src/extension.ts
│       │   ├── package.json
│       │   └── tsconfig.json
│       ├── tmux_controller.py   # Python tmux integration
│       └── vscode_bridge.py     # Python bridge client
└── .beads/                      # Issue tracking
```

## Related Projects

This is part of the `c:\myStuff\` workspace focused on:

- Agent-assisted development tooling
- Keyboard-first UI patterns
- Cross-platform workspace orchestration
