import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import React, { ReactElement, useEffect, useState } from 'react';
import './ProjectAction.scss';
import SearchIcon from '@material-ui/icons/Search';
import { canCreateProject } from '../../../roles/utils/permission';
import AppsIcon from '@material-ui/icons/Apps';
import ViewListIcon from '@material-ui/icons/ViewList';


export default function ProjectAction(props: any): ReactElement {
    const [isGridView, setIsGridView] = useState(true)

    useEffect(() => {
        setIsGridView(props.viewType)
    }, [props.viewType]);

    const toggleView = (view: string) => {
        props.toggle(view)
        view === 'grid' ? setIsGridView(true) : setIsGridView(false);
    }

    const createProject = () => {
        props.createProject(true);
    }

    const handleSearchChange = (value:string) => {
        props.searchTask(value);
    }
    
    return (
        <div className="project-actions">
            <div className="project-actions__view-btn">
                {
                    isGridView ? (
                        <>
                            <Button
                                data-testid={'grid-view'}
                                variant="outlined"
                                className="toggle-primary"
                                onClick={() => toggleView('grid')}
                                startIcon={<AppsIcon />}
                            >
                                Gallery view
                            </Button>
                            <div className="l-view" onClick={() => toggleView('list')}><ViewListIcon /> List view</div>
                        </>
                    ): (
                        <>
                            <div className="g-view" onClick={() => toggleView('grid')}><AppsIcon />Gallery view</div>
                            <Button
                                data-testid={'list-view'}
                                variant="outlined"
                                className="toggle-primary"
                                onClick={() => toggleView('list')}
                                startIcon={<ViewListIcon />}
                            >
                                List view   
                            </Button>
                        </>
                    )
                }
            </div>
            <div className="project-actions__right">
                <div className="project-actions__right__search">
                    <TextField
                        value={props.searchText}
                        id="project-list-search-text"
                        type="text"
                        fullWidth
                        placeholder="Search"
                        autoComplete='off'
                        variant="outlined"
                        onChange={(e) => handleSearchChange(e.target.value)}
                      />
                    <SearchIcon className="project-actions__right__search__icon"/>
                    <div className="project-actions__right__count">Showing {props.projectCount} entries</div>
                </div>
                <div className="project-actions__right__add-btn">
                    {
                        canCreateProject && (
                            <Button data-testid={'create-new-project'} variant="outlined" className="btn-primary" onClick={createProject}>
                                Add new project 
                            </Button>
                        )
                    }
                </div>
            </div>
        </div>
    )
}
