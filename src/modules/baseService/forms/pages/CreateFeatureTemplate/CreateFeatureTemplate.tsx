import React, {ReactElement, useReducer, useEffect, useContext, useState} from 'react';
import Grid from '@material-ui/core/Grid';
import VisibilityIcon from '@material-ui/icons/Visibility';
import Button from '@material-ui/core/Button';
import './CreateFeatureTemplate.scss';
import {createTemplateReducer,createTemplateInitial} from '../../context/templateCreation/reducer';
import { templateCreationContext} from '../../context/templateCreation/context';
import FieldType from '../../components/FieldType/FieldType';
import TemplateFields from '../../components/TemplateFields/TemplateFields';
import { useHistory } from 'react-router-dom';
import { FormsRoles } from '../../../../../utils/role';
import { stateContext } from '../../../../root/context/authentication/authContext';
import { setEditMode, setIsLoading, setPreviousFeature } from '../../../../root/context/authentication/action';
import Preview from '../../components/Preview/Preview';
import { TemplateData, TemplateDatePayload } from '../../models/template';
import { client } from '../../../../../services/graphql';
import Notification,{ AlertTypes } from '../../../../shared/components/Toaster/Toaster';
import { useDebounce } from '../../../../../customhooks/useDebounce';
import { INSERT_FORM, LOAD_PRODUCT_FEATURES_BY_NAME } from '../../grqphql/queries/projectFeature';
import { setAutoGeneratedFields, setFormName, setTemplateList, setFormNameError } from '../../context/templateCreation/action';
import { LOAD_DEFAULT_TEMPLATES } from '../../grqphql/queries/formTemplates';
import { canCreateTemplate } from '../../utils/permission';
import { v4 as uuidv4 } from 'uuid';
import { confirmMessage, fetchTemplatePayload } from 'src/modules/baseService/formConsumption/utils/formHelper';
import { TextField } from '@material-ui/core';
import useBeforeunload from 'src/customhooks/useUnload';
import ConfirmDialog from 'src/modules/shared/components/ConfirmDialog/ConfirmDialog';
import CommonHeader from "../../../../shared/components/CommonHeader/CommonHeader"

export interface Params {
    featureId: string;
}


