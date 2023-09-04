import React, { ReactElement } from 'react'
import BackNavigation from '../../../../shared/components/BackNavigation/BackNavigation';
import './BimHeader.scss';

export default function BimHeader(props: any): ReactElement {
    return (
        <div className="bim-info">
           <div className="bim-info__description">
                {props.description}
           </div>
        </div>
    )
}
