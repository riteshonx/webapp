import React, { ReactElement, useContext, useEffect, useState,useRef } from 'react';
import './ProjectCreate.scss';
import projectIcon from '../../../../../assets/images/project.svg';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import Button from '@material-ui/core/Button';
import { InputLabel, makeStyles, MenuItem } from '@material-ui/core';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import TextField from '@material-ui/core/TextField';
import InfoIcon from '@material-ui/icons/Info';
import Tooltip from '@material-ui/core/Tooltip/Tooltip';
import ConfirmDialog from '../../../../shared/components/ConfirmDialog/ConfirmDialog';
import { useDebounce } from '../../../../../customhooks/useDebounce';
import { tenantProjectRole } from '../../../../../utils/role';
import { ASSOCIATE_PROJECT_WITH_PORTFOLIO, CREATE_NEW_PROJECT, CREATE_NEW_PROJECT_WITH_TEMPLATE,
    CREATE_PROJECT_LOCATIOn,
    LOAD_USER_PORTFOLIOS,
    LOAD_USER_PROJECTS, UNIQUE_PROJECT_CODE, UNIQUE_PROJECT_NAME } from '../../../../../graphhql/queries/projects';
import { client } from '../../../../../services/graphql';
import { decodeExchangeToken } from '../../../../../services/authservice';
import { stateContext } from '../../../../root/context/authentication/authContext';
import { setIsLoading,updateProjectList } from '../../../../root/context/authentication/action';
import Notification,{ AlertTypes } from "../../../../shared/components/Toaster/Toaster";
import Select from '@material-ui/core/Select/Select';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { CustomPopOver } from '../../../../shared/utils/CustomPopOver';
import Input from '@material-ui/core/Input';
import ListItemText from '@material-ui/core/ListItemText';
import { DatePicker } from '@material-ui/pickers';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import IconButton from '@material-ui/core/IconButton';
import InsertInvitationIcon from '@material-ui/icons/InsertInvitation';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { axiosApiInstance } from 'src/services/api';
import { fetchAddressComponents } from '../../utils/helper';
import MomentUtils from '@date-io/moment';
import moment from 'moment';
import 'moment-timezone';
import { Country, State, City }  from 'country-state-city';
import GlobalDatePicker from '../../../../shared/components/GlobalDatePicker/GlobalDatePicker';

moment.tz.setDefault("Europe/London"); // dynamic time-zone will come in future

const defaultValues: any ={
    ProjectName: '',
    ProjectAddress: '',
    ProjectCode: '',
    ProjectTemplate: '',
    ProjectDetails: false,
    ProjectMembers: false,
    ProjectSettings: false,
    ProjectPortfolio:[],
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    streetno: '',
};

interface message {
    header: string,
    text: string,
    cancel: string,
    proceed: string,
    successIcon: boolean
}

