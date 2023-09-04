export abstract class LessonsLearned {
  static modelName = 'lessonslearnedProjectInsights';
  static selector = {
    id: 'id',
    subject: 'subject',
    description: 'description',
    outcomeType: 'outcomeType',
    projectId: 'projectId',
    stage: 'stage',
    rank: 'rank',
    status: 'status',
    insightId: 'insightId',
    projectPrimarySystem: 'projectPrimarySystem',
    followUpAction: 'followUpAction',
    leadTime: 'leadTime',
    projectDateRaised: 'projectDateRaised',
    projectSecondarySystem: 'projectSecondarySystem',
    updatedAt: 'updatedAt',
    action: 'action',
    taskId: 'taskId',
    taskName: 'taskName',
    taskType: 'taskType',
    activity: 'activity',
    userRole: 'userRole',
    fileName: 'fileName',
    fileSize: 'fileSize',
    fileType: 'fileType',
    blobKey: 'blobKey',
    deleted: 'deleted'
  };
  static relation = {
    lessonslearnedInsight: 'lessonslearnedInsight',
    lessonslearnedTaskInsights: 'lessonslearnedTaskInsights',
    projectTask: 'projectTask',
    form: 'form',
    attachments: 'attachments'
  };
}