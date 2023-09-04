export abstract class DrawingSheets {
    static modelName = 'drawingSheets  ';
    static customQuery = 'drawingSheet_query'
    static selector = {
        id: 'id',
        filePath: 'filePath',
        sourceId: 'sourceId',
        createdAt: 'createdAt',
        createdBy: 'createdBy',
        drawingCategory: 'drawingCategory',
        drawingName: 'drawingName',
        drawingNumber: 'drawingNumber',
        drawingSequence: 'drawingSequence',
        updatedAt: 'updatedAt',
        updatedBy: 'updatedBy',
        email: 'email',
        firstName: 'firstName',
        lastName: 'lastName',
        setVersionDate: 'setVersionDate',
        setTitle: 'setTitle',
        setVersionName: 'setVersionName',
        thumbnailPath: 'thumbnailPath',
        dwgClassification: 'dwgClassification',
        dwgLevel: 'dwgLevel',
        dwgOriginator: 'dwgOriginator',
        dwgProjectNumber: 'dwgProjectNumber',
        dwgRevision: 'dwgRevision',
        dwgRole: 'dwgRole',
        dwgSheetNumber: 'dwgSheetNumber',
        dwgStatus: 'dwgStatus',
        dwgSuitability: 'dwgSuitability',
        dwgType: 'dwgType',
        dwgVolume: 'dwgVolume',
        status: 'status',
        revisionInfo: 'revisionInfo',
        drawingTemplateFormatId: 'drawingTemplateFormatId',
        rotation: 'rotation',
        dwgZone: 'dwgZone'
    }    
}

export abstract class ProjectUsers {
    static modelName = 'user  ';
    static selector = {
        id: 'id',
        email: 'email',
        firstName: 'firstName',
        lastName: 'lastName',
        status: 'status'
    }    
}