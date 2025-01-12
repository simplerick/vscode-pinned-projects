import * as vscode from 'vscode';
import { TreeNode } from './treeNode';
import { TreeDragAndDropController } from './treeDragAndDropController';



export class Tree extends TreeDragAndDropController implements vscode.TreeDataProvider<TreeNode>, vscode.TreeDragAndDropController<TreeNode> {
	protected _onDidChangeTreeData: vscode.EventEmitter<TreeNode | undefined | void> = new vscode.EventEmitter<TreeNode | undefined | void>();
	readonly onDidChangeTreeData: vscode.Event<TreeNode | undefined | void> = this._onDidChangeTreeData.event;
	root: TreeNode;
    nodes: TreeNode[] = [];

	public exampleTree: any = [
        {"data": "a", "children": [
            {"data": "aa", "children": [
                {"data": "aaa", "children": [
                    {"data": "aaaa"},
                ]},
                {"data": "aab"},
            ]},
        ]},
        {"data": "c"},
        {"data": "b", "children": [
            {"data": "ba"},
            {"data": "bb"},
        ]},
    ];

	constructor(private extensionContext: vscode.ExtensionContext) {
		super();
		this.root = this._buildNodes("root", this.exampleTree);
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

	_buildNodes(data: any, children: any): TreeNode {
		let childNodes: TreeNode[] = children.map((child: any) => this._buildNodes(child.data, child.children || []));
        let id = this.nodes.length;
        let node = new TreeNode(id, data, undefined, childNodes);
		childNodes.forEach(child => child.parent = node);
		this.nodes.push(node);
        return node;
    }

	refresh(): void {
		this._onDidChangeTreeData.fire();
	}

    openSettings() {
        vscode.commands.executeCommand('workbench.action.openSettings', `@ext:${this.extensionContext.extension.id}`);
    }
	
}