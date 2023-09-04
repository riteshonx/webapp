import React, { ReactElement, useState, useContext } from 'react'
import './CreateAssemblyModal.scss';
import Dialog from '@material-ui/core/Dialog';
import { DialogContent, DialogTitle, DialogActions, Button, TextField } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { stateContext } from '../../../../root/context/authentication/authContext';
import { projectFeatureAllowedRoles } from '../../../../../utils/role';
import { client } from '../../../../../services/graphql';
import Notification, { AlertTypes } from '../../../../shared/components/Toaster/Toaster';
import { CREATE_ASSEMBLY } from '../../../graphql/bimUpload';
import { setIsLoading } from '../../../../root/context/authentication/action';

export default function CreateAssemblyModal(props: any): ReactElement {
    const { dispatch, state }: any = useContext(stateContext);
    const [assemblyName, setAssemblyName] = useState("");
    const [nameError, setNameError] = useState("");


    function handleAssemblyNameChange(event: any) {
        setAssemblyName(event.target.value)
    }

    async function onSubmit() {
        try {
            dispatch(setIsLoading(true));
            if (assemblyName === '') {
                setNameError('Query name cannot be blank');
                return;
            }
            setNameError('');
            await graphqlMutation(CREATE_ASSEMBLY, {
                "modelIds": props.assemblyModelsList,
                "assemblyName": assemblyName
            }, projectFeatureAllowedRoles.createBimModel);
            props.closeModal();
            props.onComplete();
            dispatch(setIsLoading(false));
        } catch (error: any) {
            Notification.sendNotification('Some error occured on create assembly', AlertTypes.error);
            dispatch(setIsLoading(false));
        } 
    }

    const graphqlMutation = async (query: any, variable: any, role: any) => {
        let responseData;
        try {
            responseData = await client.mutate({
                mutation: query,
                variables: variable,
                context: { role: role, token: state.selectedProjectToken }
            })
            return responseData.data;
        } catch (error: any) {
            Notification.sendNotification('Some error occured on create assembly', AlertTypes.error);
            console.log(error);
        } finally {
            return (responseData?.data) ? responseData.data : null;
        }
    }

    return (
        <Dialog onClose={() => props.closeModal(false)} className='bim-assembly-modal' open={props.openModel} fullWidth={true} maxWidth='xs'>
            <DialogTitle>
                <div className="dialogTitle">
                    Create Assembly
                    <CloseIcon onClick={props.closeModal} />
                </div>
            </DialogTitle>
            <DialogContent>
                <TextField
                    onKeyDown={(e: any) => {
                        e.stopPropagation();
                        if (e.key === "Enter") {
                            onSubmit();
                        }
                    }}
                    onChange={handleAssemblyNameChange}
                    autoFocus={true}
                    className="heading textBox"
                    size={"small"}
                    placeholder={"Enter Assembly Name"}
                    value={assemblyName}
                    required={true} fullWidth={true} variant="outlined"
                />
                <div className="assembly-name-error">{nameError}</div>
            </DialogContent>
            <DialogActions className="gap-1">
                <Button variant="outlined" onClick={props.closeModal} className="btn-secondary">Cancel</Button>
                <Button variant="outlined" onClick={onSubmit} className="btn-primary" >Create</Button>
            </DialogActions>
        </Dialog>
    )
}
