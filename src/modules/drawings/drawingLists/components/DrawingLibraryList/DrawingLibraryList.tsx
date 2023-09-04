import React, { ReactElement, useContext, useEffect, useState } from 'react';
import './DrawingLibraryList.scss';
import PdfIcon from '../../../../../assets/images/pdf_image.svg';
import Tooltip from '@material-ui/core/Tooltip';
import DeleteIcon from '@material-ui/icons/Delete';
import GetAppIcon from '@material-ui/icons/GetApp';
import Button from '@material-ui/core/Button';
import { match, useHistory, useRouteMatch } from 'react-router-dom';
import { decodeExchangeToken } from '../../../../../services/authservice';
import { drawingStatus } from '../../../utils/drawingsConstant';
import ConfirmDialog from '../../../../shared/components/ConfirmDialog/ConfirmDialog';
import moment from 'moment';
import { stateContext } from '../../../../root/context/authentication/authContext';
import { setIsLoading } from '../../../../root/context/authentication/action';
import { postApi } from '../../../../../services/api';
import Notification,{ AlertTypes } from '../../../../shared/components/Toaster/Toaster';
import { DELETE_DRAWING_LIBRARY } from '../../graphql/queries/drawing';
import { client } from '../../../../../services/graphql';
import { projectFeatureAllowedRoles } from '../../../../../utils/role';
import NoDataMessage from '../../../../shared/components/NoDataMessage/NoDataMessage';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import WarningIcon from '@material-ui/icons/Warning';

export interface Params {
    projectId: string;
    documentId: string;
}
interface message {
    header: string,
    text: string,
    cancel: string,
    proceed: string
}

const confirmMessage: message = {
    header: "Are you sure!",
    text: `Do you want to delete this drawing document?`,
    cancel: "Cancel",
    proceed: "Confirm",
}

const noDataMessage = "No data available";

