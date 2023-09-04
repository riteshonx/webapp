import {
  Card,
  CardContent,
  CardHeader,
  makeStyles,
  Tooltip,
} from "@material-ui/core";
import { ReactElement, useContext, useEffect, useState } from "react";
import { getExchangeToken } from "src/services/authservice";
import "./TaskCard.scss";
import t1 from "../../../../../../assets/images/sb2.svg";
import t2 from "../../../../../../assets/images/taskblu1.svg";
import t3 from "../../../../../../assets/images/sb1.svg";
import moment from "moment";
import Menu from "../../../../shared/Menu/MenuComponent";
import Notify, {
  AlertTypes,
} from "../../../../../shared/components/Toaster/Toaster";
import flip from "../../../../../../assets/images/flip.png";
import { client } from "src/services/graphql";
import { FETCH_PROJECT_NAMES } from "src/graphhql/queries/projects";
import { GET_PROJECT_ALL_TASKS } from "src/modules/dynamicScheduling/graphql/queries/projectPlan";
import { projectFeatureAllowedRoles } from "src/utils/role";
import { stateContext } from "src/modules/root/context/authentication/authContext";

const noTasks = [
  {
    title: "You are all set ...",
    url: t1,
  },
  {
    title: "No New Tasks ...",
    url: t2,
  },
  {
    title: "For the day ...",
    url: t3,
  },
];

const useStyles = makeStyles({
  headerTitle: {
    fontSize: "1.4rem",
    fontWeight: "bolder",
  },
});

interface Props {
  setFlipBack: any;
  flipBack: any;
  height: number;
  className: string;
  viewOnly?: boolean;
}

const SCHEDULER_URL: any = process.env["REACT_APP_SCHEDULER_URL"];

