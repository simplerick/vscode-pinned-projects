import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';


const projectErrorIcon = new vscode.ThemeIcon('warning', new vscode.ThemeColor('editorWarning.foreground'));


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

	rename(provider: any) {
		vscode.window.showInputBox({
			prompt: "Enter a new name",
			value: this.data.label as string,
		}).then((newName) => {
			if (newName) {
				this.data.name = newName;
				this.data.label = newName;
				provider.refresh(this);
			}
		});
	}

	open(newWindow: boolean, workspaceStoragePath: string) {
		let uri: vscode.Uri;

		if (this.data instanceof Project) {
			uri = vscode.Uri.file(this.data.absolutePath);
		}
		else {
			// assume that group is non empty and has only valid project type chilren (openable)
			let dirs = this.children.map(child => (child.data as Project).absolutePath);
			const workspaceContent = {
				folders: dirs.map(d => ({ path: d })),
				settings: {}
			};
			const workspaceFilePath = path.join(workspaceStoragePath, `${this.data.label}.code-workspace`);
			fs.writeFileSync(workspaceFilePath, JSON.stringify(workspaceContent, null, 2));
			uri = vscode.Uri.file(workspaceFilePath);
		}
		
		vscode.commands.executeCommand('vscode.openFolder', uri, newWindow);
	}

	checkOpenable() {
		if (this.data instanceof Group) {
			let openable = this.children.length > 0 && this.children.every(child =>
				child.data instanceof Project && child.data.valid
			);
			if (openable) {
				this.data.contextValue = `${this.data.type}-openable`;
			} else {
				this.data.contextValue = this.data.type
			}
		}
	}
}


export class Group extends vscode.TreeItem {
	// resourceUri = vscode.Uri.parse('_.js');
	// iconPath = path.join(__filename, '..', '..', 'assets', 'group.svg');
	contextValue?: string;

	constructor(public name: string,
				public collapsibleState?: vscode.TreeItemCollapsibleState,
				public type?: string,
				// public readonly description?: string,
	) {
		super(name, collapsibleState);
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
		public name?: string,
		public description?: string,
		public type?: string
	) {
		let label = name || path.basename(absolutePath);
		super(label, vscode.TreeItemCollapsibleState.None);

		this.name = name;
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
			this.iconPath = projectErrorIcon;
		}
		return p;
	}
}