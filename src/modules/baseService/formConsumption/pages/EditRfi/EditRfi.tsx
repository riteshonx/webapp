import {
  ReactElement,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useState,
  useRef,
  ChangeEvent,
} from "react";
import Header from "src/modules/shared/components/Header/Header";
import VisibilityIcon from "@material-ui/icons/Visibility";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { match, useHistory, useRouteMatch } from "react-router-dom";
import { stateContext } from "src/modules/root/context/authentication/authContext";
import {
  setEditMode,
  setIsLoading,
} from "src/modules/root/context/authentication/action";
import {
  FIXED_FIELDS,
  FollowerTye,
  InputType,
  LinkType,
  ViewTab,
} from "src/utils/constants";
import { client } from "src/services/graphql";
import {
  FETCH_FORM_TEMPLATE_DETAILS,
  FETCH_FORM_TEMPLATE_UPDATE,
  FETCH_FORM_TEMPLATE_VIEW,
  FETCH_HISTORY_ACTIVITY,
  FETCH_COMMENTS_HISTORY_ACTIVITY,
  FETCH_WORKFLOW_HISTORY,
  UPDATE_FORM_DETAIL_CURRENT_STEP_ASSIGNEE,
  UPDATE_FORM_DETAIL_DRAFT,
  UPDATE_FORM_WITHOUT_WORKFLOW_DRAFT,
  FETCH_STATUS_LIST_OPTIONS,
  FETCH_DEFAULT_STATUS_LIST_OPTIONS,
} from "../../graphql/queries/rfi";
import { INSERT_ROOT_COMMENT } from "../../graphql/queries/comments";
import InputLabel from "@material-ui/core/InputLabel";
import TextField from "@material-ui/core/TextField";
import RfiForm from "../../components/RfiForm/RfiForm";
import moment from "moment";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";
import CommentSection from "../../components/CommentSection/CommentSection";
import FollowerSelect from "../../components/FollowerSelect/FollowerSelect";
import { InfoBar, ControlBar } from "../../components/UpdateFormWoWf";
import{SectionDetail} from "../../components/SectionDetail/SectionDetail";
import{ObjectTree} from "../../components/ObjectTree/ObjectTree";
import {IssueLogProjectDetail} from  "../../components/IssueLogProjectDetail/IssueLogProjectDetail";
import "./EditRfi.scss";
import Notification, {
  AlertTypes,
} from "src/modules/shared/components/Toaster/Toaster";
import NoDataMessage from "src/modules/shared/components/NoDataMessage/NoDataMessage";
import FormHoc from "../../components/FormHoc/FormHoc";
import { formStateContext, projectContext } from "../../Context/projectContext";
import LinkInput from "../../components/Link/Link";
import { FETCH_FORM_LINKS } from "../../graphql/queries/link";
import WorkFlowView from "src/modules/shared/components/WorkFlowView/WorkFlowView";
import {
  FETCH_WORK_FLOW_FEATURE,
  LOAD_PROJECT_TEMPLATE_ASSOCIATION,
} from "../../../graphql/queries/workflow";
import { featureFormRoles, FormsRoles } from "src/utils/role";
import {
  workFlowInitial,
  workflowReducer,
} from "../../../context/workflow/workflowReducer";
import { workFlowContext } from "../../../context/workflow/workflowContext";
import {
  setWorkFlowFeatureType,
  setWorkflowOutComes,
  setWorkFlowRootId,
  setWorkFlowStepAssignees,
  setWorkflowSteps,
  setWorkFlowViewType,
} from "../../../context/workflow/workflowAction";
import ConfirmDialog from "src/modules/shared/components/ConfirmDialog/ConfirmDialog";
import FormFeatureTable from "../../components/FormFeatureTable/FormFeatureTable";
import ReviewForm from "../../components/ReviewForm/ReviewForm";
import { decodeExchangeToken } from "src/services/authservice";
import WorkflowDetails from "../../components/WorkflowDetails/WorkflowDetails";
import HistoryAction from "../../components/HistoryAction/HistoryAction";
import { setCurrentFormId } from "../../Context/link/linkAction";
import AssigneeSelect from "src/modules/shared/components/UserSelect/UserSelect";
import {
  LOAD_CONFIGURATION_LIST_VALUES_CREATE,
  LOAD_PROJECT_USERS,
  LOAD_TENANT_COMPANY,
} from "src/modules/baseService/graphql/queries/customList";
import { LOAD_PROJECT_LOCATION_NODES } from "src/modules/baseService/projectSettings/graphql/queries/location";
import {
  setProjectCustomListValues,
  setLocationTreeData,
  setLocationTreeStructure,
} from "../../Context/projectActions";
import ProjectUserDetails from "src/modules/shared/components/ProjectUserDetails/ProjectUserDetails";
import {
  formLocationTreeData,
  getFinalPayloadValue,
  getformDefaultFieldValues,
  getInitialValues,
  getWorkFlowAssignees,
  getWorkflowStepsAndOutcomes,
  initalizeFormFieldDetailsData,
  initializeLinkValues,
  initializeFormToTaskLinks,
  intializeFormFieldData,
  intializeNewTemplateData,
  sortDataOnSequence,
} from "../../utils/formHelper";
import {
  EditViewFormParams,
  FormFieldData,
  FormFieldDetailsData,
} from "../../models/form";
import {
  confirmMessage,
  draftconfirmMessage,
  noPermissionMessage,
  invalidFormMessage,
} from "../../utils/constants";
import NavInfo from "../../components/NavInfo/NavInfo";
import {
  CREATE_LINK,
  UPDATE_LINK_RELATIONSHIP,
  DELETE_LINK,
  FETCH_TASK_TYPE_ID,
} from "../../graphql/queries/link";
import AddAssigneeDialog from "../../components/AddAssigneeDialog/AddAssigneeDialog";
import useBeforeunload from "src/customhooks/useUnload";
import StatusChangeDialog from "../../components/StatusChangeDialog/StatusChangeDialog";
import { IStatusListOptions, IWorkflowDisabledFields } from "./EditRfiTypes";
import {getFormChecklist,getFormIssueLogs} from '../../graphql/queries/apiRequest';

