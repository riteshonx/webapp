import React, { useState, useEffect, useContext } from 'react'
import { stateContext } from '../../root/context/authentication/authContext';
import { bimContext } from '../contextAPI/bimContext';
import { setActiveFilterList, setSavedViewList, setSystemViewList } from '../contextAPI/action';
import { filterType, attributeList, operatorsList } from '../constants/query'
import { BIM_FETCH_QUERY_RESULT, FETCH_SPATIAL_RESULT, UPDATE_BIM_QUERY, UPDATE_BIM_VIEW, FETCH_NON_PRIOR_ATTR_RESULT} from '../graphql/bimQuery';
import { generateGraphqlModelCond } from '../container/utils';
import { client } from '../../../services/graphql'
import { projectFeatureAllowedRoles } from '../../../utils/role';
import { setIsLoading } from '../../root/context/authentication/action';
import Notification,{ AlertTypes } from '../../shared/components/Toaster/Toaster';

interface queryType {
    attribute: string | null,
    attributeOperator: string | null,
    values: string | string[] | null,
    joinOperator: string | null,
    type: string,
    handleIds?: any[],
    hidden: false,
    minBoundingBox: any[],
    maxBoundingBox: any[],
}

export function useBimQueryUpdater(viewId: string | null, filterSet: [] | null, callback:  null | (() => void)  = null, isTimeLine = false) {
    const [roles, setRoles] = useState(false);
    const context: any = useContext(bimContext);
    const { dispatch, state }:any = useContext(stateContext);

    useEffect(() => {
        if(viewId) {
            updateFilterWithNewRes(filterSet || [])
        }
    }, [viewId] )

    async function updateFilterWithNewRes(filterSet: any) {
        dispatch(setIsLoading(true))
        const updatedFilters = await Promise.all(filterSet?.map(async (filter: filterType) => {
            dispatch(setIsLoading(true))
            const queryOptionList = await createOptionList(filter?.queryParams);
            const [whereCond, variable]: any[] = await generateGraphqlModelCond([...queryOptionList]);
            const isSpatial = queryOptionList.some((query:any)=> query.type === "spatial");
            const filterResult: any = await fetchData(BIM_FETCH_QUERY_RESULT(whereCond,  Object.keys(variable)), variable) 
            filter.handleIds = filterResult.bimElementProperties.reduce((result: any[], item: any) => {
                result.push(item.sourceId)
                return result
            }, [] as any);
            await updateQuery({
                "queryName": filter?.queryName,
                "queryType": filter?.queryType,
                "queryParams": filter?.queryParams,
                "filterId": filter.id,
                "queryResult": filter.handleIds
            })
            return filter;
        }))
        await updateMutation(UPDATE_BIM_VIEW, {
            "id": viewId,
            "fields": {
              "isImport": false
            }
        }, projectFeatureAllowedRoles.updateBimModel)
        updateViewList();
        callback? callback() : context.dispatch(setActiveFilterList(updatedFilters));
        setRoles(true);
        dispatch(setIsLoading(false))
    }

    function updateFilterResult(handleIds: any, filterId: string) {
        const filterIndex = context.state.activeFilterList.findIndex((filterItem: filterType) => filterItem.id === filterId)
        const newfilter = {
            ...context.state.activeFilterList[filterIndex],
            handleIds: handleIds,
        };
        context.dispatch(setActiveFilterList([...context.state.activeFilterList.slice(0, filterIndex), newfilter, ...context.state.activeFilterList.slice(filterIndex + 1)]));
    }

    async function createOptionList(queryParams: any) {
        const newOptionList = queryParams.reduce(async (result: any[], query: queryType) => {
            const handleIds = (query.type === "spatial") ? await fetchSpatialData(query) : 
                (query.type === "non_priorty") ?  await fetchNonPirorityResult(query) : query.handleIds;
            const attribute  = (query.type === "non_priorty") ? 
                {...attributeList[0], value: query.attribute, title: query.attribute }: 
                    attributeList.find(attrb => attrb.value ===  query.attribute);            
            if(attribute) {
                (await result).push({...query, 
                    handleIds: handleIds,
                    attribute: attribute,
                    attributeOperator: operatorsList[attribute.type].find(operator => operator.value === query.attributeOperator) || operatorsList[attribute.type][0]
                })
            }
            return result
        }, [] as any)
        return newOptionList;
    }

    function updateViewList() {
        const viewList =  context.state.isActiveViewSystemCustom || isTimeLine ? context.state.systemViewList : context.state.savedViewList;
        const currViewDetailsIndex = viewList.findIndex((view: any) => view.id === viewId)
        const updatedList = [...viewList.slice(0, currViewDetailsIndex), {
            ...viewList[currViewDetailsIndex],
            isImport: false
            }, ...viewList.slice(currViewDetailsIndex + 1)
        ];
        context.state.isActiveViewSystemCustom || isTimeLine ? context.dispatch(setSystemViewList(updatedList)) : context.dispatch(setSavedViewList(updatedList));
    }

    async function updateQuery(optionalList: any) {
        return updateMutation(UPDATE_BIM_QUERY, {
            ...optionalList,
            "viewId": viewId,
            "modelId": context.state.activeModel
        }, projectFeatureAllowedRoles.updateBimModel);
    }

    const fetchSpatialData = async (query: queryType) => {
        const modelIds = (context.state.isAssembly) ? context.state.assemblyModelList : [context.state.activeModel]
        const filterResult: any = await fetchData(FETCH_SPATIAL_RESULT, { max : query.maxBoundingBox, min : query.minBoundingBox, modelIds: modelIds });
        return filterResult ? filterResult.bimSpatialElement_query?.handleIds : [];
    }

    const fetchNonPirorityResult = async (queryOption: any) => {
        const modelIds = (context.state.isAssembly) ? context.state.assemblyModelList : [context.state.activeModel]
        const data: any = await fetchData(FETCH_NON_PRIOR_ATTR_RESULT, 
            {"key": queryOption.attribute, "value": queryOption.values, "operator": queryOption.attributeOperator ,"modelIds": modelIds})
        return data?.getElementsByNonPriorityBimAttribute_query?.data || []
    }

    const fetchData = async (query: any, variables: any) => {
        let responseData;
        const modelIds = (context.state.isAssembly) ? context.state.assemblyModelList : [context.state.activeModel]
        try {
            responseData = await client.query({
                query: query,
                variables: {
                    "_in": modelIds,
                    ...variables
                },
                fetchPolicy:'network-only',
                context:{role: projectFeatureAllowedRoles.viewBimModel, token: state.selectedProjectToken}
            });
            
        } catch(error: any) {
            console.log(error)
        } finally {
            return (responseData?.data) ? responseData.data : null;
        }
    }

    const updateMutation = async (query: any, variable: any, role: any) => {
        let responseData;
        try {
            responseData = await client.mutate({
                mutation: query,
                variables: variable,
                context: { role: role, token: state.selectedProjectToken}
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