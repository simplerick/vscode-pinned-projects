import * as vscode from 'vscode';
import { Tree } from './tree';



export class TreeViewController {
    view?: vscode.TreeView<any>;
    context: vscode.ExtensionContext;
    viewId: string;
    options: vscode.TreeViewOptions<any>;

    constructor(context: vscode.ExtensionContext, viewId: string, options: vscode.TreeViewOptions<any>) {
        this.context = context;
        this.viewId = viewId;
        this.options = options;
    }

    // fetch locked state from config instead of using keeping it in memory
    get locked() {
        const config = vscode.workspace.getConfiguration('pinnedProjects');
        return config.get('lock', false);
    }

    updateConfig(key: string, value: any) {
        const config = vscode.workspace.getConfiguration('pinnedProjects');
        config.update(key, value, vscode.ConfigurationTarget.Workspace);
    }

    createView(): vscode.TreeView<any> {
        const options = {
            ...this.options, 
            dragAndDropController: this.locked ? undefined : this.options.dragAndDropController,
        };
        this.view = vscode.window.createTreeView(this.viewId, options);
        this.view.onDidCollapseElement(e => {
            e.element.data.collapseState = vscode.TreeItemCollapsibleState.Collapsed;
        });
        this.view.onDidExpandElement(e => {
            e.element.data.collapseState = vscode.TreeItemCollapsibleState.Expanded;
        });
        return this.view;
    }

    lock() {
        if (!this.locked) {
            this.updateConfig('lock', true);
            // this.view = this.createView(true);
        }
    }

    unlock() {
        if (this.locked) {
            this.updateConfig('lock', false);
            // this.view = this.createView(false);
        }
    }
    
}


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

    // Toggle Drag and Drop
    vscode.commands.registerCommand("projects.lock", () => treeViewController.lock());
    vscode.commands.registerCommand("projects.unlock", () => treeViewController.unlock());
    // Rename
    vscode.commands.registerCommand("item.rename", node => node.rename(tree));
    // Add
    vscode.commands.registerCommand("project.add", node => (node ?? tree.root).addChild("project", tree));
    vscode.commands.registerCommand("group.add", node => (node ?? tree.root).addChild("group", tree));
    // Delete
    vscode.commands.registerCommand("item.remove", node => node.remove(tree));
    // Open Project
    vscode.commands.registerCommand("project.open", node => node.openFolder());
    vscode.commands.registerCommand("project.openInNewWindow", node => node.openFolder(true));    
}