export default function CreateFeatureTemplate(): ReactElement {
    const [createTemplateState, createTemplateDispatch] = useReducer(createTemplateReducer, createTemplateInitial);
    const {dispatch, state }:any = useContext(stateContext);
    const history= useHistory();
    const [preview, setpreview] = useState(false);
    const [productFeaturName, setProductFeaturName] = useState('');
    const [featureNameError, setFeatureNameError] = useState(false);
    const [isDuplicate, setIsDuplicate] = useState(false)
    const debounceName = useDebounce(productFeaturName,300);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [textError,setTextError] = useState(false)

    useBeforeunload((event: any) => {
        if(state.editMode) {
            event.preventDefault();
        }
    });
    
    useEffect(() => {
        const value=debounceName.trim();
        if(value){
            getFormByName();
        } else{
            setIsDuplicate(false);
        }
    }, [debounceName])

    useEffect(() => {
        if(canCreateTemplate){
            fetchDefaultfields();
        } else{
            // Notification.sendNotification('You don\'t have permission to performthis action',AlertTypes.warn);
            history.push('/pagenotfound');
            dispatch(setEditMode(false));
        }
    }, [])

    const getFormByName= async ()=>{
        try{
            setIsDuplicate(false);
            const templateListData: any= await client.query({
                query:LOAD_PRODUCT_FEATURES_BY_NAME,
                variables:{
                    feature:`${debounceName.trim()}`
                },
                fetchPolicy: 'network-only',context:{role: FormsRoles.viewFormTemplate}
            });
            if(templateListData.data.projectFeature.length>0){
                setIsDuplicate(true);
            } else{
                setIsDuplicate(false);
            }
        }
        catch(error){
            console.log(error);
        }
    }

    const close=()=>{
        setpreview(false);
    }

    const previewTemplate=()=>{
        if(createTemplateState.templateList.length>0){
            setpreview(true);
        }
    }

    const backToList=()=>{
        dispatch(setIsLoading(true));
        if(state.editMode){
            dispatch(setEditMode(false));
            setTimeout(() => {
                history.push('/base/forms');       
            }, 100);
        } else{
            history.push('/base/forms');    
        }
    }

    const fetchDefaultfields= async ()=>{
        try{
            dispatch(setIsLoading(true));
            const templateFieldData= await client.query({
                query: LOAD_DEFAULT_TEMPLATES,
                variables:{featureId: 0},
                fetchPolicy: 'network-only',context:{role: FormsRoles.createFormTemplate}
            });
            setDefaultTemplateFieldsData(templateFieldData.data);
            dispatch(setIsLoading(false));
        }catch(error){
            dispatch(setIsLoading(false));
        }
    }

    const setDefaultTemplateFieldsData=(argData: any)=>{
        if(argData.defaultFormTemplates && argData.defaultFormTemplates.length){
            let templateFields: TemplateData[]=[];
            argData.defaultFormTemplates[0].templateData.forEach((item: any)=>{
                const newTemplate: TemplateData={
                    id: uuidv4(),
                    fixed:item.fixed,
                    caption:item.caption,
                    required: item.required?1:0,
                    sequence: item.sequence,
                    elementId:item.elementId,
                    fieldTypeId: item.fieldTypeId,
                    width:6,
                    configListId: -1,
                    updated: false,
                    originalCaption: item.caption,
                    duplicateCaption: false,
                    autoGenerated:item.autoGenerated
                }
                if(item.autoGenerated){
                    newTemplate.autoGenerated=item.autoGenerated;
                }
                templateFields.push(newTemplate);
            })
            let autoGeneratedFields: any[]=[];
             templateFields.forEach((item: any)=>{
                if(item.autoGenerated){
                    if(item.autoGenerated){
                        autoGeneratedFields.push(item);
                    }
                }
            });
            autoGeneratedFields=autoGeneratedFields.sort((a, b) => {
                if (a.sequence < b.sequence)
                  return -1;
                if (a.sequence > b.sequence)
                  return 1;
                return 0;
            });
            createTemplateDispatch(setAutoGeneratedFields(autoGeneratedFields));
            templateFields=templateFields.sort((a, b) => {
                if (a.sequence < b.sequence)
                  return -1;
                if (a.sequence > b.sequence)
                  return 1;
                return 0;
              });
            createTemplateDispatch(setTemplateList(templateFields));
            dispatch(setIsLoading(false));
       }
    }

    const saveTemplate= async ()=>{
        try{
            if(!productFeaturName ){
                setIsDuplicate(false);
                setFeatureNameError(true);
                return;
            }
            if( isDuplicate || featureNameError){
                return;
            }
            const duplicateCaption=createTemplateState.templateList.filter(item=>{
                return item.duplicateCaption;
            })
            if(duplicateCaption.length>0){
                return;
            }
            if(createTemplateState.templateList.length && createTemplateState.formName && productFeaturName){
                if(state.editMode){
                    dispatch(setEditMode(false));
                }
                const fields:TemplateDatePayload[]= fetchTemplatePayload(createTemplateState.templateList, false);
                dispatch(setIsLoading(true));
                const responseData= await client.mutate({mutation:INSERT_FORM,variables:{
                        featureName: productFeaturName,
                        templateData: fields,
                        templateName: createTemplateState.formName
                    },context:{role: FormsRoles.createFormTemplate}});
                Notification.sendNotification('Created form successfully',AlertTypes.success);
                if(responseData.data.insertOpenFormFeatureTemplate_mutation.formFeatureId){
                    dispatch(setPreviousFeature(responseData.data.insertOpenFormFeatureTemplate_mutation.formFeatureId));
                }
                history.push(`/base/forms/${responseData.data.insertOpenFormFeatureTemplate_mutation.formFeatureId}`);
            }
        }
        catch(error: any){
            const message=error.message;
            Notification.sendNotification(message,AlertTypes.error);
            dispatch(setIsLoading(false));
        }
    }

    const onBlur= (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>)=>{
        if(!event.target.value.trim()){
            setFeatureNameError(true);
        } else{
            setFeatureNameError(false);
            if(!createTemplateState.formName.trim()){
                createTemplateDispatch(setFormName(event.target.value));
                createTemplateDispatch(setFormNameError(false));
            } 
        }
    }

    const onFormNameChange= (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=>{
        if(!state.editMode){
            dispatch(setEditMode(true));
        }
        if(event.target.value.length>50){
            setTextError(true)
            return;
        }else{
            setTextError(false)
            setProductFeaturName(event.target.value);
        }
        if(!event.target.value.trim()){
            setFeatureNameError(true);
        } else{
            setFeatureNameError(false);
        }
    }

    const discardChanges=()=>{
        if(state.editMode){
            setConfirmOpen(true);
        } else{
            backToList();
        }
    }
    const navigateBack = ()=>{
        history.goBack()
    }
    const headerInfo = {
        name:"Create Form",
        description:""
    }
    return (
        <templateCreationContext.Provider value={{createTemplateState,createTemplateDispatch}} >
        <div className="createForm">
           <div className="createForm__header">
                <div className="createForm__header__left" >
                <CommonHeader navigate={navigateBack} headerInfo={headerInfo} className="createForm_header_left_commonHeader"/>
                    <div className="createForm__header__left__title">
                        <TextField data-testid="formFeatureName"
                         variant="outlined"
                        className="createForm__header__left__title__input"
                        onBlur={(e)=>onBlur(e)}
                        autoFocus={true}
                        onChange={(e)=> onFormNameChange(e)} 
                        value={productFeaturName}
                         placeholder="Enter form name"/>  
                        {featureNameError?(
                            <div data-testid="formFeatureNameRequiredError" className="createForm__header__left__title__error"> 
                                Form name is required</div>):isDuplicate?(
                            <div data-testid="formFeatureNameError" className="createForm__header__left__title__error"> 
                                Form name already exists</div>):
                                textError?(
                                     <div data-testid="formFeatureNameMaxCharecterError" className="createForm__header__left__title__error"> 
                                     Form name is too long (maximum is 50 characters)</div>
                                ):("")}
                    </div>
                    <div className="createForm__header__left__subtitle">* Fields are mandatory</div>
                </div>
                <div className="createForm__header__action">
                    <Button className="createForm__header__action__preview" 
                        disabled={createTemplateState.templateList.filter(item=>!item.autoGenerated).length===0}
                        onClick={previewTemplate} data-testid="create-template-preview"> 
                        <VisibilityIcon className="createForm__header__action__preview__icon"/>
                        <span className="createForm__header__action__preview__text"> Preview</span> 
                    </Button>
                    <Button variant="outlined"  className="createForm__header__action__discardbtn btn-secondary" 
                        onClick={discardChanges} data-testid="create-template-discard">Discard</Button>
                    <Button variant="outlined" className="btn-primary"
                        disabled={createTemplateState.templateList.length===0 ||
                             !createTemplateState.formName || featureNameError ||
                             isDuplicate|| createTemplateState.formNameError || createTemplateState.isDuplicate ||
                             createTemplateState.formName.trim().length>50 || productFeaturName.trim().length>50}
                     onClick={saveTemplate} data-testid="create-template-save" >Create</Button>
                </div>
            </div>
            <Grid container className="createForm__body">
                <Grid item xs={4} className="createForm__body__fieldsContainer">
                    <FieldType/>
                </Grid>
                <Grid item xs={8} className="createForm__body__fieldsElements">
                    <TemplateFields/>
                </Grid>
            </Grid>
           {preview?(<div className="createForm__preview">
                 <Preview closePreview={close} templateFieldList={createTemplateState.templateList}  
                  autoGeneratedFields={createTemplateState.autoGeneratedFields} formName={createTemplateState.formName}/>
            </div>):("")}
            {<ConfirmDialog open={confirmOpen} message={confirmMessage} close={()=>setConfirmOpen(false)} proceed={backToList} />}
        </div>
        </templateCreationContext.Provider>
    )
}
