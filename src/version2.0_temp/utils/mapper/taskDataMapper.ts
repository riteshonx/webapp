import {
  ICommonFieldDetail,
  ICommonPopoverDetail,
} from 'src/version2.0_temp/models/task';

export const taskDataMapper = (task: any): ICommonPopoverDetail => {
  const obj = {} as ICommonPopoverDetail;
  obj.title = task.task.taskName || '--';
  obj.data = [] as Array<ICommonFieldDetail>;

  // Task Name
  const taskNameObject = {
    label: 'Task Name',
    value: task.task.taskName || '--',
  } as ICommonFieldDetail;

  // Task duration
  const dateObject = {
    label: 'Dates',
    value: `${task.task.plannedStartDate} - ${task.task.plannedEndDate}`,
  } as ICommonFieldDetail;

  // Task location
  const locationObject = {
    label: 'Location',
    value: '--',
  } as ICommonFieldDetail;

  // Task Float
  const floatObject = {
    label: 'Float',
    value: task.task.floatValue,
  } as ICommonFieldDetail;

  // Task Code
  const codeObject = {
    label: 'Code',
    value: task.task?.classificationCode
      ? task.task?.classificationCode?.classificationCode &&
        task.task?.classificationCode?.classificationCodeName
        ? `${task.task
            ?.classificationCode?.classificationCode}-${task.task
              ?.classificationCode?.classificationCodeName}`
        : task.task?.classificationCode?.classificationCode ||
          task.task?.classificationCode?.classificationCodeName ||
          '--'
      : '--'
  } as ICommonFieldDetail;

  // Task Description
  const descriptionObject = {
    label: 'Description',
    value: task.task.description || '--',
  } as ICommonFieldDetail;

  // Task Predecessor
  const predecessorList = (task.Preceding || []).map(
    (e: any) => e?.projectTaskBySource?.taskName
  );
  const predecessorObject = {
    label: 'Predecessor',
    value: predecessorList.length ? predecessorList.join(', ') : '--',
  } as ICommonFieldDetail;

  // Task Milestone
  const milestoneObject = {
    label: 'Milestone',
    value: '--',
  } as ICommonFieldDetail;

  // Task Progress
  const progressObject = {
    label: 'Progress',
    value: task.task.progress,
  } as ICommonFieldDetail;

  // Task Material
  const taskMaterialAssociationsList = task.task.projectTaskMaterialAssociations || []
  const materialList = taskMaterialAssociationsList.map((e: any) => {
    return e.projectMaterial.materialMaster.materialName || null
  }).filter((e: any) => e !== null)

  const materialObject = {
    label: 'Material',
    value: materialList.join(', '), // TODO: need to bind with data
  } as ICommonFieldDetail;

  // Task Constraints
  const taskConstraints = {
    label: 'Constraints',
    value:
      (task.task.projectTaskConstraints || [])
        .map((e: any) => e.constraintName)
        .join(', ') || '--',
  } as ICommonFieldDetail;

  // Task Cost
  const costObject = {
    label: 'Cost',
    value: '--',
  } as ICommonFieldDetail;

  // Task Weather
  const weatherObject = {
    label: 'Weather',
    value: '--',
  } as ICommonFieldDetail;

  // Task Links
  const linkObject = {
    label: 'Link',
    value: '--',
  } as ICommonFieldDetail;

  // Task Attachments
  const attachmentsObject = {
    label: 'Attachments',
    value: '--',
  } as ICommonFieldDetail;

  // Task Variance
  const varianceList = task.task.projectTaskVariances || []
  const varianceObject = {
    label: 'Variance',
    value: varianceList.map((e: any) => {
      return e.varianceName;
    }).join(', '),
  } as ICommonFieldDetail;

  obj.data.push(taskNameObject);
  obj.data.push(dateObject);
  // obj.data.push(locationObject);
  obj.data.push(floatObject);
  obj.data.push(codeObject);
  obj.data.push(descriptionObject);
  obj.data.push(predecessorObject);
  obj.data.push(milestoneObject);
  // obj.data.push(progressObject);
  obj.data.push(materialObject);
  obj.data.push(taskConstraints);
  obj.data.push(costObject);
  obj.data.push(weatherObject);
  obj.data.push(linkObject);
  obj.data.push(attachmentsObject);
  obj.data.push(varianceObject);
  return obj;
};
