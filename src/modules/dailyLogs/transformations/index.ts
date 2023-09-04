import { map, compose } from "../utils";
import type { DailyLogItem } from "../components/Large/DailyLogTable";

function generateDailyLogItem(
  createdAt: string,
  createdBy: string,
  userId: string,
  formId: number,
  isGroupRow = false
): DailyLogItem {
  return {
    id: createdAt + createdBy + userId,
    createdAt,
    createdBy,
    userId,
    formId,
    isGroupRow,
  };
}

export function transformListData(data: Array<any>): Array<DailyLogItem> {
  const splitTimeAndEnrichName = map((item: any) => {
    const {
      createdByUser: { firstName, lastName },
    } = item;
    const name = firstName + " " + (lastName ?? "");
    return generateDailyLogItem(
      item.createdAt.split("T")[0],
      name.trim(),
      item.createdBy,
      item.id
      //"dummyUserId"
    );
  });
  const transformed = compose(splitTimeAndEnrichName)(data);
  const hashMap = new Map();
  transformed.forEach((element: any) => {
    const ele = hashMap.get(element.createdAt);
    if (ele) ele.push(element);
    else hashMap.set(element.createdAt, [element]);
  });
  const transformedArray: Array<DailyLogItem> = [];
  hashMap.forEach((value, key) => {
    transformedArray.push(
      generateDailyLogItem(
        key,
        "auto_created_fe_user_name",
        "auto_created_fe_user_id",
        0,
        true
      ),
      ...value
    );
  });
  return transformedArray;
}
