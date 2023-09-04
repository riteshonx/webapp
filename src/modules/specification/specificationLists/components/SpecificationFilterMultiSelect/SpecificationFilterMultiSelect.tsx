import { Checkbox } from '@material-ui/core';
import React, { ReactElement, useContext, useEffect, useState } from 'react'
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import { IconButton } from '@material-ui/core';
import './SpecificationFilterMultiSelect.scss';
import moment from 'moment';


export default function SpecificationFilterMultiSelect(props: any): ReactElement {
    // console.log(props, 'props')
    const [values, setvalues] = useState<Array<any>>([]);
    const [filterOptionData, setFilterOptionData] = useState<Array<any>>([]);
    const [loading, setloading] = useState(false);
    const [isEdit, setIsEdit] = useState(false);

    useEffect(() => {
        if (props?.itemListData?.length > 0) {
            setFilterOptionData(props?.itemListData)
        }
    }, [props?.itemListData])

    const openView = () => {
        setIsEdit(true)
    }

    const hideView = () => {
        setIsEdit(false)
    }

    return (
        <div className="SpecificationFilterMultiSelect">
            <div className="SpecificationFilterMultiSelect__header">
                <div className={`${isEdit ? "SpecificationFilterMultiSelect__header__name" : "SpecificationFilterMultiSelect__header__active"}`}>
                    {props.field}
                </div>
                <div className="SpecificationFilterMultiSelect__header__action">
                    {
                        !isEdit ? (
                            <IconButton onClick={openView}>
                                <AddIcon />
                            </IconButton>
                        ) : (
                            <IconButton onClick={hideView}>
                                <RemoveIcon />
                            </IconButton>
                        )
                    }
                </div>
            </div>
            {isEdit && (
                <div className="SpecificationFilterMultiSelect__body">
                    {!loading && filterOptionData.length > 0 ? (
                        <div className="SpecificationFilterMultiSelect__body__control">
                            {filterOptionData.map((item: any, index: number) => (
                                <div key={`filter-item-${index}`}>
                                    <Checkbox
                                        color="primary"
                                        checked={props?.values?.indexOf(item) > -1}
                                        onChange={(e) => props?.changeSelectValue(e, item)}
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
                    ) : (
                        <div className="SpecificationFilterMultiSelect__body__data">No filter Data</div>
                    )}
                </div>)}
        </div>
    )
}
