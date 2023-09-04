import React, {
  ReactElement,
  useContext,
  useEffect,
  useReducer,
  useState,
  useRef,
} from "react";
import { match, useHistory, useRouteMatch } from "react-router-dom";
import Header from "../../../../shared/components/Header/Header";
import VisibilityIcon from "@material-ui/icons/Visibility";
import { stateContext } from "../../../../root/context/authentication/authContext";
import { setIsLoading } from "../../../../root/context/authentication/action";
import {
  FETCH_FORM_TEMPLATE_DETAILS,
  FETCH_FORM_TEMPLATE_VIEW,
  FETCH_HISTORY_ACTIVITY,
  FETCH_COMMENTS_HISTORY_ACTIVITY,
  FETCH_WORKFLOW_HISTORY,
  FETCH_STATUS_LIST_OPTIONS,
} from "../../graphql/queries/rfi";
import { client } from "../../../../../services/graphql";
import moment from "moment";
import {
  FIXED_FIELDS,
  FollowerTye,
  hiddenViewFields,
  InputType,
  LinkType,
  ViewTab,
  FeatureId,
} from "../../../../../utils/constants";
import { Avatar, Button, Chip, Grid } from "@material-ui/core";
import WorkflowDetails from "../../components/WorkflowDetails/WorkflowDetails";
import CommentSection from "../../components/CommentSection/CommentSection";
import NoDataMessage from "../../../../shared/components/NoDataMessage/NoDataMessage";
import FormHoc from "../../components/FormHoc/FormHoc";
import { projectContext } from "../../Context/projectContext";
import FollowerSelect from "../../components/FollowerSelect/FollowerSelect";
import {
  FETCH_FORM_LINKS,
  FETCH_TASK_TYPE_ID,
} from "../../graphql/queries/link";
import LinkInput from "../../components/Link/Link";
import DescriptionIcon from "@material-ui/icons/Description";
import GetAppIcon from "@material-ui/icons/GetApp";
import WorkFlowView from "src/modules/shared/components/WorkFlowView/WorkFlowView";
import {
  FETCH_WORK_FLOW_FEATURE,
  LOAD_PROJECT_TEMPLATE_ASSOCIATION,
} from "../../../graphql/queries/workflow";
import { featureFormRoles, myProjectRole, FormsRoles } from "src/utils/role";
import { decodeExchangeToken } from "src/services/authservice";
import { workFlowContext } from "../../../context/workflow/workflowContext";
import {
  setAllowedWorkflowRoles,
  setWorkFlowFeatureType,
  setWorkflowOutComes,
  setWorkFlowRootId,
  setWorkFlowStepAssignees,
  setWorkflowSteps,
  setWorkFlowViewType,
} from "../../../context/workflow/workflowAction";
import {
  workFlowInitial,
  workflowReducer,
} from "../../../context/workflow/workflowReducer";
import HistoryAction from "../../components/HistoryAction/HistoryAction";
import ConfirmDialog from "../../../../shared/components/ConfirmDialog/ConfirmDialog";
import { FETCH__PROJECT_ROLE_ABOVE_VIEW } from "../../../graphql/queries/users";
import { setCurrentFormId } from "../../Context/link/linkAction";
import {
  getWorkFlowAssignees,
  getWorkflowStepsAndOutcomes,
  initalizeFormFieldDetailsData,
  initializeLinkValues,
  intializeFormFieldData,
  sortDataOnSequence,
  initializeFormToTaskLinks,
} from "../../utils/formHelper";
import {
  EditViewFormParams,
  FormFieldData,
  FormFieldDetailsData,
} from "../../models/form";
import "./ViewRfi.scss";
import NavInfo from "../../components/NavInfo/NavInfo";
import { invalidFormMessage } from "../../utils/constants";
import ProjectUserDetails from "src/modules/shared/components/ProjectUserDetails/ProjectUserDetails";
import { InfoBar, ControlBar } from "../../components/UpdateFormWoWf";
import { IWorkflowDisabledFields } from "../EditRfi/EditRfiTypes";
import {getFormChecklist,getFormIssueLogs} from '../../graphql/queries/apiRequest';
import {IssueLogProjectDetail} from  "../../components/IssueLogProjectDetail/IssueLogProjectDetail";
import{SectionDetail} from "../../components/SectionDetail/SectionDetail";

const noPermissionRoleMessage = "You don't have permission to view this form";

const confirmMessage = {
  header: "Are you sure?",
  text: "If you cancel now, your changes won’t be saved.",
  cancel: "Go back",
  proceed: "Yes, I'm sure",
};

