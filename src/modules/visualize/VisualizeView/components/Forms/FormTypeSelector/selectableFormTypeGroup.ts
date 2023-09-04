import { FormTypeGroup } from '../groupingWhiteList/FormTypeGroup';
import { SelectableFormType } from './selectableFormTypes';

export class SelectableFormTypeGroup {
    public selectableFormTypeGroupId: string;
    public name: string;
    public selectableFormTypes: SelectableFormType[];

    constructor(formTypeGroup: FormTypeGroup, selected?: boolean) {
        this.selectableFormTypeGroupId = formTypeGroup.formTypeGroupId;
        this.name = formTypeGroup.name;

        const tasks = formTypeGroup.featureTypeTasks;
        this.selectableFormTypes = tasks.map((task) => task.featureTypes.map((formType) => new SelectableFormType(formType, selected))).flat();
    }

    public set selected(selected: boolean) {
        this.selectableFormTypes.forEach((selectableFormType) => selectableFormType.selected = selected);
    }

    public get selected() {
        const someChildrenAreNotSelected = this.selectableFormTypes.some((selectableFormType) => !selectableFormType.selected);
        return !someChildrenAreNotSelected;
    }

    public get indeterminate() {
        const someChildrenAreNotSelected = this.selectableFormTypes.some((selectableFormType) => !selectableFormType.selected);
        const someChildrenAreSelected = this.selectableFormTypes.some((selectableFormType) => selectableFormType.selected);

        return someChildrenAreNotSelected && someChildrenAreSelected;
    }
}