export interface IFormSyncStatus {
    id: number;
    createdAt: string;
    updatedAt: string;
    externalTotal: number;
    syncedTotal: number;
    inProgress: boolean;
    featureId: number;
}