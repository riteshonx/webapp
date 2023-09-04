import { InputType } from "src/utils/constants";
import { IFieldInput, TemplateData } from "../models/template";
import TextFieldsIcon from '@material-ui/icons/TextFields';
import CalendarTodayIcon from '@material-ui/icons/CalendarToday';
import QueryBuilderIcon from '@material-ui/icons/QueryBuilder';
import AttachFileIcon from '@material-ui/icons/AttachFile';
import ChatBubbleOutlineIcon from '@material-ui/icons/ChatBubbleOutline';
import ViewListIcon from '@material-ui/icons/ViewList';
import FormatListNumberedRtlIcon from '@material-ui/icons/FormatListNumberedRtl';
import BusinessIcon from '@material-ui/icons/Business';
import PeopleAltIcon from '@material-ui/icons/PeopleAlt';
import ToggleOnIcon from '@material-ui/icons/ToggleOn';
import DialpadIcon from '@material-ui/icons/Dialpad';
import AccountTreeIcon from '@material-ui/icons/AccountTree';
import TableChartIcon from '@material-ui/icons/TableChart';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import CodeBraces from '../../../../../src/assets/images/code-braces.svg';

    export const constructTableData = ()=>{
        const metadata:any = {}
        metadata.index = "Click to configure";
        metadata.colData = []
        metadata.rowData = [];
        for(let i=0;i<5;i++){
            const obj:any = {
                caption :`Configure column ${i+1}`,
                required :false,
                fieldTypeId :InputType.TEXT
            }
            metadata.colData.push(obj)
        }
        for(let i=0;i<5;i++){
                const obj:any = {
                    caption :`Configure row ${i+1}`
                };
                metadata.rowData.push(obj)
        }
        metadata.colCount = metadata.colData.length;
        metadata.rowCount = metadata.rowData.length;
        return metadata;
    }

    /**
     * Method to render field type icons
     * @param row : IFieldInput
     * @returns 
     */
    export const renderCommonFields=(row: IFieldInput)=>{
        switch(row.id){
            case InputType.Object:{
                return <div  className="fieldsContainer__collection__list__input__icon 
                        fieldsContainer__collection__list__input__icon__object_field">
                        <img src={CodeBraces}/>
                        </div>
                       }
            case InputType.TEXT:
            case InputType.LONGTEXT:{
               return <TextFieldsIcon className="fieldsContainer__collection__list__input__icon"/>
            }
           case InputType.DATEPICKER:{
               return <CalendarTodayIcon className="fieldsContainer__collection__list__input__icon"/>
           }
           case InputType.DATETIMEPICKER:{
            return <CalendarTodayIcon className="fieldsContainer__collection__list__input__icon"/>
           }
           case InputType.TIMEPICKER:{
               return <QueryBuilderIcon className="fieldsContainer__collection__list__input__icon"/>
           }
           case InputType.ATTACHMENT:{
               return <AttachFileIcon className="fieldsContainer__collection__list__input__icon"/>
           }
           case InputType.INTEGER:{
               return <DialpadIcon className="fieldsContainer__collection__list__input__icon"/>
           }
           case InputType.COMMENTS:{
               return <ChatBubbleOutlineIcon 
                   className="fieldsContainer__collection__list__input__icon"/>
           }
           case InputType.CUSTOMDROPDOWN:{
            return <FormatListNumberedRtlIcon 
            className="fieldsContainer__collection__list__input__icon"/>
           }
           case InputType.SINGLEVALUEUSER:{
                return <PeopleAltIcon 
                className="fieldsContainer__collection__list__input__icon"/>
            }
           case InputType.SINGLEVALUECOMPANY:{
            return <BusinessIcon 
            className="fieldsContainer__collection__list__input__icon"/>
           }
           case InputType.MULTIVALUECOMPANY:
           case InputType.MULTIVALUEUSER:{
               return <ViewListIcon 
            className="fieldsContainer__collection__list__input__icon"/>
           }
           case InputType.LOCATION:{
            return <LocationOnIcon/>
           }
           case InputType.BOOLEAN:{
               return <ToggleOnIcon/>
           }
           case InputType.TABLE:{
            return <TableChartIcon className="fieldsContainer__collection__list__input__icon"/>
             }
           case InputType.LOCATIONTREE:{
            return <AccountTreeIcon  className="fieldsContainer__collection__list__input__icon"/>
           }
        }
    }

    export const renderExistingFields=(row: TemplateData, selecteField: any)=>{
        switch(row.fieldTypeId){
            case InputType.TEXT:
            case InputType.LONGTEXT:
            case InputType.COMMENTS:{
               return <TextFieldsIcon 
               className={row == selecteField &&
                row.elementId == selecteField?.elementId?"fieldsContainer__existing__item__header__label__icon__active":
                    "fieldsContainer__existing__item__header__label__icon"}/>
            }
           case InputType.DATEPICKER:{
               return <CalendarTodayIcon 
               className={row == selecteField &&
                row.elementId == selecteField?.elementId?"fieldsContainer__existing__item__header__label__icon__active":
                    "fieldsContainer__existing__item__header__label__icon"}/>
           }
           case InputType.DATETIMEPICKER:{
            return <CalendarTodayIcon 
                className={row == selecteField &&
                row.elementId == selecteField?.elementId?"fieldsContainer__existing__item__header__label__icon__active":
                    "fieldsContainer__existing__item__header__label__icon"}/>
           }
           case InputType.TIMEPICKER:{
               return <QueryBuilderIcon 
               className={row == selecteField &&
                row.elementId == selecteField?.elementId?"fieldsContainer__existing__item__header__label__icon__active":
                    "fieldsContainer__existing__item__header__label__icon"}/>
           }
           case InputType.ATTACHMENT:{
               return <AttachFileIcon 
               className={row == selecteField &&
                row.elementId == selecteField?.elementId?"fieldsContainer__existing__item__header__label__icon__active":
                    "fieldsContainer__existing__item__header__label__icon"}/>
           }
           case InputType.INTEGER:{
               return <DialpadIcon className="fieldsContainer__existing__item__header__label__icon"/>
           }
           case InputType.COMMENTS:{
               return <ChatBubbleOutlineIcon 
               className={row == selecteField &&
                row.elementId == selecteField?.elementId?"fieldsContainer__existing__item__header__label__icon__active":
                    "fieldsContainer__existing__item__header__label__icon"}/>
           }
           case InputType.CUSTOMDROPDOWN:
           case InputType.CUSTOMNESTEDDROPDOWN:{
            return <FormatListNumberedRtlIcon 
                className={row == selecteField &&
                row.elementId == selecteField?.elementId?"fieldsContainer__existing__item__header__label__icon__active":
                    "fieldsContainer__existing__item__header__label__icon"}/>
           }
           case InputType.SINGLEVALUEUSER:{
            return <PeopleAltIcon 
                className={row == selecteField &&
                row.elementId == selecteField?.elementId?"fieldsContainer__existing__item__header__label__icon__active":
                    "fieldsContainer__existing__item__header__label__icon"}/>
           }
           case InputType.SINGLEVALUECOMPANY:{
            return <BusinessIcon 
                className={row == selecteField &&
                row.elementId == selecteField?.elementId?"fieldsContainer__existing__item__header__label__icon__active":
                    "fieldsContainer__existing__item__header__label__icon"}/>
           }
           case InputType.MULTIVALUEUSER:
           case InputType.MULTIVALUECOMPANY:{
               return <ViewListIcon 
                className={row == selecteField &&
                row.elementId == selecteField?.elementId?"fieldsContainer__existing__item__header__label__icon__active":
                    "fieldsContainer__existing__item__header__label__icon"}/>
           }
           case InputType.BOOLEAN:{
               return <ToggleOnIcon 
               className={row == selecteField &&
                row.elementId == selecteField?.elementId?"fieldsContainer__existing__item__header__label__icon__active":
                    "fieldsContainer__existing__item__header__label__icon"}/>
           }
           case InputType.TABLE:{
            return <TableChartIcon 
            className={row == selecteField &&
                row.elementId == selecteField?.elementId?"fieldsContainer__existing__item__header__label__icon__active":
                    "fieldsContainer__existing__item__header__label__icon"}/>
           }
           case InputType.LOCATION:{
               return <LocationOnIcon
               className={row == selecteField &&
                row.elementId == selecteField?.elementId?"fieldsContainer__existing__item__header__label__icon__active":
                    "fieldsContainer__existing__item__header__label__icon"}/>
           }
           case InputType.LOCATIONTREE:{
            return <AccountTreeIcon 
            className={row == selecteField &&
                row.elementId == selecteField?.elementId?"fieldsContainer__existing__item__header__label__icon__active":
                    "fieldsContainer__existing__item__header__label__icon"}/>
           }
        }
    }