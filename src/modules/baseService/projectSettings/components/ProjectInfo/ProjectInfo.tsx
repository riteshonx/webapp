import React, { ReactElement, useContext, useEffect, useState } from 'react';
import './ProjectInfo.scss';
import { useDebounce } from '../../../../../customhooks/useDebounce';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import InputLabel from '@material-ui/core/InputLabel';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { myProjectRole, tenantProjectRole } from '../../../../../utils/role';
import { client } from '../../../../../services/graphql';
import { UNIQUE_PROJECT_CODE, UNIQUE_PROJECT_NAME } from '../../../../../graphhql/queries/projects';
import { decodeExchangeToken } from '../../../../../services/authservice';
import { match, useRouteMatch } from 'react-router-dom';
import { projectDetailsContext } from '../../../projects/Context/ProjectDetailsContext';
import { setProjecDetailsDirty, setProjectInfo } from '../../../projects/Context/ProjectDetailsActions';
import { canUpdateProject } from '../../../roles/utils/permission';
import Select from '@material-ui/core/Select/Select';
import Input from '@material-ui/core/Input';
import ListItemText from '@material-ui/core/ListItemText';
import Checkbox from '@material-ui/core/Checkbox';
import { Grid, makeStyles, MenuItem } from '@material-ui/core';
import { CustomPopOver } from '../../../../shared/utils/CustomPopOver';
import { DatePicker } from '@material-ui/pickers';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import IconButton from '@material-ui/core/IconButton';
import InsertInvitationIcon from '@material-ui/icons/InsertInvitation';
import { Autocomplete } from '@material-ui/lab';
import { axiosApiInstance } from 'src/services/api';
import { fetchAddressComponents } from '../../utils/helper';
import MomentUtils from '@date-io/moment';
import moment from 'moment';
import 'moment-timezone';
import { Country, State, City }  from 'country-state-city';
import GlobalDatePicker from '../../../../shared/components/GlobalDatePicker/GlobalDatePicker';

moment.tz.setDefault("Europe/London"); // dynamic time-zone will come in future
export interface Info {
    ProjectAddress: string;
    ProjectCode: string;
    ProjectName: string;
    ProjectPortfolio:any;
    ProjectStartdate:string;
    ProjectEnddate:string;
    addressLine1: string;
    addressLine2: string,
    city: string;
    state: string;
    country: string;
    postalCode: string;
    streetno: string;
}

const defaultValues: Info ={
    ProjectName: '',
    ProjectAddress: '',
    ProjectCode: '',
    ProjectPortfolio:[],
    ProjectStartdate:'',
    ProjectEnddate:'',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    streetno: '',
};

export interface Params {
    projectId: string;
}

const useStyles = makeStyles(theme => ({
    datepicker: {
      fontSize:" 1.2rem",
    },
    datepicker_placeholder:{
        fontSize:" 1.2rem",
        "& .MuiInputBase-input": {
            color: "#b8b3b3 !important",
          }
    }
  }));

