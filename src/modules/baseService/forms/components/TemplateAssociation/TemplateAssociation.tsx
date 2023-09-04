import React, { useContext, useEffect, useState } from "react";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import SearchIcon from "@material-ui/icons/Search";
import { ReactElement } from "react";
import "./TemplateAssociation.scss";
import { FormControl, Select, MenuItem, Button } from "@material-ui/core";
import { client } from "../../../../../services/graphql";
import { FormsRoles } from "../../../../../utils/role";
import {
  CREATE_PROJECT_ASSOCIATION,
  LOAD_PROJECT_TEMPLATE_WORKFLOW_ASSOCIATION,
  LOAD_TEMPLATE_FOR_ASSOCIATION,
  LOAD_WORKFLOW_TEMPLATES,
  LOAD_UPDATED_WORKFLOW,
} from "../../grqphql/queries/formTemplates";
import { templateContext } from "../../context/templates/context";
import { stateContext } from "../../../../root/context/authentication/authContext";
import { setIsLoading } from "../../../../root/context/authentication/action";
import Notification, {
  AlertTypes,
} from "../../../../shared/components/Toaster/Toaster";
import { CustomPopOver } from "../../../../shared/utils/CustomPopOver";
import LaunchIcon from "@material-ui/icons/Launch";
import { useHistory } from "react-router-dom";
import { useDebounce } from "../../../../../customhooks/useDebounce";
import ResponseCode from "src/utils/errorCodeForMessage";

interface TemplateAssociationProps {
  open: boolean;
  close: (event: boolean) => void;
}

interface IProject {
  id: number;
  name: string;
  templateId: number;
  originalTemplateId: number;
  workflowTemplateId: number | null | "null";
  originalWorkflowTemplateId: number;
  rootWorkflowTemplateId: number;
}

interface ITemplate {
  id: number;
  templateName: string;
}

enum TemplateType {
  FORM = "FORM",
  WORKFLOW = "WORKFLOW",
}

const templateAssociateErrMsg =
  "You cannot update the default workflow template for this project as there is active data using the old workflow template";

