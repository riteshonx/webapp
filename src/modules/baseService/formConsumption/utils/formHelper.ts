import moment from "moment";
import {
  FIXED_FIELDS,
  InputType,
  LinkRelationship,
  LinkType,
} from "src/utils/constants";
import { TemplateData, TemplateDatePayload } from "../../forms/models/template";
import { LocationNode } from "../../projectSettings/models/location";
import { FormFieldData, FormFieldDetailsData } from "../models/form";

export const getformDefaultFieldValues = (
  formTemplateDetailsData: Array<any>
): any => {
  const fixedFields: any = {};
  formTemplateDetailsData.forEach((formData: any) => {
    if (formData.elementId === FIXED_FIELDS.PROJECT_AUTO_INCREMENT) {
      fixedFields.id = `${formData.value ? formData.value : "--"}`;
    }
    if (formData.elementId === FIXED_FIELDS.CREATED_BY) {
      const value: any = [];
      let userId = "";
      formData?.value?.forEach((item: any) => {
        value.push(`${item?.firstName} ${item?.lastName}`);
        userId = item.id;
      });
      fixedFields.createdBy = value.toString();
      fixedFields.createdById = userId;
    }

    if (formData.elementId === FIXED_FIELDS.CREATED_AT) {
      fixedFields.createdAt = moment(formData.value)
        .format("DD MMM YYYY hh:mm a")
        .toString();
    }
    if (formData.elementId === FIXED_FIELDS.STATUS) {
      fixedFields.status = formData.value.toString();
    }
    if (formData.elementId === FIXED_FIELDS.DUE_DATE) {
      fixedFields.dueDate = formData.value
        ? moment(formData.value).format("DD MMM YYYY").toString()
        : "--";
    }
    if (formData.elementId === FIXED_FIELDS.SUBJECT) {
      fixedFields.subject = formData.value ? formData.value.toString() : "";
    }
  });
  return fixedFields;
};

