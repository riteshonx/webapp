import { Tooltip, TooltipProps } from '@material-ui/core';
import { InfoOutlined } from '@material-ui/icons';
import { ClickAwayListener, tooltipClasses } from '@mui/material';
import { styled } from '@mui/material/styles';
import React, { useContext, useEffect, useState } from 'react';
import { useDebounce } from 'src/customhooks/useDebounce';
import { GET_CLASSIFICATION_CODE } from 'src/modules/dynamicScheduling/graphql/queries/projectProductivity';
import { stateContext } from 'src/modules/root/context/authentication/authContext';
import ShowComponent from 'src/modules/shared/utils/ShowComponent';
import { client } from '../../../../../../services/graphql';
import CommonEditProjectPlanContext from '../../../../context/commonEditProjectPlan/commonEditProjectPlanContext';
import ProductivityCostCodeList from '../../../../features/ProjectPlan/components/EditTaskDetailsViewProductivity/ProducitivityCostCodeList';
import {
  permissionKeysByAssigneeAndToken,
  priorityPermissionsByToken,
} from '../../../../permission/scheduling';
import './CommonEditTaskDetailsViewProductivity.scss';
const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(() => ({
  [`& .${tooltipClasses.tooltip}`]: {
    maxWidth: 300,
    fontSize: '12px',
  },
}));
export interface ClassifyCodeType {
  id: number;
  UOM: string;
  classificationCode: string;
  classificationCodeName: string;
  unit: string;
}
const defaultValues = {
  id: -1,
  UOM: '',
  classificationCode: '',
  classificationCodeName: '',
  unit: '',
};
export interface ProductivityInputType {
  id: string[];
  plannedLabourHour?: string | null;
  plannedQuantity?: number | null;
  classificationCodeId: number | null;
}
const CommonEditTaskDetailsViewProductivity = (
  props: any
): React.ReactElement => {
  const { state, dispatch }: any = useContext(stateContext);
  const { currentTask } = props;
  const [plannedActions, setPlannedActions] = useState<any>({
    plannedHours: null,
    plannedQty: null,
  });
  const commonEditProjectPlan = useContext(CommonEditProjectPlanContext);
  const [classificationCodeList, setClassificationCodeList] =
    useState<ClassifyCodeType>(defaultValues);
  const taskId = currentTask.id;

  const {
    getProjectProductivity,
    projectTokens,
    projectProductivity,
    updateProjectProductivity,
  } = commonEditProjectPlan;
  useEffect(() => {
    if (currentTask.id && projectTokens[currentTask.projectId]) {
      const response = getProjectProductivity(currentTask);
    }
  }, [currentTask, projectTokens]);

  useEffect(() => {
    if (projectProductivity) {
      setPlannedActions({
        plannedHours: projectProductivity.plannedLabourHour,
        plannedQty: projectProductivity.plannedQuantity,
      });
      if (projectProductivity.classificationCode) {
        setClassificationCodeList({
          id: projectProductivity.classificationCode.id,
          UOM: projectProductivity.classificationCode.UOM,
          classificationCode:
            projectProductivity.classificationCode.classificationCode,
          classificationCodeName:
            projectProductivity.classificationCode.classificationCodeName,
          unit: projectProductivity.classificationCode.UOM,
        });
      }
    }
  }, [projectProductivity]);

  const handleChangeOfActions = (e: any) => {
    if (e.target.value < 0 || e.target.value.trim() == '') {
      setPlannedActions({ ...plannedActions, [e.target.name]: null });
    } else {
      setPlannedActions({ ...plannedActions, [e.target.name]: e.target.value });
    }
  };
  const saveActions = async (
    isClassification: boolean,
    classificationCodeId: any
  ) => {
    const { plannedHours, plannedQty } = plannedActions;
    await updateProjectProductivity({
      id: [taskId],
      classificationCodeId: isClassification ? null : classificationCodeId,
      plannedLabourHour: plannedHours,
      plannedQuantity: plannedQty,
    });
  };

  const onKeyDown = (e: any) => {
    const exceptThisSymbols = ['e', 'E', '+', '-', '.'];
    if (exceptThisSymbols.includes(e.key)) {
      e.preventDefault();
      return false;
    }
  };

  const getCode = (item: ClassifyCodeType) => {
    setClassificationCodeList({
      ...classificationCodeList,
      id: item.id,
      UOM: item.UOM,
      classificationCode: item.classificationCode,
      classificationCodeName: item.classificationCodeName,
      unit: item.UOM,
    });
    saveActions(false, item.id);
  };

  const saveClassificationCodeChange = (e: any) => {
    if (e.target.value == '' || e.target.value == null) {
      setClassificationCodeList(defaultValues);
      saveActions(true, classificationCodeList.id);
    }
  };
  const labelName = `${classificationCodeList?.classificationCode ?? ''} ${
    classificationCodeList?.classificationCodeName ?? ''
  }`;
  return (
    <div className="common-edit-task-details-view-productivity">
      <div className="common-edit-task-details-view-productivity__template">
        <label htmlFor="common-edit-task-details-view-productivity_type">
          Select Classification Code
        </label>
        <div className="common-edit-task-details-view-productivity__template__group">
          <ClassificationCodeInput
            saveClassificationCodeChange={saveClassificationCodeChange}
            getCode={getCode}
            initName={labelName.trim()}
            projectTokens={projectTokens}
            currentTask={currentTask}
          />
          <HtmlTooltip
            placement="right-start"
            arrow
            title={
              <React.Fragment>
                Pick a classification code to enter the planned quantities and
                labour hours. This will be used to assess productivity of your
                crew.
              </React.Fragment>
            }
          >
            <InfoOutlined className="common-edit-task-details-view-productivity__template__info" />
          </HtmlTooltip>
        </div>
      </div>

      <div className="common-edit-task-details-view-productivity__parameter">
        <div className="common-edit-task-details-view-productivity__parameter__code">
          Classification Code :
          <span className="common-edit-task-details-view-productivity__parameter__code__value">
            {classificationCodeList ? labelName : ' -- '}
          </span>
        </div>
      </div>
      <div className="common-edit-task-details-view-productivity__parameter">
        <div className="common-edit-task-details-view-productivity__parameter__label">
          Planned Quantity
        </div>
        <div className="common-edit-task-details-view-productivity__parameter__value">
          <input
            data-testid="planned-quantity"
            placeholder="Enter Planned Quantity here"
            name="plannedQty"
            type="number"
            value={plannedActions.plannedQty}
            onChange={(e: any) => handleChangeOfActions(e)}
            onBlur={() => saveActions(false, classificationCodeList.id)}
            onKeyDown={onKeyDown}
            min="0"
            disabled={
              classificationCodeList.classificationCodeName == '' ||
              !permissionKeysByAssigneeAndToken(
                currentTask?.assignedTo,
                projectTokens[currentTask?.projectId]
              ).update
            }
          />
          <span className="edit-task-details-view__parameter__value__unit">
            {classificationCodeList.unit}
          </span>
        </div>
      </div>
      <div className="common-edit-task-details-view-productivity__parameter">
        <div className="common-edit-task-details-view-productivity__parameter__label">
          Planned Hours
        </div>
        <div className="common-edit-task-details-view-productivity__parameter__value">
          <input
            data-testid="planned-hours"
            placeholder="Enter Planned hours here"
            name="plannedHours"
            type="number"
            value={plannedActions.plannedHours}
            onChange={(e: any) => handleChangeOfActions(e)}
            onBlur={() => saveActions(false, classificationCodeList.id)}
            onKeyDown={onKeyDown}
            min="0"
            disabled={
              classificationCodeList.classificationCodeName == '' ||
              !permissionKeysByAssigneeAndToken(
                currentTask?.assignedTo,
                projectTokens[currentTask?.projectId]
              ).update
            }
          />
          <span className="edit-task-details-view__parameter__value__unit">
            Hrs
          </span>
        </div>
      </div>
    </div>
  );
};
export default CommonEditTaskDetailsViewProductivity;

