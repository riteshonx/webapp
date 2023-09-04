import { ApolloQueryResult, FetchResult, ObservableQuery } from "@apollo/client";
import { client } from "src/services/graphql";
import { ADD_PROJECT_MATERIAL, DELETE_PROJECT_MATERIAL, FETCH_ALL_MATERIAL_MASTER, UPDATE_PROJECT_MATERIAL, VIEW_PROJECT_MATERIAL } from "../../graphql/models/projectMaterialMaster";
import axios, { AxiosResponse } from "axios";
import { FETCH_SUPPLIERS } from "src/modules/dynamicScheduling/libraries/grqphql/queries/material";
import { axiosApiInstance } from "src/services/api";


export interface ResponseMaterialMaster {
    materialMaster: Array<MaterialMaster>
    materialMaster_aggregate: any
}

export const ProjectMaterialMasterRoles = {
    createProjectMaterial: "createProjectMaterial",
    viewProjectMaterial: "viewProjectMaterial"
}
export interface MaterialMaster {
    category: string;
    customColumns: string;
    id: number
    materialGroup: string,
    externalMaterialId: string;
    materialName: string;
    materialType: string;
    supplier: string;
    unit: string;
    carbonCategory: Carbon
}

export interface ProjectMaterialMasterInsertType {
    materialId: number,
    projectId: number,
    quantityAvailable: number,
    quantityAllocated: number,
    quantityConsumed: number,
    quantityRequired: number,
    notes: string
}

export interface Carbon {
    baselineValue: number;
    baselineValueImperial: number;
    id: string;
    name: string;
    description: string;
    averageValue: Array<{
        region: string,
        average_imperial: number,
        average_si: number
    }>;
    unit: string,
    unitImperial: string
}
export interface MaterialMasterResponse {
    materialName: string,
    unit: string,
    externalMaterialId: string,
    category: string,
    carbonCategory: Carbon
}
export interface ProjectMaterialMaster {
    materialMaster: MaterialMasterResponse,
    id: number,
    notes: string,
    quantityRequired: number,
    quantityAvailable: number,
    quantityAllocated: number,
    quantityConsumed: number,
    supplier: string;
    projectTaskMaterialAssociations: Array<ProjectTaskMaterialAssociation>
}

export interface ProjectTaskMaterialAssociation {
    taskId: string
}

export interface ResponseProjectMaterialMaster {
    projectMaterial: Array<ProjectMaterialMaster>
}

export interface MaterialQuantity {
    materialId: string,
    quantityRequired: number,
    quantityAvailable: number,
    quantityAllocated: number,
    quantityConsumed: number

}
export interface ResponseProjectMaterialQuantities {
    success: boolean,
    materials: Array<MaterialQuantity>
}

export const fetchMaterialMaster = async (name: string, token: string, pageNo: number) => {
    const res: ApolloQueryResult<ResponseMaterialMaster> = await client.query({
        query: FETCH_ALL_MATERIAL_MASTER,
        context: {
            role: ProjectMaterialMasterRoles.viewProjectMaterial,
            token: token
        },
        fetchPolicy: 'network-only',
        variables: {
            name: `%${name}%`,
            offset: pageNo * 15
        }
    })
    return res.data;
}

export const addMaterialMaster = async (InsertData: Array<ProjectMaterialMasterInsertType>, token: string) => {
    const res = await client.mutate({
        mutation: ADD_PROJECT_MATERIAL,
        context: {
            role: ProjectMaterialMasterRoles.createProjectMaterial,
            token: token
        },
        variables: {
            data: InsertData
        },
    })
    return res.data;
}

export const fetchProjectMaterialMaster = async (token: string, projectId: number, search?: string) => {
    const res: ApolloQueryResult<ResponseProjectMaterialMaster> = await client.query({
        query: VIEW_PROJECT_MATERIAL,
        context: {
            role: ProjectMaterialMasterRoles.viewProjectMaterial,
            token: token
        },
        variables: {
            search: `%${search}%`,
            projectId
        }
    })
    return res.data.projectMaterial;
}

export const refetchProjectMaterialMaster = async (token: string, projectId: number, search?: string) => {
    const Query: ObservableQuery<ResponseProjectMaterialMaster, { search: string, projectId: number }> = client.watchQuery({
        query: VIEW_PROJECT_MATERIAL,
        context: {
            role: ProjectMaterialMasterRoles.viewProjectMaterial,
            token: token
        },
        variables: {
            search: `%${search}%`,
            projectId
        }
    })
    return (await Query.refetch()).data.projectMaterial;
}

export const fetchProjectMaterialQuantities = async (token: string) => {
    const res: AxiosResponse<ResponseProjectMaterialQuantities> = await axios.get(`${process.env.REACT_APP_SCHEDULER_URL}V1/materialQuantity/project`, {
        headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`
        }
    })

    return res.data.materials;
}

export const updateProjectMaterial = async (token: string, projectId: number, id: number, QtyAvl: any, QtyReq: any, supplier: string, notes: string) => {
    const res = await client.mutate({
        mutation: UPDATE_PROJECT_MATERIAL,
        context: {
            role: ProjectMaterialMasterRoles.createProjectMaterial,
            token: token
        },
        variables: {
            id,
            QtyAvl,
            QtyReq,
            projectId,
            supplier,
            notes
        }
    })
    return res.data;
}

export const getAllSupplier = async (token: string, search: string) => {
    const response: ApolloQueryResult<any> = await client.query({
        query: FETCH_SUPPLIERS,
        variables: {
            search: `%${search}%`
        },
        fetchPolicy: 'network-only', context: { role: ProjectMaterialMasterRoles.createProjectMaterial, token }
    });

    return response;
}

export const deleteProjectMaterialMaster = async (token: string, projectId: number, ids: Array<number>) => {
    const promiseAll = ids.map(id => {
        const response = client.mutate({
            mutation: DELETE_PROJECT_MATERIAL,
            variables: {
                projectId: projectId,
                id: id
            },
            context: { role: ProjectMaterialMasterRoles.createProjectMaterial, token }
        });
        return response
    })
    const response = await Promise.all(promiseAll)
    return response;
}

export const refreshWidget = async () => {
    await axiosApiInstance.get(`${process.env.REACT_APP_DASHBOARD_URL}dashboard/v1/refreshWidget`, {
        headers: {
            token: "exchange"
        },
        params: {
            widget: `EMBODIED_CARBON`
        }
    })
}