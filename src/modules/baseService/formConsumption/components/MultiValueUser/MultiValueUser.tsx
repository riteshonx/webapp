import Checkbox from '@material-ui/core/Checkbox';
import Input from '@material-ui/core/Input';
import ListItemText from '@material-ui/core/ListItemText';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import React, { ReactElement, useContext} from 'react';
import { InputType } from '../../../../../utils/constants';
import { CustomPopOver } from '../../../../shared/utils/CustomPopOver';
import { formStateContext } from '../../Context/projectContext';
import TextField from '@material-ui/core/TextField';
import { Controller } from 'react-hook-form';
import { FormControl } from '@material-ui/core';
export interface IMultiValueUser{
    isEditAllowed: boolean;
    control: any;
    formData: any;
}

function MultiValueUser({isEditAllowed,control,formData}: IMultiValueUser): ReactElement {
    const popOverclasses = CustomPopOver();
    const {usersList, setIsDirty}: any = useContext(formStateContext);

    const getRenderValue=(argValue: Array<number>): string=>{
        const returnValue: Array<string>=[];
        const selectedValues=usersList.filter((item: any)=>argValue.indexOf(item.id)>-1);

        selectedValues.forEach((item: any)=>{
            returnValue.push(item?.firstName ? `${item?.firstName} ${item?.lastName}` : item?.email);
        })
        return returnValue.join(',');
    }

    return (
        <>
        {
             formData.fieldTypeId ===  InputType.MULTIVALUEUSER ? (
                //  multi value user
            <FormControl fullWidth>
                <Controller 
                    render={({ field }:{field:any}) => (
                        <Select
                            id={`multivalue-user-${formData.sequence}`}
                            {...field}
                            fullWidth
                            autoComplete='off'
                            variant="outlined"
                            multiple
                            displayEmpty
                            value={field?.value}
                            disabled={isEditAllowed}
                            onChange={(e) => {field.onChange(e.target.value as string[]), setIsDirty(true)}}
                            input={<Input />}
                            renderInput={(params: any) => (
                                <TextField placeholder={"User select"} variant="outlined"  />
                            )}
                            renderValue={(selected: Array<number>) => getRenderValue(selected)}
                        >
                            {usersList && usersList.map((user: any) => (
                                <MenuItem key={user.id} value={user.id}>
                                    <Checkbox checked={field?.value?.indexOf(user.id) > -1}  color="default" />
                                    <ListItemText className="mat-menu-item-sm" 
                                        primary={user?.firstName ? `${user?.firstName} ${user?.lastName}` : user?.email} />
                                </MenuItem>
                            ))}
                        </Select>
                    )}
                    name={`${formData.elementId}-fieldTypeId${formData.fieldTypeId}`}
                    control={control}
                    rules={{
                        required: formData.required ? true : false
                    }}
                />
            </FormControl>
             ) : (
                <FormControl fullWidth>
                  <Controller 
                    render={({ field }:{field:any}) => (
                        <Select
                            id={`singlevalue-user-${formData.sequence}`}
                            {...field}
                            fullWidth
                            autoComplete='off'
                            variant="outlined"
                            placeholder="select a value"
                            displayEmpty
                            disabled={isEditAllowed}
                            onChange={(e) => {field.onChange(e), setIsDirty(true)}}
                            renderInput={(params: any) => (
                                <TextField placeholder={"User select"} variant="outlined"  />
                            )}
                            MenuProps={{ classes: { paper: popOverclasses.root },
                                anchorOrigin: {
                                vertical: "bottom",
                                horizontal: "left"
                                },
                                transformOrigin: {
                                vertical: "top",
                                horizontal: "left"
                                },
                                getContentAnchorEl: null }}
                        >
                            <MenuItem value="" className="mat-menu-item-sm"><em>None</em></MenuItem>
                            {
                                usersList && usersList.map((user: any) => (
                                    <MenuItem key={user.id} className="mat-menu-item-sm"
                                    value={user.id}>{user?.firstName ? `${user?.firstName} ${user?.lastName}` : user?.email}</MenuItem>
                                ))
                            }
                        </Select>
                     )}
                     name={`${formData.elementId}-fieldTypeId${formData.fieldTypeId}`}
                     control={control}
                     rules={{
                         required: formData.required ? true : false
                     }}
                    />
                </FormControl>
             )
        }
        </>
    )
}

export default React.memo(MultiValueUser)