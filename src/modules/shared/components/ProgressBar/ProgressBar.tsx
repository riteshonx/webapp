import React, { ReactElement } from 'react';
import './ProgressBar.scss';

interface Props {
    total: number;
    value: number;
}

export default function ProgressBar(props: Props): ReactElement {
    return (
        <div className="progress-bar">
           <div className='fill-portion' style={{width: `${(props.value/props.total) * 100}%`}}></div>
        </div>
    )
}
