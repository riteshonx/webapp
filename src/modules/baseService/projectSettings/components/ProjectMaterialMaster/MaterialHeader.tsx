import {
  Button,
  IconButton,
  makeStyles,
  Paper,
  TextField,
  Typography,
} from '@material-ui/core';
import { Search } from '@material-ui/icons';
import { Box } from '@mui/system';
import React from 'react';

interface props {
  title: string;
  searchText?: string;
  searchPlaceHolder?: string;
  onChange?: React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement>;
  addButton?: any;
  addButtonVisible?: boolean;
  SearchVisible?: boolean;
  deleteButton?: any;
  deleteButtonVisible: boolean;
  uploadButtonVisible?: boolean;
  onDelete?: () => void;
  onCancel?: () => void;
  onUpload?: () => void;
}

const useStyles = makeStyles(() => ({
  root: {
    padding: '2px 4px',
    display: 'flex',
    alignItems: 'center',
    width: 400,
  },
  iconButton: {
    padding: 4,
  },
}));

const MaterialHeader: React.FC<props> = (props) => {
  const classes = useStyles();
  return (
    <>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box display="flex" className="ProjectMaterialMaster-header">
          <Typography component="h2">{props.title}</Typography>
          {props.SearchVisible && (
            <Paper component="form" className={classes.root} variant="outlined">
              <IconButton className={classes.iconButton} aria-label="menu">
                <Search />
              </IconButton>
              <TextField
                value={props.searchText}
                id="list-search-text"
                type="text"
                fullWidth
                placeholder={props.searchPlaceHolder}
                variant="standard"
                onChange={props.onChange}
                InputProps={{
                  disableUnderline: true,
                  inputProps: {
                    style: {
                      paddingLeft: '1rem',
                    },
                  },
                }}
              />
            </Paper>
          )}
        </Box>
        {props.deleteButtonVisible ? (
          <Box>
            <Button
              variant="outlined"
              className="btn-secondary btnAdd"
              onClick={props.onCancel}
            >
              Cancel
            </Button>
            <Button
              className="btn-primary btnAdd"
              variant="outlined"
              onClick={props.onDelete}
            >
              Delete
            </Button>
          </Box>
        ) : (
          props.addButtonVisible && props.addButton
        )}

        {props.uploadButtonVisible && (
          <Button
            className="btn btn-primary ProjectMaterialMaster-header__upload"
            onClick={props.onUpload}
          >
            Upload
          </Button>
        )}
      </Box>
    </>
  );
};

export default MaterialHeader;
