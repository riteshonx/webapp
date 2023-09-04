import { makeStyles, Popover } from "@material-ui/core";
import { ReactElement, useContext, useEffect, useState } from "react";
import aiImg from "../../../../assets/images/newLogo.png";
import KeyboardArrowDownIcon from "@material-ui/icons/KeyboardArrowDown";
import "./InsightsPopOver.scss";
import { client } from "src/services/graphql";
import {
  LOAD_IMPACTED_INSIGHT_LIST,
  LOAD_LATEST_SCHEDULE_TIMESTAMP,
  LOAD_SCHEDULE_LIST,
} from "src/modules/insights/graphql/queries/schedule";
import { LessonsLearned, Schedule } from "../../../insights/models/insights";
import { stateContext } from "src/modules/root/context/authentication/authContext";
import { useHistory } from "react-router-dom";
import ScheduleCard from "../../../shared/components/ScheduleCard/ScheduleCard";
import { setSelectedMenu } from "src/modules/root/context/authentication/action";
import {
  LESSONS_LEARNED_TAB,
  SCHEDULE_TAB,
} from "../../../insights/constant/index";
import LessonsLearnedCard from "../../../shared/components/LessonsLearnedCard/LessonsLearnedCard";
import { LOAD_LESSONS_LEARNED_LIST } from "src/modules/insights/graphql/queries/lessonsLearned";

const useStyles = makeStyles(() => ({
  paper: {
    width: "30%",
    height: "80%",
    overflow: "hidden",
  },
}));

