export interface  TaskLibraryModel{
    taskName: string;
    description: string;
    taskType: string;
    duration: number;
    customId: string;
    customTaskType: string;
    classification: string;
    tag: null;
    id: number;
    createdBy: number,
    createdAt: Date,
    tenantAssociation: TenantAssociation
}

export interface TenantAssociation{
    user: User
}
export interface User{
    firstName: string
    lastName: string
}