import { TextField } from '@material-ui/core';
import React, { ReactElement, useContext, useEffect, useState } from 'react';
import { setFilterData, setFilterOptions } from '../../Context/projectActions';
import { projectContext } from '../../Context/projectContext';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import { IconButton } from '@material-ui/core';
import './FilterText.scss';

interface Props {
    field: any;
    index: number
}

function FilterText({field, index}: Props): ReactElement {
    const [textValue, setTextValue] = useState('');
    const {projectState, projectDispatch}: any = useContext(projectContext);
    const [isEdit, setIsEdit] = useState(false);

    useEffect(() => {
        const filterData= [...projectState.filterData];
        const currentField= filterData.filter(item=>item.elementId === field.elementId);
        if(currentField.length>0){
            const currentIndex= filterData.indexOf(currentField[0]);
            setTextValue(filterData[currentIndex].values);
            if(filterData[currentIndex].isEdited && filterData[currentIndex].values){
                setIsEdit(filterData[currentIndex].isEdited||false);
            } else{
                setIsEdit(false);
            }
        } else{
            const value={
                elementId: field.elementId,
                values: '',
                fieldTypeId: field.fieldTypeId,
                caption: field.caption,
                isEdited: false
            };
            filterData.push(value);
            projectDispatch(setFilterData(filterData));
        }
    }, [projectState.filterData])

    const changeInText=( event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>)=>{
        setTextValue(event.target.value);
        const filterData= [...projectState.filterData];
        const currentField= filterData.filter(item=>item.elementId === field.elementId);
        if(currentField.length>0){
            const currentIndex= filterData.indexOf(currentField[0]);
            if(currentIndex>-1){
                filterData[currentIndex].values=event.target.value;
                filterData[currentIndex].isEdited=true;
                projectDispatch(setFilterData(filterData));
                setIsEdit(true);
            }
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


    return (
        <div className="filterText">
            <div className="filterText__header">
                <div className={`${isEdit?'filterText__header__name':'filterText__header__active'}`}>{field.caption}</div>
                <div className="filterText__header__action">
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
             <div className="filterText__body">
                <TextField value={textValue}
                        id="list-search-text"
                        data-testid="filtersearch"
                        type="text"
                        fullWidth
                        placeholder={field.caption}
                        variant="outlined"
                        className="filterText__input"
                        onChange={(e)=>changeInText(e)}
                              />
            </div>)}
        </div>
    )
}

export default FilterText;
