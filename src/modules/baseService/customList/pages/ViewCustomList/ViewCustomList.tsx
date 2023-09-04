import { IconButton, Tooltip } from '@material-ui/core';
import React, { ReactElement, useContext, useEffect, useReducer, useState } from 'react';
import { client } from '../../../../../services/graphql';
import { CustomListRoles } from '../../../../../utils/role';
import { stateContext } from '../../../../root/context/authentication/authContext';
import { 
        LOAD_CONFIGURATION_LIST_DETAILS,
        } from '../../graphql/queries/customList';
import './ViewCustomList.scss';
import { ConfigListItem, ConfigurationValue } from '../../models/customList';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import { createUpdateCustomListReducer, initailState } from '../../context/createUpdateList/customListReducer';
import { setListOfConfigValues } from '../../context/createUpdateList/customListActiions';
import { customListCreateUpdateContext } from '../../context/createUpdateList/customListContext';
import { useHistory, useRouteMatch, match } from 'react-router-dom';
import { setIsLoading } from '../../../../root/context/authentication/action';
import BackNavigation from '../../../../shared/components/BackNavigation/BackNavigation';
import { ViewSubListItem } from '../../components/ViewSubListItem/ViewSubListItem';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import { canViewCustomList } from '../../utils/permission';

export interface Params {
    id: string;
}

function viewCustomList(): ReactElement {
    const [customListState, customListDispatch] = useReducer(createUpdateCustomListReducer, initailState);
    const { dispatch }:any = useContext(stateContext);
    const history = useHistory();
    const pathMatch:match<Params>= useRouteMatch();
    const [listName, setListName] = useState('');

    useEffect(() => {
        if(canViewCustomList){
            fetchCustomListDetails();
        } else{
            history.push(`/base/customList/view`);
        }
    }, [])

    const fetchCustomListDetails= async ()=>{
        try{
            dispatch(setIsLoading(true));
            const response: any= await client.query({
                query: LOAD_CONFIGURATION_LIST_DETAILS,
                variables:{
                    id: Number(pathMatch.params.id)
                },
                fetchPolicy:'network-only',
                context:{role: CustomListRoles.viewCustomList}
            });
            dispatch(setIsLoading(false));
            if(response.data.configurationLists.length>0){
                setListName(response.data.configurationLists[0].name);
                const list= getNodeListStructure(response.data.configurationLists[0].configurationValues);
                customListDispatch(setListOfConfigValues([...list]));
            } else{
                history.push('/base/customList');
            }
        }catch(error: any){
            dispatch(setIsLoading(false));
            console.log(error.message);
        }
    }

    const getNodeListStructure=(argValues: Array<ConfigurationValue>): Array<ConfigListItem>=>{
        const returnValue: Array<ConfigListItem>= [];
        const parentNodes= argValues.filter((item: ConfigurationValue)=>!item.parentId);

        parentNodes.forEach(item=>{
            const newItem: ConfigListItem= new ConfigListItem(item.id,item.nodeName,item.parentId,[]);
            const childNodes= argValues.filter((childItem:ConfigurationValue)=>childItem.parentId === newItem.id);
            const childItems: Array<ConfigListItem> =[];
            childNodes.forEach((childItem:ConfigurationValue)=>{
                const newChildNode: ConfigListItem= new ConfigListItem(childItem.id,childItem.nodeName,childItem.parentId,[]);
                const grandChildNodes= argValues.filter((childNode:ConfigurationValue)=>childNode.parentId === newChildNode.id);
                const grandChildItems: Array<ConfigListItem>=[];
                grandChildNodes.forEach((grandChildItem:ConfigurationValue)=>{
                    const newGrandChildNode: ConfigListItem= new ConfigListItem(grandChildItem.id,grandChildItem.nodeName,grandChildItem.parentId,[]);
                    grandChildItems.push(newGrandChildNode);
                })
                newChildNode.childItems= grandChildItems;
                childItems.push(newChildNode);
            })
            newItem.childItems=childItems;
            returnValue.push(newItem);
        })
        return returnValue;
    }



    const closeCurrentItem = (argIndex: number) =>{
        const items= JSON.parse(JSON.stringify(customListState.listOfConfigValues));
        items[argIndex].isOpen= false;
        items[argIndex].childItems.forEach((item:ConfigListItem)=>{
            item.isOpen=false;
            item.childItems.forEach((childitem: ConfigListItem)=>{
                childitem.isOpen= false;
            })
        })
        customListDispatch(setListOfConfigValues(items));
    }

    const openCurrentItem = (argIndex: number) =>{
        const items= [...customListState.listOfConfigValues];
        items[argIndex].isOpen= true;
        customListDispatch(setListOfConfigValues(items));
    }


    return (
        <customListCreateUpdateContext.Provider value={{customListState, customListDispatch}}>
        <div className="viewCustomList">
            <div className="viewCustomList__header">
                <BackNavigation navBack={"/base/customList/view"}/>
                 <div className="viewCustomList__header__title">
                      {listName}
                  </div>
            </div>
            <div className="viewCustomList__body">
                <div className="viewCustomList__body__header">
                    <div>List Items</div>
                </div>
                <div className="viewCustomList__body__content">
                    {
                        customListState.listOfConfigValues.map((item: ConfigListItem, index: number)=>(
                            <div key={item.id}>
                                <div key={`CreateCustomList-${item.id}`} 
                                    className={`viewCustomList__body__content__item ${item.childItems.length==0?'nochild':''}`}>
                                <div className="viewCustomList__body__content__item__left">
                                    {item.childItems.length>0?(
                                        item.isOpen?(
                                            <IconButton onClick={()=>closeCurrentItem(index)}  data-testid={`expandView-${item.id}`}
                                                className="viewCustomList__body__content__item__left__btn">
                                                 <KeyboardArrowDownIcon/>
                                            </IconButton>
                                            ):(
                                                <Tooltip title="Click to view child items" aria-label="view child">
                                                    <IconButton onClick={()=>openCurrentItem(index)} data-testid={`opencurrentTab-${index}`}
                                                        className="viewCustomList__body__content__item__left__btn">
                                                        <KeyboardArrowRightIcon/>
                                                    </IconButton>
                                                </Tooltip>
                                            )):("")
                                    }
                                    <div className={`viewCustomList__body__content__item__left__label ${item.isOpen?'active':''}`}>
                                        {item.nodeName}
                                    </div>
                                </div>
                            </div>
                            {item.isOpen&& (<ViewSubListItem currentNode={item}
                                    index={`${index}`} relationShip={"PARENT"} isEdit={true}/>)}
                            </div>
                        ))
                    }
                </div>
            </div>
        </div>
        </customListCreateUpdateContext.Provider>
    )
}
export default viewCustomList;