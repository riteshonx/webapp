import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  useCallback,
  useState,
  ChangeEvent,
  useRef,
  Dispatch,
} from "react";
import Box from "@material-ui/core/Box";
import Header from "../../components/Small/Header";
import { useHistory } from "react-router-dom";
import ActivitiesTable from "../../components/Large/ActivitiesTable";
import BoldText from "../../components/Micro/BoldText";
import { useEffect } from "react";
import { stateContext } from "src/modules/root/context/authentication/authContext";
import {
  fetchCustomListName,
  fetchTimeSheetEntries,
  getAssignedActivities,
  getProjectFeatureDetails,
  getUpcomingActivities,
  updateAdditionalComments,
  updateAdditionalCommentsWithCommentId,
  updateAdditionalCommentsWithDailyLogId,
  updateAdditionalCommentsWithFormId,
  getUpdatedTimeSheet,
} from "./requests";
import { fetchGlobalId, fetchUniqueFormId } from "../../common/requests";
import {
  generateAssignedActivityRowComponent,
  generateUpcomingActivityRowComponent,
} from "./generator";
import fetchDataReducer, {
  fetchInitState,
} from "src/modules/shared/reducer/fetchDataReducer";
import TextAreaWithLabel from "../../components/Small/TextAreaWithLabel";
import Button from "@material-ui/core/Button";
import addDailyLogReducer, {
  initialAddDailyLogReducerState,
  AddDailyLogReducerAction,
  AddDailyLogReducerState,
} from "../../reducer/AddDailyLogReducer";
import {
  setFeatureId,
  setGlobalDailyLogId,
  setRefreshAssignedActivities,
  setRefreshUpcomingActivities,
  setFormId,
  setCustomList,
  setConstraintList,
} from "../../actions";
import moment from "moment";
import { setIsLoading } from "src/modules/root/context/authentication/action";
import { DailyLogContext } from "../../DailyLogRouting";
import Notification, {
  AlertTypes,
} from "src/modules/shared/components/Toaster/Toaster";
import { decodeToken } from "src/services/authservice";
import { useParams } from "react-router-dom";
import NoPermission from "src/modules/shared/components/NoPermission/NoPermission";
import { enrichDataWithLinks } from "../../common/dataHelper";
import { getAddDailyLogRole } from "../../common/roles";

type AddDailyLogContextType = {
  addDailyLogState: Partial<AddDailyLogReducerState>;
  dispatchAddDailyLog: Dispatch<AddDailyLogReducerAction>;
};

export const AddDailyLogContext = createContext<AddDailyLogContextType>({
  addDailyLogState: {},
  dispatchAddDailyLog: () => {
    //comment
  },
});

export const noPermissionMessage =
  "You don't have permission to view this page.";

export interface Params {
  id: string;
  featureId: string;
  formId: string;
}

 interface AssignedActivity {
  actualDuration: null;
  actualEndDate: null;
  actualStartDate: any ;
  assignedTo: string;
  attachments: [];
  id: string;
  plannedDuration: any;
  plannedEndDate: any;
  plannedStartDate: any;
  projectTaskConstraints:any;
  projectTaskPartialUpdates:any;
  projectTaskVariances:any;
  status:string;
  taskName:string;
  __typename:string;
}


