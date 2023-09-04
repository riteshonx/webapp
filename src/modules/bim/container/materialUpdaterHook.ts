import React, { useState, useEffect, useContext } from 'react'
import { stateContext } from '../../root/context/authentication/authContext';
import { bimContext } from '../contextAPI/bimContext';
import { FETCH_ELEMENT_PROPS_BY_ID_LIST } from '../graphql/bimQuery';
import { FETCH_MATERIAL_MASTER, INSERT_MATERIAL_MASTER, VIEW_PROJECT_MATERIAL, UPDATE_PROJECT_MATERIAL } from '../graphql/bimMaterial';
import { client } from '../../../services/graphql'
import { projectFeatureAllowedRoles, ProjectSetupRoles } from '../../../utils/role';
import { setIsLoading } from '../../root/context/authentication/action';
import Notification,{ AlertTypes } from '../../shared/components/Toaster/Toaster';
import { MasterMaterialRoles } from "../../../utils/role";
import { match, useRouteMatch } from "react-router-dom";
import { addMaterialMaster } from "src/modules/baseService/projectSettings/components/ProjectMaterialMaster/MaterialMasterActions";
import { decodeExchangeToken, decodeProjectExchangeToken } from '../../../services/authservice';
import { postApi } from '../../../services/api';
import { features } from '../../../utils/constants';

export interface Params {
    id: string;
}

