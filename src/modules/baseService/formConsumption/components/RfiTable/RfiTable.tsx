import React, { useContext, useEffect, useState } from "react";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableSortLabel from "@material-ui/core/TableSortLabel";
import Paper from "@material-ui/core/Paper";
import { Tooltip } from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";

import "./RfiTable.scss";
import { Order, getComparator, stableSort } from "../../../../../utils/helper";
import NoDataMessage from "../../../../shared/components/NoDataMessage/NoDataMessage";
import moment from "moment";
import {
  FIXED_FIELDS,
  WHITELISTED_SORTABLE_HEADERS,
  InputType,
  FeatureId,
} from "../../../../../utils/constants";
import { stateContext } from "../../../../root/context/authentication/authContext";
import ConfirmDialog from "../../../../shared/components/ConfirmDialog/ConfirmDialog";
import { projectContext } from "../../Context/projectContext";
import { useCallback } from "react";

interface message {
  header: string;
  text: string;
  cancel: string;
  proceed: string;
}

const confirmMessage: message = {
  header: "Delete form",
  text: `Are you sure you want to delete this form?`,
  cancel: "Cancel",
  proceed: "Proceed",
};

const noDataMessage = "No forms were found.";

interface IHeadCell {
  disablePadding: boolean;
  id: string;
  label: string;
  numeric: boolean;
  isSortingEnabled: boolean;
  elementId?: string;
  typeId?: number;
}

interface EnhancedTableProps {
  onRequestSort: (property: keyof any) => void;
  order: Order;
  orderBy: any;
  rowCount: number;
  headCells: any;
}

function EnhancedTableHead(props: EnhancedTableProps) {
  const { order, orderBy, onRequestSort } = props;
  const { projectState }: any = useContext(projectContext);
  const createSortHandler =
    (property: string, isSortingEnabled: boolean) => () => {
      if (isSortingEnabled) {
        onRequestSort(property);
      }
    };

  return (
    <TableHead>
      <TableRow>
        {props.headCells.map((headCell: any) =>
          headCell.id !== "action" ? (
            <TableCell
              className="rfiTable__headecell"
              key={headCell.id}
              align="left"
            >
              <TableSortLabel
                active={orderBy === headCell.elementId}
                direction={orderBy === headCell.elementId ? order : "asc"}
                onClick={createSortHandler(
                  headCell.elementId,
                  headCell.isSortingEnabled
                )}
                hideSortIcon={!headCell.isSortingEnabled}
              >
                {headCell.label}
                {orderBy === headCell.id ? (
                  <span className="rfiTable__visuallyHidden">
                    {order === "desc"
                      ? "sorted descending"
                      : "sorted ascending"}
                  </span>
                ) : null}
              </TableSortLabel>
            </TableCell>
          ) : projectState?.featurePermissions?.canDeleteForm ? (
            <TableCell
              className="rfiTable__headecell"
              key={headCell.id}
              align="left"
            >
              <TableSortLabel hideSortIcon={!headCell.isSortingEnabled}>
                {headCell.label}
                {orderBy === headCell.id ? (
                  <span className="rfiTable__visuallyHidden">
                    {order === "desc"
                      ? "sorted descending"
                      : "sorted ascending"}
                  </span>
                ) : null}
              </TableSortLabel>
            </TableCell>
          ) : (
            ""
          )
        )}
      </TableRow>
    </TableHead>
  );
}

