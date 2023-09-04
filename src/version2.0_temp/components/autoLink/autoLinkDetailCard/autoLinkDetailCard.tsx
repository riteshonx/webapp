import { makeStyles } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import { Box } from '@mui/material';
import moment from 'moment';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { match, useRouteMatch } from 'react-router-dom';
import {
  createAutoLink,
  getTaskDetails,
  updateUserResponse,
} from 'src/modules/AutoLink/actions/actions';
import { USER_RESPONSE } from 'src/modules/AutoLink/utils/constant';
import LoadingCard from 'src/modules/insights2/insightsView/components/LoadingCard/LoadingCard';
import { setIsLoading } from 'src/modules/root/context/authentication/action';
import { stateContext } from 'src/modules/root/context/authentication/authContext';
import Notification, {
  AlertTypes,
} from 'src/modules/shared/components/Toaster/Toaster';
import ShowComponent from 'src/modules/shared/utils/ShowComponent';
import { axiosApiInstance } from 'src/services/api';
import { decodeExchangeToken } from 'src/services/authservice';
import { Popover } from '../../../../../src/modules/Dashboard/components/Common';
import { FeedAssociatedTask } from '../../../../../src/modules/Dashboard/components/Feeds/feedAssociatedTask';
import { AutoLinkCheckbox } from './autoLinkChecbox';
import './autoLinkDetailCard.scss';
import { LinkedForm } from './linkedForm';

const useStyles = makeStyles(() => ({
  notchedOutline: {
    border: 'none !important',
    boxShadow: '0px 8px 15px rgba(0, 0, 0, 0.1)',
    color: '#fff !important',
  },
  paper: {
    margin: 0,
    background: 'rgba(47, 52, 58, 0.98) !important',
    color: '#fff !important',
    fontWeight: 600,
  },
  inputRoot: {
    background: 'rgba(47, 52, 58, 0.98)!important',
    color: '#fff !important',
  },
}));
export interface Params {
  projectId: string;
  featureId: string;
}

