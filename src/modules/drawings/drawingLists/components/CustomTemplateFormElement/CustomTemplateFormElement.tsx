import React, { ReactElement, useContext, useEffect, useState } from 'react';
import TextField from '@material-ui/core/TextField';
import './CustomTemplateFormElement.scss';
import InputLabel from '@material-ui/core/InputLabel';
import IconButton from '@material-ui/core/IconButton';
import RemoveCircleIcon from "@material-ui/icons/RemoveCircle";
import CalendarTodayIcon from '@material-ui/icons/CalendarToday';
import { DrawingLibDetailsContext } from '../../context/DrawingLibDetailsContext';
import { setDrawingTemplateFields, setTemplateFieldFormat } from '../../context/DrawingLibDetailsAction';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { useDebounce } from 'src/customhooks/useDebounce';
import { projectFeatureAllowedRoles } from 'src/utils/role';
import { setIsLoading } from 'src/modules/root/context/authentication/action';
import { client } from 'src/services/graphql';
import { FETCH_CUSTOM_TEMPLATE_NAME } from '../../graphql/queries/customFormatTemplate';
import Notification,{ AlertTypes } from '../../../../shared/components/Toaster/Toaster';
import { stateContext } from 'src/modules/root/context/authentication/authContext';
import { templateField } from 'src/modules/drawings/utils/drawingsConstant';
import { match, useRouteMatch } from 'react-router-dom';
export interface Params {
    projectId: string;
    templateId: string;
}

