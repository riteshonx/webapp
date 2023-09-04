import { withStyles, createStyles, makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import { useHistory, useParams } from "react-router-dom";
import { formatDateWithDay, formatDate } from "../../utils";
import Box from "@material-ui/core/Box";
import CircularProgress from "@material-ui/core/CircularProgress";
import AbsoluteCenteredBox from "../Micro/AbsoluteCenteredBox";
import { useMemo,useContext } from "react";
import moment from "moment";
import Tooltip from "@material-ui/core/Tooltip";
import InfoIcon from "@material-ui/icons/Info";
import IconButton from "@material-ui/core/IconButton";
import { DailyLogContext } from "../../DailyLogRouting";
import { setSelectedLogDate } from "../../actions";

const paths = (projectId: string) => {
  return {
    base: `/dailyLogs/projects/${projectId}`,
    get summary() {
      return `${this.base}/summary`;
    },
    get viewLog() {
      return `${this.base}/view`;
    },
    get updateLog() {
      return `${this.base}/update`;
    },
  };
};

const StyledTableCell = withStyles(() =>
  createStyles({
    root: {
      "&:hover": {
        cursor: ({ shouldUnderline, shouldDisable }: any) =>
          !shouldDisable && shouldUnderline && "pointer",
      },
      textDecoration: ({ shouldDisable, shouldUnderline }: any) =>
        !shouldDisable && shouldUnderline && "underline",
    },
    head: {
      backgroundColor: "#edecec",
      color: "#000",
      fontWeight: "bold",
    },
    body: {
      fontSize: 14,
      color: ({ isGrouped, isCreatedBy }: any) =>
        isGrouped ? "#fff" : isCreatedBy ? "var(--onx-btn-primary)" : "Intial",
    },
  })
)(TableCell);

const StyledTableRow = withStyles(() =>
  createStyles({
    root: {
      backgroundColor: ({ isGrouped, shouldDisable }: any) =>
        shouldDisable ? "#cccccc" : isGrouped ? "var(--onx-btn-primary)" : "",
    },
  })
)(TableRow);

const useStyles = makeStyles({
  tableContainer: {
    marginTop: "2rem",
    maxHeight: "70vh",
  },
  table: {
    minWidth: 700,
  },
  tableHead: {
    position: "sticky",
    top: 0,
  },
  infoButton: {
    padding: "0 10px",
    "&:hover": {
      background: "none",
    },
  },
  infoIcon: {
    fill: "#7e7e7e",
    fontSize: "2rem",
  },
});

export interface DailyLogItem {
  id: string;
  createdAt: string;
  createdBy: string;
  userId: string;
  formId: number;
  isGroupRow: boolean;
}

interface DailyLogTableProps {
  data: Array<DailyLogItem>;
  isLoading: boolean;
  hasError: boolean;
  hasDataAfterFetch: boolean;
}

export default function DailyLogTable({
  data,
  isLoading,
  hasError,
  hasDataAfterFetch,
}: DailyLogTableProps) {
  const {state: dailyLogState, dispatch: dailyLogDispatch} = useContext(DailyLogContext)
  const classes = useStyles();
  const history = useHistory();
  const params: any = useParams();
  const pathsValue = useMemo(() => paths(params.projectId), [params.projectId]);
  const today = moment().utc().format("YYYY-MM-DD");

  const handleUserLogRowClick = (row: DailyLogItem) => {
    dailyLogDispatch(setSelectedLogDate(row.createdAt))
    history.push(pathsValue.updateLog + `/${row.formId}`);
    // if (today === row.createdAt)
    //   history.push(pathsValue.updateLog + `/${row.formId}`);
    // else history.push(pathsValue.viewLog + `/${row.userId}/${row.createdAt}`);
  };

  const handleGroupedLogRowClick = (row: DailyLogItem) => {
    if (today === row.createdAt) return;
    history.push(pathsValue.summary + `/${row.createdAt}`);
  };

  return (
    <Box position="relative" minHeight="200px" marginLeft='50px'>
      <TableContainer className={classes.tableContainer}>
        <Table className={classes.table} aria-label="customized table">
          <TableHead className={classes.tableHead}>
            <TableRow>
              <StyledTableCell>Report Date</StyledTableCell>
              <StyledTableCell>Created By</StyledTableCell>
            </TableRow>
          </TableHead>
          {!hasError && !isLoading && (
            <TableBody>
              {data.map((row, index) => {
                const shouldDisableRow = row.createdAt === today;
                return row.isGroupRow ? (
                  <StyledTableRow
                    key={row.id + index}
                    isGrouped
                    shouldDisable={shouldDisableRow}
                  >
                    <StyledTableCell
                      onClick={() => handleGroupedLogRowClick(row)}
                      scope="row"
                      isGrouped
                      shouldUnderline
                      shouldDisable={shouldDisableRow}
                    >
                      <div>
                        {formatDateWithDay(row.createdAt)}
                        {shouldDisableRow && (
                          <Tooltip title="The report summary for the current day will be generated the next day">
                            <IconButton
                              classes={{ root: classes.infoButton }}
                              disableRipple
                              disableFocusRipple
                              disableTouchRipple
                            >
                              <InfoIcon classes={{ root: classes.infoIcon }} />
                            </IconButton>
                          </Tooltip>
                        )}
                      </div>
                    </StyledTableCell>
                    <StyledTableCell isGrouped></StyledTableCell>
                  </StyledTableRow>
                ) : (
                  <StyledTableRow key={row.id + index}>
                    <StyledTableCell scope="row">
                      {formatDate(row.createdAt)}
                    </StyledTableCell>
                    <StyledTableCell
                      shouldUnderline
                      isCreatedBy
                      onClick={() => handleUserLogRowClick(row)}
                    >
                      {row.createdBy}
                    </StyledTableCell>
                  </StyledTableRow>
                );
              })}
            </TableBody>
          )}
        </Table>
      </TableContainer>
      {hasError ? (
        <AbsoluteCenteredBox color="#cc4444">
          Something went wrong
        </AbsoluteCenteredBox>
      ) : isLoading ? (
        <AbsoluteCenteredBox>
          <CircularProgress style={{ color: "#000" }} />
          <p style={{ marginTop: "1rem" }}>Please wait..</p>
        </AbsoluteCenteredBox>
      ) : (
        !hasDataAfterFetch && (
          <AbsoluteCenteredBox style={{ fontWeight: "bold" }}>
            No logs found
          </AbsoluteCenteredBox>
        )
      )}
    </Box>
  );
}
