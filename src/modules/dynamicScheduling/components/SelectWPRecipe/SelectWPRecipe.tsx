import IconButton from '@material-ui/core/IconButton'
import TextField from '@material-ui/core/TextField'
import React, { ReactElement, useContext, useEffect, useState } from 'react'
import SearchIcon from '@material-ui/icons/Search';
import CancelIcon from '@material-ui/icons/Cancel';
import { useDebounce } from '../../../../customhooks/useDebounce';
import './SelectWPRecipe.scss';
import { GET_RECIPE_WP_LIST } from '../../graphql/queries/recipeImport';
import { projectFeatureAllowedRoles } from 'src/utils/role';
import { client } from 'src/services/graphql';
import { stateContext } from '../../../root/context/authentication/authContext';
import OutsideClickHandler from 'react-outside-click-handler';

interface Props {
    selectWP: any
}

function SelectWPRecipe(props: Props): ReactElement {
    const [searchedRecipeWPList, setSearchedRecipeWPList] = useState<Array<any>>([]);
    const [searchName, setSearchName] = useState('');
    const debounceName = useDebounce(searchName,400);
    const [userSelectParent, setUserSelectParent] = useState(false);
    const { state }:any = useContext(stateContext);


    useEffect(() => {
        if(debounceName.trim() && !userSelectParent){
            fetchWPRecipe()
        } else{
            setSearchedRecipeWPList([]);
        }
    }, [debounceName])

    const fetchWPRecipe= async ()=>{
       if(debounceName && debounceName.length > 2) {
            try {
                const targetWPS: Array<any> = [];
                const response: any = await client.query({
                    query: GET_RECIPE_WP_LIST,
                    fetchPolicy: 'network-only',
                    variables: {
                        searchText: debounceName + '%'
                    },
                    context: {
                        role: projectFeatureAllowedRoles.viewMasterPlan,
                        token: state.selectedProjectToken
                    }
                });

                 if (response?.data?.scheduleRecipeSet && response?.data?.scheduleRecipeSet.length > 0) {
                    response?.data?.scheduleRecipeSet.forEach(
                      (rSetItem: any) => {
                            rSetItem?.recipeTasks.forEach(
                                (item: any) => {
                                    const wp = {
                                        text: item.taskName,
                                        id: item.id,
                                        recipeId: rSetItem.id,
                                        duration: item?.duration
                                    };
                                    targetWPS.push(wp);
                                })
                        }
                    );
                }
                setSearchedRecipeWPList(targetWPS);
            } catch (err) {}
        }
    }

    /**
     * Common method to stop event propogation and prevent default
     * @param event :
     */
     const stopPropogation=(event: React.MouseEvent<HTMLDivElement | HTMLButtonElement| SVGSVGElement, MouseEvent>)=>{
        event.stopPropagation();
        event.preventDefault();
        fetchWPRecipe();
    }

    const clearSearchOption = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        setSearchedRecipeWPList([]);
        setUserSelectParent(true);
        setSearchName('');
        props.selectWP(null);
    }

    const addWP=(argWP: any)=>{
        setSearchedRecipeWPList([]);
        setUserSelectParent(true);
        setSearchName(argWP.text);
        props.selectWP({'id': argWP.id ,'text': argWP.text, 'duration': argWP.duration, 'recipeSetId': argWP.recipeId});
    }

    const onSearch = (text: string) => {
        setSearchName(text);
        setUserSelectParent(false);
        props.selectWP({text, id: null});
    }


    return (
        <div className="SelectWPRecipe">
            <div className="SelectWPRecipe__search">
                <SearchIcon className="SelectWPRecipe__search__icon"/>
                    <TextField value={searchName}
                            id="select-wp-search"
                            data-testid="selectwp-search"
                            type="text"
                            fullWidth
                            onClick={(e)=>stopPropogation(e)}
                            placeholder="Enter name(or Recipe name to add a recipe)"
                            onChange={(e)=>onSearch(e.target.value)}
                            autoFocus
                            />
                    {searchName &&
                    <IconButton  onClick={(e)=>clearSearchOption(e)} data-testid="recipe-wp-close"
                                className="SelectWPRecipe__search__close">
                        <CancelIcon  className="SelectWPRecipe__search__close__icon"/>
                    </IconButton>}

            </div>
            <OutsideClickHandler  onOutsideClick={() => setSearchedRecipeWPList([])} useCapture={true}>
                <div className="SelectWPRecipe__option">
                    <div className="SelectWPRecipe__option__list">
                        {searchedRecipeWPList.map((item: any, searchIndex: number) => (
                                <div key={item.id} className="SelectWPRecipe__option__list__item"
                                style={{borderBottom:`${searchedRecipeWPList.length-1===searchIndex?"none":""}`}}
                                onClick={() => addWP(item)}> 
                                    <div className="SelectWPRecipe__option__list__item__left">
                                        <div className="SelectWPRecipe__option__list__item__left__label">
                                            <div className="SelectWPRecipe__option__list__item__left__label__name">
                                                {item.text}
                                            </div>
                                            <div className="SelectWPRecipe__option__list__item__left__label__name">
                                                {item.duration} days
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                </div> 
            </OutsideClickHandler>      
        </div>
    )
}

export default SelectWPRecipe
