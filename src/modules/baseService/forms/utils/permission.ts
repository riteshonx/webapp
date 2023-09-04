import {decodeExchangeToken} from '../../../../services/authservice';
import {FormsRoles} from '../../../../utils/role';
const allowedRoles= decodeExchangeToken().allowedRoles;
// const allowedProjectRoles = decodeExchangeToken().allowedRoles;


export const canCreateTemplate=allowedRoles.includes(FormsRoles.createFormTemplate);

export const canViewTemplates= allowedRoles.includes(FormsRoles.viewFormTemplate);

export const canUpdateTemplates= allowedRoles.includes(FormsRoles.updateFormTemplate);

export const canUpdateFormTemplateStatus= allowedRoles.includes(FormsRoles.updateFormTemplateStatus);

export const canCreateProjectTemplateAssociation= allowedRoles.includes(FormsRoles.createProjectTemplateAssociation);

// rfi permissions

export const canCreateRfiFormTemplate= true;

export const canViewRfiFormTemplates= true;

export const canUpdateRfiFormTemplates= true;

export const canDeleteRfiFormTemplates= true;
