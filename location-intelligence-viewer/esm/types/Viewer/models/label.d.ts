import { Vector3 } from 'three';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer';
export declare class Label extends CSS2DObject {
    ownerId: number;
    contents: Element;
    constructor(ownerId: number, contents: Element, position: Vector3);
    isEqual(other: Label): boolean;
    copyLabel(label: Label): void;
}
