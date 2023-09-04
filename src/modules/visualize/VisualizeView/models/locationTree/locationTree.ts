import { ChildNode, IChildNode } from './childNode';
import { ChildNodeType } from './childNode/childNodeType';
import { ILocationModelLink } from './ILocationModelLink';
import { IProjectTreeNode } from './IProjectTreeNode';

export class LocationTree {
    public childNodes: ChildNode[] = [];
    public linkedBuildings: ChildNode[] = [];

    private childNodesMap = new Map<string, ChildNode>([]);

    constructor(projectLocationNodes: IProjectTreeNode[], locationModelLinks: ILocationModelLink[]) {
        this.buildTree(projectLocationNodes, locationModelLinks);

        this.setLinkedBuildings();
    }

    private buildTree(projectLocationNodes: IProjectTreeNode[], locationModelLinks: ILocationModelLink[]) {
        const locationModelLinksMap = this.buildLocationModelLinkHashTable(locationModelLinks);
        const projectLocationTreeNodeMap = this.buildProjectTreeNodeHashTable(projectLocationNodes, locationModelLinksMap);

        const childNodes: IChildNode[] = [];

        projectLocationNodes.forEach((projectLocationNode) => {
            if(Boolean(projectLocationNode.parentProjectLocationTreeId)) {      
                const parentNode = projectLocationTreeNodeMap.get(projectLocationNode.parentProjectLocationTreeId);

                if (Boolean(parentNode)) {
                    parentNode!.childNodes.push(projectLocationTreeNodeMap.get(projectLocationNode.projectLocationTreeId)!);
                }
            } else {
                childNodes.push(projectLocationTreeNodeMap.get(projectLocationNode.projectLocationTreeId)!)
            }
        });

        this.childNodes = Boolean(childNodes) ? childNodes.map((childNode) => new ChildNode(childNode, 0, (node) => this.addChildNodeToMap(node))) : [];
    }

    private addChildNodeToMap(childNode: ChildNode) {
        this.childNodesMap.set(childNode.childNodeId, childNode);
    }

    private buildLocationModelLinkHashTable(locationModelLinks: ILocationModelLink[]) {
        const map = new Map<string, ILocationModelLink>([]);
        locationModelLinks.forEach((locationModelLink) => map.set(locationModelLink.projectLocationTreeId, locationModelLink));

        return map;
    }

    private buildProjectTreeNodeHashTable(projectLocationNodes: IProjectTreeNode[], locationModelLinksMap: Map<string, ILocationModelLink>) {
        const map = new Map<string, IChildNode>([]);

        projectLocationNodes.forEach((projectLocationNode) => {
            const childNode: IChildNode = {
                id: projectLocationNode.projectLocationTreeId,
                name: projectLocationNode.nodeName,
                parentId: projectLocationNode.parentProjectLocationTreeId,
                childNodes: [],
                locationModelLink: locationModelLinksMap.get(projectLocationNode.projectLocationTreeId),
            }
            map.set(projectLocationNode.projectLocationTreeId, childNode);
        });

        return map;
    }

    private setLinkedBuildings() {
        this.traverse((childNode) => {
            if (childNode.childNodeType === ChildNodeType.Building) {
                this.linkedBuildings.push(childNode);
            }
        });
    }
    
    public traverse(callback: (child: ChildNode) => void) {
        this.childNodes.forEach((childNode) => childNode.traverse(callback));
    }

    public get(id: string) {
        return this.childNodesMap.get(id);
    }
}