export interface FormStatus {
    closedForms: number;
    openForms: number;
    locationId: string;
    openIssueCount: number;
    notStartedForms: number;
    readyFormsCount: number;
    featureId?: number;
}