import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

export const CustomPopOver = makeStyles((theme: Theme) =>
  createStyles({
    root: {
        maxHeight: '150px !important',
        overflowY: 'auto',
    }
  }),
);