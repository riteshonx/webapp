import {
  useContext,
  useEffect,
  useReducer,
  useState,
  useMemo,
  useCallback,
} from "react";
import { Badge, Box, Button } from "@material-ui/core";
import Header from "../../components/Small/Header";
import BoldText from "../../components/Micro/BoldText";
import FilterIcon from "@material-ui/icons/FilterList";
import { styled } from "@material-ui/core/styles";
import DailyLogTable from "../../components/Large/DailyLogTable";
import { useHistory, useParams } from "react-router-dom";
import fetchDataReducer, {
  fetchInitState,
} from "src/modules/shared/reducer/fetchDataReducer";
import { transformListData } from "../../transformations";
import PaginationBar from "../../components/Small/PaginationBar";
import { DailyLogContext } from "../../DailyLogRouting";
import {
  setListViewPagination,
  setListViewTotalRecordsCount,
  setSelectedLogDate
} from "../../actions";
import FilterDrawer from "../../components/Small/FilterDrawer/FilterDrawer";
import { map, filter, find, compose } from "../../utils";
import { getAddDailyLogRole } from "../../common/roles";
import { stateContext } from "src/modules/root/context/authentication/authContext";
import { setIsLoading } from "src/modules/root/context/authentication/action";
import { fetchProjectDailyLogList, fetchTotalFormCount } from "./requests";
import { decodeToken } from "src/services/authservice";
import { setGlobalDailyLogId, setFormId } from "../../actions";
import moment from "moment";
import { fetchGlobalId, fetchUniqueFormId } from "../../common/requests";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import { setTriggerFilterFetch } from "../../actions";

const useStyles = makeStyles(() =>
  createStyles({
    corner: {
      right: "15px",
    },
    disabled: {
      color: "#c9c9c9",
      "&:hover": {
        cursor: "not-allowed",
      },
    },
  })
);

const getAddDailyLogPath = (projectId: string, formId: number) => {
  let path = `/dailyLogs/projects/${projectId}/update`;
  if (formId > 0) {
    path = `${path}/${formId}`;
  }
  return path;
};

const RightMarginedButton = styled(Button)({
  marginRight: "1rem",
});

