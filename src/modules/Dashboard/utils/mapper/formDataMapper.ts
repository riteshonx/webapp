import moment from "moment";
interface IFormDataObject {
  caption: string;
  elementId: string;
  typeId: number;
  valueBool: boolean;
  valueDate: string;
  valueInt: number;
  valuePoint: string;
  valueString: string;
  valueTime: string;
  [key: string]: any; // Define an index signature to allow properties with any string key
}

import {
  ICommonFieldDetail,
  ICommonPopoverDetail,
  POPOVER_TYPES,
} from "../../models";

const TYPE_ID_VS_DATA_TYPE_MAP = [
  {
    typeId: 1,
    key: "valueString",
  },
  {
    typeId: 2,
    key: "valueString",
  },
  {
    typeId: 3,
    key: "valueInt",
  },
  {
    typeId: 4,
    key: "valueTime",
  },
  {
    typeId: 5,
    key: "valueDate",
  },
  {
    typeId: 6,
    key: "valueDate",
  },
  {
    typeId: 7,
    key: "valueBool",
  },
  {
    typeId: 7,
    key: "valueString",
  },
];

export const getFieldValueByFromObject = (
  formObject: IFormDataObject
): [string, any] => {
  const typeId = formObject.typeId;
  const dataKey = TYPE_ID_VS_DATA_TYPE_MAP.find((e) => e.typeId === typeId) || {
    typeId: 1,
    key: "valueString",
  };
  return [formObject.caption, formObject[dataKey?.key] || null];
};

export const getFieldValueMap = (
  formData: Array<IFormDataObject>
): {
  [key: string]: any;
} => {
  const fieldValueMap = {} as { [key: string]: any };
  formData.forEach((item: IFormDataObject) => {
    const [key, value] = getFieldValueByFromObject(item);
    fieldValueMap[key] = value;
  });
  return fieldValueMap;
};

