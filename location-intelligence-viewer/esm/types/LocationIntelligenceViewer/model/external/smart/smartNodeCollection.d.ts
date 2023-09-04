import { SmartLevel } from './smartLevel';
import { SmartNode } from './smartNode';
export declare class SmartNodeCollection {
    id: number;
    name: string;
    externalReferenceId: string;
    nodeType: 'NodeCollection';
    nodes: (SmartNode | SmartNodeCollection)[];
    private nodesByExternalReferenceIdMap;
    nodeDepth: number;
    highestNode: SmartNode | SmartNodeCollection;
    parentLevel?: SmartLevel;
    constructor(id: number, name: string, externalReferenceId: string, nodes: (SmartNode | SmartNodeCollection)[], parentLevel: SmartLevel);
    highlight: () => void;
    unHighlight: () => void;
    focus: () => void;
    focusOnLevel: () => void;
    get parentNode(): SmartNode | SmartNodeCollection;
    findNodeByExternalReferenceId(externalReferenceId: string): SmartNode | SmartNodeCollection;
    traverseAncestors(callback: (ancestor: SmartNode | SmartNodeCollection) => void): void;
    private findHighestNode;
    updateParentNode(locationTreeNodeId: string): void;
}
