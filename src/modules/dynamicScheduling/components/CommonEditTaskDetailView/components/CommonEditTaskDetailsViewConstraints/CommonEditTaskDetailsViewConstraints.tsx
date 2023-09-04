import DateFnsUtils from '@date-io/date-fns';
import {
  Button,
  FormControl,
  Select,
  TextField,
  Tooltip,
} from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import Popover from '@material-ui/core/Popover';
import { makeStyles } from '@material-ui/core/styles';
import CancelIcon from '@material-ui/icons/Cancel';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import SearchIcon from '@material-ui/icons/Search';
import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
} from '@material-ui/pickers';
import { gantt } from 'dhtmlx-gantt';
import moment from 'moment';
import React, { useContext, useEffect, useState } from 'react';
import { match, useRouteMatch } from 'react-router-dom';
import { stateContext } from 'src/modules/root/context/authentication/authContext';
import GlobalKeyboardDatePicker from 'src/modules/shared/components/GlobalDatePicker/GlobalKeyboardDatePicker';
import EmptyConstraints from '../../../../../../assets/images/constraints_empty.svg';
import deleteIcon from '../../../../../../assets/images/task_details_constraint_delete.svg';
import editIcon from '../../../../../../assets/images/task_details_constraint_edit.svg';
import { useDebounce } from '../../../../../../customhooks/useDebounce';
import { decodeProjectFormExchangeToken } from '../../../../../../services/authservice';
import ConfirmDialog from '../../../../../shared/components/ConfirmDialog/ConfirmDialog';
import CommonEditProjectPlanContext from '../../../../context/commonEditProjectPlan/commonEditProjectPlanContext';
import EditProjectPlanLinkContext from '../../../../context/editProjectPlanLinks/editProjectPlanLinksContext';
import { permissionKeysByAssigneeAndToken } from '../../../../permission/scheduling';
import './CommonEditTaskDetailsViewConstraints.scss';

export interface Params {
  id: string;
}

const useStyles = makeStyles((theme) => ({
  popover: {
    pointerEvents: 'none',
  },
  paper: {
    padding: theme.spacing(1),
    width: '400px',
    height: '160px',
    display: 'flex',
  },
}));

