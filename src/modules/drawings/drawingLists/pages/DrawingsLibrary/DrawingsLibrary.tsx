import React, { ReactElement, useContext, useEffect, useState } from 'react';
import Button from '@material-ui/core/Button';
import { match, useHistory, useRouteMatch } from 'react-router-dom';
import './DrawingsLibrary.scss';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import DrawingLibraryList from '../../components/DrawingLibraryList/DrawingLibraryList';
import DrawingFileUpload from '../../components/DrawingFileUpload/DrawingFileUpload';
import { stateContext } from '../../../../root/context/authentication/authContext';
import { setIsLoading } from '../../../../root/context/authentication/action';
import Notification,{ AlertTypes } from '../../../../shared/components/Toaster/Toaster';
import { multiPartPost, postApiWithEchange } from '../../../../../services/api';
import { client } from '../../../../../services/graphql';
import { CREATE_UPLOADED_FILE_DATA, FETCH_UPLOADED_FILES_DATA, 
        UPDATE_DRAWING_LIBRARY_STATUS_UPLOADED } from '../../graphql/queries/drawing'
import { projectFeatureAllowedRoles } from '../../../../../utils/role';
import DrawingHeaders from '../../components/DrawingHeaders/DrawingHeaders';
import { DrawingLibDetailsContext } from '../../context/DrawingLibDetailsContext';
import { setUploadDialog } from '../../context/DrawingLibDetailsAction';
import NoDataMessage from '../../../../shared/components/NoDataMessage/NoDataMessage';
import { FETCH_CUSTOM_TEMPLATE_LISTS } from '../../graphql/queries/customFormatTemplate';

export interface Params {
    projectId: string;
    documentId: string;
}

const header = {
    name: 'Drawing Management',
    description: 'Manage all your drawings in the project'
}
interface templateFormat {
    id: string,
    name: string,
}

const noPermissionMessage = `You don't have permission to upload drawings`;

let uploadingFilesArray: any = [];
let fetchedFilesArray: any = [];
let totalArray: any = [];
let setRefresh : any;

