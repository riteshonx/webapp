import StatusWithUpdatedTime from "../../components/Composite/StatusWithUpdatedTime";
import AssignedActivityItem from "../../components/Large/AssignedActivityItem";
import type { StatusValue as AssignedActivityStatusType } from "../../components/Small/StatusSelector";
import type { StatusValue as UpcomingActivityStatusType } from "../../components/Composite/UpcomingActivityStatus";
import { formatDateForAssignedActivity, some } from "../../utils";
import UpcomingActivityItem from "../../components/Large/UpcomingActivityItem";
import UpcomingActivityStatus from "../../components/Composite/UpcomingActivityStatus";
import PhotoGrid from "../../components/Large/PhotoGrid";
import SummaryBadge from "../../components/Micro/SummaryBadge";
import DelayedActivityItem from "../../components/Large/DelayedActivityItem";
import VarianceInfoItem from "../../components/Large/VarianceInfoItem";

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

function getUpcomingActivityStatusMapping(
  projectTaskConstraints: Array<any>
): UpcomingActivityStatusType {
  let status: UpcomingActivityStatusType = "readyToGo";

  if (projectTaskConstraints.length > 0) {
    const isAnyConstraintOpen = some(
      (constraint: any) => constraint.status === "open"
    )(projectTaskConstraints);
    if (isAnyConstraintOpen) {
      status = "constrained";
    }
  }
  return status;
}

function getStartDate(activity: any) {
  const { status, actualStartDate, plannedStartDate } = activity;
  let date;
  if (
    typeof actualStartDate == "string" ||
    typeof plannedStartDate == "string"
  ) {
    date = actualStartDate;
    console.log(`status: ${status}`);
    if (status === "To-Do" || status === "NOT_STARTED") {
      date = plannedStartDate;
    }
  } else {
    date = actualStartDate.new ?? actualStartDate.old;
    if (status === "To-Do") {
      date = plannedStartDate.new ?? plannedStartDate.old;
    }
  }
  return formatDateForAssignedActivity(date);
}

function getEndDate(activity: any) {
  const { status, actualEndDate, plannedEndDate } = activity;
  let date;
  if (typeof actualEndDate == "string" || typeof plannedEndDate == "string") {
    date = plannedEndDate;
    if (status === "Complete") {
      date = actualEndDate;
    }
  } else {
    date = plannedEndDate.new ?? plannedEndDate.old;
    if (status === "Complete") {
      date = actualEndDate.new ?? actualEndDate.old;
    }
  }
  return formatDateForAssignedActivity(date);
}

function getFloatValue(floatValue: any) {
  if (floatValue) {
    if (floatValue.new !== null) {
      const newVal = floatValue.new == 0 ? "Critical" : floatValue.new;
      return newVal;
    } else if (floatValue.old !== null) {
      const oldVal = floatValue.old == 0 ? "Critical" : floatValue.old;
      return oldVal;
    } else {
      return "--";
    }
  } else {
    return "--";
  }
}

export function generateAssignedActivityRowComponent(
  activities: Array<any>,
  readOnly = false
) {
  return activities.map((activity: any) => {
    const { comments } = activity;
    //property 'comments' may not always be present since only a subset of activities would be there in timeSheetEntries
    const comment = comments?.find((comment: any) => !comment.deleted);
    return {
      key: activity.taskName,
      components: [
        <StatusWithUpdatedTime
          statusProps={{
            initValue: getAssignedActivityStatusMapping(activity.status),
            taskId: activity.id,
            actualStartDate: activity.actualStartDate,
            updateNeeded: !activity.isUpdated,
            createdAt:activity.createdAt,
            plannedDuration: activity.plannedDuration
          }}
          updatedNeeded={!activity.isUpdated}
          showUpdateNeededLabel={!readOnly}
          updatedTime="12:22"
          taskId={activity.taskName}
          readOnly={false}
          updatedAt={activity.updatedAt}
        />,
        <AssignedActivityItem
          status={activity.status}
          activityName={activity.taskName}
          startDate={getStartDate(activity)}
          endDate={getEndDate(activity)}
          disableEnd={activity.status !== "Complete"}
          disableStart={activity.status === "To-Do" || activity.status === "NOT_STARTED"}
          timeSheetId={
            activity && activity.timeSheetId ? activity.timeSheetId : ""
          }
          taskId={activity.id}
          comment={comment?.comment || ""}
          readOnly={false}
          variance={activity?.variance || ""}
          category={activity?.category || ""}
        />,
        <PhotoGrid
          readOnly={readOnly}
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

export function generateUpcomingActivityRowComponent(
  activities: Array<any>,
  readOnly = false
) {
  return activities.map((activity: any) => {
    return {
      key: activity.taskName,
      components: [
        <UpcomingActivityStatus
          status={getUpcomingActivityStatusMapping(
            activity.projectTaskConstraints
          )}
          taskId={activity.id}
          readOnly={readOnly}
        />,
        <UpcomingActivityItem
          activityName={activity.taskName}
          startDate={getStartDate(activity)}
          endDate={getEndDate(activity)}
          constraints={activity.projectTaskConstraints}
          readOnly={readOnly}
        />,
      ],
    };
  });
}

export function generateActivitySummaryRowComponent(activities: Array<any>) {
  return activities.map((activity: any) => {
    return {
      key: activity.taskId,
      components: [
        <SummaryBadge value={getFloatValue(activity?.floatValue)} />,
        <DelayedActivityItem
          activityName={
            activity?.taskName &&
            (activity?.taskName.new
              ? activity?.taskName.new
              : activity?.taskName.old)
          }
          startDate={
            activity?.plannedStartDate &&
            (activity?.plannedStartDate.new
              ? activity?.plannedStartDate.new
              : activity?.plannedStartDate.old
              ? activity?.plannedStartDate.old
              : "--")
          }
          actualEndDate={
            activity?.plannedEndDate &&
            (activity?.plannedEndDate.new
              ? activity?.plannedEndDate.new
              : activity?.plannedEndDate.old
              ? activity?.plannedEndDate.old
              : "--")
          }
          updatedEndDate=""
          assignee={
            activity?.assignee &&
            (activity?.assignee.firstName && activity?.assignee.lastName
              ? activity?.assignee.firstName + " " + activity?.assignee.lastName
              : activity?.assignee.firstName)
          }
          //isNew={true}
        />,
        <VarianceInfoItem
          varianceName={
            activity?.category &&
            (activity?.category.new
              ? activity?.category.new
              : activity?.category.old
              ? activity?.category.old
              : "--")
          }
          varianceDescription={
            activity?.varianceName &&
            (activity?.varianceName.new
              ? activity?.varianceName.new
              : activity?.varianceName.old
              ? activity?.varianceName.old
              : "--")
          }
          comments={
            activity?.comments &&
            activity?.comments.length &&
            (activity?.comments[0].comment
              ? activity?.comments[0].comment
              : "--")
          }
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
