import { useState } from "react";
import { Box } from "@material-ui/core";
import Header from "../../components/Small/Header";
import { useHistory, useLocation, useParams } from "react-router-dom";
import DateNavigator from "../../components/Small/DateNavigator";
import ActivitiesTable from "../../components/Large/ActivitiesTable";
import { generateActivitySummaryRowComponent } from "./generator";
import {
  useCallback,
  useContext,
  useEffect,
  useReducer,
  createContext,
} from "react";
import { stateContext } from "src/modules/root/context/authentication/authContext";
import moment from "moment";
import { fetchProjectDailylogSummaryData } from "./requests";
import { fetchGlobalId } from "../../common/requests";
import { setGlobalDailyLogId } from "../../actions";
import fetchDataSummaryReducer from "../../reducer/DataLogSummaryReducer";
import { fetchInitSummaryState } from "../../reducer/DataLogSummaryReducerActions";
import { setSummaryData } from "../../reducer/DataLogSummaryReducerActions";
import { enrichDataWithLinks } from "../../common/dataHelper";

export const DailyLogSummaryContext: any = createContext({});

const ViewDailyLogSummary = () => {
  const history = useHistory();
  const { state, dispatch }: any = useContext(stateContext);
  const [assignedSummaryState, dispatchAssignedSummaryActivities] = useReducer(
    fetchDataSummaryReducer,
    fetchInitSummaryState
  );
  const { projectId, dailyLogDate }: any = useParams();
  const [reportDate] = useState(dailyLogDate);

  const navigateBack = () => {
    history.push(`/dailyLogs/projects/${projectId}`);
  };

  if (!reportDate) {
    navigateBack();
  } else {
    const dateFormat = "YYYY-MM-DD";
    const isValidDate = moment(dailyLogDate, dateFormat, true).isValid();
    if (!isValidDate) {
      console.error("Invalid date format. Navigating to List Page");
      navigateBack();
    }
  }

  const fetchSummaryActivities = useCallback(async (isModified: boolean) => {
    try {
      const globalDailyLogId: any = await fetchGlobalId(
        moment(reportDate).format("YYYY-MM-DD")
      );
      const timeSheetEntries = await fetchProjectDailylogSummaryData(
        globalDailyLogId
      );
      const timeSheetEntriesList = [...timeSheetEntries];
      if (timeSheetEntriesList.length) {
        timeSheetEntriesList.forEach((item: any, index: number) => {
          timeSheetEntriesList[index] = {
            ...item.metadata,
            comments: item.comments,
            id: item.id,
            taskId: item.taskId,
            assignee: item?.form?.createdByUser,
            attachments: item?.attachments,
          };
        });
      }
      const timeSheetEntriesListFilteredOnDelayed = timeSheetEntriesList
        .filter((item: any, index: number) => {
          return item?.status?.new == "IN_PROGRESS_DELAYED";
        })
        .map((item1: any, index: number) => {
          return item1?.floatValue
            ? { ...item1, floatValue: item1.floatValue.new }
            : { ...item1, floatValue: null };
        });
      const timeSheetEntriesListFilteredOnDelayedSorted = getSortedOnFloatValue(
        timeSheetEntriesListFilteredOnDelayed
      );

      const formatedSummaryDataWithAttachments = await enrichDataWithLinks(
        timeSheetEntriesListFilteredOnDelayedSorted
      );
      dispatch(setGlobalDailyLogId(globalDailyLogId));
      dispatchAssignedSummaryActivities(
        setSummaryData(formatedSummaryDataWithAttachments)
      );
    } catch (error) {
      console.log(error);
    }
  }, []);

  function getSortedOnFloatValue(timeSheetEntriesList: any) {
    const timeSheetList = JSON.parse(JSON.stringify(timeSheetEntriesList));
    const timeSheetListWithFloatValue = timeSheetList
      .filter((item: any, index: number) => {
        return item.floatValue !== null;
      })
      .sort(function (a: any, b: any) {
        return a.floatValue - b.floatValue;
      });
    const timeSheetListWithOutFloatValue = timeSheetList
      .filter((item: any, index: number) => {
        return item.floatValue == null;
      })
      .map((a: any, b: number) => {
        return { ...a, floatValue: "--" };
      });
    return [...timeSheetListWithFloatValue, ...timeSheetListWithOutFloatValue];
  }

  useEffect(() => {
    if (state?.selectedProjectToken) {
      fetchSummaryActivities(false);
    }
  }, [state.selectedProjectToken]);

  return (
    <DailyLogSummaryContext.Provider
      value={{ assignedSummaryState, dispatchAssignedSummaryActivities }}
    >
      <Box padding="2rem" width="100%">
        <Box display="flex" alignItems="center">
          <Header
            handleBackClick={navigateBack}
            headerValue="Daily Log Summary"
          />
          <DateNavigator
            dateValue={moment(reportDate).format("dddd, MMM DD, YYYY")}
            onNextDateClick={() => console.log("Clicked next")}
            onPrevDateClick={() => console.log("Clicked prev")}
          />
        </Box>
        <ActivitiesTable
          tableName="Delayed Activities"
          columns={[
            { name: "Schedule Float", width: "10%" },
            { name: "Activity", width: "20%" },
            { name: "Variance Info", width: "30%" },
            { name: "Photos", width: "40%" },
          ]}
          rowComponents={generateActivitySummaryRowComponent(
            assignedSummaryState.data
          )}
          hasError={assignedSummaryState.hasError}
          isLoading={assignedSummaryState.isLoading}
          hasDataAfterFetch={assignedSummaryState.hasDataAfterFetch}
        />
      </Box>
    </DailyLogSummaryContext.Provider>
  );
};

export default ViewDailyLogSummary;
