import React, { ReactElement } from "react";

import './ScheduleImpactCard.scss'
const TASK_PRIORITY_HIGH = 'High'
const TASK_PRIORITY_MEDIUM = 'Medium'
function ScheduleImpactCard(props: any): ReactElement {
    return (
        <div onClick={props.onClick} className={`scheduleImpactCard ${props.open && 'open'}`}>
            <h3 className="scheduleImpactCard__title">{props.data.taskName}</h3>
            <div className="scheduleImpactCard__footer">
                <p className="scheduleImpactCard__description">
                    {new Date(props.data.plannedStartDate).toDateString().substring(4)}
                </p>
                <div className="scheduleImpactCard__float">
                    {
                        props.data.priority === TASK_PRIORITY_MEDIUM ?
                            (
                                <span className="medium" >Remaining Float {props.data.remainingFloat} Days</span>
                            ) : props.data.priority === TASK_PRIORITY_HIGH
                                ? props.data.early > props.data.delay
                                    ? <span className="early">Early {props.data.early} Days</span>
                                    : <span className="critical"> Delayed {props.data.delay} Days, Total Float {props.data.floatValue} Days </span>
                                : <span className="normal" >Float {props.data.floatValue} Days</span>
                    }
                </div>
            </div>
        </div>
    )
}

export default ScheduleImpactCard