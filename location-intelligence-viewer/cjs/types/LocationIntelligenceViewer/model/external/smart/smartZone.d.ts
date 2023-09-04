import { SmartBuilding } from './smartBuilding';
import { SmartLevel } from './smartLevel';
import { SmartNode } from './smartNode';
import { SmartRoom } from './smartRoom';
export declare class SmartZone extends SmartNode {
    parentBuilding: SmartBuilding;
    parentLevel: SmartLevel;
    zones: SmartZone[];
    rooms: SmartRoom[];
    constructor(id: number, externalReferenceId: string, name: string, parent: SmartLevel | SmartZone, parentLevel: SmartLevel, nodeDepth: number);
    traverse(callback: (node: SmartNode) => void): void;
    findNodeById(id: number): SmartNode;
    findNodeByExternalId(externalId: string): SmartNode;
}
