import { SmartBuilding } from './smartBuilding';
import { SmartLevel } from './smartLevel';
import { SmartNode } from './smartNode';
import { SmartNodeCollection } from './smartNodeCollection';
declare type FocusCallbacks = {
    callbackOnVisible?: () => void;
    callbackOnFinish?: () => void;
};
export declare class SmartProjectSite {
    id: number;
    buildings: SmartBuilding[];
    private externalReferenceNodeMap;
    constructor(id: number, buildings: SmartBuilding[]);
    findNodeById(id: number): SmartNode;
    findNodeByExternalId(externalId: string): SmartNode | SmartNodeCollection;
    focus: (focusCallbacks?: FocusCallbacks) => void;
    jumpTo: () => void;
    addToMap: () => void;
    removeFromMap: () => void;
    addToExternalReferenceNodes(node: SmartNode | SmartNodeCollection): void;
    createNodeCollectionFromIds: (ids: number[], name: string, externalReferenceId: string) => SmartNodeCollection;
    createNodeCollectionFromExternalReferenceIds(externalReferenceIds: string[], name: string, newNodeCollectionExternalReferenceId: string, metaDataInCaseOfError?: any): SmartNodeCollection;
    traverse(callback: (node: SmartNode) => void): void;
    setBuildingContext(): void;
    setLevelContext(): void;
    setRoomContext(level: SmartLevel): void;
    unHighlightAll(): void;
    show(): void;
    hide(): void;
    private setUpReferences;
}
export {};