interface DropDownType {
  index: number;
  label: string;
  value: string;
}
export const AutoLinkDetailCard = ({
  selectedTask,
  autoLinkDropdownOptions,
  handlePopover,
  closePopover,
}: {
  selectedTask: any | undefined;
  autoLinkDropdownOptions: any;
  handlePopover: any;
  closePopover: boolean;
}): React.ReactElement => {
  const classes: any = useStyles();
  const pathMatch: match<Params> = useRouteMatch();
  const searchRef = useRef<HTMLDivElement>(null);
  const [selectAll, setSelectAll] = useState(false);
  const [formSearch, setFormSearch] = useState(false);
  const [openTaskPopup, setOpenTaskPopup] = useState<boolean>(false);
  const [targetBox, setTargetBox] = useState({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  } as DOMRect);
  const [updatePopoverCount, setUpdatePopoverCount] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState('');
  const {
    state: { selectedProjectToken },
    dispatch,
  } = useContext(stateContext);

  const [linkedFormsLoader, setLinkedFormsLoader] = useState<{
    loading: boolean;
    data: any[];
  }>({ loading: false, data: [] });
  const selectedLinkedFormState = React.useState({});
  const [searchKeyword, setSearchKeyword] = useState('');
  const [dropDownOptions, setDropdownOptions] = useState<Array<DropDownType>>(
    []
  );
  const DASHBOARD_URL: any = process.env['REACT_APP_ENVIRONMENT'];
  useEffect(() => {
    async function apiCall() {
      setLinkedFormsLoader((prevState) => ({
        ...prevState,
        loading: true,
        data: [],
      }));
      selectedLinkedFormState[1]({});
      const data = await getTaskDetails(
        {
          taskId: selectedTask.taskId,
          feature: selectedFilter,
        },
        selectedProjectToken as string
      );
      setLinkedFormsLoader((prevState) => ({
        ...prevState,
        loading: false,
        data,
      }));
      setSearchKeyword('');
    }
    if (!!selectedTask?.taskId) apiCall();
  }, [selectedTask?.taskId, selectedFilter]);
  const handleClickOutside = (event: any) => {
    if (
      !searchRef?.current?.contains(event.target) &&
      !searchRef?.current?.contains(event.target)
    ) {
      setFormSearch(false);
      document.removeEventListener('mousedown', handleClickOutside);
    }
  };
  const openFormSearch = () => {
    setFormSearch(true);
    document.addEventListener('mousedown', handleClickOutside);
  };
  const handleAccept = async () => {
    try {
      dispatch(setIsLoading(true));
      const rejectedIds: number[] = [];
      const approvedIds: number[] = [];
      const formIdList: number[] = [];
      for (const [id, userResponse] of Object.entries(
        selectedLinkedFormState[0]
      )) {
        if (userResponse === USER_RESPONSE.APPROVED)
          approvedIds.push(Number(id));
        else if (userResponse === USER_RESPONSE.REJECTED)
          rejectedIds.push(Number(id));
      }

      approvedIds.forEach((id: number) => {
        const obj = data.find((e: any) => e.id === id);
        obj.form?.id && formIdList.push(obj.form.id);
      });

      await Promise.allSettled([
        createAutoLink(
          formIdList,
          selectedTask.taskId,
          selectedProjectToken as string
        ),
        !!approvedIds.length &&
          updateUserResponse(
            approvedIds,
            USER_RESPONSE.APPROVED,
            selectedProjectToken as string
          ),
        !!rejectedIds.length &&
          updateUserResponse(
            rejectedIds,
            USER_RESPONSE.REJECTED,
            selectedProjectToken as string
          ),
      ]);
      getInsightDemoApi(
        Number(decodeExchangeToken().tenantId),
        Number(pathMatch.params.projectId)
      );

      dispatch(setIsLoading(false));
      Notification.sendNotification(
        'Changes updated successfully',
        AlertTypes.success
      );
    } catch (err) {
      dispatch(setIsLoading(false));
      Notification.sendNotification('Error Encountered', AlertTypes.error);
    }
  };

  const getInsightDemoApi = async (tenantId: any, projectId: any) => {
    try {
      const response = await axiosApiInstance.get(
        `https://scheduler-impact-insights.service.${DASHBOARD_URL}.slate.ai/ScheduleImpactInsightsTrigger/secure/${tenantId}/${projectId}`,
        {
          headers: {
            token: 'project',
          },
        }
      );
    } catch (err) {
      console.log('error in insgits', err);
    }
  };
  const taskName = selectedTask?.projectTask?.taskName;
  const description = selectedTask?.projectTask?.description;
  const plannedStartDate = selectedTask?.projectTask?.plannedStartDate
    ? moment(selectedTask?.projectTask?.plannedStartDate).format('DD MMM YYYY')
    : null;
  const plannedEndDate = selectedTask?.projectTask?.plannedEndDate
    ? moment(selectedTask?.projectTask?.plannedEndDate).format('DD MMM YYYY')
    : null;
  const actualEndDate = selectedTask?.projectTask?.actualEndDate
    ? moment(selectedTask?.projectTask?.actualEndDate).format('DD MMM YYYY')
    : null;
  const actualStartDate = selectedTask?.projectTask?.actualStartDate
    ? moment(selectedTask?.projectTask?.actualStartDate).format('DD MMM YYYY')
    : null;
  const { loading, data } = linkedFormsLoader;
  const handleSelectAll = () => {
    const userResponseValues = Object.values(selectedLinkedFormState[0]);
    const isEveryApproved = userResponseValues.every(
      (item) => item === USER_RESPONSE.APPROVED
    );
    if (isEveryApproved) {
      selectedLinkedFormState[1]((prevState) => {
        const idsObj: { [key: string]: string } = {};
        for (const item of data) {
          idsObj[item.id] = USER_RESPONSE.REJECTED;
        }
        return idsObj;
      });
    } else {
      selectedLinkedFormState[1]((prevState) => {
        const idsObj: { [key: string]: string } = {};
        for (const item of data) {
          idsObj[item.id] = USER_RESPONSE.APPROVED;
        }
        return idsObj;
      });
    }
  };

  const getFilterList = () => {
    return data?.filter((e) => {
      const location = e?.form?.location || '';
      if (searchKeyword === '') {
        return true;
      } else {
        return location
          .toLocaleLowerCase()
          .includes(searchKeyword.toLocaleLowerCase());
      }
    });
  };

  const handleTaskClick = (e: any) => {
    setTargetBox(e.target.getBoundingClientRect());
    setOpenTaskPopup((prevState) => !prevState);
  };

  const refactorLabel = (label: string) => {
    if (label == undefined) {
      return 'No form found';
    }
    switch (label) {
      case 'QC_CHECKLIST': {
        return 'Checklist';
      }
      case 'ISSUES': {
        return 'Issues';
      }

      default:
        return label;
    }
  };

  const refactorValue = (value: string) => {
    if (value.includes('RFI')) {
      return '%RFI%';
    }
    switch (value) {
      case 'RFI': {
        return '%RFI%';
      }
      default:
        return value;
    }
  };

  useEffect(() => {
    const featuresOptions: Array<string> = [];
    if (selectedTask?.projectTask?.projectInsightsTaskFormLinks.length > 0) {
      selectedTask.projectTask?.projectInsightsTaskFormLinks.forEach(
        (data: any) => {
          if (data?.form?.projectFeature?.feature.includes('RFI')) {
            featuresOptions.push('RFI');
          } else {
            featuresOptions.push(data?.form?.projectFeature?.feature);
          }
        }
      );
      const uniqueArray = new Set();
      featuresOptions.forEach((item: any) => {
        uniqueArray.add(item);
      });
      const uniqueDropDownOptions = Array.from(uniqueArray);
      const optionList: Array<DropDownType> = [];
      uniqueDropDownOptions.forEach((item: any, index: number) => {
        const optionObject = {
          index: index,
          label: refactorLabel(item),
          value: refactorValue(item),
        };
        optionList.push(optionObject);
      });
      setSelectedFilter(optionList[0].value);
      setDropdownOptions(optionList);
    }
  }, [selectedTask]);

  if (selectedTask) {
    return (
      <div className="v2-auto-link-detail">
        <div className="v2-auto-link-detail-bar s-v-center">
          <h3 className="v2-auto-link-detail-title">
            Task Name:
            <span
              onClick={handleTaskClick}
              className="v2-auto-link-detail-bar-h3"
            >
              {' '}
              {taskName?.length > 120
                ? taskName?.slice(0, 120) + '...'
                : taskName}
            </span>
          </h3>
          <div className="v2-auto-link-detail-bar-action s-v-center">
            <button
              className="v2-auto-link-detail-bar-accept"
              onClick={handleAccept}
            >
              Update Links
            </button>
            {/* <button className="v2-auto-link-detail-bar-reject">Reject</button> */}
          </div>
        </div>
        <ShowComponent showState={!!description}>
          <div className="v2-auto-link-detail-title">Task Details:</div>
          <p className="v2-auto-link-detail-task-detail">{description}</p>
        </ShowComponent>
        <div className="v2-auto-link-detail-header s-v-center">
          <div>
            <div className="v2-auto-link-detail-linkedforms s-v-center">
              <span>Planned date:</span>
              <div className="v2-auto-link-detail-bar-dates">
                <p>
                  {plannedStartDate} - {plannedEndDate}
                </p>
              </div>
            </div>
            {actualEndDate && actualStartDate && (
              <div className="v2-auto-link-detail-linkedforms s-v-center">
                <span>Actual date:</span>
                <div className="v2-auto-link-detail-bar-dates">
                  <p>
                    {actualStartDate} - {actualEndDate}
                  </p>
                </div>
              </div>
            )}
          </div>
          <div className="v2-auto-link-detail-dropdown s-v-center">
            <span>Linked Form</span>
            <select
              value={selectedFilter}
              onChange={(e: any) => {
                const option = dropDownOptions.find(
                  (obj: any) => obj.value === e.target.value
                );
                setSelectedFilter(option?.value);
              }}
            >
              {dropDownOptions?.map((e: any) => (
                <option value={e.value}>{e.label}</option>
              ))}
            </select>
          </div>
          <div className="v2-auto-link-detail-search s-v-center">
            <span>Location</span>
            <SearchIcon className="search-icon" />
            <input
              type="text"
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
          </div>
        </div>
        <ShowComponent showState={loading}>
          <Box py={'10px'}>
            <LoadingCard />
          </Box>
        </ShowComponent>
        {getFilterList()?.length ? (
          <>
            <div className="v2-auto-link-detail-form-list">
              <div className="v2-auto-link-detail-form-list--header">
                <div>Name</div>
                <div>Location</div>
                <div>
                  <AutoLinkCheckbox
                    value={Object.values(selectedLinkedFormState[0]).every(
                      (item) => item === USER_RESPONSE.APPROVED
                    )}
                    onChange={handleSelectAll}
                  />
                </div>
              </div>
              {getFilterList()?.map(({ id, ...rest }) => (
                <LinkedForm
                  key={id}
                  id={id}
                  {...rest}
                  handleFormSelection={selectedLinkedFormState}
                  handlePopover={handlePopover}
                />
              ))}
            </div>
          </>
        ) : (
          !loading && <h4 className="no-form-found">No Form Found</h4>
        )}
        {/* <div className="v2-auto-link-detail-form-add s-v-center">
        <span>
          Do you have more suggestion? Please click on add more form button
        </span>
        <div className="v2-auto-link-detail-form-add-search" ref={searchRef}>
          <input type="text" onFocus={openFormSearch} />
          {formSearch && (
            <div className="v2-auto-link-detail-form-add-search-result">
              <div className="v2-auto-link-detail-form-add-search-result-form">
                <AutoLinkCheckbox label="Form" />
              </div>
              <div className="v2-auto-link-detail-form-add-search-result-form">
                <AutoLinkCheckbox label="Form" />
              </div>
              <div className="v2-auto-link-detail-form-add-search-result-form">
                <AutoLinkCheckbox label="Form" />
              </div>
              <div className="v2-auto-link-detail-form-add-search-result-form">
                <AutoLinkCheckbox label="Form" />
              </div>
              <div className="v2-auto-link-detail-form-add-search-result-form">
                <AutoLinkCheckbox label="Form" />
              </div>
            </div>
          )}
        </div>
      </div> */}

        <Popover
          trigger={<></>}
          position="bottom"
          foreignTrigger={true}
          foreignTargetBox={targetBox}
          open={openTaskPopup}
          reRender={updatePopoverCount}
        >
          {openTaskPopup ? (
            <FeedAssociatedTask
              onClose={() => setOpenTaskPopup(false)}
              isTask={true}
              taskId={selectedTask?.taskId}
              onDataLoad={() => setUpdatePopoverCount(updatePopoverCount + 1)}
            />
          ) : (
            <></>
          )}
        </Popover>
      </div>
    );
  } else {
    return (
      <div className="v2-auto-link-detail">
        <h4 className="v2-auto-link-detail--no-task-selected">
          No task selected
        </h4>
      </div>
    );
  }
};
