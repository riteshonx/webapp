export abstract class Project {
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
      affectedRows: 'affected_rows',
      startDate:'startDate',
      endDate:'endDate'
    };
    static relation= {
      projectAssociation: 'projectAssociation'
    };
  }

  export abstract class ProjectAssociation {
    static modelName = 'projectAssociation';
    static insertInputType= 'projectAssociation_insert_input';
    static updateType= 'projectAssociation_set_input';
    static selector = {
      projectId: 'projectId',
      userId: 'userId',
      role: 'role',
      tenantAssociation: 'tenantAssociation',
      status: 'status',
      companyAssociations: 'companyAssociations ',
      company: 'company',
      id: 'id',
      name: 'name',
      user: 'user',
      email: 'email',
      firstName: 'firstName',
      jobTitle: 'jobTitle',
      lastName: 'lastName',
      phone: 'phone',
      projectRole: 'projectRole',
      projectAssociations: 'projectAssociations',
      affectedRows: 'affectedRows'
    };
  }

  export class ProjectAssociationPayload{
    constructor(public objects: Array<UserProjectAssociation>){}
  }

  export class UserProjectAssociation{
    constructor(
      public projectId: number,
      public role: number,
      public status: number,
      public userId: string){
    }
  }

  export class ProjectAssociationUpdate{
    constructor(
      public projectId: number,
      public userId: string,
      public status: number){
    }
  }

  export class ProjectAssociationRoleUpdate{
    constructor(
      public projectId: number,
      public userId: string,
      public role: number){
    }
  }
  