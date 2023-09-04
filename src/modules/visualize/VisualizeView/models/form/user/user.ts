import { IUser } from './IUser';

export class User {
    public firstName: string;
    public lastName: string;

    constructor(user: IUser) {
        this.firstName = user.firstName;
        this.lastName = user.lastName;
    }

    public get fullName() {
        return `${this.firstName} ${this.lastName}`;
    }
}