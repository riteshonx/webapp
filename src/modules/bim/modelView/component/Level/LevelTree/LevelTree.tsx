import React, { useContext, useState, useEffect } from 'react';
import './LevelTree.scss'
import { projectFeatureAllowedRoles } from '../../../../../../utils/role';
import { stateContext } from '../../../../../root/context/authentication/authContext';
import { client } from '../../../../../../services/graphql'
import { bimContext } from '../../../../contextAPI/bimContext';
import TreeView from '@material-ui/lab/TreeView';
import { ExpandMore, ChevronRight } from '@material-ui/icons';
import TreeItem from '@material-ui/lab/TreeItem';
import { FETCH_BIM_VIEW_BY_VIEW, FETCH_BIM_ELEMENT_NAME_BY_MODEL } from '../../../../graphql/bimQuery';
import { setIsLoading } from '../../../../../root/context/authentication/action';
import { setActiveFilterList, setActiveGeometryName } from '../../../../contextAPI/action';
import { Tooltip, Button } from '@material-ui/core';
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import { rgbToHex } from '../../../../container/utils';
import Notification, { AlertTypes } from '../../../../../shared/components/Toaster/Toaster';
import { createFilterList } from '../../../../container/utils';
import { iterrateOverElementsAssembly, iterrateOverElements } from '../../../../container/utils';

interface RenderTree {
    id: string;
    LevelName: string;
    LevelFilterColor: string | null;
    children?: readonly RenderTree[];
}

