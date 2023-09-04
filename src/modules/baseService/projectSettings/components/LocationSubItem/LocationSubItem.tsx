import React, { ReactElement, useContext, useEffect, useState } from 'react';
import { match, useRouteMatch } from 'react-router-dom';
import { Button, IconButton, Tooltip } from '@material-ui/core';
import { v4 as uuidv4 } from 'uuid';
import { CREATE_LOCATION_TREE, DELETE_LOCATION_TREE,
         CHECK_NODE_NAME_DUPLICATE } from '../../graphql/queries/location';
import { stateContext } from '../../../../root/context/authentication/authContext';
import { client } from '../../../../../services/graphql';
import { ProjectSetupRoles } from '../../../../../utils/role';
import { LocationNode } from '../../models/location';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import { useDebounce } from '../../../../../customhooks/useDebounce';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import { locationContext } from '../../../context/locationContext';
import EditIcon from '@material-ui/icons/Edit';
import './LocationSubItem.scss';
import EditLocationItem from '../EditLocationItem/EditLocationItem';
import { projectDetailsContext } from '../../../projects/Context/ProjectDetailsContext';
import ConfirmDialog from '../../../../shared/components/ConfirmDialog/ConfirmDialog';
import { TextField } from '@mui/material';
interface Params {
    projectId: string;
}

interface IProps{
    subListItem: LocationNode,
    subItemIndex: string
}

const dialogData = {
    header: "Delete List Item",
    text: "Are you sure you want to delete this item?",
    cancel: "No",
    proceed: "Yes",
}



