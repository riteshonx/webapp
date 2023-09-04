import React, { ReactElement, useContext, useEffect, useState } from 'react';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import Button from '@material-ui/core/Button';
import './EditDrawing.scss';
import InputLabel from '@material-ui/core/InputLabel';
import TextField from '@material-ui/core/TextField';
import { stateContext } from '../../../../root/context/authentication/authContext';
import { client } from '../../../../../services/graphql';
import { projectFeatureAllowedRoles } from '../../../../../utils/role';
import { FETCH_DRAWING_SHEET_NUMBER, UPDATE_DRAWING_SHEET } from '../../graphql/queries/drawingSheets';
import { useDebounce } from '../../../../../customhooks/useDebounce';
import { setIsLoading } from '../../../../root/context/authentication/action';
import Notification,{ AlertTypes } from '../../../../shared/components/Toaster/Toaster'
import { FETCH_CUSTOM_TEMPLATE_DETAILS } from '../../graphql/queries/customFormatTemplate';
import { defaultCategory, templateFormatId } from 'src/modules/drawings/utils/drawingsConstant';


export default function EditDrawing(props: any): ReactElement {

    const { state, dispatch }: any = useContext(stateContext);
    const [searchDrawingNumber, setSearchDrawingNumber] = useState('');
    const debounceDwgNum = useDebounce(searchDrawingNumber, 1000);
    const [uniqueDwgNum, setUniqueDwgNum] = useState(false);
    const [fieldDataList, setFieldDataList] = useState<Array<any>>([]);
    const [sheetData, setSheetData] = useState<any>({})
    const [requiredValidation, setRequiredValidation] = useState(false)

    useEffect(() => {
       if(props.selectedDrawing?.createdAt){
            setSearchDrawingNumber(props.selectedDrawing?.drawingNumber)
            const data = {
                drawing_number : props.selectedDrawing.drawingNumber,
                Drawing_Category : props.selectedDrawing.drawingCategory,
                Drawing_Name : props.selectedDrawing.drawingName,
                drawing_status : props.selectedDrawing.dwgStatus,
                drawing_revision : props.selectedDrawing.dwgRevision,
                drawing_role : props.selectedDrawing.dwgRole,
                drawing_project_number : props.selectedDrawing.dwgProjectNumber,
                drawing_originator : props.selectedDrawing.dwgOriginator,
                drawing_volume : props.selectedDrawing.dwgVolume,
                drawing_type : props.selectedDrawing.dwgType,
                rawing_classification : props.selectedDrawing.dwgClassification,
                drawing_suitability : props.selectedDrawing.dwgSuitability,
                drawing_sheet_number : props.selectedDrawing.dwgSheetNumber,
                drawing_level : props.selectedDrawing.dwgLevel,
                drawing_zone: props.selectedDrawing.dwgZone
            }
            setSheetData(data)
            validateRequiredField(data)
            fetchCustomTemplateDetails(props.selectedDrawing?.drawingTemplateFormatId)
       }
    }, [props.selectedDrawing]);

    useEffect(() => {
        if(searchDrawingNumber){
            fetchDrawingSheetNumber(searchDrawingNumber);
        }else{
            setSearchDrawingNumber('');
            setUniqueDwgNum(false);
        }
    }, [debounceDwgNum])


    const closeSideBar = () => {
        props.closeSideBar(false)
    }

    const fetchDrawingSheetNumber = async (drawingNum: string) => {
        try {
          const drawingLibraryResponse = await client.query({
            query: FETCH_DRAWING_SHEET_NUMBER,
            variables: {
                sourceId: props?.selectedDrawing?.sourceId,
                drawingNumber: drawingNum?.trim()
            },
            fetchPolicy: "network-only",
            context: {
              role: projectFeatureAllowedRoles.viewDrawings,
              token: state.selectedProjectToken,
            },
          });
          const drawingLibraries: any = [];
          if (drawingLibraryResponse?.data?.drawingSheets.length > 0) {
            drawingLibraryResponse?.data?.drawingSheets.forEach((item: any) => {
              drawingLibraries.push(item);
            });
          }
          if (drawingLibraries.length > 0 && drawingNum !== props.selectedDrawing?.drawingNumber) {
            setUniqueDwgNum(true);
          }else{
            setUniqueDwgNum(false);
          }
        } catch (error) {
          console.log(error);
            // Notification.sendNotification(error, AlertTypes.warn);
        }
    };

    const handleFieldChange = (e: any, fieldData: any) => {
        const data = {...sheetData};
        data[fieldData.name] = e?.target?.value
        setSheetData(data)
        if(fieldData.name === 'drawing_number'){
            setSearchDrawingNumber(e.target.value?.trim());
        }
        
    }

    const validateSheetData = () => {
        validateRequiredField(sheetData)
    }

    //fetch template details
    const fetchCustomTemplateDetails = async(drawingTemplateFormatId: any)=>{
        try{
            dispatch(setIsLoading(true));
            const customTempDetailsResponse = await client.query({
                query: FETCH_CUSTOM_TEMPLATE_DETAILS,
                variables:{
                    formatId: drawingTemplateFormatId,
                },
                fetchPolicy: 'network-only',
                context:{role: projectFeatureAllowedRoles.uploadDrawings, token: state.selectedProjectToken}
            });

            const drawingTemplateFieldData: any = [];


            if(customTempDetailsResponse?.data?.drawingTemFieldFormatAssociation?.length > 0){
                customTempDetailsResponse?.data?.drawingTemFieldFormatAssociation?.forEach((item: any) => {

                    const newItem= JSON.parse(JSON.stringify(item?.drawingTemplateField));

                    drawingTemplateFieldData.push(newItem);
                })
                const sheetFields = drawingTemplateFieldData?.filter((item: any) => item.groupType === "sheet_info");
                setFieldDataList([...sheetFields])
                validateRequiredField(sheetData)
            }
            dispatch(setIsLoading(false));
                
        }catch(error){
            console.log(error);
            Notification.sendNotification(error, AlertTypes.warn);
            dispatch(setIsLoading(false));
        }
    }

    const renderSheetInfoFields = (fieldData: any) => {
        switch(fieldData.name){
            case 'drawing_number': 
                return(
                    <>
                        {
                            props.selectedDrawing?.drawingTemplateFormatId !== templateFormatId.BS1192_UK && (
                                <div  className="updateDrawing__wrapper__form__body__container">
                                    <div className="updateDrawing__wrapper__form__body__label">
                                        <InputLabel 
                                        required={props.selectedDrawing?.drawingTemplateFormatId === templateFormatId.BS1192_UK ? false : 
                                        fieldData.isMandatory}>{fieldData.label}</InputLabel>
                                    </div>
                                    <div className="updateDrawing__wrapper__form__body__input-field">
                                        <TextField
                                            type="text"
                                            fullWidth
                                            placeholder={`Enter ${fieldData.label}`}
                                            // variant='outlined'
                                            value= {sheetData[fieldData.name]}
                                            onChange={(e) => handleFieldChange(e, fieldData)}
                                            onBlur={() => validateSheetData()}
                                        /> 
                                        <div className="updateDrawing__error-wrap">
                                            <p className="updateDrawing__error-wrap__message">
                                                {
                                                    !sheetData[fieldData.name] ? (
                                                        <span>Drawing number is required</span>
                                                    ) : (
                                                        uniqueDwgNum && (
                                                            <span>Drawing number already exists</span>
                                                        )
                                                    )
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )
                        }
                    </>
                );

            case 'Drawing_Category': 
                return(      
                    <>
                        {
                           props.selectedDrawing?.drawingTemplateFormatId === templateFormatId.US_CANADA && (
                            <div  className="updateDrawing__wrapper__form__body__container">
                                <div className="updateDrawing__wrapper__form__body__label">
                                    <InputLabel required={fieldData.isMandatory}>{fieldData.label}</InputLabel>
                                </div>
                                <div className="updateDrawing__wrapper__form__body__input-field">
                                    <TextField
                                        type="text"
                                        fullWidth
                                        placeholder={`Enter ${fieldData.label}`}
                                        // variant='outlined'
                                        value= {sheetData[fieldData.name]}
                                        onChange={(e) => handleFieldChange(e, fieldData)}
                                        onBlur={() => validateSheetData()}
                                        disabled={sheetData[fieldData.name] === 'NOT A DRAWING'}
                                    /> 
                                    <div className="updateDrawing__error-wrap">
                                        <p className="updateDrawing__error-wrap__message">
                                            {
                                                fieldData.isMandatory && !sheetData[fieldData.name] && (
                                                    <span>{fieldData.label} is required</span>
                                                ) 
                                            }    
                                        </p>
                                    </div>
                                </div>
                            </div>
                           )
                        }
                    </>
            );    
                    
            case 'Drawing_Name':
            case 'drawing_status': 
            case 'drawing_revision': 
            case 'drawing_role': 
            case 'drawing_project_number':
            case 'drawing_originator':
            case 'drawing_volume':
            case 'drawing_type':
            case'drawing_classification':
            case'drawing_suitability':
            case'drawing_sheet_number':
            case 'drawing_level':
            case 'drawing_zone':
  
                return(
                    <div  className="updateDrawing__wrapper__form__body__container">
                        <div className="updateDrawing__wrapper__form__body__label">
                        {
                            fieldData.name === 'Drawing_Name' ? (
                                <>
                                    <InputLabel required={(props.selectedDrawing?.drawingTemplateFormatId === templateFormatId.BS1192_UK || 
                                        props.selectedDrawing?.drawingTemplateFormatId === templateFormatId.US_CANADA) ? 
                                        fieldData.isMandatory : false}>
                                        {fieldData.label}
                                    </InputLabel> 
                                </>
                            ): (
                                <InputLabel required={fieldData.isMandatory}>{fieldData.label}</InputLabel>
                            )
                        }

                        </div>
                        <div className="updateDrawing__wrapper__form__body__input-field">
                            <TextField
                                type="text"
                                fullWidth
                                placeholder={`Enter ${fieldData.label}`}
                                // variant='outlined'
                                value= {sheetData[fieldData.name]}
                                onChange={(e) => handleFieldChange(e, fieldData)}
                                onBlur={() => validateSheetData()}
                            /> 
                            {
                                fieldData.name === 'Drawing_Name' ? (
                                    <>
                                         <div className="updateDrawing__error-wrap">
                                            <p className="updateDrawing__error-wrap__message">
                                                {
                                                    (props.selectedDrawing?.drawingTemplateFormatId === templateFormatId.BS1192_UK || 
                                                    props.selectedDrawing?.drawingTemplateFormatId === templateFormatId.US_CANADA) && 
                                                    fieldData.isMandatory && !sheetData[fieldData.name] && (
                                                        <span>{fieldData.label} is required</span>
                                                    ) 
                                                }    
                                            </p>
                                        </div>
                                    </>
                                ): (
                                    <div className="updateDrawing__error-wrap">
                                        <p className="updateDrawing__error-wrap__message">
                                            {
                                                fieldData.isMandatory && !sheetData[fieldData.name] && (
                                                    <span>{fieldData.label} is required</span>
                                                ) 
                                            }    
                                        </p>
                                    </div>
                                )
                            }
                        </div>
                    </div>
                );

               
            default: return '';
        } 
    };

    const validateRequiredField = (sheetDetails?: any) => {
        const data = {...sheetDetails}
        const requiredFields = fieldDataList.filter((field: any) => field.isMandatory)
        const findInvalid = requiredFields.find((item) => !data[item.name]);
        findInvalid ? setRequiredValidation(true) : setRequiredValidation(false)
    }

    const updateSheetDataInfo= async ()=>{
        try{
            dispatch(setIsLoading(true));
            const updateDrawingResponse: any = await client.mutate({
                mutation: UPDATE_DRAWING_SHEET,
                variables:{
                    id: props.selectedDrawing?.id,
                    drawingName: sheetData.Drawing_Name,
                    drawingNumber: sheetData.drawing_number,
                    dwgClassification: sheetData.drawing_classification || '',
                    dwgLevel: sheetData.drawing_level || '',
                    dwgOriginator: sheetData.drawing_originator || '',
                    dwgProjectNumber: sheetData.drawing_project_number || '',
                    dwgRevision: sheetData.drawing_revision || '',
                    dwgRole: sheetData.drawing_role || '',
                    dwgSheetNumber: sheetData.drawing_sheet_number || '',
                    dwgStatus: sheetData.drawing_status || '',
                    dwgSuitability: sheetData.drawing_suitability || '',
                    dwgType: sheetData.drawing_type || '',
                    dwgVolume: sheetData.drawing_volume || '',
                    drawingCategory: sheetData.Drawing_Category || '',
                    dwgZone: sheetData.drawing_zone || ''
                },
                context:{role: projectFeatureAllowedRoles.createDrawings, token: state.selectedProjectToken}
            })
            if(updateDrawingResponse.data.update_drawingSheets.affected_rows > 0){
                Notification.sendNotification("Updated successfully", AlertTypes.success);
                props.refreshList()
                closeSideBar();
            }
            dispatch(setIsLoading(false));
        }catch(err: any){
            dispatch(setIsLoading(false));
            Notification.sendNotification(err, AlertTypes.warn);
            console.log(err)
        }
    }

    
    const handleNotDrawingBtn = (isNotADrawing: boolean) => {
        const sheetInfo = {...sheetData}
        if(isNotADrawing){
            sheetInfo.Drawing_Category = 'NOT A DRAWING'
        }else{
            if(sheetInfo.Drawing_Category === 'NOT A DRAWING')
            sheetInfo.Drawing_Category = ''
        }

        setSheetData(sheetInfo)
    }
    

    return (
        <div className="updateDrawing">
            <div className="updateDrawing__wrapper">
                <div className="updateDrawing__wrapper__drawing-image">
                    <img className="img-responsive" src={props?.selectedDrawing?.thumbnailPath} alt="drawing thumbnail" /> 
                    <span className="closeIcon">
                        <HighlightOffIcon className="closeIcon-svg" data-testid={'close-sideBar'} onClick={closeSideBar}/>
                    </span>
                </div>
                <form className="updateDrawing__wrapper__form">
                    <div className="updateDrawing__wrapper__form__body">
                        {
                            fieldDataList?.map((fieldData: any) => (
                                <div key={fieldData?.name}>
                                    {renderSheetInfoFields(fieldData)}
                                </div>
                            ))
                        }                 
                    </div>
                    <div 
                         className={props.selectedDrawing?.drawingTemplateFormatId !== templateFormatId.US_CANADA ?
                                    'updateDrawing__wrapper__form__actionBtn' : 'updateDrawing__wrapper__form__actionBtn1'}>
                        {
                            props.selectedDrawing?.drawingTemplateFormatId !== templateFormatId.US_CANADA && (
                                <div className="updateDrawing__wrapper__form__actionBtn__text">
                                    {sheetData.Drawing_Category}
                                </div>
                            )
                        }
                        {
                            sheetData.Drawing_Category === defaultCategory.NOT_A_DRAWING ? (
                                <Button 
                                    data-testid={'submit-version-review'} 
                                    variant="outlined"
                                    className="btn-primary"
                                    onClick={() => handleNotDrawingBtn(false)}
                                >
                                        This is a drawing 
                                </Button>
                            ) : (
                                <Button 
                                    data-testid={'submit-version-review'} 
                                    variant="outlined"
                                    className="btn-primary"
                                    onClick={() => handleNotDrawingBtn(true)}
                                >
                                    This is not a drawing 
                                </Button>
                            )
                        }
                    </div>
                    <div className="updateDrawing__wrapper__form__action">
                        <Button data-testid={'cancel-create'} variant="outlined" onClick={closeSideBar}>
                            Cancel
                        </Button>
                        {
                            state?.projectFeaturePermissons?.canupdateDrawings && (
                                <Button 
                                    data-testid={'update-drawing'} 
                                    variant="outlined"
                                    className="drawing-primary"
                                    onClick={updateSheetDataInfo}
                                    disabled={uniqueDwgNum || requiredValidation}
                                >
                                    Update 
                                </Button>
                            )
                        }
                    </div>
                </form>
            </div>

        </div>  
    )
}

