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
import "./FormAssociationTable.scss";
import NoDataMessage from "../../../../shared/components/NoDataMessage/NoDataMessage";
import { stateContext } from "../../../../root/context/authentication/authContext";
import VisibilityIcon from "@material-ui/icons/Visibility";
import StatusListIcon from "@material-ui/icons/FormatListBulletedOutlined";
import { projectDetailsContext } from "../../../projects/Context/ProjectDetailsContext";

export interface Params {
  projectId: string;
}

interface tableHeader {
  formName: string;
  formType: string;
  workflow: string;
}

interface rowData {
  formName: string;
  formType: string;
  workflow: string;
  featureId: number;
  templateId: number;
}

const noDataMessage = "No data found";

function createData(
  formName: string,
  formType: string,
  workflow: string,
  featureId: number,
  templateId: number,
  worflowId: number
): rowData {
  return { formName, formType, workflow, featureId, templateId };
}

function descendingComparator(a: any, b: any, orderBy: keyof any) {
  if (
    b[orderBy]?.toString().toLocaleLowerCase() <
    a[orderBy]?.toString().toLocaleLowerCase()
  ) {
    return -1;
  }
  if (
    b[orderBy]?.toString().toLocaleLowerCase() >
    a[orderBy]?.toString().toLocaleLowerCase()
  ) {
    return 1;
  }
  return 0;
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
    id: "formType",
    numeric: false,
    disablePadding: true,
    label: "Form Type",
    isSorting: true,
  },
  {
    id: "formName",
    numeric: false,
    disablePadding: true,
    label: "Form Name",
    isSorting: true,
  },
  {
    id: "workflow",
    numeric: false,
    disablePadding: true,
    label: "Workflow / Statuslist",
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
  const createSortHandler =
    (property: keyof rowData, isSorting: boolean) =>
    (event: React.MouseEvent<unknown>) => {
      if (isSorting) {
        onRequestSort(event, property);
      }
    };

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            className={classes.headecell}
            key={headCell.id}
            align="left"
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              data-testid={`${headCell.id}-sort`}
              active={orderBy === headCell.id && headCell.isSorting}
              direction={orderBy === headCell.id ? order : "asc"}
              onClick={createSortHandler(headCell.id, headCell.isSorting)}
              hideSortIcon={!headCell.isSorting}
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
      "& .MuiPaper-elevation1": {
        boxShadow: "none",
      },
    },
    container: {
      height: "calc(100vh - 240px)",
      width: "100%",
      flexGrow: 1,
      padding: "0px 1px",
      overflow: "auto",
      margin: "0 0px",
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

    disable: {
      fontSize: "11px",
      color: "#33333380",
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
  const [orderBy, setOrderBy] = React.useState<keyof rowData>("formType");
  const [formAssociationList, setFormAssociationList] = useState<Array<any>>(
    []
  );
  const { projectDetailsState }: any = useContext(projectDetailsContext);

  useEffect(() => {
    if (props?.formAssociationData) {
      setFormAssociationList(props?.formAssociationData);
    }
  }, [props?.formAssociationData]);

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: keyof rowData
  ) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleWorkflowOrStatusClick = (row: any) => {
    if (row?.workflowEnabled) {
      if (
        projectDetailsState?.projectPermission
          ?.canViewProjectTemplateAssociation
      ) {
        props.viewWorkFlow(row);
      }
    } else {
      // if statusList is clicked
      props.openStatusList(row);
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
              rowCount={formAssociationList.length}
            />
            {formAssociationList.length > 0 ? (
              <TableBody className="tenantMembers">
                {stableSort(
                  formAssociationList,
                  getComparator(order, orderBy)
                ).map((row: any) => {
                  return (
                    <TableRow key={row?.templateId}>
                      <TableCell className={classes.cell}>
                        <Tooltip title={row?.formType} aria-label="form type">
                          <label>
                            {row.formType && row?.formType.length > 40
                              ? `${row?.formType.slice(0, 18)} . . .`
                              : row?.formType}
                          </label>
                        </Tooltip>
                      </TableCell>
                      <TableCell className={classes.cell}>
                        <Tooltip title={row?.formName} aria-label="form name">
                          <label>
                            {row?.formName && row?.formName.length > 40
                              ? `${row?.formName.slice(0, 18)} . . .`
                              : row?.formName}
                          </label>
                        </Tooltip>
                      </TableCell>
                      <TableCell className={classes.cell}>
                        {row?.workflow || !row?.workflowEnabled ? (
                          <div
                            className="form-worlflow"
                            onClick={() => handleWorkflowOrStatusClick(row)}
                          >
                            {projectDetailsState?.projectPermission
                              ?.canViewProjectTemplateAssociation && (
                              <div className="form-worlflow__icon">
                                {row?.workflowEnabled ? (
                                  <VisibilityIcon />
                                ) : (
                                  <StatusListIcon />
                                )}
                              </div>
                            )}
                            <div className="form-worlflow__text">
                              {row?.workflowEnabled
                                ? row?.workflow
                                : "Status List"}
                            </div>
                          </div>
                        ) : (
                          ""
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
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
