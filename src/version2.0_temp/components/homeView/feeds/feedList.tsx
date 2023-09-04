import React, { useRef, useState } from 'react';
import { Feed, insightsArray } from '../../../constant';
import { FeedCard } from './feedCard';
import PushPinIcon from '@mui/icons-material/PushPin';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ShareIcon from '@mui/icons-material/Share';
import BookmarkBorderOutlinedIcon from '@mui/icons-material/BookmarkBorderOutlined';
import RemoveCircleOutlineOutlinedIcon from '@mui/icons-material/RemoveCircleOutlineOutlined';
import { IInsight } from 'src/version2.0_temp/models/insights';
import { ChildRef } from './feedCard';
export const FeedList = ({
  insightList,
}: {
  insightList: Array<IInsight>;
}): React.ReactElement => {
  const [insightsData, setInsightsData] = useState(insightsArray);
  const childRefs = useRef<ChildRef[]>([]);

  function handleCopyIcon() {
    return;
  }

  function handleShareIcon() {
    return;
  }

  function handleBookmarkIcon() {
    return;
  }

  function handleFilterFeed(id: number) {
    const filteredInsightsData = insightsData.filter(
      (insight: Feed) => insight.id != id
    );
    setInsightsData(filteredInsightsData);
  }

  const openDetailPopover = (openIndex: number) => {
    childRefs.current.forEach((childRef: ChildRef, index: number) => {
      if (openIndex !== index) {
        childRef.closePopover();
      }
    });
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
      Icon: RemoveCircleOutlineOutlinedIcon,
      handleIconClick: handleFilterFeed,
    },
  ];
  return (
    <>
      {insightList.map((insight: IInsight, index: number) => (
        <div key={insight.id}>
          <FeedCard
            insight={insight}
            HeaderIcon={PushPinIcon}
            footerIcons={footerIcons}
            openDetailPopover={() => openDetailPopover(index)}
            ref={(refObj) => {
              if (refObj) {
                childRefs.current[index] = refObj;
              }
            }}
          />
        </div>
      ))}
    </>
  );
};
