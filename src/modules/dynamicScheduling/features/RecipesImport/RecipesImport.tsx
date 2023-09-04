import { TextField } from '@material-ui/core';
import React, { useState } from 'react';
import RecipeList from './components/RecipeList/RecipeList';
import SearchIcon from '@material-ui/icons/Search';
import './RecipesImport.scss';


const RecipesImport = (props: any) => {
    const [searchText, setSearchText] = useState('');

    return (
        <div className="RecipesImport">
            <div className="RecipesImport__header">
                <TextField variant="outlined" fullWidth placeholder="Search recipe or work package" onChange={(e)=>setSearchText(e.target.value)}/>
                <SearchIcon className="RecipesImport__header__search"/>
            </div>
            <RecipeList onPanelInsideClick={(status: boolean) => props.onPanelInsideClick(status)} searchText={searchText} currentGanttView={props.currentGanttView}>

            </RecipeList>
        </div>
    )
}

export default RecipesImport
