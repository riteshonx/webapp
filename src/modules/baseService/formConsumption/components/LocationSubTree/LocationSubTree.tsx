import {Checkbox, IconButton } from '@material-ui/core';
import React, { ReactElement, useContext, useEffect, useState } from 'react'
import { LocationNode } from '../../../projectSettings/models/location';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { locationTreeContext } from '../../Context/projectContext';

function LocationSubTree(props: any): ReactElement {
    const { handleChange, applyChanges, currentValue }: any = useContext(locationTreeContext);
    const [currentItem, setcurrentItem] = useState<any>(null);

    useEffect(() => {
       setcurrentItem(props.item);
    }, [props.item])

    const toggleNestedChildView=(argIndex: number)=>{
        currentItem.childNodes[argIndex].isOpen= !currentItem.childNodes[argIndex].isOpen;
        applyChanges();
    }


    return (
        <>
           {props.item.childNodes.map((subitem: LocationNode, subItemIndex: number)=>
            <div key={subitem.id} className="locationtreeChildNode">
                <div className="locationtreeChildNode__item">
                    {subitem.childNodes.length>0?(
                        subitem.isOpen?(
                            <IconButton className="locationtreeChildNode__item__btn"
                                onClick={()=>toggleNestedChildView(subItemIndex)}>
                                <ExpandMoreIcon/>
                            </IconButton>):((
                            <IconButton className="locationtreeChildNode__item__btn"
                                onClick={()=>toggleNestedChildView(subItemIndex)}>
                                <ChevronRightIcon/>
                                </IconButton>))
                    ):("")}
                    <Checkbox
                                color="default"
                                checked={subitem.id=== currentValue}
                                onChange={()=>handleChange(subitem.id)}
                                inputProps={{ 'aria-label': 'primary checkbox' }}
                    />
                    {subitem.nodeName}
                </div>
                {subitem.isOpen?(
                     <LocationSubTree index={subItemIndex} item={subitem}/>      
                ):("")}
            </div>)}
        </>
    )
}

export default React.memo(LocationSubTree);