import React, { ReactElement, useState } from 'react'
import './LibraryAction.scss'
import AppsIcon from '@material-ui/icons/Apps';
import ViewListIcon from '@material-ui/icons/ViewList';
import TextField from '@material-ui/core/TextField';
import SearchIcon from '@material-ui/icons/Search';
import CreateTask from '../CreateTask/CreateTask';
import { Button } from '@material-ui/core';
import { createTenantTask } from '../../../permission/scheduling';

interface iactionData{
    actionType:string,
    taskData:null
}

export default function LibraryAction(props: any): ReactElement {

    const [dialogOpen, setdialogOpen] = useState(false);
    const [actionData,setActionData] = useState<iactionData>();

    

    const changeView = (type: string) => {
        props.toggleView(type)
    }

    type nameBtn = {
        name: string,
        submit: string
    }

    const btnNamae: nameBtn = {
        name : 'Create Task',
        submit : 'Save'
    }

    const handleDialogOpen = () => {
        setdialogOpen(true)
        setActionData({
            actionType:'create',
            taskData:null
        })
    }

    const handleDialogClose = () => {
        setdialogOpen(false)
    }

    const handleSearchChange = (value:string) => {
        props.searchTask(value);
    }

    const refreshTaskList = () => {
        props.refresh();
    }

    return (
        <div className="lib-action">
            <div className="lib-action__tab">
                <div data-testid={'taskGrid'} className={(props.view === 'gallery') ?
                    'lib-action__tab__gallery--active' :'lib-action__tab__gallery'}
                     onClick={() => changeView('gallery')}>
                        <AppsIcon className="lib-action__tab__icon" fontSize="small"></AppsIcon>
                    Gallery View
                </div>
                <div data-testid={'taskList'} className={(props.view === 'list') ?
                    'lib-action__tab__list--active' :'lib-action__tab__list'} 
                    onClick={() => changeView('list')}>
                    <ViewListIcon className="lib-action__tab__icon" fontSize="small"></ViewListIcon>
                    List View
                </div>
            </div>

            <div className="lib-action__events">
                 <div className="lib-action__events__search-bar">
                    <TextField
                        value={props.searchText}
                        id="list-search-text"
                        type="text"
                        fullWidth
                        placeholder="Search by Task name"
                        autoComplete="search"
                        variant="outlined"
                        onChange={(e) => handleSearchChange(e.target.value)}
                      />
                    <SearchIcon className="lib-action__events__search-bar__icon"/>
                  </div>
                  {createTenantTask ? (
                    <Button data-testid={'create-task'} variant="outlined" className="btn-primary" onClick={handleDialogOpen}>
                        Create Task
                    </Button>)  : '' }
                    { dialogOpen ? (
                        <CreateTask open={dialogOpen} taskActionItem={actionData} btnName={btnNamae}
                        refreshTaskList={refreshTaskList} close={handleDialogClose} />
                    ) : ('') }
            </div>
        </div>
    )
}
