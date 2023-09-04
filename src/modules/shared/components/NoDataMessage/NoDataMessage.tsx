import React, { ReactElement } from 'react';
import './NoDataMessage.scss'

export default function NoDataMessage(props: any): ReactElement {
    return (
        <div className="no-data">
            <div className="no-data__message">{props.message}</div>
        </div>
    )
}
