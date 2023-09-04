import React, { ReactElement, useContext, useEffect, useState } from 'react';
import './CustomTemplateFields.scss';
import { DrawingLibDetailsContext } from '../../context/DrawingLibDetailsContext';
import TextFormatIcon from '@material-ui/icons/TextFormat';
import CalendarTodayIcon from '@material-ui/icons/CalendarToday';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import FormatListNumberedRtlIcon from '@material-ui/icons/FormatListNumberedRtl';
import GroupWorkIcon from '@material-ui/icons/GroupWork';
import NoteIcon from '@material-ui/icons/Note';
import StyleIcon from '@material-ui/icons/Style';
import TouchAppIcon from '@material-ui/icons/TouchApp';
import SpeakerNotesIcon from '@material-ui/icons/SpeakerNotes';
import ListAltIcon from '@material-ui/icons/ListAlt';
import Filter1Icon from '@material-ui/icons/Filter1';
import FiberNewIcon from '@material-ui/icons/FiberNew';
import { templateField } from 'src/modules/drawings/utils/drawingsConstant';
import { setDrawingTemplateFields, setTemplateFieldFormat } from '../../context/DrawingLibDetailsAction';
import FormatShapesIcon from '@material-ui/icons/FormatShapes';
import PhotoSizeSelectSmallIcon from '@material-ui/icons/PhotoSizeSelectSmall';

export default function CustomTemplateFields(): ReactElement {

    const [fieldLists, setFieldLists] = useState<any>({});
    const {DrawingLibDetailsState, DrawingLibDetailsDispatch}: any = useContext(DrawingLibDetailsContext);

    useEffect(() => {
        if(DrawingLibDetailsState?.drawingTemplateFields){
            setFieldLists(DrawingLibDetailsState?.drawingTemplateFields);
        }
    }, [DrawingLibDetailsState?.drawingTemplateFields])


    const selectField = (fieldData: any, type: string) => {
        const field = {...DrawingLibDetailsState?.drawingTemplateFields};
        const templateData = {...DrawingLibDetailsState?.drawingTemplateFieldFormat}
        fieldData.isSelected = !fieldData.isSelected
        const fieldDataArray = [fieldData]
        if(type === 'VERSION'){
            if(fieldData.isSelected){
                templateData.versionFieldData.push(fieldData);
            }else{
                templateData.versionFieldData = templateData.versionFieldData.filter((item: any) => item.id !== fieldData.id)
            }
            field.versionInfoFields.map((fieldItem: any) => fieldDataArray.find((item: any) => item.id === fieldItem.id) || fieldItem);
        }
        if(type === 'SHEET'){
            if(fieldData.isSelected){
                templateData.sheetFieldData.push(fieldData);
            }else{
                templateData.sheetFieldData = templateData.sheetFieldData.filter((item: any) => item.id !== fieldData.id)
            }
            field.sheetInfoFields.map((fieldItem: any) => fieldDataArray.find((item: any) => item.id === fieldItem.id) || fieldItem);
        }
        
        DrawingLibDetailsDispatch(setDrawingTemplateFields(field));
        DrawingLibDetailsDispatch(setTemplateFieldFormat(templateData));
    }

    const renderVersionIcon = (versionField: any) => {
        switch(versionField.name){
            case templateField.SET_TITLE:{
               return <TextFormatIcon className="versionFeilds__lists__item__icon"/>
            }
           case templateField.SET_VERSION_NAME:{
            return <TextFormatIcon className="versionFeilds__lists__item__icon"/>
             }
           case templateField.VERSION_DATE:{
            return <CalendarTodayIcon  className="versionFeilds__lists__item__icon"/>
           }
        }
    }

    const renderSheetsIcon = (sheetField: any) => {
        switch(sheetField.name){
            case templateField.DRAWING_NUMBER:{
               return <TextFormatIcon className='sheetFeilds__lists__item__icon'/>
            }
           case templateField.DRAWING_STATUS:{
               return <FiberNewIcon className='sheetFeilds__lists__item__icon'/>
           }
           case templateField.DRAWING_VERSION:{
            return <CalendarTodayIcon className='sheetFeilds__lists__item__icon'/>
           }
           case templateField.DRAWING_ROLE:{
               return <SpeakerNotesIcon className='sheetFeilds__lists__item__icon'/>
           }
           case templateField.DRAWING_PROJECT_NUMBER:{
               return <Filter1Icon className='sheetFeilds__lists__item__icon'/>
           }
           case templateField.DRAWING_ORIGINATOR:{
               return <TouchAppIcon className='sheetFeilds__lists__item__icon'/>
           }
           case templateField.DRAWING_VOLUME:{
               return <GroupWorkIcon className='sheetFeilds__lists__item__icon'/>
           }
           case templateField.DRAWING_LEVEL:{
            return <LocationOnIcon className='sheetFeilds__lists__item__icon'/>
           }
           case templateField.DRAWING_TYPE:{
                return <NoteIcon className='sheetFeilds__lists__item__icon'/>
            }
           case templateField.DRAWING_CLASSIFICATION:{
            return <FormatListNumberedRtlIcon className='sheetFeilds__lists__item__icon'/>
           }

           case templateField.DRAWING_SHEET_NUMBER:{
            return <ListAltIcon className='sheetFeilds__lists__item__icon'/>
           }
           case templateField.DRAWING_SUITABILITY:{
               return <StyleIcon className='sheetFeilds__lists__item__icon'/>
           }
           case templateField.DRAWING_NAME:{
                return <FormatShapesIcon className='sheetFeilds__lists__item__icon'/>
           }
           case templateField.DRAWING_ZONE:{
            return <PhotoSizeSelectSmallIcon className='sheetFeilds__lists__item__icon'/>
           }
        }
    }


    
    return (
        <>
            <div className='fieldTitle'>Fields</div>
            <>
                {
                    fieldLists && (
                        <>
                            <div className='versionFeilds'>
                                <div className='versionFeilds__title'>Version Fields</div>
                                <div className='versionFeilds__lists'>
                                    {
                                        fieldLists?.versionInfoFields?.map((versionField: any) => (           
                                            !versionField.isDefault && (
                                                <div key={versionField.id} className='versionFeilds__lists__item' 
                                                onClick={() => selectField(versionField, 'VERSION')}
                                                style={versionField.isSelected ? {background: '#BDBDBD', color: '#000000' } : {} }>
                                                    { renderVersionIcon(versionField) }
                                                    <div className='versionFeilds__lists__item__label'>{versionField.label}</div>
                                                </div>
                                            )                  
                                        ))
                                    }
                                </div>
                            </div>
                            <div className='sheetFeilds'>
                                <div className='sheetFeilds__title'>Sheets Fields</div>
                                <div className='sheetFeilds__lists'>
                                    {
                                        fieldLists?.sheetInfoFields?.map((sheetField: any) => (
                                            (!sheetField.isDefault && sheetField.name !== 'Drawing_Category')
                                            && (
                                                <div key={sheetField.id} className='sheetFeilds__lists__item' 
                                                onClick={() => selectField(sheetField, 'SHEET')}
                                                style={sheetField.isSelected ? {background: '#BDBDBD', color: '#000000' } : {} }>
                                                    { renderSheetsIcon(sheetField) }
                                                    <div className='sheetFeilds__lists__item__label'>{sheetField.label}</div>
                                                </div>
                                            )
                                        ))
                                    }
                                </div>
                            </div>
                        </>
                    )
                }
            </>

        </>
    )
}
