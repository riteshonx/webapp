import './DvaScriptUploadLanding.scss'
import React, { useContext, useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { stateContext } from '../../../../root/context/authentication/authContext';
import { bimContext } from '../../../contextAPI/bimContext';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import DvaScriptUploadList from '../DvaScriptUploadList/DvaScriptUploadList';

export default function DvaScriptUploadLanding(props: any) {
    const { dispatch, state }:any = useContext(stateContext);
    const context: any = useContext(bimContext);
    const history = useHistory();

    return (
        <div className={"dvaUploadLanding"}>
            <div className={'dvaSideBar'}>
                <div className={`menuIcons`}>
                    <ArrowBackIosIcon onClick={() => history.push('/')} viewBox={"-4 0 24 24"} fontSize={'small'} className='menuButton'/>
                    <div className={"dvasidescriptmanagement"}>
                    Script Management
                    </div>
                </div>                
            </div>
            <DvaScriptUploadList />
        </div>
    );
}
