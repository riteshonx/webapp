import IconButton from '@material-ui/core/IconButton'
import TextField from '@material-ui/core/TextField'
import React, { ReactElement, useContext, useEffect, useState } from 'react'
import SearchIcon from '@material-ui/icons/Search';
import CancelIcon from '@material-ui/icons/Cancel';
import Avatar from '@material-ui/core/Avatar';
import { useDebounce } from '../../../../customhooks/useDebounce';
import './SelectParentTasks.scss';
import { gantt } from 'dhtmlx-gantt';
import { getTaskTypeName } from '../../utils/ganttConfig';

interface Props {
    selectParent: any,
    excludeParentTask: Array<string>
}

function SelectParentTasks(props: Props): ReactElement {
    const [searchedParentList, setSearchedParentList] = useState<Array<any>>([]);
    const [searchName, setSearchName] = useState('');
    const debounceName = useDebounce(searchName,400);
    const [noData, setNoData] = useState(false);
    const [userSelectParent, setUserSelectParent] = useState(false);


    useEffect(() => {
        if(debounceName.trim() && !userSelectParent){
            fetchParentTask()
        } else{
            setSearchedParentList([]);
        }
    }, [debounceName])

    const fetchParentTask= async ()=>{
      // if(debounceName){
            try {
              //  const parentList = projectPlan;
                const targetParent: Array<any> = [];
                const task = gantt.getTaskByTime();
                 if (task && task.length > 0) {
                    task.forEach(
                      (item: any) => {
                          if(!props.excludeParentTask.includes(item.type) 
                            && item.text.toLowerCase().includes(debounceName.toLowerCase())){
                            const parentTask = {
                                text: item.text,
                                type: getTaskTypeName(item.type),
                                id: item.id,
                                parent: item.parent,
                            };
                            targetParent.push(parentTask);
                          }
                        }
                    );
                }
                if(targetParent.length===0){
                //setNoData(true);
                }
                setSearchedParentList(targetParent);
            } catch (err) {}
       // }
    }

    /**
     * Common method to stop event propogation and prevent default
     * @param event :
     */
     const stopPropogation=(event: React.MouseEvent<HTMLDivElement | HTMLButtonElement| SVGSVGElement, MouseEvent>)=>{
        event.stopPropagation();
        event.preventDefault();
        fetchParentTask();
    }

    const clearSearchOption = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        setSearchedParentList([]);
        setUserSelectParent(true);
        setSearchName('');
        props.selectParent(null);
    }

    const addParent=(argParentTask: any)=>{
        setSearchedParentList([]);
        setUserSelectParent(true);
        setSearchName(argParentTask.text);
        props.selectParent(argParentTask.id);
    }

    const onSearch = (text: string) => {
        setSearchName(text);
        setUserSelectParent(false);
    }


    return (
        <div className="selectParentTask">
            <div className="selectParentTask__search">
                <SearchIcon className="selectParentTask__search__icon"/>
                    <TextField value={searchName}
                            id="parent-task-search"
                            data-testid="parentTask-search"
                            type="text"
                            fullWidth
                            onClick={(e)=>stopPropogation(e)}
                            placeholder="Select a parent acitvity"
                            onChange={(e)=>onSearch(e.target.value)}
                            />
                    {searchName &&
                    <IconButton  onClick={(e)=>clearSearchOption(e)} data-testid="taskAssignee-search-close"
                                className="selectParentTask__search__close">
                        <CancelIcon  className="selectParentTask__search__close__icon"/>
                    </IconButton>}

            </div>
            <div className="selectParentTask__option">
                   <div className="selectParentTask__option__list">
                      {searchedParentList.map((item: any, searchIndex: number) => (
                            <div key={item.id} className="selectParentTask__option__list__item"
                              style={{borderBottom:`${searchedParentList.length-1===searchIndex?"none":""}`}}
                              onClick={() => addParent(item)}> 
                                <div className="selectParentTask__option__list__item__left">
                                    <div className="selectParentTask__option__list__item__left__label">
                                        <div className="selectParentTask__option__list__item__left__label__name">
                                            {item.text}
                                        </div>
                                        <div className="selectParentTask__option__list__item__left__label__email">
                                            {item.type}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                      </div>
                      {noData && searchedParentList.length===0?(<div className="selectParentTask__option__nodata">No parent found</div>):("")}
                </div>       
        </div>
    )
}

export default SelectParentTasks
