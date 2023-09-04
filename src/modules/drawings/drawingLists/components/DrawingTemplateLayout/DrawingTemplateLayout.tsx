
import React, { ReactElement, useContext, useEffect, useState } from 'react';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import { CustomPopOver } from 'src/modules/shared/utils/CustomPopOver';
import './DrawingTemplateLayout.scss';
import { DrawingLibDetailsContext } from '../../context/DrawingLibDetailsContext';
import { setDrawingPageNumber, setLocalSplittedNumber } from '../../context/DrawingLibDetailsAction';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import Tooltip from '@material-ui/core/Tooltip';
import InfoIcon from '@material-ui/icons/Info';
import RemoveCircleOutlineOutlinedIcon from '@material-ui/icons/RemoveCircleOutlineOutlined';

const formatField = [
    {
        name: 'None',
        field: ''
    },
    {
        name: 'Project Number',
        field: 'dwgProjectNumber'
    },
    {
        name: 'Originator',
        field: 'dwgOriginator'
    },
    {
        name: 'Volume / System',
        field: 'dwgVolume'
    },
    {
        name: 'Level / Location',
        field: 'dwgLevel'
    },
    {
        name: 'Type',
        field: 'dwgType'
    },
    {
        name: 'Role',
        field: 'dwgRole'
    },
    {
        name: 'Classification',
        field: 'dwgClassification'
    },
    {
        name: 'Sheet Number',
        field: 'dwgSheetNumber'
    },
    {
        name: 'Suitability',
        field: 'dwgSuitability'
    },
    {
        name: 'Revision',
        field: 'dwgRevision'
    },
    {
        name: 'Status',
        field: 'dwgStatus'
    },
    {
        name: 'Zone',
        field: 'dwgZone'
    },
]

