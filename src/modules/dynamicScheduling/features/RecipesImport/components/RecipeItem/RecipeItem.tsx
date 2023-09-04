import React, { useContext, useState } from 'react'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import GetAppIcon from '@material-ui/icons/GetApp';
import RecipeImportPopup from '../RecipeImportPopup/RecipeImportPopup';
import './RecipeItem.scss';
import { ImportRecipe, RecipeContext } from '../../../../graphql/models/recipeImport';
import { stateContext } from '../../../../../root/context/authentication/authContext';
import ProjectPlanContext from '../../../../context/projectPlan/projectPlanContext';
import Tooltip from '@material-ui/core/Tooltip';
import { useHistory } from 'react-router-dom';
import { canViewTenantTask } from 'src/modules/root/components/Sidebar/permission';

interface IPullingRecipeTasks  {
    tasks: Array<any>,
    links: Array<any>
}
interface IRecipeSubItem{
    currentItem: ImportRecipe,
    index: number;
    onPanelInsideClick: any;
    currentGanttView:any;
}
const RecipeItem = ({currentItem, index, onPanelInsideClick,currentGanttView}: IRecipeSubItem) => {
    const [recipeImportPopup, setRecipeImportPopup] = useState(false);
    const [pullingRecipeTasks, setPullingRecipeTasks] = useState<IPullingRecipeTasks>();
    const { recipeiList,updateValues }: any = useContext(RecipeContext);
    const { state: authState, dispatch }: any = useContext(stateContext);
    const projectPlanContext = useContext(ProjectPlanContext);
    const { projectMetaData } = projectPlanContext;
    const history = useHistory();

    const onImport = () => {
        onPanelInsideClick(true);
        setRecipeImportPopup(true);
    }
    const onClose = () => {
        onPanelInsideClick(false);
        setRecipeImportPopup(false);
    }    
    const expandView=()=>{
        currentItem.isOpen=!currentItem.isOpen;
        updateValues();
    }
    const renderRecipe =(currentValue: any) => {

    const protocol = location.protocol;
    const host = location.host;

    const url = `${protocol}//${host}`;
    const targetUrl = `${url}/scheduling/library/recipe-plan/${currentValue?.id}`;
    window.open(targetUrl, '_blank');
    }
    return (
        <div className="RecipeItem">
            <div className="RecipeItem__tab" >
                <div className="RecipeItem__tab__more" onClick={expandView}>
                    {currentItem.childnodes.length>0?(currentItem.isOpen?( <ExpandMoreIcon className="RecipeItem__tab__more"/>):(
                        <KeyboardArrowRightIcon className="RecipeItem__tab__more"/>
                    )):("")}
                </div>
                <div className="RecipeItem__tab__left">
                    <div className="RecipeItem__tab__left__label">
                        {canViewTenantTask() ? <Tooltip title={'Click to view the recipe'} 
                            aria-label="Activity Name"  onClick={() => renderRecipe(currentItem)}>
                            <label className="RecipeItem__tab__left__label-hiperlink">
                                {currentItem.name ? currentItem.name.length > 22 ? `${currentItem.name.slice(0,22)} . . .`:
                                    currentItem.name : '--'}
                            </label>
                        </Tooltip>: 
                            <label className="RecipeItem__tab__left__label">
                                {currentItem.name ? currentItem.name.length > 22 ? `${currentItem.name.slice(0,22)} . . .`:
                                    currentItem.name : '--'}
                            </label>}
                    </div>
                    <div className="RecipeItem__tab__left__taskType">
                        {currentItem.tasktype}
                    </div>
                </div>
                {   authState.projectFeaturePermissons?.cancreateMasterPlan && 
                    projectMetaData.status === 'draft' &&
                    projectMetaData.is_Editable  &&
                    currentGanttView === 'gantt' &&
                    <div className="RecipeItem__tab__download">
                        <GetAppIcon className="RecipeItem__tab__download__icon" onClick={onImport}/>
                    </div>
                }
            </div> 
            {currentItem.childnodes.length>0 && currentItem.isOpen &&(
            <div className="RecipeItem__children">
                {currentItem.childnodes.map((item: any, subItemIndex: number)=>(
                    <RecipeItem currentItem={item} key={item.id} index={subItemIndex} onPanelInsideClick={onPanelInsideClick} currentGanttView={currentGanttView}/>
                ))} 
            </div>  
            )}  
            {recipeImportPopup && <RecipeImportPopup 
                pulledRecipeTask = {currentItem} 
                open={recipeImportPopup}
                close={onClose}>
            </RecipeImportPopup>}   
        </div>
    )
}
export default RecipeItem