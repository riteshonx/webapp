import {
  Fade,
  IconButton,
  Modal,
  Popper,
  createStyles,
  makeStyles,
} from "@material-ui/core";
import Paper from "@mui/material/Paper";
import moment from "moment";
import React, {
  ReactElement,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  ArrowBackIosRounded,
  ArrowForwardIosRounded,
  Cancel,
  Flag as FlagIcon,
} from "@material-ui/icons";
import "./HorizontalTimeline.scss";
import { client } from "src/services/graphql";
import { Task } from "src/modules/Dashboard/components/Feeds/forms/task";
import { stateContext } from "src/modules/root/context/authentication/authContext";
import { GET_PROJECT_MILESTONE } from "src/modules/Dashboard/graphql/queries/dashboard";
import { useHistory } from "react-router-dom";
import { ClickAwayListener } from "@mui/material";

interface HorizontalTimelineProps {
  startDate: any;
  uploadDates: Array<any>;
}

const useStyles = makeStyles(() =>
  createStyles({
    modal: {
      minWidth: "50%",
      minHeight: "42%",
      maxWidth: "50%",
      maxHeight: "42%",
      background: "#171d25",
      top: "26% !important",
      margin: "0 auto",
    },
  })
);

function HorizontalTimeline({
  startDate,
  uploadDates,
}: HorizontalTimelineProps): ReactElement {
  const classes: any = useStyles();
  const { state }: any = useContext(stateContext);
  const [listOfDates, setListOfDates]: any = useState([]);
  const [listOfMilestoneDates, setListOfMilestoneDates]: any = useState([]);
  const [selectedMilestone, setSelectedMilestone]: any = useState({});
  const [listData, setListData]: any = useState([]);
  const scrollRef = useRef<HTMLInputElement>(null);
  const fieldRef = useRef<HTMLInputElement>(null);
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null
  );
  const [open, setOpen] = React.useState(false);
  const [openTaskPopup, setOpenTaskPopup] = React.useState(false);
  const [showProjectInfo, setShowProjectInfo]: any = useState(false);
  const history = useHistory();

  useEffect(() => {
    fieldRef?.current &&
      fieldRef.current.scrollIntoView({
        behavior: "auto",
      });
  }, [listOfDates, fieldRef?.current]);

  useEffect(() => {
    state?.selectedProjectToken &&
      state?.currentProject?.projectId &&
      getProjectMilestone();
  }, [state?.selectedProjectToken, state?.currentProject]);

  useEffect(() => {
    const getDaysBetweenDates = function (startDate: any, endDate: any) {
      const now = startDate.clone();
      const dates = [];
      while (now.isSameOrBefore(endDate)) {
        dates.push(now.format("DD/MMM/YYYY ddd"));
        now.add(1, "days");
      }
      return dates;
    };
    const endDate: any = moment();
    const dateList = getDaysBetweenDates(
      moment(state?.projectInfo?.plannedStartDate),
      state?.projectInfo?.plannedEndDate
    );
    setListOfDates(dateList);
  }, []);

  const getProjectMilestone = async () => {
    const response = await client.query({
      query: GET_PROJECT_MILESTONE,
      variables: {
        id: state?.currentProject?.projectId,
      },
      fetchPolicy: "network-only",
      context: {
        role: "viewMasterPlan",
        token: state?.selectedProjectToken,
      },
    });

    if (response?.data?.projectTask?.length) {
      const temp = response?.data?.projectTask?.map((task: any) => {
        return {
          ...task,
          actualStartDate: task?.actualStartDate
            ? moment(task?.actualStartDate).format("DD/MMM/YYYY ddd")
            : task?.actualStartDate,
          plannedStartDate: moment(task?.plannedStartDate).format(
            "DD/MMM/YYYY ddd"
          ),
        };
      });
      setListOfMilestoneDates(temp);
    }
  };

  const handleScroll = (scrollType: any) => {
    if (scrollRef?.current) {
      scrollRef?.current.scrollTo(
        scrollRef?.current?.scrollLeft + scrollType,
        0
      );
    }
  };

  const closeModal = () => {
    setOpenTaskPopup(false);
  };

  const openTaskModal = (e: any, data: any) => {
    e.stopPropagation();
    setSelectedMilestone(data);
    setOpenTaskPopup(true);
  };

  const checkMilestoneSize = (
    date: any
  ) => {
    const milestone = listOfMilestoneDates?.filter(
      ({ plannedStartDate }: any) => plannedStartDate === date
    );
    // setListData(milestone);
    return milestone?.length
  };
  const handleMouseEnter = (
    event: React.MouseEvent<HTMLButtonElement>,
    date: any
  ) => {
    const milestone = listOfMilestoneDates?.filter(
      ({ plannedStartDate }: any) => plannedStartDate === date
    );
    setShowProjectInfo(false);
    setListData(milestone);
    setAnchorEl(event.currentTarget);
    setOpen(true);
  };

  const handleShowProjectInfo = (
    event: React.MouseEvent<HTMLButtonElement>,
    isStart: any
  ) => {
    setShowProjectInfo(true);
    setListData([
      {
        isStart: isStart,
        [isStart ? "plannedStartDate" : "plannedEndDate"]: isStart
          ? state?.projectInfo?.plannedStartDate
          : state?.projectInfo?.plannedEndDate,
        [isStart ? "actualStartDate" : "actualEndDate"]: isStart
          ? state?.projectInfo?.contractualStartDate
          : state?.projectInfo?.contractualEndDate,
        name: state?.projectInfo?.projectName,
      },
    ]);
    setAnchorEl(event.currentTarget);
    setOpen(true);
  };

  const checkTaskType = (date: any, type: any) => {
    const milestones = listOfMilestoneDates?.filter(
      ({ plannedStartDate }: any) => plannedStartDate === date
    );
    const isExist = milestones.some(({ taskType }: any) => taskType === type);
    return isExist;
  };

  const compareDates = (date: any) => {
    const milestone = listOfMilestoneDates?.filter(
      ({ plannedStartDate, taskType }: any) =>
        plannedStartDate === date && taskType === "wbs"
    );
    if (milestone[0]?.actualStartDate === null) {
      return "";
    } else if (
      moment(
        moment(milestone[0]?.actualStartDate, "DD/MMM/YYYY").format(
          "DD-MM-YYYY"
        ),
        "DD-MM-YYYY"
      ).isSameOrBefore(
        moment(
          moment(milestone[0]?.plannedStartDate, "DD/MMM/YYYY").format(
            "DD-MM-YYYY"
          ),
          "DD-MM-YYYY"
        )
      )
    ) {
      return "1";
    } else {
      return "2";
    }
  };

  const closePopper = () => {
    setAnchorEl(null);
    setOpen(false);
  };

  return (
    <div className="horizontalTimeline-main">
      <Modal
        open={openTaskPopup}
        onClose={closeModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        className={classes.modal}
      >
        <Task
          taskId={selectedMilestone?.id}
          onClose={closeModal}
          onDataLoad={() => console.log("loading")}
        />
      </Modal>
      <Popper
        open={open}
        anchorEl={anchorEl}
        placement={"top"}
        transition
        className="horizontalTimeline-main__popperStyle"
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={350}>
            <ClickAwayListener onClickAway={closePopper}>
              <div className="horizontalTimeline-main__popperDiv">
                {showProjectInfo
                  ? listData?.map((milestone: any, index: number) => (
                    <div
                      key={index}
                      className="horizontalTimeline-main__popperDiv__row"
                    >
                      Project Name :{" "}
                      <span className="horizontalTimeline-main__popperDiv__row__val">
                        {milestone?.name}
                      </span>
                      <br />
                      {milestone?.isStart ? (
                        <>
                          Planned Start Date :{" "}
                          <span className="horizontalTimeline-main__popperDiv__row__val">
                            {milestone?.plannedStartDate
                              ? moment(
                                milestone?.plannedStartDate,
                                "DD/MMM/YYYY"
                              ).format("DD MMM YYYY")
                              : "-"}
                          </span>
                          <br />
                          Contractual Start Date :{" "}
                          <span className="horizontalTimeline-main__popperDiv__row__val">
                            {milestone?.actualStartDate
                              ? moment(
                                milestone?.actualStartDate,
                                "DD/MMM/YYYY"
                              ).format("DD MMM YYYY")
                              : "-"}
                          </span>
                        </>
                      ) : (
                        <>
                          Planned End Date :{" "}
                          <span className="horizontalTimeline-main__popperDiv__row__val">
                            {milestone?.plannedEndDate
                              ? moment(
                                milestone?.plannedEndDate,
                                "DD/MMM/YYYY"
                              ).format("DD MMM YYYY")
                              : "-"}
                          </span>
                          <br />
                          Contractual End Date :{" "}
                          <span className="horizontalTimeline-main__popperDiv__row__val">
                            {milestone?.actualEndDate
                              ? moment(
                                milestone?.actualEndDate,
                                "DD/MMM/YYYY"
                              ).format("DD MMM YYYY")
                              : "-"}
                          </span>
                        </>
                      )}
                    </div>
                  ))
                  : listData?.map((milestone: any, index: number) => (
                    <div
                      key={index}
                      className="horizontalTimeline-main__popperDiv__row"
                    >
                      {milestone?.taskType === "wbs" ? "WBS" : "Milestone"} :{" "}
                      <span
                        className="horizontalTimeline-main__popperDiv__row__taskName"
                        onClick={(e) => openTaskModal(e, milestone)}
                      >
                        {milestone?.taskName}
                      </span>
                      <br />
                      {milestone?.taskType === "wbs"
                        ? "WBS Planned Start"
                        : "Milestone"}{" "}
                      Date :{" "}
                      <span className="horizontalTimeline-main__popperDiv__row__val">
                        {milestone?.plannedStartDate
                          ? moment(
                            milestone?.plannedStartDate,
                            "DD/MMM/YYYY"
                          ).format("DD MMM YYYY")
                          : "-"}
                      </span>
                      {milestone?.taskType === "wbs" && (
                        <>
                          <br />
                          WBS Actual Start Date :{" "}
                          <span className="horizontalTimeline-main__popperDiv__row__val">
                            {milestone?.actualStartDate
                              ? moment(
                                milestone?.actualStartDate,
                                "DD/MMM/YYYY"
                              ).format("DD MMM YYYY")
                              : "-"}
                          </span>
                        </>
                      )}
                    </div>
                  ))}

                {/* <Cancel
                onClick={() => {
                  setAnchorEl(null);
                  setOpen(false);
                }}
                htmlColor="grey"
                className="horizontalTimeline-main__popperDiv__closeIcon"
              /> */}
              </div>
            </ClickAwayListener>
          </Fade>
        )}
      </Popper>
      <IconButton
        className="horizontalTimeline-main__iconButton"
        onClick={() => handleScroll(-(window.innerWidth * 0.7))}
        onMouseEnter={(e: any) => handleShowProjectInfo(e, true)}
      >
        <ArrowBackIosRounded
          htmlColor="#fe9a0b"
          className="horizontalTimeline-main__iconButton__icon"
        />
      </IconButton>
      <div ref={scrollRef} className="horizontalTimeline-main__scrollContainer">
        {listOfDates.map((date: any, i: number) => (
          <div
            id={date}
            key={i}
            className="horizontalTimeline-main__scrollContainer__dateList"
            ref={
              date.includes(moment().format("DD/MMM/YYYY")) ? fieldRef : null
            }
          >
            {listOfMilestoneDates
              ?.map(({ plannedStartDate }: any) => plannedStartDate)
              .includes(date) && (
                <div
                  className="horizontalTimeline-main__scrollContainer__dateList__dateContainer"
                  onMouseEnter={(e: any) => {
                    if (
                      listOfMilestoneDates
                        ?.map(({ plannedStartDate }: any) => plannedStartDate)
                        .includes(date)
                    )
                      handleMouseEnter(e, date);
                    else return;
                  }}
                  onClick={(e) => openTaskModal(e, listOfMilestoneDates[0])}
                >
                  {checkTaskType(date, "milestone") && (
                    <FlagIcon
                      htmlColor="#f7b047"
                      className="horizontalTimeline-main__scrollContainer__dateList__dateContainer__flag"
                    />
                  )}
                  <div
                    className={`${listOfMilestoneDates?.map(({ plannedStartDate }: any) => plannedStartDate)
                      .includes(date) && checkTaskType(date, "wbs")
                      // eslint-disable-next-line max-len
                      ? `horizontalTimeline-main__scrollContainer__dateList__dateContainer__${checkMilestoneSize(date) > 8 ? 'dot2' : checkMilestoneSize(date) > 3 ? 'dot1' : 'dot'}
                         horizontalTimeline-main__scrollContainer__dateList__dateContainer__activeDot
                        ${compareDates(date)}`
                      : ''
                      }`}
                  >
                    {/* Debugging */}
                    {console.log('checkMilestoneSize', checkMilestoneSize(date))}
                  </div>


                  <div className="horizontalTimeline-main__scrollContainer__dateList__dateContainer__date">
                    {moment(date.split(" ")[0]).format("DD MMM YY")}
                  </div>
                </div>
              )}
            <div className="horizontalTimeline-main__scrollContainer__dateList__hiddenDot"></div>
          </div>
        ))}
      </div>
      <IconButton
        className="horizontalTimeline-main__iconButton"
        onClick={() => {
          handleScroll(window.innerWidth * 0.7);
        }}
        onMouseEnter={(e: any) => handleShowProjectInfo(e, false)}
      >
        <ArrowForwardIosRounded
          htmlColor="#fe9a0b"
          className="horizontalTimeline-main__iconButton__icon"
        />
      </IconButton>
    </div>
  );
}

export default HorizontalTimeline;
