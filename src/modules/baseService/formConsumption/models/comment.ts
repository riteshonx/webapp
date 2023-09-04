
    export interface CreatedByUser {
        firstName: string;
        id: string;
        lastName: string;
    }

    export interface UpdatedByUser {
        firstName: string;
        id: string;
        lastName: string;
    }

    export interface ChildComment {
        id: number;
        comment: string;
        createdByUser: CreatedByUser;
        updatedByUser: UpdatedByUser;
    }


    export class FormComment {
        constructor( 
            public id: number,
            public comment: string,
            public childComments: Array<FormComment>,
            public createdByUser: CreatedByUser,
            public createdAt: Date,
            public parentId: any ){

            }
    }



