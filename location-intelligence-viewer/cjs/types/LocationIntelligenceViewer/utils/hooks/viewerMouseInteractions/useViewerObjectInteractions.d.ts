import { Object3D } from 'three';
import { Building } from '../../../model/building/building';
import { Level } from '../../../model/building/level';
import { Room } from '../../../model/building/room';
import { Zone } from '../../../model/building/zone';
import { NodeCollection } from '../../../model/nodeCollection/nodeCollection';
import { LabelManager } from '../labels/labelManager';
declare type NodeTypes = Building | Level | Zone | Room | NodeCollection;
export declare function useObjectInteractions(labelManager: LabelManager): {
    readonly onObjectHoverEnter: (object: Object3D) => void;
    readonly onObjectHoverExit: (object: Object3D) => void;
    readonly onSelectedNodeChange: (node: NodeTypes) => void;
    readonly onZoom: () => void;
    readonly onViewTypeChange: (value: '2D' | '3D') => void;
};
export {};
