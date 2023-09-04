import React, { ReactElement, useContext, useEffect, useState } from "react";
import Dropzone from "react-dropzone";
import "./FileAttachment.scss";
import CloseIcon from "@material-ui/icons/Close";
import { setIsLoading } from "src/modules/root/context/authentication/action";
import { multiPartPost, postApi, postApiWithEchange } from "src/services/api";
import { stateContext } from "src/modules/root/context/authentication/authContext";
import { match, useRouteMatch } from "react-router-dom";
import DescriptionIcon from "@material-ui/icons/Description";
import LinearProgress from "@material-ui/core/LinearProgress";
import Notification, {
  AlertTypes,
} from "src/modules/shared/components/Toaster/Toaster";
import { Tooltip } from "@material-ui/core";
import GetAppIcon from "@material-ui/icons/GetApp";
import { allowedFileFormats } from "src/utils/constants";
import ProjectPlanContext from "src/modules/dynamicScheduling/context/projectPlan/projectPlanContext";
import { DELETE_ATTCHED_FILE, GET_ATTCHED_FILES, SAVE_ATTCHED_FILES } from "src/modules/dynamicScheduling/graphql/queries/attachment";
import { client } from '../../../../../../services/graphql';
import { priorityPermissions, permissionKeys  } from "src/modules/dynamicScheduling/permission/scheduling";

export interface Params {
  id: string;
  featureId: string;
}

let uploadedFiles: any = [];
let allUploadedFiles: any = [];