export const qcChecklistMapper = (formResponse: any) => {
  const obj = {} as ICommonPopoverDetail;
  const formObject = {} as {
    [key: string]: any;
  };

  // Status
  const statusObject = {
    label: "Status",
    value: "--",
  } as ICommonFieldDetail;

  // State
  const stateObject = {
    label: "State",
    value: "--",
  } as ICommonFieldDetail;

  // formId
  const formIdObject = {
    label: "ID",
    value: "--",
  } as ICommonFieldDetail;

  // Due Date
  const dueDateObject = {
    label: "Due Date",
    value: "--",
  } as ICommonFieldDetail;

  const createdByObject = {
    label: "Created By",
    value: "--",
  } as ICommonFieldDetail;

  (formResponse.data.forms || []).forEach((dataObject: IFormDataObject) => {
    obj.state = dataObject.formState;
    stateObject.value = dataObject.formState ? dataObject.formState : "--";
    statusObject.value = dataObject.formStatus?.status
      ? dataObject.formStatus?.status
      : "--";
    formIdObject.value = dataObject.formStatus?.id
      ? dataObject.formStatus?.id
      : "--";
    dueDateObject.value = dataObject.dueDate
      ? moment(dataObject.dueDate).format("DD MMM YYYY")
      : "--";
    createdByObject.value =
      dataObject.createdByUser.firstName +
      " " +
      dataObject.createdByUser.lastName;

    dataObject.formsData.forEach((formData: any) => {
      const [key, value] = getFieldValueByFromObject(formData);
      formObject[key] = value;
    });
  });

  const assigneeList = formResponse.data?.formsUserLists?.map(
    (userInfo: any) => userInfo.user.firstName + " " + userInfo.user.lastName
  );
  const assigneToObject = {
    label: "Assignee",
    value: assigneeList.length ? assigneeList.join(", ") : "--",
  } as ICommonFieldDetail;
  // Title
  obj.title = formObject["Subject"] || "";
  obj.data = [] as Array<ICommonFieldDetail>;
  obj.id = `${POPOVER_TYPES.CHECKLIST}  ${ formObject["Checklist No"]
      ? `#${formObject["Checklist No"]}`
      : ""
  }`;
  obj.attachment = formResponse.data.formsAttachmentList;
  obj.taskLink = formResponse.data.formTaskLinks;

  const locationObject = {
    label: "Location",
    value: "--",
  } as ICommonFieldDetail;

  locationObject.value = formResponse.data?.formsLocationLists?.length
    ? formResponse.data?.formsLocationLists[0].locationValue[0]
      ? formResponse.data?.formsLocationLists[0]?.locationValue[0]
      : "--"
    : "--";
  const checklistTypeObject = {
    label: "Checklist Type",
    value: formObject["Checklist Type"] ? formObject["Checklist Type"] : "--",
  } as ICommonFieldDetail;

  const assigneeUserObject = {
    label: "Assignee Type",
    value: formObject["Assignee Type"] ? formObject["Assignee Type"] : "--",
  } as ICommonFieldDetail;

  const tradeObject = {
    label: "Trade",
    value: formObject["Trade"] ? formObject["Trade"] : "--",
  } as ICommonFieldDetail;

  const codeObject = {
    label: "Code",
    value: formObject["Classification Code"]
      ? formObject["Classification Code"]
      : "--",
  } as ICommonFieldDetail;
  if (assigneToObject.value == "--") {
    assigneToObject.value = formObject["Assigned To"];
  }
  obj.data.push(statusObject);
  obj.data.push(dueDateObject);
  obj.data.push(checklistTypeObject);
  obj.data.push(locationObject);
  obj.data.push(assigneToObject);
  obj.data.push(assigneeUserObject);
  obj.data.push(tradeObject);
  obj.data.push(codeObject);
  obj.data.push(createdByObject);
  return obj;
};

export const rfiFormMapper = (formResponse: any) => {
  const form = formResponse.data?.forms?.[0];
  if (!form) {
    return {} as ICommonPopoverDetail;
  }
  const obj = {} as ICommonPopoverDetail;
  const formValueMap = getFieldValueMap(
    form?.formsData as Array<IFormDataObject>
  );
  const assigneeObject = {
    label: "Assignee",
    value:
      formValueMap["DirPerson_AssignedTo_Name"] ||
      formValueMap["Assignee Name"] ||
      "--",
  } as ICommonFieldDetail;
  const responsibleContractor = formResponse.data?.formsCompanyLists?.map(
    (item: any) => item.name
  );
  const responsibleContractorObject = {
    label: "Responsible Contractor",
    value:
      responsibleContractor.length && responsibleContractor[0] != undefined
        ? responsibleContractor.join(", ")
        : "--",
  } as ICommonFieldDetail;

  const rfiTypeObject = {
    label: "RFI Type",
    value: formValueMap?.["RFI Type"] || formValueMap["RFIType"] || "--",
  } as ICommonFieldDetail;

  //responsibleContractorObject
  const responsibleContractorCaption = "Responsible Contractor";
  formResponse.data?.formsCompanyLists?.forEach((formCompanyList: any) => {
    if (
      formCompanyList?.formTemplateFieldData?.caption.toLowerCase() ==
      responsibleContractorCaption.toLowerCase()
    ) {
      if (responsibleContractorObject.value == "--") {
        responsibleContractorObject.value =
          formCompanyList?.tenantCompanyAssociation?.name || "--";
      }
    }
  });

  formResponse?.data?.formsUserLists.forEach((userList: any) => {
    if (userList?.formTemplateFieldData?.caption === "Assignee") {
      const { firstName, lastName } = userList?.user;
      if (assigneeObject.value == "--") {
        assigneeObject.value = firstName ? `${firstName}  ${lastName}` : "--";
      }
    }
  });

  const assigneeList = formResponse.data?.formsUserLists?.map(
    (userInfo: any) => userInfo.user.firstName + " " + userInfo.user.lastName
  );

  if (assigneeObject.value == "--") {
    assigneeObject.value = assigneeList.length ? assigneeList.join(", ") : "--";
  }

  formResponse?.data?.formsConfigLists.forEach((formConfigItem: any) => {
    if (rfiTypeObject.value == "--") {
      if (
        (formConfigItem?.formTemplateFieldData?.caption == "RFI Type") |
        "RFIType"
      ) {
        rfiTypeObject.value = formConfigItem?.configValue.join(", ");
      }
    }
  });

  const rfiFormId =
    formValueMap["RFIId"] ||
    formValueMap["RFI ID"] ||
    form?.projectAutoIncrement ||
    "";
  obj.id = `${POPOVER_TYPES.RFI} ${rfiFormId ? `#${rfiFormId}` : ""}`;
  obj.title = formValueMap["Subject"] || "";
  obj.data = [] as Array<ICommonFieldDetail>;
  obj.attachment = formResponse.data.formsAttachmentList;
  obj.taskLink = formResponse.data.formTaskLinks;

  const statusObject = {
    label: "Status",
    value: form.formState || "--",
  } as ICommonFieldDetail;

  const dueDateObject = {
    label: "Due Date",
    value: form.dueDate ? moment(form.dueDate).format("DD MMM YYYY") : "--",
  } as ICommonFieldDetail;

  const costImpactObject = {
    label: "Cost Impact",
    value: form.costImpact ? "Yes" : "No",
  } as ICommonFieldDetail;

  const scheduleImpactObject = {
    label: "Schedule Impact",
    value: form.scheduleImpact ? "Yes" : "No",
  } as ICommonFieldDetail;

  obj.data.push(statusObject);
  obj.data.push(dueDateObject);
  obj.data.push(assigneeObject);
  obj.data.push(rfiTypeObject);
  obj.data.push(responsibleContractorObject);
  obj.data.push(costImpactObject);
  obj.data.push(scheduleImpactObject);
  return obj;
};
