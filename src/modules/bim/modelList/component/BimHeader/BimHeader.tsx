import React, { ReactElement } from 'react'
import './BimHeader.scss';

export default function BimHeader(props: any): ReactElement {
    return (
        <div className="bim-info">
            <div className="bim-info__description">
                {props.children}
                <div>{props.description}</div>
            </div>
        </div>
    )
}
