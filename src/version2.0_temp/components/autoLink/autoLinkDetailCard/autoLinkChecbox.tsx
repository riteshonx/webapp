import React from 'react';
import './autoLinkChecbox.scss'
const CHECKED_SVG_PATH =
  'M3.33333 2.5H16.6667C16.8877 2.5 17.0996 2.5878 17.2559 2.74408C17.4122 2.90036 17.5 3.11232 17.5 3.33333V16.6667C17.5 16.8877 17.4122 17.0996 17.2559 17.2559C17.0996 17.4122 16.8877 17.5 16.6667 17.5H3.33333C3.11232 17.5 2.90036 17.4122 2.74408 17.2559C2.5878 17.0996 2.5 16.8877 2.5 16.6667V3.33333C2.5 3.11232 2.5878 2.90036 2.74408 2.74408C2.90036 2.5878 3.11232 2.5 3.33333 2.5ZM4.16667 4.16667V15.8333H15.8333V4.16667H4.16667ZM9.16917 13.3333L5.63333 9.7975L6.81167 8.61917L9.16917 10.9767L13.8825 6.2625L15.0617 7.44083L9.16917 13.3333Z';
const UNCHECKED_SVG_PATH =
  'M3 2.25H15C15.1989 2.25 15.3897 2.32902 15.5303 2.46967C15.671 2.61032 15.75 2.80109 15.75 3V15C15.75 15.1989 15.671 15.3897 15.5303 15.5303C15.3897 15.671 15.1989 15.75 15 15.75H3C2.80109 15.75 2.61032 15.671 2.46967 15.5303C2.32902 15.3897 2.25 15.1989 2.25 15V3C2.25 2.80109 2.32902 2.61032 2.46967 2.46967C2.61032 2.32902 2.80109 2.25 3 2.25ZM3.75 3.75V14.25H14.25V3.75H3.75Z';

export const AutoLinkCheckbox = ({
  value,
  onChange,
  label,
}: {
  value?: boolean;
  label?: string;
  onChange?: any;
}): React.ReactElement => {
  return (
    <div className="v2-auto-linkcheckbox s-v-center" onClick={onChange}>
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g>
          <path
            d={value ? CHECKED_SVG_PATH : UNCHECKED_SVG_PATH}
            fill="#FAB144"
          />
        </g>
      </svg>
      <span>{label}</span>
    </div>
  );
};
