import { validate as isValidUUID } from "uuid";
import moment from "moment";

export function generateActvitiesFromTimesheet(timeSheetEntries: any) {
  const assignedActivies = timeSheetEntries.map((item: any) => {
    return {
      taskName: item?.metadata?.taskName?.new ?? item?.metadata?.taskName?.old,
      status: item?.metadata?.status?.new
        ? item?.metadata?.status?.new
        : item?.metadata?.status?.old
        ? item?.metadata?.status?.old
        : "--",
      category: item?.metadata?.category?.new,
      variance: item?.metadata?.varianceName?.new,
      actualStartDate: item?.metadata?.actualStartDate,
      actualEndDate: item?.metadata?.actualEndDate,
      plannedStartDate: item?.metadata?.plannedStartDate,
      plannedEndDate: item?.metadata?.plannedEndDate,
      timeSheetId: item.id,
      comments: item?.comments,
      attachments: item?.attachments,
    };
  });
  return assignedActivies;
}

export function navigateBackIfRequiredParamsAreInvalid(
  userId: string,
  dailyLogDate: string
) {
  let shouldNavigateBack = false;
  if (!userId || !dailyLogDate) {
    shouldNavigateBack = true;
  }

  if (userId) {
    if (!isValidUUID(userId)) {
      console.error("Invalid user id format. Navigating to List Page");
      shouldNavigateBack = true;
    }
  }
  if (dailyLogDate) {
    const dateFormat = "YYYY-MM-DD";
    const isValidDate = moment(dailyLogDate, dateFormat, true).isValid();
    if (!isValidDate) {
      console.error("Invalid date format. Navigating to List Page");
      shouldNavigateBack = true;
    }
  }

  return shouldNavigateBack;
}
