import { TextField } from '@material-ui/core';
import React, { ReactElement, useEffect, useState } from 'react';
import { InputType } from '../../../../../utils/constants';
import { TemplateData } from '../../models/template';
import './Text.scss';

interface IText{
    index: number,
    field: TemplateData
}

export function Text({field, index}: IText): ReactElement {
    const [label, setlabel] = useState('');

    useEffect(() => {
        if(field){
            switch (field.fieldTypeId) {
                case InputType.TEXT:
                    setlabel('Text')
                    break;
                case InputType.INTEGER:
                    setlabel('Number')
                    break;
                case InputType.COMMENTS:
                    setlabel('Comments')
                    break;
                default:
                    break;
            }
        }
    }, [field.fieldTypeId])
    
    return (
        <div className="text">
                 <TextField
                        id={`${field.caption}-${index}`}
                        data-testid={`${label}-${index}`}
                        className={`${field.fixed ? " text__fixed" : ""}`}
                        type="text"
                        disabled={true}
                        fullWidth
                        variant="outlined"
                        placeholder={label}
                />
        </div>
    )
}


export function TextArea({field,index}:IText): ReactElement {
    return (
        <div className="text">
                <TextField
                        className={`${field.fixed ? " text__fixed" : ""}`}
                        id={`${field.caption}-${index}`}
                        data-testid={`textarea-${index}`}
                        type="text"
                        disabled={true}
                        fullWidth
                        variant="outlined"
                        placeholder="Long Text"
                />
        </div>
    )
}

export function Loaction({field,index}:IText): ReactElement {
    return (
        <div className="text">
                <TextField
                        className={`${field.fixed ? " text__fixed" : ""}`}
                        id={`${field.caption}-${index}`}
                        data-testid={`location-${index}`}
                        type="text"
                        disabled={true}
                        fullWidth
                        variant="outlined"
                        placeholder="Location"
                />
        </div>
    )
}

