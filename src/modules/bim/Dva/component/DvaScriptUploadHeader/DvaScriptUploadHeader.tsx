import React, { ReactElement } from 'react'
import './DvaScriptUploadHeader.scss';

export default function DvaScriptUploadHeader(props: any): ReactElement {
    return (
        <div className="dva-info">
            <div className="dva-info__description">
                {props.children}
                <div>{props.description}</div>
            </div>
        </div>
    )
}
