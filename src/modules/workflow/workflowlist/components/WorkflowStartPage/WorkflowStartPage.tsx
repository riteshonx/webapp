import { Box, Button } from "@material-ui/core";
import React, { ReactElement } from "react";
import { useHistory } from "react-router-dom";
import { workflowContext } from "../../../contextAPI/workflowContext";
import WorkflowListScreen from "../WorkflowListScreen/WorkflowListScreen";
import "./WorkflowStartPage.scss";
import {
  FETCH_LIST_WORKFLOWS,
  DELETE_WORKFLOW_TEMPLATE,
} from "../../../graphql/queries/workflow";
import { WorkflowTemplateRoles } from "../../../../../utils/role";
import { setWorkFlowName } from "../../../contextAPI/action";
import { client } from "../../../../../services/graphql";
import { setIsLoading } from "../../../../root/context/authentication/action";
import { stateContext } from "../../../../root/context/authentication/authContext";
import axios from "axios";
import Notify, {
  AlertTypes,
} from "../../../../shared/components/Toaster/Toaster";
import {
  decodeExchangeToken,
  getExchangeToken,
} from "../../../../../services/authservice";
import NoDataMessage from "../../../../shared/components/NoDataMessage/NoDataMessage";
import {
  canCreateWorkflowTemplates,
  canViewWorkflowTemplates,
} from "../../../roles/permissions";
import CommonHeader from "../../../../shared/components/CommonHeader/CommonHeader";

export interface Params {
  id: string;
  name: string;
}

const headerInfo = {
  name: "Workflows",
  description: "",
};

const noPermissionMessage =
  "You don't have permission to view the workflow templates";

function WorkflowStartPage(): ReactElement {
  const history = useHistory();
  const context: any = React.useContext(workflowContext);
  const { dispatch, state }: any = React.useContext(stateContext);
  const [listType, setListType] = React.useState(true);

  React.useEffect(() => {
    async function getWorkflowList() {
      dispatch(setIsLoading(true));
      const data = await getWorkflowTemplateList();
      data && dispatch(setIsLoading(false));
    }
    if (canViewWorkflowTemplates) {
      getWorkflowList();
    }
  }, []);

  const getWorkflowTemplateList = async () => {
    try {
      const tenantId = decodeExchangeToken().tenantId;

      const workflowListResponse: any = await client.query({
        query: FETCH_LIST_WORKFLOWS,
        variables: {
          tenantId: tenantId,
        },
        fetchPolicy: "network-only",
        context: { role: WorkflowTemplateRoles.viewWorkflowTemplate },
      });
      const workflowTemplateItemArray = JSON.parse(
        JSON.stringify(workflowListResponse?.data?.workflowTemplate)
      );

      if (
        workflowTemplateItemArray !== null &&
        workflowTemplateItemArray !== undefined &&
        workflowTemplateItemArray.length > 0
      ) {
        workflowTemplateItemArray.forEach((templateItem: any) => {
          templateItem.userName =
            templateItem?.wfTemplateCreatedByUser?.firstName || "";
        });
      }
      context.dispatch(setWorkFlowName(workflowTemplateItemArray));
      return true;
    } catch (error) {
      console.log(error);
      dispatch(setIsLoading(false));
    }
  };

  const handleCreateWorkflowClick = () => {
    history.push("/workflow/view");
  };

  const handleCloneWorkflowCreation = async (
    workflowName: any,
    currentWorkflowId: any
  ) => {
    const data = {
      workflowName: workflowName,
      workflowtemplateId: currentWorkflowId,
    };
    try {
      const token = getExchangeToken();
      const response = await axios.post(
        `${process.env["REACT_APP_WORKFLOW_URL"]}workflow-admin/templates/cloneWorkflowTemplate`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response && response.status === 200) {
        Notify.sendNotification(
          "Workflow has been cloned successfully",
          AlertTypes.success
        );
        dispatch(setIsLoading(true));
        const data = await getWorkflowTemplateList();
        data && dispatch(setIsLoading(false));
        return true;
      }
    } catch (error: any) {
      // Notify.sendNotification(error.message, AlertTypes.error);
      dispatch(setIsLoading(false));
      return error?.response?.data?.message;
    }
  };

  const deleteWorkflowTemplate = async (currentWorkflowId: number) => {
    const isDeleted = await executeDeleteWorkflowQuery(currentWorkflowId);
    if (isDeleted) {
      Notify.sendNotification("Workflow is Deleted!", AlertTypes.success);
      dispatch(setIsLoading(true));
      const data = await getWorkflowTemplateList();
      data && dispatch(setIsLoading(false));
    }
  };

  const executeDeleteWorkflowQuery = async (id: any) => {
    try {
      await client.mutate({
        mutation: DELETE_WORKFLOW_TEMPLATE,
        variables: {
          id: id,
        },
        context: { role: WorkflowTemplateRoles.updateWorkflowTemplate },
      });
      return true;
    } catch (error) {
      dispatch(setIsLoading(false));
      console.log(error);
    }
  };

  return !state.isLoading ? (
    <Box
      display="flex"
      flexDirection="column"
      className="workflowStartPage__main"
    >
      <Box display="flex" justifyContent="space-between">
        <Box
          display="flex"
          alignItems="center"
          className="workflowStartPage__main__header"
        >
          {/* <ArrowBackIos
            className="workflowStartPage__main__header__icon"
            onClick={() => history.push("/")}
          />
          <Box>Workflows</Box> */}
          <CommonHeader headerInfo={headerInfo} />
        </Box>
        <Box
          display="flex"
          alignItems="center"
          className="workflowStartPage__main__buttonContainer"
        >
          {context.state.workflowDetails &&
            context.state.workflowDetails.length !== 0 &&
            canCreateWorkflowTemplates && (
              <Button
                className="btn-primary"
                onClick={handleCreateWorkflowClick}
              >
                Add New Workflow
              </Button>
            )}
        </Box>
      </Box>
      {listType && context.state.workflowDetails?.length ? (
        <WorkflowListScreen
          workflowDetails={context.state.workflowDetails}
          handleCloneWorkflowCreation={handleCloneWorkflowCreation}
          deleteWorkflowTemplate={deleteWorkflowTemplate}
        />
      ) : context.state.workflowDetails?.length ? (
        <Box
          display="flex"
          flexGrow={1}
          alignItems="center"
          justifyContent="center"
          style={{ fontSize: "2rem", fontWeight: "bold" }}
        >
          Gallery View
        </Box>
      ) : (
        !canViewWorkflowTemplates && (
          <Box
            display="flex"
            flexDirection="column"
            flexGrow={1}
            alignItems="center"
            justifyContent="center"
            className="workflowStartPage__main__body"
          >
            <NoDataMessage message={noPermissionMessage} />
          </Box>
        )
      )}
    </Box>
  ) : (
    <></>
  );
}

export default WorkflowStartPage;
