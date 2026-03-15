import * as vscode from 'vscode';


const HAS_SHOWN_INFO_KEY = 'hasShownWorkspaceInfoCount';
const MAX_INFO_SHOWS = 2



export async function showOpenGroupInfoMessage(
    context: vscode.ExtensionContext
): Promise<void> {

    const hasShownTimes = context.globalState.get<number>(HAS_SHOWN_INFO_KEY, 0);
    if (hasShownTimes >= MAX_INFO_SHOWS) {
        return;
    }

    await context.globalState.update(HAS_SHOWN_INFO_KEY, hasShownTimes + 1);

    const selection = await vscode.window.showInformationMessage(
        'Groups that contain only valid Project items can now be opened as a multi-root workspace.',
        'View Details',
        "OK, don't show again"
    );

    if (selection === "OK, don't show again") {
        await context.globalState.update(HAS_SHOWN_INFO_KEY, MAX_INFO_SHOWS+1);
        return;
    }

    if (selection === 'View Details') {
        const secondSelection = await vscode.window.showInformationMessage(
            `This feature uses VS Code workspaces. When opening a new workspace, VS Code may ask whether you trust it. Generated workspace files are stored in \n\n${context.globalStorageUri.fsPath}. \n\nIf you understand the security implications, you can change the workspace trust behavior in Settings.`,
            'Change Settings',
            "OK, don't show again"
        );

        if (secondSelection === "OK, don't show again") {
            await context.globalState.update(HAS_SHOWN_INFO_KEY, MAX_INFO_SHOWS+1);
            return;
        }

        if (secondSelection === 'Change Settings') {
            await vscode.commands.executeCommand(
                'workbench.action.openSettings',
                'Workspace Trust'
            );
        }
    }
}