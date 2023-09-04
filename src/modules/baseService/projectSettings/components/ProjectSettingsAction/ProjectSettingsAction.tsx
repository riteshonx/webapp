import React, { ReactElement } from 'react';
import SearchIcon from '@material-ui/icons/Search';
import TextField from '@material-ui/core/TextField';
import './ProjectSettingsAction.scss';


export default function ProjectSettingsAction(props: any): ReactElement {

    const changeInSearchText =(e: any) => {
        props.searchText(e.target.value)
    }
    return (
        <div className="form-action">
            <div className="form-action__search">
                    <TextField
                        id="list-search-text"
                        type="text"
                        fullWidth
                        placeholder={props.placeholder}
                        autoComplete='off'
                        variant="outlined"
                        onChange={(e)=> changeInSearchText(e)}
                      />
                    <SearchIcon className="form-action__search__icon"/>
                </div>
        </div>
    )
}
