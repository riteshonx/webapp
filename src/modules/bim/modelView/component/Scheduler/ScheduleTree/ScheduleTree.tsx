import React, { useContext, useState, useEffect } from 'react';
import './ScheduleTree.scss'
import { projectFeatureAllowedRoles } from '../../../../../../utils/role';
import { stateContext } from '../../../../../root/context/authentication/authContext';
import { client } from '../../../../../../services/graphql'
import { bimContext } from '../../../../contextAPI/bimContext';
import TreeView from '@material-ui/lab/TreeView';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { ExpandMore, ChevronRight } from '@material-ui/icons';
import TreeItem from '@material-ui/lab/TreeItem';
import { FETCH_PROJECT_SCHEDULE_TREE, SEARCH_PROJECT_SCHEDULE_TREE, FETCH_TASK_FILTER_LINK_DATA, DELETE_BIM_FILTER_SCHEDULE_LINK } from '../../../../graphql/bimSchedule';
import { FETCH_BIM_VIEW_BY_VIEW } from '../../../../graphql/bimQuery';
import { UPDATE_BIM_FILTER_MATERIAL } from '../../../../graphql/bimMaterial';
import { TextField, Tooltip } from '@material-ui/core';
import { setIsLoading } from '../../../../../root/context/authentication/action';
import cubeIcon from '../../../../../../assets/images/cubeIcon.svg';
import { setActiveFilterList, setActiveFilterTask, setActiveFilterTaskFilters, setActiveGeometryName, setSkipUpdateFilter } from '../../../../contextAPI/action';
import { hexToRgb } from '../../../../container/utils';
import ColorList from "../ColorList/ColorList";
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import ConfirmDialog from '../../../../../shared/components/ConfirmDialog/ConfirmDialog';
import Notification, { AlertTypes } from '../../../../../shared/components/Toaster/Toaster';
import { createFilterList } from '../../../../container/utils';
import { useBimQueryUpdater } from "../../../../container/queryResultUpdaterHook";
import { getProjectExchangeToken, getExchangeToken } from "src/services/authservice";
import axios from "axios";
import { materialStatusMsg } from 'src/modules/bim/constants/query';

interface RenderTree {
    id: string;
    taskName: string;
    taskType: string;
    progress: number;
    children?: readonly RenderTree[];
}

interface message {
    header: string,
    text: string,
    cancel: string,
    proceed: string,
}

const confirmDeleteMessage: message = {
    header: "Are You Sure?​",
    text: `This action will delete the scheduler Task BIM Filter association`,
    cancel: "Cancel",
    proceed: "Yes"
}

