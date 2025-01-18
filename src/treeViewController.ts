import * as vscode from 'vscode';
import { Tree } from './tree';



export class TreeViewController {
    view?: vscode.TreeView<any>;
    context: vscode.ExtensionContext;
    viewId: string;
    tree: Tree;

    constructor(context: vscode.ExtensionContext, viewId: string, tree: Tree) {
        this.context = context;
        this.viewId = viewId;
        this.tree = tree;
    }

    // fetch locked state from config instead of using keeping it in memory
    get locked() {
        const config = vscode.workspace.getConfiguration('pinnedProjects');
        return config.get('lock', false);
    }

    updateConfig(key: string, value: any) {
        const config = vscode.workspace.getConfiguration('pinnedProjects');
        // if workspace config is not available, update config in global state
        config.update(key, value, vscode.ConfigurationTarget.Workspace).then(undefined, () => {
            config.update(key, value, vscode.ConfigurationTarget.Global);
        });
    }

    createView(): vscode.TreeView<any> {
        if (this.view) {
            this.tree = new Tree(this.context, this.tree.root,  this.tree.nodes);
        }
        const options = {
            treeDataProvider: this.tree,
            showCollapseAll: false, 
            canSelectMany: true,
            dragAndDropController: this.locked ? undefined : this.tree,
        };
        this.view = vscode.window.createTreeView(this.viewId, options);
        this.view.onDidCollapseElement(e => {
            e.element.data.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
            this.tree.sync();
        });
        this.view.onDidExpandElement(e => {
            e.element.data.collapsibleState = vscode.TreeItemCollapsibleState.Expanded;
            this.tree.sync();
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