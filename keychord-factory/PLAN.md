# Keychord Factory - Application Plan

## Purpose
A keyboard shortcut management system that:
1. Defines shortcuts at appropriate scope (OS-wide or VSCode-only)
2. Ensures same keystrokes work in both WSL and Windows
3. Tracks all shortcuts in a master registry
4. Detects conflicts with VSCode and Office apps

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Keychord Factory                         │
├─────────────────────────────────────────────────────────────┤
│  Registry (master list)                                     │
│  ├── keychord definitions                                   │
│  ├── scope (os-wide | vscode | app-specific)               │
│  ├── action (command, script, bridge message)              │
│  └── conflict status                                        │
├─────────────────────────────────────────────────────────────┤
│  Conflict Detector                                          │
│  ├── VSCode default keybindings                            │
│  ├── Office 365 shortcuts                                   │
│  ├── Windows system shortcuts                               │
│  └── Custom app shortcuts                                   │
├─────────────────────────────────────────────────────────────┤
│  Deployers                                                  │
│  ├── Windows: AutoHotkey script generator                  │
│  ├── WSL/Linux: sxhkd or xbindkeys config generator        │
│  ├── VSCode: keybindings.json manager                      │
│  └── Sync service (keeps Windows/WSL aligned)              │
└─────────────────────────────────────────────────────────────┘
```

## Components

### 1. Keychord Registry (`registry.json`)
```json
{
  "keychords": [
    {
      "id": "focus-claude-terminal",
      "chord": "ctrl+alt+t",
      "scope": "os-wide",
      "action": {
        "type": "bridge",
        "command": "FOCUS",
        "args": {"target": "terminal"}
      },
      "description": "Focus Claude TMux session",
      "conflicts": []
    }
  ]
}
```

### 2. Conflict Database
Pre-populated with known shortcuts from:
- **VSCode**: https://code.visualstudio.com/shortcuts/keyboard-shortcuts-windows.pdf
- **Office**: Common Excel, Word, Outlook shortcuts
- **Windows**: Win+key combinations, Ctrl+Alt+Del, etc.

### 3. OS-Wide Deployer (Windows)
Generates AutoHotkey script:
```ahk
^!t::  ; Ctrl+Alt+T
    ; Activate VSCode and send bridge command
    Run, wsl.exe -e bash -c "echo 'FOCUS {\"target\":\"terminal\"}' >> /tmp/vscode-bridge-commands"
    WinActivate, ahk_exe Code.exe
return
```

### 4. OS-Wide Deployer (WSL/Linux)
Generates sxhkd config:
```
ctrl + alt + t
    echo 'FOCUS {"target":"terminal"}' >> /tmp/vscode-bridge-commands
```

### 5. VSCode Deployer
Manages `~/.config/Code/User/keybindings.json` for VSCode-scoped shortcuts.

### 6. Sync Service
- Detects environment (Windows native vs WSL)
- Routes keypress to correct handler
- Ensures consistent behavior across contexts

## Supported Keychord Patterns
- `ctrl+x`
- `ctrl+shift+x`
- `ctrl+alt+x`
- `ctrl+shift+alt+x`
- `win+x` (Windows only)
- Sequences: `ctrl+k ctrl+c` (VSCode style)

## Implementation Phases

### Phase 1: Core Registry
- [ ] JSON schema for keychord definitions
- [ ] Registry CRUD operations
- [ ] Conflict detection against static lists

### Phase 2: VSCode Integration
- [ ] keybindings.json generator
- [ ] Read existing bindings to detect conflicts
- [ ] Bridge extension enhancements

### Phase 3: Windows Integration
- [ ] AutoHotkey script generator
- [ ] Installer/launcher for AHK script
- [ ] WSL-to-Windows communication (via named pipes or file)

### Phase 4: WSL/Linux Integration
- [ ] sxhkd config generator
- [ ] xbindkeys alternative
- [ ] Startup integration

### Phase 5: Conflict Intelligence
- [ ] Parse VSCode default keybindings dynamically
- [ ] Office 365 shortcut database
- [ ] Suggest available chords

### Phase 6: UI (Optional)
- [ ] Web UI for managing shortcuts
- [ ] Visual conflict map
- [ ] Import/export configurations

## Files Structure
```
keychord-factory/
├── SUMMARY.md
├── PLAN.md
├── src/
│   ├── registry.py          # Core registry management
│   ├── conflicts.py         # Conflict detection
│   ├── deployers/
│   │   ├── vscode.py        # VSCode keybindings.json
│   │   ├── autohotkey.py    # Windows AHK scripts
│   │   └── sxhkd.py         # Linux hotkey daemon
│   └── sync.py              # Cross-platform sync
├── data/
│   ├── registry.json        # User's keychords
│   ├── vscode-defaults.json # Known VSCode shortcuts
│   └── office-defaults.json # Known Office shortcuts
└── generated/
    ├── keychords.ahk        # Generated AHK script
    ├── sxhkdrc              # Generated sxhkd config
    └── keybindings.json     # Generated VSCode bindings
```

## Immediate Next Steps
1. Create `registry.py` with basic schema
2. Build conflict detector with VSCode defaults
3. Generate working AutoHotkey script for Windows-side global shortcuts
4. Test round-trip: Windows hotkey → WSL → VSCode bridge → TMux focus
