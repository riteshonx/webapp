import { IFormSyncStatus } from './IFormSyncStatus';

export class FormSyncStatus {
    public id: number;
    public createdAt?: Date;
    public updatedAt?: Date;
    public externalTotal: number;
    public syncedTotal: number;
    public inProgress: boolean;
    public featureId: number;

    constructor(formSyncStatus: IFormSyncStatus) {
        this.id = formSyncStatus.id;
        this.createdAt = Boolean(formSyncStatus.createdAt) ?  new Date(formSyncStatus.createdAt) : undefined;
        this.updatedAt = Boolean(formSyncStatus.updatedAt) ?  new Date(formSyncStatus.updatedAt) : undefined;
        this.externalTotal = formSyncStatus.externalTotal;
        this.syncedTotal = formSyncStatus.syncedTotal;
        this.inProgress = formSyncStatus.inProgress;
        this.featureId = formSyncStatus.featureId;
    }
}