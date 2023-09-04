import { Box } from "@material-ui/core";
import { useEffect, useState, useContext, ChangeEvent } from "react";
import { useDebounce } from "src/customhooks/useDebounce";
import TaskSearchBar from "./TaskSearchBar";
import { getApiSchedulerWithExchange } from "src/services/api";
import { CircularProgress } from "@mui/material";
import { ArrowBackIos as BackArrow } from "@material-ui/icons";
import CustomButton from "./CustomButton";
import { LinkContext } from "../../Context/link/linkContext";
import { setSelectedFormToTaskLinks } from "../../Context/link/linkAction";
import TaskTable from "./TaskTable";
import { client } from "src/services/graphql";
import { FETCH_TASK_TYPE_ID } from "../../graphql/queries/link";
import { featureFormRoles } from "src/utils/role";
import { stateContext } from "src/modules/root/context/authentication/authContext";
import Pagination from "./Pagination";
import SelectRowsPerPage from "./SelectRowsPerPage";
import useSemiPersistence from "src/customhooks/useSemiPersistence";

const initTaskData = {
  currentPage: 0,
  tasksAndWp: [],
  totalItems: 0,
  totalPages: 0,
};

const FormToTaskLinkTabOption = ({ selectedRowsCount, linkedTasks }: any) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [taskData, setTaskData] = useState({
    data: initTaskData,
    isLoading: false,
    isError: false,
  });
  const [page, setPage] = useState(0);
  const [showTaskPage, setShowTaskPage] = useState(0);
  const [limit, setLimit] = useSemiPersistence("showTaskRowsPerPage", 10);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [showSelectedRows, setShowSelectedRows] = useState(false);
  const [paginatedRows, setPaginatedRows] = useState<Array<any>>([]);
  const { linkState, linkDispatch }: any = useContext(LinkContext);
  const [selectedRows, setSelectedRows] = useState<Array<any>>(
    linkState.formToTaskLinks.selectedLinks
  );
  const [targetType, setTargetType] = useState(4);
  const { state }: any = useContext(stateContext);

  useEffect(() => {
    async function fetchTaskType() {
      const {
        data: {
          projectFeature: [item],
        },
      } = await client.query({
        query: FETCH_TASK_TYPE_ID,
        variables: {},
        fetchPolicy: "network-only",
        context: {
          role: featureFormRoles.viewForm,
          token: state?.selectedProjectToken,
        },
      });
      setTargetType(item.id);
    }
    fetchTaskType();
  }, []);

  //The following effect comes into play when items are deleted from backwards while viewing the selected items
  useEffect(() => {
    if (!paginatedRows.length && showTaskPage > 0) {
      setShowTaskPage((prev: number) => prev - 1);
    }
  }, [paginatedRows]);

  useEffect(() => {
    const enrichedSelectedRows = selectedRows.slice(
      showTaskPage * limit,
      showTaskPage * limit + limit
    );
    setPaginatedRows(enrichedSelectedRows);
    selectedRowsCount(selectedRows.length);
    linkDispatch(setSelectedFormToTaskLinks(selectedRows));
  }, [selectedRows, showTaskPage, limit]);

  useEffect(() => {
    if (debouncedSearchTerm) {
      (async () => {
        try {
          setTaskData((prev) => {
            return { ...prev, isError: false, isLoading: true };
          });
          const response = await getApiSchedulerWithExchange(
            `V1/task_type/wp_tasks?page=${page}&limit=${limit}&search_term=${debouncedSearchTerm}`
          );
          setTaskData({ data: response, isLoading: false, isError: false });
        } catch {
          setTaskData((prev) => {
            return { ...prev, isLoading: false, isError: true };
          });
        }
      })();
    } else {
      setTaskData({
        data: initTaskData,
        isLoading: false,
        isError: false,
      });
      setPage(0);
    }
  }, [debouncedSearchTerm, limit, page]);

  useEffect(() => {
    if (!selectedRows.length) {
      setShowSelectedRows(false);
    }
  }, [selectedRows]);

  const handlePageChange = (event: ChangeEvent<unknown>, value: number) => {
    setPage(value - 1);
  };

  const handleSelectRows = (rows: Array<any>) => {
    setSelectedRows(rows);
  };

  return (
    <Box p="2rem 3rem">
      <Box
        display="flex"
        alignItems="center"
        position="sticky"
        top="60px"
        bgcolor="white"
      >
        {showSelectedRows ? (
          <>
            <CustomButton onClick={() => setShowSelectedRows(false)}>
              <BackArrow />
            </CustomButton>
            <h3>Selected Rows</h3>
          </>
        ) : (
          <>
            <TaskSearchBar
              value={searchTerm}
              onChange={(e: any) => setSearchTerm(e.target.value)}
            />
            <Box flex="1">
              {selectedRows.length > 0 && (
                <CustomButton
                  onClick={() => {
                    setShowSelectedRows(true);
                  }}
                >
                  <h3>View Selected</h3>
                </CustomButton>
              )}
            </Box>
          </>
        )}
      </Box>
      <Box marginTop="2rem" display="flex" maxHeight="calc(100vh - 420px)">
        {taskData.isLoading ? (
          <CircularProgress style={{ color: "#000" }} />
        ) : taskData.isError ? (
          <div>No data found!</div>
        ) : !showSelectedRows ? (
          <>
            <TaskTable
              data={taskData.data}
              onPageChange={handlePageChange}
              onSelectRows={handleSelectRows}
              selectedRows={selectedRows}
              linkedIds={linkedTasks}
              targetType={targetType}
            />

            <Box
              position="absolute"
              display="flex"
              bottom="11px"
              justifyContent="center"
              alignItems="center"
            >
              {taskData.data.totalItems > 0 && (
                <SelectRowsPerPage
                  rowsPerPage={limit}
                  onChangeRowsPerPage={(e: any) => setLimit(e.target.value)}
                />
              )}
              {taskData.data.totalItems >= limit && (
                <Pagination
                  count={taskData.data.totalPages}
                  page={taskData.data.currentPage + 1}
                  onChange={(e: any, value: number) => {
                    setPage(value - 1);
                  }}
                />
              )}
            </Box>
          </>
        ) : (
          <>
            <TaskTable
              data={{
                tasksAndWp: paginatedRows,
              }}
              onSelectRows={handleSelectRows}
              selectedRows={selectedRows}
              linkedIds={[]}
              isDataEnriched
              targetType={targetType}
            />
            <Box
              position="absolute"
              bottom="11px"
              display="flex"
              justifyContent="center"
              alignItems="center"
            >
              {selectedRows.length > 0 && (
                <SelectRowsPerPage
                  rowsPerPage={limit}
                  onChangeRowsPerPage={(e: any) => setLimit(e.target.value)}
                />
              )}
              {selectedRows.length > limit && (
                <Pagination
                  count={
                    selectedRows.length % limit === 0
                      ? selectedRows.length / limit
                      : Math.trunc(selectedRows.length / limit) + 1
                  }
                  page={showTaskPage + 1}
                  onChange={(e: any, value: number) => {
                    setShowTaskPage(value - 1);
                  }}
                />
              )}
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
};

export default FormToTaskLinkTabOption;
