export class Role{
    constructor(
    public id: number,
    public role: string,
    public updatedAt: Date,
    public createdAt: Date,
    public description: string,
    public tenantId: number,
    public systemGenerated: boolean,
    public actions?: any,
    public deleted?:boolean){}
}

export class CopyRolePayload{
    constructor(public roleId: number, public roleName: string, public roleType: RoleTye){}
}

export enum RoleTye{
    tenant= 'TENANT',
    project= 'PROJECT'
}

export enum PermissionType{
    admin= 'ADMIN',
    editor= 'EDITOR',
    viewer= 'VIEWER',
    none= 'NONE',
    onlyCompany= 'COMPANY_RELATIONSHIP',
    entireAccount= 'ENTIREACCOUNT'
}

export interface PermissionsType{
    name: string;
    value: PermissionType;
  }

export const userPermissionList: Array<PermissionsType>=[
    {
      name: 'Apply across entire account',
      value: PermissionType.entireAccount
    },
    {
      name: 'Apply to only user\'s company',
      value: PermissionType.onlyCompany
    },
  ];

  export class RolePayload{
    constructor(public roleName: string,public description: string, public roleType: string, public permissions: Permission[]){
    }
  }

  export interface Permission {
    feature: string;
    permission: string;
  }

  export enum RoleFeature{
    company= 'COMPANY',
    user= 'USER',
    project= 'PROJECT',
    role= 'ROLE',
    rfi= 'RFI',
    formTemplate='FORM_TEMPLATE',
    projectSetup= 'PROJECT_SETUP',
    customList= 'CUSTOM_LIST',
    userRealtionship= 'USER_RELATIONSHIP',
    companyRelationship= 'COMPANY_RELATIONSHIP',
    taskLibrary= 'TASK_LIBRARY',
    workflow= 'WORKFLOW',
    calender= 'CALENDAR',
    projectPlan= 'PROJECT_PLAN',
    customForm= 'CUSTOM FORM',
    bim= 'BIM'
  }