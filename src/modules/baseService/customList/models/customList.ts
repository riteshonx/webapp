
    export interface ConfigurationValue {
        id: string;
        nodeName: string;
        parentId?: any;
    }

    export interface ConfigurationList {
        id: number;
        name: string;
        configurationValues: number;
        createdAt: Date;
        updatedAt: Date;
        systemGenerated?: boolean,
        actions?: any;
    }

    export class ConfigListItem{
        constructor(
            public id: string,
            public nodeName: string,
            public parentId: string| null,
            public childItems: Array<ConfigListItem>,
            public isOpen: boolean= false,
            public isEdit: boolean= false,
            public nodeNameEdited: boolean= false,
            public inserted: boolean= false
        ){}
    }

    export interface ICustomListState{
        listOfConfigValues: Array<ConfigListItem>
    }

    export interface IConfigDataPayload{
        configValueId: string;
         nodeName: string;
         parentId?: string|null
    }