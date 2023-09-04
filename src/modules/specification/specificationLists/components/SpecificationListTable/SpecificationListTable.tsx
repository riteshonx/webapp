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
import "./SpecificationListTable.scss";
import Button from "@material-ui/core/Button";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import NoDataMessage from "../../../../shared/components/NoDataMessage/NoDataMessage";
import { stateContext } from "../../../../root/context/authentication/authContext";
import { match, useHistory, useRouteMatch } from "react-router-dom";
import Checkbox from "@material-ui/core/Checkbox";
import { SpecificationLibDetailsContext } from "../../context/SpecificationLibDetailsContext";
import {
  setSpecificationList,
  setUploadDialog,
  setConfirmBoxStatus,
  setSectionPageNum,
  setOffset,
} from "../../context/SpecificationLibDetailsAction";
import moment from "moment";
import DeleteIcon from "@material-ui/icons/Delete";
import GetAppIcon from "@material-ui/icons/GetApp";
import { setIsLoading } from "../../../../root/context/authentication/action";
import { postApi } from "../../../../../services/api";
import Notification, {
  AlertTypes,
} from "../../../../shared/components/Toaster/Toaster";
import ConfirmDialog from "../../../../shared/components/ConfirmDialog/ConfirmDialog";
import InfiniteScroll from "react-infinite-scroll-component";
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
  text: `If you delete this, all data related to this specification will be lost.`,
  cancel: "Cancel",
  proceed: "Confirm",
};

interface tableHeader {
  sectionNumber: string;
  sectionName: string;
  // specName: string,
  divisionName: string;
  divisionNumber: string;
  setTitle: string;
  setVersionName: string;
  setVersionDate: string;
  uploadedBy: string;
  sourceKey: string;
  action: string;
}
interface rowData {
  sectionNumber: string;
  sectionName: string;
  // specName: string,
  divisionName: string;
  divisionNumber: string;
  setTitle: string;
  setVersionName: string;
  setVersionDate: string;
  action: string;
  uploadedBy: string;
  sourceKey: string;
  specificationSequence: number;
  filePath: string;
  id: string;
  // sourceId: string,
}

interface message {
  header: string;
  text: string;
  cancel: string;
  proceed: string;
}

