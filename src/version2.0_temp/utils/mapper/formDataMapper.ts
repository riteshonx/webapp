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
} from 'src/version2.0_temp/models/task';

const TYPE_ID_VS_DATA_TYPE_MAP = [
  {
    typeId: 1,
    key: 'valueString',
  },
  {
    typeId: 2,
    key: 'valueString',
  },
  {
    typeId: 3,
    key: 'valueInt',
  },
  {
    typeId: 4,
    key: 'valueTime',
  },
  {
    typeId: 5,
    key: 'valueDate',
  },
  {
    typeId: 6,
    key: 'valueDate',
  },
  {
    typeId: 7,
    key: 'valueBool',
  },
  {
    typeId: 7,
    key: 'valueString',
  },
];

export const getFieldValueByFromObject = (
  formObject: IFormDataObject
): [string, any] => {
  const typeId = formObject.typeId;
  const dataKey = TYPE_ID_VS_DATA_TYPE_MAP.find((e) => e.typeId === typeId) || {
    typeId: 1,
    key: 'valueString',
  };
  return [formObject.caption, formObject[dataKey?.key] || null];
};

export const qcChecklistMapper = (form: any) => {
  const formObject = {} as {
    [key: string]: any;
  };
  (form.formsData || []).forEach((dataObject: IFormDataObject) => {
    const [key, value] = getFieldValueByFromObject(dataObject);
    formObject[key] = value;
  });
  const obj = {} as ICommonPopoverDetail

  // Title
  obj.title = formObject['Subject'] || ''
  obj.data = [] as Array<ICommonFieldDetail>

  // Status
  const statusObject = {
    label: 'Status',
    value: form.formStatus?.status || '--'
  } as ICommonFieldDetail

  // Due Date
  const dueDateObject = {
    label: 'Due Date',
    value: form.dueDate || '--'
  } as ICommonFieldDetail

  const checklistTypeObject = {
    label: 'Checklist Type',
    value: formObject['Checklist Type'] || '--'
  } as ICommonFieldDetail

  const locationObject = {
    label: 'Location',
    value: '--'
  } as ICommonFieldDetail

  const formsUserLists = form.formsUserLists || []
  const assigneeList = formsUserLists
  .filter((user: any) => user
    .formTemplateFieldData?.caption === 'Assignee')
  .map((user:any) => {
    const firstName = user.user?.firstName
    const lastName = user.user?.lastName
    return `${firstName || ''} ${lastName || ''}`.trim()
  })
  const assigneToObject = {
    label: 'Assignee to',
    value: assigneeList.length ? assigneeList.join(', ') : '--'
  } as ICommonFieldDetail

  const assigneeUserObject = {
    label: 'Assignee Type',
    value: 'User'
  } as ICommonFieldDetail

  const tradeObject = {
    label: 'Trade',
    value: '--'
  } as ICommonFieldDetail

  const codeObject = {
    label: 'Code',
    value: '--'
  } as ICommonFieldDetail

  const firstName = form.createdByUser?.firstName
  const lastName = form.createdByUser?.lastName
  const createdByObject = {
    label: 'Created By',
    value: `${firstName || ''} ${lastName || ''}`.trim()
  } as ICommonFieldDetail

  const attachmentsObject = {
    label: 'Attachments',
    value: '--'
  } as ICommonFieldDetail

  obj.data.push(statusObject)
  obj.data.push(dueDateObject)
  obj.data.push(checklistTypeObject)
  obj.data.push(locationObject)
  obj.data.push(assigneToObject)
  obj.data.push(assigneeUserObject)
  obj.data.push(tradeObject)
  obj.data.push(codeObject)
  obj.data.push(createdByObject)
  obj.data.push(attachmentsObject)

  return obj;
};
