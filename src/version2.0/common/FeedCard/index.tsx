import React, { useState, useRef } from "react";
import { Popover } from "src/version2.0/components/layer1/popover/popover";
import "./FeedCard.scss";
import CloseIcon from "src/version2.0/assets/images/icons/closeIcon.svg";

import Forms from '../../components/layer2/Forms/Forms';

export interface Item {
	id: number;
	content: string;
	title: string;
	subTitle: string;
	description: string;
	actions: string;
	pinned: boolean;
	descriptionLabel: string;
	actionLabel: string;
}

interface CardProps {
	item: Item;
	HeaderIcon?: any;
	footerIcons?: any;
	handleHeaderClickHandler: any;
}

export const FeedCard: React.FC<CardProps> = ({
	item,
	handleHeaderClickHandler,
	HeaderIcon,
	footerIcons,
}) => {
  const [openDetail, setOpenDetail] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null);
	const showFooterIcons = Array.isArray(footerIcons) && footerIcons.length > 0;

	const getFeedCard = () => {
		return (
			<div className='v2-feed-container' ref={cardRef}>
				<div className='v2-feed-header'>
					<h3 className='v2-feed-title'>{item?.title}</h3>
					<div>
						{HeaderIcon && (
							<HeaderIcon
								onClick={() => {
									handleHeaderClickHandler &&
										handleHeaderClickHandler(item.id, item);
								}}
							/>
						)}
					</div>
				</div>
				<div onClick={() => setOpenDetail(true)} >
        <p className='v2-feed-subTtile'>{item?.subTitle}</p>
				<p className='v2-feed-description'>
					<span className='v2-feed-spanKey'>{item?.descriptionLabel}:</span>
					{item?.description}
				</p>
        </div>
				<div className='v2-feed-cardFooter'>
					<p className='v2-feed-description'>
						<span className='v2-feed-spanKey'>{item?.actionLabel}:</span>
						{item?.actions}
					</p>
					{showFooterIcons &&
						footerIcons.map((footerIcon: any, index: number) => {
							const { Icon, handleIconClick } = footerIcon;
							return (
								<Icon
									key={index}
									onClick={handleIconClick}
									className='v2-feed-icon'
								/>
							);
						})}
				</div>
			</div>
		);
	};

	const getFeedCardDetail = () => {
		return (
			<div className='v2-feed-detail'>
				<div className='v2-feed-detail-nav s-v-center'>
					<div className='v2-feed-detail-nav-title'>Productivity</div>
					<img
						src={CloseIcon}
						alt=''
						width={"22px"}
            onClick={() => setOpenDetail(false)}
					/>
				</div>
				<div className='v2-feed-detail-container'>
					<div className='v2-feed-detail-title'>Recommendation:</div>
					<div className='v2-feed-detail-value'>
						Good news! Activity Level 1, <span data-insight='true' data-task-id="" data-project-id="" data-insight-type="">zone 3A QA/QC</span> is tracking for an early
						completion on 2/8/23 if the current average production of 3 inspecti
						ons per day is maintained, allowing you to complete Level 1 complete
						milestone, 2 days early.
					</div>
					<div className='v2-feed-detail-form-value'>
                     <Forms/> 
					</div>
          <div className='v2-feed-detail-title'>Linked data:</div>
          <div className="s-flex">
            <div className="v2-feed-detail-title">Daily Log:</div>
            <div className="v2-feed-detail-value"> 2-Feb-2023</div>
          </div>
				</div>
			</div>
		);
	};

	return <div>
    {getFeedCard()}
    <Popover
      notch={false}
      trigger={<></>}
      open={openDetail}
      foreignTrigger={true}
      foreignTarget={cardRef}
      position="right"
    >
      {getFeedCardDetail()}
    </Popover>
  </div>;
};
