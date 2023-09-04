import DateFnsUtils from '@date-io/date-fns';
import { Tooltip } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';
import { gantt } from 'dhtmlx-gantt';
import { useContext, useState } from 'react';
import Draggable from 'react-draggable';
import { transformDateToString } from 'src/modules/dynamicScheduling/utils/ganttDataTransformer';
import GlobalKeyboardDatePicker from 'src/modules/shared/components/GlobalDatePicker/GlobalKeyboardDatePicker';
import { v4 as uuidv4 } from 'uuid';
import { decodeToken } from '../../../../../../services/authservice';
import { client } from '../../../../../../services/graphql';
import { projectFeatureAllowedRoles } from '../../../../../../utils/role';
import { stateContext } from '../../../../../root/context/authentication/authContext';
import SelectParentTask from '../../../../components/SelectParentTasks/SelectParentTasks';
import { GET_RECIPE_PLAN } from '../../../../graphql/queries/recipePlan';
import {
  endDateDecreaseByOneDay,
  getNonHoliydayEventDate,
  getTaskTypeName,
} from '../../../../utils/ganttConfig';
import './RecipeImportPopup.scss';

const RecipeImportPopup = (props: any) => {
  const [startTime, setStartTime] = useState<any>(null);
  const changeInStartTime = (argValue: any) => {
    setStartTime(argValue);
  };
  const [parentTaskId, setParentTaskId] = useState<string>('');
  const excludeParentTask = ['task', 'milestone'];
  const { state }: any = useContext(stateContext);

  const getRecipePlan = async () => {
    try {
      const res = await client.query({
        query: GET_RECIPE_PLAN,
        variables: { recipeSetId: props.pulledRecipeTask.recipeSetId },
        fetchPolicy: 'network-only',
        context: {
          role: projectFeatureAllowedRoles.viewMasterPlan,
          token: state.selectedProjectToken,
        },
      });

      const targetTasks = getTaskPartOfHierarchy(res.data.recipetasks);

      const ganttTasks: Array<any> = [];
      targetTasks.forEach((task: any) => {
        const tsDate: any = new Date(
          new Date(props.pulledRecipeTask.startDate).setHours(0, 0, 0, 0)
        );
        const teDate: any = new Date(
          new Date(task.startDate).setHours(0, 0, 0, 0)
        );
        const diffTime: any = Math.abs(tsDate - teDate);
        const offset = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        const ganttStartDate = gantt.calculateEndDate({
          start_date: new Date(startTime.setHours(0, 0, 0, 0)),
          duration: offset,
        });

        const newTaskId = uuidv4();

        ganttTasks.push({
          recipeTaskId: task.id,
          recipeParentTaskId: task.parentId,
          id: newTaskId,
          text: task.taskName,
          start_date: ganttStartDate,
          duration: task.duration,
          type: task.type == 'project' ? 'work_package' : task.type,
          typeName: task.type == 'project' ? 'work_package' : task.type,
          createdBy: decodeToken().userId,
          status: 'To-Do',
          recipeSetId: props.pulledRecipeTask.recipeSetId,
          importMaterials: true,
          // assignedTo: pulledTask?.createdBy,
          // assigneeName: getAssigneeName(pulledTask)
        });
      });

      ganttTasks.forEach((task: any) => {
        let targetParent = parentTaskId;
        if (
          task.recipeParentTaskId &&
          task.recipeTaskId !== props.pulledRecipeTask.nodeId
        ) {
          const filteredParent = ganttTasks.filter(
            (item) => item.recipeTaskId == task.recipeParentTaskId
          );
          targetParent = filteredParent[0].id;
        }

        const startDate = transformDateToString(task.start_date);
        const end_date = gantt.calculateEndDate({
          start_date: task.start_date,
          duration: task.duration,
        });
        const plannedEndDate = transformDateToString(
          endDateDecreaseByOneDay(end_date)
        );
        gantt?.addTask(
          {
            id: task.id,
            text: task.text,
            start_date: task.start_date,
            duration: task.duration,
            end_date: end_date,
            plannedStartDate: startDate,
            plannedDuration: task.duration,
            plannedEndDate: plannedEndDate,
            type: task.type,
            typeName: getTaskTypeName(task.type),
            createdBy: task.createdBy,
            status: task.status,
            $open: true,
            recipeSetId: task.recipeSetId,
            recipeId: task.recipeTaskId,
            recipeSetName: props?.pulledRecipeTask?.name,
            assignedTo: null,
            assigneeName: '-',
            importMaterials: true,
          },
          targetParent
        );

        //gantt.showTask(targetParent);
        //gantt.selectTask(targetParent);
      });
      gantt.showTask(ganttTasks[0]?.id);
      gantt.selectTask(ganttTasks[0]?.id);

      res.data.recipelinks.forEach((link: any) => {
        const sFound = ganttTasks.filter(
          (t: any) => t.recipeTaskId == link.source
        );
        const tFound = ganttTasks.filter(
          (t: any) => t.recipeTaskId == link.target
        );
        if (sFound.length && tFound.length) {
          let linkType = gantt.config.links.finish_to_start;
          switch (link.type) {
            case '0':
              linkType = gantt.config.links.finish_to_start;
              break;
            case '1':
              linkType = gantt.config.links.start_to_start;
              break;
            case '2':
              linkType = gantt.config.links.finish_to_finish;
              break;
            case '3':
              linkType = gantt.config.links.start_to_finish;
              break;
            default:
              linkType = gantt.config.links.finish_to_start;
              break;
          }

          gantt.addLink({
            id: uuidv4(),
            lag: link.lag,
            source: sFound[0].id,
            target: tFound[0].id,
            createdBy: decodeToken().userId,
            type: linkType,
          });
        }
      });

      props.close();
    } catch (err) {
      console.log(err);
      //Notification.sendNotification(err.message, AlertTypes.error);
    }
  };

  const getTaskPartOfHierarchy = (recipesetTasks: Array<any>) => {
    const targetList = [];
    for (let i = 0; i < recipesetTasks.length; i++) {
      if (recipesetTasks[i].id == props.pulledRecipeTask.nodeId) {
        targetList.push(recipesetTasks[i]);
        continue;
      }
      if (checkParent(recipesetTasks[i], recipesetTasks)) {
        targetList.push(recipesetTasks[i]);
      }
    }
    return targetList;
  };

  const checkParent = (task: any, recipesetTasks: Array<any>): any => {
    if (task.parentId == props.pulledRecipeTask.nodeId) {
      return true;
    } else if (!task.parentId) {
      return false;
    } else {
      const nextParent = recipesetTasks.filter((t) => t.id == task.parentId);
      return checkParent(nextParent[0], recipesetTasks);
    }
  };

  const handleParentSelect = (id: string) => {
    setParentTaskId(id);
    const chilTaskUnderParent = gantt.getChildren(id);
    if (chilTaskUnderParent.length) {
      const lastSiblingEndDate = gantt.getTask(
        chilTaskUnderParent[chilTaskUnderParent.length - 1]
      )?.end_date;
      setStartTime(
        getNonHoliydayEventDate(gantt.date.add(lastSiblingEndDate, -1, 'day'))
      );
    } else {
      setStartTime(gantt.getTask(id)?.start_date);
    }
  };

  const shouldDisableDate = (day: MaterialUiPickersDate) => {
    return !gantt.isWorkTime(day);
  };

  return (
    <Dialog
      className="RecipeImportPopup"
      data-testid="parent-task-popup"
      open={props.open}
      area-labelledby="form-dialog-title"
      PaperComponent={DraggableDialogComponent}
      maxWidth="xs"
      fullWidth={true}
      disableBackdropClick={true}
      onClose={props.close}
    >
      <DialogTitle
        style={{ cursor: 'move', backgroundColor: '#FAFAFA' }}
        id="draggable-dialog-title"
      ></DialogTitle>
      <DialogContent className="RecipeImportPopup__content">
        <div className="RecipeImportPopup__content__title">
          <label className="RecipeImportPopup__content__title__name">
            <Tooltip
              title={
                props?.pulledRecipeTask?.name.length > 22
                  ? `${props?.pulledRecipeTask?.name}`
                  : ''
              }
              aria-label="Activity Name"
            >
              <label>
                {props?.pulledRecipeTask?.name
                  ? props?.pulledRecipeTask?.name.length > 35
                    ? `${props?.pulledRecipeTask?.name.slice(0, 33)} . . .`
                    : props?.pulledRecipeTask?.name
                  : '--'}
              </label>
            </Tooltip>
          </label>
          <label className="RecipeImportPopup__content__title__type">
            {props?.pulledRecipeTask?.tasktype}
          </label>
        </div>
        <div className="RecipeImportPopup__content__parent">
          <label className="RecipeImportPopup__content__parent__label">
            Parent Activity <span>*</span>
          </label>
          <SelectParentTask
            selectParent={(id: string) => handleParentSelect(id)}
            excludeParentTask={excludeParentTask}
          ></SelectParentTask>
        </div>
        <div className="RecipeImportPopup__content__time">
          <div
            className="RecipeImportPopup__content__time__date"
            style={{ flexBasis: '100%' }}
          >
            <label className="RecipeImportPopup__content__time__date__label">
              Start date <span>*</span>
            </label>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <GlobalKeyboardDatePicker
                data-testid="recipe_start_date"
                variant="inline"
                inputVariant="outlined"
                value={startTime}
                onChange={(d: any) => {
                  changeInStartTime(d);
                }}
                format="dd MMM yyyy"
                name="startdate"
                placeholder="Select Date"
                shouldDisableDate={shouldDisableDate}
              />
            </MuiPickersUtilsProvider>
          </div>
          <div className="RecipeImportPopup__content__time__duration">
            <label className="RecipeImportPopup__content__time__duration__label">
              Duration
            </label>
            <div className="RecipeImportPopup__content__time__duration__field">
              <TextField
                className="RecipeImportPopup__content__time__duration__field__input"
                id="Label-Name"
                variant="outlined"
                name="duration"
                disabled={true}
                value={props.pulledRecipeTask.duration}
                type="text"
                fullWidth
                placeholder="Enter duration in no of "
              />
              <div className="RecipeImportPopup__content__time__duration__field__label">
                Days
              </div>
            </div>
          </div>
        </div>
        <div className="RecipeImportPopup__content__user">
          {/*<div className="RecipeImportPopup__content__user__left">
                            <Avatar src="/" className="RecipeImportPopup__content__user__left__avatar" data-testid="recipe-assignee"/>
                            <div className="RecipeImportPopup__content__user__left__name">
                                {getAssigneeName(pulledTask)}
                                {pulledTask?.tenantAssociation?.user?.jobTitle ?
                                (<span>, {pulledTask?.tenantAssociation?.user?.jobTitle}</span>): ('')}
                            </div>
                        </div>
                         <div className="RecipeImportPopup__content__user__right">
                            <DeleteIcon/>
                        </div> */}
        </div>
        <div className="RecipeImportPopup__content__action">
          <Button
            data-testid="create-pulltask-cancel"
            variant="outlined"
            className="btn-text RecipeImportPopup__content__action__btn"
            onClick={props.close}
            size="small"
          >
            Cancel
          </Button>
          <Button
            data-testid="create-pulltask-add"
            variant="outlined"
            className="btn-primary"
            onClick={getRecipePlan}
            disabled={startTime && parentTaskId ? false : true}
            size="small"
          >
            Add
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
export default RecipeImportPopup;

function DraggableDialogComponent(props: any) {
  return (
    <Draggable
      handle="#draggable-dialog-title"
      cancel={'[class*="MuiDialogContent-root"]'}
    >
      <Paper {...props} />
    </Draggable>
  );
}
