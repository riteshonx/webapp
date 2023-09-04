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
import "./DrawingListTable.scss";
import Button from "@material-ui/core/Button";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import NoDataMessage from "../../../../shared/components/NoDataMessage/NoDataMessage";
import { stateContext } from "../../../../root/context/authentication/authContext";
import { match, useHistory, useRouteMatch } from "react-router-dom";
import Checkbox from "@material-ui/core/Checkbox";
import { DrawingLibDetailsContext } from "../../context/DrawingLibDetailsContext";
import {
  setConfirmBoxStatus,
  setDrawingList,
  setDrawingListPageNumber,
  setUploadDialog,
  setSortColumnProperty,
} from "../../context/DrawingLibDetailsAction";
import moment from "moment";
import DeleteIcon from "@material-ui/icons/Delete";
import GetAppIcon from "@material-ui/icons/GetApp";
import EditIcon from "@material-ui/icons/Edit";
import { setIsLoading } from "../../../../root/context/authentication/action";
import { postApi } from "../../../../../services/api";
import Notification, {
  AlertTypes,
} from "../../../../shared/components/Toaster/Toaster";
import ConfirmDialog from "../../../../shared/components/ConfirmDialog/ConfirmDialog";
import EditDrawing from "../EditDrawing/EditDrawing";
import InfiniteScroll from "react-infinite-scroll-component";
import { useQuery } from "src/modules/authentication/utils";

export interface Params {
  projectId: string;
}

interface message {
  header: string;
  text: string;
  cancel: string;
  proceed: string;
}

const confirmMessage: message = {
  header: "Are you sure?",
  text: `If you delete this, all data related to this drawing will be lost.`,
  cancel: "Cancel",
  proceed: "Confirm",
};

interface tableHeader {
  drawingNumber: string;
  drawingName: string;
  drawingCategory: string;
  setTitle: string;
  setVersionName: string;
  setVersionDate: string;
  dwgRevision: string;
  action: string;
  dwgProjectNumber: string;
  dwgOriginator: string;
  dwgVolume: string;
  dwgType: string;
  dwgRole: string;
  dwgClassification: string;
  dwgSheetNumber: string;
  dwgSuitability: string;
  dwgZone: string;
  dwgStatus: string;
  dwgLevel: string;
}
interface rowData {
  drawingNumber: string;
  drawingName: string;
  drawingCategory: string;
  setTitle: string;
  setVersionName: string;
  setVersionDate: string;
  dwgRevision: string;

  dwgProjectNumber: string;
  dwgOriginator: string;
  dwgVolume: string;
  dwgType: string;
  dwgRole: string;
  dwgClassification: string;
  dwgSheetNumber: string;
  dwgSuitability: string;
  dwgZone: string;
  dwgStatus: string;
  dwgLevel: string;

  action: string;
  drawingSequence: number;
  filePath: string;
  id: string;
  sourceId: string;
}
const noDataMessage = "No users were found.";
const noDrawingMsg = "No Data Found";

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
    id: "drawingNumber",
    numeric: false,
    disablePadding: true,
    label: "Drawing Number",
    isSorting: false,
  },
  {
    id: "drawingName",
    numeric: false,
    disablePadding: true,
    label: "Drawing Name",
    isSorting: false,
  },
  {
    id: "drawingCategory",
    numeric: false,
    disablePadding: true,
    label: "Category",
    isSorting: false,
  },
  {
    id: "setTitle",
    numeric: false,
    disablePadding: true,
    label: "Set Title ",
    isSorting: false,
  },
  {
    id: "setVersionName",
    numeric: false,
    disablePadding: true,
    label: "Set Version Name",
    isSorting: false,
  },
  {
    id: "setVersionDate",
    numeric: false,
    disablePadding: true,
    label: "Version Date",
    isSorting: false,
  },
  {
    id: "dwgRevision",
    numeric: false,
    disablePadding: true,
    label: "Revision",
    isSorting: false,
  },
  {
    id: "dwgProjectNumber",
    numeric: false,
    disablePadding: true,
    label: "Project Number",
    isSorting: false,
  },
  {
    id: "dwgOriginator",
    numeric: false,
    disablePadding: true,
    label: "Originator",
    isSorting: false,
  },
  {
    id: "dwgVolume",
    numeric: false,
    disablePadding: true,
    label: "Volume/System",
    isSorting: false,
  },
  {
    id: "dwgLevel",
    numeric: false,
    disablePadding: true,
    label: "Level/Location",
    isSorting: false,
  },
  {
    id: "dwgType",
    numeric: false,
    disablePadding: true,
    label: "Type",
    isSorting: false,
  },
  {
    id: "dwgRole",
    numeric: false,
    disablePadding: true,
    label: "Role",
    isSorting: false,
  },
  {
    id: "dwgClassification",
    numeric: false,
    disablePadding: true,
    label: "Classification",
    isSorting: false,
  },
  {
    id: "dwgSheetNumber",
    numeric: false,
    disablePadding: true,
    label: "SheetNumber",
    isSorting: false,
  },
  {
    id: "dwgSuitability",
    numeric: false,
    disablePadding: true,
    label: "Suitability",
    isSorting: false,
  },
  {
    id: "dwgStatus",
    numeric: false,
    disablePadding: true,
    label: "Status",
    isSorting: false,
  },
  {
    id: "dwgZone",
    numeric: false,
    disablePadding: true,
    label: "Zone",
    isSorting: false,
  },
  {
    id: "action",
    numeric: false,
    disablePadding: true,
    label: "Action",
    isSorting: true,
  },
];