interface CodeInputProps {
  initName: string;
  saveClassificationCodeChange: (e: React.BaseSyntheticEvent) => void;
  getCode: (item: any) => void;
  classes?: { [key: string]: string };
  projectTokens: string;
  currentTask: any;
}
export function ClassificationCodeInput({
  initName,
  saveClassificationCodeChange,
  getCode,
  classes,
  projectTokens,
  currentTask,
}: CodeInputProps): React.ReactElement {
  const [classificationLabel, setClassificationLabel] = useState<any>([]);
  const [searchName, setSearchName] = useState('');
  const debounceName = useDebounce(searchName, 300);
  const [showListOption, setShowListOption] = useState(false);
  const [noData, setNoData] = useState(false);
  const { state } = React.useContext(stateContext);
  useEffect(() => {
    if (debounceName.trim()) {
      searchClassificationCode(debounceName.trim());
    } else {
      setClassificationLabel([]);
      setShowListOption(false);
    }
  }, [debounceName]);

  React.useEffect(() => {
    setSearchName(initName);
  }, [initName]);

  const searchClassificationCode = async (searchText: any) => {
    if (debounceName) {
      try {
        const res = await client.query({
          query: GET_CLASSIFICATION_CODE,
          variables: {
            classificationCode: searchText ? `%${searchText}%` : `%%`,
            classificationCodeName: searchText ? `%${searchText}%` : `%%`,
          },
          context: {
            role: priorityPermissionsByToken(
              'view',
              projectTokens[currentTask.projectId]
            ),
            token: projectTokens[currentTask.projectId],
          },
        });

        const classificationCodes = res?.data?.classificationCodes;
        if (classificationCodes.length == 0) {
          setNoData(true);
        }
        setClassificationLabel(classificationCodes);
      } catch (err) {
        console.log('error', err);
      }
    }
  };

  const handleCode = (item: ClassifyCodeType) => {
    getCode(item);
    setShowListOption(false);
  };

  const onClassificationCodeOptionChange = (e: any) => {
    setShowListOption(true);
    setSearchName(e.target.value);
  };

  const handleClassificationCodeChange = (e: any) => {
    saveClassificationCodeChange(e);
  };
  const stopPropogation = (
    event: React.MouseEvent<
      HTMLDivElement | HTMLButtonElement | SVGSVGElement,
      MouseEvent
    >
  ) => {
    event.stopPropagation();
    event.preventDefault();
  };

  return (
    <ClickAwayListener onClickAway={() => setShowListOption(false)}>
      <div className="common-edit-task-details-view-productivity__list">
        <div className="common-edit-task-details-view-productivity__list__search">
          <input
            value={searchName}
            type="text"
            onClick={stopPropogation}
            placeholder="Search classification code here"
            onChange={onClassificationCodeOptionChange}
            onFocus={() => setShowListOption(true)}
            onBlur={handleClassificationCodeChange}
            className="common-edit-task-details-view-productivity__list__searchbox"
            disabled={
              !permissionKeysByAssigneeAndToken(
                currentTask?.assignedTo,
                projectTokens[currentTask?.projectId]
              ).update
            }
          />
        </div>
        <ShowComponent showState={showListOption}>
          <div className="classificationcode__option">
            <div
              className={`classificationcode__option__list ${
                classes?.['list-width'] ?? ''
              }`}
            >
              <ProductivityCostCodeList
                classificationLabel={classificationLabel}
                getCode={handleCode}
              />
              {noData && classificationLabel.length === 0 ? (
                <div style={{ padding: '5px' }}> No Data Found</div>
              ) : (
                ''
              )}
            </div>
          </div>
        </ShowComponent>
      </div>
    </ClickAwayListener>
  );
}

ClassificationCodeInput.defaultProps = {
  classes: {
    'list-width': 'classificationcode__option__list__width',
  },
};
