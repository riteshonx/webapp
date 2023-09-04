import { gantt } from 'dhtmlx-gantt';
import {
  decodeExchangeToken,
  decodeProjectExchangeToken,
  decodeToken,
} from '../../../services/authservice';
import {
  CalendarRoles,
  featureFormRoles,
  projectFeatureAllowedRoles,
  TaskRoles,
} from '../../../utils/role';

const allowedRoles = decodeExchangeToken().allowedRoles;

export const createTenantCalendar = allowedRoles.includes(
  CalendarRoles.createTenantCalendar
);

export const viewTenantCalendar = allowedRoles.includes(
  CalendarRoles.viewTenantCalendar
);

export const updateTenantCalendar = allowedRoles.includes(
  CalendarRoles.updateTenantCalendar
);

export const deleteTenantCalendar = allowedRoles.includes(
  CalendarRoles.deleteTenantCalendar
);

export const createTenantTask = allowedRoles.includes(
  TaskRoles.createTenantTask
);

export const viewTenantTask = allowedRoles.includes(TaskRoles.viewTenantTask);

export const updateTenantTask = allowedRoles.includes(
  TaskRoles.updateTenantTask
);

export const deleteTenantTask = allowedRoles.includes(
  TaskRoles.deleteTenantTask
);

export const priorityPermissions = (operation: string): any => {
  const allowedProjectRoles = decodeProjectExchangeToken().allowedRoles;
  let role = '';
  featureFormRoles;

  switch (operation) {
    case 'create':
      if (
        allowedProjectRoles.includes(
          projectFeatureAllowedRoles.createMasterPlan
        )
      ) {
        role = projectFeatureAllowedRoles.createMasterPlan;
      } else {
        role = projectFeatureAllowedRoles.createComponentPlan;
      }
      break;
    case 'view':
      if (
        allowedProjectRoles.includes(projectFeatureAllowedRoles.viewMasterPlan)
      ) {
        role = projectFeatureAllowedRoles.viewMasterPlan;
      } else {
        role = projectFeatureAllowedRoles.viewComponentPlan;
      }
      break;
    case 'update':
      if (
        allowedProjectRoles.includes(
          projectFeatureAllowedRoles.updateMasterPlan
        )
      ) {
        role = projectFeatureAllowedRoles.updateMasterPlan;
      } else {
        role = projectFeatureAllowedRoles.updateComponentPlan;
      }
      break;
    case 'delete':
      if (
        allowedProjectRoles.includes(
          projectFeatureAllowedRoles.deleteMasterPlan
        )
      ) {
        role = projectFeatureAllowedRoles.deleteMasterPlan;
      } else {
        role = projectFeatureAllowedRoles.deleteComponentPlan;
      }
      break;
    case 'create-form':
      if (allowedProjectRoles.includes(featureFormRoles.createForm)) {
        role = featureFormRoles.createForm;
      } else {
        role = '';
      }
      break;
  }
  return role;
};

export const permissionKeys = (assigneeId: string): any => {
  const userId = decodeToken().userId;
  const allowedProjectRoles = decodeProjectExchangeToken().allowedRoles;
  const permissionKeys: any = {};
  permissionKeys.create = getPermissionValues(
    assigneeId,
    userId,
    allowedProjectRoles,
    projectFeatureAllowedRoles.createMasterPlan,
    projectFeatureAllowedRoles.createComponentPlan
  );
  permissionKeys.view = getPermissionValues(
    assigneeId,
    userId,
    allowedProjectRoles,
    projectFeatureAllowedRoles.viewMasterPlan,
    projectFeatureAllowedRoles.viewComponentPlan
  );
  permissionKeys.update = getPermissionValues(
    assigneeId,
    userId,
    allowedProjectRoles,
    projectFeatureAllowedRoles.updateMasterPlan,
    projectFeatureAllowedRoles.updateComponentPlan
  );
  permissionKeys.delete = getPermissionValues(
    assigneeId,
    userId,
    allowedProjectRoles,
    projectFeatureAllowedRoles.deleteMasterPlan,
    projectFeatureAllowedRoles.deleteComponentPlan
  );
  return permissionKeys;
};