export default function DrawingTemplateLayout(props: any): ReactElement {

    const [drawingNumberFormat, setDrawingNumberFormat] = useState('');
    const popOverclasses = CustomPopOver();
    const [drawingNumberLists, setdrawingNumberLists] = useState<Array<any>>([]);
    const [drawingNumberFiledLists, setDrawingNumberFiledLists] = useState<Array<any>>([]);
    const {DrawingLibDetailsState, DrawingLibDetailsDispatch}: any = useContext(DrawingLibDetailsContext);
    const [selectedDrawingNumber, setSelectedDrawingNumber] = useState('');

    useEffect(() => {
        return () => {
            setdrawingNumberLists([]);
        }
    }, [])
    
    useEffect(() => {
        if(props?.drawingNumberList?.length > 0){
            setdrawingNumberLists(props?.drawingNumberList);
        }
    }, [props?.drawingNumberList]);

    useEffect(() => {
        if(DrawingLibDetailsState?.localSplittedNumber){
            setDrawingNumberFormat(DrawingLibDetailsState?.localSplittedNumber.dwgNumberSelected)
            setSelectedDrawingNumber(DrawingLibDetailsState?.localSplittedNumber.dwgNumberSelected)
            if(DrawingLibDetailsState?.localSplittedNumber?.dwgNumberSplitted?.length > 0){
                // console.log(DrawingLibDetailsState?.localSplittedNumber)
                // setDrawingNumberFiledLists(DrawingLibDetailsState?.localSplittedNumber?.dwgNumberSplitted);
                validateField(DrawingLibDetailsState?.localSplittedNumber?.dwgNumberSplitted);
            }
        }
    }, [DrawingLibDetailsState?.localSplittedNumber])


    const handleTemplateSelect = (e: any) => {
        const value = e?.target?.value
        const data = [...drawingNumberLists]
        const pageItem = data.filter((item: any) => item.dwgnum === value)
        DrawingLibDetailsDispatch(setDrawingPageNumber(pageItem[0]?.drawingSequence));
        splitDrawingField(value);
    }

    const handleFieldSelected = (e: any, index: number) => {
        updateFieldType(e?.target?.value, index);
        // const data: any = {...DrawingLibDetailsState?.localSplittedNumber}
        // data.dwgNumberSplitted[index].field = e?.target?.value;
        // DrawingLibDetailsDispatch(setLocalSplittedNumber(data));
    }

    const splitDrawingField = (drawingFormat: string) => {
        const data: any = {...DrawingLibDetailsState?.localSplittedNumber}
        data.dwgNumberSelected = drawingFormat;
        data.dwgNumberSplitted = drawingFormat?.split(props?.splitKey)?.map((item): any => (
            {name: item, field: ''}
        ))
        data.splitKey = props?.splitKey
        DrawingLibDetailsDispatch(setLocalSplittedNumber(data));
    }

    const validateField = (fieldList: any) => {
        fieldList?.forEach((item: any) => {
            const count = fieldList?.filter((ele: any) => ele.field === item.field);
            if(item.field){
                item.isValid = count.length > 1 ? true : false;
            }else{
                item.isValid =false
            }
        })
        setDrawingNumberFiledLists([...fieldList]);
    }

    const clearField = (field: any, index: number) => {
        updateFieldType('', index);
    }

    const updateFieldType = (field: any, index: number) => {
        const value = field ? field : ''
        const data: any = {...DrawingLibDetailsState?.localSplittedNumber}
        data.dwgNumberSplitted[index].field = value;
        DrawingLibDetailsDispatch(setLocalSplittedNumber(data));
    }

    // render JSX
    const renderLayoutContent = () : ReactElement=> {
        return (
            <div className='layout__option__fields'>
                {
                    drawingNumberFiledLists?.map((field: any, index: number) => (   
                        <div key={`${field.name}-${index}`} className='layout__option__fields__field'>
                            <div className='layout__option__fields__text'>
                                {field.name}
                            </div>
                            <div className='layout__option__fields__divider'> {`<=>`} </div>
                            <div className='layout__option__fields__selectBox'>
                                <Select
                                    className="layout__option__fields__selectBox__selectFieldType"
                                    id='custom-template'
                                    fullWidth
                                    autoComplete="search"
                                    variant="outlined"
                                    placeholder="select a value"
                                    value={field?.field}
                                    defaultValue=""
                                    onChange={(e: any) => handleFieldSelected(e, index)}
                                    MenuProps={{ classes: { paper: popOverclasses.root },
                                    anchorOrigin: {
                                        vertical: "bottom",
                                        horizontal: "left"
                                        },
                                        transformOrigin: {
                                        vertical: "top",
                                        horizontal: "left"
                                        },
                                    getContentAnchorEl: null }}
                                >
                                    {
                                        formatField?.map((item: any) => (
                                            <MenuItem key={item.field} value={item.field}>
                                                {item.name}
                                            </MenuItem>
                                        ))
                                    }
                                </Select>
                                {
                                    field.isValid && (
                                        <div className='layout__option__fields__selectBox__error' >
                                            This field is already selected.
                                        </div> 
                                    )
                                }

                                <RemoveCircleOutlineOutlinedIcon className='layout__option__fields__selectBox__icon' 
                                onClick={() => clearField(field, index)}/>

                            </div>
                        </div>

                    ))
                }
            </div>
        )
    }

    return (
        <div className='layout'>
            {/* <div className="layout__note">
                <div className="layout__note__logo">
                    <InfoIcon />
                </div>
                <div className="layout__note__text">
                    <span>Note :</span> Lorem impsum dummy text Lorem impsum dummy text Lorem impsum dummy text Lorem impsum dummy text.
                </div>
            </div> */}
            <div className='layout__select'>
                <div className='layout__select__text'>
                    Select a drawing number
                </div>
                <Select
                    className="layout__select__selectNumber"
                    id='custom-template'
                    fullWidth
                    autoComplete="search"
                    variant="outlined"
                    placeholder="select a value"
                    value={drawingNumberFormat}
                    defaultValue=""
                    onChange={(e: any) => handleTemplateSelect(e)}
                    MenuProps={{ classes: { paper: popOverclasses.root },
                    anchorOrigin: {
                        vertical: "bottom",
                        horizontal: "left"
                        },
                        transformOrigin: {
                        vertical: "top",
                        horizontal: "left"
                        },
                    getContentAnchorEl: null }}
                >
                    {
                        drawingNumberLists?.map((item: any, index: number) => (
                            <MenuItem key={`${item.dwgnum}-${index}`} value={item.dwgnum}>
                                <div className='layout__select__selectNumber__menuItem'>
                                    <div className='layout__select__selectNumber__menuItem__pageNum'>Page No - {item.drawingSequence}</div>
                                    <div className='layout__select__selectNumber__menuItem__dwgNum'>{item.dwgnum}</div>
                                </div>
                            </MenuItem>
                        ))
                    }
                </Select>
            </div>
            {
                selectedDrawingNumber && (
                    <div className='layout__option'>
                        <div className='layout__option__header'>
                            <div>
                            Split :
                            </div>
                            <div className='layout__option__header__number'>
                                {selectedDrawingNumber}
                                <Tooltip title={'Selected Drawing Number'} aria-label="delete category">
                                    <InfoOutlinedIcon className='layout__option__header__number__icon' />  
                                </Tooltip>
                            </div>
                        </div>
                        {renderLayoutContent()}
                    </div>
                )
            }
        </div>
    )
}
