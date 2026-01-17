# Implementation Plan - UI Probe & Control

## Goal Description
Develop a mechanism to programmatically control VS Code UI elements (panels, views, editors) to enable rapid context switching between different workflows (e.g., Coding vs. Trading).
The immediate goal is to **enumerate visible UI containers** and then **test dynamic control** via `tasks.json` manipulation.

## User Review Required
- **Method of Enumeration**: We will use the VS Code Extension API (`vscode.window`) to query visible elements. Note that the API has limitations on "seeing" purely internal UI state (like exact pixel positions or non-exposed panels), but we will capture everything exposed (Editors, Terminals, Tab Groups).

## Proposed Changes

### UI Probe Extension (`ui-probe`)
#### [MODIFY] [extension.ts](file:///c:/myStuff/IDEasPlatform/ui-probe/src/extension.ts)
# Implementation Plan - UI Probe & Control

## Goal Description
Develop a mechanism to programmatically control VS Code UI elements (panels, views, editors) to enable rapid context switching between different workflows (e.g., Coding vs. Trading).
The immediate goal is to **enumerate visible UI containers** and then **test dynamic control** via `tasks.json` manipulation.

## User Review Required
- **Method of Enumeration**: We will use the VS Code Extension API (`vscode.window`) to query visible elements. Note that the API has limitations on "seeing" purely internal UI state (like exact pixel positions or non-exposed panels), but we will capture everything exposed (Editors, Terminals, Tab Groups).

## Proposed Changes

### UI Probe Extension (`ui-probe`)
#### [MODIFY] [extension.ts](file:///c:/myStuff/IDEasPlatform/ui-probe/src/extension.ts)
- Enhance `ui-probe.logState` command to output a comprehensive JSON report of:
    - `vscode.window.visibleTextEditors` (URI, ViewColumn)
    - `vscode.window.terminals` (Name, State)
    - `vscode.window.tabGroups` (Active/Visible groups)
    - `vscode.window.activeColorTheme` (Context)

### UI Probe Extension (`ui-probe`)
#### [MODIFY] [extension.ts](file:///c:/myStuff/IDEasPlatform/ui-probe/src/extension.ts)
- Add a new command `ui-probe.testCapabilities` ("The Chameleon") that:
    1. **Styling**: Applies a `TextEditorDecorationType` to the active editor (or a specific one).
        - Background: Dark Blue (`#000033`)
        - Color: Gold (`#FFD700`)
        - Border: 1px solid Gold
    2. **Positioning**: Moves the editor to a different ViewColumn (e.g., `ViewColumn.Beside`).

### Tasks Configuration
#### [MODIFY] [tasks.json](file:///c:/myStuff/IDEasPlatform/ui-probe/.vscode/tasks.json)
- (Deferred) Will be modified in a later step after verifying direct API control.

## Verification Plan
### Automated Tests
- None.

### Manual Verification
1. Focus the "Detached Panel" (or any editor).
2. Run `UI Probe: Test Capabilities`.
3. Verify the background changes to Dark Blue and text turns Gold.
4. Verify the editor splits or moves to a new column.
