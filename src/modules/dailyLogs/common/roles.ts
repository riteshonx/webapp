import { myProjectRole, projectFeatureAllowedRoles } from "src/utils/role";
import { decodeProjectExchangeToken } from "src/services/authservice";

const eqMatcher = (value: any) => (arg: any) => arg === value;

export const getAddDailyLogRole = () => {
  const { allowedRoles } = decodeProjectExchangeToken();
  const {
    createDailylog,
    updateComponentPlan,
    updateMasterPlan,
    viewMasterPlan,
    createComponentPlan
  } = projectFeatureAllowedRoles;
  const role = allowedRoles.find(eqMatcher(createDailylog));
  const masterPlan = allowedRoles.find(eqMatcher(viewMasterPlan)) || allowedRoles.find(eqMatcher(updateMasterPlan));
  const componentPlan = allowedRoles.find(eqMatcher(updateComponentPlan)) || allowedRoles.find(eqMatcher(createComponentPlan));
  const canAdd = role && componentPlan && masterPlan
  return [role, canAdd];
};

export const getActivitiesRole = () => {
  const { allowedRoles } = decodeProjectExchangeToken();
  const { viewMasterPlan } = projectFeatureAllowedRoles;
  const role = allowedRoles.find(eqMatcher(viewMasterPlan));
  const canAdd = role ? true : false;
  return [role, canAdd];
};

export const getUpdateConstraintRole = () => {
  const { allowedRoles } = decodeProjectExchangeToken();
  const { updateComponentPlan, updateMasterPlan } = projectFeatureAllowedRoles;
  const role =
    allowedRoles.find(eqMatcher(updateMasterPlan)) ??
    allowedRoles.find(eqMatcher(updateComponentPlan));
  const canAdd = role ? true : false;
  return [role, canAdd];
};

export const getUpdateDailyLogStatusRole = () => {
  const { allowedRoles } = decodeProjectExchangeToken();
  const { createMasterPlan, createComponentPlan } = projectFeatureAllowedRoles;
  const role =
    allowedRoles.find(eqMatcher(createMasterPlan)) ??
    allowedRoles.find(eqMatcher(createComponentPlan));
  const canAdd = role ? true : false;
  return [role, canAdd];
};

export const getDailyLogGlobalId = () => {
  const { allowedRoles } = decodeProjectExchangeToken();
  const { viewDailylog } = projectFeatureAllowedRoles;
  const role = allowedRoles.find(eqMatcher(viewDailylog));
  const canAdd = role ? true : false;
  return [role, canAdd];
};

export const getAdditionalCommentRole = () => {
  const { allowedRoles } = decodeProjectExchangeToken();
  const { createDailylog } = projectFeatureAllowedRoles;
  const role = allowedRoles.find(eqMatcher(createDailylog));
  const canAdd = role ? true : false;
  return [role, canAdd];
};

export const getFeatureIdRole = () => {
  const { allowedRoles } = decodeProjectExchangeToken();
  const { viewMyProjects } = myProjectRole;
  const role = allowedRoles.find(eqMatcher(viewMyProjects));
  const canAdd = role ? true : false;
  return [role, canAdd];
};

export const getUpdateRole = () => {
  const { allowedRoles } = decodeProjectExchangeToken();
  const { updateDailylog } = projectFeatureAllowedRoles;
  const role = allowedRoles.find(eqMatcher(updateDailylog));
  const canAdd = role ? true : false;
  return [role, canAdd];
};
