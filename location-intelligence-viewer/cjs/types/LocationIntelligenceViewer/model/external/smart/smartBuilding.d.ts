import { DisplayStyle } from '../../../materials/displayStyle';
import { SmartLevel } from './smartLevel';
import { SmartNode } from './smartNode';
export declare class SmartBuilding extends SmartNode {
    levels: SmartLevel[];
    constructor(id: number, externalReferenceId: string, name: string, nodeDepth: number);
    show: () => void;
    hide: () => void;
    onlyShowLevel: (level: SmartLevel) => void;
    setDisplayStyle: (displayStyle: DisplayStyle) => void;
    setBuildingContext: () => void;
    setLevelContext: (levels?: SmartLevel[]) => void;
    setRoomContext: (level: SmartLevel) => void;
    unHighlightAll(): void;
    traverse(callback: (node: SmartNode) => void): void;
    findNodeById(id: number): SmartNode;
    findNodeByExternalId(externalId: string): SmartNode;
}
