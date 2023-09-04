import React, { ReactElement, useEffect, useState, useContext } from 'react';
import PushPinIcon from '@mui/icons-material/PushPin';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ShareIcon from '@mui/icons-material/Share';
import BookmarkBorderOutlinedIcon from '@mui/icons-material/BookmarkBorderOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';

import { FeedCard } from '../../../common/FeedCard';
import { FeedContext } from '../../../context/FeedContext/FeedContext';
import { Feed } from '../../../utils/constants/InsightsTabsConstatnt';

export default function PinnedItems(): ReactElement {
  const { FeedState }: any = useContext(FeedContext);
  const [pinnedFeeds, setPinnedFeeds] = useState<Array<Feed>>([]);

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
            <FeedCard
              handleHeaderClickHandler={handleRemoveFromPinnedItems}
              item={item}
              HeaderIcon={item.pinned ? PushPinIcon : PushPinOutlinedIcon}
              footerIcons={footerIcons}
            />
          </div>
        );
      })
    ) : (
      <h2>No items to display here....</h2>
    );
  };

  return <>{renderPinnedItems()}</>;
}
