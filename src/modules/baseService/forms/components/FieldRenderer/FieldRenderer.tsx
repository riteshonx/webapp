import React, { ReactElement } from 'react';
import { InputType } from '../../../../../utils/constants';
import {Loaction, Text, TextArea} from '../Text/Text';
import AssetSelect from "../AssetSelect/AssetSelect";
import {DatePicker, TimePicker, DateTimePicker} from '../DatePicker/DatePicker';
import Attachement from '../Attachment/Attachement';
import Select from '../Select/Select';
import CustomListInput from '../CustomListInput/CustomListInput';
import { TemplateData } from '../../models/template';
import Boolean from '../Boolean/Boolean'; 
import CustomTable from '../CustomTable/CustomTable';
interface Props {
    inputField: TemplateData,
    index: number,
}

function InputFieldRendrer({inputField, index}: Props): ReactElement {
    const renderInput=()=>{
        switch(inputField.fieldTypeId){
            case InputType.TEXT:
            case InputType.COMMENTS:{
                return <Text index={index} field={inputField}/>
            }
            case InputType.LONGTEXT:{
                return <TextArea index={index} field={inputField}/>
            }
            case InputType.DATEPICKER:{
                return <DatePicker index={index} field={inputField}/>
            }
            case InputType.TIMEPICKER:{
                return <TimePicker index={index} field={inputField}/>
            }
            case InputType.DATETIMEPICKER:{
                return <DateTimePicker index={index} field={inputField}/>
            }
            case InputType.ATTACHMENT:{
                return <Attachement index={index} field={inputField}/>
            }
            case InputType.CUSTOMDROPDOWN:
            case InputType.CUSTOMNESTEDDROPDOWN:
                {
                return <CustomListInput field={inputField} index={index}/>
            }
           
            case InputType.MULTIVALUEUSER:
            case InputType.SINGLEVALUEUSER:
            case InputType.MULTIVALUECOMPANY:
            case InputType.CUSTOMNESTEDDROPDOWN:
            case InputType.SINGLEVALUECOMPANY:{
                return <Select field={inputField} index={index}/>
            }
            case InputType.BOOLEAN:{
               return <Boolean field={inputField} index={index}/>
            }
            case InputType.ASSETTYPES:{
                return<AssetSelect index={index} field = {inputField}/>
            }
            case InputType.LOCATION:{
                return <Loaction index={index} field={inputField}/>
            }
            case InputType.LOCATIONTREE:{
                return <Loaction index={index} field={inputField}/>
            }
            case InputType.TABLE:{
                return <CustomTable index={index} field={inputField}/>
            }
            default:{
                return <Text index={index} field={inputField}/>
            }
        }
    }

    return (
        <>
       {renderInput()}
       </>
    )
}

export default InputFieldRendrer
