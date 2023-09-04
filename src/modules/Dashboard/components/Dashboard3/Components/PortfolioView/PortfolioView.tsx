import axios from "axios";
import moment from "moment";
import React, { ReactElement, useContext, useEffect, useState } from "react";
import {
  setIsLoading,
  setNotificationBadgeCount,
} from "src/modules/root/context/authentication/action";
import { stateContext } from "src/modules/root/context/authentication/authContext";
import {
  decodeExchangeToken,
  getExchangeToken,
} from "src/services/authservice";
import { client } from "src/services/graphql";
import { myCompanyUserRole, tenantUserRole } from "src/utils/role";
import { TENANT_USERS } from "../../Graphql/Queries/dashboard3";
import ActivitiesAndFormsTab from "../ActivitiesAndFormsTab/ActivitiesAndFormsTab";
import GalleryView from "../GalleryView/GalleryView";
import LaborProductivity from "../LaborProductivity/LaborProductivity";
import ProjectMetrics from "../ProjectMetrics/ProjectMetrics";
import Updates from "../UpdatesModule/Updates";
import "./PortfolioView.scss";

const DASHBOARD_URL: any = `${process.env["REACT_APP_DASHBOARD_URL"]}`;

const PortfolioView = (): ReactElement => {
  const { state, dispatch }: any = useContext(stateContext);
  const [projectUsers, setProjectUsers]: any = useState([]);
  const [tasksUrl, setTaskUrl]: any = useState("");
  const [formUrl, setFormUrl]: any = useState("");
  const [laborProductivityTab, setLaborProductivityTab] = useState("costcode");
  const [updatesTab, setUpdatesTab] = useState(true);
  const [laborProductivityData, setLaborProductivityData]: any = useState(null);
  const [inprogressPortfolioTasks, setInprogressPortfolioTasks]: any =
    useState(null);
  const [portfolioFormsData, setPortfolioFormsData]: any = useState(null);
  const [activityFilters, setActivityFilters]: any = useState({
    assignedTo: "",
    createdBy: "",
    createdDate: null,
  });

  // fetch active tenant users
  useEffect(() => {
    if (
      decodeExchangeToken().allowedRoles.includes(
        tenantUserRole.viewTenantUsers
      ) ||
      decodeExchangeToken().allowedRoles.includes(
        myCompanyUserRole.viewMyCompanyUsers
      )
    ) {
      getTenants();
    }
  }, []);

  // api calls
  useEffect(() => {
    state?.currentPortfolio?.portfolioId && fetchLaborActivityByPortfolio();
  }, [state?.currentPortfolio, laborProductivityTab]);

  useEffect(() => {
    if (!state?.currentPortfolio?.portfolioId) {
      dispatch(setIsLoading(true));
    } else {
      dispatch(setIsLoading(false));
    }
    state?.currentPortfolio?.portfolioId &&
      setTaskUrl(
        `${DASHBOARD_URL}dashboard/v1/getAllInProgressActivities?portfolioId=${state?.currentPortfolio?.portfolioId}`
      );
    state?.currentPortfolio?.portfolioId &&
      setFormUrl(
        `${DASHBOARD_URL}dashboard/v1/getAllInProgressForms?portfolioId=${state?.currentPortfolio?.portfolioId}`
      );
  }, [state?.currentPortfolio]);

  useEffect(() => {
    tasksUrl && fetchTasksByPortfolio();
  }, [tasksUrl]);

  useEffect(() => {
    formUrl && fetchPortfolioForms();
  }, [formUrl]);

  const getTenants = async () => {
    const role = decodeExchangeToken().allowedRoles.includes(
      tenantUserRole.viewTenantUsers
    )
      ? tenantUserRole.viewTenantUsers
      : myCompanyUserRole.viewMyCompanyUsers;
    try {
      const formsTemplateResponse = await client.query({
        query: TENANT_USERS,
        variables: {
          limit: 10000,
          offset: 0,
        },
        fetchPolicy: "network-only",
        context: {
          role,
        },
      });

      if (formsTemplateResponse.data?.tenantAssociation) {
        const response: any = formsTemplateResponse.data?.tenantAssociation;
        const structure: any = [];
        for (let i = 0; i < response.length; i++) {
          if (response[i].status === 3) {
            structure.push({
              id: response[i]?.user?.id,
              name:
                response[i]?.user?.firstName + " " + response[i].user?.lastName,
              status: "invited",
            });
          }
        }
        setProjectUsers([{ id: "", name: "Select User" }, ...structure]);
      }
    } catch (err: any) {
      console.log("getTenantsError", err);
    }
  };

  const fetchTasksByPortfolio = async () => {
    try {
      const token = getExchangeToken();
      const response: any = await axios.get(tasksUrl, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setInprogressPortfolioTasks(response.data?.cube);
    } catch (err) {
      console.log("fetchTasksByPortfolio err", err);
    }
  };

  const fetchLaborActivityByPortfolio = async () => {
    try {
      const response: any = await axios.get(
        `${DASHBOARD_URL}dashboard/v1/getlaborProductivity?portfolioId=${state?.currentPortfolio?.portfolioId}&grouping=${laborProductivityTab}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getExchangeToken()}`,
          },
        }
      );
      setLaborProductivityData(response?.data?.cube);
    } catch (err) {
      console.log("fetchLaborActivityByPortfolio err", err);
    }
  };

  const fetchPortfolioForms = async () => {
    try {
      const token = getExchangeToken();
      const response: any = await axios.get(formUrl, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setPortfolioFormsData(response?.data?.cube);
    } catch (err) {
      console.log("fetchPortfolioForms err", err);
    }
  };

  // click events
  const handleLaborProductivityTabChange = (val: string) => {
    setLaborProductivityData(null);
    setLaborProductivityTab(val);
  };

  const fetchAssignedActivities = (key: string, val: any) => {
    setInprogressPortfolioTasks(null);
    setPortfolioFormsData(null);
    const activityUrl = new URL(
      `${DASHBOARD_URL}dashboard/v1/getAllInProgressActivities`
    );
    const formsUrl = new URL(
      `${DASHBOARD_URL}dashboard/v1/getAllInProgressForms`
    );

    if (key === "allItems") {
      setTaskUrl(
        `${activityUrl}?portfolioId=${state?.currentPortfolio?.portfolioId}`
      );
      setFormUrl(
        `${formsUrl}?portfolioId=${state?.currentPortfolio?.portfolioId}`
      );
      setActivityFilters({
        assignedTo: "",
        createdBy: "",
        createdDate: null,
      });
    } else if (key === "assignedTo") {
      setTaskUrl(
        `${activityUrl}?portfolioId=${state?.currentPortfolio?.portfolioId}&assignedTo=${val}`
      );
      setFormUrl(
        `${formsUrl}?portfolioId=${state?.currentPortfolio?.portfolioId}&assignedTo=${val}`
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
      setInprogressPortfolioTasks(null);
      setPortfolioFormsData(null);
      setActivityFilters({
        assignedTo: "",
        createdBy: "",
        createdDate: null,
      });
      setTaskUrl(
        `${activityUrl.href}?portfolioId=${state?.currentPortfolio?.portfolioId}`
      );
      setFormUrl(
        `${formsUrl.href}?portfolioId=${state?.currentPortfolio?.portfolioId}`
      );
    } else if (data !== activityFilters) {
      setInprogressPortfolioTasks(null);
      setPortfolioFormsData(null);
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
        }&${params1.toString()}`
      );
      setFormUrl(
        `${formsUrl.href}?portfolioId=${
          state?.currentPortfolio?.portfolioId
        }&${params2.toString()}`
      );
    }
  };

  return !state?.isLoading ? (
    <div className="portfolioView3-main">
      <div className="portfolioView3-main__portfolioName">
        {state?.currentPortfolio?.portfolioName}
      </div>
      <div className="portfolioView3-main__mainContainer">
        <div className="portfolioView3-main__mainContainer__container1">
          <ActivitiesAndFormsTab
            projectUsers={projectUsers}
            tasks={inprogressPortfolioTasks}
            forms={portfolioFormsData}
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
        <div className="portfolioView3-main__mainContainer__container2">
          <div className="portfolioView3-main__mainContainer__container2__metricsAndUpdatesContainer">
            <div className="portfolioView3-main__mainContainer__container2__metricsAndUpdatesContainer__metricsContainer">
              <ProjectMetrics />
            </div>
            <div className="portfolioView3-main__mainContainer__container2__metricsAndUpdatesContainer__updatesContainer">
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
          <div className="portfolioView3-main__mainContainer__container2__photosContainer">
            <GalleryView />
          </div>
        </div>
      </div>
    </div>
  ) : (
    <></>
  );
};

export default PortfolioView;
