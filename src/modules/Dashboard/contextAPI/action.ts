export const SET_SELECTED_BLOCK_OR_LOT_HEADER =
  "SET_SELECTED_BLOCK_OR_LOT_HEADER";
export const SET_SELECTED_PARENT_OR_CHILD_LIST =
  "SET_SELECTED_PARENT_OR_CHILD_LIST";

export const setSelectedBlockOrLotHeader = (payload: any) => {
  return {
    type: SET_SELECTED_BLOCK_OR_LOT_HEADER,
    payload,
  };
};

export const setSelectedParentOrChildList = (payload: any) => {
  return {
    type: SET_SELECTED_PARENT_OR_CHILD_LIST,
    payload,
  };
};
