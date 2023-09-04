export abstract class ProjectFeature {
    static modelName = 'projectFeature';
    static selector = {
      id: 'id',
      feature: 'feature',
      tenantId : 'tenantId'
    };
    static relation= {
      formTemplates: 'formTemplates'
    };
  }