export default function LocationSubItem({subListItem, subItemIndex}: IProps): ReactElement {
    const { locationValues,updateValues }: any = useContext(locationContext);
    const pathMatch:match<Params>= useRouteMatch();
    const { state }: any = useContext(stateContext);
    const [newItemName, setNewItemName] = useState('');
    const debounceNewListItemName = useDebounce(newItemName,300);
    const [showAddNew, setShowAddNew] = useState(false);
    const [newItemError, setNewItemError] = useState(false);
    const [isNewItemDuplicate, setIsNewItemDuplicate] = useState(false);
    const [disableAddNew, setDisableAddNew] = useState(false);
    const {projectDetailsState}: any = useContext(projectDetailsContext);
    const [showConfirm, setShowConfirm] = useState(false);
    const [deleteIndex, setDeleteIndex] = useState(-1);
    
    useEffect(() => {
       const canAddChild= subItemIndex.split('-').length===6;
       setDisableAddNew(canAddChild);
       if(subListItem.childNodes.length===0){
            setShowAddNew(true);
       }
    }, [subListItem])

    useEffect(() => {
        if(isNewItemDuplicate){
           const duplicates=  subListItem.childNodes.filter((item: LocationNode)=>item.nodeName.trim().toLocaleUpperCase() === 
           newItemName.trim().toLocaleUpperCase());
          if(duplicates.length===0){
             setIsNewItemDuplicate(false);
          }
        }
     }, [locationValues])

    useEffect(() => {
        const value=debounceNewListItemName.trim();
        if(value && projectDetailsState.projectToken){
            getListItemByName();
        } else{
            setIsNewItemDuplicate(false);
        }
    }, [debounceNewListItemName,projectDetailsState.projectToken])

    const getListItemByName=async ()=>{
        try{
            const response: any= await  client.query({
                query: CHECK_NODE_NAME_DUPLICATE,
                variables:{
                    parentId: subListItem.id,
                    nodeName: `${debounceNewListItemName.trim()}`
                },
                fetchPolicy:'network-only',
                context:{role: ProjectSetupRoles.viewLocation, token: projectDetailsState.projectToken}
            })
            if(response.data.projectLocationTree.length>0){
                setIsNewItemDuplicate(true);
                return;
            }
            setIsNewItemDuplicate(false);
        }
        catch(error: any){
            console.log(error);
        }
    }

    const onNewItemBlur=(event: React.ChangeEvent<HTMLInputElement>)=>{
        if(!event.target.value.trim()){
            setNewItemError(true);
        } else{
            setNewItemError(false);
        }
    }

    const addNewItem= async ()=>{
        try{
            if(newItemName.trim() && !isNewItemDuplicate){
                setNewItemError(false);
                const newItemValue: LocationNode= new LocationNode(newItemName,subListItem.id,uuidv4(),[]);
                await client.mutate({
                    mutation: CREATE_LOCATION_TREE,
                    variables:{
                        id: newItemValue.id,
                        nodeName: newItemValue.nodeName,
                        parentId: newItemValue.parentId
                    },
                    context:{role: ProjectSetupRoles.createLocation, token: projectDetailsState.projectToken}
                })
                subListItem.childNodes=[...subListItem.childNodes,newItemValue];
                setNewItemName('');
                setShowAddNew(!showAddNew);
                updateValues();
            }else{
                setNewItemError(true);
            }
        } catch(error: any){
            console.log(error);
        }
    }

    const changeInNewItemName= (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>)=>{
        setNewItemName(event.target.value);
        if(!event.target.value.trim()){
            setNewItemError(true);
        } else{
            setNewItemError(false);
        }
    }

    const cancelAddItem=()=>{
        setShowAddNew(false);
        setNewItemName('');
        setNewItemError(false);
    }

    const showMore=(argIndex: number)=>{
        subListItem.childNodes[argIndex].isOpen=true;
        updateValues();
    }

    const showLess=(argIndex: number)=>{
        subListItem.childNodes[argIndex].isOpen=false;
        updateValues();
    }

    const deleteLocationItem= (argIndex: number)=>{
       setDeleteIndex(argIndex);
       setShowConfirm(true);
    }

    const editListItem=(argIndex: number)=>{
        subListItem.childNodes[argIndex].isEdit=true;
        updateValues();
    }

    const confirmDelete=()=>{
        try{
            client.mutate({
                mutation:DELETE_LOCATION_TREE,
                variables:{
                    id: subListItem.childNodes[deleteIndex].id
                },
                context:{role: ProjectSetupRoles.deleteLocation, token: projectDetailsState.projectToken}
            })
            subListItem.childNodes.splice(deleteIndex,1);
            updateValues();
            setShowConfirm(false);
        } catch(error: any){
            console.log(error.message);
            setShowConfirm(false);
        }
    }

    return (
        <div className="LocationSubItem">
                <div className="LocationSubItem__element">
                    {subListItem.childNodes.map((item: LocationNode, index: number)=>
                    <>
                     {!item.isEdit?(
                     <div className="LocationSubItem__element__item" key={`Item-${item.id}`}>
                         <div className="LocationSubItem__element__item__left">
                          {disableAddNew?(""): item.isOpen?( 
                               <Tooltip title={`View less`}>
                                   <IconButton className="LocationSubItem__element__item__left__btn"
                                        onClick={()=>showLess(index)}>
                                        <ExpandMoreIcon/>
                                    </IconButton>
                               </Tooltip>):(item.childNodes.length===0?(
                                     projectDetailsState?.projectPermission.canCreateLocation?
                                     (<Tooltip title={`Add sublist`}>
                                         <IconButton className="LocationSubItem__element__item__left__btn"
                                                 onClick={()=>showMore(index)}>
                                                 <AddIcon/>
                                         </IconButton>
                                     </Tooltip>):("")):(
                                     <Tooltip title="Click to view child items">
                                         <IconButton className="LocationSubItem__element__item__left__btn"
                                            onClick={()=>showMore(index)}>
                                                <ChevronRightIcon/>
                                        </IconButton>
                                     </Tooltip>
                                )
                            )}
                            <div className={`LocationSubItem__element__item__left__label ${item.isOpen?'active':''}`}>
                                        {item.nodeName}
                            </div>
                            {projectDetailsState?.projectPermission.canUpdateLocation &&(
                                 <Tooltip title={`Edit ${item.nodeName}`}>
                                 <IconButton className="LocationSubItem__element__item__left__edit" onClick={()=>editListItem(index)}>
                                     <EditIcon className="LocationSubItem__element__item__left__edit__icon"/>
                                 </IconButton>
                             </Tooltip>
                            )}
                        </div>
                        <div className="LocationSubItem__element__item__right">
                        {projectDetailsState?.projectPermission.canDeleteLocation &&(
                            <Tooltip title={`Delete ${item.nodeName} `}>
                                <IconButton className="LocationSubItem__element__item__right__btn" 
                                    onClick={()=>deleteLocationItem(index)}>
                                    <DeleteIcon className="LocationSubItem__element__item__right__btn__icon" />
                                </IconButton>
                            </Tooltip>)}
                        </div>
                    </div>):(                   
                        <EditLocationItem value={item} index={index}  parentNode={subListItem}/>
                    )}
                    {item.isOpen&& (<LocationSubItem subListItem={item}
                                    subItemIndex={`${subItemIndex}-${index}`}/>)}
                    </>)}
                    {showAddNew &&(<div className="LocationSubItem__element__newitem">
                        <TextField variant="outlined" 
                            data-testid="add-newitem-input"
                            className="LocationSubItem__element__newitem__input" 
                            //onBlur={(e)=>onNewItemBlur(e)}
                            autoFocus
                            onChange={(e)=> changeInNewItemName(e)} value={newItemName} placeholder="Enter an Item name"/>  
                            {newItemError?(
                            <div data-testid="fornmnameerror" className="LocationSubItem__element__newitem__error"> 
                                List item name is required</div>):isNewItemDuplicate?(
                            <div data-testid="fornmnameerror" className="LocationSubItem__element__newitem__error"> 
                               List item name already exists</div>):newItemName.trim().length>50?(
                            <div data-testid="fornmnameerror" className="LocationSubItem__element__newitem__error"> 
                                List item name is too long (maximum is 50 charecters)
                            </div>
                        ):("")}
                    </div>)}
                    { projectDetailsState?.projectPermission.canCreateLocation && !showAddNew ?(
                    <div className="LocationSubItem__element__addItem">
                         <Button data-testid="add-newitem"
                         className="LocationSubItem__element__addItem__btn" onClick={()=>setShowAddNew(true)}>
                        + Click to add list item
                      </Button>
                    </div>):(
                         projectDetailsState?.projectPermission.canCreateLocation &&
                    <div className="LocationSubItem__element__addItem">
                        <Button className="LocationSubItem__element__addItem__btn" onClick={addNewItem}>Add List Item </Button>
                        <Button className="LocationSubItem__element__addItem__btn" onClick={cancelAddItem}>Cancel </Button>
                    </div>)}
                </div>
                {showConfirm?(<ConfirmDialog open={showConfirm} message={dialogData} 
                    close={()=>setShowConfirm(false)} proceed={confirmDelete}/>):("")}
             </div>
    )
}
