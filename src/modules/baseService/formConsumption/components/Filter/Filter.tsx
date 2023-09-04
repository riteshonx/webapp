import React, { ReactElement, useContext, useState, useEffect } from 'react';
import './Filter.scss';
import { projectContext } from '../../Context/projectContext';
import FilterDateRange from '../FilterDateRange/FilterDateRange';
import { FIXED_FIELDS, FormOptionType, InputType } from '../../../../../utils/constants';
import FilterMultiSelectOptions from '../FilterMultiSelectOptions/FilterMultiSelectOptions';
import FilterText from '../FilterText/FilterText';
import FilterStatus from '../FilterStatus/FilterStatus';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import { Button } from '@material-ui/core';
import { setFilter, setFilterData, setFilterOptions } from '../../Context/projectActions';
import { decodeToken } from 'src/services/authservice';


export const Filter = (): ReactElement => {
  const [expandView, setExpandView] = useState(false);
  const {projectState, projectDispatch}: any = useContext(projectContext);

  useEffect(() => {
    if(projectState.showFilter){
      setExpandView(true);
   }
  }, [projectState.showFilter])


  const renderFields= (field: any, index: number)=>{
    switch(field.fieldTypeId){
      case InputType.DATEPICKER:
      case InputType.TIMEPICKER:
      case InputType.DATETIMEPICKER:{
        return (
                <FilterDateRange field={field} index={index}/>
        )
      }
      case InputType.SINGLEVALUECOMPANY:
      case InputType.SINGLEVALUEUSER:
      case InputType.MULTIVALUECOMPANY:
      case InputType.MULTIVALUEUSER:
      case InputType.INTEGER:
      case InputType.BOOLEAN:{
        return (
                <FilterMultiSelectOptions field={field} index={index}/>
        )
      }
      case InputType.TEXT:{
        if(field.caption === 'Status'){
          return (
                  <FilterStatus field={field} index={index}/>
          )
        } else{
            return (
                  <FilterText field={field} index={index}/>
            )
          }
      }
      default: return ("");
    }
  }

  const clearFilter= () =>{
    projectDispatch(setFilter(false));
    const activeFilters= JSON.parse(JSON.stringify(projectState.filterData));
    const currentAssigneeFilter= activeFilters.find((item: any)=> item.elementId === FIXED_FIELDS.ASSIGNEE);
    const currentCreatedByFilter= activeFilters.find((item: any)=> item.elementId === FIXED_FIELDS.CREATED_BY);
    const targetFilter=[];
    if(projectState.formCategoryOption.includes(FormOptionType.ASSIGNEdTOME) && currentAssigneeFilter){
      targetFilter.push({
        elementId: FIXED_FIELDS.ASSIGNEE,
        caption: "Created by",
        fieldTypeId: InputType.SINGLEVALUEUSER,
        values:[decodeToken().userId],
        isEdited: true
      })
    }
    if(projectState.formCategoryOption.includes(FormOptionType.CREATEDBYME) && currentCreatedByFilter){
      targetFilter.push({
        elementId: FIXED_FIELDS.CREATED_BY,
        caption: "Assigned to",
        fieldTypeId: InputType.SINGLEVALUEUSER,
        values:[decodeToken().userId],
        isEdited: true
      })
    }
    projectDispatch(setFilterData(targetFilter));
    const options= [...projectState.filterOptions];
    options.forEach((item: any)=> {
        item.isOpen= false;
    })
    projectDispatch(setFilterOptions(options));
  }

    return (
        <div className={`formsFilter ${expandView?'expand':'closed'}`}>
          <div className="formsFilter__left" onClick={()=>setExpandView(!expandView)}>
            <div className="formsFilter__left__title" >Filters</div>  
            <div className="formsFilter__left__arrow" >
              {expandView?(<ChevronRightIcon className="formsFilter__left__arrow__icon"/>):(
                <ChevronLeftIcon className="formsFilter__left__arrow__icon"/>)}    
            </div>
          </div>
          <div className="formsFilter__right">
              <div className="formsFilter__right__header">
                <div className="formsFilter__right__header__title">
                  Filters
                </div>
                <div className="formsFilter__right__header__option">
                  <Button data-testid={'create-form-template'} variant="outlined" size="small"
                              className="rfi-action__left__filter__btn btn-secondary" onClick={clearFilter}>
                          Clear All
                  </Button>
                </div>
              </div>
              <div className="formsFilter__right__options">
                 { projectState.filterOptions.map((item: any, index: number)=>(
                   <div className="formsFilter__right__options__item" key={`${item.elementId}`}>
                     {renderFields(item,index)}
                  </div>
                 ))}
              </div>
          </div>
        </div>
    )
}
