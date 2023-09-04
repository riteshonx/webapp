import { SmartBuilding } from './smartBuilding';
import { SmartNode } from './smartNode';
import { SmartRoom } from './smartRoom';
import { SmartZone } from './smartZone';
export declare class SmartLevel extends SmartNode {
    parentBuilding: SmartBuilding;
    zones: SmartZone[];
    rooms: SmartRoom[];
    constructor(id: number, externalReferenceId: string, name: string, parent: SmartBuilding, nodeDepth: number);
    setContext(): void;
    setRoomContext(): void;
    hideOtherLevels(): void;
    traverse(callback: (node: SmartNode) => void): void;
    findNodeById(id: number): SmartNode;
    findNodeByExternalId(externalId: string): SmartNode;
}
