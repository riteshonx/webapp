import React, { ReactElement } from 'react';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import './CompanyHeader.scss';

export default function CompanyHeader(props: any): ReactElement {
    return (
        <div className="company-header">
            <div className="company-header__navBack">
                <ArrowBackIosIcon onClick={props.navigate}/>
            </div>
            <div className="company-header__text">
                <h2>{props.headerInfo.name}</h2>
                <p>{props.headerInfo.description}</p>
            </div>
        </div>
    )
}
