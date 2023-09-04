export abstract class productivityMetrics {
  static modelName = 'productivityMetrics';
  static selector = {
    dimension: 'dimension',
    classificationCodeId: 'classificationCodeId',
    classificationCode: 'classificationCode',
    taskId: 'taskId',
    linkedItemsCount: 'linkedItemsCount',
    dailylogDate: 'dailylogDate',
    variancesCount: 'variancesCount',
    labourId: 'labourId',
    actualQty: 'actualQty',
    plannedQty: 'plannedQty',
    actualHrs: 'actualHrs',
    plannedHrs: 'plannedHrs',
    projectedHrs: 'projectedHrs',
    deltaHrs: 'deltaHrs', 
    criticalFloatPercentage: 'criticalFloatPercentage',
    actualDuration: 'actualDuration',
    plannedDuration: 'plannedDuration',
    projectedDuration: 'projectedDuration',
    deltaDuration: 'deltaDuration',
    actualProductivity: 'actualProductivity',
    plannedProductivity: 'plannedProductivity',
    requiredProductivity: 'requiredProductivity',
    firstName: 'firstName',
    lastName: 'lastName',
    taskName: 'taskName',
    classificationCodeName: 'classificationCodeName',
    UOM: 'UOM'
  }
  static relation = {
    classificationCode: 'classificationCode',
    projectTask: 'projectTask',
    labourMaster: 'labourMaster'
  }
}