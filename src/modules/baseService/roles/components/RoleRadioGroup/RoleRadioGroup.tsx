import React, { ReactElement } from 'react';
import { Grid, Radio } from '@material-ui/core';
import './RoleRadioGroup.scss';
import { PermissionType } from '../../models/role';

interface Props {
    value: string,
    isView: boolean,
    index: number,
    setValue: (argValue: PermissionType, index: number)=>void
}

function RoleRadioGroup({value, isView, index, setValue}: Props): ReactElement {

    const handleRoleChange=(event: React.ChangeEvent<HTMLInputElement>)=>{
        setValue(event.target.value as PermissionType,index);
    }
    return (
        <Grid container spacing={4} className="RoleRadioGroup">
            <Grid item xs={3} className="RoleRadioGroup__radioOption">
                <Radio disabled={isView}
                    checked={value === PermissionType.admin}
                    onChange={handleRoleChange}
                    value={PermissionType.admin}
                    color="default"
                    name="admin"
                    inputProps={{ 'aria-label': 'Admin' }}
                />
            </Grid>
            <Grid item xs={3} className="RoleRadioGroup__radioOption">
                <Radio disabled={isView}
                    checked={value === PermissionType.editor}
                    onChange={handleRoleChange}
                    value={PermissionType.editor}
                    color="default"
                    name="editor"
                    inputProps={{ 'aria-label': 'editor' }}
                />
            </Grid>
            <Grid item xs={3} className="RoleRadioGroup__radioOption">
                <Radio disabled={isView}
                    checked={value === PermissionType.viewer}
                    onChange={handleRoleChange}
                    value={PermissionType.viewer}
                    color="default"
                    name="viewer"
                    inputProps={{ 'aria-label': 'viewer' }}
                />
            </Grid>
            <Grid item xs={3} className="RoleRadioGroup__radioOption">
                <Radio disabled={isView}
                        checked={value === PermissionType.none}
                        onChange={handleRoleChange}
                        value={PermissionType.none}
                        color="default"
                        name="none"
                        inputProps={{ 'aria-label': 'none' }}
                    />
            </Grid>
        </Grid>
    )
}

export default RoleRadioGroup
