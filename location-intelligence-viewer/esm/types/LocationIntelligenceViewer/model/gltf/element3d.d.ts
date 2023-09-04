import { Mesh, Object3D } from "three";
export declare class Element3d {
    private scaleToMeters;
    sourceId: string;
    level: string;
    meshes: Mesh[];
    name: string;
    userData: {
        [key: string]: any;
    };
    constructor(source: Object3D);
    private findMeshes;
}
