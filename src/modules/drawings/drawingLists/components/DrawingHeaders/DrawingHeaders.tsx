import React, { ReactElement } from 'react';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import './DrawingHeaders.scss';
import Tooltip from '@material-ui/core/Tooltip';

export default function DrawingHeaders(props: any): ReactElement {
    const isNavigation = props.hasOwnProperty('navigate');
    return (
        <div className="drawings-header" style={props?.style}>
            <div className="drawings-header__navBack">
               {isNavigation && <ArrowBackIosIcon onClick={props.navigate}/>}
            </div>
            <div className="drawings-header__text">
                <h2>    
                    <Tooltip title={props?.headerInfo.name} aria-label="delete category">
                        <label>
                            { (props?.headerInfo.name && props?.headerInfo.name.length > 40) ? 
                            `${props?.headerInfo.name.slice(0, 37)} . . .`: `${props?.headerInfo.name}` }
                        </label>
                    </Tooltip>
                </h2>
                {/* <p>{props?.headerInfo.description}</p> */}
            </div>
        </div>
    )
}