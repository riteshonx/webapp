import React, { ReactElement, useContext } from 'react';
import TextField from '@material-ui/core/TextField';
import './CustomTemplatesAction.scss';
import SearchIcon from '@material-ui/icons/Search';
import Button from '@material-ui/core/Button';
import { stateContext } from 'src/modules/root/context/authentication/authContext';


export default function CustomTemplatesAction(props: any): ReactElement {

    const { state }: any = useContext(stateContext);

    const handleSearchChange = (value:string) => {
        props.searchTask(value);
    }

    const createCustomTemplate = () => {
       props.createTemplate();     
    }


    return (
        <div className="template-action">
            <div className="template-action__middle">
                <div className="template-action__middle__search">
                    <TextField
                        value={props.searchText}
                        id="drawings-lists-search-text"
                        type="text"
                        fullWidth
                        placeholder="search"
                        autoComplete="search"
                        variant="outlined"
                        onChange={(e) => handleSearchChange(e.target.value)}
                    />
                    <SearchIcon className="template-action__middle__search__icon"/>
                    {/* <div className="template-action__middle__count">Showing 0 entries</div> */}
                </div>
            </div>
            <div className="template-action__right">
                {/* change the role later */}
                {
                    state?.projectFeaturePermissons?.canuploadDrawings && (
                        <Button
                            data-testid={'create-custom-template'}
                            variant="outlined"
                            className="btn-primary"
                            onClick={createCustomTemplate}
                        >
                            Create Template
                        </Button>
                    )
                }
            </div>
    </div>
    )
}
