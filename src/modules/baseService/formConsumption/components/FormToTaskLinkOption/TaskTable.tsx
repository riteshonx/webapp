import { useContext, useEffect, useState } from "react";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableSortLabel from "@material-ui/core/TableSortLabel";
import Checkbox from "@material-ui/core/Checkbox";
import { Order, stableSort } from "src/utils/helper";
import moment from "moment";
import Pagination from "./Pagination";
import { useParams } from "react-router-dom";
import { projectContext } from "../../Context/projectContext";
import { LinkRelationship } from "src/utils/constants";
import { Close as CloseIcon } from "@material-ui/icons";
import { Box } from "@material-ui/core";

interface Data {
  taskId: string;
  taskName: string;
  taskType: string;
  parentTask: string;
  status: string;
  startDate: string;
  constraint: boolean;
  isNew: boolean;
  constraintName: string;
  sourceId: string;
  sourceType: string;
  targetType: number;
  relation: string;
}

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key
): (
  a: { [key in Key]: number | string },
  b: { [key in Key]: number | string }
) => number {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

interface HeadCell {
  disablePadding: boolean;
  id: keyof Data;
  label: string;
  numeric: boolean;
}

const headCells: HeadCell[] = [
  {
    id: "taskName",
    numeric: false,
    disablePadding: true,
    label: "Activity Name",
  },
  {
    id: "taskType",
    numeric: false,
    disablePadding: false,
    label: "Activity Type",
  },
  {
    id: "parentTask",
    numeric: false,
    disablePadding: false,
    label: "Parent Task",
  },
  { id: "status", numeric: false, disablePadding: false, label: "Status" },
  {
    id: "startDate",
    numeric: false,
    disablePadding: false,
    label: "Start Date",
  },
];

interface EnhancedTableHeadProps {
  classes: ReturnType<typeof useStyles>;
  numSelected: number;
  onRequestSort: (
    event: React.MouseEvent<unknown>,
    property: keyof Data
  ) => void;
  order: Order;
  orderBy: string;
  rowCount: number;
}

function EnhancedTableHead(props: EnhancedTableHeadProps) {
  const { classes, order, orderBy, numSelected, rowCount, onRequestSort } =
    props;
  const createSortHandler =
    (property: keyof Data) => (event: React.MouseEvent<unknown>) => {
      onRequestSort(event, property);
    };

  return (
    <TableHead className={classes.tableHead}>
      <TableRow>
        <TableCell padding="checkbox"></TableCell>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align="left"
            padding="none"
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : "asc"}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <span className={classes.visuallyHidden}>
                  {order === "desc" ? "sorted descending" : "sorted ascending"}
                </span>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: "100%",
    },
    paper: {
      width: "100%",
      marginBottom: theme.spacing(2),
    },
    table: {
      minWidth: 750,
    },
    tableHead: {
      position: "sticky",
      top: "0px",
      left: 0,
      right: 0,
      background: "white",
      zIndex: 10,
    },
    visuallyHidden: {
      border: 0,
      clip: "rect(0 0 0 0)",
      height: 1,
      margin: -1,
      overflow: "hidden",
      padding: 0,
      position: "absolute",
      top: 20,
      width: 1,
    },
    center: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      width: "90%",
      position: "absolute",
      bottom: "10px",
    },
    tableRow: {
      "&.Mui-selected, &.Mui-selected:hover": {
        backgroundColor: "#f5f5f5",
      },
    },
    tableCheckBox: {
      "&.Mui-checked": {
        color: "black",
      },
      "&.Mui-disabled": {
        color: "#c7c7c7",
      },
    },
    deleteIcon: {
      margin: "1rem",
      "&:hover": { cursor: "pointer" },
    },
  })
);