export default function ScheduleTree(props: any) {
    const { dispatch, state }: any = useContext(stateContext);
    const context: any = useContext(bimContext);
    const [treeData, setTreeData] = useState([]);
    const [linkData, setLinkData] = useState<any>({});
    const [treeSearch, setTreeSearch] = useState("");
    const [selTaskName, setSelTaskName] = useState("");
    const [selTaskId, setSelTaskId] = useState<null | string>(null);
    const [selTaskType, setSelTaskType] = useState<string>('');
    const [infoMsg, setInfoMsg] = useState("");
    const [progressInfo, setProgressInfo] = useState<any>({});
    const [timer, setTimer] = useState<any>(null);
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const [hiddenTaskList, setHiddenTaskList] = useState<string[]>([]);
    const [openDeleteModel, setOpenDeleteModel] = useState(false);
    const [resUpdateViewId, setResUpdateViewId] = useState<string | null>(null);
    const [resUpdateFilterSet, setResUpdateFilterSet] = useState<[] | null>(null);
    const [projectDetails, setProjectDetails] = useState<any>();
    const open = Boolean(anchorEl);

    useEffect(() => {
        fetchTreeData(FETCH_PROJECT_SCHEDULE_TREE, null);
    }, []);

    useEffect(() => {
        fetchLinkData();
    }, [context.state.activeFilterTaskFilters, context.state.activeFilterList]);

    async function fetchTreeData(query: any, searchText: string | null) {
        dispatch(setIsLoading(true));
        const variable = (searchText) ? { searchText: searchText } : {};
        const progresRep = await getProgress();
        if (progresRep && progresRep.summaryTaskProgress) {
            const progsInfo = progresRep.summaryTaskProgress.reduce((result: any, info: any) => {
                result[info.taskId] = info.progress;
                return result;
            }, {})
            setProgressInfo(progsInfo);
        }
        const data = await fetchData(query, variable);
        if (data.getProjectScheduleTree_query.data[0]) {
            setTreeData(data.getProjectScheduleTree_query.data)
            const validFilterIds = await fetchLinkData();
            await fetchFilterData(validFilterIds);
            context.dispatch(setActiveGeometryName('3D-Views'))
            setInfoMsg("");
        } else {
            setTreeData([]);
            setInfoMsg("No schedule found");
            context.dispatch(setActiveGeometryName('3D-Views'))
        }
        setHiddenTaskList([])
        dispatch(setIsLoading(false));
    }

    async function fetchLinkData() {
        const data = await fetchData(FETCH_TASK_FILTER_LINK_DATA, {
            "viewId": context.state.activeView
        });
        if (data?.getBimFilterScheduleLink_query?.data) {
            const linkRespon = data.getBimFilterScheduleLink_query.data;
            setLinkData(linkRespon);
            const validFilterIds = Object.keys(linkRespon).reduce((result: any, taskId: any) => {
                result.push(...linkRespon[taskId].map((b: any) => b.bimFilterId))
                return result;
            }, [])
            return validFilterIds;
        } else {
            setLinkData({});
            return [];
        }
    }

    async function fetchFilterData(validFlterIds: any) {
        const data = await fetchData(FETCH_BIM_VIEW_BY_VIEW, {
            "id": context.state.activeView
        })
        if (data.bimView.length > 0 && data.bimView[0].bimViewFilterAssociations) {
            const filterSet = createFilterList(data.bimView[0].bimViewFilterAssociations, validFlterIds);
            context.dispatch(setActiveFilterList(filterSet));
            if (data.bimView[0].isImport) {
                setResUpdateFilterSet(filterSet);
                setResUpdateViewId(context.state.activeView);
            }
        } else {
            context.dispatch(setActiveFilterList([]));
        }
    }

    const deleteFilterAssoc = async () => {
        try {
            dispatch(setIsLoading(true));
            const filterIds = selTaskId ? linkData[selTaskId].map((a: any) => a.bimFilterId) : [];
            selTaskId && await graphqlMutation(DELETE_BIM_FILTER_SCHEDULE_LINK, {
                taskId: selTaskId,
                bimFilterIds: filterIds,
                modelId: context.state.activeModel
            }, projectFeatureAllowedRoles.updateBimModel);
            context.dispatch(setActiveFilterList([
                ...context.state.activeFilterList.filter((filter: any) => { return !filterIds.includes(filter.id) }),
            ]));
            setOpenDeleteModel(false);
            fetchLinkData();
            dispatch(setIsLoading(false));
            setAnchorEl(null);
        } catch (error: any) {
            Notification.sendNotification('Some error occured on delete Filter association', AlertTypes.error);
            console.log(error.message);
        }
    }

    async function addDvaScheduler() {
        const token = getExchangeToken();
        const schedularData = {
            projectId: state.currentProject.projectId,
            modelId: context.state.activeModel,
            taskId: selTaskId
        };
        
        try {
            dispatch(setIsLoading(true));
            const schedulerResponse = await axios.post(
                `${process.env.REACT_APP_DVASCRIPT_URL}schedular/addDvaScheduling`,
                schedularData,
                {
                    headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }

            );
            dispatch(setIsLoading(false));
            const data = schedulerResponse.data;
            Notification.sendNotification('Material Added Successfully', AlertTypes.success);
            return data;
        } catch (error: any) {
            Notification.sendNotification(error, AlertTypes.error);
            dispatch(setIsLoading(false));
            throw new Error(error);
        }
        return schedularData;
    }

    function addFilter() {
        dispatch(setIsLoading(true));
        const id = (Math.random() + 1).toString(36).substring(7)
        setTimeout(() => {
            context.dispatch(setActiveFilterTaskFilters([...context.state.activeFilterTaskFilters, id]));
            context.dispatch(setActiveFilterList([
                ...context.state.activeFilterList.map((filter: any) => { return { ...filter, "hidden": false } }),
                {
                    id: id,
                    title: (selTaskName + " - " || "New Filter - ") + (context.state.activeFilterList.length + 1),
                    color: hexToRgb("#EEEEEE"),
                    queryIds: null,
                    handleIds: [],
                    isNewFilter: true,
                    queryParams: [],
                    queryName: '',
                    hidden: false
                }
            ]))
            dispatch(setIsLoading(false));
            openQuery(true, id);
        }, 1000);
    }

    function onFilterVisibilityChange(event: any, id: string, value: any) {
        event.stopPropagation();
        const taskFilterIds = linkData[id].map((a: any) => a.bimFilterId);
        const filters = context.state.activeFilterList.map((filter: any) => {
            return taskFilterIds.includes(filter.id) ? { ...filter, hidden: value } : filter;
        });
        value ? setHiddenTaskList([...hiddenTaskList, id]) : setHiddenTaskList(hiddenTaskList.filter(item => item !== id));
        context.dispatch(setActiveFilterList(filters));
    }

    function onSingleFilterVisibilityChange(id: string, filterList: any) {
        const taskFilterIds = linkData[id].map((a: any) => a.bimFilterId);
        const isOneVisible = filterList.some((filter: any) => {
            if (taskFilterIds.includes(filter.id)) {
                return !filter.hidden;
            }
            return false;
        });
        isOneVisible ? setHiddenTaskList(hiddenTaskList.filter(item => item !== id)) : setHiddenTaskList([...hiddenTaskList, id]);
    }

    const fetchData = async (query: any, variables: any) => {
        let responseData;
        try {
            responseData = await client.query({
                query: query,
                variables: variables,
                fetchPolicy: 'network-only',
                context: { role: projectFeatureAllowedRoles.viewBimModel, token: state.selectedProjectToken }
            });

        } catch (error: any) {
            console.log(error)
            Notification.sendNotification('Some error occured on fetching schedule data', AlertTypes.error);
        } finally {
            return (responseData?.data) ? responseData.data : null;
        }
    }

    const graphqlMutation = async (query: any, variable: any, role: any) => {
        let responseData;
        try {
            responseData = await client.mutate({
                mutation: query,
                variables: variable,
                context: { role: role, token: state.selectedProjectToken }
            })
            return responseData.data;
        } catch (error: any) {
            console.log(error.message);
            Notification.sendNotification('Some error occured on update data', AlertTypes.error);
        } finally {
            return (responseData?.data) ? responseData.data : null;
        }
    }


    async function getProgress(): Promise<any> {
        let responseData;
        try {
            responseData = await axios.put(`${process.env.REACT_APP_SCHEDULER_URL}v1/summaryTasks/progress/update`, null, {
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${getProjectExchangeToken()}`
                }
            })
        } catch (error: any) {
            console.error(error)
        } finally {
            return (responseData?.data) ? responseData.data : null;
        }
    }

    const handleSearchChange = (event: any) => {
        setTreeSearch(event.target.value)
        if (timer) {
            clearTimeout(timer);
            setTimer(null);
        }

        setTimer(
            setTimeout(() => {
                context.dispatch(setSkipUpdateFilter(true))
                event.target.value != '' ? fetchTreeData(SEARCH_PROJECT_SCHEDULE_TREE, event.target.value)
                    : fetchTreeData(FETCH_PROJECT_SCHEDULE_TREE, null);
            }, 1000)
        );
    }

    const handleClick = (event: any, id: string, type: string) => {
        event.stopPropagation()
        setSelTaskId(id);
        setSelTaskType(type);
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const openQuery = (isNewFilter = false, newId: string | null = null) => {
        if (!isNewFilter) {
            context.dispatch(setActiveFilterList(context.state.activeFilterList.map((filter: any) => { return { ...filter, "hidden": false } })))
            selTaskId && linkData[selTaskId] ? context.dispatch(setActiveFilterTaskFilters(linkData[selTaskId].map((a: any) => a.bimFilterId)))
                : context.dispatch(setActiveFilterTaskFilters([]));
        } else {
            selTaskId && linkData[selTaskId] ? context.dispatch(setActiveFilterTaskFilters([...(linkData[selTaskId].map((a: any) => a.bimFilterId)), newId]))
                : context.dispatch(setActiveFilterTaskFilters([newId]));
        }

        context.dispatch(setActiveFilterTask(selTaskId));
        props.showQueryWindw(true);
        setHiddenTaskList([]);
        setAnchorEl(null);
    };

    const updateMaterialMaster = async () => {
        try {
            dispatch(setIsLoading(true))
            const token = getExchangeToken();
            const materialPayload = {
                projectId: state.currentProject.projectId,
                modelId: context.state.activeModel,
            };
            
            const response = await axios.post(
                `${process.env["REACT_APP_DVASCRIPT_URL"]}material/checkMaterialData`,
                materialPayload,
                {
                    headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            
            if (response.data.result > 0) { 
                await addDvaScheduler();
            } else {
                
                if (!selTaskId || !linkData[selTaskId]) return;
                const filterIds = linkData[selTaskId].map((a: any) => a.bimFilterId) || [];
                const updateFilterIds = context.state.activeFilterList.reduce((result: any, filter: any) => {
                    if (filterIds.includes(filter.id) && !filter.isMaterialUpdated) {
                        result.push(filter.id);
                    }
                    return result;
                }, []);
                if (updateFilterIds && updateFilterIds.length) {
                    const result = await graphqlMutation(UPDATE_BIM_FILTER_MATERIAL, {
                        filterIds: updateFilterIds,
                        modelId: context.state.activeModel
                    }, projectFeatureAllowedRoles.createBimModel);
                    if (result.updateBimFilterMaterial_mutation?.message === "Material updated successfully") {
                        Notification.sendNotification("Material updated successfully", AlertTypes.success);
                        context.dispatch(setActiveFilterList(context.state.activeFilterList.map((filter: any) => {
                            return updateFilterIds.includes(filter.id) ? { ...filter, isMaterialUpdated: true } : filter;
                        })));
                    } else {
                        Notification.sendNotification(materialStatusMsg[result.updateBimFilterMaterial_mutation?.message] || 'Some error occered on update material', AlertTypes.warn);
                    }

                }
            }
            setAnchorEl(null);
        } catch (error: any) {
            Notification.sendNotification('Some error occured on material update', AlertTypes.error);
            console.log(error);
        } finally {
            dispatch(setIsLoading(false));
        }
    };

    const isUpdateMaterialTrue = () => {
        if (selTaskId && linkData[selTaskId] && selTaskType === 'work_package') {
            const filterIds = linkData[selTaskId].map((a: any) => a.bimFilterId) || [];
            return context.state.activeFilterList.some((filter: any) =>
                (filterIds.includes(filter.id)) && !filter.isMaterialUpdated
            );
        }
        return false
    }

    const nodeLabel = (label: string, id: string, taskType: string, progress: number) => {
        return (
            <div className="nodeLabel">
                <div className="labelName">{label}{(taskType === 'wbs') && ` - ${progressInfo[id] | 0}%`}</div>
                <div className="operations">
                    {linkData && linkData[id] && <ColorList colors={linkData[id]} id={id} onVisbiltyChange={onSingleFilterVisibilityChange} />}
                    {linkData && linkData[id] && ((hiddenTaskList.includes(id)) ?
                        <Tooltip title="Show all filters associated to this task" key={`${id}-hide`} enterDelay={1000} enterNextDelay={1000}>
                            <VisibilityOffIcon onClick={(e) => onFilterVisibilityChange(e, id, false)} className={"eyeIcon"} fontSize="small" />
                        </Tooltip> :
                        <Tooltip title="Hide all filters associated to this task" key={`${id}-show`} enterDelay={1000} enterNextDelay={1000}>
                            <VisibilityIcon onClick={(e) => onFilterVisibilityChange(e, id, true)} className={"eyeIcon"} fontSize="small" />
                        </Tooltip>
                    )}
                    {(taskType === 'wbs' || taskType === 'work_package') && (state.projectFeaturePermissons?.cancreateBimModel && state.projectFeaturePermissons?.canupdateBimModel) &&
                        <Tooltip title='Add/Edit/Delete filters associated to this task or update material'>
                            <img src={cubeIcon} className={"cubeIcon"} onClick={(e: any) => { setSelTaskName(label); handleClick(e, id, taskType); }} alt="file-icon" />
                        </Tooltip>
                    }
                </div>
            </div>
        )
    }

    const renderTree = (nodes: RenderTree | null, level: number) => (
        nodes && <TreeItem key={nodes.id}
            nodeId={nodes.id}
            icon={nodes.taskType === 'milestone' && <div className="milestoneIcon"></div>}
            label={nodeLabel(nodes.taskName, nodes.id, nodes.taskType, nodes.progress)}
            className={`${level > 1 && 'level-n'}  ${level === 0 && 'level-0'} ${level === 1 && 'level-1'} ${(!nodes.children || !nodes.children.length) && 'no-children'}`}>
            {Array.isArray(nodes.children)
                ? nodes.children.map((node) => renderTree(node, level + 1))
                : null}
        </TreeItem>
    );

    return (
        <div className="bimScheduleTree">
            {useBimQueryUpdater(resUpdateViewId, resUpdateFilterSet)}
            <TextField
                onChange={handleSearchChange}
                size={"small"}
                placeholder={"Search"}
                value={treeSearch}
                fullWidth={true}
                variant="outlined"
                className="treeSearch"
                onKeyDown={(e: any) => {
                    e.stopPropagation()
                }}
            />
            <div>{infoMsg}</div>
            <TreeView
                className={"bimTree"}
                disableSelection={true}
                defaultCollapseIcon={<ExpandMore />}
                defaultExpandIcon={<ChevronRight />}
                style={{ flexGrow: 1, maxWidth: 400, overflowY: 'auto' }}
            >
                {treeData.map((tree: any) => renderTree(tree, 0))}
            </TreeView>
            <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                className={"bimSchdulerMenu"}
            >
                <MenuItem onClick={addFilter}>Add BIM Filter</MenuItem>
                {linkData && selTaskId && linkData[selTaskId] && <MenuItem onClick={() => openQuery()}>Edit</MenuItem>}
                {linkData && selTaskId && linkData[selTaskId] && <MenuItem onClick={() => { setAnchorEl(null); setOpenDeleteModel(true) }}>Delete</MenuItem>}
                {linkData && selTaskId && isUpdateMaterialTrue() && <MenuItem onClick={() => updateMaterialMaster()}>Update Material</MenuItem>}
            </Menu>
            <ConfirmDialog open={openDeleteModel} message={confirmDeleteMessage} close={() => setOpenDeleteModel(false)} proceed={() => deleteFilterAssoc()} />
        </div>
    );
}
