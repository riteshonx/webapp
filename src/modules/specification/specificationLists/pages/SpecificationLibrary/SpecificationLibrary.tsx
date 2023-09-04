import React, { ReactElement, useContext, useEffect, useState } from 'react';
import Button from '@material-ui/core/Button';
import { match, useHistory, useRouteMatch } from 'react-router-dom';
import './SpecificationLibrary.scss';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import SpecificationLibraryList from '../../components/SpecificationLibraryList/SpecificationLibraryList'
import SpecificationFileUpload from '../../components/SpecificationFileUpload/SpecificationFileUpload';
import { stateContext } from '../../../../root/context/authentication/authContext';
import { setIsLoading } from '../../../../root/context/authentication/action';
import Notification, { AlertTypes } from '../../../../shared/components/Toaster/Toaster';
import { multiPartPost, postApiWithEchange } from '../../../../../services/api';
import { client } from '../../../../../services/graphql';
import { CREATE_UPLOADED_SPEC_FILE_DATA, FETCH_UPLOADED_FILES_DATA, UPDATE_DOCUMENT_LIBRARY_STATUS_UPLOADED } from '../../graphql/queries/specification'
import { specificationRoles } from '../../../../../utils/role';
import SpeecificationHeaders from '../../components/SpecificationHeaders/SpeecificationHeaders';
import { SpecificationLibDetailsContext } from '../../context/SpecificationLibDetailsContext';
import { setUploadDialog } from '../../context/SpecificationLibDetailsAction';
import NoDataMessage from '../../../../shared/components/NoDataMessage/NoDataMessage';
export interface Params {
    projectId: string;
}

const header = {
    name: 'Specification Management',
    description: 'View all specifications inside your project.'
}
const noPermissionMessage = `You don't have permission to upload specification`;
let uploadingFilesArray: any = [];
let fetchedFilesArray: any = [];
let totalArray: any = [];
let setRefresh: any;


