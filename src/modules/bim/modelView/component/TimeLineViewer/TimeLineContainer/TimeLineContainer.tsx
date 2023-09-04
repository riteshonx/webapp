import React, { useContext, useState, useEffect, useRef } from 'react';
import './TimeLineContainer.scss'
import { projectFeatureAllowedRoles } from '../../../../../../utils/role';
import { stateContext } from '../../../../../root/context/authentication/authContext';
import { client } from '../../../../../../services/graphql'
import { bimContext } from '../../../../contextAPI/bimContext';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import TimeLineSlider from '../TimeLineSlider/TimeLineSlider';
import TimeLineScale from '../TimeLineScale/TimeLineScale';
import { FETCH_PROJECT_SCHEDULE_TREE, BIM_SCHEDULE_VIEW } from '../../../../graphql/bimSchedule';
import { FETCH_BIM_VIEW_BY_VIEW } from '../../../../graphql/bimQuery';
import { setIsLoading } from '../../../../../root/context/authentication/action';
import {setUpdateFilter, setIsActiveViewTimeLine, setActiveFilterList } from '../../../../contextAPI/action';
import moment from 'moment';
import { useBimQueryUpdater } from "../../../../container/queryResultUpdaterHook"
import { createFilterList } from '../../../../container/utils';
import { statusColorNameMapping } from '../../../../constants/query';
import { hexToRgb } from '../../../../container/utils';

export default function TimeLineContainer(props: any) {
    const { dispatch, state }: any = useContext(stateContext);
    const context: any = useContext(bimContext);
    const [openTimeLine, setOpenTimeLine] = useState(false);
    const [scale, setScale] = useState('Daily');
    const [isUpdating, setIsUpdating] = useState(false);
    const [treeData, setTreeData] = useState({
        plannedStartDate: new Date(),
        plannedEndDate: new Date(),
        plannedDuration: 1
    });
    let viewer: any = null;
    const isInitialMount = useRef(true);
    const [resUpdateViewId, setResUpdateViewId] = useState<string | null>(null);
    const [resUpdateFilterSet, setResUpdateFilterSet] = useState<[] | null>(null);
    const [scheduleData, setscheduleData] = useState<any>(null);

    useEffect(() => {
        fetchTreeData(FETCH_PROJECT_SCHEDULE_TREE, null);
        return(()=> context.dispatch(setIsActiveViewTimeLine(false)))
    }, []);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
        } else {
            if(!openTimeLine) {
                context.dispatch(setUpdateFilter(context.state.updateFilter + 1))
                context.dispatch(setIsActiveViewTimeLine(false))
                setscheduleData(null);
            } else {
                context.dispatch(setIsActiveViewTimeLine(true))
            }
        }
    }, [openTimeLine]);

    async function importViewFilters(viewId: any) {
        const data = await fetchData(FETCH_BIM_VIEW_BY_VIEW, {"id": viewId})
        if(data.bimView.length > 0 && data.bimView[0].bimViewFilterAssociations) {
            const filterSet = createFilterList(data.bimView[0].bimViewFilterAssociations);
            setResUpdateFilterSet(filterSet);
            setResUpdateViewId(viewId);
        }
    }

    async function fetchTreeData(query: any, searchText: string | null) {
        dispatch(setIsLoading(true));
        const variable = (searchText) ? { searchText: searchText } : {};
        const data = await fetchData(query, variable);
        if (data?.getProjectScheduleTree_query?.data[0]) {
            setTreeData(data.getProjectScheduleTree_query.data[0])
        }
        dispatch(setIsLoading(false));
    }

    const onSliderChange = async (sltdInterval: any) => {
        try {
            viewer = context.state.viewer;
            const tlEndDate = moment(sltdInterval[1], 'DD/MM/yyyy').format('YYYY-MM-DD');
            const tlStartDate = moment(sltdInterval[0], 'DD/MM/yyyy').format('YYYY-MM-DD');
            dispatch(setIsLoading(true));
            const data = !scheduleData ? await fetchData(BIM_SCHEDULE_VIEW, {
                modelId: context.state.activeModel
            }) : scheduleData;
            setscheduleData(data);
            if(data?.bimscheduleView) {
                const filters = data?.bimscheduleView.reduce((result: [any], task: any) => {
                    const plndStartDate = moment(task.plannedStartDate, 'YYYY-MM-DD');
                    const plndEndDate = moment(task.plannedEndDate, 'YYYY-MM-DD');
                    if (plndStartDate.isBetween(tlStartDate, tlEndDate, undefined, '[]') || 
                        plndEndDate.isBetween(tlStartDate, tlEndDate, undefined, '[]') ||
                        (plndStartDate.isBefore(tlStartDate) && plndEndDate.isAfter(tlEndDate))) {
                        if (!statusColorNameMapping[task.status]) return result;
                        result.push({
                            id: task.status,
                            title: task.status,
                            color: hexToRgb(statusColorNameMapping[task.status].color),
                            queryIds: null,
                            handleIds: task.bimElements,
                            isNewFilter: false,
                            queryParams: [],
                            queryName: '',
                            hidden: false
                        })
                    }
                    return result;
                }, []); 
                context.dispatch(setActiveFilterList(filters));
            }
            dispatch(setIsLoading(false));
        } catch (error: any) {
            console.error(error)
        } finally {
            dispatch(setIsLoading(false));
        }
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
        } finally {
            return (responseData?.data) ? responseData.data : null;
        }
    }

    function handleScaleChange(value: any):void {
        setScale(value)
    }

    function openTimeLineBar(opnTimeLine: boolean) {
        const isSystemViewImport = context.state.systemViewList.find((view: any) => view.id !== '3dview' && view.isImport);
        if(isSystemViewImport) {
            importViewFilters(isSystemViewImport.id)
        } else {
            setOpenTimeLine(opnTimeLine)
        }
    }

    return (
        <div className={"timeLineContainer"}>
            {useBimQueryUpdater(resUpdateViewId, resUpdateFilterSet, () => setOpenTimeLine(true), true)}
            <div className="headSection" onClick={() => openTimeLineBar(!openTimeLine)}>
                {openTimeLine ? <KeyboardArrowDownIcon /> : <KeyboardArrowUpIcon />}TimeLine
            </div>
            {openTimeLine && <div className="bodySection">
                <TimeLineSlider
                    startTime={new Date(treeData.plannedStartDate)}
                    endTime={new Date(treeData.plannedEndDate)}
                    duration={treeData.plannedDuration}
                    onSliderChange={onSliderChange}
                    scale={scale}
                />
                <div className='scaleColor'>
                    <TimeLineScale 
                        startTime={new Date(treeData.plannedStartDate)}
                        endTime={new Date(treeData.plannedEndDate)}
                        handleScaleChange= {handleScaleChange}
                    />
                    <div className='statusList'>
                        {
                            Object.keys(statusColorNameMapping).map((status: string) => {
                                return <span key={status}>
                                    <span className="colorIndicator" style={{ background: statusColorNameMapping[status].color }} />
                                    {statusColorNameMapping[status].title}
                                </span>
                            })
                        }
                    </div>
                </div>
            </div>}
            {isUpdating && <div className="loading-info4">Updating Model...</div>}
        </div>
    );
}
