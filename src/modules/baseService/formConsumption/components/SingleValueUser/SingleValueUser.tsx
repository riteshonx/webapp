import React, { ReactElement, useContext, useEffect, useState } from 'react';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import {  LOAD_PROJECT_USERS } from '../../../graphql/queries/customList';
import { featureFormRoles, tenantUserRole } from '../../../../../utils/role';
import { client } from '../../../../../services/graphql';
import { match, useRouteMatch } from 'react-router-dom';
import { projectContext } from '../../Context/projectContext';
import { CustomPopOver } from '../../../../shared/utils/CustomPopOver';
import { stateContext } from 'src/modules/root/context/authentication/authContext';

export interface Params {
    id: string;
    featureId: string;
    formId: string
}


export default function SingleValueUser(props: any): ReactElement {

    const pathMatch:match<Params>= useRouteMatch();
    const [tenantUsersLists, setTenantUsersLists] = useState<Array<any>>([])
    const [projectId, setProjectId] = useState<number>();
    const {state}:any = useContext(stateContext);
    const popOverclasses = CustomPopOver();

    useEffect(() => {
        if(pathMatch.params.id){
            setProjectId(Number(pathMatch.params.id));
        }
        if(projectId && state?.selectedProjectToken){
            fetchTenantUsersLists()
        }
    }, [projectId, state?.selectedProjectToken]);


    const fetchTenantUsersLists = async () => {
        try{
            const role= pathMatch.params?.formId?featureFormRoles.updateForm:featureFormRoles.createForm;
            const customListResponse =  await client.query({
                query: LOAD_PROJECT_USERS,
                variables: {
                    name:"%%"
                },
                fetchPolicy: 'network-only',
                context:{role, token: state?.selectedProjectToken}
            })
            const users: any =[];
            customListResponse.data?.user.forEach((data: any) => {
                if(data.status !==1){
                    users.push(data)
                }
            })
            setTenantUsersLists(users);
        }catch(err){
            console.log(err)
        }
    }

    return (
        <>
           <Select
                id="singlevalue-user"
                {...props.field}
                fullWidth
                autoComplete='off'
                variant="outlined"
                placeholder="select a value"
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
                    <MenuItem value="" className="mat-menu-item-sm">None</MenuItem>
                {
                    tenantUsersLists.map((user: any) => (
                        <MenuItem key={user.id} value={user.id} className="mat-menu-item-sm">
                            {user?.firstName ? `${user?.firstName} ${user?.lastName}` : user?.email}
                        </MenuItem>
                    ))
                }
            </Select>
        </>
    )
}
