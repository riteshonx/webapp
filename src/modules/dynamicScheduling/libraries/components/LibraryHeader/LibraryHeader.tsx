import React, { ReactElement } from 'react'
import BackNavigation from '../../../../shared/components/BackNavigation/BackNavigation';
import './LibraryHeader.scss';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function LibraryHeader(props: any): ReactElement {
    const isNavigation = props.hasOwnProperty('navigate');
    return (
        <div className="lib-info">
           <div className="lib-info__header">
           {isNavigation && <BackNavigation navBack={"/"}/>}
                {props?.header?.name}
           </div>
           <div className="lib-info__description">
                {props?.header?.description}
           </div>
        </div>
    )
}
