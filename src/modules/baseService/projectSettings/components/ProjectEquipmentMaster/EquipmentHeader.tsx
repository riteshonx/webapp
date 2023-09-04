import { Button, IconButton, makeStyles, Paper, TextField, Typography } from "@material-ui/core";
import { Search } from "@material-ui/icons";
import { Box } from "@mui/system";
import React from "react";

interface props {
    title: string,
    searchText?: string,
    onChange?: React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement>,
    addButton?: any,
    addButtonVisible?: boolean,
    SearchVisible?: boolean,
    deleteButton?: any,
    deleteButtonVisible: boolean,
    onDelete?: () => void,
    onCancel?: () => void
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

const EquipmentHeader: React.FC<props> = (props) => {
    const classes = useStyles();
    return (<>
        <Box display="flex" alignItems="center" justifyContent="space-between" >
            <Box display="flex" className="ProjectEquipmentMaster-header">
                <Typography component="h2" >{props.title}</Typography>
                {
                    props.SearchVisible &&
                    <Paper component="form" className={classes.root}
                        variant="outlined"
                    >
                        <IconButton className={classes.iconButton} aria-label="menu">
                            <Search />
                        </IconButton>
                        <TextField
                            value={props.searchText}
                            id="list-search-text"
                            type="text"
                            fullWidth
                                placeholder="Search Oem Name ,  ID*"
                            variant="standard"
                            onChange={props.onChange}
                            InputProps={{
                                disableUnderline: true,
                                inputProps: {
                                    style: {
                                        paddingLeft: "1rem"
                                    }
                                }
                            }}
                        />
                    </Paper>
                }
            </Box>
            {
                props.deleteButtonVisible ? <Box sx={{position: "absolute", right:"40px"}}>
                    <Button variant="outlined" className="btn-secondary" onClick={props.onCancel}>Cancel</Button>
                    <Button className="btn-primary" variant="outlined" onClick={props.onDelete}>Delete</Button>
                </Box>
                    : props.addButtonVisible && props.addButton
            }
        </Box>
    </>
    )
}

export default EquipmentHeader;