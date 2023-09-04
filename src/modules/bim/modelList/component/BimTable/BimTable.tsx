import React, { useState, useEffect, useContext } from 'react';
import { stateContext } from '../../../../root/context/authentication/authContext';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import './BimTable.scss'
import RevetImg from '../../../../../assets/images/rvt-file.svg';
import IfcImg from '../../../../../assets/images/ifc-file.svg';
import AssemblyImg from '../../../../../assets/images/assembly.svg';
import TickImg from '../../../../../assets/images/tick_with_circel.svg';
import CancelImg from '../../../../../assets/images/cancel_with_circle.svg';
import openImg from '../../../../../assets/images/open_icon.svg';
import DeleteImg from '../../../../../assets/images/delete_icon.svg';
import moment from 'moment';
import { bimstatusColorNameMapping } from '../../../constants/query'
import CloseIcon from '@material-ui/icons/Close';
import Checkbox from '@material-ui/core/Checkbox';
import CircularProgress from '@material-ui/core/CircularProgress';
import { Tooltip } from '@material-ui/core';
import Popover from '@mui/material/Popover';
import BimStageViewer from '../BimStageViewer/BimStageViewer';
import DomainAddIcon from "@mui/icons-material/DomainAdd";
import { match, useHistory, useRouteMatch } from "react-router-dom";
import UpdateModelPositionPopup from '../UpdateModelPositionPopup/UpdateModelPositionPopup';
import EditLocationIcon from '@material-ui/icons/EditLocation';
import { ILocationModel } from 'src/modules/visualize/VisualizeView/models/locationModel';

