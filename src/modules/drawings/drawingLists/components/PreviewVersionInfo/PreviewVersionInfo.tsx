import React, { ReactElement, useContext, useEffect, useState } from 'react';
import './PreviewVersionInfo.scss';
import InfoIcon from '@material-ui/icons/Info';
import InputLabel from '@material-ui/core/InputLabel';
import { DrawingLibDetailsContext } from '../../context/DrawingLibDetailsContext';
import TextField from '@material-ui/core/TextField';
import CalendarTodayIcon from '@material-ui/icons/CalendarToday';

export default function PreviewVersionInfo(): ReactElement {

    const {DrawingLibDetailsState, DrawingLibDetailsDispatch}: any = useContext(DrawingLibDetailsContext);
    const [versionInfoTemplate, setVersionInfoTemplate] = useState<any>({});
    
    useEffect(() => {
        if(DrawingLibDetailsState?.drawingTemplateFieldFormat){
            setVersionInfoTemplate(DrawingLibDetailsState?.drawingTemplateFieldFormat);
        }
    }, [DrawingLibDetailsState?.drawingTemplateFieldFormat])

    
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
                <div className="versionInfo__details__field__details__datetimepicker">
                    <TextField
                            type="text"
                            disabled={true}
                            fullWidth
                            variant="outlined"
                            placeholder={field.label}
                    />
                    <CalendarTodayIcon className="versionInfo__details__field__details__datetimepicker__icon"/>
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
        <div className="versionInfo">
            <div className="versionInfo__note">
                <div className="versionInfo__note__logo">
                    <InfoIcon />
                </div>
                <div className="versionInfo__note__text">
                    <span>Note:</span> This information is used to identify the uploaded drawing set as a unique version.
                </div>
            </div>

            <div className="versionInfo__details">
                {
                    versionInfoTemplate?.versionFieldData?.map((field: any) => (
                        <div key={field.id} className='versionInfo__details__field'>
                            <div className='versionInfo__details__field__details'>
                                <InputLabel required={field.isMandatory}>{field.label} </InputLabel>
                                { renderVersionFieldType(field) }
                            </div>
                        </div>
                    ))
                }
            </div>
    </div>
    )
}
