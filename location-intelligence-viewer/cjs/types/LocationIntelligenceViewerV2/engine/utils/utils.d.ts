import { Matrix4 } from "three";
export declare class Utils {
    static makePerspectiveMatrix(fovy: number, aspect: number, near: number, far: number): Matrix4;
    static makeOrthographicMatrix(left: number, right: number, top: number, bottom: number, near: number, far: number): Matrix4;
    static projectedUnitsPerMeter(latitude: number): number;
}
