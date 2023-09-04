import { Grid, Typography } from '@mui/material';
import { gantt } from 'dhtmlx-gantt';
import React from 'react';
import ShowComponent from 'src/modules/shared/utils/ShowComponent';
import './ProjectPlanHeader.scss';

interface Props {
  getCount: (value: { [key: string]: number }) => void;
}
export default function ChangeInfo({ getCount }: Props): React.ReactElement {
  const [count, setCount] = React.useState({ total: 0, manual: 0 });
  const events: string[] = [];
  React.useEffect(() => {
    if (gantt) {
      events.push(
        gantt.attachEvent(
          'onBeforeUndoStack',
          ({ commands }) => {
            setCount((prev) => ({
              total: prev.total + commands.length,
              manual: prev.manual + commands.length,
            }));
            return true;
          },
          {}
        )
      );
      events.push(
        gantt.attachEvent(
          'onAfterAutoSchedule',
          (taskId: string, updatedTasks: string[]) => {
            setCount((prev) => ({
              ...prev,
              manual: prev.manual - updatedTasks.length,
            }));
          },
          {}
        )
      );
    }
    return () => {
      while (events.length) gantt.detachEvent(events.pop() as string);
    };
  }, [gantt]);

  React.useEffect(() => {
    getCount(count);
  }, [count]);
  return (
    <ShowComponent showState={!!count.total}>
      <Grid
        container
        justifyContent="center"
        alignItems={'center'}
        className="projectPlanHeader__leftAction__counter"
      >
        <Typography variant="body1">{count.total}</Typography>
      </Grid>
    </ShowComponent>
  );
}
