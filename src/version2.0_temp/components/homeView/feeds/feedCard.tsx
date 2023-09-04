import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { Popover } from '../../common';
import './feedCard.scss';
import { FeedDetailCard } from './feedDetailCard';
import { IInsight } from 'src/version2.0_temp/models';

interface CardProps {
  insight: IInsight;
  HeaderIcon?: any;
  footerIcons?: any;
  openDetailPopover?: () => any,
  handleHeaderClickHandler?: any;
}

export interface ChildRef {
  closePopover: () => void;
}

export const FeedCard = forwardRef<ChildRef, CardProps>(({
  insight,
  handleHeaderClickHandler,
  HeaderIcon,
  footerIcons,
  openDetailPopover
}: CardProps, ref) => {
  const [openDetail, setOpenDetail] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const showFooterIcons = Array.isArray(footerIcons) && footerIcons.length > 0;

  useImperativeHandle(ref, () => ({
    closePopover
  }));

  const closePopover = () => {
    setOpenDetail(false)
  }

  const togglePopover = () => {
    openDetailPopover && openDetailPopover()
    setOpenDetail(!openDetail)
  }

  const getFeedCard = () => {
    return (
      <div className="v2-feed-card" ref={cardRef}>
        <div className="v2-feed-card-header">
          <h3 className="v2-feed-title">Schedule Insights</h3>
          <div>
            {HeaderIcon && (
              <HeaderIcon
                onClick={() => {
                  handleHeaderClickHandler &&
                    handleHeaderClickHandler(insight?.id, insight);
                }}
              />
            )}
          </div>
        </div>
        <div
          className="v2-feed-card-insight"
          onClick={togglePopover}
        >
          <div className="v2-feed-card-insight-title">Recommendation:</div>
          <div
            className="v2-feed-card-insight-content"
            dangerouslySetInnerHTML={{
              __html: insight?.messagesShortWeb.msg || '',
            }}
          ></div>
        </div>
        <div className="v2-feed-card-cardFooter">
          {showFooterIcons &&
            footerIcons.map((footerIcon: any, index: number) => {
              const { Icon, handleIconClick } = footerIcon;
              return (
                <Icon
                  key={index}
                  onClick={() => {
                    handleIconClick(insight?.id);
                  }}
                  className="v2-feed-card-icon"
                />
              );
            })}
        </div>
      </div>
    );
  };
  return (
    <div>
      {getFeedCard()}
      <Popover
        notch={false}
        trigger={<></>}
        open={openDetail}
        foreignTrigger={true}
        foreignTarget={cardRef}
        position="right"
      >
        <FeedDetailCard
          insightId={insight.id}
          onClose={() => setOpenDetail(false)}
        />
      </Popover>
    </div>
  );
});
