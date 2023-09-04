import React, { ReactElement, useContext, useEffect, useState } from 'react'
import Dropzone from 'react-dropzone';
import './SingleFileAttachment.scss';
import CloseIcon from '@material-ui/icons/Close';
import { setIsLoading } from '../../../../root/context/authentication/action';
import { multiPartPost, postApiWithEchange } from '../../../../../services/api';
import { stateContext } from '../../../../root/context/authentication/authContext';
import { match, useRouteMatch } from 'react-router-dom';
import DescriptionIcon from '@material-ui/icons/Description';
import LinearProgress from '@material-ui/core/LinearProgress';
import Notification,{ AlertTypes } from '../../../../shared/components/Toaster/Toaster';
import { Tooltip } from '@material-ui/core';
import GetAppIcon from '@material-ui/icons/GetApp';
import { allowedFileFormats } from 'src/utils/constants';
import { formStateContext } from '../../Context/projectContext';


export interface Params {
    id: string;
    featureId: string;
}


let uploadedFiles: any = [];

function SingleFileAttachment(props: any): ReactElement {

    const [allfilesLists, setAllfilesLists] = useState<Array<any>>([]);
    const {dispatch, state }:any = useContext(stateContext);
    const pathMatch:match<Params>= useRouteMatch();
    const [progressValue, setProgressValue] = useState(0);
    const [filesCount, setFilesCount] = useState(0);
    const {setIsDirty}: any = useContext(formStateContext);

    useEffect(() => {
        if(props?.field?.value && props?.field?.value.length > 0){
            setAllfilesLists(props?.field?.value);
            setProgressValue(100);
        }
        return () => {
            uploadedFiles = [];
            setFilesCount(0)
        }
    }, [props?.field])

    // for review page
    useEffect(() => {
        if(props?.uploadedFiles && props?.uploadedFiles.length > 0){
            setAllfilesLists(props?.uploadedFiles);
            setProgressValue(100);
        }
        return () => {
            uploadedFiles = [];
            setFilesCount(0)
        }
    }, [props?.uploadedFiles])


    const acceptedFiles = (acceptedfilesData: any) => {
        if(!props.isEditAllowed && acceptedfilesData.length>0){
            fileUpload(acceptedfilesData);
        }
    }

    const getAttachedFileData = (value: any) => {
        if(props?.attachment?.type === 'file'){
            props?.attachedLists(value, 'file')
        }else{
            props?.attachedLists(value, 'image')
        }
    }

    const fileUpload = async (acceptedfilesData: any) => {
        let fileData: any = {};
        const payload: any = [];
        setIsDirty(true);
        acceptedfilesData.forEach((file: any) => {
            fileData = {
                fileName: file?.name,
                projectId: Number(pathMatch.params.id),
                featureId: Number(pathMatch.params.featureId)
            }
            payload.push(fileData)
        })
        try {
            dispatch(setIsLoading(true));
            const projectTokenResponse = await postApiWithEchange('V1/S3/uploadFilesInfo', payload);
            if(projectTokenResponse?.success.length > 0){
                projectTokenResponse?.success.forEach((item: any, index: number) => {
                   uploadFileToS3(item, acceptedfilesData[index],  projectTokenResponse?.success.length-1 === index)
                })
            }  
            dispatch(setIsLoading(false));
        } catch (error) {
            Notification.sendNotification(error, AlertTypes.warn);
            dispatch(setIsLoading(false));
        }
    }

    const uploadFileToS3 = async (item: any, file: any, argSetValue: boolean) => {
        const config = {
            onUploadProgress: function(progressEvent: any) {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setProgressValue(percentCompleted);
              checkUploadedStatus(item, file, argSetValue, percentCompleted);
            }
        }
        

        const fileData = {
            blobKey: item.fields.key,
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
        };

        uploadedFiles.push(fileData);
        if(props?.field){
            if(props?.field?.value){
                setAllfilesLists([...props?.field?.value,...uploadedFiles]);
            } else{
                setAllfilesLists([...uploadedFiles]);
            }
            if(argSetValue){
                if(props?.field?.value){
                    props?.field?.onChange([...props?.field?.value,...uploadedFiles]);
                } else{
                    props?.field?.onChange([...uploadedFiles]);
                }
                uploadedFiles=[];
            }
        }

        // for review page
        if(props?.attachment){
            setAllfilesLists([...uploadedFiles]);
            if(props?.attachment?.type === 'file' && props?.uploadedFiles && props?.uploadedFiles.length > 0){
                setAllfilesLists([...props?.uploadedFiles, ...uploadedFiles]);
            } else{
                setAllfilesLists([...uploadedFiles]);
            }
            if(argSetValue){
                if(props?.attachment?.type === 'file' && props?.uploadedFiles && props?.uploadedFiles.length > 0){
                    getAttachedFileData([...props?.uploadedFiles, ...uploadedFiles]);
                } else{
                    getAttachedFileData([...uploadedFiles]);
                }
                uploadedFiles=[];
            }
        } 

        try{
            await multiPartPost(item.url, item.fields, file, config);
          } catch(error: any){
            console.log(error.message)
            if(error.message.includes("status code 404")){
              const currentFile=uploadedFiles.find((item: any)=> item?.blobKey === fileData?.blobKey);
              if(currentFile){
                const index= uploadedFiles.indexOf(currentFile);
                uploadedFiles.splice(index,1);
                setAllfilesLists([...uploadedFiles]);
              }
            }
        }
    }

    const checkUploadedStatus = (item: any, file: any, argSetValue: boolean, percentCompleted: number) => {
        const fileData = {
            blobKey: item.fields.key,
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            percentage: percentCompleted
        };

        if(percentCompleted === 100){
            setFilesCount(filesCount + 1);
        }

        if(uploadedFiles.length < 1){
            uploadedFiles.push(fileData);
            setUploadedState();
        }else{
            const isFileExist = uploadedFiles.filter((a: any) => a.blobKey === item.fields.key);
            if(isFileExist.length > 0){
                uploadedFiles.map((a: any) => {
                    if(a.blobKey === item.fields.key){
                        a.percentage = percentCompleted;
                        setUploadedState();
                    } 
                })
            }else{
                uploadedFiles.push(fileData);
                setUploadedState();
            }

        }
    }

    const setUploadedState = () => {
        uploadedFiles = [...uploadedFiles]
        if(props?.field){
            if(props?.field?.value){
                setAllfilesLists([...props?.field?.value,...uploadedFiles]);
            } else{
                setAllfilesLists([...uploadedFiles]);
            }
        }
        
        // for review page
        if(props?.attachment){
            setAllfilesLists([...uploadedFiles]);
            if(props?.attachment?.type === 'file' && props?.uploadedFiles && props?.uploadedFiles.length > 0){
                setAllfilesLists([...props?.uploadedFiles, ...uploadedFiles]);
            } else{
                setAllfilesLists([...uploadedFiles]);
            }

        } 
        
    }

    const removeFile = (file: any, index: number) => {
        if(!props.isEditAllowed){
            let fileData: any = [];
            fileData = [...allfilesLists];
            fileData.splice(index, 1);
            setAllfilesLists(fileData);
            if(props?.field){
                props?.field?.onChange(fileData);
            }
            if(props?.attachment){
                getAttachedFileData(fileData);
            }
            setIsDirty(true);
        }
    } 
  
    const renderAcceptedFiles = allfilesLists?.map((file: any, index: number) => (
        <>
            <div key={`${file.blobkey}-${index}`} className="single-file-attachment__viewList__file">
                <div className="single-file-attachment__viewList__file__thumbnail">
                    {/* <img src={file.preview} /> */}
                    <DescriptionIcon className="single-file-attachment__viewList__file__thumbnail__icon"/>
                </div>
                <div className="single-file-attachment__viewList__file__description">
                    <Tooltip title={file.fileName}>
                        <div className="single-file-attachment__viewList__file__description__fileName">
                        {file.fileName.length>20?file.fileName.slice(0,18):
                                file.fileName}{file.fileName.length>20?`...${file.fileName.split('.')[file.fileName.split('.').length-1]}`:''}
                        </div>
                    </Tooltip>
                    <div className="single-file-attachment__viewList__file__description__fileSize">
                        {(file.fileSize / (1024 * 1024)).toFixed(3)} MB 
                    </div>
                </div>
                {
                    file?.url &&  <div className="file-attachment__viewList__file__download">
                        <GetAppIcon onClick={() => window.open(file.url,'_blank')}/>
                    </div>
                }   
                {
                    (progressValue > 1 && progressValue < 99) ? (
                        ''
                    ) : (!props.isEditAllowed &&
                        <div className="single-file-attachment__viewList__file__fileRemove">
                            <CloseIcon onClick={() => removeFile(file, index)}/>
                        </div>
                    )
                }
            </div>
            <div className="progress">
                <LinearProgress variant="determinate" value={file.percentage} />
            </div>
        </>
    ));
  
    return (
      <section className="single-file-attachment">
          { allfilesLists?.length > 0?(
              <div className="single-file-attachment__viewList">
              {renderAcceptedFiles}
              {/* {
               progressValue !== 100 && (
                  <div className="progress">
                      <LinearProgress variant="determinate" value={progressValue} />
                  </div>
                )
              } */}
          </div> 
          ):(
        <Dropzone onDrop={(files: any) => acceptedFiles(files)} 
                  disabled={((progressValue > 1 && progressValue < 99) ? true : false ) || props.isEditAllowed} 
                  accept={allowedFileFormats.join(',')}
                  maxFiles={1}>
            {({getRootProps, getInputProps}) => (
                <>
                    <div className="container">
                        <div
                            {...getRootProps({
                                className: props?.attachment?.bgColor ? 
                                'dropzone, single-file-attachment__dropZone--white' : 'dropzone, single-file-attachment__dropZone',
                            })}
                        >
                            <input {...getInputProps()} />
                            <p className="single-file-attachment__text">
                                {
                                   props?.attachment?.placeholder ? props?.attachment?.placeholder : (
                                        'Drag and drop a file, or click to select a file'
                                    )
                                }
                            </p>
                        </div>
                    </div>
                </>
            )}
        </Dropzone>)}
      </section>
    );
}

export default React.memo(SingleFileAttachment);
