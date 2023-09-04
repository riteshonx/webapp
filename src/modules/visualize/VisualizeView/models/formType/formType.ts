import { IFormType } from './IFormType';

export class FormType {
    public formTypeId: number;
    public formType: string;

    constructor(formType: IFormType) {
        this.formTypeId = formType.formTypeId;
        this.formType = formType.formType;
    }
}