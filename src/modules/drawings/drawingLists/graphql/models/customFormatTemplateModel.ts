export abstract class DrawingTemplateFields {
    static modelName = 'drawingTemplateField';
    static selector = {
        id: 'id',
        label : 'label',
        name: 'name', 
        type: 'type',
        groupType: 'groupType',
        isDefault: 'isDefault',
        isMandatory: 'isMandatory'
    };
}

export abstract class CustomTemplateLists {
    static modelName = 'drawingTemplateFormat';
    static selector = {
        id: 'id',
        name: 'name',
        createdAt: 'createdAt',
        createdBy: 'createdBy',
        tenantAssociation: 'tenantAssociation',
        user: 'user',
        email: 'email',
        firstName: 'firstName',
        lastName: 'lastName'
    }
}

export abstract class CustomTemplateDetails {
    static modelName = 'drawingTemFieldFormatAssociation';
    static selector = {
        drawingFormatId: 'drawingFormatId',
        drawingFieldId: 'drawingFieldId',
        sequenceNumber: 'sequenceNumber'
    }
}