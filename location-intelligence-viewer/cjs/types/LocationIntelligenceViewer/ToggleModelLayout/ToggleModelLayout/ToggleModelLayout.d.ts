import { MutableRefObject } from 'react';
import { Level } from '../model/building/level';
import { Room } from '../model/building/room';
import { Zone } from '../model/building/zone';
import { NodeCollection } from '../model/nodeCollection/nodeCollection';
import { Building } from '../model/building/building';
declare type NodeTypes = Building | Level | Zone | Room | NodeCollection;
interface ModelLayoutProps {
    updateModalLayout: (value: string) => void;
    currentModalLayout: string;
    selectedNode: MutableRefObject<NodeTypes>;
}
export declare function ToggleModeLayout({ updateModalLayout, currentModalLayout, selectedNode }: ModelLayoutProps): JSX.Element;
export {};