export function useMaterialUpdater(taskId: string | null, filterSet: [] | null, callback:  null | (() => void)  = null) {
    const [roles, setRoles] = useState(false);
    const context: any = useContext(bimContext);
    const { dispatch, state }:any = useContext(stateContext);
    const pathMatch: match<Params> = useRouteMatch();

    useEffect(() => {
        if(taskId && filterSet) {
            console.log(taskId)
            console.log(filterSet)
            updateMatralMaster()
        }
    }, [taskId] )

    async function updateMatralMaster() {
        try {
            let insertedMaterialsmaster: any;
            dispatch(setIsLoading(true));
            //Find Handle IDs
            const handleIds = filterSet?.reduce((result: any, taskFilter: any) => {
                context.state.activeFilterList.map((filter: any) => {
                    (filter.id === taskFilter.bimFilterId) && result.push(...filter.handleIds);
                });
                return result;
            }, []);
            console.log(handleIds)
            
            //Fetch assemblyMarkNumber and familyandType
            const filterMaterial = await fetchData(FETCH_ELEMENT_PROPS_BY_ID_LIST, { _sourceIdList: handleIds }, 
                {role: projectFeatureAllowedRoles.viewBimModel, token: state.selectedProjectToken});
            console.log(filterMaterial)
            
            //find unique assemblyMarkNumber or familyandType
            const uniqueFilterMaterial = filterMaterial?.bimElementProperties.reduce((result: any, obj: any) => {
                if(obj.assemblyMarkNumber || obj.familyandType) {
                    const externalMaterialId = (obj.assemblyMarkNumber || obj.familyandType).substring(0,20) 
                    if (!result[externalMaterialId]) {
                        result[externalMaterialId] = { ...obj, count: 1}
                    } else {
                        result[externalMaterialId]["count"] += 1;
                    }
                }
                return result;
            }, {})
            console.log(uniqueFilterMaterial);
            
             //Fetch masterMaterial list
            const masterMaterial = await fetchData(FETCH_MATERIAL_MASTER, {}, { role: MasterMaterialRoles.read });
            console.log(masterMaterial)
            
            //find missing material in masterMaterial list
            const missingMaterialIds = Object.keys(uniqueFilterMaterial).filter((e: any) => !masterMaterial?.materialMaster.find((a: any) => e === a.externalMaterialId));
            console.log("missingMaterialIds", missingMaterialIds)
            

            //create missing material object and insert to masterMaterial
            if(missingMaterialIds && missingMaterialIds.length) {
                const insrtMasterMaterialObj = missingMaterialIds.map((id: any) => {
                    return {
                        "category": "Manufactured",
                        "carbonCategoryId": null,
                        "externalMaterialId": id,
                        "materialName": "Precast",
                        "materialType": "IC",
                        "unit": "1",
                        "supplier": ""
                    }
                });
                console.log("insrtMasterMaterialObj", insrtMasterMaterialObj)
                insertedMaterialsmaster = await updateMutation(INSERT_MATERIAL_MASTER, 
                    {"materialMasters": insrtMasterMaterialObj}, {role: MasterMaterialRoles.create})
                console.log("insertedMaterialsmaster", insertedMaterialsmaster) 
            }

            //check Permission
            const permission = await fetchProjectExchangeToken();
            console.log(permission)
            if (permission && permission.allowedRoles && (permission.allowedRoles.includes(ProjectSetupRoles.createProjectMaterial)) 
                && (permission.allowedRoles.includes(ProjectSetupRoles.viewProjectMaterial))) {

                //Fetch current project Material list    
                const projectMaterialRes = await fetchData(VIEW_PROJECT_MATERIAL, 
                    { search: `%%`, projectId: Number(pathMatch.params.id)}, 
                    { role: ProjectSetupRoles.viewProjectMaterial,token: permission.projectToken}
                );
                console.log(projectMaterialRes.projectMaterial)

                //Find Master material ID and updated Count
                const combinedMatrilMster = insertedMaterialsmaster ? [...(masterMaterial?.materialMaster), ...insertedMaterialsmaster.insert_materialMaster?.returning] :
                    masterMaterial?.materialMaster;
                console.log("combinedMatrilMster", combinedMatrilMster)
                const uniqueFilterMaterialwithId = Object.keys(uniqueFilterMaterial).map((externalMaterialId: any) =>{
                    const matrilMster = combinedMatrilMster.find((a: any) => externalMaterialId === a.externalMaterialId)
                    if(matrilMster) {
                        uniqueFilterMaterial[externalMaterialId].masterId = matrilMster.id;
                    }

                    const Projectmatril = projectMaterialRes?.projectMaterial.find((a: any) => externalMaterialId === a.materialMaster.externalMaterialId);
                    if(Projectmatril) {
                        uniqueFilterMaterial[externalMaterialId].projectMaterialId = Projectmatril.id;
                        uniqueFilterMaterial[externalMaterialId].count += Projectmatril.quantityRequired;
                    }
                    return uniqueFilterMaterial;
                })
                console.log("uniqueFilterMaterialwithId", uniqueFilterMaterialwithId)

                //find missing material in project Material list
                const missingProjectMaterialIds = Object.keys(uniqueFilterMaterial).filter((e: any) => !projectMaterialRes?.projectMaterial.find((a: any) => e === a.materialMaster.externalMaterialId));
                console.log("missingProjectMaterialIds", missingProjectMaterialIds)

                //create missing project material object and insert to ProjectMaterial
                if(missingProjectMaterialIds && missingProjectMaterialIds.length) {
                    const insrtMasterMaterialObj = missingProjectMaterialIds.map((id: any) => {
                        return {
                            "materialId": uniqueFilterMaterial[id].masterId,
                            "notes": "",
                            "projectId": Number(pathMatch.params.id),
                            "quantityAllocated": 0,
                            "quantityAvailable": 0,
                            "quantityConsumed": 0,
                            "quantityRequired": uniqueFilterMaterial[id].count,
                            "supplier": ""
                        }
                    });
                    console.log("insrtMasterMaterialObj", insrtMasterMaterialObj)
                    insertedMaterialsmaster = await addMaterialMaster(insrtMasterMaterialObj, permission.projectToken);
                    console.log("insertedMaterialsProject", insertedMaterialsmaster) 
                }

                //update existing project material's count
                const promises: any = [];
                Object.keys(uniqueFilterMaterial).map((externalMaterialId: any) =>{
                    if(!missingProjectMaterialIds.includes(externalMaterialId)) {
                        promises.push(updateMutation(UPDATE_PROJECT_MATERIAL,
                            { 
                                id: uniqueFilterMaterial[externalMaterialId].projectMaterialId ,
                                projectId: Number(pathMatch.params.id), 
                                QtyReq: uniqueFilterMaterial[externalMaterialId].count
                            },
                            { role: ProjectSetupRoles.createProjectMaterial, token: permission.projectToken }
                        ))
                    }
                })
                await Promise.all(promises);
            }
            callback && callback();
            dispatch(setIsLoading(false));
        } catch (error: any) {
            console.log(error)
            callback && callback();
            dispatch(setIsLoading(false));
        } 
    }

    const fetchProjectExchangeToken= async ()=>{
        try {
            const ProjectToken: any = {
                tenantId: Number(decodeExchangeToken().tenantId),
                projectId: Number(pathMatch.params.id),
                features: [features.PROJECTSETUP]
            };
            const projectTokenResponse = await postApi('V1/user/login/exchange', ProjectToken);
            return {
                projectToken: projectTokenResponse.success,
                allowedRoles: getPermission(projectTokenResponse.success)
            }
        } catch (error) {
            console.log(error)
        }
    }

    const getPermission = (argProjectToken: string) => {
        const allwedRols = decodeProjectExchangeToken(argProjectToken).allowedRoles;
        return allwedRols;
    }


    const fetchData = async (query: any, variables: any, context: any) => {
        let responseData;
        try {
            responseData = await client.query({
                query: query,
                variables: variables,
                fetchPolicy:'network-only',
                context: context
            });
            
        } catch(error: any) {
            console.log(error)
        } finally {
            return (responseData?.data) ? responseData.data : null;
        }
    }

    const updateMutation = async (query: any, variable: any, context: any) => {
        let responseData;
        try {
            responseData = await client.mutate({
                mutation: query,
                variables: variable,
                context: context
            })
            return responseData.data;
        } catch (error: any) {
            console.log(error.message);
            Notification.sendNotification('Some error occured on importing filters', AlertTypes.error);
        } finally {
            return (responseData?.data) ? responseData.data : null;
        }
    }


    return roles;
}