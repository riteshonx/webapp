import { Button, Checkbox } from '@material-ui/core';
import React, { ReactElement, useContext, useEffect, useState } from 'react'
import { client } from '../../../../../services/graphql';
import { setFilterData, setFilterOptions } from '../../Context/projectActions';
import { projectContext } from '../../Context/projectContext';
import { LOAD_FILTER_DROP_DOWN_DATA } from '../../graphql/queries/rfi';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import { IconButton } from '@material-ui/core';
import { match, useRouteMatch } from 'react-router-dom';
import './FilterStatus.scss';
import { featureFormRoles } from '../../../../../utils/role';
import { Radio } from '@mui/material';
import { stateContext } from 'src/modules/root/context/authentication/authContext';

interface Props {
    field: any;
    index: number
}
export interface Params {
    id: string;
    featureId: string;

}

function FilterStatus({field, index}: Props): ReactElement {
    const {projectState, projectDispatch}: any = useContext(projectContext);
    const [values, setvalues] = useState<Array<any>>([]);
    const [filterOptionData, setFilterOptionData] = useState([]);
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
            setIsEdit(filterData[currentIndex].isEdited);
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
                 token: state?.selectedProjectToken}
            });
            if(reponse.data?.formFilterDropDown_query?.formsDropValues){
                // console.log(reponse.data.formFilterDropDown_query.formsDropValues);
                setFilterOptionData(reponse.data.formFilterDropDown_query.formsDropValues);
            }
            setloading(false);
        } catch(error: any){
            console.log(error.message);
            setloading(false);
        }
    }

    const changeInValue= (event: React.ChangeEvent<HTMLInputElement>, item: any)=>{
        let tempValues= [...values];
        const currentIndex= tempValues.indexOf(item.value)
        if(currentIndex>-1){
            tempValues.splice(currentIndex,1);
        } else{
            tempValues=[item.value];
        }
        setvalues(tempValues);
        const filterData= [...projectState.filterData];
        const filterField= filterData.filter(item=> item.elementId === field.elementId);
        if(filterField.length>0){
            const currentFieldIndex= filterData.indexOf(filterField[0]);
            filterData[currentFieldIndex].values=tempValues;
            filterData[currentFieldIndex].isEdited=true;
            projectDispatch(setFilterData(filterData));
            setIsEdit(true);
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

    const clearValues=()=>{
        const filterData= [...projectState.filterData];
        const currentField= filterData.filter(item=>item.elementId === field.elementId);
        if(currentField.length>0){
            const currentIndex= filterData.indexOf(currentField[0]);
            setvalues([]);
            setIsEdit(false);
            filterData[currentIndex].values= null;
            filterData[currentIndex].isEdited=false;
            projectDispatch(setFilterData(filterData));
        }
        const options= [...projectState.filterOptions];
        options[index].isOpen= false;
        projectDispatch(setFilterOptions(options));
    }


    return (
        <div className="FilterStatus">
            <div className="FilterStatus__header">
                <div className={`${isEdit?'FilterStatus__header__name':'FilterStatus__header__active'}`}>{field.caption}</div>
                <div className="FilterStatus__header__action">
                    {isEdit?(<Button size='small' className="FilterStatus__header__action__clear" onClick={clearValues}>Clear</Button>):("")}
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
             <div className="FilterStatus__body">
                {!loading && filterOptionData.length>0?(
                    <div className="FilterStatus__body__control">
                        {filterOptionData.map((item: any)=>(
                            <div>
                                <Radio 
                                color="default"
                                key={`check-${item.value}-${item.id}`}
                                checked={values.includes(item.value)}
                                onChange={(e) => changeInValue(e,item)}
                            />
                            <label>{item.value}</label>
                            </div>
                            )
                            )}
                </div>
                ):(
                    <div className="FilterStatus__body__data">No filter Data</div>
                )}
             </div>)}
        </div>
    )
}

export default FilterStatus
