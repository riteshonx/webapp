/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Popover } from '@material-ui/core';
import { KeyboardArrowRight, MoreHoriz } from '@material-ui/icons';
import { Download } from '@mui/icons-material';
import React, { useContext, useEffect } from 'react';
import { ReactElement, useState } from 'react';
import './sidebar.scss';
import InputOptions from '../inputOptions/inputOptions';
import { getCdpInstenceFilledData, getGeneratorFormData } from '../../../constant/api';
import { useParams } from 'react-router';
import { CDPContext } from 'src/modules/CDP/context/context';
import { ICdpContext } from 'src/modules/CDP/models';
import { setCdpFormAnswereList, setSelectedInstance } from '../../../context/action';
function ModularSubstationSidebar(props: any): ReactElement {
  const [openInput, setOpenInput] = useState(false);
  const [openOutput, setOpenOutput] = useState(false);
  const { cdpState, cdpDispatch } = useContext(CDPContext) as ICdpContext;
  const [inputListOptions, setInputListOptions] = useState([] as Array<any>);
  const [selectedInputOption, setSelectedInputOption] = useState(-1);
  const [selectedGeneratorDetail, setSelectedGeneratorDetail] = useState({} as any)
  const params = useParams() as {
    substationId: string;
  };
  useEffect(() => {
    if (params.substationId) {
      loadaFormData();
    }
  }, [params.substationId]);

  useEffect(() => {
    loadFormValueData()
  }, [cdpState.selectedInstance?.instanceId, ])

  const loadFormValueData = async () => {
    if (cdpState.selectedInstance?.instanceId) {
      const filledData = await getCdpInstenceFilledData(cdpState.selectedInstance?.instanceId)
      cdpDispatch(setCdpFormAnswereList(filledData));
    }
  }

  const loadaFormData = async () => {
    const [data, answereList, cdpDetail] = await getGeneratorFormData(params.substationId);
    setSelectedGeneratorDetail(cdpDetail)
    setInputListOptions(data);
    if (cdpState.cdpFormAnswereList.length === 0) {
      cdpDispatch(setCdpFormAnswereList(answereList));
    }
  };

  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null
  );

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const selectInstance = (instanceId: string) => {
    const instance = cdpState.cdpInstncesList.find(
      (ins: any) => ins.instanceId === instanceId
    );
    if (instance) {
      cdpDispatch(setSelectedInstance(instance))
    }
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;
  return (
    <>
      <div className="ms-sidebar">
        <div>
          <div className="ms-sidebar--title">{selectedGeneratorDetail.cdpTypeName || ''}</div>
          <div className="ms-sidebar--project">
            <select
              onChange={(e) => {
                selectInstance(e.target.value);
              }}
            >
              {cdpState.cdpInstncesList.map((e: any) => {
                return (
                  <option
                    value={e.instanceId}
                    selected={
                      e.instanceId === cdpState.selectedInstance.instanceId
                    }
                  >
                    {e.instanceName}
                  </option>
                );
              })}
            </select>
            <button aria-describedby={id} onClick={handleClick}>
              <MoreHoriz />
            </button>
            <Popover
              id={id}
              open={open}
              anchorEl={anchorEl}
              onClose={handleClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
            >
              <div
                className="ms-sidebar--popover"
                onClick={() => {
                  props.createNewConfiguration();
                }}
              >
                Create New Configuration
              </div>
            </Popover>
          </div>
          <div className="ms-sidebar--feature">
            <div
              className="ms-sidebar--feature__text"
              onClick={() => {
                setOpenInput(!openInput);
                setSelectedInputOption(-1);
              }}
            >
              Input
              <KeyboardArrowRight
                style={{
                  transform: !openInput ? '' : 'rotate(-90deg)',
                }}
              />
            </div>
            <div
              className={
                'ms-sidebar--feature__expand ' + (openInput ? 'open' : 'close')
              }
            >
              {inputListOptions?.length
                ? inputListOptions.map((e: any, index: number) => {
                    return (
                      <InputOptions
                        selected={index === selectedInputOption}
                        data={e}
                        onClick={() => {
                          if (index === selectedInputOption) {
                            setSelectedInputOption(-1);
                          } else {
                            setSelectedInputOption(index);
                          }
                        }}
                        close={() => setSelectedInputOption(-1)}
                      />
                    );
                  })
                : ''}
            </div>
          </div>
          <div className="ms-sidebar--feature">
            <div className="ms-sidebar--feature__text">Review</div>
          </div>
          <div className="ms-sidebar--feature">
            <div
              className="ms-sidebar--feature__text"
              onClick={(e) => {
                e.stopPropagation();
                setOpenOutput(!openOutput);
              }}
            >
              Output
              <KeyboardArrowRight
                style={{
                  transform: !openOutput ? '' : 'rotate(-90deg)',
                }}
              />
            </div>
            <div
              className={
                'ms-sidebar--feature__expand ' + (openOutput ? 'open' : 'close')
              }
            >
              <div
                className="ms-sidebar--feature__option"
                onClick={() => {
                  props.outputClick('boq');
                }}
              >
                BOQ
              </div>
              <div
                className="ms-sidebar--feature__option"
                onClick={() => {
                  props.outputClick('drawing');
                }}
              >
                Drawings
              </div>
              <div
                className="ms-sidebar--feature__option"
                onClick={() => {
                  props.outputClick('proposal');
                }}
              >
                Proposal
              </div>
            </div>
          </div>
        </div>
        <div className="ms-sidebar--download">
          <button className="cdp-btn" onClick={props.onDownload}>
            <Download style={{ marginRight: '8px' }} />
            Download
          </button>
        </div>
      </div>
      <div
        className={
          'ms-sidebar--input-form ' +
          (selectedInputOption === -1 ? 'close' : 'open')
        }
        id="msSidebarInputForm"
      ></div>
    </>
  );
}

export default ModularSubstationSidebar;
