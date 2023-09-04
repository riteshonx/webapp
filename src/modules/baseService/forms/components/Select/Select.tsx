import React, {ReactElement, useEffect, useState} from 'react';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import './Select.scss';
import { TemplateData } from '../../models/template';
import { InputType } from '../../../../../utils/constants';
import { CustomPopOver } from '../../../../shared/utils/CustomPopOver';

interface ISelect{
    field: TemplateData,
    index: number
}

export default function CustomSelect(props:ISelect): ReactElement {
    const [label, setlabel] = useState('');
    const popOverclasses = CustomPopOver();

    useEffect(() => {
        if(props.field){
            switch (props.field.fieldTypeId) {
                case InputType.MULTIVALUECOMPANY:
                case InputType.SINGLEVALUECOMPANY:
                    setlabel('Company list')
                    break;
                case InputType.SINGLEVALUEUSER:
                case InputType.MULTIVALUEUSER:
                    setlabel('User list')
                    break;
                case InputType.CUSTOMNESTEDDROPDOWN:
                case InputType.CUSTOMDROPDOWN:
                    setlabel('Custom list');
                    break;
                default:
                    break;
            }
        }
    }, [props.field.fieldTypeId])

    return (
        <>{props.field?(
            <FormControl  variant="outlined" className="select">
            <Select value={label} defaultValue=""
            data-testid={`select-${props.index}`} 
             className={`${props.field.fixed ? " select__fixed" : ""}`}
            id={`grouped-select-${props.index}`} disabled={true}
            MenuProps={{ classes: { paper: popOverclasses.root },
                    anchorOrigin: {
                    vertical: "bottom",
                    horizontal: "left"
                    },
                    transformOrigin: {
                    vertical: "top",
                    horizontal: "left"
                    },
                    getContentAnchorEl: null }}>
            <MenuItem value={label} className="mat-menu-item-sm"  data-testid={`select-${props.index}-item`} >
            {label}
            </MenuItem>
            </Select>
      </FormControl>
        ):("")}
      </>
    )
}