const CommonEditTaskDetailsViewConstraints = (props: any) => {
  const { setEditMode, currentTask } = props;

  const classes = useStyles();

  const [errors, setErrors] = useState({
    constraintNameError: '',
    description: '',
  });
  const commonEditProjectPlanContext = useContext(CommonEditProjectPlanContext);
  const [searchName, setSearchName] = useState('');
  const debounceName = useDebounce(searchName, 400);
  const [showAssigneeOption, setShowAssigneeOption] = useState(false);
  const {
    categoryList,
    projectUser,
    lookAheadStatus,
    currentTaskConstraint,
    tenantCompanyList,
    formFeatures,
    projectTokens,
    projectMetaData,
    fetchFormFeatures,
    updateConstraintById,
    updateConstraintStatus,
    getConstraintsByTaskId,
    deleteConstraint,
    addConstraint,
    moveTaskInToDo,
    getCustomListByName,
    setLookAheadAction,
    getTenantCompanies,
    getProjectUsers,
    getProjectMetaData,
    updateLinkedForm,
  } = commonEditProjectPlanContext;

  const [constraintList, setConstraintList] = useState<any>([]);
  const [searchedUserList, setSearchedUserList] = useState<Array<any>>([]);
  // const [formFeature, setFormFeature] = useState<any>([]);
  const [editedConstraint, setEditedConstraint] = useState<any>(null);
  const [assigneeList, setAssigneeList] = useState<any>([]);
  const [deleteConfirmation, setDeleteConfirmation] = useState<any>(false);
  const [currentHoverIndex, SetCurrentHoverIndex] = useState<any>(-1);
  const [isTooltipOpen, SetisTooltipOpen] = useState<any>(false);
  const [selectedConstraint, setSelectedConstraint] = useState<any>(null);
  const pathMatch: match<Params> = useRouteMatch();
  const [addNewConstraint, setAddNewConstraint] = useState<any>({
    create: false,
    constraintName: '',
    category: '',
    featureId: '',
    description: null,
    dueDate: null,
    userAssignee: null,
    companyAssignee: null,
  });

  const [currentConstraintRow, SetCurrentConstraintRow] = useState<any>(null);

  const authContext: any = useContext(stateContext);
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const editProjectPlanLinkContext: any = useContext(
    EditProjectPlanLinkContext
  );

  useEffect(() => {
    setConstraintList(currentTaskConstraint);
    setContarintTaskColor();
  }, [currentTaskConstraint]);

  const stopEditConstraint = (index: number) => {
    constraintList[index].isEdit = false;
    setConstraintList([...constraintList]);

    setEditedConstraint(null);
  };

  useEffect(() => {
    if (!debounceName) {
      setAssigneeList([]);
      return;
    }
    if (debounceName.trim()) {
      const searchResult: any = [];
      const temp = [
        ...Object.values(projectUser),
        ...Object.values(tenantCompanyList),
      ];

      temp.forEach((data: any) => {
        if (
          (data?.firstName &&
            data?.firstName
              .toLowerCase()
              .includes(searchName.trim().toLowerCase())) ||
          (data?.lastName &&
            data?.lastName
              .toLowerCase()
              .includes(searchName.trim().toLowerCase())) ||
          (data?.name &&
            data?.name.toLowerCase().includes(searchName.trim().toLowerCase()))
        ) {
          searchResult.push(data);
        }
      });
      setAssigneeList(searchResult);
    } else {
      setAssigneeList([]);
    }
  }, [debounceName]);

  useEffect(() => {
    getConstraintsByTaskId(currentTask);
    getProjectUsers(currentTask);
    getProjectMetaData(currentTask);
    getFormFeatures();
    getTenantCompanies();
  }, [currentTask]);

  // useEffect(() => {
  //   const temp = [
  //     ...Object.values(projectUser),
  //     ...Object.values(tenantCompanyList),
  //   ];
  //   setAssigneeList(temp);
  // }, [tenantCompanyList]);
  useEffect(() => {
    getCustomListByName('Constraint Category');
    // fetchFormData();
  }, []);

  useEffect(() => {
    if (projectTokens) {
      fetchFormFeatures(currentTask);
    }
  }, [projectTokens]);

  const saveChanges = (index: any) => {
    constraintList[index] = editedConstraint;
    constraintList[index].isEdit = false;
    setConstraintList([...constraintList]);
    setEditedConstraint(null);
    updateConstraintById(editedConstraint, index);
  };

  const editConstraint = (index: any) => {
    if (!editedConstraint) {
      constraintList[index].isEdit = true;
      const item = constraintList[index];
      setSearchName(
        item.userAssignee
          ? projectUser[item.userAssignee]?.firstName +
              ' ' +
              projectUser[item.userAssignee]?.lastName
          : tenantCompanyList[item.companyAssignee]?.name
      );

      setEditedConstraint({ ...constraintList[index], isEdit: true });
      setConstraintList([...constraintList]);
      setEditMode(false);
    } else {
      setEditMode(true);
      return;
    }
  };

  const onChange = (argEvent: any) => {
    if (
      argEvent.target.name === 'constraintName' &&
      argEvent.target.value.length > 0
    ) {
      setErrors({ ...errors, constraintNameError: '' });
    }
    const constraint = { ...editedConstraint };

    constraint[argEvent.target.name] = argEvent.target.value;

    setEditedConstraint({ ...constraint });
    setConstraintList([...constraintList]);
  };

  const onBlur = (event: any) => {
    if (
      event.target.name === 'constraintName' &&
      event.target.value.length === 0
    ) {
      setErrors({ ...errors, constraintNameError: 'Title is required' });
    }
  };

  const changeStatus = (index: any) => {
    if (
      !permissionKeysByAssigneeAndToken(
        currentTask?.assignedTo,
        projectTokens[currentTask.projectId]
      ).update
    ) {
      return;
    }

    SetisTooltipOpen(false);
    SetCurrentHoverIndex(-1);
    if (editedConstraint) {
      return;
    }
    const constraint = { ...constraintList[index] };
    constraint.status = constraint.status === 'open' ? 'closed' : 'open';

    // if (
    //   (currentTask.lpsStatus === 'readyToGo' ||
    //     currentTask.lpsStatus === 'committed') &&
    //   constraint.status === 'open'
    // ) {
    //   moveTaskInToDo(currentTask.id);
    // }

    constraintList[index] = constraint;
    setConstraintList([...constraintList]);
    updateConstraintStatus(constraint, index);
  };

  const deleteItem = (constraint: any) => {
    //
    setSelectedConstraint(constraint);
    setDeleteConfirmation(true);
  };

  const cancelDelete = () => {
    setSelectedConstraint(null);
    setDeleteConfirmation(false);
  };

  const onNewConstrintChange = (e: any) => {
    if (e.target.name === 'constraintName' && e.target.value.length > 0) {
      setErrors({ ...errors, constraintNameError: '' });
    }

    if (e.target.name === 'feature') {
      setAddNewConstraint({
        ...addNewConstraint,
        [e.target.name]: e.target.value,
        featureId:
          e.target.value.length > 0
            ? formFeatures.filter(
                (feature: any) => feature.feature === e.target.value
              )[0].featureId
            : '',
      });
    } else if (e.target.name === 'assignee') {
      if (
        projectUser[e.target.value] &&
        projectUser[e.target.value].flag === 'user'
      ) {
        setAddNewConstraint({
          ...addNewConstraint,
          userAssignee: e.target.value,
          companyAssignee: null,
        });
      }

      if (
        tenantCompanyList[e.target.value] &&
        tenantCompanyList[e.target.value].flag === 'company'
      ) {
        setAddNewConstraint({
          ...addNewConstraint,
          companyAssignee: e.target.value,
          userAssignee: null,
        });
      }
    } else {
      setAddNewConstraint({
        ...addNewConstraint,
        [e.target.name]: e.target.value,
      });
    }
  };

  const saveNewConstraint = () => {
    addConstraint({ ...addNewConstraint, taskId: currentTask.id });

    // if (
    //   currentTask.lpsStatus === 'readyToGo' ||
    //   currentTask.lpsStatus === 'committed'
    // ) {
    //   moveTaskInToDo(currentTask.id);
    // }
    setAddNewConstraint({
      create: false,
      constraintName: '',
      category: '',
      featureId: '',
      description: null,
      dueDate: null,
      userAssignee: null,
      companyAssignee: null,
    });
    setEditMode(true);
  };

  const setContarintTaskColor = () => {
    if (lookAheadStatus && gantt) {
      if (currentTaskConstraint && currentTaskConstraint?.length) {
        const hasOpenConstarints = currentTaskConstraint.filter(
          (cc: any) => cc.status == 'open'
        );
        hasOpenConstarints.length
          ? setLookAheadAction({
              isInsert: true,
              taskId: currentTask?.id,
              isDelete: false,
              id: currentTaskConstraint[0]?.id,
              category: currentTaskConstraint[0]?.category,
              constraintName: currentTaskConstraint[0]?.constraintName,
            })
          : setLookAheadAction({
              isInsert: false,
              taskId: currentTask.id,
              isDelete: true,
            });
      } else {
        setLookAheadAction({
          isInsert: false,
          taskId: currentTask.id,
          isDelete: true,
        });
      }
    }
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

  const navigateToLinkForm = (argItem: any) => {
    if (!argItem.linkFormTask) {
      return;
    }
    const protocol = location.protocol;

    const host = location.host;

    const url = `${protocol}//${host}`;
    const targetUrl = `${url}/base/projects/${Number(
      pathMatch.params.id
    )}/form/${argItem.linkFormTask.form.projectFeature.id}/edit/${
      argItem.linkFormTask.formId
    }`;
    window.open(targetUrl, '_blank');
  };

  const navigateToLessonLearnedInsight = (lessonslearnedTaskInsight: any) => {
    if (
      !lessonslearnedTaskInsight.lessonslearnedProjectInsight &&
      !lessonslearnedTaskInsight.lessonslearnedProjectInsight.id
    ) {
      return;
    }
    const protocol = location.protocol;
    const host = location.host;
    const url = `${protocol}//${host}`;
    const targetUrl = `${url}/insights/projects/${Number(
      pathMatch.params.id
    )}/lessonsLearned/insight/${
      lessonslearnedTaskInsight.lessonslearnedProjectInsight.id
    }`;
    window.open(targetUrl, '_blank');
  };

  const handlePopoverOpen = (event: any, constraint: any) => {
    setAnchorEl(event.currentTarget);
    SetCurrentConstraintRow(constraint);
  };

  const handlePopoverClose = (event: any) => {
    setAnchorEl(null);
    SetCurrentConstraintRow(null);
  };

  const open = Boolean(anchorEl);

  const getFormFeatures = () => {
    const t = decodeProjectFormExchangeToken();
    const features: any = [];

    const createIds = t.createFormIds
      .replace(/["'{}]/g, '')
      .split(',')
      .map((value) => parseInt(value, 10));
    formFeatures.forEach((feature: any) => {
      if (createIds.indexOf(feature.featureId) > -1) {
        if (feature.feature !== 'Quality Control') {
          features.push(feature);
        }
      }
    });

    return features;
  };

  const onKeyDown = (e: any, index: any) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      stopEditConstraint(index);
    }
    return;
  };
  const onKeyPress = (e: any) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      setEditMode(true);
      setAddNewConstraint({
        create: false,
        constraintName: '',
        category: '',
        featureId: '',
        description: null,
        dueDate: null,
        userAssignee: null,
        companyAssignee: null,
      });
      setErrors({ ...errors, constraintNameError: '' });
    }
    return;
  };

  const addAssignee = (assignee: any) => {
    // if (argEvent.target.name === 'assignee') {
    // const constraint = { ...editedConstraint };
    const tempConstraint = { userAssignee: null, companyAssignee: null };
    if (projectUser[assignee.id] && projectUser[assignee.id].flag === 'user') {
      tempConstraint.userAssignee = assignee.id;
      tempConstraint.companyAssignee = null;

      setSearchName(assignee.firstName + ' ' + assignee.lastName);
    }

    if (
      tenantCompanyList[assignee.id] &&
      tenantCompanyList[assignee.id].flag === 'company'
    ) {
      tempConstraint.userAssignee = null;
      tempConstraint.companyAssignee = assignee.id;
      setSearchName(assignee.name);
    }
    setShowAssigneeOption(false);
    setConstraintList([...constraintList]);
    setAssigneeList([]);

    if (addNewConstraint.create) {
      const constraint = { ...addNewConstraint };
      constraint.userAssignee = tempConstraint.userAssignee;
      constraint.companyAssignee = tempConstraint.companyAssignee;
      setAddNewConstraint({ ...constraint });
    } else {
      const constraint = { ...editedConstraint };
      constraint.userAssignee = tempConstraint.userAssignee;
      constraint.companyAssignee = tempConstraint.companyAssignee;
      setEditedConstraint({ ...constraint });
    }

    // }
  };
  return (
    <div
      className="common-edit-task-detail-view__constraints"
      data-testid="edit-task-details-view-constraints-component"
    >
      {currentTaskConstraint &&
        currentTaskConstraint.length == 0 &&
        !addNewConstraint.create &&
        !authContext.state.isLoading && (
          <div className="common-edit-task-detail-view__constraints__empty">
            <img
              src={EmptyConstraints}
              className="common-edit-task-detail-view__constraints__empty-img"
              alt="No Constraints"
              data-testid="edit-task-details-view-constraints-empy-img"
            />
            <span className="common-edit-task-detail-view__constraints__empty-text">
              Looks like your task does not have any constraints yet
            </span>

            {currentTask.type === 'wbs'
              ? null
              : permissionKeysByAssigneeAndToken(
                  currentTask?.assignedTo,
                  projectTokens[currentTask.projectId]
                ).create && (
                  <Button
                    data-testid="edit-task-details-view-constraints-add-constraint"
                    variant="outlined"
                    className="btn-text common-edit-task-detail-view__constraints__empty-add-constraint"
                    onClick={() => {
                      setEditMode(false);
                      setAddNewConstraint({
                        create: true,
                        constraintName: '',
                        category: '',
                        featureId: '',
                        description: null,
                        dueDate: null,
                        userAssignee: null,
                        companyAssignee: null,
                      });
                    }}
                  >
                    + Add Constraints
                  </Button>
                )}
          </div>
        )}
      {currentTaskConstraint && currentTaskConstraint.length > 0 && (
        <div className="common-edit-task-detail-view__constraints__data">
          <div className="common-edit-task-detail-view__constraints__data__table-header">
            <div className="common-edit-task-detail-view__constraints__data__table-header__item-1">
              Title
            </div>
            <div className="common-edit-task-detail-view__constraints__data__table-header__item-2">
              Category
            </div>
            <div className="common-edit-task-detail-view__constraints__data__table-header__item-3">
              Description
            </div>
            <div className="common-edit-task-detail-view__constraints__data__table-header__item-4">
              Assignee
            </div>
            <div className="common-edit-task-detail-view__constraints__data__table-header__item-5">
              Due Date
            </div>
            <div className="common-edit-task-detail-view__constraints__data__table-header__item-6">
              Created by
            </div>
            <div className="common-edit-task-detail-view__constraints__data__table-header__item-7">
              Created on
            </div>
            <div className="common-edit-task-detail-view__constraints__data__table-header__item-8">
              Resolved by
            </div>
            <div className="common-edit-task-detail-view__constraints__data__table-header__item-9">
              Resolved on
            </div>
            <div className="common-edit-task-detail-view__constraints__data__table-header__item-10"></div>
            <div className="common-edit-task-detail-view__constraints__data__table-header__item-11"></div>
          </div>
          {constraintList.map((item: any, index: number) => (
            <div
              key={item.id}
              className="common-edit-task-detail-view__constraints__data__body__item"
            >
              {/* <Grid
                container
                key={`conatiner-${item.id}`}
                className={`common-edit-task-detail-view__constraints__data__body__item ${
                  index == 0
                    ? 'common-edit-task-detail-view__constraints-border-top'
                    : ''
                }`}
              > */}
              <div
                className="common-edit-task-detail-view__constraints__data__body__item__name"
                data-testid="constraint-name"
              >
                <Tooltip
                  open={isTooltipOpen && index === currentHoverIndex}
                  onOpen={() => {
                    SetCurrentHoverIndex(index);
                    SetisTooltipOpen(true);
                  }}
                  onClose={() => {
                    SetCurrentHoverIndex(-1);
                    SetisTooltipOpen(false);
                  }}
                  key={item.id}
                  title={
                    item.status === 'open'
                      ? 'click to resolve constraint'
                      : 'click to open constraint'
                  }
                  leaveDelay={200}
                >
                  {item.status == 'open' ? (
                    <div
                      onClick={() => changeStatus(index)}
                      className="common-edit-task-detail-view__constraints__data__body__item__status__uncheck"
                    ></div>
                  ) : (
                    // <Tooltip title="click to open constraint">
                    <CheckCircleIcon
                      onClick={() => changeStatus(index)}
                      className="common-edit-task-detail-view__constraints__data__body__item__status__check"
                    />
                  )}
                </Tooltip>
                {!item.isEdit ? (
                  item.linkFormTask ? (
                    <div
                      aria-owns={open ? 'mouse-over-popover' : undefined}
                      aria-haspopup="true"
                      onMouseEnter={(e: any) => {
                        handlePopoverOpen(e, item);
                      }}
                      onMouseOut={handlePopoverClose}
                    >
                      <span
                        className={`common-edit-task-detail-view__constraints__data__body__item__name-text ${
                          item.linkFormTask
                            ? 'common-edit-task-detail-view__constraints__data__body__item__name-text-hiperlink'
                            : ''
                        }`}
                        onClick={() => {
                          navigateToLinkForm(item);
                        }}
                      >
                        {item.constraintName}
                      </span>
                    </div>
                  ) : (
                    <Tooltip
                      title={item.constraintName}
                      placement="bottom-start"
                    >
                      <span
                        className={`common-edit-task-detail-view__constraints__data__body__item__name-text ${
                          item.lessonslearnedTaskInsight
                            ? 'common-edit-task-detail-view__constraints__data__body__item__name-text-hiperlink'
                            : ''
                        }`}
                        onClick={() => {
                          item.lessonslearnedTaskInsight &&
                            navigateToLessonLearnedInsight(
                              item.lessonslearnedTaskInsight
                            );
                        }}
                      >
                        {item.constraintName}
                      </span>
                    </Tooltip>
                  )
                ) : null}
                {item.isEdit && (
                  <div>
                    <TextField
                      data-testid="constraint-name-input"
                      className="common-edit-task-detail-view__constraints__data__body__item__name__input"
                      onChange={(e) => onChange(e)}
                      name="constraintName"
                      value={editedConstraint?.constraintName}
                      variant="outlined"
                      placeholder=" Enter Title"
                      onBlur={onBlur}
                      onKeyDown={(e) => onKeyDown(e, index)}
                      autoFocus={true}
                    />
                    {editedConstraint?.constraintName?.length > 30 && (
                      <div className="common-edit-task-detail-view__constraints__data-add-constraint-input-text__error">
                        Name must not exceed 30 characters
                      </div>
                    )}
                    {errors.constraintNameError && (
                      <div className="common-edit-task-detail-view__constraints__data-add-constraint-input-text__error">
                        {errors.constraintNameError}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div
                data-testid="constraint-category"
                className={`common-edit-task-detail-view__constraints__data__body__item__category ${
                  !item.isEdit
                    ? 'common-edit-task-detail-view__constraints__data__body__item__category-heading'
                    : ''
                }`}
              >
                {item.isEdit && (
                  <FormControl variant="outlined" fullWidth>
                    <Select
                      data-testid="constraint-category-input"
                      native
                      value={editedConstraint?.category}
                      name="category"
                      onChange={(e) => onChange(e)}
                      className=""
                      id="demo-simple-select-outlined"
                      onKeyDown={(e) => onKeyDown(e, index)}
                    >
                      <option
                        value=""
                        className="common-edit-task-detail-view__constraints__data__body__item__category-option"
                      >
                        Select a category
                      </option>
                      {categoryList.map((item: any, index: number) => (
                        <option
                          key={`${item.value}-${index}`}
                          value={item.value}
                          className="common-edit-task-detail-view__constraints__data__body__item__category-option"
                        >
                          {item.value}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                )}
                {!item.isEdit && item.category}
              </div>
              <div
                data-testid="constraint-description"
                className="common-edit-task-detail-view__constraints__data__body__item__description"
              >
                {!item.isEdit && (
                  <Tooltip title={item?.description} placement="bottom-start">
                    <span>
                      {' '}
                      {item?.description?.length > 30
                        ? item?.description?.slice(0, 30) + '...'
                        : item?.description}
                    </span>
                  </Tooltip>
                )}
                {item.isEdit && (
                  <div>
                    <TextField
                      data-testid="constraint-description"
                      onChange={(e) => onChange(e)}
                      name="description"
                      value={editedConstraint?.description}
                      className=" common-edit-task-detail-view__constraints__data__body__item__description-input"
                      variant="outlined"
                      placeholder=" Enter Description"
                      onBlur={onBlur}
                      onKeyDown={(e) => onKeyDown(e, index)}
                    />
                    {editedConstraint?.description?.length > 500 && (
                      <div className="common-edit-task-detail-view__constraints__data-add-constraint-input-text__error">
                        Description must not exceed 500 characters
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div
                data-testid="constraint-assignee"
                className="common-edit-task-detail-view__constraints__data__body__item__assignee"
              >
                {!item.isEdit && (
                  <span>
                    {' '}
                    {item.userAssignee
                      ? projectUser[item.userAssignee]?.firstName +
                        ' ' +
                        projectUser[item.userAssignee]?.lastName
                      : tenantCompanyList[item.companyAssignee]?.name}
                  </span>
                )}

                {item.isEdit && (
                  <div className="common-edit-task-detail-view__constraints__singleUserSelect">
                    <div className="common-edit-task-detail-view__constraints__singleUserSelect__search">
                      <SearchIcon className="common-edit-task-detail-view__constraints__singleUserSelect__search__icon" />
                      <TextField
                        value={searchName}
                        id="user-usergroup-search"
                        data-testid="constraint-assignee-input"
                        type="text"
                        //onFocus={fetchProjectUsers}
                        onClick={(e) => stopPropogation(e)}
                        placeholder="Search User/Company"
                        onChange={(e) => {
                          setShowAssigneeOption(true);
                          setSearchName(e.target.value);
                        }}
                      />
                      {searchName && (
                        <IconButton
                          onClick={(e) => {
                            setShowAssigneeOption(true);
                            setSearchName('');
                            setEditedConstraint({
                              ...editedConstraint,
                              userAssignee: null,
                              companyAssignee: null,
                            });
                          }}
                          data-testid="taskAssignee-search-close"
                          className="common-edit-task-detail-view__constraints__singleUserSelect__search__close"
                        >
                          <CancelIcon className="common-edit-task-detail-view__constraints__singleUserSelect__search__close__icon" />
                        </IconButton>
                      )}
                    </div>
                    {showAssigneeOption && (
                      <div className="common-edit-task-detail-view__constraints__singleUserSelect__option">
                        <div className="common-edit-task-detail-view__constraints__singleUserSelect__option__list">
                          {assigneeList.map(
                            (item: any, searchIndex: number) => (
                              <div
                                key={item.id}
                                className="common-edit-task-detail-view__constraints__singleUserSelect__option__list__item"
                                style={{
                                  borderBottom: `${
                                    assigneeList.length - 1 === searchIndex
                                      ? 'none'
                                      : ''
                                  }`,
                                }}
                                onClick={() => addAssignee(item)}
                              >
                                <div className="common-edit-task-detail-view__constraints__singleUserSelect__option__list__item__left">
                                  <div className="common-edit-task-detail-view__constraints__singleUserSelect__option__list__item__left__label">
                                    <div className="common-edit-task-detail-view__constraints__singleUserSelect__option__list__item__left__label__name">
                                      {item.name
                                        ? item.name
                                        : item.firstName + ' ' + item.lastName}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div
                data-testid="constraint-dueDate"
                className="common-edit-task-detail-view__constraints__data__body__item__due-date"
              >
                {!item.isEdit && (
                  <span>
                    {item.dueDate
                      ? moment(item.dueDate).format('DD MMM yyyy')
                      : '-'}
                  </span>
                )}

                {item.isEdit && (
                  <MuiPickersUtilsProvider utils={DateFnsUtils}>
                    <KeyboardDatePicker
                      autoOk
                      data-testid="edit_due_date"
                      className=""
                      variant="inline"
                      views={['year', 'month', 'date']}
                      inputVariant="outlined"
                      value={editedConstraint.dueDate}
                      onChange={(d: any) => {
                        setEditedConstraint({
                          ...editedConstraint,
                          dueDate: d,
                        });
                      }}
                      format="dd-MM-yyyy"
                      name="dueDate"
                      placeholder="Pick a date"
                      KeyboardButtonProps={{
                        'aria-label': 'change date',
                        onKeyDown: (e) => {
                          onKeyDown(e, index);
                        },
                      }}
                      maxDate={new Date(projectMetaData.plannedEndDate)}
                      initialFocusedDate={moment(currentTask.plannedStartDate)
                        .startOf('day')
                        .toDate()}
                    />
                  </MuiPickersUtilsProvider>
                )}
              </div>
              <div
                data-testid="constraint-createdby"
                className="common-edit-task-detail-view__constraints__data__body__item__createdby"
              >
                <Tooltip
                  title={`${projectUser[item.createdBy]?.firstName} ${
                    projectUser[item.createdBy]?.lastName
                  } `}
                >
                  <span>
                    {`${projectUser[item.createdBy]?.firstName} ${
                      projectUser[item.createdBy]?.lastName
                    } `}
                  </span>
                </Tooltip>
              </div>

              <div
                data-testid="constraint-createdat"
                className="common-edit-task-detail-view__constraints__data__body__item__createdon"
              >
                {moment(item.createdAt).format('DD MMM yyyy')}
              </div>

              <div
                data-testid="constraint-resolvedby"
                className="common-edit-task-detail-view__constraints__data__body__item__resolvedby"
              >
                {item.status === 'closed'
                  ? `${projectUser[item.updatedBy]?.firstName} ${
                      projectUser[item.updatedBy]?.lastName
                    }`
                  : '-'}
              </div>
              <div
                data-testid="constraint-resolvedat"
                className="common-edit-task-detail-view__constraints__data__body__item__resolvedon"
              >
                {item.status === 'closed' ? (
                  moment(item.updatedAt).format('DD MMM yyyy')
                ) : (
                  <span className="common-edit-task-detail-view__constraints__data__body__item__resolvedon-open">
                    Open
                  </span>
                )}
              </div>

              {!item.isEdit &&
                permissionKeysByAssigneeAndToken(
                  currentTask?.assignedTo,
                  projectTokens[currentTask.projectId]
                ).create && (
                  <div
                    data-testid="constraint-btn"
                    className="common-edit-task-detail-view__constraints__data__body__item__btn"
                  >
                    {item.status === 'open' && !item.linkId ? (
                      <img
                        data-testid="constraint-btn-edit"
                        src={editIcon}
                        alt="edit constraint"
                        className="common-edit-task-detail-view__constraints__data__body__item__btn-edit"
                        onClick={() => {
                          if (!addNewConstraint.create) editConstraint(index);
                        }}
                      />
                    ) : (
                      ''
                    )}
                  </div>
                )}
              {!item.isEdit &&
                permissionKeysByAssigneeAndToken(
                  currentTask?.assignedTo,
                  projectTokens[currentTask.projectId]
                ).create && (
                  <div
                    data-testid="constraint-btn"
                    className="common-edit-task-detail-view__constraints__data__body__item__btn__delete"
                  >
                    <img
                      data-testid="constraint-btn-delete"
                      src={deleteIcon}
                      className="common-edit-task-detail-view__constraints__data__body__item__btn-delete"
                      alt="delete constraint"
                      onClick={() =>
                        !addNewConstraint.create && deleteItem(item)
                      }
                    />
                  </div>
                )}

              {item.isEdit &&
                permissionKeysByAssigneeAndToken(
                  currentTask?.assignedTo,
                  projectTokens[currentTask.projectId]
                ).create && (
                  <div
                    data-testid="constraint-btn"
                    className="common-edit-task-detail-view__constraints__data__body__item__btn-save"
                  >
                    <Button
                      data-testid="constraint-btn-update"
                      onClick={() => {
                        setEditMode(true);
                        saveChanges(index);
                      }}
                      variant="outlined"
                      className="btn-primary common-edit-task-detail-view__constraints__data__body__item__btn-save-update"
                      disabled={
                        editedConstraint?.constraintName.trim().length === 0 ||
                        editedConstraint?.category.trim().length === 0 ||
                        editedConstraint?.constraintName.length > 30
                      }
                    >
                      Update
                    </Button>

                    <div>
                      <Button
                        data-testid="constraint-btn-discard"
                        onClick={() => {
                          setEditMode(true);
                          stopEditConstraint(index);
                          setErrors({ ...errors, constraintNameError: '' });
                        }}
                        className=" btn-text common-edit-task-detail-view__constraints__data__body__item__btn-save-discard "
                      >
                        Discard
                      </Button>
                    </div>
                  </div>
                )}
              {/* </Grid> */}
            </div>
          ))}
        </div>
      )}
      {addNewConstraint.create ? (
        <div className="common-edit-task-detail-view__constraints__data-add-constraint-input">
          <div>
            <TextField
              data-testid="constraint-name-input"
              className={`common-edit-task-detail-view__constraints__data-add-constraint-input-text`}
              onChange={(e) => onNewConstrintChange(e)}
              name="constraintName"
              value={addNewConstraint?.constraintName}
              variant="outlined"
              placeholder="Enter Title"
              onBlur={onBlur}
              onKeyDown={onKeyPress}
              autoFocus={true}
            />
            {/* inputProps={{ maxLength: 30 }} */}
            {addNewConstraint?.constraintName?.length > 30 && (
              <div className="common-edit-task-detail-view__constraints__data-add-constraint-input-text__error">
                Name must not exceed 30 characters
              </div>
            )}
            {errors.constraintNameError && (
              <div className="common-edit-task-detail-view__constraints__data-add-constraint-input-text__error">
                {errors.constraintNameError}
              </div>
            )}
          </div>
          <FormControl variant="outlined">
            <Select
              data-testid="constraint-category-input"
              native
              value={addNewConstraint?.category}
              name="category"
              onChange={(e) => onNewConstrintChange(e)}
              className="common-edit-task-detail-view__constraints__data-add-constraint-input-category"
              id="demo-simple-select-outlined"
              onKeyDown={onKeyPress}
            >
              <option value="">Select a category</option>
              {categoryList.map((item: any, index: number) => (
                <option key={`${item.value}-${index}`} value={item.value}>
                  {item.value}
                </option>
              ))}
            </Select>
          </FormControl>
          {addNewConstraint?.category == 'Form' && (
            <FormControl variant="outlined">
              <Select
                data-testid="constraint-form-input"
                native
                value={addNewConstraint?.feature}
                name="feature"
                onChange={(e) => onNewConstrintChange(e)}
                className="common-edit-task-detail-view__constraints__data-add-constraint-input-category"
                id="demo-simple-select-outlined"
                onKeyDown={onKeyPress}
              >
                <option value="">Select</option>
                {getFormFeatures().map((item: any, index: number) => (
                  <option key={`${item.feature}-${index}`} value={item.feature}>
                    {item.feature}
                  </option>
                ))}
              </Select>
            </FormControl>
          )}
          <div>
            <TextField
              data-testid="constraint-description-input"
              className={`common-edit-task-detail-view__constraints__data-add-constraint-input-description`}
              onChange={(e) => onNewConstrintChange(e)}
              name="description"
              value={addNewConstraint?.description}
              variant="outlined"
              placeholder="Enter Description"
              onBlur={onBlur}
              onKeyDown={onKeyPress}
            />

            {addNewConstraint?.description?.length > 500 && (
              <div className="common-edit-task-detail-view__constraints__data-add-constraint-input-text__error">
                Description must not exceed 500 characters
              </div>
            )}
          </div>
          <FormControl variant="outlined">
            <div className="common-edit-task-detail-view__constraints__singleUserSelect common-edit-task-detail-view__constraints__data-add-constraint-input-assignee">
              <div className="common-edit-task-detail-view__constraints__singleUserSelect__search">
                <SearchIcon className="common-edit-task-detail-view__constraints__singleUserSelect__search__icon" />
                <TextField
                  value={searchName}
                  id="user-usergroup-search"
                  data-testid="constraint-assignee-input"
                  type="text"
                  //onFocus={fetchProjectUsers}
                  onClick={(e) => stopPropogation(e)}
                  placeholder="Search User/Company"
                  onChange={(e) => {
                    setShowAssigneeOption(true);
                    setSearchName(e.target.value);
                  }}
                />
                {searchName && (
                  <IconButton
                    onClick={(e) => {
                      setShowAssigneeOption(true);
                      setSearchName('');
                      setAddNewConstraint({
                        ...addNewConstraint,
                        userAssignee: null,
                        companyAssignee: null,
                      });
                    }}
                    data-testid="taskAssignee-search-close"
                    className="common-edit-task-detail-view__constraints__singleUserSelect__search__close"
                  >
                    <CancelIcon className="common-edit-task-detail-view__constraints__singleUserSelect__search__close__icon" />
                  </IconButton>
                )}
              </div>
              {showAssigneeOption && (
                <div className="common-edit-task-detail-view__constraints__singleUserSelect__option">
                  <div className="common-edit-task-detail-view__constraints__singleUserSelect__option__list">
                    {assigneeList.map((item: any, searchIndex: number) => (
                      <div
                        key={item.id}
                        className="common-edit-task-detail-view__constraints__singleUserSelect__option__list__item"
                        style={{
                          borderBottom: `${
                            assigneeList.length - 1 === searchIndex
                              ? 'none'
                              : ''
                          }`,
                        }}
                        onClick={() => addAssignee(item)}
                      >
                        <div className="common-edit-task-detail-view__constraints__singleUserSelect__option__list__item__left">
                          <div className="common-edit-task-detail-view__constraints__singleUserSelect__option__list__item__left__label">
                            <div className="common-edit-task-detail-view__constraints__singleUserSelect__option__list__item__left__label__name">
                              {item.name
                                ? item.name
                                : item.firstName + ' ' + item.lastName}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </FormControl>

          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <GlobalKeyboardDatePicker
              data-testid="due_date"
              className="common-edit-task-detail-view__constraints__data-add-constraint-input-due-date"
              variant="inline"
              inputVariant="outlined"
              value={addNewConstraint.dueDate}
              onChange={(d: any) => {
                setAddNewConstraint({
                  ...addNewConstraint,
                  dueDate: d,
                });
              }}
              format="dd-MM-yyyy"
              name="dueDate"
              placeholder="Pick a date"
              KeyboardButtonProps={{
                'aria-label': 'change date',
                onKeyDown: (e: any) => {
                  onKeyPress(e);
                },
              }}
              maxDate={new Date(projectMetaData.plannedEndDate)}
              initialFocusedDate={moment(currentTask.plannedStartDate)
                .startOf('day')
                .toDate()}
            />
          </MuiPickersUtilsProvider>
          <Button
            data-testid="constraint-btn-update"
            onClick={saveNewConstraint}
            variant="outlined"
            className={`btn-primary common-edit-task-detail-view__constraints__data__body__item__btn-save-update ${
              addNewConstraint.constraintName.length === 0 ||
              addNewConstraint.category.length === 0
                ? 'btn-disabled'
                : ''
            }`}
            disabled={
              addNewConstraint.constraintName.trim().length === 0 ||
              addNewConstraint.category.length === 0 ||
              (addNewConstraint.category === 'Form' &&
                addNewConstraint.featureId.length === 0) ||
              addNewConstraint.constraintName.length > 30 ||
              addNewConstraint?.description?.length > 500
            }
          >
            Add
          </Button>

          <Button
            data-testid="constraint-btn-discard"
            onClick={() => {
              setEditMode(true);
              setAddNewConstraint({
                create: false,
                constraintName: '',
                category: '',
                featureId: '',
                description: null,
                dueDate: null,
                userAssignee: null,
                companyAssignee: null,
              });
              setSearchName('');
              setErrors({ ...errors, constraintNameError: '' });
            }}
            className=" btn-text common-edit-task-detail-view__constraints__data__body__item__btn-save-discard "
          >
            Discard
          </Button>
        </div>
      ) : (
        ''
      )}
      {!addNewConstraint.create &&
      constraintList &&
      constraintList.length > 0 &&
      permissionKeysByAssigneeAndToken(
        currentTask?.assignedTo,
        projectTokens[currentTask.projectId]
      ).create ? (
        <Button
          data-testid="edit-task-details-view-constraints-add-constraint-btn"
          className="btn-text common-edit-task-detail-view__constraints__data-add-constraint-btn"
          onClick={() => {
            setEditMode(false);
            setAddNewConstraint({
              create: true,
              constraintName: '',
              category: '',
              featureId: '',
              description: null,
              dueDate: null,
              userAssignee: null,
              companyAssignee: null,
            });
            setSearchName('');
          }}
          disabled={editedConstraint}
        >
          + Add Constraints
        </Button>
      ) : (
        ''
      )}
      {
        <ConfirmDialog
          data-testid="delete-constraint"
          open={deleteConfirmation}
          message={{
            text: 'Are you sure you want to delete this constraint?',
            cancel: 'Cancel',
            proceed: 'Delete',
          }}
          close={cancelDelete}
          proceed={() => {
            deleteConstraint(selectedConstraint);
            if (selectedConstraint && selectedConstraint.linkId) {
              updateLinkedForm(selectedConstraint.linkId, 3); //3 = RELATES_TO
            }
            setDeleteConfirmation(false);
          }}
        />
      }

      <Popover
        id="mouse-over-popover"
        open={open}
        className={classes.popover}
        classes={{
          paper: classes.paper,
        }}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        onClose={handlePopoverClose}
        disableRestoreFocus
      >
        <table className="common-edit-task-detail-view__constraints__form-name__popover__table">
          <tr className="common-edit-task-detail-view__constraints__form-name__popover__table__tr">
            <th className="common-edit-task-detail-view__constraints__form-name__popover__table__tr__th">
              Form Id
            </th>
            <td className="common-edit-task-detail-view__constraints__form-name__popover__table__tr__td">
              {currentConstraintRow?.linkFormTask &&
              currentConstraintRow?.linkFormTask?.form.projectAutoIncrement
                ? currentConstraintRow?.linkFormTask?.form.projectAutoIncrement
                : '--'}
            </td>
          </tr>
          <tr className="common-edit-task-detail-view__constraints__form-name__popover__table__tr">
            <th className="common-edit-task-detail-view__constraints__form-name__popover__table__tr__th">
              Constraint Title
            </th>
            <td className="common-edit-task-detail-view__constraints__form-name__popover__table__tr__td">
              {currentConstraintRow?.constraintName}
            </td>
          </tr>
          <tr className="common-edit-task-detail-view__constraints__form-name__popover__table__tr">
            <th className="common-edit-task-detail-view__constraints__form-name__popover__table__tr__th">
              Current Assignee{' '}
            </th>
            <td className="common-edit-task-detail-view__constraints__form-name__popover__table__tr__td common-edit-task-detail-view__constraints__form-name__popover__table__tr__td-5">
              <span>
                {' '}
                {currentConstraintRow?.linkFormTask &&
                currentConstraintRow?.linkFormTask?.form.formsUserLists.length >
                  0
                  ? currentConstraintRow?.linkFormTask?.form.formsUserLists[0]
                      .user.firstName +
                    ' ' +
                    currentConstraintRow?.linkFormTask?.form.formsUserLists[0]
                      .user.lastName
                  : '--'}{' '}
              </span>
              <span className="common-edit-task-detail-view__constraints__form-name__popover__table__tr__td-5-email">
                {currentConstraintRow?.linkFormTask &&
                currentConstraintRow?.linkFormTask?.form.formsUserLists.length >
                  0
                  ? currentConstraintRow?.linkFormTask?.form.formsUserLists[0]
                      .user.email
                  : '--'}
              </span>
            </td>
          </tr>
        </table>
      </Popover>
    </div>
  );
};

export default CommonEditTaskDetailsViewConstraints;