export default function DrawingLibraryList(props: any): ReactElement {

    const {state, dispatch }:any = useContext(stateContext);
    const history = useHistory();
    const pathMatch:match<Params>= useRouteMatch();
    const [uploadingFilesDtata, setUploadingFilesDtata] = useState<Array<any>>([]);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [selectedDrawing, setSelectedDrawing] = useState<any>();

    const startReview = (item: any) => {
        history.push(`/drawings/projects/${pathMatch.params.projectId}/review/${item}`); 
    }

    useEffect(() => {
        if(props?.uploadingFiles?.length > 0){
            setUploadingFilesDtata(props?.uploadingFiles);
        }else{
            setUploadingFilesDtata([]);
        }
    }, [props?.uploadingFiles])

    const handleConfirmBoxClose = () => {
        setConfirmOpen(false);
        setSelectedDrawing(null);
    }

    const handleConfirmBox = (file: any) => {
        setConfirmOpen(true);
        setSelectedDrawing(file);
    }

    const deleteFileDoc = async () => {
        try{
            dispatch(setIsLoading(true));
            const updateDrawingResponse: any = await client.mutate({
                mutation: DELETE_DRAWING_LIBRARY,
                variables: {
                    id: selectedDrawing.id,
                },
                context:{role: projectFeatureAllowedRoles.uploadDrawings, token: state.selectedProjectToken}
            })
            Notification.sendNotification("Document deleted successfully", AlertTypes.success);
            handleConfirmBoxClose();
            if(updateDrawingResponse?.data.update_drawingUploadStatus?.affected_rows > 0){
                props.refresh(selectedDrawing);
            }
            dispatch(setIsLoading(false));
        }
        catch(err: any){
            dispatch(setIsLoading(false));
            Notification.sendNotification(err, AlertTypes.warn);
            console.log(err)
        }
    }

    const handleDownloadFile = (file: any) => {
        const payload = [{
            fileName: file.fileName,
            key: file.sourceKey,
            expiresIn: 1000
        }]; 

        downloadDocument(payload);
    }

    const downloadDocument = async (payload: any) => {
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

    const openFileUpload = () => {
        props.handleOpenFileZone();
    }


    return (
    <>
    {
        uploadingFilesDtata?.length > 0 ? (
            <>
                <div className="dwgDocumentsList">
                    <div className="dwgDocumentsList__header">
                        <div>File Details</div>
                        <div>Version Name</div>
                        <div>Version Date</div>
                        <div>Template</div>
                        <div>Total Pages</div>
                        <div>Uploaded By</div>
                        <div>Status</div>
                        <div></div>
                    </div>
                    <>
                        {
                            uploadingFilesDtata.length > 0  ? (
                                <>
                                {
                                    uploadingFilesDtata.map((file: any) => (

                                        <div className="dwgDocumentsList__file" key={file.sourceKey}>
                                            <div className="dwgDocumentsList__file__info">
                                                <div className="dwgDocumentsList__file__info__details">
                                                    <div className="dwgDocumentsList__file__info__details__image">
                                                        <img src={PdfIcon} alt="pdf"/>
                                                    </div>
                                                    <div className="dwgDocumentsList__file__info__details__text">
                                                        <div>
                                                            <Tooltip title={file.fileName || ''} aria-label="createdBy">
                                                            <label>
                                                                {file.fileName ? file.fileName.length > 25 ?
                                                                `${file.fileName.slice(0, 25)} . . .`: file.fileName : ''}
                                                            </label>
                                                            </Tooltip> 
                                                        </div>
                                                        <div className="dwgDocumentsList__file__info__details__text__time">
                                                            {
                                                                file?.createdAt ? (
                                                                    <>
                                                                        <span>
                                                                            {moment.utc(file?.createdAt).format('DD-MMM-YYYY').toString()} 
                                                                        </span> {` at `}
                                                                        <span>
                                                                            {moment.utc(file?.createdAt).format('hh:mm A').toString()}
                                                                        </span>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <span>
                                                                            {moment.utc(new Date()).format('DD-MMM-YYYY').toString()} 
                                                                        </span> {` at `}
                                                                        <span>
                                                                            {moment.utc(new Date().getTime()).format('hh:mm A').toString()}
                                                                        </span>
                                                                    </>
                                                                )
                                                            }
                                                            {` | `} 
                                                            <span>
                                                                {(file.fileSize / (1024 * 1024)).toFixed(3)} MB 
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="dwgDocumentsList__file__info__details__text">
                                                    { file?.versionInfoReviewed?.versionInfo?.Set_Version_Name ? 
                                                    file?.versionInfoReviewed?.versionInfo?.Set_Version_Name : '-' }
                                                </div>
                                                <div className="dwgDocumentsList__file__info__details__text">
                                                    { file?.versionInfoReviewed?.versionInfo?.Version_Date &&  
                                                    moment(file?.versionInfoReviewed?.versionInfo?.Version_Date).format('DD-MMM-YYYY').toString() 
                                                    !== 'Invalid date' ? 
                                                    moment(file?.versionInfoReviewed?.versionInfo?.Version_Date).format('DD-MMM-YYYY').toString()
                                                    : '-' }
                                                </div>
                                                <div className="dwgDocumentsList__file__info__details__text">
                                                    <Tooltip title={file?.drawingTemplateFormat?.name || ''} aria-label="createdBy">
                                                        <span>
                                                            {file?.drawingTemplateFormat?.name ? file?.drawingTemplateFormat?.name.length > 25 ?
                                                            `${file?.drawingTemplateFormat?.name.slice(0, 15)} . . .`: 
                                                            file?.drawingTemplateFormat?.name : ''}
                                                        </span>
                                                    </Tooltip> 
                                                </div>
                                                <div className="dwgDocumentsList__file__info__details__text">
                                                    { file?.drawingSheets ? file?.drawingSheets?.length :
                                                     file?.sheets?.sheets ? file?.sheets?.sheets?.length : '-'}
                                                </div>
                                                <div className="dwgDocumentsList__file__info__details__text">
                                                    { 
                                                        file?.createdByTenantUser?.user ? (
                                                            <>
                                                                <div>{file?.createdByTenantUser?.user.firstName} </div>
                                                                <div> {file?.createdByTenantUser?.user.lastName}</div>
                                                            </>
                                                        ) : (
                                                            <div> {decodeExchangeToken().userName}</div>
                                                         )
                                                    }
                                                    
                                                </div>
                                                <div className="dwgDocumentsList__file__info__details__status">
                                                    <div className={`${file?.status === 'FAILED' ? 
                                                            'dwgDocumentsList__file__info__details__status__failed' : file?.status === 'PUBLISHED' ? 
                                                            'dwgDocumentsList__file__info__details__status__published' : 
                                                            file?.status === 'UPLOAD_FAILED' ? 
                                                            'dwgDocumentsList__file__info__details__status__failed': ''} `}>
                                                        { file?.status ? (file?.status === 'UPLOAD_FAILED' ? 'FAILED' : file?.status ): '-'}
                                                    </div>
                                                    <>
                                                        {
                                                            file?.status === 'PARSING' && (
                                                                <>
                                                                    {/* <div className="stage">
                                                                        <div className="dot-pulse"></div>
                                                                    </div> */}
                                                                    {
                                                                        file?.progress ? (
                                                                            <div className="dwgDocumentsList__file__info__details__status__progress">
                                                                                { `${file?.progress} %` }
                                                                            </div>
                                                                        ) : (
                                                                            <div className="dwgDocumentsList__file__info__details__status__progress">
                                                                                { `0 %` }
                                                                            </div>
                                                                        )
                                                                    }
                                                                </>
                                                            )
                                                        }
                                                    </>
                                                    <>
                                                        {
                                                            file?.status === 'FAILED' && (
                                                                <>
                                                                    <div className="dwgDocumentsList__file__info__details__status__warn-icon">
                                                                        <Tooltip title={'Parsing failed. Please re-upload the file.'} 
                                                                            aria-label="failed">
                                                                            <label>
                                                                                <WarningIcon className="error"/>
                                                                            </label>
                                                                        </Tooltip>
                                                                    </div>
                                                                </>
                                                            )
                                                        }
                                                                                                                {
                                                            file?.status === 'UPLOAD_FAILED' && (
                                                                <>
                                                                    <div className="dwgDocumentsList__file__info__details__status__warn-icon">
                                                                        <Tooltip title={'Uploading Failed. Please re-upload the file.'} 
                                                                            aria-label="failed">
                                                                            <label>
                                                                                <WarningIcon className="error"/>
                                                                            </label>
                                                                        </Tooltip>
                                                                    </div>
                                                                </>
                                                            )
                                                        }
                                                    </>
                                                </div>
                                                <div className="dwgDocumentsList__file__info__action">
                                                    {
                                                        drawingStatus[file?.status] < 2  && (
                                                            <>
                                                                <div className="uploadPercent">
                                                                    {file?.percentage ? `${file?.status} ${file?.percentage}%` : ''}
                                                                </div>
                                                            </>
                                                        )
                                                    }
                                                    {
                                                        (drawingStatus[file?.status] > 3 && drawingStatus[file?.status] < 6)  && 
                                                            (                        
                                                                <Button
                                                                    data-testid={'start-review'}
                                                                    variant="outlined"
                                                                    className="btn-primary"
                                                                    size="small"
                                                                    onClick={() => startReview(file?.id)}
                                                                >
                                                                    {drawingStatus[file?.status] === 4 ? 'Start Review' : 'Resume Review'}
                                                                </Button>
                                                            )
                                                    }
                                                    {
                                                        drawingStatus[file?.status] > 1  && (
                                                            <>
                                                                <div className="dwgDocumentsList__file__info__action__icon">
                                                                    <Tooltip title={'Download'} aria-label="first name">
                                                                        <label>
                                                                            <GetAppIcon className="download-icon" 
                                                                            onClick={() => handleDownloadFile(file) }/>
                                                                        </label>
                                                                    </Tooltip>
                                                                </div>
                                                            </>
                                                        )
                                                    }
                                                    {
                                                        file.id && state?.projectFeaturePermissons?.canupdateDrawings && (
                                                            <div className="dwgDocumentsList__file__info__action__icon">
                                                                <Tooltip title={'Delete'} aria-label="first name">
                                                                    <label>
                                                                        <DeleteIcon onClick={() => handleConfirmBox(file) }/>
                                                                    </label> 
                                                                </Tooltip>
                                                            </div>
                                                        )
                                                    } 
                                                            
                                                </div>
                                            </div>
                                                {
                                               ( drawingStatus[file?.status] < 6 &&  file?.status !== 'FAILED') && (
                                                        <div className="dwgDocumentsList__file__progress">
                                                            {/* uploading-uploaded */}
                                                            <div className={`${drawingStatus[file?.status] > 1 ? 
                                                            'dwgDocumentsList__file__progress__active' : 
                                                                'dwgDocumentsList__file__progress__step'} `}>
                                                                <div className={`${drawingStatus[file?.status] === 1 ? 'circle-active' : 'circle'} `}>

                                                                </div>
                                                                <div className={`${drawingStatus[file?.status] === 1 ?
                                                                     'step-name-active' : 'step-name'} `}>
                                                                    { drawingStatus[file?.status] < 2 ? 'Uploading' : 'Uploaded'}
                                                                </div>
                                                            </div>

                                                            {/* Parsing-Parsed */}
                                                            <div className={`${drawingStatus[file?.status] > 3 ? 
                                                            'dwgDocumentsList__file__progress__active' : 
                                                                'dwgDocumentsList__file__progress__step'} `}>
                                                                <div className={`${drawingStatus[file?.status] === 3 ? 'circle-active' : 'circle'} `}>

                                                                </div>
                                                                <div className={`${drawingStatus[file?.status] === 3 ? 
                                                                    'step-name-active' : 'step-name'} `}>
                                                                    { drawingStatus[file?.status] < 4 ? 'Parsing' : 'Parsed'}
                                                                </div>
                                                            </div>
                                                            <div className={`${drawingStatus[file?.status] > 5 ? 
                                                            'dwgDocumentsList__file__progress__active' : 
                                                                'dwgDocumentsList__file__progress__step'} `}>
                                                                <div className={`${drawingStatus[file?.status] === 5 ? 'circle-active' : 'circle'} `}>

                                                                </div>
                                                                <div className={`${drawingStatus[file?.status] === 5 ? 
                                                                    'step-name-active' : 'step-name'} `}>
                                                                    { drawingStatus[file?.status] < 5  ? 
                                                                    'Start Review' : drawingStatus[file?.status] < 6 ? 'Resume Review' : 'Reviewed'}
                                                                </div>
                                                            </div>
                                                            <div className={`${drawingStatus[file?.status] > 5 ? 
                                                            'dwgDocumentsList__file__progress__active' : 
                                                                'dwgDocumentsList__file__progress__step'} `}>
                                                                <div className="circle last-child">

                                                                </div>
                                                                <div className="step-name">
                                                                    {  drawingStatus[file?.status] < 6 ? 'Publish' : 'Published'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )
                                                }
                                            </div>
                                        ))
                                    }

                                    {
                                        confirmOpen ? (
                                            <ConfirmDialog open={confirmOpen} message={confirmMessage} 
                                            close={handleConfirmBoxClose} proceed={deleteFileDoc} />
                                        ) : ('')
                                    }

                                </>
                            ) : (

                                <div className="noData">
                                    <div className="noData__message">
                                        <NoDataMessage message={noDataMessage} />
                                    </div>
                            </div>

                            )
                        }
                    </>
                    
                </div>
            </>
        ): (
            !state.isLoading && (
                <div className="no-List">
                    <div className="no-List__message">
                        <div className="no-List__message__text">
                            Upload a document to publish drawings
                        </div>
                        <Button
                            id="upload-pdf"
                            data-testid={'upload-file'}
                            variant="outlined"
                            className="btn-primary"
                            startIcon={<CloudUploadIcon />}
                            onClick={openFileUpload}
                        >
                            Upload
                        </Button>
                    </div>
                </div>
            )

        )
    }
    </>
        
    )
}
