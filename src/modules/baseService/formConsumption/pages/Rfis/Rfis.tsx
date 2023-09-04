import React, { ReactElement, useContext, useEffect, useState } from "react";
import RfiAction from "../../components/RfiAction/RfiAction";
import RfiTable from "../../components/RfiTable/RfiTable";
import { useHistory, useRouteMatch, match } from "react-router-dom";

import "./Rfis.scss";
import {
  DELETE_RFI_FORM,
  FETCH_FORM_TEMPLATE_VIEW,
  FETCH_TEMPLATE_COLUMN_CONFIG,
  LOAD_FILTERS_LIST_FORM,
} from "../../graphql/queries/rfi";
import { stateContext } from "../../../../root/context/authentication/authContext";
import { setIsLoading } from "../../../../root/context/authentication/action";
import { client } from "../../../../../services/graphql";
import NoDataMessage from "../../../../shared/components/NoDataMessage/NoDataMessage";
import Notification, {
  AlertTypes,
} from "../../../../shared/components/Toaster/Toaster";
import { Filter } from "../../components/Filter/Filter";
import { projectContext } from "../../Context/projectContext";
import {
  refreshFeaturesList,
  setActiveFilterData,
  setFilter,
  setFilterData,
  setFilterOptions,
  setFormCategoryOption,
  setActivePageNumber,
  setActivePageLimit,
} from "../../Context/projectActions";
import {
  FIXED_FIELDS,
  FormOptionType,
  InputType,
} from "../../../../../utils/constants";
import moment from "moment";
import { featureFormRoles } from "../../../../../utils/role";
import { intializeFormFieldData } from "../../utils/formHelper";
import { FormFieldData } from "../../models/form";
import { Grid } from "@material-ui/core";
import TableRowsSelectionPerPage from "../../../../shared/components/TableRowsSelectionPerPage/TableRowsSelectionPerPage";
import TablePagination from "../../../../shared/components/TablePagination/TablePagination";
import { useDebounce } from "../../../../../customhooks/useDebounce";
import { decodeToken } from "src/services/authservice";
import { v4 as uuidv4 } from "uuid";
import { Order } from "src/utils/helper";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";

export interface Params {
  id: string;
  featureId: string;
}

const noPermissionMessage = "You don't have permission to view forms";
let queryId = "";

