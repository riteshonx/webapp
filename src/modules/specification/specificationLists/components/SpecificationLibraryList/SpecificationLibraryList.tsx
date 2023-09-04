import React, { ReactElement, useContext, useEffect, useState } from "react";
import "./SpecificationLibraryList.scss";
import PdfIcon from "../../../../../assets/images/pdf_image.svg";
import Tooltip from "@material-ui/core/Tooltip";
import DeleteIcon from "@material-ui/icons/Delete";
import GetAppIcon from "@material-ui/icons/GetApp";
import Button from "@material-ui/core/Button";
import { match, useHistory, useRouteMatch } from "react-router-dom";
import { decodeExchangeToken } from "../../../../../services/authservice";
import { specificationStatus } from "../../../utils/SpecificationConstants";
import ConfirmDialog from "../../../../shared/components/ConfirmDialog/ConfirmDialog";
import moment from "moment";
import { stateContext } from "../../../../root/context/authentication/authContext";
import { setIsLoading } from "../../../../root/context/authentication/action";
import { postApi } from "../../../../../services/api";
import Notification, {
  AlertTypes,
} from "../../../../shared/components/Toaster/Toaster";
import { DELETE_DOCUMENT_LIBRARY } from "../../graphql/queries/specification";
import { client } from "../../../../../services/graphql";
import { specificationRoles } from "../../../../../utils/role";
import NoDataMessage from "../../../../shared/components/NoDataMessage/NoDataMessage";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import {
  UPDATE_SUBMITTAL_EXTRACTION,
  FETCH_DOCUMENT_LIBRARY_DATA,
} from "../../graphql/queries/specification";
import WarningIcon from "@material-ui/icons/Warning";
import { setSubmittalTriggerResponse } from "../../context/SpecificationLibDetailsAction";
import { SpecificationLibDetailsContext } from "../../context/SpecificationLibDetailsContext";
export interface Params {
  projectId: string;
  documentId: string;
}
interface message {
  header: string;
  text: string;
  cancel: string;
  proceed: string;
}

const confirmMessage: message = {
  header: "Are you sure!",
  text: `Do you want to delete this document document?`,
  cancel: "Cancel",
  proceed: "Confirm",
};

const noDataMessage = "No data available";

