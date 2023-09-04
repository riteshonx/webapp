import React, {ReactElement, useReducer, useEffect, useContext, useState} from 'react';
import Grid from '@material-ui/core/Grid';
import VisibilityIcon from '@material-ui/icons/Visibility';
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";
import Button from '@material-ui/core/Button';
import './CreateTemplate.scss';
import {createTemplateReducer,createTemplateInitial} from '../../context/templateCreation/reducer';
import { templateCreationContext} from '../../context/templateCreation/context';
import FieldType from '../../components/FieldType/FieldType';
import TemplateFields from '../../components/TemplateFields/TemplateFields';
import { useHistory, useRouteMatch, match } from 'react-router-dom';
import { FormsRoles } from '../../../../../utils/role';
import { LOAD_PRODUCT_FEATURES_DETAILS } from '../../grqphql/queries/projectFeature';
import { stateContext } from '../../../../root/context/authentication/authContext';
import { setEditMode, setIsLoading } from '../../../../root/context/authentication/action';
import { setAutoGeneratedFields, setFeatureId, setFormNameError, setIsDuplicate, setTemplateList,
setFormFeatureType } from '../../context/templateCreation/action';
import Preview from '../../components/Preview/Preview';
import { CREATE_TEMPLATE, LOAD_DEFAULT_TEMPLATES } from '../../grqphql/queries/formTemplates';
import { TemplateData, TemplateDatePayload } from '../../models/template';
import {canCreateTemplate} from '../../utils/permission';
import { client } from '../../../../../services/graphql';
import Notification,{ AlertTypes } from '../../../../shared/components/Toaster/Toaster';
import ConfirmDialog from '../../../../shared/components/ConfirmDialog/ConfirmDialog';
import { v4 as uuidv4 } from 'uuid';
import { confirmMessage, fetchTemplatePayload } from 'src/modules/baseService/formConsumption/utils/formHelper';
import useBeforeunload from "src/customhooks/useUnload";
import CommonHeader from "../../../../shared/components/CommonHeader/CommonHeader"
  
export interface Params {
    featureId: string;
}


