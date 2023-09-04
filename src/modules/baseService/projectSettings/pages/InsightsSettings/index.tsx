import React, { useContext, useEffect, useState } from "react";
import {
  IconButton,
  makeStyles,
  Paper,
  TextField,
  Typography,
} from "@material-ui/core";
import { useParams } from "react-router-dom";
import { Button } from "@material-ui/core";
import { Box } from "@mui/system";
import { Tooltip } from "@material-ui/core";

import {
  getScheduleInsightMetaData,
  AddScheduleInsightMetaData,
  UpdateInsights,
} from "./InsightsSettingsActions";
import { setIsLoading } from "src/modules/root/context/authentication/action";
import { stateContext } from "src/modules/root/context/authentication/authContext";
import Notification, {
  AlertTypes,
} from "src/modules/shared/components/Toaster/Toaster";
import { projectDetailsContext } from "src/modules/baseService/projects/Context/ProjectDetailsContext";
import {
  decodeExchangeToken,
  getProjectExchangeToken,
} from "../../../../../services/authservice";
import "./InsightsSettings.scss";
import NoDataMessage from "src/modules/shared/components/NoDataMessage/NoDataMessage";
import TextFieldCustom from "../../components/TextFieldCustom/TextFieldCustom";

interface Params {
  projectId: any;
}


export const noPermissionMessage =
  "You don't have permission to view project insight settings";

