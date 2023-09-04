export abstract class commentsModel {
    static modelName = 'comments';
    static insertInputType= '';
    static selector = {
      id: 'id',
      comment: 'comment',
      lastName: 'lastName',
      firstName: 'firstName',
      parentId: 'parentId',
      formId: 'formId',
      createdAt: 'createdAt',
      affectedRows: 'affected_rows'
    };
    static relation= {
      childComments: 'childComments',
      createdByUser: 'createdByUser'
    };
  }