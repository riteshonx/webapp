import React, {
  ReactElement,
  useState,
  useReducer,
  useContext,
  useEffect,
} from "react";
import { match, useHistory, useRouteMatch } from "react-router-dom";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import SearchIcon from "@material-ui/icons/Search";
import Button from "@material-ui/core/Button";
import EnhancedTable from "../../components/Table/FormsListTable";
import {
  templateReducer,
  templatesInitialState,
} from "../../context/templates/reducer";
import { templateContext } from "../../context/templates/context";
import {
  DELETE_TEMPLATE,
  LOAD_FORM_TEMPLATES,
} from "../../grqphql/queries/formTemplates";
import ProductFeature from "../../components/ProductFeature/ProductFeature";
import { stateContext } from "../../../../root/context/authentication/authContext";
import {
  setIsLoading,
  setPreviousFeature,
} from "../../../../root/context/authentication/action";
import { FormsRoles } from "../../../../../utils/role";
import {
  setCurrentFeature,
  setCurrentFeatureId,
  setStandardFroms,
  setTemplates,
} from "../../context/templates/action";
import TemplateAssociation from "../../components/TemplateAssociation/TemplateAssociation";
import {
  canCreateTemplate,
  canCreateProjectTemplateAssociation,
  canViewTemplates,
  canUpdateTemplates,
  canUpdateFormTemplateStatus,
} from "../../utils/permission";

import "./FormsList.scss";
import { useDebounce } from "../../../../../customhooks/useDebounce";
import Preview from "../../components/Preview/Preview";
import { Forms, ITemplate, TemplateData } from "../../models/template";
import {
  LOAD_PRODUCT_FEATURES,
  SET_DEFAULT_TEMPLATE,
  UNIQUE_FORM_FEATURE_NAME,
  UPDATE_PRODUCT_FEATURE,
} from "../../grqphql/queries/projectFeature";
import ConfirmDialog from "../../../../shared/components/ConfirmDialog/ConfirmDialog";
import ColumnConfiguration from "../../components/ColumnConfiguration/ColumnConfiguration";
import { client } from "../../../../../services/graphql";
import { InputType } from "../../../../../utils/constants";
import { v4 as uuidv4 } from "uuid";
import { IconButton } from "@material-ui/core";
import EditIcon from "@material-ui/icons/Edit";
import Notification, {
  AlertTypes,
} from "../../../../shared/components/Toaster/Toaster";
import StatusList from "../../components/StatusList/StatusList";

const confirmMessage = {
  header: "Delete Template",
  text: "Are you sure you want to delete the '{templateName}' template?",
  cancel: "Cancel",
  proceed: "Delete",
};

const templateDefaultMessage = {
  text: "You cannot delete a default template. Set another template as default and try again.",
  cancel: "Ok",
};

const templateDefaultAndAssociatedMessage = {
  text: `You cannot delete a default template. Set another template as default and try again.`,
  cancel: "Ok",
};

const templateAssociatedMessage = {
  text: `'{templateName}' template is associated to projects, please remove the association and try again.`,
  cancel: "Ok",
};

export interface Params {
  id: string;
}

