import './CreateCustomList.scss';

import { Button, IconButton, TextField, Tooltip } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import React, { ReactElement, useContext, useEffect, useReducer, useState } from 'react';
import { useHistory } from 'react-router-dom';
import useBeforeunload from 'src/customhooks/useUnload';
import { v4 as uuidv4 } from 'uuid';

import { useDebounce } from '../../../../../customhooks/useDebounce';
import { client } from '../../../../../services/graphql';
import { CustomListRoles } from '../../../../../utils/role';
import { setEditMode, setIsLoading } from '../../../../root/context/authentication/action';
import { stateContext } from '../../../../root/context/authentication/authContext';
import BackNavigation from '../../../../shared/components/BackNavigation/BackNavigation';
import ConfirmDialog from '../../../../shared/components/ConfirmDialog/ConfirmDialog';
import Notification, { AlertTypes } from '../../../../shared/components/Toaster/Toaster';
import EditListItem from '../../components/EditListItem/EditListItem';
import { SubListItem } from '../../components/SubListItem/SubListItem';
import { setListOfConfigValues } from '../../context/createUpdateList/customListActiions';
import { customListCreateUpdateContext } from '../../context/createUpdateList/customListContext';
import { createUpdateCustomListReducer, initailState } from '../../context/createUpdateList/customListReducer';
import { CREATE_CUSTOM_LIST, VALIDATE_CUSTOM_LIST_NAME_UNIQUE } from '../../graphql/queries/customList';
import { ConfigListItem, IConfigDataPayload } from '../../models/customList';
import { canCreateCustomList } from '../../utils/permission';

const confirmMessage = {
    header: "Delete List Item",
    text: "Are you sure you want to delete this item?",
    cancel: "No",
    proceed: "Yes",
}

export const confirmMessageBeforeLeave = {
    header: "Are you sure?",
    text: "If you cancel now, your changes won’t be saved.",
    cancel: "Go back",
    proceed: "Yes, I'm sure",
  };