const AddDailyLog: React.FC = () => {
  const history = useHistory();
  const { state, dispatch }: any = useContext(stateContext);
  const { state: dailyLogState, dispatch: dailyLogDispatch }: any =
    useContext(DailyLogContext);
  const [projectFeatueId, setProjectFeatueId] = useState<string>("");
  const [assignedActivities, dispatchAssignedActivities] = useReducer(
    fetchDataReducer,
    fetchInitState
  );
  const [upcomingActivities, dispatchUpcomingActivities] = useReducer(
    fetchDataReducer,
    fetchInitState
  );

  const [addDailyLogState, dispatchAddDailyLog] = useReducer(
    addDailyLogReducer,
    initialAddDailyLogReducerState
  );
  const [comment, setComment] = useState({ commentText: "", id: "" });
  const { formId, projectId }: any = useParams();
  const [hasViewPermission, setHasViewPermission] = useState<boolean>(true);
  const today = useMemo(() => moment().utc().format("dddd, MMM DD, YYYY"), []);
  const listLogsPath = useMemo(() => `/dailyLogs/projects/${projectId}`, []);
  const initialComment = useRef("");
  //Since we are now allowing update of past dailyLog, this will allow to show the selectedDailyLog date
  const selectedLogDateForHeader = moment(dailyLogState.selectedLogDate).format("dddd, MMM DD, YYYY")  
  const [role, canAddDailyLog] = getAddDailyLogRole();

  useEffect(() => {
    if (!canAddDailyLog) {
      setHasViewPermission(false)
    }
  }, [canAddDailyLog])
  useEffect(() => {
    async function getCustomList() {
      const featureId: any = await getProjectFeatureDetails();
      setProjectFeatueId(featureId);
      dailyLogDispatch(setFeatureId(featureId));
      const varianceList = await fetchCustomListName("Variance Category");
      const constraintList = await fetchCustomListName("Constraint Category");
      const prjectBasedVarianceList =
        updateDropdownListBasedonProject(varianceList);
      const prjectBasedConstraintList =
        updateDropdownListBasedonProject(constraintList);
      if (prjectBasedVarianceList?.length)
        dailyLogDispatch(setCustomList(prjectBasedVarianceList));
      if (prjectBasedConstraintList.length)
        dailyLogDispatch(setConstraintList(prjectBasedConstraintList));
    }
    if (state?.selectedProjectToken) getCustomList();
  }, [state.selectedProjectToken]);

  useEffect(() => {
    if (state?.selectedProjectToken) {
      (async () => {
        if (formId) {
          const uniqueFormId = Number(formId);
          const today = moment().utc().format("YYYY-MM-DD");
          const createdBy = decodeToken().userId;
          const globalDailyLogId = await fetchGlobalId(today);
          if (globalDailyLogId) {
            const uniqueFormIdNew = await fetchUniqueFormId(
              createdBy,
              globalDailyLogId
            );
            if (uniqueFormIdNew != uniqueFormId) {
              // setHasViewPermission(false);
              dispatch(setIsLoading(false));
              return;
            }
            dailyLogDispatch(setGlobalDailyLogId(globalDailyLogId));
          }
        }
      })();
    }
  }, [state.selectedProjectToken]);

  const fetchGlobalIdAndFormId = useCallback(async () => {
    const today = moment().utc().format("YYYY-MM-DD");
    const createdBy = decodeToken().userId;
    if (formId && !Number(formId)) {
      Notification.sendNotification("Invalid Form Id", AlertTypes.error);
      return;
    }
    try {
      let uniqueFormId = Number(formId);
      let globalDailyLogId;

      //This is for View Daily Log
      if (!uniqueFormId) {
        globalDailyLogId = await fetchGlobalId(today);
        if (globalDailyLogId) {
          uniqueFormId = await fetchUniqueFormId(createdBy, globalDailyLogId);
          dailyLogDispatch(setGlobalDailyLogId(globalDailyLogId));
        }
      }
      //checking if unique form id is not 0
      if (uniqueFormId) {
        const path = `/dailyLogs/projects/${projectId}/update/${uniqueFormId}`;
        history.push(path);
        dailyLogDispatch(setFormId(uniqueFormId));
        return uniqueFormId;
      }
    } catch (error) {
      console.log(error);
      dispatch(setIsLoading(false));
      throw error;
    }
  }, []);


  const fetchLatestStatusOfActivites = async(assignedActivities:AssignedActivity[])=>{
    const taskIds:Array<string> = []
    assignedActivities.forEach((activity:AssignedActivity)=>{
      taskIds.push(activity.id)})
    const latestSheetEntries =await getUpdatedTimeSheet(taskIds);
    return latestSheetEntries;

  }

  /* Note: We only display those activities that are without any constraints */

  const fetchAssignedActivities = useCallback(async (isUpdate: boolean) => {
    try {
      if (!isUpdate) dispatchAssignedActivities({ type: "INIT_FETCH" });
      const assignedActivities = await getAssignedActivities();
      const latestAssignedActivities= await fetchLatestStatusOfActivites(assignedActivities);

      const formId: any = await fetchGlobalIdAndFormId();
      let taskTimesheetEntries = [];
      if (formId) {
        const response = await fetchTimeSheetEntries(formId);
        taskTimesheetEntries = response.taskTimesheetEntries;
        const { comments } = response;
        const nonDeletedComment = comments.find(
          (comment: any) => !comment.deleted
        );
        initialComment.current = nonDeletedComment?.comment ?? "";
        setComment({
          commentText: nonDeletedComment?.comment ?? "",
          id: nonDeletedComment?.id ?? "",
        });
      }

      const timeSheetWithLinks = await enrichDataWithLinks(
        taskTimesheetEntries
      );
      const timeSheetEntriesWithLinks = await enrichDataWithLinks(
        latestAssignedActivities
      );

      const enhanceActivities = enhanceAssignedSheetActivities (
        assignedActivities,
        timeSheetEntriesWithLinks
        );

      dispatchAssignedActivities({
        type: "FETCH_COMPLETED",
        payload: enhanceActivities,
      });

    } catch (e) {
      console.error(
        "Something went wrong while fetching assigned activities",
        e
      );
      dispatchAssignedActivities({ type: "FETCH_ERROR" });
    }
  }, []);

  const fetchUpcomingActivities = useCallback(async (isUpdate: boolean) => {
    try {
      if (!isUpdate) dispatchUpcomingActivities({ type: "INIT_FETCH" });
      const upcomingActivities = await getUpcomingActivities();
      dispatchUpcomingActivities({
        type: "FETCH_COMPLETED",
        payload: upcomingActivities,
      });
      dispatch(setIsLoading(false));
    } catch {
      dispatchUpcomingActivities({ type: "FETCH_ERROR" });
    }
  }, []);

  useEffect(() => {
    if (state?.selectedProjectToken) {
      fetchAssignedActivities(false);
      fetchUpcomingActivities(false);
    }
  }, [state.selectedProjectToken]);

  useEffect(() => {
    if (addDailyLogState.refreshAssignedActivities) {
      fetchAssignedActivities(true);
      dispatchAddDailyLog(setRefreshAssignedActivities(false));
    }
  }, [addDailyLogState.refreshAssignedActivities]);

  useEffect(() => {
    if (addDailyLogState.refreshUpcomingActivities) {
      fetchUpcomingActivities(true);
      dispatchAddDailyLog(setRefreshUpcomingActivities(false));
    }
  }, [addDailyLogState.refreshUpcomingActivities]);

  const enrichAssignedActivities = (
    timesheetEntries: any,
    assignedActivities: any
  ) => {
    const assignedActivitiesFormatted = JSON.parse(
      JSON.stringify(assignedActivities)
    );
    if (assignedActivitiesFormatted.length && timesheetEntries.length) {
      assignedActivitiesFormatted.forEach((activity: any, index: number) => {
        timesheetEntries.forEach((timeSheet: any) => {
          if (activity.id == timeSheet.taskId) {
            const { projectTaskPartialUpdates, projectTaskVariances } =
              activity;
            const enrichedAssignedActivity: any = {
              status: activity.status, //explicity added to make the conditional check below easier
              timeSheetId: timeSheet.id,
              comments: timeSheet.comments,
              attachments: timeSheet.attachments,
              category: undefined,
              variance: undefined,
              isUpdated: timeSheet?.metadata?.taskUpdated,
            };

            if (projectTaskPartialUpdates.length) {
              const {
                actualStartDate,
                actualEndDate,
                createdAt,
                taskStatus,
                plannedEndDate,
                plannedStartDate,
              } = projectTaskPartialUpdates[0];
              if (actualStartDate)
                enrichedAssignedActivity.actualStartDate = actualStartDate;
              if (actualEndDate)
                enrichedAssignedActivity.actualEndDate = actualEndDate;
              if (taskStatus) {
                enrichedAssignedActivity.status = taskStatus;
              }
              if (plannedStartDate)
                enrichedAssignedActivity.plannedStartDate = plannedStartDate;
              if (plannedEndDate)
                enrichedAssignedActivity.plannedEndDate = plannedEndDate;
              enrichedAssignedActivity.createdAt = createdAt;
            }
            if (projectTaskVariances.length) {
              const { varianceName, category } =
                projectTaskVariances[projectTaskVariances.length - 1];
              if (category) enrichedAssignedActivity.category = category;
              if (varianceName)
                enrichedAssignedActivity.variance = varianceName;
            }
            if (enrichedAssignedActivity.status == "In-Progress") {
              enrichedAssignedActivity.status =
                timeSheet?.metadata?.status?.new ||
                timeSheet?.metadata?.status?.old;
            }
            const todayDate = new Date();
            const timesheetDate = new Date(timeSheet?.updatedAt);
            if (timeSheet && timesheetDate.getDate() === todayDate.getDate()) {
              console.log(`Timesheet: ${JSON.stringify(timeSheet, null, 4)}`);
              if (timeSheet?.metadata?.actualStartDate?.new || timeSheet?.metadata?.actualStartDate?.old) {
                enrichedAssignedActivity.actualStartDate = 
                  timeSheet?.metadata?.actualStartDate?.new ||
                  timeSheet?.metadata?.actualStartDate?.old;
              }
              if (timeSheet?.metadata?.actualEndDate?.new || timeSheet?.metadata?.actualEndDate?.old) {
                enrichedAssignedActivity.actualEndDate = 
                  timeSheet?.metadata?.actualEndDate?.new ||
                  timeSheet?.metadata?.actualEndDate?.old;
              }
              if (timeSheet?.metadata?.status?.new || timeSheet?.metadata?.status?.old) {
                enrichedAssignedActivity.status =
                  timeSheet?.metadata?.status?.new ||
                  timeSheet?.metadata?.status?.old;
              }
              if (timeSheet?.metadata?.plannedStartDate?.new || timeSheet?.metadata?.plannedStartDate?.old) {
                enrichedAssignedActivity.plannedStartDate = 
                timeSheet?.metadata?.plannedStartDate?.new !== null 
                  ? timeSheet?.metadata?.plannedStartDate?.new : timeSheet?.metadata?.plannedStartDate?.old;
              }
            }

            assignedActivitiesFormatted[index] = {
              ...activity,
              ...enrichedAssignedActivity,
            };
          }
        });
      });
    }
    return assignedActivitiesFormatted;
  };


  const enhanceAssignedSheetActivities = (
    assignedActivities:any,
    activityFromTimeSheet:any
    )=>{
      const assignedActivitiesFormatted = JSON.parse(
        JSON.stringify(assignedActivities)
      );


      assignedActivitiesFormatted.forEach((activity:any, index:number)=>{
        activityFromTimeSheet.forEach((timeSheetActivity:any)=>{
          if(activity.id == timeSheetActivity.taskId){
            const { projectTaskPartialUpdates, projectTaskVariances } =
            activity;
          const enrichedAssignedActivity:any = {
            status: activity.status, //explicity added to make the conditional check below easier
            timeSheetId: timeSheetActivity.id,
            comments: timeSheetActivity.comments,
            attachments: timeSheetActivity.attachments,
            category: undefined,
            variance: undefined,
            isUpdated: timeSheetActivity?.metadata?.taskUpdated,
            updatedAt:timeSheetActivity?.updatedAt
          };

          if (projectTaskPartialUpdates.length) {
            const {
              actualStartDate,
              actualEndDate,
              createdAt,
              taskStatus,
              plannedEndDate,
              plannedStartDate,
            } = projectTaskPartialUpdates[0];
            if (actualStartDate)
              enrichedAssignedActivity.actualStartDate = actualStartDate;
            if (actualEndDate)
              enrichedAssignedActivity.actualEndDate = actualEndDate;
            if (taskStatus) {
              enrichedAssignedActivity.status = taskStatus;
            }
            console.log(`plannedStartDate: ${JSON.stringify(plannedStartDate, null, 4)}`);
            if (plannedStartDate) {
              enrichedAssignedActivity.plannedStartDate = plannedStartDate;
            }
            if (plannedEndDate)
              enrichedAssignedActivity.plannedEndDate = plannedEndDate;
            // enrichedAssignedActivity.createdAt = createdAt;
          }
          if (projectTaskVariances.length) {
            const { varianceName, category } =
              projectTaskVariances[projectTaskVariances.length - 1];
            if (category) enrichedAssignedActivity.category = category;
            if (varianceName)
              enrichedAssignedActivity.variance = varianceName;
          }
          if (enrichedAssignedActivity.status == "In-Progress") {
            enrichedAssignedActivity.status =
            timeSheetActivity?.metadata?.status?.new ||
              timeSheetActivity?.metadata?.status?.old;
          }
          const todayDate = new Date();
          const timesheetDate = new Date(timeSheetActivity?.updatedAt);
          if (timeSheetActivity && timesheetDate.getDate() === todayDate.getDate()) {
            console.log(`timeSheetActivity: ${JSON.stringify(timeSheetActivity, null, 4)}`);
            if (timeSheetActivity?.metadata?.actualStartDate?.new || timeSheetActivity?.metadata?.actualStartDate?.old) {
              enrichedAssignedActivity.actualStartDate = 
                timeSheetActivity?.metadata?.actualStartDate?.new ||
                timeSheetActivity?.metadata?.actualStartDate?.old;
            }
            if (timeSheetActivity?.metadata?.actualEndDate?.new || timeSheetActivity?.metadata?.actualEndDate?.old) {
              enrichedAssignedActivity.actualEndDate = 
                timeSheetActivity?.metadata?.actualEndDate?.new ||
                timeSheetActivity?.metadata?.actualEndDate?.old;
            }
            if (timeSheetActivity?.metadata?.status?.new || timeSheetActivity?.metadata?.status?.old) {
              enrichedAssignedActivity.status =
                timeSheetActivity?.metadata?.status?.new ||
                timeSheetActivity?.metadata?.status?.old;
            }
            if (timeSheetActivity?.metadata?.plannedStartDate?.new || timeSheetActivity?.metadata?.plannedStartDate?.old) {
              enrichedAssignedActivity.plannedStartDate = 
                timeSheetActivity?.metadata?.plannedStartDate?.new !== null 
                ? timeSheetActivity?.metadata?.plannedStartDate?.new : timeSheetActivity?.metadata?.plannedStartDate?.old;
            }
          }
          console.log(`enrichedAssignedActivity: ${JSON.stringify(enrichedAssignedActivity, null, 4)}`);
          assignedActivitiesFormatted[index] = {
            ...activity,
            ...enrichedAssignedActivity,
          };
        }
      });
    });
    return assignedActivitiesFormatted;
  }
  

  const navigateBack = () => {
    history.push(listLogsPath);
  };

  const addComment = async () => {
    dispatch(setIsLoading(true));
    try {
      const { commentText, id } = comment;
      const featureId = Number(projectFeatueId);
      if (id) {
        await updateAdditionalCommentsWithCommentId(commentText, Number(id));
      } else if (dailyLogState.globalDailyLogId && formId) {
        await updateAdditionalCommentsWithFormId(commentText, Number(formId));
      } else if (dailyLogState.globalDailyLogId) {
        await updateAdditionalCommentsWithDailyLogId(
          commentText,
          Number(dailyLogState.globalDailyLogId),
          Number(featureId)
        );
      } else {
        await updateAdditionalComments(
          commentText,
          featureId,
          `${moment(today).format("YYYY-MM-DD")}T00:00:00.00+00:00`
        );
      }
      Notification.sendNotification(
        `Dailylog comment ${
          initialComment.current
            ? commentText
              ? "updated"
              : "deleted"
            : "added"
        } successfully`,
        AlertTypes.success
      );
      dispatch(setIsLoading(false));
      navigateBack();
    } catch (error) {
      dispatch(setIsLoading(false));
      console.log(error);
      Notification.sendNotification(
        "Could not add your comment",
        AlertTypes.error
      );
    }
  };

  const updateDropdownListBasedonProject = (list: any) => {
    if (list?.configurationLists?.length > 0) {
      const varianceCategory = list.configurationLists[0];
      const projectCategoryList =
        list.configurationLists[0].projectConfigAssociations;
      const customList: any = [];
      varianceCategory.configurationValues.forEach((item: any) => {
        if (projectCategoryList && projectCategoryList.length) {
          const listAssociationIndex = projectCategoryList.findIndex(
            (configId: any) => configId.configValueId === item.id
          );
          if (listAssociationIndex !== -1) {
            const constraintObj: any = {};
            constraintObj.nodeName = item.nodeName;
            constraintObj.id = item.id;
            customList.push(constraintObj);
          }
        } else {
          const constraintObj: any = {};
          constraintObj.nodeName = item.nodeName;
          constraintObj.id = item.id;
          customList.push(constraintObj);
        }
      });
      return customList;
    }
  };

  return (
    <>
      {hasViewPermission ? (
        <AddDailyLogContext.Provider
          value={{ addDailyLogState, dispatchAddDailyLog }}
        >
          <Box padding="2rem" width="100%">
            <Box
              position="sticky"
              top={59}
              right={0}
              left={0}
              bgcolor="white"
              zIndex={1000}
              paddingBottom="10px"
              paddingTop="10px"
            >
              <Box display="flex" alignItems="center">
                <Header
                  handleBackClick={navigateBack}
                  headerValue="Daily Logs"
                />
                <BoldText
                  color="#797979"
                  style={{ marginLeft: "3rem" }}
                  collapseMargin
                >
                  {`${selectedLogDateForHeader} UTC`}
                </BoldText>
              </Box>
            </Box>
            <ActivitiesTable
              tableName="Assigned Activities"
              columns={[
                { name: "Status", width: "30%" },
                { name: "Activity", width: "30%" },
                { name: "Photos", width: "40%" },
              ]}
              rowComponents={generateAssignedActivityRowComponent(
                assignedActivities.data,
                false
              )}
              hasDataAfterFetch={assignedActivities.hasDataAfterFetch}
              isLoading={assignedActivities.isLoading}
              hasError={assignedActivities.isError}
            />

            <ActivitiesTable
              tableName="Upcoming Activities"
              tableDescription="Activities starting in the Next 7 days"
              columns={[
                { name: "Status", width: "30%" },
                { name: "Activity", width: "70%" },
              ]}
              isLoading={upcomingActivities.isLoading}
              hasError={upcomingActivities.isError}
              hasDataAfterFetch={upcomingActivities.hasDataAfterFetch}
              rowComponents={generateUpcomingActivityRowComponent(
                upcomingActivities.data,
                false
              )}
              topOffset="205px"
            />
            <TextAreaWithLabel
              readOnly={false}
              label="Additional Comments"
              value={comment.commentText}
              style={{ marginTop: "2rem" }}
              onChange={(
                e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
              ) =>
                setComment((p) => {
                  return { commentText: e.target.value, id: p.id };
                })
              }
              size="l"
              labelStyle={{
                color: "#000",
                fontWeight: "bold",
                fontSize: "1.6rem",
                marginBottom: "2rem",
              }}
            />
            <Box
              display="flex"
              style={{ flexDirection: "row-reverse" }}
              marginTop="2rem"
            >
              <Button
                className="btn-primary"
                disabled={initialComment.current === comment.commentText}
                onClick={addComment}
              >
                Add Comment and Close
              </Button>
            </Box>
          </Box>
        </AddDailyLogContext.Provider>
      ) : (
        <NoPermission
          header={"Daily Logs"}
          navigateBack={navigateBack}
          noPermissionMessage={noPermissionMessage}
        />
      )}
    </>
  );
};

export default AddDailyLog;
