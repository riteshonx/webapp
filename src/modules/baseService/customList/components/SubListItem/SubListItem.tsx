import { Button, IconButton, Tooltip } from '@material-ui/core';
import React, { ReactElement, useContext, useState, useEffect } from 'react';
import { stateContext } from '../../../../root/context/authentication/authContext';
import { customListCreateUpdateContext } from '../../context/createUpdateList/customListContext';
import { ConfigListItem } from '../../models/customList';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import DeleteIcon from '@material-ui/icons/Delete';
import { setListOfConfigValues } from '../../context/createUpdateList/customListActiions';
import { v4 as uuidv4 } from 'uuid';
import EditIcon from '@material-ui/icons/Edit';
import AddIcon from '@material-ui/icons/Add';
import './SubListItem.scss';
import EditListItem from '../EditListItem/EditListItem';
import { client } from '../../../../../services/graphql';
import { ADD_CUSTOM_LIST_VALUE, CHECK_CHILD_NODE_DUPLICATE, DELETE_CONFIGURATION_LIST_VALUE } from '../../graphql/queries/customList';
import { CustomListRoles } from '../../../../../utils/role';
import { match, useRouteMatch } from 'react-router-dom';
import { useDebounce } from '../../../../../customhooks/useDebounce';
import { setEditMode, setIsLoading } from '../../../../root/context/authentication/action';
import ConfirmDialog from '../../../../shared/components/ConfirmDialog/ConfirmDialog';
import { canCreateCustomList, canUpdateCustomList, canDeleteCustomList } from '../../utils/permission';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
interface Props {
    currentNode: ConfigListItem,
    index: string,
    relationShip: string,
    isEdit: boolean
}

export interface Params {
    id: string;
}

const confirmMessage = {
    header: "Delete List Item",
    text: "Are you sure you want to delete this item?",
    cancel: "No",
    proceed: "Yes",
  }

