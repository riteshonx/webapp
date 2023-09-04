import React, { ReactElement, useContext, useEffect, useState } from "react";
import {
  FIXED_FIELDS,
  InputType,
  nonpermittedFields,
} from "../../../../../utils/constants";
import AddIcon from "@material-ui/icons/Add";
import ReorderIcon from "@material-ui/icons/Reorder";
import TextField from "@material-ui/core/TextField";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import FileCopyOutlinedIcon from "@material-ui/icons/FileCopyOutlined";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import { FieldAsList, FieldAs } from "../../../../../utils/constants";
import { templateCreationContext } from "../../context/templateCreation/context";
import {
  setSelectedTemplateField,
  setFormCurrentTab,
  setTemplateList,
  setFieldList,
  setDragedInput,
  setDragFrom,
  setDropedTo,
} from "../../context/templateCreation/action";
import { IconButton, makeStyles} from "@material-ui/core";
import { stateContext } from "../../../../root/context/authentication/authContext";
import { FormsRoles } from "../../../../../utils/role";
import { LOAD_FIELD_TYPES } from "../../grqphql/queries/fieldTypes";
import {
  setEditMode,
  setIsLoading,
} from "../../../../root/context/authentication/action";
import { TemplateData, IFieldInput } from "../../models/template";
import { client } from "../../../../../services/graphql";
import { useDebounce } from "../../../../../customhooks/useDebounce";
import { getUniqueName } from "../../../../../utils/helper";
import { Checkbox } from "@material-ui/core";
import WarningIcon from "@material-ui/icons/Warning";
import {
  constructTableData,
  renderCommonFields,
  renderExistingFields,
} from "../../utils/helper";
import { v4 as uuidv4 } from "uuid";
import Notification, {
  AlertTypes,
} from "../../../../shared/components/Toaster/Toaster";
import "./FieldType.scss";
import { canViewTemplates } from "../../utils/permission";
import Tooltip from '@mui/material/Tooltip';


const useStyles = makeStyles(() => ({
  menuPaper: {
    maxHeight: 120,
  },
  checkbox: {
    background: "linear-gradient(120.17deg, #FCFCFC -31.99%, #E2E2E2 102.21%)",
    border: "0.5px solid #CCCCCC",
    boxShadow: "inset 0px 1px 2px rgba(14, 14, 14, 0.55)",
    borderRadius: "4px",
    boxSizing: "border-box",
    width: "1.8rem",
    height: "1.8rem",
  },
}));

export interface Params {
  id: string;
}

