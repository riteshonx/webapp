import StatusWithUpdatedTime from "../../components/Composite/StatusWithUpdatedTime";
import AssignedActivityItem from "../../components/Large/AssignedActivityItem";
import type { StatusValue as AssignedActivityStatusType } from "../../components/Small/StatusSelector";
import { formatDateForAssignedActivity } from "../../utils";
import PhotoGrid from "../../components/Large/PhotoGrid";

function getAssignedActivityStatusMapping(
  incomingStatus: string
): AssignedActivityStatusType {
  switch (incomingStatus) {
    case "To-Do":
      return "notStarted";
    case "NOT_STARTED":
      return "notStarted";
    case "In-Progress":
      return "inProgressOnTrack";
    case "IN_PROGRESS_DELAYED":
      return "inProgressDelayed";
    case "IN_PROGRESS_ON_TRACK":
      return "inProgressOnTrack";
    case "COMPLETED":
      return "completed";
    case "Complete":
      return "completed";
    case "READY_TO_START":
      return "readyToStart";
    default:
      return "showError";
  }
}

function getStartDate(activity: any) {
  const { status, actualStartDate, plannedStartDate } = activity;
  let date = actualStartDate.new ?? actualStartDate.old;
  if (status === "To-Do" || "NOT_STARTED") {
    date = plannedStartDate.new ?? plannedStartDate.old;
  }
  return formatDateForAssignedActivity(date);
}

function getEndDate(activity: any) {
  const { status, actualEndDate, plannedEndDate } = activity;
  let date = plannedEndDate.new ?? plannedEndDate.old;
  if (status === "Complete" || status === "COMPLETED") {
    date = actualEndDate.new ?? actualEndDate.old;
  }
  return formatDateForAssignedActivity(date);
}

function shouldDisableStart(activity: any) {
  const { status } = activity;
  return status === "To-Do" || status === "NOT_STARTED";
}

function shouldDisableEnd(activity: any) {
  const { status } = activity;
  return !(status === "Complete" || status === "COMPLETED");
}

export function generateAssignedActivityRowComponent(
  activities: Array<any>,
  readOnly = true
) {
  return activities.map((activity: any) => {
    const { comments } = activity;
    //property 'comments' will always be present since we are fetching from timeSheetEntries
    const comment = comments.find((comment: any) => !comment.deleted);
    return {
      key: activity.taskName,
      components: [
        <StatusWithUpdatedTime
          statusProps={{
            initValue: getAssignedActivityStatusMapping(activity.status),
            taskId: activity.id,
          }}
          updatedNeeded={!activity.isUpdated}
          showUpdateNeededLabel={!readOnly}
          updatedTime="12:22"
          taskId={activity.taskName}
          readOnly={true}
        />,
        <AssignedActivityItem
          status={activity.status}
          activityName={activity.taskName}
          startDate={getStartDate(activity)}
          endDate={getEndDate(activity)}
          disableEnd={shouldDisableEnd(activity)}
          disableStart={shouldDisableStart(activity)}
          timeSheetId={
            activity && activity.timeSheetId ? activity.timeSheetId : ""
          }
          taskId={activity.id}
          comment={comment?.comment || ""}
          readOnly={true}
          variance={activity?.variance || ""}
          category={activity?.category || ""}
        />,
        <PhotoGrid
          readOnly={true}
          taskId={activity.id}
          timeSheetId={
            activity && activity.timeSheetId ? activity.timeSheetId : ""
          }
          photos={activity?.attachments}
        />,
      ],
    };
  });
}
