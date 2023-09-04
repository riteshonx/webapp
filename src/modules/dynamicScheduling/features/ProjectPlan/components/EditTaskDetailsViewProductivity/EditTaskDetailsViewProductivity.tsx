import { Tooltip, TooltipProps } from '@material-ui/core';
import { InfoOutlined } from '@material-ui/icons';
import { ClickAwayListener, tooltipClasses } from '@mui/material';
import { styled } from '@mui/material/styles';
import React, { useContext, useEffect, useState } from 'react';
import { useDebounce } from 'src/customhooks/useDebounce';
import {
  default as ProjectPlanContext,
  default as projectPlanContext,
} from 'src/modules/dynamicScheduling/context/projectPlan/projectPlanContext';
import {
  GET_CLASSIFICATION_CODE,
  GET_PROJECT_PRODUCTIVITY,
} from 'src/modules/dynamicScheduling/graphql/queries/projectProductivity';
import { setIsLoading } from 'src/modules/root/context/authentication/action';
import { stateContext } from 'src/modules/root/context/authentication/authContext';
import ShowComponent from 'src/modules/shared/utils/ShowComponent';
import { client } from '../../../../../../services/graphql';
import { permissionKeys } from '../../../../permission/scheduling';
import './EditTaskDetailsViewProductivity.scss';
import ProductivityCostCodeList from './ProducitivityCostCodeList';

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
const EditTaskDetailsViewProductivity = (): React.ReactElement => {
  const { state, dispatch }: any = useContext(stateContext);
  const { currentTask, updateProjectProductivity } =
    useContext(ProjectPlanContext);
  const [plannedActions, setPlannedActions] = useState<any>({
    plannedHours: '',
    plannedQty: '',
  });
  const [classificationCodeList, setClassificationCodeList] =
    useState<ClassifyCodeType>(defaultValues);
  const taskId = currentTask.id;

  useEffect(() => {
    if (currentTask && currentTask.id) {
      getProjectProductivity();
    }
  }, [currentTask]);

  const handleChangeOfActions = (e: any) => {
    if (e.target.value < 0 || e.target.value.trim() == '') {
      setPlannedActions({ ...plannedActions, [e.target.name]: null });
    } else {
      setPlannedActions({ ...plannedActions, [e.target.name]: e.target.value });
    }
  };
  const saveActions = async (classification: any) => {
    const { plannedHours, plannedQty } = plannedActions;
    await updateProjectProductivity({
      id: [taskId],
      classificationCodeId: classification.id < 0 ? null : classification.id,
      plannedLabourHour: plannedHours,
      plannedQuantity: plannedQty,
    });
  };

  const getProjectProductivity = async () => {
    try {
      dispatch(setIsLoading(true));
      const res = await client.query({
        query: GET_PROJECT_PRODUCTIVITY,
        fetchPolicy: 'network-only',
        variables: {
          id: taskId,
        },
        context: {
          role: 'viewMasterPlan',
          token: state?.selectedProjectToken,
        },
      });

      const response = res?.data?.projectTask[0];

      setPlannedActions({
        ...plannedActions,
        plannedHours: response.plannedLabourHour,
        plannedQty: response.plannedQuantity,
      });
      if (response.classificationCode) {
        setClassificationCodeList({
          ...classificationCodeList,
          id: response.classificationCode.id,
          UOM: response.classificationCode.UOM,
          classificationCode: response.classificationCode.classificationCode,
          classificationCodeName:
            response.classificationCode.classificationCodeName,
          unit: response.classificationCode.UOM,
        });
      }
      dispatch(setIsLoading(false));
    } catch (err) {
      console.log('error:', err);
      dispatch(setIsLoading(false));
    }
  };

  const onKeyDown = (e: any) => {
    const exceptThisSymbols = ['e', 'E', '+', '-', '.'];
    if (exceptThisSymbols.includes(e.key)) {
      e.preventDefault();
      return false;
    }
  };

  const getCode = (item: ClassifyCodeType) => {
    const tempClassificationCode = {
      ...classificationCodeList,
      id: item.id,
      UOM: item.UOM,
      classificationCode: item.classificationCode,
      classificationCodeName: item.classificationCodeName,
      unit: item.UOM,
    };
    setClassificationCodeList(tempClassificationCode);
    saveActions(tempClassificationCode);
  };

  const saveClassificationCodeChange = (e: any) => {
    if (e.target.value == '' || e.target.value == null) {
      setClassificationCodeList(defaultValues);
      saveActions(defaultValues);
    }
  };
  const labelName = `${classificationCodeList?.classificationCode ?? ''} ${
    classificationCodeList?.classificationCodeName ?? ''
  }`;
  return (
    <div className="edit-task-details-view-productivity">
      <div className="edit-task-details-view-productivity__template">
        <label htmlFor="edit-task-details-view-productivity_type">
          Select Classification Code
        </label>
        <div className="edit-task-details-view-productivity__template__group">
          <ClassificationCodeInput
            saveClassificationCodeChange={saveClassificationCodeChange}
            getCode={getCode}
            initName={labelName.trim()}
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
            <InfoOutlined className="edit-task-details-view-productivity__template__info" />
          </HtmlTooltip>
        </div>
      </div>

      <div className="edit-task-details-view-productivity__parameter">
        <div className="edit-task-details-view-productivity__parameter__code">
          Classification Code :
          <span className="edit-task-details-view-productivity__parameter__code__value">
            {classificationCodeList ? labelName : ' -- '}
          </span>
        </div>
      </div>
      <div className="edit-task-details-view-productivity__parameter">
        <div className="edit-task-details-view-productivity__parameter__label">
          Planned Quantity
        </div>
        <div className="edit-task-details-view-productivity__parameter__value">
          <input
            data-testid="planned-quantity"
            placeholder="Enter Planned Quantity here"
            name="plannedQty"
            type="number"
            value={plannedActions.plannedQty}
            onChange={(e: any) => handleChangeOfActions(e)}
            onBlur={() => saveActions(false)}
            onKeyDown={onKeyDown}
            min="0"
            disabled={
              classificationCodeList.classificationCodeName == '' ||
              !permissionKeys(currentTask?.assignedTo).update
            }
          />
          <span className="edit-task-details-view__parameter__value__unit">
            {classificationCodeList.unit}
          </span>
        </div>
      </div>
      <div className="edit-task-details-view-productivity__parameter">
        <div className="edit-task-details-view-productivity__parameter__label">
          Planned Hours
        </div>
        <div className="edit-task-details-view-productivity__parameter__value">
          <input
            data-testid="planned-hours"
            placeholder="Enter Planned hours here"
            name="plannedHours"
            type="number"
            value={plannedActions.plannedHours}
            onChange={(e: any) => handleChangeOfActions(e)}
            onBlur={() => saveActions(false)}
            onKeyDown={onKeyDown}
            min="0"
            disabled={
              classificationCodeList.classificationCodeName == '' ||
              !permissionKeys(currentTask?.assignedTo).update
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
export default EditTaskDetailsViewProductivity;

interface CodeInputProps {
  initName: string;
  saveClassificationCodeChange: (e: React.BaseSyntheticEvent) => void;
  getCode: (item: any) => void;
  classes?: { [key: string]: string };
}
export function ClassificationCodeInput({
  initName,
  saveClassificationCodeChange,
  getCode,
  classes,
}: CodeInputProps): React.ReactElement {
  const [classificationLabel, setClassificationLabel] = useState<any>([]);
  const [searchName, setSearchName] = useState('');
  const debounceName = useDebounce(searchName, 300);
  const [showListOption, setShowListOption] = useState(false);
  const [noData, setNoData] = useState(false);
  const { currentTask } = React.useContext(projectPlanContext);
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
            role: 'viewMasterPlan',
            token: state?.selectedProjectToken,
          },
        });

        const classificationCodes = res?.data?.classificationCodes;
        if (initName == searchName) {
					setNoData(false);
				} else if (classificationCodes.length == 0) {
					setNoData(true);
				}
        //  if (classificationCodes.length == 0) {
        //   setNoData(true);
        // }

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
      <div className="edit-task-details-view-productivity__list">
        <div className="edit-task-details-view-productivity__list__search">
          <input
            value={searchName}
            type="text"
            onClick={stopPropogation}
            placeholder="Search classification code here"
            onChange={onClassificationCodeOptionChange}
            onFocus={() => setShowListOption(true)}
            onBlur={handleClassificationCodeChange}
            className="edit-task-details-view-productivity__list__searchbox"
            disabled={!permissionKeys(currentTask?.assignedTo).update}
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