function TemplateAssociation(props: TemplateAssociationProps): ReactElement {
  const [projectName, setprojectName] = useState("");
  const [projects, setProjects] = useState<IProject[]>([]);
  const [templates, setTemplates] = useState<ITemplate[]>([]);
  const { templateState }: any = useContext(templateContext);
  const { dispatch }: any = useContext(stateContext);
  const [workFlowList, setWorkFlowList] = useState<Array<any>>([]);
  const debounceName = useDebounce(projectName, 1000);
  const history = useHistory();
  const popOverclasses = CustomPopOver();
  const [isUpdated, setIsUpdated] = useState(false);
  const [hasDataAfterFetch, setHasDataAfterFetch] = useState(true);

  const handleClose = () => {
    props.close(false);
  };

  useEffect(() => {
    getTemplates();
    getWorkFlows();
  }, []);

  useEffect(() => {
    setIsUpdated(false);
    getProjectTemplateAssociation();
  }, [debounceName]);

  useEffect(() => {
    if (workFlowList.length > 0 && projects.length > 0 && !isUpdated) {
      setIsUpdated(true);
      projects.forEach((item: any) => {
        if (item.rootWorkflowTemplateId) {
          const currentItem = workFlowList.find(
            (wfItem: any) =>
              wfItem.rootTemplateId === item.rootWorkflowTemplateId
          );
          item.workflowTemplateId = currentItem
            ? currentItem.id
            : item.workflowTemplateId;
          item.originalWorkflowTemplateId = currentItem
            ? currentItem.id
            : item.originalWorkflowTemplateId;
        }
      });
      const idList: any = new Set();
      projects.forEach((item: any) => {
        const existingItem = workFlowList.find(
          (wfItem: any) => wfItem.id === item.workflowTemplateId
        );
        if (!existingItem) {
          const rootWorkFlowId =
            item.rootWorkflowTemplateId || item.workflowTemplateId;
          if (rootWorkFlowId && rootWorkFlowId !== "null")
            idList.add(rootWorkFlowId);
        }
      });
      getUpdatedWorkflows(idList);
      setProjects([...projects]);
    }
  }, [workFlowList, projects]);

  const getUpdatedWorkflows = async (idList: any) => {
    try {
      const promiseList: any = [];
      idList.forEach((item: number) => {
        const workflowData = client.query({
          query: LOAD_UPDATED_WORKFLOW,
          variables: {
            rootTemplateId: item,
          },
          fetchPolicy: "network-only",
          context: { role: FormsRoles.createProjectTemplateAssociation },
        });
        promiseList.push(workflowData);
      });
      const workflowDataList: any = await Promise.all(promiseList);
      if (workflowDataList?.length) {
        const projectsList = [...projects];
        projectsList.forEach((item: any, index: number) => {
          workflowDataList.some((item1: any) => {
            const {
              data: {
                workflowTemplate: [workFlowFirstItem],
              },
            } = item1;
            if (
              workFlowFirstItem.rootTemplateId &&
              workFlowFirstItem.rootTemplateId == item.workflowTemplateId
            ) {
              projectsList[index].workflowTemplateId = workFlowFirstItem.id;
              projectsList[index].originalWorkflowTemplateId =
                workFlowFirstItem.id;

              return true;
            }
          });
        });
        setProjects(projectsList);
      }
    } catch (error: any) {
      console.error(
        "Something went wrong while getting updated workflows",
        error
      );
    }
  };

  const getWorkFlows = async () => {
    try {
      const workflowData = await client.query({
        query: LOAD_WORKFLOW_TEMPLATES,
        variables: {},
        fetchPolicy: "network-only",
        context: { role: FormsRoles.createProjectTemplateAssociation },
      });
      const targetList: Array<any> = [];
      if (workflowData.data.workflowTemplate.length > 0) {
        workflowData.data.workflowTemplate.forEach((item: any) => {
          if (item.name !== "Standard Inspection Workflow") {
            const newItem = {
              id: item.id,
              name: item.name,
              rootTemplateId: item.rootTemplateId,
            };
            targetList.push(newItem);
          }
        });
      }
      setWorkFlowList(targetList);
    } catch (error: any) {}
  };

  const getProjectTemplateAssociation = async () => {
    try {
      dispatch(setIsLoading(true));
      const projectsData = await client.query({
        query: LOAD_PROJECT_TEMPLATE_WORKFLOW_ASSOCIATION,
        variables: {
          name: `%${projectName}%`,
          featureId: templateState.currentFeature.id,
        },
        fetchPolicy: "network-only",
        context: { role: FormsRoles.createProjectTemplateAssociation },
      });
      const listOfProjects: IProject[] = [];
      if (projectsData.data.project.length > 0) {
        projectsData.data.project.forEach((item: any) => {
          const templateId =
            item.projectTemplateAssociations.length > 0
              ? item.projectTemplateAssociations[0].templateId
              : -1;
          const workFlowId =
            item.projectTemplateAssociations.length > 0
              ? item.projectTemplateAssociations[0]?.workflowTemplateId
              : -1;
          const rootWorkflowTemplateId =
            item.projectTemplateAssociations.length > 0
              ? item.projectTemplateAssociations[0]?.workflowTemplate
                  ?.rootTemplateId
              : null;
          const newItem: IProject = {
            id: item.id,
            name: item.name,
            templateId,
            originalTemplateId: templateId,
            workflowTemplateId: workFlowId || "null",
            originalWorkflowTemplateId: workFlowId || "null",
            rootWorkflowTemplateId,
          };
          listOfProjects.push(newItem);
        });
      }
      if (!listOfProjects.length) {
        setHasDataAfterFetch(false);
      }
      setProjects(listOfProjects);
      dispatch(setIsLoading(false));
    } catch (error) {
      dispatch(setIsLoading(false));
    }
  };

  const getTemplates = async () => {
    try {
      dispatch(setIsLoading(true));
      const templatesData = await client.query({
        query: LOAD_TEMPLATE_FOR_ASSOCIATION,
        variables: {
          featureId: templateState.currentFeature.id,
        },
        fetchPolicy: "network-only",
        context: { role: FormsRoles.viewFormTemplate },
      });
      if (templatesData.data.formTemplates.length > 0) {
        setTemplates([...templatesData.data.formTemplates]);
      }
      dispatch(setIsLoading(false));
    } catch (error) {
      dispatch(setIsLoading(false));
    }
  };

  const setTemplate = (argEvent: any, argIndex: number): void => {
    const projectsList = [...projects];
    projectsList[argIndex].templateId = argEvent.target.value;
    setProjects(projectsList);
    handleSave(argIndex, TemplateType.FORM);
  };

  const setWorkFlow = (argEvent: any, argIndex: number): void => {
    const projectsList = [...projects];
    projectsList[argIndex].workflowTemplateId = argEvent.target.value;
    setProjects(projectsList);
    handleSave(argIndex, TemplateType.WORKFLOW);
  };

  const handleSave = async (index: number, templateType: TemplateType) => {
    try {
      dispatch(setIsLoading(true));
      const item = projects[index];
      const { id, templateId, workflowTemplateId } = item;
      await client.mutate({
        mutation: CREATE_PROJECT_ASSOCIATION,
        variables: {
          featureId: templateState.currentFeature.id,
          projectId: id,
          templateId: templateId,
          workflowTemplateId:
            workflowTemplateId === "null" ? null : workflowTemplateId,
        },
        context: { role: FormsRoles.createProjectTemplateAssociation },
      });
      let action = "form";
      if (templateType === TemplateType.WORKFLOW) {
        action = "workflow";
      }
      let successMessage = `Successfully updated default ${action} template for ${item.name}`;
      if (workflowTemplateId === "null") {
        successMessage = `Successfully selected Custom List for ${item.name}`;
      }
      Notification.sendNotification(successMessage, AlertTypes.success);
    } catch (error: any) {
      console.error(error?.message);
      const message = error?.message
        ? getResponseMessage(error?.message)
        : "Something went wrong";
      Notification.sendNotification(message, AlertTypes.error);
      const projectsList = [...projects];
      if (templateType === TemplateType.FORM) {
        projectsList[index].templateId = projectsList[index].originalTemplateId;
      } else {
        projectsList[index].workflowTemplateId =
          projectsList[index].originalWorkflowTemplateId;
      }
      setProjects(projectsList);
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  function getResponseMessage(argCode: any) {
    if (ResponseCode[argCode]) {
      return ResponseCode[argCode].DESCRIPTION;
    } else return templateAssociateErrMsg;
  }

  const navigateToWorkFlow = () => {
    history.push("/workflow/list");
  };

  return (
    <Dialog
      open={props.open}
      className="projectAssociation"
      disableBackdropClick={true}
      fullWidth={true}
      maxWidth={"md"}
      onClose={handleClose}
      aria-labelledby="form-dialog-title"
    >
      <div id="form-dialog-title" className="projectAssociation__head">
        <div className="projectAssociation__head__title">
          Template Association
        </div>
        <div className="projectAssociation__head__subtitle">
          Note: For each project, choose a corresponsing template to make it
          active
        </div>
        <div className="projectAssociation__head__search">
          <TextField
            value={projectName}
            id="association-search-text"
            data-testid="association-search-text"
            type="text"
            variant="outlined"
            fullWidth
            placeholder="Search by project name"
            onChange={(e) => setprojectName(e.target.value)}
          />
          <SearchIcon className="projectAssociation__head__search__icon" />
        </div>
        <div className="projectAssociation__head__header">
          <div className="projectAssociation__head__header__project">
            Project Name
          </div>
          <div className="projectAssociation__head__header__template">
            Form Template
          </div>
          <div className="projectAssociation__head__header__template">
            Workflow Template
            <LaunchIcon
              onClick={navigateToWorkFlow}
              className="projectAssociation__head__header__template__icon"
            />
          </div>
        </div>
        {/* <CancelIcon onClick={handleClose} className="projectAssociation__head__close"/> */}
      </div>
      <DialogContent className="projectAssociation__body">
        {projects.length > 0 ? (
          <div className="projectAssociation__body__main">
            {projects.map((item: any, index: number) => (
              <div
                key={`association-${item.id}`}
                className="projectAssociation__body__main__item"
              >
                <div className="projectAssociation__body__main__item__project">
                  {/* <div className="projectAssociation__body__main__item__project__icon">
                        PN
                      </div> */}
                  {item.name}
                </div>
                <div className="projectAssociation__body__main__item__template">
                  <FormControl
                    key={`projectTemplate-${item.name}`}
                    variant="outlined"
                    className="projectAssociation__body__main__item__template__select"
                  >
                    <Select
                      value={item.templateId}
                      labelId="demo-simple-select-outlined-label"
                      id="demo-simple-select-outlined"
                      onChange={(e) => setTemplate(e, index)}
                      MenuProps={{
                        classes: { paper: popOverclasses.root },
                        anchorOrigin: {
                          vertical: "bottom",
                          horizontal: "left",
                        },
                        transformOrigin: {
                          vertical: "top",
                          horizontal: "left",
                        },
                        getContentAnchorEl: null,
                      }}
                    >
                      {templates.map((temp: ITemplate) => (
                        <MenuItem
                          className="mat-menu-item-sm"
                          key={`tem-${temp.id}`}
                          value={temp.id}
                        >
                          {temp.templateName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>
                <div className="projectAssociation__body__main__item__template">
                  <FormControl
                    key={`projectTemplate-${item.name}`}
                    variant="outlined"
                    className="projectAssociation__body__main__item__template__select"
                  >
                    <Select
                      value={item.workflowTemplateId}
                      labelId="demo-simple-select-outlined-label"
                      id="demo-simple-select-outlined"
                      onChange={(e) => setWorkFlow(e, index)}
                      MenuProps={{
                        classes: { paper: popOverclasses.root },
                        anchorOrigin: {
                          vertical: "bottom",
                          horizontal: "left",
                        },
                        transformOrigin: {
                          vertical: "top",
                          horizontal: "left",
                        },
                        getContentAnchorEl: null,
                      }}
                    >
                      <MenuItem
                        className="mat-menu-item-sm"
                        key={`temp-custom-list-${index}`}
                        value={"null"}
                      >
                        Custom List (No workflow)
                      </MenuItem>
                      {workFlowList.map((flow: any) => (
                        <MenuItem
                          className="mat-menu-item-sm"
                          key={`workflow-${flow.id}`}
                          value={flow.id}
                        >
                          {flow.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="projectAssociation__body__nocontent">
            {!hasDataAfterFetch
              ? "There are no active Projects"
              : "Please wait.."}
          </div>
        )}
      </DialogContent>
      <DialogActions className="projectAssociation__footer">
        <Button
          variant="outlined"
          className="btn-secondary"
          onClick={handleClose}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default TemplateAssociation;
