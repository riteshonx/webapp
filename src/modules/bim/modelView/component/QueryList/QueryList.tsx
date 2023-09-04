import React, {useState, useEffect, useContext, useRef} from 'react';
import './QueryList.scss'
import { Button } from '@material-ui/core';
import QueryForm from '../QueryForm/QueryForm';
import QueryTable from '../QueryTable/QueryTable';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import ConfirmDialog from '../../../../shared/components/ConfirmDialog/ConfirmDialog';
import { bimContext } from '../../../contextAPI/bimContext';
import {attributeList, operatorsList} from '../../../constants/query'
import { BIM_FETCH_QUERY_RESULT, FETCH_SPATIAL_RESULT, INSERT_BIM_FILTER, INSERT_BIM_FILTER_USING_QUERY_ID, UPDATE_BIM_QUERY } from '../../../graphql/bimQuery';
import { generateGraphqlModelCond } from '../../../container/utils';
import { client } from '../../../../../services/graphql'
import { projectFeatureAllowedRoles } from '../../../../../utils/role';
import { stateContext } from '../../../../root/context/authentication/authContext';
import { setActiveFilterList, setActiveFilterTaskFilters, setSkipUpdateFilter } from '../../../contextAPI/action';
import { filterType } from '../../../constants/query'
import Notification,{ AlertTypes } from '../../../../shared/components/Toaster/Toaster';
import { setIsLoading } from '../../../../root/context/authentication/action';
import SpatialQuery from '../SpatialQuery/SpatialQuery';
import { Close } from "@material-ui/icons";
import TextField from '@material-ui/core/TextField';
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import Tooltip from '@material-ui/core/Tooltip';
import { fetchElementName } from '../../../container/utils';

interface queryType {
    attribute: string | null,
    attributeOperator: string | null,
    values: string | string[] | null,
    joinOperator: string | null,
    type: string,
    handleIds?: any[],
    hidden: false
}

interface message {
    header: string,
    text: string,
    cancel: string,
    proceed: string,
}

const confirmDeleteMessage: message = {
    header: "Are You Sure?​",
    text: `This action will delete existing Clause from query`,
    cancel: "Cancel",
    proceed: "Yes"
}
let filter: any;
let filterIndex: any;
let elementNames: any = {};

