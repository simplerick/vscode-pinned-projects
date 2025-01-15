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
            e.element.data.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
            if (!this.locked) {
                (this.options.treeDataProvider as Tree).sync();
            }
        });
        this.view.onDidExpandElement(e => {
            e.element.data.collapsibleState = vscode.TreeItemCollapsibleState.Expanded;
            if (!this.locked) {
                (this.options.treeDataProvider as Tree).sync();
            }
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