export default function CustomTemplateFormElement(props: any): ReactElement {

    const {state, dispatch }:any = useContext(stateContext);
    const [templateFormat, setTemplateFormat] = useState<any>({});
    const [templateName, setTemplateName] = useState('');
    const debounceName = useDebounce(templateName, 1000);
    const {DrawingLibDetailsState, DrawingLibDetailsDispatch}: any = useContext(DrawingLibDetailsContext);
    const [isValidTemplateName, setIsValidTemplateName] = useState(false)
    const pathMatch:match<Params>= useRouteMatch();

    useEffect(() => {
        if(DrawingLibDetailsState?.drawingTemplateFieldFormat){
            if(pathMatch.params.templateId){
                setTemplateName(DrawingLibDetailsState?.drawingTemplateFieldFormat.templateName)
            }
            setTemplateFormat(DrawingLibDetailsState?.drawingTemplateFieldFormat);
        }
    }, [DrawingLibDetailsState?.drawingTemplateFieldFormat])

    useEffect(() => {
        if(templateName){
            fetchCustomTemplateDetails();
        }else{
            setIsValidTemplateName(false);
            props.isCreateEnable(false)
        }

    }, [debounceName])

    const formTemplateNameChange = (e: any) => {
        e.target.value ? setTemplateName(e.target.value) : setTemplateName('');
        //valid the name
    }

    const removeField = (fieldData: any, type: string) => {
        // if(!fieldData.isMandatory){
            fieldData.isSelected = false;
            const field = {...DrawingLibDetailsState?.drawingTemplateFields};
            const templateData = {...DrawingLibDetailsState?.drawingTemplateFieldFormat}
            const fieldDataArray = [fieldData]
            if(type === 'VERSION'){           
                templateData.versionFieldData = templateData.versionFieldData.filter((item: any) => item.id !== fieldData.id)
                field.versionInfoFields.map((fieldItem: any) => fieldDataArray.find((item: any) => item.id === fieldItem.id) || fieldItem);
            }
            if(type === 'SHEET'){
                templateData.sheetFieldData = templateData.sheetFieldData.filter((item: any) => item.id !== fieldData.id)
                field.sheetInfoFields.map((fieldItem: any) => fieldDataArray.find((item: any) => item.id === fieldItem.id) || fieldItem);
            }
            
            DrawingLibDetailsDispatch(setDrawingTemplateFields(field));
            DrawingLibDetailsDispatch(setTemplateFieldFormat(templateData));
        // }
    }

    const renderVersionFieldType = (field: any) => {
        switch(field.type){
            case 'text':{
                return (
                <TextField
                    type="text"
                    fullWidth
                    placeholder={field.label}
                    variant='outlined'
                    disabled={true}
                />
               )
            }
           case 'date':{
            return(
                <div className="templateForm__version-info__drop-zone__field__details__datetimepicker">
                    <TextField
                            type="text"
                            disabled={true}
                            fullWidth
                            variant="outlined"
                            placeholder={field.label}
                    />
                    <CalendarTodayIcon className="templateForm__version-info__drop-zone__field__details__datetimepicker__icon"/>
                </div>
            )
            }
            default: return (
                <TextField
                    type="text"
                    fullWidth
                    disabled={true}
                    variant='outlined'
                    placeholder={field.label}
                />
            )
        }
    }

    const reorder = (list: any, startIndex: any, endIndex: any) => {
        const result = Array.from(list);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);
    
        return result;
    };
    
    const onDragVersionEnd = (result: any) => {
        // dropped outside the list
        if (!result.destination) {
            return;
        }

        const items = reorder( templateFormat?.versionFieldData, result.source.index, result.destination.index);

        const templateData = {...DrawingLibDetailsState?.drawingTemplateFieldFormat}
        templateData.versionFieldData = [...items]
        setTemplateFormat(templateData);
        DrawingLibDetailsDispatch(setTemplateFieldFormat(templateData));
    };

    const onDragSheetEnd = (result: any) => {
        // dropped outside the list
        if (!result.destination) {
            return;
        }

        const items = reorder( templateFormat?.sheetFieldData, result.source.index, result.destination.index);

        const templateData = {...DrawingLibDetailsState?.drawingTemplateFieldFormat}
        templateData.sheetFieldData = [...items]
        setTemplateFormat(templateData);
        DrawingLibDetailsDispatch(setTemplateFieldFormat(templateData));
    };

    const updateTemplateName = () => {
        const templateData = {...DrawingLibDetailsState?.drawingTemplateFieldFormat}
        templateData.templateName = templateName.trim();
        DrawingLibDetailsDispatch(setTemplateFieldFormat(templateData));
    }

    //fetch template details
    const fetchCustomTemplateDetails = async()=>{
        try{
            const customTempNameResponse = await client.query({
                query: FETCH_CUSTOM_TEMPLATE_NAME,
                variables:{
                    templateName: debounceName.trim(),
                },
                fetchPolicy: 'network-only',
                context:{role: projectFeatureAllowedRoles.uploadDrawings, token: state.selectedProjectToken}
            });


            if(customTempNameResponse?.data?.drawingTemplateFormat.length > 0 ){
                if(pathMatch.params.templateId && 
                customTempNameResponse?.data?.drawingTemplateFormat[0].id === pathMatch.params.templateId){
                    setIsValidTemplateName(false)
                    props.isCreateEnable(false)
                }else{
                    setIsValidTemplateName(true)
                    props.isCreateEnable(true)
                }
            }else{
                setIsValidTemplateName(false)
                props.isCreateEnable(false)
            }
            
        }catch(error){
            console.log(error);
            Notification.sendNotification(error, AlertTypes.warn);
            dispatch(setIsLoading(false));
        }
    }

    return (
        
        <div className='templateForm'>
            {
                templateFormat && (
                    <>
                        <div className='templateForm__name'>
                            <TextField data-testid="template-name" 
                                        variant="outlined"
                                        className="templateForm__name__input" 
                                        onChange={(e: any) => formTemplateNameChange(e)} 
                                        value={templateName} 
                                        placeholder="Enter template name"
                                        onBlur={updateTemplateName}
                            /> 
                            {
                                templateName && isValidTemplateName && (
                                    <div className="templateForm__name__error" >
                                        Template name is already exist.
                                    </div> 
                                )
                            }
                            {
                                !templateName && (
                                    <div className="templateForm__name__error" >
                                        Template name is required.
                                    </div> 
                                )
                            }
                                                        {
                                templateName && templateName.trim().length > 30 &&(
                                    <div className="templateForm__name__error" >
                                        Maximum 30 Charecters are allowed.
                                    </div> 
                                )
                            }
                        </div>
                        <div className='templateForm__sections'>
                            <div className='templateForm__version-info'>
                                <div className='templateForm__version-info__header'>
                                    <h2>Drawing Version Info</h2>
                                </div>
                                <div className='templateForm__version-info__drop-zone'>
                                    <DragDropContext onDragEnd={onDragVersionEnd}>
                                        <Droppable droppableId="droppable">
                                            {(provided: any) => (
                                            <div ref={provided.innerRef} {...provided.droppableProps}>
                                                {templateFormat?.versionFieldData?.map((field: any, index: number) =>
                                                    <Draggable
                                                            key={field.name}
                                                            draggableId={field.name}
                                                            index={index}
                                                    >
                                                        {(provided: any, snapshot: any) => (
                                                            <div
                                                            className={
                                                                snapshot.isDragging ? "dragging" : "dropping"
                                                            }
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            >
                                                                <div className='templateForm__version-info__drop-zone__field'>
                                                                    <div className='templateForm__version-info__drop-zone__field__details'>
                                                                        <InputLabel required={field.isMandatory}>{field.label} </InputLabel>
                                                                        { renderVersionFieldType(field) }
                                                            
                                                                    </div>
                                                                    <div className='templateForm__version-info__drop-zone__field__remove'>
                                                                        {
                                                                            !field.isDefault && (
                                                                                <IconButton
                                                                                        aria-label="remove"
                                                                                        data-testid={`remove-field`}
                                                                                        onClick={() => removeField(field, 'VERSION')}
                                                                                    >
                                                                                    <RemoveCircleIcon />
                                                                                </IconButton>
                                                                            )
                                                                        }
                                                                        
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                
                                                )}
                                            </div>
                                            )}
                                        </Droppable>
                                    </DragDropContext>
                                </div>
                            </div>

                            <div className='templateForm__border'>
                            </div>

                            <div className='templateForm__sheets-info'>
                                <div className='templateForm__sheets-info__header'>
                                    <h2>Drawing Sheets Info</h2>
                                </div>
                                <div className='templateForm__sheets-info__drop-zone'>
                                    <DragDropContext onDragEnd={onDragSheetEnd}>
                                        <Droppable droppableId="droppable">
                                            {(provided: any) => (
                                            <div ref={provided.innerRef} {...provided.droppableProps}>
                                                {templateFormat?.sheetFieldData?.map((field: any, index: number) =>
                                                    <Draggable
                                                            key={field.name}
                                                            draggableId={field.name}
                                                            index={index}
                                                    >
                                                        {(provided: any, snapshot: any) => (
                                                            <div
                                                            className={
                                                                snapshot.isDragging ? "dragging" : "dropping"
                                                            }
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            >
                                                                <div className='templateForm__sheets-info__drop-zone__field'>
                                                                    <div className='templateForm__sheets-info__drop-zone__field__details'>
                                                                        <InputLabel 
                                                                            required={field.name === templateField.DRAWING_NAME ? 
                                                                            false : field.isMandatory}>
                                                                            {field.label}</InputLabel>
                                                                        { renderVersionFieldType(field) }
                                                                    </div>
                                                                    <div className='templateForm__sheets-info__drop-zone__field__remove'>
                                                                        {   
                                                                            !field.isDefault && (
                                                                                <IconButton
                                                                                        aria-label="remove"
                                                                                        data-testid={`remove-field`}
                                                                                        onClick={() => removeField(field, 'SHEET')}
                                                                                    >
                                                                                    <RemoveCircleIcon />
                                                                                </IconButton>
                                                                            )
                                                                        }
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                
                                                )}
                                            </div>
                                            )}
                                        </Droppable>
                                    </DragDropContext>
                                </div>
                            </div>
                        </div>
                    </>
                )
            }
        </div>
    )
}
