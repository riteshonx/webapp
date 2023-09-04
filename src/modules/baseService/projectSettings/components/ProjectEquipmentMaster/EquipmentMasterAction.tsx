import { ApolloQueryResult, ObservableQuery } from '@apollo/client';
import { client } from 'src/services/graphql';
import {
  ADD_EQUIPMENT_MASTERS_QUERY,
  DELETE_EQUIPMENT_MASTERS_QUERY,
  FETCH_ALL_EQUIPMENTS_QUERY,
  UPDATE_EQUIPMENT_MASTERS_QUERY,
  VIEW_PROJECT_EQUIPMENT_MASTER,
} from '../../graphql/models/projectEquipmentMaster';

export interface ResponseEquipmentMaster {
  equipmentMaster: Array<EquipmentMaster>;
  equipmentMaster_aggregate: any;
}

export const ProjectEquipmentMasterRoles = {
  createProjectMaterial: 'createProjectMaterial',
  viewProjectMaterial: 'viewProjectMaterial',
};
export interface ProjectTaskMaterialAssociation {
  taskId: string;
}
export interface ProjectEquipmentMaster {
  equipmentMaster: any;
  projectTaskMaterialAssociations: Array<ProjectTaskMaterialAssociation>;
}
export interface ResponseProjectEquipmentMaster {
  projectEquipment: any;
}
export interface EquipmentMaster {
  baselineHours: string;
  capacity: string;
  description: string;
  documentation: string;
  equipmentCategory: string;
  equipmentId: string;
  equipmentType: string;
  id: string;
  metadata: string;
  model: string;
  oemName: string;
  status: string;
  supplier: string;
  tenantId: string;
}

export interface ProjectEquipmentMasterInsertType {
  startDate: any;
  equipmentId: any;
  updatedBy: any;
  endDate: any;
}

//to get list of equipment from backed
export const getEquipmentMaster = async (
  name: string,
  token: string,
  pageNo: number
) => {
  const res: ApolloQueryResult<ResponseEquipmentMaster> = await client.query({
    query: FETCH_ALL_EQUIPMENTS_QUERY,
    context: {
      role: ProjectEquipmentMasterRoles.viewProjectMaterial,
      token: token,
    },
    fetchPolicy: 'network-only',
    variables: {
      name: `%${name}%`,
      offset: pageNo * 15,
    },
  });
  return res.data;
};

// ADD EQUIPMENT MASTER API CALL STARTS HERE//

export const addEquipmentMaster = async (InsertData: any, token: string) => {
  const res = await client.mutate({
    mutation: ADD_EQUIPMENT_MASTERS_QUERY,
    context: {
      role: ProjectEquipmentMasterRoles.createProjectMaterial,
      token: token,
    },
    variables: {
      data: InsertData,
    },
  });
  return res.data;
};

//ADD EQUIPMENT MASTER  ENDS HERE//

export const refetchProjectEquipmentMaster = async (
  token: any,
  projectId: any,
  search?: any
) => {
  const Query: ObservableQuery<any, { search: any; projectId: any }> =
    client.watchQuery({
      query: VIEW_PROJECT_EQUIPMENT_MASTER,
      context: {
        role: ProjectEquipmentMasterRoles.createProjectMaterial,
        token: token,
      },
      variables: {
        search: `%${search}%`,
        projectId,
      },
    });
  return (await Query.refetch()).data.projectEquipmentMaster;
};

export const updateProjectEquipmentMaster = async (
  token: string,
  projectId: number,
  equipmentId: any,
  startDate: any,
  endDate: any
) => {
  const res = await client.mutate({
    mutation: UPDATE_EQUIPMENT_MASTERS_QUERY,
    context: {
      role: ProjectEquipmentMasterRoles.createProjectMaterial,
      token: token,
    },
    variables: {
      equipmentId,
      startDate,
      endDate,
    },
  });
  return res.data;
};

export const deleteProjectEquipmentMaster = async (
  token: string,
  ids: Array<number>
) => {
  const promiseAll = ids.map((id) => {
    const response = client.mutate({
      mutation: DELETE_EQUIPMENT_MASTERS_QUERY,
      variables: {
        equipmentId: id,
      },
      context: {
        role: ProjectEquipmentMasterRoles.createProjectMaterial,
        token,
      },
    });
    return response;
  });
  const response = await Promise.all(promiseAll);
  return response;
};
