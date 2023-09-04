

export interface AddressComponent {
    long_name: string;
    short_name: string;
    types: string[];
}

export interface Location {
    lat: number;
    lng: number;
}

export interface Northeast {
    lat: number;
    lng: number;
}

export interface Southwest {
    lat: number;
    lng: number;
}

export interface Viewport {
    northeast: Northeast;
    southwest: Southwest;
}

export interface Geometry {
    location: Location;
    viewport: Viewport;
}

export interface Success {
    address_components: AddressComponent[];
    geometry: Geometry;
    name: string;
    url: string;
}

