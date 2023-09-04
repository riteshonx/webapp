import { FormControl, FormControlLabel, Radio, RadioGroup } from '@material-ui/core';
import React, { ReactElement } from 'react';
import { TemplateData } from '../../models/template';
import './Boolean.scss';


interface IBoolean{
    index: number,
    field: TemplateData
}

export default function Boolean({field, index}: IBoolean): ReactElement {
    const [value, setValue] = React.useState('yes');

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setValue((event.target as HTMLInputElement).value);
      event.stopPropagation();
    };
    return (
            <FormControl component="fieldset" className="boolean">
                <RadioGroup data-testid={`boolean-${index}-group`} row 
                className="boolean__field" aria-label="gender" name="gender1" value={value} onChange={handleChange}>
                    <FormControlLabel data-testid={`boolean-${index}-yes`} value="yes" control={<Radio />} label="Yes" />
                    <FormControlLabel data-testid={`boolean-${index}-no`} value="no" control={<Radio />} label="No" />
                </RadioGroup>
            </FormControl>
    )
}
