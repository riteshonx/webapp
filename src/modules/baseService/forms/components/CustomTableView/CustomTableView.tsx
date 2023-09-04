import React, { ReactElement } from 'react'
import { InputType } from '../../../../../utils/constants';
import { TemplateData } from '../../models/template';
import {Loaction, Text, TextArea} from '../Text/Text';
import {DatePicker, DateTimePicker, TimePicker} from '../DatePicker/DatePicker';
import Attachement from '../Attachment/Attachement';
import Select from '../Select/Select';
import Boolean from '../Boolean/Boolean';
import './CustomTableView.scss';

interface ITable{
    index: number,
    field: TemplateData
}

function CustomTableView({field}: ITable): ReactElement {


    const renderInput=(inputField:TemplateData,index: number)=>{
        switch(inputField.fieldTypeId){
            case InputType.TEXT:
            case InputType.COMMENTS:{
                return <Text index={index} field={inputField}/>
            }
            case InputType.LONGTEXT:
                return <TextArea index={index} field={inputField}/>
            case InputType.DATEPICKER:{
                return <DatePicker index={index} field={inputField}/>
            }
            case InputType.DATETIMEPICKER:{
                return <DateTimePicker index={index} field={inputField}/>
            }
            case InputType.TIMEPICKER:{
                return <TimePicker index={index} field={inputField}/>
            }
            case InputType.ATTACHMENT:{
                return <Attachement index={index} field={inputField}/>
            }
            case InputType.CUSTOMDROPDOWN:
            case InputType.MULTIVALUEUSER:
            case InputType.SINGLEVALUEUSER:
            case InputType.SINGLEVALUECOMPANY:
            case InputType.CUSTOMNESTEDDROPDOWN:
            case InputType.MULTIVALUECOMPANY:{
                return <Select field={inputField} index={index}/>
            }
            case InputType.BOOLEAN:{
                return <Boolean field={inputField} index={index}/>
            }
            case InputType.LOCATION:
            case InputType.LOCATIONTREE:{
                return <Loaction index={index} field={inputField}/>
            }
            case InputType.TABLE:{
                return <CustomTableView index={index} field={inputField}/>
            }
            default:{
                return <Text index={index} field={inputField}/>
            }
        }
    }
    
    return (
        <div className="CustomTableView">
            <div className="CustomTableView__container">
                <table className="CustomTableView__container__table">
                    <thead>
                        <tr>
                        {field.showNumberColumn && <th className="CustomTableView__container__table__slnoth">Slno.</th>} 
                            <th className="CustomTableView__container__table__headcell">{field.metadata.index}</th>
                            {field.metadata?.colData && field.metadata?.colData.length>0 &&
                             field.metadata?.colData.map((headCell: any, headeCellIndex: number)=><th key={`headecell-${headeCellIndex}`}
                                className="CustomTableView__container__table__headcell">
                                        {headCell.caption} {headCell?.required?"*": ""}
                                </th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {field.metadata?.rowData && field.metadata?.rowData.length>0 && 
                        field.metadata?.rowData.map((rowData: any, rowIndex: number)=>(
                        <tr className="CustomTableView__container__table__row" key={`row-${rowIndex}`}>
                             {field.showNumberColumn && <td className="CustomTableView__container__table__row__slnotd">{rowIndex+1}</td>} 
                             <td className="CustomTableView__container__table__row__cell">
                                 {rowData?.caption}
                             </td>
                            {field.metadata?.colData.map((cellData: any, cellIndex: number)=><td key={`row-${rowIndex}=${cellIndex}`} 
                                className="CustomTableView__container__table__row__cell">
                                    {renderInput(cellData, cellIndex)}
                                </td>)}
                        </tr>))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default CustomTableView
