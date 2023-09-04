import React, { ReactElement, useState, useEffect, useContext } from 'react'
import DoneIcon from '@material-ui/icons/Done';
import { Button, TextField } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import './EditLocationItem.scss';
import { useDebounce } from '../../../../../customhooks/useDebounce';
import { client } from '../../../../../services/graphql';
import { ProjectSetupRoles } from '../../../../../utils/role';
import { match, useRouteMatch } from 'react-router-dom';
import ConfirmDialog from '../../../../shared/components/ConfirmDialog/ConfirmDialog';
import { LocationNode } from '../../models/location';
import { locationContext } from '../../../context/locationContext';
import { CHECK_NODE_NAME_DUPLICATE, UPDATE_LOCATION_NODE_NAME } from '../../graphql/queries/location';
import { stateContext } from '../../../../root/context/authentication/authContext';
import { projectDetailsContext } from '../../../projects/Context/ProjectDetailsContext';

interface Props {
    index: number,
    value: LocationNode|null,
    parentNode:  LocationNode
}

interface Params {
    projectId: string;
}

const confirmMessage = {
    header: "Are you sure?",
    text: "If you update the name, that will not adjust historical data and will only affect future data",
    cancel: "Go back",
    proceed: "Yes, I\'m sure",
}

function EditLocationItem({value, index, parentNode}: Props): ReactElement {
    const [name, setName] = useState('');
    const [currentNode, setcurrentNode] = useState<any>(null)
    const [listItemError, setlistItemError] = useState(false);
    const [isListItemDuplicate, setIsListItemDuplicate] = useState(false);
    const debounceName = useDebounce(name,300);
    const pathMatch:match<Params>= useRouteMatch();
    const [showConfirm, setShowConfirm] = useState(false);
    const { locationValues,updateValues }: any = useContext(locationContext);
    const { state }: any = useContext(stateContext);
    const {projectDetailsState}: any = useContext(projectDetailsContext);
    
    useEffect(() => {
        if(value){
            setName(value?.nodeName);
            setcurrentNode(value);
        }
    }, [value])

    useEffect(() => {
       if(isListItemDuplicate){
          const duplicates=  parentNode.childNodes.filter((item: LocationNode)=>item.nodeName.trim().toLocaleUpperCase() ===
           name.trim().toLocaleUpperCase() && value?.id !== item.id);
         if(duplicates.length===0){
            setIsListItemDuplicate(false);
         }
       }
    }, [locationValues])

    useEffect(() => {
       if(debounceName.trim()){
            validateUpdateName();
       } else{
        setIsListItemDuplicate(false);
       }
    }, [debounceName]);

    const validateUpdateName=async ()=>{
        try{
            const response: any= await  client.query({
                query: CHECK_NODE_NAME_DUPLICATE,
                variables:{
                    parentId: currentNode.parentId,
                    nodeName: `${debounceName.trim()}`
                },
                fetchPolicy:'network-only',
                context:{role: ProjectSetupRoles.viewLocation, token: projectDetailsState.projectToken}
            })
            if(response.data.projectLocationTree.length>0){
                if(response.data.projectLocationTree[0].id!==currentNode.id){
                    setIsListItemDuplicate(true);
                    return;
                }
            }
            setIsListItemDuplicate(false);
        }
        catch(error: any){
            console.log(error);
        }
    }

    const onBlur= (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>)=>{
        if(!event.target.value.trim()){
            setlistItemError(true);
        } else{
            setlistItemError(false);
        }
    }
    const changeInNewItemName= (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=>{
        setName(event.target.value);
        if(!event.target.value.trim()){
            setlistItemError(true);
        } else{
            setlistItemError(false);
        }
    }

    const updateName=()=>{
        setShowConfirm(true);
    }

    const confirmUpdate=async ()=>{
        try{
            await client.mutate({
                mutation: UPDATE_LOCATION_NODE_NAME,
                variables:{
                    id: currentNode.id,
                    name: name.trim()
                },
                context:{role: ProjectSetupRoles.updateLocation, token: projectDetailsState.projectToken}
            })
            setShowConfirm(false)
            currentNode.nodeName=name;
            currentNode.isEdit=false;
            updateValues();
        } catch(error: any){
            console.log(error.message);
        }
    }

    const discardChange= ()=>{
        currentNode.isEdit=false;
        updateValues();
    }

    return (
        <div className="EditLocationItem">
            <TextField variant="outlined" data-testid={`Edit-list-${currentNode?.id?currentNode.id:''}`}
                            className="EditLocationItem__input" 
                            autoFocus
                            onBlur={(e)=>onBlur(e)}
                            onChange={(e)=> changeInNewItemName(e)} value={name} placeholder="Enter an Item name"/>
                       {listItemError?(
                            <div data-testid="fornmnameerror" className="EditLocationItem__error"> 
                                List item name is required</div>):isListItemDuplicate?(
                            <div data-testid="fornmnameerror" className="EditLocationItem__error"> 
                               List item name already exists
                            </div>
                        ):name.trim().length>50?(
                            <div data-testid="fornmnameerror" className="EditLocationItem__error"> 
                                List item name is too long (maximum is 50 charecters)
                            </div>
                        ):("")}
            <div className="EditLocationItem__actions">
                <Button variant="outlined" className="EditLocationItem__actions__btn" onClick={updateName}
                data-testid={`update-item-${currentNode?.id?currentNode.id:''}`}
                    disabled={listItemError||isListItemDuplicate || name.trim().length>50}>
                    <DoneIcon className="EditLocationItem__actions__btn__icon"/> 
                </Button>

                <Button variant="outlined" className="EditLocationItem__actions__btn" 
                data-testid={`update-item-cancel-${currentNode?.id?currentNode.id:''}`}onClick={discardChange}>
                    <CloseIcon className="EditLocationItem__actions__btn__icon" /> 
                </Button>
            </div>
            <ConfirmDialog open={showConfirm} message={confirmMessage} 
                close={()=>setShowConfirm(false)}  proceed={confirmUpdate}/>
        </div>
    )
}

export default EditLocationItem