function FileAttachment(props: any): ReactElement {
  const [allfilesLists, setAllfilesLists] = useState<Array<any>>([]);
  const { dispatch, state }: any = useContext(stateContext);
  const pathMatch: match<Params> = useRouteMatch();
  const [progressValue, setProgressValue] = useState(0);
  const [filesCount, setFilesCount] = useState(0);
  const [attachedFile, setAttachedFile] = useState<Array<any>>([]);
  const [newUploadedfile, setNewUploadedfile] = useState<Array<any>>([]);
  const setIsDirty: any = false;
  const projectPlanContext: any = useContext(ProjectPlanContext);
  const { currentTask } = projectPlanContext;

  useEffect(() => {
    if (newUploadedfile && newUploadedfile.length > 0) {
      setAllfilesLists(newUploadedfile);
     // setAllUploadedFiles(newUploadedfile);
      setProgressValue(100);
    }
    return () => {
      uploadedFiles = [];
      setFilesCount(0);
    };
  }, [newUploadedfile]);

  useEffect(() => {
    getAttchedFiles(currentTask?.id);
  }, []);

  const getAttchedFiles =  async(taskId: any) => {
    try {   
      const res = await client.query({
        query: GET_ATTCHED_FILES,
        variables: {taskId: taskId},
        fetchPolicy: 'network-only',
        context: {
          role:  priorityPermissions('view'),
          token: state.selectedProjectToken,
        },
      });

      setAttachedFile(res?.data?.attachments);
      props.getAttachedFile(res?.data?.attachments);
    } catch(error) {
        console.log(error);
    }
  }

  const saveAttchedFiles = async (files: any, taskId: any) => {
    try {
      const res = await client.mutate({
        mutation: SAVE_ATTCHED_FILES,
        variables: {
          objects: files
        },
        context: {
          role:  priorityPermissions('create'),
          token: state.selectedProjectToken,
        },
      });
      getAttchedFiles(taskId);
      allUploadedFiles = [];
      Notification.sendNotification(
        'File(s) attached successfully',
        AlertTypes.success
      );

  } catch (err) {
    Notification.sendNotification(err?.message, AlertTypes.error);
  }
  }

  const deleteAttachedFile = async (id: any, taskId: any) => {
    try {
      const res = await client.mutate({
        mutation: DELETE_ATTCHED_FILE,
        variables: { id: id },
        context: {  
           role: priorityPermissions('delete'),
          token: state.selectedProjectToken, },
      });
      getAttchedFiles(taskId);

      Notification.sendNotification(
        'Deleted  successfully',
        AlertTypes.success
      );
    } catch (error) {
      Notification.sendNotification(error?.message, AlertTypes.error);
    }
  };

  const acceptedFiles = async (acceptedfilesData: any) => {
    if (!acceptedfilesData.length) {
      Notification.sendNotification(
        "Please select a valid file type",
        AlertTypes.warn
      );
      return;
    }
    if (!props.isEditAllowed) {
      await fileUpload(acceptedfilesData);
    }
  };

  const handleDownloadFile = (file: any) => {
    const payload = [{
        fileName: file.fileName,
        key: file.blobKey,
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


  const fileUpload = async (acceptedfilesData: any) => {

    let fileData: any = {};
    const payload: any = [];
    if(setIsDirty){
      setIsDirty(true);
    }

    acceptedfilesData.forEach((file: any) => {
      fileData = {
        fileName: file?.name,
        projectId: Number(pathMatch.params.id),
        featureId: priorityPermissions('create') == 'createMasterPlan' || priorityPermissions('update') == 'updateMasterPlan' ? 4 : 7,
      };
      payload.push(fileData);
    });
    try {
      dispatch(setIsLoading(true));
      const projectTokenResponse = await postApiWithEchange(
        "V1/S3/uploadFilesInfo",
        payload
      );
      if (projectTokenResponse?.success.length > 0) {
          await projectTokenResponse?.success.forEach((item: any, index: number) => {
          uploadFileToS3(
            item,
            acceptedfilesData[index],
            projectTokenResponse?.success.length - 1 === index
          );
        });

       // allfilesLists.forEach(element => {
        allUploadedFiles.forEach((element: any) => {
          element.taskId = currentTask?.id;
        });

        saveAttchedFiles(allUploadedFiles, currentTask?.id);

      }
      dispatch(setIsLoading(false));
    } catch (error) {
      Notification.sendNotification(error, AlertTypes.warn);
      dispatch(setIsLoading(false));
    }
  };

  const uploadFileToS3 = async (item: any, file: any, argSetValue: boolean) => {
    const config = {
      onUploadProgress: function (progressEvent: any) {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        setProgressValue(percentCompleted);
        checkUploadedStatus(item, file, argSetValue, percentCompleted);
      },
    };

    const fileData = {
      blobKey: item.fields.key,
      fileName: file.name,
      fileType: file.type || file.name.split(".")[1],
      fileSize: file.size,
    };

    uploadedFiles.push(fileData);
    allUploadedFiles.push(fileData);

    if (newUploadedfile) {
      if (newUploadedfile.length > 0) {
        //setAllUploadedFiles([...newUploadedfile, ...uploadedFiles]);
        setAllfilesLists([...newUploadedfile, ...uploadedFiles]);
      } else {
      //  setAllUploadedFiles([...newUploadedfile, ...uploadedFiles]);
        setAllfilesLists([...uploadedFiles]);
      }
      if (argSetValue) {
        if (newUploadedfile.length > 0) {
          setNewUploadedfile([...newUploadedfile, ...uploadedFiles]);
        } else {
          setNewUploadedfile([...uploadedFiles]);
        }
        uploadedFiles = [];
      }
    }

    try{
      const uploadResponse =  await multiPartPost(
        item.url,
        item.fields,
        file,
        config
      );     

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
  };

  const checkUploadedStatus = (
    item: any,
    file: any,
    argSetValue: boolean,
    percentCompleted: number
  ) => {
    const fileData = {
      blobKey: item.fields.key,
      fileName: file.name,
      fileType: file.type || file.name.split(".")[1],
      fileSize: file.size,
      percentage: percentCompleted,
    };

    if (percentCompleted === 100) {
      setFilesCount(filesCount + 1);
    }

    if (uploadedFiles.length < 1) {
      uploadedFiles.push(fileData);
      setUploadedState();
    } else {
      const isFileExist = uploadedFiles.filter(
        (a: any) => a.blobKey === item.fields.key
      );
      if (isFileExist.length > 0) {
        uploadedFiles.map((a: any) => {
          if (a.blobKey === item.fields.key) {
            a.percentage = percentCompleted;
            setUploadedState();
          }
        });
      } else {
        uploadedFiles.push(fileData);
        setUploadedState();
      }
    }
  };

  const setUploadedState = () => {
    uploadedFiles = [...uploadedFiles];
    if (newUploadedfile) {
      if (newUploadedfile.length > 0) {
      //  setAllUploadedFiles([...newUploadedfile, ...uploadedFiles]);
        setAllfilesLists([...newUploadedfile, ...uploadedFiles]);
      } else {
      //  setAllUploadedFiles([...uploadedFiles]);
        setAllfilesLists([...uploadedFiles]);
      }
    }
  };

  const removeFile = (file: any, index: number) => {
    if (!props.isEditAllowed) {
      if(setIsDirty){
        setIsDirty(true);
      }
      let fileData: any = [];
      let attachedFileData: any = [];
      fileData = [...allfilesLists];
      attachedFileData = [...attachedFile];
      fileData.splice(index, 1);
      
      // attachedFile.filter((item: any) => {fileData[index].blobKey == item.blobKey });
      setAllfilesLists(fileData);
      deleteAttachedFile(attachedFileData[index].id, currentTask?.id);
      if (newUploadedfile && newUploadedfile.length > 0 ) {
        setNewUploadedfile([...fileData]);
      }
    }
  };

  

  const renderAcceptedFiles = attachedFile?.map((file: any, index: number) => (
    <>
      <div
        key={`${file.blobkey}-${index}`}
        className="file-attachment__viewList__file"
      >
        <div className="file-attachment__viewList__file__thumbnail">
          {/* <img src={file.preview} /> */}
          <DescriptionIcon />
        </div>
        <div className="file-attachment__viewList__file__description">
          <Tooltip title={file.fileName}>
            <div className="file-attachment__viewList__file__description__fileName">
              {file.fileName.length > 20
                ? file.fileName.slice(0, 18)
                : file.fileName}
            </div>
          </Tooltip>
          <div className="file-attachment__viewList__file__description__fileSize">
            {(file.fileSize / (1024 * 1024)).toFixed(3)} MB
          </div>
        </div>
        {true && (
          <div className="file-attachment__viewList__file__download">
            <GetAppIcon onClick={() => handleDownloadFile(file)} />
          </div>
        )}
        {progressValue > 1 && progressValue < 99
          ? ""
          : !props.isEditAllowed && (
              <div className="file-attachment__viewList__file__fileRemove">
                <CloseIcon onClick={() => removeFile(file, index)} />
              </div>
            )}
              <div className="progress">
        <LinearProgress variant="determinate" value={file.percentage} />
              </div>
      </div>
    
    </>
  ));

  const viewrenderAcceptedFiles = attachedFile?.map((file: any, index: number) => (
    <>
      <div
        key={`${file.blobkey}-${index}`}
        className="file-attachment__viewList__file"
      >
        <div className="file-attachment__viewList__file__thumbnail">
          {/* <img src={file.preview} /> */}
          <DescriptionIcon />
        </div>
        <div className="file-attachment__viewList__file__description">
          <Tooltip title={file.fileName}>
            <div className="file-attachment__viewList__file__description__fileName">
              {file.fileName.length > 20
                ? file.fileName.slice(0, 18)
                : file.fileName}
            </div>
          </Tooltip>
          <div className="file-attachment__viewList__file__description__fileSize">
            {(file.fileSize / (1024 * 1024)).toFixed(3)} MB
          </div>
        </div>
        {true && (
          <div className="file-attachment__viewList__file__download">
            <GetAppIcon onClick={() => handleDownloadFile(file)} />
          </div>
        )}
        {/* {progressValue > 1 && progressValue < 99
          ? ""
          : !props.isEditAllowed && (
              <div className="file-attachment__viewList__file__fileRemove">
                <CloseIcon onClick={() => removeFile(file, index)} />
              </div>
            )} */}
              <div className="progress">
        <LinearProgress variant="determinate" value={file.percentage} />
              </div>
      </div>
    </>
  ));

  return (
    <section className="file-attachment">
     {permissionKeys(currentTask.assignedTo).create ? (<Dropzone
        onDrop={(files: any) => acceptedFiles(files)}
        disabled={
          (progressValue > 1 && progressValue < 99 ? true : false) ||
          props.isEditAllowed
        }
        accept={allowedFileFormats.join(',')}
        maxFiles={props?.attachment?.maxFiles}
      >
        {({ getRootProps, getInputProps }) => (
          <>
            <div>
              <div
                {...getRootProps({
                 // className: props?.attachment?.bgColor
                  className: !props?.attachment?.bgColor && attachedFile?.length == 0 
                    ? "dropzone, file-attachment__dropZone--white"
                    : "dropzone, file-attachment__dropZone",
                })}
              >
                <input {...getInputProps()} />
                { props?.attachment?.placeholder ?
                <p className="file-attachment__text">
                  
                    {props?.attachment?.placeholder }
                </p>: <p className="file-attachment__text">   
                     Drag & Drop files to attach or, <b  className="file-attachment__text__click">click</b> here to add files
                </p>
}
              </div>
            </div>
            {attachedFile?.length > 0 && (
              <div className="file-attachment__viewList">
                  <div style={{maxWidth: "100%",
      display: "grid",
      gridTemplateColumns: "auto auto auto"}}>
        { renderAcceptedFiles}
      </div>
                
                {/* {
                                 progressValue !== 100 && (
                                    <div className="progress">
                                        <LinearProgress variant="determinate" value={progressValue} />
                                    </div>
                                  )
                                } */}
              </div>
            )}
          </>
        )}
      </Dropzone>):(<React.Fragment>
        {permissionKeys(currentTask.assignedTo).view && attachedFile?.length > 0 && (
              <div className="file-attachment__viewList">
                  <div style={{maxWidth: "100%",
      display: "grid",
      gridTemplateColumns: "auto auto auto"}}>
        { viewrenderAcceptedFiles}
      </div>
                {/* {
                                 progressValue !== 100 && (
                                    <div className="progress">
                                        <LinearProgress variant="determinate" value={progressValue} />
                                    </div>
                                  )
                                } */}
              </div>
            )}
      </React.Fragment>)}  
    </section>
  );
}

export default React.memo(FileAttachment);
