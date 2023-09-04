import React, { useContext, useEffect, useState } from "react";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableSortLabel from "@material-ui/core/TableSortLabel";
import Paper from "@material-ui/core/Paper";
import { Tooltip } from "@material-ui/core";
import EditIcon from "@material-ui/icons/Edit";
import "./ProjectTable.scss";

import NoDataMessage from "../../../../shared/components/NoDataMessage/NoDataMessage";
import { stateContext } from "../../../../root/context/authentication/authContext";
import { match, useHistory, useRouteMatch } from "react-router-dom";
import { canUpdateProject } from "../../../roles/utils/permission";
import { validateTableCell } from "../../../../../utils/helper";
import { projectDetailsContext } from "../../Context/ProjectDetailsContext";

export interface Params {
  projectId: string;
}

interface tableHeader {
  name: string;
  type: string;
  stage: string;
  location: number;
  action: string;
  portfolio: any;
}
interface rowData {
  name: string;
  type: string;
  stage: string;
  location: number;
  action: string;
  address: addressInfo;
  config: configInfo;
  id: number;
  status: number;
  portfolio: any;
}

export interface addressInfo {
  city: string;
  country: string;
  pin: string;
  state: string;
}
export interface configInfo {
  projectCode: string;
  type: string;
  stage: string;
}

interface message {
  header: string;
  text: string;
  cancel: string;
  proceed: string;
}

const confirmMessage: message = {
  header: "Are you sure?",
  text: "If you delete this task, all data related to this task will be lost.",
  cancel: "Cancel",
  proceed: "Proceed",
};

const noDataMessage = "There are no active projects";

function createData(
  name: string,
  type: string,
  stage: string,
  location: number,
  action: string,
  address: addressInfo,
  config: configInfo,
  id: number,
  status: number,
  portfolio: any
): rowData {
  return {
    name,
    type,
    stage,
    location,
    action,
    address,
    config,
    id,
    status,
    portfolio,
  };
}

function descendingComparator(a: any, b: any, orderBy: keyof any) {
  return b[orderBy].localeCompare(a[orderBy], undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

type Order = "asc" | "desc";

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

function stableSort<T>(array: T[], comparator: (a: T, b: T) => number) {
  const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

interface HeadCell {
  disablePadding: boolean;
  id: keyof tableHeader;
  label: string;
  numeric: boolean;
  isSorting: boolean;
}

const headCells: HeadCell[] = [
  {
    id: "name",
    numeric: false,
    disablePadding: true,
    label: "Name",
    isSorting: false,
  },
  {
    id: "portfolio",
    numeric: false,
    disablePadding: true,
    label: "Portfolio",
    isSorting: true,
  },
  {
    id: "type",
    numeric: false,
    disablePadding: true,
    label: "Type",
    isSorting: false,
  },
  {
    id: "stage",
    numeric: false,
    disablePadding: true,
    label: "Stage",
    isSorting: false,
  },
  {
    id: "location",
    numeric: true,
    disablePadding: true,
    label: "Address ",
    isSorting: true,
  },
];

interface EnhancedTableProps {
  classes: ReturnType<typeof useStyles>;
  onRequestSort: (
    event: React.MouseEvent<unknown>,
    property: keyof rowData
  ) => void;
  order: Order;
  orderBy: string;
  rowCount: number;
}

function EnhancedTableHead(props: EnhancedTableProps) {
  const { classes, order, orderBy, onRequestSort } = props;
  const { projectDetailsState, projectDetailsDispatch }: any = useContext(
    projectDetailsContext
  );
  const createSortHandler =
    (property: keyof rowData, isSorting: boolean) =>
    (event: React.MouseEvent<unknown>) => {
      if (!isSorting) {
        onRequestSort(event, property);
      }
    };

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) =>
          headCell.id !== "action" ? (
            <TableCell
              className={classes.headecell}
              key={headCell.id}
              align="left"
              sortDirection={orderBy === headCell.id ? order : false}
            >
              <TableSortLabel
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : "asc"}
                onClick={createSortHandler(headCell.id, headCell.isSorting)}
                hideSortIcon={headCell.isSorting}
              >
                {headCell.label}
                {orderBy === headCell.id ? (
                  <span className={classes.visuallyHidden}>
                    {order === "desc"
                      ? "sorted descending"
                      : "sorted ascending"}
                  </span>
                ) : null}
              </TableSortLabel>
            </TableCell>
          ) : (
            (canUpdateProject ||
              projectDetailsState?.projectUpdatePermission
                ?.canUpdateMyProject) && (
              <TableCell
                className={classes.headecell}
                key={headCell.id}
                align="left"
                sortDirection={orderBy === headCell.id ? order : false}
              >
                <TableSortLabel
                  active={orderBy === headCell.id}
                  direction={orderBy === headCell.id ? order : "asc"}
                  onClick={createSortHandler(headCell.id, headCell.isSorting)}
                  hideSortIcon={headCell.isSorting}
                >
                  {headCell.label}
                  {orderBy === headCell.id ? (
                    <span className={classes.visuallyHidden}>
                      {order === "desc"
                        ? "sorted descending"
                        : "sorted ascending"}
                    </span>
                  ) : null}
                </TableSortLabel>
              </TableCell>
            )
          )
        )}
      </TableRow>
    </TableHead>
  );
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      marginTop: "25px",
      width: "100%",
      "& .MuiPaper-elevation1": {
        boxShadow: "none",
      },
    },
    container: {
      height: "calc(100vh - 250px)",
      width: "100%",
      flexGrow: 1,
      padding: "0px 1px",
      overflow: "auto",
    },
    paper: {
      width: "100%",
      marginBottom: theme.spacing(0),
    },
    table: {
      //   minWidth: 750,
    },
    visuallyHidden: {
      border: 0,
      clip: "rect(0 0 0 0)",
      height: 1,
      margin: 0,
      overflow: "hidden",
      padding: 0,
      position: "absolute",
      top: 20,
      width: 1,
    },
    cell: {
      fontSize: "11px",
      color: "#333333",
    },
    projectNameTableCell: {
      width: "200px",
    },
    projectNameLabel: {
      display: "inline-block",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      maxWidth: "300px",
    },
    headecell: {
      fontSize: "12px",
      color: "#333333",
      fontWeight: 600,
    },
    cellicon: {
      fontSize: "16px",
      cursor: "pointer",
      color: "#B0B0B0",
    },
  })
);

