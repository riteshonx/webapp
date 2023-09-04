
export interface attributeType {
    title: string,
    value: string,
    type: keyof typeof operatorsList
    parent: string,
    attrValueTable: string,
    elementTableName: string
}

export interface filterType {
    id: string
    title: string,
    color: number[] | null,
    queryIds: string | null,
    handleIds: string[],
    isNewFilter: false,
    queryParams: any[],
    queryName: string,
    queryType: string,
    hidden: false
}

export const attributeList = <attributeType[]>[
    {
        title: 'non_priority',
        value: 'non_priority',
        type: 'non_priority',
        parent: 'bimElementProperties',
        attrValueTable: 'bimElementProperties',
        elementTableName: 'bimElementProperties'
    },
    {
        title: 'Category',
        value: 'categoryName',
        type: 'string',
        category: 'Basic',
        parent: 'bimCategory',
        attrValueTable: 'bimCategory',
        elementTableName: 'bimElementProperties'
    },
    {
        title: 'Family Name',
        value: 'familyName',
        type: 'string',
        category: 'Basic',
        parent: 'bimFamilyProperty',
        attrValueTable: 'bimFamilyProperties',
        elementTableName: 'bimElementProperties'
    },
    {
        title: 'Type',
        value: 'type',
        type: 'string',
        category: 'Basic',
        parent: 'bimFamilyProperty',
        attrValueTable: 'bimFamilyProperties',
        elementTableName: 'bimElementProperties'
    },
    {
        title: 'Type Comments',
        value: 'typeComments',
        type: 'string',
        category: 'Basic',
        parent: 'bimFamilyProperty',
        attrValueTable: 'bimFamilyProperties',
        elementTableName: 'bimElementProperties'
    },
    {
        title: 'Type Mark',
        value: 'typeMark',
        type: 'string',
        category: 'Basic',
        parent: 'bimFamilyProperty',
        attrValueTable: 'bimFamilyProperties',
        elementTableName: 'bimElementProperties'
    },
    {
        title: 'Description',
        value: 'description',
        type: 'string',
        category: 'Basic',
        parent: 'bimFamilyProperty',
        attrValueTable: 'bimFamilyProperties',
        elementTableName: 'bimElementProperties'
    },
    {
        title: 'Assembly Code',
        value: 'assemblyCode',
        type: 'string',
        category: 'Basic',
        parent: 'bimFamilyProperty',
        attrValueTable: 'bimFamilyProperties',
        elementTableName: 'bimElementProperties'
    },
    {
        title: 'Assembly Description',
        value: 'assemblyDescription',
        type: 'string',
        category: 'Basic',
        parent: 'bimFamilyProperty',
        attrValueTable: 'bimFamilyProperties',
        elementTableName: 'bimElementProperties'
    },
    {
        title: 'Assembly Name',
        value: 'assemblyName',
        type: 'string',
        category: 'Basic',
        parent: 'bimFamilyProperty',
        attrValueTable: 'bimFamilyProperties',
        elementTableName: 'bimElementProperties'
    },
    {
        title: 'Omni Class Code',
        value: 'omniclassCode',
        type: 'string',
        category: 'Basic',
        parent: 'bimFamilyProperty',
        attrValueTable: 'bimFamilyProperties',
        elementTableName: 'bimElementProperties'
    },
    {
        title: 'Omni Class Number',
        value: 'omniClassNumber',
        type: 'string',
        category: 'Basic',
        parent: 'bimFamilyProperty',
        attrValueTable: 'bimFamilyProperties',
        elementTableName: 'bimElementProperties'
    },
    {
        title: 'Omni Class Description',
        value: 'omniClassDescription',
        type: 'string',
        category: 'Basic',
        parent: 'bimFamilyProperty',
        attrValueTable: 'bimFamilyProperties',
        elementTableName: 'bimElementProperties'
    },
    {
        title: 'Mark',
        value: 'mark',
        type: 'string',
        category: 'Basic',
        parent: 'bimFamilyProperty',
        attrValueTable: 'bimFamilyProperties',
        elementTableName: 'bimElementProperties'
    },
    {
        title: 'Material',
        value: 'material',
        type: 'string',
        category: 'Basic',
        parent: 'bimElementProperties',
        attrValueTable: 'bimElementProperties',
        elementTableName: 'bimElementProperties'
    },
    {
        title: 'Model',
        value: 'model',
        type: 'string',
        category: 'Basic',
        parent: 'bimFamilyProperty',
        attrValueTable: 'bimFamilyProperties',
        elementTableName: 'bimElementProperties'
    },
    {
        title: 'Manufacturer',
        value: 'manufacturer',
        type: 'string',
        category: 'Basic',
        parent: 'bimFamilyProperty',
        attrValueTable: 'bimFamilyProperties',
        elementTableName: 'bimElementProperties'
    },
    {
        title: 'Level',
        value: 'level',
        type: 'string',
        category: 'Level',
        parent: 'bimLevelProperties',
        attrValueTable: 'bimLevelProperties',
        elementTableName: 'bimElementProperty'
    },
    {
        title: 'Base Constraint',
        value: 'baseConstraint',
        type: 'string',
        category: 'Level',
        parent: 'bimLevelProperties',
        attrValueTable: 'bimLevelProperties',
        elementTableName: 'bimElementProperty'
    },
    {
        title: 'Base Level',
        value: 'baseLevel',
        type: 'string',
        category: 'Level',
        parent: 'bimLevelProperties',
        attrValueTable: 'bimLevelProperties',
        elementTableName: 'bimElementProperty'
    },
    {
        title: 'Base Offset',
        value: 'strBaseOffset',
        type: 'string',
        category: 'Level',
        parent: 'bimLevelProperties',
        attrValueTable: 'bimLevelProperties',
        elementTableName: 'bimElementProperty'
    },
    {
        title: 'Top Constraint',
        value: 'topConstraint',
        type: 'string',
        category: 'Level',
        parent: 'bimLevelProperties',
        attrValueTable: 'bimLevelProperties',
        elementTableName: 'bimElementProperty'
    },
    {
        title: 'Top Level',
        value: 'topLevel',
        type: 'string',
        category: 'Level',
        parent: 'bimLevelProperties',
        attrValueTable: 'bimLevelProperties',
        elementTableName: 'bimElementProperty'
    },
    {
        title: 'Top Offset',
        value: 'strTopOffset',
        type: 'string',
        category: 'Level',
        parent: 'bimLevelProperties',
        attrValueTable: 'bimLevelProperties',
        elementTableName: 'bimElementProperty'
    },
    {
        title: 'Top Extension Distance',
        value: 'strTopExtDistance',
        type: 'string',
        category: 'Level',
        parent: 'bimLevelProperties',
        attrValueTable: 'bimLevelProperties',
        elementTableName: 'bimElementProperty'
    },
    {
        title: 'Elevation at Top',
        value: 'strTopElevation',
        type: 'string',
        category: 'Level',
        parent: 'bimLevelProperties',
        attrValueTable: 'bimLevelProperties',
        elementTableName: 'bimElementProperty'
    },
    {
        title: 'Elevation at Bottom',
        value: 'strBottomElevation',
        type: 'string',
        category: 'Level',
        parent: 'bimLevelProperties',
        attrValueTable: 'bimLevelProperties',
        elementTableName: 'bimElementProperty'
    },
    {
        title: 'Elevation From Level',
        value: 'strElevationFromLevel',
        type: 'string',
        category: 'Level',
        parent: 'bimLevelProperties',
        attrValueTable: 'bimLevelProperties',
        elementTableName: 'bimElementProperty'
    },
    {
        title: 'Unconnected Height',
        value: 'strUnconnectedHeight',
        type: 'string',
        category: 'Level',
        parent: 'bimLevelProperties',
        attrValueTable: 'bimLevelProperties',
        elementTableName: 'bimElementProperty'
    },
    {
        title: 'Height Offset From Level',
        value: 'strHeightOffsetFrom',
        type: 'string',
        category: 'Level',
        parent: 'bimLevelProperties',
        attrValueTable: 'bimLevelProperties',
        elementTableName: 'bimElementProperty'
    },
    {
        title: 'Sill Height',
        value: 'strSillHeight',
        type: 'string',
        category: 'Level',
        parent: 'bimLevelProperties',
        attrValueTable: 'bimLevelProperties',
        elementTableName: 'bimElementProperty'
    },
    {
        title: 'Head Height',
        value: 'strHeadHeight',
        type: 'string',
        category: 'Level',
        parent: 'bimLevelProperties',
        attrValueTable: 'bimLevelProperties',
        elementTableName: 'bimElementProperty'
    },
    {
        title: 'Host',
        value: 'host',
        type: 'string',
        category: 'Level',
        parent: 'bimLevelProperties',
        attrValueTable: 'bimLevelProperties',
        elementTableName: 'bimElementProperty'
    },
    {
        title: 'Thickness',
        value: 'strThickness',
        type: 'string',
        category: 'Dimensions',
        parent: 'bimDimensionProperties',
        attrValueTable: 'bimDimensionProperties',
        elementTableName: 'bimElementProperty'
    },
    {
        title: 'Volume',
        value: 'strVolume',
        type: 'string',
        category: 'Dimensions',
        parent: 'bimDimensionProperties',
        attrValueTable: 'bimDimensionProperties',
        elementTableName: 'bimElementProperty'
    },
    {
        title: 'Length',
        value: 'strLength',
        type: 'string',
        category: 'Dimensions',
        parent: 'bimDimensionProperties',
        attrValueTable: 'bimDimensionProperties',
        elementTableName: 'bimElementProperty'
    },
    {
        title: 'Area',
        value: 'strArea',
        type: 'string',
        category: 'Dimensions',
        parent: 'bimDimensionProperties',
        attrValueTable: 'bimDimensionProperties',
        elementTableName: 'bimElementProperty'
    },
    {
        title: 'Projected Area',
        value: 'strProjectedArea',
        type: 'string',
        category: 'Dimensions',
        parent: 'bimDimensionProperties',
        attrValueTable: 'bimDimensionProperties',
        elementTableName: 'bimElementProperty'
    },
    {
        title: 'Surface Area',
        value: 'strSurfaceArea',
        type: 'string',
        category: 'Dimensions',
        parent: 'bimDimensionProperties',
        attrValueTable: 'bimDimensionProperties',
        elementTableName: 'bimElementProperty'
    },
    {
        title: 'Perimeter',
        value: 'strPerimeter',
        type: 'string',
        category: 'Dimensions',
        parent: 'bimDimensionProperties',
        attrValueTable: 'bimDimensionProperties',
        elementTableName: 'bimElementProperty'
    },
    {
        title: 'Slope',
        value: 'strSlope',
        type: 'string',
        category: 'Dimensions',
        parent: 'bimDimensionProperties',
        attrValueTable: 'bimDimensionProperties',
        elementTableName: 'bimElementProperty'
    },
    {
        title: 'Fire Rating',
        value: 'fireRating',
        type: 'string',
        category: 'Construction',
        parent: 'bimElementProperties',
        attrValueTable: 'bimElementProperties',
        elementTableName: 'bimElementProperties'
    },
    {
        title: 'Function Name',
        value: 'functionName',
        type: 'string',
        category: 'Construction',
        parent: 'bimElementProperties',
        attrValueTable: 'bimElementProperties',
        elementTableName: 'bimElementProperties'
    },
    {
        title: 'Family and Type',
        value: 'familyandType',
        type: 'string',
        category: 'Construction',
        parent: 'bimElementProperties',
        attrValueTable: 'bimElementProperties',
        elementTableName: 'bimElementProperties'
    },
    {
        title: 'Assembly Mark Number',
        value: 'assemblyMarkNumber',
        type: 'string',
        category: 'Construction',
        parent: 'bimElementProperties',
        attrValueTable: 'bimElementProperties',
        elementTableName: 'bimElementProperties'
    },
    {
        title: 'Structural Usage',
        value: 'structuralUsage',
        type: 'string',
        category: 'Construction',
        parent: 'bimElementProperties',
        attrValueTable: 'bimElementProperties',
        elementTableName: 'bimElementProperties'
    },
    {
        title: 'Elements',
        value: 'sourceId',
        type: 'element',
        parent: 'bimElementProperties',
        attrValueTable: 'bimElementProperties',
        elementTableName: 'bimElementProperties'
    }
];