export default function ViewFeatureForms(): ReactElement {
  const history = useHistory();
  const pathMatch: match<EditViewFormParams> = useRouteMatch();
  const { dispatch, state }: any = useContext(stateContext);
  const [formTemplateDetailsData, setformTemplateDetailsData] = useState<
    Array<any>
  >([]);
  const [activeWorkFlowStepData, setActiveWorkFlowStepData] = useState<
    Array<any>
  >([]);
  const [forminfo, setForminfo] = useState({
    id: "",
    createdAt: "",
    createdBy: "",
    status: "",
    subject: "",
    dueDate: "",
  });
  const [projectCheckListInfo, setProjectChecklistInfo] = useState<any>([]);
  const [issueLogsProjectData, setIssueLogsProjectData] = useState<any>([])
  const [formTemplateData, setFormTemplateData] = useState<Array<any>>([]);
  const [viewFormData, setViewFormData] = useState<Array<any>>([]);
  const [isWorkflowOpen, setIsWorkflowOpen] = useState(false);
  const [isReviewForm, setIsReviewForm] = useState(false);
  const [currentTab, setCurrentTab] = useState(ViewTab.Comments);
  const [inValidForm, setInValidForm] = useState(false);
  const { projectState, projectDispatch }: any = useContext(projectContext);
  const [templateVersionId, setTemplateVersionId] = useState<any>(null);
  const [links, setLinks] = useState<any>({
    formToFormLinks: [],
    formToTaskLinks: [],
  });
  const [workFlowState, workFlowDispatch] = useReducer(
    workflowReducer,
    workFlowInitial
  );
  const [activeStepAssignee, setActiveStepAssignee] = useState<Array<any>>([]);
  const [activeStepDueDate, setActiveStepDueDate] = useState<any>(null);
  const [stepName, setStepName] = useState("");
  const [workFLowStepsData, setWorkFLowStepsData] = useState<Array<any>>([]);
  const [historyData, setHistoryData] = useState<Array<any>>([]);
  const [commentsHistoryData, setCommentsHistoryData] = useState<Array<any>>(
    []
  );
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [refreshed, setRefreshed] = useState(false);
  const submittalId = useRef<any>(null);
  const [workflowEnabled, setWorkflowEnabled] = useState<boolean | null>(null);
  const [statusListOptions, setStatusListOptions] = useState([]);
  const [isImported, setIsImported] = useState<boolean>(false)
  const [workflowDisabledFields, setWorkflowDisabledFields] =
    useState<IWorkflowDisabledFields>({
      status: "",
      dueDate: null,
      assignees: [],
    });
  const [formStatus, setFormStatus] = useState("");

  useEffect (()=>{
 if(state?.selectedProjectToken){
  getCheckListFormData()
  getIssueLogFormData()
 }

    
  },[state?.selectedProjectToken])

  const getCheckListFormData = async()=>{
    try{
     const checklistFormResponse = await getFormChecklist(pathMatch.params.formId,state?.selectedProjectToken);
     setProjectChecklistInfo(checklistFormResponse?checklistFormResponse:[])

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


  useEffect(() => {
    if (workflowEnabled === false) {
      fetchStatusListOptions();
    }
  }, [workflowEnabled]);

  useEffect(() => {
    workFlowDispatch(
      setWorkFlowFeatureType(Number(pathMatch.params.featureId))
    );
    if (state?.selectedProjectToken) {
      getFormTemplateDetails();
      getFormLinks();
      getWorkFlowDetails();
      getWorkFlowStepHistory();
      getHistoryActivity();
      getCommentsHistoryActivity();
      fetchPermittedRoles();
    }
  }, [state?.selectedProjectToken, workflowEnabled]);

  useEffect(() => {
    if (formTemplateDetailsData && formTemplateData) {
      filterFormTemplate(formTemplateData, formTemplateDetailsData);
    }
  }, [formTemplateDetailsData, formTemplateData]);

  useEffect(() => {
    if (state?.selectedProjectToken && templateVersionId) {
      getFormTemplate(templateVersionId);
    }
  }, [templateVersionId, state?.selectedProjectToken]);

  useEffect(() => {
    canReviewForm();
  }, [activeStepAssignee]);

  const fetchStatusListOptions = async () => {
    try {
      const statusListOptionsResponse = await client.query({
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
      setStatusListOptions(statusListOptionsResponse.data.formStatus);
      // projectDispatch(setProjectUsers(users));
    } catch (err: any) {
      console.log(err);
    }
  };

  const fetchPermittedRoles = async () => {
    try {
      const permittedRolesResponse: any = await client.query({
        query: FETCH__PROJECT_ROLE_ABOVE_VIEW,
        variables: {
          featureId: [Number(pathMatch.params.featureId)],
        },
        fetchPolicy: "network-only",
        context: { role: myProjectRole.viewMyProjects },
      });
      if (permittedRolesResponse.data.projectPermission.length > 0) {
        const targetList = permittedRolesResponse.data.projectPermission.map(
          (item: any) => item.roleId
        );
        workFlowDispatch(setAllowedWorkflowRoles(targetList));
      }
    } catch (error: any) {
      console.log(error.message);
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
          role: featureFormRoles.viewForm,
          token: state?.selectedProjectToken,
        },
      });
      if (projectsData.data.projectTemplateAssociation.length > 0) {
        workFlowDispatch(
          setWorkFlowRootId(
            projectsData.data.projectTemplateAssociation[0].workflowTemplateId
          )
        );
        workFlowDispatch(setCurrentFormId(Number(pathMatch.params.formId)));
        fetchAssociatedWorkFlowDetails();
      }
    } catch (error: any) {
      console.log(error.message);
    }
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

  const fetchAssociatedWorkFlowDetails = async () => {
    try {
      const responseData = await client.query({
        query: FETCH_WORK_FLOW_FEATURE,
        variables: {
          featureType: pathMatch.params.featureId,
          featureName: pathMatch.params.formId,
          projectId: Number(pathMatch.params.id),
        },
        fetchPolicy: "network-only",
        context: {
          role: featureFormRoles.viewForm,
          token: state?.selectedProjectToken,
        },
      });
      const stepKeys: any = {};
      if (responseData.data.workflowTemplate.length > 0) {
        const stepAssigneess: Array<any> = getWorkFlowAssignees(
          responseData.data.workflowTemplate[0].workflowFeatureStepDefs
        );
        responseData.data.workflowTemplate[0].workflowTemplateStepDefs.forEach(
          (item: any) => {
            stepKeys[item.name] = item.id;
          }
        );
        const { steps, endPoints } = getWorkflowStepsAndOutcomes(
          responseData.data.workflowTemplate[0].workflowTemplateStepDefs,
          stepKeys
        );
        workFlowDispatch(setWorkFlowStepAssignees(stepAssigneess));
        workFlowDispatch(setWorkflowSteps(steps));
        workFlowDispatch(setWorkFlowViewType("FEATURE_UPDATE"));
        workFlowDispatch(setWorkflowOutComes(endPoints));
      }
    } catch (error: any) {
      console.log(error.message);
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

  // fetch form template
  const getFormTemplate = async (argTemplateVersionId: number) => {
    try {
      dispatch(setIsLoading(true));
      const formsTemplateResponse = await client.query({
        query: FETCH_FORM_TEMPLATE_VIEW,
        variables: {
          featureId: Number(pathMatch.params.featureId),
          versionId: Number(argTemplateVersionId),
        },
        fetchPolicy: "network-only",
        context: {
          role: featureFormRoles.viewForm,
          token: state?.selectedProjectToken,
        },
      });
      dispatch(setIsLoading(false));
      // exact version :--> formTemplateVersions.length - 1
      const templateAssociation =
        formsTemplateResponse?.data?.projectTemplateAssociation[0];
      const formTemplateVersions =
        templateAssociation.formTemplate.formTemplateVersions;
      setWorkflowEnabled(templateAssociation.workflowEnabled);
      if (formTemplateVersions[0].formTemplateFieldData) {
        const currentVersionFieldData = JSON.parse(
          JSON.stringify(formTemplateVersions[0].formTemplateFieldData)
        );
        const formsData: Array<any> = [];
        currentVersionFieldData.forEach((item: any) => {
          if (
            item.elementId === FIXED_FIELDS.SUBJECT &&
            item?.metadata?.caption
          ) {
            item.caption = item?.metadata?.caption;
          }
          const newTemplate: FormFieldData = intializeFormFieldData(item);
          formsData.push(newTemplate);
        });
        setFormTemplateData(formsData.sort(sortDataOnSequence));
      }
    } catch (err: any) {
      console.log(err);
      dispatch(setIsLoading(false));
    }
  };

  // fetch form template details
  const getFormTemplateDetails = async () => {
    try {
      dispatch(setIsLoading(true));
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
      dispatch(setIsLoading(false));
      if (formsTemplateDetailsResponse?.data?.formDetails_query.id === null) {
        setInValidForm(true);
      } else {
        setInValidForm(false);
      }
      submittalId.current =
        formsTemplateDetailsResponse.data.formDetails_query.submittalId;
      const formStatus =
        formsTemplateDetailsResponse?.data?.formDetails_query.formState;
      setFormStatus(formStatus);
      if (formsTemplateDetailsResponse?.data?.formDetails_query?.formsData) {
        const formsDetailsData: Array<any> = [];
        const wfDisabledObj = {
          status: "",
          assignees: [],
          dueDate: null,
        };
        formsTemplateDetailsResponse?.data?.formDetails_query?.formsData.forEach(
          (item: any) => {
            if (!workflowEnabled) {
              switch (item.elementId) {
                case FIXED_FIELDS.STATUS: {
                  wfDisabledObj.status = item.value;
                  break;
                }
                case FIXED_FIELDS.ASSIGNEE: {
                  //this is the format in which Assignee Select component expects
                  const mappedValues = item?.value.map((v: any) => {
                    return {
                      user: {
                        ...v,
                      },
                      assignee: v.id,
                    };
                  });
                  wfDisabledObj.assignees = mappedValues;
                  break;
                }
                case FIXED_FIELDS.DUE_DATE: {
                  wfDisabledObj.dueDate = item.value
                    ? item.value?.split("T")[0]
                    : item.value;
                }
              }
              setWorkflowDisabledFields(wfDisabledObj);
            }

            const newTemplate: FormFieldDetailsData =
              initalizeFormFieldDetailsData(item);
            formsDetailsData.push(newTemplate);
          }
        );
        if (
          formsTemplateDetailsResponse?.data?.formDetails_query?.isImported
        ) {
          setIsImported(true);
        }
        const versionId =
          formsTemplateDetailsResponse?.data?.formDetails_query
            ?.templateVersionId;
        setTemplateVersionId(versionId);
        setformTemplateDetailsData(formsDetailsData);
        formsDetailsData.forEach((formData: any) => {
          // get assignee and due date of active step
          if (formData.elementId === FIXED_FIELDS.DUE_DATE) {
            setActiveStepDueDate(formData.value);
          }

          if (formData.elementId === FIXED_FIELDS.PROJECT_AUTO_INCREMENT) {
            const featureId = Number(pathMatch.params.featureId);
            if (featureId === FeatureId.SUBMITTAL && submittalId.current) {
              setForminfo((prevState) => ({
                ...prevState,
                id: submittalId.current,
              }));
            } else {
              setForminfo((prevState) => ({
                ...prevState,
                id: `${formData.value ? formData.value : "--"}`,
              }));
            }
          }
          if (formData.elementId === FIXED_FIELDS.CREATED_BY) {
            const value: any = [];
            formData.value?.forEach((user: any) => {
              value.push(`${user?.firstName} ${user?.lastName}`);
            });
            setForminfo((prevState) => ({
              ...prevState,
              createdBy: value,
            }));
          }

          if (formData.elementId === FIXED_FIELDS.CREATED_AT) {
            setForminfo((prevState) => ({
              ...prevState,
              createdAt: moment(formData.value)
                .format("DD MMM YYYY hh:mm a")
                .toString(),
            }));
          }
          if (formData.elementId === FIXED_FIELDS.STATUS) {
            setForminfo((prevState) => ({
              ...prevState,
              status: formData.value ? formData.value.toString() : "",
            }));
          }
          if (formData.elementId === FIXED_FIELDS.SUBJECT) {
            setForminfo((prevState) => ({
              ...prevState,
              subject: formData.value ? formData.value.toString() : "",
            }));
          }
          if (formData.elementId === FIXED_FIELDS.DUE_DATE) {
            const dueDate = formData.value
              ? moment(formData.value).format("DD MMM YYYY").toString()
              : "- -";
            setForminfo((prevState) => ({
              ...prevState,
              dueDate,
            }));
          }
        });
      }
      setForminfo((p) => ({ ...p, status: formStatus }));
      if (
        formsTemplateDetailsResponse?.data?.formDetails_query.workflowData
          ?.activeSteps
      ) {
        const activeStepsData: Array<any> = [];
        formsTemplateDetailsResponse?.data?.formDetails_query.workflowData?.activeSteps.forEach(
          (item: any) => {
            const newTemplate: any = {
              stepName: item.stepName,
              stepType: item.stepType,
              stepDescription: item.stepDescription,
              incomingOutcome: item.incomingOutcome,
              outgoingOutcomes: item.outgoingOutcomes,
              projectStepAssignees: item.projectStepAssignees,
              featureStepAssignees: item.featureStepAssignees,
            };
            activeStepsData.push(newTemplate);
          }
        );
        setActiveStepAssignee(activeStepsData[0]?.featureStepAssignees);
        setStepName(activeStepsData[0].stepDescription);
        setActiveWorkFlowStepData(activeStepsData);
      }
    } catch (err: any) {
      console.log(err);
      dispatch(setIsLoading(false));
    }
  };

  const filterFormTemplate = (arr1: any, arr2: any) => {
    const res: any = [];
    let moved = false;
    arr1.forEach((ele: any) => {
      if (ele.fieldTypeId === InputType.TABLE) {
        res.push(ele);
        moved = true;
      }
      arr2.forEach((element: any) => {
        if (ele.elementId === element.elementId) {
          if (element.elementId === FIXED_FIELDS.COST_IMPACT) {
            ele.comment = element.costImpactComments;
          }
          if (element.elementId === FIXED_FIELDS.SCHEDULE_IMPACT) {
            ele.comment = element.scheduleImpactComments;
          }
          ele.value = element.value;
          res.push(ele);
          moved = true;
        }
      });
      if (!moved) {
        ele.value = "";
        res.push(ele);
      }
      moved = false;
    });
    const viewFormFields: Array<any> = [];
    res.forEach((item: any) => {
      if (item.fieldTypeId === InputType.TABLE) {
				item.width = 100;
				item.metaData = JSON.parse(JSON.stringify(item.metaData));
				const tableData = arr1.filter(
					(tabItem: any) => tabItem?.tableId === item.elementId
				);
				const targetRows: Array<any> = [];
				for (let i = 0; i < item.metaData.rowData.length; i++) {
					let rowData = JSON.parse(
						JSON.stringify(
							tableData.filter(
								(rowItem: any) => Math.floor(Number(rowItem.caption)) === i + 1
							)
						)
					);
					rowData.forEach((cellItem: any) => {
						const sequence = cellItem.caption.split('.');
						cellItem.sequence = Number(sequence[1]);
					});
					rowData = rowData.sort((a: any, b: any) => a.sequence - b.sequence);
					rowData.forEach((cellItem: any) => {
						const currentValue = res.find(
							(resItem: any) => resItem.elementId === cellItem.elementId
						);
						if (currentValue) {
							cellItem.value = currentValue.value;
						} else {
							if (
								cellItem.fieldTypeId === InputType.TEXT ||
								cellItem.fieldTypeId === InputType.LONGTEXT ||
								cellItem.fieldTypeId === InputType.TIMEPICKER ||
								cellItem.fieldTypeId === InputType.DATEPICKER ||
								cellItem.fieldTypeId === InputType.DATEPICKER ||
								cellItem.fieldTypeId === InputType.COMMENTS ||
								cellItem.fieldTypeId === InputType.INTEGER
							) {
								cellItem.value = '';
							} else {
								cellItem.value = [];
							}
						}
					});
					targetRows.push(rowData);
				}
				item.tableFields = targetRows;
				viewFormFields.push(item);
			} else if (
				item.fieldTypeId !== InputType.TABLE &&
				!item.tableId &&
				!(
          projectState?.currentFeature?.feature == 'Checklist' &&
					isImported &&
					formStatus === 'CLOSED' &&
					(item.fieldTypeId === InputType.SINGLEVALUEUSER ||
						item.fieldTypeId === InputType.DATEPICKER)
				)
			) {
				viewFormFields.push(item);
			}
    });
    viewFormFields.forEach((ele: any) => {
      if (
        ele.elementId === FIXED_FIELDS.RESPONSE &&
        activeWorkFlowStepData.length > 0
      ) {
        ele.value = activeWorkFlowStepData[0].incomingOutcome;
      }
    });
    setViewFormData(viewFormFields);
  };

  const handleCancel = () => {
    backToList();
  };

  const backToList = () => {
    if (pathMatch.params.id) {
      history.push(
        `/base/projects/${Number(pathMatch.params.id)}/form/${Number(
          pathMatch.params.featureId
        )}`
      );
    }
  };

  const viewWorkFlow = () => {
    setIsWorkflowOpen(true);
  };

  const closeWorkflow = () => {
    setIsWorkflowOpen(false);
  };

  // if current user is part of current step assignee then open review form
  const canReviewForm = () => {
    const users: any = activeStepAssignee.filter(
      (assignee: any) => assignee.assignee === decodeExchangeToken().userId
    );
    users.length > 0 ? setIsReviewForm(true) : setIsReviewForm(false);
  };

  const renderFieldBasedOnInput = (formItem: any, isTable = false) => {
    return (
      <div
        className={`${
          isTable
            ? "view-rfi-form__form-container__table-data"
            : "view-rfi-form__form-container__field-data"
        }`}
      >
        {formItem?.tableId ? (
          ""
        ) : (
          <div className="view-rfi-form__form-container__field-label">
            {formItem.caption} {formItem?.required ? " *" : ""}
          </div>
        )}
        <div className="view-rfi-form__form-container__form-value">
          {(() => {
            switch (formItem.fieldTypeId) {
              case InputType.TEXT: {
                return formItem.value ? (
                  <div className="view-rfi-form__form-container__form-value__text">
                    {formItem.value}
                  </div>
                ) : (
                  "-"
                );
              }
              case InputType.LONGTEXT: {
                return formItem.value ? (
                  <div className="view-rfi-form__form-container__form-value__long-text">
                    {formItem.value}
                  </div>
                ) : (
                  "-"
                );
              }
              case InputType.INTEGER: {
                return formItem.value ? (
                  <div className="view-rfi-form__form-container__form-value__number">
                    {Number(pathMatch.params.featureId) ===
                      FeatureId.SUBMITTAL &&
                    formItem.elementId === FIXED_FIELDS.PROJECT_AUTO_INCREMENT
                      ? submittalId.current
                      : formItem.value}
                  </div>
                ) : (
                  "-"
                );
              }
              case InputType.TIMEPICKER: {
                return formItem.value ? (
                  <div className="view-rfi-form__form-container__form-value__time">
                    {moment(formItem.value, "HH:mm:ss")
                      .format("hh:mm A")
                      .toString()}
                  </div>
                ) : (
                  "-"
                );
              }
              case InputType.DATEPICKER: {
                return formItem.value ? (
                  <div className="view-rfi-form__form-container__form-value__time">
                    {moment(formItem.value).format("DD MMM YYYY").toString()}
                  </div>
                ) : (
                  "-"
                );
              }
              case InputType.DATETIMEPICKER: {
                return formItem.value && formItem.value.length > 0 ? (
                  <div className="view-rfi-form__form-container__form-value__time">
                    {moment(formItem.value)
                      .format("DD MMM YYYY hh:mm A")
                      .toString()}
                  </div>
                ) : (
                  "-"
                );
              }
              case InputType.BOOLEAN: {
                if (
                  formItem.elementId === FIXED_FIELDS.COST_IMPACT ||
                  formItem.elementId === FIXED_FIELDS.SCHEDULE_IMPACT
                ) {
                  return (
                    <div className="view-rfi-form__form-container__form-value__boolean">
                      <div className="view-rfi-form__form-container__form-value__boolean__value">
                        {formItem?.value?.toString() === "true"
                          ? "Yes"
                          : formItem?.value?.toString() === "false"
                          ? "No"
                          : "To be determined"}
                      </div>
                      {formItem.comment && (
                        <div className="view-rfi-form__form-container__form-value__boolean__comment">
                          {formItem.comment}
                        </div>
                      )}
                    </div>
                  );
                } else {
                  return (
                    <div className="view-rfi-form__form-container__form-value__boolean">
                      {formItem?.value?.toString() === "true"
                        ? "Yes"
                        : formItem?.value?.toString() === "false"
                        ? "No"
                        : "-"}
                    </div>
                  );
                }
              }
              case InputType.LOCATION: {
                return formItem.value ? (
                  <div className="view-rfi-form__form-container__form-value__location">
                    {formItem.value?.toString()}
                  </div>
                ) : (
                  "-"
                );
              }
              case InputType.CUSTOMDROPDOWN: {
                return formItem.value?.length > 0 ? (
                  <div className="view-rfi-form__form-container__form-value__lists">
                    {formItem.value.map((lists: any) => (
                      <div key={lists.configReferenceId}>
                        {[...lists.configValue].reverse().join(">")}
                      </div>
                    ))}
                  </div>
                ) : (
                  "-"
                );
              }

              case InputType.LOCATIONTREE: {
                return formItem.value?.length > 0 ? (
                  <div className="view-rfi-form__form-container__form-value__lists">
                    {formItem.value.map((lists: any) => (
                      <div key={lists.locationReferenceId}>
                        {[...lists.locationValue].reverse().join(">")}
                      </div>
                    ))}
                  </div>
                ) : (
                  "-"
                );
              }

              case InputType.CUSTOMNESTEDDROPDOWN: {
                return formItem.value?.length > 0 ? (
                  <div className="view-rfi-form__form-container__form-value__list">
                    {formItem.value.map((lists: any) => (
                      <div
                        key={lists?.configReferenceId}
                        className="view-rfi-form__form-container__form-value__multi-user__wrapper"
                      >
                        {lists.configValue.toString()}
                      </div>
                    ))}
                  </div>
                ) : (
                  "-"
                );
              }

              case InputType.COMMENTS: {
                return (
                  <div className="view-rfi-form__form-container__form-value__lists"></div>
                );
              }
              case InputType.MULTIVALUEUSER:
              case InputType.SINGLEVALUEUSER: {
                return formItem.value?.length > 0 ? (
                  <div className="view-rfi-form__form-container__form-value__multi-user">
                    {formItem.value.map((user: any) => (
                      <div
                        key={user?.id}
                        className="view-rfi-form__form-container__form-value__multi-user__wrapper"
                      >
                        {user?.id && (
                          <Chip
                            className="chips"
                            avatar={
                              <Avatar
                                alt={
                                  user?.firstName
                                    ? `${user?.firstName} ${user?.lastName}`
                                    : user?.email
                                }
                                src="/static/images/avatar/1.jpg"
                              />
                            }
                            label={
                              user?.firstName
                                ? `${user?.firstName} ${user?.lastName}`
                                : user?.email
                            }
                          />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  "-"
                );
              }
              case InputType.MULTIVALUECOMPANY:
              case InputType.SINGLEVALUECOMPANY: {
                return formItem.value?.length > 0 ? (
                  <div className="view-rfi-form__form-container__form-value__multi-company">
                    {formItem.value?.map((company: any) => (
                      <div
                        key={company?.id}
                        className="view-rfi-form__form-container__form-value__multi-company__wrapper"
                      >
                        <Chip
                          className="chips"
                          avatar={
                            <Avatar
                              alt={`${company.name}`}
                              src="/static/images/avatar/1.jpg"
                            />
                          }
                          label={`${company.name}`}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  "-"
                );
              }
              case InputType.ATTACHMENT: {
                return formItem.value.length > 0 ? (
                  <div className="view-rfi-form__form-container__form-value__file-attachment">
                    {formItem.value?.map((file: any, index: number) => (
                      <div
                        key={`${file?.fileName}-${index}`}
                        className="view-rfi-form__form-container__form-value__file-attachment__file"
                      >
                        <div className="view-rfi-form__form-container__form-value__file-attachment__file__thumbnail">
                          {/* <img src={file.preview} /> */}
                          <DescriptionIcon />
                        </div>
                        <div className="view-rfi-form__form-container__form-value__file-attachment__file__fileName">
                          <div>{file?.fileName}</div>
                          <div className="view-rfi-form__form-container__form-value__file-attachment__file__fileSize">
                            {(file?.fileSize / (1024 * 1024)).toFixed(3)} MB
                          </div>
                        </div>
                        <div className="view-rfi-form__form-container__form-value__file-attachment__file__fileRemove">
                          <a
                            className="view-rfi-form__form-container__form-value__file-attachment__file__link"
                            href={file?.url}
                          >
                            <GetAppIcon />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  "No Attachments"
                );
              }

              case InputType.LINKEDFORMS:{
                return(
                  <div className="view-rfi-form__form-container__form-value__linkedForms"> 
                  <IssueLogProjectDetail issueLogProjectFormData = {issueLogsProjectData}/>
                  </div> 
                )}
                
                case InputType.SECTION:{
                  return(
                    <div className="view-rfi-form__form-container__form-value__section"> 
                    <SectionDetail projectSectionInfo = {projectCheckListInfo}/>
                    </div>
                  )}
                  case InputType.ASSETTYPES:{
                    return formItem.value?.length > 0 ? (
                      <ul className="view-rfi-form__form-container__form-value__asset">
                        {formItem.value.map((lists: any) => (
                            <li key={lists.locationReferenceId}>
                            {[...lists.locationValue].reverse().join(">")}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      "-"
                    );
                  }
              default:
                return null;
            }
          })()}
        </div>
      </div>
    );
  };

  const setFollers = () => {
    // do nothing
  };

  //fetch history activity

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
        setCurrentTab(ViewTab.Activity);
      }
      dispatch(setIsLoading(false));
    } catch (err: any) {
      console.log(err);
      dispatch(setIsLoading(false));
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
          targetList[index].deleted = true;
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
      console.log(error.message);
    }
  };

  return (
    <FormHoc>
      {projectState?.featurePermissions?.canViewForm ? (
        <div className="view-wrapper">
          {!inValidForm ? (
            <>
              {workflowEnabled ? (
                <div className="view-nav">
                  <div className="view-nav__header">
                    <div className="view-nav__header__rfi-header">
                      <NavInfo forminfo={forminfo} />
                    </div>
                  </div>
                  <div className="view-nav__action">
                    <div className="view-nav__action__form-header">
                      <Header
                        header={`${
                          forminfo?.subject
                            ? forminfo?.subject
                            : projectState?.currentFeature?.feature || ""
                        }`}
                        navigate={handleCancel}
                      />
                    </div>
                    <div className="view-nav__action__right__workFLow">
                      {projectState?.featurePermissions?.canViewForm &&
                      forminfo.status !== "CLOSED" ? (
                        <div className="edit-nav__action__followers">
                          <FollowerSelect
                            type={FollowerTye.VIEW}
                            setValue={setFollers}
                            refresh={refreshed}
                            clear={() => setRefreshed(false)}
                          />
                        </div>
                      ) : (
                        ""
                      )}
                      <Button
                        className="view-nav__action__right__workFLow"
                        onClick={viewWorkFlow}
                      >
                        <VisibilityIcon className="view-nav__action__right__workFLow__icon" />
                        <span>View WorkFlow</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ) : workflowEnabled === false ? (
                <div>
                  <div className="view-wrapper_wowf_header">
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
                  <div className="view-wrapper_wowf_infoBar">
                    <InfoBar {...forminfo} status={formStatus} isImported={isImported} />
                    {projectState?.featurePermissions?.canViewForm &&
                      forminfo.status !== "CLOSED" && (
                        <div className="edit-nav__action__followers">
                          <FollowerSelect
                            type={FollowerTye.VIEW}
                            setValue={setFollers}
                            refresh={refreshed}
                            clear={() => setRefreshed(false)}
                          />
                        </div>
                      )}
                  </div>
                  <ControlBar
                    {...workflowDisabledFields}
                    statusListOptions={statusListOptions}
                    disabled={true}
                  />
                </div>
              ) : (
                <div className="view-wrapper_wowf_header">
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
              )}
              <div className="view-rfi-form">
                <Grid
                  container
                  direction={"row-reverse"}
                  className="view-rfi-form__form-container"
                >
                  <Grid item md={12} sm={12}>
                    <div className="view-rfi-form__form-wrapper">
                      {workflowEnabled && stepName && (
                        <div className="view-rfi-form__form-info">
                          <div className="view-rfi-form__form-info__field">
                            <div className="view-rfi-form__form-info__field__label">
                              Current workflow step
                            </div>
                            <div className="view-rfi-form__form-info__field__value">
                              {stepName}
                            </div>
                          </div>
                          <div className="view-rfi-form__form-info__field">
                            <div className="view-rfi-form__form-info__field__label">
                              Current Assignee:
                            </div>
                            <div className="view-rfi-form__form-info__field__value">
                              <ProjectUserDetails users={activeStepAssignee} />
                            </div>
                          </div>
                          <div className="view-rfi-form__form-info__field">
                            <div className="view-rfi-form__form-info__field__label">
                              Current step Status
                            </div>
                            <div className="view-rfi-form__form-info__field__value">
                              {forminfo.status}
                            </div>
                          </div>
                          <div className="view-rfi-form__form-info__field">
                            <div className="view-rfi-form__form-info__field__label">
                              Current Step Due
                            </div>
                            <div className="view-rfi-form__form-info__field__value">
                              {forminfo?.status !== "CLOSED"
                                ? moment(activeStepDueDate)
                                    .format("DD MMM YYYY")
                                    .toString()
                                : "--"}
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="view-rfi-form__form-container__main__form-fields">
                        <Grid container>
                          {viewFormData?.map((formItem: any) =>
                            hiddenViewFields.indexOf(formItem.elementId) ===
                            -1 ? (
                              <Grid
                                key={formItem.elementId}
                                className="view-rfi-form__form-container__field-wrapper"
                                item
                                sm={formItem.width === 50 ? 6 : 12}
                                xs={12}
                              >
                                {formItem.fieldTypeId === InputType.TABLE ? (
                                  <div className="featureFormTable">
                                    <div className="featureFormTable__caption">
                                      {formItem.caption}
                                    </div>
                                    <table className="featureFormTable__table">
                                      <thead>
                                        {formItem.metaData?.numbered ? (
                                          <th className="featureFormTable__table__headerSlno">
                                            Slno.
                                          </th>
                                        ) : (
                                          ""
                                        )}
                                        <th className="featureFormTable__table__headcell">
                                          {formItem.metaData.index}
                                        </th>
                                        {formItem.metaData.colData.map(
                                          (headCellItem: any) => (
                                            <th className="featureFormTable__table__headcell">
                                              {headCellItem.caption}{" "}
                                              {headCellItem?.required
                                                ? " *"
                                                : ""}
                                            </th>
                                          )
                                        )}
                                      </thead>
                                      <tbody>
                                        {formItem?.tableFields.map(
                                          (rowItem: any, index: number) => (
                                            <tr key={`row-${index}`}>
                                              {formItem.metaData?.numbered ? (
                                                <td className="featureFormTable__table__cellSlno">
                                                  {index + 1}
                                                </td>
                                              ) : (
                                                ""
                                              )}
                                              <td className="featureFormTable__table__cell">
                                                {
                                                  formItem.metaData.rowData[
                                                    index
                                                  ].caption
                                                }
                                              </td>
                                              {rowItem.map((cellItem: any) => (
                                                <td
                                                  className="featureFormTable__table__cell"
                                                  key={`table-cell-${cellItem.elementId}`}
                                                >
                                                  {renderFieldBasedOnInput(
                                                    cellItem,
                                                    true
                                                  )}
                                                </td>
                                              ))}
                                            </tr>
                                          )
                                        )}
                                      </tbody>
                                    </table>
                                  </div>
                                ) : (
                                  <>{renderFieldBasedOnInput(formItem)}</>
                                )}
                              </Grid>
                            ) : (
                              ""
                            )
                          )}
                        </Grid>
                      </div>
                      <div className="view-rfi-form__form-container__links">
                        <Grid item xs={12}>
                          <LinkInput
                            setValue={setLinkValues}
                            status={forminfo.status}
                            linkValues={links}
                            type={LinkType.VIEW}
                            updateLinkList={getFormLinks}
                            subjectValue={forminfo.subject}
                          />
                        </Grid>
                      </div>
                      {workflowEnabled && (
                        <div>
                          <WorkflowDetails
                            workFLowStepsData={workFLowStepsData}
                            viewWorkFlow={viewWorkFlow}
                          />
                        </div>
                      )}
                      <div className="view-rfi-form__form-comments">
                        <div className="view-rfi-form__form-comments__commentaction">
                          {/* {projectState?.featurePermissions?.canViewForm &&
                            forminfo.status !== "CLOSED" && ( */}
                          <label
                            className={`${
                              currentTab === ViewTab.Comments
                                ? "view-rfi-form__form-comments__commentaction__active"
                                : ""
                            }
                                                                                view-rfi-form__form-comments__commentaction__tab`}
                            onClick={() => setCurrentTab(ViewTab.Comments)}
                          >
                            Comments
                          </label>
                          <label
                            className={`${
                              currentTab === ViewTab.Activity
                                ? "view-rfi-form__form-comments__commentaction__active"
                                : ""
                            }
                                                                    view-rfi-form__form-comments__commentaction__tab`}
                            onClick={() => setCurrentTab(ViewTab.Activity)}
                          >
                            Activity
                          </label>
                        </div>
                        {currentTab === ViewTab.Comments ? (
                          <CommentSection active={false} />
                        ) : (
                          <HistoryAction
                            historyData={historyData}
                            commentsHistoryData={commentsHistoryData}
                          />
                        )}
                      </div>
                    </div>
                  </Grid>
                </Grid>
              </div>
              {workflowEnabled && (
                <workFlowContext.Provider
                  value={{ workFlowState, workFlowDispatch }}
                >
                  {isWorkflowOpen ? (
                    <div className="view-wrapper__workflow-wrapper">
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
        <div className="noViewPermission">
          <div className="noCreatePermission__header">
            <Header header={"Back"} navigate={handleCancel} />
          </div>
          <div className="no-permission">
            <NoDataMessage message={noPermissionRoleMessage} />
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
    </FormHoc>
  );
}