export default function EnhancedTable(props: any): any {
  const { state }: any = useContext(stateContext);
  const classes = useStyles();
  const [order, setOrder] = React.useState<Order>("asc");
  const [orderBy, setOrderBy] = React.useState<keyof rowData>("name");
  const [projectList, setProjectList] = useState<Array<any>>([]);
  const [selectedProject, setSelectedProject] = useState<any>();
  const history = useHistory();
  const pathMatch: match<Params> = useRouteMatch();
  const { projectDetailsState, projectDetailsDispatch }: any = useContext(
    projectDetailsContext
  );

  useEffect(() => {
    setProjectList(props.projectList);
  }, [props.projectList]);

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: keyof rowData
  ) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const rows: any = [];
  const allTaskData: any = [];

  projectList?.forEach((row: rowData) => {
    allTaskData.push(row);
    rows?.push(
      createData(
        row.name,
        row.config?.type,
        row.config?.stage,
        row.location,
        " ",
        row.address,
        row.config,
        row.id,
        row.status,
        row.portfolio
      )
    );
  });

  const editProject = (row: rowData) => {
    setSelectedProject(row);
    history.push(`/base/project-lists/${row?.id}/teams`);
    props.updateProject();
  };

  const view = (row: rowData) => {
    if (
      !canUpdateProject &&
      !projectDetailsState?.projectUpdatePermission?.canUpdateMyProject
    ) {
      setSelectedProject(row);
      history.push(`/base/project-lists/${row?.id}/teams`);
      props.updateProject();
    }
  };

  return (
    <div className={classes.root}>
      <Paper className={classes.paper}>
        <TableContainer className={classes.container}>
          <Table
            stickyHeader
            className={classes.table}
            aria-labelledby="tableTitle"
            aria-label="enhanced table"
          >
            <EnhancedTableHead
              classes={classes}
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
              rowCount={rows.length}
            />
            {rows.length > 0 ? (
              <TableBody>
                {stableSort(rows, getComparator(order, orderBy)).map(
                  (row: any) => {
                    return (
                      <TableRow
                        key={row.id}
                        onClick={() => view(row)}
                        className={"projectTable_row"}
                      >
                        <TableCell
                          className={`${classes.cell} ${classes.projectNameTableCell} `}
                          onClick={() => editProject(row)}
                        >
                          <Tooltip title={row.name} aria-label="project name">
                            <label className={classes.projectNameLabel}>
                              {row.name}
                            </label>
                          </Tooltip>
                        </TableCell>
                        <TableCell
                          className={classes.cell}
                          onClick={() => editProject(row)}
                        >
                          {validateTableCell(row.portfolio)}
                        </TableCell>
                        <TableCell
                          className={classes.cell}
                          onClick={() => editProject(row)}
                        >
                          {validateTableCell(row.type)}
                        </TableCell>
                        <TableCell
                          className={classes.cell}
                          onClick={() => editProject(row)}
                        >
                          {validateTableCell(row.stage)}
                        </TableCell>
                        <TableCell
                          className={classes.cell}
                          onClick={() => editProject(row)}
                        >
                          <Tooltip title={row?.address}>
                            <label>
                              {row?.address?.length > 40
                                ? `${row?.address.slice(0, 35)}...`
                                : row?.address}
                            </label>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  }
                )}
              </TableBody>
            ) : !state.isLoading ? (
              <TableBody>
                <TableRow>
                  <TableCell colSpan={7} align={"center"}>
                    <NoDataMessage message={noDataMessage} />
                  </TableCell>
                </TableRow>
              </TableBody>
            ) : (
              ""
            )}
          </Table>
        </TableContainer>
      </Paper>
    </div>
  );
}
