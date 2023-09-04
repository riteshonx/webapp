import { GridSize } from "@material-ui/core";

export interface IFieldInput{
    dataType: string;
    fieldType: string;
    id: number;
}

export interface TemplateData {
    id: string;
    fixed: boolean;
    caption: string;
    required: number;
    sequence: number;
    elementId: string;
    fieldTypeId: number;
    width:GridSize;
    configListId: number;
    originalCaption: string;
    autoGenerated?:boolean;
    metadata?:any;
    showNumberColumn?:boolean;
    updated?:boolean;
    duplicateCaption?:boolean;
    fieldUid?:string;
    isEditable?:boolean;
}

export interface TemplateDatePayload{
    caption: string;
    required: boolean;
    fieldTypeId: number;
    width: number;
    elementId?: string;
    sequence?: number;
    configListId?:number;
    fixed?: boolean;
    metadata?: any
}

export interface DefaultFormTemplate {
    featureId: number;
    templateData: TemplateData[];
    templateName: string;
}

export interface ITemplate{
    id: number,
    templateName: string,
    updatedAt: Date,
    updatedBy: string,
    featureId: number,
    createdAt: Date,
    createdBy: string,
    default: boolean,
    numberOfFields: number;
    templateData:Array<TemplateData>;
    noOfProjects: number;
    systemGenerated: boolean;
    actions?: any;
}

export interface Forms{
    id: number;
    name: string;
    templateCount: number;
    tenantId: number;
    caption?:string;
}

export interface Template{
    standardForms: Array<Forms>,
    openForms: Array<Forms>,
    templates: Array<ITemplate>,
    currentFeature: Forms|any,
    currentFeatureId: any
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface

export interface CustomList{
    id: number;
    name: string;
}

export interface ColumnList{
    field: string,
    headerName: string,
    width: number,
    editable: boolean,
    sortable: boolean,
}

export interface RowList{
     id: number, 
     clickToDefine2: string, 
     clickToDefine1: string,
    clickToDefine3: string 
}

export interface TableDataList{
    columns:Array<ColumnList>,
    rows:Array<any>,
    required: boolean,
    headerName: string,
}
