import * as vscode from 'vscode';
import { Tree } from './tree';
import { TreeViewController } from './treeViewController';



export function activate(context: vscode.ExtensionContext) {
    let tree = new Tree(context);
    const treeViewController = new TreeViewController(context, "projects", {
        treeDataProvider: tree,
        showCollapseAll: false, 
        canSelectMany: true, 
        dragAndDropController: tree,
    });
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
                let newNode = tree.addNode(parent, {type: "project", absolutePath: uri[0].fsPath});
                if (newNode) {treeViewController.view?.reveal(newNode);}
            }
        });
    }

    function addGroup(parent: any) { 
        let newNode = tree.addNode(parent, {type: "group", name: "New Group"});
        if (newNode) {treeViewController.view?.reveal(newNode);}
    }

    // Toggle Drag and Drop
    vscode.commands.registerCommand("projects.lock", () => treeViewController.lock());
    vscode.commands.registerCommand("projects.unlock", () => treeViewController.unlock());
    // Add from title
    vscode.commands.registerCommand("projects.addProject", () => addProject(tree.root));
    vscode.commands.registerCommand("projects.addGroup", () => addGroup(tree.root));
    // Rename
    vscode.commands.registerCommand("item.rename", node => node.rename(tree));
    // Add
    vscode.commands.registerCommand("project.add", node => addProject(node));
    vscode.commands.registerCommand("group.add", node => addGroup(node));
    // Delete
    vscode.commands.registerCommand("item.remove", node => tree.removeNode(node));
    // Open Project
    vscode.commands.registerCommand("project.open", node => node.openFolder());
    vscode.commands.registerCommand("project.openInNewWindow", node => node.openFolder(true));    
}
