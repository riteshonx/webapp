export abstract class TaskLibrary {
    static modelName = 'taskLibrary';
    static selector = {
        duration: 'duration',
        taskName: 'taskName',
        taskType: 'taskType',
        customId: 'customId',
        customTaskType: 'customTaskType',
        classification: 'classification',
        description: 'description',
        tag: 'tag',
        id: 'id',
        createdBy: 'createdBy',
        createdAt: 'createdAt',
        tenantAssociation: 'tenantAssociation',
        user: 'user',
        firstName: 'firstName',
        lastName: 'lastName',
        userId: 'id'
    };
    static relation= {
    };
  }