export default function FieldType(): ReactElement {
  const classes = useStyles();
  const { createTemplateState, createTemplateDispatch }: any = useContext(
    templateCreationContext
  );
  const [inputTypeList, setInputTypeList] = useState<Array<IFieldInput>>([]);
  const { dispatch, state }: any = useContext(stateContext);
  const [captionName, setCaptionName] = useState("");
  const debounceName = useDebounce(captionName, 300);
  const [currentFieldIndex, setcurrentFieldIndex] = useState(-1);
  const [isSubject, setIsSubject] = useState(false);

  useEffect(() => {
    checkIfCaptionNameIsDuplicate();
  }, [debounceName]);

  useEffect(() => {
    if (createTemplateState?.selectedTemplateField?.id) {
      let caption = createTemplateState.selectedTemplateField.caption;
      if (
        createTemplateState.selectedTemplateField.elementId ===
          FIXED_FIELDS.SUBJECT &&
        createTemplateState.selectedTemplateField.metadata
      ) {
        caption = createTemplateState.selectedTemplateField.metadata.caption;
      }
      setCaptionName(caption);
      const cuurentItem = createTemplateState.templateList.find(
        (item: any) => createTemplateState.selectedTemplateField.id == item.id
      );
      const index = createTemplateState.templateList.indexOf(cuurentItem);
      if (index > -1) {
        setcurrentFieldIndex(index);
      } else {
        setcurrentFieldIndex(-1);
      }
      validateOtherFields();
    }
  }, [createTemplateState.selectedTemplateField]);

  /**
   * This useEffect is used to the field types when coponents loades
   */
  useEffect(() => {
    if (canViewTemplates) {
      fetchFIeldTypes();
    }
  }, []);

  const fetchFIeldTypes = async () => {
    try {
      dispatch(setIsLoading(true));
      const response: any = await client.query({
        query: LOAD_FIELD_TYPES,
        variables: {},
        fetchPolicy: "network-only",
        context: { role: FormsRoles.viewFormTemplate },
      });
      if (response.data.fieldTypes) {
        const targetList: Array<any> = [];
        response.data.fieldTypes.forEach((item: any) => {
          if (item.enabled) {
            targetList.push({
              id: item.id,
              fieldType: item.caption,
            });
          }
        });
        setInputTypeList(targetList);
        createTemplateDispatch(setFieldList(targetList));
      }
      dispatch(setIsLoading(false));
    } catch (error) {
      dispatch(setIsLoading(false));
    }
  };

  /**
   * Method to set selectedTemplateField
   * @param argItem :any
   */
  const SelectItem = (argItem: any) => {
    createTemplateDispatch(setFormCurrentTab("EXISTING"));
    createTemplateDispatch(setSelectedTemplateField(argItem));
  };

  /**
   * Method to change the caption value
   * @param e : React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
   * @param index
   */
  const ChangeInFieldCaption = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    e.stopPropagation();
    setCaptionName(e.target.value);
  };
  /**

     * Method to change InputType
     * @param e : any
     * @param index : number
     */
  const setInputType = (e: any, index: number) => {
    e.stopPropagation();
    const items = [...createTemplateState.templateList];
    const tableCount = items.filter(
      (fieldItem: any) => fieldItem.fieldTypeId === InputType.TABLE
    );
    if (Number(e.target.value) == InputType.TABLE && tableCount.length > 4) {
      Notification.sendNotification(
        "Max limit of 5 table is exceeded in the current template",
        AlertTypes.warn
      );
      return;
    }
    if (items[index].fieldTypeId === InputType.CUSTOMDROPDOWN) {
      delete items[index].configListId;
    }
    items[index].fieldTypeId = Number(e.target.value);
    if (items[index].fieldTypeId === InputType.TABLE) {
      items[index].width = 12;
      items[index].required = false;
      items[index].metadata = constructTableData();
    }
    if (
      items[index].fieldTypeId === InputType.CUSTOMNESTEDDROPDOWN ||
      items[index].fieldTypeId === InputType.CUSTOMDROPDOWN
    ) {
      items[index].configListId =
        createTemplateState.customList.length > 0
          ? createTemplateState.customList[0].id
          : -1;
    }
    createTemplateDispatch(setTemplateList([...items]));
    if (!state.editMode) {
      dispatch(setEditMode(true));
    }
  };

  /**
   * Method to change required field
   * @param e :any
   * @param index : number
   * @returns : void
   */
  const setFieldAs = async (e: any, index: number) => {
    e.stopPropagation();
    const items = [...createTemplateState.templateList];
    items[index].required = e.target.value;
    createTemplateDispatch(setTemplateList([...items]));
    if (!state.editMode) {
      dispatch(setEditMode(true));
    }
  };

  /**
   * Method to change the width of the field
   * @param e : any
   * @param index : number
   * @returns : void
   */
  const setWidth = async (e: any, index: number) => {
    e.stopPropagation();
    const items = [...createTemplateState.templateList];
    items[index].width = e.target.value as number;
    createTemplateDispatch(setTemplateList([...items]));
    if (!state.editMode) {
      dispatch(setEditMode(true));
    }
  };

  const setColumnNumber = async (e: any, index: number) => {
    try {
      e.stopPropagation();
      const items = [...createTemplateState.templateList];
      items[index].showNumberColumn = e.target.checked;
      createTemplateDispatch(setTemplateList([...items]));
      if (!state.editMode) {
        dispatch(setEditMode(true));
      }
    } catch (error: any) {
      console.log(error);
    }
  };

  /**
   * Method to set the draged fieldInput type
   * @param e : any
   */
  const dragedItem = (e: any) => {
    const inputData: IFieldInput = JSON.parse(e.currentTarget.dataset.index);
    createTemplateDispatch(setDragedInput(inputData));
  };

  /**
   * Method to copy field
   * @param e : any
   * @param argItem: TemplateData
   * @param argindex : number
   * @returns : void
   */
  const copyField = async (
    e: React.MouseEvent<unknown>,
    argItem: TemplateData,
    argindex: number
  ) => {
    e.stopPropagation();
    e.preventDefault();
    const items = [...createTemplateState.templateList];
    const tableCount = items.filter(
      (fieldItem: any) => fieldItem.fieldTypeId === InputType.TABLE
    );
    if (argItem.fieldTypeId == InputType.TABLE && tableCount.length > 4) {
      Notification.sendNotification(
        "Max limit of 5 table is exceeded in the current template",
        AlertTypes.warn
      );
      return;
    }
    const copy = JSON.parse(JSON.stringify(argItem));
    const names = createTemplateState.templateList.map(
      (item: any) => item.caption
    );
    names.push(argItem.caption);
    const uniqueName = getUniqueName(names);
    copy.caption = uniqueName;
    copy.id = uuidv4();
    copy.originalCaption = uniqueName;
    copy.fixed = false;
    copy.elementId = "";
    const targetIndex = argindex + 1;
    items.splice(targetIndex, 0, copy);
    createTemplateDispatch(setTemplateList([...items]));
    if (!state.editMode) {
      dispatch(setEditMode(true));
    }
  };

  /**
   * Method to delete field
   * @param e : React.MouseEvent<unknown>
   * @param argItem : TemplateData
   * @param argindex : number
   * @returns : void
   */
  const deleteField = async (
    e: React.MouseEvent<unknown>,
    argItem: TemplateData,
    argIndex: number
  ) => {
    e.stopPropagation();
    e.preventDefault();
    const items = [...createTemplateState.templateList];
    items.splice(argIndex, 1);
    createTemplateDispatch(setTemplateList([...items]));
    if (!state.editMode) {
      dispatch(setEditMode(true));
    }
  };

  /**
   * Method to save the caption name
   * @param e : React.FocusEvent<HTMLTextAreaElement | HTMLInputElement>
   * @param argindex : number
   */
  const saveCaptionChanges = () => {
    if (currentFieldIndex > -1) {
      if (
        createTemplateState.selectedTemplateField.elementId ===
          FIXED_FIELDS.SUBJECT &&
        createTemplateState.formFeatureType === "OPEN"
      ) {
        createTemplateState.selectedTemplateField.metadata = {
          caption: captionName.trim(),
        };
      } else {
        createTemplateState.selectedTemplateField.caption = captionName.trim();
      }
      createTemplateDispatch(
        setSelectedTemplateField(createTemplateState.selectedTemplateField)
      );
    }
  };

  const checkIfCaptionNameIsDuplicate = () => {
    if (createTemplateState.selectedTemplateField) {
      const items = [...createTemplateState.templateList];
      const selected = items.find(
        (item) => item.id === createTemplateState.selectedTemplateField.id
      );
      const index = items.indexOf(selected);
      const duplicates = items.filter(
        (item: any, itemIndex: number) =>
          item.caption.trim().toLocaleLowerCase() ===
            debounceName.trim().toLocaleLowerCase() && itemIndex !== index
      );
      if (duplicates.length !== 0) {
        createTemplateState.selectedTemplateField.duplicateCaption = true;
      } else {
        createTemplateState.selectedTemplateField.duplicateCaption = false;
      }
      setIsSubject(false);
      if (
        createTemplateState.selectedTemplateField.elementId !==
          FIXED_FIELDS.SUBJECT &&
        debounceName.trim().toLocaleLowerCase() === "subject"
      ) {
        setIsSubject(true);
      }
      if (
        createTemplateState.templateList[index].duplicateCaption !==
        createTemplateState.selectedTemplateField.duplicateCaption
      ) {
        createTemplateDispatch(
          setSelectedTemplateField(createTemplateState.selectedTemplateField)
        );
      }
    }
  };

  const validateOtherFields = () => {
    try {
      const items = createTemplateState.templateList;
      items.forEach((currentItem: any) => {
        if (!currentItem.autoGenerated) {
          const duplicates = items.filter(
            (item: any) =>
              item.caption.trim().toLocaleLowerCase() ===
                currentItem.caption.trim().toLocaleLowerCase() &&
              currentItem.id !== item.id &&
              item.id !== createTemplateState.selectedTemplateField.id
          );
          if (duplicates.length > 0) {
            currentItem.duplicateCaption = true;
          } else {
            currentItem.duplicateCaption = false;
          }
        }
      });
      createTemplateDispatch(setTemplateList(items));
      if (!state.editMode) {
        dispatch(setEditMode(true));
      }
    } catch (error: any) {
      console.log(error);
    }
  };

  const dragEndField = () => {
    if (-1 !== createTemplateState.dragedFrom) {
      createTemplateDispatch(setDragFrom(-1));
    }
    if (-1 !== createTemplateState.dropedTo) {
      createTemplateDispatch(setDropedTo(-1));
    }
  };

  const captionFieldDisabled = (item: any) => {
    if (
      item.elementId === FIXED_FIELDS.SUBJECT &&
      createTemplateState.formFeatureType === "OPEN"
    ) {
      return false;
    } else {
      return item.fixed;
    }
  };

  return (
    <>
      <div data-testid="create-FieldType" className="fieldsContainer__title">
        Fields
      </div>
      <div className="fieldsContainer__option">
        <div
          onClick={() => createTemplateDispatch(setFormCurrentTab("ADDNEW"))}
          data-testid="create-addnew"
          className={`fieldsContainer__option__item 
                            ${
                              createTemplateState.currentTab === "ADDNEW"
                                ? " fieldsContainer__option__item__active"
                                : ""
                            }`}
        >
          <AddIcon />
          Add New
        </div>
        <div
          onClick={() => createTemplateDispatch(setFormCurrentTab("EXISTING"))}
          className={`fieldsContainer__option__item 
                            ${
                              createTemplateState.currentTab === "EXISTING"
                                ? " fieldsContainer__option__item__active"
                                : ""
                            }`}
        >
          <ReorderIcon />
          Existing
        </div>
      </div>
      {createTemplateState.currentTab === "ADDNEW" ? (
        <div className="fieldsContainer__collection">
          <div>
            <div
              className="fieldsContainer__collection__title"
              data-testid="fieldTypes-commonInputType"
            >
              Common Input Types
            </div>
            <div className="fieldsContainer__collection__list">
              <div className="fieldsContainer__collection__list__grid">
                {createTemplateState.fieldList.map(
                  (row: any, index: number) =>
                    nonpermittedFields.indexOf(row.id) === -1 && (
                      <Tooltip title="Drag Input Type to canvas to add to your form" followCursor>
                        <div
                          key={`${row.label}-${index}`}
                          className="fieldsContainer__collection__list__input"
                          data-testid={`fieldTypes-commonInputType-${index}`}
                          onDragEnd={() => dragEndField()}
                          draggable="true"
                          data-index={JSON.stringify(row)}
                          onDragStart={(e) => dragedItem(e)}
                        >
                          {renderCommonFields(row)}
                          <div className="fieldsContainer__collection__list__input__label">
                            {row.fieldType}
                          </div>
                        </div>
                      </Tooltip>
                    )
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="fieldsContainer__existing">
          {createTemplateState.templateList.map(
            (item: TemplateData, index: number) => {
              if (!item.autoGenerated) {
                return (
                  <div
                    key={`${item.id}`}
                    onClick={() => SelectItem(item)}
                    data-testid={`create-${item.caption}-${index}`}
                    className={`fieldsContainer__existing__item 
                                        ${
                                          item.id ==
                                          createTemplateState
                                            .selectedTemplateField?.id
                                            ? " fieldsContainer__existing__active"
                                            : ""
                                        }`}
                  >
                    <div className="fieldsContainer__existing__item__header">
                      <div className="fieldsContainer__existing__item__header__label">
                        {renderExistingFields(
                          item,
                          createTemplateState.selectedTemplateField
                        )}
                        <Tooltip
                          title={
                            item.elementId === FIXED_FIELDS.SUBJECT &&
                            item.metadata
                              ? item.metadata?.caption
                              : item.caption
                          }
                          aria-label="caption"
                        >
                          <label className="fieldsContainer__existing__item__header__label__title">
                            {item.elementId === FIXED_FIELDS.SUBJECT &&
                            item.metadata
                              ? item.metadata?.caption?.length > 20
                                ? `${item.metadata?.caption.slice(0, 20)} . . .`
                                : item.metadata?.caption
                              : item.caption.length > 20
                              ? `${item.caption.slice(0, 20)} . . .`
                              : item.caption}{" "}
                          </label>
                        </Tooltip>
                      </div>
                      <div className="fieldsContainer__existing__item__header__action">
                        {(item?.duplicateCaption || !item?.caption) && (
                          <WarningIcon
                            className={"fieldsContainer__errorwarning"}
                          />
                        )}
                        {!item?.fixed ? (
                          <Tooltip
                            title={`Delete ${item.caption} ${item?.caption}`}
                            aria-label="number of fields"
                          >
                            <IconButton
                              disabled={item.fixed}
                              data-testid={`create-delete-${index}`}
                              className="fieldsContainer__actionBtn"
                              onClick={(e) => deleteField(e, item, index)}
                            >
                              <DeleteOutlineIcon
                                className={
                                  item ==
                                    createTemplateState.selectedTemplateField &&
                                  item.id ==
                                    createTemplateState.selectedTemplateField
                                      ?.id
                                    ? "fieldsContainer__existing__item__header__action__icon__active"
                                    : "fieldsContainer__existing__item__header__action__icon"
                                }
                              />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          ""
                        )}
                        <Tooltip
                          title={`Copy ${item.caption}`}
                          aria-label="number of fields"
                        >
                          <IconButton
                            onClick={(e) => copyField(e, item, index)}
                            className="fieldsContainer__actionBtn"
                            data-testid={`create-copy-${index}`}
                          >
                            <FileCopyOutlinedIcon
                              className={
                                item ==
                                  createTemplateState.selectedTemplateField &&
                                item.id ==
                                  createTemplateState.selectedTemplateField?.id
                                  ? "fieldsContainer__existing__item__header__action__icon__active"
                                  : "fieldsContainer__existing__item__header__action__icon"
                              }
                            />
                          </IconButton>
                        </Tooltip>
                      </div>
                    </div>

                    {item.id ==
                    createTemplateState.selectedTemplateField?.id ? (
                      <div className="fieldsContainer__existing__item__details">
                        <div className="fieldsContainer__existing__item__details__field">
                          <label
                            className="fieldsContainer__existing__item__details__field__label"
                            data-testid={`create-label-${index}`}
                          >
                            Label name
                          </label>
                          <TextField
                            className="fieldsContainer__existing__item__details__field__input"
                            id="Label-Name"
                            type="text"
                            fullWidth
                            disabled={captionFieldDisabled(item)}
                            data-testid={`create-labelName-${index}`}
                            helperText={
                              createTemplateState.selectedTemplateField
                                .duplicateCaption && isSubject
                                ? "Cannot add field named Subject. Subject is reserved for the fixed field input type"
                                : createTemplateState.selectedTemplateField
                                    .duplicateCaption
                                ? "label name already exists"
                                : !item?.caption.trim() || !captionName.trim()
                                ? "label name is required"
                                : ""
                            }
                            value={captionName}
                            onBlur={saveCaptionChanges}
                            onChange={(e) => ChangeInFieldCaption(e)}
                          />
                        </div>

                        <div className="fieldsContainer__existing__item__details__field">
                          <label
                            className="fieldsContainer__existing__item__details__field__label"
                            data-testid={`create-inputType-label-${index}`}
                          >
                            Input type
                          </label>
                          <FormControl
                            fullWidth
                            className="fieldsContainer__existing__item__details__field__input"
                          >
                            <Select
                              defaultValue=""
                              id="inputType"
                              disabled={
                                item.fixed || item.autoGenerated || false
                              }
                              data-testid={`create-inputType-${index}`}
                              value={
                                createTemplateState.selectedTemplateField
                                  .fieldTypeId
                              }
                              onChange={(e) => setInputType(e, index)}
                              MenuProps={{
                                classes: { paper: classes.menuPaper },
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
                              {inputTypeList.map(
                                (row) =>
                                  nonpermittedFields.indexOf(row.id) === -1 && (
                                    <MenuItem
                                      key={row.id}
                                      className="fieldsContainer__existing__item__details__field__input__menuitem"
                                      value={row.id}
                                    >
                                      {row.fieldType}
                                    </MenuItem>
                                  )
                              )}
                            </Select>
                          </FormControl>
                        </div>
                        {createTemplateState.selectedTemplateField
                          .fieldTypeId &&
                          createTemplateState.selectedTemplateField
                            .fieldTypeId != InputType.TABLE && (
                            <div className="fieldsContainer__existing__item__details__field">
                              <label
                                className="fieldsContainer__existing__item__details__field__label"
                                data-testid={`create-required-label-${index}`}
                              >
                                Field as
                              </label>
                              <FormControl
                                fullWidth
                                className="fieldsContainer__existing__item__details__field__input"
                              >
                                <Select
                                  defaultValue=""
                                  id="Fieldas"
                                  disabled={
                                    item.fixed || item.autoGenerated || false
                                  }
                                  data-testid={`create-required-${index}`}
                                  value={
                                    createTemplateState.selectedTemplateField
                                      .required
                                  }
                                  onChange={(e) => setFieldAs(e, index)}
                                  MenuProps={{
                                    classes: { paper: classes.menuPaper },
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
                                  {FieldAsList.map((fieldItem: FieldAs) => (
                                    <MenuItem
                                      key={fieldItem.label}
                                      className="fieldsContainer__existing__item__details__field__input__menuitem"
                                      value={fieldItem.value}
                                    >
                                      {fieldItem.label}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            </div>
                          )}
                        {createTemplateState.selectedTemplateField
                          .fieldTypeId &&
                          createTemplateState.selectedTemplateField
                            .fieldTypeId != InputType.TABLE && (
                            <div className="fieldsContainer__existing__item__details__field">
                              <label
                                className="fieldsContainer__existing__item__details__field__label"
                                data-testid={`create-size-label-${index}`}
                              >
                                Width
                              </label>
                              <FormControl
                                fullWidth
                                className="fieldsContainer__existing__item__details__field__input"
                              >
                                <Select
                                  id="gridSize"
                                  value={
                                    createTemplateState.selectedTemplateField
                                      .width
                                  }
                                  disabled={
                                    createTemplateState.selectedTemplateField
                                      .fieldTypeId == InputType.TABLE
                                  }
                                  data-testid={`create-size-${index}`}
                                  onChange={(e) => setWidth(e, index)}
                                  MenuProps={{
                                    classes: { paper: classes.menuPaper },
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
                                    value={6}
                                    className="fieldsContainer__existing__item__details__field__input__menuitem"
                                  >
                                    50%
                                  </MenuItem>
                                  <MenuItem
                                    value={12}
                                    className="fieldsContainer__existing__item__details__field__input__menuitem"
                                  >
                                    100%
                                  </MenuItem>
                                </Select>
                              </FormControl>
                            </div>
                          )}
                        {createTemplateState.selectedTemplateField
                          .fieldTypeId == InputType.TABLE && (
                          <div
                            className="fieldsContainer__existing__item__details__field"
                            style={{ marginTop: "15px" }}
                          >
                            <div className="fieldsContainer__existing__item__details__field__checkBoxlabel">
                              <Checkbox
                                checked={
                                  createTemplateState.selectedTemplateField
                                    .showNumberColumn
                                }
                                onChange={(e) => setColumnNumber(e, index)}
                                className="fieldsContainer__existing__item__details__field__checkbox"
                                classes={{ root: classes.checkbox }}
                                name="checkbox"
                              />
                            </div>
                            <div
                              className="fieldsContainer__existing__item__details__field__numberedField"
                              data-testid={`create-size-label-${index}`}
                            >
                              Numbered Column
                            </div>
                            {/* setColumnNumber(e,index) */}
                          </div>
                        )}
                      </div>
                    ) : (
                      ""
                    )}
                  </div>
                );
              }
              return "";
            }
          )}
        </div>
      )}
    </>
  );
}
