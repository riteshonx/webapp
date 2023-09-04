import { FormTypeTask } from './FormTypeTask';

export class FormTypeGroup {
    public formTypeGroupId: string;
    public name: string;
    public featureTypeTasks: FormTypeTask[] = [];

    constructor(formTypeGroupId: string, name: string) {
        this.formTypeGroupId = formTypeGroupId;
        this.name = name;
    }

    public addTask(formTypeTask: FormTypeTask) {
        this.featureTypeTasks.push(formTypeTask);
    }

    public get hasChildren() {
        return this.featureTypeTasks.length > 0;
    }

    public get featureTypes() {
        return this.featureTypeTasks.map((task) => task.featureTypes).flat();
    }
}