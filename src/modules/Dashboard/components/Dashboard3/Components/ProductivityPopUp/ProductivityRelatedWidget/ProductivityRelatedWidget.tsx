import React, { ReactElement, useState, useEffect } from 'react'
import './ProductivityRelatedWidget.scss';
import { GET_ALL_RELATED_ITEM } from 'src/modules/Dashboard/components/Dashboard3/Graphql/Queries/dashboard3';
import { client } from 'src/services/graphql';
import { projectFeatureAllowedRoles } from 'src/utils/role'
import { CircularProgress } from '@material-ui/core';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import { postApi } from 'src/services/api';
import ProductivityPhotoGridWidget from '../ProductivityPhotoGridWidget/ProductivityPhotoGridWidget';

export const statusColorNameMapping: any = {
    "To-Do": {
        "title": "To-Do",
        "color": "#10554B"
    },
    "In-Progress": {
        "title": "In-Progress",
        "color": "#f0b44a"
    },
    "Completed": {
        "title": "Completed",
        "color": "#6BA366"
    },
    "Closed": {
        "title": "Closed",
        "color": "#E57569"
    },
    "OVERDUE": {
        "title": "Closed",
        "color": "#E57569"
    },
    "CLOSED": {
        "title": "Closed",
        "color": "#E57569"
    }
}

export default function ProductivityRelatedWidget(props: any): ReactElement {

    const [tabelData, setTabelData] = useState<any>(null);
    const [attachmentsList, setAttachmentsList] = useState<any>(null);
    const [isLoading, setIsLoading] = useState<any>(false);
    const [infoMsg, setInfoMsg] = useState<any>('');

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
            const varible = props.type === 'costCode' ? {
                classificationCodeId: props.id,
                taskId: null
            } : {
                classificationCodeId: null,
                taskId: props.id
            }
            const metricResponse = await client.query({
                query: GET_ALL_RELATED_ITEM,
                variables: varible,
                fetchPolicy: 'network-only',
                context: {
                    role: projectFeatureAllowedRoles.viewMasterPlan,
                    token: props.projectToken,
                },
            });
            if (metricResponse?.data?.ProjectTasks && metricResponse?.data?.ProjectTasks) {
                const { attachments, tabledta } = metricResponse?.data?.ProjectTasks.reduce((result: any, taskInfo: any) => {
                    if (props.type === 'costCode') {
                        const atculPrdvty = taskInfo.productivityMetrics[0] ? taskInfo.productivityMetrics[0].actualProductivity : '-'
                        result.tabledta.push({ taskId: taskInfo.id, taskName: taskInfo.taskName, status: taskInfo.status, actualProductivity: atculPrdvty })
                    } else {
                        taskInfo?.formTaskLinks.map((formData: any) => {
                            result.tabledta.push({ formId: formData.formId, title: formData.form.formsData[0].valueString, status: formData.form.formStatus.status })
                        })
                    }
                    taskInfo.taskTimesheetEntries.map((entries: any) => result.attachments.push(...entries.attachments))
                    result.attachments.push(...taskInfo.attachments)
                    return result;
                }, { attachments: [], tabledta: [] })
                attachments.sort((a: any, b: any) => { return new Date(b.createdAt).valueOf() - new Date(a.createdAt).valueOf() });
                const payloadObj = attachments.map((att: any) => { return { key: att.blobKey, expiresIn: 604800 } })
                const response = await postApi('V1/S3/downloadLink', payloadObj);
                setAttachmentsList(attachments.map((att: any, index: number) => { return { ...att, ...response.success[index] } }));
                setTabelData(tabledta);
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

    return (
        <div className="productivity-related-widget">
            <div className='productivity-related-content'>
                <div className='prdt-metc-tbl-ctr'>
                    <table className="prdt-metc-tbl">
                        <thead className="prod-thead">
                            {props.type === 'costCode' ? <tr>
                                <td>Schedule Tasks</td>
                                <td>Avarage M/LH</td>
                                <td>Status</td>
                            </tr> : <tr>
                                <td>Linked Forms ({tabelData? tabelData.length : 0})</td>
                                <td>Status</td>
                            </tr>}
                        </thead>
                        <tbody>
                            {
                                tabelData?.map((data: any, index: number) => {
                                    return props.type == 'costCode' ?
                                        <tr key={"metric-" + index} className="costCode-row">
                                            <td>
                                                <span>
                                                    {data.taskName || ''}
                                                    <a href={`/scheduling/project-plan/${props.projectId}?task-id=${data.taskId}`} target="_blank" >
                                                        <OpenInNewIcon />
                                                    </a>
                                                </span>
                                            </td>
                                            <td>{data.actualProductivity || ''}</td>
                                            <td style={{ "color": statusColorNameMapping[data.status] ? statusColorNameMapping[data.status].color : undefined }}>{data.status || ''}</td>
                                        </tr> :
                                        <tr key={"metric-" + index}>
                                            <td>
                                                <span>
                                                    {data.title || ''}
                                                    <a href={`/base/projects/${props.projectId}/form/2/view/${data.formId}`} target="_blank" >
                                                        <OpenInNewIcon />
                                                    </a>
                                                </span>
                                            </td>
                                            <td style={{ "color": statusColorNameMapping[data.status] ? statusColorNameMapping[data.status].color : undefined }}>{data.status || ''}</td>
                                        </tr>
                                })
                            }
                            {tabelData?.length === 0 && <tr><td colSpan={props.type === 'costCode' ? 3 : 2}>No data found</td></tr>}
                        </tbody>
                    </table>
                </div>
                <ProductivityPhotoGridWidget photoList={attachmentsList} />
            </div>
            {!tabelData &&
                <div className="productivity-related-load-widget">
                    {isLoading ? <CircularProgress color="inherit" /> : infoMsg}
                </div>
            }
        </div>
    )
}
