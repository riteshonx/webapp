import './EditListItem.scss';

import { Button } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import DoneIcon from '@material-ui/icons/Done';
import React, { ReactElement, useContext, useEffect, useState } from 'react';
import { match, useRouteMatch } from 'react-router-dom';

import { useDebounce } from '../../../../../customhooks/useDebounce';
import { client } from '../../../../../services/graphql';
import { CustomListRoles } from '../../../../../utils/role';
import ConfirmDialog from '../../../../shared/components/ConfirmDialog/ConfirmDialog';
import Notification, { AlertTypes } from '../../../../shared/components/Toaster/Toaster';
import { setListOfConfigValues } from '../../context/createUpdateList/customListActiions';
import { customListCreateUpdateContext } from '../../context/createUpdateList/customListContext';
import {
    CHECK_CHILD_NODE_DUPLICATE,
    CHECK_PARENT_NODE_DUPLICATE,
    UPDATE_CUSTOM_LIST_VALUE_NAME,
} from '../../graphql/queries/customList';

interface Props {
    index: string,
    value: string,
    relationShip: string,
    isEdit: boolean
}

export interface Params {
    id: string;
}

const confirmMessage = {
    header: "Are you sure?",
    text: "If you update the name, that will not adjust historical data and will only affect future data",
    cancel: "Go back",
    proceed: "Yes, I\'m sure",
}

