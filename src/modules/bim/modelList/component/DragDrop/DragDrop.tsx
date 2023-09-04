import React, { ReactElement, useState, useContext, useEffect } from 'react'
import { match, useRouteMatch } from "react-router-dom";
import CancelOutlinedIcon from '@material-ui/icons/CancelOutlined';
import { useDropzone } from "react-dropzone"
import './DragDrop.scss'
import { Alert } from '@material-ui/lab';
import { Button, Checkbox, FormControl, FormControlLabel, FormLabel, Popover, Radio, RadioGroup } from '@material-ui/core';
import { CHECK_BIM_DUPLICATE_FILENAME, CREATE_BIM_MODEL, UPDATE_BIM_SOURCE_KEY, DELETE_BIM_MODEL, FETCH_BIM_MODEL } from '../../../graphql/bimUpload';
import { stateContext } from '../../../../root/context/authentication/authContext';
import { projectFeatureAllowedRoles } from '../../../../../utils/role';
import { multiPartPost, postApiWithEchange } from '../../../../../services/api';
import axios from 'axios';
import { setIsLoading } from '../../../../root/context/authentication/action';
import Dialog from '@material-ui/core/Dialog';
import { DialogContent } from '@material-ui/core';
import Notification, { AlertTypes } from '../../../../shared/components/Toaster/Toaster';
import BimStageViewer from '../BimStageViewer/BimStageViewer';
import { fetchData, graphqlMutation } from 'src/utils/helper';
import InfoIcon from '@material-ui/icons/Info';

let uploadModelId: any = null;
let cancelTokenSource: any = null;
let statuCheckInterval: any = null;

export interface Params {
    projectId: string;
}