export default function ProjectInfo(props: any): ReactElement {
    const [projectNameValue, setProjectNameValue] = useState(''); 
    const debounceProjectName = useDebounce(projectNameValue, 700);
    const [projectCodeValue, setProjectCodeValue] = useState('');
    const debounceCodeName = useDebounce(projectCodeValue, 700);
    const [isUniqueProjectName, setisUniqueProjectName] = useState(false);
    const [isUniqueProjectCode, setisUniqueProjectCode] = useState(false);
    const [isDisableCreateBtn, setIsDisableCreateBtn] = useState(false);
    const pathMatch:match<Params>= useRouteMatch();
    const {projectDetailsState, projectDetailsDispatch}: any = useContext(projectDetailsContext);
    const [userPortfolio, setUserPortfolio] = useState<Array<any>>([]);
    const classes = CustomPopOver();
    const [startDateOpen, setStartDateOpen] = useState(false);
    const [endDateOpen, setEndDateOpen] = useState(false);
    const [startDate, setStartDate] = useState<any>(null);
    const [endDate, setEndDate] = useState<any>(null);
    const dateClasses = useStyles();

    const [placesList, setPlacesList] = useState<Array<any>>([]);
    const [placesSearchText, setPlacesSearchText] = useState(''); 
    const debouncePlacesSearchText = useDebounce(placesSearchText, 300);
    const [inputValue, setInputValue] = React.useState("");
    const [selectedPlace, setSelectedPlace] = useState<any>(null);
    const [Location, setLocation] = useState<any>(null);
    const [addressId, setAddressId] = useState(-1);
    const [fullAddress, setFullAddress] = useState('');
    const [addressRequired, setAddressRequired] = useState(false);
    const [stateList,setStateList] = React.useState<any>([]);
    const [countryList,setCountryList] = React.useState<any>(Country.getAllCountries());

    const {
        handleSubmit,
        control,
        getValues,
        setValue,
        setError,
        clearErrors,
        watch,
        formState: { errors }
      } = useForm<any>({
        defaultValues
    });

    const watchAllFields: any = watch();

    useEffect(() => {
       if(projectDetailsState?.projectDetails.length > 0){
            setFormValue(projectDetailsState?.projectDetails);
        }
    }, [projectDetailsState?.projectDetails])


    useEffect(() => {
        disableCreatebtn()
    }, [watchAllFields]);

    useEffect(() => {
        if(projectNameValue && canUpdateProject){
            uniqueProjectNameValidation();
        }else{
            clearErrors("ProjectName")
            setisUniqueProjectName(false)
        }
    }, [debounceProjectName]);

    useEffect(() => {
        if(projectCodeValue && canUpdateProject){
            uniqueProjectCodeValidation();
        }else{
            clearErrors("ProjectCode")
            setisUniqueProjectCode(false)
        }
    }, [debounceCodeName]);

    useEffect(() => {
        if(debouncePlacesSearchText.trim()){
         fetchPlacesByText();
        } else{
            setPlacesList([]);
        }
     }, [debouncePlacesSearchText]);

     useEffect(() => {
        if(selectedPlace){
            fetchCompleteAddressByPlaceId();
        }
     }, [selectedPlace])

     const fetchPlacesByText= async ()=>{
        try{
            const url=  `${process.env["REACT_APP_NOTIFICATION_URL"]}v1/places?text=${encodeURIComponent(debouncePlacesSearchText.trim())}`;
            const response= await axiosApiInstance.get(url,{
                headers: {
                  token: "exchange",
                },
              });
            if(response.data?.success){
               setPlacesList(JSON.parse(JSON.stringify(response.data.success)));
            } else{
                setPlacesList([]);
            }
        } catch(error: any){
            
        }
    }

    const fetchCompleteAddressByPlaceId=async ()=>{
        try{
            const url=  `${process.env["REACT_APP_NOTIFICATION_URL"]}v1/places/${selectedPlace.place_id}`;
            const response= await axiosApiInstance.get(url,{
                headers: {
                  token: "exchange",
                },
              });
            if(response.data?.success){
                const address= fetchAddressComponents(response.data.success.address_components);
                setValue('city',address.city);
                setValue('state',address.state);
                setValue('country',address.country);
                setValue('postalCode',address.pinCode);
                setValue('streetno',address.streetNo);
                setValue('countryShortCode',address.countryShortCode);
                setLocation({lat:response.data.success.geometry.location.lat,lng:response.data.success.geometry.location.lng})
                if(address?.countryShortCode){
                    const countryName = Country.getAllCountries().find((item:any)=>item.isoCode == address.countryShortCode);
                    const stateList = State.getStatesOfCountry(address.countryShortCode)
                    const stName = stateList && stateList.length && stateList.find((item:any)=>item.name.includes(address.state));
                    
                    setStateList(stateList && stateList.length?stateList:["No States"])
                    setValue('country',countryName?countryName.name:"");
                    setValue('state',stName ? stName.name:"");
                }
            } else{
                setPlacesList([]);
            }
        }catch(error: any){

        }
    }


    const onSubmit: SubmitHandler<any> = (value: any) => {
        if(value.ProjectStartdate && value.ProjectEnddate){
            if(new Date(value.ProjectEnddate) < new Date(value.ProjectStartdate)){
                setError("endDate", {
                    type: "invalid",
                    message: "* Invalid date range",
                })
                return;
            }else{
                clearErrors("endDate")           
            }
        }
        if(validateFormFieldsBeforeSave(value)>0){
            return;
        }
        const values={...getValues(),fullAddress: selectedPlace?.description||placesSearchText||'',location: Location};
        props.updateProject(values,addressId);
    }

    const validateFormFieldsBeforeSave=(argValue: any): number=>{
        let count=0;
        if(!argValue.ProjectName.trim()){
            setError("ProjectName", {type: "required"});
            count++;
        }
        if(!placesSearchText.trim()){
            setAddressRequired(true);
            count++;
        }
        if(!argValue.postalCode.trim()){
            setError("postalCode", {type: "required"});
            count++;
        }
        if(!argValue.country.trim()){
            setError("country", {type: "required"});
            count++;
        }
        return count;
    }

    const dispatchInfo = () => {
        const values: Info = getValues();
        const projectInfo: Info =  {
            ProjectAddress: values.ProjectAddress,
            ProjectCode: values.ProjectCode,
            ProjectName: values.ProjectName,
            ProjectPortfolio:values.ProjectPortfolio,
            ProjectStartdate:values.ProjectStartdate,
            ProjectEnddate:values.ProjectEnddate,
            addressLine1: values.addressLine1,
            addressLine2: values.addressLine2,
            streetno: values.streetno,
            city: values.city,
            state: values.state,
            country: values.country,
            postalCode: values.postalCode,
        }
        projectDetailsDispatch(setProjectInfo(projectInfo));
    }

    const handleProjectName = (e: any) => {
        projectDetailsDispatch(setProjecDetailsDirty(true));
        setProjectNameValue(e.target.value.trim());
        dispatchInfo();
    }

    const handleProjectCode = (e: any) => {
        projectDetailsDispatch(setProjecDetailsDirty(true));
        setProjectCodeValue(e.target.value.trim());
        dispatchInfo();
    }

    const handlePortfolioValue = (e: any) => {
        projectDetailsDispatch(setProjecDetailsDirty(true));
        setUserPortfolio(e.target.value);
        dispatchInfo();
    }

    
    const disableCreatebtn = () => {
        if(Object.keys(errors).length > 0 || addressRequired){
            setIsDisableCreateBtn(true)
        }else{
            setIsDisableCreateBtn(false)
        } 
    }

    const setFormValue = (value: any) => {
        const projects: Array<any>=[];
        setValue('ProjectName', value[0]?.name, { shouldValidate: true });
        setValue('ProjectAddress',
        `${value[0]?.address?.city}, ${value[0]?.address?.state}, ${value[0]?.address?.country}, ${value[0]?.address?.pin}`,
        { shouldValidate: true });
        setValue('ProjectCode', value[0]?.config?.projectCode, { shouldValidate: true });
        if(value[0]?.projectPortfolioAssociations && value[0]?.projectPortfolioAssociations.length){
            value[0]?.projectPortfolioAssociations.forEach((item:any)=>{
                projects.push(item?.portfolio?.name)
            })
        }
        setValue('ProjectPortfolio', projects, { shouldValidate: true });
        setValue('ProjectStartdate', value[0]?.startDate?
            value[0]?.startDate.toString():"", { shouldValidate: true });
        setValue('ProjectEnddate', value[0]?.endDate?
            value[0]?.endDate:"", { shouldValidate: true });
        if(value[0].addresses.length>0){
            const { addressLine1,
                addressLine2,
                streetNo,
                city,
                state,
                country,
                postalCode,
                fullAddress,
                id}= value[0].addresses[0];
            setValue('addressLine1',addressLine1);
            setValue('addressLine2',addressLine2);
            setValue('streetno',streetNo);
            setValue('city',city);
            setValue('country',country);
            setValue('state',state);
            setValue('postalCode',postalCode);
            setInputValue(fullAddress);
            setPlacesSearchText(fullAddress);
            setFullAddress(fullAddress);
            setAddressId(id);
            const contVal = Country.getAllCountries().find((item:any)=>item.name == country)
            if(contVal){
                const stateList = State.getStatesOfCountry(contVal.isoCode)
                setStateList(stateList && stateList.length?stateList:["No States"])
            }
            if(value[0]?.location){
                const cordinates= value[0]?.location.split(',');
                if(cordinates.length>1){
                    setLocation({lat: cordinates[0].replace('(',''),lng: cordinates[1].replace(')','')})
                }
            }
        }
    }

    const navigateback = () => {
        props.navBack();
    }

    const uniqueProjectNameValidation= async()=>{
        try{
            const role= decodeExchangeToken().allowedRoles.includes(tenantProjectRole.viewTenantProjects)?tenantProjectRole.viewTenantProjects:
                myProjectRole.viewMyProjects;
            const projectsResponse= await client.query({
                query: UNIQUE_PROJECT_NAME,
                variables:{
                    searchText: `${debounceProjectName}`,
                    userId: decodeExchangeToken().userId,
                },
                fetchPolicy: 'network-only',
                context:{role}
            });
            const projects: Array<any>=[];
            if(projectsResponse.data.project.length>0){
                projects.push(...projectsResponse.data.project);
            }

            if(projects.length > 0 && projects[0].id !==  Number(pathMatch?.params?.projectId)){
                setError("ProjectName", {
                    type: "unique",
                    message: "* Project name already exists",
                })
                setisUniqueProjectName(true)
            }else{
                clearErrors("ProjectName")
                setisUniqueProjectName(false)
            }
              

        }catch(error){
            console.log(error);
        }
    }

    const uniqueProjectCodeValidation= async()=>{
        try{
            const payload = {
                projectCode: `${debounceCodeName}`,
            }
            const role= tenantProjectRole.viewTenantProjects;
            const projectsResponse= await client.query({
                query: UNIQUE_PROJECT_CODE,
                variables:{
                    config: payload,
                    userId: decodeExchangeToken().userId,
                },
                fetchPolicy: 'network-only',
                context:{role}
            });
            const projects: Array<any>=[];
            if(projectsResponse.data.project.length>0){
                projects.push(...projectsResponse.data.project);
            }
            if(projects.length > 0 && projects[0].id !==  Number(pathMatch?.params?.projectId)){
                setError("ProjectCode", {
                    type: "unique",
                    message: "* Project code already exists",
                })
                setisUniqueProjectCode(true)
            }else{
                clearErrors("ProjectCode")
                setisUniqueProjectCode(false)
                
            }

        }catch(error){
            console.log(error);
        }
    }

    const getRenderValue=(argValue: Array<number>): any=>{
        const returnValue: Array<string>=[];
        const selectedValues= props.portfolioValue.filter((item: any)=> argValue.indexOf(item.name) >-1 );

        selectedValues.forEach((item: any)=>{
            returnValue.push(`${item?.name}`);
        })
        if (argValue.length === 0) {
            return <div className="projectSettingInfo__wrapper__form__body__label__text">Select Portfolio</div>;
        }

        return returnValue.join(',');
    }

    const handleProjectStartTime=(e:any)=>{
        clearErrors("endDate") 
        clearErrors("ProjectStartdate") 
        setStartDate(e);
        projectDetailsDispatch(setProjecDetailsDirty(true));
        dispatchInfo();
    }

    const handleProjectEndTime=(e:any)=>{
        clearErrors("endDate")
        clearErrors("ProjectEnddate")    
        setEndDate(e);
        projectDetailsDispatch(setProjecDetailsDirty(true));
        dispatchInfo();
    }

    const changeInOptionValue=(argValue: string)=>{
        setInputValue(argValue);
        const selectedPlaceValue= placesList.find((item: any)=>item.description === argValue);
        if(selectedPlaceValue){
            setSelectedPlace(selectedPlaceValue);
        } else{
            setSelectedPlace(null);
        }
    }

    const changeInSearchText=(newInputValue: string)=>{
        setPlacesSearchText(newInputValue);
        setAddressRequired(newInputValue.trim()?false:true);
    }

    const openEndDate=(event: any)=>{
        if(getValues("ProjectStartdate")){
            setEndDateOpen(true)
        }
    }

    const updateStateList = (argValue:any)=>{
        const contVal= Country.getAllCountries().find((item:any)=>item.name == argValue)
        if(contVal){
            const stateList = State.getStatesOfCountry(contVal.isoCode)
            setStateList(stateList && stateList.length?stateList:["No States"])
        }
    }

    const getRenderValueForState=(selected:any)=>{
        const val=stateList.find((item:any)=>{
          return item.name == selected
        })
        if (selected.length === 0 || !val) {
          return <div className="projectSettingInfo__wrapper__form__body__label__text">{(!canUpdateProject && !projectDetailsState?.projectUpdatePermission?.canUpdateMyProject)?"--":"Select State"}</div>;
        }
        return selected;
      }

    return (
            <div className="projectSettingInfo__wrapper">
                <div className="projectSettingInfo__wrapper__header">
                            Project Info
                </div>
                <form className="projectSettingInfo__wrapper__form" onSubmit={handleSubmit(onSubmit)}>
                    <div className="projectSettingInfo__wrapper__form__body">
                        <div className="projectSettingInfo__wrapper__form-wrapper">
                            
                            <Grid container className="projectSettingInfo__wrapper__form__body__container">
                                <Grid item xs={4} className="projectSettingInfo__wrapper__form__body__label">
                                    <InputLabel required={true}>Name </InputLabel>
                                </Grid>
                                <Grid item xs={8} className="projectSettingInfo__wrapper__form__body__input-field">
                                    <Controller 
                                        render={({ field }:{field:any}) => (
                                            <TextField
                                                disabled={projectDetailsState.disableUpdatePermission}
                                                type="text"
                                                {...field}
                                                fullWidth
                                                autoComplete='off'
                                                placeholder='Enter / Select Project'
                                                onChange={(e) => {field.onChange(e), handleProjectName(e)}}
                                            />                      
                                        )}
                                        name="ProjectName"
                                        control={control}
                                        rules={{
                                            required: true,
                                            // validate: isUniqueProjectName
                                        }}
                                    />
                                    <div className="projectSettingInfo__wrapper__error-wrap">
                                            <p className="projectSettingInfo__wrapper__error-wrap__message">
                                                {
                                                    errors.ProjectName?.type === "required" ? (
                                                        <span>Project name is required</span>
                                                    ) : (
                                                        errors.ProjectName?.type === "unique" && (
                                                            <span>* Project name already exists</span>
                                                        )
                                                    )
                                                }
                                            </p>
                                    </div>
                                </Grid>
                            </Grid>

                            <Grid container className="projectSettingInfo__wrapper__form__body__container">
                                <Grid item xs={4}className="projectSettingInfo__wrapper__form__body__label">
                                    <InputLabel required={true}>Address Line 1  </InputLabel>
                                </Grid>
                                <Grid item xs={8} className="projectSettingInfo__wrapper__form__body__input-field">
                                    <Autocomplete
                                        fullWidth
                                        freeSolo
                                        id="free-solo-2-demo"
                                        disableClearable
                                        value={inputValue}
                                        onChange={(event, newValue) => {
                                          changeInOptionValue(newValue);
                                        }}
                                       disabled={projectDetailsState.disableUpdatePermission}
                                        inputValue={placesSearchText}
                                        onInputChange={(event, newInputValue) => changeInSearchText(newInputValue)}
                                        options={placesList.map((option: any) => option.description)}
                                        renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            fullWidth
                                            label=""
                                            margin="normal"
                                            placeholder='Enter Address'
                                            InputProps={{ ...params.InputProps, type: 'search' }}
                                        />
                                        )}
                                    />
                                    <div className="projectSettingInfo__wrapper__error-wrap">
                                            <p className="projectSettingInfo__wrapper__error-wrap__addressmessage">
                                                {
                                                   addressRequired && (
                                                        <span>Address is required</span>
                                                    )
                                                }
                                            </p>
                                    </div>          
                                </Grid>
                            </Grid>

                            <Grid container className="projectSettingInfo__wrapper__form__body__container">
                                <Grid item xs={4} className="projectSettingInfo__wrapper__form__body__label">
                                    <InputLabel required={false}>Address Line 2</InputLabel>
                                </Grid>
                                <Grid item xs={8} className="projectSettingInfo__wrapper__form__body__input-field">
                                    <Controller
                                        render={({ field }:{field:any}) => (
                                            <TextField
                                                disabled={projectDetailsState.disableUpdatePermission}
                                                type="text"
                                                {...field}
                                                fullWidth
                                                autoComplete="search"
                                                placeholder={(!canUpdateProject && !projectDetailsState?.projectUpdatePermission?.canUpdateMyProject)?'--':'Enter Address Line 2'}
                                                onChange={(e) => field.onChange(e)}
                                            />                      
                                        )}
                                        name= "addressLine2"
                                        control={control}
                                        rules={{
                                            required: false
                                        }}
                                    />
                                </Grid>
                            </Grid>

                            <Grid container  className="projectSettingInfo__wrapper__form__body__container">
                                <Grid item xs={4} className="projectSettingInfo__wrapper__form__body__label">
                                    <InputLabel required={true}>Country </InputLabel>
                                </Grid>
                                <Grid item xs={8} className="projectSettingInfo__wrapper__form__body__input-field">
                                     <Controller 
                                            render={({ field }:{field:any}) => (
                                                <Select
                                                    id="custom-dropdown"
                                                    fullWidth
                                                    {...field}
                                                    autoComplete='off'
                                                    displayEmpty
                                                   disabled={projectDetailsState.disableUpdatePermission}
                                                    onChange={(e) => {field.onChange(e.target.value as string[]);
                                                        updateStateList(e.target.value)}}
                                                    renderValue={
                                                        field.value !== "" ? undefined : () => <div className="projectSettingInfo__wrapper__form__body__label__text">Select Country</div>
                                                    }
                                                    MenuProps={{ classes: { paper: classes.root },
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
                                                    countryList.length && countryList?.map((type: any) => (
                                                        <MenuItem className="mat-menu-item-sm"
                                                            key={type.flag} value={type.name}>{type.name}</MenuItem>
                                                    ))
                                                }
                                                </Select>
                                            )}
                                            name="country"
                                            control={control}
                                            rules={{
                                                required: true
                                            }}
                                        />
                                    <div className="projectSettingInfo__wrapper__error-wrap">
                                        <p className="projectSettingInfo__wrapper__error-wrap__message">
                                            {
                                                 errors.country?.type === "required" && (
                                                    <span>* Country is required</span>
                                                )
                                            }
                                        </p>
                                    </div>
                                </Grid>
                            </Grid>

                            <Grid container  className="projectSettingInfo__wrapper__form__body__container">
                                <Grid item xs={4} className="projectSettingInfo__wrapper__form__body__label">
                                    <InputLabel required={false}>State/Province </InputLabel>
                                </Grid>
                                <Grid item xs={8} className="projectSettingInfo__wrapper__form__body__input-field">
                                        <Controller 
                                            render={({ field }:{field:any}) => (
                                                <Select
                                                    id="custom-dropdown"
                                                    fullWidth
                                                    {...field}
                                                    autoComplete='off'
                                                    displayEmpty
                                                    disabled={projectDetailsState.disableUpdatePermission}
                                                    onChange={(e) => field.onChange(e.target.value as string[])}
                                                    renderValue={
                                                        (selected: any) => getRenderValueForState(selected)
                                                    }
                                                    MenuProps={{ classes: { paper: classes.root },
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
                                                stateList && stateList.length && stateList.map((type: any) => (
                                                    <MenuItem className="mat-menu-item-sm"
                                                         key={type.isoCode} value={type.name}>{type.name}</MenuItem>
                                                ))
                                            }
                                                </Select>
                                            )}
                                            name= "state"
                                            control={control}
                                            rules={{
                                                required: false
                                            }}
                                        />
                                    <div className="projectSettingInfo__wrapper__error-wrap">
                                        <p className="projectSettingInfo__wrapper__error-wrap__message">
                                            {
                                                 errors.state?.type === "required" && (
                                                    <span>* State is required</span>
                                                )
                                            }
                                        </p>
                                    </div>
                                </Grid>
                            </Grid>

                            <Grid container  className="projectSettingInfo__wrapper__form__body__container">
                                <Grid item xs={4} className="projectSettingInfo__wrapper__form__body__label">
                                    <InputLabel required={false}>City / Locality </InputLabel>
                                </Grid>
                                <Grid item xs={8} className="projectSettingInfo__wrapper__form__body__input-field">
                                    <Controller 
                                        render={({ field }:{field:any}) => (
                                            <TextField
                                                disabled={projectDetailsState.disableUpdatePermission}
                                                type="text"
                                                {...field}
                                                fullWidth
                                                autoComplete="search"
                                                placeholder={(!canUpdateProject && !projectDetailsState?.projectUpdatePermission?.canUpdateMyProject)?'--':'Enter City'}
                                                onChange={(e) => field.onChange(e)}
                                            />                      
                                        )}
                                        name= "city"
                                        control={control}
                                        rules={{
                                            required: false
                                        }}
                                    />
                                    <div className="projectSettingInfo__wrapper__error-wrap">
                                        <p className="projectSettingInfo__wrapper__error-wrap__message">
                                            {
                                                errors.city?.type ===  "required" && (
                                                    <span>* City is required</span>
                                                )
                                            }
                                        </p>
                                    </div>
                                </Grid>
                            </Grid>

                            <Grid container  className="projectSettingInfo__wrapper__form__body__container">
                                <Grid item xs={4} className="projectSettingInfo__wrapper__form__body__label">
                                    <InputLabel required={true}>Zip / Postcode </InputLabel>
                                </Grid>
                                <Grid item xs={8} className="projectSettingInfo__wrapper__form__body__input-field">
                                    <Controller 
                                        render={({ field }:{field:any}) => (
                                            <TextField
                                                disabled={projectDetailsState.disableUpdatePermission}
                                                type="text"
                                                {...field}
                                                fullWidth
                                                autoComplete='off'
                                                placeholder='Enter Zip / Postcode'
                                                onChange={(e) => field.onChange(e)}
                                            />                      
                                        )}
                                        name= "postalCode"
                                        control={control}
                                        rules={{
                                            required: true
                                        }}
                                    />
                                    <div className="projectSettingInfo__wrapper__error-wrap">
                                        <p className="projectSettingInfo__wrapper__error-wrap__message">
                                            {
                                                errors.postalCode?.type === "required" && (
                                                    <span>* Postcode is required</span>
                                                )
                                            }
                                        </p>
                                    </div>
                                </Grid>
                            </Grid>

                            <Grid container  className="projectSettingInfo__wrapper__form__body__container">
                                <Grid item xs={4} className="projectSettingInfo__wrapper__form__body__label">
                                    <InputLabel required={false}>Project Code </InputLabel>
                                </Grid>
                                <Grid item xs={8} className="projectSettingInfo__wrapper__form__body__input-field">
                                    <Controller 
                                        render={({ field }:{field:any}) => (
                                            <TextField
                                                disabled={projectDetailsState.disableUpdatePermission}
                                                type="text"
                                                {...field}
                                                fullWidth
                                                autoComplete='off'
                                                placeholder={(!canUpdateProject && !projectDetailsState?.projectUpdatePermission?.canUpdateMyProject)?'--':'Enter Project Code'}
                                                onChange={(e) => {field.onChange(e), handleProjectCode(e)}}
                                            />                      
                                        )}
                                        name= "ProjectCode"
                                        control={control}
                                        rules={{
                                            required: false
                                        }}
                                    />
                                    <div className="projectSettingInfo__wrapper__error-wrap">
                                        <p className="projectSettingInfo__wrapper__error-wrap__message">
                                            {
                                                errors.ProjectCode?.type === "unique" && (
                                                    <span>* Project code already exists</span>
                                                )
                                            }
                                        </p>
                                    </div>
                                </Grid>
                            </Grid>

                            <Grid  className="projectSettingInfo__wrapper__form__body__container">
                                <Grid item xs={4} className="projectSettingInfo__wrapper__form__body__label">
                                    <InputLabel required={true}>Start Date </InputLabel>
                                </Grid>
                            <Grid item xs={8} className="projectSettingInfo__wrapper__form__body__input-portfolio-field">
                            <MuiPickersUtilsProvider libInstance={moment} utils={MomentUtils}>
                                    <Controller 
                                        render={({ field }:{field:any}) => (
                                            <div className="date-picker">
                                                 <GlobalDatePicker
                                                    id={`project-startDate`}
                                                    {...field}
                                                    clearable={true}
                                                    //variant="inline"
                                                    fullWidth
                                                    views = {['year', 'month','date']}
                                                    autoOk
                                                   disabled={projectDetailsState.disableUpdatePermission}
                                                    value={field?.value?field.value:null}
                                                    emptyLabel="Select Start Date"
                                                    format="DD-MMM-yyyy"
                                                    keyboardbuttonprops={{
                                                    "aria-label": "change date"
                                                    }}
                                                    open={startDateOpen}
                                                    onClose={()=> setStartDateOpen(false)}
                                                    {...field.rest}
                                                    onChange={(e:any) => { field.onChange(e), handleProjectStartTime(e) }}
                                                    InputProps={{ onClick:() => setStartDateOpen(true),className: !field.value ?
                                                             dateClasses.datepicker_placeholder:dateClasses.datepicker }}
                                                 />
                                            <IconButton aria-label="delete" className="calendar-icon"  disabled={!getValues("ProjectStartdate")}
                                                onClick={()=> setStartDateOpen(true)}>
                                                <InsertInvitationIcon />
                                            </IconButton>
                                         </div> 
                                        )}
                                        name= "ProjectStartdate"
                                        control={control}
                                        rules={{
                                            required: true
                                        }}
                                    />
                                    <div className="projectSettingInfo__error-wrap">
                                                <p className="projectSettingInfo__error-wrap__message">
                                                    {
                                                        errors.ProjectStartdate?.type === "required" && (
                                                            <span>Start date is required</span>
                                                        )
                                                    }
                                                </p>
                                    </div>
                                    </MuiPickersUtilsProvider>
                                </Grid>
                            </Grid>
                            <Grid  className="projectSettingInfo__wrapper__form__body__container">
                                <Grid item xs={4} className="projectSettingInfo__wrapper__form__body__label">
                                    <InputLabel required={true}>End Date </InputLabel>
                                </Grid>
                            <Grid item xs={8} className="projectSettingInfo__wrapper__form__body__input-portfolio-field">
                            <MuiPickersUtilsProvider libInstance={moment} utils={MomentUtils}>
                                    <Controller 
                                        render={({ field }:{field:any}) => (
                                            <div className="date-picker">                                                               
                                                <GlobalDatePicker
                                                    id={`project-endDate`}
                                                    {...field}
                                                    clearable={true}
                                                    fullWidth
                                                   disabled={projectDetailsState.disableUpdatePermission}
                                                    value={field?.value?field.value:null}
                                                    emptyLabel="Select End Date"
                                                    format="DD-MMM-yyyy" 
                                                    keyboardbuttonprops={{
                                                    "aria-label": "change date"
                                                    }}
                                                    minDate = {getValues("ProjectStartdate")?getValues("ProjectStartdate"):""}
                                                    minDateMessage = "End date must be greater than start date"
                                                    open={endDateOpen}
                                                    onClose={()=> setEndDateOpen(false)}
                                                    {...field.rest}
                                                    onChange={(e:any) => { field.onChange(e), handleProjectEndTime(e) }}
                                                    InputProps={{ onClick: (e:any) => openEndDate(e),
                                                        className: !field.value ? 
                                                        dateClasses.datepicker_placeholder:dateClasses.datepicker }}
                                                 /> 
                                            <IconButton aria-label="delete" className="calendar-icon"  disabled={!getValues("ProjectStartdate")}
                                                onClick={() => setEndDateOpen(true)}>
                                                <InsertInvitationIcon />
                                            </IconButton>
                                         </div> 
                                        )}
                                        name= "ProjectEnddate"
                                        control={control}
                                        rules={{
                                            required: true
                                        }}
                                    />
                                    <div className="projectSettingInfo__error-wrap">
                                                <p className="projectSettingInfo__error-wrap__message">
                                                    {
                                                        errors.ProjectEnddate?.type === "required" ? (
                                                            <span>End date is required</span>
                                                        ):(
                                                            errors.ProjectEnddate?.type === "invalid" && (
                                                                <span>* Invalid date range</span>
                                                        ))
                                                    }
                                                </p>
                                    </div>
                                    </MuiPickersUtilsProvider>
                                </Grid>
                            </Grid>
                            <Grid container  className="projectSettingInfo__wrapper__form__body__container">
                                <Grid item xs={4} className="projectSettingInfo__wrapper__form__body__label">
                                    <InputLabel required={true}>Portfolio </InputLabel>
                                </Grid>
                                <Grid item xs={8} className="projectSettingInfo__wrapper__form__body__input-portfolio-field">
                                    <Controller  
                                        render={({ field }:{field:any}) => (
                                            <Select
                                                id='project-portfolio'
                                               disabled={projectDetailsState.disableUpdatePermission}
                                                {...field}
                                                fullWidth
                                                autoComplete='off'
                                                multiple
                                                value={field?.value}
                                                displayEmpty
                                                onChange={(e) => {
                                                    field.onChange(e.target.value as string[])
                                                    handlePortfolioValue(e)
                                                }}
                                                input={<Input />}
                                                renderValue={(selected: Array<number>) => getRenderValue(selected)}
                                                MenuProps={{ classes: { paper: classes.root },
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

                                                {props.portfolioValue?.map((type: any) => (
                                                    <MenuItem key={type.id} value={type.name}>
                                                        <Checkbox checked={field?.value?.indexOf(type.name) > -1}  color="default" />
                                                        <ListItemText className="mat-menu-item-sm" primary={`${type?.name}`} />
                                                    </MenuItem>
                                                ))}
                                            </Select>                     
                                        )}
                                        name= "ProjectPortfolio"
                                        control={control}
                                        rules={{
                                            required: true
                                        }}
                                    />
                                        <div className="projectSettingInfo__error-wrap">
                                            <p className="projectSettingInfo__error-wrap__message">
                                                {
                                                    errors.ProjectPortfolio?.type === "required" && (
                                                        <span>Portfolio is required</span>
                                                    )
                                                }
                                            </p>
                                    </div>
                                </Grid>
                            </Grid>
                        </div>
                        
                        
                    </div>
                    {(!projectDetailsState.disableUpdatePermission)&&
                     ( <div className="projectSettingInfo__wrapper__form__action">
                        <Button data-testid={'cancel-update'} variant="outlined" onClick={navigateback}>
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            data-testid={'update-project'} 
                            variant="outlined"
                            className="project-primary"
                            disabled={isDisableCreateBtn}>
                            Update
                        </Button>
                    </div>)}
                </form>
            </div>
    )
}