interface EnhancedTableProps {
  classes: ReturnType<typeof useStyles>;
  numSelected: number;
  onRequestSort: (
    event: React.MouseEvent<unknown>,
    property: keyof rowData
  ) => void;
  onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
  order: Order;
  orderBy: string;
  rowCount: number;
  sortColumnProperty: keyof rowData;
}

function EnhancedTableHead(props: EnhancedTableProps) {
  const {
    classes,
    numSelected,
    onRequestSort,
    onSelectAllClick,
    order,
    orderBy,
    rowCount,
    sortColumnProperty,
  } = props;
  const createSortHandler =
    (property: keyof rowData, isSorting: boolean) =>
    (event: React.MouseEvent<unknown>) => {
      if (!isSorting) {
        const sortKey = property ? property : sortColumnProperty;
        onRequestSort(event, sortKey);
      }
    };

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{ "aria-label": "select all desserts" }}
            color="default"
          />
        </TableCell>
        {headCells.map((headCell) => (
          <TableCell
            className={
              headCell.id === "action"
                ? classes.stickyHeader
                : classes.headecell
            }
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
      height: "calc(100vh - 235px)",
      width: "100%",
      flexGrow: 1,
      padding: "0px 1px",
      overflow: "auto",
      margin: "10px 0px",
    },
    paper: {
      width: "100%",
      marginBottom: theme.spacing(0),
    },
    table: {
      minWidth: 750,
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
    sticky: {
      position: "sticky",
      right: "2%",
      background: "#F5F5F5",
    },
    stickyHeader: {
      position: "sticky",
      zIndex: 10,
      right: "2%",
      background: "#EEEEEE",
      fontSize: "12px",
      color: "##F5F5F5",
      fontWeight: 600,
    },
    cell: {
      fontSize: "12px",
      color: "#333333",
    },

    disable: {
      fontSize: "12px",
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
  const { state, dispatch }: any = useContext(stateContext);
  const classes = useStyles();
  const [order, setOrder] = React.useState<Order>("asc");
  const [orderBy, setOrderBy] = React.useState<any>("");
  const [selected, setSelected] = React.useState<string[]>([]);
  const history = useHistory();
  const isOpenUpload: any = useQuery().get("upload");
  const pathMatch: match<Params> = useRouteMatch();
  const { DrawingLibDetailsState, DrawingLibDetailsDispatch }: any = useContext(
    DrawingLibDetailsContext
  );

  const [drawingsListArray, setdrawingsListArray] = useState<Array<any>>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedDrawing, setSelectedDrawing] = useState<any>();
  const [isUpdateOpen, setisUpdateOpen] = useState(false);
  const [selectedDrawingForEdit, setSelectedDrawingForEdit] = useState<any>();
  const [totalCount, setTotalCount] = useState(0);
  useEffect(() => {
    setdrawingsListArray(DrawingLibDetailsState?.drawingsLists);
    setSelected(
      DrawingLibDetailsState?.drawingsLists.filter(
        (drawItem: any) => drawItem.isPartOf
      )
    );
  }, [DrawingLibDetailsState?.drawingsLists]);

  useEffect(() => {
    if (isOpenUpload) {
      history.replace({
        search: "",
      });
      openDrawingLib();
    }
  }, []);

  useEffect(() => {
    if (DrawingLibDetailsState.isConfirmOpen) {
      handleConfirmBoxClose();
    }
  }, [DrawingLibDetailsState.isConfirmOpen]);

  useEffect(() => {
    setTotalCount(props?.totalCount);
  }, [props?.totalCount]);

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: keyof rowData
  ) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
    DrawingLibDetailsDispatch(setSortColumnProperty(property));
    props.refreshDrawingList(property);
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    drawingsListArray.forEach((drawingItem: any) => {
      drawingItem.isPartOf = event.target.checked;
    });

    DrawingLibDetailsDispatch(setDrawingList([...drawingsListArray]));
  };

  const handleClick = (event: any, row: any, index: number) => {
    event.stopPropagation();
    const lists = [...drawingsListArray];
    const selectedRowIndex: any = lists.findIndex(
      (sheet: any) => sheet.id === row.id
    );
    lists[selectedRowIndex].isPartOf = event.target.checked;
    DrawingLibDetailsDispatch(setDrawingList([...drawingsListArray]));
  };

  const openDrawingLib = () => {
    history.push(
      `/drawings/projects/${pathMatch.params.projectId}/drawing-management`
    );
    DrawingLibDetailsDispatch(setUploadDialog(true));
  };

  const handleEditDrawing = (event: any, drawing: any) => {
    event.stopPropagation();
    event.preventDefault();
    setSelectedDrawingForEdit(drawing);
    setisUpdateOpen(true);
  };

  const handleDeleteDrawing = (event: any, drawing: any) => {
    event.stopPropagation();
    event.preventDefault();
    setSelectedDrawing(drawing);
    setConfirmOpen(true);
  };

  const handleDownloadDrawing = (event: any, drawing: any) => {
    event.stopPropagation();
    event.preventDefault();
    const payload = [
      {
        fileName: `${drawing.drawingName}.pdf`,
        key: drawing.filePath,
        expiresIn: 1000,
        processed: true,
      },
    ];
    downloadDrawing(payload);
  };

  // downloaddrawing API
  const downloadDrawing = async (payload: any) => {
    try {
      dispatch(setIsLoading(true));
      const fileUploadResponse = await postApi("V1/S3/downloadLink", payload);
      window.open(fileUploadResponse.success[0].url, "_parent");
      dispatch(setIsLoading(false));
    } catch (error) {
      Notification.sendNotification(error, AlertTypes.warn);
      dispatch(setIsLoading(false));
    }
  };

  const handleConfirmBoxClose = () => {
    DrawingLibDetailsDispatch(setConfirmBoxStatus(false));
    setConfirmOpen(false);
  };

  const deleteFileDoc = () => {
    props.deleteDrawing(selectedDrawing);
  };

  const handlePdfViewer = (drawing: any) => {
    history.push(
      `/drawings/projects/${pathMatch.params.projectId}/pdf-viewer/${drawing.id}`
    );
  };

  const handleRefresh = () => {
    props.refreshDrawingList();
  };

  const fetchQuery = () => {
    if (drawingsListArray.length < totalCount) {
      const pageNum = DrawingLibDetailsState.drawingListPageNumber + 1;
      DrawingLibDetailsDispatch(setDrawingListPageNumber(pageNum));
    }
  };

  return (
    <div className="DrawingListTable">
      {drawingsListArray.length > 0 ? (
        <div className={classes.root}>
          <Paper className={classes.paper}>
            <InfiniteScroll
              dataLength={drawingsListArray.length}
              next={fetchQuery}
              hasMore={drawingsListArray.length < totalCount ? true : false}
              loader={drawingsListArray.length === totalCount ? "" : ""} // handle this later
              scrollableTarget="scrollable_list"
            >
              <TableContainer
                id="scrollable_list"
                className={classes.container}
              >
                <Table
                  stickyHeader
                  className={classes.table}
                  aria-labelledby="tableTitle"
                  aria-label="enhanced table"
                >
                  <EnhancedTableHead
                    numSelected={selected.length}
                    onSelectAllClick={handleSelectAllClick}
                    classes={classes}
                    order={order}
                    orderBy={orderBy}
                    onRequestSort={handleRequestSort}
                    rowCount={drawingsListArray.length}
                    sortColumnProperty={
                      DrawingLibDetailsState.sortColumnProperty
                    }
                  />
                  {drawingsListArray.length > 0 ? (
                    <TableBody className="drawingLists">
                      {stableSort(
                        drawingsListArray,
                        getComparator(order, orderBy)
                      ).map((row: any, index: number) => {
                        const labelId = `enhanced-table-checkbox-${index}`;
                        return (
                          <TableRow
                            key={`${row?.id}-${index}`}
                            className="drawingLists__drawing-row"
                            onClick={() => handlePdfViewer(row)}
                          >
                            <TableCell padding="checkbox">
                              <Checkbox
                                onClick={(event) =>
                                  handleClick(event, row, index)
                                }
                                checked={row.isPartOf}
                                inputProps={{ "aria-labelledby": labelId }}
                                color="default"
                              />
                            </TableCell>

                            <TableCell
                              style={{ minWidth: "250px", maxWidth: "250px" }}
                              className={classes.cell}
                            >
                              <Tooltip title={""} aria-label="drawing number">
                                <label>{row.drawingNumber}</label>
                              </Tooltip>
                            </TableCell>

                            <TableCell
                              style={{ minWidth: "250px", maxWidth: "250px" }}
                              className={classes.cell}
                            >
                              <Tooltip title={""} aria-label="drawing name">
                                <label>{row.drawingName}</label>
                              </Tooltip>
                            </TableCell>

                            <TableCell
                              style={{ minWidth: "200px", maxWidth: "200px" }}
                              className={classes.cell}
                            >
                              <Tooltip title={""} aria-label="drawing category">
                                <label>
                                  {row?.drawingCategory
                                    ? row?.drawingCategory
                                    : "--"}
                                </label>
                              </Tooltip>
                            </TableCell>

                            <TableCell
                              style={{ minWidth: "200px", maxWidth: "200px" }}
                              className={classes.cell}
                            >
                              <Tooltip title={""} aria-label="set title">
                                <label>
                                  {row?.setTitle ? row?.setTitle : "--"}
                                </label>
                              </Tooltip>
                            </TableCell>

                            <TableCell
                              style={{ minWidth: "155px", maxWidth: "155px" }}
                              className={classes.cell}
                            >
                              {row?.setVersionName}
                            </TableCell>

                            <TableCell className={classes.cell}>
                              {moment
                                .utc(row?.setVersionDate)
                                .format("DD-MMM-YYYY")
                                .toString()}
                            </TableCell>

                            <TableCell
                              className={classes.cell}
                              style={{ minWidth: "140px", maxWidth: "140px" }}
                            >
                              {row?.dwgRevision ? row?.dwgRevision : "--"}
                            </TableCell>
                            <TableCell>
                              {row?.dwgProjectNumber
                                ? row?.dwgProjectNumber
                                : "--"}
                            </TableCell>
                            <TableCell>
                              {row?.dwgOriginator ? row?.dwgOriginator : "--"}
                            </TableCell>
                            <TableCell>
                              {row?.dwgVolume ? row?.dwgVolume : "--"}
                            </TableCell>
                            <TableCell>
                              {row?.dwgLevel ? row?.dwgLevel : "--"}
                            </TableCell>
                            <TableCell>
                              {row?.dwgType ? row?.dwgType : "--"}
                            </TableCell>
                            <TableCell>
                              {row?.dwgRole ? row?.dwgRole : "--"}
                            </TableCell>
                            <TableCell>
                              {row?.dwgClassification
                                ? row?.dwgClassification
                                : "--"}
                            </TableCell>
                            <TableCell>
                              {row?.dwgSheetNumber ? row?.dwgSheetNumber : "--"}
                            </TableCell>
                            <TableCell>
                              {row?.dwgSuitability ? row?.dwgSuitability : "--"}
                            </TableCell>
                            <TableCell>
                              {row?.dwgStatus ? row?.dwgStatus : "--"}
                            </TableCell>
                            <TableCell>
                              {row?.dwgZone ? row?.dwgZone : "--"}
                            </TableCell>
                            <TableCell
                              style={{ minWidth: "155px", maxWidth: "155px" }}
                              align="center"
                              className={classes.sticky}
                            >
                              <div className="drawing-action">
                                {state?.projectFeaturePermissons
                                  ?.canupdateDrawings && (
                                  <div className="drawing-action__icon-wrapper">
                                    <Tooltip
                                      title={"Edit"}
                                      aria-label="first name"
                                    >
                                      <label>
                                        <EditIcon
                                          className="mat-icon"
                                          onClick={(e: any) =>
                                            handleEditDrawing(e, row)
                                          }
                                        />
                                      </label>
                                    </Tooltip>
                                  </div>
                                )}
                                <div className="drawing-action__icon-wrapper">
                                  <Tooltip
                                    title={"Download"}
                                    aria-label="first name"
                                  >
                                    <label>
                                      <GetAppIcon
                                        className="mat-icon"
                                        onClick={(e: any) =>
                                          handleDownloadDrawing(e, row)
                                        }
                                      />
                                    </label>
                                  </Tooltip>
                                </div>
                                {state?.projectFeaturePermissons
                                  ?.candeleteDrawings && (
                                  <div className="drawing-action__icon-wrapper">
                                    <Tooltip
                                      title={"Delete"}
                                      aria-label="first name"
                                    >
                                      <label>
                                        <DeleteIcon
                                          className="mat-icon"
                                          onClick={(e: any) =>
                                            handleDeleteDrawing(e, row)
                                          }
                                        />
                                      </label>
                                    </Tooltip>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  ) : (
                    !state.isLoading && (
                      <TableBody>
                        <TableRow>
                          <TableCell colSpan={7} align={"center"}>
                            <NoDataMessage message={noDataMessage} />
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    )
                  )}
                </Table>
              </TableContainer>
            </InfiniteScroll>
          </Paper>
        </div>
      ) : state?.projectFeaturePermissons?.canuploadDrawings &&
        !state.isLoading &&
        !props.isSearchTextExist ? (
        <div className="DrawingListTable__nodata">
          Upload a document to publish drawings
          <div className="DrawingListTable__upload-btn">
            <Button
              id="upload-pdf"
              data-testid={"upload-file"}
              variant="outlined"
              className="btn-primary"
              startIcon={<CloudUploadIcon />}
              onClick={openDrawingLib}
            >
              Upload
            </Button>
          </div>
        </div>
      ) : (
        state.projectFeaturePermissons &&
        !state.isLoading &&
        (!state.projectFeaturePermissons?.canuploadDrawings ? (
          ""
        ) : (
          <div className={classes.root}>
            <Paper className={classes.paper}>
              <TableContainer
                className={classes.container}
                id="infinite-scrolling-table"
              >
                <Table
                  stickyHeader
                  className={classes.table}
                  aria-labelledby="tableTitle"
                  aria-label="enhanced table"
                >
                  <EnhancedTableHead
                    numSelected={selected.length}
                    onSelectAllClick={handleSelectAllClick}
                    classes={classes}
                    order={order}
                    orderBy={orderBy}
                    onRequestSort={handleRequestSort}
                    rowCount={drawingsListArray.length}
                    sortColumnProperty={
                      DrawingLibDetailsState.sortColumnProperty
                    }
                  />
                  <TableBody>
                    <TableRow>
                      <TableCell
                        className="no-drawing-msg"
                        colSpan={14}
                        align={"center"}
                      >
                        <NoDataMessage message={noDrawingMsg} />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </div>
        ))
      )}

      {/* confirm box for delete drawing */}
      {confirmOpen ? (
        <ConfirmDialog
          open={confirmOpen}
          message={confirmMessage}
          close={handleConfirmBoxClose}
          proceed={deleteFileDoc}
        />
      ) : (
        ""
      )}

      {/* side bar for edit drawing */}
      {isUpdateOpen && (
        <EditDrawing
          selectedDrawing={selectedDrawingForEdit}
          closeSideBar={() => setisUpdateOpen(false)}
          refreshList={handleRefresh}
        />
      )}
    </div>
  );
}
