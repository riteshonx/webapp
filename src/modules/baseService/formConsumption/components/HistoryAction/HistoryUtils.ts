import { FieldType } from "src/utils/constants";

export const FieldNameMap = new Map([
  ["dueDate", "Due date"],
  ["status", "Status"],
  ["createdBy", "Created By"],
  ["createdAt", "Created on"],
  ["updatedBy", "Updated by"],
  ["costImpact", "Cost Impact"],
  ["scheduleImpact", "Schedule Impact"],
  ["completedBy", "Completed on"],
  ["completedAt", "Completed by"],
]);

// The following list of events will be ignored and hence shall not be shown on the activity timeline
export const ignoredEvents = [
  FieldType.DUE_DATE,
  FieldType.STATUS,
  FieldType.BLOCKED_BY_COUNTER,
  FieldType.COST_IMPACT_COMMENTS,
  FieldType.SCHEDULE_IMPACT_COMMENTS,
];

export const groupByKey = (array: Array<any>, key: any) => {
  return array.reduce((hash: any, obj: any) => {
    if (obj[key] === undefined) return hash;
    return Object.assign(hash, {
      [obj[key]]: (hash[obj[key]] || []).concat(obj),
    });
  }, {});
};

export function dateSorter(a: any, b: any) {
  const c: any = new Date(a.createdAt);
  const d: any = new Date(b.createdAt);
  return d - c;
}

// Helper method to remove all items except the one specified
export function removeAllEventsExcept(events: any, except: string) {
  return events.filter((event: any) => event.field === except);
}
