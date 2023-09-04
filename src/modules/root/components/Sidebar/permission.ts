import { useContext } from "react";
import {
  decodeExchangeToken,
  decodeProjectExchangeToken,
  decodeProjectFormExchangeToken,
} from "../../../../services/authservice";

export function canViewProjectSchedule(): boolean {
  return decodeProjectExchangeToken().allowedRoles.includes("viewMasterPlan");
}

export function canViewBimModel(): boolean {
  return decodeProjectExchangeToken().allowedRoles.includes("viewBimModel");
}

export function canViewUploads(): boolean {
  return decodeProjectExchangeToken().allowedRoles.includes("viewDocument");
}

export function canCreateUploads(): boolean {
  return decodeProjectExchangeToken().allowedRoles.includes("createDocument");
}

export function canUpdateUploads(): boolean {
  return decodeProjectExchangeToken().allowedRoles.includes("updateDocument");
}

export function canDeleteUploads(): boolean {
  return decodeProjectExchangeToken().allowedRoles.includes("deleteDocument");
}

export function canViewForm(): boolean {
  try {
    if (sessionStorage.getItem("ProjectToken")) {
      if (decodeProjectFormExchangeToken()?.viewFormIds) {
        return JSON.parse(
          decodeProjectFormExchangeToken()
            ?.viewFormIds?.replace("{", "[")
            ?.replace("}", "]")
        ).length === 0
          ? false
          : true;
      }
    }
    return false;
  } catch (error: any) {
    return false;
  }
}
export function canViewDrawings(): boolean {
  return decodeProjectExchangeToken().allowedRoles.includes("viewDrawings");
}

export function canViewSpecifications(): boolean {
  return decodeProjectExchangeToken().allowedRoles.includes(
    "viewSpecifications"
  );
}

export function canViewFormTemplates(): boolean {
  return decodeExchangeToken().allowedRoles.includes("viewFormTemplate");
}

export function canViewRoles(): boolean {
  return (
    decodeExchangeToken().allowedRoles.includes("viewTenantRoles") ||
    decodeExchangeToken().allowedRoles.includes("viewProjectRoles")
  );
}

export function canViewCompanies(): boolean {
  return (
    decodeExchangeToken().allowedRoles.includes("viewTenantCompanies") ||
    decodeExchangeToken().allowedRoles.includes("viewMyCompanies")
  );
}

export function canViewTenantUsers(): boolean {
  return (
    decodeExchangeToken().allowedRoles.includes("viewTenantUsers") ||
    decodeExchangeToken().allowedRoles.includes("viewMyCompanyUsers")
  );
}

export function canViewProjects(): boolean {
  return (
    decodeExchangeToken().allowedRoles.includes("viewTenantProjects") ||
    decodeExchangeToken().allowedRoles.includes("viewMyProjects")
  );
}

export function canViewTenantCalendar(): boolean {
  return decodeExchangeToken().allowedRoles.includes("viewTenantCalendar");
}

export function canViewWorkflowTemplate(): boolean {
  return decodeExchangeToken().allowedRoles.includes("viewWorkflowTemplate");
}

export function canViewTenantMaterialMaster(): boolean {
  return decodeExchangeToken().allowedRoles.includes(
    "viewTenantMaterialMaster"
  );
}

export function canViewTenantTask(): boolean {
  return decodeExchangeToken().allowedRoles.includes("viewTenantTask");
}

export function canViewCustomList(): boolean {
  return decodeExchangeToken().allowedRoles.includes("viewCustomList");
}

export const canViewRfiFormTemplates = true;
