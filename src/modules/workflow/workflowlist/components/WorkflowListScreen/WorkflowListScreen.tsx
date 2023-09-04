import {
  makeStyles,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@material-ui/core";
import React, { ReactElement } from "react";
import "./WorkflowListScreen.scss";
import FileCopyOutlinedIcon from "@material-ui/icons/FileCopyOutlined";
import EditOutlinedIcon from "@material-ui/icons/EditOutlined";
import DeleteOutlinedIcon from "@material-ui/icons/DeleteOutlined";
import { useHistory } from "react-router-dom";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import TablePagination from "@material-ui/core/TablePagination";
import axios from "axios";
import ConfirmDialog from "../../../../shared/components/ConfirmDialog/ConfirmDialog";
import { getExchangeToken } from "../../../../../services/authservice";
import ClonePopup from "../../../workflowview/components/ClonePopup/ClonePopup";
import Notify, {
  AlertTypes,
} from "../../../../shared/components/Toaster/Toaster";
import {
  canCreateWorkflowTemplates,
  canDeleteWorkflowTemplates,
  canUpdateWorkflowTemplates,
} from "../../../roles/permissions";
import moment from "moment";
import { FETCH_RUNTIME_INFO_DATA_FOR_WF_TEMPLATE_ID } from "src/modules/workflow/graphql/queries/workflow";
import { WorkflowTemplateRoles } from "src/utils/role";
import { client } from "src/services/graphql";
import { stateContext } from "src/modules/root/context/authentication/authContext";
import { setEdgeCenter } from "src/modules/root/context/authentication/action";

const useStyles = makeStyles({
  paper: {
    marginTop: "1rem",
  },
  table: {
    minWidth: 650,
  },
});

const tableColumns = [
  { id: 1, label: "Name" },
  // { id: 2, label: "No. of forms associated" },
  {
    id: 3,
    label: "Last updated by",
    align: "right",
    format: (value: any) => value.toLocaleString("en-US"),
  },
  {
    id: 4,
    label: "Last updated at",
    align: "right",
  },
  {
    id: 5,
    label: "Created by",
    align: "right",
    format: (value: any) => value.toLocaleString("en-US"),
  },
  {
    id: 6,
    label: "Created at",
    align: "right",
    format: (value: any) => value.toLocaleString("en-US"),
  },
  {
    id: 7,
    label: "",
    align: "right",
  },
];

function WorkflowListScreen({
  workflowDetails,
  handleCloneWorkflowCreation,
  deleteWorkflowTemplate,
}: any): ReactElement {
  const { dispatch }: any = React.useContext(stateContext);
  const history = useHistory();
  const classes = useStyles();
  const [columns, setColumns] = React.useState(tableColumns);
  const [menuItem, setMenuItem] = React.useState(null);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [workflowTableConfiguration, setWorkflowTableConfiguration]: any =
    React.useState([]);
  const [clonePopup, setClonePopup] = React.useState(false);
  const [currentWorkflowId, setCurrentWorkflowId] = React.useState(null);
  const [openDeletePopup, setOpenDeletePopup] = React.useState(false);
  const [numOfFormsAssociated, setNumOfFormsAssociated]: any = React.useState(
    []
  );

  const handleDeletePopup = () => {
    setOpenDeletePopup(!openDeletePopup);
  };

  React.useEffect(() => {
    if (!canCreateWorkflowTemplates || !canUpdateWorkflowTemplates) {
      const updatedColumns = columns.filter(
        (item: any) => item.id !== columns[columns.length - 1].id
      );
      setColumns(updatedColumns);
    }

    async function getNumOfFormsAssociated() {
      const token = getExchangeToken();
      try {
        const response = await axios.get(
          `${process.env["REACT_APP_WORKFLOW_URL"]}workflow-runtime/getNumOfFormsAssociated`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response && response.status === 200) {
          setNumOfFormsAssociated(response.data);
        }
      } catch (error: any) {
        Notify.sendNotification(error.message, AlertTypes.error);
        console.log(error);
      }
    }
    getNumOfFormsAssociated();
    dispatch(setEdgeCenter([]));
  }, []);

  React.useEffect(() => {
    let filteredList = workflowDetails.map((workflowItem: any) => {
      const createdAt = `${moment
        .utc(workflowItem.createdAt)
        .format("DD MMM YYYY")
        .toString()}`;
      const updatedAt = `${moment
        .utc(workflowItem.updatedAt)
        .format("DD MMM YYYY")
        .toString()}`;
      return {
        id: workflowItem.id,
        name: workflowItem.name,
        formAssociationCount: 0,
        updatedBy: workflowItem.userName,
        updatedAt: updatedAt,
        createdBy: workflowItem.userName,
        createdAt: createdAt,
        rootTemplateId: workflowItem.rootTemplateId,
        version: workflowItem.version,
        isDefault: workflowItem.isDefault,
      };
    });

    if (
      numOfFormsAssociated?.length > 0 &&
      workflowTableConfiguration?.length === numOfFormsAssociated?.length
    ) {
      const filteredList1: any = [];
      workflowTableConfiguration.forEach((workflowItem: any) =>
        numOfFormsAssociated.forEach((item: any) => {
          if (workflowItem.id === item.templateId) {
            filteredList1.push({
              ...workflowItem,
              formAssociationCount: item?.count,
            });
          }
        })
      );
      filteredList = filteredList1;
    }

    const item = filteredList[0];
    const itemsList: any = Object.keys(item).filter((value) => {
      return (
        value !== "id" &&
        value !== "version" &&
        value !== "rootTemplateId" &&
        value !== "isDefault" &&
        value !== "formAssociationCount"
      );
    });
    setWorkflowTableConfiguration(filteredList);
    return () => {
      return;
    };
  }, [workflowDetails, numOfFormsAssociated]);

  const navigateToeditPage = (item: any) => {
    history.push({
      pathname: `/workflow/view/${Number(item.id)}`,
      state: { detail: item },
    });
  };
  const handleChangePage = (event: any, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: any) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleClonePopup = () => {
    setClonePopup(!clonePopup);
  };

  const numOfFormsAssociatedValidation = async (workflowTemplateId: any) => {
    try {
      const response = await client.mutate({
        mutation: FETCH_RUNTIME_INFO_DATA_FOR_WF_TEMPLATE_ID,
        variables: {
          workflowTemplateId: workflowTemplateId,
        },
        context: { role: WorkflowTemplateRoles.viewWorkflowTemplate },
      });
      return response?.data?.workflowRuntimeInfo?.length > 0 ? true : false;
    } catch (error) {
      console.log(error);
      return false;
    }
  };

  return (
    <TableContainer component={Paper} className={classes.paper}>
      <Table
        stickyHeader
        className={classes.table}
        style={{ tableLayout: "auto" }}
        aria-label="simple table"
      >
        <TableHead>
          <TableRow>
            {columns.map((item: any, i: number) => (
              <TableCell
                align="left"
                key={i}
                className="table__main__head__cell"
              >
                {item.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody
          className={
            !canCreateWorkflowTemplates && !canUpdateWorkflowTemplates
              ? "tableRow"
              : ""
          }
        >
          {workflowTableConfiguration
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((item: any, j: number) => (
              <TableRow
                key={j}
                onClick={() =>
                  !canCreateWorkflowTemplates && !canUpdateWorkflowTemplates
                    ? navigateToeditPage(item)
                    : undefined
                }
              >
                {Object.keys(item)
                  .filter((item) => {
                    return (
                      item !== "id" &&
                      item !== "version" &&
                      item !== "rootTemplateId" &&
                      item !== "isDefault" &&
                      item !== "formAssociationCount"
                    );
                  })
                  .map(
                    (value: any, i: number) =>
                      value !== "id" && (
                        <TableCell
                          align="left"
                          key={i}
                          component="th"
                          scope="item"
                          className="table__main__body__cell"
                        >
                          {item[value]}
                        </TableCell>
                      )
                  )}
                {(canCreateWorkflowTemplates || canUpdateWorkflowTemplates) && (
                  <TableCell align="right" component="th" scope="item">
                    {(canCreateWorkflowTemplates ||
                      canUpdateWorkflowTemplates) && (
                      <Tooltip title="Clone Workflow" placement="top">
                        <IconButton
                          className="table__main__body__iconContainer"
                          onClick={() => {
                            handleClonePopup();
                            setCurrentWorkflowId(item.id);
                          }}
                        >
                          <FileCopyOutlinedIcon
                            htmlColor="#B0B0B0"
                            className="table__main__body__cell__icon"
                          />
                        </IconButton>
                      </Tooltip>
                    )}
                    {(canCreateWorkflowTemplates ||
                      canUpdateWorkflowTemplates) && (
                      <Tooltip placement="top" title="Edit Workflow">
                        <IconButton
                          className="table__main__body__iconContainer"
                          onClick={() => navigateToeditPage(item)}
                        >
                          <EditOutlinedIcon
                            htmlColor="#B0B0B0"
                            className="table__main__body__cell__icon"
                          />
                        </IconButton>
                      </Tooltip>
                    )}

                    {canDeleteWorkflowTemplates && (
                      <Tooltip
                        title={
                          item.isDefault || item.formAssociationCount
                            ? "Default Workflows or Associated Workflows cannot be deleted!"
                            : "Delete Workflow"
                        }
                        placement="top"
                      >
                        <span>
                          <IconButton
                            disabled={
                              item.formAssociationCount || item.isDefault
                                ? true
                                : false
                            }
                            className="table__main__body__iconContainer"
                            onClick={() => {
                              handleDeletePopup();
                              setCurrentWorkflowId(item.id);
                            }}
                          >
                            <DeleteOutlinedIcon
                              htmlColor="#B0B0B0"
                              className="table__main__body__delete__icon"
                            />
                          </IconButton>
                        </span>
                      </Tooltip>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
        </TableBody>
      </Table>
      <TablePagination
        className="workflowListScreen__footerPagination"
        rowsPerPageOptions={[5, 10, 20, 50, 100]}
        component="div"
        count={workflowDetails.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onChangePage={handleChangePage}
        onChangeRowsPerPage={handleChangeRowsPerPage}
      />
      <ClonePopup
        open={clonePopup}
        handleClonePopup={handleClonePopup}
        handleCloneWorkflowCreation={handleCloneWorkflowCreation}
        currentWorkflowId={currentWorkflowId}
      />
      <ConfirmDialog
        open={openDeletePopup}
        message={{
          header: "Delete",
          text: "Are you sure you want to delete this workflow?",
          cancel: "Cancel",
          proceed: "Delete",
        }}
        proceed={async () => {
          const validation = await numOfFormsAssociatedValidation(
            currentWorkflowId
          );
          if (!validation) {
            deleteWorkflowTemplate(currentWorkflowId);
          } else {
            Notify.sendNotification(
              "Associated Workflows cannot be deleted!",
              AlertTypes.error
            );
          }
          handleDeletePopup();
        }}
        close={handleDeletePopup}
      />
    </TableContainer>
  );
}

export default WorkflowListScreen;
