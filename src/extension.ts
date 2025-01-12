import * as vscode from 'vscode';
import { Tree } from './tree';
import { TestViewDragAndDrop } from './testView';



export class TreeViewController {
    locked = false;
    view?: vscode.TreeView<any>;
    context: vscode.ExtensionContext;
    viewId: string;
    options: vscode.TreeViewOptions<any>;
    

    constructor(context: vscode.ExtensionContext, viewId: string, options: vscode.TreeViewOptions<any>) {
        this.context = context;
        this.viewId = viewId;
        this.options = options;
    }

    createView(): vscode.TreeView<any> {
        const options = {
            ...this.options, 
            dragAndDropController: this.locked ? undefined : this.options.dragAndDropController,
        };
        this.view = vscode.window.createTreeView(this.viewId, options);
        return this.view;
    }

    lock() {
        if (!this.locked) {
            this.locked = true;
            this.view = this.createView();
        }
    }

    unlock() {
        if (this.locked) {
            this.locked = false;
            this.view = this.createView();
        }
    }
    
}


export function activate(context: vscode.ExtensionContext) {
	const extensionName = context.extension.packageJSON.name;

    let projects = new Tree(context);
    const treeViewController = new TreeViewController(context, "projects", {
        treeDataProvider: projects,
        showCollapseAll: false, 
        canSelectMany: true, 
        dragAndDropController: projects,
    });
    treeViewController.createView();

    // Toggle Drag and Drop
    vscode.commands.registerCommand("projects.lock", () => treeViewController.lock());
    vscode.commands.registerCommand("projects.unlock", () => treeViewController.unlock());


    // treeView.onDidCollapseElement(e => {
    //     saveCollapsibleState(context, e.element.collapsibleId, vscode.TreeItemCollapsibleState.Collapsed)
    // })
    // treeView.onDidExpandElement(e => {
    //     saveCollapsibleState(context, e.element.collapsibleId, vscode.TreeItemCollapsibleState.Expanded)
    // })
	// vscode.commands.registerCommand("projects.resfresh", () => vscode.window.showInformationMessage(extensionName));
    // vscode.commands.registerCommand("projects.openSettings", () => projects.openSettings());
    // vscode.commands.registerCommand("project.open", treeItem => treeItem.openFolder());
    // vscode.commands.registerCommand("project.openInNewWindow", treeItem => treeItem.openFolder(true));
}
