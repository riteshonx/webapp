import { client } from "src/services/graphql";
import { featureFormRoles } from "src/utils/role";
import { getProjectExchangeToken } from "src/services/authservice";
import { FETCH_FORM_TEMPLATE } from "src/modules/baseService/formConsumption/graphql/queries/rfi";
import { LOAD_CONFIGURATION_LIST_VALUES_CREATE } from "src/modules/baseService/graphql/queries/customList";
import { FETCH_ALL_PARENT_FORMS, FETCH_FORM_DATA } from "../../graphql/queries";

export const fetchQualityControlTemplate = async (featureId: number) => {
  try {
    const formsTemplateResponse = await client.query({
      query: FETCH_FORM_TEMPLATE,
      variables: {
        featureId: featureId,
      },
      fetchPolicy: "network-only",
      context: {
        role: featureFormRoles.createForm,
        token: getProjectExchangeToken(),
      },
    });
    const { projectTemplateAssociation } = formsTemplateResponse.data;
    return projectTemplateAssociation[0]?.formTemplate?.formTemplateVersions;
  } catch (e) {
    console.error("Something went wrong while fetching from template", e);
    throw e;
  }
};

export const fetchCustomListValues = async (
  argIds: Array<number>,
  projectId: number
) => {
  try {
    const customListResponse = await client.query({
      query: LOAD_CONFIGURATION_LIST_VALUES_CREATE,
      variables: {
        id: argIds,
        projectId,
      },
      fetchPolicy: "network-only",
      context: {
        role: featureFormRoles.createForm,
        token: getProjectExchangeToken(),
      },
    });
    const {
      data: { configurationLists },
    } = customListResponse;
    const targetList = configurationLists.reduce((prev: any, current: any) => {
      prev[`${current.id}`] = current;
      return prev;
    }, {});
    return targetList;
  } catch (error: any) {
    console.error("Error occurred while fetching custom list", error);
    throw error;
  }
};

export const fetchAllParentForms = async (featureId: number) => {
  try {
    const parentFormsResponse = await client.query({
      query: FETCH_ALL_PARENT_FORMS,
      variables: {
        featureId,
      },
      fetchPolicy: "network-only",
      context: {
        role: featureFormRoles.viewForm,
        token: getProjectExchangeToken(),
      },
    });
    return parentFormsResponse.data?.forms;
  } catch (error: any) {
    console.error("Error occurred while fetching parent forms", error);
    throw error;
  }
};

export const fetchFormData = async (formId: number) => {
  try {
    const formDataResponse = await client.query({
      query: FETCH_FORM_DATA,
      variables: {
        formId,
      },
      fetchPolicy: "network-only",
      context: {
        role: featureFormRoles.viewForm,
        token: getProjectExchangeToken(),
      },
    });
    return formDataResponse.data.punchlistDetails_query?.formData;
  } catch (error: any) {
    console.error("Error occurred while fetching form data", error);
    throw error;
  }
};
