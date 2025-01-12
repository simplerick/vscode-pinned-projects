import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';


export class TreeNode {
	id: number;
	data: vscode.TreeItem;
	parent?: TreeNode;
	children: TreeNode[];

	constructor(id: number, data: any, parent?: TreeNode, children?: TreeNode[]) {
		this.id = id;
		// this.data = data;
		this.parent = parent;
		this.children = children ?? [];
		this.data = this.getTreeItem(data, id, this.children);
	}

	getTreeItem(data: any, nodeId: number, children: any[]): vscode.TreeItem { 
		return {
			id: String(nodeId),
			label: data,
			collapsibleState: children.length ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None,
		};
	}
}


// export class Group extends vscode.TreeItem {
// 	resourceUri = vscode.Uri.parse('_.js');
// 	iconPath = path.join(__filename, '..', '..', 'assets', 'group_filled.svg');

// 	constructor(public readonly label: string,
// 				public readonly collapsibleState?: vscode.TreeItemCollapsibleState,
// 				// public readonly description?: string,
// 	) {
// 		super(label, collapsibleState);
// 		// this.tooltip = description;
// 		super(label, vscode.TreeItemCollapsibleState.Collapsed);
// 	}
// }


// export class Project extends vscode.TreeItem {
// 	resourceUri = vscode.Uri.parse('_.js');
//     iconPath = vscode.ThemeIcon.Folder;
// 	valid = true;

// 	constructor(
//         public readonly absolutePath: string,
// 		public readonly label?: string,
// 		public readonly description?: string,
// 	) {
// 		// if label is not given take stem of absolutePath
// 		label = label || absolutePath.split('/').pop()!;
// 		super(label, vscode.TreeItemCollapsibleState.None);
//         this.absolutePath = this.checkPath(absolutePath);
// 		console.log(this.absolutePath);
// 		this.tooltip = `${this.absolutePath}`;
// 		this.description = this.description;
// 	}

//     // check if path exists
// 	private checkPath(p: string): string {
// 		try {
// 			fs.accessSync(p);
// 		} catch {
// 			this.valid = false;
// 			this.iconPath = new vscode.ThemeIcon('warning', new vscode.ThemeColor('editorWarning.foreground'));
// 		}
// 		return p;
// 	}

//     openFolder(newWindow: boolean = false) {
//         const uri = vscode.Uri.file(this.absolutePath);
//         vscode.commands.executeCommand('vscode.openFolder', uri, newWindow);
//     }
// }