import * as vscode from 'vscode';
import { TreeNode, Group, Project } from './treeNode';
import { TreeDragAndDropController } from './treeDragAndDropController';



export class Tree extends TreeDragAndDropController implements vscode.TreeDataProvider<TreeNode>, vscode.TreeDragAndDropController<TreeNode> {
	protected _onDidChangeTreeData: vscode.EventEmitter<TreeNode | undefined | void> = new vscode.EventEmitter<TreeNode | undefined | void>();
	readonly onDidChangeTreeData: vscode.Event<TreeNode | undefined | void> = this._onDidChangeTreeData.event;
	root: TreeNode;
    nodes: TreeNode[] = [];

	constructor(private extensionContext: vscode.ExtensionContext) {
		super();
		this.extensionContext = extensionContext;
		let tree = extensionContext.globalState.get("tree");
		this.root = this.parse({type: "root", children: tree});
	}

	private parse(nodeInfo: any): TreeNode {
		const {children = [], ...data} = nodeInfo;
		let childNodes: TreeNode[] = children.map((child: any) => this.parse(child));
        let id = this.nodes.length;
        let node = new TreeNode(id, undefined, childNodes, data);
		childNodes.forEach(child => child.parent = node);
		this.nodes.push(node);
        return node;
    }

	private serialize(node: TreeNode): any {
		let children = node.children.map(child => this.serialize(child));
		if (node === this.root) {
			return children;
		}
		if (node.data instanceof Group) {
			return {type: node.data.contextValue, name: node.data.label, collapsibleState: node.data.collapsibleState, children: children};
		}
		if (node.data instanceof Project) {
			return {type: node.data.contextValue, name: node.data.label, absolutePath: node.data.absolutePath};
		}
	}

	sync() {
		let serializedTree = this.serialize(this.root);
		this.extensionContext.globalState.update("tree", serializedTree);
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

	addNode(parent: TreeNode, nodeInfo: any): TreeNode {
		let node = new TreeNode(this.nodes.length, parent, [], nodeInfo);
		this.nodes.push(node);
		parent.children.push(node);
		this.refresh(parent);
		return node;
	}

	removeNode(node: TreeNode) {
		const parent = node.parent; 
		parent?.children.splice(parent.children.indexOf(node), 1);
		this.refresh(parent);
	}

	refresh(node?: TreeNode): void {
		if (node === this.root) {
			this._onDidChangeTreeData.fire(undefined);
		} else {
			this._onDidChangeTreeData.fire(node);
		}
		this.sync();
	}

    openSettings() {
        vscode.commands.executeCommand('workbench.action.openSettings', `@ext:${this.extensionContext.extension.id}`);
    }
	
}