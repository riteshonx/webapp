import React, { ReactElement, useContext, useEffect, useState } from 'react';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import IconButton from '@material-ui/core/IconButton';
import Popover from '@material-ui/core/Popover';
import MenuItem from '@material-ui/core/MenuItem';
import './SpecificationActionPopOver.scss';
import { postApi } from '../../../../../services/api';
import { stateContext } from '../../../../root/context/authentication/authContext';
import { setIsLoading } from '../../../../root/context/authentication/action';
import Notification, { AlertTypes } from '../../../../shared/components/Toaster/Toaster';
import ConfirmDialog from '../../../../shared/components/ConfirmDialog/ConfirmDialog';
import DeleteIcon from '@material-ui/icons/Delete';
import GetAppIcon from '@material-ui/icons/GetApp';
import EditIcon from '@material-ui/icons/Edit';
import EditSpecification from '../EditSpecification/EditSpecification';
import { SpecificationLibDetailsContext } from '../../context/SpecificationLibDetailsContext';
import { setConfirmBoxStatus } from '../../context/SpecificationLibDetailsAction';
interface message {
    header: string,
    text: string,
    cancel: string,
    proceed: string
}

const confirmMessage: message = {
    header: "Are you sure?",
    text: `If you delete this, all data related to this specification will be lost.`,
    cancel: "Cancel",
    proceed: "Confirm",
}

export default function SpecificationActionPopOver(props: any): ReactElement {
    // console.log(props,'in pop over')
    const { state, dispatch }: any = useContext(stateContext);
    const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
    const [specificationDetail, setSpecificationDetail] = useState<any>();
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [isUpdateOpen, setisUpdateOpen] = useState(false);
    const [selectedSpecificationData, setSelectedSpecificationData] = useState<any>()
    const { SpecificationLibDetailsState, SpecificationLibDetailsDispatch }: any = useContext(SpecificationLibDetailsContext);

    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;

    useEffect(() => {
        if (props.selectedSpecificationData) {
            setSpecificationDetail(props.selectedSpecificationData)
        }
        return () => {
            // setSelectedSpecificationData(null);
            setSpecificationDetail(null)
        }
    }, [props.selectedSpecificationData]);

    useEffect(() => {
        if (SpecificationLibDetailsState.isConfirmOpen) {
            handleConfirmBoxClose();
        }
    }, [SpecificationLibDetailsState.isConfirmOpen])
    //open popover
    const showMenuItems = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        event.preventDefault();
        props.selectedSpecification();
        setAnchorEl(event.currentTarget);
    };

    //close popover
    const handleClose = () => {
        setAnchorEl(null);
    };

    // download specification sheet
    const handleDownload = () => {
        const payload = [{
            fileName: `${specificationDetail.fileName}.pdf`,
            key: specificationDetail.sourceKey,
            expiresIn: 1000,
            // processed: true
        }];
        downloadSpecification(payload)
    };

    // delete specification sheet
    const handleDelete = () => {
        setConfirmOpen(true);
    };

    // download specification API
    const downloadSpecification = async (payload: any) => {
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
        SpecificationLibDetailsDispatch(setConfirmBoxStatus(false));
        setConfirmOpen(false);
    }

    const deleteFileDoc = () => {
        props.deleteSpecification(specificationDetail);
        // props.deleteDrawing(specificationDetail);
    }

    const handleEditSpecification = () => {
        setisUpdateOpen(true);
        setSelectedSpecificationData(specificationDetail)
        handleClose();
    }

    return (
        <>
            <div className="specificationSheetAction">
                <IconButton
                    data-testid={`template-moreoption-${props.id}`}
                    aria-label="more"
                    aria-controls="long-menu"
                    aria-haspopup="true"
                    onClick={(event) => showMenuItems(event)}
                >
                    <MoreVertIcon className="cellicon" />
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
                    {/* {
                        // state?.projectFeaturePermissons?.canuploadDrawings &&
                         (
                            <MenuItem className="menu-item" onClick={handleEditSpecification}>
                                <span className="menu-item__icon">
                                    <EditIcon />
                                </span>
                                Edit
                            </MenuItem>
                        )
                    } */}
                    <MenuItem className="sepecification-menu-item" onClick={handleDownload}>
                        <span className="sepecification-menu-item__icon">
                            <GetAppIcon />
                        </span>
                        Download
                    </MenuItem>
                    {
                        state?.projectFeaturePermissons?.candeleteSpecifications &&
                        (
                            <MenuItem className="sepecification-menu-item" onClick={handleDelete}>
                                <span className="sepecification-menu-item__icon">
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

            {/* {
                isUpdateOpen && (
                    <EditSpecification selectedSpecification={selectedSpecificationData} closeSideBar={() => setisUpdateOpen(false)}/>
                )
            }            */}
        </>
    )
}
