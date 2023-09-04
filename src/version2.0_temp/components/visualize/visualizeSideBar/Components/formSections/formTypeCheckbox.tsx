import React from 'react';

interface FormTypeCheckboxProps {
  title: string;
  selected: boolean;
  onChange: () => void;
  subType?: boolean;
  hideCheckBox?: boolean; 
  lastChildType?:  boolean;
}

export const FormTypeCheckbox = ({title, selected, onChange, subType, hideCheckBox, lastChildType}: FormTypeCheckboxProps): React.ReactElement => {

  const onKeyDownCheckBox = (e: any) => {
    if (e.keyCode == '13') {
      onChange();
      setTimeout(() => e.target.tagName === 'SPAN' ? e.target.previousSibling.focus() : e.target.nextElementSibling.focus(), 100);
    }
  }
  
  return (
    <div
      className={`checkbox-container ${subType &&  'subType'} ${lastChildType &&  'lastChildType'}`}
      onClick={() => onChange()}
      key={`form_type_${title} ${subType &&  '_subType'}`}
    >
      {!hideCheckBox && <input type="checkbox"
        checked={selected}
        readOnly
        tabIndex={0}
        onKeyDown={onKeyDownCheckBox}
      />}
      <span tabIndex={0} onKeyDown={onKeyDownCheckBox}></span>
      <span>{title}</span>
    </div>
  );
};