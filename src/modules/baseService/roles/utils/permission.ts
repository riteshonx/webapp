import {decodeExchangeToken} from '../../../../services/authservice';
import {myCompanyRoles, myProjectRole, tenantCompanyRole, tenantProjectRole, tenantRoles,tenantUserRole} from '../../../../utils/role';
const allowedRoles= decodeExchangeToken().allowedRoles;

export const canCreateProjectRole = allowedRoles.includes(tenantRoles.createProjectRole);

export const canCreateSystemtRole = allowedRoles.includes(tenantRoles.createTenantRole);

export const canViewProjectRole = allowedRoles.includes(tenantRoles.viewProjectRoles);

export const canViewSystemRole = allowedRoles.includes(tenantRoles.viewTenantRoles);

export const canUpdateProjectRole = allowedRoles.includes(tenantRoles.updateProjectRole);

export const canUpdateSystemRole = allowedRoles.includes(tenantRoles.updateTenantRole);

export const canDeleteProjectRole= allowedRoles.includes(tenantRoles.updateProjectRoleStatus);

export const canDeleteSystemRole= allowedRoles.includes(tenantRoles.updateTenantRoleStatus);


// ************************** project permisison ********************************
export const canViewProjects = allowedRoles.includes(tenantProjectRole.viewTenantProjects) || allowedRoles.includes(myProjectRole.viewMyProjects);

export const canCreateProject = allowedRoles.includes(tenantProjectRole.createTenantProject);

export const canUpdateProject = allowedRoles.includes(tenantProjectRole.updateTenantProject);

// ************************** project permisison ********************************



// company permission

export const viewTenantCompanies = allowedRoles.includes(tenantCompanyRole.viewTenantCompanies)||
                                   allowedRoles.includes(myCompanyRoles.viewMyCompanies);
export const createTenantCompany = allowedRoles.includes(tenantCompanyRole.createTenantCompany);
export const updateTenantCompany = allowedRoles.includes(tenantCompanyRole.updateTenantCompany) || 
                                   allowedRoles.includes(myCompanyRoles.updateMyCompany);
export const updateTenantCompanyStatus = allowedRoles.includes(tenantCompanyRole.updateTenantCompanyStatus);
export const createTenantAssociation = allowedRoles.includes(tenantUserRole.createTenantAssociation);
