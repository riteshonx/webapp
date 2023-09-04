import React, { ReactElement, useContext, useEffect, useState } from 'react'
import { setFormName, setFormNameError, setIsDuplicate } from '../../context/templateCreation/action';
import { templateCreationContext } from '../../context/templateCreation/context';
import {CHECK_DUPLICATE_NAME} from '../../grqphql/queries/formTemplates';
import './TemplateName.scss';
import { FormsRoles } from '../../../../../utils/role';
import { useRouteMatch, match } from 'react-router-dom';
import { useDebounce } from '../../../../../customhooks/useDebounce';
import {client} from '../../../../../services/graphql';
import { TextField } from '@mui/material';
import { setEditMode } from 'src/modules/root/context/authentication/action';
import { stateContext } from 'src/modules/root/context/authentication/authContext';
import useBeforeunload from 'src/customhooks/useUnload';
export interface Params {
    id: string;
    featureId: string
}


export default function TemplateName(): ReactElement {
    const {createTemplateState, createTemplateDispatch }:any = useContext(templateCreationContext);
    const pathMatch:match<Params>= useRouteMatch();
    const {dispatch, state }:any = useContext(stateContext);
    const debounceName = useDebounce(createTemplateState.formName,300);
    const [textError,setTextError] = useState(false)

    
    useBeforeunload((event: any) => {
        if(state.editMode) {
            event.preventDefault();
        }
    });

    useEffect(() => {
        return () => {
          dispatch(setEditMode(false));
        }
      }, [])

    useEffect(() => {
        if((pathMatch.params.id || pathMatch.params.featureId) && createTemplateState.featureId>-1){
            checkTemplateNameDuplicate();
        }
    }, [debounceName, createTemplateState.featureId])

    const checkTemplateNameDuplicate= async ()=>{
        try{
            createTemplateDispatch(setIsDuplicate(false));
            const templateListData: any= await client.query({
                query:CHECK_DUPLICATE_NAME,
                variables:{
                    templateName:`${debounceName.trim()}`,
                    featureId: createTemplateState.featureId
                },
                fetchPolicy: 'network-only',context:{role: FormsRoles.viewFormTemplate}
            });
            if(createTemplateState.isEdit && templateListData.data.formTemplates.length>0){
                if(templateListData.data.formTemplates[0].id!== Number(pathMatch.params.id)){
                    createTemplateDispatch(setIsDuplicate(true));
                } else{
                    createTemplateDispatch(setIsDuplicate(false)); 
                }
            } else if(templateListData.data.formTemplates.length>0){
                createTemplateDispatch(setIsDuplicate(true));
            } else{
                createTemplateDispatch(setIsDuplicate(false));
            }
        }
        catch(error){

        }
    }


    const changeInName=(e: any)=>{
        if(!state.editMode){
            dispatch(setEditMode(true));
        }
        if(e.target.value.length>50){
            setTextError(true)
            return;
        }else{
            setTextError(false)
            createTemplateDispatch(setFormName(e.target.value));
        }
        if(e.target.value.trim()){
            createTemplateDispatch(setFormNameError(false));
        } else{
            createTemplateDispatch(setFormNameError(true));
        }
    }

    const saveTemplateName= async ()=>{
        if(!createTemplateState.formName){
            createTemplateDispatch(setFormNameError(true));
            dispatch(setEditMode(false));
        }
    }

    
    return (
        <div className="templateName">
            <TextField data-testid="fornmname" 
                variant="outlined"
                autoFocus={!!pathMatch.params.featureId}
                disabled={createTemplateState.systemGenerated} 
                className="templateName__input" 
                onBlur={saveTemplateName}
                onChange={changeInName} 
                value={createTemplateState.formName} 
                placeholder="Enter template name"/>  
            {createTemplateState.formNameError?(
            <div data-testid="fornmnameerror" className="templateName__error"> Template name is required</div>):createTemplateState.isDuplicate?(
            <div data-testid="fornmnameerror" className="templateName__error"> Template name already exists</div>):
            textError?(
                <div data-testid="fornmnameMaxLengtherror" className="templateName__error">
                     Template name is too long (maximum is 50 characters)
                </div>
            ):("")}
        </div>
    )
}
