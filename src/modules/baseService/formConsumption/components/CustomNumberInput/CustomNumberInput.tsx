import { TextField } from '@material-ui/core'
import React, { ReactElement, useContext, useEffect, useState } from 'react';
import NumberFormat from 'react-number-format';
import { submitalsFields } from '../../../../../utils/constants';
import { Controller } from 'react-hook-form';
import { formStateContext } from '../../Context/projectContext';


interface Props {
    formData: any;
    control: any;
    isSpecification: boolean;
    isEditAllowed: boolean;
}

function CustomNumberInput({formData, control,isSpecification, isEditAllowed }: Props): ReactElement {
    const [isDisabled, setIsDisabled] = useState(false);
    const {setIsDirty}: any = useContext(formStateContext);
    useEffect(() => {
        if(formData?.elementId){
            setIsDisabled(submitalsFields.indexOf(formData?.elementId)>-1 && isSpecification);
        }
    }, [formData, isEditAllowed])

    return (
        <Controller 
            render={({ field }:{field:any}) => (
            <NumberFormat
                id={`number-${formData.elementId}`}
                inputMode="numeric"
                allowNegative={true}
                disabled={isDisabled || isEditAllowed}
                allowLeadingZeros={false}
                {...field}
                customInput={TextField}
                decimalScale={3}
                style={{ margin: "0px 0px 4px 0px" }}
                fullWidth
                margin="normal"
                variant="outlined"
                autoComplete='off'
                InputLabelProps={{  
                    shrink: true,
                }}  
                placeholder='Number'   
                onChange={(e) => {field.onChange(e), setIsDirty(true)}}   
                format="###############"                           
        />
        )}
        name={`${formData.elementId}-fieldTypeId${formData.fieldTypeId}`}
        control={control}
        rules={{
            required: formData.required ? true : false,
            maxLength:15
        }}
    />
    )
}

export default React.memo(CustomNumberInput);
