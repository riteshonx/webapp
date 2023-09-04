import { Button, Tooltip } from '@material-ui/core';
import AccessAlarmIcon from '@material-ui/icons/AccessAlarm';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import StopIcon from '@material-ui/icons/Stop';
import moment from 'moment';
import React, { ReactElement, useContext, useEffect, useState } from 'react';
import { match, useRouteMatch } from 'react-router-dom';
import {
  decodeExchangeToken,
  decodeProjectExchangeToken,
  decodeToken,
} from '../../../../../../services/authservice';
import { client } from '../../../../../../services/graphql';
import { projectFeatureAllowedRoles } from '../../../../../../utils/role';
import { stateContext } from '../../../../../root/context/authentication/authContext';
import ConfirmDialog from '../../../../../shared/components/ConfirmDialog/ConfirmDialog';
import RightSideNavbar from '../../../../components/RightSideNavbar/RightSideNavbar';
import {
  GET_PULL_PLAN_EVENT,
  UPDATE_ACTIVE_PULL_PLAN_EVENT,
  UPDATE_CLOSED_PULL_PLAN_EVENT,
} from '../../../../graphql/queries/pullPlan';
import { priorityPermissions } from '../../../../permission/scheduling';
import CreatePullPlan from '../../../ProjectPullPlan/CreatePullPlan/CreatePullPlan';
import './PullPlanActions.scss';

export interface Params {
  id: string;
}

let min = 0;
let sec = 0;
let hour = 0;
let interval: any = null;