function TaskCard(props: Props): ReactElement {
  const classes = useStyles();
  const authContext: any = useContext(stateContext);
  const { innerHeight: height } = window;
  const [selectedTab, setSelectedTab] = useState("mytasks");
  const [taskData, setTaskData] = useState([]);
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
  });

  useEffect(() => {
    selectedTab === "mytasks" ? getTasks() : getProjectTasks();
    return () => {
      setTaskData([]);
    };
  }, [selectedTab]);

  const mapProjectNames = async (tasksData: any) => {
    const projectIds: any = [];
    tasksData?.forEach(
      (task: any) =>
        !projectIds.includes(task?.projectId) &&
        projectIds.push(task?.projectId)
    );
    if (tasksData?.length) {
      const projectNamesResponse = await client.query({
        query: FETCH_PROJECT_NAMES,
        fetchPolicy: "network-only",
        context: {
          role: "viewMyProjects",
          token: getExchangeToken(),
        },
        variables: {
          projectId: projectIds,
        },
      });
      const data: any = [];
      tasksData?.forEach((task: any) =>
        projectNamesResponse?.data?.project?.forEach((item: any) => {
          if (task?.projectId === item?.id) {
            data.push({
              projectName: item.name,
              ...task,
            });
          }
        })
      );
      setTaskData(data);
    }
  };

  const getTasks = async () => {
    try {
      const token = getExchangeToken();
      fetch(`${SCHEDULER_URL}V1/taskDetails/all_tasks`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          mapProjectNames(data.tasks);
          setUserData(data.user);
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    } catch (error) {
      console.log(error);
    }
  };

  const getProjectTasks = async () => {
    try {
      const response = await client.query({
        query: GET_PROJECT_ALL_TASKS,
        variables: {},
        fetchPolicy: "network-only",
        context: {
          role: projectFeatureAllowedRoles.viewMasterPlan,
          token: authContext.state.selectedProjectToken,
        },
      });
      if (response?.data?.tasks?.length) {
        const tasks = response.data.tasks?.map((task: any) => {
          return {
            ...task,
            newStatus: task?.projectTaskPartialUpdates?.length,
            totalConstraints:
              task.projectTaskConstraints_aggregate?.aggregate?.count,
            totalVariances:
              task.projectTaskVariances_aggregate?.aggregate?.count,
          };
        });
        setTaskData(tasks);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const updateTask = (payload: any) => {
    const token = getExchangeToken();
    fetch(`${SCHEDULER_URL}V1/partialUpdate/create`, {
      method: "POST", // or 'PUT'
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((response) => response.json())
      .then(() => {
        Notify.sendNotification(
          "Task updated successfully!",
          AlertTypes.success
        );
        selectedTab === "mytasks" ? getTasks() : getProjectTasks();
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const handleTaskUpdate = (item: any, status: any) => {
    if (item.status === status) return;
    const data: any = {
      taskId: item.id,
      taskStatus: status,
      projectId: item.projectId,
    };
    if (status === "In-Progress") {
      data.startDate = moment().format("YYYY-MM-DD");
      data.endDate = null;
    }
    if (status === "To-Do") {
      data.startDate = null;
      data.endDate = null;
    }
    if (status === "Complete") {
      data.startDate = item.actualStartDate;
      data.endDate = moment().format("YYYY-MM-DD");
    }
    updateTask(data);
  };

  return (
    <Card
      className={`${props.className}-main`}
      style={{ backgroundColor: "transparent" }}
    >
      <div className={`${props.className}-main__flip-icon-container`}>
        <img
          src={flip}
          className={`${props.className}-main__flip-icon-container__flip-icon`}
          onClick={() => {
            props.setFlipBack(!props.flipBack);
          }}
        />
      </div>
      <div className={`${props.className}-main__header`}>
        <span
          className={`${props.className}-main__header${
            selectedTab === "mytasks" && "__active"
          }`}
          onClick={() => {
            setTaskData([]);
            setSelectedTab("mytasks");
          }}
        >
          My Tasks
        </span>
        <span
          className={`${props.className}-main__header${
            selectedTab === "alltasks" && "__active"
          }`}
          onClick={() => {
            setTaskData([]);
            setSelectedTab("alltasks");
          }}
        >
          Project Tasks
        </span>
      </div>
      <CardContent
        className={`${props.className}-main__content`}
        style={{ height: height * props.height }}
      >
        {taskData &&
          taskData.map((item: any, index: any) => (
            <Card className={`${props.className}-container`} key={index}>
              <CardContent>
                <div className={`${props.className}-container__1`}>
                  <div className={`${props.className}-container__1__taskName`}>
                    {item.taskName}
                  </div>
                  {!props?.viewOnly && (
                    <div className={`${props.className}-container__1__menu`}>
                      <Menu
                        handleTaskUpdate={handleTaskUpdate}
                        item={item}
                        status={item?.status}
                      />
                    </div>
                  )}
                </div>
                <div className={`${props.className}-container__2`}>
                  <div className={`${props.className}-container__2__1`}>
                    {index % 3 === 0 && <img src={t1} />}
                    {index % 3 === 1 && <img src={t2} />}
                    {index % 3 === 2 && <img src={t3} />}
                  </div>
                  <div className={`${props.className}-container__2__2`}>
                    {item.projectName && (
                      <div className={`${props.className}-container__2__2__1`}>
                        <Tooltip title={item.projectName} placement="top-start">
                          <span
                            className={`${props.className}-container__2__2__1__label ${props.className}-container__projectName`}
                          >
                            {item.projectName?.length > 18
                              ? item.projectName.slice(0, 18).trim() + "..."
                              : item.projectName}
                          </span>
                        </Tooltip>
                      </div>
                    )}
                    <div className={`${props.className}-container__2__2__1`}>
                      <div
                        className={`${props.className}-container__2__2__1__label`}
                      >
                        Started:
                      </div>
                      <div
                        className={`${props.className}-container__2__2__1__val`}
                      >
                        {item?.plannedStartDate
                          ? moment(item?.plannedStartDate).format("DD MMM YY")
                          : item?.plannedStartDate}
                      </div>
                    </div>
                    <div className={`${props.className}-container__2__2__1`}>
                      <div
                        className={`${props.className}-container__2__2__1__label`}
                      >
                        Due:
                      </div>
                      <div
                        className={`${props.className}-container__2__2__1__val`}
                      >
                        {item?.plannedEndDate
                          ? moment(item?.plannedEndDate).format("DD MMM YY")
                          : item?.plannedEndDate}
                      </div>
                    </div>
                    <div className={`${props.className}-container__2__2__1`}>
                      <div
                        className={`${props.className}-container__2__2__1__label`}
                      >
                        Assignee:
                      </div>
                      <div
                        className={`${props.className}-container__2__2__1__val`}
                      >
                        {selectedTab === "alltasks"
                          ? item?.assignedToUser
                            ? `${item?.assignedToUser?.firstName} ${item?.assignedToUser?.lastName}`
                            : "-"
                          : `${userData?.firstName} ${userData?.lastName}`}
                      </div>
                    </div>
                    <div className={`${props.className}-container__2__2__1`}>
                      <div
                        className={`${props.className}-container__2__2__1__label`}
                      >
                        Constraints:
                      </div>
                      <div
                        className={`${props.className}-container__2__2__1__val`}
                      >
                        {item.totalConstraints}
                      </div>
                    </div>
                    <div className={`${props.className}-container__2__2__1`}>
                      <div
                        className={`${props.className}-container__2__2__1__label`}
                      >
                        Variances:
                      </div>
                      <div
                        className={`${props.className}-container__2__2__1__val`}
                      >
                        {item.totalVariances}
                      </div>
                    </div>
                    <div className={`${props.className}-container__2__2__1`}>
                      <div
                        className={`${props.className}-container__2__2__1__label`}
                      >
                        Status:
                      </div>
                      <div
                        className={`${props.className}-container__2__2__1__val`}
                      >
                        {item.newStatus ? "Under Review" : item.status}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              {item.newStatus ? (
                <div className={`${props.className}-container__review`}></div>
              ) : null}
              {!item.newStatus && item.status === "To-Do" ? (
                <div className={`${props.className}-container__todo`}></div>
              ) : null}
              {!item.newStatus && item.status === "In-Progress" ? (
                <div
                  className={`${props.className}-container__inprogress`}
                ></div>
              ) : null}
              {!item.newStatus && item.status === "Complete" ? (
                <div className={`${props.className}-container__complete`}></div>
              ) : null}
            </Card>
          ))}
        {taskData?.length === 0
          ? noTasks.map((item: any, index: any) => (
              <Card className={`${props.className}-container`} key={index}>
                <CardContent>
                  <div className={`${props.className}-container__noData`}>
                    <div>{item?.title}</div>
                    <div>
                      <img
                        src={item?.url}
                        className={`${props.className}-container__img`}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          : null}
      </CardContent>
    </Card>
  );
}

export default TaskCard;