const equalTo = {
    title: 'Equal to',
    value: '_eq',
    symbol: '=',
    type: 'single'
};

const notEqualTo = {
    title: 'Not equal to',
    value: '_neq',
    symbol: '<>',
    type: 'single'
};


export const operatorsList = {
    'string': [
        equalTo,
        notEqualTo,
        {
            title: 'Contains',
            value: '_in',
            symbol: '(*)',
            type: 'multiple'
        },
        {
            title: 'Does not contain',
            value: '_nin',
            symbol: '(/)',
            type: 'multiple'
        }
    ],
    'number' : [
        equalTo,
        notEqualTo,
        {
            title: 'Greater than',
            value: '_gt',
            symbol: '>',
            type: 'single'
        },
        {
            title: 'Less than',
            value: '_lt',
            symbol: '<',
            type: 'single'
        },
        {
            title: 'Greater than or equal to',
            value: '_gte',
            symbol: '>=',
            type: 'single'
        },
        {
            title: 'Less than or equal to',
            value: '_lte',
            symbol: '<=',
            type: 'single'
        },
        
    ],
    'element': [
        {
            title: 'Inside',
            value: '_in',
            symbol: 'Inside',
            type: 'multiple'
        },
    ],
    'non_priority': [
        {
            title: 'Equal to',
            value: 'equals',
            symbol: '=',
            type: 'single'
        },
        {
            title: 'Not equal to',
            value: 'notEquals',
            symbol: '<>',
            type: 'single'
        },
        {
            title: 'Contains',
            value: 'contains',
            symbol: '(*)',
            type: 'multiple'
        },
        {
            title: 'Does not contain',
            value: 'notContains',
            symbol: '(/)',
            type: 'multiple'
        }
    ]
}