function PullPlanActions(props: any): ReactElement {
  const { projectMetaData, lookAheadStatus,currentGanttView } = props;
  const [pullPlanDialogOpen, setPullPlanDialogOpen] = useState(false);
  const [createPullPlan, setCreatePullPlan] = useState(false);
  const [startPullPlan, setStartPullPlan] = useState(false);
  const [stopPullPlan, setStopPullPlan] = useState(false);
  const [openPullPlanPanel, setOpenPullPlanPanel] = useState(false);
  const [displayTimer, setDisplayTimer] = useState({
    tSec: '00',
    tMin: '00',
    tHour: '00',
  });
  const { state }: any = useContext(stateContext);
  const [scheduledPullPlanDetail, setScheduledPullPlanDetail] =
    useState<any>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pullPanelStatus, setPullPanelStatus] = useState(false);
  const [baseLineCheck, setbaseLineCheck] = useState(false);
  const pathMatch: match<Params> = useRouteMatch();

  const confirmMessage = {
    header: '',
    text: `All changes made to the plan until now will be saved.
          The tasks which have not been pulled will be lost and cannot be retrieved later. <br/>
          <b>You will not be able to restart this session.</b>`,
    cancel: 'Go Back',
    proceed: 'Yes, Continue',
  };

  const confirmBaseLineMessage = {
    header: '',
    text: `Pull Plan session will take you to the current version. Are you sure you want to continue?`,
    cancel: 'No',
    proceed: 'Yes',
  };

  useEffect(() => {
    if (
      state.selectedProjectToken &&
      state.projectFeaturePermissons?.canviewMasterPlan
    ) {
      if (
        decodeProjectExchangeToken(state.selectedProjectToken).projectId ===
        pathMatch.params.id
      ) {
        getPullPlanEvent();
      }
    }
  }, [state.selectedProjectToken]);

  useEffect(() => {
    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  const onCreatePullPlan = () => {
    setPullPlanDialogOpen(true);
  };

  const onStartPullPlan = () => {
    if(props.currentGanttView == 'baseline') {
      setbaseLineCheck(true);
    } else {
      props.onStartPullPlan();
      updatePullPlanEvent('active');
    }
  };

  const onStopPullPlan = () => {
    setConfirmOpen(true);
  };

  const pullPlanDialogClose = (argType: boolean) => {
    setPullPlanDialogOpen(false);
    if (argType) {
      setCreatePullPlan(false);
      setStartPullPlan(true);
      getPullPlanEvent();
    }
  };

  const startTimer = () => {
    sec = sec + 1;
    if (sec == 60) {
      min = min + 1;
      sec = 0;
    }
    if (min == 60) {
      hour = hour + 1;
      min = 0;
      sec = 0;
    }
    const tempTimer = { ...displayTimer };
    if (sec < 10) {
      tempTimer.tSec = '0' + sec;
    } else {
      tempTimer.tSec = sec.toString();
    }
    if (min < 10) {
      tempTimer.tMin = '0' + min;
    } else {
      tempTimer.tMin = min.toString();
    }
    if (hour < 10) {
      tempTimer.tHour = '0' + hour;
    } else {
      tempTimer.tHour = hour.toString();
    }
    setDisplayTimer(tempTimer);
  };

  const getPullPlanEvent = async () => {
    try {
      const res = await client.query({
        query: GET_PULL_PLAN_EVENT,
        variables: {
          userId: decodeExchangeToken().userId,
        },
        fetchPolicy: 'network-only',
        context: {
          role: priorityPermissions('view'),
          token: state.selectedProjectToken,
        },
      });
      if (res.data.projectPullPlan.length) {
        const participants = [
          ...res.data.projectPullPlan[0].projectPullPlanParticipants,
        ];
        const loggedInParticipant = participants.filter(
          (item: any) => item.userId === decodeToken().userId
        );
        if (loggedInParticipant.length > 0) {
          const data = { ...res.data.projectPullPlan[0] };
          data.eventDate = moment(data.eventDate).toDate();
          setScheduledPullPlanDetail(data);
          setCreatePullPlan(false);
          if (res.data.projectPullPlan[0].status == 'active') {
            setOpenPullPlanPanel(true);
            startActiveTimer(res.data.projectPullPlan[0].startTime);
            setStopPullPlan(true);
            setPullPanelStatus(true);
          } else {
            setStartPullPlan(true);
          }
        } else {
          setCreatePullPlan(true);
          setStopPullPlan(false);
          setStartPullPlan(false);
        }
      } else {
        setCreatePullPlan(true);
        setStopPullPlan(false);
        setStartPullPlan(false);
        setScheduledPullPlanDetail(null);
      }
    } catch (error) {
      /*Notification.sendNotification(
                      error,
                      AlertTypes.error
                  );*/
    }
  };

  const updatePullPlanEvent = async (argStatus: string) => {
    try {
      await client.mutate({
        mutation:
          argStatus == 'active'
            ? UPDATE_ACTIVE_PULL_PLAN_EVENT
            : UPDATE_CLOSED_PULL_PLAN_EVENT,
        variables: {
          status: argStatus,
          time: new Date(),
          id: scheduledPullPlanDetail.id,
        },
        context: {
          role: projectFeatureAllowedRoles.updateMasterPlan,
          token: state.selectedProjectToken,
        },
      });
      setConfirmOpen(false);
      if (argStatus == 'active') {
        setStartPullPlan(false);
        setStopPullPlan(true);
        interval = setInterval(startTimer, 1000);
        setOpenPullPlanPanel(true);
        setPullPanelStatus(true);
      }
      if (argStatus == 'closed') {
        props.onStopPullPlan();
        setStartPullPlan(false);
        setCreatePullPlan(true);
        setStopPullPlan(false);
        setOpenPullPlanPanel(false);
        setPullPanelStatus(false);
        clearInterval(interval);
        min = 0;
        sec = 0;
        hour = 0;
        setDisplayTimer({
          tSec: '00',
          tMin: '00',
          tHour: '00',
        });
        getPullPlanEvent();
      }
    } catch (error: any) {
      console.log(error.message);
    }
  };

  const startActiveTimer = (startTime: any) => {
    const duration = new Date().getTime() - new Date(startTime).getTime();
    sec = Math.floor((duration / 1000) % 60);
    min = Math.floor((duration / (1000 * 60)) % 60);
    hour = Math.floor((duration / (1000 * 60 * 60)) % 24);

    interval = setInterval(startTimer, 1000);
  };

  const closeBaseLineVersionCheck = () => {
    setbaseLineCheck(false);
    props.onStartPullPlan();
    updatePullPlanEvent('active');
  }

  return (
    <React.Fragment>
      <div>
        {state.projectFeaturePermissons?.cancreateMasterPlan &&
        createPullPlan &&
        !lookAheadStatus ? (
          <Tooltip title={'Create Pull Plan'} aria-label="Create Pull Plan">
            <Button
              variant="outlined"
              data-testid={`createPullPlan`}
              size="small"
              className="btn-primary"
              onClick={onCreatePullPlan}
              disabled={props.partialUpdateTasksCount > 0}
            >
              Create Pull Plan Event
            </Button>
          </Tooltip>
        ) : (
          ''
        )}
        {state.projectFeaturePermissons?.cancreateMasterPlan &&
        startPullPlan &&
        !lookAheadStatus
          ? scheduledPullPlanDetail && (
              <div className="pullPlanButton__start">
                <div className="pullPlanButton__start__date">
                  {scheduledPullPlanDetail?.eventDate
                    ? moment(scheduledPullPlanDetail.eventDate).format('DD')
                    : ''}
                </div>
                <div className="pullPlanButton__start__month">
                  {scheduledPullPlanDetail
                    ? moment(scheduledPullPlanDetail.eventDate).format('MMM')
                    : ''}
                </div>
                <Tooltip
                  title={scheduledPullPlanDetail?.eventName}
                  aria-label={scheduledPullPlanDetail?.eventName}
                >
                  <div
                    className="pullPlanButton__start__task"
                    data-testid={`editPullPlan`}
                    onClick={onCreatePullPlan}
                  >
                    {scheduledPullPlanDetail?.eventName.length > 15
                      ? `${scheduledPullPlanDetail?.eventName.slice(0, 15)}...`
                      : scheduledPullPlanDetail?.eventName}
                  </div>
                </Tooltip>
                <Tooltip
                  title={'Start Pull Plan Session'}
                  aria-label="Start Pull Plan Session"
                >
                  <Button
                    className="pullPlanButton__start__button"
                    variant="contained"
                    onClick={onStartPullPlan}
                    data-testid={`startPullPlan`}
                    color="default"
                    size="small"
                    disabled={
                      props.partialUpdateTasksCount > 0 ||
                      (!projectMetaData.is_Editable &&
                        projectMetaData.status === 'draft')
                    }
                    startIcon={<PlayArrowIcon />}
                  >
                    Start
                  </Button>
                </Tooltip>
              </div>
            )
          : ''}

        {state.projectFeaturePermissons?.cancreateComponentPlan &&
        !state.projectFeaturePermissons?.cancreateMasterPlan &&
        startPullPlan &&
        scheduledPullPlanDetail?.eventDate >=
          new Date().setHours(0, 0, 0, 0) ? (
          <div className="pullPlanButton__deadline">
            You have time till
            <span className="pullPlanButton__deadline__date">
              {scheduledPullPlanDetail?.eventDate
                ? moment(scheduledPullPlanDetail.eventDate).format(' DD MMM ')
                : ''}
            </span>
            to submit tasks
          </div>
        ) : (
          ''
        )}

        {!state.projectFeaturePermissons?.cancreateMasterPlan &&
        stopPullPlan ? (
          <div className="pullPlanButton__container">
            <i className="pullPlanButton__label">pull plan in progress</i>
            <div className="pullPlanButton__time">
              <AccessAlarmIcon />
              <div className="pullPlanButton__time__value">
                <b className="pullPlanButton__time__value__timer">
                  {displayTimer.tHour} : {displayTimer.tMin} :{' '}
                  {displayTimer.tSec}{' '}
                </b>{' '}
                seconds
              </div>
            </div>
          </div>
        ) : (
          ''
        )}

        {state.projectFeaturePermissons?.cancreateMasterPlan && stopPullPlan ? (
          <div className="pullPlanButton__stopPullPlan">
            <div className="pullPlanButton__start__date">
              {scheduledPullPlanDetail?.eventDate
                ? moment(scheduledPullPlanDetail.eventDate).format('DD')
                : ''}
            </div>
            <div className="pullPlanButton__start__month">
              {scheduledPullPlanDetail
                ? moment(scheduledPullPlanDetail.eventDate).format('MMM')
                : ''}
            </div>
            <div className="pullPlanButton__start__task">
              {scheduledPullPlanDetail?.eventName}
            </div>
            <Tooltip
              title={'Stop Pull Plan Session'}
              aria-label="Stop Pull Plan Session"
            >
              <Button
                variant="outlined"
                data-testid={`stopPullPlan`}
                size="small"
                className="pullPlanButton__stopPullPlan__btn"
                startIcon={
                  <StopIcon className="pullPlanButton__stopPullPlan__icon" />
                }
                onClick={onStopPullPlan}
              >
                {' '}
                Stop
              </Button>
            </Tooltip>
            <div className="pullPlanButton__stopPullPlan__time">
              {displayTimer.tHour} : {displayTimer.tMin} : {displayTimer.tSec}
            </div>
            seconds
          </div>
        ) : (
          ''
        )}
        {pullPlanDialogOpen ? (
          <CreatePullPlan
            scheduledPullPlanDetail={scheduledPullPlanDetail}
            open={pullPlanDialogOpen}
            close={pullPlanDialogClose}
          />
        ) : (
          ' '
        )}
      </div>
      <RightSideNavbar
        scheduledPullPlanDetail={scheduledPullPlanDetail}
        openPullPlanPanel={openPullPlanPanel}
        pullPanelStatus={pullPanelStatus}
        currentGanttView={currentGanttView}
      />
      {confirmOpen ? (
        <ConfirmDialog
          open={confirmOpen}
          message={confirmMessage}
          close={() => setConfirmOpen(false)}
          proceed={() => updatePullPlanEvent('closed')}
        />
      ) : (
        ''
      )}
      {baseLineCheck ? (
        <ConfirmDialog
          open={baseLineCheck}
          message={confirmBaseLineMessage}
          close={() => setbaseLineCheck(false)}
          proceed={closeBaseLineVersionCheck}
        />
      ) : (
        ''
      )}
    </React.Fragment>
  );
}

export default React.memo(PullPlanActions);
