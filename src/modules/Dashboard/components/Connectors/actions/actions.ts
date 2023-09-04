import { ApolloQueryResult, ObservableQuery } from "@apollo/client";
import { axiosApiInstance, multiPartPost } from "src/services/api";
import { getExchangeToken, logout } from "src/services/authservice";
import { client } from "src/services/graphql";
import { myProjectRole } from "src/utils/role";
import {
  GET_FORMS_FEATURE_LIST,
  GET_PROJECT_LIST,
  GET_SLATE_PROJECTS,
} from "../graphql/query";
import {
  AGAVE_ACCOUNT_TOKEN,
  AGAVE_AUTH,
  CONNECTOR_ROLE,
  FILE_UPLOAD_INFO,
  formRoles,
  RFI_CSV_IMPORT,
  CONNECT_PROJECT,
  SERVICE_ORCHESTRATION,
} from "../utils/constant";
import {
  AgaveLinkType,
  FileObjType,
  FormsFeatureListType,
  Project,
  ProjectDataInterface,
  ProjectDataResponse,
  S3FileInformationResponse,
  SourceSystemType,
} from "../utils/types";
import Notification, {
  AlertTypes,
} from "src/modules/shared/components/Toaster/Toaster";
import { setSourceSystem } from "src/modules/root/context/authentication/action";
import { getTransformAccountId } from "../utils/helper";
import axios from "axios";

async function connectorAxios(url: string, payload?: any, token = "exchange") {
  try {
    const res = await axiosApiInstance.post(url, payload, {
      headers: {
        token,
      },
    });
    const data = await res?.data;
    return data;
  } catch (e: any) {
    throw e;
  }
}
export async function fetchConnectorToken(): Promise<any> {
  try {
    const res = await axiosApiInstance.get(
      `${process.env.REACT_APP_CONNECTOR_URL}/token`,
      {
        headers: {
          token: "exchange",
        },
      }
    );
    localStorage.setItem("connectorToken", res.data?.token);
  } catch (error: any) {
    throw new Error(error);
  }
}

export const getConnectorsToken = (): string | null =>
  localStorage.getItem("connectorToken");

export const getSyncedProjectFromConnectors = async (sourceSystem: {
  accountId: string;
  name: SourceSystemType;
}): Promise<ProjectDataInterface[]> => {
  try {
    const Query: ObservableQuery<
      {
        connectorsProject: Array<ProjectDataInterface>;
      },
      {
        _has_key: SourceSystemType;
        _contains: { accountId: string | null };
      }
    > = client.watchQuery({
      query: GET_PROJECT_LIST,
      variables: {
        _has_key: sourceSystem.name,
        _contains: {
          accountId: getTransformAccountId(sourceSystem),
        },
      },
      context: {
        token: getConnectorsToken(),
        role: CONNECTOR_ROLE.ADMIN,
      },
    });
    const res = await Query.refetch();
    return res.data?.connectorsProject;
  } catch (err: any) {
    throw new Error(err);
  }
};

export const getSlateProjects = async (
  sourceSystem: AgaveLinkType | null | undefined
) => {
  try {
    const sourceProject: ProjectDataInterface[] = [];
    const includeIdsProjectMap = new Map<number, ProjectDataInterface>();
    const ConnectorsQuery: ObservableQuery<{
      connectorsProject: Array<ProjectDataInterface>;
    }> = client.watchQuery({
      query: GET_PROJECT_LIST,
      context: {
        token: getConnectorsToken(),
        role: CONNECTOR_ROLE.ADMIN,
      },
    });
    const connectorsProject = (await ConnectorsQuery.refetch()).data
      .connectorsProject;
    for (const project of connectorsProject) {
      if (sourceSystem) {
        if (
          sourceSystem.name in project.metadata &&
          project.metadata?.accountId === getTransformAccountId(sourceSystem)
        ) {
          sourceProject.push(project);
        }
      }
      includeIdsProjectMap.set(project.projectId, project);
    }
    const Query: ObservableQuery<ProjectDataResponse> = client.watchQuery({
      query: GET_SLATE_PROJECTS,
      context: {
        token: getExchangeToken(),
        role: myProjectRole.viewMyProjects,
      },
    });
    const res = await Query.refetch();
    const projects = [...res.data?.project];
    projects.forEach((project, idx, refProjects) => {
      if (includeIdsProjectMap.has(project.id)) {
        refProjects[idx] = includeIdsProjectMap.get(
          project.id
        ) as unknown as Project;
      }
    });
    return {
      targetProject: projects,
      sourceProject,
    };
  } catch (err: any) {
    throw new Error(err);
  }
};

