import React, { ReactElement } from 'react';
import './ProjectSettingsHeader.scss';

export default function ProjectSettingsHeader(props: any): ReactElement {
    return (
        <div className="header-wrapper">
            <div className="header-wrapper__text">
                {props.header}
            </div>
        </div>
    )
}
