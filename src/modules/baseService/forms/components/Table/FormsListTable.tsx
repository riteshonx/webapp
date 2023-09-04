import React, { ReactElement, useContext, useEffect } from "react";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableSortLabel from "@material-ui/core/TableSortLabel";
import Paper from "@material-ui/core/Paper";
import FileCopyIcon from "@material-ui/icons/FileCopy";
import IconButton from "@material-ui/core/IconButton";
import StarIcon from "@material-ui/icons/Star";
import moment from "moment";
import { useHistory } from "react-router-dom";
import {
  canCreateTemplate,
  canUpdateTemplates,
  canViewTemplates,
} from "../../utils/permission";
import "./FormsListTable.scss";
import { ITemplate } from "../../models/template";
import { CustomMenuList } from "../CustomMenuItem/CustomMenuItem";
import NoDataMessage from "../../../../shared/components/NoDataMessage/NoDataMessage";
import { Grid, Tooltip } from "@material-ui/core";
import { stateContext } from "../../../../root/context/authentication/authContext";
import { getUniqueName } from "../../../../../utils/helper";

type Order = "asc" | "desc";

const noPermissionMessage =
  "You don't have permission to view the form templates.";

function descendingComparator<T>(a: any, b: any, orderBy: any) {
  if (
    b[orderBy].toString().toLocaleLowerCase() <
    a[orderBy].toString().toLocaleLowerCase()
  ) {
    return -1;
  }
  if (
    b[orderBy].toString().toLocaleLowerCase() >
    a[orderBy].toString().toLocaleLowerCase()
  ) {
    return 1;
  }
  return 0;
}