export default function SpecificationLibraryList(props: any): ReactElement {
  const { state, dispatch }: any = useContext(stateContext);
  const history = useHistory();
  const pathMatch: match<Params> = useRouteMatch();
  const [uploadingFilesDtata, setUploadingFilesDtata] = useState<Array<any>>(
    []
  );
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>();
  const { SpecificationLibDetailsDispatch }: any = useContext(
    SpecificationLibDetailsContext
  );
  const [buttonFlag, setButtonFlag] = useState(false);
  const [clickedIndex, setClickedIndex] = useState(-1);
  const startReview = (item: any) => {
    history.push(
      `/specifications/projects/${pathMatch.params.projectId}/review/${item}`
    );
  };

  // const extractSubmittal = (item: any) => {
  //     console.log(item,'item')
  //     history.push(`/submittal/projects/${pathMatch.params.projectId}/extrat-submital/${item}`);
  // }
  useEffect(() => {
    if (props?.uploadingFiles?.length > 0) {
      const test = [...props?.uploadingFiles];

      setUploadingFilesDtata(props?.uploadingFiles);
    } else {
      setUploadingFilesDtata([]);
    }
  }, [props?.uploadingFiles]);

  const handleConfirmBoxClose = () => {
    setConfirmOpen(false);
    setSelectedDocument(null);
  };

  const handleConfirmBox = (file: any) => {
    setConfirmOpen(true);
    setSelectedDocument(file);
  };

  const deleteFileDoc = async () => {
    try {
      dispatch(setIsLoading(true));
      const updateDocumentResponse: any = await client.mutate({
        mutation: DELETE_DOCUMENT_LIBRARY,
        variables: {
          id: selectedDocument.id,
        },
        context: {
          role: specificationRoles.deleteSpecifications,
          token: state.selectedProjectToken,
        },
      });
      Notification.sendNotification(
        "Document deleted successfully",
        AlertTypes.success
      );
      handleConfirmBoxClose();
      if (
        updateDocumentResponse?.data.update_techspecUploadStatus
          ?.affected_rows > 0
      ) {
        props.refresh(selectedDocument);
      }
      dispatch(setIsLoading(false));
    } catch (err: any) {
      dispatch(setIsLoading(false));
      Notification.sendNotification(err, AlertTypes.warn);
      console.log(err);
    }
  };

  const handleDownloadFile = (file: any) => {
    const payload = [
      {
        fileName: file.fileName,
        key: file.sourceKey,
        expiresIn: 1000,
      },
    ];

    downloadDocument(payload);
  };

  const downloadDocument = async (payload: any) => {
    try {
      dispatch(setIsLoading(true));
      const fileUploadResponse = await postApi("V1/S3/downloadLink", payload);
      window.open(fileUploadResponse.success[0].url, "_parent");
      dispatch(setIsLoading(false));
    } catch (error) {
      Notification.sendNotification(error, AlertTypes.warn);
      dispatch(setIsLoading(false));
    }
  };

  const openFileUpload = () => {
    props.handleOpenFileZone();
  };

  const handleExtractSubmittals = (file: any, index: any) => {
    triggerSubmittal(file.id);
    resetIndex(file.id);
  };
  const resetIndex = (index: any) => {
    if (index === clickedIndex) {
      setClickedIndex(-1);
    } else {
      setClickedIndex(index);
    }
  };
  const triggerSubmittal = async (id: any) => {
    try {
      // if(){
      //     // dispatch(setIsLoading(true));
      //     return;
      // }
      // fetchedFilesArray = [];
      dispatch(setIsLoading(true));
      const submittalTriggerResponse = await client.mutate({
        mutation: UPDATE_SUBMITTAL_EXTRACTION,
        variables: {
          submittalId: id,
        },
        context: {
          role: specificationRoles.createSpecifications,
          token: state.selectedProjectToken,
        },
      });
      if (
        submittalTriggerResponse?.data?.submittalProcess?.ack.length > 0 &&
        submittalTriggerResponse?.data?.submittalProcess?.ack.includes(
          "successfully"
        )
      ) {
        SpecificationLibDetailsDispatch(
          setSubmittalTriggerResponse(
            submittalTriggerResponse?.data?.submittalProcess?.ack
          )
        );
        Notification.sendNotification(
          "Submittals Extraction started",
          AlertTypes.success
        );
      }
      // if(isLoader){
      dispatch(setIsLoading(false));
      // }
    } catch (error) {
      console.log(error);
      Notification.sendNotification(error, AlertTypes.warn);
      // if(isLoader){
      dispatch(setIsLoading(false));
      // }
    }
  };

  const handleSubmittals = (file: any) => {
    history.push(
      `/specifications/projects/${pathMatch.params.projectId}/extractSubmittals/${file.id}`
    );
  };

  return (
    <>
      {uploadingFilesDtata?.length > 0 &&
      state?.projectFeaturePermissons?.cancreateSpecifications ? (
        <>
          <div className="specificationList">
            <div className="specificationList__header">
              <div>File Details</div>
              <div>Version Name</div>
              <div>Version Date</div>
              <div>Total Pages</div>
              <div>Uploaded By</div>
              <div>Status</div>
              <div></div>
            </div>
            <>
              {uploadingFilesDtata.length > 0 ? (
                <>
                  {uploadingFilesDtata.map((file: any, index: number) => {
                    const { createdByTenantUser, sourceKey, fileName } = file;
                    return (
                      <div className="specificationList__file" key={sourceKey}>
                        <div className="specificationList__file__info">
                          <div className="specificationList__file__info__details">
                            <div className="specificationList__file__info__details__image">
                              <img src={PdfIcon} alt="pdf" />
                            </div>
                            <div className="specificationList__file__info__details__text">
                              <div>
                                <Tooltip
                                  title={fileName}
                                  aria-label="createdBy"
                                >
                                  <label>
                                    {fileName.length > 20
                                      ? fileName.slice(0, 20).padEnd(23, ".")
                                      : fileName}
                                  </label>
                                </Tooltip>
                              </div>
                              <div className="specificationList__file__info__details__text__time">
                                {file?.createdAt ? (
                                  <>
                                    <span>
                                      {moment(file?.createdAt)
                                        .format("DD-MMM-YYYY")
                                        .toString()}
                                    </span>{" "}
                                    {` at `}
                                    <span>
                                      {moment(file?.createdAt)
                                        .format("hh:mm A")
                                        .toString()}
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <span>
                                      {moment(new Date())
                                        .format("DD-MMM-YYYY")
                                        .toString()}
                                    </span>{" "}
                                    {` at `}
                                    <span>
                                      {moment(new Date().getTime())
                                        .format("hh:mm A")
                                        .toString()}
                                    </span>
                                  </>
                                )}
                                {` | `}
                                <span>
                                  {(file.fileSize / (1024 * 1024)).toFixed(3)}{" "}
                                  MB
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="specificationList__file__info__details__text">
                            {file?.versionInfoReviewed?.versionInfo
                              ?.Set_Version_Name
                              ? file?.versionInfoReviewed?.versionInfo
                                  ?.Set_Version_Name
                              : "-"}
                          </div>
                          <div className="specificationList__file__info__details__text">
                            {file?.versionInfoReviewed?.versionInfo
                              ?.Version_Date
                              ? moment(
                                  file?.versionInfoReviewed?.versionInfo
                                    ?.Version_Date
                                )
                                  .format("DD-MMM-YYYY")
                                  .toString()
                              : "-"}
                          </div>
                          <div className="specificationList__file__info__details__text">
                            {file?.sectionInfo?.total_pages
                              ? file?.sectionInfo?.total_pages
                              : "-"}
                          </div>
                          <div className="specificationList__file__info__details__text">
                            {createdByTenantUser?.user?.firstName ?? ""}
                          </div>
                          <div className="specificationList__file__info__details__status">
                            <div
                              className={`${
                                file?.status === "FAILED"
                                  ? "specificationList__file__info__details__status__failed"
                                  : file?.status === "PUBLISHED"
                                  ? "specificationList__file__info__details__status__published"
                                  : ""
                              } `}
                            >
                              {file?.status &&
                              file?.status === "FINDING_SUBMITTALS"
                                ? "FINDING SUBMITTALS"
                                : file?.status &&
                                  file?.status === "SUBMITTALS_FOUND"
                                ? "SUBMITTALS FOUND"
                                : file?.status &&
                                  file?.status === "SUBMITTALS_PUBLISHED"
                                ? "SUBMITTALS PUBLISHED"
                                : clickedIndex === index &&
                                  file?.status === "PUBLISHED"
                                ? "EXTRACT SUBMITTALS"
                                : file?.status
                                ? file?.status
                                : "-"}
                            </div>
                            <>
                              {file?.status === "PARSING" && (
                                <>
                                  {/* <div className="stage">
                                                                        <div className="dot-pulse"></div>
                                                                    </div> */}

                                  {file?.progress ? (
                                    <div className="specificationList__file__info__details__status__progress">
                                      {`${file?.progress} %`}
                                    </div>
                                  ) : (
                                    <div className="specificationList__file__info__details__status__progress">
                                      {`0 %`}
                                    </div>
                                  )}
                                </>
                              )}
                            </>
                            <>
                              {file?.status === "FINDING_SUBMITTALS" && (
                                <>
                                  {/* <div className="stage">
                                                                        <div className="dot-pulse"></div>
                                                                    </div> */}

                                  {file?.progress ? (
                                    <div className="specificationList__file__info__details__status__progress">
                                      {`${file?.progress} %`}
                                    </div>
                                  ) : (
                                    <div className="specificationList__file__info__details__status__progress">
                                      {`0 %`}
                                    </div>
                                  )}
                                </>
                              )}
                            </>
                            <>
                              {file?.status === "FAILED" && (
                                <>
                                  <div className="specificationList__file__info__details__status__warn-icon">
                                    <Tooltip
                                      title={
                                        "Parsing failed. Parser currently supports only CSI format."
                                      }
                                      aria-label="failed"
                                    >
                                      <label>
                                        <WarningIcon className="error" />
                                      </label>
                                    </Tooltip>
                                  </div>
                                </>
                              )}
                            </>
                          </div>
                          <div className="specificationList__file__info__action">
                            {specificationStatus[file?.status] < 2 && (
                              <>
                                <div className="uploadPercent">
                                  {file?.percentage
                                    ? `${file?.status} ${file?.percentage}%`
                                    : ""}
                                </div>
                              </>
                            )}
                            <div>
                              {specificationStatus[file?.status] > 3 &&
                                specificationStatus[file?.status] < 6 && (
                                  <Button
                                    data-testid={"start-review"}
                                    variant="outlined"
                                    className="btn-primary"
                                    size="small"
                                    onClick={() => startReview(file?.id)}
                                  >
                                    {specificationStatus[file?.status] === 4
                                      ? "Start Review"
                                      : "Resume Review"}
                                  </Button>
                                )}

                              {
                                // (specificationStatus[file?.status] > 5 && specificationStatus[file?.status] < 9) &&
                                file?.status === "PUBLISHED" &&
                                  clickedIndex === file?.id &&
                                  "Submittals Extracting"
                                // (
                                //     <Button
                                //         data-testid={'start-review'}
                                //         variant="outlined"
                                //         className="btn-primary"
                                //         size="small"
                                //         onClick={() => handleExtractSubmittals(file,index)}
                                //         disabled={true}
                                //     >
                                //         Extract Submittals
                                //     </Button>
                                // ):(
                                //     <Button
                                //         data-testid={'start-review'}
                                //         variant="outlined"
                                //         className="btn-primary"
                                //         size="small"
                                //         onClick={() => handleExtractSubmittals(file,index)}
                                //         disabled={false}
                                //     >
                                //         Extract Submittals
                                //     </Button>
                                // )
                              }
                              {
                                // (specificationStatus[file?.status] > 5 && specificationStatus[file?.status] < 9) &&
                                (file?.status === "SUBMITTALS_FOUND" ||
                                  file?.status == "REVIEWING_SUBMITTALS") && (
                                  <Button
                                    data-testid={"start-review"}
                                    variant="outlined"
                                    className="btn-primary"
                                    size="small"
                                    onClick={() => handleSubmittals(file)}
                                  >
                                    Review Submittals
                                  </Button>
                                )
                              }
                            </div>
                            {/* {
                                                        (specificationStatus[file?.status] ===6)  && 
                                                            (                        
                                                                <Button
                                                                    data-testid={'start-review'}
                                                                    variant="outlined"
                                                                    className="btn-primary"
                                                                    size="small"
                                                                    onClick={() => extractSubmittal(file?.id)}
                                                                >
                                                                   Extract Submittals
                                                                </Button>
                                                            )
                                                    } */}
                            <div className="specificationList__file__info__action__iconDiv">
                              {specificationStatus[file?.status] > 1 && (
                                <>
                                  <div className="specificationList__file__info__action__iconDiv__icon">
                                    <Tooltip
                                      title={"Download"}
                                      aria-label="first name"
                                    >
                                      <label>
                                        <GetAppIcon
                                          className="download-icon"
                                          onClick={() =>
                                            handleDownloadFile(file)
                                          }
                                        />
                                      </label>
                                    </Tooltip>
                                  </div>
                                </>
                              )}
                              {file.id &&
                                state?.projectFeaturePermissons
                                  ?.candeleteSpecifications && (
                                  <div className="specificationList__file__info__action__icon">
                                    <Tooltip
                                      title={"Delete"}
                                      aria-label="first name"
                                    >
                                      <label>
                                        <DeleteIcon
                                          onClick={() => handleConfirmBox(file)}
                                        />
                                      </label>
                                    </Tooltip>
                                  </div>
                                )}
                            </div>
                          </div>
                        </div>
                        {specificationStatus[file?.status] < 8 && (
                          <div className="specificationList__file__progress">
                            {/* uploading-uploaded */}
                            <div
                              className={`${
                                specificationStatus[file?.status] > 1
                                  ? "specificationList__file__progress__active"
                                  : "specificationList__file__progress__step"
                              } `}
                            >
                              <div
                                className={`${
                                  specificationStatus[file?.status] === 1
                                    ? "circle-active"
                                    : "circle"
                                } `}
                              ></div>
                              <div
                                className={`${
                                  specificationStatus[file?.status] === 1
                                    ? "step-name-active"
                                    : "step-name"
                                } `}
                              >
                                {specificationStatus[file?.status] < 2
                                  ? "Uploading"
                                  : "Uploaded"}
                              </div>
                            </div>

                            {/* Parsing-Parsed */}
                            <div
                              className={`${
                                specificationStatus[file?.status] > 3
                                  ? "specificationList__file__progress__active"
                                  : "specificationList__file__progress__step"
                              } `}
                            >
                              <div
                                className={`${
                                  specificationStatus[file?.status] === 3
                                    ? "circle-active"
                                    : "circle"
                                } `}
                              ></div>
                              <div
                                className={`${
                                  specificationStatus[file?.status] === 3
                                    ? "step-name-active"
                                    : "step-name"
                                } `}
                              >
                                {specificationStatus[file?.status] < 4
                                  ? "Parsing"
                                  : "Parsed"}
                              </div>
                            </div>
                            <div
                              className={`${
                                specificationStatus[file?.status] > 5
                                  ? "specificationList__file__progress__active"
                                  : "specificationList__file__progress__step"
                              } `}
                            >
                              <div
                                className={`${
                                  specificationStatus[file?.status] === 5
                                    ? "circle-active"
                                    : "circle"
                                } `}
                              ></div>
                              <div
                                className={`${
                                  specificationStatus[file?.status] === 5
                                    ? "step-name-active"
                                    : "step-name"
                                } `}
                              >
                                {specificationStatus[file?.status] < 5
                                  ? "Start Review"
                                  : specificationStatus[file?.status] < 6
                                  ? "Resume Review"
                                  : "Reviewed"}
                              </div>

                              {/* test button */}

                              {/* test button end */}
                            </div>
                            <div
                              className={`${
                                specificationStatus[file?.status] > 5
                                  ? "specificationList__file__progress__active"
                                  : "specificationList__file__progress__step"
                              } `}
                            >
                              <div className="circle"></div>
                              <div className="step-name">
                                {specificationStatus[file?.status] < 6
                                  ? "Publish"
                                  : "Published"}
                              </div>
                            </div>
                            <div
                              className={`${
                                specificationStatus[file?.status] > 7
                                  ? "specificationList__file__progress__active"
                                  : "specificationList__file__progress__step"
                              } `}
                            >
                              <div
                                className={`${
                                  specificationStatus[file?.status] === 7
                                    ? "circle-active"
                                    : "circle"
                                } `}
                              ></div>
                              <div className="step-name">
                                {specificationStatus[file?.status] < 8
                                  ? "Finding Submittals"
                                  : "Found Submittals"}
                              </div>

                              {/* test button */}

                              {/* test button end */}
                            </div>
                            <div
                              className={`${
                                specificationStatus[file?.status] > 8
                                  ? "specificationList__file__progress__active"
                                  : "specificationList__file__progress__step"
                              } `}
                            >
                              <div className="circle last-child"></div>
                              <div className="step-name">
                                {specificationStatus[file?.status] < 8
                                  ? "Submittals Found"
                                  : "Submittals Found"}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {confirmOpen ? (
                    <ConfirmDialog
                      open={confirmOpen}
                      message={confirmMessage}
                      close={handleConfirmBoxClose}
                      proceed={deleteFileDoc}
                    />
                  ) : (
                    ""
                  )}
                </>
              ) : (
                <div className="noData">
                  <div className="noData__message">
                    <NoDataMessage message={noDataMessage} />
                  </div>
                </div>
              )}
            </>
          </div>
        </>
      ) : (
        !state.isLoading && (
          <div className="no-List">
            <div className="no-List__message">
              <div className="no-List__message__text">
                Upload a document to publish Specification
              </div>
              <Button
                id="upload-pdf"
                data-testid={"upload-file"}
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
      )}
    </>
  );
}
