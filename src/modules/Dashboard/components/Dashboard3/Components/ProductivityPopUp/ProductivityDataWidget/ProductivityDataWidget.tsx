import React, { ReactElement, useState, useEffect } from 'react'
import './ProductivityDataWidget.scss';
import { GET_DAILY_PRODUCTIVITY_METRIC, GET_DAILY_TASK_LIST } from 'src/modules/Dashboard/components/Dashboard3/Graphql/Queries/dashboard3';
import { client } from 'src/services/graphql';
import { projectFeatureAllowedRoles } from 'src/utils/role'
import { CircularProgress } from '@material-ui/core';

export default function ProductivityDataWidget(props: any): ReactElement {

    const [tabelData, setTabelData] = useState<any>(null);
    const [expandTabelData, setExpandTabelData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState<any>(false);
    const [infoMsg, setInfoMsg] = useState<any>('');
    const [expndIndex, setExpndIndex] = useState<any>(-1);

    useEffect(() => {
        props.id && fetchProjectDetails();
    }, [])

    useEffect(() => {
        props.id && fetchProjectDetails();
    }, [props.id])

    const fetchProjectDetails = async () => {
        try {
            setIsLoading(true);
            setTabelData(null);
            setExpndIndex(-1);
            const varible = props.type === 'costCode' ? {
                dimension: "DAILYCLASSCODE",
                classificationCodeId: props.id,
                taskId: null
            } : {
                dimension: "DAILYTASK",
                classificationCodeId: null,
                taskId: props.id
            }
            const metricResponse = await client.query({
                query: GET_DAILY_PRODUCTIVITY_METRIC,
                variables: varible,
                fetchPolicy: 'network-only',
                context: {
                    role: projectFeatureAllowedRoles.viewMasterPlan,
                    token: props.projectToken,
                },
            });
            if (metricResponse?.data?.ProductivityMetrics && metricResponse?.data?.ProductivityMetrics) {
                setTabelData(metricResponse?.data?.ProductivityMetrics);
            } else {
                setInfoMsg('No data Found')
            }
            setIsLoading(false);
        } catch (error) {
            console.log(error);
            setInfoMsg('Some error on fetching data')
            setIsLoading(false);
        }
    };

    const getDailyTaskList = async (index: number, date: string) => {
        try {
            if (expndIndex === index) {
                setExpandTabelData(null);
                setExpndIndex(-1);
                return;
            } 
            setIsLoading(true);
            setExpandTabelData(null);
            const varible = props.type === 'costCode' ? {
                classificationCodeId: props.id,
                taskId: null,
                dailylogDate: date,
            } : {
                classificationCodeId: null,
                taskId: props.id,
                dailylogDate: date,
            }
            const metricResponse = await client.query({
                query: GET_DAILY_TASK_LIST,
                variables: varible,
                fetchPolicy: 'network-only',
                context: {
                    role: projectFeatureAllowedRoles.viewMasterPlan,
                    token: props.projectToken,
                },
            });
            if (metricResponse?.data?.projectTask && metricResponse?.data?.projectTask) {
                setExpandTabelData(metricResponse?.data?.projectTask);
                setExpndIndex(index)
            }
            setIsLoading(false);
        } catch (error) {
            console.log(error);
            setIsLoading(false);
        }
    };


    return (
        <div className="productivity-data-widget">
            <table className="prdt-metc-tbl">
                <thead className="prod-thead">
                    <tr>
                        <td className='context'>Context</td>
                        <td>Date</td>
                        <td>QTY</td>
                        <td>UOM</td>
                        <td>Hours</td>
                        <td>Units/LH</td>
                        <td>Total QTY</td>
                        <td>Total HRS</td>
                        <td>Avg Units / LH</td>
                    </tr>
                </thead>
                <tbody>
                    {
                        tabelData?.map((dailyData: any, index: number) => {
                            return <React.Fragment key={"metric-" + index}>
                                <tr onClick={() => getDailyTaskList(index, dailyData.dailylogDate)} className='clickable'>
                                    <td className='context'>{dailyData.variancesCount ? <span className="variances-dot"></span> : ''}</td>
                                    <td>{dailyData.dailylogDate || ''}</td>
                                    <td>{dailyData.dailyQty || ''}</td>
                                    <td>{dailyData.classificationCode?.UOM || ''}</td>
                                    <td>{dailyData.dailyHrs || ''}</td>
                                    <td>{dailyData.dailyProductivity || ''}</td>
                                    <td>{dailyData.actualQty || ''}</td>
                                    <td>{dailyData.actualHrs || ''}</td>
                                    <td>{dailyData.actualProductivity || ''}</td>
                                </tr>
                                {expndIndex == index && expandTabelData &&
                                    expandTabelData.map((taskData: any, index: number) => {
                                        return <React.Fragment key={"task-" + index}>
                                            <tr>
                                                {index === 0 && <td rowSpan={4 * expandTabelData.length}></td>}
                                                <td className='subTitle'>{taskData.taskName|| ''}</td>
                                                <td>{taskData.productivityMetrics[0] && taskData.productivityMetrics[0].dailyQty || ''}</td>
                                                <td>{taskData.productivityMetrics[0] && taskData.productivityMetrics[0].classificationCode?.UOM || ''}</td>
                                                <td>{taskData.productivityMetrics[0] && taskData.productivityMetrics[0].dailyHrs || 0}</td>
                                                <td>{taskData.productivityMetrics[0] && taskData.productivityMetrics[0].dailyProductivity || ''}</td>
                                                <td>{taskData.productivityMetrics[0] && taskData.productivityMetrics[0].actualQty || ''}</td>
                                                <td>{taskData.productivityMetrics[0] && taskData.productivityMetrics[0].actualHrs || 0}</td>
                                                <td>{taskData.productivityMetrics[0] && taskData.productivityMetrics[0].actualProductivity || ''}</td>
                                            </tr>
                                            <tr>
                                                <td></td>
                                                <td className='sub-bg subTitle'>Daily Log Comment:</td>
                                                <td className='sub-bg' colSpan={4}>{
                                                    taskData.taskTimesheetEntries[0] && taskData.taskTimesheetEntries[0].comments[0] 
                                                    && taskData.taskTimesheetEntries[0].comments[0].comment || '-'}
                                                </td>
                                                <td className='sub-bg' colSpan={2}>
                                                    <u>Attached Photos</u>:&nbsp;
                                                    {taskData.taskTimesheetEntries[0] && taskData.taskTimesheetEntries[0].attachments.length || 0}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td align='center'></td>
                                                <td className='sub-bg subTitle'>Varience</td>
                                                <td className='sub-bg' colSpan={4}>{taskData.projectTaskVariances[0] && taskData.projectTaskVariances[0].varianceName || '-'}</td>
                                                <td className='sub-bg' colSpan={2}>
                                                    <u>Type</u>:&nbsp;
                                                    {taskData.projectTaskVariances[0] && taskData.projectTaskVariances[0].category || '-'}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td></td>
                                                <td className='sub-bg subTitle'>Forms</td>
                                                <td className='sub-bg' colSpan={4}>{taskData.formTaskLinks[0] && 
                                                    taskData.formTaskLinks[0].form.formsData[0] && taskData.formTaskLinks[0].form.formsData[0].valueString || '-'}</td>
                                                <td className='sub-bg' colSpan={2}>
                                                    <u>Status</u>:&nbsp;
                                                    {taskData.formTaskLinks[0] && taskData.formTaskLinks[0].form.formStatus.status || '-'}
                                                </td>
                                            </tr>
                                        </React.Fragment>
                                    }
                                    )}
                                {/* {expndIndex == index && (props.type === 'costCode' ? <>
                                    <tr>
                                        <td rowSpan={4}></td>
                                        <td className='subTitle'>Pile 104</td>
                                        <td>{dailyData.dailyQty || ''}</td>
                                        <td>{dailyData.classificationCode?.UOM || ''}</td>
                                        <td>{dailyData.dailyHrs || ''}</td>
                                        <td>{dailyData.dailyProductivity || ''}</td>
                                        <td>{dailyData.actualQty || ''}</td>
                                        <td>{dailyData.actualHrs || ''}</td>
                                        <td>{dailyData.actualProductivity || ''}</td>
                                    </tr>
                                    <tr>
                                        <td></td>
                                        <td className='sub-bg subTitle'>Daily Log Comment:</td>
                                        <td className='sub-bg' colSpan={4}></td>
                                        <td className='sub-bg' colSpan={2}></td>
                                    </tr>
                                    <tr>
                                        <td></td>
                                        <td className='sub-bg subTitle'>Varience</td>
                                        <td className='sub-bg' colSpan={4}></td>
                                        <td className='sub-bg' colSpan={2}></td>
                                    </tr>
                                    <tr>
                                        <td></td>
                                        <td className='sub-bg subTitle'>Forms</td>
                                        <td className='sub-bg' colSpan={4}></td>
                                        <td className='sub-bg' colSpan={2}></td>
                                    </tr>
                                </> : <>
                                    <tr>
                                        <td rowSpan={7}></td>
                                        <td></td>
                                        <td className='sub-bg subTitle'>Daily Log Comment:</td>
                                        <td className='sub-bg' colSpan={4}></td>
                                        <td className='sub-bg' colSpan={2}></td>
                                    </tr>
                                    <tr>
                                        <td></td>
                                        <td className='sub-bg subTitle'>Varience</td>
                                        <td className='sub-bg' colSpan={4}></td>
                                        <td className='sub-bg' colSpan={2}></td>
                                    </tr>
                                    <tr>
                                        <td></td>
                                        <td className='sub-bg subTitle'>Forms</td>
                                        <td className='sub-bg' colSpan={4}></td>
                                        <td className='sub-bg' colSpan={2}></td>
                                    </tr>
                                    <tr>
                                        <td className='subTitle vetrical-Text' rowSpan={4}>Labour</td>
                                        <td ><u>Worker Type</u></td>
                                        <td colSpan={4}><u>Name</u></td>
                                        <td colSpan={2}><u>Hours (Regular/OT/DT)</u></td>
                                    </tr>
                                    <tr>
                                        <td className='sub-bg'>Foreman</td>
                                        <td className='sub-bg' colSpan={4}></td>
                                        <td className='sub-bg' colSpan={2}></td>
                                    </tr>
                                    <tr>
                                        <td className='sub-bg'>Laborer</td>
                                        <td className='sub-bg' colSpan={4}></td>
                                        <td className='sub-bg' colSpan={2}></td>
                                    </tr>
                                    <tr>
                                        <td className='sub-bg'>Laborer</td>
                                        <td className='sub-bg' colSpan={4}></td>
                                        <td className='sub-bg' colSpan={2}></td>
                                    </tr>
                                </>)} */}
                            </React.Fragment>
                        })
                    }
                </tbody>
            </table>
            {!tabelData &&
                <div className="productivity-data-load-widget">
                    {isLoading ? <CircularProgress color="inherit" /> : infoMsg}
                </div>
            }
        </div>
    )
}
