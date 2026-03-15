import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';


const HAS_SHOWN_INFO_KEY = 'hasShownWorkspaceInfoCount';
const MAX_INFO_SHOWS = 1;



export async function showOpenGroupInfoMessage(
    context: vscode.ExtensionContext
): Promise<void> {

    const hasShownTimes = context.globalState.get<number>(HAS_SHOWN_INFO_KEY, 0);
    if (hasShownTimes >= MAX_INFO_SHOWS) {
        return;
    }

    await context.globalState.update(HAS_SHOWN_INFO_KEY, hasShownTimes + 1);

    const selection = await vscode.window.showInformationMessage(
        'Groups that contain valid Project items can now be opened as a multi-root workspace.',
        'View details',
        "OK, don't show again"
    );

    if (selection === "OK, don't show again") {
        await context.globalState.update(HAS_SHOWN_INFO_KEY, MAX_INFO_SHOWS+1);
        return;
    }

    if (selection === 'View details') {
        const secondSelection = await vscode.window.showInformationMessage(
            `This feature uses VS Code workspaces. When opening a new workspace, VS Code may ask whether you trust it. Workspace files associated with groups are stored in:\n\n${context.globalStorageUri.fsPath}. Manage workspaces to grant trust for all group workspaces at once.`,
            "Manage workspaces",
            "OK, don't show again"
        );

        if (secondSelection === "Manage workspaces") {
            const workspaceFilePath = path.join(context.globalStorageUri.fsPath, 'workspaces.code-workspace');
            const workspaceContent = {
                folders: [
                    { path: context.globalStorageUri.fsPath }
                ]
            };

            fs.writeFileSync(workspaceFilePath, JSON.stringify(workspaceContent, null, 2));

            const workspaceUri = vscode.Uri.file(workspaceFilePath);
            await vscode.commands.executeCommand('vscode.openFolder', workspaceUri, { forceNewWindow: true });

            // Wait until user switches back to this window
            await new Promise<void>((resolve) => {
                const disposable = vscode.window.onDidChangeWindowState((e) => {
                    if (e.focused) {
                        disposable.dispose();
                        resolve();
                    }
                });
            });
            return;
        }

        if (secondSelection === "OK, don't show again") {
            await context.globalState.update(HAS_SHOWN_INFO_KEY, MAX_INFO_SHOWS+1);
            return;
        }
    }
}