const ListDailyLog = () => {
  const history = useHistory();
  const params: any = useParams();
  const classes = useStyles();

  const [listData, dispatchListData] = useReducer(
    fetchDataReducer,
    fetchInitState
  );
  const [expandableFilter, setExpandableFilter] = useState({
    show: false,
    expand: false,
  });
  const [filterCount, setFilterCount] = useState(0);
  const { state, dispatch } = useContext(DailyLogContext);
  const {
    listView: {
      pagination: { page, limit },
      totalRecords,
      filters: { filterList },
    },
    formId,
  } = state;
  const [ role, canAddDailyLog] = getAddDailyLogRole();
  const { state: globalState, dispatch: globalDispatch }: any =
    useContext(stateContext);
  const [buttonText, setButtonText] = useState(() => {
    const name = "Daily Log";
    if (formId === -1) return `...`;
    if (formId === 0) return `Add ${name}`;
    return `Update ${name}`;
  });
  const dailyLogPath = useMemo(
    () => getAddDailyLogPath(params.projectId, formId),
    [params.projectId, formId]
  );

  const handleFilterClick = () => {
    if (filterCount) {
      dispatch(setTriggerFilterFetch(true));
      setExpandableFilter({ show: false, expand: false });
    } else if (listData.hasDataAfterFetch)
      setExpandableFilter({ show: true, expand: true });
  };

  const fetchGlobalIdAndFormId = useCallback(async () => {
    globalDispatch(setIsLoading(true));
    const today = moment().utc().format("YYYY-MM-DD");
    const createdBy = decodeToken().userId;
    try {
      let buttonText = "Add Daily Log";
      const globalDailyLogId: any = await fetchGlobalId(today);
      if (globalDailyLogId) {
        const uniqueFormId: any = await fetchUniqueFormId(
          createdBy,
          globalDailyLogId
        );
        if (uniqueFormId) {
          buttonText = "Update Daily Log";
          dispatch(setFormId(uniqueFormId));
        }
        dispatch(setGlobalDailyLogId(globalDailyLogId));
        globalDispatch(setIsLoading(false));
      }
      setButtonText(buttonText);
    } catch (error) {
      console.log(error);
      globalDispatch(setIsLoading(false));
    }
  }, []);

  useEffect(() => {
    if (globalState?.selectedProjectToken) fetchGlobalIdAndFormId();
  }, [fetchGlobalIdAndFormId, globalState.selectedProjectToken]);

  useEffect(() => {
    dispatchListData({ type: "INIT_FETCH" });
    globalDispatch(setIsLoading(false));
    async function fetchListData() {
      try {
        let localFilterCount = 0;
        const dateFilters = filterList["Date"].options;
        const userFilters = filterList["User"].options;
        const firstDateWithValue = find((item: any) => item.value);
        const filterSelectedUsers = filter((item: any) => item.value);
        const mapUserIds = map((item: any) => item.key);
        const selectedDateFilter = compose(firstDateWithValue)(dateFilters);
        const selectedUserFilter = compose(
          mapUserIds,
          filterSelectedUsers
        )(userFilters);
        localFilterCount = selectedUserFilter.length;
        if (selectedDateFilter) localFilterCount += 1;
        let response, recordCountResponse;
        if (selectedDateFilter || selectedUserFilter) {
          response = await fetchProjectDailyLogList(
            limit,
            limit * (page - 1),
            selectedDateFilter?.value,
            selectedUserFilter
          );
          recordCountResponse = await fetchTotalFormCount(
            selectedDateFilter?.value,
            selectedUserFilter
          );
        } else {
          response = await fetchProjectDailyLogList(limit, limit * (page - 1));
          recordCountResponse = await fetchTotalFormCount();
        }
        const totalRecords: number = recordCountResponse?.aggregate?.count ?? 0;
        dispatch(setListViewTotalRecordsCount(totalRecords));
        setFilterCount(localFilterCount);
        /* we are explicitly taking the previous filter expand value to keep the expand state in whatever
        condition it was previously in particularly when someone navigates to the current page from elsewhere*/
        setExpandableFilter((p: any) => {
          return { expand: p.expand, show: localFilterCount > 0 };
        });
        dispatchListData({
          type: "FETCH_COMPLETED",
          payload: response.data.forms,
        });
      } catch (error) {
        console.log(error);
        dispatchListData({ type: "FETCH_ERROR" });
      }
    }

    if (globalState?.selectedProjectToken) {
      fetchListData();
    }
  }, [page, limit, filterList, globalState.selectedProjectToken]);

  const transformedData = transformListData(listData.data);
  const disableFilter = filterCount === 0 && !listData.hasDataAfterFetch;
  const addDailyLogHandler =()=>{
    // To show today's date on the header as we are allowing updates of past daily logs
    const today = moment().utc().format('YYYY-MM-DD');
    history.push(dailyLogPath);
    dispatch(setSelectedLogDate(today));
  }
  return (
    <Box padding="2rem" width="100%" >
      <Box display="flex" alignItems="center" >
        {/* <Header
          style={{ flex: 1 }}
          headerValue="Daily Logs"
        /> */}
        <BoldText style={{ flex: 1, fontSize:'2.5rem', marginLeft:'50px' }}>
          Daily Logs
        </BoldText>
        <Box>
          <Badge
            classes={{ anchorOriginTopRightRectangle: classes.corner }}
            badgeContent={filterCount || undefined}
            color="secondary"
          >
            <RightMarginedButton
              disableRipple={disableFilter}
              onClick={handleFilterClick}
              variant="outlined"
              startIcon={<FilterIcon />}
              classes={disableFilter ? { root: classes.disabled } : {}}
            >
              {filterCount
                ? `Clear Filter${filterCount > 1 ? "s" : ""}`
                : "Filter"}
            </RightMarginedButton>
          </Badge>
          {canAddDailyLog && (
           <Button
            onClick={addDailyLogHandler}
            variant="contained"
            className="btn-primary"
            >
            {buttonText}
            </Button>
          )}
        </Box>
      </Box>
      <DailyLogTable
        data={transformedData}
        isLoading={listData.isLoading}
        hasError={listData.isError}
        hasDataAfterFetch={listData.hasDataAfterFetch}
      />
      <FilterDrawer
        expand={expandableFilter.expand}
        isVisible={expandableFilter.show}
        filterList={filterList}
        onClickExpand={() =>
          setExpandableFilter((p) => {
            return { ...p, expand: !p.expand };
          })
        }
      />
      <PaginationBar
        totalPageCount={Math.ceil(totalRecords / limit)}
        page={page}
        limit={limit}
        totalRecords={totalRecords}
        isLoading={listData.isLoading}
        onChangeRowsSelection={(e: any) => {
          dispatch(setListViewPagination(1, e.target.value as number));
        }}
        onChangePageNo={(e, page: number) =>
          dispatch(setListViewPagination(page, limit))
        }
        disabled={!listData.hasDataAfterFetch}
        style={{
          position: "fixed",
          bottom: 0,
          right: 0,
          left: 75,
          background: "#fff",
          padding: "1rem",
          paddingLeft: "2rem",
          borderTop: "1px solid #e0e0e0",
        }}
      />
    </Box>
  );
};

export default ListDailyLog;
