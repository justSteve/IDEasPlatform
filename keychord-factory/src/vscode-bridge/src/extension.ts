import * as vscode from 'vscode';
import * as fs from 'fs';

let fileWatcher: fs.FSWatcher | null = null;
let outputChannel: vscode.OutputChannel | null = null;

interface TmuxOptions {
    session?: string;
    attach?: boolean;
}

interface TerminalOptions {
    name?: string;
    shell?: string;
    cwd?: string;
    command?: string;
}

interface PanelOptions {
    panel?: 'terminal' | 'output' | 'problems' | 'debug';
}

interface FocusOptions {
    target?: 'editor' | 'terminal' | 'sidebar' | 'explorer';
}

interface EditorOptions {
    file?: string;
    column?: vscode.ViewColumn;
    preview?: boolean;
    line?: number;
}

interface VscodeCommandOptions {
    command?: string;
    args?: unknown[];
}

export function activate(context: vscode.ExtensionContext): void {
    outputChannel = vscode.window.createOutputChannel('Command Bridge');
    outputChannel.appendLine('Command Bridge activated');

    context.subscriptions.push(
        vscode.commands.registerCommand('commandBridge.openTmuxTerminal', openTmuxTerminal),
        vscode.commands.registerCommand('commandBridge.executeFromFile', executeFromFile)
    );

    const config = vscode.workspace.getConfiguration('commandBridge');
    if (config.get('enabled')) {
        startFileWatcher(context);
    }

    context.subscriptions.push(
        vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('commandBridge')) {
                const newConfig = vscode.workspace.getConfiguration('commandBridge');
                if (newConfig.get('enabled')) {
                    startFileWatcher(context);
                } else {
                    stopFileWatcher();
                }
            }
        })
    );
}

function startFileWatcher(context: vscode.ExtensionContext): void {
    const config = vscode.workspace.getConfiguration('commandBridge');
    const commandFile = config.get<string>('commandFile') || '/tmp/vscode-bridge-commands';

    if (!fs.existsSync(commandFile)) {
        fs.writeFileSync(commandFile, '');
    }

    outputChannel?.appendLine(`Watching command file: ${commandFile}`);

    fileWatcher = fs.watch(commandFile, (eventType) => {
        if (eventType === 'change') {
            processCommandFile(commandFile);
        }
    });

    context.subscriptions.push({
        dispose: () => stopFileWatcher()
    });
}

function stopFileWatcher(): void {
    if (fileWatcher) {
        fileWatcher.close();
        fileWatcher = null;
        outputChannel?.appendLine('File watcher stopped');
    }
}

async function processCommandFile(filePath: string): Promise<void> {
    try {
        const content = fs.readFileSync(filePath, 'utf8').trim();
        if (!content) return;

        fs.writeFileSync(filePath, '');

        const lines = content.split('\n');
        for (const line of lines) {
            if (line.trim()) {
                await executeCommand(line.trim());
            }
        }
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        outputChannel?.appendLine(`Error processing command file: ${message}`);
    }
}

async function executeCommand(commandLine: string): Promise<void> {
    outputChannel?.appendLine(`Executing: ${commandLine}`);

    try {
        const match = commandLine.match(/^(\S+)\s*(.*)?$/);
        if (!match) {
            outputChannel?.appendLine('Invalid command format');
            return;
        }

        const [, command, argsJson] = match;
        const args = argsJson ? JSON.parse(argsJson) : undefined;

        switch (command.toUpperCase()) {
            case 'TMUX':
                await openTmuxTerminal(args as TmuxOptions);
                break;
            case 'TERMINAL':
                await openTerminal(args as TerminalOptions);
                break;
            case 'PANEL':
                await togglePanel(args as PanelOptions);
                break;
            case 'VSCODE':
                if (args && (args as VscodeCommandOptions).command) {
                    const vcArgs = args as VscodeCommandOptions;
                    await vscode.commands.executeCommand(vcArgs.command!, ...(vcArgs.args || []));
                }
                break;
            case 'FOCUS':
                await focusElement(args as FocusOptions);
                break;
            case 'EDITOR':
                await openEditor(args as EditorOptions);
                break;
            default:
                await vscode.commands.executeCommand(command, args);
        }

        outputChannel?.appendLine(`Command completed: ${command}`);
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        outputChannel?.appendLine(`Command error: ${message}`);
    }
}

async function openTmuxTerminal(options: TmuxOptions = {}): Promise<vscode.Terminal> {
    const sessionName = options.session || 'vscode-tmux';
    const attach = options.attach !== false;

    let shellArgs: string[];
    if (attach) {
        shellArgs = ['-c', `tmux new-session -A -s ${sessionName}`];
    } else {
        shellArgs = ['-c', `tmux new-session -d -s ${sessionName} && tmux attach -t ${sessionName}`];
    }

    const terminal = vscode.window.createTerminal({
        name: `TMux: ${sessionName}`,
        shellPath: '/bin/bash',
        shellArgs: shellArgs
    });

    terminal.show();
    return terminal;
}

async function openTerminal(options: TerminalOptions = {}): Promise<vscode.Terminal> {
    const terminal = vscode.window.createTerminal({
        name: options.name || 'Terminal',
        shellPath: options.shell || undefined,
        cwd: options.cwd || undefined
    });

    terminal.show();

    if (options.command) {
        terminal.sendText(options.command);
    }

    return terminal;
}

async function togglePanel(options: PanelOptions = {}): Promise<void> {
    const panel = options.panel || 'terminal';

    switch (panel) {
        case 'terminal':
            await vscode.commands.executeCommand('workbench.action.terminal.toggleTerminal');
            break;
        case 'output':
            await vscode.commands.executeCommand('workbench.panel.output.focus');
            break;
        case 'problems':
            await vscode.commands.executeCommand('workbench.panel.markers.view.focus');
            break;
        case 'debug':
            await vscode.commands.executeCommand('workbench.debug.action.toggleRepl');
            break;
        default:
            await vscode.commands.executeCommand('workbench.action.togglePanel');
    }
}

async function focusElement(options: FocusOptions = {}): Promise<void> {
    const target = options.target || 'editor';

    switch (target) {
        case 'editor':
            await vscode.commands.executeCommand('workbench.action.focusActiveEditorGroup');
            break;
        case 'terminal':
            await vscode.commands.executeCommand('workbench.action.terminal.focus');
            break;
        case 'sidebar':
            await vscode.commands.executeCommand('workbench.action.focusSideBar');
            break;
        case 'explorer':
            await vscode.commands.executeCommand('workbench.view.explorer');
            break;
    }
}

async function openEditor(options: EditorOptions = {}): Promise<void> {
    if (options.file) {
        const uri = vscode.Uri.file(options.file);
        const doc = await vscode.workspace.openTextDocument(uri);
        await vscode.window.showTextDocument(doc, {
            viewColumn: options.column || vscode.ViewColumn.Active,
            preview: options.preview !== false
        });

        if (options.line) {
            const editor = vscode.window.activeTextEditor;
            if (editor) {
                const line = Math.max(0, options.line - 1);
                const position = new vscode.Position(line, 0);
                editor.selection = new vscode.Selection(position, position);
                editor.revealRange(new vscode.Range(position, position));
            }
        }
    }
}

async function executeFromFile(): Promise<void> {
    const config = vscode.workspace.getConfiguration('commandBridge');
    const commandFile = config.get<string>('commandFile') || '/tmp/vscode-bridge-commands';
    await processCommandFile(commandFile);
}

export function deactivate(): void {
    stopFileWatcher();
}
