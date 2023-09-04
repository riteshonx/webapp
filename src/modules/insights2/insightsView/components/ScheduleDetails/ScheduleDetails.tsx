import React, { ReactElement, useContext, useState } from "react";
import LinkIcon from "@material-ui/icons/Link";
import { IconButton } from "@material-ui/core";
import { InfoOutlined } from "@material-ui/icons";
import { styled } from '@mui/material/styles';
import { Tooltip, TooltipProps } from "@material-ui/core";
import { tooltipClasses } from "@mui/material";
import { stateContext } from '../../../../root/context/authentication/authContext';

import { SCHEDULE_TASK_TABLE, IScheduleTableObject } from '../../../constant'

import './ScheduleDetails.scss'
import { Schedule } from "src/modules/insights2/models/insights";
import { Popover } from "src/modules/Dashboard/components/Common";
import { Task } from "src/modules/Dashboard/components/Feeds/forms/task";
function ScheduleDetails({ detailSchedule }: {detailSchedule: Schedule}): ReactElement {

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
    const { state }: any = useContext(stateContext);
    const [taskPopover, setTaskPopover] = useState({
        taskId: '',
        open: false,
        updateCount: 0,
        box: {
            top: 0,
            left: 0,
            height: 0,
            width: 0
        }
    })

    const goToTask = (e: any, taskId: string) => {
        closePopover()
        const target = e.target
        setTaskPopover({
            taskId: taskId,
            open: true,
            updateCount: 0,
            box: target.getBoundingClientRect()
        })
    }

    const onTaskDetailDataLoad = () => {
        setTaskPopover({
            taskId: taskPopover.taskId,
            open: taskPopover.open,
            updateCount: taskPopover.updateCount + 1,
            box: taskPopover.box
        })
    }

    const closePopover = () => {
        setTaskPopover({
            taskId: '',
            updateCount: 0,
            open: false,
            box: {
                top: 0,
                left: 0,
                height: 0,
                width: 0
            }
        })
    }
 
    const getTaskTable = (rule: string) => {
        return (<table>
            <thead>
                <tr>
                    {
                        (SCHEDULE_TASK_TABLE[rule] || []).map((object: IScheduleTableObject) =>
                            <th key={object.title} className="v2-scheduleDetails__content__subject__table__header">{object.title}</th>
                        )
                    }
                </tr>
            </thead>
            <tbody>
                {
                    detailSchedule.tasks.tasks.map((task, index) => {
                        return (
                            <tr key={`task-${index}`}>
                                {
                                    (SCHEDULE_TASK_TABLE[rule] || []).map((object: IScheduleTableObject, index: number) =>

                                        <td key={object.title + index} className="v2-scheduleDetails__content__subject__table__data">
                                            {object.hasLink && <IconButton
                                                size="small"
                                                className="v2-scheduleDetails__content__subject__table__data__btn"
                                                onClick={(e) => goToTask(e, task[object.id])}
                                            >
                                                <LinkIcon
                                                    fontSize="inherit"
                                                    className="v2-scheduleDetails__content__subject__table__data__btn__icon"
                                                />
                                            </IconButton>}
                                           {object.key === "Preceeding task" || object.key === "Succeeding task" || object.key === "Activity Name"
                                           ? `${task[object?.externalId] || ''}${task[object?.externalId] ? ' : ' : ''}`
                                           : ''}
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
        return <div className="v2-scheduleDetails__content__subject">
            {/* <h4>Affected Schedule Items</h4> */}
            <div className="v2-scheduleDetails__content__subject__table">
                {getTaskTable(detailSchedule.ruleName.trim())}
            </div>
        </div>
    }

    if (detailSchedule.id) {
        return (
            <div className="v2-scheduleDetails">
                <h2 className="v2-scheduleDetails__header">{detailSchedule.title}</h2>
                <div className="v2-scheduleDetails__content">

                    {/* <HtmlTooltip
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
                        <InfoOutlined className="v2-scheduleDetails__content__info"></InfoOutlined>
                    </HtmlTooltip> */}
                    {/* <div className="v2-scheduleDetails__content__subject flex">
                        <h4>Rule Name:</h4>
                        <p className="v2-scheduleDetails__content__subject__ruleName">
                            {detailSchedule.ruleName}
                        </p>
                    </div> */}
                    <div className="v2-scheduleDetails__content__subject">
                        {/* <h4>Insight</h4> */}
                        <p>{detailSchedule.msg}</p>
                    </div>

                    {(detailSchedule.tasks.tasks
                        && detailSchedule.tasks.tasks.length) > 0
                        && getTaskDetail()
                    }
                </div>
                <Popover
                    trigger={<></>}
                    position="top-right"
                    foreignTrigger={true}
                    foreignTargetBox={taskPopover.box as DOMRect}
                    open={taskPopover.open}
                    reRender={taskPopover.updateCount}
                >
                    <Task
                        taskId={taskPopover.taskId}
                        onClose={closePopover}
                        onDataLoad={onTaskDetailDataLoad}
                    ></Task>
                </Popover>
            </div>
        )
    } else {
        return <></>
    }
}
export default ScheduleDetails