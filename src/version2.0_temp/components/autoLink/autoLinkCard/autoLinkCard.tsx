import React from 'react';
import './autoLinkCard.scss';
import ShowComponent from 'src/modules/shared/utils/ShowComponent';

interface InsightCardProps {
  selected?: boolean;
  projectTask: any;
  isSelected: boolean;
  handleSelect: () => void;
}

export const AutoLinkCard = ({
  projectTask,
  isSelected,
  handleSelect,
}: InsightCardProps): React.ReactElement => {
  const { taskName, description } = projectTask;
  return (
    <div
      className={'v2-insights-card ' + (isSelected ? 'selected' : '')}
      onClick={handleSelect}
    >
      <div className="v2-insights-card-title">
        <div>{taskName}</div>
      </div>
      <ShowComponent showState={!!description}>
        <p className="v2-insights-card-detail">{description}</p>
      </ShowComponent>
    </div>
  );
};
