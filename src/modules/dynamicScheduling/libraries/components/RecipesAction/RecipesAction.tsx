import { Button } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import AppsIcon from '@material-ui/icons/Apps';
import SearchIcon from '@material-ui/icons/Search';
import ViewListIcon from '@material-ui/icons/ViewList';
import React, { ReactElement, useState } from 'react';
import { createTenantTask } from '../../../permission/scheduling';
import CreateRecipeTemplate from '../CreateRecipeTemplate/CreateRecipeTemplate';

import './RecipesAction.scss';

interface iactionData {
  actionType: string,
  recipeData: null
}

export default function RecipeAction(props: any): ReactElement {
  const [dialogOpen, setdialogOpen] = useState(false);
  const [actionData, setActionData] = useState<iactionData>();

  const changeView = (type: string) => {
    props.toggleView(type)
  }

  type nameBtn = {
    name: string,
    submit: string
  }

  const btnName: nameBtn = {
    name: 'Create a New Recipe',
    submit: 'Create'
  }

  const handleDialogOpen = () => {
    setdialogOpen(true)
    setActionData({
      actionType: 'create',
      recipeData: null
    })
  }

  const handleDialogClose = () => {
    setdialogOpen(false)
  }

  const handleSearchChange = (value: string) => {
    props.searchRecipe(value);
  }

  const refreshRecipeList = () => {
    props.refresh();
  }

  return (
    <>
    <div className="lib-action">
     
      <div className="lib-action__tab">
      { false && (
        <React.Fragment>
          <div data-testid={'recipeGrid'} className={(props.view === 'gallery') ?
            'lib-action__tab__gallery--active' : 'lib-action__tab__gallery'}
            onClick={() => changeView('gallery')}>
            <AppsIcon className="lib-action__tab__icon" fontSize="small"></AppsIcon>
            Gallery View
          </div>
          <div data-testid={'recipeList'} className={(props.view === 'list') ?
            'lib-action__tab__list--active' : 'lib-action__tab__list'}
            onClick={() => changeView('list')}>
            <ViewListIcon className="lib-action__tab__icon" fontSize="small"></ViewListIcon>
            List View
          </div>
        </React.Fragment>
        )}
      </div> 

      <div className="lib-action__controls">
        <div className="lib-action__controls__search-bar">
          <TextField
            value={props.searchText}
            id="list-search-text"
            type="text"
            fullWidth
            placeholder="Search by Template name"
            autoComplete="search"
            variant="outlined"
            onChange={(e) => handleSearchChange(e.target.value)}
          />
          <SearchIcon className="lib-action__controls__search-bar__icon" />
        </div>
        {createTenantTask ? (
          <Button data-testid={'create-recipe'} variant="outlined" className="btn-primary" onClick={handleDialogOpen}>
            Create Recipe
          </Button>) : ''}
        
      </div>
      
    </div>
    {dialogOpen ? (
          <CreateRecipeTemplate open={dialogOpen} recipeActionItem={actionData} btnName={btnName} 
            refreshRecipeList={refreshRecipeList} close={handleDialogClose} createRecipe={props.createRecipe} editRecipe={props.editRecipe} />
        ) : ('')}
    </>
    
  );

}





