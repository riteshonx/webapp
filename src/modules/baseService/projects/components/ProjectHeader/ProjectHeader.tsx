import React, { ReactElement} from 'react';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import './ProjectHeader.scss';


export default function ProjectHeader(props: any): ReactElement {

    return (
        <div className="project-header">
            <div className="project-header__navBack">
                <ArrowBackIosIcon onClick={props.navigate}/>
            </div>
            <div className="project-header__text">
                <h2>{props.headerInfo.name}</h2>
                <p>{props.headerInfo.description}</p>
            </div>
        </div>
    )
}
