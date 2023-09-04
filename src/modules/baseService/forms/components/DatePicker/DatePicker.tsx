import { TextField } from '@material-ui/core';
import React,{ ReactElement } from 'react';
import CalendarTodayIcon from '@material-ui/icons/CalendarToday';
import AccessTimeIcon from '@material-ui/icons/AccessTime';
import './DatePicker.scss';
import { TemplateData } from '../../models/template';

interface IDate{
    index: number,
    field: TemplateData
}

export function DatePicker({index,field}: IDate): ReactElement {
    return (
        <div className="datetimepicker">
                 <TextField
                        id={`date-picker-${field.caption}-${index}`}
                        type="text"
                        disabled={true}
                         className={`${field.fixed ? " datetimepicker__fixed" : ""}`}
                        fullWidth
                        variant="outlined"
                        placeholder="Date"
                />
                <CalendarTodayIcon className="datetimepicker__icon"/>
        </div>
    )
}


export function TimePicker({index,field}:IDate): ReactElement {
    return (
        <div className="datetimepicker">
                 <TextField
                        id={`time-picker-${index}`}
                        type="text"
                        disabled={true}
                         className={`${field.fixed ? " datetimepicker__fixed" : ""}`}
                        fullWidth
                        variant="outlined"
                        placeholder="Time"
                />
                <AccessTimeIcon className="datetimepicker__icon"/>
        </div>
    )
}


export function DateTimePicker({index,field}:IDate): ReactElement {
    return (
        <div className="datetimepicker">
                 <TextField
                        id={`time-picker-${index}`}
                        type="text"
                        disabled={true}
                         className={`${field.fixed ? " datetimepicker__fixed" : ""}`}
                        fullWidth
                        variant="outlined"
                        placeholder="Date Time"
                />
                <AccessTimeIcon className="datetimepicker__icon"/>
        </div>
    )
}