export const elementPropList = [
    {tittle:'Source Id', key: 'sourceId'},
    {tittle:'Category', parent: 'category', key: 'categoryName'},
    {tittle:'Family Name', parent: 'family', key: 'familyName'},
    {tittle:'FamilyId', parent: 'family', key: 'familyId'},
    {tittle:'Description', parent: 'family', key: 'description'},
    {tittle:'Family and Type', key: 'familyandType'},
    {tittle:'Assembly Mark Number', key: 'assemblyMarkNumber'},
    {tittle:'Suctural Usage', key: 'structuralUsage'},
    {tittle:'Function Name', key: 'functionName'},
    {tittle:'Is External', key: 'isExternal'},
    {tittle:'FireRating', key: 'fireRating'},
    {tittle:'Material', key: 'material'},
    {tittle:'Mark', parent: 'family', key: 'mark'},
    {tittle:'Type', parent: 'family', key: 'type'},
    {tittle:'Model', parent: 'family', key: 'model'},
    {tittle:'Area', parent: 'dimension', key: 'strArea'},
    {tittle:'Slope', parent: 'dimension', key: 'strSlope'},
    {tittle:'Length', parent: 'dimension', key: 'strLength'},
    {tittle:'Volume', parent: 'dimension', key: 'strVolume'},
    {tittle:'Perimeter', parent: 'dimension', key: 'strPerimeter'},
    {tittle:'Thickness', parent: 'dimension', key: 'strThickness'},
    {tittle:'SurfaceArea', parent: 'dimension', key: 'strSurfaceArea'},
    {tittle:'ProjectedArea', parent: 'dimension', key: 'strProjectedArea'},
    {tittle:'Type Mark', parent: 'family', key: 'typeMark'},
    {tittle:'Assembly Code', parent: 'family', key: 'assemblyCode'},
    {tittle:'AssemblyName', parent: 'family', key: 'assemblyName'},
    {tittle:'Manufacturer', parent: 'family', key: 'manufacturer'},
    {tittle:'Type Comments', parent: 'family', key: 'typeComments'},
    {tittle:'Omni Class Code', parent: 'family', key: 'omniclassCode'},
    {tittle:'Omni Class Number', parent: 'family', key: 'omniClassNumber'},
    {tittle:'Assembly Description', parent: 'family', key: 'assemblyDescription'},
    {tittle:'Omni Class Description', parent: 'family', key: 'omniClassDescription'},
    {tittle:'Top Level', parent: 'level', key: 'topLevel'},
    {tittle:'Top Offset', parent: 'level', key: 'strTopOffset'},
    {tittle:'BaseOffset', parent: 'level', key: 'strBaseOffset'},
    {tittle:'HeadHeight', parent: 'level', key: 'strHeadHeight'},
    {tittle:'SillHeight', parent: 'level', key: 'strSillHeight'},
    {tittle:'TopElevation', parent: 'level', key: 'strTopElevation'},
    {tittle:'TopExtDistance', parent: 'level', key: 'strTopExtDistance'},
    {tittle:'BottomElevation', parent: 'level', key: 'strBottomElevation'},
    {tittle:'HeightOffsetFrom', parent: 'level', key: 'strHeightOffsetFrom'},
    {tittle:'UnconnectedHeight', parent: 'level', key: 'strUnconnectedHeight'},
    {tittle:'ElevationFromLevel', parent: 'level', key: 'strElevationFromLevel'}
]

