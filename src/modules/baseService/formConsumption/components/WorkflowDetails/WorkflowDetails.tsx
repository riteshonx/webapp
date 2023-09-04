import React, { ReactElement, useEffect, useState } from "react";
import { Avatar } from "@material-ui/core";
import "./WorkflowDetails.scss";
import AccountTreeIcon from "@material-ui/icons/AccountTree";
import Tooltip from "@material-ui/core/Tooltip";
import moment from "moment";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import { postApi } from "../../../../../services/api";
import GetApp from "@material-ui/icons/GetApp";
import DescriptionIcon from "@material-ui/icons/Description";
import Autolinker from "autolinker";

export default function WorkflowDetails(props: any): ReactElement {
  const [workflowStepsData, setWorkflowStepsData] = useState<Array<any>>([]);
  const [activeStep, setActiveStep] = useState("_step_0");

  useEffect(() => {
    if (props?.workFLowStepsData?.length > 0) {
      workflowStepsArrange(props?.workFLowStepsData);
    }
  }, [props?.workFLowStepsData]);

  const viewWorkFlow = () => {
    props.viewWorkFlow();
  };

  const workflowStepsArrange = (data: any) => {
    const finalData: any = data.sort(
      (a: any, b: any) =>
        new Date(a.assignedOn).getTime() - new Date(b.assignedOn).getTime()
    );
    const targetList = finalData.filter(
      (item: any) => item.updatedAt && item?.comments.length > 0
    );
    const currentActiveStep = finalData.find((item: any) => item.isActiveTask);
    targetList.push(currentActiveStep);
    setActiveStep(currentActiveStep.stepDefName);
    setWorkflowStepsData(targetList);
  };

  const handleDownloadLink = async (file: any) => {
    const temp: any = [];
    temp.push({
      key: file.blobKey,
      fileName: file.fileName,
      expiresIn: 1000,
    });

    try {
      // dispatch(setIsLoading(true));
      const response = await postApi("V1/S3/downloadLink", temp);
      window.open(response.success[0].url, "_parent");
    } catch (error) {
      // Notification.sendNotification(error, AlertTypes.warn);
      // dispatch(setIsLoading(false));
    }
  };
  const signatureStep = (sign: string) => {
    return `<svg style="width:100%;height:30px;">
    <text textAnchor="middle" x="2" y="20" font-size="24" style = "font-family:'Monotype Corsiva';font-style: italic">${sign}</text>
    </svg>`;
  };

  return (
    <div className="workflow-details">
      <div className="workflow-details__label">Workflow Details</div>
      <div className="workflow-details__view-steps">
        <div
          className="workflow-details__view-steps__wrapper"
          onClick={viewWorkFlow}
        >
          <span>
            <AccountTreeIcon />
          </span>
          View upcoming steps
        </div>
      </div>
      <div className="workflow-details__wrapper">
        {workflowStepsData.map((steps: any, index: number) => (
          <div key={`step-${index}`}>
            <div key={`steps-${index}`} className="workflow-details__step">
              <div className="workflow-details__step__label">
                <div> Step: {steps?.workflowTemplateStepDef?.description}</div>
                {steps?.stepDefName === activeStep &&
                  index === workflowStepsData.length - 1 && (
                    <div className="workflow-details__step__label__status">
                      <CheckCircleIcon />
                      <span className="statusName">Current Step</span>
                    </div>
                  )}
              </div>
              {steps?.stepDefName === activeStep &&
              index === workflowStepsData.length - 1 ? (
                ""
              ) : (
                <div className="workflow-details__step__info">
                  <div className="workflow-details__step__assignee">
                    <div className="workflow-details__step__assignee__label">
                      Assignee:
                    </div>
                    <div className="workflow-details__step__assignee__user">
                      {/* replace with chips */}
                      <div className="avater">
                        <Avatar
                          alt={steps?.updatedByUser?.firstName}
                          src="/static/images/avatar/3.jpg"
                        />
                      </div>
                      <div className="userName">
                        {steps?.updatedByUser?.firstName
                          ? `${steps?.updatedByUser?.firstName} ${steps?.updatedByUser?.lastName}`
                          : steps?.updatedByUser?.email}
                      </div>
                    </div>
                  </div>
                  <div className="workflow-details__step__details">
                    <div className="workflow-details__step__details__info">
                      <div className="assignedOn">
                        <span className="assignedOn__label">Assigned On:</span>
                        <span className="assignedOn__value">
                          {moment(steps?.assignedOn)
                            .format("DD MMM YYYY")
                            .toString()}
                        </span>
                      </div>
                      <div className="dueDate">
                        <span className="dueDate__label">Due Date:</span>
                        <span className="dueDate__value">
                          {moment(steps?.dueDate)
                            .format("DD MMM YYYY")
                            .toString()}
                        </span>
                      </div>
                    </div>

                    <div className="workflow-details__step__status">
                      <div className="workflow-details__step__status__label">
                        {steps?.outgoingOutcome}
                      </div>
                      <div className="workflow-details__step__status__time">
                        <span className="label">On:</span>
                        <span className="value">
                          {moment(steps?.updatedAt)
                            .format("DD MMM YYYY")
                            .toString()}
                        </span>
                      </div>
                    </div>
                    <div className="workflow-details__step__signature">
                      <div className="workflow-details__step__signature__label">
                        Signature:{" "}
                      </div>
                      <div className="workflow-details__step__signature__value">
                        <div className="workflow-details__step__signature__sign">
                          {steps?.signature?.value ? (
                            <div
                              dangerouslySetInnerHTML={{
                                __html: signatureStep(steps.signature.value),
                              }}
                            ></div>
                          ) : (
                            <div className="workflow-details__step__signature__empty">
                              --
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="workflow-details__step__comment">
                    <div className="workflow-details__step__comment">
                      <div className="workflow-details__step__comment__label">
                        Comment:{" "}
                      </div>
                      <div className="workflow-details__step__comment__value">
                        <div
                          dangerouslySetInnerHTML={{
                            __html: Autolinker.link(
                              steps?.comments[steps?.comments?.length - 1]
                                ?.comment
                            ),
                          }}
                        >
                          {/* {commentVaue} */}
                        </div>
                      </div>
                    </div>
                  </div>
                  {steps.attachments.length > 0 && (
                    <div className="workflow-details__step__attachments">
                      <div className="workflow-details__step__attachments__label">
                        Attachments:{" "}
                      </div>
                      <div className="workflow-details__step__attachments__value">
                        {steps.attachments.map((file: any) => (
                          <div key={file.blobKey} className="fileDetails">
                            <div className="fileDetails__thumbnail">
                              <DescriptionIcon className="fileDetails__thumbnail__icon" />
                              <span>{file.fileName}</span>
                            </div>
                            <Tooltip
                              title={`${file.fileName}, 
                                            ${(
                                              file.fileSize /
                                              (1024 * 1024)
                                            ).toFixed(3)} MB`}
                              aria-label="first name"
                            >
                              <div
                                onClick={() => handleDownloadLink(file)}
                                className="fileDetails__download"
                              >
                                <GetApp />
                              </div>
                            </Tooltip>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