export const getPermissionValues = (
  assigneeId: string,
  userId: string,
  allowedProjectRoles: any,
  masterRole: string,
  componentRole: string
) => {
  if (allowedProjectRoles.includes(masterRole)) {
    return true;
  } else if (allowedProjectRoles.includes(componentRole)) {
    if (userId == assigneeId) {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
};

export const canChangeStatus = (constraint: any): boolean | undefined => {
  const permission = permissionKeys(constraint?.assignedTo);
  if (permission.create) return true;
  else if (permission.view) return false;
};

export const canEditConstraint = (constraint: any) => {
  if (constraint?.category?.toLowerCase() === 'form') return false;
  if (gantt.getTask(constraint?.taskId)?.status === 'To-Do') {
    const permission = permissionKeys(constraint?.assignedTo);
    if (permission.create) return true;
    else if (permission.view) return false;
  } else {
    return false;
  }
};

export const priorityPermissionsByToken = (
  operation: string,
  token: string
): any => {
  const allowedProjectRoles = decodeProjectExchangeToken(token).allowedRoles;
  let role = '';
  switch (operation) {
    case 'create':
      if (
        allowedProjectRoles.includes(
          projectFeatureAllowedRoles.createMasterPlan
        )
      ) {
        role = projectFeatureAllowedRoles.createMasterPlan;
      } else {
        role = projectFeatureAllowedRoles.createComponentPlan;
      }
      break;
    case 'view':
      if (
        allowedProjectRoles.includes(projectFeatureAllowedRoles.viewMasterPlan)
      ) {
        role = projectFeatureAllowedRoles.viewMasterPlan;
      } else {
        role = projectFeatureAllowedRoles.viewComponentPlan;
      }
      break;
    case 'update':
      if (
        allowedProjectRoles.includes(
          projectFeatureAllowedRoles.updateMasterPlan
        )
      ) {
        role = projectFeatureAllowedRoles.updateMasterPlan;
      } else {
        role = projectFeatureAllowedRoles.updateComponentPlan;
      }
      break;
    case 'delete':
      if (
        allowedProjectRoles.includes(
          projectFeatureAllowedRoles.deleteMasterPlan
        )
      ) {
        role = projectFeatureAllowedRoles.deleteMasterPlan;
      } else {
        role = projectFeatureAllowedRoles.deleteComponentPlan;
      }
      break;
    case 'create-form':
      if (allowedProjectRoles.includes(featureFormRoles.createForm)) {
        role = featureFormRoles.createForm;
      } else {
        role = '';
      }
      break;
  }
  return role;
};

export const permissionKeysByAssigneeAndToken = (
  assigneeId: string,
  token: string
): any => {
  const userId = decodeToken().userId;
  const allowedProjectRoles = decodeProjectExchangeToken(token).allowedRoles;
  const permissionKeys: any = {};
  permissionKeys.create = getPermissionValues(
    assigneeId,
    userId,
    allowedProjectRoles,
    projectFeatureAllowedRoles.createMasterPlan,
    projectFeatureAllowedRoles.createComponentPlan
  );
  permissionKeys.view = getPermissionValues(
    assigneeId,
    userId,
    allowedProjectRoles,
    projectFeatureAllowedRoles.viewMasterPlan,
    projectFeatureAllowedRoles.viewComponentPlan
  );
  permissionKeys.update = getPermissionValues(
    assigneeId,
    userId,
    allowedProjectRoles,
    projectFeatureAllowedRoles.updateMasterPlan,
    projectFeatureAllowedRoles.updateComponentPlan
  );
  permissionKeys.delete = getPermissionValues(
    assigneeId,
    userId,
    allowedProjectRoles,
    projectFeatureAllowedRoles.deleteMasterPlan,
    projectFeatureAllowedRoles.deleteComponentPlan
  );
  return permissionKeys;
};
