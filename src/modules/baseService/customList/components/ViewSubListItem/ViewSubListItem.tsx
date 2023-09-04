import { IconButton, Tooltip } from '@material-ui/core';
import React, { ReactElement, useContext } from 'react';
import { customListCreateUpdateContext } from '../../context/createUpdateList/customListContext';
import { ConfigListItem } from '../../models/customList';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import { setListOfConfigValues } from '../../context/createUpdateList/customListActiions';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import './ViewSubListItem.scss';

interface Props {
    currentNode: ConfigListItem,
    index: string,
    relationShip: string,
    isEdit: boolean
}

export interface Params {
    id: string;
}


export function ViewSubListItem({currentNode,index,relationShip, isEdit}: Props): ReactElement {
    const { customListState, customListDispatch }:any = useContext(customListCreateUpdateContext);

    const closeCurrentItem = (argIndex: number) =>{
        if(relationShip==='PARENT'){
            const items= [...customListState.listOfConfigValues];
            items[Number(index)].childItems[argIndex].isOpen= false;
            customListDispatch(setListOfConfigValues(items));
        }
    }

    const openCurrentItem = (argIndex: number) =>{
        if(relationShip==='PARENT'){
            const items= [...customListState.listOfConfigValues];
            items[Number(index)].childItems[argIndex].isOpen= true;
            customListDispatch(setListOfConfigValues(items));
        }
    }

    return (
        <div className="SubListItem">
            {
                currentNode.childItems.map((item: ConfigListItem,childIndex: number)=>(
                    <div key={`${item.id}`}>
                        <div key={`CreateCustomList-${item.id}`} className={`SubListItem__item ${item.childItems.length==0?'nochild':''}`}>
                            <div className="SubListItem__item__left">
                                {item.childItems.length>0?(
                                relationShip!== 'CHILD'?(item.isOpen?(
                                        <IconButton className="SubListItem__item__left__btn" data-testid={`sublist-close-${currentNode.id}`}
                                            onClick={()=>closeCurrentItem(childIndex)}>
                                                <KeyboardArrowDownIcon/>
                                        </IconButton>
                                        ):(
                                        <Tooltip title="Click to view child items" aria-label="view child">
                                            <IconButton onClick={()=>openCurrentItem(childIndex)} data-testid={`sublist-add-${currentNode.id}`}
                                                className="SubListItem__item__left__btn">
                                                <KeyboardArrowRightIcon/>
                                            </IconButton>
                                        </Tooltip>
                                        )):("")):("")
                                }
                                <div className={`SubListItem__item__label ${item.isOpen?'active':''} ${relationShip=== 'CHILD'?'child':''}`}>
                                    {item.nodeName}
                                </div>
                            </div>
                        </div>
                        {item.isOpen&& (<ViewSubListItem currentNode={item} data-testid={`ediy-sublist-${currentNode.id}`}
                                    index={`${index}-${childIndex}`} relationShip={"CHILD"} isEdit={isEdit}/>)}
                    </div>
                ))
            }
        </div>
    )
}


