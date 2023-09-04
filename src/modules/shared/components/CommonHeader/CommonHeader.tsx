import React, { ReactElement } from 'react';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import './CommonHeader.scss';
import Tooltip from '@material-ui/core/Tooltip';
import BackNavigation from '../BackNavigation/BackNavigation';


export default function SpecificationsHeader(props: any): ReactElement {
    const isNavigation = props.hasOwnProperty('navigate');
    return (
        <div className={isNavigation ? 'common-header' : 'common-header margin-left'}>
            <div className="common-header__navBack">
           { isNavigation && <ArrowBackIosIcon onClick={props?.navigate}/>}
            </div>
            <div className="common-header__text">
           {props?.headerInfo?.name && (
                   <h2>    
                   <Tooltip title={props?.headerInfo?.name} aria-label="delete category">
                       <label>
                           { (props?.headerInfo?.name && props?.headerInfo?.name.length > 40) ? 
                           `${props?.headerInfo?.name.slice(0, 37)} . . .`: `${props?.headerInfo?.name}` }
                       </label>
                   </Tooltip>
               </h2>
           )}
               {props?.headerInfo?.description &&(
                 <p>{props?.headerInfo?.description}</p>
               )}
            </div>
        </div>
    )
}
