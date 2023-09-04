import { Close } from '@material-ui/icons';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material';
import { gantt } from 'dhtmlx-gantt';
import React,{useState} from 'react';
import SingleUserSelect from 'src/modules/dynamicScheduling/components/SingleUserSelect/SingleUserSelect';
import {
  ClassificationCodeInput,
  ClassifyCodeType,
} from 'src/modules/dynamicScheduling/features/ProjectPlan/components/EditTaskDetailsViewProductivity/EditTaskDetailsViewProductivity';
import editProjectPlanContext from 'src/modules/dynamicScheduling/context/editProjectPlan/editProjectPlanContext';
import { ganttTasks } from '../../../../utils/ganttDataTransformer';
import './styles.scss';
import projectPlanContext from 'src/modules/dynamicScheduling/context/projectPlan/projectPlanContext';
import Notification, {
  AlertTypes,
} from 'src/modules/shared/components/Toaster/Toaster';
import { Tooltip } from '@material-ui/core';

export interface PublishedMenuType {
  assignee: string;
  classifyCode: string;
}
const title: PublishedMenuType = {
  assignee: 'Assignee',
  classifyCode: 'Classification code',
};
interface Props {
  handleClose: (id: keyof PublishedMenuType) => void;
}
const items: { id: keyof PublishedMenuType; text: string }[] = [
  {
    id: 'assignee',
    text: 'Update assignee',
  },
  {
    id: 'classifyCode',
    text: 'Update classification code',
  },
];
export default function PublishedTaskMenu({
  handleClose,
}: Props): React.ReactElement {
  return (
    <React.Fragment>
      {items.map(({ id, text }) => (
        <MenuItem
          data-testid={`ProjectPlan-Menu-${id}`}
          onClick={() => handleClose(id)}
          sx={{ fontSize: '1.6rem', color: '#B72D2D' }}
        >
          {text}
        </MenuItem>
      ))}
    </React.Fragment>
  );
}

const classes = {
  'list-width': 'published__assignee__dialog__content__list__width',
  'no-data-width': 'published__assignee__dialog__content__list__width',
};
interface DialogProps {
  openState: [boolean, React.Dispatch<keyof PublishedMenuType | null>];
  menuType: keyof PublishedMenuType | null;
}

export interface AssigneeType {
  id: string;
  name: string;
  email: string;
  status: string;
}

export function PublishedMenuDialog({
  openState,
  menuType,
}: DialogProps): React.ReactElement {
  const [open, setOpen] = openState;
  const [selectedInput, setSelectedInput] = React.useState<
    AssigneeType | ClassifyCodeType | null
  >(null);
  const [isUpdateButtonDisabled, setUpdateButtonDisabled] = useState<boolean>(true)
  const [isUpdateButtonDisabledCode, setUpdateButtonDisabledCode] = useState<boolean>(false)
  const { updateTaskAssignee } = React.useContext(editProjectPlanContext);
  const { updateProjectProductivity } = React.useContext(projectPlanContext);
  const selectTasks: ganttTasks[] = [];
  if (gantt.eachSelectedTask)
    gantt.eachSelectedTask((taskId) => {
      const task = gantt.getTask(taskId);
      selectTasks.push(task);
    });
  const taskNames = selectTasks.map((task) => task.text).join(', ');
  const ids = selectTasks.map((task) => task.id);

  const handleAssigneeUpdate = async () => {
    const assignee = selectedInput as AssigneeType | null;
    try {
      await updateTaskAssignee(ids, assignee?.id ?? null);
      gantt.batchUpdate(() => {
        selectTasks.forEach((task) => {
          if (task.assignedTo !== assignee?.id ?? null) {
            task.assignedTo = assignee?.id ?? null;
            task.assigneeName = assignee?.name ?? '-';
            gantt.updateTask(task.id, task);
          }
        });
      });
      Notification.sendNotification('Updated successfully', AlertTypes.success);
    } catch (e: any) {
      console.error(e);
      Notification.sendNotification('Updation failed', AlertTypes.error);
    } finally {
      setOpen(null);
    }
  };

  const handleCodeClassifyUpdate = async () => {
    const codeClassifyInput = selectedInput as ClassifyCodeType | null;
    try {
      await updateProjectProductivity({
        classificationCodeId: codeClassifyInput?.id ?? null,
        id: ids,
      });
      Notification.sendNotification('Updated successfully', AlertTypes.success);
    } catch (e: any) {
      console.error(e);
      Notification.sendNotification('Updation failed', AlertTypes.error);
    } finally {
      setOpen(null);
      setSelectedInput(null);
    }
  };

  const doUpdateClick = {
    assignee: () => handleAssigneeUpdate(),
    classifyCode: () => handleCodeClassifyUpdate(),
  };

  const handleClick = () => {
    if (menuType) doUpdateClick[menuType]();
    setUpdateButtonDisabledCode(false)
  };
  const getLabel = (input: ClassifyCodeType | null) =>
    `${input?.classificationCode ?? ''} ${
      input?.classificationCodeName ?? ''
    }`.trim();

  const inputByMenuType: {
    [key: string]: React.ReactElement;
  } = {
    assignee: (
      <SingleUserSelect
        selectAssignee={(args: AssigneeType | null) => setSelectedInput(args)}
        closeSelectAssignee={() => setSelectedInput(null)}
        classes={classes}
        showCancelButton={false}
        setUpdateButtonDisabled={setUpdateButtonDisabled}
      />
    ),
    classifyCode: (
      <Box sx={{ marginTop: '15px' }}>
        <ClassificationCodeInput
          initName={getLabel(selectedInput as ClassifyCodeType | null)}
            getCode={(item: ClassifyCodeType | null) => {
            setSelectedInput(item);
            setUpdateButtonDisabledCode(true);
            }}
          saveClassificationCodeChange={(e) => {
            if (!e.target.value) setSelectedInput(null);
          }}
          classes={classes}
        />
      </Box>
    ),
  };

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(null)}
      classes={{ paper: 'published__assignee__dialog' }}
    >
      <DialogTitle className="published__assignee__dialog__title">
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Box>{title[menuType as keyof PublishedMenuType]}</Box>
          <Box>
            <IconButton
              onClick={() => {
                setSelectedInput(null);
                setOpen(null);
                setUpdateButtonDisabled(true);
                setUpdateButtonDisabledCode(false);
              }}
            >
              <Close />
            </IconButton>
          </Box>
        </Stack>
      </DialogTitle>
      <DialogContent dividers>
        <Tooltip title={taskNames}>
          <DialogContentText
            classes={{ root: 'published__assignee__dialog__content__text' }}
          >
            Selected activity:{' '}
            <Typography
              variant="caption"
              sx={{
                fontSize: 'inherit',
                lineHeight: 1,
                color: 'var(--onx-A1)',
              }}
            >
              {taskNames}
            </Typography>
          </DialogContentText>
        </Tooltip>
        {inputByMenuType[menuType as keyof PublishedMenuType]}
      </DialogContent>
      <DialogActions>
        {title[menuType as keyof PublishedMenuType] == 'Assignee'? <Button disabled={isUpdateButtonDisabled} className="btn-primary" onClick={handleClick}>
          Update
        </Button>: <Button disabled={!isUpdateButtonDisabledCode} className="btn-primary" onClick={handleClick}>
          Update 
        </Button>}
       
      </DialogActions>
    </Dialog>
  );
}
