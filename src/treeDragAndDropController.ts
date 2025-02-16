import * as vscode from 'vscode';
import { TreeNode, Project, Group } from './treeNode';


export abstract class TreeDragAndDropController implements vscode.TreeDragAndDropController<TreeNode> {
    dropMimeTypes = ['application/vnd.code.tree.projects'];
    dragMimeTypes = ['text/uri-list'];

    protected abstract root: TreeNode;
    protected abstract nodes: TreeNode[];
    protected abstract refresh(node?: TreeNode): void;

    // Reordering
    public async handleDrop(target: TreeNode | undefined, sources: vscode.DataTransfer, _token: vscode.CancellationToken): Promise<void> {
        const transferItem = sources.get('application/vnd.code.tree.testViewDragAndDrop');
        if (!transferItem) {
            return;
        }

        let nodeIds: number[] = transferItem.value;
        // add only top level nodes
        let nodes: TreeNode[] = nodeIds.map(id => this.nodes[id]).filter(node => !nodeIds.includes(node.parent!.id));

        if (!target) {
            // target is undefined -> move to the end of root children
            for (let node of nodes) {
                let parent = node.parent!;
                parent.children.splice(parent.children.indexOf(node), 1);
                node.parent = this.root;
            }
            this.root.children.push(...nodes);
        } else {
            // first check that the target is not in a subtree of any of the selected nodes
            let targetCheck: TreeNode | undefined = target;
            while (targetCheck) {
                if (nodeIds.includes(targetCheck.id)) {
                    return;
                }
                targetCheck = targetCheck.parent;
            }
            // target is a Node 
            if (target.data instanceof Group && target.data.collapsibleState === vscode.TreeItemCollapsibleState.Expanded) {
                // if it's a group in expanded state -> put the selected nodes to the end of the target node children
                for (let node of nodes) {
                    let parent = node.parent!;
                    parent.children.splice(parent.children.indexOf(node), 1);
                    node.parent = target;
                }
                target.children.push(...nodes);
            } else {
                // if it's a project or a group in collapsed state -> put the selected nodes before the target node
                let targetParent = target.parent!;
                let targetIndex = targetParent.children.indexOf(target);
                for (let node of nodes) {
                    let parent = node.parent!;
                    parent.children.splice(parent.children.indexOf(node), 1);
                    node.parent = targetParent;
                }
                targetParent.children.splice(targetIndex, 0, ...nodes);
            }
        }

        this.refresh(undefined);
    }

    public async handleDrag(source: TreeNode[], treeDataTransfer: vscode.DataTransfer, _token: vscode.CancellationToken): Promise<void> {
        const nodeIds = source.map(node => node.id); // Transfer only the `id` of the nodes
        treeDataTransfer.set('application/vnd.code.tree.testViewDragAndDrop', new vscode.DataTransferItem(nodeIds));
    }
}