export default function EditFeatureForms(): ReactElement {
  const defaultValues: any = {
    [`${FIXED_FIELDS.STATUS}-wfdisabled`]: "",
    [`${FIXED_FIELDS.ASSIGNEE}-wfdisabled`]: [],
    [`${FIXED_FIELDS.DUE_DATE}-wfdisabled`]: null,
  };
  const history = useHistory();
  const { dispatch, state }: any = useContext(stateContext);
  const pathMatch: match<EditViewFormParams> = useRouteMatch();
  const {
    handleSubmit,
    control,
    getValues,
    setError,
    setValue,
    formState: { errors },
  } = useForm<any>({
    defaultValues,
  });
  const [formTemplateData, setFormTemplateData] = useState<Array<any>>([]);
  const [formTemplateDetailsData, setformTemplateDetailsData] = useState<
    Array<any>
  >([]);
  const [forminfo, setForminfo] = useState({
    id: "",
    createdAt: "",
    createdBy: "",
    createdById: "",
    status: "",
    dueDate: "",
    subject: "",
  });
  const [scheduleImpact, setScheduleImpact] = useState(false);
  const [costImpact, setCostImpact] = useState(false);
  const [currentTab, setCurrentTab] = useState(ViewTab.Comments);
  const [isWorkflowOpen, setIsWorkflowOpen] = useState(false);
  const [followers, setFollowers] = useState<Array<any>>([]);
  const [inValidForm, setInValidForm] = useState(false);
  const [requiredFieldArray, setRequiredFieldArray] = useState<Array<any>>([]);
  const { projectState, projectDispatch }: any = useContext(projectContext);
  const [initialValue, setInitialValue] = useState<Array<any>>([]);
  const [templateVersionId, setTemplateVersionId] = useState<any>(null);
  const [objectTypeFormData, setObjectTypeFormData] = useState<any>([])
  const [links, setLinks] = useState<any>({
    formToFormLinks: [],
    formToTaskLinks: [],
  });
  const [workFlowState, workFlowDispatch] = useReducer(
    workflowReducer,
    workFlowInitial
  );
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [draftConfirmOpen, setDraftConfirmOpen] = useState(false);
  const [activeStepAssignee, setActiveStepAssignee] = useState<Array<any>>([]);
  const [activeStepDueDate, setActiveStepDueDate] = useState<any>(null);
  const [stepName, setStepName] = useState("");
  const [activeWorkFlowStepData, setActiveWorkFlowStepData] = useState<
    Array<any>
  >([]);
  const [isReviewForm, setIsReviewForm] = useState(false);
  const [workFLowStepsData, setWorkFLowStepsData] = useState<Array<any>>([]);
  const [historyData, setHistoryData] = useState<Array<any>>([]);
  const [commentsHistoryData, setCommentsHistoryData] = useState<Array<any>>(
    []
  );
  const [isSpecification, setIsSpecification] = useState(false);
  const [isBlockedBy, setIsBlockedBy] = useState(false);
  const [firstworkflowstep, setFirstworkflowstep] = useState<any>(null);
  const [isEditDisabled, setIsEditDisabled] = useState(false);
  const [companiesList, setCompaniesList] = useState<Array<any>>([]);
  const [usersList, setUsersList] = useState<Array<any>>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [disableDraft, setDisableDraft] = useState(false);
  const [refreshed, setRefreshed] = useState(false);
  const [updateFormData, setUpdateFormData] = useState<any>(null);
  const [addAssigneOpen, setAddAssigneOpen] = useState(false);
  const [currentSubjectValue, setCurrentSubjectValue] = useState("");
  const submittalId = useRef<any>(null);
  const [inactiveUpdateBtn, setInactiveUpdateBtn] = useState(false);
  const [workflowEnabled, setWorkflowEnabled] = useState<null | boolean>(null);
  const [projectCheckListInfo, setProjectChecklistInfo] = useState<any>([]);
  const [issueLogsProjectData, setIssueLogsProjectData] = useState<any>([])
  const [isImported, setIsImported] = useState<boolean>(false)
  const [workflowDisabledFields, setWorkflowDisabledFields] =
    useState<IWorkflowDisabledFields>({
      status: "",
      dueDate: null,
      assignees: [],
    });
  const [statusListOptions, setStatusListOptions] = useState<
    Array<IStatusListOptions>
  >([]);
  const [statusChangeDialog, setStatusChangeDialog] = useState({
    newStatus: "",
    open: false,
    comment: "",
  });
  const [formStatus, setFormStatus] = useState("");
  useEffect(() => {
    /*disable 'Save as Draft' only when there are form-form links,
    but not when there are form-task links*/
    if (links.formToFormLinks.length) {
      setDisableDraft(true);
    } else {
      setDisableDraft(false);
    }
  }, [links.formToFormLinks]);

  useEffect(() => {
    if (workflowEnabled === false) {
      fetchStatusListOptions();
    }
  }, [workflowEnabled, forminfo]);

  useEffect(() => {
    if (state?.selectedProjectToken) {
      getHistoryActivity();
      getCommentsHistoryActivity();
    }
  }, [currentTab, state?.selectedProjectToken]);

  useEffect(() => {
    workFlowDispatch(
      setWorkFlowFeatureType(Number(pathMatch.params.featureId))
    );
    if (state?.selectedProjectToken && projectState?.featurePermissions) {
      if (projectState?.featurePermissions?.canUpdateForm) {
        getFormTemplateDetails();
        getFormLinks();
        getWorkFlowStepHistory();
        fetchTenantUsersLists();
        fetchCompanyLists();
        fetchProjectLocationTreeData();
      } else {
        const currentProjectId = Number(pathMatch.params.id);
        const currentFeatureId = Number(pathMatch.params.featureId);
        history.push(
          `/base/projects/${currentProjectId}/form/${currentFeatureId}/view/${Number(
            pathMatch.params.formId
          )}`
        );
      }
    }
  }, [state?.selectedProjectToken, projectState?.featurePermissions]);

  useEffect(() => {
    canReviewForm();
  }, [activeStepAssignee]);

  useEffect(() => {
    if (state?.selectedProjectToken && templateVersionId) {
      getFormTemplate(templateVersionId);
      getWorkFlowDetails();
    }
  }, [templateVersionId, state?.selectedProjectToken]);

  useEffect(() => {
    /*if the status has been disabled from projectSettings->Form Association
    then that status would not be shown in the options. In such cases, we manually push a disabled entry to the stauts list option
    */
    if (workflowDisabledFields.status && statusListOptions.length) {
      const matchedStatusFromList = statusListOptions.find(
        (option) => option.status === workflowDisabledFields.status
      );
      if (!matchedStatusFromList) {
        const disabledOption: IStatusListOptions = {
          id: 999,
          openStatus: false,
          projectFormStatusAssociations: [],
          status: workflowDisabledFields.status,
          disabled: true,
          formStatusId: 0,
        };
        setStatusListOptions((p) => [...p, disabledOption]);
      }
    }
  }, [workflowDisabledFields.status, statusListOptions]);

  useEffect(() => {
    if (forminfo.status === "DRAFT") {
      projectState?.featurePermissions?.canDeleteForm ||
      forminfo?.createdById === decodeExchangeToken().userId
        ? setIsEditDisabled(false)
        : setIsEditDisabled(true);
    } else if (
      activeWorkFlowStepData.length > 0 &&
      workFlowState.steps.length > 0
    ) {
      const currentStep = activeWorkFlowStepData[0].stepName;
      const currentWorkflowStep = workFlowState.steps.find(
        (stepItem: any) => stepItem.stepDefName === currentStep
      );
      let shouldDisabledEdit = true;
      if (currentWorkflowStep) {
        // if edit is not alllowed in the current step
        const currentStepAssignee = activeStepAssignee.map(
          (item: any) => item.assignee
        );
        if (
          currentWorkflowStep.editsAllowed &&
          (projectState?.featurePermissions?.canDeleteForm ||
            currentStepAssignee.indexOf(decodeExchangeToken().userId) > -1)
        ) {
          shouldDisabledEdit = false;
        }
      }
      setIsEditDisabled(shouldDisabledEdit);
    }
  }, [
    workFlowState.steps,
    activeWorkFlowStepData,
    activeStepAssignee,
    forminfo,
  ]);

  useEffect(() => {
    workFlowDispatch(
      setWorkFlowFeatureType(Number(pathMatch.params.featureId))
    );
    workFlowDispatch(setCurrentFormId(Number(pathMatch.params.formId)));
  }, []);

  useEffect(() => {
    if (formTemplateDetailsData) {
      setDefaultValue();
    }
  }, [formTemplateDetailsData, formTemplateData]);

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

  const postNewComment = async (comment: string) => {
    try {
      await client.mutate({
        mutation: INSERT_ROOT_COMMENT,
        variables: {
          formId: Number(pathMatch.params.formId),
          comment: comment,
        },
        context: {
          role: featureFormRoles.updateForm,
          token: state?.selectedProjectToken,
        },
      });
    } catch (error) {
      console.log(error);
    }
  };

  const fetchStatusListOptions = async () => {
    try {
      const optionsPromise = client.query({
        query: FETCH_STATUS_LIST_OPTIONS,
        variables: {
          featureId: Number(pathMatch.params.featureId),
          projectId: Number(pathMatch.params.id),
        },
        fetchPolicy: "network-only",
        context: {
          role: featureFormRoles.viewForm,
          token: state?.selectedProjectToken,
        },
      });
      const defaultOptionsPromise = client.query({
        query: FETCH_DEFAULT_STATUS_LIST_OPTIONS,
        variables: {},
        fetchPolicy: "network-only",
        context: {
          role: featureFormRoles.viewForm,
          token: state?.selectedProjectToken,
        },
      });
      const [optionsResponse, defaultOptionsResponse]: any = await Promise.all([
        optionsPromise,
        defaultOptionsPromise,
      ]);
      const filteredStatusOptions = optionsResponse.data.formStatus.filter(
        (option: any) => {
          if (forminfo.status === "DRAFT") {
            return (
              option?.openStatus && option.projectFormStatusAssociations.length
            );
          }
          return option.projectFormStatusAssociations.length;
        }
      );
      const filteredDefaultStatusOptions =
        defaultOptionsResponse.data.formStatus.filter((option: any) => {
          if (forminfo.status === "DRAFT") {
            return option?.openStatus;
          }
          return option;
        });

      const allStatusListOptions = [
        ...filteredDefaultStatusOptions,
        ...filteredStatusOptions,
      ];
      setStatusListOptions(allStatusListOptions);
    } catch (err: any) {
      console.log(err);
    }
  };

  const fetchTenantUsersLists = async () => {
    try {
      const customListResponse = await client.query({
        query: LOAD_PROJECT_USERS,
        variables: {
          name: "%%",
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
          role: featureFormRoles.updateForm,
          token: state?.selectedProjectToken,
        },
      });
      // projectDispatch(setTenantCompanies(customListResponse.data.tenantCompanyAssociation));
      setCompaniesList(customListResponse.data.tenantCompanyAssociation);
    } catch {}
  };

  const fetchProjectLocationTreeData = async () => {
    try {
      const responseData = await client.query({
        query: LOAD_PROJECT_LOCATION_NODES,
        variables: {},
        fetchPolicy: "network-only",
        context: {
          role: featureFormRoles.updateForm,
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
      dispatch(setIsLoading(true));
    }
  };

  const getWorkFlowDetails = async () => {
    try {
      dispatch(setIsLoading(true));
      const projectsData = await client.query({
        query: LOAD_PROJECT_TEMPLATE_ASSOCIATION,
        variables: {
          featureId: Number(pathMatch.params.featureId),
        },
        fetchPolicy: "network-only",
        context: {
          role: featureFormRoles.updateForm,
          token: state?.selectedProjectToken,
        },
      });
      if (projectsData.data.projectTemplateAssociation.length > 0) {
        workFlowDispatch(
          setWorkFlowRootId(
            projectsData.data.projectTemplateAssociation[0].workflowTemplateId
          )
        );
        dispatch(setIsLoading(true));
        fetchAssociatedWorkFlowDetails();
      }
    } catch (error: any) {
      console.log(error.message);
      dispatch(setIsLoading(true));
    }
  };

  const fetchAssociatedWorkFlowDetails = async () => {
    try {
      dispatch(setIsLoading(true));
      const responseData = await client.query({
        query: FETCH_WORK_FLOW_FEATURE,
        variables: {
          featureType: pathMatch.params.featureId,
          featureName: pathMatch.params.formId,
          projectId: Number(pathMatch.params.id),
        },
        fetchPolicy: "network-only",
        context: {
          role: featureFormRoles.updateForm,
          token: state?.selectedProjectToken,
        },
      });
      let stepAssigneess: Array<any> = [];
      const stepKeys: any = {};
      if (responseData.data.workflowTemplate.length > 0) {
        stepAssigneess = getWorkFlowAssignees(
          responseData.data.workflowTemplate[0].workflowFeatureStepDefs
        );
        responseData.data.workflowTemplate[0].workflowTemplateStepDefs.forEach(
          (item: any) => {
            stepKeys[item.name] = item.id;
          }
        );
        const { steps, endPoints, currentStep } = getWorkflowStepsAndOutcomes(
          responseData.data.workflowTemplate[0].workflowTemplateStepDefs,
          stepKeys
        );
        workFlowDispatch(setWorkFlowStepAssignees(stepAssigneess));
        setFirstworkflowstep(currentStep);
        workFlowDispatch(setWorkflowSteps(steps));
        workFlowDispatch(setWorkflowOutComes(endPoints));
      }
      dispatch(setIsLoading(false));
    } catch (error: any) {
      console.log(error.message);
      dispatch(setIsLoading(false));
    }
  };

  const getFormLinks = async () => {
    try {
      const allFormLinksResponse: any = await client.query({
        query: FETCH_FORM_LINKS,
        variables: {
          formId: Number(pathMatch.params.formId),
        },
        fetchPolicy: "network-only",
        context: {
          role: featureFormRoles.viewForm,
          token: state?.selectedProjectToken,
        },
      });

      const formLinksQuery = allFormLinksResponse.data.formLinks_query;
      const formToTaskLinks = formLinksQuery.linkFormTask;
      const formToFormLinks = formLinksQuery.linkFormToForm;

      if (formToTaskLinks.length) {
        const {
          data: {
            projectFeature: [item],
          },
        } = await client.query({
          query: FETCH_TASK_TYPE_ID,
          variables: {},
          fetchPolicy: "network-only",
          context: {
            role: featureFormRoles.viewForm,
            token: state?.selectedProjectToken,
          },
        });
        const initializedFormToTaskLinks = initializeFormToTaskLinks(
          formToTaskLinks,
          item.id
        );
        setLinks((prev: any) => {
          return { ...prev, formToTaskLinks: initializedFormToTaskLinks };
        });
      } else {
        setLinks((prev: any) => {
          return { ...prev, formToTaskLinks: [] };
        });
      }
      if (formToFormLinks.length) {
        const initializedFormToFormLinks = initializeLinkValues(
          formToFormLinks,
          pathMatch.params.formId
        );
        setLinks((prev: any) => {
          return { ...prev, formToFormLinks: initializedFormToFormLinks };
        });
      } else {
        setLinks((prev: any) => {
          return { ...prev, formToFormLinks: [] };
        });
      }
    } catch (error: any) {
      console.log(error.message);
    }
  };

  const getHistoryActivity = async () => {
    try {
      dispatch(setIsLoading(true));
      const formsTemplateResponse = await client.query({
        query: FETCH_HISTORY_ACTIVITY,
        variables: {
          formFeatureId: Number(pathMatch.params.formId),
        },
        fetchPolicy: "network-only",
        context: {
          role: featureFormRoles.viewForm,
          token: state?.selectedProjectToken,
        },
      });
      if (formsTemplateResponse?.data?.history?.length > 0) {
        setHistoryData(formsTemplateResponse?.data?.history);
      }
      dispatch(setIsLoading(false));
    } catch (err: any) {
      console.log(err);
      dispatch(setIsLoading(false));
    }
  };

  const getCommentsHistoryActivity = async () => {
    try {
      dispatch(setIsLoading(true));
      const formsTemplateResponse = await client.query({
        query: FETCH_COMMENTS_HISTORY_ACTIVITY,
        variables: {
          formFeatureId: Number(pathMatch.params.formId),
        },
        fetchPolicy: "network-only",
        context: {
          role: featureFormRoles.viewForm,
          token: state?.selectedProjectToken,
        },
      });
      if (formsTemplateResponse?.data?.history?.length > 0) {
        setCommentsHistoryData(formsTemplateResponse?.data?.history);
      }
      dispatch(setIsLoading(false));
    } catch (err: any) {
      console.log(err);
      dispatch(setIsLoading(false));
    }
  };

  // fetch form template
  const getFormTemplate = async (argTemplateVersionId: number) => {
    try {
      const formsTemplateResponse = await client.query({
        query: FETCH_FORM_TEMPLATE_UPDATE,
        variables: {
          versionId: Number(argTemplateVersionId),
        },
        fetchPolicy: "network-only",
        context: {
          role: featureFormRoles.updateForm,
          token: state?.selectedProjectToken,
        },
      });
      const configListIds: Array<number> = [];
      // exact version template required
      const formTemplateVersions =
        formsTemplateResponse?.data?.formTemplateVersions;
      if (formTemplateVersions[0].formTemplateFieldData) {
        const formsData: Array<any> = [];
        const currentVersionFieldData = JSON.parse(
          JSON.stringify(formTemplateVersions[0].formTemplateFieldData)
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
            if (item.fieldTypeId === InputType.TABLE) {
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
            if (
              item.fieldTypeId === InputType.CUSTOMDROPDOWN ||
              item.fieldTypeId === InputType.CUSTOMNESTEDDROPDOWN
            ) {
              if (configListIds.indexOf(item.configListId) < 0) {
                configListIds.push(item.configListId);
              }
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
              setInitialDefaultValueBasedOnInputType(cellValue);
            });
            field.metaData.colData.forEach((cellItem: any) => {
              if (
                cellItem.fieldTypeId === InputType.CUSTOMDROPDOWN ||
                cellItem.fieldTypeId === InputType.CUSTOMNESTEDDROPDOWN
              ) {
                if (configListIds.indexOf(cellItem.fieldTypeId) < 0) {
                  configListIds.push(cellItem.configListId);
                }
              }
            });
          } else {
            setInitialDefaultValueBasedOnInputType(field);
          }
        });
        const required = formsData.filter((item) => item.required === true);
        setRequiredFieldArray(required);
        setFormTemplateData(formsData.sort(sortDataOnSequence));
      }
      if (configListIds.length > 0) {
        fetchCustomListValues(configListIds);
      }
    } catch (err: any) {
      console.log("error",err);
      dispatch(setIsLoading(false));
    }
  };

  const fetchCustomListValues = async (argId: Array<number>) => {
    try {
      const customListResponse = await client.query({
        query: LOAD_CONFIGURATION_LIST_VALUES_CREATE,
        variables: {
          id: argId,
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

  const setInitialDefaultValueBasedOnInputType = (field: any) => {
    if (
      field.fieldTypeId === InputType.TIMEPICKER ||
      field.fieldTypeId === InputType.DATEPICKER ||
      field.fieldTypeId === InputType.DATETIMEPICKER
    ) {
      setValue(`${field.elementId}-fieldTypeId${field.fieldTypeId}`, null);
    } else if (field.fieldTypeId === InputType.BOOLEAN) {
      if (
        field.fixed &&
        (field.elementId === FIXED_FIELDS.COST_IMPACT ||
          field.elementId === FIXED_FIELDS.SCHEDULE_IMPACT)
      ) {
        setValue(
          `${field.elementId}-comment-fieldTypeId${field.fieldTypeId}`,
          null
        );
      }
      setValue(`${field.elementId}-fieldTypeId${field.fieldTypeId}`, "false");
    } else if (
      field.fieldTypeId === InputType.MULTIVALUECOMPANY ||
      field.fieldTypeId === InputType.MULTIVALUEUSER
    ) {
      setValue(`${field.elementId}-fieldTypeId${field.fieldTypeId}`, []);
    } else {
      setValue(`${field.elementId}-fieldTypeId${field.fieldTypeId}`, "");
    }
  };

  // fetch form template details
  const getFormTemplateDetails = async () => {
    try {
      const formsTemplateDetailsResponse = await client.query({
        query: FETCH_FORM_TEMPLATE_DETAILS,
        variables: {
          formId: Number(pathMatch.params.formId),
        },
        fetchPolicy: "network-only",
        context: {
          role: featureFormRoles.viewForm,
          token: state?.selectedProjectToken,
        },
      });
      //********
      //to know whether we have workflow enabled or not
      const formTemplateViewResponse = await client.query({
        query: FETCH_FORM_TEMPLATE_VIEW,
        variables: {
          featureId: Number(pathMatch.params.featureId),
          versionId: null,
        },
        fetchPolicy: "network-only",
        context: {
          role: featureFormRoles.viewForm,
          token: state?.selectedProjectToken,
          feature: pathMatch.params.featureId,
        },
      });
      const templateAssociation =
        formTemplateViewResponse.data.projectTemplateAssociation[0];
      const isWorkflowEnabled = templateAssociation.workflowEnabled;
      setWorkflowEnabled(isWorkflowEnabled);
      //********
      setIsBlockedBy(
        formsTemplateDetailsResponse?.data?.formDetails_query
          ?.blockedByCounter > 0
          ? true
          : false
      );
      setFormStatus(
        formsTemplateDetailsResponse?.data?.formDetails_query.formState
      );
      if (
        formsTemplateDetailsResponse?.data?.formDetails_query?.specificationId
      ) {
        setIsSpecification(true);
      }
      if (
        formsTemplateDetailsResponse?.data?.formDetails_query?.isImported
      ) {
        setIsImported(true);
      }
      if (formsTemplateDetailsResponse?.data?.formDetails_query.id === null) {
        setInValidForm(true);
      } else {
        setInValidForm(false);
      }
      if (formsTemplateDetailsResponse?.data?.formDetails_query?.formsData) {
        const formsDetailsData: Array<any> = [];
        submittalId.current =
          formsTemplateDetailsResponse.data.formDetails_query.submittalId;
        const filteredItems:any = formsTemplateDetailsResponse?.data?.formDetails_query?.formsData.filter((item:any)=>item.typeId==InputType.Object)
        setObjectTypeFormData(filteredItems)
        formsTemplateDetailsResponse?.data?.formDetails_query?.formsData.forEach(
          (item: any) => {
            if (item.elementId === FIXED_FIELDS.DUE_DATE) {
              const value = item.value ? item.value?.split("T")[0] : item.value;
              setActiveStepDueDate(value);
              setWorkflowDisabledFields((p) => {
                return { ...p, dueDate: value };
              });
              setValue(`${FIXED_FIELDS.DUE_DATE}-wfdisabled`, value);
            }
            if (!workflowEnabled) {
              if (item.elementId === FIXED_FIELDS.ASSIGNEE) {
                const value = item.value;
                //this is the format in which Assignee Select component expects
                const mappedValues = value.map((v: any) => {
                  return {
                    user: {
                      ...v,
                    },
                    assignee: v.id,
                  };
                });
                setWorkflowDisabledFields((p) => {
                  return { ...p, assignees: mappedValues };
                });
                setValue(`${FIXED_FIELDS.ASSIGNEE}-wfdisabled`, mappedValues);
              }
            }
            const newTemplate: FormFieldDetailsData =
              initalizeFormFieldDetailsData(item);
            formsDetailsData.push(newTemplate);
          }
        );
        const versionId =
          formsTemplateDetailsResponse?.data?.formDetails_query
            ?.templateVersionId;
        setTemplateVersionId(versionId);
        setformTemplateDetailsData(formsDetailsData);
      }
      if (
        isWorkflowEnabled &&
        formsTemplateDetailsResponse?.data?.formDetails_query.workflowData
          ?.activeSteps
      ) {
        const activeStepsData: Array<any> = [];
        formsTemplateDetailsResponse?.data?.formDetails_query.workflowData?.activeSteps.forEach(
          (item: any) => {
            const newTemplate: any = intializeNewTemplateData(item);
            activeStepsData.push(newTemplate);
          }
        );
        setActiveStepAssignee(
          JSON.parse(JSON.stringify(activeStepsData[0]?.featureStepAssignees))
        );
        setStepName(activeStepsData[0].stepDescription);
        setActiveWorkFlowStepData(activeStepsData);
      }
    } catch (err: any) {
      console.log(err);
      dispatch(setIsLoading(false));
    }
  };

  // Cancel the form
  const handleCancel = () => {
    const { formToFormLinks, fomToTaskLinks } = links;

    const editedLinks = formToFormLinks.filter(
      (item: any) => item.deleted || item.new || item.relationShipModifield
    );
    if (editedLinks.length === 0) {
      backToList();
    } else {
      setConfirmOpen(true);
    }
  };

  /**
   * Route user back to list page
   */
  const backToList = () => {
    if (pathMatch.params.id) {
      history.push(
        `/base/projects/${Number(pathMatch.params.id)}/form/${Number(
          pathMatch.params.featureId
        )}`
      );
    }
  };

  /**
   * Method to handle form submission
   * @param value : any
   * @returns
   */
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
    payloadHandle(value, "submit");
  };

  /**
   * Method to generate formData payload
   * @param value : any
   * @param type : any
   */
  const payloadHandle = async (value: any, type: string) => {
    const finalPayload: any = getFinalPayloadValue(
      value,
      forminfo,
      type,
      initialValue
    );
    /* When 'Submit' is clicked, since we show the Pick Assginee dialog box,
     we should not be saving the links here but instead after 'Save' has been clicked on the dialog box. Hence, the condition && type === "draft" here to indicate that 
     this flow is choses when 'Save as Draft' is clicked.
     forminfo.status === "DRAFT" because we do not call inline updates on links when the form is in DRAFT mode, 
     and therefore we need to club it with 'Save as Draft' or 'Submit' button clicks
    */
    /* when the form is in DRAFT status, then only form-task links are allowed, form-form links are not allowed ( we disable 'Save as Draft' button in such cases )*/
    if (forminfo.status === "DRAFT" && type === "draft")
      await saveLinks(Number(pathMatch.params.formId), "draft");
    if (finalPayload?.length > 0) {
      setInactiveUpdateBtn(true);
      updateFormDetails(finalPayload, type);
    } else {
      backToList();
    }
  };

  const saveLinks = async (argFormId: number, type: "submit" | "draft") => {
    const { formToFormLinks, formToTaskLinks } = links;
    const queryPromiseList: Array<any> = [];
    const newLinks: Array<any> = [];
    const deleteLinks: Array<any> = [];
    const updateLinks: Array<any> = [];
    function getFormToTaskLinksToBeUpdated() {
      return formToTaskLinks.reduce(
        (previous: any, current: any) => {
          if (current.isDeleted) {
            previous.toDelete.push(current);
          }
          if (current.isNew) {
            previous.toInsert.push(current);
          }
          if (current.isTouched) {
            previous.toUpdate.push(current);
          }
          return previous;
        },
        { toDelete: [], toUpdate: [], toInsert: [] }
      );
    }
    let subjectValue = getValues(
      `${FIXED_FIELDS.SUBJECT}-fieldTypeId${InputType.TEXT}`
    );
    if (!subjectValue) {
      subjectValue = "EMPTY_SUBJECT";
    }
    function bucketizeLinks(links: Array<any>, operation: string) {
      links.forEach((item: any) => {
        const task: any = {
          linkType: item.relation,
          sourceId: item.sourceId,
          sourceType: item.sourceType,
          targetId: item.taskId,
          targetType: item.targetType,
        };
        if (operation === "delete") {
          deleteLinks.push(task);
        }
        if (operation === "insert") {
          task.constraint = item.constraint;
          task.constraintName = subjectValue;
          task.sourceId = argFormId.toString();
          newLinks.push(task);
        }
        if (operation === "update") {
          task.constraint = item.modified.constraint;
          task.newRelationship = item.modified.relation;
          task.existingRelationship = item.relation;
          task.constraintName = subjectValue;
          delete task.linkType;
          updateLinks.push(task);
        }
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
      if (type === "draft" || type === "submit") {
        if (formToTaskLinks.length) {
          const { toDelete, toUpdate, toInsert } =
            getFormToTaskLinksToBeUpdated();
          if (toInsert.length) {
            bucketizeLinks(toInsert, "insert");
          }
          if (toDelete.length) {
            bucketizeLinks(toDelete, "delete");
          }
          if (toUpdate.length) {
            bucketizeLinks(toUpdate, "update");
          }
        }
      }
      if (type === "submit") {
        if (formToFormLinks.length) addFormToFormLinks();
      }

      if (newLinks.length) {
        queryPromiseList.push(
          client.mutate({
            mutation: CREATE_LINK,
            variables: {
              objects: newLinks,
            },
            context: {
              role: featureFormRoles.createForm,
              token: state?.selectedProjectToken,
            },
          })
        );
      }

      if (deleteLinks.length) {
        queryPromiseList.push(
          client.mutate({
            mutation: DELETE_LINK,
            variables: {
              objects: deleteLinks,
            },
            context: {
              role: featureFormRoles.updateForm,
              token: state?.selectedProjectToken,
            },
          })
        );
      }

      if (updateLinks.length) {
        updateLinks.forEach((updateLink: any) => {
          queryPromiseList.push(
            client.mutate({
              mutation: UPDATE_LINK_RELATIONSHIP,
              variables: {
                ...updateLink,
              },
              context: {
                role: featureFormRoles.updateForm,
                token: state.selectedProjectToken,
              },
            })
          );
        });
      }
      if (queryPromiseList.length) {
        await Promise.all(queryPromiseList);
      }
    } catch (error: any) {
      Notification.sendNotification(
        "Something went wrong while saving links",
        AlertTypes.error
      );
      console.error("Error while saving links", error);
    }
  };

  /**
   * Method to update the form
   * @param payload : any
   */
  const updateFormDetails = async (formDataPayload: any, type: string) => {
    try {
      dispatch(setIsLoading(true));
      // const formDataPayload= payload.filter((valueItem: any)=>(valueItem.value !== null &&
      //     valueItem.fieldTypeId != InputType.BOOLEAN && valueItem.value)|| (valueItem.fieldTypeId == InputType.BOOLEAN));
      formDataPayload.forEach((element: any) => {
        if (element.fieldTypeId || element.fieldTypeId === undefined) {
          delete element.fieldTypeId;
        }
      });
      //**wfdisabled section starts
      if (!workflowEnabled) {
        const workflowDisabledDueDate = getValues(
          `${FIXED_FIELDS.DUE_DATE}-wfdisabled`
        );
        const workflowDisabledAssignees = getValues(
          `${FIXED_FIELDS.ASSIGNEE}-wfdisabled`
        ).map((item: any) => item.assignee);

        formDataPayload.forEach((element: any) => {
          if (element.elementId.includes("wfdisabled")) {
            element.elementId = element.elementId.split("-wfdisabled")[0];
          }
        });
        // we filter this because we do not want these element ids in the payload since we are sending them as separate fields already
        const filteredFormPayload = formDataPayload.filter((item: any) => {
          if (type === "draft") {
            item.elementId !== FIXED_FIELDS.STATUS;
          }
          return (
            item.elementId !== FIXED_FIELDS.ASSIGNEE &&
            item.elementId !== FIXED_FIELDS.DUE_DATE
          );
        });
        if (
          (workflowDisabledDueDate === null ||
            workflowDisabledAssignees.length === 0) &&
          type === "submit"
        ) {
          setUpdateFormData({
            formId: Number(pathMatch.params.formId),
            formsData: filteredFormPayload,
            workflowDisabledAssignees,
            workflowDisabledDueDate,
            type,
          });
          setAddAssigneOpen(true);
          dispatch(setIsLoading(false));
          return;
        }
        if (statusChangeDialog.comment)
          postNewComment(statusChangeDialog.comment);
        updateFormWithoutWorkflow({
          formId: Number(pathMatch.params.formId),
          formsData: filteredFormPayload,
          workflowDisabledAssignees,
          workflowDisabledDueDate,
          type,
        });
        setInactiveUpdateBtn(false);
        return;
      }
      //**wfdisabled section ends

      const workflowData: Array<any> = [];
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
      if (workflowData.length > 0) {
        if (
          firstStepAssignees &&
          type == "submit" &&
          forminfo?.status === "DRAFT"
        ) {
          setUpdateFormData({
            formsData: formDataPayload,
            formId: Number(pathMatch.params.formId),
            workflowDurationAndAssignees: workflowData,
            type,
          });
          setAddAssigneOpen(true);
          dispatch(setIsLoading(false));
          return;
        }
        updateForm({
          formId: Number(pathMatch.params.formId),
          formsData: formDataPayload,
          workflowDurationAndAssignees: workflowData,
          type,
        });
      } else {
        backToList();
        dispatch(setIsLoading(false));
      }
      setInactiveUpdateBtn(false);
    } catch (err: any) {
      dispatch(setIsLoading(false));
      console.log(err);
    }
  };

  const saveAfterAddingAssignee = async (
    argAssingneeList: Array<string>,
    dueDate: string | null
  ) => {
    setAddAssigneOpen(false);
    const payload = JSON.parse(JSON.stringify(updateFormData));
    if (workflowEnabled) {
      payload.workflowDurationAndAssignees.forEach((item: any) => {
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
      updateForm(payload);
    } else {
      const workflowDisabledPayload: any = {
        ...payload,
        workflowDisabledDueDate: dueDate,
        workflowDisabledAssignees: argAssingneeList,
      };
      if (statusChangeDialog.comment)
        postNewComment(statusChangeDialog.comment);
      updateFormWithoutWorkflow(workflowDisabledPayload);
    }
  };

  const updateFormWithoutWorkflow = async (argPayload: any) => {
    try {
      dispatch(setIsLoading(true));
      if (state.editMode) {
        dispatch(setEditMode(false));
      }
      await client.mutate({
        mutation: UPDATE_FORM_WITHOUT_WORKFLOW_DRAFT,
        variables: {
          formId: argPayload.formId,
          formsData: argPayload.formsData,
          workflowDisabledAssignees: argPayload.workflowDisabledAssignees,
          workflowDisabledDueDate: argPayload.workflowDisabledDueDate,
        },
        context: {
          role: featureFormRoles.updateForm,
          token: state?.selectedProjectToken,
        },
      });
      // when the form is transitioning from DRAFT to OPEN state, we will also make sure to CRUD links since we necessarily do not update the form when there are no updated fields
      // we checking only for this condition since when the form is in 'OPEN' state, links are updated inline.
      if (forminfo.status === "DRAFT" && argPayload.type === "submit")
        await saveLinks(Number(pathMatch.params.formId), "submit");
      setStatusChangeDialog({ comment: "", open: false, newStatus: "" });
      dispatch(setIsLoading(false));
      Notification.sendNotification(
        "Updated form successfully",
        AlertTypes.success
      );
      if (
        argPayload.type == "submit" &&
        (forminfo?.status === "OPEN" || forminfo?.status === "OVERDUE")
      ) {
        refreshDetails();
        setIsDirty(false);
      } else {
        backToList();
      }
    } catch (error: any) {
      dispatch(setIsLoading(false));
      Notification.sendNotification(error, AlertTypes.warn);
      console.log(error);
    }
  };

  const updateForm = async (argPayload: any) => {
    try {
      setAddAssigneOpen(false);
      dispatch(setIsLoading(true));
      if (state.editMode) {
        dispatch(setEditMode(false));
      }
      await client.mutate({
        mutation: UPDATE_FORM_DETAIL_DRAFT,
        variables: {
          formId: argPayload.formId,
          formsData: argPayload.formsData,
          workflowDurationAndAssignees: argPayload.workflowDurationAndAssignees,
        },
        context: {
          role: featureFormRoles.updateForm,
          token: state?.selectedProjectToken,
        },
      });
      // when the form is transitioning from DRAFT to OPEN state, we will also make sure to CRUD links since we necessarily do not update the form when there are no updated fields
      if (forminfo.status === "DRAFT" && argPayload.type === "submit")
        await saveLinks(Number(pathMatch.params.formId), "submit");
      dispatch(setIsLoading(false));
      Notification.sendNotification(
        "Updated form successfully",
        AlertTypes.success
      );
      if (
        argPayload.type == "submit" &&
        (forminfo?.status === "OPEN" || forminfo?.status === "OVERDUE")
      ) {
        refreshDetails();
        setIsDirty(false);
      } else {
        backToList();
      }
    } catch (error: any) {
      dispatch(setIsLoading(false));
      Notification.sendNotification(error, AlertTypes.warn);
      console.log(error);
    }
  };

  /**
   * Method to set default Values for form
   */
  const setDefaultValue = () => {
    const currentFeatureId = Number(pathMatch.params.featureId);
    const fixedFieldDetails: any = getformDefaultFieldValues(
      formTemplateDetailsData
    );
    //if the selected feature is submittal id, only then replace the projectAutoIncrement with submittalId
    if (currentFeatureId === 8 && submittalId.current) {
      fixedFieldDetails.id = submittalId.current;
    }

    if (formStatus === "CLOSED") {
      const currentProjectId = Number(pathMatch.params.id);

      history.push(
        `/base/projects/${currentProjectId}/form/${currentFeatureId}/view/${Number(
          pathMatch.params.formId
        )}`
      );
    } else {
      if (formStatus === "DRAFT") {
        workFlowDispatch(setWorkFlowViewType("FEATURE_CREATE"));
      } else {
        workFlowDispatch(setWorkFlowViewType("FEATURE_UPDATE"));
      }
    }
    setWorkflowDisabledFields((p) => {
      return { ...p, status: fixedFieldDetails.status };
    });
    setValue(`${FIXED_FIELDS.STATUS}-wfdisabled`, fixedFieldDetails.status);
    setForminfo((prevState) => ({
      ...prevState,
      ...fixedFieldDetails,
      status: formStatus,
    }));
    formTemplateDetailsData.forEach((formData: any) => {
      formTemplateData.forEach((fieldData: any) => {
        if (fieldData.fieldTypeId === InputType.TABLE) {
          const tableFields: Array<any> = [];
          fieldData.tableFields.forEach((rowCells: any) => {
            tableFields.push(...rowCells);
          });
          tableFields.forEach((cellValue: any) => {
            setDefaultValueBasedOnInputType(cellValue, formData);
          });
        } else {
          setDefaultValueBasedOnInputType(fieldData, formData);
        }
      });
    });
    const value = getValues();
    const createdValue: any = getInitialValues(value);
    createdValue.forEach((item: any) => {
      if (
        typeof item.value !== "boolean" &&
        item.value &&
        item.value === "Invalid date"
      ) {
        item.value = null;
      }
    });
    setInitialValue(createdValue);
  };

  /**
   * Method to set default value for form keys based on the fieldType
   * @param fieldData : any
   * @param formData : any
   * @returns
   */
  const setDefaultValueBasedOnInputType = (fieldData: any, formData: any) => {
    if (
      !fieldData.autoGenerated &&
      formData.elementId === fieldData.elementId
    ) {
      switch (formData.typeId) {
        case InputType.TIMEPICKER: {
          const newDate = new Date();
          if (formData?.value) {
            const time = formData?.value?.split(":");
            newDate.setHours(
              Number(time[0]),
              Number(time[1]),
              time[2]?.split(".")[0]
            );
            const value = moment(newDate).local();
            return setValue(
              `${formData.elementId}-fieldTypeId${formData.typeId}`,
              value,
              { shouldValidate: false }
            );
          } else {
            return setValue(
              `${formData.elementId}-fieldTypeId${formData.typeId}`,
              null,
              { shouldValidate: false }
            );
          }
        }
        case InputType.BOOLEAN: {
          if (formData.elementId === FIXED_FIELDS.COST_IMPACT) {
            setCostImpact(formData.value);
            return [
              setValue(
                `${formData.elementId}-comment-fieldTypeId${formData.typeId}`,
                formData.costImpactComments,
                { shouldValidate: false }
              ),
              setValue(
                `${formData.elementId}-fieldTypeId${formData.typeId}`,
                formData.value == null
                  ? formData.value
                  : formData.value
                  ? "true"
                  : "false",
                { shouldValidate: false }
              ),
            ];
          } else if (formData.elementId === FIXED_FIELDS.SCHEDULE_IMPACT) {
            setScheduleImpact(formData.value);
            return [
              setValue(
                `${formData.elementId}-comment-fieldTypeId${formData.typeId}`,
                formData.scheduleImpactComments,
                { shouldValidate: false }
              ),
              setValue(
                `${formData.elementId}-fieldTypeId${formData.typeId}`,
                formData.value == null
                  ? formData.value
                  : formData.value
                  ? "true"
                  : "false",
                { shouldValidate: false }
              ),
            ];
          } else {
            return setValue(
              `${formData.elementId}-fieldTypeId${formData.typeId}`,
              formData.value == null
                ? formData.value
                : formData.value
                ? "true"
                : "false",
              { shouldValidate: false }
            );
          }
        }
        case InputType.CUSTOMDROPDOWN: {
          const value: any[] = [];
          formData.value?.forEach((lists: any) => {
            value.push(lists);
          });
          return setValue(
            `${formData.elementId}-fieldTypeId${formData.typeId}`,
            value,
            { shouldValidate: false }
          );
        }
        case InputType.CUSTOMNESTEDDROPDOWN: {
          const value: any[] = [];
          formData.value?.forEach((lists: any) => {
            value.push(`${lists.configReferenceId}`);
          });
          return setValue(
            `${formData.elementId}-fieldTypeId${formData.typeId}`,
            value,
            { shouldValidate: false }
          );
        }
        case InputType.MULTIVALUEUSER: {
          const value: any[] = [];
          formData.value.forEach((user: any) => {
            value.push(`${user.id}`);
          });
          return setValue(
            `${formData.elementId}-fieldTypeId${formData.typeId}`,
            value,
            { shouldValidate: false }
          );
        }
        case InputType.MULTIVALUECOMPANY: {
          const value: any[] = [];
          formData.value.forEach((company: any) => {
            value.push(Number(`${company.id}`));
          });
          return setValue(
            `${formData.elementId}-fieldTypeId${formData.typeId}`,
            value,
            { shouldValidate: false }
          );
        }
        case InputType.SINGLEVALUEUSER: {
          // let value: string;
          formData.value.forEach((user: any) => {
            return setValue(
              `${formData.elementId}-fieldTypeId${formData.typeId}`,
              `${user.id}`,
              { shouldValidate: false }
            );
          });
          break;
        }
        case InputType.SINGLEVALUECOMPANY: {
          formData.value.forEach((company: any) => {
            return setValue(
              `${formData.elementId}-fieldTypeId${formData.typeId}`,
              `${company.id}`,
              { shouldValidate: false }
            );
          });
          break;
        }
        case InputType.ATTACHMENT: {
          const value: any[] = [];
          formData.value.forEach((file: any) => {
            value.push(file);
          });
          return setValue(
            `${formData.elementId}-fieldTypeId${formData.typeId}`,
            value,
            { shouldValidate: false }
          );
        }
        case InputType.LOCATIONTREE: {
          const value: any[] = [];
          formData.value?.forEach((lists: any) => {
            value.push(lists);
          });
          return setValue(
            `${formData.elementId}-fieldTypeId${formData.typeId}`,
            value,
            { shouldValidate: false }
          );
        }
        case InputType.ASSETTYPES: {
          const value: any[] = [];
          formData.value?.forEach((lists: any) => {
            value.push(lists);
          });
          return setValue(
            `${formData.elementId}-fieldTypeId${formData.typeId}`,
            value,
            { shouldValidate: false }
          );
        }
        case InputType.INTEGER: {
          return setValue(
            `${formData.elementId}-fieldTypeId${formData.typeId}`,
            formData.value?.toString() || "",
            { shouldValidate: false }
          );
        }
        case InputType.TABLE: {
          return;
        }
        default: {
          if (formData.elementId === FIXED_FIELDS.SUBJECT) {
            setCurrentSubjectValue(formData.value);
          }
          return setValue(
            `${formData.elementId}-fieldTypeId${formData.typeId}`,
            formData.value,
            { shouldValidate: false }
          );
        }
      }
    }
  };

  /**
   *
   * @param checked
   * @param elementID
   */
  const commentValidation = (checked: string, elementID: any) => {
    if (elementID === FIXED_FIELDS.COST_IMPACT) {
      checked === "true" ? setCostImpact(true) : setCostImpact(false);
    } else if (elementID === FIXED_FIELDS.SCHEDULE_IMPACT) {
      checked === "true" ? setScheduleImpact(true) : setScheduleImpact(false);
    }
  };

  /**
   *
   */
  const viewWorkFlow = () => {
    setIsWorkflowOpen(true);
  };

  const closeWorkflow = () => {
    setIsWorkflowOpen(false);
  };

  const clearBooleanValue = (argForm: any) => {
    if (!isEditDisabled) {
      setValue(`${argForm.elementId}-fieldTypeId${argForm.fieldTypeId}`, null);
      if (argForm.elementId === FIXED_FIELDS.COST_IMPACT) {
        setCostImpact(false);
      }
      if (argForm.elementId === FIXED_FIELDS.SCHEDULE_IMPACT) {
        setScheduleImpact(false);
      }
    }
  };

  const closeStatusChangeDialog = () => {
    setStatusChangeDialog((p) => {
      return {
        ...p,
        open: false,
        newStatus: "",
      };
    });
  };

  useEffect (()=>{

if(state?.selectedProjectToken){
  getCheckListFormData()
  getIssueLogFormData()
}
    
  },[state?.selectedProjectToken])

  const getCheckListFormData = async()=>{
    try{
     const checklistFormResponse = await getFormChecklist(pathMatch.params.formId,state?.selectedProjectToken);
     setProjectChecklistInfo(checklistFormResponse)

    }catch(error){
     console.log('error in getting checklist form data',error)
    }
   }

   const getIssueLogFormData = async()=>{
    try{
     const issueLogFormResponse = await getFormIssueLogs(pathMatch.params.formId,state?.selectedProjectToken);
 
     setIssueLogsProjectData(issueLogFormResponse?issueLogFormResponse:[])

    }catch(error){
     console.log('error in getting checklist form data',error)
    }
   }

  const handleOnClickOkStatusChangeDialog = (e: any) => {
    const newFields = { ...e };
    setValue(`${FIXED_FIELDS.ASSIGNEE}-wfdisabled`, e.assignees);
    setValue(`${FIXED_FIELDS.DUE_DATE}-wfdisabled`, e.dueDate);
    setValue(`${FIXED_FIELDS.STATUS}-wfdisabled`, e.status);
    setWorkflowDisabledFields(newFields);
    closeStatusChangeDialog();
  };

  const renderForm = useCallback(() => {
    return formTemplateData?.map((form) => (
      <Grid
        key={form.elementId}
        className= {form.caption==="Linked Forms"? "editFeatureform__body__form__container__formfields__fields__field container_order": "editFeatureform__body__form__container__formfields__fields__field"}
        item
        sm={form.caption==="Linked Forms" ? 12: form.width === 50 ? 6 : 12}
        xs={12}
      >
        <InputLabel required={form.required}>{form.caption}</InputLabel>
        {form.fieldTypeId ===InputType.Object && 
        <div className="editFeatureform__body__form__container__formfields__fields__field__objectType"> 
        <ObjectTree formData ={form}  data={objectTypeFormData}/>
                            </div> }
        {form.fieldTypeId ===InputType.SECTION && 
        <div className="editFeatureform__body__form__container__formfields__fields__field__section"> 
        <SectionDetail projectSectionInfo = {projectCheckListInfo}/>
                            </div> }
        {form.fieldTypeId ===21 && 
        <div className="editFeatureform__body__form__container__formfields__fields__field__linkedForms"> 
        <IssueLogProjectDetail issueLogProjectFormData = {issueLogsProjectData}/>
                            </div> }
        {form.fieldTypeId === InputType.BOOLEAN ? (
          <>
            <div className="editFeatureform__body__form__container__formfields__fields__field__impact">
              <div className="editFeatureform__body__form__container__formfields__fields__field__impact__inputs">
                <Controller
                  render={({ field }: { field: any }) => {
                    return (
                      <RadioGroup
                        aria-label="gender"
                        name="gender1"
                        {...field}
                        value={field.value === null ? "null" : field.value}
                        onChange={(e: any) => {
                          field.onChange(e.target.value),
                            commentValidation(e.target.value, form.elementId);
                        }}
                      >
                        <FormControlLabel
                          className="form-radio"
                          disabled={isEditDisabled}
                          onChange={(e: any) => {
                            field.onChange(e), setIsDirty(true);
                          }}
                          value="true"
                          control={<Radio color="default" />}
                          label="Yes"
                        />
                        <FormControlLabel
                          className="form-radio"
                          value="false"
                          disabled={isEditDisabled}
                          onChange={(e: any) => {
                            field.onChange(e), setIsDirty(true);
                          }}
                          control={<Radio color="default" />}
                          label="No"
                        />
                        {(form.elementId === FIXED_FIELDS.COST_IMPACT ||
                          form.elementId === FIXED_FIELDS.SCHEDULE_IMPACT) && (
                          <FormControlLabel
                            className="form-radio"
                            value={"null"}
                            disabled={isEditDisabled}
                            onChange={(e: any) => {
                              field.onChange(e), setIsDirty(true);
                            }}
                            control={<Radio color="default" />}
                            label="To be determined"
                          />
                        )}
                      </RadioGroup>
                    );
                  }}
                  name={`${form.elementId}-fieldTypeId${form.fieldTypeId}`}
                  control={control}
                  rules={{
                    required: form.required ? true : false,
                  }}
                />
                {form.fieldTypeId === InputType.BOOLEAN &&
                  form.elementId !== FIXED_FIELDS.COST_IMPACT &&
                  form.elementId !== FIXED_FIELDS.SCHEDULE_IMPACT && (
                    <Button
                      onClick={() => clearBooleanValue(form)}
                      disabled={isEditDisabled}
                      className="editFeatureform__body__form__container__formfields__fields__field__impact__inputs__label"
                    >
                      Clear
                    </Button>
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
                        onChange={(e: any) => {
                          field.onChange(e), setIsDirty(true);
                        }}
                        placeholder="Comment"
                        disabled={isEditDisabled}
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
                        onChange={(e: any) => {
                          field.onChange(e), setIsDirty(true);
                        }}
                        placeholder="Comment"
                        disabled={isEditDisabled}
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
                {errors[`${form.elementId}-fieldTypeId${form.fieldTypeId}`]
                  ?.type === "required" && (
                  <span>This field is mandatory.</span>
                )}
              </p>
            </div>
          </>
        ) : (
          <>
            {form.fieldTypeId === InputType.TABLE ? (
              <div className="editFeatureform__body__form__container__formfields__fields__field__table">
                <FormFeatureTable
                  formData={form}
                  formcontrol={control}
                  isEditDisabled={isEditDisabled}
                />
              </div>
            ) : (
              <RfiForm
                control={control}
                formData={form}
                type={"FORM"}
                isEditDisabled={isEditDisabled}
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
  }, [
    formTemplateData,
    costImpact,
    scheduleImpact,
    isEditDisabled,
    isSpecification,
    errors,
  ]);

  const setFollowersValue = (argValues: Array<any>) => {
    setFollowers(argValues);
  };

  const handleDraftSubmit = () => {
    const { formToFormLinks } = links;
    const editedLinks = formToFormLinks.filter(
      (item: any) => item.deleted || item.new || item.relationShipModifield
    );
    if (editedLinks.length === 0) {
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
        //page is navigated back to the list page after draft is submitted. Hence, no need to enable the draft button again
        setDisableDraft(true);
        payloadHandle(value, "draft");
      }
    } else {
      setDraftConfirmOpen(true);
    }
  };

  const setLinkValues = (argValue: any) => {
    const { formToFormLinks, formToTaskLinks } = argValue;

    try {
      const targetList: any = [...links.formToFormLinks];
      const newLinks = formToFormLinks.filter((item: any) =>
        targetList.every(
          (linkitem: any) =>
            item.targetId !== linkitem.targetId && item.new && !item.deleted
        )
      );
      const deleteLinks = targetList.filter((item: any) =>
        formToFormLinks.every(
          (linkitem: any) =>
            item.targetId !== linkitem.targetId && !linkitem.deleted
        )
      );
      const reassignedLinks = targetList.filter((item: any) =>
        formToFormLinks.some(
          (linkitem: any) => item.targetId === linkitem.targetId && item.deleted
        )
      );
      deleteLinks.forEach((item: any) => {
        const currentLink = targetList.find(
          (linkItem: any) => linkItem.targetId === item.targetId
        );
        const index = targetList.indexOf(currentLink);
        if (index > -1) {
          targetList.splice(index, 1);
        }
      });
      targetList.forEach((element: any) => {
        formToFormLinks.forEach((valueItem: any) => {
          if (element.targetId === valueItem.targetId) {
            element.relation = valueItem.relation;
            element.relationShipModifield =
              element.originalRelationShip !== valueItem.relation
                ? true
                : false;
          }
        });
    });

      reassignedLinks.forEach((item: any) => {
        const currentLink = targetList.find(
          (linkItem: any) => linkItem.targetId === item.targetId
        );
        const index = targetList.indexOf(currentLink);
        if (index > -1) {
          targetList[index].deleted = false;
        }
      });
      newLinks.forEach((item: any) => {
        targetList.push(item);
      });

      setLinks((prev: any) => {
        return {
          formToTaskLinks: formToTaskLinks,
          formToFormLinks: targetList,
        };
      });
    } catch (error: any) {
      console.log(error);
    }
  };

  const refreshDetails = () => {
    getFormTemplateDetails();
    getFormLinks();
    getWorkFlowStepHistory();
    fetchAssociatedWorkFlowDetails();
    setRefreshed(true);
  };

  // if current user is part of current step assignee then open review form
  const canReviewForm = () => {
    const users: any = activeStepAssignee.filter(
      (assignee: any) => assignee.assignee === decodeExchangeToken().userId
    );
    users.length > 0 ? setIsReviewForm(true) : setIsReviewForm(false);
  };

  const getWorkFlowStepHistory = async () => {
    try {
      const workflowStepsHistory = await client.query({
        query: FETCH_WORKFLOW_HISTORY,
        variables: {
          featureName: pathMatch.params.formId,
          featureId: pathMatch.params.featureId,
        },
        fetchPolicy: "network-only",
        context: {
          role: featureFormRoles.viewForm,
          token: state?.selectedProjectToken,
        },
      });
      const workFlowStepHistory: any = [];
      if (workflowStepsHistory.data.workflowRuntimeInfo.length > 0) {
        workFlowStepHistory.push(
          ...workflowStepsHistory.data.workflowRuntimeInfo
        );
        setWorkFLowStepsData(workFlowStepHistory);
      }
    } catch (error: any) {
      console.log(error.message);
    }
  };

  const updateAssignee = async (argUsers: Array<any>) => {
    try {
      dispatch(setIsLoading(true));
      const payload = {
        elementId: FIXED_FIELDS.ASSIGNEE,
        value: argUsers.map((item) => item.assignee),
      };
      const finalPayload = {
        formId: Number(pathMatch.params.formId),
        formsData: [payload],
      };
      await client.mutate({
        mutation: UPDATE_FORM_DETAIL_CURRENT_STEP_ASSIGNEE,
        variables: {
          ...finalPayload,
        },
        context: {
          role: featureFormRoles.updateForm,
          token: state?.selectedProjectToken,
        },
      });
      setActiveStepAssignee(argUsers);
      dispatch(setIsLoading(false));
    } catch (error: any) {
      console.log(error);
      dispatch(setIsLoading(false));
    }
  };

  const handleDueDateChange = useCallback((date: string) => {
    setWorkflowDisabledFields((p) => {
      return { ...p, dueDate: date };
    });
  }, []);

  return (
    <FormHoc>
      {projectState?.featurePermissions?.canUpdateForm ? (
        <div className="editFeatureform">
          {!inValidForm ? (
            <>
              {/* workflow flag is used to position layout when enabled  */}
              {workflowEnabled ? (
                <div className="editFeatureform__nav">
                  <>
                    <div className="editFeatureform__nav__info">
                      <NavInfo forminfo={forminfo} />
                    </div>
                    <div className="editFeatureform__nav__header">
                      <Header
                        header={`${
                          forminfo.status === "DRAFT"
                            ? forminfo?.subject
                              ? forminfo?.subject
                              : projectState?.currentFeature?.feature
                            : forminfo?.subject
                        }`}
                        navigate={handleCancel}
                      />

                      <div className="editFeatureform__nav__header__action">
                        {projectState?.featurePermissions?.canUpdateForm && (
                          <div className="editFeatureform__nav__header__action__followers">
                            <FollowerSelect
                              type={FollowerTye.UPDATE}
                              setValue={setFollowersValue}
                              refresh={refreshed}
                              clear={() => setRefreshed(false)}
                            />
                          </div>
                        )}
                        <Button
                          className="editFeatureform__nav__header__action__workFLow"
                          onClick={viewWorkFlow}
                        >
                          <VisibilityIcon className="editFeatureform__nav__header__action__workFLow__icon" />
                          <span>View WorkFlow</span>
                        </Button>
                      </div>
                    </div>
                  </>
                </div>
              ) : (
                workflowEnabled === false && (
                  <div>
                    <div className="editFeatureform_wowf_header">
                      <Header
                        header={`${
                          forminfo.status === "DRAFT"
                            ? forminfo?.subject
                              ? forminfo?.subject
                              : projectState?.currentFeature?.feature
                            : forminfo?.subject
                        }`}
                        navigate={handleCancel}
                      />
                    </div>
                    <div className="editFeatureform_wowf_infoBar">
                      <InfoBar {...forminfo} status={formStatus} isImported={isImported} />
                      {projectState?.featurePermissions?.canUpdateForm && (
                        <div className="editFeatureform__nav__header__action__followers">
                          <FollowerSelect
                            type={FollowerTye.UPDATE}
                            setValue={setFollowersValue}
                            refresh={refreshed}
                            clear={() => setRefreshed(false)}
                          />
                        </div>
                      )}
                    </div>
                    {formStatus.toLowerCase() !== "draft" && (
                      <ControlBar
                        {...workflowDisabledFields}
                        control={control}
                        statusListOptions={statusListOptions}
                        handleUpdateAssignee={updateAssignee}
                        handleStatusChange={(e: ChangeEvent<any>) => {
                          const newStatusToBeSelected = statusListOptions.find(
                            (o) => o.status === e.target.value
                          );
                          const isStatusOfClosedType =
                            !newStatusToBeSelected?.openStatus;

                          if (isStatusOfClosedType && isBlockedBy) {
                            const msg = `You cannot move this ${projectState?.currentFeature?.feature} to '${e.target.value}' as there are blocking items`;
                            Notification.sendNotification(msg, AlertTypes.warn);
                            return;
                          }
                          setStatusChangeDialog((p) => {
                            return {
                              ...p,
                              newStatus: e.target.value,
                              open: true,
                            };
                          });
                        }}
                        handleDueDateChange={handleDueDateChange}
                      />
                    )}
                  </div>
                )
              )}
              <div
                data-workflowenabled={workflowEnabled}
                className="editFeatureform__body"
              >
                <div
                  className="editFeatureform__body__form"
                  style={{
                    width: `${
                      isReviewForm ||
                      (projectState?.featurePermissions?.canDeleteForm &&
                        forminfo.status !== "DRAFT")
                        ? "65%"
                        : "100%"
                    }`,
                    margin: `${
                      isReviewForm ||
                      (projectState?.featurePermissions?.canDeleteForm &&
                        forminfo.status !== "DRAFT")
                        ? "0"
                        : "0 12.5%"
                    }`,
                  }}
                >
                  <div className="editFeatureform__body__form__container">
                    <div className="editFeatureform__body__form__container__step">
                      {workflowEnabled && stepName && (
                        <div className="editFeatureform__body__form__container__step__info">
                          <div className="editFeatureform__body__form__container__step__info__field">
                            <div className="editFeatureform__body__form__container__step__info__field__label">
                              Current workflow step
                            </div>
                            <div className="editFeatureform__body__form__container__step__info__field__value">
                              {stepName}
                            </div>
                          </div>
                          <div className="editFeatureform__body__form__container__step__info__field">
                            <div className="editFeatureform__body__form__container__step__info__field__label">
                              Current Assignee
                            </div>
                            {projectState?.featurePermissions?.canDeleteForm ? (
                              <AssigneeSelect
                                save={updateAssignee}
                                featureId={Number(pathMatch.params.featureId)}
                                users={activeStepAssignee}
                              />
                            ) : (
                              <ProjectUserDetails users={activeStepAssignee} />
                            )}
                          </div>
                          <div className="editFeatureform__body__form__container__step__info__field">
                            <div className="editFeatureform__body__form__container__step__info__field__label">
                              Current step Status
                            </div>
                            <div className="editFeatureform__body__form__container__step__info__field__value">
                              {forminfo.status}
                            </div>
                          </div>
                          <div className="editFeatureform__body__form__container__step__info__field">
                            <div className="editFeatureform__body__form__container__step__info__field__label">
                              Current Step Due
                            </div>
                            <div className="editFeatureform__body__form__container__step__info__field__value">
                              {moment(activeStepDueDate)
                                .format("DD MMM YYYY")
                                .toString()}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <form onSubmit={handleSubmit(onSubmit)}>
                      <div className="editFeatureform__body__form__container__formfields">
                        <Grid
                          container
                          className="editFeatureform__body__form__container__formfields__fields"
                        >
                          <formStateContext.Provider
                            value={{
                              errors,
                              setValue,
                              setError,
                              getValues,
                              usersList,
                              companiesList,
                              setIsDirty,
                              currentSubjectValue,
                              initialValue,
                              setCurrentSubjectValue,
                            }}
                          >
                            {renderForm()}
                          </formStateContext.Provider>

                          {forminfo.status === "DRAFT" && !isEditDisabled && (
                            <LinkInput
                              setValue={setLinkValues}
                              status={forminfo.status}
                              updateLinkList={getFormLinks}
                              linkValues={links}
                              type={LinkType.UPDATE}
                              subjectValue={currentSubjectValue}
                            />
                          )}
                        </Grid>
                      </div>

                      {forminfo.status && !isEditDisabled && (
                        <div className="editFeatureform__body__form__container__form-action">
                          <Button
                            data-testid={"edit-rfi-close"}
                            variant="outlined"
                            onClick={handleCancel}
                            className="btn-secondary"
                          >
                            Cancel
                          </Button>
                          {forminfo.status !== "DRAFT" &&
                          forminfo.status !== "CLOSED" &&
                          !isEditDisabled ? (
                            <Button
                              data-testid={"edit-rfi-save"}
                              variant="outlined"
                              type="submit"
                              className="btn-primary"
                              disabled={inactiveUpdateBtn}
                            >
                              Update
                            </Button>
                          ) : (
                            <>
                              <Button
                                data-testid={"edit-draft-rfi-save"}
                                variant="outlined"
                                onClick={handleDraftSubmit}
                                disabled={disableDraft}
                                className="btn-primary"
                              >
                                Save as Draft
                              </Button>
                              <Button
                                data-testid={"create-draft-rfi-save"}
                                variant="outlined"
                                type="submit"
                                // disabled={findInvalidField()}
                                className="btn-primary"
                              >
                                Submit
                              </Button>
                            </>
                          )}
                        </div>
                      )}
                    </form>
                    {(forminfo?.status === "OPEN" ||
                      forminfo?.status === "OVERDUE") && (
                      <Grid container>
                        <Grid
                          item
                          xs={12}
                          className="editFeatureform__body__form__container__links"
                        >
                          <LinkInput
                            setValue={setLinkValues}
                            status={forminfo.status}
                            updateLinkList={refreshDetails}
                            linkValues={links}
                            type={LinkType.UPDATE}
                            subjectValue={currentSubjectValue}
                          />
                        </Grid>
                      </Grid>
                    )}
                    {workflowEnabled && (
                      <div className="editFeatureform__body__form__container__workflowdetails">
                        {(forminfo?.status === "OPEN" ||
                          forminfo?.status === "OVERDUE") && (
                          <WorkflowDetails
                            workFLowStepsData={workFLowStepsData}
                            viewWorkFlow={viewWorkFlow}
                          />
                        )}
                      </div>
                    )}
                    {projectState?.featurePermissions?.canUpdateForm &&
                    forminfo?.status ? (
                      <>
                        <div className="editFeatureform__body__form__container__commentaction">
                          <label
                            className={`${
                              currentTab === ViewTab.Comments
                                ? "editFeatureform__body__form__container__commentaction__active"
                                : ""
                            }
                                                        editFeatureform__body__form__container__commentaction__tab`}
                            onClick={() => setCurrentTab(ViewTab.Comments)}
                          >
                            Comments
                          </label>
                          <label
                            className={`${
                              currentTab === ViewTab.Activity
                                ? "editFeatureform__body__form__container__commentaction__active"
                                : ""
                            }
                                                        editFeatureform__body__form__container__commentaction__tab`}
                            onClick={() => setCurrentTab(ViewTab.Activity)}
                          >
                            Activity
                          </label>
                        </div>
                        {currentTab === ViewTab.Comments ? (
                          <CommentSection
                            key={refreshed.toString()}
                            active={true}
                          />
                        ) : (
                          <HistoryAction
                            historyData={historyData}
                            commentsHistoryData={commentsHistoryData}
                          />
                        )}
                      </>
                    ) : (
                      ""
                    )}
                  </div>
                </div>
                {workflowEnabled &&
                  (isReviewForm ||
                    (projectState?.featurePermissions?.canDeleteForm &&
                      (forminfo.status === "OPEN" ||
                        forminfo.status === "OVERDUE"))) && (
                    <div className="editFeatureform__body__review">
                      <ReviewForm
                        submitReview={() => setIsReviewForm(false)}
                        activeWorkFlowStepData={activeWorkFlowStepData}
                        isBlockedBy={isBlockedBy}
                        refresh={refreshDetails}
                      />
                    </div>
                  )}
              </div>
              {workflowEnabled && (
                <workFlowContext.Provider
                  value={{ workFlowState, workFlowDispatch }}
                >
                  {isWorkflowOpen ? (
                    <div className="editFeatureform__workflow-wrapper">
                      <Header header={"Workflow"} navigate={closeWorkflow} />
                      <WorkFlowView close={() => setIsWorkflowOpen(false)} />
                    </div>
                  ) : (
                    ""
                  )}
                </workFlowContext.Provider>
              )}
            </>
          ) : !state.isLoading && inValidForm ? (
            <div className="noData">
              <Header header={"Back"} navigate={handleCancel} />
              <div className="noData__message">
                <NoDataMessage
                  message={`${invalidFormMessage.replace(
                    "item",
                    projectState?.currentFeature?.feature || "Item"
                  )}`}
                />
              </div>
            </div>
          ) : (
            ""
          )}
        </div>
      ) : !state.isLoading ? (
        <div className="noUpdatePermission">
          <div className="noCreatePermission__header">
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
          open={confirmOpen}
          message={confirmMessage}
          close={() => setConfirmOpen(false)}
          proceed={backToList}
        />
      }
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
          inDueDate={getValues(`${FIXED_FIELDS.DUE_DATE}-wfdisabled`)}
          inAssignees={getValues(`${FIXED_FIELDS.ASSIGNEE}-wfdisabled`)}
        />
      )}

      {!workflowEnabled && statusChangeDialog.open && (
        <StatusChangeDialog
          status={workflowDisabledFields.status}
          assignees={getValues(`${FIXED_FIELDS.ASSIGNEE}-wfdisabled`)}
          dueDate={getValues(`${FIXED_FIELDS.DUE_DATE}-wfdisabled`)}
          statusListOptions={statusListOptions}
          open={statusChangeDialog.open}
          newStatus={statusChangeDialog.newStatus}
          comment={statusChangeDialog.comment}
          onCommentChange={(e: ChangeEvent<any>) => {
            setStatusChangeDialog((p) => {
              return { ...p, comment: e.target.value };
            });
          }}
          onClickClose={closeStatusChangeDialog}
          onClickOk={handleOnClickOkStatusChangeDialog}
        />
      )}
    </FormHoc>
  );
}
