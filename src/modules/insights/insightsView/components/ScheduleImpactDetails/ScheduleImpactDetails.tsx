import React, { ReactElement, useContext, useState } from "react";
import './ScheduleImpactDetails.scss'
import { IInsightsContext, ScheduleImpactMsgs } from "src/modules/insights/models/insights";
import { insightsContext } from "src/modules/insights/context/insightsContext";
import { Button } from "@material-ui/core";
import { decodeExchangeToken, getExchangeToken } from "src/services/authservice";
import { stateContext } from "src/modules/root/context/authentication/authContext";
import axios from "axios";
import { setPreference } from "src/modules/root/context/authentication/action";
import InsightSendMail from "../InsightSendMail/InsightSendMail";
import ConfirmDialog from "src/modules/shared/components/ConfirmDialog/ConfirmDialog";
import { setIsLoading } from '../../../../root/context/authentication/action';
import Notification, { AlertTypes } from "../../../../shared/components/Toaster/Toaster";


const DASHBOARD_URL: any = process.env["REACT_APP_DASHBOARD_URL"];

export default function ScheduleImpactDetails(props: any): ReactElement {
  const { insightsState } = useContext(insightsContext) as IInsightsContext
  const { state, dispatch }: any = useContext(stateContext);
  const [ mailModal, setMailModal ] = useState(false)
  const [ ignoreConfirmModal, setIgnoreConfirmModal ] = useState(false)



  const savePreference = async (data: any) => {
    dispatch(setIsLoading(true))
    const payload = {
      tenantId: Number(decodeExchangeToken().tenantId),
      userId: decodeExchangeToken().userId,
      preferencesJson: { ...state?.selectedPreference, insights_archives: data },
    };
    const token = getExchangeToken();
    try {
      const response = await axios.post(
        `${DASHBOARD_URL}dashboard/savePreferences`,
        payload,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      dispatch(setPreference({...state?.selectedPreference, insights_archives: data}))
      props.setIgnored(data)
      dispatch(setIsLoading(false))
      Notification.sendNotification('The Insight will be ignored temporarily!', AlertTypes.success)
    } catch (error) {
      console.log(error);
      dispatch(setIsLoading(false))
    }
  };

  const ignoreInsightByTask = () => {
    const taskId = insightsState.detailScheduleImpact.taskId
    const insights_archives = JSON.parse(JSON.stringify(state?.selectedPreference?.insights_archives || []))
    insights_archives.push(taskId)
    savePreference(insights_archives)
  }

  const ignoreInsightByMsg = (scheduleMsg: ScheduleImpactMsgs) => {
    const insights_archives = JSON.parse(JSON.stringify(state?.selectedPreference?.insights_archives || []))
    const taskId = insightsState.detailScheduleImpact.taskId
    insights_archives.push(scheduleMsg.impactId)
    if (insightsState.detailScheduleImpact.msgs.length === 1) {
      insights_archives.push(taskId)
    }
    savePreference(insights_archives)
  }

  return <div className="schedule-impact-detail" >
    <div className="schedule-impact-detail_nav">
      <h3>{insightsState.detailScheduleImpact.taskName}</h3>
      <div>
        <Button
          size="small"
          variant="contained"
          className="schedule-impact-detail_nav-btn"
          onClick={() => setIgnoreConfirmModal(true)}
        >
          IGNORE
        </Button>
        <Button
          size="small"
          variant="contained"
          className="schedule-impact-detail_nav-btn"
          onClick={() => {setMailModal(true)}}
        >
          SHARE INSIGHT
        </Button>
      </div>
    </div>
    <div className="schedule-impact-detail_container">
      {
        insightsState
          .detailScheduleImpact
          .msgs
          .map((ScheduleMsg: ScheduleImpactMsgs, index: number) => {
            const msgUi = React.createRef()
            msgUi.current
            return <div
              key={'ScheduleImpactMsgs-' + index}
              className={'schedule-impact-detail_container_task priority-' + ScheduleMsg.priority}
            >
              <div dangerouslySetInnerHTML={{ __html: ScheduleMsg.msg }}></div>
              <button data-testid = "ignore-insight" onClick={() => ignoreInsightByMsg(ScheduleMsg)} >IGNORE</button>
            </div>
          })
      }
    </div>
    <ConfirmDialog open={ignoreConfirmModal} message={{
            text: `Are you sure you want to ignore all insights for ${insightsState.detailScheduleImpact.taskName}?`,
            cancel: 'Cancel',
            proceed: 'Accept',
        }}
            close={() => setIgnoreConfirmModal(false)} proceed={() => {
              setIgnoreConfirmModal(false)
              ignoreInsightByTask()
            }} />
    {mailModal ? <InsightSendMail
      onClose={() => {setMailModal(false)}}
      detailScheduleImpact={insightsState.detailScheduleImpact}
      shareAll={false}
      scheduleImpactList={[]}
    /> : <></>}
  </div>
}