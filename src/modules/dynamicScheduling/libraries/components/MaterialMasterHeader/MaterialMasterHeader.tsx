import React, { ReactElement } from 'react'
import BackNavigation from '../../../../shared/components/BackNavigation/BackNavigation';
import './MaterialMasterHeader.scss';

import { IconButton, Menu, MenuItem } from '@material-ui/core';
// import DialogActions from '@material-ui/core/DialogActions';
// import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import SearchIcon from '@material-ui/icons/Search';
// import MoreVertIcon from '@material-ui/icons/MoreVert';
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';


const useStyles = makeStyles((theme) => ({
    root: {
        padding: '2px 4px',
        display: 'flex',
        alignItems: 'center',
        width: '32%',
        height: '36px',
        position: 'relative',
        left: '30px',
        float: 'left',
    },
    iconButton: {
        padding: 10,
    },
}));

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function MaterialMasterHeader(props: any): ReactElement {
    const classes = useStyles();
    const handleSearchChange = (value: string) => {
        props.search(value);
    }

    return (
        <div className="lib-info">
            <div className="lib-info__header">
                {props.header.name}
            </div>
            <div className="lib-info__description">
                {props.header.description}
            </div>
            <Paper component="form" className={classes.root}
                variant="outlined"
            >
                <IconButton className={classes.iconButton} aria-label="menu">
                    <SearchIcon />
                </IconButton>
                <TextField
                    value={props.searchText}
                    id="list-search-text"
                    type="text"
                    fullWidth
                    placeholder="Search Material Name"
                    // autoComplete="search"
                    variant="standard"
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onKeyPress={(e: any) => {
                        if (e.key === "Enter") {
                            e.stopPropagation();
                            e.preventDefault();
                        }
                    }}
                    InputProps={{
                        // startAdornment: <AccountCircle />, // <== adjusted this
                        disableUnderline: true, // <== added this
                    }}
                />
            </Paper>
        </div>
    )
}
