import { ColorRepresentation } from 'three';
import { HighlightOptions } from '../../../utils/highlightOptions';
import { SmartBuilding } from './smartBuilding';
import { SmartLevel } from './smartLevel';
import { SmartProjectSite } from './smartProjectSite';
import { SmartRoom } from './smartRoom';
import { SmartZone } from './smartZone';
export declare type NodeTypeStrings = 'Building' | 'Level' | 'Zone' | 'Room';
export declare type NodeTypes = SmartBuilding | SmartLevel | SmartZone | SmartRoom;
declare type FocusCallbacks = {
    callbackOnVisible?: () => void;
    callbackOnFinish?: () => void;
};
export declare class SmartNode {
    id: number;
    externalReferenceId: string;
    name: string;
    nodeType: NodeTypeStrings;
    parentNode: NodeTypes;
    parentProject: SmartProjectSite;
    isVisibleOnTree: boolean;
    nodeDepth: number;
    protected constructor(id: number, externalReferenceId: string, name: string, nodeType: NodeTypeStrings, parentNode: NodeTypes, nodeDepth: number);
    traverseAncestors(callback: (ancestor: SmartNode) => void): void;
    focus: (focusCallbacks?: FocusCallbacks) => void;
    /** Highlights The Node. Note: Highlighting a building actually highlights the levels that make up the building and highlighting a zone actually highlights the rooms that make up that zone. Calling highlight on a zone then calling highlight on a room within that zone will overwrite whatever color was set by the zone. */
    highlight: (color?: ColorRepresentation, options?: HighlightOptions) => void;
    unHighlight: (removeHighlightPersistance?: boolean) => void;
    setIssueCount: (count: number) => void;
    get isBuilding(): boolean;
    get isLevel(): boolean;
    get isZone(): boolean;
    get isRoom(): boolean;
    setIsVisibleOnTree(value: boolean): void;
}
export {};
