import React, { ReactElement } from "react";

import './ScheduleCard.scss'

function ScheduleCard(props: any): ReactElement {
    return (
        <div onClick={props.onClick} className={`scheduleCard ${props.open && 'open'}`}>
            <h3 className="scheduleCard__title">{props.data.title}</h3>
            <p className="scheduleCard__description">
                {props.data.msg}
            </p>
        </div>
    )
}

export default ScheduleCard