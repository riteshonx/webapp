import {
  Button,
  FormControl,
  Select,
  TextField,
  Tooltip,
} from '@material-ui/core';
import moment from 'moment';
import React, { useContext, useEffect, useState } from 'react';
import { permissionKeysByAssigneeAndToken } from 'src/modules/dynamicScheduling/permission/scheduling';
import { stateContext } from 'src/modules/root/context/authentication/authContext';
import ConfirmDialog from 'src/modules/shared/components/ConfirmDialog/ConfirmDialog';
import deleteIcon from '../../../../../../assets/images/task_details_constraint_delete.svg';
import editIcon from '../../../../../../assets/images/task_details_constraint_edit.svg';
import varinceImg from '../../../../../../assets/images/variances_empty.svg';
import CommonEditProjectPlanContext from '../../../../context/commonEditProjectPlan/commonEditProjectPlanContext';
import './CommonEditTaskDetailsViewVariances.scss';

const CommonEditTaskDetailsViewVariances = (props: any) => {
  const { setEditMode, currentTask } = props;
  const commonEditProjectPlanContext = useContext(CommonEditProjectPlanContext);
  const authContext: any = useContext(stateContext);
  const {
    projectTokens,
    getVariancesByTaskId,
    currentTaskVariances,
    addVariance,
    updateVarianceById,
    deleteVariance,
    categoryList,
    getCustomListByName,
    projectUser,
    getProjectUsers,
  } = commonEditProjectPlanContext;
  const [varianceList, setVarianceList] = useState<any>([]);
  const [editedVariance, setEditedVariance] = useState<any>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<any>(false);
  const [selectedVariance, setSelectedVariance] = useState<any>(null);
  const [addNewVariance, setAddNewVariance] = useState<any>({
    create: false,
    varianceName: ' ',
    category: '',
  });

  useEffect(() => {
    if (currentTask) {
      getVariancesByTaskId(currentTask);
      getProjectUsers(currentTask);
    }
  }, [currentTask]);

  useEffect(() => {
    setVarianceList(currentTaskVariances);
  }, [currentTaskVariances]);

  useEffect(() => {
    getCustomListByName('Variance Category');
  }, []);

  const onNewVarianceChange = (e: any) => {
    setAddNewVariance({
      ...addNewVariance,
      [e.target.name]: e.target.value,
    });
  };

  const saveNewVariance = () => {
    addVariance({ ...addNewVariance, taskId: currentTask.id });
    setAddNewVariance({ create: false, varianceName: ' ', category: '' });
    setEditMode(true);
  };

  const editVariance = (index: any) => {
    if (!editedVariance) {
      varianceList[index].isEdit = true;
      setEditedVariance({ ...varianceList[index], isEdit: true });
      setVarianceList([...varianceList]);
      setEditMode(false);
    } else {
      setEditMode(true);
      return;
    }
  };
  const deleteItem = (variance: any) => {
    setSelectedVariance(variance);
    setDeleteConfirmation(true);
  };

  const cancelDelete = () => {
    setSelectedVariance(null);
    setDeleteConfirmation(false);
  };

  const saveChanges = (index: any) => {
    varianceList[index] = editedVariance;
    varianceList[index].isEdit = false;
    setVarianceList([...varianceList]);
    setEditedVariance(null);
    updateVarianceById(editedVariance, index);
  };

  const stopEditVariance = (index: number) => {
    varianceList[index].isEdit = false;
    setVarianceList([...varianceList]);

    setEditedVariance(null);
  };

  const onChange = (argEvent: any) => {
    const variance = { ...editedVariance };
    variance[argEvent.target.name] = argEvent.target.value;
    setEditedVariance({ ...variance });
    setVarianceList([...varianceList]);
  };

  const onKeyDown = (e: any, index: any) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      stopEditVariance(index);
    }
    return;
  };
  const onKeyPress = (e: any) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      setEditMode(true);
      setAddNewVariance({
        create: false,
        varianceName: '',
        category: '',
      });
    }
    return;
  };
  return (
    <div className="common-edit-task-detail-view__variances">
      {currentTaskVariances &&
        currentTaskVariances.length == 0 &&
        !authContext.state.isLoading &&
        !addNewVariance.create && (
          <div className="common-edit-task-detail-view__variances__empty">
            <div className="common-edit-task-detail-view__variances__empty-1">
              <img
                src={varinceImg}
                alt="no variances"
                className="common-edit-task-detail-view__variances__empty-img"
              />
              <div className="common-edit-task-detail-view__variances__empty-content">
                <span className="common-edit-task-detail-view__variances__empty-content-yay">
                  YAY!
                </span>
                <span className="common-edit-task-detail-view__variances__empty-content-text">
                  Your task does not have any blockers yet
                </span>
              </div>
            </div>
            {currentTask.type === 'wbs'
              ? null
              : permissionKeysByAssigneeAndToken(
                  currentTask?.assignedTo,
                  projectTokens[currentTask.projectId]
                ).create && (
                  <Button
                    data-testid="common-edit-task-detail-view__variances__data-add-variance"
                    variant="outlined"
                    className="btn-text common-edit-task-detail-view__variances__empty-add-variance"
                    onClick={() => {
                      setEditMode(false);
                      setAddNewVariance({
                        create: true,
                        varianceName: '',
                        category: '',
                      });
                    }}
                  >
                    + Add Variances
                  </Button>
                )}
          </div>
        )}

      {currentTaskVariances && currentTaskVariances.length > 0 && (
        <div className="common-edit-task-detail-view__variances__data">
          <table className="common-edit-task-detail-view__variances__data__table">
            <tr className="common-edit-task-detail-view__variances__data__table__head">
              <th className="common-edit-task-detail-view__variances__data__table__th-1">
                Title
              </th>
              <th className="common-edit-task-detail-view__variances__data__table__th-2">
                Category
              </th>
              <th className="common-edit-task-detail-view__variances__data__table__th-3">
                Created by
              </th>
              <th className="common-edit-task-detail-view__variances__data__table__th-4">
                Created on
              </th>
              <th className="common-edit-task-detail-view__variances__data__table__th-5"></th>
            </tr>
            {varianceList.map((item: any, index: number) => (
              <tr
                key={item.id}
                className={`common-edit-task-detail-view__variances__data__table__body__row ${
                  !editedVariance
                    ? 'common-edit-task-detail-view__variances__data__table__body__row-hover'
                    : ''
                }`}
              >
                {!item.isEdit && (
                  <Tooltip title={item.varianceName}>
                    <td className="common-edit-task-detail-view__variances__data__table__body__row__td common-edit-task-detail-view__variances__data__table__body__row__td-1">
                      {item.varianceName}
                    </td>
                  </Tooltip>
                )}
                {item.isEdit && (
                  <td className="common-edit-task-detail-view__variances__data__table__body__row__td common-edit-task-detail-view__variances__data__table__body__row__td-1">
                    <TextField
                      data-testid="variance-name-input"
                      className="common-edit-task-detail-view__variances__data__body__row__item__name__input"
                      onChange={(e) => onChange(e)}
                      name="varianceName"
                      value={editedVariance?.varianceName}
                      variant="outlined"
                      placeholder="Enter Title"
                      onKeyDown={(e) => onKeyDown(e, index)}
                      autoFocus={true}
                    />
                    {editedVariance?.varianceName?.length > 30 && (
                      <div className="common-edit-task-detail-view__variances__data-add-variance-input-text__error">
                        Name must not exceed 30 characters
                      </div>
                    )}
                  </td>
                )}
                <td className="common-edit-task-detail-view__variances__data__table__body__row__td common-edit-task-detail-view__variances__data__table__body__row__td-2">
                  {item.isEdit && (
                    <FormControl variant="outlined" fullWidth>
                      <Select
                        data-testid="variance-category-input"
                        native
                        value={editedVariance?.category}
                        name="category"
                        onChange={(e) => onChange(e)}
                        className="common-edit-task-detail-view__variances__data__table__body__row__td-2-select"
                        id="demo-simple-select-outlined"
                        onKeyDown={(e) => onKeyDown(e, index)}
                      >
                        <option value="">Select a category</option>
                        {categoryList.map((item: any, index: number) => (
                          <option
                            key={`${item.value}-${index}`}
                            value={item.value}
                          >
                            {item.value}
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                  {!item.isEdit && item.category}
                </td>
                <td className="common-edit-task-detail-view__variances__data__table__body__row__td common-edit-task-detail-view__variances__data__table__body__row__td-3">
                  {`${projectUser[item.createdBy]?.firstName} ${
                    projectUser[item.createdBy]?.lastName
                  } `}
                </td>
                <td className="common-edit-task-detail-view__variances__data__table__body__row__td common-edit-task-detail-view__variances__data__table__body__row__td-4">
                  {moment(item.createdAt).format('DD MMM yyyy')}
                </td>

                <td className=" common-edit-task-detail-view__variances__data__table__body__row__td common-edit-task-detail-view__variances__data__table__body__row__td-5">
                  {!item.isEdit &&
                    permissionKeysByAssigneeAndToken(
                      currentTask?.assignedTo,
                      projectTokens[currentTask.projectId]
                    ).create && (
                      <div className="common-edit-task-detail-view__variances__data__table__body__row__item__btn">
                        <img
                          data-testid="variance-btn-edit"
                          src={editIcon}
                          alt="edit variance"
                          className="common-edit-task-detail-view__variances__data__table__body__row__item__btn-edit"
                          onClick={() => {
                            if (!addNewVariance.create) editVariance(index);
                          }}
                        />

                        <img
                          data-testid="variance-btn-delete"
                          src={deleteIcon}
                          className="common-edit-task-detail-view__variances__data__table__body__row__item__btn-delete"
                          alt="delete variance"
                          onClick={() =>
                            !addNewVariance.create && deleteItem(item)
                          }
                        />
                      </div>
                    )}
                  {item.isEdit &&
                    permissionKeysByAssigneeAndToken(
                      currentTask?.assignedTo,
                      projectTokens[currentTask.projectId]
                    ).create && (
                      <div className="common-edit-task-detail-view__variances__data__table__body__row__item__btn-save">
                        <Button
                          data-testid="variance-btn-update"
                          onClick={() => {
                            setEditMode(true);
                            saveChanges(index);
                          }}
                          variant="outlined"
                          className="btn-primary common-edit-task-detail-view__variances__data__body__item__btn-save-update"
                          disabled={
                            editedVariance?.varianceName.trim().length === 0 ||
                            editedVariance?.category.trim().length === 0 ||
                            editedVariance?.varianceName.length > 30
                          }
                        >
                          Update
                        </Button>

                        <Button
                          data-testid="variance-btn-discard"
                          onClick={() => {
                            setEditMode(true);
                            stopEditVariance(index);
                          }}
                          className=" btn-text common-edit-task-detail-view__variances__data__body__item__btn-save-discard "
                        >
                          Discard
                        </Button>
                      </div>
                    )}
                </td>
              </tr>
            ))}
          </table>
        </div>
      )}

      {addNewVariance.create ? (
        <div className="common-edit-task-detail-view__variances__data-add-variance-input">
          <div>
            <TextField
              data-testid="variance-name-input"
              className={`common-edit-task-detail-view__variances__data-add-variance-input-text`}
              onChange={(e) => onNewVarianceChange(e)}
              name="varianceName"
              value={addNewVariance?.varianceName}
              variant="outlined"
              placeholder="Enter Title"
              onKeyDown={onKeyPress}
              autoFocus={true}
            />
            {/* inputProps={{ maxLength: 30 }} */}
            {addNewVariance?.varianceName?.length > 30 && (
              <div className="common-edit-task-detail-view__variances__data-add-variance-input-text__error">
                Name must not exceed 30 characters
              </div>
            )}
          </div>
          <FormControl variant="outlined">
            <Select
              data-testid="variance-category-input"
              native
              value={addNewVariance?.category}
              name="category"
              onChange={(e) => onNewVarianceChange(e)}
              className="common-edit-task-detail-view__variances__data-add-variance-input-category"
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
          <Button
            data-testid="variance-btn-update"
            onClick={saveNewVariance}
            variant="outlined"
            className={`btn-primary common-edit-task-detail-view__variances__data__body__item__btn-save-update ${
              addNewVariance?.varianceName?.length === 0 ||
              addNewVariance.category.length === 0
                ? 'btn-disabled'
                : ''
            }`}
            disabled={
              addNewVariance.varianceName.trim().length === 0 ||
              addNewVariance.category.length === 0 ||
              addNewVariance.varianceName.length > 30
            }
          >
            Add
          </Button>

          <Button
            data-testid="variance-btn-discard"
            onClick={() => {
              setEditMode(true);
              setAddNewVariance({
                create: false,
                varianceName: '',
                category: '',
              });
            }}
            className=" btn-text common-edit-task-detail-view__variances__data__body__item__btn-save-discard "
          >
            Discard
          </Button>
        </div>
      ) : (
        ''
      )}

      {!addNewVariance.create &&
      varianceList &&
      permissionKeysByAssigneeAndToken(
        currentTask?.assignedTo,
        projectTokens[currentTask.projectId]
      ).create &&
      varianceList.length > 0 ? (
        <Button
          data-testid="edit-task-details-view-variances-add-variance-btn"
          className="btn-text common-edit-task-detail-view__variances__data-add-variance-btn"
          onClick={() => {
            setEditMode(false);
            setAddNewVariance({
              create: true,
              varianceName: '',
              category: '',
            });
          }}
          disabled={editedVariance}
        >
          + Add Variances
        </Button>
      ) : (
        ''
      )}
      {deleteConfirmation && (
        <ConfirmDialog
          data-testid="delete-variance"
          open={deleteConfirmation}
          message={{
            text: 'Are you sure you want to delete this variance?',
            cancel: 'Cancel',
            proceed: 'Delete',
          }}
          close={cancelDelete}
          proceed={() => {
            deleteVariance(selectedVariance);
            setDeleteConfirmation(false);
          }}
        />
      )}
    </div>
  );
};

export default CommonEditTaskDetailsViewVariances;