export default function BimTable(props: any) {
    const { dispatch, state }: any = useContext(stateContext);
    const [stageData, setStageData] = useState<any>(null);
    const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
    const open = Boolean(anchorEl);
    const history = useHistory();
    const pathMatch: match<{projectId: string;}> = useRouteMatch();
    const [showUpdatePositionModal, setShowUpdatePositionModal] = React.useState(false);
    const [updatePositionModel, setUpdatePositionModel] = React.useState<ILocationModel>();

    useEffect(() => {
        if (anchorEl) {
            !anchorEl.isConnected && setAnchorEl(null)
            const selectedstageData = props.modelList.find((model: any) => model.id === stageData?.id);
            if (selectedstageData) {
                setStageData({...selectedstageData, type: stageData?.type})
            }
        }
    }, [props.modelList, props.uploadProgress])

    function checkCancelEnabled(data: any) {
        if (data) {
            const uploadCompltedDate = moment.utc(data.createdAt);
            const currentTime = moment.utc();
            const durationLimitCheck = (data.geometryStatus) ? currentTime.diff(moment.utc(data.modelCompletedAt), 'hours') >= 1
                : currentTime.diff(uploadCompltedDate, 'hours') >= 2;
            return durationLimitCheck;
        }
        return true;
    }

    function checkDeleteEnabled(data: any) {
        if (data.isDeleted) {
            const currentTime = moment.utc();
            return currentTime.diff(moment.utc(data.updatedAt), 'hours') >= 3;
        }
        return !props.isDisableOpr;
    }

    const handlePopoverOpen = (event: React.MouseEvent<HTMLElement, MouseEvent>, data: any, type: string) => {
        setAnchorEl(event.currentTarget);
        setStageData({...data, type: type});
    };

    const handlePopoverClose = () => {
        setAnchorEl(null);
    };

    const getArrowPosition = () => {
        const left = anchorEl ? anchorEl.getBoundingClientRect().left - 45  : 0; 
        const top = anchorEl ? anchorEl.getBoundingClientRect().top - 20 : 0; 
        return {
            "top": top + "px", 
            "left": left + "px"
        }
    };

    function getStatusIcon(status: string, isDeleted: boolean, modelData: any, type: string) {
        if (isDeleted) {
            return <CircularProgress onMouseEnter={(e) => handlePopoverOpen(e, modelData, type)} onMouseLeave={handlePopoverClose} className='deleting' size={20} />;
        } else if (status === 'COMPLETED') {
            return <img src={TickImg} onMouseEnter={(e) => handlePopoverOpen(e, modelData, type)} onMouseLeave={handlePopoverClose} className="statusImage" alt="file-icon" />;
        } else if (["DATA_PROCESSING_FAILED", "MODEL_PROCESSING_FAILED", "ABORTED"].includes(status)) {
            return <img src={CancelImg} onMouseEnter={(e) => handlePopoverOpen(e, modelData, type)} onMouseLeave={handlePopoverClose} className="statusImage" alt="file-icon" />;
        } else if (["DATA_PROCESSING_COMPLETED", "MODEL_PROCESSING_STARTED", "MODEL_PROCESSING_COMPLETED", "UPLOADED"].includes(status)) {
            return <CircularProgress onMouseEnter={(e) => handlePopoverOpen(e, modelData, type)} onMouseLeave={handlePopoverClose} className='inProgress' size={20} />;
        }
        return <CircularProgress onMouseEnter={(e) => handlePopoverOpen(e, modelData, type)} onMouseLeave={handlePopoverClose} className='inProgress' size={20} />;
    }

    return (
        <>
            <TableContainer className="bimTableContainer" component={Paper}>
                <Table className="bimTable" aria-label="simple table">
                    <TableHead className="bimTableHead">
                        <TableRow>
                            <TableCell align="center" className="assemblyColumn">
                                {!props.isAssemblyExist && <Checkbox color="default"
                                    checked={props.selectedAll}
                                    onChange={event => props.selectAllModel(event.target.checked)}
                                    disabled={!state.projectFeaturePermissons?.cancreateBimModel}
                                    className='assemblyChkBx selectAll'
                                    size='small'
                                />}
                            </TableCell>
                            <TableCell>File Details</TableCell>
                            <TableCell align="left">Category Count</TableCell>
                            <TableCell align="left">Element Count</TableCell>
                            <TableCell align="left">Uploaded by</TableCell>
                            <TableCell align="center">Model Status</TableCell>
                            <TableCell align="center">Visualize Status</TableCell>
                            <TableCell align="left">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {props.modelList.map((file: any, index: number) => {
                            return <React.Fragment key={file.id}>
                                <TableRow className={`bimTableRow ${index % 2 && 'geybg'}`} key={file.id}>
                                    <TableCell align="center" className="assemblyColumn">
                                        {!props.isAssemblyExist && <Checkbox color="default"
                                            checked={props.assemblyModelsList.includes(file.id)}
                                            onChange={event => props.changeAssemblyModels(event.target.checked, file.id)}
                                            disabled={!state.projectFeaturePermissons?.cancreateBimModel || props.isAssemblyExist || file.isDeleted || file.bimModelStatuses[0]?.isAssembly || file.bimModelStatuses[0]?.status !== "COMPLETED"}
                                            className='assemblyChkBx'
                                            size='small'
                                        />}
                                    </TableCell>
                                    <TableCell className="fileNameCell">
                                        {(!file.bimModelStatuses[0]?.isAssembly) ?
                                            <img src={file.modelFormat === 'ifc' ? IfcImg : RevetImg} alt="file-icon" />
                                            : <img src={AssemblyImg} alt="file-icon" />}
                                        <span>
                                            <div>
                                                {file.title}<br />
                                                <div className="fileDetails">
                                                    {file.createdAt && <span className="file-property">
                                                        <span className="file-property-key">Uploaded at: </span>
                                                        <span>{moment.utc(file.createdAt).format('DD-MMM-YYYY [at] h:mm:ss A')}</span>
                                                    </span>}
                                                    {!file.bimModelStatuses[0]?.isAssembly && <span className="file-property">
                                                        <span className="file-property-key"> | Size: </span>
                                                        <span>{(file.fileSize / (1024 * 1024)).toFixed(2) + ' MB'}</span>
                                                    </span>}
                                                </div>
                                            </div>
                                        </span>
                                    </TableCell>
                                    <TableCell align="left">{(file.bimModelStatuses[0]?.isAssembly && file.bimModelStatuses[0]?.status === "COMPLETED") ? props.assemblyInfo?.categoryCount || 0
                                        : file.bimElementProperties_aggregate?.aggregate?.categoryCount || 0}</TableCell>
                                    <TableCell align="left">{(file.bimModelStatuses[0]?.isAssembly && file.bimModelStatuses[0]?.status === "COMPLETED") ? props.assemblyInfo?.elementCount || 0
                                        : file.bimElementProperties_aggregate?.aggregate?.elementCount || 0}</TableCell>
                                    <TableCell align="left">{file.tenantAssociationByCreatedby.user.firstName + ' ' + file.tenantAssociationByCreatedby.user.lastName}</TableCell>
                                    <TableCell align="center" style={{ color: bimstatusColorNameMapping[file.bimModelStatuses[0]?.status]?.color }} >
                                        {getStatusIcon(file.bimModelStatuses[0]?.status, file.isDeleted, file, 'bimModel')}
                                    </TableCell>
                                    <TableCell align="center" style={{ color: bimstatusColorNameMapping[file.locationModel?.locationModelStatuses[0]?.status]?.color }} >
                                        {file.isLocationModelAttached && file.locationModel ? getStatusIcon(file.locationModel?.locationModelStatuses[0]?.status, file.isDeleted, file, 'visualizeModel') : '-'}
                                    </TableCell>
                                    <TableCell align="left" className='bimActions'>
                                        {!file.isDeleted && file.bimModelStatuses[0]?.status === "COMPLETED" &&
                                            <Tooltip title={file.bimModelStatuses[0]?.isAssembly ? "Open Assembly with edges" : "Open Model with edges"} aria-label="Open Model">
                                                <img src={openImg} className="statusImage" onClick={() => props.openModel(file.id, true)} alt="file-icon" />
                                            </Tooltip>
                                        }
                                        {!file.isDeleted && file.isLocationModelAttached && file.locationModel && file.locationModel?.locationModelStatuses[0]?.status === "COMPLETED" &&
                                            <Tooltip title="Open Visualize Model" aria-label="Open Visualize Model">
                                                <DomainAddIcon fontSize='large' onClick={() => history.push(`/visualize/${pathMatch.params.projectId}`)}/>
                                            </Tooltip>
                                        }
                                        {!file.isDeleted && file.isLocationModelAttached && file.locationModel && file.locationModel?.locationModelStatuses[0]?.status === "COMPLETED" &&
                                            <Tooltip title="Edit Visualize Model Position" aria-label="Open Visualize Model">
                                                <EditLocationIcon fontSize='large' onClick={() => (setShowUpdatePositionModal(true), setUpdatePositionModel(file.locationModel))}/>
                                            </Tooltip>
                                        }
                                        {state.projectFeaturePermissons?.candeleteBimModel &&  checkDeleteEnabled(file) && ["DATA_PROCESSING_FAILED", "MODEL_PROCESSING_FAILED", "COMPLETED", "ABORTED", 'DELETED'].includes(file.bimModelStatuses[0]?.status)
                                            && (!props.isAssemblyExist || !props.assemblyInfo?.sourceModelIds?.includes(file.id))
                                            && <Tooltip title={file.bimModelStatuses[0]?.isAssembly ? "Delete Assembly" : "Delete Model"} aria-label="Delete Model">
                                                <img src={DeleteImg} className="statusImage" onClick={() => props.onDeleteModel(file.id)} alt="file-icon" />
                                            </Tooltip>
                                        }
                                        {state.projectFeaturePermissons?.candeleteBimModel && !file.isDeleted && !["DATA_PROCESSING_FAILED", "MODEL_PROCESSING_FAILED", "COMPLETED", "ABORTED", 'DELETED'].includes(file.bimModelStatuses[0]?.status)
                                            && checkCancelEnabled(file.bimModelStatuses[0])
                                            && <Tooltip title="Cancel Process" aria-label="Cancel Process">
                                                <CloseIcon fontSize="small" className="statusImage" onClick={() => props.onCancelModel(file.id)} />
                                            </Tooltip>
                                        }
                                    </TableCell>
                                </TableRow>
                            </React.Fragment>
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
            <Popover
                id="mouse-over-popover"
                className={`stagePopup ${stageData?.isDeleted && "deleting"} `}
                sx={{ pointerEvents: 'none' }}
                open={open}
                anchorEl={anchorEl}
                anchorOrigin={{ vertical: 'center', horizontal: 'left' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                onClose={handlePopoverClose}
            >
                {!stageData?.isDeleted && <div className='popTitle'>{stageData?.bimModelStatuses[0] && stageData?.bimModelStatuses[0].isAssembly ? "Assembly Creation" : stageData?.type === 'visualizeModel' ? "Visualize Creation" :"Model Creation"}</div>}
                <BimStageViewer
                    statusData={stageData?.type === 'visualizeModel' ? stageData?.locationModel?.locationModelStatuses[0]  : stageData?.bimModelStatuses[0]}
                    modelId={stageData?.id}
                    isDeleted={stageData?.isDeleted}
                    createdAt={stageData?.createdAt}
                    updatedAt={stageData?.updatedAt}
                    uploadModelId={props.uploadModelId}
                    uploadProgress={props.uploadProgress}
                />
            </Popover>
            {showUpdatePositionModal && updatePositionModel &&  <UpdateModelPositionPopup onClose={() => setShowUpdatePositionModal(false)} model={updatePositionModel} />}
            {open && <div className={`bim-triangle-right ${stageData?.isDeleted && 'deleting'}`} style={getArrowPosition()}>&#10148;</div>}
        </>
    );
}