const noDataMessage = "No data found.";

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
    id: "sectionNumber",
    numeric: false,
    disablePadding: true,
    label: "Section Number",
    isSorting: false,
  },
  {
    id: "sectionName",
    numeric: false,
    disablePadding: true,
    label: "Section Name",
    isSorting: false,
  },
  // { id: 'setTitle', numeric: false, disablePadding: true, label: 'Spec Book Title', isSorting: false },
  {
    id: "divisionNumber",
    numeric: false,
    disablePadding: true,
    label: "Division Number",
    isSorting: false,
  },
  {
    id: "divisionName",
    numeric: false,
    disablePadding: true,
    label: "Division Name",
    isSorting: false,
  },
  {
    id: "setTitle",
    numeric: false,
    disablePadding: true,
    label: "Spec Book Title",
    isSorting: false,
  },
  {
    id: "setVersionName",
    numeric: false,
    disablePadding: true,
    label: "Version Name",
    isSorting: false,
  },
  {
    id: "setVersionDate",
    numeric: false,
    disablePadding: true,
    label: "Version Date",
    isSorting: false,
  },
  // { id: 'uploadedBy', numeric: false, disablePadding: true, label: 'Uploaded By', isSorting: false},
  // { id: 'sourceKey', numeric: false, disablePadding: true, label: 'Source', isSorting: false},
  {
    id: "action",
    numeric: false,
    disablePadding: true,
    label: "",
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
  } = props;
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
        <TableCell padding="checkbox">
          <Checkbox
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{ "aria-label": "select all desserts" }}
            color="default"
          />
        </TableCell>
        {headCells.map((headCell, index) => (
          <TableCell
            className={classes.headecell}
            key={index}
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
      height: "calc(100vh - 290px)",
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
      fontSize: "12px",
      color: "#333333",
      cursor: "pointer",
    },

    disable: {
      fontSize: "12px",
      color: "#33333380",
    },
    headecell: {
      fontSize: "12px",
      color: "#333333",
      fontWeight: 600,
      width: "13%",
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
  const pathMatch: match<Params> = useRouteMatch();
  const { SpecificationLibDetailsState, SpecificationLibDetailsDispatch }: any =
    useContext(SpecificationLibDetailsContext);
  const [hasMore, setHasMore] = useState(true);
  const [specificationListArray, setSpecificationListArray] = useState<
    Array<any>
  >([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [canCheckPermission, setCanCheckPermission] = useState(false);
  const [selectedSpecification, setSelectedSpecification] = useState<any>();

  useEffect(() => {
    const timer = setTimeout(() => setCanCheckPermission(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const sectionarray = SpecificationLibDetailsState?.specificationLists
      .sort((a: any, b: any) => (a.sourceKey > b.sourceKey ? 1 : -1))
      .sort((a: any, b: any) => (a.startPage > b.startPage ? 1 : -1));
    setSpecificationListArray(sectionarray);
    setSelected(sectionarray.filter((specItem: any) => specItem.isPartOf));
  }, [SpecificationLibDetailsState?.specificationLists]);

  useEffect(() => {
    if (SpecificationLibDetailsState.isConfirmOpen) {
      handleConfirmBoxClose();
    }
  }, [SpecificationLibDetailsState.isConfirmOpen]);

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: keyof rowData
  ) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    specificationListArray.forEach((specificationItem: any) => {
      specificationItem.isPartOf = event.target.checked;
    });

    SpecificationLibDetailsDispatch(
      setSpecificationList([...specificationListArray])
    );
  };

  const handleClick = (event: any, row: any, index: number) => {
    event.stopPropagation();
    specificationListArray[index].isPartOf = event.target.checked;
    SpecificationLibDetailsDispatch(
      setSpecificationList([...specificationListArray])
    );
  };

  const openSpeciifcationLib = () => {
    history.push(
      `/specifications/projects/${pathMatch.params.projectId}/library`
    );
    SpecificationLibDetailsDispatch(setUploadDialog(true));
  };

  const handleDeleteSpecification = (event: any, specification: any) => {
    event.stopPropagation();
    event.preventDefault();
    setSelectedSpecification(specification);
    setConfirmOpen(true);
  };

  const handleDownloadSpecification = (event: any, specification: any) => {
    event.stopPropagation();
    event.preventDefault();
    const sectionPath = specification.sourceKey.replace(
      ".pdf",
      `/pdfsections/${specification.id}.pdf`
    );
    const { fileName, sectionName } = specification;
    const displayFileName = fileName.replace(".pdf", "");
    const downloadingFileName = `${displayFileName} - ${sectionName}`;
    const payload = [
      {
        fileName: `${downloadingFileName}.pdf`,
        key: sectionPath,
        expiresIn: 1000,
        processed: true,
      },
    ];
    downloadSpecification(payload);
  };

  // downloadSpecification API
  const downloadSpecification = async (payload: any) => {
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
    SpecificationLibDetailsDispatch(setConfirmBoxStatus(false));
    setConfirmOpen(false);
  };

  const deleteFileDoc = () => {
    props.deleteSpecification(selectedSpecification);
  };

  const loadMore = () => {
    if (specificationListArray.length < 50) {
      setHasMore(false);
    }
    SpecificationLibDetailsDispatch(
      setOffset(specificationListArray.length + 1)
    );
    const offsetValue = SpecificationLibDetailsState?.offset + 1;
  };
  const handlePdfViewer = (specification: any) => {
    history.push(
      `/specifications/projects/${pathMatch.params.projectId}/pdf-viewer/${specification.id}`
    );
  };

  if (state.isLoading) {
    return <div className="SpecificationListTable__nodata">Please wait...</div>;
  } else {
    if (specificationListArray.length > 0) {
      return (
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
                  rowCount={specificationListArray.length}
                />
                <TableBody className="specificationLists">
                  {stableSort(
                    specificationListArray,
                    getComparator(order, orderBy)
                  ).map((row: any, index: number) => {
                    const labelId = `enhanced-table-checkbox-${index}`;
                    return (
                      <TableRow
                        key={index}
                        className="specificationLists__specification-row"
                        onClick={() => handlePdfViewer(row)}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox
                            onClick={(event) => handleClick(event, row, index)}
                            checked={row.isPartOf}
                            inputProps={{ "aria-labelledby": labelId }}
                            color="default"
                          />
                        </TableCell>

                        <TableCell className={classes.cell}>
                          <Tooltip title={""} aria-label="section number">
                            <label>{row.sectionNumber}</label>
                          </Tooltip>
                        </TableCell>

                        <TableCell className={classes.cell}>
                          <Tooltip title={""} aria-label="section name">
                            <label>{row.sectionName}</label>
                          </Tooltip>
                        </TableCell>
                        <TableCell className={classes.cell}>
                          <Tooltip title={""} aria-label="division number">
                            <label>{row.divisionNumber}</label>
                          </Tooltip>
                        </TableCell>
                        <TableCell className={classes.cell}>
                          <Tooltip title={""} aria-label="division name">
                            <label>{row.divisionName}</label>
                          </Tooltip>
                        </TableCell>

                        <TableCell className={classes.cell}>
                          <Tooltip title={""} aria-label="set title">
                            <label>{row?.title}</label>
                          </Tooltip>
                        </TableCell>

                        <TableCell className={classes.cell}>
                          {row?.versionName}
                        </TableCell>

                        <TableCell className={classes.cell}>
                          {moment(row?.versionDate)
                            .format("DD-MMM-YYYY")
                            .toString()}
                        </TableCell>

                        <TableCell className={classes.cell}>
                          <div className="specification-action">
                            <div className="specification-action__icon-wrapper">
                              <Tooltip
                                title={"Download"}
                                aria-label="first name"
                              >
                                <label>
                                  <GetAppIcon
                                    className="mat-icon"
                                    onClick={(e: any) =>
                                      handleDownloadSpecification(e, row)
                                    }
                                  />
                                </label>
                              </Tooltip>
                            </div>
                            {state?.projectFeaturePermissons
                              ?.candeleteSpecifications && (
                              <div className="specification-action__icon-wrapper">
                                <Tooltip
                                  title={"Delete"}
                                  aria-label="first name"
                                >
                                  <label>
                                    <DeleteIcon
                                      className="mat-icon"
                                      onClick={(e: any) =>
                                        handleDeleteSpecification(e, row)
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
              </Table>
            </TableContainer>
          </Paper>
          {confirmOpen && (
            <ConfirmDialog
              open={confirmOpen}
              message={confirmMessage}
              close={handleConfirmBoxClose}
              proceed={deleteFileDoc}
            />
          )}
        </div>
      );
    } else {
      if (SpecificationLibDetailsState.isSpecFilterOn || props.isSearchTextExist) {
        return (
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
                    rowCount={specificationListArray.length}
                  />
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={9} align={"center"}>
                        <NoDataMessage message={noDataMessage} />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </div>
        );
      } else {
        if (canCheckPermission) {
          if (state?.projectFeaturePermissons?.cancreateSpecifications)
            return (
              <div className="SpecificationListTable__nodata">
                Upload a document to publish specification
                <div className="SpecificationListTable__upload-btn">
                  <Button
                    id="upload-pdf"
                    data-testid={"upload-file"}
                    variant="outlined"
                    className="btn-primary"
                    startIcon={<CloudUploadIcon />}
                    onClick={openSpeciifcationLib}
                  >
                    Upload
                  </Button>
                </div>
              </div>
            );
          else {
            return (
              <div className="SpecificationListTable__nodata">
                You don't have permission to upload specification
              </div>
            );
          }
        } else {
          return (
            <div className="SpecificationListTable__nodata">
              Validating permissions...
            </div>
          );
        }
      }
    }
  }
}
