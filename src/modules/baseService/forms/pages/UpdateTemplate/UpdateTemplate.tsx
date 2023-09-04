import React, {ReactElement, useReducer, useEffect, useContext, useState} from 'react';
import Grid from '@material-ui/core/Grid';
import VisibilityIcon from '@material-ui/icons/Visibility';
import './UpdateTemplate.scss';
import {createTemplateReducer,createTemplateInitial} from '../../context/templateCreation/reducer';
import { templateCreationContext} from '../../context/templateCreation/context';
import FieldType from '../../components/FieldType/FieldType';
import TemplateFields from '../../components/TemplateFields/TemplateFields';
import { useHistory, useRouteMatch, match } from 'react-router-dom';
import { FormsRoles } from '../../../../../utils/role';
import { BULK_UPDATE_TEMPLATE, LOAD_TEMPLATE_DETAILS } from '../../grqphql/queries/formTemplates';
import { stateContext } from '../../../../root/context/authentication/authContext';
import { setEditMode, setIsLoading } from '../../../../root/context/authentication/action';
import Notification,{ AlertTypes } from "../../../../shared/components/Toaster/Toaster";
import Preview from '../../components/Preview/Preview';
import { setAutoGeneratedFields, setFeatureId, setFormCurrentTab, setFormFeatureType, setFormName, setIsEdit,
     setOriginalTemplateList,
     setSystemGenerated, setTemplateId, setTemplateList } from '../../context/templateCreation/action';
import { TemplateData } from '../../models/template';
import { client } from '../../../../../services/graphql';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import { Button } from '@material-ui/core';
import { InputType } from '../../../../../utils/constants';
import { canUpdateTemplates } from '../../utils/permission';
import { v4 as uuidv4 } from 'uuid';
import { confirmMessage, fetchTemplatePayload, isFieldDuplicateOrRequired } from 'src/modules/baseService/formConsumption/utils/formHelper';
import { LOAD_PRODUCT_FEATURES_DETAILS } from '../../grqphql/queries/projectFeature';
import useBeforeunload from "src/customhooks/useUnload";
import ConfirmDialog from 'src/modules/shared/components/ConfirmDialog/ConfirmDialog';
export interface Params {
    id: string;
}

