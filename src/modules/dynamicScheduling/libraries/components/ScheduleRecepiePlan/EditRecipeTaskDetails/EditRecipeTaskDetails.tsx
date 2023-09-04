import { Button, DialogTitle, Tooltip } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import React, { useContext, useEffect, useState } from 'react';
import EditRecipeTaskContext from '../../../../context/editRecipeTask/editRecipeTaskContext';
import RecipeDetailsContext from '../../../../context/Recipe/RecipeContext';
import EditRecipeTaskDetailsRightPanel from '../EditRecipeTaskDetailsRightPanel/EditRecipeTaskDetailsRightPanel';
import './EditRecipeTaskDetails.scss';

const EditRecipeTaskDetails = (props: any) => {
  const { open, onClose, isEditingRecipe } = props;
  const [showBreadcrumbTaskList, setShowBreadcrumbTaskList] = useState(false);
  const [editMode, setEditMode] = useState(true);

  const editRecipeTaskContext = useContext(EditRecipeTaskContext);

  const recipeDetailsContext = useContext(RecipeDetailsContext);

  const { parentTasks, clearEditRecipeTaskState, updateParentTaskList } =
    editRecipeTaskContext;

  const { currentTask, setCurrentTask } = recipeDetailsContext;

  useEffect(() => {
    if (currentTask.id) {
      updateParentTaskList(currentTask.id);
    }
  }, [currentTask]);
  const closeBreadcrumbTaskList = (event: any) => {
    if (
      !event.target.matches(
        'edit-recipe-task-details__title__breadcrumb__btn-empty'
      )
    ) {
      const dropdowns = document.getElementsByClassName(
        'edit-recipe-task-details__title__breadcrumb__btn-empty-menu'
      );

      for (let i = 0; i < dropdowns.length; i++) {
        const openDropdown = dropdowns[i];
        if (openDropdown.classList.contains('show')) {
          setShowBreadcrumbTaskList(false);
        }
      }
    }
  };

  const onBreadcrumbsClick = (task: any) => {
    if (
      task.type === 'work_package' ||
      task.type === 'task' ||
      task.type === 'wbs'
    ) {
      setCurrentTask(task);
    }
  };

  return (
    <Dialog
      data-testid="edit-recipe-task-details"
      open={open}
      onClose={() => {
        setShowBreadcrumbTaskList(false);
        onClose(false);
        setEditMode(true);
      }}
      area-labelledby="form-dialog-title"
      maxWidth="xl"
      fullWidth={true}
      disableBackdropClick={true}
      className="edit-recipe-task-details"
      onClick={(e: any) => {
        closeBreadcrumbTaskList(e);
      }}
    >
      <DialogTitle className="edit-recipe-task-details__title">
        {/* <div className="edit-recipe-task-details__title"> */}
        <div className="edit-recipe-task-details__title__breadcrumb">
          {parentTasks.length > 7 ? (
            <div className="breadcrumb">
              <Button
                variant="outlined"
                className="btn-secondary edit-recipe-task-details__title__breadcrumb__btn"
                onClick={() => {
                  onBreadcrumbsClick(parentTasks[0]);
                }}
                disabled={!editMode}
              >
                {parentTasks[0].text}
              </Button>
              <span> &gt; </span>
              <div className="edit-recipe-task-details__title__breadcrumb__dropdown">
                <a
                  href="#"
                  className="btn-secondary edit-recipe-task-details__title__breadcrumb__btn-empty"
                  onClick={() => {
                    if (!editMode) return;
                    setShowBreadcrumbTaskList(!showBreadcrumbTaskList);
                  }}
                >
                  ...
                </a>
                <div
                  id="myDropdown"
                  className={`edit-recipe-task-details__title__breadcrumb__btn-empty-menu ${
                    showBreadcrumbTaskList ? 'show' : ''
                  }`}
                >
                  {parentTasks.map((task: any, index: number) => {
                    if (
                      index != 0 &&
                      index != parentTasks.length - 2 &&
                      index != parentTasks.length - 1
                    ) {
                      return (
                        <a
                          key={task.id}
                          href="#"
                          onClick={() => {
                            if (!editMode) return;
                            setShowBreadcrumbTaskList(false);
                            onBreadcrumbsClick(task);
                          }}
                        >
                          {task.text.length > 20
                            ? task.text.substring(0, 17) + '...'
                            : task.text}
                        </a>
                      );
                    }
                  })}
                </div>
              </div>
              <span> &gt; </span>

              <Button
                variant="outlined"
                className="btn-secondary edit-recipe-task-details__title__breadcrumb__btn"
                onClick={() => {
                  onBreadcrumbsClick(parentTasks[parentTasks.length - 2]);
                }}
                disabled={!editMode}
              >
                {' '}
                {parentTasks[parentTasks.length - 2].text}
              </Button>
              <span> &gt; </span>
              <Button
                variant="outlined"
                className="btn-secondary edit-recipe-task-details__title__breadcrumb__btn"
                onClick={() => {
                  onBreadcrumbsClick(parentTasks[parentTasks.length - 1]);
                }}
                disabled={!editMode}
              >
                {' '}
                {parentTasks[parentTasks.length - 1].text}
              </Button>
            </div>
          ) : (
            <div className="breadcrumb">
              {parentTasks.map((task: any) => (
                <React.Fragment key={task.id}>
                  <Button
                    key={task.id}
                    variant="outlined"
                    className={`btn-secondary edit-recipe-task-details__title__breadcrumb__btn  ${
                      task.type === 'project_phase' || task.type === 'project'
                        ? 'edit-recipe-task-details__title__breadcrumb__no-cursor'
                        : ''
                    }`}
                    onClick={() => {
                      onBreadcrumbsClick(task);
                    }}
                    disabled={!editMode}
                  >
                    {' '}
                    {task.text.length > 20
                      ? task.text.substring(0, 17) + '...'
                      : task.text}
                  </Button>
                  {task.id != parentTasks[parentTasks.length - 1].id ? (
                    <span> &gt; </span>
                  ) : null}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
        <Button
          data-testid="close-button"
          variant="outlined"
          className="btn-secondary edit-recipe-task-details__title__close"
          onClick={() => {
            setShowBreadcrumbTaskList(false);
            clearEditRecipeTaskState();
            onClose(false);
            setCurrentTask({});
            setEditMode(true);
          }}
        >
          X
        </Button>
        {/* </div> */}
      </DialogTitle>
      <DialogContent className="edit-recipe-task-details__content">
        <div className="edit-recipe-task-details__content--header">
          <Tooltip title={currentTask.text}>
            <span
              data-testid="edit-recipe-task-details-task-name"
              className="edit-recipe-task-details__content--header__task-name"
            >
              {currentTask?.text?.length > 60
                ? currentTask.text.substring(0, 57) + '...'
                : currentTask.text}
            </span>
          </Tooltip>

          {currentTask.floatValue === 0 ? (
            <span
              data-testid="edit-recipe-task-details-task-critical-flag"
              className="edit-recipe-task-details__content--header__critical-flag"
            >
              Critical
            </span>
          ) : (
            ''
          )}
        </div>
        {/* <div className="edit-recipe-task-details__content--left-panel">

          <div className="edit-recipe-task-details__content--left-panel__dates">
            <div className="edit-recipe-task-details__content--left-panel__dates__heading">
              <div></div>
              <div className="edit-recipe-task-details__content--left-panel__dates__heading__planned-title">
                Planned
              </div>
              <div className="edit-recipe-task-details__content--left-panel__dates__heading__estimated-title">
                Estimated
              </div>
              <div className="edit-recipe-task-details__content--left-panel__dates__heading__actual-title">
                Actual
              </div>
            </div>
            <hr className="edit-recipe-task-details__content--left-panel__dates__line"></hr>
            <div className="edit-recipe-task-details__content--left-panel__dates__start-date">
              <div className="edit-recipe-task-details__content--left-panel__dates__start-date-title">
                Start
              </div>
            </div>
            <hr className="edit-recipe-task-details__content--left-panel__dates__line"></hr>
            <div className="edit-recipe-task-details__content--left-panel__dates__end-date">
              <div className="edit-recipe-task-details__content--left-panel__dates__end-date-title">
                End
              </div>
            </div>
            <hr className="edit-recipe-task-details__content--left-panel__dates__line"></hr>
            <div className="edit-recipe-task-details__content--left-panel__dates__end-date">
              <div className="edit-recipe-task-details__content--left-panel__dates__duration-title">
                Duration
              </div>
            </div>
            <hr className="edit-recipe-task-details__content--left-panel__dates__line"></hr>
          </div>

          <div className=" u-margin-bottom-small edit-recipe-task-details__content--left-panel__float-log">
            <span className="edit-recipe-task-details__content--left-panel__float-log__float">
              Float: {currentTask.floatValue} days{' '}
            </span>
          </div>
        </div> */}

        <div className="edit-recipe-task-details__content--right-panel">
          <EditRecipeTaskDetailsRightPanel
            editMode={editMode}
            setEditMode={setEditMode}
            isEditingRecipe={isEditingRecipe}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditRecipeTaskDetails;