export function SubListItem({currentNode,index,relationShip, isEdit}: Props): ReactElement {
    const [newItemName, setNewItemName] = useState("");
    const { dispatch, state }:any = useContext(stateContext);
    const { customListState, customListDispatch }:any = useContext(customListCreateUpdateContext);
    const [showAddNew, setShowAddNew] = useState(false);
    const [newItemError, setNewItemError] = useState(false);
    const debounceName = useDebounce(newItemName,300);
    const [isNewItemDuplicate, setIsNewItemDuplicate] = useState(false);
    const pathMatch:match<Params>= useRouteMatch();
    const [showConfirm, setShowConfirm] = useState(false);
    const [deleteIndex, setDeleteIndex] = useState(-1);
    const [dialogData, setDialogData] = useState<any>(null);
    const [listItemTextError,setListItemTextError] = useState(false)
    
    useEffect(() => {
        if(currentNode.childItems.length===0){
            setShowAddNew(true);
        }
    }, [])

    useEffect(() => {
        const value=debounceName.trim();
        if(value){
            getListByName();
        } else{
            setIsNewItemDuplicate(false);
        }
    }, [debounceName])

    const getListByName=async ()=>{
        try{
            if(isEdit){
                const response: any= await  client.query({
                    query: CHECK_CHILD_NODE_DUPLICATE,
                    variables:{
                        parentId: currentNode.id,
                        nodeName: `${debounceName.trim()}`,
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
            } else{
               const duplicates= currentNode.childItems.filter((item: ConfigListItem)=>{
                    return item.nodeName.trim().toLowerCase() === debounceName.trim().toLowerCase();
                })
                duplicates.length>0?setIsNewItemDuplicate(true):setIsNewItemDuplicate(false);
            }
        }
        catch(error: any){
            console.log(error);
        }
    }

    const changeInNewItemName= (event: React.ChangeEvent<HTMLInputElement>)=>{
        if(!state.editMode && !isEdit){
            dispatch(setEditMode(true));
        }
        if(event.target.value.length>500){
            setListItemTextError(true)
            return;
        }else{
            setListItemTextError(false)
            setNewItemName(event.target.value);
        }
        if(!event.target.value.trim()){
            setNewItemError(true);
        } else{
            setNewItemError(false);
        }
    }

    const onNewItemBlur=(event: React.ChangeEvent<HTMLInputElement>)=>{
        if(!event.target.value.trim()){
            setNewItemError(true);
        } else{
            setNewItemError(false);
        }
    }

    const addNewItem=()=>{
        if(isEdit){
            AddNewItemToList();
        } else{
            if(newItemName.trim()){
                const newItemValue: ConfigListItem= new ConfigListItem(uuidv4(),newItemName,currentNode.id,[]);
                const items= [...customListState.listOfConfigValues];
                if(relationShip==='PARENT'){
                    items[Number(index)].childItems.push(newItemValue);
                    customListDispatch(setListOfConfigValues(items));
                    setNewItemName('');
                    setShowAddNew(!showAddNew);
                } else{
                    const indexs= index.split('-');
                    items[Number(indexs[0])].childItems[Number(indexs[1])].childItems.push(newItemValue);
                    customListDispatch(setListOfConfigValues(items));
                    setNewItemName('');
                    setShowAddNew(!showAddNew);
                }
            }
        }
    }

    const AddNewItemToList= async ()=>{
        try{
            if(newItemName.trim() && !newItemError && !isNewItemDuplicate){
                const newItemValue: ConfigListItem= new ConfigListItem(uuidv4(),newItemName,currentNode.id,[]);
                const items= [...customListState.listOfConfigValues];
                await client.mutate({
                    mutation:ADD_CUSTOM_LIST_VALUE,
                    variables:{
                        object: {
                            id: newItemValue.id,
                            nodeName: newItemValue.nodeName,
                            parentId: newItemValue.parentId,
                            configListId: Number(pathMatch.params.id)
                        }
                    },
                    context:{role: CustomListRoles.createCustomList}
                });
                if(relationShip==='PARENT'){
                    items[Number(index)].childItems.push(newItemValue);
                    customListDispatch(setListOfConfigValues(items));
                    setNewItemName('');
                    setShowAddNew(!showAddNew);
                } else{
                    const indexs= index.split('-');
                    items[Number(indexs[0])].childItems[Number(indexs[1])].childItems.push(newItemValue);
                    customListDispatch(setListOfConfigValues(items));
                    setNewItemName('');
                    setShowAddNew(!showAddNew);
                }
            } 
        } catch(error){

        }
    }

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

    const deleteItem = async (argIndex: number) =>{
        const items= [...customListState.listOfConfigValues];
        const messageData= {...confirmMessage};
        setDeleteIndex(argIndex);
        if(relationShip === 'PARENT'){
            const currentItem = items[Number(index)].childItems[argIndex];
            if(currentItem.childItems.length===0){
                messageData.text="Are you sure you want to delete this item?";
            } else{
                messageData.text= "Deleting this item will remove the child items as well. Are you sure you want to continue?";
            }
            setDialogData(messageData);
            setShowConfirm(true);
        } else{
            const indexs= index.split('-');
            const currentItem=items[Number(indexs[0])].childItems[Number(indexs[1])].childItems[argIndex];
            if(currentItem.childItems.length===0){
                messageData.text="Are you sure you want to delete this item?";
            } else{
                messageData.text= "Deleting this item will remove the child items as well. Are you sure you want to continue?";
            }
            setDialogData(messageData);
            setShowConfirm(true);
        }
    }

    const deleteCreatedItem = () =>{
        const items= [...customListState.listOfConfigValues];
        if(relationShip === 'PARENT'){
            items[Number(index)].childItems.splice(deleteIndex,1);
            customListDispatch(setListOfConfigValues(items));
        } else{
            const indexs= index.split('-');
            items[Number(indexs[0])].childItems[Number(indexs[1])].childItems.splice(deleteIndex,1);
            customListDispatch(setListOfConfigValues(items));
        }
    }

    const deleteEditListItem = async () =>{
        try{
            const items= [...customListState.listOfConfigValues];
            let currentItem: any;
            if(relationShip === 'PARENT'){
                currentItem= items[Number(index)].childItems;
            } else{
                const indexs= index.split('-');
                currentItem= items[Number(indexs[0])].childItems[Number(indexs[1])].childItems;
            }
            dispatch(setIsLoading(true));
            const responseData= await client.mutate({
                mutation: DELETE_CONFIGURATION_LIST_VALUE,
                variables:{
                  id: currentItem[deleteIndex].id
                },
                context:{role: CustomListRoles.deleteCustomList}
            })
            if(responseData.data.update_configurationValues.affected_rows){
                if(relationShip === 'PARENT'){
                    items[Number(index)].childItems.splice(deleteIndex,1);
                    customListDispatch(setListOfConfigValues(items));
                } else{
                    const indexs= index.split('-');
                    items[Number(indexs[0])].childItems[Number(indexs[1])].childItems.splice(deleteIndex,1);
                    customListDispatch(setListOfConfigValues(items));
                }
            }
            dispatch(setIsLoading(false));
        } catch(error: any){
            dispatch(setIsLoading(false));
        }
    }

    const confirmDelete = ()=>{
        setShowConfirm(false);
        setDeleteIndex(-1);
        setDialogData(null);
        if(isEdit){
            deleteEditListItem();
        } else{
            deleteCreatedItem();
        }
    }

    const editListItem= (argIndex: number) =>{
        const items= [...customListState.listOfConfigValues];
        if(relationShip === 'PARENT'){
            items[Number(index)].childItems[argIndex].isEdit=true;
            customListDispatch(setListOfConfigValues(items));
        } else{
            const indexs= index.split('-');
            items[Number(indexs[0])].childItems[Number(indexs[1])].childItems[argIndex].isEdit=true;
            customListDispatch(setListOfConfigValues(items));
        }
    }

    const cancelAddItem=()=>{
        const items= [...customListState.listOfConfigValues];
        if(relationShip === 'PARENT'){
            if(items[Number(index)].childItems.length===0){
                items[Number(index)].isOpen=false;
            }
            customListDispatch(setListOfConfigValues(items));
        } else{
            const indexs= index.split('-');
            const currentChildNode=items[Number(indexs[0])].childItems[Number(indexs[1])];
            if(currentChildNode.childItems.length===0){
                currentChildNode.isOpen=false;
            }
            customListDispatch(setListOfConfigValues(items));
        }
        setShowAddNew(false);
        setNewItemName('');
        setNewItemError(false);
    }

    return (
        <div className="SubListItem">
            {
                currentNode.childItems.map((item: ConfigListItem,childIndex: number)=>(
                    <div key={`${item.id}`}>
                    {item.isEdit?(
                        <EditListItem  index={`${index}-${childIndex}`} value={item.nodeName} 
                            relationShip={relationShip==='PARENT'?'CHILD':'GRANDCHILD'} isEdit={isEdit}/>
                        ):(
                        <div key={`CreateCustomList-${item.id}`} className="SubListItem__item">
                        <div className="SubListItem__item__left">
                            {relationShip!== 'CHILD'?(item.isOpen?(
                                    <IconButton className="SubListItem__item__left__btn" data-testid={`sublist-close-${currentNode.id}`}
                                         onClick={()=>closeCurrentItem(childIndex)}>
                                            <KeyboardArrowDownIcon/>
                                    </IconButton>
                                    ):( 
                                        item.childItems.length===0?(
                                            <Tooltip title="Add sublist" aria-label="Add sublist">
                                                <IconButton onClick={()=>openCurrentItem(childIndex)} data-testid={`sublist-add-${currentNode.id}`}
                                                    className="SubListItem__item__left__btn">
                                                    <AddIcon/>
                                                </IconButton>
                                            </Tooltip>):(
                                            <Tooltip title="Click to view child items" aria-label="Add sublist">
                                                <IconButton onClick={()=>openCurrentItem(childIndex)} data-testid={`sublist-add-${currentNode.id}`}
                                                    className="SubListItem__item__left__btn">
                                                    <ChevronRightIcon/>
                                                </IconButton>
                                            </Tooltip>)
                                    )):("")
                            }
                            <div className={`SubListItem__item__label ${item.isOpen?'active':''} ${relationShip=== 'CHILD'?'child':''}`}>
                                {item.nodeName}
                            </div>
                            {canUpdateCustomList && canCreateCustomList?(
                                 <IconButton className="SubListItem__item__left__edit" 
                                 data-testid={`sublist-edit-${currentNode.id}`} onClick={()=>editListItem(childIndex)}>
                                             <EditIcon className="SubListItem__item__left__edit__icon"/>
                                 </IconButton>
                            ):("")}
                            {/* <IconButton className="SubListItem__item__left__edit">
                                        <AddIcon className="SubListItem__item__left__edit__icon"/>
                            </IconButton> */}
                        </div>
                        {isEdit?(canDeleteCustomList && <div className="SubListItem__item__right">
                            <IconButton  data-testid={`sublist-edit-${currentNode.id}`}
                                onClick={()=>deleteItem(childIndex)} className="SubListItem__item__right__btn"> 
                                <DeleteIcon className="SubListItem__item__right__btn__icon" />
                            </IconButton>
                        </div>):(<div className="SubListItem__item__right">
                            <IconButton  data-testid={`sublist-edit-${currentNode.id}`}
                                onClick={()=>deleteItem(childIndex)} className="SubListItem__item__right__btn"> 
                                <DeleteIcon className="SubListItem__item__right__btn__icon" />
                            </IconButton>
                        </div>)}
                    </div>
                    )}
                    {item.isOpen&& (<SubListItem currentNode={item} data-testid={`ediy-sublist-${currentNode.id}`}
                                    index={`${index}-${childIndex}`} relationShip={"CHILD"} isEdit={isEdit}/>)}
                    </div>
                ))
            }
            {showAddNew &&(<div className="SubListItem__newitem">
                        <input data-testid={`newsublist-name-${currentNode.id}`}
                            className="SubListItem__newitem__input" 
                            autoFocus
                            onBlur={(e)=>onNewItemBlur(e)}
                            onChange={(e)=> changeInNewItemName(e)} value={newItemName} placeholder="Enter an Item name"/>  
                            {newItemError?(
                            <div data-testid="requirederror" className="SubListItem__newitem__error"> 
                                list item name is required</div>):isNewItemDuplicate?(
                            <div data-testid="DuplicateError" className="SubListItem__newitem__error"> 
                                list item name already exists</div>):
                                listItemTextError?(
                            <div data-testid="fornmnameerror" className="EditListItem__error"> 
                                List item name is too long (maximum is 500 characters)
                            </div>
                        ):(<div className="SubListItem__newitem__error"></div>)}
                    </div>)}
                    {!showAddNew?(
                        canCreateCustomList?
                        (<div className="SubListItem__addItem">
                        <Button className="SubListItem__addItem__btn"
                        data-testid={`add-sublist-${currentNode.id}`} onClick={()=>setShowAddNew(true)}> 
                            Click to add list item
                        </Button>
                        </div>):("")):(
                            canCreateCustomList?
                        (<div className="SubListItem__addItem">
                            <Button className="SubListItem__addItem__btn" 
                            disabled={newItemError||isNewItemDuplicate||newItemName.trim().length>500} onClick={addNewItem}>Add Item</Button>
                            <Button className="SubListItem__addItem__btn" data-testid={`cancel-sublist-${currentNode.id}`}
                                onClick={cancelAddItem}>Cancel
                            </Button>
                         </div>):(""))}  
                         {showConfirm?(<ConfirmDialog open={showConfirm} message={dialogData} 
                            close={()=>setShowConfirm(false)} proceed={confirmDelete}/>):("")}
        </div>
    )
}


