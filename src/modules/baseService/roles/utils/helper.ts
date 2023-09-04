import { PermissionType } from "../models/role";

export const getAuthValue=(argAuthValue: number): PermissionType=>{
    switch(argAuthValue){
    case 0: return PermissionType.none;
    case 1: return PermissionType.viewer;
    case 2: return PermissionType.editor;
    case 3: return PermissionType.admin;
    default: return PermissionType.none;
    }
}