export default function Rfis(): ReactElement {
  const { dispatch, state }: any = useContext(stateContext);
  const pathMatch: match<Params> = useRouteMatch();
  const history = useHistory();
  const [formData, setFormData] = useState<Array<any>>([]);
  const [workflowEnabled, setWorkflowEnabled] = useState(false);
  const [columnConfigData, setColumnConfigData] = useState<Array<any>>([]);
  const [formTemplateData, setFormTemplateData] = useState<Array<any>>([]);
  const [originalFormData, setOriginalFormData] = useState<Array<any>>([]);
  const [headerArray, setHeaderArray] = useState<Array<any>>([]);
  const { projectState, projectDispatch }: any = useContext(projectContext);
  const [searchName, setSearchName] = useState("");
  const [optionsCount, setOptionsCount] = useState(0);
  const [limit, setLimit] = useState(10);
  const [pageNo, setPageNo] = useState(1);
  const [totalRecords, setTotalRecords] = useState(-1);
  const debounceName = useDebounce(searchName, 700);
  const [isFetchingData, setIsFetchingData] = useState(true);
  const [order, setOrder] = React.useState<Order>("desc");
  const [orderBy, setOrderBy] = React.useState<keyof any>("");

  useEffect(() => {
    if (projectState.currentFeature) {
      projectDispatch(setActivePageNumber(projectState.activePageNumber));
      setTotalRecords(projectState.currentFeature.count);
      setFormData([]);
      setHeaderArray([]);
      setColumnConfigData([]);
      setFormTemplateData([]);
      setOriginalFormData([]);
    }
  }, [projectState.currentFeature]);

  useEffect(() => {
    if (
      state?.selectedProjectToken &&
      projectState &&
      projectState?.featurePermissions?.canViewForm &&
      projectState.currentFeature
    ) {
      setFormData([]);
      setColumnConfigData([]);
      setFormTemplateData([]);
      setOriginalFormData([]);
      setIsFetchingData(true);
      if (projectState.activeFilterData.length > 0) {
        setOptionsCount(
          projectState.activeFilterData.filter(
            (item: any) => item.elementId !== FIXED_FIELDS.SUBJECT
          ).length
        );
        applyFilter();
        if (headerArray.length === 0) {
          fetchColumnCOnfigAndFormTemplate();
        }
      } else {
        fetchInitialData();
        setOptionsCount(0);
      }
    }
  }, [
    state?.selectedProjectToken,
    projectState.activePageLimit,
    projectState.activePageNumber,
    order,
    orderBy,
    projectState.activeFilterData,
    projectState.currentFeature,
  ]);

  useEffect(() => {
    return () => {
      projectDispatch(setFilter(false));
      const options = [...projectState.filterOptions];
      options.forEach((item: any) => {
        item.isOpen = false;
      });
      projectDispatch(setFilterOptions(options));
      queryId = "";
    };
  }, [state?.selectedProjectToken]);

  useEffect(() => {
    if (formTemplateData.length > 0) {
      filterHeader();
    }
  }, [columnConfigData, formTemplateData]);

  useEffect(() => {
    const urlparams: any = new URLSearchParams(window.location.search);
    for (const param of urlparams) {
      if (param.includes("status")) {
        projectDispatch(
          setFilterData([
            {
              elementId: FIXED_FIELDS.STATUS,
              caption: "Status",
              fieldTypeId: InputType.TEXT,
              values: [param[1].toUpperCase()],
              isEdited: true,
            },
          ])
        );
      }
    }
  }, []);

  useEffect(() => {
    const activeFilters = projectState.filterData.filter(
      (item: any) => item.isEdited
    );
    if (
      JSON.stringify(activeFilters) !==
      JSON.stringify(projectState.activeFilterData)
    ) {
      projectDispatch(
        setActiveFilterData(JSON.parse(JSON.stringify(activeFilters)))
      );
    }
  }, [projectState.filterData]);

  useEffect(() => {
    const activeFilters = JSON.parse(JSON.stringify(projectState.filterData));
    const subjectFilter = activeFilters.find(
      (item: any) => item.elementId === FIXED_FIELDS.SUBJECT
    );
    projectDispatch(setActivePageNumber(projectState.activePageNumber));
    let changed = false;
    if (debounceName.trim()) {
      if (subjectFilter) {
        const index = activeFilters.indexOf(subjectFilter);
        if (index > -1) {
          activeFilters[index].values = debounceName.trim() ? debounceName : "";
          changed = true;
        }
      } else {
        activeFilters.push({
          elementId: FIXED_FIELDS.SUBJECT,
          caption: "Subject",
          fieldTypeId: InputType.TEXT,
          values: debounceName.trim() ? debounceName : "",
          isEdited: true,
        });
        changed = true;
      }
    } else {
      const index = activeFilters.indexOf(subjectFilter);
      if (index > -1) {
        activeFilters.splice(index, 1);
        changed = true;
      }
    }
    if (changed) {
      projectDispatch(setFilterData(activeFilters));
    }
  }, [debounceName]);

  useEffect(() => {
    projectDispatch(refreshFeaturesList(true));
  }, [pathMatch.params.featureId]);

  const handleSortRequest = (property: string) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const fetchInitialData = async () => {
    try {
      dispatch(setIsLoading(true));
      const promiseList = [];
      const queryInstanceId = uuidv4();
      queryId = queryInstanceId;
      promiseList.push(
        client.query({
          query: FETCH_TEMPLATE_COLUMN_CONFIG,
          variables: { featureId: Number(pathMatch.params.featureId) },
          fetchPolicy: "network-only",
          context: {
            role: featureFormRoles.viewForm,
            token: state?.selectedProjectToken,
            feature: pathMatch.params.featureId,
          },
        })
      );
      promiseList.push(
        client.query({
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
        })
      );
      promiseList.push(
        client.query({
          query: LOAD_FILTERS_LIST_FORM,
          variables: {
            featureId: Number(pathMatch.params.featureId),
            filterData: [],
            limit: projectState.activePageLimit,
            offset:
              projectState.activePageLimit * projectState.activePageNumber -
              projectState.activePageLimit,
            order: order,
            orderBy: orderBy,
          },
          fetchPolicy: "network-only",
          context: {
            role: featureFormRoles.viewForm,
            token: state?.selectedProjectToken,
            feature: pathMatch.params.featureId,
          },
        })
      );
      const responseData = await Promise.all(promiseList);
      if (responseData.length === 3) {
        getTemplateColumnConfigLists(responseData[0]);
        getFormTemplate(responseData[1]);
        getListForm(responseData[2], queryInstanceId);
      }
      dispatch(setIsLoading(false));
    } catch (error) {
      console.log(error);
      dispatch(setIsLoading(false));
    }
  };

  // fetch template column list
  const getTemplateColumnConfigLists = (TemplateColumnListResponse: any) => {
    if (TemplateColumnListResponse.data?.formTemplates.length > 0) {
      const columnConfigListData: Array<any> = [];
      TemplateColumnListResponse.data?.formTemplates[0]?.templateColumnConfigurations.forEach(
        (item: any) => {
          const newTemplate: any = {
            elementId: item.elementId,
            fixed: item.fixed,
            sequence: item.sequence,
          };
          columnConfigListData.push(newTemplate);
        }
      );
      setColumnConfigData(columnConfigListData);
    }
    dispatch(setIsLoading(false));
  };

  // fetch form template
  const getFormTemplate = (formsTemplateResponse: any) => {
    const templateAssociation =
      formsTemplateResponse?.data?.projectTemplateAssociation[0];
    const formTemplateVersions =
      templateAssociation.formTemplate.formTemplateVersions;
    setWorkflowEnabled(templateAssociation.workflowEnabled);
    if (
      formTemplateVersions[formTemplateVersions.length - 1]
        .formTemplateFieldData
    ) {
      const formsData: Array<any> = [];
      formTemplateVersions[
        formTemplateVersions.length - 1
      ].formTemplateFieldData.forEach((item: any) => {
        const newTemplate: FormFieldData = intializeFormFieldData(item);
        formsData.push(newTemplate);
      });
      setFormTemplateData(formsData);
    }
  };

  // fetch formData list
  const getListForm = async (
    FormListsResponse: any,
    queryInstanceId: string
  ) => {
    try {
      if (
        (queryInstanceId == queryId || !queryId) &&
        FormListsResponse.data?.listForms_query
      ) {
        const projectListData: Array<any> = [];
        setTotalRecords(FormListsResponse.data?.listForms_query.count || 0);
        const data = JSON.parse(
          JSON.stringify(FormListsResponse.data?.listForms_query.data)
        );
        data.forEach((item: any) => {
          const currentStep =
            item?.workflowData?.activeSteps?.length > 0
              ? item?.workflowData.activeSteps[0].stepDescription
              : "--";
          const newTemplate: any = {
            formsData: item.formsData,
            id: item.id,
            workFlow: currentStep,
            submittalId: item?.submittalId,
            formState: item.formState,
          };
          projectListData.push(newTemplate);
        });
        setFormData(projectListData);
        setOriginalFormData(projectListData);
      }
      dispatch(setIsLoading(false));
      setIsFetchingData(false);
    } catch (error: any) {
      console.log(error);
    }
  };

  const sortFunctionOnSequence = (a: any, b: any) => {
    let comparison = 0;

    if (a.sequence > b.sequence) {
      comparison = 1;
    } else if (a.sequence < b.sequence) {
      comparison = -1;
    }
    return comparison;
  };

  const filterHeader = () => {
    const headerColumnsArray: any = [];
    const filterOptionsArray: any = [];

    formTemplateData.forEach((templateItem: any, index: number) => {
      if (
        templateItem.elementId === FIXED_FIELDS.SUBJECT &&
        templateItem?.metaData?.caption
      ) {
        templateItem.caption = templateItem?.metaData?.caption;
      }
      if (templateItem.filterable) {
        templateItem.isOpen = false;
        filterOptionsArray.push(templateItem);
      }
      if (columnConfigData.length > 0) {
        columnConfigData.forEach((columnConfig: any) => {
          if (
            templateItem.elementId === columnConfig.elementId &&
            !templateItem.tableId &&
            templateItem.fieldTypeId !== InputType.TABLE
          ) {
            templateItem.sequence = columnConfig.sequence;
            headerColumnsArray.push(templateItem);
          }
        });
      } else {
        if (
          !templateItem.tableId &&
          templateItem.fieldTypeId !== InputType.TABLE
        ) {
          templateItem.sequence = index + 1;
          headerColumnsArray.push(templateItem);
        }
      }
    });
    const filterOptionsData = filterOptionsArray.sort(sortFunctionOnSequence);

    if (
      filterOptionsData.map((item: any) => item.elementId).join(",") !==
      projectState.filterOptions.map((item: any) => item.elementId).join(",")
    ) {
      projectDispatch(setFilterOptions(filterOptionsData));
    }
    setHeaderArray(headerColumnsArray.sort(sortFunctionOnSequence));
  };

  //route to new edit page
  const editFormDetails = (formId: number) => {
    if (pathMatch.params.id) {
      const path = `/base/projects/${Number(pathMatch.params.id)}/form/${Number(
        pathMatch.params.featureId
      )}/edit/${formId}`;
      history.push(path);
    }
  };

  const viewRfiForm = (formId: number) => {
    if (pathMatch.params.id) {
      history.push(
        `/base/projects/${Number(pathMatch.params.id)}/form/${Number(
          pathMatch.params.featureId
        )}/view/${formId}`
      );
    }
  };

  const handleDeleteRFI = (formId: number) => {
    deleteRfiForm(formId);
  };

  const refreshList = () => {
    fetchInitialData();
  };

  const deleteRfiForm = async (formId: number) => {
    try {
      dispatch(setIsLoading(true));
      await client.mutate({
        mutation: DELETE_RFI_FORM,
        variables: {
          formId: formId,
        },
        context: {
          role: featureFormRoles.deleteForm,
          token: state?.selectedProjectToken,
        },
      });
      dispatch(setIsLoading(false));
      Notification.sendNotification(
        "Form deleted successfully",
        AlertTypes.success
      );
      projectDispatch(refreshFeaturesList(true));
      refreshList();
    } catch (err: any) {
      dispatch(setIsLoading(false));
      Notification.sendNotification(err, AlertTypes.warn);
      console.log(err);
    }
  };

  const getFilterPayLoad = (): Array<any> => {
    const returnValue: Array<any> = [];
    projectState.activeFilterData.forEach((field: any) => {
      switch (field.fieldTypeId) {
        case InputType.DATEPICKER:
        case InputType.TIMEPICKER:
        case InputType.DATETIMEPICKER: {
          const value = [];
          if (field.startDate && field.endDate && field.isEdited) {
            const startDate = new Date(
              new Date(field.startDate).getFullYear(),
              new Date(field.startDate).getMonth(),
              new Date(field.startDate).getDate(),
              0,
              0,
              0
            );
            const endDate = new Date(
              new Date(field.endDate).getFullYear(),
              new Date(field.endDate).getMonth(),
              new Date(field.endDate).getDate(),
              23,
              59,
              59
            );
            value.push(moment(startDate).format("YYYY-MM-DDTHH:MM:ss.SSS[Z]"));
            value.push(moment(endDate).format("YYYY-MM-DDTHH:MM:ss.SSS[Z]"));
          }
          if (value.length === 2) {
            const newValue = { elementId: field.elementId, value };
            returnValue.push(newValue);
          }
          break;
        }
        case InputType.SINGLEVALUECOMPANY:
        case InputType.SINGLEVALUEUSER:
        case InputType.MULTIVALUECOMPANY:
        case InputType.MULTIVALUEUSER:
        case InputType.INTEGER:
        case InputType.BOOLEAN: {
          if (field.values.length > 0) {
            const value =
              field.values.length === 1 ? field.values[0] : field.values;
            const newValue = { elementId: field.elementId, value };
            returnValue.push(newValue);
          }
          break;
        }
        case InputType.TEXT: {
          if (field.caption === "Status") {
            let value: any;
            if (field.values.length > 0) {
              value =
                field.values.length === 1 ? field.values[0] : field.values;
              const newValue = { elementId: field.elementId, value };
              returnValue.push(newValue);
            }
            break;
          } else {
            if (field.values) {
              const newValue = {
                elementId: field.elementId,
                value: field.values,
              };
              returnValue.push(newValue);
            }
            break;
          }
        }
        default:
          break;
      }
    });
    return returnValue;
  };

  const fetchColumnCOnfigAndFormTemplate = async () => {
    try {
      const promiseList = [];
      promiseList.push(
        client.query({
          query: FETCH_TEMPLATE_COLUMN_CONFIG,
          variables: { featureId: Number(pathMatch.params.featureId) },
          fetchPolicy: "network-only",
          context: {
            role: featureFormRoles.viewForm,
            token: state?.selectedProjectToken,
            feature: pathMatch.params.featureId,
          },
        })
      );
      promiseList.push(
        client.query({
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
        })
      );
      const responseData = await Promise.all(promiseList);
      if (responseData.length === 2) {
        getTemplateColumnConfigLists(responseData[0]);
        getFormTemplate(responseData[1]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const applyFilter = async () => {
    try {
      const queryInstanceId = uuidv4();
      queryId = queryInstanceId;
      const filterData = getFilterPayLoad();
      dispatch(setIsLoading(true));
      const responseData = await client.query({
        query: LOAD_FILTERS_LIST_FORM,
        variables: {
          featureId: Number(pathMatch.params.featureId),
          filterData,
          limit: projectState.activePageLimit,
          offset:
            projectState.activePageLimit * projectState.activePageNumber -
            projectState.activePageLimit,
          order: order,
          orderBy: orderBy,
        },
        fetchPolicy: "network-only",
        context: {
          role: featureFormRoles.viewForm,
          token: state?.selectedProjectToken,
        },
      });
      getListForm(responseData, queryInstanceId);
      dispatch(setIsLoading(false));
    } catch (error: any) {
      console.log(error.message);
      dispatch(setIsLoading(false));
    }
  };

  const changeInFormOptions = (argValues: any) => {
    const activeFilters = JSON.parse(JSON.stringify(projectState.filterData));
    projectDispatch(setActivePageNumber(projectState.activePageNumber));
    if (argValues.length > projectState.formCategoryOption.length) {
      // new Value added then add New Value to the filter
      if (argValues[argValues.length - 1] === FormOptionType.ASSIGNEdTOME) {
        const currentFilter = activeFilters.find(
          (item: any) => item.elementId === FIXED_FIELDS.ASSIGNEE
        );
        if (currentFilter) {
          const index = activeFilters.indexOf(currentFilter);
          activeFilters[index].values = [decodeToken().userId];
          activeFilters[index].isEdited = true;
        } else {
          activeFilters.push({
            elementId: FIXED_FIELDS.ASSIGNEE,
            caption: "Created by",
            fieldTypeId: InputType.SINGLEVALUEUSER,
            values: [decodeToken().userId],
            isEdited: true,
          });
        }
      } else {
        const currentFilter = activeFilters.find(
          (item: any) => item.elementId === FIXED_FIELDS.CREATED_BY
        );
        if (currentFilter) {
          const index = activeFilters.indexOf(currentFilter);
          activeFilters[index].values = [decodeToken().userId];
          activeFilters[index].isEdited = true;
        } else {
          activeFilters.push({
            elementId: FIXED_FIELDS.CREATED_BY,
            caption: "Assigned to",
            fieldTypeId: InputType.SINGLEVALUEUSER,
            values: [decodeToken().userId],
            isEdited: true,
          });
        }
      }
    } else {
      // A value is removed then remove the value from the filter
      const valueToBeRemoved = projectState.formCategoryOption.filter(
        (e: any) => !argValues.includes(e)
      );
      if (valueToBeRemoved.length > 0) {
        valueToBeRemoved.forEach((valueItem: string) => {
          if (valueItem === FormOptionType.CREATEDBYME) {
            const currentFilter = activeFilters.find(
              (item: any) => item.elementId === FIXED_FIELDS.CREATED_BY
            );
            if (currentFilter) {
              const index = activeFilters.indexOf(currentFilter);
              const userIndex = activeFilters[index].values.indexOf(
                decodeToken().userId
              );
              userIndex > -1
                ? activeFilters[index].values.splice(userIndex, 1)
                : null;
              if (activeFilters[index].values.length === 0) {
                activeFilters[index].isEdited = false;
              }
            }
          }
          if (valueItem === FormOptionType.ASSIGNEdTOME) {
            const currentFilter = activeFilters.find(
              (item: any) => item.elementId === FIXED_FIELDS.ASSIGNEE
            );
            if (currentFilter) {
              const index = activeFilters.indexOf(currentFilter);
              const userIndex = activeFilters[index].values.indexOf(
                decodeToken().userId
              );
              userIndex > -1
                ? activeFilters[index].values.splice(userIndex, 1)
                : null;
              if (activeFilters[index].values.length === 0) {
                activeFilters[index].isEdited = false;
              }
            }
          }
        });
      }
    }
    projectDispatch(setFilterData(activeFilters));
    projectDispatch(setFormCategoryOption(argValues.map((item: any) => item)));
  };

  const goBack = () => {
    history.goBack();
  };

  return (
    <div className="rfi-wrapper">
      <div className="rfi-wrapper__header">
        <ArrowBackIosIcon onClick={goBack} className="rfi-wrapper__backIcon" />
        {projectState?.currentFeature?.feature}
      </div>
      {projectState?.featurePermissions?.canViewForm ? (
        <>
          <RfiAction
            changeInFormoptions={(argValue: any) =>
              changeInFormOptions(argValue)
            }
            name={searchName}
            formOptionType={projectState.formCategoryOption}
            optionsCount={optionsCount}
            changeInSearchName={(argValue: string) => setSearchName(argValue)}
            getFilterPayload={getFilterPayLoad}
          />
          <div className="rfi-wrapper__body">
            <RfiTable
              editForm={editFormDetails}
              formData={formData}
              headerArray={headerArray}
              viewRfiForm={viewRfiForm}
              deleteRFI={handleDeleteRFI}
              refresh={refreshList}
              isFetchingData={isFetchingData}
              featureId={Number(pathMatch.params.featureId)}
              workflowEnabled={workflowEnabled}
              order={order}
              orderBy={orderBy}
              handleSortRequest={handleSortRequest}
            />
          </div>
          {totalRecords > 0 && (
            <Grid container spacing={2} className="rfi-wrapper__footer">
              <Grid item xs={5}>
                <span className="rfi-wrapper__label">Showing</span>
                {totalRecords === 0
                  ? 0
                  : projectState.activePageLimit *
                      projectState.activePageNumber -
                    projectState.activePageLimit +
                    1}{" "}
                -{" "}
                {projectState.activePageLimit * projectState.activePageNumber >
                totalRecords
                  ? totalRecords
                  : projectState.activePageLimit *
                    projectState.activePageNumber}{" "}
                of {totalRecords}
              </Grid>
              <Grid item xs={3}>
                <TableRowsSelectionPerPage
                  rowsPerPage={projectState.activePageLimit}
                  values={[5, 10, 15, 20, 50, 100]}
                  onChangeRowsPerPage={(e: any) => {
                    // setLimit(e.target.value);
                    const newLimit = e.target.value;
                    const newPageNumber =
                      Math.floor(
                        ((projectState.activePageNumber - 1) *
                          projectState.activePageLimit) /
                          newLimit
                      ) + 1;

                    projectDispatch(setActivePageLimit(newLimit));
                    projectDispatch(setActivePageNumber(newPageNumber));
                  }}
                />
              </Grid>
              <Grid item xs={4}>
                <TablePagination
                  count={
                    totalRecords > 0
                      ? Math.ceil(totalRecords / projectState.activePageLimit)
                      : 0
                  }
                  page={projectState.activePageNumber}
                  onChange={(e: any, value: number) => {
                    projectDispatch(setActivePageNumber(value));
                  }}
                />
              </Grid>
            </Grid>
          )}
        </>
      ) : !state.isLoading ? (
        <div className="no-permission">
          <NoDataMessage message={noPermissionMessage} />
        </div>
      ) : (
        ""
      )}

      {projectState?.showFilter ? <Filter /> : ""}
    </div>
  );
}
