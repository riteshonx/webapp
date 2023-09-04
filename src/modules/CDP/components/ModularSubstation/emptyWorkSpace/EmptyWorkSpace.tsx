import React from 'react';
import './emptyWorkSpace.scss';
import AddIcon from '../../icons/AddRounded';

interface IEmptyWorkSpace {
  onAddConfig: any;
}

const EmptyWorkSpace = ({ onAddConfig }: IEmptyWorkSpace) => {
  return (
    <div className="empty-work-container">
      <div className="empty-work-container__main">
        <div className="empty-work-container__main__text">
          This workspace is empty. Generate your first <br />
          configuration to get started.
        </div>
        <div className="empty-work-container__main__button">
          <button className="cdp-btn" onClick={onAddConfig}>
            <AddIcon />
            <span className="empty-work-container__main__button__text">
              {' '}
              Add Configuration{' '}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmptyWorkSpace;
