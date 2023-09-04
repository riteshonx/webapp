import './EditCustomList.scss';

import { Button, IconButton, Tooltip } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import { TextField } from '@mui/material';
import React, { ReactElement, useContext, useEffect, useReducer, useState } from 'react';
import { match, useHistory, useRouteMatch } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

import { useDebounce } from '../../../../../customhooks/useDebounce';
import { client } from '../../../../../services/graphql';
import { CustomListRoles } from '../../../../../utils/role';
import { setIsLoading } from '../../../../root/context/authentication/action';
import { stateContext } from '../../../../root/context/authentication/authContext';
import BackNavigation from '../../../../shared/components/BackNavigation/BackNavigation';
import ConfirmDialog from '../../../../shared/components/ConfirmDialog/ConfirmDialog';
import EditListItem from '../../components/EditListItem/EditListItem';
import { SubListItem } from '../../components/SubListItem/SubListItem';
import { setListOfConfigValues } from '../../context/createUpdateList/customListActiions';
import { customListCreateUpdateContext } from '../../context/createUpdateList/customListContext';
import { createUpdateCustomListReducer, initailState } from '../../context/createUpdateList/customListReducer';
import {
    ADD_CUSTOM_LIST_VALUE,
    CHECK_PARENT_NODE_DUPLICATE,
    DELETE_CONFIGURATION_LIST_VALUE,
    LOAD_CONFIGURATION_LIST_DETAILS,
    UPDATE_CUSTOM_LIST_NAME,
    VALIDATE_CUSTOM_LIST_NAME_UNIQUE,
} from '../../graphql/queries/customList';
import { ConfigListItem, ConfigurationValue } from '../../models/customList';
import { canCreateCustomList, canDeleteCustomList, canUpdateCustomList } from '../../utils/permission';


const confirmMessage = {
    header: "Delete List Item",
    text: "Are you sure you want to delete this item?",
    cancel: "No",
    proceed: "Yes",
  }
export interface Params {
    id: string;
}

