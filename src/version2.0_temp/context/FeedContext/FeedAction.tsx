export const ADD_TO_PINNED_ITEMS = 'ADD_TO_PINNED_ITEMS';
export const REMOVE_FROM_PINNED_ITEMS = 'REMOVE_FROM_PINNED_ITEMS';
export const ITEM_PINNED = 'ITEM_PINNED';
export const ITEM_UN_PINNED = 'ITEM_UN_PINNED';
export const FEED_ITEMS = 'FEED_ITEMS';

export const setFeedItems = (payload: any): any => {
  return {
    type: FEED_ITEMS,
    payload,
  };
};

export const setItemPinned = (payload: boolean): any => {
  return {
    type: ITEM_PINNED,
    payload,
  };
};

export const setItemUnPinned = (payload: boolean): any => {
  return {
    type: ITEM_UN_PINNED,
    payload,
  };
};

export const setAddPinnedItems = (payload: any): any => {
  return {
    type: ADD_TO_PINNED_ITEMS,
    payload,
  };
};
export const setRemovePinnedItems = (payload: any): any => {
  return {
    type: REMOVE_FROM_PINNED_ITEMS,
    payload,
  };
};
export {};
