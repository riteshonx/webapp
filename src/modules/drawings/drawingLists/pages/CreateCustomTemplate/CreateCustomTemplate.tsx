import React, { ReactElement, useContext, useEffect, useState } from 'react';
import CreateTemplateHeader from '../../components/CreateTemplateHeader/CreateTemplateHeader';
import './CreateCustomTemplate.scss';
import Grid from '@material-ui/core/Grid';
import CustomTemplateFields from '../../components/CustomTemplateFields/CustomTemplateFields';
import CustomTemplateFormElement from '../../components/CustomTemplateFormElement/CustomTemplateFormElement';
import { stateContext } from 'src/modules/root/context/authentication/authContext';
import { setIsLoading } from 'src/modules/root/context/authentication/action';
import { CREATE_CUSTOM_TEMPLATE, 
         FETCH_CUSTOM_TEMPLATE_DETAILS, 
         FETCH_DRAWING_TEMPLATE_FIELDS,
         UPDATE_CUSTOM_TEMPLATE 
        } from '../../graphql/queries/customFormatTemplate';
import { client } from 'src/services/graphql';
import { projectFeatureAllowedRoles } from 'src/utils/role';
import Notification,{ AlertTypes } from '../../../../shared/components/Toaster/Toaster';
import { DrawingLibDetailsContext } from '../../context/DrawingLibDetailsContext';
import { setDrawingTemplateFields, setTemplateFieldFormat } from '../../context/DrawingLibDetailsAction';
import Header from 'src/modules/shared/components/Header/Header';
import NoDataMessage from 'src/modules/shared/components/NoDataMessage/NoDataMessage';
import { match, useHistory, useRouteMatch } from 'react-router-dom';

export interface Params {
    projectId: string;
    templateId: string;
}

const noPermissionMessage = `You don't have permission to create custom template`;