export const getInitialValues = (value: any) => {
  const createdValue: any = [];
  const commentValue: any = [];

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
        let res: any;
        if (value[property] === "true") {
          res = true;
        } else if (value[property] === "false") {
          res = false;
        } else {
          res = value[property];
        }
        fieldValue.formValue = res;
        break;
      }
      case InputType.SINGLEVALUECOMPANY: {
        if (value[property]) {
          fieldValue.formValue = value[property];
        }
        break;
      }
      case InputType.LOCATIONTREE: {
        if (value[property]?.length > 0) {
          fieldValue.formValue = value[property][0]?.locationReferenceId || "";
        }
        break;
      }
      case InputType.CUSTOMNESTEDDROPDOWN:
      case InputType.CUSTOMDROPDOWN: {
        if (value[property]?.length > 0) {
          fieldValue.formValue = value[property][0]?.configReferenceId || "";
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
        fieldTypeId: fieldValue.fieldTypeId,
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
  return createdValue;
};

export const getFinalPayloadValue = (
  value: any,
  forminfo: any,
  type: string,
  initialValue: any
) => {
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
        let res: any;
        if (fieldValue.name.includes("-comment")) {
          fieldValue.formValue = value[property]?.trim();
        } else {
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
      case InputType.SINGLEVALUECOMPANY: {
        if (value[property]) {
          fieldValue.formValue = value[property];
        }
        break;
      }
      case InputType.LOCATIONTREE: {
        if (value[property]) {
          fieldValue.formValue = value[property];
        } else {
          fieldValue.formValue = null;
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

    if (
      typeof element.value !== "boolean" &&
      element.value &&
      element.value === "Invalid date"
    ) {
      element.value = null;
      payloadValue.push(element);
    } else {
      payloadValue.push(element);
    }
  });

  if (forminfo.status === "DRAFT" && type === "submit") {
    payloadValue.push({
      elementId: `${FIXED_FIELDS.STATUS}`,
      value: "OPEN",
    });
  }
  // filtering only modified value
  const finalPayload: any = [];
  payloadValue.forEach((payload: any, index: number) => {
    if (
      typeof payload?.value !== "boolean" &&
      payload?.value !== initialValue[index]?.value
    ) {
      if (typeof payload?.value === "undefined") {
        payload.value = null;
      }
      finalPayload.push(payload);
    }
    if (typeof payload.value === "boolean") {
      finalPayload.push(payload);
    }
  });
  return finalPayload;
};

export const initalizeFormFieldDetailsData = (
  item: any
): FormFieldDetailsData => {
  return {
    value: item.value,
    typeId: item.typeId,
    caption: item.caption ? item.caption : "",
    elementId: item.elementId,
    scheduleImpactComments: item.scheduleImpactComments,
    costImpactComments: item.costImpactComments,
  };
};

export const intializeNewTemplateData = (item: any) => {
  return {
    stepName: item.stepName,
    stepType: item.stepType,
    stepDescription: item.stepDescription,
    incomingOutcome: item.incomingOutcome,
    outgoingOutcomes: item.outgoingOutcomes,
    projectStepAssignees: item.projectStepAssignees,
    featureStepAssignees: item.featureStepAssignees,
  };
};

export const sortDataOnSequence = (a: any, b: any) => {
  let comparison = 0;

  if (a.sequence > b.sequence) {
    comparison = 1;
  } else if (a.sequence < b.sequence) {
    comparison = -1;
  }
  return comparison;
};

export const intializeFormFieldData = (item: any): FormFieldData => {
  return {
    autoGenerated: item.autoGenerated,
    caption: item.caption,
    configListId: item.configListId,
    elementId: item.elementId,
    fieldTypeId: item.fieldTypeId,
    fixed: item.fixed,
    required: item.required,
    sequence: item.sequence,
    width: item.fieldTypeId == InputType.TABLE ? 100 : item.width,
    tableId: item.tableId || null,
    metaData: item?.metadata || [],
    filterable: item?.filterable,
  };
};

export const initializeFormToTaskLinks = (
  links: Array<any>,
  targetType: number
): Array<any> => {
  return links
    .map((item: any) => {
      const {
        form: { formsData, projectFeature },
        projectTask: { id, taskName, taskType, status },
        linkType: { name },
      } = item;
      return {
        taskId: id,
        taskName,
        taskType,
        constraint: name === LinkRelationship.RELATES_TO ? false : true,
        constraintName: formsData[0]?.valueString || "EMPTY_SUBJECT",
        status,
        relation: name,
        sourceId: item.form?.id.toString(),
        sourceType: projectFeature?.id,
        targetType: targetType,
        isDeleted: false,
        isTouched: false,
        isNew: false,
      };
    })
    .sort((a, b) => (a.taskName > b.taskName ? 1 : -1));
};

export const initializeLinkValues = (
  linkItems: Array<any>,
  formId: string
): Array<any> => {
  const values: Array<any> = [];
  linkItems.forEach((item: any) => {
    const newitem: any = {};
    if (item?.sourceForm?.id === Number(formId) && item.targetForm) {
      const label =
        item.targetForm.formsData.length > 0
          ? item.targetForm.formsData[0]?.valueString
          : item.targetForm.id;
      newitem.relation = item.linkType.name;
      newitem.originalRelationShip = item.linkType.name;
      newitem.id = item.sourceForm.id;
      newitem.label = label;
      newitem.sourceAutoIncremenId = item.sourceForm.autoIncrementId;
      newitem.targetAutoIncremenId = item.targetForm.autoIncrementId;
      newitem.targetId = item.targetForm.id;
      newitem.sourceType = item.sourceForm.projectFeature?.id;
      newitem.sorceFeature = item.sourceForm.projectFeature?.caption;
      newitem.targetType = item.targetForm.projectFeature?.id;
      newitem.targetFeature = item.targetForm.projectFeature?.caption;
      newitem.isSelected = true;
      newitem.deleted = false;
      newitem.reverse = false;
      newitem.new = false;
      newitem.relationShipModifield = false;
      newitem.constraintName = "FORM_TO_FORM";
      newitem.constraint = false;
      values.push(newitem);
    } else {
      if (item?.sourceForm) {
        const label =
          item?.sourceForm?.formsData?.length > 0
            ? item.sourceForm.formsData[0]?.valueString
            : item.targetForm.id;
        const relation =
          item?.linkType?.name === LinkRelationship.BLOCKED_BY
            ? LinkRelationship.BLOCKS
            : item?.linkType?.name == LinkRelationship.BLOCKS
            ? LinkRelationship.BLOCKED_BY
            : item.linkType.name;
        newitem.relation = relation;
        newitem.originalRelationShip = relation;
        newitem.id = item.targetForm?.id;
        newitem.label = label;
        newitem.targetAutoIncremenId = item.sourceForm?.autoIncrementId;
        newitem.sourceAutoIncremenId = item.targetForm?.autoIncrementId;
        newitem.targetId = item.sourceForm?.id;
        newitem.sourceType = item.targetForm.projectFeature?.id;
        newitem.sorceFeature = item.targetForm.projectFeature?.caption;
        newitem.targetFeature = item.sourceForm.projectFeature?.caption;
        newitem.targetType = item.sourceForm.projectFeature?.id;
        newitem.isSelected = true;
        newitem.deleted = false;
        newitem.reverse = true;
        newitem.new = false;
        newitem.relationShipModifield = false;
        newitem.constraintName = "FORM_TO_FORM";
        newitem.constraint = false;
        values.push(newitem);
      }
    }
  });
  values.sort((a, b) => a.targetAutoIncremenId - b.targetAutoIncremenId);
  return values;
};

export const transformLocationData = (
  argList: Array<LocationNode>,
  argParentId: string
): Array<LocationNode> => {
  const returnValue: Array<LocationNode> = [];
  const currentChildNodes = argList.filter(
    (item: LocationNode) => item.parentId === argParentId
  );
  currentChildNodes.forEach((item: LocationNode) => {
    const childNodes = transformLocationData(argList, item.id);
    const newItem: LocationNode = new LocationNode(
      item.nodeName,
      item.parentId,
      item.id,
      childNodes,
      true
    );
    returnValue.push(newItem);
  });
  return returnValue;
};

export const getWorkFlowAssignees = (workflowFeatureStepDefs: Array<any>) => {
  const stepAssigneess: Array<any> = [];
  workflowFeatureStepDefs.forEach((item: any) => {
    const assigneeList: Array<any> = [];
    item.workflowFeatureStepAssignees.forEach((userItem: any) => {
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
  return stepAssigneess;
};

export const getWorkflowStepsAndOutcomes = (
  workflowTemplateStepDefs: Array<any>,
  stepKeys: any
) => {
  const steps: Array<any> = [];
  const endPoints: Array<any> = [];
  let currentStep = "";
  workflowTemplateStepDefs.forEach((item: any) => {
    const newStep = {
      id: item.id,
      editsAllowed: item.editsAllowed,
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
    if (item.type === "start" && item.wFFromStepDefOutcomes.length > 0) {
      currentStep = item.wFFromStepDefOutcomes[0].toStepDefName;
    }
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
  });
  return {
    steps,
    endPoints,
    currentStep,
  };
};

export const formLocationTreeData = (data: any) => {
  const list: Array<LocationNode> = [];
  if (data.length > 0) {
    const parentNode = data.filter((item: any) => !item.parentId);
    if (parentNode.length > 0) {
      const childNodes = transformLocationData(data, parentNode[0].id);
      const newItem: LocationNode = new LocationNode(
        parentNode[0].nodeName,
        parentNode[0].parentId,
        parentNode[0].id,
        childNodes,
        true
      );
      list.push(newItem);
    }
    if (list[0].childNodes.length > 0) {
      list[0].isOpen = true;
    }
  }
  return list;
};

export const isFieldDuplicateOrRequired = (
  argTemplateFieldList: Array<TemplateData>
): boolean => {
  const responseValue = argTemplateFieldList.filter(
    (item: TemplateData) => item.duplicateCaption || !item.caption
  );
  return responseValue.length > 0;
};

export const fetchTemplatePayload = (
  argTemplateFieldList: Array<TemplateData>,
  isUpdate = true
): any => {
  const fields: Array<TemplateDatePayload> = [];
  argTemplateFieldList.forEach((item: TemplateData) => {
    if (!item.autoGenerated) {
      const required = item.required === 1 ? true : false;
      const fieldItem: TemplateDatePayload = {
        caption: item.caption,
        required: required,
        fieldTypeId: item.fieldTypeId,
        width: item.width == 12 ? 100 : 50,
      };
      if (item.fieldTypeId === InputType.CUSTOMDROPDOWN) {
        fieldItem.configListId = item.configListId;
      }
      if (item.elementId && isUpdate) {
        fieldItem.elementId = item.elementId;
      }
      if (
        item.elementId === FIXED_FIELDS.SUBJECT &&
        item.metadata &&
        isUpdate
      ) {
        fieldItem.caption = item.metadata.caption;
      } else if (item.elementId === FIXED_FIELDS.SUBJECT && item.metadata) {
        fieldItem.metadata = item.metadata;
      }
      if (item.fieldTypeId === InputType.TABLE) {
        const tableColumns = JSON.parse(JSON.stringify(item.metadata.colData));
        tableColumns.forEach((element: any) => {
          delete element.position;
        });
        const rowData = JSON.parse(JSON.stringify(item.metadata.rowData));
        rowData.forEach((cellItem: any) => delete cellItem.position);
        const metaData = {
          rowData,
          rowCount: item.metadata.rowData.length,
          colData: tableColumns,
          colCount: item.metadata.colData.length,
          index: item.metadata.index,
          numbered: item.showNumberColumn,
        };
        fieldItem.metadata = metaData;
      }
      fields.push(fieldItem);
    }
  });
  return fields;
};

export const confirmMessage = {
  header: "Are you sure?",
  text: "If you cancel now, your changes won’t be saved.",
  cancel: "Go back",
  proceed: "Yes, I'm sure",
};
