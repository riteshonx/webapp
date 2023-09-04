
export interface Activity {
    isSelected: boolean,
    isAdded: boolean,
    id: string,
    taskName: string,
    taskType: string,
    taskId: string,
    status: string,
    plannedStartDate: string,
    parentDetails: {
        taskName: string;
    }
}

export interface Attachment {
    fileName: string;
    fileSize: number;
    fileType: string;
    blobKey: string;
    deleted: boolean;
}

export interface Form {
    attachments: Array<Attachment>
}

export interface LessonslearnedInsight {
    id: string;
    description: string;
    subject: string;
    outcomeType: string;
    projectId: number;
    stage: string;
    followUpAction: string;
    leadTime: number;
    projectDateRaised: string;
    projectPrimarySystem: string;
    projectSecondarySystem: string;
    updatedAt: string;
    activity: string;
    userRole: string;
    form: Form;
}
export interface LessonslearnedTaskInsights {
    id: string;
    action: string;
    taskId: string;
    projectTask: Activity;
}
export interface LessonsLearned {
    id: string;
    lessonslearnedInsight: LessonslearnedInsight;
    lessonslearnedTaskInsights: Array<LessonslearnedTaskInsights>;
    rank: number;
    status: Array<string>;
    insightId: string;
}

export interface FilterGroup {
    name: string;
    options: Array<FilterObject>;
}

export interface FilterObject {
    name: string;
    type: string;
    value: string | number | boolean;
}

export interface SortByObject {
    name: string;
    query: string;
    value: boolean;
}

export interface ScheduleTask {
    [key:string]: any
}

export type ScheduleImpactType =
    "dailylogs" | "weather" | "rfi" | "material" | "constraintlogs"

export interface ScheduleImpactMsgs {
    impactId: number;
    msg: string;
    priority: string;
    type: ScheduleImpactType
}

export interface ScheduleImpactTask {
    delay: number;
    early: number;
    remainingFloat: number;
    floatValue: number;
    plannedStartDate: string;
    priority: string;
    taskId: string;
    taskName: string;
    msgs: Array<ScheduleImpactMsgs>
}

export interface Schedule {
    id: string;
    msg: string;
    ruleName: string;
    createdAt: string;
    title: string;
    component: string;
    tasks: {
        tasks: Array<ScheduleTask>;
    }
}

export interface Insights {
    lessonsLearnedList: Array<LessonsLearned>,
    scheduleList: Array<Schedule>;
    openTab: string;
    scheduleSearchKeyword: string;
    scheduleImpactSearchKeyword: string;
    lessonsLearnedsearchKeyword: string;
    openInsight: string;
    detailSchedule: Schedule;
    detailLessonsLearned: LessonsLearned;
    lessonsLearnedFiltersCount: number;
    lessonsLearnedFilters: Array<FilterGroup>;
    lessonsLearnedSortBy: Array<SortByObject>;
    scheduleImpactSortBy: Array<SortByObject>;
    scheduleImpactFilters: Array<FilterGroup>;
    scheduleImpactList: Array<ScheduleImpactTask>;
    filterdScheduleImpactList: Array<ScheduleImpactTask>;
    detailScheduleImpact: ScheduleImpactTask;
}

export interface IInsightsContext {
    insightsState: Insights;
    insightsDispatch: any
}