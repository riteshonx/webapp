import { Checkbox } from '@material-ui/core';
import React, { ReactElement, useEffect, useState } from 'react'
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import { IconButton } from '@material-ui/core';
import './FilterDrawingsMultiSelect.scss';
import moment from 'moment';


export default function FilterDrawingsMultiSelect(props: any): ReactElement {

    const [filterOptionData, setFilterOptionData] = useState<Array<any>>([]);
    const [loading] = useState(false);
    const [isEdit, setIsEdit] = useState(false);

    useEffect(() => {
        if(props?.itemListData?.length > 0){
            setFilterOptionData(props?.itemListData)
        }
    }, [props?.itemListData])

    const openView= ()=>{
        setIsEdit(true)
    }
    
    const hideView= ()=>{
        setIsEdit(false)
    }

    return (
        <div className="FilterDrawingsMultiSelect">
            <div className="FilterDrawingsMultiSelect__header">
                <div className={`${isEdit?"FilterDrawingsMultiSelect__header__name":"FilterDrawingsMultiSelect__header__active"}`}>
                    {props.field}
                </div>
                <div className="FilterDrawingsMultiSelect__header__action">
                    {
                        !isEdit?(
                            <IconButton onClick={openView}>
                                <AddIcon/>
                            </IconButton>
                        ):(
                            <IconButton onClick={hideView}>
                                <RemoveIcon/>
                            </IconButton>
                        )
                    }
                </div>
             </div>
             {isEdit && (
             <div className="FilterDrawingsMultiSelect__body">
                {!loading && filterOptionData.length>0?(
                    <div className="FilterDrawingsMultiSelect__body__control">
                        {filterOptionData.map((item: any, index: number)=>(
                            <div key={`filter-item-${index}`}>
                                <Checkbox 
                                    color="primary"
                                    checked={props?.values?.indexOf(item)>-1}
                                    onChange={(e) => props?.changeSelectValue(e,item)}
                                />
                                    {props?.isDate ? (
                                         <label>
                                             {moment(item).format('DD-MMM-YYYY').toString()} 
                                         </label>
                                    ): (
                                        <label>
                                            {item}
                                        </label>
                                    )}

                            </div>
                            )
                        )}
                </div>
                ):(
                    <div className="FilterDrawingsMultiSelect__body__data">No filter Data</div>
                )}
             </div>)}
        </div>
    )
}
