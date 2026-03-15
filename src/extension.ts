import * as vscode from 'vscode';
import * as fs from 'fs';
import { Tree } from './tree';
import { TreeViewController } from './treeViewController';
import * as msg from './informationMessages';



export function activate(context: vscode.ExtensionContext) {
    const treeViewController = new TreeViewController(context, "projects", new Tree(context));
    treeViewController.createView();
    vscode.workspace.onDidChangeConfiguration(event => {
        if (event.affectsConfiguration('pinnedProjects.lock')) {
            treeViewController.createView();
        }
    });

    let workspaceStoragePath = context.globalStorageUri.fsPath;
    fs.mkdirSync(workspaceStoragePath, { recursive: true });

    function addProject(parent: any) {
        vscode.window.showOpenDialog({
            canSelectFiles: false, canSelectFolders: true, canSelectMany: false
        }).then(uri => {
            if (uri) {
                let newNode = treeViewController.tree.addNode(parent, {type: "project", absolutePath: uri[0].fsPath});
                if (newNode) {treeViewController.view?.reveal(newNode, {select: true, focus: true});}
            }
        });
    }

    function addGroup(parent: any) { 
        let newNode = treeViewController.tree.addNode(parent, {type: "group", name: "New Group"});
        if (newNode) {treeViewController.view?.reveal(newNode, {select: true, focus: true});}
    }

    // Toggle Drag and Drop
    vscode.commands.registerCommand("projects.lock", () => treeViewController.lock());
    vscode.commands.registerCommand("projects.unlock", () => treeViewController.unlock());
    // Add from title
    vscode.commands.registerCommand("projects.addProject", () => addProject(treeViewController.tree.root));
    vscode.commands.registerCommand("projects.addGroup", () => addGroup(treeViewController.tree.root));
    // Rename
    vscode.commands.registerCommand("item.rename", node => node.rename(treeViewController.tree));
    // Add
    vscode.commands.registerCommand("project.add", node => addProject(node));
    vscode.commands.registerCommand("group.add", node => addGroup(node));
    // Delete
    vscode.commands.registerCommand("item.remove", node => treeViewController.tree.removeNode(node));
    // Open Project or Group
    vscode.commands.registerCommand("project.open", node => { node.open(false, workspaceStoragePath); });
    vscode.commands.registerCommand("project.openInNewWindow", node => { node.open(true, workspaceStoragePath); });
    vscode.commands.registerCommand("group.open", async node => { await msg.showOpenGroupInfoMessage(context); node.open(false, workspaceStoragePath); });
    vscode.commands.registerCommand("group.openInNewWindow", async node => { await msg.showOpenGroupInfoMessage(context); node.open(true, workspaceStoragePath); });
}
