import { FormType } from '../../../models/formType';

export class SelectableFormType {
    public selectableFormTypeId: number;
    public selected = false;
    public formType: FormType;

    constructor(formType: FormType, selected?: boolean) {
        this.selectableFormTypeId = formType.formTypeId;
        this.formType = formType;
        this.selected = selected !== undefined ? selected : false;
    }

    public get formTypeName() {
        return this.formType.formType;
    }
}