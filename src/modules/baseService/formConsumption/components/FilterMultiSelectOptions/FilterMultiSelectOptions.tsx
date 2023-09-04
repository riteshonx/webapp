import { Checkbox } from '@material-ui/core';
import React, { ReactElement, useContext, useEffect, useState } from 'react'
import { client } from '../../../../../services/graphql';
import { setFilterData, setFilterOptions } from '../../Context/projectActions';
import { projectContext } from '../../Context/projectContext';
import { LOAD_FILTER_DROP_DOWN_DATA } from '../../graphql/queries/rfi';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import { IconButton } from '@material-ui/core';
import { match, useRouteMatch } from 'react-router-dom';
import './FilterMultiSelectOptions.scss';
import { featureFormRoles } from '../../../../../utils/role';
import { stateContext } from 'src/modules/root/context/authentication/authContext';
import { FIXED_FIELDS, FormOptionType } from 'src/utils/constants';
import { decodeExchangeToken } from 'src/services/authservice';

interface Props {
    field: any;
    index: number
}
export interface Params {
    id: string;
    featureId: string;

}

function FilterMultiSelectOptions({field, index}: Props): ReactElement {
    const {projectState, projectDispatch}: any = useContext(projectContext);
    const [values, setvalues] = useState<Array<any>>([]);
    const [filterOptionData, setFilterOptionData] = useState<Array<any>>([]);
    const [loading, setloading] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const pathMatch:match<Params>= useRouteMatch();
    const {state }:any = useContext(stateContext);

    useEffect(() => {
        const filterData= [...projectState.filterData];
        const currentField= filterData.filter(item=>item.elementId === field.elementId);
        if(currentField.length>0){
            const currentIndex= filterData.indexOf(currentField[0]);
            setvalues(filterData[currentIndex].values||[]);
            setIsEdit(filterData[currentIndex].isEdited||false)
        } else{
            const value={
                elementId: field.elementId,
                values:values,
                fieldTypeId: field.fieldTypeId,
                caption: field.caption,
                isEdited: false
            };
            filterData.push(value);
            projectDispatch(setFilterData(filterData));
        }
    }, [projectState.filterData])

    useEffect(() => {
        if(field.isOpen){
            fetchFieldDropDownData();
        }
    }, [field.isOpen])

    const fetchFieldDropDownData= async ()=>{
        try{
            setloading(true);
            const reponse: any= await client.query({
                query: LOAD_FILTER_DROP_DOWN_DATA,
                variables:{
                    elementId: field.elementId,
                    featureId: Number(pathMatch.params.featureId)
                },
                fetchPolicy:'network-only',
                context:{role: featureFormRoles.viewForm,
                 token:state?.selectedProjectToken}
            });
            const targetList: Array<any>= [];
            if(reponse.data?.formFilterDropDown_query?.formsDropValues){
                reponse.data.formFilterDropDown_query.formsDropValues.forEach((item: any)=>{
                    let value =item.value;
                    if(item.email){
                        value= item.value?item.value: item.email.split('@')[0];
                    }
                    const newItem={
                        id: item.id,
                        value
                    }
                    targetList.push(newItem);
                })
            }
            setFilterOptionData(targetList);
            setloading(false);
        } catch(error: any){
            console.log(error.message);
            setloading(false);
        }
    }

    const changeInValue= (event: React.ChangeEvent<HTMLInputElement>, item: any)=>{
        const tempValues= [...values];
        const currentIndex= tempValues.indexOf(item.id)
        if(currentIndex>-1){
            tempValues.splice(currentIndex,1);
        } else{
            tempValues.push(item.id);
        }
        setvalues(tempValues);
        const filterData= [...projectState.filterData];
        const filterField= filterData.filter(item=> item.elementId === field.elementId);
        if(filterField.length>0){
            const currentFieldIndex= filterData.indexOf(filterField[0]);
            filterData[currentFieldIndex].values=tempValues;
            filterData[currentFieldIndex].isEdited=true;
            setIsEdit(true);
            projectDispatch(setFilterData(filterData));
        }
    }

    const openView= ()=>{
        const options= [...projectState.filterOptions];
        options[index].isOpen= true;
        projectDispatch(setFilterOptions(options));
      }
    
    const hideView= ()=>{
        const options= [...projectState.filterOptions];
        options[index].isOpen= false;
        projectDispatch(setFilterOptions(options));
    }

    const isCheckBoxDisabled=(argItem: any)=>{
        if(projectState.formCategoryOption.includes(FormOptionType.ASSIGNEdTOME) && field.elementId === FIXED_FIELDS.ASSIGNEE){
            return argItem.id=== decodeExchangeToken().userId;
        }
        if(projectState.formCategoryOption.includes(FormOptionType.CREATEDBYME) && field.elementId === FIXED_FIELDS.CREATED_BY){
            return argItem.id=== decodeExchangeToken().userId;
        }
        return false;
    }

    return (
        <div className="FilterMultiSelectOptions">
            <div className="FilterMultiSelectOptions__header">
                <div
                className={`${isEdit?"FilterMultiSelectOptions__header__name":"FilterMultiSelectOptions__header__active"}`}>{field.caption}</div>
                <div className="FilterMultiSelectOptions__header__action">
                    {!field.isOpen?(
                        <IconButton onClick={openView}>
                                <AddIcon/>
                        </IconButton>
                        ):(
                            <IconButton onClick={hideView}>
                            <RemoveIcon/>
                            </IconButton>
                        )}
                    </div>
             </div>
             {field.isOpen && (
             <div className="FilterMultiSelectOptions__body">
                {!loading && filterOptionData.length>0?(
                    <div className="FilterMultiSelectOptions__body__control">
                        {filterOptionData.map((item: any)=>(
                            <div key={`check-${item.value}-${item.id}`}>
                                <Checkbox 
                                color="default"
                                disabled={isCheckBoxDisabled(item)}
                                checked={values.indexOf(item.id)>-1}
                                onChange={(e) => changeInValue(e,item)}
                            />
                            <label>{item.value}</label>
                            </div>
                            )
                            )}
                </div>
                ):(
                    <div className="FilterMultiSelectOptions__body__data">No filter Data</div>
                )}
             </div>)}
        </div>
    )
}

export default FilterMultiSelectOptions
