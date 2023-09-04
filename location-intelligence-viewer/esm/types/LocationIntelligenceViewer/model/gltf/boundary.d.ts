import { Mesh, Object3D, Vector3 } from "three";
export declare enum BoundaryType {
    Room = "room",
    Area = "area"
}
export declare class Boundary {
    sourceId: string;
    roomLevels: string[];
    type: BoundaryType;
    level: string;
    center: Vector3;
    mesh: Mesh;
    name: string;
    private scaleToMeters;
    constructor(source: Object3D);
    private findMesh;
}
