
import {  insightsArray } from '../../constant'
import {
  ADD_TO_PINNED_ITEMS,
  REMOVE_FROM_PINNED_ITEMS,
  ITEM_PINNED,
  FEED_ITEMS,
} from './FeedAction';
import {Action} from '../../models';

export const FeedInitialState = {
  pinnedItems: [],
  itemPinned: null,
  feedItems: [...insightsArray],
};

export type FeedReducerState = typeof FeedInitialState;

export const FeedReducer = (
  state: FeedReducerState = FeedInitialState,
  action: Action
): any => {
  switch (action.type) {
    case ADD_TO_PINNED_ITEMS: {
      return {
        ...state,
        pinnedItems: action.payload,
      };
    }
    case REMOVE_FROM_PINNED_ITEMS: {
      return {
        ...state,
        pinnedItems: action.payload,
      };
    }
    case ITEM_PINNED: {
      return {
        ...state,
        itemPinned: [...FeedInitialState.pinnedItems, action.payload],
      };
    }
    case FEED_ITEMS: {
      return {
        ...state,
        feedItems: action.payload,
      };
    }

    default:
      return state;
  }
};