const confirmMessage: message = {
    header: "Project created!",
    text: `Take this opportunity to add important information that will help you and your team deliver a successful project`,
    cancel: "Not right now",
    proceed: "Customize",
    successIcon: true
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

export default function ProjectCreate(props: any): ReactElement {

    const history = useHistory();
    const {state, dispatch }:any = useContext(stateContext);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [projectNameValue, setProjectNameValue] = useState(''); 
    const debounceProjectName = useDebounce(projectNameValue, 700);
    const [projectCodeValue, setProjectCodeValue] = useState('');
    const [portfolioValue,setPortfolioValue] = useState<Array<any>>([]);
    const debounceCodeName = useDebounce(projectCodeValue, 700);
    const [isUniqueProjectName, setisUniqueProjectName] = useState(false);
    const [isUniqueProjectCode, setisUniqueProjectCode] = useState(false);
    const [isDisableCreateBtn, setIsDisableCreateBtn] = useState(false);
    const [startDateOpen, setStartDateOpen] = useState(false);
    const [endDateOpen, setEndDateOpen] = useState(false);
    const [userProjectLists, setUserProjectLists] = useState<Array<any>>([]);
    const [userPortfolio, setUserPortfolio] = useState<Array<any>>([]);
    const [isCopyProjectSelected, setIsCopyProjectSelected] = useState<any>(null)
    const [createdProjectId, setCreatedProjectId] = useState<any>(null);
    const classes = CustomPopOver();
    const [selectedProject, setSelectedProject] = useState<any>()
    const pathMatch : any= useRouteMatch();
    const [startDate, setStartDate] = useState<any>(null);
    const [endDate, setEndDate] = useState<any>(null);
    const dateClasses = useStyles();
    const [placesList, setPlacesList] = useState<Array<any>>([]);
    const [placesSearchText, setPlacesSearchText] = useState(''); 
    const debouncePlacesSearchText = useDebounce(placesSearchText, 300);
    const [inputValue, setInputValue] = React.useState("");
    const [selectedPlace, setSelectedPlace] = useState<any>(null);
    const [Location, setLocation] = useState<any>(null);
    const copyTeamsRef = useRef<any>();
    const [addressRequired, setAddressRequired] = useState(false);
    const [stateList,setStateList] = React.useState<any>([]);
    const [countryList,setCountryList] = React.useState<any>(Country.getAllCountries());

    const {
        handleSubmit,
        control,
        getValues,
        setError,
        clearErrors,
        setValue,
        watch,
        formState: { errors }
      } = useForm<any>({
        defaultValues
    });

    const watchAllFields: any = watch();

    useEffect(() => {
        fetchUserProjects();
        fetchUserPortfolios();
    }, [])

    useEffect(() => {
        disableCreatebtn()
    }, [watchAllFields]);

    useEffect(() => {
        if(projectNameValue){
            uniqueProjectNameValidation();
        }else{
            clearErrors("ProjectName")
            setisUniqueProjectName(false)
        }
    }, [debounceProjectName]);

    useEffect(() => {
       if(debouncePlacesSearchText.trim()){
        fetchPlacesByText();
       } else{
           setPlacesList([]);
       }
    }, [debouncePlacesSearchText])
    

    useEffect(() => {
        if(projectCodeValue){
            uniqueProjectCodeValidation();
        }else{
            clearErrors("ProjectCode")
            setisUniqueProjectCode(false)
        }
    }, [debounceCodeName]);

    useEffect(() => {
       if(selectedPlace){
           fetchCompleteAddressByPlaceId();
       }
    }, [selectedPlace])

    const closeSideBar = () => {
        props.closeSideBar(false)
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

    const onSubmit: SubmitHandler<any> = (value: any) => {
        if(isUniqueProjectName || isUniqueProjectCode){
            return
        }
        if(validateFormFieldsBeforeSave(value)>0){
            return;
        }
       
        const formValue = {
            ProjectName: value.ProjectName.trim(),
            ProjectAddress: value.ProjectAddress.trim(),
            Projectstreetno: value.streetno.trim(),
            Projectcity: value.city.trim(),
            Projectstate: value.state.trim(),
            Projectcountry: value.country.trim(),
            ProjectpostalCode: value.postalCode.trim(),
            ProjectCode: value.ProjectCode.trim() || '',
            ProjectTemplate: value.ProjectTemplate,
            ProjectDetails: value.ProjectDetails,
            ProjectMembers: value.ProjectMembers,
            ProjectSettings: value.ProjectSettings,
            ProjectPortfolio: value.Portfolio || [],
            ProjectStartdate:value.startDate,
            ProjectEnddate:value.endDate,
        }
        createNewProject(formValue);
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

    const handleConfirmBoxClose = () => {
        props.refresh();
        closeSideBar();
    }

    const detailsProjects = () => {
        history.push(`/base/project-lists/${createdProjectId}/details`);
        closeSideBar();

    }   

    const handleProjectName = (e: any) => {
        setProjectNameValue(e.target.value.trim());
    }

    const handleProjectCode = (e: any) => {
        setProjectCodeValue(e.target.value.trim());
    }

    const handlePortfolioValue = (e: any) => {
        setUserPortfolio(e.target.value);
    }

    const disableCreatebtn = () => {
        if(Object.keys(errors).length > 0 || addressRequired){
            setIsDisableCreateBtn(true)
        }else{
            setIsDisableCreateBtn(false)
        }
    }

    const handleProjectTemplate = (event: any) => {

        userProjectLists.forEach((item: any) => {
            if(item.id === event?.target.value){
                setSelectedProject(item.config.type);
            }
        })
        if(event?.target.value != "none"){
            setIsCopyProjectSelected(event?.target.value) 
            setTimeout(()=>{
                if(copyTeamsRef)
                {
                    copyTeamsRef?.current?.scrollIntoView({ behavior: "smooth" });
                }
            },100)    
        }
        else{
            setIsCopyProjectSelected(null)
        }
    }

    const uniqueProjectNameValidation= async()=>{
        try{
            const role= tenantProjectRole.viewTenantProjects;
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

            if(projects.length > 0){
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
            if(projects.length > 0){
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

    const fetchUserPortfolios= async()=>{

        try{
            const role= tenantProjectRole.createTenantProject ;
            const projectsResponse= await client.query({
                query: LOAD_USER_PORTFOLIOS,
                fetchPolicy: 'network-only',
                context:{role}
            });
            const portfolios: Array<any>=[];
            if(projectsResponse.data.portfolio.length>0){
                portfolios.push(...projectsResponse.data.portfolio);
            }
            setPortfolioValue(portfolios);
              

        }catch(error){
            console.log(error);
        }
    }


    
    const fetchUserProjects= async()=>{

        try{
            const role= tenantProjectRole.viewTenantProjects;
            const projectsResponse= await client.query({
                query: LOAD_USER_PROJECTS,
                variables:{
                    userId: decodeExchangeToken().userId,
                },
                fetchPolicy: 'network-only',
                context:{role}
            });
            const projects: Array<any>=[];
            if(projectsResponse.data.project.length>0){
                projects.push(...projectsResponse.data.project);
            }
            setUserProjectLists(projects);
              

        }catch(error){
            console.log(error);
        }
    }

    const createNewProject = async (value: any) => {
        let payload = {}
        if(value.ProjectStartdate && value.ProjectEnddate){
            const d1 = new Date(value.ProjectStartdate).setHours(0,0,0,0);
            const d2 = new Date(value.ProjectEnddate).setHours(0,0,0,0);
            if(d2 < d1){
                setError("endDate", {
                    type: "invalid",
                    message: "* Invalid date range",
                })
                return;
            }else{
                clearErrors("endDate")           
            }
        }
        let location='0,0';
        if(Location){
            location= `${Location?.lat||'0'},${Location?.lng||'0'}`;
        }
        const utcStartDate = value.ProjectStartdate? moment(value.ProjectStartdate).utcOffset(0):startDate;
        utcStartDate.set({hour:0,minute:0,second:0,millisecond:0})
        if(isCopyProjectSelected && (value.ProjectDetails || value.ProjectMembers || 
            value.ProjectSettings || value.ProjectPortfolio || value.ProjectEnddate || value.ProjectStartdate)){
            payload = {
                    name: `${value.ProjectName}`,
                    address: {
                        city: '100 West Washington St. Chicago',
                        country: 'USA',
                        pin: '91103',
                        state: 'IL'
                    },
                    config: {
                        projectCode: `${value.ProjectCode}`,
                        stage: '',
                        type: value.ProjectDetails ? (selectedProject ? selectedProject : ''): ''
                    },
                    // projectCode: `${value.ProjectCode}`,
                    details: value.ProjectDetails,
                    memenbers: value.ProjectMembers,
                    ProjectTemplateId: Number(value.ProjectTemplate),
                    startDate:utcStartDate,
                    endDate:endDate,
                    location
                    // settings: value.ProjectSettings

            }
            createProjectwithTemplate(payload,value.ProjectPortfolio);
        }else{
            payload = {
                address: {
                },
                config: {
                    projectCode: `${value.ProjectCode}`,
                    stage: '',
                    type: ''
                },
                metrics: {
                    currency: '',
                    temprature: '',
                    timeZone: '',
                    unitOfMeasurement: ''
                },
                name: `${value.ProjectName}`,
                startDate:utcStartDate,
                endDate:endDate,
                location
            }
            createProjectwithoutTemplate(payload,value.ProjectPortfolio);
        }
    }

    const createProjectwithoutTemplate = async (payload: any,pfValue?:any) => {
        try{
            dispatch(setIsLoading(true));
            const formSubmitResponse: any = await client.mutate({
                mutation: CREATE_NEW_PROJECT,
                variables: {
                    payload: payload,
                    userId: decodeExchangeToken().userId,
                },
                context:{role: tenantProjectRole.createTenantProject}
            })
            if(pathMatch.path.includes("teammates")){
                props.closeSideBar()
            }else {
            setCreatedProjectId(formSubmitResponse?.data?.insert_project?.returning[0]?.id);
            addPortfolioToProject(formSubmitResponse?.data?.insert_project?.returning[0]?.id,pfValue);
            addProjectLocation(formSubmitResponse?.data?.insert_project?.returning[0]?.id);
            Notification.sendNotification("Project created successfully", AlertTypes.success);
            setConfirmOpen(true);
            dispatch(setIsLoading(false));
            }
        }
        catch(err: any){
            dispatch(setIsLoading(false));
            Notification.sendNotification(err, AlertTypes.warn);
            console.log(err)
        }
    }

    const addProjectLocation=async (argProjectId: number)=>{
        try{
            const response=await client.mutate({
                mutation: CREATE_PROJECT_LOCATIOn,
                variables:{object:{
                    addressLine1: selectedPlace?selectedPlace?.description:placesSearchText,
                    addressLine2: getValues('addressline2')?.trim()||'',
                    fullAddress: selectedPlace?selectedPlace?.description:placesSearchText,
                    city: getValues('city')?.trim()||'',
                    country:  getValues('country')?.trim()||'',
                    postalCode:  getValues('postalCode')?.trim()||'',
                    projectId: argProjectId,
                    state:  getValues('state')?.trim()||'',
                    streetNo:  getValues('streetno')?.trim()||'',
                    countryShortCode: getValues('countryShortCode')?.trim()||''
                }},
                context: { role: tenantProjectRole.createTenantProject }
            });
        }catch(error: any){
            console.log(error);
        }
    }


    const addPortfolioToProject = async(id:any,ProjectPortfolio:any)=>{
        const uniqueAddedProjects:Array<any> =[]
        if(ProjectPortfolio.length){
            for (let i = 0; i < ProjectPortfolio.length; i++) {
                for (let j = 0; j < portfolioValue.length; j++) {
                    if(ProjectPortfolio[i] === portfolioValue[j].name ){
                        uniqueAddedProjects.push({portfolioId:portfolioValue[j].id,projectId:id})
                    }
                }
            }
            try{
                dispatch(setIsLoading(true));
                const promiseList: any = [];
                promiseList.push(
                  client.mutate({
                    mutation: ASSOCIATE_PROJECT_WITH_PORTFOLIO,
                    variables: {
                      objects: uniqueAddedProjects,
                    },
                    context: { role: tenantProjectRole.createTenantProject },
                  })
                );
                await Promise.all(promiseList);
                dispatch(updateProjectList(!state.getProjectList));
                dispatch(setIsLoading(false));
            }
            catch(err: any){
                dispatch(setIsLoading(false));
                Notification.sendNotification(err, AlertTypes.warn);
            }
        }
    }
    const getRenderValue=(argValue: Array<number>): any=>{
        const returnValue: Array<string>=[];
        const selectedValues= portfolioValue.filter((item: any)=> argValue.indexOf(item.name) >-1 );

        selectedValues.forEach((item: any)=>{
            returnValue.push(`${item?.name}`);
        })
        if (argValue.length === 0) {
            return <div className="createProject__wrapper__form__body__label__text">Select Portfolio</div>;
        }

        return returnValue.join(',');
    }

    const createProjectwithTemplate = async (payload: any,pfValue?:any) => {
        try{
            dispatch(setIsLoading(true));
            let location='0,0';
            if(Location){
                location= `${Location?.lat||'0'},${Location?.lng||'0'}`;
            }
            const formSubmitResponse: any = await client.mutate({
                mutation: CREATE_NEW_PROJECT_WITH_TEMPLATE,
                variables: {
                    config: payload.config,
                    address: payload.address,
                    projectName:  payload.name,
                    projectId: payload.ProjectTemplateId,
                    members: payload.memenbers,
                    details:  payload.details,
                    userId: decodeExchangeToken().userId,
                    startDate:payload.startDate,
                    endDate:payload.endDate,
                    location: location
                },
                context:{role: tenantProjectRole.createTenantProject}
            })
            if(pathMatch.path.includes("teammates")){
                props.closeSideBar()
            }else {
            setCreatedProjectId(formSubmitResponse?.data?.insert_duplicateProject_mutation?.id);
            addPortfolioToProject(formSubmitResponse?.data?.insert_duplicateProject_mutation?.id,pfValue);
            addProjectLocation(formSubmitResponse?.data?.insert_duplicateProject_mutation?.id);
            Notification.sendNotification("Project created successfully", AlertTypes.success);
            setConfirmOpen(true);
            dispatch(setIsLoading(false));
            }
        }
        catch(err: any){
            dispatch(setIsLoading(false));
            Notification.sendNotification(err, AlertTypes.warn);
            console.log(err)
        }
    }

    const handleProjectStartTime=(e:any)=>{
        try{
            clearErrors("endDate") 
            if(e)
            setStartDate(e)
            else
            setStartDate(null)
        } catch(error: any){
            console.log(error);
        }
    }

    const handleProjectEndTime=(e:any)=>{
        try{
            clearErrors("endDate") 
            if(e)
            setEndDate(e)
            else
            setEndDate(null);
        } catch(error){
            console.log(error);
        }
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
          return <div className="createProject__wrapper__form__body__label__text">Select State</div>;
        }
        return selected;
      }

    return (
        <div className="createProject">
            <div className="createProject__left">

            </div>
            <div className="createProject__wrapper">
                <div className="createProject__wrapper__project-image">
                    <img className="img-responsive" src={projectIcon} alt="user" />
                    <span className="closeIcon">
                        <HighlightOffIcon data-testid={'close-sideBar'} onClick={closeSideBar}/>
                    </span>
                </div>
                <div className="createProject__wrapper__header">
                    Add Project
                </div>
                <form className="createProject__wrapper__form" onSubmit={handleSubmit(onSubmit)}>
                    <div className="createProject__wrapper__form__body">
                        <div className="createProject__wrapper__form-wrapper">
                            <div  className="createProject__wrapper__form__body__container">
                                <div className="createProject__wrapper__form__body__label">
                                    <InputLabel required={true}>Name </InputLabel>
                                </div>
                                <div className="createProject__wrapper__form__body__input-field">
                                    <Controller 
                                        render={({ field }:{field:any}) => (
                                            <TextField
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
                                            required: true
                                            // validate: isUniqueProjectName
                                        }}
                                    />
                                    <div className="createProject__error-wrap">
                                            <p className="createProject__error-wrap__message">
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
                                </div>
                            </div>

                            <div  className="createProject__wrapper__form__body__container">
                                <div className="createProject__wrapper__form__body__label">
                                    <InputLabel required={true}>Address Line 1</InputLabel>
                                </div>
                                <div className="createProject__wrapper__form__body__input-field">
                                    <Autocomplete
                                        fullWidth
                                        freeSolo
                                        id="free-solo-2-demo"
                                        disableClearable
                                        value={inputValue}
                                        onChange={(event, newValue) => {
                                          changeInOptionValue(newValue);
                                        }}
                                        inputValue={placesSearchText}
                                        onInputChange={(event, newInputValue) => changeInSearchText(newInputValue)}
                                        options={placesList.map((option: any) => option.description)}
                                        renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label=""
                                            fullWidth
                                            margin="normal"
                                            autoComplete="off"
                                            placeholder='Enter Address'
                                            InputProps={{ ...params.InputProps, type: 'search' }}
                                        />
                                        )}
                                    />  
                                    {addressRequired && 
                                        <div className="createProject__error-wrap">
                                             <p className="createProject__error-wrap__message">
                                             <span>* Address is required</span>
                                             </p>
                                        </div>
                                    }                  
                                </div>
                            </div>


                             <div  className="createProject__wrapper__form__body__container">
                                <div className="createProject__wrapper__form__body__label">
                                    <InputLabel>Address Line 2  </InputLabel>
                                </div>
                                <div className="createProject__wrapper__form__body__input-field">
                                    <Controller 
                                        render={({ field }:{field:any}) => (
                                                <TextField
                                                    type="text"
                                                fullWidth
                                                autoComplete="search"
                                                placeholder='Enter Address Line 2'
                                                onChange={(e) => {field.onChange(e)}}
                                            />                      
                                        )}
                                        name= "addressline2"
                                        control={control}
                                        rules={{
                                            required: false
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="createProject__wrapper__form__body__container">
                                    <div className="createProject__wrapper__form__body__label">
                                        <InputLabel required={true}>Country  </InputLabel>
                                    </div>
                                    <div className="createProject__wrapper__form__body__input-field">
                                        <Controller 
                                            render={({ field }:{field:any}) => (
                                                <Select
                                                    id="custom-dropdown"
                                                    fullWidth
                                                    {...field}
                                                    displayEmpty
                                                    autoComplete='off'
                                                    placeholder="select a value"
                                                    onChange={(e) => {field.onChange(e.target.value as string[]);
                                                        updateStateList(e.target.value)}}
                                                    renderValue={
                                                        field.value !== "" ? undefined : () => <div className="createProject__wrapper__form__body__label__text">Select Country</div>
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
                                        <div className="createProject__error-wrap">
                                            <p className="createProject__error-wrap__message">
                                                {
                                                    errors.country?.type === "required" && (
                                                        <span>* Country is required</span>
                                                    )
                                                }
                                            </p>
                                        </div>
                                    </div>  
                               </div>

                              <div className="createProject__wrapper__form__body__container">
                                    <div className="createProject__wrapper__form__body__label">
                                        <InputLabel required={false}>State / Province  </InputLabel>
                                    </div>
                                    <div className="createProject__wrapper__form__body__input-field">
                                        <Controller 
                                            render={({ field }:{field:any}) => (
                                                <Select
                                                    id="custom-dropdown"
                                                    fullWidth
                                                    {...field}
                                                    autoComplete='off'
                                                    displayEmpty
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
                                        <div className="createProject__error-wrap">
                                            <p className="createProject__error-wrap__message">
                                                {
                                                    errors.state?.type === "required" && (
                                                        <span>* State is required</span>
                                                    )
                                                }
                                            </p>
                                        </div>
                                    </div>  
                               </div> 

                            <div  className="createProject__wrapper__form__body__container">
                                <div className="createProject__wrapper__form__body__label">
                                    <InputLabel required={false}>City / Locality  </InputLabel>
                                </div>
                                <div className="createProject__wrapper__form__body__input-field">
                                    <Controller 
                                        render={({ field }:{field:any}) => (
                                            <TextField
                                                type="text"
                                                {...field}
                                                fullWidth
                                                autoComplete="search"
                                                placeholder='Enter City'
                                                onChange={(e) => {field.onChange(e)}}
                                            />                      
                                        )}
                                        name= "city"
                                        control={control}
                                        rules={{
                                            required: false
                                        }}
                                    />
                                    <div className="createProject__error-wrap">
                                        <p className="createProject__error-wrap__message">
                                            {
                                                errors.city?.type === "required" && (
                                                    <span>* City is required</span>
                                                )
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div  className="createProject__wrapper__form__body__container">
                                <div className="createProject__wrapper__form__body__label">
                                    <InputLabel required={true}>Zip / Postcode </InputLabel>
                                </div>
                                <div className="createProject__wrapper__form__body__input-field">
                                    <Controller 
                                        render={({ field }:{field:any}) => (
                                            <TextField
                                                type="text"
                                                {...field}
                                                fullWidth
                                                autoComplete='off'
                                                placeholder='Enter Zip / Postcode'
                                                onChange={(e) => {field.onChange(e)}}
                                            />                      
                                        )}
                                        name= "postalCode"
                                        control={control}
                                        rules={{
                                            required: true
                                        }}
                                    />
                                    <div className="createProject__error-wrap">
                                        <p className="createProject__error-wrap__message">
                                            {
                                                errors.postalCode?.type === "required" && (
                                                    <span>* Postcode is required</span>
                                                )
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>



                            <div  className="createProject__wrapper__form__body__container">
                                <div className="createProject__wrapper__form__body__label">
                                    <InputLabel required={false}>Project Code </InputLabel>
                                </div>
                                <div className="createProject__wrapper__form__body__input-field">
                                    <Controller 
                                        render={({ field }:{field:any}) => (
                                            <TextField
                                                type="text"
                                                {...field}
                                                fullWidth
                                                autoComplete="off"
                                                placeholder='Enter Project Code'
                                                onChange={(e) => {field.onChange(e), handleProjectCode(e)}}
                                            />                      
                                        )}
                                        name= "ProjectCode"
                                        control={control}
                                        rules={{
                                            required: false
                                        }}
                                    />
                                    <div className="createProject__error-wrap">
                                        <p className="createProject__error-wrap__message">
                                            {
                                                errors.ProjectCode?.type === "unique" && (
                                                    <span>* Project code already exists</span>
                                                )
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div  className="createProject__wrapper__form__body__container">
                                <div className="createProject__wrapper__form__body__label">
                                    <InputLabel required={true}>Start Date </InputLabel>
                                </div>
                            <div className="createProject__wrapper__form__body__input-portfolio-field">
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
                                                    value={startDate}
                                                    emptyLabel="Select Start Date"
                                                    format="DD-MMM-yyyy" 
                                                    keyboardbuttonprops={{
                                                    "aria-label": "change date"
                                                    }}
                                                    open={startDateOpen}
                                                    onClose={()=> setStartDateOpen(false)}
                                                    {...field.rest}
                                                    InputProps={{onClick:() => setStartDateOpen(true), 
                                                    className: !startDate ? dateClasses.datepicker_placeholder:dateClasses.datepicker }}
                                                    onChange={(e:any) => { field.onChange(e), handleProjectStartTime(e) }}
                                                 /> 
                                            <IconButton aria-label="delete" className="calendar-icon"
                                                onClick={() => setStartDateOpen(true)}>
                                                <InsertInvitationIcon />
                                            </IconButton>
                                         </div> 
                                        )}
                                        name= "startDate"
                                        control={control}
                                        rules={{
                                            required: true
                                        }}
                                    />
                                    <div className="createProject__error-wrap">
                                                <p className="createProject__error-wrap__message">
                                                    {
                                                        errors.startDate?.type === "required" && (
                                                            <span>Start date is required</span>
                                                        )
                                                    }
                                                </p>
                                    </div>
                                    </MuiPickersUtilsProvider>
                                </div>
                            </div>
                            <div  className="createProject__wrapper__form__body__container">
                                <div className="createProject__wrapper__form__body__label">
                                    <InputLabel required={true}>End Date </InputLabel>
                                </div>
                            <div className="createProject__wrapper__form__body__input-portfolio-field">
                            <MuiPickersUtilsProvider libInstance={moment} utils={MomentUtils}>
                                    <Controller 
                                        render={({ field }:{field:any}) => (
                                            <div className="date-picker">                                                               
                                                <GlobalDatePicker
                                                    id={`project-endDate`}
                                                    {...field}
                                                    clearable={true}
                                                   // variant="inline"
                                                    fullWidth
                                                    value={endDate}
                                                    emptyLabel="Select End Date"
                                                    format="DD-MMM-yyyy" 
                                                    keyboardbuttonprops={{
                                                    "aria-label": "change date"
                                                    }}
                                                    disabled={!startDate}
                                                    open={endDateOpen}
                                                    minDate = {startDate?startDate:""}
                                                    minDateMessage = "End date must be greater than start date"
                                                    onClose={()=> setEndDateOpen(false)}
                                                    {...field.rest}
                                                    onChange={(e:any) => { field.onChange(e), handleProjectEndTime(e) }}
                                                    InputProps={{ onClick:() => startDate?setEndDateOpen(true):null, 
                                                    className: !endDate ? dateClasses.datepicker_placeholder:dateClasses.datepicker }}
                                                 /> 
                                            <IconButton aria-label="delete" className="calendar-icon" disabled={!startDate}
                                                onClick={() => setEndDateOpen(true)}>
                                                <InsertInvitationIcon />
                                            </IconButton>
                                         </div> 
                                        )}
                                        name= "endDate"
                                        control={control}
                                        rules={{
                                            required: true
                                        }}
                                    />
                                    <div className="createProject__error-wrap">
                                                <p className="createProject__error-wrap__message">
                                                    {
                                                        errors.endDate?.type === "required" ? (
                                                            <span>End date is required</span>
                                                        ):(
                                                            errors.endDate?.type === "invalid" && (
                                                                <span>* Invalid date range</span>
                                                        ))
                                                    }
                                                </p>
                                    </div>
                                    </MuiPickersUtilsProvider>
                                </div>
                            </div>
                            <div  className="createProject__wrapper__form__body__container">
                                <div className="createProject__wrapper__form__body__label">
                                    <InputLabel required={true}>Portfolio </InputLabel>
                                </div>
                                <div className="createProject__wrapper__form__body__input-portfolio-field">
                                    <Controller 
                                        render={({ field }:{field:any}) => (
                                        <Select
                                            id='project-portfolio'
                                            {...field}
                                            fullWidth
                                            autoComplete='off'
                                            multiple
                                            value={userPortfolio}
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

                                            {portfolioValue?.map((type: any) => (
                                                <MenuItem key={type.id} value={type.name}>
                                                    <Checkbox checked={userPortfolio?.indexOf(type.name) > -1}  color="default" />
                                                    <ListItemText primary={`${type?.name}`} className="mat-menu-item-sm"/>
                                                </MenuItem>
                                            ))}
                                        </Select>                             
                                        )}
                                        name= "Portfolio"
                                        control={control}
                                        rules={{
                                            required: true
                                        }}
                                    />
                                    <div className="createProject__error-wrap">
                                                <p className="createProject__error-wrap__message">
                                                    {
                                                        errors.Portfolio?.type === "required" && (
                                                            <span>Portfolio is required</span>
                                                        )
                                                    }
                                                </p>
                                    </div>
                            </div>
                            </div>
                            <div  className="createProject__wrapper__form__body__container">
                                <div className="createProject__wrapper__form__body__label">
                                    <InputLabel required={false}>Template
                                   
                                        <Tooltip  className="createProject__wrapper__form__body__label__icon" title="Do you have a project similar to 
                                                this one? If so, you can copy data (including general settings and teammates) from that project to 
                                                this one by selecting a project 
                                                from the dropdown menu.">
                                            <InfoIcon />
                                        </Tooltip>
                                    </InputLabel>
                                </div>
                                <div className="createProject__wrapper__form__body__input-field copyTemplate">
                                    <Controller 
                                        render={({ field }:{field:any}) => (
                                            <Select
                                                
                                                id="custom-dropdown"
                                                fullWidth
                                                {...field}
                                                autoComplete='off'
                                                displayEmpty
                                                onChange={(e) => {field.onChange(e), handleProjectTemplate(e)}}
                                                renderValue={
                                                    field.value !== "" ? undefined : () => <div className="createProject__wrapper__form__body__label__text">Select Template</div>
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
                                                    userProjectLists.map((project: any) => (
                                                        <MenuItem key={project.id} className="mat-menu-item-sm" 
                                                            value={project.id}>{project.name}</MenuItem>
                                                    ))
                                                }
                                                <MenuItem key={"none"} value = "none" className="mat-menu-item-sm" >None</MenuItem>
                                            </Select>
                     
                                        )}
                                        name="ProjectTemplate"
                                        control={control}
                                        rules={{
                                            required: false
                                        }}
                                    />
                                </div>
                            </div>

                            {
                                isCopyProjectSelected && (
                                    <>
                                        <div  className="createProject__wrapper__form__body__checkbox">
                                            <div className="createProject__wrapper__form__body__label">
                                                <InputLabel required={false}></InputLabel>
                                            </div>
                                            <div className="createProject__wrapper__form__body__input-field">
                                                <Controller 
                                                    render={({ field }:{field:any}) => (
                                                        <FormControlLabel
                                                            {...field}
                                                            // value="end"
                                                            control={<Checkbox color="default" />}
                                                            label="Copy Details"
                                                            labelPlacement="end"
                                                        />                    
                                                    )}
                                                    name= "ProjectDetails"
                                                    control={control}
                                                    rules={{
                                                        required: false
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        <div  className="createProject__wrapper__form__body__checkbox">
                                            <div className="createProject__wrapper__form__body__label">
                                                <InputLabel required={false}></InputLabel>
                                            </div>
                                            <div className="createProject__wrapper__form__body__input-field" ref={copyTeamsRef}>
                                                <Controller 
                                                    render={({ field }:{field:any}) => (
                                                        <FormControlLabel
                                                            {...field}
                                                            // value="end"
                                                            control={<Checkbox color="default" />}
                                                            label="Copy Teams"
                                                            labelPlacement="end"
                                                        />                    
                                                    )}
                                                    name= "ProjectMembers"
                                                    control={control}
                                                    rules={{
                                                        required: false
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        {/* <div  className="createProject__wrapper__form__body__checkbox">
                                            <div className="createProject__wrapper__form__body__label">
                                                <InputLabel required={false}></InputLabel>
                                            </div>
                                            <div className="createProject__wrapper__form__body__input-field">
                                                <Controller 
                                                    render={({ field }:{field:any}) => (
                                                        <FormControlLabel
                                                            {...field}
                                                            // value="end"
                                                            control={<Checkbox color="primary" disabled={true} />}
                                                            label="Copy Settings"
                                                            labelPlacement="end"
                                                        />                    
                                                    )}
                                                    name= "ProjectSettings"
                                                    control={control}
                                                    rules={{
                                                        required: false
                                                    }}
                                                />
                                            </div>
                                        </div> */}

                                    </>   
                                 )
                            }
                        </div>
                        
                        
                    </div>
                    <div className="createProject__wrapper__form__action">
                        <Button data-testid={'cancel-create'} variant="outlined" onClick={closeSideBar}>
                            Cancel
                        </Button>
                        <Button 
                        
                                type="submit" 
                                data-testid={'create-project'} 
                                variant="outlined"
                                className="project-primary"
                                id="createProject"
                                disabled={isDisableCreateBtn}>
                            Create 
                        </Button>
                    </div>
                </form>
            </div>
            
            {
                confirmOpen ? (
                    <ConfirmDialog open={confirmOpen} message={confirmMessage} close={handleConfirmBoxClose} proceed={detailsProjects} />
                ) : ('')
            }
        </div>  
    )
}
