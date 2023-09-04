import { SmartBuilding } from './smartBuilding';
import { SmartLevel } from './smartLevel';
import { SmartNode } from './smartNode';
import { SmartZone } from './smartZone';
export declare class SmartRoom extends SmartNode {
    parentBuilding: SmartBuilding;
    parentLevel: SmartLevel;
    constructor(id: number, externalReferenceId: string, name: string, parent: SmartLevel | SmartZone, parentLevel: SmartLevel, nodeDepth: number);
    traverse(callback: (node: SmartNode) => void): void;
}
