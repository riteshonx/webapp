/// <reference types="react" />
import { Map } from '../../model/map/map';
export declare function useMap(): {
    readonly scenery: Map[];
    readonly setMap: import("react").Dispatch<import("react").SetStateAction<Map>>;
    readonly setMapVisible: import("react").Dispatch<import("react").SetStateAction<boolean>>;
};