export default function landing(): ReactElement {
  const { state, dispatch }: any = useContext(stateContext);
  const [templateState, templateDispatch] = useReducer(
    templateReducer,
    templatesInitialState
  );
  const history = useHistory();
  const [templateName, setTemplateName] = useState("");
  const debounceName = useDebounce(templateName, 700);
  const [openTemplateAssociation, setOpenTemplateAssociation] = useState(false);
  const [openStatusList, setOpenStatusList] = useState(false);
  const [preview, setPreview] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<any>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteData, setDeleteData] = useState<any>(null);
  const [columnOpen, setColumnOpen] = useState(false);
  const [columnData, setcolumnData] = useState<ITemplate>();
  const [dialogData, setDialogData] = useState<any>(null);
  const [columnsLists, setColumnsLists] = useState<Array<any>>([]);
  const [isEdited, setIsEdited] = useState(false);
  const [currentFeatureName, setcurrentFeatureName] = useState("");
  const [isCurrentFeatureDuplicate, setIsCurrentFeatureDuplicate] =
    useState(false);
  const [formNameRequired, setformNameRequired] = useState(false);
  const [isDirty, setisDirty] = useState(false);
  const debounceFeatureName = useDebounce(currentFeatureName, 300);
  const pathMatch: match<Params> = useRouteMatch();

  // 103 is the feature Id for 'Quality Control'
  const disableTemplateEdit =
    templateState.currentFeature?.name === "Quality Control";

  useEffect(() => {
    if (canViewTemplates) {
      fetchProductFeatures();
    }
  }, []);

  useEffect(() => {
    validateFormName();
  }, [debounceFeatureName]);

  /** Method to fetch the Templates in the selected feature */
  const fetchTemplates = () => {
    if (templateState.currentFeature) {
      getFormTemplateList();
    }
  };

  const validateFormName = async () => {
    try {
      const response = await client.query({
        query: UNIQUE_FORM_FEATURE_NAME,
        variables: {
          caption: `${debounceFeatureName.trim()}`,
        },
        fetchPolicy: "network-only",
        context: { role: FormsRoles.viewFormTemplate },
      });
      if (response.data.projectFeature.length > 0 && isEdited) {
        if (
          response.data.projectFeature[0].id !==
          templateState.currentFeature?.id
        ) {
          setIsCurrentFeatureDuplicate(true);
        } else {
          setIsCurrentFeatureDuplicate(false);
        }
      } else {
        setIsCurrentFeatureDuplicate(false);
      }
    } catch (error: any) {}
  };

  const fetchProductFeatures = async () => {
    try {
      dispatch(setIsLoading(true));
      const productFeatureResponse: any = await client.query({
        query: LOAD_PRODUCT_FEATURES,
        variables: {
          feature: `%%`,
          offset: 0,
          limit: 1000,
        },
        fetchPolicy: "network-only",
        context: { role: FormsRoles.viewFormTemplate },
      });
      const standardForms: Array<Forms> = [];
      if (productFeatureResponse.data.projectFeature) {
        productFeatureResponse.data.projectFeature.forEach((item: any) => {
          const form: Forms = {
            id: item.id,
            name: item?.caption || item.feature,
            templateCount: item.formTemplates.length,
            tenantId: item.tenantId,
            caption: item?.caption,
          };
          standardForms.push(form);
        });
      }
      templateDispatch(setStandardFroms(standardForms));
      if (pathMatch.params.id) {
        const selectedFeature = standardForms.filter(
          (item) => item.id === Number(pathMatch.params.id)
        );
        if (selectedFeature.length > 0) {
          templateDispatch(setCurrentFeature(selectedFeature[0]));
          templateDispatch(setCurrentFeatureId(selectedFeature[0].id));
        } else {
          templateDispatch(setCurrentFeature(standardForms[0]));
          dispatch(setPreviousFeature(standardForms[0].id));
          templateDispatch(setCurrentFeatureId(standardForms[0].id));
        }
        return;
      }
      if (state.previousFeature) {
        const selectedFeature = standardForms.filter(
          (item) => item.id === state.previousFeature
        );
        if (selectedFeature.length > 0) {
          templateDispatch(setCurrentFeature(selectedFeature[0]));
          templateDispatch(setCurrentFeatureId(selectedFeature[0].id));
        } else {
          templateDispatch(setCurrentFeature(standardForms[0]));
          dispatch(setPreviousFeature(standardForms[0].id));
          templateDispatch(setCurrentFeatureId(standardForms[0].id));
        }
      } else {
        if (standardForms.length > 0 && !templateState.currentFeature) {
          templateDispatch(setCurrentFeature(standardForms[0]));
          dispatch(setPreviousFeature(standardForms[0].id));
          templateDispatch(setCurrentFeatureId(standardForms[0].id));
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getFormTemplateList = async () => {
    try {
      dispatch(setIsLoading(true));
      const formTemplateListData: any = await client.query({
        query: LOAD_FORM_TEMPLATES,
        variables: {
          name: `%${debounceName}%`,
          featureId: templateState.currentFeature.id,
          offset: 0,
          limit: 1000,
        },
        fetchPolicy: "network-only",
        context: { role: FormsRoles.viewFormTemplate },
      });
      if (formTemplateListData?.data?.formTemplates) {
        const templateList: Array<ITemplate> = [];
        formTemplateListData.data.formTemplates.forEach((item: any) => {
          let fieldLength = 0;
          let dataList: Array<TemplateData> = [];
          if (item.formTemplateVersions.length > 0) {
            fieldLength =
              item.formTemplateVersions[0].formTemplateFieldData.filter(
                (item: any) => !item.autoGenerated
              ).length;
            item.formTemplateVersions[0].formTemplateFieldData.forEach(
              (templateItem: any) => {
                const newTemplate: TemplateData = {
                  id: uuidv4(),
                  fixed: templateItem.fixed,
                  caption: templateItem.caption,
                  required: templateItem.required ? 1 : 0,
                  sequence: templateItem.sequence,
                  elementId: templateItem.elementId,
                  fieldTypeId: templateItem.fieldTypeId,
                  width: templateItem.width === 100 ? 12 : 6,
                  configListId: -1,
                  originalCaption: templateItem.caption,
                  autoGenerated: templateItem?.autoGenerated || false,
                  duplicateCaption: false,
                  metadata: templateItem.metadata || null,
                };
                if (newTemplate.fieldTypeId === InputType.TABLE) {
                  newTemplate.width = 12;
                }
                dataList.push(newTemplate);
              }
            );
            dataList = dataList.sort((a, b) => {
              if (a.sequence < b.sequence) return -1;
              if (a.sequence > b.sequence) return 1;
              return 0;
            });
          }
          const newTemplate: ITemplate = {
            id: item.id,
            templateName: item.templateName,
            updatedAt: item.updatedAt,
            updatedBy: item.updatedByUser.firstName,
            featureId: item.featureId,
            createdAt: item.createdAt,
            createdBy: item.createdByUser.firstName,
            numberOfFields: fieldLength,
            default: item.default,
            templateData: dataList,
            noOfProjects: item.projectTemplateAssociations.length,
            systemGenerated: item.systemGenerated,
          };
          templateList.push(newTemplate);
        });
        templateDispatch(setTemplates(templateList));
        const standardFormsList = [...templateState.standardForms];
        if (standardFormsList && standardFormsList.length) {
          const standardForms = standardFormsList.map(
            (item: any, index: any) => {
              return item.name == templateState.currentFeature.name &&
                item.templateCount !== templateList.length
                ? { ...item, templateCount: templateList.length }
                : { ...item };
            }
          );
          templateDispatch(setStandardFroms(standardForms));
        }
      }
      dispatch(setIsLoading(false));
    } catch (error) {
      dispatch(setIsLoading(false));
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [templateState.currentFeature, debounceName]);

  /** Method to Navigate to the create template Page with current feature Id */
  const createNewForm = () => {
    history.push(`/base/forms/create/${templateState.currentFeature?.id}`);
  };

  /** Method to close the Template configuration Dialog */
  const closeTemplateAssociation = (argValue: boolean): void => {
    setOpenTemplateAssociation(false);
    if (argValue) {
      fetchTemplates();
    }
  };

  /**
   * Method is Invoked when the user clicks on the Preview template Option
   * Open the Preview sidebar to preview the Template fields
   * @param argItem : Itemplate
   */
  const showPreview = (argItem: ITemplate) => {
    setPreview(true);
    setPreviewTemplate(argItem);
  };

  /**
   * Method to close the Preview sidebar
   */
  const closePreview = () => {
    setPreview(false);
  };

  /**
   * Method Invoked user Clicks on the Make default template option the Template
   * Invoke makTemplateDefault mutation to set the selected template as default
   * @param argTemplate :ITemplate
   */
  const setTemplateAsDefault = async (argTemplate: ITemplate) => {
    if (!argTemplate.default) {
      try {
        dispatch(setIsLoading(true));
        const makeDefaultData: any = await client.mutate({
          mutation: SET_DEFAULT_TEMPLATE,
          variables: {
            featureId: templateState.currentFeature.id,
            templateId: argTemplate.id,
          },
          context: { role: FormsRoles.updateFormTemplate },
        });
        fetchTemplates();
        dispatch(setIsLoading(false));
      } catch (error) {
        dispatch(setIsLoading(false));
      }
    }
  };

  /**
   * Method is invoked when the user clicks on the configure Template option
   * Open the Configure Template Dialog
   * @param argTemplate :Itemplate
   */
  const configureTemplate = (argTemplate: ITemplate) => {
    setcolumnData(argTemplate);
    setColumnOpen(true);
  };

  const closeColumnCOnfigure = () => {
    setColumnOpen(false);
    setColumnsLists([]);
  };

  /**
   * This method is invoked when user clicks delete option the table
   * Open the confirmation dialog before Deleting the Template
   * @param argTemplate : ITemplate
   */
  const confirmDelete = (argTemplate: ITemplate) => {
    setDeleteData(argTemplate);
    if (
      argTemplate.noOfProjects > 0 &&
      (argTemplate.default || argTemplate.systemGenerated)
    ) {
      // Show exception that this template is default and associated to various projects
      const message = { ...templateDefaultAndAssociatedMessage };
      message.text = message.text
        .replace("{templateName}", argTemplate.templateName)
        .replace("{projects}", `${argTemplate.noOfProjects}`);
      setDialogData(message);
      setConfirmOpen(true);
      return;
    }
    if (argTemplate.noOfProjects > 0) {
      // Show exception that this template is associated to various projects
      const message = { ...templateAssociatedMessage };
      message.text = message.text
        .replace("{templateName}", argTemplate.templateName)
        .replace("{projects}", `${argTemplate.noOfProjects}`);
      setDialogData(message);
      setConfirmOpen(true);
      return;
    }
    if (argTemplate.default || argTemplate.systemGenerated) {
      // Show exception that this template is default
      const message = { ...templateDefaultMessage };
      message.text = message.text.replace(
        "{templateName}",
        argTemplate.templateName
      );
      setDialogData(message);
      setConfirmOpen(true);
      return;
    } else {
      const message = { ...confirmMessage };
      message.text = message.text.replace(
        "{templateName}",
        argTemplate.templateName
      );
      setDialogData(message);
      setConfirmOpen(true);
      return;
    }
  };

  /**
   * On confirming invoke the Delete template mutation
   */
  const deleteTemplate = async () => {
    try {
      dispatch(setIsLoading(true));
      setConfirmOpen(false);
      const deletedData: any = await client.mutate({
        mutation: DELETE_TEMPLATE,
        variables: {
          id: deleteData.id,
        },
        context: { role: FormsRoles.updateFormTemplateStatus },
      });
      setDeleteData(null);
      fetchTemplates();
      fetchProductFeatures();
      dispatch(setIsLoading(false));
    } catch (error) {
      dispatch(setIsLoading(false));
    }
  };

  const changeInSearchName = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    setTemplateName(e.target.value);
  };

  const editCurrentFeature = () => {
    setcurrentFeatureName(templateState.currentFeature?.name);
    setIsEdited(true);
  };

  const changeInCaption = (e: any) => {
    setisDirty(true);
    setcurrentFeatureName(e.target.value);
    if (!e.target.value.trim()) {
      setformNameRequired(true);
    } else {
      setformNameRequired(false);
    }
  };

  const cancelUpdate = () => {
    setIsEdited(false);
    setisDirty(false);
    setIsCurrentFeatureDuplicate(false);
  };

  const isSaveEnabled = (): boolean => {
    if (isEdited) {
      return (
        isCurrentFeatureDuplicate || !isDirty || !currentFeatureName.trim()
      );
    } else {
      return isCurrentFeatureDuplicate || !currentFeatureName.trim();
    }
  };

  const saveChanges = async () => {
    try {
      if (currentFeatureName.trim() !== templateState.currentFeature?.name) {
        dispatch(setIsLoading(true));
        await client.mutate({
          mutation: UPDATE_PRODUCT_FEATURE,
          variables: {
            caption: currentFeatureName.trim(),
            id: templateState.currentFeature?.id,
          },
          context: { role: FormsRoles.updateFormTemplateStatus },
        });
        fetchProductFeatures();
        Notification.sendNotification(
          "Form feature name is updated successfully",
          AlertTypes.success
        );
        setCurrentFeature({
          ...templateState.currentFeature,
          name: currentFeatureName.trim,
        });
        setIsEdited(false);
        dispatch(setIsLoading(false));
      } else {
        setIsEdited(false);
      }
    } catch (error: any) {
      dispatch(setIsLoading(false));
    }
  };

  return (
    <templateContext.Provider value={{ templateState, templateDispatch }}>
      <div className="formLanding">
        <Grid container className="formLanding__main">
          <Grid item xs={2}>
            <ProductFeature />
          </Grid>
          <Grid item xs={10} className="formLanding__main__item">
            <div className="formLanding__main__right">
              {canViewTemplates ? (
                <div className="formLanding__main__right__header">
                  {isEdited ? (
                    <div className="formLanding__main__right__header__section">
                      <TextField
                        data-testid="fornmname"
                        variant="outlined"
                        autoFocus={true}
                        className="formLanding__main__right__header__section__input"
                        onChange={changeInCaption}
                        value={currentFeatureName}
                        placeholder="Enter form name"
                      />
                      <Button
                        size="small"
                        disabled={isSaveEnabled()}
                        onClick={saveChanges}
                        className="btn-primary formLanding__main__right__header__section__savebtn"
                      >
                        Save
                      </Button>
                      <Button
                        size="small"
                        onClick={cancelUpdate}
                        className="btn-secondary formLanding__main__right__header__section__cancelbtn"
                      >
                        Cancel
                      </Button>
                      {formNameRequired ? (
                        <div
                          data-testid="fornmnameerror"
                          className="formLanding__main__right__header__section__error"
                        >
                          Form name is required
                        </div>
                      ) : isCurrentFeatureDuplicate ? (
                        <div
                          data-testid="fornmnameerror"
                          className="formLanding__main__right__header__section__error"
                        >
                          Form name already exists
                        </div>
                      ) : currentFeatureName.trim().length > 50 ? (
                        <div
                          data-testid="fornmnameMaxLengtherror"
                          className="formLanding__main__right__header__section__error"
                        >
                          Form name is too long (maximum is 50 charecters)
                        </div>
                      ) : (
                        ""
                      )}
                    </div>
                  ) : (
                    <div className="formLanding__main__right__header__edit">
                      {templateState.currentFeature
                        ? templateState.currentFeature?.name
                        : ""}
                      {state.isLoading
                        ? `(...)`
                        : templateState.templates
                        ? `(${templateState.templates.length})`
                        : ""}
                      {templateState.currentFeature?.tenantId &&
                        canUpdateFormTemplateStatus && (
                          <IconButton
                            className="formLanding__main__right__header__edit__btn"
                            onClick={editCurrentFeature}
                          >
                            <EditIcon />
                          </IconButton>
                        )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="formLanding__main__right__header">
                  Templates
                </div>
              )}
              <div className="formLanding__main__right__action">
                {!disableTemplateEdit && canViewTemplates && (
                  <div className="formLanding__main__right__action__search">
                    <TextField
                      value={templateName}
                      id="list-search-text"
                      data-testid="templateSearchText"
                      type="text"
                      fullWidth
                      placeholder="Search"
                      variant="outlined"
                      onChange={(e) => changeInSearchName(e)}
                    />

                    <SearchIcon
                      className="formLanding__main__right__action__search__icon"
                    />
                  </div>
                )}

                <div className="formLanding__main__right__action__btns">
                  {canViewTemplates && (
                    <Button
                      variant="outlined"
                      onClick={() => setOpenStatusList(true)}
                      data-testid="templateAssociate"
                      className="formLanding__main__right__action__btns__secondary btn-secondary"
                      disabled={disableTemplateEdit}
                    >
                      Status List
                    </Button>
                  )}
                  {canUpdateTemplates && canCreateProjectTemplateAssociation && (
                    <Button
                      variant="outlined"
                      onClick={() => setOpenTemplateAssociation(true)}
                      data-testid="templateAssociate"
                      className="formLanding__main__right__action__btns__secondary btn-secondary"
                      disabled={disableTemplateEdit}
                    >
                      Template Association
                    </Button>
                  )}
                  {canUpdateTemplates && canCreateTemplate && (
                    <Button
                      onClick={createNewForm}
                      variant="outlined"
                      className="formLanding__main__right__action__btns__primary btn-primary"
                      data-testid="addNewTemplate"
                      disabled={disableTemplateEdit}
                    >
                      Add New Template
                    </Button>
                  )}
                </div>
              </div>

              <EnhancedTable
                rows={templateState.templates}
                preview={showPreview}
                defaultTemplate={setTemplateAsDefault}
                deleteTemplate={confirmDelete}
                configureTemplate={configureTemplate}
                disableActions={disableTemplateEdit}
              />
            </div>
          </Grid>
        </Grid>
        {preview ? (
          <div className="formLanding__preview">
            <Preview
              closePreview={closePreview}
              templateFieldList={previewTemplate.templateData}
              autoGeneratedFields={previewTemplate.templateData.filter(
                (item: any) => item.autoGenerated
              )}
              formName={previewTemplate?.templateName}
            />
          </div>
        ) : (
          ""
        )}
      </div>
      {openTemplateAssociation && (
        <TemplateAssociation
          open={openTemplateAssociation}
          close={closeTemplateAssociation}
        />
      )}
      {openStatusList && (
        <StatusList
          open={openStatusList}
          onClose={() => setOpenStatusList(false)}
          selectedFeature={templateState.currentFeature}
        />
      )}

      {confirmOpen ? (
        <ConfirmDialog
          open={confirmOpen}
          message={dialogData}
          close={() => setConfirmOpen(false)}
          proceed={deleteTemplate}
        />
      ) : (
        ""
      )}
      {columnOpen && (
        <ColumnConfiguration
          open={columnOpen}
          close={closeColumnCOnfigure}
          fields={columnData?.templateData}
          templateId={columnData?.id}
          columns={columnsLists}
        />
      )}
    </templateContext.Provider>
  );
}
