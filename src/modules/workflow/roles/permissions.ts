import { decodeExchangeToken } from "../../../services/authservice";
import { WorkflowTemplateRoles } from "../../../utils/role";
const allowedRoles = decodeExchangeToken().allowedRoles;

export const canCreateWorkflowTemplates = allowedRoles.includes(
  WorkflowTemplateRoles.createWorkflowTemplate
);

export const canViewWorkflowTemplates = allowedRoles.includes(
  WorkflowTemplateRoles.viewWorkflowTemplate
);

export const canUpdateWorkflowTemplates = allowedRoles.includes(
  WorkflowTemplateRoles.updateWorkflowTemplate
);

export const canDeleteWorkflowTemplates = allowedRoles.includes(
  WorkflowTemplateRoles.deleteWorkflowTemplate
);
