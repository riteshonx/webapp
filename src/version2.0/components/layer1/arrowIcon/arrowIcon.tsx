import React from 'react';

export const ArrowIcon = (props: any): React.ReactElement => {
  return <svg width={props.size || 24} height={props.size || 24} viewBox="0 0 27 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g>
      <path d="M13.5 3.07324C19.71 3.07324 24.75 8.11324 24.75 14.3232C24.75 20.5332 19.71 25.5732 13.5 25.5732C7.29 25.5732 2.25 20.5332 2.25 14.3232C2.25 8.11324 7.29 3.07324 13.5 3.07324ZM14.625 14.3232H18L13.5 9.82324L9 14.3232H12.375V18.8232H14.625V14.3232Z" fill={props.fill || '#000'} />
    </g>
  </svg>
}
