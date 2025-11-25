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

        // 5. Tab Groups
        outputChannel.appendLine("\n[Tab Groups]");
        vscode.window.tabGroups.all.forEach((group, index) => {
            outputChannel.appendLine(`  Group ${index}: Active: ${group.isActive}, ViewColumn: ${group.viewColumn}`);
            group.tabs.forEach((tab, tIndex) => {
                outputChannel.appendLine(`    Tab ${tIndex}: Label: ${tab.label}, Active: ${tab.isActive}`);
            });
        });

        outputChannel.appendLine("\n--- End Log ---");

        // Write to file for the agent to read
        const logPath = path.join(context.extensionPath, 'ui-state.log');

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
                logContent += `    Tab ${tIndex}: Label: ${tab.label}, Active: ${tab.isActive}\n`;
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
