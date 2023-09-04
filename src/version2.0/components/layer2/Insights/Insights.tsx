import React, { ReactElement, useContext, useEffect, useState } from 'react';
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
import {
  Insight,
  insightsArray,
} from 'src/version2.0/utils/constants/InsightsTabsConstatnt';

export default function Insights(): ReactElement {
  const { FeedState, FeedDispatch }: any = useContext(FeedContext);
  const [insights, setInsights] = useState<Array<any>>([]);

  useEffect(() => {
    setInsights(insightsArray);
  }, []);
  useEffect(() => {
    FeedDispatch(setFeedItems(insights));
  }, [insights]);

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

  const togglePinItem = (insightId: number) => {
    const localInsights = [...insights];
    const insightIndex = localInsights.findIndex(
      (item: Insight) => item.id == insightId
    );
    localInsights[insightIndex].pinned = !localInsights[insightIndex].pinned;
    FeedDispatch(setAddPinnedItems(localInsights));
  };

  const handleAddToPinnedItems = (insightId: number, insight: Insight) => {
    togglePinItem(insightId);
  };

  const handleRemoveFromPinnedItems = (insightId: number, insight: Insight) => {
    togglePinItem(insightId);
  };

  const renderInsights = () => {
    return (
      FeedState.feedItems.length > 0 &&
      FeedState.feedItems.map((insight: Insight) => {
        return (
          <div key={insight.id}>
            <FeedCard
              item={insight}
              handleHeaderClickHandler={
                insight.pinned
                  ? handleRemoveFromPinnedItems
                  : handleAddToPinnedItems
              }
              HeaderIcon={insight.pinned ? PushPinIcon : PushPinOutlinedIcon}
              footerIcons={footerIcons}
            />
          </div>
        );
      })
    );
  };

  return <>{renderInsights()}</>;
}
