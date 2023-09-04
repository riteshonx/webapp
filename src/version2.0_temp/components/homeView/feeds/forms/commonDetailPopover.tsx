import React from 'react';
import CloseIcon from '../../../../assets/images/icons/closeIcon.svg';
import {
  ICommonFieldDetail,
  ICommonPopoverDetail,
} from 'src/version2.0_temp/models/task';
import './commonDetailPopover.scss';

interface CommonDetailProps {
  maxWidth?: string;
  maxHeight?: string;
  width?: string;
  height?: string;
  onClose?: any;
  children?: React.ReactNode;
  loading?: boolean;
  mappedData?: ICommonPopoverDetail;
}

export const CommonDetailPopover = ({
  width,
  height,
  maxWidth,
  maxHeight,
  onClose,
  children,
  mappedData,
  loading,
}: CommonDetailProps): React.ReactElement => {
  if (loading) {
    return (
      <div className="v2-common-detail-popover-loader ">
        <div className="skeleton-box"></div>
        <div className="skeleton-box"></div>
        <div className="skeleton-box"></div>
      </div>
    );
  } else if (!loading && !mappedData?.title) {
    return (
      <div className="v2-common-detail-popover-no-data ">
        No data found
        <img src={CloseIcon} alt="" width={'22px'} onClick={onClose} />
      </div>
    );
  } else {
    return (
      <div className="v2-common-detail-popover">
        <div className="v2-common-detail-popover-nav s-v-center">
          <div className="v2-common-detail-popover-nav-title">
            {mappedData?.id} | <span>{mappedData?.title}</span>
            <span>({mappedData?.state})</span>
          </div>
          <img src={CloseIcon} alt="" width={'22px'} onClick={onClose} />
        </div>
        <div
          className="v2-common-detail-popover-container"
          style={{
            maxHeight: maxHeight || 'auto',
            maxWidth: maxWidth || 'auto',
            width: width || 'auto',
            height: height || 'auto',
          }}
        >
          {mappedData?.data?.map((field: ICommonFieldDetail, index: number) => {
            return (
              <div
                key={`field-${index}`}
                className="v2-common-detail-popover-col"
              >
                <div className="v2-common-detail-popover-title">
                  {field.label}:
                </div>
                <div className="v2-common-detail-popover-value">
                  {field.value}
                </div>
              </div>
            );
          }) || <></>}
          {children ? children : <></>}
        </div>
      </div>
    );
  }
};
