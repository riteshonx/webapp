import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  useCallback,
  useState,
  ChangeEvent,
} from "react";
import Box from "@material-ui/core/Box";
import Header from "../../components/Small/Header";
import { useParams, useHistory } from "react-router-dom";
import ActivitiesTable from "../../components/Large/ActivitiesTable";
import BoldText from "../../components/Micro/BoldText";
import { useEffect } from "react";
import { stateContext } from "src/modules/root/context/authentication/authContext";
import { fetchTimeSheetEntries } from "./requests";
import { generateAssignedActivityRowComponent } from "./generator";
import fetchDataReducer, {
  fetchInitState,
} from "src/modules/shared/reducer/fetchDataReducer";
import TextAreaWithLabel from "../../components/Small/TextAreaWithLabel";
import moment from "moment";
import { setIsLoading } from "src/modules/root/context/authentication/action";
import Notification, {
  AlertTypes,
} from "src/modules/shared/components/Toaster/Toaster";
import NoPermission from "src/modules/shared/components/NoPermission/NoPermission";
import {
  generateActvitiesFromTimesheet,
  navigateBackIfRequiredParamsAreInvalid,
} from "./utils";
import { enrichDataWithLinks } from "../../common/dataHelper";
import { fetchGlobalId, fetchUniqueFormId } from "../../common/requests";

export const AddDailyLogContext: any = createContext({});

export const badDataMessage =
  "The date and form id combination entered in the URL does not exist. Re-try by just adding the date";

export interface Params {
  id: string;
  featureId: string;
  formId: string;
}

const ViewDailyLog: React.FC = () => {
  const history = useHistory();
  const { state, dispatch }: any = useContext(stateContext);
  const [timesheetEntries, dispatchTimesheetEntries] = useReducer(
    fetchDataReducer,
    fetchInitState
  );
  const [comment, setComment] = useState<string>("");
  const { formId, projectId, userId, dailyLogDate }: any = useParams();
  const [isBadData, setIsBadData] = useState<boolean>(false);

  const dailyLogReportDateForHeader = useMemo(
    () => moment(dailyLogDate).format("dddd, MMM DD, YYYY"),
    []
  );

  const navigateBack = useCallback(() => {
    history.push(`/dailyLogs/projects/${projectId}`);
  }, []);

  if (navigateBackIfRequiredParamsAreInvalid(userId, dailyLogDate)) {
    navigateBack();
  }

  useEffect(() => {
    if (state?.selectedProjectToken) {
      (async () => {
        if (formId) {
          try {
            const uniqueFormId = Number(formId);
            const reportDateToFetch = moment(dailyLogDate).format("YYYY-MM-DD");
            const globalDailyLogId = await fetchGlobalId(reportDateToFetch);
            if (!globalDailyLogId) {
              setIsBadData(true);
              dispatch(setIsLoading(false));
            } else {
              const uniqueFormIdNew = await fetchUniqueFormId(
                userId,
                globalDailyLogId
              );
              if (uniqueFormIdNew != uniqueFormId) {
                setIsBadData(true);
                dispatch(setIsLoading(false));
              }
            }
          } catch {
            dispatchTimesheetEntries({ type: "FETCH_ERROR" });
          }
        }
      })();
    }
  }, [state.selectedProjectToken]);

  const fetchGlobalIdAndFormId = useCallback(async () => {
    const reportDateToFetch = moment(dailyLogDate).format("YYYY-MM-DD");
    if (formId && !Number(formId)) {
      Notification.sendNotification("Invalid Form Id", AlertTypes.error);
      return;
    }
    try {
      let uniqueFormId = Number(formId);
      let globalDailyLogId;
      //when the id is not present in the url
      if (!uniqueFormId) {
        globalDailyLogId = await fetchGlobalId(reportDateToFetch);
        if (globalDailyLogId)
          uniqueFormId = await fetchUniqueFormId(userId, globalDailyLogId);
      }
      //checking if unique form id is not 0
      //if formId is present in the URL, then we already have the date we need to fetch timesheet entries
      if (uniqueFormId) {
        const path = `/dailyLogs/projects/${projectId}/view/${userId}/${dailyLogDate}/${uniqueFormId}`;
        history.push(path);
        return uniqueFormId;
      }
      return 0;
    } catch (error) {
      console.error(error);
      dispatch(setIsLoading(false));
      throw error;
    }
  }, []);

  const getTimesheetEntries = useCallback(async () => {
    try {
      dispatchTimesheetEntries({ type: "INIT_FETCH" });
      const formId: any = await fetchGlobalIdAndFormId();
      if (formId) {
        const timeSheetEntriesResponse = await fetchTimeSheetEntries(formId);
        const { taskTimesheetEntries, comments } = timeSheetEntriesResponse;
        const nonDeletedComment = comments.find(
          (comment: any) => !comment.deleted
        );
        const assignedActivities =
          generateActvitiesFromTimesheet(taskTimesheetEntries);
        const enrichedActivities = await enrichDataWithLinks(
          assignedActivities
        );
        dispatchTimesheetEntries({
          type: "FETCH_COMPLETED",
          payload: enrichedActivities,
        });
        setComment(nonDeletedComment?.comment ?? "");
      } else {
        dispatchTimesheetEntries({ type: "FETCH_COMPLETED", payload: [] });
      }
    } catch (e) {
      dispatchTimesheetEntries({ type: "FETCH_ERROR" });
      console.error(
        "Something went wrong while getting time sheet entries and enriching it",
        e
      );
    }
  }, []);

  useEffect(() => {
    if (state?.selectedProjectToken) {
      getTimesheetEntries();
    }
  }, [state.selectedProjectToken]);

  return (
    <>
      {!isBadData ? (
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
              <Header handleBackClick={navigateBack} headerValue="Daily Logs" />
              <BoldText
                color="#797979"
                style={{ marginLeft: "3rem" }}
                collapseMargin
              >
                {`${dailyLogReportDateForHeader} UTC`}
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
              timesheetEntries.data,
              true
            )}
            hasDataAfterFetch={timesheetEntries.hasDataAfterFetch}
            isLoading={timesheetEntries.isLoading}
            hasError={timesheetEntries.isError}
          />
          <TextAreaWithLabel
            readOnly={true}
            label="Additional Comments"
            value={comment}
            style={{ marginTop: "2rem" }}
            size="l"
            labelStyle={{
              color: "#000",
              fontWeight: "bold",
              fontSize: "1.6rem",
              marginBottom: "2rem",
            }}
          />
        </Box>
      ) : (
        <NoPermission
          header={"Daily Logs"}
          navigateBack={navigateBack}
          noPermissionMessage={badDataMessage}
        />
      )}
    </>
  );
};

export default ViewDailyLog;
