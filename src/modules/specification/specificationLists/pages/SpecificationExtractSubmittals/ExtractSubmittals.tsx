import React, { ReactElement, useContext, useState } from "react";
import ExtractSubmittalsList from "../../components/ExtractSubmitallsList/ExtractSubmittalsList";
import { Button, Paper } from "@material-ui/core";
import "./ExtractSubmittals.scss";
import { useEffect } from "react";
import { stateContext } from "../../../../root/context/authentication/authContext";
import { useHistory, useRouteMatch } from "react-router-dom";
import { SpecificationLibDetailsContext } from "../../context/SpecificationLibDetailsContext";
import { setSpecificationLibDetails } from "../../context/SpecificationLibDetailsAction";
import { setParsedFileUrl } from "../../../../drawings/drawingLists/context/DrawingLibDetailsAction";
import {
  GET_CONFIGURATION_LISTS,
  FETCH_DOCUMENT_LIBRARY_DATA,
  GET_SUBMITTAL_DETAIL,
  PUBLISH_SUBMITTAL_INFO_REVIEWED,
  FETCH_UPLOADED_FILES_PDF_DATA,
} from "../../graphql/queries/specification";
import { client } from "../../../../../services/graphql";
import {
  decodeExchangeToken,
  decodeProjectExchangeToken,
} from "../../../../../services/authservice";
import { specificationRoles } from "src/utils/role";
import {
  postApiWithEchange,
  postApiWithProjectExchange,
} from "src/services/api";
import PdfTron from "../../components/PdfTronSubmittals/PdfTron";
import { projectContext } from "src/modules/baseService/formConsumption/Context/projectContext";
import Notification, {
  AlertTypes,
} from "src/modules/shared/components/Toaster/Toaster";
import { truncateSpecHeadingString } from "src/utils/helper";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";
import { setIsLoading } from "src/modules/root/context/authentication/action";
import SpecificationHeader from "../../components/SpecificationHeaders/SpeecificationHeaders";

