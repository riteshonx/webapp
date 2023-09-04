import { TextField } from '@material-ui/core'
import React, { ReactElement, useContext, useEffect, useState } from 'react';
import { FIXED_FIELDS, submitalsFields } from '../../../../../utils/constants';
import { Controller } from 'react-hook-form';
import { formStateContext } from '../../Context/projectContext';


interface Props {
    formData: any;
    control: any;
    isSpecification: boolean;
    isEditAllowed: boolean;
}

function CustomTextInput({formData, control,isSpecification, isEditAllowed }: Props): ReactElement {
    const [isDisabled, setIsDisabled] = useState(false);
    const {setIsDirty, setCurrentSubjectValue, setValue,setError}: any = useContext(formStateContext);
    useEffect(() => {
        if(formData?.elementId){
            setIsDisabled(submitalsFields.indexOf(formData?.elementId)>-1 && isSpecification);
        }
    }, [formData])

    const changeInValue=(e: any)=>{
        if(formData?.elementId === FIXED_FIELDS.SUBJECT){
            setCurrentSubjectValue(e.target.value);
        }
    }

    const handleBlur=(e: any)=>{
        if(!e.target.value.trim()){
            setValue(`${formData.elementId}-fieldTypeId${formData.fieldTypeId}`, "");
        }
    }
    
    return (
        <Controller 
            render={({ field }:{field:any}) => (
            <TextField
                id={`text-${formData.elementId}`}
                type="text"
                {...field}
                disabled={isDisabled || isEditAllowed}
                fullWidth
                variant="outlined"
                placeholder='Text'
                autoComplete='off'
                onChange={(e) => {field.onChange(e), setIsDirty(true),changeInValue(e)}}
                onBlur={(e)=>handleBlur(e)}
            />
            )}
            name={`${formData.elementId}-fieldTypeId${formData.fieldTypeId}`}
            control={control}
            rules={{
                required: formData.required ? true : false
            }}
        />
    )
}

export default React.memo(CustomTextInput);
