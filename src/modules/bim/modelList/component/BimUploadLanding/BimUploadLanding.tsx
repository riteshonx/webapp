import './BimUploadLanding.scss'
import React from 'react';
import BimUploadList from '../BimUploadList/BimUploadList';

export default function BimUploadLanding(props: any) {
    return (
        <div className={"bimUploadLanding"}>
            <BimUploadList />
        </div>
    );
}
