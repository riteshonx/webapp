interface FormLocationValue {
    id: string;
    nodeName: string;
}

export interface ILocation {
    locationReferenceId: string;
    locationValue: string[];
    formLocationValue: FormLocationValue;
}