import React, { ReactElement, useCallback, useContext, useEffect, useState } from 'react';
import './DrawingVersionInfo.scss';
import InfoIcon from '@material-ui/icons/Info';
import WarningIcon from '@material-ui/icons/Warning';
import { Controller, useForm } from 'react-hook-form';
import InputLabel from '@material-ui/core/InputLabel';
import TextField from '@material-ui/core/TextField';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { DatePicker } from '@material-ui/pickers';
import IconButton from '@material-ui/core/IconButton';
import InsertInvitationIcon from '@material-ui/icons/InsertInvitation';
import { DrawingLibDetailsContext } from '../../context/DrawingLibDetailsContext';
import { setCategoryTabStatus, setDrawingVersionDetails,
        setIsAutoUpdate, setSheetsTabStatus, setVersionDateValidate, setVersionNameValidate } from '../../context/DrawingLibDetailsAction';
import moment from 'moment';
import { templateFormatId } from 'src/modules/drawings/utils/drawingsConstant';
import GlobalDatePicker from '../../../../shared/components/GlobalDatePicker/GlobalDatePicker';

const defaultValues: any ={
    Set_Title: '',
    Set_Version_Name: '',
    Version_Date: '',
};

export default function DrawingVersionInfo(props: any): ReactElement {

    const [dateOpen, setDateOpen] = useState(false);
    const {DrawingLibDetailsState, DrawingLibDetailsDispatch}: any = useContext(DrawingLibDetailsContext);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [versionTitleValue, setversionTitleValue] = useState('');
    const [versonFieldLists, setVersonFieldLists] = useState<Array<any>>([]);
    const [currentVersionName, setCurrentVersionName] = useState<string>("");
    const [ currentVersionDate , setCurrentVersionDate] = useState<any>("")
    const {
        control,
        setValue,
        setError,
        clearErrors,
        getValues,
        formState: { errors }
      } = useForm<any>({
        defaultValues
    });
    useEffect(() => {
        if(props?.versonFieldLists?.length > 0){
            setVersonFieldLists(props?.versonFieldLists);
        }
    }, [props?.versonFieldLists])

    useEffect(() => {
        if(DrawingLibDetailsState?.drawingVersionDetails){
            setInitialValue();
        } else{
            setValue('Version_Date',  DrawingLibDetailsState?.drawingVersionDetails?.Version_Date|| null, { shouldValidate: false });
        }
    }, [DrawingLibDetailsState?.drawingVersionDetails]);

    useEffect(() => {
        if(DrawingLibDetailsState?.publishedDrawingLists.length > 0 && DrawingLibDetailsState?.drawingLibDetails?.length > 0){
                validateVersionInfo()
        }
    }, [DrawingLibDetailsState?.publishedDrawingLists, DrawingLibDetailsState?.drawingLibDetails,currentVersionName,currentVersionDate])

    useEffect(() => {
        if( DrawingLibDetailsState?.drawingVersionDetails?.Version_Date){
            handleDrawingVersionTime(DrawingLibDetailsState?.drawingVersionDetails?.Version_Date)
        }
    }, []);

    const setInitialValue = () => {
        const momentDate =  DrawingLibDetailsState?.drawingVersionDetails?.Version_Date ? 
                           moment(DrawingLibDetailsState?.drawingVersionDetails?.Version_Date).format('DD-MMM-YYYY') : '';
        const resDate = momentDate && momentDate !== 'Invalid date' ? momentDate : '';
        setversionTitleValue(DrawingLibDetailsState?.drawingVersionDetails?.Set_Title || '');
        setCurrentVersionName(DrawingLibDetailsState?.drawingVersionDetails?.Set_Version_Name||'');
        setCurrentVersionDate(resDate);
        setValue('Set_Title',  DrawingLibDetailsState?.drawingVersionDetails?.Set_Title || '', { shouldValidate: false });
        setValue('Set_Version_Name',  DrawingLibDetailsState?.drawingVersionDetails?.Set_Version_Name || '', { shouldValidate: false });
        setValue('Version_Date',  resDate || null, { shouldValidate: false });
        updateTabStatus();
    }

    const handleDrawingVersionTitle = (e: any) => {
        setversionTitleValue(e.target.value ? e.target.value?.trim() : '')
    }

    const updateDrawingVersionTitle = (e: any) => {
        const newValue ={ ...DrawingLibDetailsState?.drawingVersionDetails, Set_Title: e.target.value.trim() }
        DrawingLibDetailsDispatch(setDrawingVersionDetails(newValue));
        DrawingLibDetailsDispatch(setIsAutoUpdate(true));
    }

    const handleDrawingVersionName = (e: any) => {
        const versionName = (e.target.value)?.toLowerCase()
        setCurrentVersionName(e.target.value && e.target.value?.trim())
        validateVersionInfo();
    }

    const updateDrawingVersionName = (e: any) => {
        const newValue ={ ...DrawingLibDetailsState?.drawingVersionDetails, Set_Version_Name:  e.target.value.trim() }
        DrawingLibDetailsDispatch(setDrawingVersionDetails(newValue));
        DrawingLibDetailsDispatch(setIsAutoUpdate(true));
    }

    const handleDrawingVersionTime = (e: any) => {
        const momentDate = e ? moment(e).format('DD-MMM-YYYY') : '';
        setCurrentVersionDate(momentDate)
        const newValue ={ ...DrawingLibDetailsState?.drawingVersionDetails, Version_Date: momentDate}
        DrawingLibDetailsDispatch(setDrawingVersionDetails(newValue));
        DrawingLibDetailsDispatch(setIsAutoUpdate(true));
        validateVersionInfo()
    }
    
    const updateTabStatus = () => {
        // based on template format, validate the field
        if(props?.templateId === templateFormatId.US_CANADA){
            if(!DrawingLibDetailsState?.drawingVersionDetails?.Set_Version_Name || !DrawingLibDetailsState?.drawingVersionDetails?.Set_Title ||
                !DrawingLibDetailsState?.drawingVersionDetails?.Version_Date){
                    DrawingLibDetailsDispatch(setCategoryTabStatus(true))
                    DrawingLibDetailsDispatch(setSheetsTabStatus(true))
            }else{
                DrawingLibDetailsDispatch(setCategoryTabStatus(false))
            }
        }else{
            if(!DrawingLibDetailsState?.drawingVersionDetails?.Set_Version_Name || !DrawingLibDetailsState?.drawingVersionDetails?.Version_Date){
                    DrawingLibDetailsDispatch(setCategoryTabStatus(true))
                    DrawingLibDetailsDispatch(setSheetsTabStatus(true))
            }else{
                DrawingLibDetailsDispatch(setCategoryTabStatus(false))
            }
        }
    }

    // validate unique version name and version date
    // const validateVersionInfo = () => {
    //     const publishedDrawingArray = DrawingLibDetailsState?.publishedDrawingLists;
    //     if(publishedDrawingArray?.length > 0 && DrawingLibDetailsState?.drawingVersionDetails){
    //         publishedDrawingArray.forEach((drwg: any) => {
    //             if(drwg.Set_Title === DrawingLibDetailsState?.drawingVersionDetails?.Set_Title && 
    //                 drwg.Set_Version_Name === DrawingLibDetailsState?.drawingVersionDetails?.Set_Version_Name &&
    //                 drwg.Version_Date === DrawingLibDetailsState?.drawingVersionDetails?.Version_Date){
    //                     // console.log(publishedDrawingArray, DrawingLibDetailsState?.drawingVersionDetails)
    //             }
    //         });
    //     }
    // }

    const validateVersionInfo = ():void=>{
        const publishedDrawingArray = DrawingLibDetailsState?.publishedDrawingLists;
        const  duplicateVersionInfo = publishedDrawingArray.filter((drawing:any,index:number)=> drawing?.Set_Version_Name?.toLowerCase() == currentVersionName?.toLowerCase() && drawing?.Version_Date==currentVersionDate);
        if(duplicateVersionInfo?.length>0){
            DrawingLibDetailsDispatch(setVersionNameValidate(true));
            setError("Set_Version_Name", {
                type: "unique"
            })
            DrawingLibDetailsDispatch(setVersionDateValidate(true));
            setError("Version_Date", {
                type: "unique"
            })
        }else{
            DrawingLibDetailsDispatch(setVersionNameValidate(false));
            DrawingLibDetailsDispatch(setVersionDateValidate(false));
            clearErrors("Set_Version_Name");
            clearErrors("Version_Date");
        }
    }

    const renderVersionFields = (fieldData: any) => {
        switch(fieldData.name){
            case 'Set_Title': 
                return(
                    <div className="versionIfo__details__form__field">
                        <InputLabel required={fieldData.isMandatory}>{fieldData.label} </InputLabel>
                        <div className="versionIfo__details__form__field__input-field">
                            <Controller 
                                render={({ field }:{field:any}) => (
                                    <TextField
                                        type="text"
                                        {...field}
                                        fullWidth
                                        autoComplete="search"
                                        placeholder='Enter title'
                                        variant='outlined'
                                        onChange={(e) => {field.onChange(e), handleDrawingVersionTitle(e)}}
                                        onBlur={(e) => {field.onChange(e), updateDrawingVersionTitle(e)}}
                                    />                      
                                )}
                                name="Set_Title"
                                control={control}
                                rules={{
                                    required: true
                                    // validate: isUniqueProjectName
                                }}
                            />
                            <div className="versionIfo__details__form__field__error-wrap">
                                    <p className="versionIfo__details__form__field__error-wrap__message">
                                        {
                                            errors.Set_Title?.type === "required" ? (
                                                <span>Set title required</span>
                                            ) : (
                                                errors.Set_Title?.type === "unique" && (
                                                    <span>Set title already exists</span>
                                                )
                                            )
                                        }
                                    </p>
                            </div>
                        </div>
                    </div>
                );

            case 'Set_Version_Name': 
                return (
                    <div className="versionIfo__details__form__field">
                        <InputLabel required={fieldData.isMandatory}>{fieldData.label} </InputLabel>
                        <div className="versionIfo__details__form__field__input-field">
                            <Controller 
                                render={({ field }:{field:any}) => (
                                    <TextField
                                        type="text"
                                        {...field}
                                        fullWidth
                                        autoComplete="search"
                                        placeholder='Enter version name'
                                        variant='outlined'
                                        onChange={(e) => {field.onChange(e), handleDrawingVersionName(e)}}
                                        onBlur={(e) => {field.onChange(e), updateDrawingVersionName(e)}}
                                    />                      
                                )}
                                name="Set_Version_Name"
                                control={control}
                                rules={{
                                    required: true
                                    // validate: isUniqueProjectName
                                }}
                            />
                            <div className="versionIfo__details__form__field__error-wrap">
                                    <p className="versionIfo__details__form__field__error-wrap__message">
                                        {
                                            errors.Set_Version_Name?.type === "required" ? (
                                                <span>Set version name required</span>
                                            ) : (
                                                DrawingLibDetailsState.isInvalidVersionDate &&
                                                DrawingLibDetailsState.isInvalidVersionName &&
                                                errors.Set_Version_Name?.type === "unique" && (
                                                    <span>Set version name already exists</span>
                                                )
                                            )
                                        }
                                    </p>
                            </div>
                        </div>
                    </div>
                );

            default: return '';
        } 
      };

    return (
        <div className="versionIfo">
            <div className="versionIfo__note">
                <div className="versionIfo__note__logo">
                    <InfoIcon />
                </div>
                <div className="versionIfo__note__text">
                    <span>Note :</span> This information is used to identify the uploaded drawing set as a unique version.
                </div>
            </div>
            {
                (DrawingLibDetailsState?.isInvalidVersionName &&
                DrawingLibDetailsState?.isInvalidVersionDate) && (

                    <div className="versionIfo__warning">
                        <div className="versionIfo__warning__logo">
                            <WarningIcon />
                        </div>
                        <div className="versionIfo__warning__text">
                            <span>Warning:</span> A drawing set has already been uploaded with this same Version Info.
                            We recommend that every drawing set has a unique Version Name and Version Date
                        </div>
                    </div>
                )
            }
            <div className="versionIfo__details"> 
                <form className="versionIfo__details__form">
                    {
                        versonFieldLists?.map((fieldData: any) => (
                            <div key={fieldData.drawingTemplateField.name}>
                                {
                                    fieldData?.drawingTemplateField.name !== 'Version_Date' ? (
                                        <>
                                            {renderVersionFields(fieldData?.drawingTemplateField)}
                                        </>
                                        
                                    ): (
                                        <div className="versionIfo__details__form__field">
                                            <InputLabel required={fieldData.drawingTemplateField.isMandatory}>
                                                {fieldData.drawingTemplateField.label} 
                                            </InputLabel>
                                            <div className="versionIfo__details__form__field__input-field">
                                                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                                    <Controller 
                                                        render={({ field }:{field:any}) => (
                                                            <div className="date-picker">
                                                                <GlobalDatePicker
                                                                    id='version-date'
                                                                    {...field}
                                                                    clearable={true}
                                                                    inputVariant={'outlined'}
                                                                    // variant="inline"
                                                                    fullWidth
                                                                    emptyLabel="DD-MMM-YYYY"
                                                                    format="dd-MMM-yyyy" 
                                                                    keyboardbuttonprops={{
                                                                    "aria-label": "change date"
                                                                    }}
                                                                    open={dateOpen}
                                                                    onClose={()=> setDateOpen(false)}
                                                                    {...field.rest}
                                                                    onChange={(e:any) => {field.onChange(e), handleDrawingVersionTime(e)}}
                                                                />  
                                                                <IconButton aria-label="delete" className="calendar-icon" 
                                                                            onClick={()=> setDateOpen(true)}>
                                                                    <InsertInvitationIcon />
                                                                </IconButton>
                                                            </div>                         
                                                        )}
                                                        name="Version_Date"
                                                        control={control}
                                                        rules={{
                                                            required: true
                                                            // validate: isUniqueProjectName
                                                        }}
                                                    />
                                                </MuiPickersUtilsProvider>
                                                <div className="versionIfo__details__form__field__error-wrap">
                                                        <p className="versionIfo__details__form__field__error-wrap__message">
                                                            {
                                                                errors.Version_Date?.type === "required" ? (
                                                                    <span>Version date required</span>
                                                                ) : (
                                                                    DrawingLibDetailsState.isInvalidVersionDate &&
                                                                    DrawingLibDetailsState.isInvalidVersionName &&
                                                                    errors.Version_Date?.type === "unique" && (
                                                                        <span>Version date already exists</span>
                                                                    )
                                                                )
                                                            }
                                                        </p>
                                                </div>
                                            </div>
                                        </div>
                                    )
                
                                }
                                
                            </div>
                            
                        ))
                    }
                
                </form>
            </div>
        </div>
    )
}