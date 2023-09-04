export interface IProductivityMetrics {
  dimension: string;
  classificationCodeId: number;
  classificationCode: {
    classificationCodeName: string;
    classificationCode: string;
    UOM: string;
  }
  taskId: string;
  projectTask: {
    taskName: string;
  }
  linkedItemsCount: number;
  dailylogDate: string;
  variancesCount: number;
  labourId: string;
  labourMaster: {
    firstName: string;
    lastName: string;
  }
  actualQty: number;
  plannedQty: number;
  actualHrs: number;
  plannedHrs: number;
  projectedHrs: number;
  deltaHrs: number;
  criticalFloatPercentage: number;
  actualDuration: number;
  plannedDuration: number;
  projectedDuration: number;
  deltaDuration: number;
  actualProductivity: number;
  plannedProductivity: number;
  requiredProductivity: number;
  isOpen: boolean
}

export interface IProductivityMetricsReducer {
  [key:string]: string
}