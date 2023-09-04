export abstract class Company {
  static modelName = 'company  ';
  static selector = {
    id: 'id',
    name: 'name'
  };
}

export abstract class TenantCompany {
    static modelName = 'tenantCompanyAssociation  ';
    static selector = {
      id: 'id',
      name: 'name',
      active: 'active',
      address: 'address',
      companyId: 'companyId',
      trade: 'trade',
      contactInfo: 'contactInfo',
      location: 'location',
      tenantId: 'tenantId',
      services: 'services',
      type: 'type',
      trades: 'trade',
      affectedRows: 'affectedRows',
      companyMaster: 'companyMaster',
    };
}
export abstract class TenantAssociation{
  static modelName = 'tenantAssociation';
  static selector = {
    userId: 'userId',
    tenantId: 'tenantId',
    role: 'role',
    status: 'status'
  };
  static relation = {
    user: 'user',
    role: 'tenantRole',
    companies: 'companies',
    projects: 'projects',
    projectAssociations: 'projectAssociations',
    companyAssociations: 'companyAssociations'
  };
}

export abstract class User {
  static modelName = 'user';
  static selector = {
    id: 'id',
    lastName: 'lastName',
    firstName: 'firstName',
    email: 'email',
    lastLoggedIn: 'lastLoggedIn',
    status: 'status',
    phone: 'phone',
    jobTitle: 'jobTitle',
    role: 'role',
    affectedRows: 'affected_rows'
  };
  static relation = {
    role: 'tenantRole',
    userStatus: 'userStatus',
    tenantAssociations: 'tenantAssociations'
  };
}

export abstract class TenantRole {
  static modelName = 'tenantRole';
  static selector = {
    id: 'id',
    role: 'role',
    tenantId: 'tenantId',
    description: 'description',
    deleted: 'deleted',
    createdBy: 'createdBy',
    updatedAt: 'updatedAt'
  };
}


export abstract class CompanyAssociation{
  static modelName = 'companyAssociation';
  static insertInputType= 'companyAssociation_insert_input';
  static updateType= 'companyAssociation_set_input';
  static selector = {
    affectedRows: 'affected_rows',
    companyId: 'companyId',
    tenantId: 'tenantId',
    userId: 'userId',
    status: 'status',
    updatedBy: 'updatedBy'
  };
  static relation = {
    company: 'company',
    tenantAssociation: 'tenantAssociation'
  };
  static orderBy = {
    tenantAssociation: 'tenantAssociation'
  };
}

export abstract class CompanyMaster {
  static modelName = 'companyMaster';
  static selector = {
    id: 'id',
    name: 'name',
    verified: 'verified',
    parentCompanyId: 'parentCompanyId'
  };
}

