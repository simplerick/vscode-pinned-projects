import * as vscode from 'vscode';
import { Tree } from './tree';
import { TreeViewController } from './treeViewController';



export function activate(context: vscode.ExtensionContext) {
    const treeViewController = new TreeViewController(context, "projects", new Tree(context));
    treeViewController.createView();
    vscode.workspace.onDidChangeConfiguration(event => {
        if (event.affectsConfiguration('pinnedProjects.lock')) {
            treeViewController.createView();
        }
    });

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
    // Open Project
    vscode.commands.registerCommand("project.open", node => node.openFolder());
    vscode.commands.registerCommand("project.openInNewWindow", node => node.openFolder(true));    
}