export default function LevelTree(props: any) {
    const { dispatch, state }: any = useContext(stateContext);
    const context: any = useContext(bimContext);
    const [treeData, setTreeData] = useState([]);
    const [infoMsg, setInfoMsg] = useState("");
    const [showAllLevel, setShowAllLevel] = useState(true);
    const [hiddenTaskList, setHiddenTaskList] = useState<string[]>([]);
    const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
    const viewer = context.state.viewer;
    const elementNames: any = {};

    useEffect(() => {
        fetchTreeData();
    }, []);

    async function fetchTreeData() {
        dispatch(setIsLoading(true));
        const data = await fetchFilterData();
        context.dispatch(setActiveGeometryName('3D-Views'))
        if (data) {
            setTreeData(data.reduce((result: any[], filter: any) => {
                const childerns =  filter.handleIds.map((elementId: any) => {
                    return {
                        id: '' + elementId,
                        LevelName: elementNames[elementId] || elementId,
                        LevelFilterColor: null
                    }
                })

                result.push({
                    id: filter.id,
                    LevelName: filter.title,
                    LevelFilterColor: rgbToHex(filter.color),
                    children: childerns
                })

                return result
            }, [] as any));
            setInfoMsg("");
        } else {
            setTreeData([]);
            setInfoMsg("No Level info found");
        }
        dispatch(setIsLoading(false));
    }

    async function fetchFilterData() {
        const data = await fetchData(FETCH_BIM_VIEW_BY_VIEW, {
            "id": context.state.activeView
        })
        if(data.bimView.length > 0 && data.bimView[0].bimViewFilterAssociations) {
            const filterSet = createFilterList(data.bimView[0].bimViewFilterAssociations, null);
            await fetchElementName(filterSet);
            context.dispatch(setActiveFilterList(filterSet));
            return filterSet.sort((a: any, b: any) => (a.title > b.title) ? 1 : -1);
        } else {
            context.dispatch(setActiveFilterList([]));
            return null;
        }
    }

    async function fetchElementName(filterSet: any) {
        const modelIds = (context.state.isAssembly) ? context.state.assemblyModelList : [context.state.activeModel]
        return Promise.all(filterSet.map(async (filter: any) => {
            return await fetchData(FETCH_BIM_ELEMENT_NAME_BY_MODEL, {
                "modelIds": modelIds,
                "sourceIds": filter.handleIds
            }, 'cache-first')
        })).then(values => {
            values.map((levelProp: any) => {
                levelProp?.bimElementProperties.map((handleDetails: any) => {
                    elementNames[handleDetails.sourceId] = `${handleDetails.bimFamilyProperty?.familyName || ''} - ${handleDetails.bimFamilyProperty?.type || ''}(${handleDetails.sourceId})`;
                })
            })
        });
    }

    function onFilterVisibilityChange(event: any , id: string, value: any) {
        event.stopPropagation();
        const filters = context.state.activeFilterList.map((filter: any) => {
            return filter.id === id ? {...filter, hidden: value } :  filter;
        });
        value ? setHiddenTaskList([...hiddenTaskList, id]) : setHiddenTaskList(hiddenTaskList.filter(item => item !== id));
        context.dispatch(setActiveFilterList(filters));
    }

    function onAllFilterVisibilityChange(value: any) {
        const hiddenList: string[] = [];
        const filters = context.state.activeFilterList.map((filter: any) => {
            value && hiddenList.push(filter.id)
            return  {...filter, hidden: value }
        });
        setHiddenTaskList(hiddenList)
        setShowAllLevel(!value)
        context.dispatch(setActiveFilterList(filters));
    }

    function onSelectElement(id: any) {
        const highlightElement = (entityId: any, entity: any, child: any) => {
            if (entityId.getType() === 1) {
                const handleId = (context.state.isAssembly) ? entity.getNativeDatabaseHandle().split("_")[1] : child.getUniqueSourceID();
                if (handleId === id) {
                    viewer.setSelectedEntity(entityId)
                } 
            }
        }
        (context.state.isAssembly) ? iterrateOverElementsAssembly(highlightElement.bind(null), viewer) :iterrateOverElements(highlightElement.bind(null), viewer);
        setSelectedEntityId(id);
    }

    const fetchData = async (query: any, variables: any, fetchPolicy: any = 'network-only') => {
        let responseData;
        try {
            responseData = await client.query({
                query: query,
                variables: variables,
                fetchPolicy: fetchPolicy,
                context: { role: projectFeatureAllowedRoles.viewBimModel, token: state.selectedProjectToken }
            });

        } catch (error: any) {
            console.log(error)
            Notification.sendNotification('Some error occured on fetching Level data', AlertTypes.error);
        } finally {
            return (responseData?.data) ? responseData.data : null;
        }
    }

    const nodeLabel = (label: string, id: string, filterColor: string | null, level: number) => {
        return (
            <div className="nodeLabel">
                <div className="labelName" onClick={() => level > 0 && onSelectElement(id)}>{label}</div>
                {filterColor &&
                    <div className="operations">
                        <div className="bimColorIcon" style={{ background: filterColor }}></div>
                        {((hiddenTaskList.includes(id)) ?
                            <Tooltip title="Show all elements associated to this level">
                                <VisibilityOffIcon onClick={(e) => onFilterVisibilityChange(e, id, false)} className={"eyeIcon"} fontSize="small"/>
                            </Tooltip> :
                            <Tooltip title="Hide all elements associated to this level">
                                <VisibilityIcon onClick={(e) => onFilterVisibilityChange(e, id, true)} className={"eyeIcon"} fontSize="small"/>
                            </Tooltip>
                        )}
                    </div>
                }
            </div>
        )
    }

    const renderTree = (nodes: RenderTree | null, level: number) => (
        nodes && <TreeItem key={nodes.id}
            nodeId={nodes.id}
            label={nodeLabel(nodes.LevelName, nodes.id, nodes.LevelFilterColor, level)}
            className={`${level > 0 && 'level-n'}  ${level === 0 && 'level-1'} ${selectedEntityId === nodes.id && 'selected' }`}
            onKeyDown={(e: any)=>{e.keyCode == '13' &&  level > 0 && onSelectElement(nodes.id);}}>
            {Array.isArray(nodes.children)
                ? nodes.children.map((node) => renderTree(node, level + 1))
                : null}
        </TreeItem>
    );

    return (
        <div className="bimLevelTree">
            <div>{infoMsg}</div>
            {treeData.length > 0 &&
                <div className="hide-all-filters">
                    {showAllLevel ? <Button className="btn-secondary" size={"small"} onClick={() => onAllFilterVisibilityChange(true)} >Hide All</Button> :
                        <Button className="btn-secondary" size={"small"} onClick={() => onAllFilterVisibilityChange(false)} >Show All</Button>}
                </div>
            }
            <TreeView
                className={"bimTree"}
                disableSelection={true}
                defaultCollapseIcon={<ExpandMore />}
                defaultExpandIcon={<ChevronRight />}
                style={{ flexGrow: 1, maxWidth: 400, overflowY: 'auto' }}
                onKeyDown={(e: any)=>{e.stopPropagation()}}
            >
                {treeData.map((tree: any) => renderTree(tree, 0))}
            </TreeView>
        </div>
    );
}