const InsightsPopOver = (): ReactElement => {
  const classes = useStyles();
  const { state, dispatch }: any = useContext(stateContext);
  const history = useHistory();
  const [aiEl, setAIEl] = useState(null);
  const [insights, setInsights]: any = useState({
    LESSONS_LEARNED_TAB: [],
    SCHEDULE_TAB: [],
  });
  const [selectedTab, setSelectedTab] = useState(SCHEDULE_TAB);

  useEffect(() => {
    if (aiEl && state?.projectFeaturePermissons?.canviewMasterPlan) {
      selectedTab === LESSONS_LEARNED_TAB &&
        state.currentProject.projectId &&
        loadLessonsLearnedList();
      selectedTab === SCHEDULE_TAB &&
        state.currentProject.projectId &&
        loadScheduleList();
    }
  }, [
    aiEl,
    state.currentProject,
    state?.projectFeaturePermissons?.canviewMasterPlan,
    selectedTab,
  ]);

  const loadLessonsLearnedList = async () => {
    try {
      const lessonsLearnedList = await client.query({
        query: LOAD_LESSONS_LEARNED_LIST,
        fetchPolicy: "network-only",
        context: { role: "viewMasterPlan", token: state?.selectedProjectToken },
      });
      const lessonslearnedProjectInsights =
        lessonsLearnedList.data.lessonslearnedProjectInsights.filter(
          (lessonslearnedProjectInsight: LessonsLearned) =>
            lessonslearnedProjectInsight.status.length === 0
        );
      setInsights({
        ...insights,
        [LESSONS_LEARNED_TAB]: lessonslearnedProjectInsights,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const loadScheduleList = async () => {
    try {
      //   dispatch(setIsLoading(true));
      /*
       * first queries the maximum schedule timestamp from the database.
       */
      const latestTimeStamp = await client.query({
        query: LOAD_LATEST_SCHEDULE_TIMESTAMP,
        fetchPolicy: "network-only",
        context: { role: "viewMasterPlan", token: state?.selectedProjectToken },
      });
      const createdAt = latestTimeStamp.data.projectInsights[0].createdAt;

      /**
       *  calculate (maximum - 5min) timestamp.
       */
      const gtCreatedAt = new Date(
        new Date(createdAt).valueOf() - 5 * 60 * 1000
      ).toISOString();

      /*
       * Load all projectInsights with createdAt > (maximum - 5min)
       */
      const scheduleList = await client.query({
        query: LOAD_SCHEDULE_LIST,
        variables: {
          gt: gtCreatedAt,
          searchKeyWord: `%%`,
        },
        fetchPolicy: "network-only",
        context: { role: "viewMasterPlan", token: state?.selectedProjectToken },
      });
      const impactedScheduleList = await client.query({
        query: LOAD_IMPACTED_INSIGHT_LIST,
        variables: {
          searchKeyword: `%%`,
        },
        fetchPolicy: "network-only",
        context: {
          role: "viewMasterPlan",
          token: state?.selectedProjectToken,
        },
      });
      const projectInsights = [
        ...(impactedScheduleList.data.projectInsights[0]?.tasks.length
          ? impactedScheduleList.data.projectInsights
          : []),
        ...scheduleList.data.projectInsights.filter(
          (projectInsight: Schedule) => projectInsight.title
        ),
      ];
      setInsights({ ...insights, [SCHEDULE_TAB]: projectInsights });
    } catch (error) {
      console.log(error);
    }
  };

  const handleAI = (event: any) => {
    setAIEl(event.currentTarget);
  };

  const handleCloseAI = () => {
    setAIEl(null);
    setSelectedTab(SCHEDULE_TAB);
  };

  const handleInsightsPage = (dataId: any) => {
    history.push(
      `/insights/projects/${state.currentProject?.projectId}/${selectedTab}/insight/${dataId}`
    );
    dispatch(setSelectedMenu("Insights"));
    sessionStorage.setItem("selectedMenu", "Insights");
  };

  const handleTabClick = (currentTab: string) => {
    setSelectedTab(currentTab);
  };

  return (
    <div className="insightsPopover">
      <Popover
        id={Boolean(aiEl) ? "ai-popover" : undefined}
        open={Boolean(aiEl)}
        anchorEl={aiEl}
        keepMounted
        onClose={handleCloseAI}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        getContentAnchorEl={null}
        classes={{
          paper: classes.paper,
        }}
      >
        <div className="insightsPopover__header">
          <span>Slate Insights</span>{" "}
          <KeyboardArrowDownIcon onClick={handleCloseAI} />
        </div>
        <div className="insightsPopover__tabContainer">
          <div
            className={
              selectedTab === SCHEDULE_TAB
                ? "insightsPopover__tabContainer__tab insightsPopover__tabContainer__selectedTab"
                : "insightsPopover__tabContainer__tab"
            }
            onClick={() => handleTabClick(SCHEDULE_TAB)}
          >
            Schedule
          </div>
          <div
            className={
              selectedTab === LESSONS_LEARNED_TAB
                ? "insightsPopover__tabContainer__tab insightsPopover__tabContainer__selectedTab"
                : "insightsPopover__tabContainer__tab"
            }
            onClick={() => handleTabClick(LESSONS_LEARNED_TAB)}
          >
            Lessons Learned
          </div>
        </div>
        <div className={"insightsPopover__body"}>
          {/* No Insights Available */}
          {selectedTab === LESSONS_LEARNED_TAB &&
            insights[LESSONS_LEARNED_TAB]?.map((data: LessonsLearned) => {
              return (
                <LessonsLearnedCard
                  key={data.id}
                  data={data}
                  open={false}
                  onClick={() => {
                    handleInsightsPage(data.id);
                  }}
                />
              );
            })}
          {selectedTab === SCHEDULE_TAB &&
            insights[SCHEDULE_TAB]?.map((data: Schedule) => {
              return (
                <ScheduleCard
                  key={data.id}
                  data={data}
                  open={false}
                  onClick={() => {
                    handleInsightsPage(data.id);
                  }}
                />
              );
            })}
        </div>
      </Popover>
      {state?.projectFeaturePermissons?.canviewMasterPlan && (
        <div className={"insightsPopover__slate-insights__button"}>
          <img src={aiImg} width="40" onClick={handleAI} />
        </div>
      )}
    </div>
  );
};

export default InsightsPopOver;