export const importForms = async (
  featureName: string,
  targetProject: string,
  data?: unknown
): Promise<any> => {
  try {
    const tokenStr = getExchangeToken();
    const res = await axios.post(SERVICE_ORCHESTRATION, data, {
      headers: {
        Authorization: `Bearer ${tokenStr}`,
        "Content-Type": "application/json",
      },
    });
    const resData = res?.data;
    if (resData?.STATUS === "START")
      Notification.sendNotification(resData.MESSAGE, AlertTypes.success);
    else if (resData?.STATUS === "IN-PROGRESS")
      Notification.sendNotification(
        `${featureName} sync for project "${targetProject}" is already in progress, please try after some time.`,
        AlertTypes.error
      );
    else if (resData?.STATUS === "INFO")
      Notification.sendNotification(resData.MESSAGE, AlertTypes.success);
  } catch (err: any) {
    const errorData = JSON.parse(err?.response?.data?.error);
    if (errorData?.DESCRIPTION)
      Notification.sendNotification(errorData?.DESCRIPTION, AlertTypes.error);
    else Notification.sendNotification("Import failed", AlertTypes.error);

    if (errorData?.DESCRIPTION?.includes("Token missing")) {
      setTimeout(() => {
        logout();
      }, 3000);
    }
  }
};

export const getFormsFeatureList = async (): Promise<
  FormsFeatureListType["projectFeature"]
> => {
  try {
    const response: ApolloQueryResult<FormsFeatureListType> =
      await client.query({
        query: GET_FORMS_FEATURE_LIST,
        context: {
          token: getExchangeToken(),
          role: formRoles.viewFormTemplate,
        },
      });
    return response.data?.projectFeature;
  } catch (error: any) {
    throw new Error("Fetching feature failed");
  }
};

// export const handleEnableSync = async (projectId: number): Promise<any> => {
//   try {
//     const features = await getFormsFeatureList();
//     let checklistFeature = null;
//     if (Array.isArray(features))
//       checklistFeature = features.find((feature) =>
//         feature.caption.includes('BIM360 Checklist')
//       );
//     if (!checklistFeature)
//       throw new Error('Checklist feature is not configured for this tenant');
//     const { userEmail: email } = decodeToken();
//     await importForms(projectId, 'enableSync', {
//       email,
//       feature: checklistFeature,
//     });
//     await client.mutate({
//       mutation: INSERT_CONNECTOR_SYNC,
//       variables: {
//         objects: [
//           {
//             email,
//             projectId,
//             featureId: checklistFeature?.id,
//           },
//         ],
//       },
//       context: {
//         token: getConnectorsToken(),
//         role: CONNECTOR_ROLE.ADMIN,
//       },
//     });
//     Notification.sendNotification(
//       'Sync is enabled for this project',
//       AlertTypes.success
//     );
//   } catch (e: any) {
//     Notification.sendNotification('Enable sync failed', AlertTypes.error);
//   }
// };

export const fetchDataFromURL = async (
  url: string,
  payload: any
): Promise<any> => {
  try {
    const resp = await connectorAxios(url, payload);
    Notification.sendNotification(resp.data, AlertTypes.success);
  } catch (err: any) {
    Notification.sendNotification("Import failed", AlertTypes.error);
  }
};

export const uploadFile = async (
  file: File | null,
  projectId: number
): Promise<FileObjType | undefined> => {
  try {
    if (projectId === -1) throw new Error("No project selected");
    if (!file) throw new Error("Select a csv file");
    const data: S3FileInformationResponse = await connectorAxios(
      FILE_UPLOAD_INFO,
      [
        {
          fileName: file.name,
          projectId,
          featureId: 2,
        },
      ]
    );
    if (!data.success?.[0]) throw new Error("Couldn't get the file info");
    const { fields, url } = data.success[0];
    await multiPartPost(url, fields, file, {});
    Notification.sendNotification("Upload successfull", AlertTypes.success);
    return { file, fileKey: fields.key };
  } catch (e: any) {
    Notification.sendNotification(e.message, AlertTypes.error);
  }
};

export const handleFileImport = async (
  featureId: number,
  key: string
): Promise<FileObjType | undefined> => {
  try {
    await connectorAxios(RFI_CSV_IMPORT, { featureId, key }, "project");
    Notification.sendNotification(
      "RFIs imported successfully",
      AlertTypes.success
    );
    return {};
  } catch (e: any) {
    Notification.sendNotification("Import failed", AlertTypes.error);
  }
};

export async function getLinkToken(): Promise<string | undefined> {
  try {
    const data = await connectorAxios(AGAVE_AUTH);
    return data.token;
  } catch (e: any) {
    Notification.sendNotification(
      "Could not connect now, please try after some time",
      AlertTypes.error
    );
  }
}

export async function processAccountToken(
  public_token: string,
  dispatch: (...rest: any[]) => any
): Promise<any> {
  try {
    const sourceSystem = await connectorAxios(AGAVE_ACCOUNT_TOKEN, {
      public_token,
    });
    dispatch(setSourceSystem(sourceSystem));
    localStorage.setItem("agaveInfo", JSON.stringify(sourceSystem));
    Notification.sendNotification("3rd party connected", AlertTypes.success);
  } catch (e: any) {
    Notification.sendNotification(
      "3rd party connection failed",
      AlertTypes.error
    );
  }
}

export const connectProjects = async (
  projectId: number,
  payload: any
): Promise<void> => {
  try {
    const res = await connectorAxios(
      `${CONNECT_PROJECT}/${projectId}`,
      payload
    );
    Notification.sendNotification(res.data, AlertTypes.success);
  } catch (err: any) {
    Notification.sendNotification("Project plugin failed", AlertTypes.error);
  }
};
