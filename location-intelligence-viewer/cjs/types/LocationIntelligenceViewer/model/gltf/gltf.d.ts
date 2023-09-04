import { Group } from 'three';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { Boundary } from './boundary';
import { Element3d } from './element3d';
import { Level } from './level';
export declare class Gltf {
    boundaries: Map<string, Boundary>;
    boundariesByLevel: Map<string, Boundary[]>;
    elements: Element3d[];
    private lidata;
    private group;
    constructor(source: GLTF);
    private createHierarchy;
    get model(): Group;
    get levelsMetadata(): Level[];
}