export default function DragDrop(props: any): ReactElement {
    const { dispatch, state }: any = useContext(stateContext);
    const pathMatch: match<Params> = useRouteMatch();
    const [progress, setProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [stageData, setStageData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [files, setFiles] = useState<File[]>([]);
    const [uploadFielIndex, setUploadFielIndex] = useState(0);
    const [isVisualizeAttached, setIsVisualizeAttached] = useState(false);
    const [roomCodeype, setRoomCodeype] = useState<string>('number');
    const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
    const [disableUploadButton, setDisableUploadButton] = useState(false)
    const open = Boolean(anchorEl);

    useEffect(()=>{
      if(isVisualizeAttached ==true && props.isLocationTreeNotSynced){
        setDisableUploadButton(true)
      }else{
        setDisableUploadButton(false)
      }
    },[isVisualizeAttached])

    useEffect(() => {
        return () => {
            (cancelTokenSource) && cancelTokenSource.cancel();
            clearInterval(statuCheckInterval);
        }
    }, [state.selectedProjectToken, pathMatch.params.projectId])

    const onFileDroped = (droppedFiles: File[]) => {
        if (droppedFiles.length + files.length > 3) {
            setError("Maximum 3 files are allowed")
            return;
        }
        const droppedRvtFiles = droppedFiles.filter((file) => file.name.split('.').pop() === 'rvt' || file.name.split('.').pop() === 'ifc');
        if (droppedRvtFiles.length === 1) {
            const rvtFiles = files.filter((file) => file.name.split('.').pop() === 'rvt' || file.name.split('.').pop() === 'ifc');
            if (rvtFiles.length === 0) {
                setFiles([...files, ...droppedFiles])
            } else {
                setError("Only one Revit file is allowed")
            }
        } else if (droppedRvtFiles.length === 0) {
            setFiles([...files, ...droppedFiles])
        } else {
            setError("Only one Revit file is allowed")
        }
    }

    const handleUpload = async () => {
        try {
            dispatch(setIsLoading(true));

            const rvtFileIndex = files.findIndex((file: File) => file.name.split('.').pop() === 'rvt' || file.name.split('.').pop() === 'ifc');
            if (rvtFileIndex < 0) {
                setFiles([])
                setError("Atleast one Revit file is required")
                return;
            }
            const referenceFiles = files.filter((file: File) => file.name.split('.').pop() !== 'rvt' && file.name.split('.').pop() !== 'ifc')

            //check duplicate name
            const { data: nameLiList, error: nameLiListErr } =
                await fetchData(CHECK_BIM_DUPLICATE_FILENAME, { "_fileName": files[rvtFileIndex]?.name }, state.selectedProjectToken, projectFeatureAllowedRoles.viewBimModel);

            if (nameLiListErr)
                throw nameLiListErr;

            if (nameLiList && nameLiList.bimModel && nameLiList.bimModel.length > 0) {
                Notification.sendNotification('Same filename model exist in completed state', AlertTypes.error);
                props.onClose();
                return;
            }

            //insert bim model
            const { data: insertModelData, error: insertModelerr }: any = await graphqlMutation(CREATE_BIM_MODEL, {
                object: {
                    title: files[rvtFileIndex]?.name,
                    sourceKey: '',
                    modelFormat: files[rvtFileIndex]?.name.split('.').pop(),
                    description: "this is a test model",
                    fileSize: files[rvtFileIndex]?.size,
                    fileLastModified: files[rvtFileIndex]?.lastModifiedDate,
                    isLocationModelAttached: isVisualizeAttached,
                    roomCodeType: roomCodeype
                }
            }, projectFeatureAllowedRoles.createBimModel, state.selectedProjectToken)

            if (insertModelerr)
                throw insertModelerr;

            if (!insertModelData?.insert_bimModel_one?.id) {
                Notification.sendNotification('Model creation failed', AlertTypes.error);
                props.onClose();
                return;
            }
            uploadModelId = insertModelData?.insert_bimModel_one?.id;

            //cretae s3 path for reference
            const s3Link = referenceFiles.length > 0 ? await createS3Link(referenceFiles) : [];

            const referenceKeys = s3Link.map((link: any) => link.fields.key)
            const metadata = referenceKeys.length > 0 ?  Buffer.from(JSON.stringify(referenceKeys ?? [])).toString("base64") : '';

            //cretae s3 path for rvt file
            const rvtS3Link = await createS3Link([files[rvtFileIndex]], metadata);

            //update S3 path
            const { error: updateModelerr } = await graphqlMutation(UPDATE_BIM_SOURCE_KEY, {
                "_modelId": uploadModelId,
                "sourceKey": rvtS3Link[0]?.fields?.key
            }, projectFeatureAllowedRoles.updateBimModel, state.selectedProjectToken);

            if (updateModelerr)
                throw updateModelerr;

            await fetchModelData();
            statuCheckInterval = setInterval(fetchModelData, 10000);
            dispatch(setIsLoading(false));
            setIsUploading(true);

            //upload to s3
            // await uploadFileToS3(projectTokenResponse?.success[0], files[0], uploadModelId)
            s3Link.splice(rvtFileIndex, 0, rvtS3Link[0])
            let promise = Promise.resolve();
            const uploadPromise = s3Link.map(async (link: any, index: number) => {
                promise = promise.then(() => {
                    setUploadFielIndex(index)
                    return uploadFileToS3(link, files[index])
                });
                return promise;
            })
            await Promise.all(uploadPromise)

        } catch (error: any) {
            console.log(error.message);
            props.onClose();
            setIsUploading(false);
            if (uploadModelId) {
                await graphqlMutation(DELETE_BIM_MODEL, {
                    _eq: uploadModelId
                }, projectFeatureAllowedRoles.updateBimModel, state.selectedProjectToken);
            }
            uploadModelId = null;
            clearInterval(statuCheckInterval);
            Notification.sendNotification('Some error occured on upload file, Please refresh', AlertTypes.error);
        }
    }

    const fetchModelData = async () => {
        const { data: modelData, error: modelDataerr } = await fetchData(FETCH_BIM_MODEL, { "_eq": uploadModelId }, state.selectedProjectToken, projectFeatureAllowedRoles.viewBimModel);
        if (modelDataerr)
            Notification.sendNotification('Some error occured on fetching model info, Please refresh', AlertTypes.error);
        modelData && setStageData(modelData.bimModel[0])
    }

    const uploadFileToS3 = async (item: any, file: File) => {
        try {
            let timeStamp = Date.now();
            let prevloaded = 0;
            cancelTokenSource = axios.CancelToken.source();
            const config = {
                onUploadProgress: function (progressEvent: any) {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setProgress(percentCompleted);
                    timeStamp = Date.now();
                    prevloaded = progressEvent.loaded;
                },
                cancelToken: cancelTokenSource.token
            }
            const uploadResponse: any = await multiPartPost(item.url, item.fields, file, config);
            cancelTokenSource = null;
        } catch (error: any) {
            console.log(error)
            throw error.message;
        }
    }


    const cancelFileUpload = async () => {
        try {
            if (uploadModelId && progress < 100) {
                dispatch(setIsLoading(true));
                cancelTokenSource.cancel();
                await graphqlMutation(DELETE_BIM_MODEL, {
                    _eq: uploadModelId
                }, projectFeatureAllowedRoles.updateBimModel, state.selectedProjectToken);
                dispatch(setIsLoading(false));
                props.onClose();
            } else {
                props.onClose();
            }
        } catch (error: any) {
            console.log(error.message);
            Notification.sendNotification('Some error occured on deleting model', AlertTypes.error);
            dispatch(setIsLoading(false));
        }
    }

    const createS3Link = async (files: File[], references = '') => {
        try {
            const payload = files.map((file) => {
                return {
                    fileName: file.name,
                    projectId: Number(pathMatch.params.projectId),
                    featureId: 3,
                    folderName: uploadModelId,
                    ...(references != '') && {references: references},
                }
            })
            const projectTokenResponse = await postApiWithEchange('V1/S3/uploadFilesInfo', payload);
            if (!projectTokenResponse?.success || projectTokenResponse?.success.length <= 0)
                throw 'Unable to upload file';
            return projectTokenResponse?.success
        } catch (error: any) {
            throw error.message;
        }
    }

    function DragDropWindow(props: any) {

        const { getRootProps, getInputProps, open } = useDropzone({
            accept: isVisualizeAttached ? [".rvt", ".json"] : [".rvt", ".ifc"],
            noClick: true,
            noKeyboard: true,
            maxFiles: 3,
            multiple: true,
            //Max Size in Bytes
            maxSize: 800 * 1024 * 1024,
            onDrop: () => setError(null),
            onDropAccepted: onFileDroped,
            onDropRejected: (fileRejections: any) => {
                // error code possible values :
                // "file-too-large" | "file-too-small" | "too-many-files" | "file-invalid-type" | string;
                const error = fileRejections?.[0]?.errors?.[0]?.code;
                if (error === "file-too-large") {
                    setError("Please upload file with size less than 400MB.");
                } else {
                    setError("Please upload file in .rvt or .ifc format.");
                }
            }
        });

        return (
            <>
                <div {...getRootProps({ className: "dropZone", })}>
                    <input {...getInputProps()} />
                    <div>
                        <div className="dragText" >
                            Drag & drop your file here
                        </div>
                        <div>
                            <Button onClick={open} variant="outlined" className="btn-secondary uploadButton">
                                Select file
                            </Button>
                        </div>
                        <span className="dragText2">Please Note: Supported File formats are </span><span className="fileExt">.RVT | {isVisualizeAttached ? '.JSON' : '.IFC'}</span>
                        {files.length > 0 && <div className='seletedfiles'>
                            Selected files:&nbsp;{(files.map(((file) => file.name)).join(', '))}
                        </div>}
                    </div>
                </div>{
                    disableUploadButton? (
                        <Alert severity="warning" className="warning">Location tree is not synced. Please update the location tree first before uploading the model</Alert>
                    ) : null
                }
                {error ? (
                    <Alert severity="error" className="alert">{error}</Alert>
                ) : null}
            </>
        );
    }


    return (
        !isUploading ?
            props.isFirstModel ? <div className="bimDragDrop"><DragDropWindow /></div> :
                <Dialog className='bimUploadDialog' onClose={props.onClose} open={!isUploading} fullWidth={true} maxWidth={'md'}>
                    <DialogContent>
                        <div className="bimDragDrop">
                            <div>
                                <div className="header">
                                    <div className="header-title">
                                        Upload File here&ensp; 
                                        <InfoIcon fontSize='small' onClick={(e: any) => setAnchorEl(e.currentTarget)} />
                                    </div>
                                    <CancelOutlinedIcon onClick={props.onClose} />
                                </div>
                                <DragDropWindow />
                                <div className="footer">
                                    { isVisualizeAttached ?
                                        <FormControl component="fieldset">
                                            <label>Room Code Type</label>
                                            <RadioGroup row aria-label="position" name="position" value={roomCodeype} onChange={(e) => setRoomCodeype(e.target.value)}>
                                                <FormControlLabel value="number" control={<Radio color="default" size='small' />} label="Number" />
                                                <FormControlLabel value="code" control={<Radio color="default" size='small' />} label="Code" />
                                            </RadioGroup>
                                        </FormControl> : <div></div>
                                    }
                                    <div>
                                        <FormControlLabel control={<Checkbox name="isVisualizeAttached" color="default" checked={isVisualizeAttached} onChange={(e) => (setIsVisualizeAttached(e.target.checked), setFiles([]))} />} label="Use in Visualize" />
                                        <Button onClick={props.onClose} variant="outlined" className="btn-secondary ">
                                            Close
                                        </Button>
                                        <Button onClick={handleUpload} variant="outlined" className={Boolean(error) || files.length === 0||Boolean(disableUploadButton)?"btn-secondary-disabled":"btn-secondary"} disabled={Boolean(error) || files.length === 0||Boolean(disableUploadButton)}>
                                            Upload
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <Popover id='info' className='bim-info-popup' open={open} anchorEl={anchorEl} onClose={() => setAnchorEl(null)} 
                            anchorOrigin={{vertical: 'top', horizontal: 'right',}}
                            transformOrigin={{vertical: 'bottom', horizontal: 'left',}}
                        >
                            For visualize model, you can upload the following JSON files to generate a model with more accuracy.<br/><br/>
                            1. Revit JSON - Using our Revit plugin, we can generate more accurate room boundaries.<br/>
                            2. BIM360 JSON - From BIM360 we get locaion excel file. using that we can generate the location tree JSON file. It is useful to map rooms as same in BIM 360 location structure<br/><br/>
                            Also make sure that the location tree is imported from the slate connector, before the model upload.  
                        </Popover>
                    </DialogContent>
                </Dialog>
            :
            <Dialog className='bimUploadStageDialog' onClose={() => { progress === 100 && props.onClose() }} open={isUploading} maxWidth={'md'}>
                <DialogContent>
                    <div className="header">
                        Model Creation
                        <CancelOutlinedIcon onClick={cancelFileUpload} />
                    </div>
                    <BimStageViewer
                        statusData={stageData?.bimModelStatuses[0]}
                        modelId={stageData?.id}
                        createdAt={stageData?.createdAt}
                        uploadModelId={uploadModelId}
                        uploadProgress={progress}
                        uploadFilename={files[uploadFielIndex].name} 
                    />
                    <div className="footer">
                        <Button onClick={cancelFileUpload} variant="outlined" className="btn-secondary ">
                            {progress < 100 ? 'Cancel' : 'Close'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
    )
}
