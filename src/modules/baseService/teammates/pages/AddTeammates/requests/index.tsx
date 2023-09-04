import {
  GET_USER_BY_EMAIL_ID,
  GET_PROJECT_ROLES,
  GET_SYSTEM_ROLE,
  ASSOCIATE_USER_WITH_PROJECT,
  GET_USER_TENANT_COMPANIES,
} from "src/modules/baseService/teammates/queries";
import {
  myCompanyUserRole,
  tenantUserRole,
  tenantRoles,
  myCompanyRoles,
  tenantProjectRole,
  myProjectRole,
  tenantCompanyRole,
} from "src/utils/role";
import { client } from "src/services/graphql";
import { decodeExchangeToken } from "src/services/authservice";
import { GET_USER_PROJECTS } from "src/graphhql/queries/projects";
import { getApiWithExchange } from "src/services/api";

const eqMatcher = (value: any) => (arg: any) => arg === value;

export const getUserDetails = async (email: string) => {
  const { allowedRoles, tenantId } = decodeExchangeToken();
  const role =
    allowedRoles.find(eqMatcher(myCompanyUserRole.viewMyCompanyUsers)) ??
    tenantUserRole.viewTenantUsers;

  let hasTenantAssociation = false;
  let userDetails = { success: {} };
  if (email) {
    try {
      const response = await client.query({
        query: GET_USER_BY_EMAIL_ID,
        variables: {
          argEmail: email,
          tenantId: tenantId,
        },
        fetchPolicy: "network-only",
        context: {
          role,
        },
      });
      hasTenantAssociation = response.data.tenantAssociation.length > 0;
    } catch {
      console.error("Error occurred while getting user tenant association");
    }

    try {
      userDetails = await getApiWithExchange(`V1/user/details?email=${email}`);
    } catch {
      console.error("Error occurred while getting user details");
      throw new Error();
    }
  }
  return [hasTenantAssociation, userDetails.success];
};

const executeQuery = async (query: any, role: string) =>
  await client.query({
    query,
    variables: {
      limit: 1000,
      offset: 0,
      searchText: `%%`,
    },
    fetchPolicy: "network-only",
    context: {
      role,
    },
  });

export const getProjectRoles = async () => {
  const role = myProjectRole.viewMyProjects;
  try {
    const formsTemplateResponse = await executeQuery(GET_PROJECT_ROLES, role);
    const {
      data: { projectRole },
    } = formsTemplateResponse;

    return projectRole;
  } catch (err: any) {
    console.error("Error occurred while fetching project roles", err);
    throw new Error(err);
  }
};

export const getSystemRoles = async () => {
  const { allowedRoles } = decodeExchangeToken();
  const role =
    allowedRoles.find(eqMatcher(tenantUserRole.viewTenantUsers)) ??
    myCompanyUserRole.viewMyCompanyUsers;
  try {
    const formsTemplateResponse = await executeQuery(GET_SYSTEM_ROLE, role);
    const {
      data: { tenantRole },
    } = formsTemplateResponse;

    return tenantRole;
  } catch (err: any) {
    console.error("Error occurred while fetching system roles", err);
    throw new Error(err);
  }
};

export const getTenantCompanies = async () => {
  try {
    const { allowedRoles } = decodeExchangeToken();

    const role =
      allowedRoles.find(eqMatcher(myCompanyUserRole.viewMyCompanyUsers)) ??
      allowedRoles.find(eqMatcher(tenantCompanyRole.viewTenantCompanies)) ??
      tenantUserRole.viewTenantUsers;
    const projectsResponse = await executeQuery(
      GET_USER_TENANT_COMPANIES,
      role
    );
    const {
      data: { tenantCompanyAssociation },
    } = projectsResponse;

    return tenantCompanyAssociation;
  } catch (error: any) {
    console.error("Error occurred while fetching tenant companies", error);
    throw new Error(error);
  }
};

export const getUserProjects = async () => {
  try {
    const { allowedRoles, userId } = decodeExchangeToken();
    const role =
      allowedRoles.find(eqMatcher(tenantUserRole.createTenantAssociation)) ??
      myProjectRole.viewMyProjects;
    const projectsResponse = await client.query({
      query: GET_USER_PROJECTS,
      variables: {
        searchText: `%%`,
        offset: 0,
        limit: 1000,
        userId: userId,
      },
      fetchPolicy: "network-only",
      context: { role },
    });
    const {
      data: { projectList_query },
    } = projectsResponse;
    return projectList_query;
  } catch (error: any) {
    console.error("Error occurred while fetching user projects ", error);
    throw new Error(error);
  }
};

export const associateUserWithProjects = async (
  userProjectAssociation: any
) => {
  const { allowedRoles } = decodeExchangeToken();
  const role =
    allowedRoles.find(eqMatcher(tenantProjectRole.createProjectAssociation)) ??
    allowedRoles.find(eqMatcher(tenantUserRole.createTenantAssociation)) ??
    allowedRoles.find(eqMatcher(tenantUserRole.createUserRelationAssociation));
  try {
    await client.mutate({
      mutation: ASSOCIATE_USER_WITH_PROJECT,
      variables: {
        objects: userProjectAssociation,
      },
      context: { role },
    });
  } catch (error: any) {
    console.error(error);
    throw new Error(error);
  }
};
