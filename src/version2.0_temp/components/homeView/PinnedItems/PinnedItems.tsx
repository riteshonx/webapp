import React, { ReactElement, useEffect, useState, useContext } from 'react';
import PushPinIcon from '@mui/icons-material/PushPin';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ShareIcon from '@mui/icons-material/Share';
import BookmarkBorderOutlinedIcon 
from '@mui/icons-material/BookmarkBorderOutlined';
 import RemoveCircleOutlineOutlinedIcon
  from '@mui/icons-material/RemoveCircleOutlineOutlined';
import ModeCommentOutlinedIcon from '@mui/icons-material/ModeCommentOutlined';
 
import {useCommentSection} from '../../../hooks/useCommentSection';
import { FeedCard } from '../feeds/feedCard';

import { FeedContext } from '../../../context';
import {
  setFeedItems
} from '../../../context';
import { Feed } from '../../../constant';

export default function PinnedItems(): ReactElement {
  const { FeedState,FeedDispatch }: any = useContext(FeedContext);
  const [pinnedFeeds, setPinnedFeeds] = useState<Array<Feed>>([]);
  const {commentState,toggleCommentState} = useCommentSection();
  const [comment, setComment] = useState<string>('')
  useEffect(() => {
    if (FeedState?.feedItems.length > 0) {
      const filterPinnedItems = FeedState?.feedItems.filter(
        (item: Feed) => item.pinned
      );
      setPinnedFeeds(filterPinnedItems);
    }
  }, [FeedState?.feedItems]);

  function handleCopyIcon() {
    return;
  }

  function handleShareIcon() {
    return;
  }

  function handleBookmarkIcon() {
    return;
  }

  function handleFilterFeed(id:number) {
    const filteredInsightsData = FeedState.feedItems.filter((insight:Feed)=> insight.id !=id)
    FeedDispatch(setFeedItems(filteredInsightsData))
  }
  function handleCommentIcon(){
    toggleCommentState()
  }

  const footerIcons = [
    {
      Icon:ModeCommentOutlinedIcon,
      handleIconClick: handleCommentIcon
    },
    {
      Icon: ShareIcon,
      handleIconClick: handleShareIcon,
    },
    {
      Icon: ContentCopyIcon,
      handleIconClick: handleCopyIcon,
    },

    {
      Icon: BookmarkBorderOutlinedIcon,
      handleIconClick: handleBookmarkIcon,
    },
    {
      Icon: RemoveCircleOutlineOutlinedIcon,
      handleIconClick: handleFilterFeed,
    },
  ];

  const handleRemoveFromPinnedItems = (feedId: number, feed: Feed) => {
    const localFeeds = [...FeedState.pinnedItems];
    const feedIndex = localFeeds.findIndex((item: Feed) => item.id == feedId);
    localFeeds[feedIndex].pinned = !localFeeds[feedIndex].pinned;
    const filterPinnedItems = localFeeds.filter((item: Feed) => item.pinned);
    setPinnedFeeds(filterPinnedItems);
  };

  const renderPinnedItems = () => {
    return pinnedFeeds.length > 0 ? (
      pinnedFeeds.map((item: Feed) => {
        return (
          <div key={item.id}>
          </div>
        );
      })
    ) : (
      <h2>No items to display here....</h2>
    );
  };

  return <>{renderPinnedItems()}</>;
}
