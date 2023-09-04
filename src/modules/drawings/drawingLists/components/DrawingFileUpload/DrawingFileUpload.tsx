import React, { ReactElement, useEffect, useRef, useState } from 'react';
import Dropzone from 'react-dropzone';
import './DrawingFileUpload.scss';
import Notification, { AlertTypes } from "../../../../shared/components/Toaster/Toaster";
import GetAppIcon from '@material-ui/icons/GetApp';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import Button from '@material-ui/core/Button';
import PdfIcon from '../../../../../assets/images/pdf_image.svg';
import Tooltip from '@material-ui/core/Tooltip';
import moment from 'moment';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import DeleteIcon from '@material-ui/icons/Delete';
import NoDataMessage from 'src/modules/shared/components/NoDataMessage/NoDataMessage';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { templateFormatId } from 'src/modules/drawings/utils/drawingsConstant';
import { CustomPopOver } from 'src/modules/shared/utils/CustomPopOver';

const noDataMessage = "Please upload the file";

const noRefereshMessage = "Note: Do not refresh the page while uploading the pdf"

export default function DrawingFileUpload(props: any): ReactElement {

    const dropZoneRef = useRef<any>(null);
    const [viewType, setViewType] = useState('FILE_ZONE');
    const [aceptedFileLists, setAceptedFileLists] = useState<Array<any>>([]);
    const [templateList, setTemplateList] = useState<Array<any>>([]);
    const popOverclasses = CustomPopOver();

    useEffect(() => {
        window.addEventListener('click', handler)
        return () => window.removeEventListener('click', handler)
    }, []);

    useEffect(() => {
        if (props?.templateFormatData?.length > 0) {
            setTemplateList(props?.templateFormatData);
        }
    }, [props?.templateFormatData]);



    const handler = (event: any) => {
        if (!dropZoneRef.current?.contains(event.target) && event.target.innerText !== 'Upload') {
            // props.closeFileZone();
        }
    }

    const acceptedFiles = (acceptedfilesData: any, rejectedFiles: any) => {
        acceptedfilesData.forEach((element: any) => {
            element.drawingTemplateFormatId = templateFormatId.US_CANADA; // this value should be based on the timezone
        });
        setAceptedFileLists(acceptedfilesData);
        if (rejectedFiles && rejectedFiles.length > 0) {
            if (rejectedFiles.length > 1) {
                Notification.sendNotification("Maximum 1 file can be uploaded at a time", AlertTypes.warn);
            } else {
                if (rejectedFiles[0]?.errors[0].code === 'file-too-large') {
                    Notification.sendNotification('File is larger than 400 MB', AlertTypes.warn);
                } else {
                    Notification.sendNotification(rejectedFiles[0]?.errors[0]?.message, AlertTypes.warn);
                }

            }
        } else {
            setViewType('FILE_LIST')

        }
    }

    const onCloseDialogHandler = () => {
        setAceptedFileLists([]);
        props.closeFileZone();
    }

    const handleUploadButton = () => {
        props.fileUpload(aceptedFileLists)
        props.closeFileZone();
    }

    const onBackButtonHandler = () => {
        setViewType('FILE_ZONE');
        setAceptedFileLists([]);
    }

    const handleFIleRemover = (file: any, index: number) => {
        const files = [...aceptedFileLists];
        files.splice(index, 1);
        setAceptedFileLists([...files])
        if (files.length === 0) {
            onBackButtonHandler();
        }
    }

    const handleTemplateSelect = (e: any, index: number) => {
        const drawingFile = [...aceptedFileLists]
        drawingFile[index].drawingTemplateFormatId = e?.target?.value;
        setAceptedFileLists([...drawingFile])
    }

    // render html starts

    const renderDropZone = () => {
        return (
            <Dropzone onDrop={(files: any, rejectedFiles: any) => { acceptedFiles(files, rejectedFiles) }}
                disabled={false}
                accept={'.pdf'}
                maxFiles={1}
                maxSize={400 * 1024 * 1024} // 400MB
            >
                {({ getRootProps, getInputProps }) => (
                    <>
                        <div className="drawing-attachment__container__main">
                            <div className="">
                                <div
                                    {...getRootProps({
                                        className: props?.attachment?.bgColor ?
                                            'dropzone, drawing-attachment__dropZone--white' : 'dropzone, drawing-attachment__dropZone',
                                    })}
                                >
                                    <div className="drawing-attachment__wrapper" ref={dropZoneRef}>
                                        <input {...getInputProps()} />
                                        <div className="drawing-attachment__text">
                                            {
                                                props?.attachment?.placeholder ? props?.attachment?.placeholder : (
                                                    <>
                                                        <div className="drawing-attachment__text__icon">
                                                            <GetAppIcon />
                                                        </div>
                                                        <div className="drawing-attachment__text__message">
                                                            Drag and drop a PDF file here, or
                                                            <span className="drawing-attachment__text__message__click">
                                                                click
                                                            </span>
                                                            to select a PDF file
                                                        </div>
                                                        <div className="drawing-attachment__text__note">
                                                            (Maximum 1 PDF file can be uploaded at a time)
                                                        </div>
                                                        <div className="drawing-attachment__text__note2">
                                                            Note: If a drawing set has multiple files, please
                                                            combine all files into one file before uploading
                                                        </div>
                                                    </>
                                                )
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </>
                )}
            </Dropzone>
        )
    }

    const renderUploadedFileLists = () => {
        return (
            <>
                {
                    aceptedFileLists.length > 0 ? (
                        <>
                            {
                                aceptedFileLists?.map((file: any, index) => (
                                    <div key={`${file.size}-${index}`} className="drawing-attachment__file-list">
                                        <div className="drawing-attachment__file-list__details">
                                            <div className="dwgDocumentsList__file__info__details__image">
                                                <img src={PdfIcon} alt="pdf" />
                                            </div>
                                            <div className="dwgDocumentsList__file__info__details__text">
                                                <div>
                                                    <Tooltip title={file.path} aria-label="createdBy">
                                                        <label>
                                                            {file.path ? file.path.length > 45 ?
                                                                `${file.path.slice(0, 25)} . . .` : file.path : ''}
                                                        </label>
                                                    </Tooltip>
                                                </div>
                                                <div className="dwgDocumentsList__file__info__details__text__time">
                                                    {
                                                        file?.createdAt ? (
                                                            <>
                                                                <span>
                                                                    {moment.utc(file?.lastModified).format('DD-MMM-YYYY').toString()}
                                                                </span> {` at `}
                                                                <span>
                                                                    {moment.utc(file?.lastModified).format('hh:mm A').toString()}
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
                                                        {(file.size / (1024 * 1024)).toFixed(3)} MB
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="drawing-attachment__file-list__actions">
                                            <div className="drawing-attachment__file-list__actions__selectTemplate">
                                                <Select
                                                    id='custom-template'
                                                    fullWidth
                                                    autoComplete="search"
                                                    variant="outlined"
                                                    placeholder="select a value"
                                                    value={file.drawingTemplateFormatId}
                                                    defaultValue=""
                                                    onChange={(e: any) => handleTemplateSelect(e, index)}
                                                    MenuProps={{
                                                        classes: { paper: popOverclasses.root },
                                                        anchorOrigin: {
                                                            vertical: "bottom",
                                                            horizontal: "left"
                                                        },
                                                        transformOrigin: {
                                                            vertical: "top",
                                                            horizontal: "left"
                                                        },
                                                        getContentAnchorEl: null
                                                    }}
                                                >
                                                    {
                                                        templateList?.map((template: any) => (
                                                            <MenuItem key={template.id} value={template.id}>
                                                                {template.name}
                                                            </MenuItem>
                                                        ))
                                                    }
                                                </Select>
                                            </div>
                                            <div className="drawing-attachment__file-list__actions__delete">
                                                <Tooltip title={'Remove'} aria-label="first name">
                                                    <label>
                                                        <DeleteIcon className="deleteIcon" onClick={() => handleFIleRemover(file, index)} />
                                                    </label>
                                                </Tooltip>
                                            </div>
                                        </div>

                                    </div>

                                ))

                            }
                        </>
                    ) : (
                        <div className="drawing-attachment__no-file">
                            <NoDataMessage message={noDataMessage} />
                        </div>
                    )
                }
            </>
        )
    }

    const renderFooterAction = () => {
        return (
            <>
                <div>
                    {
                        viewType === 'FILE_LIST' && (
                            <Button
                                data-testid={'back-action'}
                                variant="outlined"
                                type="submit"
                                onClick={onBackButtonHandler}
                                className="btn-secondary"
                                style={
                                    {
                                        fontSize: "12px"
                                    }
                                }
                            >
                                Back
                            </Button>
                        )
                    }
                </div>
                <h3 className="drawing-attachment__action__refresh-msg">  <NoDataMessage message={noRefereshMessage} /></h3>
                <div>
                    <Button
                        data-testid={'cancel-action'}
                        variant="outlined"
                        type="submit"
                        onClick={onCloseDialogHandler}
                        className="btn-secondary"
                        style={
                            {
                                fontSize: "12px"
                            }
                        }
                    >
                        Close
                    </Button>
                    {
                        viewType === 'FILE_LIST' && (
                            <Button
                                data-testid={'next-screen'}
                                variant="contained"
                                type="submit"
                                onClick={handleUploadButton}
                                className="btn-primary"
                                startIcon={<CloudUploadIcon />}
                                disabled={(aceptedFileLists.length < 1) ? true : false}
                                style={
                                    {
                                        fontSize: "12px"
                                    }
                                }
                            >
                                Upload
                            </Button>
                        )
                    }
                </div>
            </>
        )
    }

    // render html starts

    return (
        <div className="fileUpload">
            <section className="drawing-attachment">
                <span className="drawing-attachment__close-icon">
                    <HighlightOffIcon className="closeIcon-svg" data-testid={'close-sideBar'} onClick={onCloseDialogHandler} />
                </span>
                <div className="drawing-attachment__header">
                    Upload Drawing
                </div>
                <div className="drawing-attachment__container">
                    {
                        viewType === 'FILE_ZONE' ? (
                            <>
                                {renderDropZone()}
                            </>
                        ) : (
                            <>
                                {renderUploadedFileLists()}
                            </>
                        )
                    }
                </div>
                <div className="drawing-attachment__action">
                    {renderFooterAction()}
                </div>
            </section>
        </div>
    )
}