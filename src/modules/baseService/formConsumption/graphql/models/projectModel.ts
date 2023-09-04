export abstract class projectModel {
    static modelName = 'project';
    static insertInputType= 'project_insert_input';
    static selector = {
      id: 'id',
      name: 'name',
      status: 'status',
      location: 'location',
      config: 'config',
      address: 'address',
      metrics: 'metrics',
      userId: 'userId',
      tenantId: 'tenantId',
      affectedRows: 'affected_rows'
    };
    static relation= {
      projectAssociation: 'projectAssociation'
    };
  }