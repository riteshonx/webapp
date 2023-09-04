import React, {
  ReactElement,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";
import { match, useRouteMatch } from "react-router-dom";
import { useDebounce } from "../../../../../customhooks/useDebounce";
import { FETCH_PROJECT_ASSOCIATION } from "../../../../../graphhql/queries/projects";
import { decodeExchangeToken } from "../../../../../services/authservice";
import { client } from "../../../../../services/graphql";
import {
  myProjectRole,
  ProjectSetupRoles,
  tenantUserRole,
} from "../../../../../utils/role";
import { setIsLoading } from "../../../../root/context/authentication/action";
import { stateContext } from "../../../../root/context/authentication/authContext";
import Header from "../../../../shared/components/Header/Header";
import WorkFlowView from "../../../../shared/components/WorkFlowView/WorkFlowView";
import {
  setWorkFlowFeatureType,
  setWorkflowOutComes,
  setWorkFlowRootId,
  setWorkFlowStepAssignees,
  setWorkflowSteps,
  setWorkFlowViewType,
  setWorkflowTemplateMaxId,
} from "../../../context/workflow/workflowAction";
import { workFlowContext } from "../../../context/workflow/workflowContext";
import {
  workflowReducer,
  workFlowInitial,
} from "../../../context/workflow/workflowReducer";
import {
  LOAD_PROJECT_WORKFLOW_DETAILS,
  FETCH_WORK_FLOW_LATEST_VERSION,
  FETCH_PROJECT_WORK_FLOW_DURATION_ASSIGNEE,
} from "../../../graphql/queries/workflow";
import { projectDetailsContext } from "../../../projects/Context/ProjectDetailsContext";
import FormAssociationTable from "../../components/FormAssociationTable/FormAssociationTable";
import ProjectSettingsAction from "../../components/ProjectSettingsAction/ProjectSettingsAction";
import ProjectSettingsHeader from "../../components/ProjectSettingsHeader/ProjectSettingsHeader";
import { FETCH_PROJECT_TEMPLATE_ASSOCIATION } from "../../graphql/queries/projectSettings";
import StatusListProjectSetting from "./components/StatusListProjectSetting";
import "./ProjectFormAssociation.scss";

export const header = "Form Association";

export const placeholder = "Search by form name";
export interface Params {
  projectId: string;
}

export default function ProjectFormAssociation(): ReactElement {
  const [workFlowState, workFlowDispatch] = useReducer(
    workflowReducer,
    workFlowInitial
  );
  const [searchText, setsearchText] = useState("");
  const debounceName = useDebounce(searchText, 1000);
  const { dispatch, state }: any = useContext(stateContext);
  const [formAssociationLists, setFormAssociationLists] = useState<Array<any>>(
    []
  );
  const pathMatch: match<Params> = useRouteMatch();
  const [isWorkflowOpen, setIsWorkflowOpen] = useState(false);
  const [statusListInfo, setStatusListInfo] = useState({
    isOpen: false,
    formItem: null,
  });

  const { projectDetailsState }: any = useContext(projectDetailsContext);

  useEffect(() => {
    fetchProjectTemplateAssociation();
  }, [debounceName]);

  useEffect(() => {
    if (projectDetailsState.projectToken) {
      fetchProjectUsers();
    }
  }, [projectDetailsState.projectToken]);

  const searchTextValue = (value: string) => {
    setsearchText(value);
  };

  const fetchProjectUsers = async () => {
    try {
      dispatch(setIsLoading(true));
      const role = decodeExchangeToken().allowedRoles.includes(
        tenantUserRole.viewTenantUsers
      )
        ? tenantUserRole.viewTenantUsers
        : myProjectRole.viewMyProjects;
      const projectAssociationResponse = await client.query({
        query: FETCH_PROJECT_ASSOCIATION,
        variables: {
          limit: 1000,
          offset: 0,
          projectId: Number(pathMatch.params.projectId),
          fName: `%%`,
        },
        fetchPolicy: "network-only",
        context: { role },
      });
      const projectUserIds = [];
      if (projectAssociationResponse.data.length > 0) {
        projectAssociationResponse.data?.projectAssociation.forEach(
          (item: any) => {
            projectUserIds.push(item?.user?.id);
          }
        );
      }
    } catch (error: any) {
      console.log(error.message);
    }
  };

  const fetchProjectTemplateAssociation = async () => {
    try {
      dispatch(setIsLoading(true));
      const formAssociationResponse = await client.query({
        query: FETCH_PROJECT_TEMPLATE_ASSOCIATION,
        variables: {
          limit: 1000,
          offset: 0,
          searchFormText: `%${debounceName}%`,
          projectId: Number(pathMatch.params.projectId),
        },
        fetchPolicy: "network-only",
        context: { role: myProjectRole.viewMyProjects },
      });
      const formAssociation: Array<any> = [];
      if (formAssociationResponse.data.projectTemplateAssociation.length > 0) {
        formAssociationResponse.data.projectTemplateAssociation.forEach(
          (item: any) => {
            const newItem = {
              formName: item?.formTemplate?.projectFeature?.caption,
              featureId: item?.formTemplate?.featureId,
              formType: item?.formTemplate?.templateName,
              templateId: item?.formTemplate?.id,
              workflow: item?.workflowTemplate?.name || "",
              workflowId: item?.workflowTemplate?.id || -1,
              workflowEnabled: item.workflowEnabled,
            };
            formAssociation.push(newItem);
          }
        );
      }
      setFormAssociationLists(formAssociation);
      dispatch(setIsLoading(false));
    } catch (error) {
      console.log(error);
      dispatch(setIsLoading(false));
    }
  };

  const viewworkFlow = (argRow: any) => {
    workFlowDispatch(setWorkFlowFeatureType(argRow.featureId));
    fetchAssociatedWorkFlowDetails(argRow.workflowId, argRow.featureId);
  };

  const openStatusList = (formAssociationItem: any) => {
    setStatusListInfo((p) => {
      return { formItem: formAssociationItem, isOpen: true };
    });
  };

  const fetchAssociatedWorkFlowDetails = async (
    argWorkFlowId: number,
    argFeatureType: number
  ) => {
    try {
      dispatch(setIsLoading(true));
      const latesterVersionIdResonse = await client.query({
        query: FETCH_WORK_FLOW_LATEST_VERSION,
        variables: {
          rootTemplateId: argWorkFlowId,
        },
        fetchPolicy: "network-only",
        context: {
          role: ProjectSetupRoles.viewProjectTemplateAssociation,
          token: projectDetailsState.projectToken,
        },
      });
      const stepAssigneess: Array<any> = [];
      if (
        latesterVersionIdResonse?.data?.workflowTemplate_aggregate?.aggregate
          ?.max?.id
      ) {
        const maxId = latesterVersionIdResonse?.data?.workflowTemplate_aggregate?.aggregate
        ?.max?.id
        workFlowDispatch(setWorkflowTemplateMaxId(maxId))
        argWorkFlowId =maxId;
      }
      const stepDetailsResponse = await client.query({
        query: FETCH_PROJECT_WORK_FLOW_DURATION_ASSIGNEE,
        variables: {
          featureType: argFeatureType,
          workflowTemplateId: argWorkFlowId,
        },
        fetchPolicy: "network-only",
        context: {
          role: ProjectSetupRoles.viewProjectTemplateAssociation,
          token: projectDetailsState.projectToken,
        },
      });
      if (stepDetailsResponse.data.workflowProjectStepDef.length > 0) {
        stepDetailsResponse.data.workflowProjectStepDef.forEach((item: any) => {
          const assigneeList: Array<any> = [];
          item.workflowProjectStepAssignees.forEach((userItem: any) => {
            if (userItem?.user) {
              let name = `${userItem?.user?.firstName || ""} ${
                userItem?.user?.lastName || ""
              }`;
              if (!userItem?.user?.firstName && !userItem?.user?.lastName) {
                name = userItem?.user?.email.split("@")[0];
              } else {
                name = `${userItem?.user?.firstName} ${userItem?.user?.lastName}`;
              }
              const newAssigne = {
                id: userItem.assignee,
                email: "",
                name,
              };
              assigneeList.push(newAssigne);
            }
          });
          const newStepAssignee = {
            stepDefName: item.stepDefName,
            duration: item.durationInDays,
            assignees: assigneeList,
            stepDefId: item.id,
            type: item?.workflowTemplateStepDef?.type,
          };
          stepAssigneess.push(newStepAssignee);
        });
      }
      workFlowDispatch(setWorkFlowStepAssignees(stepAssigneess));
      fetchCurrentVersionWorkflowVersion(
        argWorkFlowId,
        stepAssigneess.length === 0
      );
      workFlowDispatch(setWorkFlowRootId(argWorkFlowId));
    } catch (error: any) {
      console.log(error.message);
      dispatch(setIsLoading(false));
    }
  };

  const fetchCurrentVersionWorkflowVersion = async (
    argWorkFlowId: number,
    argIsNew = false
  ) => {
    try {
      const responseData = await client.query({
        query: LOAD_PROJECT_WORKFLOW_DETAILS,
        variables: {
          workflowTemplateId: argWorkFlowId,
        },
        fetchPolicy: "network-only",
        context: {
          role: ProjectSetupRoles.viewProjectTemplateAssociation,
          token: projectDetailsState.projectToken,
        },
      });
      if (responseData.data.workflowTemplate.length > 0) {
        const steps: Array<any> = [];
        const endPoints: Array<any> = [];
        const stepKeys: any = {};
        responseData.data.workflowTemplate[0].workflowTemplateStepDefs.forEach(
          (item: any) => {
            stepKeys[item.name] = item.id;
          }
        );
        const stepAssigneess: Array<any> = [];
        responseData.data.workflowTemplate[0].workflowTemplateStepDefs.forEach(
          (item: any) => {
            if (argIsNew) {
              const newStepAssignee = {
                stepDefName: item.name,
                duration: 0,
                assignees: [],
                stepDefId: -1,
                type: item.type,
              };
              stepAssigneess.push(newStepAssignee);
            }
            const newStep = {
              id: item.id,
              stepType: item.type,
              stepDefName: item.name,
              label: item.description,
              assignees: [],
              duration: item?.duration || 0,
              position: {
                x: item.posx,
                y: item.posy,
              },
              approved: false,
            };
            steps.push(newStep);
            item.wFFromStepDefOutcomes.forEach((subItem: any) => {
              const newOutCome = {
                id: subItem.id,
                source: stepKeys[subItem.fromStepDefName],
                target: stepKeys[subItem.toStepDefName],
                label: subItem.name,
                sourceHandle: subItem.startx,
                targetHandle: subItem.endx,
                type: "custom",
              };
              endPoints.push(newOutCome);
            });
            item.wFToStepDefOutcomes.forEach((subItem: any) => {
              const newOutCome = {
                id: subItem.id,
                source: stepKeys[subItem.fromStepDefName],
                target: stepKeys[subItem.toStepDefName],
                label: subItem.name,
                sourceHandle: subItem.startx,
                targetHandle: subItem.endx,
                type: "custom",
              };
              endPoints.push(newOutCome);
            });
          }
        );
        workFlowDispatch(setWorkflowSteps(steps));
        workFlowDispatch(setWorkFlowViewType("PROJECT"));
        workFlowDispatch(setWorkflowOutComes(endPoints));
        if (argIsNew) {
          workFlowDispatch(setWorkFlowStepAssignees(stepAssigneess));
        }
      }
      setIsWorkflowOpen(true);
      dispatch(setIsLoading(false));
    } catch (error: any) {
      dispatch(setIsLoading(false));
    }
  };

  return (
    <div className="form-association">
      <ProjectSettingsHeader header={header} />
      {projectDetailsState?.projectPermission
        ?.canViewProjectTemplateAssociation ? (
        <>
          <ProjectSettingsAction
            searchText={searchTextValue}
            placeholder={placeholder}
          />
          <FormAssociationTable
            formAssociationData={formAssociationLists}
            viewWorkFlow={viewworkFlow}
            openStatusList={openStatusList}
          />
          {statusListInfo.isOpen && (
            <div className="form-association_statusList-wrapper">
              <StatusListProjectSetting
                onBackClick={() =>
                  setStatusListInfo({ isOpen: false, formItem: null })
                }
                formItem={statusListInfo.formItem}
              />
            </div>
          )}
          <workFlowContext.Provider value={{ workFlowState, workFlowDispatch }}>
            {isWorkflowOpen && (
              <div className="form-association__workflow-wrapper">
                <Header
                  header={"Workflow"}
                  navigate={() => setIsWorkflowOpen(false)}
                />
                <WorkFlowView close={() => setIsWorkflowOpen(false)} />
              </div>
            )}
          </workFlowContext.Provider>
        </>
      ) : (
        <div className="form-association__nopermission">
          You don't have permission to view form association
        </div>
      )}
    </div>
  );
}
