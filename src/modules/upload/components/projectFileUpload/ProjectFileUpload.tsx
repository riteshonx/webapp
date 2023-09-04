import { ReactElement, useContext, useRef, useState } from "react";
import Dropzone from "react-dropzone";
import "./ProjectFileUpload.scss";
import Notify, {
  AlertTypes,
} from "../../../shared/components//Toaster/Toaster";
import GetAppIcon from "@material-ui/icons/GetApp";
import { Button, Tooltip } from "@material-ui/core";
import { stateContext } from "src/modules/root/context/authentication/authContext";
import {
  decodeProjectExchangeToken,
  getExchangeToken,
} from "src/services/authservice";
import { setIsLoading } from "src/modules/root/context/authentication/action";
import { multiPartPost, postApiWithEchange } from "src/services/api";
import { client } from "src/services/graphql";
import { myProjectRole } from "../../../../utils/role";
import { CREATE_DOCUMENT, GET_DMS_FEATURE_ID } from "../../graphql/graphql";
import { uploadContext } from "../../contextAPI/context";
import moment from "moment";

let uploadedFiles: any = [];

export default function ProjectFileUpload(props: any): ReactElement {
  const dropZoneRef = useRef<any>(null);
  const [selectedFiles, setSelectedFiles]: any = useState([]);
  const [isFilePicked, setIsFilePicked] = useState(false);
  const [allfilesLists, setAllfilesLists]: any = useState([]);
  const [progressValue, setProgressValue] = useState(0);
  const { dispatch, state }: any = useContext(stateContext);
  const { uploadDispatch, uploadState }: any = useContext(uploadContext);

  const acceptedFiles = (acceptedfilesData: any, rejectedFiles: any) => {
    changeHandler(acceptedfilesData);
  };

  const changeHandler = (file: any) => {
    setSelectedFiles((prevSelectedFiles: any) => {
      return [...prevSelectedFiles, ...file];
    });
    setIsFilePicked(true);
    fileUpload(file);
  };

  const handleSubmission = async () => {
    dispatch(setIsLoading(true));
    const data = uploadedFiles.map((file: any, i: number) => {
      const docType: any = props.documentTypes.find(
        (docType: any) => docType.name === file?.fileType.split("/")[0]
      );
      return {
        fileKey: file.blobKey,
        fileSize: file.fileSize,
        name: file?.fileName.split(".")[0],
        thumbnailKey: file.blobKey,
        mimeType: file.fileType,
        documentTypeId: docType?.id ? docType?.id : 3,
      };
    });
    try {
      await client.mutate({
        mutation: CREATE_DOCUMENT,
        variables: { fileData: data },
        context: {
          role: "createDocument",
          token: state.selectedProjectToken,
        },
      });
      setIsFilePicked(false);
      setSelectedFiles([]);
      uploadedFiles = [];
      props.getDocumentsBasedOnFilter();
      uploadState.uploadDates?.length &&
        !uploadState.uploadDates?.includes(
          moment().format("DD/MMM/YYYY ddd")
        ) &&
        props.getAllUploadDates();
      props.closeFileZone();
    } catch (error) {
      dispatch(setIsLoading(false));
      console.log(error);
    }
  };

  const handleUploadCancel = () => {
    props.closeFileZone();
    setIsFilePicked(false);
    setSelectedFiles([]);
    uploadedFiles = [];
  };

  const getDMSFeatureDetails = async () => {
    const getFeatureId = await client.query({
      query: GET_DMS_FEATURE_ID,
      fetchPolicy: "network-only",
      context: {
        role: myProjectRole.viewMyProjects,
        token: getExchangeToken(),
      },
    });
    return getFeatureId?.data?.projectFeature[0];
  };

  const fileUpload = async (acceptedfilesData: any) => {
    let fileData: any = {};
    const payload: any = [];

    const dmsFeature = await getDMSFeatureDetails();

    acceptedfilesData.forEach((file: any) => {
      fileData = {
        fileName: file?.name,
        projectId: decodeProjectExchangeToken().projectId,
        featureId: dmsFeature.id,
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
          // console.log(
          //   item,
          //   acceptedfilesData[index],
          //   projectTokenResponse?.success.length - 1 === index
          // );
          uploadFileToS3(
            item,
            acceptedfilesData[index],
            projectTokenResponse?.success.length - 1 === index
          );
        });
      }
      dispatch(setIsLoading(false));
    } catch (error) {
      Notify.sendNotification(error, AlertTypes.warn);
      dispatch(setIsLoading(false));
    }
  };

  const uploadFileToS3 = async (item: any, file: any, argSetValue: any) => {
    const config = {
      onUploadProgress: function (progressEvent: any) {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        setProgressValue(percentCompleted);
      },
    };
    const fileData = {
      blobKey: item.fields.key,
      fileName: file.name.split(".")[0],
      fileType: file.type || file.name.split(".")[0],
      fileSize: file.size,
    };
    uploadedFiles.push(fileData);
    setIsLoading(false);
    // console.log("data", item.url, item.fields, file, config);
    // handleSubmission();
    try {
      await multiPartPost(item.url, item.fields, file, config);
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

  return (
    <div className="fileUpload">
      <div className="main-container">
        <section className="drawing-attachment">
          <Dropzone
            onDrop={(files: any, rejectedFiles: any) => {
              acceptedFiles(files, rejectedFiles);
            }}
            disabled={false}
            maxSize={400 * 1024 * 1024} // 400MB
          >
            {({ getRootProps, getInputProps }) => (
              <>
                <div className="file-upload-container">
                  <div
                    {...getRootProps({
                      className: props?.attachment?.bgColor
                        ? "dropzone, drawing-attachment__dropZone--white"
                        : "dropzone, drawing-attachment__dropZone",
                    })}
                  >
                    <div
                      className="drawing-attachment__wrapper"
                      ref={dropZoneRef}
                    >
                      <input {...getInputProps()} />
                      <div className="drawing-attachment__text">
                        {props?.attachment?.placeholder ? (
                          props?.attachment?.placeholder
                        ) : (
                          <>
                            <div className="drawing-attachment__text__icon">
                              <GetAppIcon />
                            </div>
                            <div className="drawing-attachment__text__message">
                              Drag and drop selected files here, or
                              <span className="drawing-attachment__text__message__click">
                                click
                              </span>
                              to select single or multiple files
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </Dropzone>
          <div className="main-container__content">
            {isFilePicked && (
              <div className="main-container__content__scroll">
                {/* File Name: */}
                {selectedFiles?.map((item: any, i: number) => (
                  <div
                    key={i}
                    className="main-container__content__scroll__imgContainer"
                  >
                    <img
                      src={URL.createObjectURL(item)}
                      className="main-container__content__scroll__imgContainer__img"
                    />
                    <Tooltip title={item?.name}>
                      <div className="main-container__content__scroll__imgContainer__text">
                        {item?.name && item?.name?.length > 10
                          ? `${item?.name.slice(0, 9)}...`
                          : item?.name}
                      </div>
                    </Tooltip>
                  </div>
                ))}
              </div>
            )}
            {isFilePicked}
            <div className="main-container__content__buttonContainer">
              <Button
                onClick={handleSubmission}
                variant={"outlined"}
                className={"btn-primary"}
                disabled={!isFilePicked}
              >
                Submit
              </Button>
              <Button
                onClick={handleUploadCancel}
                variant={"outlined"}
                className={"btn-secondary"}
              >
                Cancel
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
