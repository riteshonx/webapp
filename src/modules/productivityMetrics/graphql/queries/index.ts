import { productivityMetrics } from "../models";
import { gql } from '@apollo/client';

export const FETCH_PRODUCTIVITY_METRICS = gql`query getProductivityMetrics {
  ${productivityMetrics.modelName} (order_by: {projectTask: {plannedStartDate: desc}}) {
    ${productivityMetrics.selector.dimension}
    ${productivityMetrics.selector.classificationCodeId}
    ${productivityMetrics.selector.taskId}
    ${productivityMetrics.selector.linkedItemsCount}
    ${productivityMetrics.selector.dailylogDate}
    ${productivityMetrics.selector.variancesCount}
    ${productivityMetrics.selector.labourId}
    ${productivityMetrics.selector.actualQty}
    ${productivityMetrics.selector.plannedQty}
    ${productivityMetrics.selector.actualHrs}
    ${productivityMetrics.selector.plannedHrs}
    ${productivityMetrics.selector.projectedHrs}
    ${productivityMetrics.selector.deltaHrs}
    ${productivityMetrics.selector.criticalFloatPercentage}
    ${productivityMetrics.selector.actualDuration}
    ${productivityMetrics.selector.actualDuration}
    ${productivityMetrics.selector.plannedDuration}
    ${productivityMetrics.selector.projectedDuration}
    ${productivityMetrics.selector.deltaDuration}
    ${productivityMetrics.selector.actualProductivity}
    ${productivityMetrics.selector.plannedProductivity}
    ${productivityMetrics.selector.requiredProductivity}
    ${productivityMetrics.relation.classificationCode} {
      ${productivityMetrics.selector.classificationCodeName}
      ${productivityMetrics.selector.classificationCode}
      ${productivityMetrics.selector.UOM}
    }
    ${productivityMetrics.relation.projectTask} {
      ${productivityMetrics.selector.taskName}
    }
    ${productivityMetrics.relation.labourMaster} {
      ${productivityMetrics.selector.firstName}
      ${productivityMetrics.selector.lastName}
    }
  }
}`
