import { Object3D } from "three";
import { Level } from "./level";
export declare class LocationIntelligenceData {
    private scaleToMeters;
    levels: Level[];
    private offset;
    constructor(source: Object3D);
}
