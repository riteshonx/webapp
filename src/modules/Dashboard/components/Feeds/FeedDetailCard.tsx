import React, { useContext, useEffect, useRef, useState } from "react";
import "../../Styles/index.scss";
import "./FeedDetailCard.scss";
import { Popover } from "../Common";
import { FeedAssociatedTask } from "./feedAssociatedTask";
import { stateContext } from "src/modules/root/context/authentication/authContext";
import { setChatLocation } from "src/modules/root/context/authentication/action";
import { useHistory, useLocation } from "react-router-dom";

export interface IDetails {
  formId: string;
  datasource: string;
  materialId: string;
  dataSourceId: number;
  datasourceMsg: string;
  dataSourceName: string;
  forecastedDelay: number;
  subject: string;
  taskId?: string;
  taskName?: string;
}
interface FormInfo {
  formType: string;
  formId: number;
  subject: string;
}
export const DATA_SOURCE = {
  RFI_FORMS: "RFI",
  BUDGET_CHANGE_ORDER_FORMS: "ChangeOrders",
  ISSUE_FORMS: "Issues",
  QC_CHECKLIST: "Checklist",
  DAILY_LOG: "DailyLogs",
  WEATHER: "Weather",
  VISUALIZE: "Visualize",
  PROCORE_RFI:'PROCORE_RFI',
  PM4_RFI:'PM4_RFI',
  BIM360_RFI:'BIM360_RFI'
};
export const FeedDetailCard = ({ insightDetail, isPopoverOpen=false,setIsPopoverOpen }: { insightDetail: any, isPopoverOpen?:any,setIsPopoverOpen?:any }) => {
  const valueDivRef = useRef<HTMLDivElement>(null);
  const { state, dispatch }: any = useContext(stateContext);
  const [openFeedInsightDetail, setOpenFeedInsightDetail] = useState(false);
  const [updatePopoverCount, setUpdatePopoverCount] = useState(0);
  const [formType, setFormType] = useState("");
  const [formid, setFormId] = useState(0);
  const [isTask, setIsTask] = useState(false);
  const [taskId, setTaskId] = useState("");
  const [formInfo, setFormInfo] = useState<FormInfo>({
    formType: "",
    formId: -1,
    subject: "",
  });
  const [formInfoTemp, setFormInfoTemp] = useState<Array<FormInfo> | null>([
    { formType: "", formId: -1, subject: "" },
  ]);
  const [targetBox, setTargetBox] = useState({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  } as DOMRect);
  const url = useLocation();
  const history = useHistory();

  useEffect(() => {
    if (insightDetail) {
      setFormInfoTemp([]); //clearing previous state to avoid duplicate data
      insightDetail?.details?.map((item: IDetails) => {
        formInfoSetup(item);
      });
    }
  }, [insightDetail]);

  useEffect(() => {
    const bindingList = valueDivRef.current?.querySelectorAll(
      'span[data-insight="true"]'
    );
    bindingList?.forEach((e: Element) => {
      e.addEventListener("click", showPopover);
    });
  }, []);
  useEffect(() => {
    setOpenFeedInsightDetail(false);
  }, [state.bottomMenu?.showNotificationPopup]);
  useEffect(() => {
    const handleOutsideClick = (event: Event) => {
      if (valueDivRef?.current && !valueDivRef?.current?.contains(event.target as Node)) {
        setOpenFeedInsightDetail(false);
      }
    };
    if(isPopoverOpen){
      setOpenFeedInsightDetail(false);
    }
    document.addEventListener("scroll", handleOutsideClick);
    return () => {
      document.removeEventListener("scroll", handleOutsideClick);
    };
  }, [valueDivRef,isPopoverOpen]);

  const formInfoSetup = (item: IDetails) => {
    switch (item?.datasource) {
      case DATA_SOURCE.RFI_FORMS: {
        setFormInfoTemp((prevState: any) => {
          const prevDetails = [...prevState];
          const newFormItem = {
            formType: DATA_SOURCE.RFI_FORMS,
            formId: Number(item?.formId),
            subject: item?.subject,
          };
          prevDetails.push(newFormItem);
          return prevDetails;
        });
        break;
      }
      case DATA_SOURCE.ISSUE_FORMS: {
        setFormInfoTemp((prevState: any) => {
          const prevDetails = [...prevState];
          const newFormItem = {
            formType: DATA_SOURCE.ISSUE_FORMS,
            formId: Number(item?.formId),
            subject: item?.subject,
          };
          prevDetails.push(newFormItem);
          return prevDetails;
        });
        break;
      }
      case DATA_SOURCE.BUDGET_CHANGE_ORDER_FORMS: {
        setFormInfoTemp((prevState: any) => {
          const prevDetails = [...prevState];
          const newFormItem = {
            formType: DATA_SOURCE.BUDGET_CHANGE_ORDER_FORMS,
            formId: Number(item?.formId),
            subject: item?.subject,
          };
          prevDetails.push(newFormItem);
          return prevDetails;
        });
        break;
      }
      case DATA_SOURCE.QC_CHECKLIST: {
        setFormInfoTemp((prevState: any) => {
          const prevDetails = [...prevState];
          const newFormItem = {
            formType: DATA_SOURCE.QC_CHECKLIST,
            formId: Number(item?.formId),
            subject: item?.subject,
          };
          prevDetails.push(newFormItem);
          return prevDetails;
        });
        break;
      }
      case DATA_SOURCE.DAILY_LOG: {
        setFormInfoTemp((prevState: any) => {
          const prevDetails = [...prevState];
          const newFormItem = {
            formType: DATA_SOURCE.DAILY_LOG,
            formId: Number(item?.formId),
            subject: item?.subject,
            taskId: item?.taskId,
            taskName: item?.taskName,
          };
          prevDetails.push(newFormItem);
          return prevDetails;
        });
        break;
      }
      case DATA_SOURCE.VISUALIZE: {
        console.log("item", item);
        setFormInfoTemp((prevState: any) => {
          const prevDetails = [...prevState];
          const newFormItem = {
            formType: DATA_SOURCE.VISUALIZE,
            formId: item?.formId,
            subject: item?.subject,
          };
          prevDetails.push(newFormItem);
          return prevDetails;
        });
        break;
      }
      // todo once we have clickable popover
      // case DATA_SOURCE.WEATHER:{
      //    setFormInfoTemp((prevState: any) => {
      //     const prevDetails = [...prevState];
      //     const newFormItem = {
      //       formType: DATA_SOURCE.WEATHER,
      //       formId: Number(item?.formId),
      //       subject: `${item.subject ? item.subject + '.' : 'weather'} Will lead to total delay of ${item?.forecastedDelay} day(s)`,
      //     };
      //     prevDetails.push(newFormItem);
      //     return prevDetails;
      //   });
      //   break;
      // }
      default:
        return;
    }
  };
 
  const handleLinkClick = (e: any, formDetail: any) => {
    if (formDetail?.formType === "Visualize") {
      if (url.pathname.includes("visualize")) {
        dispatch(setChatLocation(formDetail?.formId));
      } else {
        history.push(
          `/visualize/${state.currentProject?.projectId}/${formDetail?.formId}`
        );
        dispatch(setChatLocation(formDetail?.formId));
      }
    } else {
      setIsTask(false);
      setFormInfo({
        formType: formDetail?.formType,
        formId: formDetail?.formId,
        subject: formDetail?.subject,
      });
      setTaskId(formDetail?.taskId);
      setOpenFeedInsightDetail(!openFeedInsightDetail);
      if(isPopoverOpen){
        setIsPopoverOpen(false)
      }
     
      setTargetBox(e.target.getBoundingClientRect());
    }
  };

  const showPopover = (e: any) => {
    e?.stopPropagation();
    const target = e.target;
    const taskId = target.getAttribute("data-task-id");
    const insightType = target.getAttribute("data-insight-type");
    const formId = target.getAttribute("data-form-id");
    const datasource = target.getAttribute("data-datasource-name");
    const subject = target.innerText;
    const formItem = {
      formType: datasource,
      formId: formId,
      subject: subject,
    } as FormInfo;
    if (taskId) {
      setIsTask(true);
      setTaskId(taskId);
      setFormType(insightType);
      setFormInfo({
        formType: "",
        formId: -1,
        subject: "",
      });
      setTargetBox(e.target.getBoundingClientRect());
      setOpenFeedInsightDetail(!openFeedInsightDetail);
      if(setIsPopoverOpen){
      setIsPopoverOpen(false)
      }
      
    } else {
      setIsTask(false);
      handleLinkClick(e, formItem);
    }
  };


  const isDailyLog = (formDetail: any) =>
    formDetail?.formType === DATA_SOURCE.DAILY_LOG;

  return (
    <div className="v2-feed-detail">
      <div
        ref={valueDivRef}
        className="v2-feed-detail-value"
        dangerouslySetInnerHTML={{
          __html: insightDetail.longMsg,
        }}
      />
      {insightDetail?.details?.length && insightDetail?.details?.length > 0 ? (
        <>
          {insightDetail?.details?.every(
            (item: any) => item.datasource === "ScheduleTask"
          ) ? null : (
            <div className="v2-feed-detail-title">Linked data:</div>
          )}
          <div className="s-flex-column">
            {formInfoTemp?.map((formDetail: any, index: number) => {
              return (
                <>
                  <div key={`${index}- ${formDetail.formId}`}>
                    {isDailyLog(formDetail) && formDetail?.taskId && (
                      <span className="v2-feed-detail-linked-item-key">
                        Daily Log:{" "}
                      </span>
                    )}
                    {!isDailyLog(formDetail) ? (
                      <span
                        className="v2-feed-detail-title-form v2-feed-detail-title"
                        onClick={(e: any) => {
                          handleLinkClick(e, formDetail);
                        }}
                      >
                        {" "}
                        {formDetail?.subject}
                      </span>
                    ) : (
                      <span
                        className="v2-feed-detail-title-form v2-feed-detail-title"
                        onClick={(e: any) => {
                          handleLinkClick(e, formDetail);
                        }}
                      >
                        {" "}
                        {formDetail?.taskName}
                      </span>
                    )}
                  </div>
                </>
              );
            })}
            {/* will be removed once we have clickable popover for weather */}
            {insightDetail?.details?.map((item: any, index: number) => {
              if (item.datasource === DATA_SOURCE.WEATHER) {
                return (
                  <div className="v2-feed-detail-weather" key={index}>
                    Weather:{" "}
                    <span className="v2-feed-detail-weather-subject">
                      {`${
                        item.subject ? item.subject + "." : ""
                      } Will lead to total delay of ${
                        item?.forecastedDelay
                      } day(s).`}
                    </span>
                  </div>
                );
              }
              return;
            })}
          </div>
        </>
      ) : (
        <></>
      )}
      <Popover
        trigger={<></>}
        position="top-right"
        foreignTrigger={true}
        foreignTargetBox={targetBox}
        open={openFeedInsightDetail}
        reRender={updatePopoverCount}
      >
        {openFeedInsightDetail ? (
          <FeedAssociatedTask
            onClose={() => setOpenFeedInsightDetail(false)}
            formType={formInfo.formType}
            formId={formInfo.formId}
            isTask={isTask}
            taskId={taskId}
            onDataLoad={() => setUpdatePopoverCount(updatePopoverCount + 1)}
          />
        ) : (
          <></>
        )}
      </Popover>
    </div>
  );
};
