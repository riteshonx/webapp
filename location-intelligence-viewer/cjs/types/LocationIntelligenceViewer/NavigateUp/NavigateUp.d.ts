import { MutableRefObject } from 'react';
import { Building } from '../model/building/building';
import { Level } from '../model/building/level';
import { Room } from '../model/building/room';
import { Zone } from '../model/building/zone';
import { NodeCollection } from '../model/nodeCollection/nodeCollection';
declare type NodeTypes = Building | Level | Zone | Room | NodeCollection;
interface NavigateUpProps {
    selectedNode: MutableRefObject<NodeTypes>;
    setSelectedNode: (node: NodeTypes) => void;
    onBuildingLeave: (building: Building) => void;
}
export declare function NavigateUp({ selectedNode, setSelectedNode, onBuildingLeave }: NavigateUpProps): JSX.Element;
export {};
