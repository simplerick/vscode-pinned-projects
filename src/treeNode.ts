import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';


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
		const {type, name, absolutePath, description, ..._} = data;

		switch (type) { 
			case "group":
				return new Group(name, vscode.TreeItemCollapsibleState.Collapsed);
			case "project":
				return new Project(absolutePath, name, description);
			case "root":
				return new Group("root");
			default:
				throw new Error(`Unknown node type: ${type}`);
		}
	}
}


export class Group extends vscode.TreeItem {
	resourceUri = vscode.Uri.parse('_.js');
	iconPath = path.join(__filename, '..', '..', 'assets', 'group_filled.svg');
	contextValue = 'group';

	constructor(public readonly label: string,
				public readonly collapsibleState?: vscode.TreeItemCollapsibleState,
				// public readonly description?: string,
	) {
		super(label, collapsibleState);
		// this.tooltip = description;
	}
}


export class Project extends vscode.TreeItem {
	resourceUri = vscode.Uri.parse('_.js');
    iconPath = vscode.ThemeIcon.Folder;
	valid = true;
	contextValue = 'project';

	constructor(
        public readonly absolutePath: string,
		public readonly label?: string,
		public readonly description?: string,
	) {
		// if label is not given take stem of absolutePath
		label = label || absolutePath.split('/').pop()!;
		super(label, vscode.TreeItemCollapsibleState.None);
        this.absolutePath = this.checkPath(absolutePath);
		this.tooltip = `${this.absolutePath}`;
		this.description = this.description;
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