export default function TaskTable({
  data: { tasksAndWp },
  onSelectRows,
  selectedRows,
  linkedIds,
  isDataEnriched = false,
  targetType,
}: any) {
  const params: any = useParams();
  const { projectState }: any = useContext(projectContext);
  const classes = useStyles();
  const [order, setOrder] = useState<Order>("asc");
  const [orderBy, setOrderBy] = useState<keyof Data>("taskName");

  const PAGE_LIMIT = 5;
  let rows: any = [];

  function createData(
    taskId: string,
    taskName: string,
    taskType: string,
    parentTask: string,
    status: string,
    startDate: string,
    constraint: boolean,
    isNew: boolean,
    constraintName: string,
    sourceId: string,
    sourceType: string,
    targetType: number,
    relation: string
  ): Data {
    return {
      taskId,
      taskName,
      taskType,
      parentTask,
      status,
      startDate,
      constraint,
      isNew,
      constraintName,
      sourceId,
      sourceType,
      targetType,
      relation,
    };
  }

  if (isDataEnriched) {
    //for viewing selected data
    rows = tasksAndWp;
  } else {
    rows = tasksAndWp.map((item: any) =>
      createData(
        item.id,
        item.taskName,
        item.taskType,
        item.parentDetails.taskName,
        item.status,
        item.plannedStartDate,
        false,
        true,
        "FORM_TO_TASK",
        params.formId,
        projectState?.currentFeature.id,
        targetType,
        LinkRelationship.RELATES_TO
      )
    );
  }

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: keyof Data
  ) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleClick = (
    event: React.ChangeEvent<unknown>,
    row: Data,
    isDisabled: boolean
  ) => {
    if (isDisabled) return;
    const newSelectedRows: any = [...selectedRows];
    const selectedRow = selectedRows.find(
      (item: any) => item.taskId === row.taskId
    );
    if (selectedRow) {
      const filtered = newSelectedRows.filter(
        (item: any) => item.taskId !== row.taskId
      );
      onSelectRows(filtered);
    } else {
      newSelectedRows.push(row);
      onSelectRows(newSelectedRows);
    }
  };

  const isSelected = (id: string) =>
    selectedRows.some((item: any) => item.taskId === id);

  const isAlreadyLinked = (id: string) => linkedIds.indexOf(id) !== -1;

  return (
    <>
      <TableContainer className={classes.root}>
        <Table
          color="default"
          className={classes.table}
          aria-labelledby="tableTitle"
          size={"medium"}
          aria-label="enhanced table"
        >
          {rows.length > 0 && (
            <>
              <EnhancedTableHead
                classes={classes}
                numSelected={selectedRows.length}
                order={order}
                orderBy={orderBy}
                onRequestSort={handleRequestSort}
                rowCount={rows.length}
              />
              <TableBody>
                {stableSort(rows, getComparator(order, orderBy)).map(
                  (row, index) => {
                    const isItemSelected = isSelected(row.taskId);
                    const isItemAlreadyLinked = isAlreadyLinked(row.taskId);
                    const isRowSelected = isItemSelected || isItemAlreadyLinked;

                    const labelId = `enhanced-table-checkbox-${index}`;
                    return (
                      <TableRow
                        hover
                        role="checkbox"
                        aria-checked={isRowSelected}
                        tabIndex={-1}
                        key={row.taskId}
                        selected={isRowSelected}
                        className={classes.tableRow}
                      >
                        <TableCell padding="checkbox">
                          {isDataEnriched ? (
                            <div
                              onClick={(event) =>
                                handleClick(event, row, isItemAlreadyLinked)
                              }
                            >
                              <CloseIcon className={classes.deleteIcon} />
                            </div>
                          ) : (
                            <Checkbox
                              onChange={(event) =>
                                handleClick(event, row, isItemAlreadyLinked)
                              }
                              checked={isRowSelected}
                              disabled={isItemAlreadyLinked}
                              inputProps={{ "aria-labelledby": labelId }}
                              className={classes.tableCheckBox}
                            />
                          )}
                        </TableCell>
                        <TableCell
                          component="th"
                          id={labelId}
                          scope="row"
                          padding="none"
                        >
                          {row.taskName}
                        </TableCell>
                        <TableCell padding="none" align="left">
                          {(() => {
                            switch (row.taskType) {
                              case "task":
                                return "Task";
                              case "work_package":
                                return "Work Package";
                              default:
                                return "-";
                            }
                          })()}
                        </TableCell>
                        <TableCell padding="none" align="left">
                          {row.parentTask}
                        </TableCell>
                        <TableCell padding="none" align="left">
                          {row.status}
                        </TableCell>
                        <TableCell padding="none" align="left">
                          {moment(row.startDate).utc().format("DD-MMM-YYYY")}
                        </TableCell>
                      </TableRow>
                    );
                  }
                )}
              </TableBody>
            </>
          )}
        </Table>
      </TableContainer>
    </>
  );
}
