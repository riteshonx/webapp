import React, { ReactElement, useContext, useEffect, useState } from 'react';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import IconButton from '@material-ui/core/IconButton';
import Popover from '@material-ui/core/Popover';
import MenuItem from '@material-ui/core/MenuItem';
import './DrawingActionPopOver.scss';
import { postApi } from '../../../../../services/api';
import { stateContext } from '../../../../root/context/authentication/authContext';
import { setIsLoading } from '../../../../root/context/authentication/action';
import Notification,{ AlertTypes } from '../../../../shared/components/Toaster/Toaster';
import ConfirmDialog from '../../../../shared/components/ConfirmDialog/ConfirmDialog';
import DeleteIcon from '@material-ui/icons/Delete';
import GetAppIcon from '@material-ui/icons/GetApp';
import EditIcon from '@material-ui/icons/Edit';
import { DrawingLibDetailsContext } from '../../context/DrawingLibDetailsContext';
import { setConfirmBoxStatus } from '../../context/DrawingLibDetailsAction';

interface message {
    header: string,
    text: string,
    cancel: string,
    proceed: string
}

const confirmMessage: message = {
    header: "Are you sure?",
    text: `If you delete this, all data related to this drawing will be lost.`,
    cancel: "Cancel",
    proceed: "Confirm",
}

export default function DrawingActionPopOver(props: any): ReactElement {

    const {state, dispatch }:any = useContext(stateContext);
    const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
    const [drawingDetail, setDrawingDetail] = useState<any>();
    const [confirmOpen, setConfirmOpen] = useState(false);
    const {DrawingLibDetailsState, DrawingLibDetailsDispatch}: any = useContext(DrawingLibDetailsContext);
    

    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;

    useEffect(() => {
        if(props.selectedDrawingData){
            setDrawingDetail(props.selectedDrawingData)
        }
        return () => {
            setDrawingDetail(null)
        }
    }, [props.selectedDrawingData]);

    useEffect(() => {
        if(DrawingLibDetailsState.isConfirmOpen){
          handleConfirmBoxClose();
        }
      }, [DrawingLibDetailsState.isConfirmOpen])

    //open popover
    const showMenuItems = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        event.preventDefault();
        props.selectedDrawing();
        setAnchorEl(event.currentTarget);
    };

    //close popover
    const handleClose = () => {
        setAnchorEl(null);
    };

    // download drawing sheet
    const handleDownload = () => {
        const payload = [{
            fileName: `${drawingDetail.drawingName}.pdf`,
            key: drawingDetail.filePath,
            expiresIn: 1000,
            processed: true
        }];         
        downloadDrawing(payload)
    };

    // delete drawing sheet
    const handleDelete = () => {
        setConfirmOpen(true);
    };

    // downloaddrawing API
    const downloadDrawing = async (payload: any) => {
        try {
            dispatch(setIsLoading(true));
            const fileUploadResponse = await postApi('V1/S3/downloadLink', payload);
            window.open(fileUploadResponse.success[0].url, "_parent");
            dispatch(setIsLoading(false));
        } catch (error) {   
            Notification.sendNotification(error, AlertTypes.warn);
            dispatch(setIsLoading(false));
        }
    }

    const handleConfirmBoxClose = () => {
        DrawingLibDetailsDispatch(setConfirmBoxStatus(false));
        setConfirmOpen(false);
    }

    const deleteFileDoc = () => {
        props.deleteDrawing(drawingDetail);
    }

    const handleEditDrawing = () => {
        props.editDrawingDate(drawingDetail)
        props.updateOpen(true);
        handleClose();
    }

    return (
        <>
            <div className="drawingSheetAction">
                <IconButton
                    data-testid={`template-moreoption-${props.id}`}
                    aria-label="more"
                    aria-controls="long-menu"
                    aria-haspopup="true"
                    onClick={(event) => showMenuItems(event)}
                >
                <MoreVertIcon className="cellicon"/> 
                </IconButton>
                <Popover
                    id={id}
                    open={open}
                    anchorEl={anchorEl}
                    onClose={handleClose}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'center',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'center',
                    }}
                >   
                    {
                        state?.projectFeaturePermissons?.canupdateDrawings && (
                            <MenuItem className="menu-item" onClick={handleEditDrawing}>
                                <span className="menu-item__icon">
                                    <EditIcon />
                                </span>
                                Edit
                            </MenuItem>
                        )
                    }
                    <MenuItem className="menu-item" onClick={handleDownload}>
                        <span className="menu-item__icon">
                            <GetAppIcon />
                        </span>
                        Download
                    </MenuItem>
                    {
                        state?.projectFeaturePermissons?.candeleteDrawings && (
                            <MenuItem className="menu-item" onClick={handleDelete}>
                                <span className="menu-item__icon">
                                    <DeleteIcon />
                                </span>
                                Delete
                            </MenuItem>
                        )
                    }
                </Popover>
        </div>

            {
                confirmOpen ? (
                    <ConfirmDialog open={confirmOpen} message={confirmMessage} 
                    close={handleConfirmBoxClose} proceed={deleteFileDoc} />
                ) : ('')
            }          
        </>    
    )
}
