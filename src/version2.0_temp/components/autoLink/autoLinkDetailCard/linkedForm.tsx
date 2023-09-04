import React, { useEffect, useState } from 'react';
import {
  ListAlt as FormsIcon
} from "@material-ui/icons";
import { Popover } from 'src/modules/Dashboard/components/Common';
import { AutoLinkCheckbox } from './autoLinkChecbox';
import './linkedForm.scss';
import { FeedAssociatedTask } from 'src/modules/Dashboard/components/Feeds/feedAssociatedTask';
import { DATA_SOURCE } from 'src/modules/Dashboard/models';
import { USER_RESPONSE } from 'src/modules/AutoLink/utils/constant';
import { Tooltip, tooltipClasses } from '@mui/material';
import { styled, TooltipProps } from '@material-ui/core';

interface Props {
  id: number;
  userResponse: string;
  form: any;
  handleFormSelection: any[];
  handlePopover: any;
  closePopover: boolean

}

interface DataSourceMapType {
  QC_CHECKLIST: string;
  ISSUES: string;
  RFI: string;
}

const DATA_SOURCE_MAP = {
  QC_CHECKLIST: DATA_SOURCE.QC_CHECKLIST,
  ISSUES: DATA_SOURCE.ISSUE_FORMS,
  RFI: DATA_SOURCE.RFI_FORMS,
  PROCORE_RFI: DATA_SOURCE.PROCORE_RFI,
  PM4_RFI: DATA_SOURCE.PM4_RFI,
  BIM360_RFI: DATA_SOURCE.BIM360_RFI
};
export const LinkedForm = ({
  id,
  userResponse,
  form,
  handleFormSelection,
  handlePopover,
  closePopover
}: Props): React.ReactElement => {
  const [target, setTarget] = useState(undefined);
  const [updatePopoverCount, setUpdatePopoverCount] = useState(0);
  useEffect(() => {
    handleFormSelection?.[1]?.((prevState: any) => ({
      ...prevState,
      [id]: userResponse,
    }));
  }, []);
  useEffect(() => {
    if (!!target) {
      handlePopover(true)
    }
    else {
      handlePopover(false)
    }
  }, [target])
  useEffect(() => {
    if (closePopover) {
      setTarget(undefined)
    }
  }, [closePopover])
  const updateFormStatus = () => {
    handleFormSelection?.[1]?.((prevState: any) => {
      return {
        ...prevState,
        [id]:
          prevState[id] === USER_RESPONSE.APPROVED
            ? USER_RESPONSE.REJECTED
            : USER_RESPONSE.APPROVED,
      };
    });
  };
  const handlePopoverClick = (e: any) => {
    setTarget((prevState) => {
      if (prevState) return null;
      else return e.target.getBoundingClientRect();
    });
    handlePopover(true)
  };
  const captionsTypeList = ["Checklist No", "RFI ID", "Issue Number"];
  const captionsSubject = ["Subject", "Title"];

  const formIdItem = form?.formsData.find((item: any) =>
    captionsTypeList.includes(item.caption)
  );
  const subjectItem = form?.formsData.find((item: any) =>
    captionsSubject.includes(item.caption)
  );
  const formId = formIdItem?.valueInt || formIdItem?.valueString || '';
  const subject = subjectItem?.valueString ?? '';


  const feature: keyof DataSourceMapType = form.projectFeature.feature;
  const isChecked = handleFormSelection?.[0]?.[id] === USER_RESPONSE.APPROVED;

  const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
    <Tooltip {...props} classes={{ popper: className }} />
  ))(({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
      backgroundColor: '#181d24',
      color: '#ffffff',
      fontSize: '12px',
      boxShadow: '0px 0px 8px rgba(255,255,255, 0.25)'
    },
  }));
  return (
    <div className="v2-link-form">
      <Popover
        trigger={
          <div className="v2-link-form-icon" onClick={handlePopoverClick}>
            <FormsIcon />
          </div>
        }
        position="top"
        closeOnClickOutside={true}
        foreignTargetBox={target}
        open={!!target}
        reRender={updatePopoverCount}
      >
        <FeedAssociatedTask
          formId={form.id}
          formType={feature.includes('RFI') ? DATA_SOURCE_MAP['RFI'] : DATA_SOURCE_MAP[feature]}
          isTask={false}
          taskId=""
          onClose={() => setTarget(undefined)}
          onDataLoad={() => setUpdatePopoverCount((prevState) => prevState + 1)}
        />
      </Popover>
      <HtmlTooltip
        title={
          <React.Fragment>
            <p>{subject}</p>
          </React.Fragment>
        }
        placement="top-start" >
        <div className="v2-link-form-name">{formId ? `#${formId} | ` : ''}{subject}</div>
      </HtmlTooltip>
      <HtmlTooltip title={<React.Fragment>
        <p>{form.location}</p>
      </React.Fragment>} placement="top" >
        <div className="v2-link-form-name">{form.location}</div>
      </HtmlTooltip>
      <AutoLinkCheckbox
        // label="Link"
        value={isChecked}
        onChange={updateFormStatus}
      />
    </div>
  );
};
