import { decodeExchangeToken } from "./authservice";
import {
  tenantUserRole,
  myCompanyUserRole,
  tenantCompanyRole,
  myCompanyRoles,
  tenantProjectRole,
  tenantRoles,
  myProjectRole,
  ProjectSetupRoles,
} from "../utils/role";

export function getRole(myRole: string, tenantRole: string): string {
  if (decodeExchangeToken()?.allowedRoles.includes(myRole)) {
    return myRole;
  } else {
    return tenantRole;
  }
}

export function canViewActiveteOrDeactivateUser(): boolean{
  return decodeExchangeToken()?.allowedRoles.includes('updateTenantAssociationStatus') ||
  decodeExchangeToken()?.allowedRoles.includes('updateMyCompanyAssociationStatus')
}

export function canUpdateUsers(): boolean {
  return (
    decodeExchangeToken().allowedRoles.includes(
      tenantUserRole.updateTenantUser
    ) ||
    decodeExchangeToken().allowedRoles.includes(
      myCompanyUserRole.updateMyCompanyUser
    )
  );
}

export function canUpdateTenantAssociationStatus(): boolean {
  // able to deactivate/reactivate a user
  return decodeExchangeToken().allowedRoles.includes(
    tenantUserRole.updateTenantAssociationStatus
  );
}

export function canCreateCompany(): boolean {
  // Ability to create a new company inside a tenant
  return decodeExchangeToken().allowedRoles.includes(
    tenantCompanyRole.createTenantCompany
  );
}

export function canInviteCompanyUsers(): boolean {
  const { allowedRoles } = decodeExchangeToken();
  return (
    (allowedRoles.includes(tenantCompanyRole.createCompanyAssociation) &&
      (allowedRoles.includes(tenantUserRole.createUserRelationAssociation) ||
        allowedRoles.includes(tenantUserRole.createTenantAssociation))) ||
    (allowedRoles.includes(myCompanyRoles.createMyCompanyAssociation) &&
      allowedRoles.includes(tenantUserRole.createTenantAssociation))
  );
}

export function canInviteUsers(): boolean {
  // able to invite users
  const { allowedRoles } = decodeExchangeToken();
  return (
    allowedRoles.includes(tenantUserRole.createUserRelationAssociation) ||
    allowedRoles.includes(tenantUserRole.createTenantAssociation)
  );
}

export function canInviteProjectUsers(): boolean {
  // able to invite users
  const { allowedRoles } = decodeExchangeToken();
  return (
    ((allowedRoles.includes(tenantUserRole.createTenantAssociation) ||
      allowedRoles.includes(tenantUserRole.createUserRelationAssociation)) &&
      allowedRoles.includes(tenantProjectRole.createProjectAssociation)) ||
    (allowedRoles.includes(ProjectSetupRoles.createMyProjectAssociation) &&
      (allowedRoles.includes(tenantUserRole.createTenantAssociation) ||
        allowedRoles.includes(tenantUserRole.createUserRelationAssociation)))
  );
}

export function canUpdateTenantProject(): boolean {
  // Ability to edit/update the project details
  return decodeExchangeToken().allowedRoles.includes(
    tenantProjectRole.updateTenantProject
  );
}

export function canCreateTenantProject(): boolean {
  // Ability to create a new project in the tenant
  return decodeExchangeToken().allowedRoles.includes(
    tenantProjectRole.createTenantProject
  );
}

export function canUpdateProjectStatus(): boolean {
  // Ability to delete/Archive/Active a project
  return decodeExchangeToken().allowedRoles.includes(
    tenantProjectRole.updateTenantProjectStatus
  );
}

export function canAddProjectAssosiation(): boolean {
  // Ability to invite users to projects in my tenant
  return decodeExchangeToken().allowedRoles.includes(
    tenantProjectRole.createProjectAssociation
  );
}

export function canUpdateProjectAssociationStatus(): boolean {
  // Ability to edit users to projects in my tenant
  return (
    decodeExchangeToken().allowedRoles.includes(
      tenantProjectRole.createProjectAssociation
    ) &&
    decodeExchangeToken().allowedRoles.includes(
      tenantProjectRole.updateProjectAssociationStatus
    )
  );
}

export function canDisassociateProject(): boolean {
  return decodeExchangeToken().allowedRoles.includes(
    tenantProjectRole.updateProjectAssociationStatus
  );
}

export function canDisassociateCompany(): boolean {
  return (
    decodeExchangeToken().allowedRoles.includes(
      tenantCompanyRole.updateCompanyAssociationStatus
    ) ||
    decodeExchangeToken().allowedRoles.includes(
      myCompanyRoles.updateMyCompanyAssociationStatus
    )
  );
}

export function canViewProjectsRole(): boolean {
  return (
    decodeExchangeToken().allowedRoles.includes(tenantRoles.viewProjectRoles) ||
    decodeExchangeToken().allowedRoles.includes(
      tenantProjectRole.createProjectAssociation
    ) ||
    decodeExchangeToken().allowedRoles.includes(myProjectRole.viewMyProjects)
  );
}

export function canUpdateProjects(): boolean {
  return (
    (decodeExchangeToken().allowedRoles.includes(
      tenantProjectRole.updateProjectAssociationStatus
    ) ||
      decodeExchangeToken().allowedRoles.includes(
        myProjectRole.updateMyProjectAssociationStatus
      )) &&
    (decodeExchangeToken().allowedRoles.includes(
      tenantProjectRole.updateProjectAssociationRole
    ) ||
      decodeExchangeToken().allowedRoles.includes(
        myProjectRole.updateMyProjectAssociationRole
      ))
  );
}
