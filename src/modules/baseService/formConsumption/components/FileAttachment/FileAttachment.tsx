import React, { ReactElement, useContext, useEffect, useState } from "react";
import Dropzone from "react-dropzone";
import "./FileAttachment.scss";
import CloseIcon from "@material-ui/icons/Close";
import { setIsLoading } from "src/modules/root/context/authentication/action";
import { multiPartPost, postApiWithEchange } from "src/services/api";
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
import { formStateContext } from "../../Context/projectContext";

export interface Params {
  id: string;
  featureId: string;
}

let uploadedFiles: any = [];

function FileAttachment(props: any): ReactElement {
  const [allfilesLists, setAllfilesLists] = useState<Array<any>>([]);
  const { dispatch, state }: any = useContext(stateContext);
  const pathMatch: match<Params> = useRouteMatch();
  const [progressValue, setProgressValue] = useState(0);
  const [filesCount, setFilesCount] = useState(0);
  const { setIsDirty }: any = useContext(formStateContext);

  useEffect(() => {
    if (props?.field?.value && props?.field?.value.length > 0) {
      setAllfilesLists(props?.field?.value);
      setProgressValue(100);
    }
    return () => {
      uploadedFiles = [];
      setFilesCount(0);
    };
  }, [props?.field]);

  // for review page
  useEffect(() => {
    if (props?.uploadedFiles && props?.uploadedFiles.length > 0) {
      setAllfilesLists(props?.uploadedFiles);
      setProgressValue(100);
    } else {
      setAllfilesLists(props?.uploadedFiles);
    }
    return () => {
      uploadedFiles = [];
      setFilesCount(0);
    };
  }, [props?.uploadedFiles]);

  const acceptedFiles = (acceptedfilesData: any) => {
    if (!acceptedfilesData.length) {
      Notification.sendNotification(
        "Please select a valid file type",
        AlertTypes.warn
      );
      return;
    }
    if (!props.isEditAllowed) {
      fileUpload(acceptedfilesData);
    }
  };

  const getAttachedFileData = (value: any) => {
    if (props?.attachment?.type === "file") {
      props?.handleAttachedFiles(value, "file");
    } else {
      props?.handleAttachedFiles(value, "image");
    }
  };

  const fileUpload = async (acceptedfilesData: any) => {
    let fileData: any = {};
    const payload: any = [];
    if (setIsDirty) {
      setIsDirty(true);
    }
    acceptedfilesData.forEach((file: any) => {
      fileData = {
        fileName: file?.name,
        projectId: Number(pathMatch.params.id),
        featureId: Number(pathMatch.params.featureId),
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
        projectTokenResponse?.success.forEach((item: any, index: number) => {
          uploadFileToS3(
            item,
            acceptedfilesData[index],
            projectTokenResponse?.success.length - 1 === index
          );
        });
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
    if (props?.field) {
      if (props?.field?.value) {
        setAllfilesLists([...props?.field?.value, ...uploadedFiles]);
      } else {
        setAllfilesLists([...uploadedFiles]);
      }
      if (argSetValue) {
        if (props?.field?.value) {
          props?.field?.onChange([...props?.field?.value, ...uploadedFiles]);
        } else {
          props?.field?.onChange([...uploadedFiles]);
        }
        uploadedFiles = [];
      }
    }

    // for review page
    if (props?.attachment) {
      setAllfilesLists([...uploadedFiles]);
      if (
        props?.attachment?.type === "file" &&
        props?.uploadedFiles &&
        props?.uploadedFiles.length > 0
      ) {
        setAllfilesLists([...props?.uploadedFiles, ...uploadedFiles]);
      } else {
        setAllfilesLists([...uploadedFiles]);
      }
      if (argSetValue) {
        if (
          props?.attachment?.type === "file" &&
          props?.uploadedFiles &&
          props?.uploadedFiles.length > 0
        ) {
          getAttachedFileData([...props?.uploadedFiles, ...uploadedFiles]);
        } else {
          getAttachedFileData([...uploadedFiles]);
        }
        uploadedFiles = [];
      }
    }
    try {
      const uploadResponse = await multiPartPost(
        item.url,
        item.fields,
        file,
        config
      );
    } catch (error: any) {
      console.log(error.message);
      if (error.message.includes("status code 404")) {
        const currentFile = uploadedFiles.find(
          (item: any) => item?.blobKey === fileData?.blobKey
        );
        if (currentFile) {
          const index = uploadedFiles.indexOf(currentFile);
          uploadedFiles.splice(index, 1);
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
    if (props?.field) {
      if (props?.field?.value) {
        setAllfilesLists([...props?.field?.value, ...uploadedFiles]);
      } else {
        setAllfilesLists([...uploadedFiles]);
      }
    }

    // for review page
    if (props?.attachment) {
      setAllfilesLists([...uploadedFiles]);
      if (
        props?.attachment?.type === "file" &&
        props?.uploadedFiles &&
        props?.uploadedFiles.length > 0
      ) {
        setAllfilesLists([...props?.uploadedFiles, ...uploadedFiles]);
      } else {
        setAllfilesLists([...uploadedFiles]);
      }
    }
  };

  const removeFile = (file: any, index: number) => {
    if (!props.isEditAllowed) {
      if (setIsDirty) {
        setIsDirty(true);
      }
      let fileData: any = [];
      fileData = [...allfilesLists];
      fileData.splice(index, 1);
      setAllfilesLists(fileData);
      if (props?.field) {
        props?.field?.onChange(fileData);
      }
      if (props?.attachment) {
        getAttachedFileData(fileData);
      }
    }
  };

  const renderAcceptedFiles = allfilesLists?.map((file: any, index: number) => {
    return (
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
                  ? `${file.fileName.slice(0, 18)}....${
                      file.fileName.split(".")[1]
                    }`
                  : file.fileName}
              </div>
            </Tooltip>
            <div className="file-attachment__viewList__file__description__fileSize">
              {(file.fileSize / (1024 * 1024)).toFixed(3)} MB
            </div>
          </div>
          {file?.url && (
            <div className="file-attachment__viewList__file__download">
              <GetAppIcon onClick={() => window.open(file.url, "_blank")} />
            </div>
          )}
          {progressValue > 1 && progressValue < 99
            ? ""
            : !props.isEditAllowed && (
                <div className="file-attachment__viewList__file__fileRemove">
                  <CloseIcon onClick={() => removeFile(file, index)} />
                </div>
              )}
        </div>
        <div className="progress">
          <LinearProgress variant="determinate" value={file.percentage} />
        </div>
      </>
    );
  });

  return (
    <section className="file-attachment">
      <Dropzone
        onDrop={(files: any) => acceptedFiles(files)}
        disabled={
          (progressValue > 1 && progressValue < 99 ? true : false) ||
          props.isEditAllowed
        }
        accept={allowedFileFormats.join(",")}
        maxFiles={props?.attachment?.maxFiles}
      >
        {({ getRootProps, getInputProps }) => (
          <>
            <div>
              <div
                {...getRootProps({
                  className: props?.attachment?.bgColor
                    ? "dropzone, file-attachment__dropZone--white"
                    : "dropzone, file-attachment__dropZone",
                })}
              >
                <input {...getInputProps()} />
                <p className="file-attachment__text">
                  {props?.attachment?.placeholder
                    ? props?.attachment?.placeholder
                    : "Drag and drop some files here, or click to select files"}
                </p>
              </div>
            </div>
            {allfilesLists?.length > 0 && (
              <div className="file-attachment__viewList">
                {renderAcceptedFiles}
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
      </Dropzone>
    </section>
  );
}

export default React.memo(FileAttachment);
