import React, { ReactElement, useEffect, useState } from 'react';
import Button from '@material-ui/core/Button';
import './CompanyAction.scss';
import SearchIcon from '@material-ui/icons/Search';
import TextField from '@material-ui/core/TextField';
import { createTenantCompany } from '../../../roles/utils/permission';
import AppsIcon from '@material-ui/icons/Apps';
import ViewListIcon from '@material-ui/icons/ViewList';


export default function CompanyAction(props: any): ReactElement {

    const [isGridView, setIsGridView] = useState(true)

    useEffect(() => {
        setIsGridView(props.viewType)
    }, [props.viewType]);

    const toggleView = (view: string) => {
        props.toggle(view)
        view === 'grid' ? setIsGridView(true) : setIsGridView(false);
    }

    const createCompany = () => {
        props.createCompany(true);
    }

    const handleSearchChange = (value:string) => {
        props.searchTask(value);
    }
    
    return (
        <div className="company-actions">
            <div className="company-actions__view-btn">
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
                            <div className="l-view" onClick={() => toggleView('list')}>
                                <ViewListIcon />
                                List view
                            </div>
                        </>
                    ): (
                        <>
                            <div className="g-view" onClick={() => toggleView('grid')}>
                                <AppsIcon />
                                Gallery view
                            </div>
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
            <div className="company-actions__right">
                <div className="company-actions__right__search">
                    <TextField
                        value={props.searchText}
                        id="company-list-search-text"
                        type="text"
                        fullWidth
                        placeholder="Search"
                        autoComplete='off'
                        variant="outlined"
                        onChange={(e) => handleSearchChange(e.target.value)}
                      />
                    <SearchIcon className="company-actions__right__search__icon"/>
                    <div className="company-actions__right__count">Showing {props.companyCount} entries</div>
                </div>
                <div className="company-actions__right__add-btn">
                    {
                        createTenantCompany && (
                            <Button data-testid={'create-new-company'} variant="outlined" className="btn-primary" onClick={createCompany}>
                                Add new company 
                            </Button>
                        )
                    }
                </div>
            </div>
        </div>
    )
}
