import React, { createContext, useContext, useEffect, useState } from 'react'
import { client } from '../../../../../../services/graphql';
import { projectFeatureAllowedRoles } from '../../../../../../utils/role';
import { GET_RECIPE_METADATA } from '../../../../graphql/queries/recipePlan';
import { ImportRecipe, RecipeContext } from '../../../../graphql/models/recipeImport';
import { GET_RECIPE_LIST } from '../../../../graphql/queries/recipeImport';
import RecipeItem from '../RecipeItem/RecipeItem';
import './RecipeList.scss';
import { stateContext } from '../../../../../root/context/authentication/authContext';
import { useDebounce } from '../../../../../../customhooks/useDebounce';

const RecipeList = (props: any) => {
    const [recipeiList, setRecipeiList] = useState<Array<ImportRecipe>>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { state }: any = useContext(stateContext);
    const debounceName = useDebounce(props.searchText, 400);

    useEffect(() => {
        getRecipeList();
    }, [])

    useEffect(() => {
        if(debounceName.trim()){
            getRecipeList(true);
        } else{
            getRecipeList();
        }
    }, [debounceName])

    const getRecipeList = async (isSearchText = false) => {
        try {
            setIsLoading(true);
            const response: any = await client.query({
                query: GET_RECIPE_LIST,
                fetchPolicy: 'network-only',
                context: {
                    role: projectFeatureAllowedRoles.viewMasterPlan,
                    token: state.selectedProjectToken
                }
            });
            setIsLoading(false);
            const recipeList: Array<ImportRecipe> = [];
            response.data.scheduleRecipeSet.forEach((item: any) => {
                    const currentNode= item.recipeTasks.filter((recipeTaskItem: any)=>recipeTaskItem.parentId === null);
                    const newRecipe: ImportRecipe = {
                        id: item.id,
                        recipeType: item.recipeType,
                        name: item.recipeName,
                        tasktype: item.recipeType,
                        isOpen: false,
                        nodeId: currentNode.length>0?currentNode[0].id:'',
                        childnodes: [],
                        duration: currentNode[0].duration,
                        recipeSetId: item.id,
                        startDate: currentNode[0].startDate,
                    }
                    const childNodes= item.recipeTasks.filter((recipeTaskItem: any)=>newRecipe.nodeId === recipeTaskItem.parentId);
                    const childNodeList: Array<any>= [];
                    childNodes.forEach((childItem: any)=>{
                        const newChildRecipe: ImportRecipe = {
                            id: childItem.id,
                            recipeType: childItem.type,
                            name: childItem.taskName,
                            tasktype: 'Work Package',
                            isOpen: false,
                            nodeId: childItem.id,
                            childnodes: [],
                            duration: childItem.duration,
                            recipeSetId: item.id,
                            startDate: childItem.startDate
                        }
                        const grandChildNodes= item.recipeTasks.filter((recipeTaskItem: any)=>newChildRecipe.nodeId === recipeTaskItem.parentId);
                        const grandChildNodeList: Array<any>= [];
                        grandChildNodes.forEach((grandChildItem: any)=>{
                            const newGrandChildRecipe: ImportRecipe = {
                                id: grandChildItem.id,
                                recipeType: grandChildItem.type,
                                name: grandChildItem.taskName,
                                tasktype: 'Work Package',
                                isOpen: false,
                                nodeId: grandChildItem.id,
                                childnodes: [],
                                duration: grandChildItem.duration,
                                recipeSetId: item.id,
                                startDate: grandChildItem.startDate
                            }
                            grandChildNodeList.push(newGrandChildRecipe);
                        })
                        newChildRecipe.childnodes=grandChildNodeList;
                        childNodeList.push(newChildRecipe);
                    })
                    newRecipe.childnodes= childNodeList;
                    recipeList.push(newRecipe);
            });
            setRecipeiList(recipeList);
            isSearchText ? filterRecipeList(recipeList) : null;
        } catch (error: any) {
            console.log(error.message);
        }
    }
    
    const updateValues=()=>{
        setRecipeiList([...recipeiList]);
    }

    const filterRecipeList = (argRecipeList: any) => {
        const targetList: any = [];
        argRecipeList.forEach((recipe: any) => {
            if(recipe.childnodes.length) {
                const targetClist: any = [];
                recipe.childnodes.forEach((crecipe: any) => {
                    if(crecipe.name.toLowerCase().includes(debounceName.toLowerCase())) {
                        targetClist.push(crecipe);
                    }
                })
                if(targetClist.length){
                    recipe.childnodes = targetClist;
                    targetList.push(recipe);
                } else {
                    if(recipe.name.toLowerCase().includes(debounceName.toLowerCase())) {
                        targetList.push(recipe);
                    }
                }
            } else {
                if(recipe.name.toLowerCase().includes(debounceName.toLowerCase())) {
                    targetList.push(recipe);
                }
            }
        });
        setRecipeiList(targetList);
    }

    return (
        <RecipeContext.Provider value={{recipeiList: recipeiList,updateValues}}>
            <div className="RecipesImport__container">
                {recipeiList.length?(
                    recipeiList.map((item: any, argIndex: number) => (
                    <RecipeItem 
                        currentItem={item} 
                        key={item.id} 
                        index={argIndex}  
                        onPanelInsideClick={(status: boolean) => props.onPanelInsideClick(status)}
                        currentGanttView={props.currentGanttView}/>
                    ))
                ):!isLoading ? (
                    <div className="PullPlanPanel__nodata">No recipes were found</div>
                ): (
                    <div className="PullPlanPanel__nodata">fetching recipes...</div>
                )}
            </div>
        </RecipeContext.Provider>
    )
}
export default RecipeList;