function getComparator<Key extends keyof ITemplate>(
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

function stableSort<T>(
  array: ITemplate[],
  comparator: (a: any, b: any) => number
) {
  const stabilizedThis = array.map(
    (el, index) => [el, index] as [ITemplate, any]
  );
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

interface HeadCell {
  disablePadding: boolean;
  id: keyof ITemplate;
  label: string;
  numeric: boolean;
  sorting: boolean;
}

interface EnhancedTableProps {
  onRequestSort: (
    event: React.MouseEvent<unknown>,
    property: keyof ITemplate
  ) => void;
  order: Order;
  orderBy: string;
  disableActions: boolean;
}

interface TableProps {
  rows: Array<ITemplate>;
  defaultTemplate: (event: ITemplate) => void;
  preview: (event: ITemplate) => void;
  deleteTemplate: (event: ITemplate) => void;
  configureTemplate: (event: ITemplate) => void;
  disableActions: boolean;
}

/**
 * Head cell configuration
 */
const headCells: HeadCell[] = [
  {
    id: "templateName",
    numeric: false,
    disablePadding: true,
    label: "Template Name",
    sorting: true,
  },
  {
    id: "createdBy",
    numeric: true,
    disablePadding: true,
    label: "Created By",
    sorting: true,
  },
  {
    id: "createdAt",
    numeric: false,
    disablePadding: true,
    label: "Created On",
    sorting: true,
  },
  {
    id: "updatedBy",
    numeric: true,
    disablePadding: true,
    label: "Modified By",
    sorting: true,
  },
  {
    id: "updatedAt",
    numeric: false,
    disablePadding: true,
    label: "Modified On",
    sorting: true,
  },
  {
    id: "numberOfFields",
    numeric: true,
    disablePadding: true,
    label: "No. Fields",
    sorting: true,
  },
  {
    id: "noOfProjects",
    numeric: true,
    disablePadding: true,
    label: "No. Projects",
    sorting: true,
  },
  {
    id: "actions",
    numeric: true,
    disablePadding: false,
    label: "Actions",
    sorting: false,
  },
];

/**
 * Component to render headet cells of table
 * @param props : EnhancedTableProps
 * @returns : RecatElement
 */
function EnhancedTableHead(props: EnhancedTableProps) {
  const { order, orderBy, onRequestSort, disableActions } = props;
  let headCellsFiltered = headCells;
  if (disableActions) {
    headCellsFiltered = headCells.filter(
      (headCell) => headCell.id !== "actions"
    );
  }
  const createSortHandler =
    (property: HeadCell) => (event: React.MouseEvent<unknown>) => {
      if (property.sorting) {
        onRequestSort(event, property.id);
      }
    };

  return (
    <TableHead>
      <TableRow>
        {headCellsFiltered.map((headCell) => (
          <TableCell
            className="formlistTable__headecell"
            key={headCell.id}
            align="left"
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              data-testid={`${headCell.id}-sort`}
              active={orderBy === headCell.id && headCell.sorting}
              direction={orderBy === headCell.id ? order : "asc"}
              onClick={createSortHandler(headCell)}
              hideSortIcon={!headCell.sorting}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <span className="formlistTable__visuallyHidden">
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

/**
 * Component to render Table of Form templates
 * @param props : TableProps
 * @returns : ReactElement
 */
export default function EnhancedTable(props: TableProps): ReactElement {
  const { state }: any = useContext(stateContext);
  const [order, setOrder] = React.useState<Order>("asc");
  const [orderBy, setOrderBy] = React.useState<keyof ITemplate>("templateName");
  const history = useHistory();

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: keyof ITemplate
  ) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const makeDefault = (argItem: ITemplate) => {
    props.defaultTemplate(argItem);
  };

  const deleteTemplate = (argItem: ITemplate) => {
    props.deleteTemplate(argItem);
  };

  const configureTemplate = (argItem: ITemplate) => {
    props.configureTemplate(argItem);
  };

  const previewTemplate = (argItem: ITemplate) => {
    if ((canViewTemplates && !canUpdateTemplates) || props.disableActions)
      props.preview(argItem);
    else if (canUpdateTemplates) {
      history.push(`/base/forms/details/${argItem.id}`);
    }
  };

  const copyTemplate = (argItem: ITemplate) => {
    const names = props.rows.map((item: any) => item.templateName);
    names.push(argItem.templateName);
    const copiedName = getUniqueName(names);
    history.push(`/base/forms/copy/${argItem.id}/${copiedName}`);
  };

  return (
    <div className="formlistTable__root">
      {canViewTemplates ? (
        <Paper className="formlistTable__paper">
          <TableContainer className="formlistTable__container">
            <Table
              className="formlistTable__tabl"
              aria-labelledby="tableTitle"
              size={"medium"}
              aria-label="enhanced table"
              stickyHeader
            >
              <EnhancedTableHead
                order={order}
                orderBy={orderBy}
                onRequestSort={handleRequestSort}
                disableActions={props.disableActions}
              />
              {props.rows.length > 0 ? (
                <TableBody>
                  {stableSort(props.rows, getComparator(order, orderBy)).map(
                    (row: ITemplate, index: number) => {
                      return (
                        <TableRow
                          role="checkbox"
                          key={`${row.templateName}-${index}`}
                          className="formlistTable__row"
                        >
                          <TableCell
                            className="formlistTable__cell"
                            onClick={() => previewTemplate(row)}
                          >
                            <div
                              className="formlistTable__cell__namefield"
                              data-testid={`template-name-${index}`}
                            >
                              <Tooltip
                                title={row.templateName}
                                aria-label="Template Name"
                              >
                                <span>
                                  {row.templateName.length > 20
                                    ? `${row.templateName.slice(0, 18)} . . .`
                                    : row.templateName}
                                </span>
                              </Tooltip>
                              {row.default ? (
                                <Tooltip
                                  title="This is the default Template for this Form. This Template will be associated with new projects that are created"
                                  aria-label="Template Name"
                                >
                                  <StarIcon className="formlistTable__cell__namefield__icon" />
                                </Tooltip>
                              ) : (
                                ""
                              )}
                            </div>
                          </TableCell>
                          <TableCell
                            className="formlistTable__cell"
                            align="left"
                            onClick={() => previewTemplate(row)}
                            data-testid={`template-createdby-${index}`}
                          >
                            <Tooltip
                              title={row.createdBy}
                              aria-label="createdBy"
                            >
                              <label>
                                {row.createdBy.length > 20
                                  ? `${row.createdBy.slice(0, 18)} . . .`
                                  : row.createdBy}
                              </label>
                            </Tooltip>
                          </TableCell>
                          <TableCell
                            className="formlistTable__cell"
                            onClick={() => previewTemplate(row)}
                            align="left"
                            data-testid={`template-createdat-${index}`}
                          >
                            <Tooltip
                              title={moment(row.createdAt).format(
                                "DD MMM YYYY"
                              )}
                              aria-label="Created At"
                            >
                              <label>
                                {" "}
                                {moment(row.createdAt).format("DD MMM YYYY")}
                              </label>
                            </Tooltip>
                          </TableCell>
                          <TableCell
                            className="formlistTable__cell"
                            align="left"
                            onClick={() => previewTemplate(row)}
                            data-testid={`template-updatedby-${index}`}
                          >
                            <Tooltip
                              title={row.updatedBy}
                              aria-label="updated By"
                            >
                              <label>
                                {row.updatedBy.length > 20
                                  ? `${row.updatedBy.slice(0, 18)} . . .`
                                  : row.updatedBy}
                              </label>
                            </Tooltip>
                          </TableCell>
                          <TableCell
                            className="formlistTable__cell"
                            onClick={() => previewTemplate(row)}
                            align="left"
                            data-testid={`template-updateat-${index}`}
                          >
                            <Tooltip
                              title={moment(row.updatedAt).format(
                                "DD MMM YYYY"
                              )}
                              aria-label="Updated at"
                            >
                              <label>
                                {moment(row.updatedAt).format("DD MMM YYYY")}
                              </label>
                            </Tooltip>
                          </TableCell>
                          <TableCell
                            className="formlistTable__cell"
                            align="left"
                            onClick={() => previewTemplate(row)}
                            data-testid={`template-nooffields-${index}`}
                          >
                            <Tooltip
                              title={row.numberOfFields}
                              aria-label="number of fields"
                            >
                              <label>{row.numberOfFields}</label>
                            </Tooltip>
                          </TableCell>
                          <TableCell
                            className="formlistTable__cell"
                            align="left"
                            onClick={() => previewTemplate(row)}
                            data-testid={`template-noofprojects-${index}`}
                          >
                            <Tooltip
                              title={row.noOfProjects}
                              aria-label="number of Projects"
                            >
                              <label>{row.noOfProjects}</label>
                            </Tooltip>
                          </TableCell>
                          {!props.disableActions && (
                            <TableCell
                              className="formlistTable__cell"
                              align="left"
                              data-testid={`template-action-${index}`}
                            >
                              <Grid container>
                                <Grid item xs={6}>
                                  {canCreateTemplate && (
                                    <Tooltip
                                      title={`Copy ${row.templateName}`}
                                      aria-label="number of fields"
                                    >
                                      <IconButton
                                        className="formlistTable__button"
                                        onClick={() => copyTemplate(row)}
                                        data-testid={`template-copy-${index}`}
                                      >
                                        <FileCopyIcon className="formlistTable__cellicon" />
                                      </IconButton>
                                    </Tooltip>
                                  )}
                                </Grid>
                                <Grid item xs={6}>
                                  <CustomMenuList
                                    index={index}
                                    makeDefault={makeDefault}
                                    deleteTemplate={deleteTemplate}
                                    configureTemplate={configureTemplate}
                                    previewTemplate={previewTemplate}
                                    row={row}
                                  />
                                </Grid>
                              </Grid>
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    }
                  )}
                </TableBody>
              ) : (
                ""
              )}
            </Table>
          </TableContainer>
        </Paper>
      ) : !state.isLoading ? (
        <div className="no-permission">
          <NoDataMessage message={noPermissionMessage} />
        </div>
      ) : (
        ""
      )}
    </div>
  );
}
