export abstract class TenantRole {
    static modelName = 'tenantRole';
    static selector = {
      id: 'id',
      role: 'role',
      tenantId: 'tenantId',
      description: 'description',
      deleted: 'deleted',
      createdBy: 'createdBy',
      updatedAt: 'updatedAt',
      createdAt: 'createdAt'
    };
  }
  
export abstract class ProjectRole {
    static modelName = 'projectRole';
    static insertInputType= 'insert_duplicateRole_mutation';
    static selector = {
      id: 'id',
      role: 'role',
      tenantId: 'tenantId',
      deleted: 'deleted',
      description: 'description',
      createdBy: 'createdBy',
      updatedAt: 'updatedAt',
      createdAt: 'createdAt',
      systemGenerated: 'systemGenerated'
    };
}