const InsightsSettings: React.FC = () => {
  const { projectDetailsState }: any = useContext(projectDetailsContext);
  const { dispatch, stateCont }: any = useContext(stateContext);
  const { projectId } = useParams<Params>();
  const [requiredPermission, setRequiredPermission] = useState<boolean>(false);
  const [isDisabled,setDisabled] = useState<boolean>(true);
  const [userFirstVisit,setUserFirstVisit] = useState<boolean>(false)
  const [updateInsights, setUpdateInsights] = useState<boolean>(false);
  const [leadtimePhysicalConstraints, setLeadtimePhysicalConstraints] =
    useState<any>({ min: 5, max: 10 });
  const [leadtimeMgmntConstraints, setLeadtimeMgmntConstraints] = useState<any>(
    { min: 10, max: 15 }
  );
  const [rFIReviewResponse, setRFIReviewResponse] = useState<any>({
    min: 10,
    max: 10,
  });
  const [changeOrderIssueReview, setChangeOrderIssueReview] = useState<any>({
    min: 15,
    max: 15,
  });

  const [errorMessage, setErrorMessage] = useState<any>({
    leadtimePhysicalConstraintsMinError: null,
    leadtimePhysicalConstraintsMaxError: null,
    leadtimeMgmntConstraintsMinError: null,
    leadtimeMgmntConstraintsMaxError: null,
    changeOrderIssueReviewError: null,
    rFIReviewResponseError: null,
  });
  const tenantId = decodeExchangeToken().tenantId;
useEffect(()=>{
setUserFirstVisit(true)
},[])

useEffect (()=>{
  if(errorMessage.leadtimePhysicalConstraintsMinError ||
    errorMessage.leadtimePhysicalConstraintsMaxError ||
    errorMessage.leadtimeMgmntConstraintsMinError ||
    errorMessage.leadtimeMgmntConstraintsMaxError ||
    errorMessage.changeOrderIssueReviewError ||
    errorMessage.rFIReviewResponseError 
    ){
      setDisabled(true)
    }else{
      setDisabled(false)
    }
},[errorMessage.leadtimePhysicalConstraintsMinError,errorMessage.leadtimePhysicalConstraintsMaxError,
  errorMessage.leadtimeMgmntConstraintsMinError,errorMessage.leadtimeMgmntConstraintsMaxError,
  errorMessage.changeOrderIssueReviewError,errorMessage.rFIReviewResponseError,
  leadtimePhysicalConstraints?.min, leadtimePhysicalConstraints?.max,
  leadtimeMgmntConstraints?.min, leadtimeMgmntConstraints?.max,
  rFIReviewResponse?.min, rFIReviewResponse?.max,
  changeOrderIssueReview?.min, changeOrderIssueReview?.max
 ])

  useEffect(() => {
    setRequiredPermission(
      decodeExchangeToken(projectDetailsState.projectToken).allowedRoles.includes("viewMyProjects")
    );
  }, [projectDetailsState.projectToken]);

  useEffect(() => {
    if (requiredPermission) {
      fetchInsightsData( projectDetailsState.projectToken);
    }

  }, [projectId, tenantId, requiredPermission,projectDetailsState.projectToken]);

  const fetchInsightsData = async (
    token: any
  ) => {
    try {
      dispatch(setIsLoading(true));
      const res = await getScheduleInsightMetaData( token);
      if (res.projectInsightsMetadata.length > 0) {
        setLeadtimePhysicalConstraints(
          res.projectInsightsMetadata[0]?.LeadtimePhysicalConstraints
        );
        setLeadtimeMgmntConstraints(
          res.projectInsightsMetadata[0]?.LeadtimeMgmntConstraints
        );
        setRFIReviewResponse(res.projectInsightsMetadata[0]?.RFIReviewResponse);
        setChangeOrderIssueReview(
          res.projectInsightsMetadata[0]?.ChangeOrderIssueReview
        );
        setUpdateInsights(true);
      }
      dispatch(setIsLoading(false));
    } catch (err) {
      console.log("error in fetching  insights metadata", err);
      Notification.sendNotification(
        "An error occured while fetching insights metadata",
        AlertTypes.warn
      );
      dispatch(setIsLoading(false));
    }
  };


  const handleUpdate = async (
    e: any,
    leadtimePhysicalConstraints: any,
    leadtimeMgmntConstraints: any,
    rFIReviewResponse: any,
    changeOrderIssueReview: any
  ) => {
    const token = projectDetailsState.projectToken;
    try {
      dispatch(setIsLoading(true));
      if (updateInsights) {
        const response = await UpdateInsights(
          token,
          leadtimePhysicalConstraints,
          leadtimeMgmntConstraints,
          rFIReviewResponse,
          changeOrderIssueReview
        );
      } else {
        const response = await AddScheduleInsightMetaData(
          token,
          leadtimePhysicalConstraints,
          leadtimeMgmntConstraints,
          rFIReviewResponse,
          changeOrderIssueReview
        );
      }

      Notification.sendNotification(
        "Successfully updated insights",
        AlertTypes.success
      );
      dispatch(setIsLoading(false));
      setDisabled(true)
    } catch (err) {
      dispatch(setIsLoading(false));
      Notification.sendNotification(err, AlertTypes.warn);
      console.log(err);
    }finally{
      await  fetchInsightsData( projectDetailsState.projectToken);
      dispatch(setIsLoading(false));
    }
  };

  const handleChangeOrderIssueReview = (e: any) => {
    if (e.target.value.trim() > 100 || e.target.value.trim() < 1) {
      setErrorMessage({
        ...errorMessage,
        changeOrderIssueReviewError: "Entered value must be between 1 and 100",
      });
      setChangeOrderIssueReview({ min: "", max: "" });
    } else {
      setErrorMessage({
        ...errorMessage,
        changeOrderIssueReviewError: null,
      });
      setChangeOrderIssueReview({
        min: Number(e.target.value),
        max: Number(e.target.value),
      });
      setUserFirstVisit(false)
    }
  };
  const handleRfiOnchange = (e: any) => {
    if (e.target.value.trim() > 100 || e.target.value.trim() < 1) {
      setErrorMessage({
        ...errorMessage,
        rFIReviewResponseError: "Entered value must be between 1 and 100",
      });
      setRFIReviewResponse({ min: "", max: "" });
    } else {
      setRFIReviewResponse({
        min: Number(e.target.value),
        max: Number(e.target.value),
      });
      setErrorMessage({
        ...errorMessage,
        rFIReviewResponseError: null,
      });
      setUserFirstVisit(false)
    }
  };
  const handleMgmntConstraintsOnchange = (e: any) => {
    switch (e.target.name) {
      case 'min': {
        if(e.target.value.trim()>100 ||e.target.value.trim() < 1 ){
          setErrorMessage({
            ...errorMessage,
            leadtimeMgmntConstraintsMinError: "Entered value must be between 1 and 100",
          });
          setLeadtimeMgmntConstraints((prevState:any)=>({...prevState, min:''}))
        }else if(leadtimeMgmntConstraints?.max && e.target.value>Number(leadtimeMgmntConstraints?.max)){
          setErrorMessage({
            ...errorMessage,
            leadtimeMgmntConstraintsMaxError: `Entered value must be greater than or equals to ${e.target.value}`,
          });
          setLeadtimeMgmntConstraints((prevState:any)=>({...prevState, min:Number(e.target.value)}));
        }
        else if( leadtimeMgmntConstraints?.max && e.target.value<=Number(leadtimeMgmntConstraints?.max)){
          setErrorMessage({
            ...errorMessage,
            leadtimeMgmntConstraintsMaxError: null,
            leadtimeMgmntConstraintsMinError: null
          });
          setLeadtimeMgmntConstraints((prevState:any)=>({...prevState, min:Number(e.target.value)}));
          setUserFirstVisit(false)
        }
        else{
          setErrorMessage({ ...errorMessage, leadtimeMgmntConstraintsMinError: null });
          setLeadtimeMgmntConstraints((prevState:any)=>({...prevState, min:Number(e.target.value)}))
        }
  
        break;
      }
      case 'max': {
        if(e.target.value.trim()>100 ||e.target.value.trim() < 1 ){
          setLeadtimeMgmntConstraints((prevState:any)=>({...prevState, max:''}))
        }else if(leadtimeMgmntConstraints?.min && e.target.value<leadtimeMgmntConstraints?.min){
          setErrorMessage({
            ...errorMessage,
            leadtimeMgmntConstraintsMaxError: `Entered value must be greater than or equals to ${leadtimeMgmntConstraints?.min}`,
          });
          setLeadtimeMgmntConstraints((prevState:any)=>({...prevState, max:Number(e.target.value)}));
        }else if(e.target.value>=Number(leadtimeMgmntConstraints?.min)){
          setErrorMessage({
            ...errorMessage,
            leadtimeMgmntConstraintsMaxError: null,
          });
          setLeadtimeMgmntConstraints((prevState:any)=>({...prevState, max:Number(e.target.value)}));
          setUserFirstVisit(false);
        }
        else{
          setErrorMessage({ ...errorMessage, leadtimeMgmntConstraintsMaxError: null });
          setLeadtimeMgmntConstraints((prevState:any)=>({...prevState, max:Number(e.target.value)}))
        }
        break;
      }
      default: {
      }
    }
  };
  const handlePhysicalConstraintsOnchange = (e: any) => {
    switch (e.target.name) {
      case 'min': {
        if(e.target.value.trim()>100 ||e.target.value.trim() < 1 ){
          setErrorMessage({
            ...errorMessage,
            leadtimePhysicalConstraintsMinError: "Entered value must be between 1 and 100",
          });
          setLeadtimePhysicalConstraints((prevState:any)=>({...prevState, min:''}));
        }
        else if(leadtimePhysicalConstraints?.max && e.target.value>Number(leadtimePhysicalConstraints?.max)){
          setErrorMessage({
            ...errorMessage,
            leadtimePhysicalConstraintsMaxError: `Entered value must be greater than or equals to ${e.target.value}`,
          });
          setLeadtimePhysicalConstraints((prevState:any)=>({...prevState, min:Number(e.target.value)}));
        }  else if(e.target.value<=Number(leadtimePhysicalConstraints?.max)){
          setErrorMessage({
            ...errorMessage,
            leadtimePhysicalConstraintsMaxError: null,
            leadtimePhysicalConstraintsMinError: null
          });
          setLeadtimePhysicalConstraints((prevState:any)=>({...prevState, min:Number(e.target.value)}));
          setUserFirstVisit(false)
        }
        else{
          setErrorMessage({ ...errorMessage, leadtimePhysicalConstraintsMinError: null });
          setLeadtimePhysicalConstraints((prevState:any)=>({...prevState, min:Number(e.target.value)}));
        }
  
        break;
      }
      case 'max': {
        if(e.target.value.trim()>100 ||e.target.value.trim() < 1 ){
          setLeadtimePhysicalConstraints((prevState:any)=>({...prevState, max:''}))
        }else if(e.target.value<leadtimePhysicalConstraints?.min){
          setErrorMessage({
            ...errorMessage,
            leadtimePhysicalConstraintsMaxError: `Entered value must be greater than or equals to ${leadtimePhysicalConstraints?.min}`,
          });
          setLeadtimePhysicalConstraints((prevState:any)=>({...prevState, max:Number(e.target.value)}));
        }else if(e.target.value>=Number(leadtimePhysicalConstraints?.min)){
          setErrorMessage({
            ...errorMessage,
            leadtimePhysicalConstraintsMaxError: null,
          });
          setLeadtimePhysicalConstraints((prevState:any)=>({...prevState, max:Number(e.target.value)}));
          setUserFirstVisit(false)
        }
        else{
          setErrorMessage({ ...errorMessage, leadtimePhysicalConstraintsMaxError: null });
          setLeadtimePhysicalConstraints((prevState:any)=>({...prevState, max:Number(e.target.value)}));
        }
        break;
      }
      default: {
      }
    }

  };

  const handleCancel = (e: any) => {
    setLeadtimePhysicalConstraints({ min: '', max: '' });
    setLeadtimeMgmntConstraints({ min: '', max: '' });
    setRFIReviewResponse({ min: '', max: '' });
    setChangeOrderIssueReview({min: '', max: '' });
  };

  const onKeyDown = (e: any) => {
    if (e.charCode === 45) {
      e.preventDefault();
      return false;
    }
    try {
      if (e.charCode === 101 || e.charCode === 46 || e.charCode === 43) {
        e.preventDefault();
        return false;
      }
    } catch (e) { }
  };

  return (
    <>
      {requiredPermission ? (
        <div className="InsightsSettings">
          <>
            <div className="InsightsSettings__header">
              <Typography component="p">Insights Settings</Typography>
            </div>
            <div className="InsightsSettings__input_area">
              <div className="InsightsSettings__input_area__labels">
                {/* <div className="InsightsSettings__input_area__labels_min">
                  In Days
                </div> */}
              </div>
              <div className="InsightsSettings__individual_box">
                <Typography component="p">
                How long, on average, do you anticipate a change order to take from creation to approval?
                </Typography>
                <div className="InsightsSettings__constraints__single_input">
                  <TextFieldCustom
                    label="In Days"
                    name="min"
                    type="number"
                    className="InsightsSettings__constraints__single_input__style order-error-msg"
                    value={changeOrderIssueReview?.min}
                    placeholder="Enter the value in Days"
                    onChange={(e: any) => {
                      handleChangeOrderIssueReview(e);
                    }}
                    onKeyDown={onKeyDown}
                    error={errorMessage.changeOrderIssueReviewError}
                    disabled={!projectDetailsState?.projectPermission.canUpdateMyProject}
                  />
                </div>
              </div>
              <div className="InsightsSettings__individual_box">
                <Typography component="p">
                  What is the average (or typical) RFI design response period
                  for this project?
                </Typography>
                <div className="InsightsSettings__constraints__single_input">
                  <TextFieldCustom
                    label="In Days"
                    name="min"
                    type="number"
                    className="InsightsSettings__constraints__single_input__style rfi-error-msg"
                    value={rFIReviewResponse?.min}
                    placeholder="Enter the value in Days"
                    onChange={(e: any) => {
                      handleRfiOnchange(e);
                    }}
                    onKeyDown={onKeyDown}
                    error={errorMessage.rFIReviewResponseError}
                    disabled={!projectDetailsState?.projectPermission.canUpdateMyProject}
                  />
                </div>
              </div>

              <div className="InsightsSettings__individual_box">
                <Typography component="p">
                  How far ahead of an activity start does the team review and
                  resolve physical or site constraints ?
                </Typography>
                <div className="InsightsSettings__constraints">
                  <div className="InsightsSettings__constraints__multi_input">
                    <TextFieldCustom
                      label="Min Days"
                      name="min"
                      type="number"
                      className="InsightsSettings__constraints__style physical-min-day-error"
                      value={leadtimePhysicalConstraints?.min}
                      placeholder="min"
                      onChange={(e: any) => {
                        handlePhysicalConstraintsOnchange(e);
                      }}
                      onKeyDown={onKeyDown}
                      error={errorMessage.leadtimePhysicalConstraintsMinError}
                      disabled={!projectDetailsState?.projectPermission.canUpdateMyProject}
                    />
                  </div>
                  <div className="InsightsSettings__constraints__multi_input">
                    <TextFieldCustom
                      label="Max Days"
                      name="max"
                      type="number"
                      className="InsightsSettings__constraints__style physical-max-day-error"
                      value={leadtimePhysicalConstraints?.max}
                      placeholder="max"
                      onChange={(e: any) => {
                        handlePhysicalConstraintsOnchange(e);
                      }}
                      onKeyDown={onKeyDown}
                      error={errorMessage.leadtimePhysicalConstraintsMaxError}
                      disabled={!projectDetailsState?.projectPermission.canUpdateMyProject}
                    />
                  </div>
                </div>
              </div>
              <div className="InsightsSettings__individual_box">
                <Typography component="p">
                  How far ahead of an activity start does the team review and
                  resolve management or informational constraints?
                </Typography>
                <div className="InsightsSettings__constraints">
                  <div className="InsightsSettings__constraints__multi_input">
                    <TextFieldCustom
                      label="Min Days"
                      name="min"
                      type="number"
                      className="InsightsSettings__constraints__style mgmt-min-day-error"
                      value={leadtimeMgmntConstraints?.min}
                      placeholder="min"
                      onChange={(e: any) => {
                        handleMgmntConstraintsOnchange(e);
                      }}
                      onKeyDown={onKeyDown}
                      error={errorMessage.leadtimeMgmntConstraintsMinError}
                      disabled={!projectDetailsState?.projectPermission.canUpdateMyProject}
                    />
                  </div>
                  <div className="InsightsSettings__constraints__multi_input">
                    <TextFieldCustom
                      label="Max Days"
                      name="max"
                      type="number"
                      className="InsightsSettings__constraints__style mgmt-max-day-error"
                      value={leadtimeMgmntConstraints?.max}
                      placeholder="max"
                      onChange={(e: any) => {
                        handleMgmntConstraintsOnchange(e);
                      }}
                      onKeyDown={onKeyDown}
                      error={errorMessage.leadtimeMgmntConstraintsMaxError}
                      disabled={!projectDetailsState?.projectPermission.canUpdateMyProject}
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
          <div className="InsightsSettings__action-button">
            <Button
              variant="outlined"
              onClick={handleCancel}
              className="cancel-button"
              disabled={isDisabled ||userFirstVisit ||!projectDetailsState?.projectPermission.canUpdateMyProject}
            >
              Cancel
            </Button>
            <Button
              variant="outlined"
              className={
                "update-button btn-primary"
              }
              onClick={(e: any) => {
                handleUpdate(
                  e,
                  leadtimePhysicalConstraints,
                  leadtimeMgmntConstraints,
                  rFIReviewResponse,
                  changeOrderIssueReview
                );
              }}
              disabled={isDisabled||
                        !projectDetailsState?.projectPermission.canUpdateMyProject||
                        userFirstVisit||
                        !leadtimePhysicalConstraints?.min|| 
                        !leadtimePhysicalConstraints?.max||
                        !leadtimeMgmntConstraints?.min||
                        !leadtimeMgmntConstraints?.max
                      }
            >
              Update
            </Button>
          </div>
        </div>
      ) : (
        <div className="noCreatePermission-insight">
          <div className="no-permission-insight">
            <NoDataMessage message={noPermissionMessage} />
          </div>
        </div>
      )}
    </>
  );
};
export default InsightsSettings;