export const viewNameMapping: any = {
    "LevelView": "By Level",
    "ScheduleView": "By Schedule"
}

export const statusColorNameMapping: any = {
    "Complete":  {
        "title": "Completed",
        "color": "#48af41"
    },
    "In-Progress": {
        "title": "In-Progress",
        "color": "#e69233"
    },
    "To-Do": {
        "title": "To-Do",
        "color": "#9E9E9E"
    }
}


export const materialStatusMsg: any = {
    "MATERIAL_ALREADY_UPDATED_OR_NOELEMENTS_FOUND":  "Material data is already updated or no elements are found in the filter",
    "MATERIAL_NOT_FOUND": "Material data is not available"
}

export const stepsDetailsModelDetails = [{
    inProgressTitle: 'Uploading File...',
    CompletedTitle: 'File Uploaded',
    errorTitle: 'File Upload Failed',
    paramters: [
        'Uploaded on',
        'Started at',
        'Progress',
        'Avg. Upload Speed',
        'Completed at',
        'Duration',
    ],
    values: Array<any>()
},
{
    inProgressTitle: 'Converting File...',
    CompletedTitle: 'File Converted',
    errorTitle: 'File Conversion Failed',
    paramters: [
        'Started at',
        'Completed at',
        'Duration',
    ],
    values: Array<any>()
},
{
    inProgressTitle: 'Building DataSet...',
    CompletedTitle: 'DataSet Built',
    errorTitle: 'DataSet Build Failed',
    paramters: [
        'Started at',
        'Completed at',
        'Duration',
    ],
    values: Array<any>()
},
{
    inProgressTitle: 'Sending Notification...',
    CompletedTitle: 'Notification Sent',
    errorTitle: 'Notification send Failed',
    paramters: [],
    values: Array<any>()
}];

export const bimstatusColorNameMapping: any = {
    "UPLOADED": {
        "title": "Uploaded",
        "color": "#6BA366"
    },
    "MODEL_PROCESSING_STARTED": {
        "title": "Model Processing Started",
        "color": "#6BA366"
    },
    "MODEL_PROCESSING_COMPLETED": {
        "title": "Model Processing Completed",
        "color": "#6BA366"
    },
    "DATA_PROCESSING_COMPLETED": {
        "title": "Data Processing Completed",
        "color": "#6BA366"
    },
    "COMPLETED":  {
        "title": "Completed",
        "color": "#6BA366"
    },
    "DELETED": {
        "title": "Deleted",
        "color": "#E57569"
    },
    "ABORTED": {
        "title": "Aborted",
        "color": "#FE0505"
    },
    "DATA_PROCESSING_FAILED": {
        "title": "Data Processing Failed",
        "color": "#FE0505"
    },
    "MODEL_PROCESSING_FAILED": {
        "title": "Model Processing Failed",
        "color": "#FE0505"
    }
}
