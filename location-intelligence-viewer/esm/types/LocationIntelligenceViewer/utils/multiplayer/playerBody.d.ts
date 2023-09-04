import { Color, ColorRepresentation, Object3D } from 'three';
export declare class PlayerBody extends Object3D {
    private mesh;
    constructor(color: ColorRepresentation);
    setColor(color: Color): void;
}
