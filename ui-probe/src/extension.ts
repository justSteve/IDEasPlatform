import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
    const outputChannel = vscode.window.createOutputChannel("UI Probe Output");
    outputChannel.show();
    console.log('UI Probe is now active!');

    // Run immediately on activation
    const runProbe = () => {
        outputChannel.appendLine("--- UI Probe State Log ---");
        outputChannel.appendLine(`Timestamp: ${new Date().toISOString()}`);

        // 1. Visible Text Editors
        outputChannel.appendLine("\n[Visible Text Editors]");
        vscode.window.visibleTextEditors.forEach((editor, index) => {
            outputChannel.appendLine(`  ${index}: ${editor.document.uri.toString()} (ViewColumn: ${editor.viewColumn})`);
        });

        // 2. Active Text Editor
        outputChannel.appendLine("\n[Active Text Editor]");
        if (vscode.window.activeTextEditor) {
            outputChannel.appendLine(`  ${vscode.window.activeTextEditor.document.uri.toString()}`);
        } else {
            outputChannel.appendLine("  None");
        }

        // 3. Active Terminal
        outputChannel.appendLine("\n[Active Terminal]");
        if (vscode.window.activeTerminal) {
            outputChannel.appendLine(`  Name: ${vscode.window.activeTerminal.name}, State: ${JSON.stringify(vscode.window.activeTerminal.state)}`);
        } else {
            outputChannel.appendLine("  None");
        }

        // 4. Terminals
        outputChannel.appendLine("\n[All Terminals]");
        vscode.window.terminals.forEach((term, index) => {
            outputChannel.appendLine(`  ${index}: Name: ${term.name}`);
        });

        // 5. Tab Groups (Detailed)
        outputChannel.appendLine("\n[Tab Groups]");
        vscode.window.tabGroups.all.forEach((group, index) => {
            outputChannel.appendLine(`  Group ${index}: Active: ${group.isActive}, ViewColumn: ${group.viewColumn}`);
            group.tabs.forEach((tab, tIndex) => {
                let inputType = "Unknown";
                let inputDetails = "";

                if (tab.input instanceof vscode.TabInputText) {
                    inputType = "Text";
                    inputDetails = tab.input.uri.toString();
                } else if (tab.input instanceof vscode.TabInputTextDiff) {
                    inputType = "TextDiff";
                    inputDetails = `${tab.input.original.toString()} <-> ${tab.input.modified.toString()}`;
                } else if (tab.input instanceof vscode.TabInputCustom) {
                    inputType = "Custom";
                    inputDetails = tab.input.uri.toString();
                } else if (tab.input instanceof vscode.TabInputWebview) {
                    inputType = "Webview";
                    inputDetails = `Type: ${tab.input.viewType}`;
                } else if (tab.input instanceof vscode.TabInputNotebook) {
                    inputType = "Notebook";
                    inputDetails = tab.input.uri.toString();
                } else if (tab.input instanceof vscode.TabInputTerminal) {
                    inputType = "Terminal";
                    inputDetails = "Terminal Tab";
                }

                outputChannel.appendLine(`    Tab ${tIndex}: Label: "${tab.label}", Active: ${tab.isActive}, Type: ${inputType}, Details: ${inputDetails}`);
            });
        });

        outputChannel.appendLine("\n--- End Log ---");

        // Write to file for the agent to read
        let logPath = '';
        if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
            logPath = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, 'ui-state.log');
        } else {
            logPath = path.join(context.extensionPath, 'ui-state.log');
        }

        let logContent = `Timestamp: ${new Date().toISOString()}\n`;
        logContent += "\n[Visible Text Editors]\n";
        vscode.window.visibleTextEditors.forEach((editor, index) => {
            logContent += `  ${index}: ${editor.document.uri.toString()} (ViewColumn: ${editor.viewColumn})\n`;
        });

        logContent += "\n[Active Text Editor]\n";
        if (vscode.window.activeTextEditor) {
            logContent += `  ${vscode.window.activeTextEditor.document.uri.toString()}\n`;
        } else {
            logContent += "  None\n";
        }

        logContent += "\n[Active Terminal]\n";
        if (vscode.window.activeTerminal) {
            logContent += `  Name: ${vscode.window.activeTerminal.name}\n`;
        } else {
            logContent += "  None\n";
        }

        logContent += "\n[All Terminals]\n";
        vscode.window.terminals.forEach((term, index) => {
            logContent += `  ${index}: Name: ${term.name}\n`;
        });

        logContent += "\n[Tab Groups]\n";
        vscode.window.tabGroups.all.forEach((group, index) => {
            logContent += `  Group ${index}: Active: ${group.isActive}, ViewColumn: ${group.viewColumn}\n`;
            group.tabs.forEach((tab, tIndex) => {
                let inputType = "Unknown";
                let inputDetails = "";

                if (tab.input instanceof vscode.TabInputText) {
                    inputType = "Text";
                    inputDetails = tab.input.uri.toString();
                } else if (tab.input instanceof vscode.TabInputTextDiff) {
                    inputType = "TextDiff";
                    inputDetails = `${tab.input.original.toString()} <-> ${tab.input.modified.toString()}`;
                } else if (tab.input instanceof vscode.TabInputCustom) {
                    inputType = "Custom";
                    inputDetails = tab.input.uri.toString();
                } else if (tab.input instanceof vscode.TabInputWebview) {
                    inputType = "Webview";
                    inputDetails = `Type: ${tab.input.viewType}`;
                } else if (tab.input instanceof vscode.TabInputNotebook) {
                    inputType = "Notebook";
                    inputDetails = tab.input.uri.toString();
                } else if (tab.input instanceof vscode.TabInputTerminal) {
                    inputType = "Terminal";
                    inputDetails = "Terminal Tab";
                }

                logContent += `    Tab ${tIndex}: Label: "${tab.label}", Active: ${tab.isActive}, Type: ${inputType}, Details: ${inputDetails}\n`;
            });
        });

        fs.writeFileSync(logPath, logContent);
        outputChannel.appendLine(`\nLog written to: ${logPath}`);

        vscode.window.showInformationMessage(`UI State logged to ${logPath}`);
    };

    // Run once on startup
    runProbe();

    // Also register command if they want to run it manually again
    let disposable = vscode.commands.registerCommand('ui-probe.logState', runProbe);
    context.subscriptions.push(disposable);

    // --- Chameleon Test ---
    const chameleonDecoration = vscode.window.createTextEditorDecorationType({
        backgroundColor: '#000033', // Dark Blue
        color: '#FFD700',           // Gold
        border: '1px solid #FFD700',
        isWholeLine: true,
        after: {
            contentText: ' [CHAMELEON MODE]',
            color: '#FFD700',
            fontWeight: 'bold'
        }
    });

    let disposableChameleon = vscode.commands.registerCommand('ui-probe.testCapabilities', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor to transform!');
            return;
        }

        // 1. Apply Styling
        const fullRange = new vscode.Range(
            editor.document.positionAt(0),
            editor.document.positionAt(editor.document.getText().length)
        );
        editor.setDecorations(chameleonDecoration, [fullRange]);
        vscode.window.showInformationMessage('Chameleon: Colors applied!');

        // 2. Test Positioning (Move to Side)
        // Wait a moment so the user sees the color change first
        setTimeout(async () => {
            try {
                // Attempt to move to the side (creates a split if needed, or moves to existing group)
                await vscode.commands.executeCommand('workbench.action.moveEditorToNextGroup');
                vscode.window.showInformationMessage('Chameleon: Moved to next group!');
            } catch (error) {
                vscode.window.showErrorMessage(`Chameleon: Failed to move. ${error}`);
            }
        }, 1000);
    });
    context.subscriptions.push(disposableChameleon);

    // --- Event Listeners ---
    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor(editor => {
            outputChannel.appendLine(`[Event] onDidChangeActiveTextEditor: ${editor ? editor.document.uri.toString() : 'None'}`);
        }),
        vscode.window.onDidChangeVisibleTextEditors(editors => {
            outputChannel.appendLine(`[Event] onDidChangeVisibleTextEditors: ${editors.length} editors visible`);
            editors.forEach((e, i) => outputChannel.appendLine(`  ${i}: ${e.document.uri.toString()} (ViewColumn: ${e.viewColumn})`));
        }),
        vscode.window.onDidChangeActiveTerminal(terminal => {
            outputChannel.appendLine(`[Event] onDidChangeActiveTerminal: ${terminal ? terminal.name : 'None'}`);
        }),
        vscode.window.onDidOpenTerminal(terminal => {
            outputChannel.appendLine(`[Event] onDidOpenTerminal: ${terminal.name}`);
        }),
        vscode.window.onDidCloseTerminal(terminal => {
            outputChannel.appendLine(`[Event] onDidCloseTerminal: ${terminal.name}`);
        }),
        vscode.window.onDidChangeWindowState(state => {
            outputChannel.appendLine(`[Event] onDidChangeWindowState: Focused=${state.focused}`);
        })
    );
}

export function deactivate() { }
