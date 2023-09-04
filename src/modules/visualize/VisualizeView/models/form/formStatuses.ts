export enum FormStatuses {
    Draft = 'Draft',
    Open = 'OPEN',
    Closed = 'CLOSED',
    Overdue = 'Overdue',
    NotFound = 'Not Found',
    Ready = 'Ready',
}

// TODO - This is a hardcoded list found in this update: https://github.com/slateai/Authentication/commit/94d1172e1fa8c2f123a3e058221b3ef0194d3768
// Ideally these values can come from the formStatus table but recent changes have made that not always the case: https://github.com/slateai/GraphQLEngine/commit/9000918937e5f1cf03da0b8dedfe1149c2e7a925
// Once we get a firm answer from the teams involved in this change about how we expect this to work the following code may need to be removed.
export const formStatusesById = {
    1: FormStatuses.Draft,
    2: FormStatuses.Open,
    3: FormStatuses.Closed,
    4: FormStatuses.Overdue,
    5: FormStatuses.Ready,
}

// TODO - Remove once normal statuses can be set via connector system.
export enum Bim360Statuses {
    NotStarted = 'Not started',
    InProgress = 'In progress',
    Completed = 'Completed',
}