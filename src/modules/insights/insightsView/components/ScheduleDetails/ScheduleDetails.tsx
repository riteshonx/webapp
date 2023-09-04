import React, { ReactElement, useContext } from "react";
import LinkIcon from "@material-ui/icons/Link";
import { IconButton } from "@material-ui/core";
import { InfoOutlined } from "@material-ui/icons";
import { styled } from '@mui/material/styles';
import { Tooltip, TooltipProps } from "@material-ui/core";
import { tooltipClasses } from "@mui/material";

import { insightsContext } from "src/modules/insights/context/insightsContext";
import { IInsightsContext } from "src/modules/insights/models/insights";
import { stateContext } from '../../../../root/context/authentication/authContext';

import { SCHEDULE_TASK_TABLE, IScheduleTableObject } from '../../../constant'
import ScheduleTask from "../ScheduleTask/ScheduleTask";

import './ScheduleDetails.scss'
function ScheduleDetails(): ReactElement {

    const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
        <Tooltip {...props} classes={{ popper: className }} />
    ))(() => ({
        [`& .${tooltipClasses.tooltip}`]: {
            backgroundColor: '#fff',
            color: 'rgba(0, 0, 0, 0.87)',
            maxWidth: 220,
            border: '0.5px solid rgba(0, 0, 0, 0.2)'
        },
        [`& .${tooltipClasses.tooltip} h5`]: {
            fontSize: '12px',
            marginBottom: '5px',
            color: 'var(--onx-A1)'
        },
        [`& .${tooltipClasses.tooltip} p`]: {
            fontSize: '10px',
            color: 'var(--onx-A2)'
        }
    }));

    const { insightsState, insightsDispatch } = useContext(insightsContext) as IInsightsContext
    const { state, dispatch }: any = useContext(stateContext);

    const goToTask = (id: string) => {
        const link = `/scheduling/project-plan/${state.currentProject.projectId}?task-id=${id}`
        window.open(link, '_blank');
    }

    const getTaskTable = (rule: string) => {
        return (<table>
            <thead>
                <tr>
                    {
                        (SCHEDULE_TASK_TABLE[rule] || []).map((object: IScheduleTableObject) =>
                            <th key={object.title} className="scheduleDetails__content__subject__table__header">{object.title}</th>
                        )
                    }
                </tr>
            </thead>
            <tbody>
                {
                    insightsState.detailSchedule.tasks.tasks.map((task, index) => {
                        return (
                            <tr key={`task-${index}`}>
                                {
                                    (SCHEDULE_TASK_TABLE[rule] || []).map((object: IScheduleTableObject, index: number) =>
                                        <td key={object.title + index} className="scheduleDetails__content__subject__table__data">
                                            {object.hasLink && <IconButton
                                                size="small"
                                                className="scheduleDetails__content__subject__table__data__btn"
                                                onClick={() => { goToTask(task[object.id]) }}
                                            >
                                                <LinkIcon
                                                    fontSize="inherit"
                                                    className="scheduleDetails__content__subject__table__data__btn__icon"
                                                />
                                            </IconButton>}
                                            {task[object.key] || '--'}
                                        </td>
                                    )
                                }
                            </tr>
                        )
                    })
                }
            </tbody>
        </table>)
    }

    const getTaskDetail = () => {
        return <div className="scheduleDetails__content__subject">
            <h4>Affected Schedule Items</h4>
            <div className="scheduleDetails__content__subject__table">
                {getTaskTable(insightsState.detailSchedule.ruleName.trim())}
            </div>
        </div>
    }

    if (insightsState.detailSchedule.id) {
        return (
            <div className="scheduleDetails">
                <h2 className="scheduleDetails__header">{insightsState.detailSchedule.title}</h2>
                <div className="scheduleDetails__content">

                    <HtmlTooltip
                        placement="left-start"
                        arrow
                        title={
                            <React.Fragment>
                                <p>
                                    AI driven insights based on schedule data and rules
                                </p>
                            </React.Fragment>
                        }
                    >
                        <InfoOutlined className="scheduleDetails__content__info"></InfoOutlined>
                    </HtmlTooltip>
                    {/* <div className="scheduleDetails__content__subject flex">
                        <h4>Rule Name:</h4>
                        <p className="scheduleDetails__content__subject__ruleName">
                            {insightsState.detailSchedule.ruleName}
                        </p>
                    </div> */}
                    <div className="scheduleDetails__content__subject">
                        <h4>Insight</h4>
                        <p>{insightsState.detailSchedule.msg}</p>
                    </div>

                    {(insightsState.detailSchedule.tasks.tasks
                        && insightsState.detailSchedule.tasks.tasks.length) > 0
                        && getTaskDetail()
                    }
                </div>
            </div>
        )
    } else {
        return <></>
    }
}
export default ScheduleDetails