export default function SpecificationLibrary(props: any): ReactElement {

    const { dispatch, state }: any = useContext(stateContext);
    const history = useHistory();
    const pathMatch: match<Params> = useRouteMatch();
    const [openFileZone, setOpenFileZone] = useState(false)
    const [uploadingFiles, setUploadingFiles] = useState<Array<any>>([]);
    const [percentageTrigger, setPercentageTrigger] = useState(0)
    const [updatedData, setUpdatedData] = useState([])
    const { SpecificationLibDetailsState, SpecificationLibDetailsDispatch }: any = useContext(SpecificationLibDetailsContext);
    useEffect(() => {
        if (pathMatch.path.includes('/specifications/projects/') && pathMatch.path.includes('/library') && state.selectedProjectToken &&
            state?.projectFeaturePermissons?.cancreateSpecifications) {
            fetchDocumentLibraries(true);
            refreshSpecificationLibrary();
            uploadingFilesArray = [];
        }
        if (SpecificationLibDetailsState?.isUploadFileZoneOpen) {
            setOpenFileZone(true);
        } else {
            setOpenFileZone(false);
        }
        return () => {
            uploadingFilesArray = [];
            setUploadingFiles([])
            setPercentageTrigger(0)
            clearInterval(setRefresh)
        }
    }, [pathMatch.params.projectId, state.selectedProjectToken])

    const refreshSpecificationLibrary = () => {
        setRefresh = setInterval(() => {
            fetchDocumentLibraries(false)
        }, 10000)
    }

    //fetch specifiction libraries
    const fetchDocumentLibraries = async (isLoader: boolean) => {
        try {
            if (isLoader) {
                dispatch(setIsLoading(true));
            }
            fetchedFilesArray = [];
            const documentLibraryResponse = await client.query({
                query: FETCH_UPLOADED_FILES_DATA,
                fetchPolicy: 'network-only',
                context: { role: specificationRoles.viewSpecifications, token: state.selectedProjectToken }
            });
            const documentLibraries: any = [];
            if (documentLibraryResponse?.data?.techspecUploadStatus.length > 0) {
                documentLibraryResponse?.data?.techspecUploadStatus.forEach((document: any) => {
                    documentLibraries.push(document)
                    // updateDocumentLibStatus(document)
                })
            }
            fetchedFilesArray = [...documentLibraries];
            handleDocumentLists(fetchedFilesArray)
            setUpdatedData(fetchedFilesArray)
            // totalArray = [...uploadingFilesArray, ...fetchedFilesArray]
            // setUploadingFiles(totalArray)
            if (isLoader) {
                dispatch(setIsLoading(false));
            }
        } catch (error) {
            Notification.sendNotification(error, AlertTypes.warn);
            if (isLoader) {
                dispatch(setIsLoading(false));
            }
        }
    }

    // filter lists based on status
    const handleDocumentLists = (fetchedData: any) => {
        if (uploadingFilesArray.length > 0) {
            const finalList: any = [];
            fetchedData.forEach((fetchedItem: any) => {
                const duplicateCount = uploadingFilesArray.filter((item: any) => item.sourceKey === fetchedItem.sourceKey);
                if (duplicateCount.length > 0) {
                    if (duplicateCount[0]?.percentage && duplicateCount[0]?.percentage < 100) {
                        finalList.unshift(duplicateCount[0]);
                    } else {
                        finalList.push(fetchedItem)
                    }
                } else {
                    finalList.push(fetchedItem)
                }
            })
            const uploadedFilesData = [...uploadingFilesArray]
            uploadedFilesData.forEach((uploadedFiles: any) => {
                const duplicateCount = fetchedData.filter((item: any) => item.sourceKey === uploadedFiles.sourceKey);
                if (duplicateCount.length > 0) {
                } else {
                    finalList.unshift(uploadedFiles)
                }
            })
            if (finalList.length > 0) {
                setUploadingFiles(finalList)
            }
        } else {
            setUploadingFiles(fetchedData)
        }
    }

    const fetchUploadedLibraries = async (fileData: any) => {
        try {
            fetchedFilesArray = [];
            const documentLibraryResponse = await client.query({
                query: FETCH_UPLOADED_FILES_DATA,
                fetchPolicy: 'network-only',
                context: { role: specificationRoles.viewSpecifications, token: state.selectedProjectToken }
            });
            const documentLibraries: any = [];
            if (documentLibraryResponse?.data?.techspecUploadStatus.length > 0) {
                documentLibraryResponse?.data?.techspecUploadStatus.forEach((document: any) => {
                    documentLibraries.push(document)
                    // updateDocumentLibStatus(document)
                })
            }

            fetchedFilesArray = [...documentLibraries];
            handleDocumentLists(fetchedFilesArray)
            if (fetchedFilesArray.length > 0) {
                const dataCount = fetchedFilesArray.filter((item: any) => {
                    return item.sourceKey === fileData.fields.key
                })
                updateDocumentStatus(dataCount[0].id)
            }

        } catch (error) {
            console.log(error);
            Notification.sendNotification(error, AlertTypes.warn);
            dispatch(setIsLoading(false));
        }
    }

    const navigateBack = () => {
        history.push(`/specifications/projects/${pathMatch.params.projectId}/lists`);
    }

    const openFileUpload = () => {
        setOpenFileZone(true);
    }

    const closeFileZone = () => {
        setOpenFileZone(false);
        SpecificationLibDetailsDispatch(setUploadDialog(false));
    }

    const handleFileUpload = (fileData: any) => {
        fileUpload(fileData);
    }

    const fileUpload = async (acceptedfilesData: any) => {
        let fileData: any = {};
        const payload: any = [];
        acceptedfilesData.forEach((file: any) => {
            fileData = {
                fileName: file?.name,
                projectId: Number(pathMatch.params.projectId),
                featureId: 6
            }
            payload.push(fileData)
        })
        try {
            dispatch(setIsLoading(true));
            const fileUploadResponse = await postApiWithEchange('V1/S3/uploadFilesInfo', payload);
            if (fileUploadResponse?.success.length > 0) {
                uploadedFilesData(fileUploadResponse.success, acceptedfilesData);
                fileUploadResponse?.success.forEach((item: any, index: number) => {
                    uploadFileToS3(item, acceptedfilesData[index], fileUploadResponse?.success.length - 1 === index)
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
                sourceKey: item.fields.key
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
        if (fetchedFilesArray.length > 0) {
            handleDocumentLists(fetchedFilesArray)
        } else {
            totalArray = [...uploadingFilesArray, ...fetchedFilesArray]
            setUploadingFiles(totalArray)
        }
        // totalArray = [...uploadingFilesArray, ...fetchedFilesArray]
        // setUploadingFiles(totalArray)
        //  setUploadingFiles(uploadingFilesArray)

        const config = {
            onUploadProgress: function (progressEvent: any) {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                setPercentageTrigger(percentCompleted);
                checkUploadedStatus(item, file, argSetValue, percentCompleted);
            }
        }
        const uploadResponse = await multiPartPost(item.url, item.fields, file, config);
        if (uploadResponse.status === 204) {
            uploadingFilesArray = [...uploadingFilesArray];
            //setUploadingFiles(uploadingFilesArray)
            // totalArray = [...uploadingFilesArray, ...fetchedFilesArray]
            // setUploadingFiles(totalArray)
            if (fetchedFilesArray.length > 0) {
                handleDocumentLists(fetchedFilesArray)
            } else {
                totalArray = [...uploadingFilesArray, ...fetchedFilesArray]
                setUploadingFiles(totalArray)
            }
        }

    }

    const checkUploadedStatus = (item: any, file: any, argSetValue: boolean, percentCompleted: number) => {

        uploadingFilesArray.forEach((fileItem: any) => {
            if (fileItem.status === 'UPLOADING') {
                if (fileItem?.sourceKey === item?.fields?.key) {
                    fileItem.percentage = percentCompleted;
                }
                if (fileItem.percentage === 100) {
                    fileItem.status = 'PARSING'
                    updateDocumentLibStatus(item)
                }
            }
        });
        uploadingFilesArray = [...uploadingFilesArray];
        // setUploadingFiles(uploadingFilesArray)
        // totalArray = [...uploadingFilesArray, ...fetchedFilesArray]
        // setUploadingFiles(totalArray)
        if (fetchedFilesArray.length > 0) {
            handleDocumentLists(fetchedFilesArray)
        } else {
            totalArray = [...uploadingFilesArray, ...fetchedFilesArray]
            setUploadingFiles(totalArray)
        }
    }

    const updateDocumentLibStatus = async (item: any) => {
        fetchUploadedLibraries(item)
    }
    const updateDocumentStatus = async (id: string) => {
        // fetchUploadedLibraries(item)
        try {
            const updateSpecificationResponse: any = await client.mutate({
                mutation: UPDATE_DOCUMENT_LIBRARY_STATUS_UPLOADED,
                variables: {
                    id: id,
                    status: 'PARSING'
                },
                context: { role: specificationRoles.updateSpecifications, token: state.selectedProjectToken }
            })
            if (updateSpecificationResponse?.data?.update_techspecUploadStatus?.affected_rows > 0) {
                fetchDocumentLibraries(false)
            }
        }
        catch (err: any) {
            Notification.sendNotification(err, AlertTypes.warn);
            console.log(err)
        }
    }
    const createUploadedFileData = async (payload: any) => {
        try {
            dispatch(setIsLoading(true));
            const uploadedResponse: any = await client.mutate({
                mutation: CREATE_UPLOADED_SPEC_FILE_DATA,
                variables: {
                    objects: payload
                },
                context: { role: specificationRoles.createSpecifications, token: state.selectedProjectToken }
            })
            // console.log(uploadedResponse.data.returning)
            // updateDocumentLibStatus(uploadedResponse.data)
            dispatch(setIsLoading(false));
        } catch (err: any) {
            dispatch(setIsLoading(false));
            Notification.sendNotification(err, AlertTypes.warn);
            console.log(err)
        }
    }

    const refreshDocumentLists = async (selectedDocument: any) => {
        await localFileRemove(selectedDocument);
        await fetchDocumentLibraries(true);
    }

    //remove deleted file locally
    const localFileRemove = (file: any) => {
        if(uploadingFilesArray.length > 0 && file?.sourceKey === uploadingFilesArray[0]?.sourceKey){
            uploadingFilesArray = [];
        }
    }

    return (
        <div className="specification-lib">
            <div className="specification-lib__header">

                <SpeecificationHeaders headerInfo={header} navigate={navigateBack} />
                <div className="btn-upload">
                    {
                        uploadingFiles?.length > 0 && state?.projectFeaturePermissons?.cancreateSpecifications && (
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
                        )
                    }
                </div>
            </div>
            {
                state?.projectFeaturePermissons?.cancreateSpecifications ? (
                    <>
                        <div className="specification-lib__lists">
                            <SpecificationLibraryList uploadingFiles={uploadingFiles} refresh={refreshDocumentLists} handleOpenFileZone={openFileUpload} />
                        </div>
                        {
                            openFileZone && (
                                <>
                                    <SpecificationFileUpload openFileZone={openFileZone} closeFileZone={closeFileZone} fileUpload={handleFileUpload} />
                                </>
                            )
                        }
                    </>
                ) :
                    !state.isLoading ? (
                        <div className="noUploadSpecificationPermission">
                            <div className="no-permission">
                                <NoDataMessage message={noPermissionMessage} />
                            </div>
                        </div>
                    ) : ('')
            }


        </div>
    )
}
