/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { ReactElement, useContext, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { saveGeneratorFormData } from 'src/modules/CDP/constant/api';
import { setFormAnswereValue } from 'src/modules/CDP/context/action';
import { CDPContext } from 'src/modules/CDP/context/context';
import { ICdpContext } from 'src/modules/CDP/models';
import { stateContext } from 'src/modules/root/context/authentication/authContext';

const renderFormElement = (e: any) => {
  return (
    <>
      <div className="ms-sidebar--input-form__sub-group">{e.name}</div>
      <div style={{ marginLeft: '10px' }}>
        {e.options.map((option: any) => {
          return (
            <div
              className={`cdp-input-group ${option.isRequired ? 'imp' : ''}`}
            >
              <label htmlFor="">{option.label}</label>
              <GetInputElement inputConfig={option} />
            </div>
          );
        })}
      </div>
    </>
  );
};

const GetInputElement = (props: any): ReactElement => {
  const { inputConfig } = props;
  const [value, setValue] = useState() as any;
  const { state }: any = useContext(stateContext);

  const { cdpState, cdpDispatch } = useContext(CDPContext) as ICdpContext;
  useEffect(() => {
    const ansObject = cdpState.cdpFormAnswereList.find(
      (ansObj: any) => ansObj.name === inputConfig.name
    );
    setValue(ansObject?.value);
  }, [])
  useEffect(() => {
    const ansObject = cdpState.cdpFormAnswereList.find(
      (ansObj: any) => ansObj.name === inputConfig.name
    );
    setValue(ansObject?.value);
  }, [cdpState.cdpFormAnswereList]);

  const onChange = (e: any) => {
    cdpDispatch(
      setFormAnswereValue({
        uniqueId: inputConfig.uniqueId,
        value: e.target.value,
      })
    );
  };

  const onBlur = (uniqueId: number) => {
    if (cdpState.cdpFormAnswereList) {
      saveGeneratorFormData({
        isGenerateOutput: false,
        projectId: state.currentProject.projectId,
        instanceId: cdpState.selectedInstance.instanceId,
        cdpTypeId: cdpState.selectedGenerator,
        questions: cdpState.cdpFormAnswereList.filter((ans: any) => ans.uniqueId === uniqueId),
      });
    }
  };

  switch (inputConfig.type) {
    case 'text':
      return (
        <input defaultValue={value || ''} onChange={onChange} onBlur={() => onBlur(inputConfig.uniqueId)} />
      );
    case 'number':
      return (
        <input
          type="number"
          defaultValue={value || ''}
          onChange={onChange}
          onBlur={() => onBlur(inputConfig.uniqueId)}
        />
      );
    case 'boolean':
      return (
        <>
          {(inputConfig.options || []).map((val: string) => (
            <div className="cdp-input-group--radio">
              <input
                type="radio"
                value={val}
                name={inputConfig.name}
                onChange={(e) => {
                  onChange(e);
                  onBlur(inputConfig.uniqueId)
                }}
              />
              {val}
            </div>
          ))}
          {inputConfig.options.indexOf(value) === 0 && inputConfig.items
            ? inputConfig.items.map((option: any) => (
                <>
                  <div
                    style={{
                      marginTop: '10px',
                    }}
                  ></div>
                  <GetInputElement inputConfig={option} />
                </>
              ))
            : ''}
        </>
      );
    case 'dropdown':
      return (
        <select onChange={onChange} value={value} onBlur={() => onBlur(inputConfig.uniqueId)}>
          {(inputConfig.options || []).map((val: string) => (
            <option value={val} selected={val === value}>
              {val}
            </option>
          ))}
        </select>
      );
    default:
      return <></>;
  }
};

function InputOptions(props: any): ReactElement {
  const { selected, data, onClick } = props;

  return (
    <>
      <div
        onClick={onClick}
        className={`ms-sidebar--feature__option ${selected ? 'active' : ''}`}
      >
        {data.name}
      </div>
      {selected &&
        ReactDOM.createPortal(
          <div className="ms-sidebar--input-form__container">
            <div className="ms-sidebar--input-form__input-widget">
              <div className="ms-sidebar--input-form__title">{data.name}</div>
              {data.value.map((e: any) => renderFormElement(e))}
            </div>
            <div className="ms-sidebar--feature__action">
              <button
                className="cancel"
                onClick={() => props.close && props.close()}
              >
                Cancel
              </button>
              <button className="cdp-btn">Generate</button>
            </div>
          </div>,
          document.getElementById('msSidebarInputForm') || document.body
        )}
    </>
  );
}

export default InputOptions;
