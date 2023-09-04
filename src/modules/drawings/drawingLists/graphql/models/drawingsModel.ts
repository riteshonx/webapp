export abstract class Drawings {
    static modelName = 'drawingUploadStatus  ';
    static selector = {
        id: 'id',
        fileName: 'fileName',
        fileSize: 'fileSize',
        reviewedBy: 'reviewedBy',
        sourceKey: 'sourceKey',
        status: 'status',
        createdAt: 'createdAt',
        createdByTenantUser: 'createdByTenantUser',
        versionInfo: 'versionInfo',
        categoriesReviewed: 'categoriesReviewed',
        sheetsReviewed: 'sheetsReviewed',
        versionInfoReviewed: 'versionInfoReviewed',
        sheets: 'sheets',
        user: 'user',
        email: 'email',
        firstName: 'firstName',
        lastName: 'lastName',
        progress: 'progress',
        drawingNumFormat: 'drawingNumFormat'
    };
}