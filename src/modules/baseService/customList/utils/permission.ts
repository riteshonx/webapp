import {decodeExchangeToken} from '../../../../services/authservice';
import {CustomListRoles} from '../../../../utils/role';
const allowedRoles= decodeExchangeToken().allowedRoles;


export const canCreateCustomList= allowedRoles.includes(CustomListRoles.createCustomList);

export const canViewCustomList= allowedRoles.includes(CustomListRoles.viewCustomList);

export const canUpdateCustomList= allowedRoles.includes(CustomListRoles.updateCustomList);

export const canDeleteCustomList= allowedRoles.includes(CustomListRoles.deleteCustomList);