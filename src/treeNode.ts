import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { allowedNodeEnvironmentFlags } from 'process';


export class TreeNode {
	id: number;
	parent?: TreeNode;
	children: TreeNode[];
	data: Group | Project;

	constructor(id: number, parent?: TreeNode, children?: TreeNode[], data?: any) {
		this.id = id;
		this.parent = parent;
		this.children = children ?? [];
		this.data = this.parseTreeItem(data);
	}

	parseTreeItem(data: any): Group | Project {
		// const stringId = String(id);
		const {type, name, absolutePath, description, collapsibleState, ..._} = data;

		switch (type) { 
			case "group":
				return new Group(name, collapsibleState ?? vscode.TreeItemCollapsibleState.Collapsed, type);
			case "project":
				return new Project(absolutePath, name, description, type);
			case "root":
				return new Group("root");
			default:
				throw new Error(`Unknown node type: ${type}`);
		}
	}

	openFolder(newWindow: boolean = false) {
		if (this.data instanceof Project) {
			this.data.openFolder(newWindow);
		}
    }

	rename(provider: any) {
		vscode.window.showInputBox({
			prompt: "Enter a new name",
			value: this.data.label,
		}).then((newName) => {
			this.data.label = newName;
			provider.refresh(this);
		});
	}

	addChild(type: string, provider: any) {
		if (type === "group") {
			provider.addNode(this, {type: "group", name: "New Group"});
		}
		if (type === "project") {
			vscode.window.showOpenDialog({
				canSelectFiles: false, canSelectFolders: true, canSelectMany: false
			}).then(uri => {
				if (uri) {
					provider.addNode(this, {type: "project", absolutePath: uri[0].fsPath});
				}
			});
		}
	}

	remove(provider: any) {
		provider.removeNode(this);
	}

}


export class Group extends vscode.TreeItem {
	// resourceUri = vscode.Uri.parse('_.js');
	// iconPath = path.join(__filename, '..', '..', 'assets', 'group.svg');
	contextValue?: string;

	constructor(public label: string,
				public collapsibleState?: vscode.TreeItemCollapsibleState,
				type?: string,
				// public readonly description?: string,
	) {
		super(label, collapsibleState);
		this.contextValue = type;
		// this.tooltip = description;
	}
}


export class Project extends vscode.TreeItem {
	resourceUri = vscode.Uri.parse('_.js');
    iconPath = vscode.ThemeIcon.Folder;
	valid = true;
	contextValue?: string;

	constructor(
        public absolutePath: string,
		public label?: string,
		public description?: string,
		type?: string
	) {
		// if label is not given take stem of absolutePath
		label = label || absolutePath.split('/').pop()!;
		super(label, vscode.TreeItemCollapsibleState.None);
        this.absolutePath = this.checkPath(absolutePath);
		this.tooltip = `${this.absolutePath}`;
		this.description = this.description;
		this.contextValue = type;
	}

    // check if path exists
	private checkPath(p: string): string {
		try {
			fs.accessSync(p);
		} catch {
			this.valid = false;
			this.iconPath = new vscode.ThemeIcon('warning', new vscode.ThemeColor('editorWarning.foreground'));
		}
		return p;
	}

    openFolder(newWindow: boolean = false) {
        const uri = vscode.Uri.file(this.absolutePath);
        vscode.commands.executeCommand('vscode.openFolder', uri, newWindow);
    }
}