export default function QueryBuilder(props: any) {
    const [updateQueryIndex, setUpdateQueryIndex] = useState(-1);
    const [queryOptionList, setQueryOptionList] = useState<any []>([]);
    const [queryList, setQueryList] = useState<queryType []>([]);
    const [openDeleteModel, setOpenDeleteModel] = useState(false);
    const [showVisbilityIcon, setShowVisbilityIcon] = useState(false);
    const [openExstngQry, setOpenExstngQry] = useState(false);
    const [showSpatialOption,setShowSpatialOption] = useState(false);
    const [deleteQueryIndex, setDeleteQueryIndex] = useState(-1);
    const [queryType,setQueryType] = useState("");
    const [queryName,setQueryName] = useState("");
    const context: any = useContext(bimContext);
    const { dispatch, state }:any = useContext(stateContext);
    const [isEditQueryName, setIsEditQueryName] = useState(false);
    const [queryNameError,setQueryNameError] = useState("");
    const mountedRef = useRef(false);

    useEffect(()=>{
        mountedRef.current = true;
        fetchElementNames();
        return () => {
            mountedRef.current = false;
            elementNames = {}
        }
    },[]);

    useEffect(()=> {
        if (context.state.activeFilter) {
            filterIndex = context.state.activeFilterList.findIndex((filter: any) => filter.id === context.state.activeFilter);
            filter = context.state.activeFilterList[filterIndex];
            if(filter.queryParams.length > 0) {
                createOptionList(filter.queryParams)
            }
            filter.isNewFilter && setIsEditQueryName(true);
            setQueryName(filter.queryName || 'AQ' + (filterIndex + 1))
        } else {
            props.backNavigation();
        }
    }, [context.state.activeFilter]);

    useEffect(()=>{
        setQueryNameError("")
    },[setQueryNameError, queryName])

    useEffect(()=>{
        if(queryOptionList) {
            let spatialQueryPresent = false;
            const visbilityCount = queryOptionList.reduce((count: number,query:any)=> {
                if (query.type === "spatial") {
                    spatialQueryPresent = true;
                }  
                query.hidden && count++;
                return count;
            }, 0);
            setShowSpatialOption(!spatialQueryPresent);
            (visbilityCount >= queryOptionList.length - 1) ? setShowVisbilityIcon(false) : setShowVisbilityIcon(true);
        }
    },[queryOptionList, setShowSpatialOption, setShowVisbilityIcon])

    function createOptionList(queryParams: any) {
        let newOptionList: any[] = [];
        newOptionList = queryParams.reduce((result: any[], query: queryType) => {
            const attribute  = (query.type === "non_priorty") ? 
                {...attributeList[0], value: query.attribute, title: query.attribute }: 
                    attributeList.find(attrb => attrb.value ===  query.attribute);            
            if(attribute) {
                result.push({...query, 
                    attribute: attribute,
                    attributeOperator: operatorsList[attribute.type].find(operator => operator.value === query.attributeOperator) || operatorsList[attribute.type][0]
                })
            }
            return result
        }, [] as any) 
        setQueryList(queryParams)
        setQueryOptionList(newOptionList)
        return newOptionList;
    }

    async function onSpatialSubmit(queryOption: any) {
        dispatch(setIsLoading(true));
        let newList: queryType[] = [...queryList].map(query => ({...query, hidden: false}));
        let newOptionList = [...queryOptionList].map(query => ({...query, hidden: false}));
        const newListItem : any = {
            values: "Bounding Box",
            joinOperator: "and",
            type: "spatial",
            hidden: false,
            ...queryOption
        }
        newList = [...newList.slice(0, updateQueryIndex), {
            ...newListItem,
            attribute: queryOption?.attribute.value,
            attributeOperator: queryOption?.attributeOperator?.value,
        }, ...newList.slice(updateQueryIndex + 1)];
        setQueryList(newList);
        newOptionList = [...newOptionList.slice(0, updateQueryIndex), {
            ...newListItem,
        }, ...newOptionList.slice(updateQueryIndex + 1)];
        setUpdateQueryIndex(-1);
        setQueryOptionList(newOptionList);
        if(newOptionList.length === 1){
            filter.handleIds = queryOption?.handleIds;
        }else{
            const [whereCond, variable]: any[] = await generateGraphqlModelCond([...newOptionList]);
            const filterResult: any = await fetchData(BIM_FETCH_QUERY_RESULT(whereCond,  Object.keys(variable)), variable) 
            filter.handleIds = filterResult.bimElementProperties.reduce((result: any[], item: any) => {
                result.push(item.sourceId)
                return result
            }, [] as any);
        }
        const data = (filter.isNewFilter) ? await createFilter(INSERT_BIM_FILTER, { 
            "queryName": queryName,
            "queryType": "spatial",
            "queryParams": newList
        }) : await updateQuery({ 
            "queryName": queryName,
            "queryType": "spatial",
            "queryParams": newList
        });

        if(data) {
            (context.state.activeFilterTask && filter.isNewFilter) && context.dispatch(setActiveFilterTaskFilters([...context.state.activeFilterTaskFilters, data.insertBimFilterQuery_mutation.filterId]));
            (filter.isNewFilter) ? updateFilterResult(filter.handleIds, data.insertBimFilterQuery_mutation.filterId, data.insertBimFilterQuery_mutation.queryId, newList, false) :
                updateFilterResult(filter.handleIds, filter.id, data.updateBimQuery_mutation.queryId, newList, false); 
        }
        dispatch(setIsLoading(false));  
    }

    async function onSubmit(queryOption: any) { 
        dispatch(setIsLoading(true));
        let newList: queryType[] = [...queryList].map(query => ({...query, hidden: false}));
        let newOptionList = [...queryOptionList].map(query => ({...query, hidden: false}));
        newList = [...newList.slice(0, updateQueryIndex), {
            attribute:  queryOption.attribute.value,
            attributeOperator:  queryOption.attributeOperator.value,
            values: queryOption.values,
            joinOperator: queryOption.joinOperator,
            type: queryOption.type,
            hidden: false
        }, ...newList.slice(updateQueryIndex + 1)];
        setQueryList(newList);
        newOptionList = [...newOptionList.slice(0, updateQueryIndex), queryOption, ...newOptionList.slice(updateQueryIndex + 1)];
        setQueryOptionList(newOptionList);
        setUpdateQueryIndex(-1); 
        const [whereCond, variable]: any[] = await generateGraphqlModelCond([...newOptionList]);
        const filterResult: any = await fetchData(BIM_FETCH_QUERY_RESULT(whereCond,  Object.keys(variable)), variable) 
        filter.handleIds = filterResult.bimElementProperties.reduce((result: any[], item: any) => {
            result.push(item.sourceId)
            return result
        }, [] as any);
        let queryType = "non_spatial";
        const isSpatial = newList.some((query:any)=> query.type === "spatial");
        if(isSpatial){
            queryType = "spatial";
        }
        const data = (filter.isNewFilter) ? await createFilter(INSERT_BIM_FILTER, { 
                "queryName": queryName,
                "queryType": queryType,
                "queryParams": newList
            }) : await updateQuery({ 
                "queryName": queryName,
                "queryType": queryType,
                "queryParams": newList
            });

        if(data) {
            (context.state.activeFilterTask && filter.isNewFilter) && context.dispatch(setActiveFilterTaskFilters([...context.state.activeFilterTaskFilters, data.insertBimFilterQuery_mutation.filterId]));
            (filter.isNewFilter) ? updateFilterResult(filter.handleIds, data.insertBimFilterQuery_mutation.filterId, data.insertBimFilterQuery_mutation.queryId, newList, false) :
                updateFilterResult(filter.handleIds, filter.id, data.updateBimQuery_mutation.queryId, newList, false); 
        }
        dispatch(setIsLoading(false));   
    }

    async function deleteBimModel() {
        dispatch(setIsLoading(true))
        setOpenDeleteModel(false)
        const newList: queryType[] = [...queryList.slice(0, deleteQueryIndex), ...queryList.slice(deleteQueryIndex + 1)].map(query => ({...query, hidden: false}));
        const newOptionList = [...queryOptionList.slice(0, deleteQueryIndex), ...queryOptionList.slice(deleteQueryIndex + 1)].map(query => ({...query, hidden: false}));
        setQueryList(newList)
        setQueryOptionList(newOptionList)
        const [whereCond, variable]: any[] = await generateGraphqlModelCond([...newOptionList]);
        const filterResult: any = await fetchData(BIM_FETCH_QUERY_RESULT(whereCond,  Object.keys(variable)), variable) 
        filter.handleIds = filterResult.bimElementProperties.reduce((result: any[], item: any) => {
            result.push(item.sourceId)
            return result
        }, [] as any);
        let queryType = "non_spatial";
        const isSpatial = newList.some((query:any)=> query.type === "spatial");
        if(isSpatial){
            queryType = "spatial";
        }
        const data = await updateQuery({ 
            "queryName": queryName,
            "queryType": queryType,
            "queryParams": newList
        });
        if(data) {
            updateFilterResult(filter.handleIds, filter.id, filter.queryIds, newList, false);
        }
        dispatch(setIsLoading(false))
    }

    function closeForm() {
        setUpdateQueryIndex(-1)
    }

    async function createFilter(query: any, optionalList: any) {
        return createFilterModel(query, {
            ...optionalList,
            "viewId": context.state.activeView,
            "modelId": context.state.activeModel ,
            "colours": filter.color,
            "filterName": filter.title,
            "queryResult": filter.handleIds,
            ...(context.state.activeFilterTask) && {"taskId": context.state.activeFilterTask},
        }, projectFeatureAllowedRoles.createBimModel);
    }

    async function updateQuery(optionalList: any) {
        return createFilterModel(UPDATE_BIM_QUERY, {
            ...optionalList,
            "viewId": context.state.activeView,
            "filterId": filter.id,
            "queryResult": filter.handleIds,
            "modelId": context.state.activeModel
        }, projectFeatureAllowedRoles.updateBimModel);
    }

    async function onSelectExitingQuery(queryId: string, queryParams: any, queryName: string) {
        dispatch(setIsLoading(true))
        setQueryList(queryParams);
        setQueryName(queryName);
        const newOptionList = createOptionList(queryParams);
        const [whereCond, variable]: any[] = await generateGraphqlModelCond([...newOptionList]);
        const filterResult: any = await fetchData(BIM_FETCH_QUERY_RESULT(whereCond,  Object.keys(variable)), variable) 
        filter.handleIds = filterResult.bimElementProperties.reduce((result: any[], item: any) => {
            result.push(item.sourceId)
            return result
        }, [] as any);
        const data = await createFilter(INSERT_BIM_FILTER_USING_QUERY_ID, { "queryId": queryId });
        if(data) {
            updateFilterResult(filter.handleIds, data.insertBimFilterQuery_mutation.filterId, data.insertBimFilterQuery_mutation.queryId, queryParams, false, queryName);
            context.state.activeFilterTask && context.dispatch(setActiveFilterTaskFilters([...context.state.activeFilterTaskFilters, data.insertBimFilterQuery_mutation.filterId]))
        }
        setOpenExstngQry(false)
        dispatch(setIsLoading(false))
    }

    function updateFilterResult(handleIds : any, filterId: string, queryId: string, queryList: any, isMaterialUpdated: boolean, existQueryName: null | string = null) {
        const filterIndex = context.state.activeFilterList.findIndex((filterItem: filterType) => filterItem.id === filter.id)
        const newQueryName =  existQueryName || queryName;
        const newfilter = {
            ...context.state.activeFilterList[filterIndex],
            id: filterId,
            queryIds: queryId,
            handleIds: handleIds,
            isNewFilter: false,
            queryParams: queryList,
            queryName: newQueryName,
            isMaterialUpdated: isMaterialUpdated
        };
        context.dispatch(setActiveFilterList([...context.state.activeFilterList.slice(0, filterIndex), newfilter, ...context.state.activeFilterList.slice(filterIndex + 1)]));
        filter = newfilter;
    }

    async function fetchElementNames() {
        dispatch(setIsLoading(true))
        const modelIds = (context.state.isAssembly) ? context.state.assemblyModelList : [context.state.activeModel]
        elementNames = await fetchElementName(state.selectedProjectToken, projectFeatureAllowedRoles.viewBimModel, modelIds)
        dispatch(setIsLoading(false))
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


    const handleSpatialQuery = (index?:number) => {
        setQueryType("spatial");
        setQueryName(filter.queryName || 'SPQ' + (filterIndex + 1))
        setUpdateQueryIndex(index ? index : 0)
    }

    const handleAttributeQuery = (index?:number) => {
        setQueryType("non_spatial");
        setQueryName(filter.queryName || 'AQ' + (filterIndex + 1))
        setUpdateQueryIndex(index ? index : 0)
    }

    function handleQueryNameChange(event: any) {
        setQueryName(event.target.value)
    }

    async function onQueryNameBlur(event: any) {
       setTimeout(async () => {
            if(!mountedRef.current){
                return
            }

            if(queryName === '') {
                setQueryNameError('Query name cannot be blank');
                event.target.focus();
                return;
            } 

            let queryType = "non_spatial";
            const isSpatial = filter.queryParams.some((query:any)=> query.type === "spatial");
            if(isSpatial){
                queryType = "spatial";
            }
            setIsEditQueryName(false)
            if(!filter.isNewFilter && queryName !== filter.queryName) {
                const data = await updateQuery({ 
                    "queryName": queryName,
                    "queryType": queryType,
                    "queryParams": filter.queryParams
                });
                if(data) {
                    context.dispatch(setSkipUpdateFilter(true))
                    updateFilterResult(filter.handleIds, filter.id, data.updateBimQuery_mutation.queryId, filter.queryParams, filter.isMaterialUpdated);
                }
            }  
            
        }, 200);
    }

    async function onFilterVisibilityChange(index: number, value: any) {
        dispatch(setIsLoading(true))
        let newList = [...queryList];
        let newOptionList = [...queryOptionList];
        newList = [...newList.slice(0, index), {...queryList[index], hidden: value}, ...newList.slice(index + 1)];
        newOptionList = [...newOptionList.slice(0, index), {...queryOptionList[index], hidden: value}, ...newOptionList.slice(index + 1)];
        setQueryList(newList);
        setQueryOptionList(newOptionList);
        const [whereCond, variable]: any[] = await generateGraphqlModelCond([...newOptionList], true);
        const filterResult: any = await fetchData(BIM_FETCH_QUERY_RESULT(whereCond,  Object.keys(variable)), variable) 
        filter.handleIds = filterResult.bimElementProperties.reduce((result: any[], item: any) => {
            result.push(item.sourceId)
            return result
        }, [] as any);
        updateFilterResult(filter.handleIds, filter.id, filter.queryIds, filter.queryParams, filter.isMaterialUpdated);
        dispatch(setIsLoading(false))
    }

    const createFilterModel = async (query: any, variable: any, role: any) => {
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
            Notification.sendNotification('Some error occured on create/update Filter', AlertTypes.error);
        } finally {
            return (responseData?.data) ? responseData.data : null;
        }
    }

    const getSanitizedQueryValues = (value: any, query: any) => {
        if (query.attribute.value === 'sourceId' && query.type !== "spatial" ) return value.map((a: any) => elementNames[a] || a).join(",");

        if (context.state.isAssembly) {
            return Array.isArray(value) ? value.join(",") : value
        } else {
            return Array.isArray(value) ?
                value.map((val: string) => val.replace("OST_", "")).join(",")
                : value.replace("OST_", "")
        }
    }


    return (
        <div className={`bimQueryList ${(isEditQueryName) ? 'onNameEdit' : ''}`}>
            {(updateQueryIndex < 0 && queryOptionList.length === 0) ?
                <div className="btn-section">
                    <Button className="btn-secondary" onClick={() => setOpenExstngQry(true)}>Select an Existing Query</Button>
                    or
                    <Button className="btn-primary" onClick={() => handleAttributeQuery(0) } >Add a new Attribute Query</Button>
                    or
                    <Button className="btn-primary" onClick={() => handleSpatialQuery(0)}>Add a Spatial Query</Button>
                    <div className="cancel-section">
                        <Button className="btn-secondary" onClick={() => props.backNavigation(false)} >Cancel</Button>
                    </div>
                </div> : 
                <div className="heading blodText1">
                    {isEditQueryName ?
                        <>
                            <TextField
                                onKeyDown={(e: any) => {
                                    e.stopPropagation()
                                    if (e.key === "Enter") {
                                        onQueryNameBlur(e);
                                    }
                                }}
                                onBlur={(e) => onQueryNameBlur(e)}
                                onChange={handleQueryNameChange}
                                autoFocus={isEditQueryName}
                                className="heading textBox"
                                size={"small"}
                                placeholder={"Add query name"}
                                value={queryName}
                                required={true} fullWidth={true} variant="outlined" 
                            />
                            <div className="query-error">{queryNameError}</div>
                        </>: 
                        <div onClick={() => setIsEditQueryName(true)} className="heading blodText1" >
                            <Tooltip title={props.backToolTipMsg || "Back to Filters"} aria-label={props.backToolTipMsg || "Back to Filters"}>
                                <ArrowBackIosIcon onClick={() => props.backNavigation(false)} viewBox={"-4 0 24 24"} fontSize={'small'} className='menuButton'/>
                            </Tooltip>
                            {queryName}
                        </div>
                    }
                </div>
            }
            {(queryOptionList.length > 0) ? 
                queryOptionList.map((query:any, index:number)=> {
                    const sanitizedQueryValues = getSanitizedQueryValues(query.values, query);
                    return (
                        <div key={`attr-${index}`}>
                            { index > 0 ?
                                <div className="joinOprLabel">{query.joinOperator === 'and' ? "AND" : "OR"}</div> 
                                : null
                            }
                            <div className="queryItem">
                                <div className="queryDesc">{`${query.attribute.title} ${query.attributeOperator.symbol} ${sanitizedQueryValues}`}</div>
                                <div>
                                    <Tooltip title="Edit clause">
                                        <EditIcon onClick={() => query.type !== "spatial" ? handleAttributeQuery(index) : handleSpatialQuery(index) } fontSize="small"/>
                                    </Tooltip> 
                                    {showVisbilityIcon || query.hidden ? 
                                        query.hidden ? 
                                            <Tooltip title="Show clause">
                                                <VisibilityOffIcon onClick={() => onFilterVisibilityChange(index, false)} fontSize="small" />
                                            </Tooltip>:
                                            <Tooltip title="Hide clause">
                                                <VisibilityIcon onClick={() => onFilterVisibilityChange(index, true)}  fontSize="small" />
                                            </Tooltip>
                                        : null
                                    }
                                    {queryOptionList.length > 1 && 
                                        <Tooltip title="Delete clause">
                                            <DeleteIcon onClick={() =>{ setDeleteQueryIndex(index);  setOpenDeleteModel(true)}} fontSize="small"/> 
                                        </Tooltip> 
                                    }
                                </div>
                            </div> 
                            {(updateQueryIndex === index) ? 
                            (query.type !== "spatial" ?
                            <QueryForm onSubmit={onSubmit} onClose={closeForm} queryOption={queryOptionList[index]}  updateIndex={updateQueryIndex} /> : 
                            <SpatialQuery onSubmit={onSpatialSubmit} queryOption={queryOptionList[index]} onClose={closeForm} />) : null }
                            { index !== queryOptionList.length -1 ?
                                null
                                : (updateQueryIndex !== index && updateQueryIndex !==  queryOptionList.length) ? 
                                <>
                                    <Button className="btn-primary addCaluse"  fullWidth onClick={() => handleAttributeQuery(index + 1) } >Add a Clause</Button> 
                                    { showSpatialOption && <Button className="btn-primary addCaluse"  fullWidth onClick={() => handleSpatialQuery(index + 1) } >Add a Spatial Query</Button> }
                                </> : null
                            }
                        </div>
                    )
                })
            : null}
            {((updateQueryIndex === 0 && queryOptionList.length === 0) || updateQueryIndex ===  queryOptionList.length) ?
                ( queryType === "non_spatial" ? <QueryForm onSubmit={onSubmit} onClose={closeForm} updateIndex={updateQueryIndex} /> : 
                <SpatialQuery onSubmit={onSpatialSubmit} onClose={closeForm}/> )
                : null
            }
            <QueryTable open={openExstngQry} handleClose={() => setOpenExstngQry(false)} onSelectQuery={onSelectExitingQuery}/>
            <ConfirmDialog open={openDeleteModel} message={confirmDeleteMessage} close={() => setOpenDeleteModel(false)} proceed={deleteBimModel} />
        </div>
    );
}
