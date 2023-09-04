import React, { useContext, useEffect, useState } from 'react';
import './BimGalleryView.scss'
import VisibilityIcon from '@material-ui/icons/Visibility'
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import { stateContext } from '../../../../root/context/authentication/authContext';
import { Tooltip } from '@material-ui/core';
import InfoIcon from '@material-ui/icons/Info';
import { viewNameMapping } from '../../../constants/query'

export default function BimGalleryView(props: any) {
    const { dispatch, state }:any = useContext(stateContext);
    const [views,setViews] = useState([]);
    const { items, search } = props;

    useEffect(()=>{
        if(search){
            const filteredViews = props.items.filter((view:any)=>{
                return view.viewName.toLowerCase().includes(search.toLowerCase())
            });
            setViews(filteredViews);
        }else{
            setViews(props.items);
        }
    },[setViews,items, search]);

    return (
        views.length === 0 ? <div className="bimNoViews">Hi, you have no saved views.</div>: 
            <div className="bimGallery">
                {views.map((item: any, index: number) => {
                    return (
                        <div key={item.id} className="galryItem">
                            <div className={'thumbnail' +  ((item.id === props.selectedItem) ? ' active' : '')} >
                                {props.showEditOptn ? 
                                    <div className={"operations"}>
                                        <Tooltip title="Open view" aria-label="Open view">
                                            <VisibilityIcon onClick={() =>props.setSelected(item.id)} fontSize={'small'} />
                                        </Tooltip>
                                        {state.projectFeaturePermissons?.cancreateBimModel && state.projectFeaturePermissons?.canupdateBimModel ?
                                            <>
                                                <Tooltip title="Edit view" aria-label="Edit view">
                                                    <EditIcon fontSize={'small'} onClick={() =>{props.setSelected(item.id); props.onDobleClick && props.onDobleClick(false);}} /> 
                                                </Tooltip>
                                                <Tooltip title="View element attributes" aria-label="Open view">
                                                    <InfoIcon onClick={() => {props.openElementTable(item.id)}} fontSize={'small'} />
                                                </Tooltip>
                                                <Tooltip title="Delete view" aria-label="Delete view">
                                                    <DeleteIcon fontSize={'small'}  onClick={() => props.onDelete(index)} /> 
                                                </Tooltip>
                                            </>: null 
                                        }
                                    </div>
                                    : <div className={"operations"}>
                                        <Tooltip title="Open view" aria-label="Open view">
                                            <VisibilityIcon onClick={() =>props.setSelected(item.id)} fontSize={'small'} />
                                        </Tooltip>
                                        {
                                            item.id !== "3dview" && item.id !== 'sheet' &&  <Tooltip title="View element attributes" aria-label="Open view">
                                                <InfoIcon onClick={() => {props.openElementTable(item.id)}} fontSize={'small'} />
                                            </Tooltip>
                                        }
                                    </div> 
                                }
                                {(item.id === props.selectedItem) ?<VisibilityIcon fontSize={'small'} className={"viewIcon"} style={{ fill: "white" }} /> : null }
                                {(item.viewThumbnail) ? <img src={item.viewThumbnail} /> : <div className='iconImg'><div className="title">{viewNameMapping[item.viewName] || item.viewName}</div></div> }
                            </div>
                            <div className="title" title={viewNameMapping[item.viewName] || item.viewName}>{viewNameMapping[item.viewName] || item.viewName}</div>
                        </div>
                    )
                })}
            </div>
    );
}