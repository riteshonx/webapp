import React, { ReactElement, useState, useContext, useEffect } from 'react'
import './ProductivityInsightWidget.scss';
import { client } from 'src/services/graphql';
import { projectFeatureAllowedRoles } from 'src/utils/role'
import { CircularProgress } from '@material-ui/core';
import { GET_ALL_IMPACTED_SCHEDULE_BY_CLASSIFICATION_CODE, GET_ALL_IMPACTED_SCHEDULE_BY_TASK_ID } from 'src/modules/Dashboard/components/Dashboard3/Graphql/Queries/dashboard3';
interface ScheduleImpactMsgs {
    msg: string;
    type: string;
    priority: string;
    floatValue: number;
}
export default function ProductivityInsightWidget(props: any): ReactElement {
    const [insightData, setInsightData] = useState<Array<ScheduleImpactMsgs>>([]);
    const [isLoading, setIsLoading] = useState<any>(false);
    const [infoMsg, setInfoMsg] = useState<any>('');

    useEffect(() => {
        props.id && fetchInsightData();
    }, [])

    useEffect(() => {
        props.id && fetchInsightData();
    }, [props.id])

    const fetchData = async (query: any, variables: any) => {
        setInsightData([])
        const responseData = await client.query({
            query: query,
            variables: variables,
            fetchPolicy: 'network-only',
            context: { role: projectFeatureAllowedRoles.viewMasterPlan, token: props.projectToken, }
        });
        return responseData?.data;
    }

    const fetchInsightData = async () => {
        setIsLoading(true)
        try {
            let res
            if (props.type === 'costCode') {
                res = await fetchData(GET_ALL_IMPACTED_SCHEDULE_BY_CLASSIFICATION_CODE, {
                    classificationCodeId: props.id
                })
            } else {
                res = await fetchData(GET_ALL_IMPACTED_SCHEDULE_BY_TASK_ID, {
                    taskId: props.id
                })
            }
            const InsightData = [] as Array<ScheduleImpactMsgs>
            res.projectTask.forEach((taskElement: any) => {
                taskElement?.projectScheduleImpactInsights.forEach((element: any) => {
                    element.messages_web.msgs.forEach((msg: string) => {
                        const obj = {} as ScheduleImpactMsgs
                        obj.msg = msg
                        obj.type = element.type
                        obj.priority = element.priority
                        obj.floatValue = taskElement.floatValue
                        InsightData.push(obj)
                    })
                })
            })
            setIsLoading(false)
            if (InsightData.length) {
                setInsightData(InsightData)
            } else {
                setInfoMsg('No Insight Found')
            }
        } catch {
            setIsLoading(false)
            setInfoMsg('Some error on fetching data')
        }
    }
    return (
        <div className="productivity-insight-widget">
            {insightData.length ?
                <div className="productivity-insight-widget-container">
                    {
                        insightData.map((insight: ScheduleImpactMsgs, index: number) => {
                            return <div
                                key={`insight-${index}`}
                                className={'priority-' + insight.priority}
                                dangerouslySetInnerHTML={{ __html: insight.msg }}></div>
                        })
                    }
                </div>
                : <div className="productivity-insight-load-widget">
                    {isLoading ? <CircularProgress color="inherit" /> : infoMsg}
                </div>
            }
        </div>
    )
}
