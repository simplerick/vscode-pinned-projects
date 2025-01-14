import * as vscode from 'vscode';
import { TreeNode } from './treeNode';
import { TreeDragAndDropController } from './treeDragAndDropController';



export class Tree extends TreeDragAndDropController implements vscode.TreeDataProvider<TreeNode>, vscode.TreeDragAndDropController<TreeNode> {
	protected _onDidChangeTreeData: vscode.EventEmitter<TreeNode | undefined | void> = new vscode.EventEmitter<TreeNode | undefined | void>();
	readonly onDidChangeTreeData: vscode.Event<TreeNode | undefined | void> = this._onDidChangeTreeData.event;
	root: TreeNode;
    nodes: TreeNode[] = [];

	public exampleTree: any = [
		{"type": "group", "name": "Group 1", "children": [
			{"type": "project", "name": "Project 1", "absolutePath": "/Users/simple/Code/mac-setup"},
			{"type": "group", "name": "Group 2", "children": [
				{"type": "project", "name": "Project 2", "absolutePath": "/wrong-path"},
			]},
		]},
		{"type": "group", "name": "Group 3", "children": [
			{"type": "project", "name": "Project 1", "absolutePath": "/Users/simple/Code/mac-setup"},
			{"type": "group", "name": "Group 2", "children": [
				{"type": "project", "name": "Project 4", "absolutePath": "/wrong-path"},
			]},
		]}
	];

	constructor(private extensionContext: vscode.ExtensionContext) {
		super();
		this.root = this._buildNodes({type: "root", children: this.exampleTree});
		this.extensionContext = extensionContext;
	}

	getTreeItem(element: TreeNode): vscode.TreeItem {
		return element.data;
	}

	getChildren(element?: TreeNode): TreeNode[] {
        if (!element) {
            return this.root.children;
        }
		return element.children;
	}

	getParent(element: TreeNode): TreeNode | undefined {
        return element.parent;
    }

	addNode(parent: TreeNode, nodeInfo: any) {
		let node = new TreeNode(this.nodes.length, parent, [], nodeInfo);
		this.nodes.push(node);
		parent.children.push(node);
		this.refresh(parent);
	}

	removeNode(node: TreeNode) {
		const parent = node.parent; 
		parent?.children.splice(parent.children.indexOf(node), 1);
		this.refresh(parent);
	}

	_buildNodes(nodeInfo: any): TreeNode {
		const {children = [], ...data} = nodeInfo;
		let childNodes: TreeNode[] = children.map((child: any) => this._buildNodes(child));
        let id = this.nodes.length;
        let node = new TreeNode(id, undefined, childNodes, data);
		childNodes.forEach(child => child.parent = node);
		this.nodes.push(node);
        return node;
    }

	refresh(node?: TreeNode): void {
		if (!node?.parent) {
			this._onDidChangeTreeData.fire(undefined);
		} else {
			this._onDidChangeTreeData.fire(node);
		}	
	}

    openSettings() {
        vscode.commands.executeCommand('workbench.action.openSettings', `@ext:${this.extensionContext.extension.id}`);
    }
	
}