export default function CreateTemplate(): ReactElement {
    const [createTemplateState, createTemplateDispatch] = useReducer(createTemplateReducer, createTemplateInitial);
    const currentMatch:match<Params>= useRouteMatch();
    const {dispatch, state }:any = useContext(stateContext);
    const history= useHistory();
    const [preview, setpreview] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [inactiveBtn, setInactiveBtn] = useState(false);
    
    useEffect(() => {
        if(canCreateTemplate){
            getProductFeatureDetails();
        } else{
            history.push('/pagenotfound');
        }
        return () => {
            dispatch(setEditMode(false));
        }
    }, [])

    useBeforeunload((event: any) => {
        if(state.editMode) {
            event.preventDefault();
        }
    });

    const fetchDefaultfields= async (argTemplateId: number)=>{
        try{
            dispatch(setIsLoading(false));
            const templateFieldData= await client.query({
                query: LOAD_DEFAULT_TEMPLATES,
                variables:{featureId: argTemplateId},
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
                        metadata:null,
                        duplicateCaption: false,
                        showNumberColumn: false,
                        autoGenerated:item.autoGenerated
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


    const getProductFeatureDetails=async ()=>{

        try{
            const formListData= await client.query({
                query:LOAD_PRODUCT_FEATURES_DETAILS,
                variables: {
                    featureId: Number(currentMatch.params.featureId)
                },
                fetchPolicy: 'network-only',
                context:{role: FormsRoles.viewFormTemplate}
            });
            if(formListData.data.projectFeature.length>0){
                if(formListData.data.projectFeature[0].tenantId){
                    createTemplateDispatch(setFormFeatureType('OPEN'));
                    fetchDefaultfields(0);
                } else{
                    createTemplateDispatch(setFormFeatureType('SYSTEM'));
                    fetchDefaultfields(Number(currentMatch.params.featureId));
                }
                createTemplateDispatch(setFeatureId(Number(currentMatch.params.featureId)))
            } else{
                Notification.sendNotification('Invalid Project feature',AlertTypes.warn);
                history.push('/base/forms');
                dispatch(setIsLoading(false));
            }
        }
        catch(error){
            dispatch(setIsLoading(false));
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

    const saveTemplate= async ()=>{
        try{
            if(!createTemplateState.formName ){
                createTemplateDispatch(setIsDuplicate(false));
                createTemplateDispatch(setFormNameError(true));
                return;
            }
            if( createTemplateState.isDuplicate){
                return;
            }
            const duplicateCaption=createTemplateState.templateList.filter(item=>{
                return item.duplicateCaption;
            })
            if(duplicateCaption.length>0){
                return;
            }
            if(createTemplateState.templateList.length && createTemplateState.formName && currentMatch.params.featureId){
                setInactiveBtn(true)
            const fields:TemplateDatePayload[]= fetchTemplatePayload(createTemplateState.templateList, false);
                dispatch(setIsLoading(true));
                if(state.editMode){
                    dispatch(setEditMode(false));
                }
                 await client.mutate({mutation:CREATE_TEMPLATE,variables:{
                    featureId: Number(currentMatch.params.featureId),
                    objects: fields,
                    templateName: createTemplateState.formName,
                    formType: createTemplateState.formFeatureType,
                },context:{role: FormsRoles.createFormTemplate}});
                Notification.sendNotification('Created form template successfully',AlertTypes.success);
                history.push('/base/forms');
            }
        }
        catch(error: any){
            const message=error?.message;
            setInactiveBtn(false)
            Notification.sendNotification(message,AlertTypes.error);
            dispatch(setIsLoading(false));
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
        name:"Create Template",
        description:"* Fields are mandatory"
    }
    return (
        <templateCreationContext.Provider value={{createTemplateState,createTemplateDispatch}} >
        <div className="createTemplate">
           <div className="createTemplate__header">
                <div className="createTemplate__header__left" >
                    <CommonHeader navigate={navigateBack} headerInfo={headerInfo}/>
                </div>
                <div className="createTemplate__header__action">
                    <Button className="createTemplate__header__action__preview" 
                        disabled={createTemplateState.templateList.filter(item=>!item.autoGenerated).length===0}
                        onClick={previewTemplate} data-testid="create-template-preview"> 
                        <VisibilityIcon className="createTemplate__header__action__preview__icon"/>
                        <span className="createTemplate__header__action__preview__text"> Preview</span> 
                    </Button>
                    <Button variant="outlined"  className="createTemplate__header__action__discardbtn btn-secondary" 
                        onClick={discardChanges} data-testid="create-template-discard">Discard</Button>
                    <Button variant="outlined" className="btn-primary"
                        disabled={createTemplateState.templateList.length===0 ||
                         !createTemplateState.formName || createTemplateState.formNameError || createTemplateState.isDuplicate ||
                          createTemplateState.formName.trim().length>50 || inactiveBtn}
                     onClick={saveTemplate} data-testid="create-template-save" >Create</Button>
                </div>
            </div>
            <Grid container className="createTemplate__body">
                <Grid item xs={4} className="createTemplate__body__fieldsContainer">
                    <FieldType/>
                </Grid>
                <Grid item xs={8} className="createTemplate__body__fieldsElements">
                    <TemplateFields/>
                </Grid>
            </Grid>
           {preview?(<div className="createTemplate__preview">
                 <Preview closePreview={close} templateFieldList={createTemplateState.templateList}  formName={createTemplateState.formName}
                 autoGeneratedFields={createTemplateState.autoGeneratedFields}/>
            </div>):("")}
            {<ConfirmDialog open={confirmOpen} message={confirmMessage} close={()=>setConfirmOpen(false)} proceed={backToList} />}
        </div>
        </templateCreationContext.Provider>
    )
}
