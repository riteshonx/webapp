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