export default function CreateCustomTemplate(): ReactElement {

    const {state, dispatch }:any = useContext(stateContext);
    const {DrawingLibDetailsState, DrawingLibDetailsDispatch}: any = useContext(DrawingLibDetailsContext);
    const [isCreateEnable, setIsCreateEnable] = useState(false)
    const history = useHistory();
    const pathMatch:match<Params>= useRouteMatch();
    const [pageType, setpageType] = useState('create')
    const [templateDatavalue, setTemplateDatavalue] = useState({})


    useEffect(() => {
        if(state.selectedProjectToken && state?.projectFeaturePermissons?.canuploadDrawings){
            const fetchData = async () => {
                if(pathMatch.params.templateId){
                    setpageType('edit')
                    await fetchCustomTemplateDetails(pathMatch.params.templateId)
                }else{
                    setpageType('create')
                }
                    await fetchDrawingTemplateFields();
            }

            fetchData();
        }
    }, [state.selectedProjectToken]);


    useEffect(() => {
        return () => {
            DrawingLibDetailsDispatch(setDrawingTemplateFields(null));
            DrawingLibDetailsDispatch(setTemplateFieldFormat(null));
            setTemplateDatavalue({})
        }
    }, [])

    useEffect(() => {
        if(templateDatavalue && DrawingLibDetailsState?.drawingTemplateFieldFormat){
            handleSelectedFields()   
        }
    }, [templateDatavalue])

    const handleSelectedFields = () => {
        const templateFielData: any = {...templateDatavalue};
        const templateFormat: any = {...DrawingLibDetailsState?.drawingTemplateFieldFormat}
        templateFielData?.sheetInfoFields?.forEach((field: any) => {
            const isSelected = templateFormat.sheetFieldData.filter((item: any) => item.id === field.id)
            field.isSelected  = isSelected.length > 0 ? true : false
        })
        templateFielData?.versionInfoFields?.forEach((field: any) => {
            const isSelected = templateFormat.versionFieldData.filter((item: any) => item.id === field.id)
            field.isSelected  = isSelected.length > 0 ? true : false
        })
        DrawingLibDetailsDispatch(setDrawingTemplateFields(templateFielData));
    }

    //fetch template fields
    const fetchDrawingTemplateFields = async()=>{
        try{
            dispatch(setIsLoading(true));
            const drawingTempFieldResponse = await client.query({
                query: FETCH_DRAWING_TEMPLATE_FIELDS,
                fetchPolicy: 'network-only',
                context:{role: projectFeatureAllowedRoles.uploadDrawings, token: state.selectedProjectToken}
            });
            const drawingTemplateFieldData: any = [];
            let templateData: any = {};
            let fieldData: any = {};
            if(drawingTempFieldResponse?.data?.drawingTemplateField.length > 0){
                drawingTempFieldResponse?.data?.drawingTemplateField.forEach((item: any) => {
                    const newItem= JSON.parse(JSON.stringify(item));
                    newItem.isSelected= false;
                    drawingTemplateFieldData.push(newItem);
                })

                const versionFields = drawingTemplateFieldData?.filter((item: any) => item.groupType === "version_info");
                const sheetFields = drawingTemplateFieldData?.filter((item: any) => item.groupType === "sheet_info");

                templateData = {
                    versionInfoFields: versionFields,
                    sheetInfoFields: sheetFields,
                }

                const versionFieldData = versionFields?.filter((item: any) => item.isDefault);
                const sheetFieldData = sheetFields?.filter((item: any) => item.isDefault);

                fieldData = {
                    templateName : '',
                    versionFieldData: versionFieldData,
                    sheetFieldData: sheetFieldData
                }
            }
            
            if(pathMatch.params.templateId){
                setTemplateDatavalue(templateData)
                DrawingLibDetailsDispatch(setDrawingTemplateFields(templateData));
            }else{
                DrawingLibDetailsDispatch(setDrawingTemplateFields(templateData));
                DrawingLibDetailsDispatch(setTemplateFieldFormat(fieldData));
            }
            dispatch(setIsLoading(false));
            
        }catch(error){
            console.log(error);
            Notification.sendNotification(error, AlertTypes.warn);
            dispatch(setIsLoading(false));
        }
    }

    //fetch template details
    const fetchCustomTemplateDetails = async(drawingTemplateFormatId: any)=>{
        try{
            dispatch(setIsLoading(true));
            const customTempDetailsResponse = await client.query({
                query: FETCH_CUSTOM_TEMPLATE_DETAILS,
                variables:{
                    formatId: drawingTemplateFormatId,
                },
                fetchPolicy: 'network-only',
                context:{role: projectFeatureAllowedRoles.uploadDrawings, token: state.selectedProjectToken}
            });

            const drawingTemplateFieldData: any = [];

            const drawingFieldList: any = []
            if(customTempDetailsResponse?.data?.drawingTemFieldFormatAssociation?.length > 0){
                customTempDetailsResponse?.data?.drawingTemFieldFormatAssociation?.forEach((item: any) => {

                    const newItem= JSON.parse(JSON.stringify(item));
                    newItem.isSelected= false;
                    drawingTemplateFieldData.push(newItem);
                    drawingFieldList.push(newItem.drawingTemplateField)
                })

                const sheetFields = drawingFieldList?.filter((item: any) => item.groupType === "sheet_info");
                const versionFields =drawingFieldList.filter((item: any) => item.groupType === "version_info");

                let fieldData: any = {};

                fieldData = {
                    templateName : drawingTemplateFieldData[0]?.drawingTemplateFormat?.name,
                    versionFieldData: versionFields,
                    sheetFieldData: sheetFields
                }

                DrawingLibDetailsDispatch(setTemplateFieldFormat(fieldData));
            }
            dispatch(setIsLoading(false));
        }catch(error){
            console.log(error);
            Notification.sendNotification(error, AlertTypes.warn);
            dispatch(setIsLoading(false));
        }
    }

    const handleCreateButtonProp = (isValid: boolean) => {
        setIsCreateEnable(isValid)
    }

    const navigateBack = () => {
        history.push(`/drawings/projects/${pathMatch.params.projectId}/custom-template-lists`);   
    }

    const onCreateTemplate = () => {
        const data: any = {...DrawingLibDetailsState?.drawingTemplateFieldFormat}
        const versionField =  data?.versionFieldData.map((ele: any) => ele.id);
        const sheetFields = data?.sheetFieldData.map((ele: any) => ele.id);
        const payload = {
            formatName: data.templateName,
            templateFieldIds: [...versionField, ...sheetFields],
        }
        // console.log(DrawingLibDetailsState?.drawingTemplateFieldFormat, payload)
        pathMatch.params.templateId ? updateCustomTemplate(payload) : createCustomTemplate(payload)
    }

    //create custom template API
    const createCustomTemplate = async (payload: any) => {
        try{
            dispatch(setIsLoading(true));
            const updateDrawingResponse: any = await client.mutate({
                mutation: CREATE_CUSTOM_TEMPLATE,
                variables: {
                    formatName: payload.formatName,
                    templateFieldIds: payload.templateFieldIds
                },
                context:{role: projectFeatureAllowedRoles.uploadDrawings, token: state.selectedProjectToken}
            })
            if(updateDrawingResponse.data.createDrawingTemplateFormat_mutation.formatId){
                DrawingLibDetailsDispatch(setDrawingTemplateFields(null));
                DrawingLibDetailsDispatch(setTemplateFieldFormat(null));
                Notification.sendNotification("Template created successfully", AlertTypes.success);
                navigateBack()
                fetchDrawingTemplateFields();
            }
            dispatch(setIsLoading(false));
        }
        catch(err: any){
            dispatch(setIsLoading(false));
            Notification.sendNotification(err, AlertTypes.warn);
            console.log(err)
        }
    }

    const updateCustomTemplate = async (payload: any) => {
        try{
            dispatch(setIsLoading(true));
            const updateDrawingResponse: any = await client.mutate({
                mutation: UPDATE_CUSTOM_TEMPLATE,
                variables: {
                    formatName: payload.formatName,
                    templateFieldIds: payload.templateFieldIds,
                    templateId: pathMatch.params.templateId
                },
                context:{role: projectFeatureAllowedRoles.uploadDrawings, token: state.selectedProjectToken}
            })
            if(updateDrawingResponse.data.createDrawingTemplateFormat_mutation.formatId){
                Notification.sendNotification("Template update successfully", AlertTypes.success);
            }
            dispatch(setIsLoading(false));
        }
        catch(err: any){
            dispatch(setIsLoading(false));
            Notification.sendNotification(err, AlertTypes.warn);
            console.log(err)
        }
    }


    return (
        <div className='create-templates'>
            {
                state?.projectFeaturePermissons?.canuploadDrawings ? (
                    <>
                        <CreateTemplateHeader isCreateEnable={isCreateEnable} 
                                              onCreateTemplate={onCreateTemplate} 
                                              pageType={pageType} />
                            {
                                DrawingLibDetailsState?.drawingTemplateFields && (
                                    <Grid container className="create-templates__body">
                                        <Grid item xs={4} className="create-templates__body__fieldsContainer">
                                            <CustomTemplateFields />
                                        </Grid>
                                        <Grid item xs={8} className="create-templates__body__fieldsElements">
                                            <CustomTemplateFormElement isCreateEnable={handleCreateButtonProp}/>
                                        </Grid>
                                    </Grid>
                                )
                            }
                    </>
                ): (
                    state.projectFeaturePermissons &&
                    (!state.projectFeaturePermissons?.canuploadDrawings ?(
                        <div className="noPublishDrawingPermission">
                            <div className="noCreatePermission____header">
                                <Header header={'Create Templates'} navigate={navigateBack}/>
                            </div>
                            <div className="no-permission">
                                <NoDataMessage message={noPermissionMessage}/> 
                            </div>
                        </div>
                    ) : (''))
                )
            }
           
        </div>
    )
}
