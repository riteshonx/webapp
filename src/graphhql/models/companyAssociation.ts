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
  