export default function UpdateTemplate(): ReactElement {
    const [createTemplateState, createTemplateDispatch] = useReducer(createTemplateReducer, createTemplateInitial);
    const pathMatch:match<Params>= useRouteMatch();
    const {dispatch, state }:any = useContext(stateContext);
    const history= useHistory();
    const [preview, setpreview] = useState(false);
    const [templateName, setTemplateName] = useState('');
    const [confirmOpen, setConfirmOpen] = useState(false);

    useBeforeunload((event: any) => {
        if(state.editMode) {
            event.preventDefault();
        }
    });
    
    useEffect(() => {
        if(canUpdateTemplates){
            getFormTemplateList();
            createTemplateDispatch(setIsEdit(true));
            createTemplateDispatch(setTemplateId(Number(pathMatch.params.id)));
        } else{
            history.push('/pagenotfound');
        }
        return () => {
            createTemplateDispatch(setIsEdit(false));
            dispatch(setEditMode(false));
        }
    }, [])

    const getFormTemplateList= async ()=>{
        try{
            dispatch(setIsLoading(true));
            const formTemplateDetails= await client.query({
                query: LOAD_TEMPLATE_DETAILS,
                variables: {templateId: Number(pathMatch.params.id)},
                fetchPolicy: 'network-only',context:{role: FormsRoles.viewFormTemplate}
            })
            if(formTemplateDetails.data.formTemplates.length>0){
                const formTemplateData= JSON.parse(JSON.stringify(formTemplateDetails.data.formTemplates));
                createTemplateDispatch(setFormName(formTemplateData[0].templateName));
                setTemplateName(formTemplateData[0].templateName);
                createTemplateDispatch(setSystemGenerated(formTemplateData[0].systemGenerated));
                let templateDataList: Array<TemplateData>= [];
                if(formTemplateData[0].formTemplateVersions.length){
                    createTemplateDispatch(setFeatureId(formTemplateData[0].featureId));
                    getFeatureDetails(formTemplateData[0].featureId);
                    formTemplateData[0].formTemplateVersions[0].formTemplateFieldData.forEach((item: any)=>{
                        const newTemplateData: TemplateData={
                            id: uuidv4(),
                            fixed: item.fixed,
                            caption: item.caption,
                            required: item.required?1:0,
                            sequence: item.sequence,
                            elementId: item.elementId,
                            fieldTypeId: item.fieldTypeId,
                            width: item.width==50?6:12,
                            configListId: item.configListId?item.configListId:-1,
                            originalCaption:item.caption,
                            autoGenerated: item?.autoGenerated?true:false,
                            duplicateCaption: false,
                            metadata: item.metadata,
                            showNumberColumn: false,
                            isEditable:false
                        }
                        if(item.fieldTypeId=== InputType.TABLE){
                            newTemplateData.width= 12;
                            newTemplateData.showNumberColumn=newTemplateData.metadata?.numbered||false;
                            const colData: Array<any>=[];
                            newTemplateData.metadata.colData.forEach((element: any) => {
                               const cellData = JSON.parse(JSON.stringify(element));
                               cellData.fieldTypeId=Number(element.fieldTypeId)
                               colData.push(cellData);
                            });
                            newTemplateData.metadata= {...newTemplateData.metadata,colData};
                        }
                        templateDataList.push(newTemplateData);
                    })
                    let autoGeneratedFields: any[]=[];
                    templateDataList.forEach((item: any)=>{
                       if(item.autoGenerated){
                           autoGeneratedFields.push(item);
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
                    templateDataList=templateDataList.sort((a, b) => {
                        if (a.sequence < b.sequence)
                          return -1;
                        if (a.sequence > b.sequence)
                          return 1;
                        return 0;
                      });
                    createTemplateDispatch(setTemplateList(templateDataList));
                    createTemplateDispatch(setOriginalTemplateList(JSON.parse(JSON.stringify(templateDataList))));
                }
                dispatch(setIsLoading(false));
            } else{
                dispatch(setIsLoading(false));
                createTemplateDispatch(setTemplateId(Number(-1)));
                Notification.sendNotification('Invalid Project feature',AlertTypes.warn);
                history.push('/base/forms');
            }
        }
        catch(error){
            dispatch(setIsLoading(false));
            console.log(error);
        }
    }

    const getFeatureDetails=async (argFeatureId: number)=>{
        try{
            const formListData= await client.query({
                query:LOAD_PRODUCT_FEATURES_DETAILS,
                variables: {
                    featureId: argFeatureId
                },
                fetchPolicy: 'network-only',
                context:{role: FormsRoles.viewFormTemplate}
            });
            if(formListData.data.projectFeature.length>0){
                if(formListData.data.projectFeature[0].tenantId){
                    createTemplateDispatch(setFormFeatureType('OPEN'));
                } else{
                    createTemplateDispatch(setFormFeatureType('SYSTEM'));
                }
            } else{
                Notification.sendNotification('Invalid Project feature',AlertTypes.warn);
                history.push(`/base/forms/${createTemplateState.featureId}`);
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
        if(createTemplateState.templateList.length>0 && createTemplateState.formName){
            setpreview(true);
        }
    }

    const updatetemplate=async()=>{
        try{
            if(isFieldDuplicateOrRequired(createTemplateState.templateList) || !createTemplateState.formName){
                createTemplateDispatch(setFormCurrentTab('EXISTING'))
                return;
            } 
            if(JSON.stringify(createTemplateState.templateList) !== JSON.stringify(createTemplateState.originalTemplateList) ||
                createTemplateState.formName.trim() !==  templateName.trim()){
                if(state.editMode){
                    dispatch(setEditMode(false));
                }
                const templateDatePayload= fetchTemplatePayload(createTemplateState.templateList);
                dispatch(setIsLoading(true));
                await client.mutate({
                    mutation: BULK_UPDATE_TEMPLATE,
                    variables:{
                        featureId: createTemplateState.featureId,
                        templateData: templateDatePayload ,
                        templateId: createTemplateState.templateId,
                        templateName: createTemplateState.formName
                    },context:{role: FormsRoles.updateFormTemplate}
                })
                Notification.sendNotification('Updated form template successfully',AlertTypes.success);
                history.push(`/base/forms/${createTemplateState.featureId}`);
                dispatch(setIsLoading(false));
            } else{
                Notification.sendNotification('Updated form template successfully',AlertTypes.success);
                history.push(`/base/forms/${createTemplateState.featureId}`);
            }
        }catch(error: any){
            dispatch(setIsLoading(false));
            console.log(error);
            Notification.sendNotification(error.message,AlertTypes.error);
        }
    }

    const isUpdateTemplateEnabled=()=>{
        return createTemplateState.templateList.length===0 ||
        !createTemplateState.formName || createTemplateState.formNameError || 
        createTemplateState.isDuplicate || createTemplateState.formName.trim().length>50 ||
        isFieldDuplicateOrRequired(createTemplateState.templateList) || 
        !(JSON.stringify(createTemplateState.templateList) !== JSON.stringify(createTemplateState.originalTemplateList) ||
        createTemplateState.formName.trim() !==  templateName.trim());
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

    const discardChanges=()=>{
        if(state.editMode){
            setConfirmOpen(true);
        } else{
            backToList();
        }
    }

    return (
        <templateCreationContext.Provider value={{createTemplateState,createTemplateDispatch}} >
                <div className="updatetemplate">
                <div className="updatetemplate__header">
                        <div className="updatetemplate__header__left" >
                            <div className="updatetemplate__header__title">
                                    <ArrowBackIosIcon onClick={backToList} className="updatetemplate__header__title__backNavigation"/>
                                    Edit Template
                            </div>
                            <div className="updatetemplate__header__subtitle">* Fields are mandatory</div>
                        </div>
                        <div className="updatetemplate__header__action">
                            <Button className="updatetemplate__header__action__preview" 
                                disabled={createTemplateState.templateList.filter(item=>!item.autoGenerated).length===0}
                                onClick={previewTemplate} data-testid="create-template-preview"> 
                                <VisibilityIcon className="updatetemplate__header__action__preview__icon"/>
                                <span className="updatetemplate__header__action__preview__text"> Preview</span> 
                            </Button>
                            <Button className="btn-secondary" onClick={discardChanges}>
                                Discard
                            </Button>
                            <Button className="btn-primary" onClick={updatetemplate} disabled={isUpdateTemplateEnabled()}>
                                Save
                            </Button>
                        </div>
                    </div>
                    <Grid container className="updatetemplate__body">
                        <Grid item xs={4} className="updatetemplate__body__fieldsContainer">
                            <FieldType/>
                        </Grid>
                        <Grid item xs={8} className="updatetemplate__body__fieldsElements">
                            <TemplateFields refreshFields={getFormTemplateList}/>
                        </Grid>
                    </Grid>
                {preview?(<div className="updatetemplate__preview">
                            <Preview closePreview={close} templateFieldList={createTemplateState.templateList} 
                             autoGeneratedFields={createTemplateState.autoGeneratedFields}
                             formName={createTemplateState.formName}/>
                    </div>):("")}
            </div>
            {<ConfirmDialog open={confirmOpen} message={confirmMessage} close={()=>setConfirmOpen(false)} proceed={backToList} />}
        </templateCreationContext.Provider>
    )
}

