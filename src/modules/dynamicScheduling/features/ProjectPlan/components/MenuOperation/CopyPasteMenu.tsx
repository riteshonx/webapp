import { MenuItem } from '@mui/material';
import React from 'react';
import {
  doPasteTasks,
  doSelectTasks,
  taskActionObj,
} from 'src/modules/dynamicScheduling/utils/ganttKeyboardNavigation';
import ShowComponent from 'src/modules/shared/utils/ShowComponent';
interface Props {
  handleClose: () => void;
}

export default function CopyPasteMenu({
  handleClose,
}: Props): React.ReactElement {
  const elements = [
    {
      text: 'Copy',
      showState: true,
      handleClick: () => doSelectTasks(taskActionObj, 'copy'),
    },
    {
      text: 'Paste',
      showState: taskActionObj.action === 'copy',
      handleClick: () => doPasteTasks(taskActionObj),
    },
  ];
  return (
    <React.Fragment>
      {elements.map((element, index) => (
        <ShowComponent showState={element.showState} key={index}>
          <MenuItem
            data-testid={`${element.text}-task`}
            onClick={() => {
              element.handleClick();
              handleClose();
            }}
            sx={{ fontSize: '1.6rem', color: '#B72D2D' }}
          >
            {element.text}
          </MenuItem>
        </ShowComponent>
      ))}
    </React.Fragment>
  );
}
