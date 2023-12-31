export interface EditViewFormParams {
    id: string;
    featureId: string;
    formId: string;
}

export interface CreateFormParams {
    id: string;
    featureId: string
}

export interface FormFieldData{
    autoGenerated: boolean;
    caption: string;
    configListId: any;
    elementId: string;
    fieldTypeId: number;
    fixed: boolean;
    required: boolean;
    sequence: number;
    width: number;
    tableId: string;
    metaData:any;
    tableFields?:any;
    filterable?: any;
}

export interface FormFieldDetailsData{
    value: string;
    typeId: number;
    caption?: string;
    elementId: string;
    scheduleImpactComments?: string;
    costImpactComments?: string;
}