function updateCustomList(): ReactElement {
    const [customListState, customListDispatch] = useReducer(createUpdateCustomListReducer, initailState);
    const [listName, setListName] = useState('');
    const { dispatch }:any = useContext(stateContext);
    const [coustListNameError, setCoustListNameError] = useState(false);
    const [isDuplicate, setIsDuplicate] = useState(false);
    const debounceCustomListName = useDebounce(listName,300);
    const [newItemName, setNewItemName] = useState('');
    const debounceCustomListItemName = useDebounce(newItemName,300);
    const [showAddNew, setShowAddNew] = useState(false);
    const [newItemError, setNewItemError] = useState(false);
    const [isNewItemDuplicate, setIsNewItemDuplicate] = useState(false);
    const history = useHistory();
    const pathMatch:match<Params>= useRouteMatch();
    const [showConfirm, setShowConfirm] = useState(false);
    const [deleteIndex, setDeleteIndex] = useState(-1);
    const [dialogData, setDialogData] = useState<any>(null);
    const [initialListName, setinItialListName] = useState("");
    const [isSystemGenerated, setIsSystemGenerated] = useState(false);
    const [listItemTextError,setListItemTextError] = useState(false)
    const [listNameTextError,setListNameTextError] = useState(false)

    useEffect(() => {
        const value=debounceCustomListName.trim();
        if(value){
            getListByName();
        } else{
            setIsDuplicate(false);
        }
    }, [debounceCustomListName])

    useEffect(() => {
        if(!canUpdateCustomList){
            history.push('/pagenotfound');
        } else{
            fetchCustomListDetails();
        }
      }, [])

    useEffect(() => {
        if(canUpdateCustomList){
            getListItemByName();
        }
    }, [debounceCustomListItemName])

    const getListItemByName=async ()=>{
        try{
            const response: any= await  client.query({
                query: CHECK_PARENT_NODE_DUPLICATE,
                variables:{
                    nodeName: `${debounceCustomListItemName.trim()}`,
                    configListId: Number(pathMatch.params.id)
                },
                fetchPolicy:'network-only',
                context:{role: CustomListRoles.viewCustomList}
            })
            if(response.data.configurationValues.length>0){
                setIsNewItemDuplicate(true);
            } else{
                setIsNewItemDuplicate(false);
            }
        }
        catch(error: any){
            console.log(error);
        }
    }

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
                setinItialListName(response.data.configurationLists[0].name);
                setIsSystemGenerated(response.data.configurationLists[0].systemGenerated)
                const list= getNodeListStructure(response.data.configurationLists[0].configurationValues);
                customListDispatch(setListOfConfigValues([...list]));
            } 
            else{
               backToList();
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

    const getListByName=async ()=>{
        try{
            const response: any= await  client.query({
                query: VALIDATE_CUSTOM_LIST_NAME_UNIQUE,
                variables:{
                    name: `${debounceCustomListName.trim()}`
                },
                fetchPolicy:'network-only',
                context:{role: CustomListRoles.viewCustomList}
            })
            if(response.data.configurationLists.length>0){
                if(response.data.configurationLists[0].id !== Number(pathMatch.params.id)){
                    setIsDuplicate(true);
                } else{
                    setIsDuplicate(false);
                }
            } else{
                setIsDuplicate(false);
            }
        }
        catch(error: any){
            console.log(error);
        }
    }

    const onBlur= (event: React.ChangeEvent<any>)=>{
        if(!event.target.value.trim()){
            setCoustListNameError(true);
        } else{
            setCoustListNameError(false);
            if (
              !isDuplicate &&
              event.target.value.trim() !== initialListName &&
              listName.trim().length <= 500
            ) {
              updateCustomListName();
            } 
        }
    }

    const updateCustomListName= async () =>{
        try{
            dispatch(setIsLoading(true));
            await client.mutate({
                mutation: UPDATE_CUSTOM_LIST_NAME,
                variables:{
                    id: Number(pathMatch.params.id),
                    name: debounceCustomListName.trim(),
                },
                context:{role : CustomListRoles.updateCustomList}
            });
            setinItialListName(debounceCustomListName.trim());
            dispatch(setIsLoading(false));
        } catch(error: any){
            console.log(error.message);
            dispatch(setIsLoading(false));
        }
    }

    const onListNameChange= (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=>{
        setListName(event.target.value);
        
        if(!event.target.value.trim()){
            setCoustListNameError(true);
        } else if (event.target.value.trim().length <= 500) {
            setNewItemError(false);
            setListNameTextError(false)
        } else if(event.target.value.trim().length > 500){
            setIsDuplicate(false);
            setCoustListNameError(false);
            setListNameTextError(true);
        }
    }

    const changeInNewItemName= (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=>{
        setNewItemName(event.target.value);
        
        if(!event.target.value.trim()){
            setNewItemError(true);
        } else if (event.target.value.trim().length <= 500) {
            setNewItemError(false);
            setListNameTextError(false)
        } else if(event.target.value.trim().length > 500){
            setNewItemError(false);
            setListNameTextError(true);
        }
    }

    const onNewItemBlur=(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=>{
        if(!event.target.value.trim()){
            setNewItemError(true);
        } else{
            setNewItemError(false);
        }
    }

    const addNewItem= async ()=>{
        try{
            if(newItemName.trim() && !isNewItemDuplicate && !newItemError){
                const newItemValue: ConfigListItem= new ConfigListItem(uuidv4(),newItemName,null,[]);
                await client.mutate({
                    mutation:ADD_CUSTOM_LIST_VALUE,
                    variables:{
                        object: {
                            id: newItemValue.id,
                            nodeName: newItemValue.nodeName,
                            configListId: Number(pathMatch.params.id)
                        }
                    },
                    context:{role: CustomListRoles.createCustomList}
                })
                customListDispatch(setListOfConfigValues([...customListState.listOfConfigValues,newItemValue]));
                setNewItemName('');
                setShowAddNew(!showAddNew);
            }
        } catch(error: any){
            console.log(error);
        }
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

    const deleteItem = async (argIndex: number) =>{
        setDeleteIndex(argIndex);
        const messageData= {...confirmMessage};
        const items= [...customListState.listOfConfigValues];
        if(items[argIndex].childItems.length===0){
            messageData.text="Are you sure you want to delete this item?";
        } else{
            messageData.text= "Deleting this item will remove the child items as well. Are you sure you want to continue?";
        }
        setDialogData(messageData);
        setShowConfirm(true);
    }

    const confirmDelete= async () =>{
        const items= [...customListState.listOfConfigValues];
        setShowConfirm(false);
        try{
            dispatch(setIsLoading(true));
            const responseData= await client.mutate({
                mutation: DELETE_CONFIGURATION_LIST_VALUE,
                variables:{
                  id: items[deleteIndex].id
                },
                context:{role: CustomListRoles.deleteCustomList}
            })
            if(responseData.data.update_configurationValues.affected_rows){
                items.splice(deleteIndex,1);
                customListDispatch(setListOfConfigValues(items));
            }
            dispatch(setIsLoading(false));
        } catch(error: any){
            dispatch(setIsLoading(false));
        }
    }




    const backToList = () => {
        history.push('/base/customList');
    }

    const editListItem = (argIndex: number) =>{
        const items= [...customListState.listOfConfigValues];
        items[argIndex].isEdit=true;
        customListDispatch(setListOfConfigValues(items));
    }

    const cancelAddItem=()=>{
        setShowAddNew(false);
        setNewItemName('');
        setNewItemError(false);
    }


    return (
        <customListCreateUpdateContext.Provider value={{customListState, customListDispatch}}>
        {initialListName ? 
        <div className="EditCustomList">
            <div className="EditCustomList__header">
                <BackNavigation navBack={"/base/customList/view"}/>
                 <div className="EditCustomList__header__title">
                        <TextField data-testid="customListName"
                        autoFocus
                        disabled={isSystemGenerated}
                        className="EditCustomList__header__title__input" 
                        onMouseLeave={(e)=>onBlur(e)}
                        onChange={(e)=> onListNameChange(e)} value={listName} placeholder="Enter a name"/>  
                        {coustListNameError?(
                            <div data-testid="customListNameRequiredError" className="EditCustomList__header__title__error"> 
                                Custom list name is required</div>):isDuplicate?(
                            <div data-testid="customListDuplicateError" className="EditCustomList__header__title__error"> 
                                Custom list name already exists
                            </div>
                        ):listNameTextError?(<div data-testid="fornmnameerror" className="EditCustomList__header__title__error"> 
                        Custom list name is too long (maximum is 500 characters)
                    </div>):("")}
                  </div>
            </div>
            <div className="EditCustomList__body">
                <div className="EditCustomList__body__header">
                    <div>List Items</div>
                    {canDeleteCustomList && <div>Actions</div>}
                </div>
                <div className="EditCustomList__body__content">
                    {
                        customListState.listOfConfigValues.map((item: ConfigListItem, index: number)=>(
                            <div key={item.id}>
                            {item.isEdit?(<EditListItem  index={`${index}`} value={item.nodeName} relationShip={"PARENT"} isEdit={true}/>):(
                                <div key={`CreateCustomList-${item.id}`} className="EditCustomList__body__content__item">
                                <div className="EditCustomList__body__content__item__left">
                                    {
                                        item.isOpen?(
                                            <IconButton onClick={()=>closeCurrentItem(index)}  data-testid={`expandView-${item.id}`}
                                                className="EditCustomList__body__content__item__left__btn">
                                                 <KeyboardArrowDownIcon/>
                                            </IconButton>
                                            ):(
                                                item.childItems.length===0?(
                                                <Tooltip title="Add sublist" aria-label="Add sublist">
                                                    <IconButton onClick={()=>openCurrentItem(index)} data-testid={`opencurrentTab-${index}`}
                                                        className="EditCustomList__body__content__item__left__btn">
                                                        <AddIcon/>
                                                    </IconButton>
                                                </Tooltip>):(
                                                    <Tooltip title="Click to view child items" aria-label="Add sublist">
                                                        <IconButton onClick={()=>openCurrentItem(index)} data-testid={`opencurrentTab-${index}`}
                                                            className="EditCustomList__body__content__item__left__btn">
                                                            <ChevronRightIcon/>
                                                        </IconButton>
                                                    </Tooltip>
                                                )
                                            )
                                    }
                                    <div className="EditCustomList__body__content__item__left__label">
                                        {item.nodeName}
                                    </div>
                                    {canUpdateCustomList &&(<IconButton className="EditCustomList__body__content__item__left__edit" 
                                        onClick={()=>editListItem(index)}>
                                        <EditIcon className="EditCustomList__body__content__item__left__edit__icon"/>
                                    </IconButton>)}
                                    {/* <IconButton className="EditCustomList__body__content__item__left__edit">
                                        <AddIcon className="EditCustomList__body__content__item__left__edit__icon"/>
                                    </IconButton> */}
                                </div>
                                <div className="EditCustomList__body__content__item__right">
                                    {canDeleteCustomList && customListState.listOfConfigValues.length!==1?(
                                         <IconButton  data-testid={`Delete-${item.id}`} onClick={()=>deleteItem(index)}
                                         className="EditCustomList__body__content__item__right__btn"> 
                                        <DeleteIcon className="EditCustomList__body__content__item__right__btn__icon"/>
                                    </IconButton>
                                    ):("")}
                                </div>
                            </div>
                            )}
                            {item.isOpen&& (<SubListItem currentNode={item}
                                    index={`${index}`} relationShip={"PARENT"} isEdit={true}/>)}
                            </div>
                        ))
                    }
                    {showAddNew &&(<div className="EditCustomList__body__content__newitem">
                        <TextField data-testid="newItemName"
                            className="EditCustomList__body__content__newitem__input" 
                            onBlur={(e)=>onNewItemBlur(e)}
                            autoFocus
                            onChange={(e)=> changeInNewItemName(e)} value={newItemName} placeholder="Enter an Item name"/>  
                            {newItemError?(
                            <div data-testid="newItemrequirederror" className="EditCustomList__body__content__newitem__error"> 
                                List item name is required</div>):isNewItemDuplicate?(
                            <div data-testid="neItemDuplicateError" className="EditCustomList__body__content__newitem__error"> 
                               List item name already exists</div>):
                               listItemTextError?(
                            <div data-testid="fornmnameerror" className="EditCustomList__body__content__newitem__error"> 
                                List item name is too long (maximum is 500 characters)
                            </div>
                        ):("")}
                    </div>)}
                    {!showAddNew ?(
                        canCreateCustomList?(<div className="EditCustomList__body__content__addItem"> 
                        <Button className="EditCustomList__body__content__addItem__btn" 
                          data-testid={`AdNewListItem`} onClick={()=>setShowAddNew(true)}>
                          + Click to add an item to the list
                        </Button>
                      </div>):("")):(canCreateCustomList?(
                        <div className="EditCustomList__body__content__addItem">
                        <Button className="EditCustomList__body__content__addItem__btn" 
                            disabled={isNewItemDuplicate || newItemError}
                            data-testid="saveNewItem"  onClick={addNewItem}>Add Item</Button>
                        <Button className="EditCustomList__body__content__addItem__btn" 
                            data-testid="cancelNewItem" onClick={cancelAddItem}>Cancel</Button>
                    </div>
                    ):(""))}
                </div>
            </div>
        </div>:("")}
        {showConfirm?(<ConfirmDialog open={showConfirm} message={dialogData} close={()=>setShowConfirm(false)} proceed={confirmDelete}/>):("")}
        </customListCreateUpdateContext.Provider>
    )
}
export default updateCustomList;