export default function DrawingsLibrary(props: any): ReactElement {
    
    const {dispatch, state }:any = useContext(stateContext);
    const history = useHistory();
    const pathMatch:match<Params>= useRouteMatch();
    const [openFileZone, setOpenFileZone] = useState(false)
    const [uploadingFiles, setUploadingFiles] = useState<Array<any>>([]);
    const [percentageTrigger, setPercentageTrigger] = useState(0);
    const {DrawingLibDetailsState, DrawingLibDetailsDispatch}: any = useContext(DrawingLibDetailsContext);
    const [templateFormatData, setTemplateFormatData] = useState<any>([]);

    useEffect(() => {
        if(pathMatch.path.includes('/drawings/projects/') && pathMatch.path.includes('/drawing-management') && state.selectedProjectToken && 
        state?.projectFeaturePermissons?.canuploadDrawings){
            fetchDrawingLibraries(true);
            refreshDrawingLibrary();
            uploadingFilesArray = [];
        }
        if(DrawingLibDetailsState?.isUploadFileZoneOpen){
            setOpenFileZone(true);
            fetchCustomTemplateLists();
        }else{
            setOpenFileZone(false);
        }
        return () => {
            uploadingFilesArray = [];
            setUploadingFiles([])
            setPercentageTrigger(0);
            clearInterval(setRefresh)
        }
    }, [pathMatch.params.projectId, state.selectedProjectToken]);

    const refreshDrawingLibrary = () => {
        setRefresh = setInterval(() => {
            fetchDrawingLibraries(false)
        }, 10000)
    }

    //fetch drawing libraries
    const fetchDrawingLibraries = async(isLoader: boolean)=>{
        try{
            if(isLoader){
                dispatch(setIsLoading(true));
            }
            const drawingLibraryResponse = await client.query({
                query: FETCH_UPLOADED_FILES_DATA,
                fetchPolicy: 'network-only',
                context:{role: projectFeatureAllowedRoles.viewDrawings, token: state.selectedProjectToken}
            });
           const drawingLibraries: any = [];
           fetchedFilesArray = [];
            if(drawingLibraryResponse?.data?.drawingUploadStatus.length > 0){
                drawingLibraryResponse?.data?.drawingUploadStatus.forEach((drawing:any) => {
                    drawingLibraries.push(drawing)
                })
            }
            fetchedFilesArray = [...drawingLibraries];
            
            handleDocumentLists(fetchedFilesArray)
            // totalArray = [...uploadingFilesArray, ...fetchedFilesArray]
            // setUploadingFiles(totalArray)

            if(isLoader){
                dispatch(setIsLoading(false));
            }
            
        }catch(error){
            console.log(error);
            Notification.sendNotification(error, AlertTypes.warn);
            if(isLoader){
                dispatch(setIsLoading(false));
            }
        }
    }

    // filter lists based on status
    const handleDocumentLists = (fetchedData: any) => {
        if(uploadingFilesArray.length > 0){
            const finalList: any = [];
            fetchedData.forEach((fetchedItem: any) => {
                const duplicateCount = uploadingFilesArray.filter((item: any) => item.sourceKey === fetchedItem.sourceKey);
                if(duplicateCount.length > 0){
                    if(duplicateCount[0]?.percentage && duplicateCount[0]?.percentage < 100){
                        finalList.unshift(duplicateCount[0]);
                    }else{
                        finalList.push(fetchedItem)
                    }
                }else{
                    finalList.push(fetchedItem)
                }
            })
            const uploadedFilesData = [...uploadingFilesArray]
            uploadedFilesData.forEach((uploadedFiles: any) => {
                const duplicateCount = fetchedData.filter((item: any) => item.sourceKey === uploadedFiles.sourceKey);
                if(duplicateCount.length > 0){
                }else{
                    finalList.unshift(uploadedFiles)
                }
            })
            if(finalList.length > 0){
                setUploadingFiles(finalList)
            }
        }else{
            setUploadingFiles(fetchedData)
        }
    }
    
    const navigateBack = () => {
        history.push(`/drawings/projects/${pathMatch.params.projectId}/lists`);
    }

    const openFileUpload = () => {
        fetchCustomTemplateLists();
        setOpenFileZone(true);
    }

    const closeFileZone = () => {
        setOpenFileZone(false);
        DrawingLibDetailsDispatch(setUploadDialog(false)); 
    }

    const handleFileUpload = (fileData: any) => {
        fileUpload(fileData);
    }

    const fileUpload = async (acceptedfilesData: any) => {
        let fileData: any = {};
        const payload: any = [];
        uploadingFilesArray = [];
        acceptedfilesData.forEach((file: any) => {
            fileData = {
                fileName: file?.name,
                projectId: Number(pathMatch.params.projectId),
                featureId: 5
            }
            payload.push(fileData)
        })
        try {
            dispatch(setIsLoading(true));
            const fileUploadResponse = await postApiWithEchange('V1/S3/uploadFilesInfo', payload);
            if(fileUploadResponse?.success.length > 0){
                uploadedFilesData(fileUploadResponse.success, acceptedfilesData);
                fileUploadResponse?.success.forEach((item: any, index: number) => {
                    uploadFileToS3(item, acceptedfilesData[index],  fileUploadResponse?.success.length-1 === index)
                })
            }  
            dispatch(setIsLoading(false));
        } catch (error) {   
            Notification.sendNotification(error, AlertTypes.warn);
            dispatch(setIsLoading(false));
        }
    }


    const uploadedFilesData = (files: any, fileData: any) => {
        const payload: any = []
        files.forEach((item: any, index: number) => {
            const payloadFile = {
                fileName: fileData[index]?.name,
                fileSize: fileData[index]?.size,
                status: "UPLOADING",
                sourceKey: item.fields.key,
                drawingTemplateFormatId: fileData[index]?.drawingTemplateFormatId,
            }
            payload.push(payloadFile)
        })

        createUploadedFileData(payload);
    }

    const uploadFileToS3 = async (item: any, file: any, argSetValue: boolean) => {
        const fileData: any = {
            sourceKey: item.fields.key,
            fileName: file.name,
            fileSize: file.size,
            status: 'UPLOADING'
        };

        uploadingFilesArray.unshift(fileData);

        if(fetchedFilesArray.length > 0){
            handleDocumentLists(fetchedFilesArray)
        }else{
            totalArray = [...uploadingFilesArray, ...fetchedFilesArray]
            setUploadingFiles(totalArray)
        }
        // setUploadingFiles(uploadingFilesArray)

        const config = {
            onUploadProgress: function(progressEvent: any) {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setPercentageTrigger(percentCompleted);
              checkUploadedStatus(item, file, argSetValue, percentCompleted);
            }
        }

        await s3UploadCall(item, file, config);
    }

    const s3UploadCall  = async (item: any, file:any, config: any) => {
        try{
            const uploadResponse = await multiPartPost(item.url, item.fields, file, config);
            if(uploadResponse && uploadResponse?.status === 204){
                uploadingFilesArray = [...uploadingFilesArray];
                // setUploadingFiles(uploadingFilesArray)
    
                if(fetchedFilesArray.length > 0){
                    handleDocumentLists(fetchedFilesArray)
                }else{
                    totalArray = [...uploadingFilesArray, ...fetchedFilesArray]
                    setUploadingFiles(totalArray)
                }
                updateDrawingLibStatus(item, 'PARSING')
    
            }
            // else{
            //     console.log('UPLOAD FAILED');
            //     updateDrawingLibStatus(item, 'UPLOAD_FAILED')
            // }
        }catch(error: any){
            //update the status to upload failed
            updateDrawingLibStatus(item, 'UPLOAD_FAILED')
        }
    }

    const checkUploadedStatus = (item: any, file: any, argSetValue: boolean, percentCompleted: number) => {

        uploadingFilesArray.forEach((fileItem: any) => {
            if(fileItem.status === 'UPLOADING'){
                if(fileItem?.sourceKey === item?.fields?.key){
                    fileItem.percentage = percentCompleted;
                }
                // if(fileItem.percentage === 100){
                //     // fileItem.status = 'PARSING'
                //     // updateDrawingLibStatus(item, 'PARSING')
                // }
            }
        });
        uploadingFilesArray = [...uploadingFilesArray];
        // setUploadingFiles(uploadingFilesArray)
        // totalArray = [...uploadingFilesArray, ...fetchedFilesArray]
        // setUploadingFiles(totalArray)`
        if(fetchedFilesArray.length > 0){
            handleDocumentLists(fetchedFilesArray)
        }else{
            totalArray = [...uploadingFilesArray, ...fetchedFilesArray]
            setUploadingFiles(totalArray)
        }
        // handleDocumentLists(fetchedFilesArray)

    }

    const updateDrawingLibStatus = async (item: any, status: string) => {
        try{
            const updateDrawingResponse: any = await client.mutate({
                mutation: UPDATE_DRAWING_LIBRARY_STATUS_UPLOADED,
                variables: {
                    sourceKey: item?.fields?.key,
                    status: status
                },
                context:{role: projectFeatureAllowedRoles.uploadDrawings, token: state.selectedProjectToken}
            })
            if(updateDrawingResponse?.data?.update_drawingUploadStatus?.affected_rows > 0){
                fetchDrawingLibraries(false)
            }
        }
        catch(err: any){
            Notification.sendNotification(err, AlertTypes.warn);
            console.log(err)
        }
    }

    const createUploadedFileData= async (payload: any)=>{
        try{
            dispatch(setIsLoading(true));
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const uploadedResponse: any = await client.mutate({
                mutation: CREATE_UPLOADED_FILE_DATA,
                variables:{
                    objects: payload
                },
                context:{role: projectFeatureAllowedRoles.uploadDrawings, token: state.selectedProjectToken}
            })
            dispatch(setIsLoading(false));
        }catch(err: any){
            dispatch(setIsLoading(false));
            Notification.sendNotification(err, AlertTypes.warn);
            console.log(err)
        }
    }

    const refreshDrawingLists = async (selectedDrawing: any) => {
        await localFileRemove(selectedDrawing);
        await fetchDrawingLibraries(true);
    }

    //remove deleted file locally
    const localFileRemove = (file: any) => {
        if(uploadingFilesArray.length > 0 && file?.sourceKey === uploadingFilesArray[0]?.sourceKey){
            uploadingFilesArray = [];
        }
    }

    const openCustomTemplateLists = () => {
        history.push(`/drawings/projects/${pathMatch.params.projectId}/custom-template-lists`);     
    }

    //fetch template lists
    const fetchCustomTemplateLists = async()=>{
        try{
            // dispatch(setIsLoading(true));
            const customTempListResponse = await client.query({
                query: FETCH_CUSTOM_TEMPLATE_LISTS,
                variables: {
                    offset: 0,
                    limit: 10000,
                    searchText: `%%`,
                },
                fetchPolicy: 'network-only',
                context:{role: projectFeatureAllowedRoles.uploadDrawings, token: state.selectedProjectToken}
            });

            const customTemplateListData: templateFormat[] = [];
            
            if(customTempListResponse?.data?.drawingTemplateFormat.length > 0){
                customTempListResponse?.data?.drawingTemplateFormat.forEach((item: any) => {
                    const newItem= JSON.parse(JSON.stringify(item));
                    const templateData : templateFormat= {
                        id: newItem?.id,
                        name: newItem?.name,
                    }
                    customTemplateListData.push(templateData);
                })

            }
            
            setTemplateFormatData(customTemplateListData);
            // dispatch(setIsLoading(false));
            
        }catch(error){
            console.log(error);
            Notification.sendNotification(error, AlertTypes.warn);
            // dispatch(setIsLoading(false));
        }
    }

    return (
        <div className="drawing-lib">
            <div className="drawing-lib__header">
                <DrawingHeaders  headerInfo={header} navigate={navigateBack}/>
                <div className="btn-upload">
                    {
                        state?.projectFeaturePermissons?.canviewDrawings && (
                            <Button
                                data-testid={'custom-template'}
                                variant="outlined"
                                className="btn-primary"
                                onClick={openCustomTemplateLists}
                            >
                                Create Drawing Upload Templates
                            </Button>
                         )
                    }
                    {
                        uploadingFiles?.length > 0 && state?.projectFeaturePermissons?.canuploadDrawings && (
                            <Button
                                id="upload-pdf"
                                data-testid={'upload-file'}
                                variant="outlined"
                                className="btn-primary"
                                startIcon={<CloudUploadIcon />}
                                onClick={openFileUpload}
                                disabled={percentageTrigger > 0 && percentageTrigger < 100}
                            >
                                Upload
                            </Button>
                        )
                    }
                </div>
            </div>
            {
                state.projectFeaturePermissons?.canuploadDrawings ? (
                    <>
                        <div className="drawing-lib__lists">
                            <DrawingLibraryList uploadingFiles={uploadingFiles} refresh={refreshDrawingLists} handleOpenFileZone={openFileUpload}/>
                        </div>
                        {
                            openFileZone && (
                                <>
                                    <DrawingFileUpload templateFormatData={templateFormatData} 
                                    openFileZone={openFileZone} closeFileZone={closeFileZone} fileUpload={handleFileUpload}/>
                                </>
                            )
                        }
                    </>
                ):
                state.projectFeaturePermissons &&
                (!state.projectFeaturePermissons?.canuploadDrawings ? (
                    <div className="noUploadDrawingPermission">
                        <div className="no-permission">
                            <NoDataMessage message={noPermissionMessage}/> 
                        </div>
                    </div>
                ) : ('') )
            }
            

        </div>
    )
}
