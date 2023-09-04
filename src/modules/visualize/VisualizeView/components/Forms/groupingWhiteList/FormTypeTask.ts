import { FormType } from '../../../models/formType';

export class FormTypeTask {
    public taskId: string;
    public name: string;
    public parentGroupId: string;
    public featureTypes: FormType[] = [];

    constructor(taskId: string, name: string, parentGroupId: string) {
        this.taskId = taskId;
        this.name = name;
        this.parentGroupId = parentGroupId;
    }

    public addFeatureType(featureType: FormType) {
        this.featureTypes.push(featureType);
    }

    public get hasChildren() {
        return this.featureTypes.length > 0;
    }

    public containsFeatureType(featureType: FormType) {
        return Boolean(this.featureTypes.find((ft) => ft.formTypeId === featureType.formTypeId));
    }

    public getGroupFromFeatureTypes(featureTypes: FormType[]) {
        return this.featureTypes.filter((ft) => Boolean(featureTypes.find((featureType) => featureType.formTypeId === ft.formTypeId)));
    }
}