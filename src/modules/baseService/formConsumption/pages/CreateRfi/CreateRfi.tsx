import React, {
  ReactElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import Header from "../../../../shared/components/Header/Header";
import VisibilityIcon from "@material-ui/icons/Visibility";
import RfiForm from "../../components/RfiForm/RfiForm";

import "./CreateRfi.scss";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { FormControlLabel, Grid, Radio, RadioGroup } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import InputLabel from "@material-ui/core/InputLabel";
import {
  setEditMode,
  setIsLoading,
} from "../../../../root/context/authentication/action";
import {
  FIXED_FIELDS,
  FollowerTye,
  InputType,
  LinkType,
} from "../../../../../utils/constants";
import { stateContext } from "../../../../root/context/authentication/authContext";
import { match, useHistory, useRouteMatch } from "react-router-dom";
import {
  CREATE_FORM_TEMPLATE,
  FETCH_FORM_TEMPLATE,
  CREATE_FORM_TEMPLATE_WITHOUT_WORKFLOW,
} from "../../graphql/queries/rfi";
import TextField from "@material-ui/core/TextField";
import moment from "moment";
import { client } from "../../../../../services/graphql";
import Notification, {
  AlertTypes,
} from "../../../../shared/components/Toaster/Toaster";
import FollowerSelect from "../../components/FollowerSelect/FollowerSelect";
import {
  ADD_TENANT_USERGROUP_FOLLOWERS,
  ADD_TENANT_USER_FOLLOWERS,
  LOAD_PROJECT_USERS,
} from "../../graphql/queries/followers";
import { decodeExchangeToken } from "../../../../../services/authservice";
import FormHoc from "../../components/FormHoc/FormHoc";
import { formStateContext, projectContext } from "../../Context/projectContext";
import NoDataMessage from "../../../../shared/components/NoDataMessage/NoDataMessage";
import LinkInput from "../../components/Link/Link";
import { CREATE_LINK } from "../../graphql/queries/link";
import WorkFlowView from "../../../../shared/components/WorkFlowView/WorkFlowView";
import { featureFormRoles } from "../../../../../utils/role";
import {
  workFlowInitial,
  workflowReducer,
} from "../../../context/workflow/workflowReducer";
import { workFlowContext } from "../../../context/workflow/workflowContext";
import {
  setWorkflowSteps,
  setWorkflowOutComes,
  setWorkFlowViewType,
  setWorkFlowStepAssignees,
  setWorkFlowRootId,
  setWorkFlowFeatureType,
  setWorkflowTemplateMaxId,
} from "../../../context/workflow/workflowAction";
import {
  FETCH_WORK_FLOW_DURATION_ASSIGNEE,
  FETCH_WORK_FLOW_LATEST_VERSION,
  LOAD_PROJECT_TEMPLATE_ASSOCIATION,
  LOAD_WORKFLOW_DETAILS,
} from "../../../graphql/queries/workflow";
import ConfirmDialog from "../../../../shared/components/ConfirmDialog/ConfirmDialog";
import FormFeatureTable from "../../components/FormFeatureTable/FormFeatureTable";
import {
  refreshFeaturesList,
  setProjectCustomListValues,
  setLocationTreeData,
  setLocationTreeStructure,
} from "../../Context/projectActions";
import {
  LOAD_CONFIGURATION_LIST_VALUES_CREATE,
  LOAD_TENANT_COMPANY,
} from "src/modules/baseService/graphql/queries/customList";
import { LOAD_PROJECT_LOCATION_NODES } from "src/modules/baseService/projectSettings/graphql/queries/location";
import { CreateFormParams, FormFieldData } from "../../models/form";
import {
  formLocationTreeData,
  intializeFormFieldData,
  sortDataOnSequence,
} from "../../utils/formHelper";
import {
  draftconfirmMessage,
  noPermissionMessage,
} from "../../utils/constants";
import AddAssigneeDialog from "../../components/AddAssigneeDialog/AddAssigneeDialog";
import useBeforeunload from "src/customhooks/useUnload";

let defaultValues: any = {};

type CreateFormDataType = {
  formsData: Array<any>;
  featureId: number;
  workflowData: Array<any>;
  status: string;
  workflowDisabledAssignees: Array<string>;
  workflowDisabledDueDate: string | null;
};

export default function CreateFeatureForms(): ReactElement {
  const history = useHistory();
  const [workFlowState, workFlowDispatch] = useReducer(
    workflowReducer,
    workFlowInitial
  );
  const [workflowEnabled, setWorkflowEnabled] = useState(false);
  const { dispatch, state }: any = useContext(stateContext);
  const pathMatch: match<CreateFormParams> = useRouteMatch();
  const [formTemplateData, setFormTemplateData] = useState<Array<any>>([]);
  const [scheduleImpact, setScheduleImpact] = useState(false);
  const [costImpact, setCostImpact] = useState(false);
  const [requiredFieldArray, setRequiredFieldArray] = useState<Array<any>>([]);
  const [isWorkflowOpen, setIsWorkflowOpen] = useState(false);
  const [followers, setFollowers] = useState<Array<any>>([]);
  const { projectState, projectDispatch }: any = useContext(projectContext);
  const [inactiveBtn, setInactiveBtn] = useState(false);
  const {
    handleSubmit,
    control,
    // watch,
    getValues,
    setValue,
    setError,
    formState: { errors },
  } = useForm<any>({
    defaultValues,
  });
  // const watchAllFields: any = watch();
  const [links, setLinks] = useState<any>({
    formToFormLinks: [],
    formToTaskLinks: [],
  });
  const [workFlowId, setWorkFlowId] = useState(null);
  const [draftConfirmOpen, setDraftConfirmOpen] = useState(false);
  const [firstworkflowstep, setFirstworkflowstep] = useState(null);
  const [companiesList, setCompaniesList] = useState<Array<any>>([]);
  const [usersList, setUsersList] = useState<Array<any>>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [disableDraft, setDisableDraft] = useState(false);
  const [refreshed, setRefreshed] = useState(false);
  const [createFormData, setCreateFormData] =
    useState<Partial<CreateFormDataType>>();
  const [addAssigneOpen, setAddAssigneOpen] = useState(false);
  const [currentSubjectValue, setCurrentSubjectValue] = useState("");

  useEffect(() => {
    workFlowDispatch(
      setWorkFlowFeatureType(Number(pathMatch.params.featureId))
    );
    return () => {
      defaultValues = {};
    };
  }, []);

  useEffect(() => {
    if (links.formToFormLinks.length) {
      setDisableDraft(true);
    } else {
      setDisableDraft(false);
    }
  }, [links.formToFormLinks]);

  useEffect(() => {
    if (state?.selectedProjectToken) {
      dispatch(setIsLoading(true));
      getFormTemplate();
      getWorkFlowDetails();
      fetchTenantUsersLists();
      fetchCompanyLists();
      fetchProjectLocationTreeData();
    }
  }, [state?.selectedProjectToken]);

  useEffect(() => {
    workFlowDispatch(
      setWorkFlowFeatureType(Number(pathMatch.params.featureId))
    );
  }, []);

  useEffect(() => {
    if (isDirty) {
      dispatch(setEditMode(true));
    }
    return () => {
      dispatch(setEditMode(false));
    };
  }, [isDirty]);

  useBeforeunload((event: any) => {
    if (state.editMode) {
      event.preventDefault();
    }
  });

  const fetchTenantUsersLists = async () => {
    try {
      const customListResponse = await client.query({
        query: LOAD_PROJECT_USERS,
        variables: {
          fName: "%%",
          lName: "%%",
        },
        fetchPolicy: "network-only",
        context: {
          role: featureFormRoles.createForm,
          token: state?.selectedProjectToken,
        },
      });
      const users: any = [];
      customListResponse.data?.user.forEach((data: any) => {
        if (data.status !== 1) {
          users.push(data);
        }
      });
      setUsersList(users);
      // projectDispatch(setProjectUsers(users));
    } catch (err: any) {
      console.log(err);
    }
  };

  const fetchCompanyLists = async () => {
    try {
      const customListResponse = await client.query({
        query: LOAD_TENANT_COMPANY,
        variables: {
          limit: 1000,
          offset: 0,
        },
        fetchPolicy: "network-only",
        context: {
          role: featureFormRoles.createForm,
          token: state?.selectedProjectToken,
        },
      });
      setCompaniesList(customListResponse.data.tenantCompanyAssociation);
      // projectDispatch(setTenantCompanies(customListResponse.data.tenantCompanyAssociation));
    } catch {}
  };

  const fetchProjectLocationTreeData = async () => {
    try {
      const responseData = await client.query({
        query: LOAD_PROJECT_LOCATION_NODES,
        variables: {},
        fetchPolicy: "network-only",
        context: {
          role: featureFormRoles.createForm,
          token: state?.selectedProjectToken,
        },
      });
      const locationTreeStructure = formLocationTreeData(
        responseData.data.projectLocationTree
      );
      projectDispatch(
        setLocationTreeData(
          JSON.parse(JSON.stringify(responseData.data.projectLocationTree))
        )
      );
      projectDispatch(setLocationTreeStructure(locationTreeStructure));
    } catch (error: any) {
      console.log(error.message);
    }
  };

  const fetchCustomListValues = async (argIds: Array<number>) => {
    try {
      const customListResponse = await client.query({
        query: LOAD_CONFIGURATION_LIST_VALUES_CREATE,
        variables: {
          id: argIds,
          projectId: Number(pathMatch.params.id),
        },
        fetchPolicy: "network-only",
        context: {
          role: featureFormRoles.createForm,
          token: state?.selectedProjectToken,
        },
      });
      const targetList: any = {};
      if (customListResponse.data.configurationLists.length > 0) {
        customListResponse.data.configurationLists.forEach(
          (configItem: any) => {
            targetList[`${configItem.id}`] = configItem;
          }
        );
      }
      projectDispatch(setProjectCustomListValues(targetList));
    } catch (error: any) {}
  };

  // fetch form template

  const getFormTemplate = async () => {
    try {
      const formsTemplateResponse = await client.query({
        query: FETCH_FORM_TEMPLATE,
        variables: {
          featureId: Number(pathMatch.params.featureId),
        },
        fetchPolicy: "network-only",
        context: {
          role: featureFormRoles.createForm,
          token: state?.selectedProjectToken,
        },
      });
      const templateAssociation =
        formsTemplateResponse.data.projectTemplateAssociation[0];
      const formTemplateVersions =
        templateAssociation?.formTemplate.formTemplateVersions;
      setWorkflowEnabled(templateAssociation.workflowEnabled);
      const configListIds: Array<number> = [];
      if (
        formTemplateVersions[formTemplateVersions?.length - 1]
          .formTemplateFieldData
      ) {
        const formsData: Array<any> = [];
        const currentVersionFieldData = JSON.parse(
          JSON.stringify(
            formTemplateVersions[formTemplateVersions?.length - 1]
              .formTemplateFieldData
          )
        );
        currentVersionFieldData.forEach((item: any) => {
          if (
            item.elementId === FIXED_FIELDS.SUBJECT &&
            item?.metadata?.caption
          ) {
            item.caption = item?.metadata?.caption;
          }
          if (!item.tableId) {
            const newTemplate: FormFieldData = intializeFormFieldData(item);
            if (newTemplate.fieldTypeId === InputType.TABLE) {
              newTemplate.width = 100;
              newTemplate.metaData = JSON.parse(
                JSON.stringify(newTemplate.metaData)
              );
              const tableData = currentVersionFieldData.filter(
                (tabItem: any) => tabItem?.tableId === item.elementId
              );
              const targetRows: Array<any> = [];
              for (let i = 0; i < newTemplate.metaData.rowData.length; i++) {
                let rowData = JSON.parse(
                  JSON.stringify(
                    tableData.filter(
                      (rowItem: any) =>
                        Math.floor(Number(rowItem.caption)) === i + 1
                    )
                  )
                );
                rowData.forEach((cellItem: any) => {
                  const sequence = cellItem.caption.split(".");
                  cellItem.sequence = Number(sequence[1]);
                });
                rowData = rowData.sort(
                  (a: any, b: any) => a.sequence - b.sequence
                );
                targetRows.push(rowData);
              }
              newTemplate.tableFields = targetRows;
            }
            if (!newTemplate.autoGenerated) {
              formsData.push(newTemplate);
            }
          }
          if (
            item.fieldTypeId === InputType.CUSTOMDROPDOWN ||
            item.fieldTypeId === InputType.CUSTOMNESTEDDROPDOWN
          ) {
            if (
              configListIds.indexOf(item.configListId) < 0 &&
              item.configListId
            ) {
              configListIds.push(item.configListId);
            }
          }
        });
        formsData.forEach((field: any) => {
          if (field.fieldTypeId === InputType.TABLE) {
            const tableFields: Array<any> = [];
            field.tableFields.forEach((rowCells: any) => {
              tableFields.push(...rowCells);
            });
            tableFields.forEach((cellValue: any) => {
              setDefaultValueBasedOnInputType(cellValue);
            });
            field.metaData.colData.forEach((cellItem: any) => {
              if (
                cellItem.fieldTypeId === InputType.CUSTOMDROPDOWN ||
                cellItem.fieldTypeId === InputType.CUSTOMNESTEDDROPDOWN
              ) {
                if (
                  configListIds.indexOf(cellItem.fieldTypeId) < 0 &&
                  cellItem.configListId
                ) {
                  configListIds.push(cellItem.configListId);
                }
              }
            });
          } else {
            setDefaultValueBasedOnInputType(field);
          }
        });
        const required = formsData.filter((item) => item.required === true);
        setRequiredFieldArray(required);
        setFormTemplateData(formsData.sort(sortDataOnSequence));
      }
      const uniqueIds = Array.from(new Set(configListIds));
      if (uniqueIds.length > 0) {
        fetchCustomListValues(uniqueIds);
      }
    } catch (err: any) {
      console.log(err);
      dispatch(setIsLoading(false));
    }
  };

  const setDefaultValueBasedOnInputType = (field: any) => {
    if (
      field.fieldTypeId === InputType.TIMEPICKER ||
      field.fieldTypeId === InputType.DATEPICKER ||
      field.fieldTypeId === InputType.DATETIMEPICKER
    ) {
      defaultValues[`${field.elementId}-fieldTypeId${field.fieldTypeId}`] =
        null;
    } else if (field.fieldTypeId === InputType.BOOLEAN) {
      if (
        field.fixed &&
        (field.elementId === FIXED_FIELDS.COST_IMPACT ||
          field.elementId === FIXED_FIELDS.SCHEDULE_IMPACT)
      ) {
        defaultValues[
          `${field.elementId}-comment-fieldTypeId${field.fieldTypeId}`
        ] = "";
      }
      defaultValues[`${field.elementId}-fieldTypeId${field.fieldTypeId}`] =
        "false";
    } else if (
      field.fieldTypeId === InputType.MULTIVALUECOMPANY ||
      field.fieldTypeId === InputType.MULTIVALUEUSER
    ) {
      defaultValues[`${field.elementId}-fieldTypeId${field.fieldTypeId}`] = [];
    } else {
      defaultValues[`${field.elementId}-fieldTypeId${field.fieldTypeId}`] = "";
    }
  };

  const getWorkFlowDetails = async () => {
    try {
      const projectsData = await client.query({
        query: LOAD_PROJECT_TEMPLATE_ASSOCIATION,
        variables: {
          featureId: Number(pathMatch.params.featureId),
        },
        fetchPolicy: "network-only",
        context: {
          role: featureFormRoles.createForm,
          token: state?.selectedProjectToken,
        },
      });
      if (projectsData.data.projectTemplateAssociation.length > 0) {
        setWorkFlowId(
          projectsData.data.projectTemplateAssociation[0].workflowTemplateId
        );
        fetchAssociatedWorkFlowDetails(
          projectsData.data.projectTemplateAssociation[0].workflowTemplateId
        );
        dispatch(setIsLoading(true));
      } else {
        dispatch(setIsLoading(false));
      }
    } catch (error: any) {
      console.log(error.message);
      dispatch(setIsLoading(false));
    }
  };

  const fetchAssociatedWorkFlowDetails = async (argWorkFlowId: number) => {
    try {
      const latesterVersionIdResonse = await client.query({
        query: FETCH_WORK_FLOW_LATEST_VERSION,
        variables: {
          rootTemplateId: argWorkFlowId,
        },
        fetchPolicy: "network-only",
        context: {
          role: featureFormRoles.createForm,
          token: state?.selectedProjectToken,
        },
      });
      const stepAssigneess: Array<any> = [];
      if (
        latesterVersionIdResonse?.data?.workflowTemplate_aggregate?.aggregate
          ?.max?.id
      ) {
        const maxId =   latesterVersionIdResonse?.data?.workflowTemplate_aggregate?.aggregate
        ?.max?.id;
        workFlowDispatch(setWorkflowTemplateMaxId(maxId))
        argWorkFlowId =maxId;
      }
      const stepDetailsResponse = await client.query({
        query: FETCH_WORK_FLOW_DURATION_ASSIGNEE,
        variables: {
          featureType: Number(pathMatch.params.featureId),
          workflowTemplateId: argWorkFlowId,
          projectId: Number(pathMatch.params.id),
        },
        fetchPolicy: "network-only",
        context: {
          role: featureFormRoles.createForm,
          token: state?.selectedProjectToken,
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
      dispatch(setIsLoading(true));
      fetchCurrentVersionWorkflowVersion(argWorkFlowId, stepAssigneess);
      workFlowDispatch(setWorkFlowRootId(argWorkFlowId));
    } catch (error: any) {
      console.log(error.message);
      dispatch(setIsLoading(false));
    }
  };

  const fetchCurrentVersionWorkflowVersion = async (
    argWorkFlowId: number,
    argStepAssigneess: any
  ) => {
    try {
      const responseData = await client.query({
        query: LOAD_WORKFLOW_DETAILS,
        variables: {
          workflowTemplateId: argWorkFlowId,
          tenantId: Number(decodeExchangeToken().tenantId),
        },
        fetchPolicy: "network-only",
        context: {
          role: featureFormRoles.createForm,
          token: state?.selectedProjectToken,
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
            const currentStep = argStepAssigneess.find(
              (stepItem: any) =>
                stepItem.stepDefName === item.name &&
                item.type === stepItem.type
            );
            const newStepAssignee = {
              stepDefName: currentStep?.name || item.name,
              duration: currentStep?.duration || 0,
              assignees: currentStep?.assignees || [],
              stepDefId: currentStep?.stepDefId || -1,
              type: currentStep?.type || item.type,
            };
            stepAssigneess.push(newStepAssignee);
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
            if (
              item.type === "start" &&
              item.wFFromStepDefOutcomes.length > 0
            ) {
              setFirstworkflowstep(item.wFFromStepDefOutcomes[0].toStepDefName);
            }
            item.wFFromStepDefOutcomes.forEach((subItem: any) => {
              if (
                stepKeys[subItem.fromStepDefName] &&
                stepKeys[subItem.toStepDefName]
              ) {
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
              }
            });
            item.wFToStepDefOutcomes.forEach((subItem: any) => {
              if (
                stepKeys[subItem.fromStepDefName] &&
                stepKeys[subItem.toStepDefName]
              ) {
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
              }
            });
          }
        );
        workFlowDispatch(setWorkflowSteps(steps));
        workFlowDispatch(setWorkFlowViewType("FEATURE_CREATE"));
        workFlowDispatch(setWorkflowOutComes(endPoints));
        argStepAssigneess.forEach((element: any) => {
          stepAssigneess.forEach((assignItem: any) => {
            if (
              element.stepDefName === assignItem.stepDefName &&
              assignItem.type === element.type
            ) {
              assignItem.assignees = element.assignees;
            }
          });
        });
        workFlowDispatch(setWorkFlowStepAssignees(stepAssigneess));
      }
      dispatch(setIsLoading(false));
    } catch (error: any) {
      console.log(error);
      dispatch(setIsLoading(false));
    }
  };

  // submit the form
  const onSubmit: SubmitHandler<any> = (value: any) => {
    if (
      value[`${FIXED_FIELDS.COST_IMPACT}-fieldTypeId7`] === "true" &&
      !value[`${FIXED_FIELDS.COST_IMPACT}-comment-fieldTypeId7`]
    ) {
      Notification.sendNotification(
        `Cost Impact's comment field is required`,
        AlertTypes.warn
      );
      return;
    }
    if (
      value[`${FIXED_FIELDS.SCHEDULE_IMPACT}-fieldTypeId7`] === "true" &&
      !value[`${FIXED_FIELDS.SCHEDULE_IMPACT}-comment-fieldTypeId7`]
    ) {
      Notification.sendNotification(
        `Schedule  Impact's comment field is required`,
        AlertTypes.warn
      );
      return;
    }

    payloadHandle(value, "SUBMIT");
  };

  const payloadHandle = (value: any, type: string) => {
    const createdValue: any = [];
    const commentValue: any = [];
    const payloadValue: any = [];
    for (const property in value) {
      const fieldValue: any = {
        name: property.toString().split("-fieldTypeId")[0],
        fieldTypeId: property.toString().split("-fieldTypeId")[1],
      };

      // converting the type value based on fieldTypeId
      switch (Number(fieldValue.fieldTypeId)) {
        case InputType.TEXT: {
          fieldValue.formValue = value[property]?.trim();
          break;
        }
        case InputType.INTEGER: {
          if (value[property]) {
            fieldValue.formValue = Number(value[property]);
          }
          break;
        }
        case InputType.TIMEPICKER: {
          fieldValue.formValue = moment(value[property]).format("HH:mm:ss.SSS");
          break;
        }
        case InputType.DATEPICKER:
        case InputType.DATETIMEPICKER: {
          fieldValue.formValue = moment(value[property]).format(
            "YYYY-MM-DDTHH:mm:ss.SSS[Z]"
          );
          break;
        }
        case InputType.BOOLEAN: {
          if (fieldValue.name.includes("-comment")) {
            fieldValue.formValue = value[property]?.trim();
          } else {
            let res: any;
            if (value[property] === "true") {
              res = true;
            } else if (value[property] === "false") {
              res = false;
            } else {
              res = null;
            }
            fieldValue.formValue = res;
          }
          break;
        }
        default:
          fieldValue.formValue = value[property];
      }
      if (fieldValue.name.includes("-comment")) {
        commentValue.push({
          elementId: fieldValue.name,
          value: fieldValue.formValue,
        });
      } else {
        if (
          Number(fieldValue.fieldTypeId) === InputType.BOOLEAN &&
          (fieldValue.name === FIXED_FIELDS.COST_IMPACT ||
            fieldValue.name === FIXED_FIELDS.SCHEDULE_IMPACT)
        ) {
          createdValue.push({
            elementId: fieldValue.name,
            value: fieldValue.formValue,
            comment: "",
            fieldTypeId: fieldValue.fieldTypeId,
          });
        } else {
          createdValue.push({
            elementId: fieldValue.name,
            value: fieldValue.formValue,
            fieldTypeId: fieldValue.fieldTypeId,
          });
        }
      }
    }
    //adding comment value
    createdValue.forEach((element: any) => {
      commentValue.forEach((ele: any) => {
        const eleId: string = ele.elementId.toString().split("-comment")[0];
        if (eleId === element.elementId && element.value) {
          element.comment = ele.value;
        }
      });

      if (typeof element.value !== "boolean") {
        switch (typeof element.value) {
          case "string": {
            if (element.value && element.value !== "Invalid date") {
              delete element.fieldTypeId;
              payloadValue.push(element);
            }
            break;
          }
          case "object": {
            if (element.value && element.value?.length > 0) {
              delete element.fieldTypeId;
              payloadValue.push(element);
            }
            if (element.fieldTypeId == InputType.BOOLEAN) {
              delete element.fieldTypeId;
              if (element.comment === "" || element.comment) {
                delete element.comment;
              }
              payloadValue.push(element);
            }
            break;
          }
          case "number": {
            delete element.fieldTypeId;
            payloadValue.push(element);
            break;
          }
          default:
            if (element.value) {
              delete element.fieldTypeId;
              payloadValue.push(element);
            }
        }
      }

      // filter CI/SI if value is false
      if (typeof element.value === "boolean") {
        if (
          element.elementId !== FIXED_FIELDS.COST_IMPACT &&
          element.elementId !== FIXED_FIELDS.SCHEDULE_IMPACT
        ) {
          delete element.fieldTypeId;
          payloadValue.push(element);
        }
        if (
          element.elementId === FIXED_FIELDS.COST_IMPACT ||
          element.elementId === FIXED_FIELDS.SCHEDULE_IMPACT
        ) {
          delete element.fieldTypeId;
          if (!element.value) {
            delete element.comment;
          }
          payloadValue.push(element);
        }
      }
    });
    if (type === "SUBMIT" && payloadValue.length > 0) {
      submitFormDetails(payloadValue);
    } else if (type === "DRAFT") {
      payloadValue.push({
        elementId: `${FIXED_FIELDS.STATUS}`,
        value: "DRAFT",
      });
      submitFormDetails(payloadValue, "DRAFT");
    } else {
      dispatch(setIsLoading(false));
    }
  };

  const submitFormDetails = (payload: Array<any>, status = "OPEN") => {
    try {
      dispatch(setIsLoading(true));
      const workflowData: Array<any> = [];
      if (!workflowEnabled && status !== "DRAFT") {
        const wfDisabledCreatePayload: Partial<CreateFormDataType> = {
          formsData: payload,
          featureId: Number(pathMatch.params.featureId),
          workflowDisabledAssignees: [],
          workflowDisabledDueDate: null,
        };
        setAddAssigneOpen(true);
        setCreateFormData(wfDisabledCreatePayload);
        dispatch(setIsLoading(false));
        return;
      }
      let firstStepAssignees = false;
      workFlowState.stepAssignees.forEach((item: any) => {
        const assignees = item.assignees.map((asignItem: any) => asignItem.id);
        if (
          item.type !== "start" &&
          item.type !== "end" &&
          firstworkflowstep === item.stepDefName &&
          assignees.length === 0
        ) {
          firstStepAssignees = true;
        }
        const newStep = {
          stepName: item.stepDefName,
          duration: Number(item.duration),
          assignees,
        };
        workflowData.push(newStep);
      });
      if (workflowData.length > 0 && payload.length > 0) {
        const createPayload: Partial<CreateFormDataType> = {
          formsData: payload,
          featureId: Number(pathMatch.params.featureId),
          workflowData: workflowData,
          status,
        };
        if (firstStepAssignees && status === "OPEN") {
          setCreateFormData(createPayload);
          setAddAssigneOpen(true);
          dispatch(setIsLoading(false));
          return;
        }
        //when draft or not firstStep assignee
        publishForm({
          ...createPayload,
          workflowDisabledAssignees: [],
          workflowDisabledDueDate: null,
        });
      } else {
        dispatch(setIsLoading(false));
      }
    } catch (err: any) {
      console.log(err);
      setInactiveBtn(false);
      dispatch(setIsLoading(false));
    }
  };

  const saveAfterAddingAssignee = (
    argAssingneeList: Array<string>,
    dueDate: string | null
  ): void => {
    setAddAssigneOpen(false);
    const payload: CreateFormDataType = JSON.parse(
      JSON.stringify(createFormData)
    );
    if (workflowEnabled) {
      payload.workflowData.forEach((item: any) => {
        const assignees = item.assignees.map((asignItem: any) => asignItem.id);
        if (
          item.type !== "start" &&
          item.type !== "end" &&
          firstworkflowstep === item.stepName &&
          assignees.length === 0
        ) {
          item.assignees = argAssingneeList;
        }
      });

      publishForm(payload);
    } else {
      const workflowDisabledPayload: CreateFormDataType = {
        ...payload,
        workflowDisabledDueDate: dueDate,
        workflowDisabledAssignees: argAssingneeList,
      };
      publishForm(workflowDisabledPayload);
    }
  };

  const publishForm = async (argPayload: Partial<CreateFormDataType>) => {
    if (state.editMode) {
      dispatch(setEditMode(false));
    }
    dispatch(setIsLoading(true));
    try {
      let formSubmitResponse: any;
      if (workflowEnabled) {
        formSubmitResponse = await client.mutate({
          mutation: CREATE_FORM_TEMPLATE,
          variables: {
            formsData: argPayload.formsData,
            featureId: argPayload.featureId,
            workflowData: argPayload.workflowData,
          },
          context: {
            role: featureFormRoles.createForm,
            token: state?.selectedProjectToken,
          },
        });
      } else {
        formSubmitResponse = await client.mutate({
          mutation: CREATE_FORM_TEMPLATE_WITHOUT_WORKFLOW,
          variables: {
            formsData: argPayload.formsData,
            featureId: argPayload.featureId,
            workflowDisabledDueDate: argPayload?.workflowDisabledDueDate,
            workflowDisabledAssignees: argPayload?.workflowDisabledAssignees,
          },
          context: {
            role: featureFormRoles.createForm,
            token: state?.selectedProjectToken,
          },
        });
      }
      let subjectValue = getValues(
        `${FIXED_FIELDS.SUBJECT}-fieldTypeId${InputType.TEXT}`
      );
      if (!subjectValue) {
        subjectValue = "EMPTY_SUBJECT";
      }
      saveFollowers(formSubmitResponse.data.insert_formFeature_mutation.formId);
      saveLinks(
        formSubmitResponse.data.insert_formFeature_mutation.formId,
        subjectValue,
        argPayload.status
      );
      projectDispatch(refreshFeaturesList(true));
    } catch (error: any) {
      dispatch(setIsLoading(false));
      Notification.sendNotification(error, AlertTypes.warn);
    }
  };

  const saveFollowers = async (argFormId: number) => {
    try {
      const usersList: Array<string> = [];
      const userGroupList: Array<number> = [];
      followers.forEach((item: any) => {
        if (typeof item === "string") {
          usersList.push(item);
        } else if (typeof item === "number") {
          userGroupList.push(item);
        }
      });
      const promiseList = [];
      if (usersList.length > 0) {
        promiseList.push(
          client.mutate({
            mutation: ADD_TENANT_USER_FOLLOWERS,
            variables: {
              featureId: Number(pathMatch.params.featureId),
              formId: argFormId,
              userIds: usersList,
            },
            context: {
              role: featureFormRoles.createForm,
              token: state?.selectedProjectToken,
            },
          })
        );
      }
      if (userGroupList.length > 0) {
        promiseList.push(
          client.mutate({
            mutation: ADD_TENANT_USERGROUP_FOLLOWERS,
            variables: {
              featureId: Number(pathMatch.params.featureId),
              formId: argFormId,
              userGroupIds: userGroupList,
            },
            context: {
              role: featureFormRoles.createForm,
              token: state?.selectedProjectToken,
            },
          })
        );
      }
      if (promiseList.length > 0) {
        await Promise.all(promiseList);
        dispatch(setIsLoading(false));
        Notification.sendNotification(
          "Form created successfully",
          AlertTypes.success
        );
        handleCancel();
      } else {
        dispatch(setIsLoading(false));
        Notification.sendNotification(
          "Form created successfully",
          AlertTypes.success
        );
        handleCancel();
      }
    } catch (error: any) {
      console.log(error.message);
    }
  };

  /**
   * save the links
   * @param argFormId : number
   */

  const saveLinks = async (
    argFormId: number,
    argSubjectValue: string,
    status = "OPEN"
  ) => {
    const { formToFormLinks, formToTaskLinks } = links;
    const newLinks: Array<any> = [];
    function addFormToTaskLinks() {
      formToTaskLinks.forEach((item: any) => {
        const newTaskLink = {
          linkType: item.relation,
          sourceId: argFormId.toString(),
          sourceType: item.sourceType,
          targetId: item.taskId,
          targetType: item.targetType,
          constraint: item.constraint,
          constraintName: argSubjectValue,
        };
        newLinks.push(newTaskLink);
      });
    }
    function addFormToFormLinks() {
      formToFormLinks.forEach((item: any) => {
        const newLink = {
          linkType: item.relation,
          sourceId: argFormId.toString(),
          sourceType: item.sourceType,
          targetId: item.id.toString(),
          targetType: item.targetType,
          constraint: false,
        };
        newLinks.push(newLink);
      });
    }
    try {
      if (status === "DRAFT" || status === "OPEN") {
        if (formToTaskLinks.length) addFormToTaskLinks();
      }
      if (status === "OPEN") {
        if (formToFormLinks.length) addFormToFormLinks();
      }
      if (newLinks.length) {
        await client.mutate({
          mutation: CREATE_LINK,
          variables: {
            objects: newLinks,
          },
          context: {
            role: featureFormRoles.createForm,
            token: state?.selectedProjectToken,
          },
        });
      }
    } catch (error: any) {
      console.error(error.message);
    }
  };

  // Cancel the form
  const handleCancel = () => {
    if (pathMatch.params.id) {
      history.push(
        `/base/projects/${Number(pathMatch.params.id)}/form/${Number(
          pathMatch.params.featureId
        )}`
      );
    }
  };

  const commentValidation = (checked: string, elementID: any) => {
    if (elementID === FIXED_FIELDS.COST_IMPACT) {
      checked === "true" ? setCostImpact(true) : setCostImpact(false);
    } else if (elementID === FIXED_FIELDS.SCHEDULE_IMPACT) {
      checked === "true" ? setScheduleImpact(true) : setScheduleImpact(false);
    }
  };

  const handleDraftSubmit = () => {
    const { formToFormLinks } = links;
    if (formToFormLinks.length === 0) {
      const value = getValues();
      if (
        value[`${FIXED_FIELDS.COST_IMPACT}-fieldTypeId7`] === "true" &&
        !value[`${FIXED_FIELDS.COST_IMPACT}-comment-fieldTypeId7`]
      ) {
        Notification.sendNotification(
          `Cost Impact's comment field is required`,
          AlertTypes.warn
        );
        return;
      }
      if (
        value[`${FIXED_FIELDS.SCHEDULE_IMPACT}-fieldTypeId7`] === "true" &&
        !value[`${FIXED_FIELDS.SCHEDULE_IMPACT}-comment-fieldTypeId7`]
      ) {
        Notification.sendNotification(
          `Schedule  Impact's comment field is required`,
          AlertTypes.warn
        );
        return;
      }
      if (!disableDraft) {
        setInactiveBtn(true);
        payloadHandle(value, "DRAFT");
      }
    } else {
      setDraftConfirmOpen(true);
    }
  };

  // WORKFLOW VIEW AND HIDE
  const viewWorkFlow = () => {
    setIsWorkflowOpen(true);
  };

  const closeWorkflow = () => {
    setIsWorkflowOpen(false);
  };

  const clearBooleanValue = (argForm: any) => {
    setValue(`${argForm.elementId}-fieldTypeId${argForm.fieldTypeId}`, null);
    if (argForm.elementId === FIXED_FIELDS.COST_IMPACT) {
      setCostImpact(false);
    }
    if (argForm.elementId === FIXED_FIELDS.SCHEDULE_IMPACT) {
      setScheduleImpact(false);
    }
  };

  // render the form field dynamically
  const renderForm = useCallback(() => {
    return formTemplateData?.map((form) => (
      <Grid
        key={form.elementId}
        className="rfi-form__form-container__field"
        item
        sm={form.width === 50 ? 6 : 12}
        xs={12}
      >
        <InputLabel required={form.required}>{form.caption} </InputLabel>
        {form.fieldTypeId === InputType.BOOLEAN ? (
          <>
            <div className="rfi-form__form-container__field__impact">
              <div className="rfi-form__form-container__field__impact__inputs">
                <Controller
                  render={({ field }: { field: any }) => (
                    <RadioGroup
                      aria-label="gender"
                      name="gender1"
                      {...field}
                      value={field.value === null ? "null" : field.value}
                      onChange={(e) => {
                        field.onChange(e.target.value),
                          commentValidation(e.target.value, form.elementId);
                      }}
                    >
                      <FormControlLabel
                        className="form-radio"
                        value="true"
                        control={<Radio color="default" />}
                        label="Yes"
                      />
                      <FormControlLabel
                        className="form-radio"
                        value="false"
                        control={<Radio color="default" />}
                        label="No"
                      />
                      {(form.elementId === FIXED_FIELDS.COST_IMPACT ||
                        form.elementId === FIXED_FIELDS.SCHEDULE_IMPACT) && (
                        <FormControlLabel
                          className="form-radio"
                          value={"null"}
                          onChange={(e) => {
                            field.onChange(e), setIsDirty(true);
                          }}
                          control={<Radio color="default" />}
                          label="To be determined"
                        />
                      )}
                    </RadioGroup>
                  )}
                  name={`${form.elementId}-fieldTypeId${form.fieldTypeId}`}
                  control={control}
                  rules={{
                    required: form.required ? true : false,
                  }}
                />
                {form.fieldTypeId === InputType.BOOLEAN &&
                  form.elementId !== FIXED_FIELDS.COST_IMPACT &&
                  form.elementId !== FIXED_FIELDS.SCHEDULE_IMPACT && (
                    <label
                      className="rfi-form__form-container__field__impact__inputs__label"
                      onClick={() => clearBooleanValue(form)}
                    >
                      Clear
                    </label>
                  )}
              </div>

              <div>
                {form.elementId === FIXED_FIELDS.COST_IMPACT && costImpact ? (
                  <Controller
                    render={({ field }: { field: any }) => (
                      <TextField
                        id={`comment-${form.sequence}`}
                        type="text"
                        {...field}
                        fullWidth
                        autoComplete="off"
                        variant="outlined"
                        multiline
                        rows={2}
                        rowsMax={2}
                        placeholder="Comment"
                      />
                    )}
                    name={`${form.elementId}-comment-fieldTypeId${form.fieldTypeId}`}
                    control={control}
                    rules={{
                      required: form.required ? true : false,
                    }}
                  />
                ) : form.elementId === FIXED_FIELDS.SCHEDULE_IMPACT &&
                  scheduleImpact ? (
                  <Controller
                    render={({ field }: { field: any }) => (
                      <TextField
                        id={`comment-${form.sequence}`}
                        type="text"
                        {...field}
                        fullWidth
                        autoComplete="off"
                        variant="outlined"
                        multiline
                        rows={2}
                        rowsMax={2}
                        placeholder="Comment"
                      />
                    )}
                    name={`${form.elementId}-comment-fieldTypeId${form.fieldTypeId}`}
                    control={control}
                    rules={{
                      required: form.required ? true : false,
                    }}
                  />
                ) : (
                  ""
                )}
              </div>
            </div>
            <div className="error-wrap">
              <p className="error-wrap__message">
                {(errors[`${form.elementId}-fieldTypeId${form.fieldTypeId}`]
                  ?.type === "required" ||
                  errors[
                    `${form.elementId}-comment-fieldTypeId${form.fieldTypeId}`
                  ]?.type === "required") && (
                  <span>This field is mandatory.</span>
                )}
              </p>
            </div>
          </>
        ) : (
          <>
            {form.fieldTypeId === InputType.TABLE ? (
              <FormFeatureTable
                formData={form}
                formcontrol={control}
                isEditDisabled={false}
              />
            ) : (
              <RfiForm
                control={control}
                formData={form}
                type={"FORM"}
                isEditDisabled={false}
              />
            )}
            <div className="error-wrap">
              <p className="error-wrap__message">
                {errors[`${form.elementId}-fieldTypeId${form.fieldTypeId}`]
                  ?.type === "required" ? (
                  <span>This field is mandatory.</span>
                ) : errors[`${form.elementId}-fieldTypeId${form.fieldTypeId}`]
                    ?.type === "maxLength" ? (
                  <span>Maximum length should be 15 digits.</span>
                ) : (
                  ""
                )}
              </p>
            </div>
          </>
        )}
      </Grid>
    ));
  }, [formTemplateData, costImpact, scheduleImpact]);

  const setFollowersValue = (argValues: Array<any>) => {
    setFollowers(argValues);
  };

  const setLinkValues = (argValue: any) => {
    const { formToFormLinks, formToTaskLinks } = argValue;
    const formToFormSelected = formToFormLinks.filter(
      (item: any) => !item.deleted
    );
    setLinks((prev: any) => {
      return {
        formToTaskLinks: formToTaskLinks,
        formToFormLinks: formToFormSelected,
      };
    });
  };

  return (
    <FormHoc>
      {projectState?.featurePermissions?.canCreateForm ? (
        <div className="create-wrapper">
          <div className="create-nav">
            <div className="create-nav__header">
              <Header
                header={`Create ${projectState?.currentFeature?.feature || ""}`}
                navigate={handleCancel}
              />
            </div>
            <div className="create-nav__action">
              {projectState?.featurePermissions?.canCreateForm ? (
                <div className="create-nav__action__followers">
                  <FollowerSelect
                    type={FollowerTye.CREATE}
                    setValue={setFollowersValue}
                    refresh={refreshed}
                    clear={() => setRefreshed(false)}
                  />
                </div>
              ) : (
                ""
              )}
              {workflowEnabled && (
                <Button
                  className="create-nav__action__workFLow"
                  onClick={viewWorkFlow}
                >
                  <VisibilityIcon className="create-nav__action__workFLow__icon" />
                  <span>View WorkFlow</span>
                </Button>
              )}
            </div>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="rfi-form">
            {formTemplateData.length > 0 && (
              <>
                <Grid container className="rfi-form__form-container">
                  <formStateContext.Provider
                    value={{
                      errors,
                      setValue,
                      setError,
                      getValues,
                      usersList,
                      setIsDirty,
                      companiesList,
                      currentSubjectValue,
                      setCurrentSubjectValue,
                    }}
                  >
                    {renderForm()}
                  </formStateContext.Provider>
                  <Grid item xs={12}>
                    <LinkInput
                      setValue={setLinkValues}
                      linkValues={links}
                      type={LinkType.CREATE}
                      status={"DRAFT"}
                      subjectValue={currentSubjectValue}
                    />
                  </Grid>
                </Grid>
                {workFlowState.stepAssignees.length > 0 && (
                  <div className="rfi-form__form-action">
                    <Button
                      data-testid={"create-task-clse"}
                      variant="outlined"
                      onClick={handleCancel}
                      className="btn-secondary"
                    >
                      Cancel
                    </Button>
                    <Button
                      data-testid={"create-task-save"}
                      variant="outlined"
                      onClick={handleDraftSubmit}
                      disabled={disableDraft || inactiveBtn}
                      className="btn-primary"
                    >
                      Save as Draft
                    </Button>
                    <Button
                      data-testid={"create-task-save"}
                      variant="outlined"
                      // disabled={findInvalidField()}
                      type="submit"
                      className="btn-primary"
                    >
                      Submit
                    </Button>
                  </div>
                )}
              </>
            )}
          </form>
          <workFlowContext.Provider value={{ workFlowState, workFlowDispatch }}>
            {isWorkflowOpen ? (
              <div className="create-wrapper__workflow-wrapper">
                <Header header={"Workflow"} navigate={closeWorkflow} />
                <WorkFlowView close={() => setIsWorkflowOpen(false)} />
              </div>
            ) : (
              ""
            )}
          </workFlowContext.Provider>
        </div>
      ) : !state.isLoading ? (
        <div className="noCreatePermission">
          <div className="noCreatePermission____header">
            <Header header={"Back"} navigate={handleCancel} />
          </div>
          <div className="no-permission">
            <NoDataMessage message={noPermissionMessage} />
          </div>
        </div>
      ) : (
        ""
      )}
      {
        <ConfirmDialog
          open={draftConfirmOpen}
          message={draftconfirmMessage}
          close={() => setDraftConfirmOpen(false)}
          proceed={() => setDraftConfirmOpen(false)}
        />
      }
      {addAssigneOpen && (
        <AddAssigneeDialog
          isOpen={addAssigneOpen}
          save={saveAfterAddingAssignee}
          cancel={() => setAddAssigneOpen(false)}
          workflowEnabled={workflowEnabled}
        />
      )}
    </FormHoc>
  );
}