export default function ExtractSubmittals(props: any): ReactElement {
  const { projectState }: any = useContext(projectContext);
  const { dispatch, state }: any = useContext(stateContext);
  const history: any = useHistory();
  const { SpecificationLibDetailsState, SpecificationLibDetailsDispatch }: any =
    useContext(SpecificationLibDetailsContext);
  const [showPdfTron, setShowPdfTron] = useState(false);
  const [specSectionDetails, setSpecSectionDetails] = useState<any>([]);
  const [fileName, setFileName] = useState<any>({ name: "", description: "" });
  const [submittalTypes, setSubmittalTypes] = useState<any>([]);
  const [dataToPublish, setSubmittalsPublish] = useState<Array<any>>([]);
  const [submittalInfoReviewed, setSubmittalInfoReviewed] = useState<
    Array<any>
  >([]);
  const pathMatch: any = useRouteMatch();
  const [disablePublish, setDisablePublish] = useState(false);

  useEffect(() => {
    if (state.selectedProjectToken) {
      fetchSpecificationLibraryDetails();
      fetchConfigurationLists();
      fetchSubmittals();
    }
  }, [state.selectedProjectToken]);

  const fetchSubmittals = async () => {
    try {
      dispatch(setIsLoading(true));
      const formsTemplateResponse = await client.query({
        query: GET_SUBMITTAL_DETAIL,
        variables: {
          id: pathMatch.params.submittalId,
        },
        fetchPolicy: "network-only",
        context: {
          role: "viewSpecifications",
          token: state.selectedProjectToken,
        },
      });

      if (formsTemplateResponse) {
        const submittal =
          formsTemplateResponse.data.techspecUploadStatus[0]
            .submittalInfoReviewed.submittals;
        const temp: any = [];
        for (
          let i = 0;
          i <
          formsTemplateResponse.data.techspecUploadStatus[0]
            .submittalInfoReviewed.submittals.length;
          i++
        ) {
          temp.push({
            ...formsTemplateResponse.data.techspecUploadStatus[0]
              .submittalInfoReviewed.submittals[i],
            uniqueId: submittal[i]?.uniqueId ? submittal[i]?.uniqueId : i,
            notASubmittal: submittal[i]?.notASubmittal ? true : false,
            line_text: submittal[i].line_text,
          });
        }
        const tempSubmittalInfoReviewed: any = {
          submittals: temp,
        };
        setPublishSubmittals(temp);
        dispatch(setIsLoading(false));
        setSubmittalInfoReviewed(tempSubmittalInfoReviewed);
        setSubmittalsPublish(temp);
        // setSubmittalTypes(formsTemplateResponse.data.configurationLists[0].configurationValues)
      }
    } catch (err: any) {
      console.log(err);
    }
  };
  // .replace(/\r?\n|\r/g, "")

  const fetchConfigurationLists = async () => {
    try {
      const formsTemplateResponse = await client.query({
        query: GET_CONFIGURATION_LISTS,
        variables: {},
        fetchPolicy: "network-only",
        context: {
          role: "viewSpecifications",
          token: state.selectedProjectToken,
        },
      });

      if (formsTemplateResponse) {
        setSubmittalTypes(
          formsTemplateResponse.data.configurationLists[0].configurationValues
        );
      }
    } catch (err: any) {
      console.log(err);
    }
  };

  const mutateSubmittalInfoReviewed = async () => {
    try {
      const submittalResponse: any = await client.mutate({
        mutation: PUBLISH_SUBMITTAL_INFO_REVIEWED,
        variables: {
          id: pathMatch.params.submittalId,
          submittalInfoReviewed: {
            submittalTypes: submittalTypes,
            submittals: dataToPublish,
          },
          status: "REVIEWING_SUBMITTALS",
        },
        context: {
          role: "updateSpecifications",
          token: state?.selectedProjectToken,
        },
      });

      if (submittalResponse?.data) {
        history.push(
          `/specifications/projects/${pathMatch.params.projectId}/library`
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  const mutateSubmittalInfoStatusPublished = async () => {
    try {
      const submittalResponse: any = await client.mutate({
        mutation: PUBLISH_SUBMITTAL_INFO_REVIEWED,
        variables: {
          id: pathMatch.params.submittalId,
          submittalInfoReviewed: {
            submittalTypes: submittalTypes,
            submittals: dataToPublish,
          },
          status: "SUBMITTALS_PUBLISHED",
        },
        context: {
          role: "updateSpecifications",
          token: state?.selectedProjectToken,
        },
      });

      const SUBMITTAL_FEATURE_ID = "8";

      if (submittalResponse?.data) {
        history.push(
          `/base/projects/${pathMatch.params.projectId}/form/${SUBMITTAL_FEATURE_ID}`
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchSpecificationLibraryDetails = async () => {
    try {
      const documentLibraryResponse = await client.query({
        query: FETCH_DOCUMENT_LIBRARY_DATA,
        variables: {
          specificationId: pathMatch.params.submittalId,
        },
        fetchPolicy: "network-only",
        context: {
          role: specificationRoles.viewSpecifications,
          token: state.selectedProjectToken,
        },
      });
      const documentLibraryDetails: any = [];
      if (documentLibraryResponse?.data?.techspecUploadStatus.length > 0) {
        documentLibraryResponse?.data?.techspecUploadStatus.forEach(
          (document: any) => {
            documentLibraryDetails.push(document);
            const headerInfo = { ...fileName, name: document.fileName };
            setFileName(headerInfo);
          }
        );
        SpecificationLibDetailsDispatch(
          setSpecificationLibDetails(
            JSON.parse(JSON.stringify(documentLibraryDetails))
          )
        );
        setSpecSectionDetails(documentLibraryDetails);
        // setShowPdfTron(true)
        // setTimeout(() => {
        //   fetchDownloadUrl();
        // }, 1500);
      }
      // dispatch(setIsLoading(false));
    } catch (error: any) {
      console.log(error);

      // Notification.sendNotification(error, AlertTypes.warn);
      // dispatch(setIsLoading(false));
    }
  };

  const handleType = () => {
    const tempPublishData = [...dataToPublish];

    for (let i = 0; i < tempPublishData.length; i++) {
      for (let j = 0; j < submittalTypes.length; j++) {
        if (tempPublishData[i].submittal_type == submittalTypes[j].nodeName) {
          tempPublishData[i] = {
            ...tempPublishData[i],
            type: submittalTypes[j].id,
          };
        }
      }
    }
    handlePublish(tempPublishData);
  };

  const handlePublish = async (tempData: any) => {
    const tempPublishData: any = [];
    const url = `V1/submittals/create`;

    for (let i = 0; i < tempData.length; i++) {
      if (
        tempData[i].notASubmittal == false &&
        tempData[i].section_name !== ""
      ) {
        tempPublishData.push({
          subject: `${tempData[i].section_number}-${tempData[i].section_name}`,
          divisionNo: tempData[i]?.division_number,
          divisionName: tempData[i]?.division_name,
          sectionNo: tempData[i]?.section_number,
          sectionName: tempData[i]?.section_name,
          description: tempData[i]?.line_text,
          type: tempData[i]?.type,
          specId: tempData[i].specId,
        });
      }
    }

    const data = {
      input: {
        formsData: tempPublishData,
      },
      session_variables: { "x-hasura-role": "createForm" },
      action: {},
    };

    try {
      dispatch(setIsLoading(true));
      const response = await postApiWithProjectExchange(
        url,
        data,
        state?.selectedProjectToken
      );
      if (response) {
        Notification.sendNotification(
          "Successfully published submittals",
          AlertTypes.success
        );

        mutateSubmittalInfoStatusPublished();
      }
    } catch (error: any) {
      dispatch(setIsLoading(false));
      console.log(error);
      Notification.sendNotification(error.message, AlertTypes.error);
      // return error?.response?.data?.message;
    }
  };

  useEffect(() => {
    return () => {
      SpecificationLibDetailsDispatch(setSpecificationLibDetails([]));
    };
  }, []);

  const setPublishSubmittals = (data: any) => {
    for (let i = 0; i < data.length; i++) {
      if (
        data[i].division_name == "" ||
        data[i].submittal_type == "" ||
        data[i].submittal_type == "Others" ||
        data[i].section_number === ""
      ) {
        if (!data[i].notASubmittal) {
          handleDisablePublish(true);
          break;
        }
        handleDisablePublish(false);
      } else {
        handleDisablePublish(false);
      }
    }
    setSubmittalsPublish(data);
  };

  const handleDisablePublish = (value: any) => {
    setDisablePublish(value);
  };

  const handleGoBack = () => {
    history.push(
      `/specifications/projects/${pathMatch.params.projectId}/library`
    );
  };

  return (
    <div className="submittals__View">
      <div className="submittals__parentView">
        <div className="submittals__left">
          <Paper className="submittals__left__header">
            {/* <div className="project-header__navBack">
                       <ArrowBackIosIcon onClick={handleGoBack} />
                  </div>
                    {truncateSpecHeadingString(fileName?.name)} */}

            <SpecificationHeader
              headerInfo={fileName}
              navigate={handleGoBack}
            />
          </Paper>
          {<PdfTron specSectionDetails={specSectionDetails[0]} />}
        </div>
        <Paper className="submittals__right">
          <div className="submittals__left__header">Review Submittals</div>
          <ExtractSubmittalsList
            disablePublish={(value: any) => handleDisablePublish(value)}
            id={pathMatch.params.submittalId}
            publish={(data: any) => setPublishSubmittals(data)}
            submittalTypes={submittalTypes}
            submittalInfoReviewed={submittalInfoReviewed}
          />
          <Paper className="submittals__footer">
            <Button
              onClick={() => mutateSubmittalInfoReviewed()}
              className="btn-primary "
            >
              Save & resume later
            </Button>
            <Button
              disabled={disablePublish}
              onClick={() => handleType()}
              className="btn-primary "
            >
              Publish
            </Button>
          </Paper>
        </Paper>
      </div>
    </div>
  );
}
