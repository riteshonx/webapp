export abstract class TenantCompany {
  static modelName = "tenantCompanyAssociation";
  static selector = {
    id: "id",
    name: "name",
    active: "active",
  };
}

export abstract class ProjectsUsers {
  static modelName = "user";
  static selector = {
    id: "id",
    firstName: "firstName",
    lastName: "lastName",
  };
}

export abstract class ProjectAssociationUsers {
  static modelName = "projectAssociation";
  static tenantAssociation = "tenantAssociation";
  static user = "user";
  static selector = {
    id: "id",
    firstName: "firstName",
    lastName: "lastName",
    email: "email",
  };
}