function EditListItem({value, index, relationShip, isEdit}: Props): ReactElement {
    const [name, setName] = useState('');
    const [currentNode, setcurrentNode] = useState<any>(null)
    const [listItemError, setlistItemError] = useState(false);
    const [isListItemDuplicate, setIsListItemDuplicate] = useState(false);
    const debounceName = useDebounce(name,300);
    const { customListState, customListDispatch }:any = useContext(customListCreateUpdateContext);
    const pathMatch:match<Params>= useRouteMatch();
    const [showConfirm, setShowConfirm] = useState(false);
    const [isValidating, setIsValidating] = useState(false)
    const [listItemTextError,setListItemTextError] = useState(false)
    
    useEffect(() => {
        setName(value);
        const list= [...customListState.listOfConfigValues];
        if(relationShip== 'PARENT'){
            setcurrentNode(list[Number(index)])
        }
        if(relationShip== 'CHILD'){
            const indexs= index.split('-');
            setcurrentNode( list[Number(indexs[0])].childItems[Number(indexs[1])]);
        }
        if(relationShip== 'GRANDCHILD'){
            const indexs= index.split('-');
            setcurrentNode(list[Number(indexs[0])].childItems[Number(indexs[1])].childItems[Number(indexs[2])]);
        }

    }, [value])

    useEffect(() => {
       if(debounceName.trim()){
            if(isEdit){
                validateEditedListItemName();
            } else{
                validateUpdateName();
            }
       } else{
        setIsListItemDuplicate(false);
       }
    }, [debounceName]);

    const validateEditedListItemName=async ()=>{
        try{
            setIsValidating(true);
            if(relationShip==='PARENT'){
                const response: any = await client.query({
                    query: CHECK_PARENT_NODE_DUPLICATE,
                    variables:{
                        nodeName:`${debounceName.trim()}`,
                        configListId: Number(pathMatch.params.id)
                    },
                    context:{role: CustomListRoles.viewCustomList}
                });
                if(response.data.configurationValues.length>0){
                    if(response.data.configurationValues[0].id !== currentNode?.id?currentNode.id:''){
                    return setIsListItemDuplicate(true);
                    }
                } 
                setIsListItemDuplicate(false);
                setIsValidating(false);
            } else{
                const response: any = await client.query({
                    query: CHECK_CHILD_NODE_DUPLICATE,
                    variables:{
                        parentId: currentNode.parentId,
                        nodeName:`${debounceName.trim()}`,
                        configListId: Number(pathMatch.params.id)
                    },
                    context:{role: CustomListRoles.viewCustomList}
                });
                if(response.data.configurationValues.length>0){
                    if(response.data.configurationValues[0].id !== currentNode.id){
                    return setIsListItemDuplicate(true);
                    }
                } 
                setIsListItemDuplicate(false);
                setIsValidating(false);
            }
        } catch(error: any){
            setIsValidating(false);
        }
    }

    const validateUpdateName=()=>{
        const list= [...customListState.listOfConfigValues];
        if(relationShip== 'PARENT'){
           const duplicateItems= list.filter((item: any)=>{
             return  item.id !== currentNode.id && item.nodeName.trim().toLowerCase() === debounceName.trim().toLowerCase();
            });
            duplicateItems.length>0? setIsListItemDuplicate(true):setIsListItemDuplicate(false);
        }
        if(relationShip== 'CHILD'){
            const indexs= index.split('-');
            const subList= list[Number(indexs[0])];
            const duplicateItems= subList.childItems.filter((item: any)=>{
                return  item.id !== currentNode.id && item.nodeName.trim().toLowerCase() === debounceName.trim().toLowerCase();
            });
            duplicateItems.length>0? setIsListItemDuplicate(true):setIsListItemDuplicate(false);
        }
        if(relationShip== 'GRANDCHILD'){
            const indexs= index.split('-');
            const subList= list[Number(indexs[0])].childItems[Number(indexs[1])];
            const duplicateItems= subList.childItems.filter((item: any)=>{
                return  item.id !== currentNode.id && item.nodeName.trim().toLowerCase() === debounceName.trim().toLowerCase();
            });
            duplicateItems.length>0? setIsListItemDuplicate(true):setIsListItemDuplicate(false);
        }
    }

    const onBlur= (event: React.ChangeEvent<HTMLInputElement>)=>{
        if(!event.target.value.trim()){
            setlistItemError(true);
        } else{
            setlistItemError(false);
        }
    }
    const changeInNewItemName= (event: React.ChangeEvent<HTMLInputElement>)=>{
        setListItemTextError(false)
        setName(event.target.value);
        if(!event.target.value.trim()){
            setlistItemError(true);
        } else{
            setlistItemError(false);
        }
    }

    const updateName=()=>{
        try{
            if(isEdit && name.trim()){
                // confirmation for update 
                setShowConfirm(true);
            } else{
                updateValues();
            }
        } catch(error: any){
            console.log(error.messsage);
        }
    }

    const confirmUpdate=async ()=>{
        try{
            setShowConfirm(false)
            await client.mutate({
                mutation: UPDATE_CUSTOM_LIST_VALUE_NAME,
                variables:{
                    id: currentNode.id,
                    nodeName: name.trim()
                },
                context:{role: CustomListRoles.updateCustomList}
            })
            updateValues();
        }catch(error: any){
            Notification.sendNotification(
                error.message,
                AlertTypes.warn
              );
        }
    }

    const updateValues= async () => {
        const list= [...customListState.listOfConfigValues];
        if(relationShip== 'PARENT'){
            if(list[Number(index)].nodeName !== name.trim()){
                list[Number(index)].nodeNameEdited= true;
                list[Number(index)].nodeName= name;
            }
            list[Number(index)].isEdit= false;
            customListDispatch(setListOfConfigValues(list));
        }
        if(relationShip== 'CHILD'){
            const indexs= index.split('-');
            if(list[Number(indexs[0])].childItems[Number(indexs[1])].nodeName !== name.trim()){
                list[Number(indexs[0])].childItems[Number(indexs[1])].nodeNameEdited= true;
                list[Number(indexs[0])].childItems[Number(indexs[1])].nodeName= name.trim();
            }
            list[Number(indexs[0])].childItems[Number(indexs[1])].isEdit= false;
            customListDispatch(setListOfConfigValues(list));
        }
        if(relationShip== 'GRANDCHILD'){
            const indexs= index.split('-');
            if(list[Number(indexs[0])].childItems[Number(indexs[1])].childItems[Number(indexs[2])].nodeName !== name.trim()){
                list[Number(indexs[0])].childItems[Number(indexs[1])].childItems[Number(indexs[2])].nodeNameEdited= true;
                list[Number(indexs[0])].childItems[Number(indexs[1])].childItems[Number(indexs[2])].nodeName= name.trim();
            }
            list[Number(indexs[0])].childItems[Number(indexs[1])].childItems[Number(indexs[2])].isEdit= false;
            customListDispatch(setListOfConfigValues(list));
        }
    }

    const discardChange= ()=>{
        const list= [...customListState.listOfConfigValues];
        if(relationShip== 'PARENT'){
            list[Number(index)].isEdit= false;
            customListDispatch(setListOfConfigValues(list));
        }
        if(relationShip== 'CHILD'){
            const indexs= index.split('-');
            list[Number(indexs[0])].childItems[Number(indexs[1])].isEdit= false;
            customListDispatch(setListOfConfigValues(list));
        }
        if(relationShip== 'GRANDCHILD'){
            const indexs= index.split('-');
            list[Number(indexs[0])].childItems[Number(indexs[1])].childItems[Number(indexs[2])].isEdit= false;
            customListDispatch(setListOfConfigValues(list));
        }

    }

    return (
        <div className="EditListItem">
            <input data-testid={`Edit-list-${currentNode?.id?currentNode.id:''}`}
                            className="EditListItem__input" 
                            autoFocus
                            onBlur={(e)=>onBlur(e)}
                            onChange={(e)=> changeInNewItemName(e)} value={name} placeholder="Enter an Item name"/>
                       {listItemError?(
                            <div data-testid="fornmnameerror" className="EditListItem__error"> 
                                List item name is required</div>):isListItemDuplicate?(
                            <div data-testid="fornmnameerror" className="EditListItem__error"> 
                               List item name already exists
                            </div>
                        ):listItemTextError?(
                            <div data-testid="fornmnameerror" className="EditListItem__error"> 
                                List item name is too long (maximum is 50 characters)
                            </div>
                        ):("")}
            <div className="EditListItem__actions">
                <Button variant="outlined" className="EditListItem__actions__btn" onClick={updateName}
                data-testid={`update-item-${currentNode?.id?currentNode.id:''}`}
                    disabled={listItemError || isListItemDuplicate || isValidating}>
                    <DoneIcon className="EditListItem__actions__btn__icon"/> 
                </Button>

                <Button variant="outlined" className="EditListItem__actions__btn" 
                data-testid={`update-item-cancel-${currentNode?.id?currentNode.id:''}`}onClick={discardChange}>
                    <CloseIcon className="EditListItem__actions__btn__icon" /> 
                </Button>
            </div>
            <ConfirmDialog open={showConfirm} message={confirmMessage} 
                close={()=>setShowConfirm(false)}  proceed={confirmUpdate}/>
        </div>
    )
}

export default EditListItem
