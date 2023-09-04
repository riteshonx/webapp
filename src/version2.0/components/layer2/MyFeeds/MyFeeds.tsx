import React, { ReactElement, useContext, useEffect, useState } from 'react';
import { match, useHistory, useRouteMatch } from 'react-router-dom';
import PushPinIcon from '@mui/icons-material/PushPin';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ShareIcon from '@mui/icons-material/Share';
import BookmarkBorderOutlinedIcon from '@mui/icons-material/BookmarkBorderOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';

import { FeedCard } from '../../../common/FeedCard';
import { FeedContext } from '../../../context/FeedContext/FeedContext';
import {
  setAddPinnedItems,
  setItemPinned,
  setFeedItems,
} from '../../../context/FeedContext/FeedAction';
import { Feed, feedsArray } from 'src/version2.0/utils/constants/InsightsTabsConstatnt';



export default function MyFeeds(): ReactElement {
  const { FeedState, FeedDispatch }: any = useContext(FeedContext);
  const [feeds, setFeeds] = useState<Array<Feed>>([]);

  useEffect(() => {
    setFeeds(feedsArray);
  }, []);
  useEffect(() => {
    FeedDispatch(setFeedItems(feeds));
  }, [feeds]);

  function handleCopyIcon() {
    return;
  }

  function handleShareIcon() {
    return;
  }

  function handleBookmarkIcon() {
    return;
  }

  function handleAccountIcon() {
    return;
  }

  const footerIcons = [
    {
      Icon: ContentCopyIcon,
      handleIconClick: handleCopyIcon,
    },
    {
      Icon: ShareIcon,
      handleIconClick: handleShareIcon,
    },
    {
      Icon: BookmarkBorderOutlinedIcon,
      handleIconClick: handleBookmarkIcon,
    },
    {
      Icon: AccountCircleOutlinedIcon,
      handleIconClick: handleAccountIcon,
    },
  ];

  const togglePinItem = (feedId: number) => {
    const localFeeds = [...feeds];
    const feedIndex = localFeeds.findIndex((item: Feed) => item.id == feedId);
    localFeeds[feedIndex].pinned = !localFeeds[feedIndex].pinned;
    FeedDispatch(setAddPinnedItems(localFeeds));
  };

  const handleAddToPinnedItems = (feedId: number, feed: Feed) => {
    togglePinItem(feedId);
  };

  const handleRemoveFromPinnedItems = (feedId: number, feed: Feed) => {
    togglePinItem(feedId);
  };

  const renderFeeds = () => {
    return (
      FeedState.feedItems.length > 0 &&
      FeedState.feedItems.map((feed: Feed) => {
        return (
          <div key={feed.id}>
            <FeedCard
              item={feed}
              handleHeaderClickHandler={
                feed.pinned
                  ? handleRemoveFromPinnedItems
                  : handleAddToPinnedItems
              }
              HeaderIcon={feed.pinned ? PushPinIcon : PushPinOutlinedIcon}
              footerIcons={footerIcons}
            />
          </div>
        );
      })
    );
  };

  return <>{renderFeeds()}</>;
}
