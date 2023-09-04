export class Link{
    constructor(
        public typeName: string,
        public values: Array<FeatureLink>,
    ){

    }
}

export interface FeatureLink{
    name: string,
    feature: string,
    relationShip: string,
    id: any,
    targetId: any,
    targetType: number
}

export enum TabType {
    forms= "Forms",
    Drawings= "Drawings",
    Specifications= "Specifications",
    Tasks= "Tasks"
}