export default function EnhancedTable(props: any): any {
  const { order, orderBy, formData, workflowEnabled, handleSortRequest } =
    props;
  const [formsDataArray, setFormsData] = useState<Array<any>>([]);
  const { state }: any = useContext(stateContext);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<any>();
  const [headerArray, setHeaderArray] = useState<Array<any>>([]);
  const { projectState }: any = useContext(projectContext);

  const isSortingEnabled = useCallback((elementId: any, caption = "") => {
    if (caption === "Submittal ID") return false;
    if (Object.values(WHITELISTED_SORTABLE_HEADERS).includes(elementId)) {
      return true;
    }
    return false;
  }, []);

  useEffect(() => {
    setFormsData(formData);
  }, [formData]);

  useEffect(() => {
    setHeaderArray(props.headerArray);
  }, [props.headerArray]);

  let headCellsArray: IHeadCell[] = [];
  const rows: any = [];

  if (headerArray) {
    headCellsArray = [];
    const action = {
      id: "action",
      numeric: false,
      disablePadding: true,
      label: "Actions",
      isSortingEnabled: false,
    };
    const workflow = {
      id: "workFlow",
      numeric: false,
      disablePadding: true,
      label: "Current Workflow Step",
      isSortingEnabled: false,
    };
    headerArray.forEach((item: any) => {
      if (item.caption) {
        headCellsArray.push({
          id: item.caption,
          numeric: false,
          disablePadding: true,
          label: item.caption,
          isSortingEnabled: isSortingEnabled(item.elementId, item.caption),
          elementId: item.elementId,
          typeId: item.fieldTypeId,
        });
      }
    });
    if (workflowEnabled) {
      headCellsArray.push(workflow);
    }
    headCellsArray.push(action);
  }

  // filtering rows based on header array
  const filterByReference = (arr1: any, arr2: any, row: any) => {
    try {
      let res: any = [];
      const formRowData: any = {};
      res = arr1.filter((el: any) => {
        return !arr2.find((element: any) => {
          return element.caption === el.caption;
        });
      });

      // creating row objects
      res.forEach((item: any) => {
        switch (item.typeId) {
          case InputType.TEXT: {
            return (formRowData[item.elementId] = item.value);
          }
          case InputType.INTEGER: {
            if (
              item.elementId === FIXED_FIELDS.PROJECT_AUTO_INCREMENT &&
              props.featureId == FeatureId.SUBMITTAL
            ) {
              return (formRowData[item.elementId] = row.submittalId);
            }
            return (formRowData[item.elementId] = item.value);
          }
          case InputType.TIMEPICKER: {
            return (formRowData[item.elementId] = item.value);
          }
          case InputType.DATEPICKER: {
            return (formRowData[item.elementId] = item.value);
          }
          case InputType.DATETIMEPICKER: {
            return (formRowData[item.elementId] = item.value);
          }
          case InputType.BOOLEAN: {
            return (formRowData[item.elementId] = item.value ? "Yes" : "No");
          }
          case InputType.CUSTOMDROPDOWN: {
            const value: any[] = [];
            item.value?.forEach((lists: any) => {
              lists.configValue.forEach((item: any) => {
                value.push(`${item}`);
              });
            });
            return (formRowData[item.elementId] = value.reverse().toString());
          }

          case InputType.CUSTOMNESTEDDROPDOWN: {
            const value: any[] = [];
            item.value?.forEach((lists: any) => {
              lists.configValue.forEach((item: any) => {
                value.push(`${item}`);
              });
            });
            return (formRowData[item.elementId] = value.toString());
          }
          case InputType.MULTIVALUEUSER:
          case InputType.SINGLEVALUEUSER: {
            const value: any[] = [];
            item.value.forEach((user: any) => {
              value.push(`${user?.firstName} ${user?.lastName}`);
            });
            return (formRowData[item.elementId] = value.toString());
          }
          case InputType.MULTIVALUECOMPANY:
          case InputType.SINGLEVALUECOMPANY: {
            const value: any[] = [];
            item.value.forEach((company: any) => {
              value.push(`${company.name}`);
            });
            return (formRowData[item.elementId] = value.toString());
          }
          case InputType.ATTACHMENT: {
            const value: any[] = [];
            item.value.forEach((file: any) => {
              value.push(` ${file.fileName}`);
            });
            return (formRowData[item.elementId] = value.toString());
          }
          case InputType.LOCATIONTREE: {
            const value: any[] = [];
            item.value?.forEach((lists: any) => {
              lists.locationValue.forEach((cellItem: any) => {
                value.push(`${cellItem}`);
              });
            });
            return (formRowData[item.elementId] = value.reverse().join(">"));
          }
          default:
            return (formRowData[item.elementId] =
              typeof item.value === "string" || null
                ? item?.value?.toString()
                : " ");
        }
      });

      // getting non-matching header array
      const intersection = headCellsArray.filter((item: any) => {
        for (let i = 0, len = res.length; i < len; i++) {
          if (res[i].elementId == item.elementId) {
            return false;
          }
        }
        return true;
      });

      // adding rows for non matching header
      if (formRowData) {
        if (intersection) {
          intersection.forEach((item: any) => {
            formRowData[item.elementId] = "";
          });
        }
        formRowData.id = row.id;
        formRowData.workFlow = row.workFlow;
        formRowData.formState = row.formState;
        rows.push(formRowData);
      }
    } catch (error: any) {
      console.log(error.message);
    }
  };

  formsDataArray?.forEach((row: any) => {
    filterByReference(row.formsData, headCellsArray, row);
  });

  const editFormDetails = (event: any, row: any) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
      props.editForm(row.id);
    } else {
      props.editForm(row.id);
    }
  };

  const handleConfirmBoxOpen = (event: any, id: number) => {
    event.preventDefault();
    event.stopPropagation();
    setConfirmOpen(true);
    setSelectedId(id);
  };

  const handleConfirmBoxClose = () => {
    setConfirmOpen(false);
  };

  const deleteRFIForm = () => {
    props.deleteRFI(selectedId);
    setConfirmOpen(false);
  };

  const handleViewForm = (formId: number, row: any) => {
    if (projectState?.featurePermissions?.canUpdateForm) {
      if (row.formState === "CLOSED") {
        props.viewRfiForm(formId);
      } else {
        editFormDetails(null, row);
      }
    } else {
      props.viewRfiForm(formId);
    }
  };

  return (
    <div className="rfiTable__root">
      <Paper className="rfiTable__paper">
        <TableContainer className="rfiTable__container">
          <Table
            stickyHeader
            className="rfiTable__table"
            aria-labelledby="tableTitle"
            aria-label="enhanced table"
          >
            {props.headerArray.length > 0 && (
              <EnhancedTableHead
                order={order}
                orderBy={orderBy}
                onRequestSort={handleSortRequest}
                rowCount={rows.length}
                headCells={headCellsArray}
              />
            )}

            {rows.length > 0 && props.headerArray.length > 0 ? (
              <TableBody>
                {rows.map((row: any) => {
                  return (
                    <TableRow
                      key={row.id}
                      className="rfiTable__form-row"
                      onClick={() => handleViewForm(row.id, row)}
                    >
                      {headCellsArray.map(
                        (cell) =>
                          cell.id !== "action" &&
                          cell.id !== "workFlow" && (
                            <TableCell key={cell.id} className="rfiTable__cell">
                              {cell.typeId === 4 && (
                                <Tooltip
                                  title={
                                    row[cell.elementId!]
                                      ? moment(
                                          row[cell.elementId!],
                                          "HH:mm:ss"
                                        ).format("hh:mm A").length > 25
                                        ? `${moment(
                                            row[cell.elementId!],
                                            "HH:mm:ss"
                                          )
                                            .format("hh:mm A")
                                            .slice(0, 18)} . . .`
                                        : moment(
                                            row[cell.elementId!],
                                            "HH:mm:ss"
                                          ).format("hh:mm A")
                                      : "-"
                                  }
                                  aria-label="createdBy"
                                >
                                  <label>
                                    {row[cell.elementId!]
                                      ? moment(
                                          row[cell.elementId!],
                                          "HH:mm:ss"
                                        ).format("hh:mm A").length > 25
                                        ? `${moment(
                                            row[cell.elementId!],
                                            "HH:mm:ss"
                                          )
                                            .format("hh:mm A")
                                            .slice(0, 18)} . . .`
                                        : moment(
                                            row[cell.elementId!],
                                            "HH:mm:ss"
                                          ).format("hh:mm A")
                                      : "-"}
                                  </label>
                                </Tooltip>
                              )}

                              {cell.typeId === 5 && (
                                <Tooltip
                                  title={
                                    row[cell.elementId!]
                                      ? moment(row[cell.elementId!])
                                          .format("DD MMM YYYY")
                                          .toString()
                                      : "-"
                                  }
                                  aria-label="createdBy"
                                >
                                  <label>
                                    {row[cell.elementId!]
                                      ? moment(row[cell.elementId!])
                                          .format("DD MMM YYYY")
                                          .toString()
                                      : "-"}
                                  </label>
                                </Tooltip>
                              )}
                              {cell.typeId === 6 && (
                                <Tooltip
                                  title={
                                    row[cell.elementId!]
                                      ? moment(row[cell.elementId!])
                                          .format("DD MMM YYYY")
                                          .toString()
                                      : "-"
                                  }
                                  aria-label="createdBy"
                                >
                                  <label>
                                    {row[cell.elementId!]
                                      ? moment(row[cell.elementId!]).format(
                                          "DD MMM YYYY"
                                        ).length > 25
                                        ? `${moment(row[cell.elementId!])
                                            .format("DD MMM YYYY")
                                            .toString()
                                            .slice(0, 18)} . . .`
                                        : moment(row[cell.elementId!])
                                            .format("DD MMM YYYY")
                                            .toString()
                                      : "-"}
                                  </label>
                                </Tooltip>
                              )}

                              {cell.typeId !== 4 &&
                                cell.typeId !== 5 &&
                                cell.typeId !== 6 && (
                                  <Tooltip
                                    title={
                                      row[cell.elementId!]
                                        ? row[cell.elementId!]
                                        : "-"
                                    }
                                    aria-label="createdBy"
                                  >
                                    <label>
                                      {row[cell.elementId!]
                                        ? row[cell.elementId!].length > 25
                                          ? `${row[cell.elementId!].slice(
                                              0,
                                              18
                                            )} . . .`
                                          : row[cell.elementId!]
                                        : "-"}
                                    </label>
                                  </Tooltip>
                                )}
                            </TableCell>
                          )
                      )}
                      {props.workflowEnabled && (
                        <TableCell className="rfiTable__form-row">
                          {row.workFlow}
                        </TableCell>
                      )}
                      {projectState?.featurePermissions?.canDeleteForm ? (
                        <TableCell className="rfiTable__form-row">
                          <div className="rfiTable__action-cell">
                            <Tooltip title="Delete">
                              <DeleteIcon
                                className="rfiTable__form-action-icon"
                                data-testid={`delete-rfi-${row.createdOn}`}
                                onClick={(e) => handleConfirmBoxOpen(e, row.id)}
                              />
                            </Tooltip>
                          </div>
                        </TableCell>
                      ) : (
                        ""
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            ) : !props.isFetchingData ? (
              <TableBody>
                <TableRow>
                  <TableCell colSpan={headCellsArray.length} align={"center"}>
                    <NoDataMessage message={noDataMessage} />
                  </TableCell>
                </TableRow>
              </TableBody>
            ) : (
              <TableBody>
                <TableRow>
                  <TableCell colSpan={headCellsArray.length} align={"center"}>
                    <NoDataMessage message={"Loading ...."} />
                  </TableCell>
                </TableRow>
              </TableBody>
            )}
          </Table>
        </TableContainer>
      </Paper>

      {/* <Tooltip title="Edit">
        <EditIcon onClick={() => editFormDetails(null)} />
      </Tooltip> */}
      {confirmOpen ? (
        <ConfirmDialog
          open={confirmOpen}
          message={confirmMessage}
          close={handleConfirmBoxClose}
          proceed={deleteRFIForm}
        />
      ) : (
        ""
      )}
    </div>
  );
}
