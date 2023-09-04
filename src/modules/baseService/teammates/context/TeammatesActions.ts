export const SAVE_SELECTED_USER = "SAVE_SELECTED_USER";

export const saveSelectedUser = (payload: any): any => {
  return {
    type: SAVE_SELECTED_USER,
    payload,
  };
};
