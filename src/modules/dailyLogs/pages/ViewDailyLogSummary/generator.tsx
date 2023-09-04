import PhotoGrid from "../../components/Large/PhotoGrid";
import SummaryBadge from "../../components/Micro/SummaryBadge";
import DelayedActivityItem from "../../components/Large/DelayedActivityItem";
import VarianceInfoItem from "../../components/Large/VarianceInfoItem";
import moment from "moment";

function getFloatValue(floatValue: any) {
  const newVal = floatValue == 0 ? "Critical" : floatValue;
  return newVal;
}

function getStartDate(activity: any) {
  const { actualStartDate, plannedStartDate } = activity;
  let startDate;
  startDate = actualStartDate.new ?? actualStartDate.old;
  if (!startDate) {
    startDate = plannedStartDate.new ?? plannedStartDate.old;
  }
  if (startDate) return moment(startDate).format("YYYY-MM-DD");
  return "--";
}

function getEndDate(activity: any) {
  const { actualEndDate, plannedEndDate } = activity;
  let endDate;
  endDate = actualEndDate.new ?? actualEndDate.old;
  if (!endDate) {
    endDate = plannedEndDate.new ?? plannedEndDate.old;
  }
  if (endDate) return moment(endDate).format("YYYY-MM-DD");
  return "--";
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
          startDate={getStartDate(activity)}
          actualEndDate={getEndDate(activity)}
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
