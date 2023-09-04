import axios from "axios";
import moment from "moment";
import React, { useContext, useEffect, useState } from "react";
import {
  setIsLoading,
  setNotificationBadgeCount,
} from "src/modules/root/context/authentication/action";
import { stateContext } from "src/modules/root/context/authentication/authContext";
import {
  getExchangeToken,
  getProjectExchangeToken,
} from "src/services/authservice";
import { client } from "src/services/graphql";
import { myProjectRole } from "src/utils/role";
import { FETCH_PROJECT_ASSOCIATED_USERS } from "../../Graphql/Queries/dashboard3";
import ActivitiesAndFormsTab from "../ActivitiesAndFormsTab/ActivitiesAndFormsTab";
import GalleryView from "../GalleryView/GalleryView";
import LaborProductivity from "../LaborProductivity/LaborProductivity";
import ProjectMetrics from "../ProjectMetrics/ProjectMetrics";
import Updates from "../UpdatesModule/Updates";
import "./ProjectView.scss";

const DASHBOARD_URL: any = `${process.env["REACT_APP_DASHBOARD_URL"]}`;

const ProjectView = () => {
  const { state, dispatch }: any = useContext(stateContext);
  const [tasksUrl, setTaskUrl]: any = useState("");
  const [formUrl, setFormUrl]: any = useState("");
  const [inprogressProjectTasks, setInprogressProjectTasks]: any =
    useState(null);
  const [projectUsers, setProjectUsers]: any = useState([]);
  const [projectFormsData, setProjectFormsData]: any = useState(null);
  const [laborProductivityData, setLaborProductivityData]: any = useState(null);
  const [activityFilters, setActivityFilters]: any = useState({
    assignedTo: "",
    createdBy: "",
    createdDate: null,
  });
  const [laborProductivityTab, setLaborProductivityTab] = useState("costcode");
  const [updatesTab, setUpdatesTab] = useState(true);

  // fetch project users, set task and form urls
  useEffect(() => {
    if (!state?.currentProject?.projectId) {
      dispatch(setIsLoading(true));
    } else {
      dispatch(setIsLoading(false));
    }
    state?.currentProject?.projectId &&
      setTaskUrl(
        `${DASHBOARD_URL}dashboard/v1/getAllInProgressActivities?portfolioId=${state?.currentPortfolio?.portfolioId}&projectId=${state?.currentProject?.projectId}`
      );
    state?.currentProject?.projectId &&
      setFormUrl(
        `${DASHBOARD_URL}dashboard/v1/getAllInProgressForms?portfolioId=${state?.currentPortfolio?.portfolioId}&projectId=${state?.currentProject?.projectId}`
      );
    state?.currentProject?.projectId && fetchProjectUsers();
  }, [state?.currentProject]);

  // api calls
  useEffect(() => {
    tasksUrl && fetchTasksByProject();
  }, [tasksUrl]);

  useEffect(() => {
    formUrl && fetchProjectForms();
  }, [formUrl]);

  useEffect(() => {
    state?.currentProject?.projectId && fetchLaborActivityByProject();
  }, [state?.currentProject, laborProductivityTab]);

  const fetchProjectUsers = async () => {
    const token = getExchangeToken();
    try {
      const projectAssociationResponse = await client.query({
        query: FETCH_PROJECT_ASSOCIATED_USERS,
        fetchPolicy: "network-only",
        variables: {
          projectId: state?.currentProject?.projectId,
        },
        context: { role: myProjectRole.viewMyProjects, token: token },
      });
      const targetUsers: any = [];
      if (projectAssociationResponse.data.projectAssociation.length > 0) {
        projectAssociationResponse.data.projectAssociation.forEach(
          (item: any) => {
            const user = {
              id: item?.user?.id,
              name: item?.user?.firstName + " " + item.user.lastName,
            };
            targetUsers.push(user);
          }
        );
        setProjectUsers([{ id: "", name: "Select User" }, ...targetUsers]);
      }
    } catch (err) {
      console.log("fetchProjectUsers err", err);
    }
  };

  const fetchLaborActivityByProject = async () => {
    try {
      const response: any = await axios.get(
        `${DASHBOARD_URL}dashboard/v1/getlaborProductivity?portfolioId=${state?.currentPortfolio?.portfolioId}&projectId=${state?.currentProject?.projectId}&grouping=${laborProductivityTab}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getExchangeToken()}`,
          },
        }
      );
      setLaborProductivityData(response?.data?.cube);
    } catch (err) {
      console.log("fetchLaborActivityByProject err", err);
    }
  };

  const fetchTasksByProject = async () => {
    try {
      const token = getProjectExchangeToken();
      const response: any = await axios.get(tasksUrl, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setInprogressProjectTasks(response.data?.cube);
    } catch (err) {
      console.log("fetchTasksByProject err", err);
    }
  };

  const fetchProjectForms = async () => {
    try {
      const token = getExchangeToken();
      const response: any = await axios.get(formUrl, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setProjectFormsData(response?.data?.cube);
    } catch (err) {
      console.log("fetchProjectForms err", err);
    }
  };

  // click events
  const handleLaborProductivityTabChange = (val: string) => {
    setLaborProductivityData(null);
    setLaborProductivityTab(val);
  };

  const fetchAssignedActivities = (key: string, val: any) => {
    setInprogressProjectTasks(null);
    setProjectFormsData(null);
    const activityUrl = new URL(
      `${DASHBOARD_URL}dashboard/v1/getAllInProgressActivities`
    );
    const formsUrl = new URL(
      `${DASHBOARD_URL}dashboard/v1/getAllInProgressForms`
    );

    if (key === "allItems") {
      setTaskUrl(
        `${activityUrl}?portfolioId=${state?.currentPortfolio?.portfolioId}&projectId=${state?.currentProject?.projectId}`
      );
      setFormUrl(
        `${formsUrl}?portfolioId=${state?.currentPortfolio?.portfolioId}&projectId=${state?.currentProject?.projectId}`
      );
      setActivityFilters({
        assignedTo: "",
        createdBy: "",
        createdDate: null,
      });
    } else if (key === "assignedTo") {
      setTaskUrl(
        `${activityUrl}?portfolioId=${state?.currentPortfolio?.portfolioId}&projectId=${state?.currentProject?.projectId}&assignedTo=${val}`
      );
      setFormUrl(
        `${formsUrl}?portfolioId=${state?.currentPortfolio?.portfolioId}&projectId=${state?.currentProject?.projectId}&assignedTo=${val}`
      );
      setActivityFilters({
        ...activityFilters,
        assignedTo: val,
      });
    }
  };

  const handleActivityFilterClick = (data: any) => {
    const activityUrl = new URL(
      `${DASHBOARD_URL}dashboard/v1/getAllInProgressActivities`
    );
    const formsUrl = new URL(
      `${DASHBOARD_URL}dashboard/v1/getAllInProgressForms`
    );
    const params1: any = new URLSearchParams(activityUrl.search);
    const params2: any = new URLSearchParams(formsUrl.search);

    if (data === "clearFilter") {
      setInprogressProjectTasks(null);
      setProjectFormsData(null);
      setActivityFilters({
        assignedTo: "",
        createdBy: "",
        createdDate: null,
      });
      setTaskUrl(
        `${activityUrl.href}?portfolioId=${state?.currentPortfolio?.portfolioId}&projectId=${state?.currentProject?.projectId}`
      );
      setFormUrl(
        `${formsUrl.href}?portfolioId=${state?.currentPortfolio?.portfolioId}&projectId=${state?.currentProject?.projectId}`
      );
    } else if (data !== activityFilters) {
      setInprogressProjectTasks(null);
      setProjectFormsData(null);
      Object.keys(data)?.forEach((key: any) => {
        if (key === "assignedTo") {
          data[key] === ""
            ? params1.delete("assignedTo")
            : params1.append("assignedTo", data[key]);

          data[key] === ""
            ? params2.delete("assignedTo")
            : params2.append("assignedTo", data[key]);
        }
        if (key === "createdBy") {
          data[key] === ""
            ? params1.delete("createdBy")
            : params1.append("createdBy", data[key]);
          data[key] === ""
            ? params2.delete("createdBy")
            : params2.append("createdBy", data[key]);
        }
        if (key === "createdDate") {
          data[key] === null
            ? params1.delete("createdDate")
            : params1.append(
                "createdDate",
                moment(data[key]).format("YYYYMMDD")
              );

          data[key] === null
            ? params2.delete("createdDate")
            : params2.append(
                "createdDate",
                moment(data[key]).format("YYYYMMDD")
              );
        }
      });
      setActivityFilters(data);
      setTaskUrl(
        `${activityUrl.href}?portfolioId=${
          state?.currentPortfolio?.portfolioId
        }&projectId=${state?.currentProject?.projectId}&${params1.toString()}`
      );
      setFormUrl(
        `${formsUrl.href}?portfolioId=${
          state?.currentPortfolio?.portfolioId
        }&projectId=${state?.currentProject?.projectId}&${params2.toString()}`
      );
    }
  };

  return !state?.isLoading ? (
    <div className="projectView3-main">
      <div className="projectView3-main__projectName">
        {state.currentProject?.projectName}
      </div>
      <div className="projectView3-main__mainContainer">
        <div className="projectView3-main__mainContainer__container1">
          <ActivitiesAndFormsTab
            projectUsers={projectUsers}
            tasks={inprogressProjectTasks}
            forms={projectFormsData}
            activityFilters={activityFilters}
            fetchAssignedActivities={fetchAssignedActivities}
            handleFilterClick={handleActivityFilterClick}
          />
          <LaborProductivity
            handleLaborProductivityTabChange={handleLaborProductivityTabChange}
            laborProductivityTab={laborProductivityTab}
            laborProductivityData={laborProductivityData}
          />
        </div>
        <div className="projectView3-main__mainContainer__container2">
          <div className="projectView3-main__mainContainer__container2__metricsAndUpdatesContainer">
            <div className="projectView3-main__mainContainer__container2__metricsAndUpdatesContainer__metricsContainer">
              <ProjectMetrics />
            </div>
            <div className="projectView3-main__mainContainer__container2__metricsAndUpdatesContainer__updatesContainer">
              <Updates
                handleUpdateUnreadCount={(count: number) =>
                  dispatch(setNotificationBadgeCount(count))
                }
                unreadCount={state?.notificationBadgeCount}
                updatesTab={updatesTab}
                setUpdatesTab={(val: any) => setUpdatesTab(val)}
              />
            </div>
          </div>
          <div className="projectView3-main__mainContainer__container2__photosContainer">
            <GalleryView />
          </div>
        </div>
      </div>
    </div>
  ) : null;
};

export default ProjectView;
