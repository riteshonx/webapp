/* eslint-disable max-len */
import React, { ReactElement, useContext, useEffect, useState } from 'react';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import InputLabel from '@material-ui/core/InputLabel';
import { DrawingLibDetailsContext } from '../../context/DrawingLibDetailsContext';
import TextField from '@material-ui/core/TextField';
import CalendarTodayIcon from '@material-ui/icons/CalendarToday';
import './PreviewSheetInfo.scss';
import { templateField, templateFormatId } from 'src/modules/drawings/utils/drawingsConstant';

export default function PreviewSheetInfo(): ReactElement {

    const [sheetInfoTemplate, setSheetInfoTemplate] = useState<any>({});
    const {DrawingLibDetailsState, DrawingLibDetailsDispatch}: any = useContext(DrawingLibDetailsContext);

    useEffect(() => {
        if(DrawingLibDetailsState?.drawingTemplateFieldFormat){
            setSheetInfoTemplate(DrawingLibDetailsState?.drawingTemplateFieldFormat);
        }
    }, [DrawingLibDetailsState?.drawingTemplateFieldFormat]);

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
                <div className="sheetInfo__item__details__field__details__datetimepicker">
                    <TextField
                            type="text"
                            disabled={true}
                            fullWidth
                            variant="outlined"
                            placeholder={field.label}
                    />
                    <CalendarTodayIcon className="sheetInfo__item__details__field__details__datetimepicker__icon"/>
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

    return (
        <div className="sheetInfo">
            <div className="sheetInfo__item">
                    <Accordion expanded = {true}>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel-header"
                            id={`panel-header`}
                        >
                            <div className="sheetInfo__item__name">
                                <div>
                                    <span className="sheetInfo__item__index"></span>
                                        <label>
                                            Drawing Sheet 1
                                        </label>
                                </div>
                                <div className="sheetInfo__item__name__action">
                                </div>
                            </div>
                        </AccordionSummary>
                        <AccordionDetails>
                            <div className="sheetInfo__item__details">
                                {
                                    sheetInfoTemplate?.sheetFieldData?.map((field: any) => (
                                        <div key={field.id}>
                                            {
                                                DrawingLibDetailsState?.drawingTemplateFieldFormat.templateId === templateFormatId.BS1192_UK && 
                                                field.name === "drawing_number" ? (
                                                    ''
                                                ): (
                                                <div className='sheetInfo__item__details__field'>
                                                    <div className='sheetInfo__item__details__field__details'>
                                                        {
                                                            DrawingLibDetailsState?.drawingTemplateFieldFormat.templateId ? (
                                                                <>
                                                                    {
                                                                        field.name === templateField.DRAWING_NAME ? (
                                                                            <InputLabel 
                                                                                required={(DrawingLibDetailsState?.drawingTemplateFieldFormat.templateId === templateFormatId.BS1192_UK || 
                                                                                DrawingLibDetailsState?.drawingTemplateFieldFormat.templateId === templateFormatId.US_CANADA) ? 
                                                                                field.isMandatory : false}>{field.label}
                                                                            </InputLabel>
                                                                        ): (
                                                                            <InputLabel required={field.isMandatory}>{field.label}</InputLabel>
                                                                        )
                                                                    }
                                                                </>
                                                            ): (
                                                                <InputLabel required={field.name === templateField.DRAWING_NAME ? 
                                                                    false : field.isMandatory}>{field.label}</InputLabel>
                                                            )  
                                                        }
        
                                                        { renderVersionFieldType(field) }
                                                    </div>
                                                </div>
                                                )
                                            }
                                        </div>
                                    ))
                                }
                            </div>
                        </AccordionDetails>
                    </Accordion>
            </div>
        </div>
    )
}
