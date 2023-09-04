/* eslint-disable @typescript-eslint/naming-convention */
export interface DecodedToken {
  "user-name": string;
  "user-id": string;
  "user-email": string;
  "tenant-id": string;
  "tenant-name": string;
  "tenant-company": string;
  "x-hasura-user-id": string;
  "x-hasura-tenant-id": string;
  "x-hasura-project-id": string;
  "x-hasura-allowed-company-ids": string;
  "x-hasura-project-role-id": string;
  "x-hasura-allowed-roles": Array<string>;
  "x-hasura-default-role": string;
  "x-hasura-allowed-create-ids": string;
  "x-hasura-allowed-update-ids": string;
  "x-hasura-allowed-view-ids": string;
  "x-hasura-allowed-delete-ids": string;
  type: string;
  exp: number;
  iat: number;
  tenants: Array<Tenant>;
  "admin-user": boolean;
}

export class Token {
  userName: string;
  userId: string;
  userEmail: string;
  tenantId: string;
  tenantName: string;
  tenantCompany: string;
  type: any;
  exp: any;
  iat: any;
  tenants: Array<Tenant>;
  adminUser: boolean;

  constructor(dToken: DecodedToken) {
    this.userId = dToken["x-hasura-user-id"];
    this.userName = dToken["user-name"];
    this.userEmail = dToken["user-email"];
    this.tenantId = dToken["x-hasura-tenant-id"];
    this.tenantName = dToken["tenant-name"];
    this.tenantCompany = dToken["tenant-company"];
    this.type = dToken.type ? dToken.type : "";
    this.exp = dToken.exp ? dToken.exp : "";
    this.iat = dToken.iat ? dToken.iat : "";
    this.tenants = dToken.tenants ? dToken.tenants : [];
    this.adminUser = dToken["admin-user"];
  }
}

export class ExchangeToken {
  userName: string;
  userId: string;
  userEmail: string;
  tenantId: string;
  tenantName: string;
  tenantCompany: string;
  allowedRoles: Array<string>;
  defaultRole: string;
  exp: any;
  iat: any;
  adminUser: boolean;

  constructor(dToken: DecodedToken) {
    this.userId = dToken["x-hasura-user-id"];
    this.userName = dToken["user-name"];
    this.userEmail = dToken["user-email"];
    this.tenantId = dToken["x-hasura-tenant-id"];
    this.tenantName = dToken["tenant-name"];
    this.tenantCompany = dToken["tenant-company"];
    this.allowedRoles = dToken["x-hasura-allowed-roles"];
    this.defaultRole = dToken["x-hasura-default-role"];
    this.exp = dToken.exp ? dToken.exp : "";
    this.iat = dToken.iat ? dToken.iat : "";
    this.adminUser = dToken["admin-user"];
  }
}

export class ProjectExchangeToken {
  userName: string;
  userId: string;
  userEmail: string;
  tenantId: string;
  tenantName: string;
  tenantCompany: string;
  allowedRoles: Array<string>;
  defaultRole: string;
  projectId: string;
  companyIds: string;
  projectRoleIds: string;
  exp: any;
  iat: any;

  constructor(dToken: DecodedToken) {
    this.userId = dToken["x-hasura-user-id"];
    this.userName = dToken["user-name"];
    this.userEmail = dToken["user-email"];
    this.tenantId = dToken["x-hasura-tenant-id"];
    this.tenantName = dToken["tenant-name"];
    this.tenantCompany = dToken["tenant-company"];
    this.allowedRoles = dToken["x-hasura-allowed-roles"];
    this.defaultRole = dToken["x-hasura-default-role"];
    this.exp = dToken.exp ? dToken.exp : "";
    this.iat = dToken.iat ? dToken.iat : "";
    this.projectId = dToken["x-hasura-project-id"];
    this.companyIds = dToken["x-hasura-allowed-company-ids"];
    this.projectRoleIds = dToken["x-hasura-project-role-id"];
  }
}

export class ProjectFormExchangeToken {
  userName: string;
  userId: string;
  userEmail: string;
  tenantId: string;
  tenantName: string;
  tenantCompany: string;
  allowedRoles: Array<string>;
  defaultRole: string;
  projectId: string;
  companyIds: string;
  projectRoleIds: string;
  createFormIds: string;
  updateFormIds: string;
  deleteFormIds: string;
  viewFormIds: string;
  exp: any;
  iat: any;

  constructor(dToken: DecodedToken) {
    this.userId = dToken["x-hasura-user-id"];
    this.userName = dToken["user-name"];
    this.userEmail = dToken["user-email"];
    this.tenantId = dToken["x-hasura-tenant-id"];
    this.tenantName = dToken["tenant-name"];
    this.tenantCompany = dToken["tenant-company"];
    this.allowedRoles = dToken["x-hasura-allowed-roles"];
    this.defaultRole = dToken["x-hasura-default-role"];
    this.exp = dToken.exp ? dToken.exp : "";
    this.iat = dToken.iat ? dToken.iat : "";
    this.projectId = dToken["x-hasura-project-id"];
    this.companyIds = dToken["x-hasura-allowed-company-ids"];
    this.projectRoleIds = dToken["x-hasura-project-role-id"];
    this.createFormIds = dToken["x-hasura-allowed-create-ids"];
    this.updateFormIds = dToken["x-hasura-allowed-update-ids"];
    this.deleteFormIds = dToken["x-hasura-allowed-delete-ids"];
    this.viewFormIds = dToken["x-hasura-allowed-view-ids"];
  }
}

export class Tenant {
  constructor(public id: number, public name: string) {}
}

export interface TenantExchangeToken {
  tenantId: number;
  features: Array<string>;
}
