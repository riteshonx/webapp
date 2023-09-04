import React, { ReactElement } from "react";

import './ScheduleCard.scss'

function ScheduleCard(props: any): ReactElement {
    return (
        <div onClick={props.onClick} className={`v2-scheduleCard ${props.open && 'open'}`}>
            <h3 className="v2-scheduleCard__title">{props.data.title}</h3>
            <p className="v2-scheduleCard__description">
                {props.data.msg}
            </p>
        </div>
    )
}

export default ScheduleCard