function CreateCustomList(): ReactElement {
    const [customListState, customListDispatch] = useReducer(createUpdateCustomListReducer, initailState);
    const [listName, setListName] = useState('');
    const { dispatch, state }:any = useContext(stateContext);
    const [customListNameError, setCustomListNameError] = useState(false);
    const [isDuplicate, setIsDuplicate] = useState(false);
    const debounceListName = useDebounce(listName,300);
    const [newItemName, setNewItemName] = useState('');
    const debounceNewListItemName = useDebounce(newItemName,300);
    const [showAddNew, setShowAddNew] = useState(false);
    const [newItemError, setNewItemError] = useState(false);
    const [isNewItemDuplicate, setIsNewItemDuplicate] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [deleteIndex, setDeleteIndex] = useState(-1);
    const [dialogData, setDialogData] = useState<any>(null);
    const history = useHistory();
    const [listItemTextError,setListItemTextError] = useState(false)
    const [listNameTextError,setListNameTextError] = useState(false)

    useEffect(() => {
        const value=debounceListName.trim();
        if(value){
            getListByName();
        } else{
            setIsDuplicate(false);
        }
    }, [debounceListName]);

    useEffect(() => {
      if(!canCreateCustomList){
        history.push('/pagenotfound');
      }
      return () => {
        dispatch(setEditMode(false));
      }
    }, [])

    useEffect(() => {
        if(canCreateCustomList){
            const value=debounceNewListItemName.trim();
            if(value){
                getListItemByName();
            } else{
                setIsNewItemDuplicate(false);
            }
        }
    }, [debounceNewListItemName])

    useBeforeunload((event: any) => {
        if(state.editMode) {
            event.preventDefault();
        }
    });

    const getListItemByName=async ()=>{
        const duplicates= customListState.listOfConfigValues.filter((item: ConfigListItem)=>{
            return item.nodeName.trim().toLowerCase() === debounceNewListItemName.trim().toLowerCase();
        })
        duplicates.length>0?setIsNewItemDuplicate(true):setIsNewItemDuplicate(false);
    }

    const getListByName=async ()=>{
        try{
            const response: any= await  client.query({
                query: VALIDATE_CUSTOM_LIST_NAME_UNIQUE,
                variables:{
                    name: `${debounceListName.trim()}`
                },
                fetchPolicy:'network-only',
                context:{role: CustomListRoles.viewCustomList}
            })
            if(response.data.configurationLists.length>0){
                setIsDuplicate(true);
            } else{
                setIsDuplicate(false);
            }
        }
        catch(error: any){
            console.log(error);
        }
    }

    const onBlur= (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>)=>{
        if(!event.target.value.trim()){
            setCustomListNameError(true);
        } else{
            setCustomListNameError(false);
        }
    }

    const onListNameChange= (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=>{
        setListNameTextError(false)
        setListName(event.target.value);

        if(!state.editMode){
            dispatch(setEditMode(true));
        }
        if(!event.target.value.trim()){
            setCustomListNameError(true);
        } else{
            setCustomListNameError(false);
        }
    }

    const changeInNewItemName= (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=>{
        if(!state.editMode){
            dispatch(setEditMode(true));
        }

        setListItemTextError(false)
        setNewItemName(event.target.value);
        
        if(!event.target.value.trim()){
            setNewItemError(true);
        } else{
            setNewItemError(false);
        }
    }

    const onNewItemBlur=(event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>)=>{
        if(!event.target.value.trim()){
            setNewItemError(true);
        } else{
            setNewItemError(false);
        }
    }

    const addNewItem=()=>{
        if(newItemName.trim() && !isNewItemDuplicate && !newItemError){
            const newItemValue: ConfigListItem= new ConfigListItem(uuidv4(),newItemName,null,[]);
            customListDispatch(setListOfConfigValues([...customListState.listOfConfigValues,newItemValue]));
            setNewItemName('');
            setShowAddNew(!showAddNew);
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
        const items= JSON.parse(JSON.stringify(customListState.listOfConfigValues));
        items[argIndex].isOpen= true;
        customListDispatch(setListOfConfigValues(items));
    }

    const proceed = ()=>{
        if(dialogData.text === confirmMessageBeforeLeave.text){
            setShowConfirm(false);
            backToList();
        } else{
            const items= [...customListState.listOfConfigValues];
            items.splice(deleteIndex,1);
            customListDispatch(setListOfConfigValues(items));
            setShowConfirm(false);
        }
    }

    const deleteItem = (argIndex: number) =>{
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

    const saveChanges = async () =>{
        if(!listName){
            setCustomListNameError(true);
            return;
        }
        if(customListState.listOfConfigValues.length>0){
            try{
                dispatch(setEditMode(false));
                dispatch(setIsLoading(true));
                const cononfigDataPayload= getNormalizedConfigData(customListState.listOfConfigValues);
                cononfigDataPayload.forEach(item=>{
                    if(!item.parentId){
                        delete item.parentId;
                    }
                })
                await client.mutate({
                    mutation: CREATE_CUSTOM_LIST,
                    variables:{
                        configName: listName,
                        configData: cononfigDataPayload
                    },
                    context:{role: CustomListRoles.createCustomList}
                });
                Notification.sendNotification('Created custom list successfully',AlertTypes.success);
                backToList();
                dispatch(setIsLoading(false));
            } catch(error: any){
                Notification.sendNotification(error.message,AlertTypes.warn);
                dispatch(setIsLoading(false));
            }
        } else{
            Notification.sendNotification("Please add an item to the list",AlertTypes.warn);
        }
    }

    const getNormalizedConfigData=(argNodes: ConfigListItem[]): IConfigDataPayload[]=>{
        const returnValue: IConfigDataPayload[]=[];
        argNodes.forEach((item: ConfigListItem)=>{
            const value: IConfigDataPayload= {
                configValueId: item.id,
                nodeName: item.nodeName,
                parentId: item.parentId
            }
            returnValue.push(value);
            if(item.childItems.length>0){
                return returnValue.push(...getNormalizedConfigData(item.childItems));
            }
        })
        return returnValue;
    }

    const backToList = () => {
        dispatch(setIsLoading(true));
        dispatch(setEditMode(false));
        setTimeout(() => {
            history.push('/base/customList');
        }, 1000);
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

    const isCreateDisabled=(): boolean=>{
       return isDuplicate || customListNameError || customListState.listOfConfigValues.length === 0;
    }

    const cancelChanges=()=>{
        if(state.editMode){
            const messageData= {...confirmMessageBeforeLeave};
            setDialogData(messageData);
            setShowConfirm(true);
        } else{
            backToList();
        }
    }

    return (
        <customListCreateUpdateContext.Provider value={{customListState, customListDispatch}}>
        <div className="CreateCustomList">
            <div className="CreateCustomList__header">
                <BackNavigation navBack={"/base/customList/view"}/>
                 <div className="CreateCustomList__header__title">
                        <TextField variant="outlined" data-testid="custom-list-name"
                        className="CreateCustomList__header__title__input" 
                        autoFocus
                        onBlur={(e)=>onBlur(e)}
                        onChange={(e)=> onListNameChange(e)} value={listName} placeholder="Enter a name"/>  
                        {customListNameError?(
                            <div data-testid="customlist-required-error" className="CreateCustomList__header__title__error"> 
                                Custom list name is required</div>):isDuplicate?(
                            <div data-testid="customlist-duplicate-error" className="CreateCustomList__header__title__error"> 
                                Custom list name already exists</div>):
                                listNameTextError?(
                                <div data-testid="customlist-duplicate-error" className="CreateCustomList__header__title__error">
                                    Custom list name is too long (maximum is 50 characters)
                                </div>):("")}
                  </div>
            </div>
            <div className="CreateCustomList__body">
                <div className="CreateCustomList__body__header">
                    <div>List Items</div>
                    <div>Actions</div>
                </div>
                <div className="CreateCustomList__body__content">
                    {
                        customListState.listOfConfigValues.map((item: ConfigListItem, index: number)=>(
                            <div key={item.id}>
                            {item.isEdit?(<EditListItem  index={`${index}`} value={item.nodeName} relationShip={"PARENT"} isEdit={false}/>):(
                                <div key={`CreateCustomList-${item.id}`} className="CreateCustomList__body__content__item">
                                <div className="CreateCustomList__body__content__item__left">
                                    {
                                        item.isOpen?(
                                            <IconButton onClick={()=>closeCurrentItem(index)} data-testid={`close-${item.id}`}
                                                className="CreateCustomList__body__content__item__left__btn">
                                                 <KeyboardArrowDownIcon/>
                                            </IconButton>
                                            ):(
                                                item.childItems.length===0?(
                                                    <Tooltip title="Add sublist" aria-label="Add sublist" data-testid={`add-${item.id}`}>
                                                    <IconButton onClick={()=>openCurrentItem(index)} 
                                                        className="CreateCustomList__body__content__item__left__btn">
                                                        <AddIcon/>
                                                    </IconButton>
                                                </Tooltip>
                                                ):(
                                                 <Tooltip title="Click to view child items" aria-label="Add sublist" data-testid={`add-${item.id}`}>
                                                    <IconButton onClick={()=>openCurrentItem(index)} 
                                                        className="CreateCustomList__body__content__item__left__btn">
                                                        <ChevronRightIcon/>
                                                    </IconButton>
                                                </Tooltip>
                                                )
                                            )
                                    }
                                    <div className={`CreateCustomList__body__content__item__left__label ${item.isOpen?'active':''}`}>
                                        {item.nodeName}
                                    </div>
                                    { canCreateCustomList?(
                                    <IconButton className="CreateCustomList__body__content__item__left__edit" onClick={()=>editListItem(index)}>
                                        <EditIcon className="CreateCustomList__body__content__item__left__edit__icon"/>
                                    </IconButton>):("")}
                                    {/* <IconButton className="CreateCustomList__body__content__item__left__edit">
                                        <AddIcon className="CreateCustomList__body__content__item__left__edit__icon"/>
                                    </IconButton> */}
                                </div>
                                <div className="CreateCustomList__body__content__item__right">
                                    <IconButton  data-testid={`Delete-${item.id}`} 
                                        onClick={()=>deleteItem(index)} className="CreateCustomList__body__content__item__right__btn"> 
                                        <DeleteIcon className="CreateCustomList__body__content__item__right__btn__icon"/>
                                    </IconButton>
                                </div>
                            </div>
                            )}
                            {item.isOpen&& (<SubListItem currentNode={item}
                                    index={`${index}`} relationShip={"PARENT"} isEdit={false}/>)}
                            </div>
                        ))
                    }
                    {showAddNew &&(<div className="CreateCustomList__body__content__newitem">
                        <TextField variant="outlined"
                            data-testid="add-newitem-input"
                            className="CreateCustomList__body__content__newitem__input" 
                            onBlur={(e)=>onNewItemBlur(e)}
                            autoFocus
                            onChange={(e)=> changeInNewItemName(e)} value={newItemName} placeholder="Enter an Item name"/>  
                            {newItemError?(
                            <div data-testid="fornmnameerror" className="CreateCustomList__body__content__newitem__error"> 
                                List item name is required</div>):isNewItemDuplicate?(
                            <div data-testid="fornmnameerror" className="CreateCustomList__body__content__newitem__error"> 
                               List item name already exists</div>):
                               listItemTextError?(
                            <div data-testid="fornmnameerror" className="EditListItem__error"> 
                                List item name is too long (maximum is 50 characters)
                            </div>
                        ):("")}
                    </div>)}
                    {!showAddNew ?(
                    <div className="CreateCustomList__body__content__addItem">
                        {canCreateCustomList &&  <Button data-testid="add-newitem"
                         className="CreateCustomList__body__content__addItem__btn" onClick={()=>setShowAddNew(true)}>
                        + Click to add an item to the list
                      </Button>}
                    </div>):(
                        canCreateCustomList && (
                    <div className="CreateCustomList__body__content__addItem">
                        <Button data-testid="add-newitem-list" className="CreateCustomList__body__content__addItem__btn"
                            disabled={isNewItemDuplicate || newItemError}
                             onClick={addNewItem}>
                            Add Item
                        </Button>
                        <Button data-testid="cancel-newitem" className="CreateCustomList__body__content__addItem__btn"
                           onClick={cancelAddItem}>
                            Cancel
                        </Button>
                    </div>))}
                </div>
            </div>
            <div className="CreateCustomList__footer">
                <Button variant="outlined"
                className="CreateCustomList__footer__btn btn-secondary" 
                    data-testid="create-customlist-discard" onClick={cancelChanges}>Cancel</Button>
                <Button variant="outlined" className="btn-primary" disabled={isCreateDisabled()} 
                     data-testid="create-customlist-save" onClick={saveChanges}>Create</Button>
            </div>
        </div>
        {showConfirm?(<ConfirmDialog open={showConfirm} message={dialogData} close={()=>setShowConfirm(false)} proceed={proceed}/>):("")}
        
        </customListCreateUpdateContext.Provider>
    )
}
export default CreateCustomList;