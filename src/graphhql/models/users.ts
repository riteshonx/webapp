export abstract class User {
    static modelName = 'user';
    static selector = {
      id: 'id',
      lastName: 'lastName',
      firstName: 'firstName',
      email: 'email',
      lastLoggedIn: 'lastLoggedIn',
      status: 'status',
      phone: 'phone',
      jobTitle: 'jobTitle',
      role: 'role',
      affectedRows: 'affected_rows'
    };
    static relation = {
      role: 'tenantRole',
      userStatus: 'userStatus',
      tenantAssociations: 'tenantAssociations'
    };
  }
  