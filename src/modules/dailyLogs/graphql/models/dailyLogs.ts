export abstract class DailyLogs {
  static modelName = "projectTask";
  static selector = {
    id: "id",
    taskId: "taskId",
    status: "status",
    taskName: "taskName",
    plannedEndDate: "plannedEndDate",
    plannedStartDate: "plannedStartDate",
    plannedDuration: "plannedDuration",
    actualDuration: "actualDuration",
    actualEndDate: "actualEndDate",
    actualStartDate: "actualStartDate",
    assignedTo: "assignedTo",
    updatedAt: "updatedAt",
  };
  static relation = {
    attachments: "attachments",
    lessonslearnedTaskInsights: "lessonslearnedTaskInsights",
    projectTask: "projectTask",
    projectTaskConstraints: "projectTaskConstraints",
  };
}
