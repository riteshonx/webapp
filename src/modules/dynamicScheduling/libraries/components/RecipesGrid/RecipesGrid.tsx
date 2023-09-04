import { Tooltip } from '@material-ui/core';
import { ReactElement, useContext, useEffect, useState } from 'react';
import ConfirmDialog from '../../../../shared/components/ConfirmDialog/ConfirmDialog';
import { RecipeContext } from '../../pages/ScheduleRecipes/ScheduleRecipes';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import CreateRecipeTemplate from '../CreateRecipeTemplate/CreateRecipeTemplate';
import { getUniqueRecipeName } from '../../../../../utils/helper';
import { decodeToken, decodeExchangeToken } from '../../../../../services/authservice';
import './RecipesGrid.scss';
import { useHistory } from 'react-router-dom';
import RecipeDetailsContext from '../../../context/Recipe/RecipeContext';

interface iactionData {
  actionType: string,
  recipeData: null
}

interface recipesLib {
  recipeName: string;
  description: string;
  workingDays: string;
  workingDaysLength: number;
  workingHours: number;
  isEditable: string;
  id: number;
  createdBy: string;
  action: string;
  holidayList: number;
}
interface message {
  header: string;
  text: string;
  cancel: string;
  proceed: string;
}


export default function RecipeGrid(props: any): ReactElement {
  const recipeData = useContext(RecipeContext);
  const recipeDetailsContext = useContext(RecipeDetailsContext);
  const { setRecipeDetails, editRecipeMetaData } = recipeDetailsContext;
  const [gridData, setGridData] = useState(recipeData);
  const [actionData, setActionData] = useState<iactionData>();
  const [selectedItem, setSelectedItem] = useState<any>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  // Action to display confirmation popup for edit or delete values 'edit'/'delete'
  const [action, setAction] = useState('delete');

  // Set confirmation messages header, messages, button title
  const [confirmMessage, setConfirmMessage] = useState({});

  const history = useHistory();


  const [btnName, setBtnName] = useState(
    {
      name: 'Update Recipe',
      submit: 'Update'
    }
  );

  useEffect(() => {
    setGridData(recipeData);
  }, [recipeData]);

  const handleDialogOpen = async (recipe: any, actionParam: string) => {
    const data= {...recipe};

    setRecipeDetails(recipe);
    if (actionParam === 'edit') {
      setBtnName({
        name: 'Update Recipe',
        submit: 'Update'
      });
      history.push(`/scheduling/library/recipe-plan/${data?.id}`);
    } else if (actionParam === 'copy') {
      setBtnName({
        name: 'Create duplicate Recipe',
        submit: 'Continue'
      });
      const recipeNameList = await props.getSimilarRecipeNameList(recipe.recipeName);
      recipeNameList.push(recipe.recipeName);
      data.recipeName = getUniqueRecipeName(recipeNameList);
      setActionData({
        actionType: actionParam,
        recipeData: data
      });
      setDialogOpen(true);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handleConfirmBoxOpen = (row: any, action: string) => {
    if (action === 'edit') {
      setConfirmMessage({
        header: 'Are you sure?',
        text: 'The changes made will only apply to all upcoming tasks in all projects associated to this recipe. Tasks in past will not be impacted by this change.',
        cancel: 'Cancel',
        proceed: 'Proceed',
      });
      setAction('edit');
    }
    if (action === 'delete') {
      setConfirmMessage({
        header: 'Are you sure?',
        text: 'If you delete this recipe, all data related to this recipe will be lost.',
        cancel: 'Cancel',
        proceed: 'Proceed',
      });
      setAction('delete');
    }
    setSelectedItem(row);
    setConfirmOpen(true);
  };

  const handleConfirmBoxClose = () => {
    setAction('delete');
    setConfirmOpen(false);
  };

  const deleteRecipe = (selectedItem: any) => {
    props.deleteRecipe(Number(selectedItem.id));
    setConfirmOpen(false);
  };

  const refreshRecipeList = () => {
    // console.log('reftesh recipe list')
    props.refresh();
  }

  // called from confirmation dialogue
  const proceedConfirm = () => {
    if (action === 'delete') {
      deleteRecipe(selectedItem);
    }
    setConfirmOpen(false);
  };

  return (
    <>
      {gridData.map((item: any, index: number) => (
          <div className="recipe-grid-view__card" key={item.id}>
            <Tooltip title={item.recipeName} aria-label="caption" placement="bottom-start">
              <div className="recipe-grid-view__card__name" onClick={() => handleDialogOpen(item, 'edit')}>
                {item.recipeName.length > 15 ? item.recipeName.slice(0, 15) + '. . .' : item.recipeName}
              </div>
            </Tooltip>
            <div className="recipe-grid-view__card__description recipe-grid-description" title={item.description}>{item.description}</div>
            <div>
              <div className="recipe-grid-type"><b>Type:</b> {item.recipeType}</div>
              <div className="recipe-grid-type recipe-grid-type__duration"> {item.duration} {item.duration == 1 ? "day": "days"}</div>
              {decodeExchangeToken().allowedRoles.includes("updateTenantTask") &&
              <div className="recipe-grid-controls">
                {/* <Tooltip title="Copy">
                  <FileCopyIcon
                    data-testid={`edit-task-${item.id}`}
                    className="formlistTable__cellicon"
                    onClick={() =>
                      handleDialogOpen(item, 'copy')
                    }
                  />
                </Tooltip> */}
              {decodeExchangeToken().allowedRoles.includes("updateTenantTask")  ? (
                <Tooltip title="Edit">
                      
                  <EditIcon
                    data-testid={`edit-task-${item.id}`}
                    className="grid-view__card__info__action__icon"
                    onClick={() =>
                      handleDialogOpen(item, 'edit')
                    }
                    />

                </Tooltip>) : "" }
                {decodeExchangeToken().allowedRoles.includes("deleteTenantTask")  ? (
                 <Tooltip title="Delete">
                  <DeleteIcon
                    data-testid={`delete-task-${item.id}`}
                    className="grid-view__card__info__action__icon"
                    onClick={() =>
                      handleConfirmBoxOpen(item, 'delete')
                    }
                  />
                </Tooltip>) : ("") }
                 
              </div>
                  }
            </div>
          </div>
      ))}
      {dialogOpen ? (
        <CreateRecipeTemplate open={dialogOpen} recipeActionItem={actionData} btnName={btnName}
          refreshRecipeList={refreshRecipeList} close={handleDialogClose} createRecipe={props.createRecipe} editRecipe={props.editRecipe}/>
      ) : (
        ''
      )}
      {confirmOpen ? (
        <ConfirmDialog
          open={confirmOpen}
          message={confirmMessage}
          close={handleConfirmBoxClose}
          proceed={proceedConfirm}
        />
      ) : (
        ''
      )}
    </>
  );
}
