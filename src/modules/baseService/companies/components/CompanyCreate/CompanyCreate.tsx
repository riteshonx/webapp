import React, { ReactElement, useContext, useEffect, useState } from 'react';
import companyIcon from '../../../../../assets/images/project.svg';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import InputLabel from '@material-ui/core/InputLabel';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import ConfirmDialog from '../../../../shared/components/ConfirmDialog/ConfirmDialog';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { stateContext } from '../../../../root/context/authentication/authContext';
import './CompanyCreate.scss';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { CustomPopOver } from '../../../../shared/utils/CustomPopOver';
import { Autocomplete } from '@material-ui/lab';
import { tenantCompanyRole } from '../../../../../utils/role';
import { client } from '../../../../../services/graphql';
import { FETCH_COMPANY_BY_COMPANY_ID, FETCH_COMPANY_BY_NAME,
    FETCH_MASTER_COMPANY, INSERT_NEW_COMPANY, INSERT_NEW_COMPANY_WITH_PARENTT_ID,CREATE_COMPANY_LOCATION } from '../../graphql/queries/companies';
import { decodeExchangeToken } from '../../../../../services/authservice';
import { useDebounce } from '../../../../../customhooks/useDebounce';
import { setIsLoading ,setEditMode} from '../../../../root/context/authentication/action';
import Notification,{ AlertTypes } from "../../../../shared/components/Toaster/Toaster";
import { axiosApiInstance } from 'src/services/api';
import { fetchAddressComponents } from 'src/modules/baseService/projects/utils/helper';
import { Country, State, City }  from 'country-state-city';
import useBeforeunload from 'src/customhooks/useUnload';

interface message {
    header: string,
    text: string,
    cancel: string,
    proceed: string,
    successIcon: boolean
}

const confirmMessage: message = {
    header: "Company created!",
    text: `Take this opportunity to add important information that will help you and your team deliver a successful company.`,
    cancel: "Not right now",
    proceed: "Customize",
    successIcon: true
}

export const confirmMessageBeforeLeave:message = {
    header: "Are you sure?",
    text: "If you cancel now, your changes won’t be saved.",
    cancel: "Go back",
    proceed: "Yes, I'm sure",
    successIcon:false
  };

export default function CompanyCreate(props: any): ReactElement {

    const history = useHistory();
    const {dispatch , state}:any = useContext(stateContext);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const classes = CustomPopOver();
    const [masterCompany, setMasterCompany] = useState<Array<any>>([]);
    const [searchText, setsearchText] = useState('');
    const debounceName = useDebounce(searchText, 1000);
    const [createCompanyId, setCreateCompanyId] = useState<any>(null);
    const [value, setValue] = React.useState<any | null>(null);
    const [selectedOption, setSelectedOption] = React.useState<any | null>(null);
    const [companyType, setCompanyType] = useState('');
    const [companyTypeValidation, setCompanyTypeValidation] = useState(false);
    const [companyNameValidation, setCompanyNameValidation] = useState(false);
    const [uniqueCompanyName, setUniqueCompanyName] = useState(false);
    const [uniqueAliasName, setUniqueAliasName] = useState(false)
    const [companyNameValue, setCompanyNameValue] = useState('');
    const [userDefinedValue, setuserDefinedValue] = useState('');
    const debounceCompanyAliasName = useDebounce(userDefinedValue, 700);
    const [companyID, setCompanyID] = useState('');
    const debounceCompanyID = useDebounce(companyID, 700);
    const [companyTypesLists, setCompanyTypesLists] = useState<Array<any>>([]);
    const [uniqueCompanyId, setUniqueCompanyId] = useState(false)
    const pathMatch : any= useRouteMatch();
    const [placesList, setPlacesList] = useState<Array<any>>([]);
    const [placesSearchText, setPlacesSearchText] = useState(''); 
    const debouncePlacesSearchText = useDebounce(placesSearchText, 300);
    const [inputValue, setInputValue] = React.useState("");
    const [selectedPlace, setSelectedPlace] = useState<any>(null);
    const [Location, setLocation] = useState<any>(null);
    const [addressLine1,setAddressLine1] = React.useState("");
    const [addressLine2,setAddressLine2] = React.useState("");
    const [streetNo,setStreetNo] = React.useState("");
    const [city,setCity] = React.useState("");
    const [country,setCountry] = React.useState("");
    const [postalCode,setPostalCode] = React.useState("");
    const [companyAddressValidation, setCompanyAddressValidation] = useState(false);
    const [companyCityValidation, setCompanyCityValidation] = useState(false);
    const [companyStateRegionValidation, setCompanyStateRegionValidation] = useState(false);
    const [companyCountryValidation, setCompanyCountryValidation] = useState(false);
    const [companyPostalCodeValidation, setCompanyPostalCodeValidation] = useState(false);
    const [provinceValue,setProvinceValue] = React.useState<any>("");
    const [stateList,setStateList] = React.useState<any>([]);
    const [dialogMessage,setDialogMessage] = useState<any>(null);

    useEffect(() => {
        fetchMasterCompanies();
        return () => {
            dispatch(setEditMode(false));
          }
    }, []);

    useBeforeunload((event: any) => {
        if(state.editMode) {
            event.preventDefault();
        }
    });

    useEffect(() => {
        if(debouncePlacesSearchText.trim()){
         fetchPlacesByText();
        } else{
            setPlacesList([]);
        }
     }, [debouncePlacesSearchText])

     useEffect(() => {
        if(selectedPlace){
            fetchCompleteAddressByPlaceId();
        }
     }, [selectedPlace])

    useEffect(() => { 
        if(userDefinedValue){
            uniqueCompanyAliasNameValidation(userDefinedValue);
        }else{
            setuserDefinedValue('')
            setUniqueAliasName(false);
        }
    }, [debounceCompanyAliasName]);

    useEffect(() => { 
        if(companyID){
            uniqueCompanyIDValidation(companyID);
        }else{
            setCompanyID('')
            setUniqueCompanyId(false);
        }
    }, [debounceCompanyID]);

    useEffect(() => {
       if(props?.companyTypes.length > 0){
        const typeListArr = props?.companyTypes.filter((item:any,index:any)=>{
            if(item.deleted){
                 return 
            }else{
                return item
            }
        })
        setCompanyTypesLists(typeListArr)
       }
    }, [props?.companyTypes])

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
                setAddressLine1(selectedPlace.description);
                setCity(address.city);
                setPostalCode(address.pinCode);
                setStreetNo(address.streetNo);
                setLocation({lat:response.data.success.geometry.location.lat,lng:response.data.success.geometry.location.lng})
                setCompanyAddressValidation(false)
                setCompanyCityValidation(false)
                setCompanyStateRegionValidation(false)
                setCompanyCountryValidation(false)
                setCompanyPostalCodeValidation(false)
                if(address?.countryShortCode){
                    const countryName = Country.getAllCountries().find((item:any)=>item.isoCode == address.countryShortCode);
                    const stateList = State.getStatesOfCountry(address.countryShortCode)
                    const stName = stateList && stateList.length && stateList.find((item:any)=>item.name.includes(address.state));
                    
                    setStateList(stateList && stateList.length?stateList:["No States"])
                    setCountry(countryName?countryName.name:"")
                    setProvinceValue(stName ? stName.name:"")
                }
            } else{
                setPlacesList([]);
            }
        }catch(error: any){

        }
    }

    const closeSideBar = () => {
        props.closeSideBar(false)
    }

    const cancelChanges=()=>{
        if(state.editMode){
            const messageData= {...confirmMessageBeforeLeave};
            setDialogMessage(messageData);
            setConfirmOpen(true);
        } else{
            closeSideBar();
        }
    }

    const handleConfirmBoxClose = () => {
        if(dialogMessage.text === confirmMessageBeforeLeave.text){ 
            setConfirmOpen(false);
        }else{
            props.refresh();
            closeSideBar();
        }
    }

    const detailsCompany = () => {
        if(dialogMessage.text === confirmMessageBeforeLeave.text){
            setConfirmOpen(false);
            closeSideBar();
        }else{
        history.push(`/base/companies/${createCompanyId}/details`);
        closeSideBar();
        location.reload();
        }
    } 

    const handleCompanyName = (event: any, newValue: any) => {
        setSelectedOption(newValue);
        if (typeof newValue === "string") {
          setValue({
            title: newValue
          });
        } else if (newValue && newValue.inputValue) {
          // Create a new value from the user input
          setValue({
            title: newValue.inputValue
          });
        } else {
          setValue(newValue);
        }
    };

    const handleUserDefinedChange = (e: any) => {
        if(!state.editMode){
            dispatch(setEditMode(true));
        }
        setuserDefinedValue((e.target.value).trim())
    }

    const handleCompanyId = (e: any) => {
        if(!state.editMode){
            dispatch(setEditMode(true));
        }
        setCompanyID((e.target.value).trim());
    }


    const addCompany = async (payload: any) => {
        try{
            dispatch(setIsLoading(true));
            const compananyResponse: any = await client.mutate({
                mutation: INSERT_NEW_COMPANY,
                variables:{
                    name: payload.CompanyName,
                    companyAliasName: payload.companyAliasName,
                    type: payload.CompanyType,
                    companyId: payload.companyId,
                    userId: decodeExchangeToken().userId,
                    location: payload.location
                },
                context:{role: tenantCompanyRole.createTenantCompany}
            })       
            if(compananyResponse.data.insert_company_mutation){
                addCompanyLocation(compananyResponse.data.insert_company_mutation.id)
                if(pathMatch.path.includes("teammates")){
                    props.closeSideBar()
                }
                else {
                    setCreateCompanyId(compananyResponse.data.insert_company_mutation.id)
                    Notification.sendNotification("Company created successfully", AlertTypes.success);
                    const msgData = {...confirmMessage}
                    setDialogMessage(msgData)
                    setConfirmOpen(true);
                }
          
            }
            dispatch(setIsLoading(false));
        }
        catch(err: any){
            dispatch(setIsLoading(false));
            Notification.sendNotification(err, AlertTypes.warn);
            console.log(err)
        }
    }

    const addCompanyWithParent = async (payload: any) => {
        try{
            dispatch(setIsLoading(true));
            const compananyResponse: any = await client.mutate({
                mutation: INSERT_NEW_COMPANY_WITH_PARENTT_ID,
                variables:{
                    name: payload.CompanyName,
                    companyAliasName: payload.companyAliasName,
                    type: payload.CompanyType,
                    masterCompanyId: payload.masterCompanyId,
                    companyId: payload.companyId,
                    location: payload.location
                },
                context:{role: tenantCompanyRole.createTenantCompany}
            })
            if(compananyResponse.data.insert_company_mutation){
                addCompanyLocation(compananyResponse.data.insert_company_mutation.id)
                if(pathMatch.path.includes("teammates")){
                    props.closeSideBar()
                }
                else {
                setCreateCompanyId(compananyResponse.data.insert_company_mutation.id)
                Notification.sendNotification("Company created successfully", AlertTypes.success);
                const msgData = {...confirmMessage}
                setDialogMessage(msgData)
                setConfirmOpen(true);
                }
            }
            dispatch(setIsLoading(false));
        }
        catch(err: any){
            dispatch(setIsLoading(false));
            Notification.sendNotification(err, AlertTypes.warn);
            console.log(err)
        }
    }

    const addCompanyLocation=async (argCompanyId: number)=>{
        try{
            await client.mutate({
                mutation: CREATE_COMPANY_LOCATION,
                variables:{object:{
                    addressLine1: selectedPlace?selectedPlace?.description:placesSearchText,
                    addressLine2: addressLine2 ||'',
                    city: city,
                    country:  country,
                    postalCode:  postalCode,
                    tenantCompanyId: argCompanyId,
                    state:  provinceValue,
                    streetNo:  streetNo,
                    fullAddress:selectedPlace?selectedPlace?.description:placesSearchText
                }},
                context: { role: tenantCompanyRole.createTenantCompany }
            });
        }catch(error: any){
            console.log(error);
        }
    }
    
    //fetch master company
    const fetchMasterCompanies = async()=>{
        try{
            const role= tenantCompanyRole.createTenantCompany;
            // dispatch(setIsLoading(true));
            const compananyResponse= await client.query({
                query:FETCH_MASTER_COMPANY,
                variables:{
                    limit: 1000,
                    offset: 0,
                    searchText: `%%`,
                    CompanyIds: props?.companyIds,
                    userId: decodeExchangeToken().userId,
                },
                fetchPolicy: 'network-only',
                context:{role}
            });
            const companies: Array<any>=[];
            if(compananyResponse.data.companyMaster?.length>0){
                companies.push(...compananyResponse.data.companyMaster);
            }
            setMasterCompany(companies);
            // dispatch(setIsLoading(false));
        }catch(error){
            console.log(error);
            // dispatch(setIsLoading(false));
        }
    }

    const handleTypeChange = (e: any) => {
        if(!state.editMode){
            dispatch(setEditMode(true));
        }
        setCompanyType((e.target.value)?.trim());
        if(e.target.value.trim()){
            setCompanyTypeValidation(false)
        }
    }

    const handleSubmit = () => {
        dispatch(setEditMode(false))
        if(!companyType){
            setCompanyTypeValidation(true)
        }

        if(!companyNameValue){
            setCompanyNameValidation(true)
        }

        if( !country || !postalCode || placesList.length ==0){
            if(placesList.length == 0){
                setCompanyAddressValidation(true)
            } 
            if(!country){
                setCompanyCountryValidation(true)
            }
            if(!postalCode){
                setCompanyPostalCodeValidation(true)
            }
            return;
        }
        let locationCordinates='0,0';
        if(Location){
            locationCordinates= `${Location?.lat||'0'},${Location?.lng||'0'}`;
        }
        if(companyNameValue && companyType){
            if(companyNameValue === value?.name){

                const payload = {
                    CompanyName : companyNameValue,
                    companyAliasName: userDefinedValue,
                    masterCompanyId: value?.id,
                    CompanyType: companyType,
                    companyId: companyID,
                    location:locationCordinates
                }

                addCompanyWithParent(payload)

            }
        }

        if(companyNameValue && companyType && value?.name){
            if(companyNameValue !== value?.name){
                const payload = {
                    CompanyName : companyNameValue,
                    companyAliasName: userDefinedValue,
                    CompanyType: companyType,
                    companyId: companyID,
                    location:locationCordinates
                }

                addCompany(payload)
            }
        }

        if(companyNameValue && companyType && (value === null)){
            // fetchMasterCompaniesByName(companyNameValue, companyType)
            // console.log('parent company exist')
            const payload = {
                CompanyName : companyNameValue,
                companyAliasName: userDefinedValue,
                CompanyType: companyType,
                companyId: companyID,
                location:locationCordinates
            }
            addCompany(payload)
        }
    }

    const handleCompanyNameOnBlur = (e: any) => {
        if(!state.editMode){
            dispatch(setEditMode(true));
        }
        setCompanyNameValue((e.target.value)?.trim())
        companyNameRequired((e.target.value)?.trim())
        //uniqueCompanyNameValidation((e.target.value)?.trim())
    }

    const companyNameRequired = (name: string) => {
        if(name){
            setCompanyNameValidation(false)
        }else{
            setCompanyNameValidation(true)
        }
    }

    const uniqueCompanyNameValidation= async(name: string)=>{
        try{
            const role= tenantCompanyRole.viewTenantCompanies;
            const companiessResponse= await client.query({
                query: FETCH_COMPANY_BY_NAME,
                variables:{
                    searchText: name,
                    userId: decodeExchangeToken().userId,
                },
                fetchPolicy: 'network-only',
                context:{role}
            });
            const companies: Array<any>=[];
            if(companiessResponse.data.tenantCompanyAssociation.length>0){
                companies.push(...companiessResponse.data.tenantCompanyAssociation);
            }

            if(companies.length > 0 ){
                setUniqueCompanyName(true)
            }else{
                setUniqueCompanyName(false)
            }
              

        }catch(error){
            console.log(error);
        }
    }

    const uniqueCompanyAliasNameValidation= async(name: string)=>{
        try{
            const role= tenantCompanyRole.viewTenantCompanies;
            const companiessResponse= await client.query({
                query: FETCH_COMPANY_BY_NAME,
                variables:{
                    searchText: name,
                    userId: decodeExchangeToken().userId,
                },
                fetchPolicy: 'network-only',
                context:{role}
            });
            const companies: Array<any>=[];
            if(companiessResponse.data.tenantCompanyAssociation.length>0){
                companies.push(...companiessResponse.data.tenantCompanyAssociation);
            }

            if(companies.length > 0 ){
                setUniqueAliasName(true)
            }else{
                setUniqueAliasName(false)
            }
              

        }catch(error){
            console.log(error);
        }
    }

    const uniqueCompanyIDValidation= async(name: string)=>{
        try{
            const role= tenantCompanyRole.viewTenantCompanies;
            const companiessResponse= await client.query({
                query: FETCH_COMPANY_BY_COMPANY_ID,
                variables:{
                    searchText: name,
                    userId: decodeExchangeToken().userId,
                },
                fetchPolicy: 'network-only',
                context:{role}
            });
            const companies: Array<any>=[];
            if(companiessResponse.data.tenantCompanyAssociation.length>0){
                companies.push(...companiessResponse.data.tenantCompanyAssociation);
            }

            if(companies.length > 0 ){
                setUniqueCompanyId(true)
            }else{
                setUniqueCompanyId(false)
            }
              

        }catch(error){
            console.log(error);
        }
    }

    const changeInOptionValue=(argValue: string)=>{
        setInputValue(argValue);
        if(!state.editMode){
            dispatch(setEditMode(true));
        }
        const selectedPlaceValue= placesList.find((item: any)=>item.description === argValue);
        if(selectedPlaceValue){
            setSelectedPlace(selectedPlaceValue);
        } else{
            setSelectedPlace(null);
        }
    }

    const changeInCountrytOptionValue=(e: any)=>{
        setCountry(e.target.value)
        setCompanyCountryValidation(false)
        const contVal = Country.getAllCountries().find((item:any)=>item.name == e.target.value)
        if(contVal){
            const stateList = State.getStatesOfCountry(contVal.isoCode)
            setStateList(stateList && stateList.length?stateList:["No States"])
        }
        if(!state.editMode){
            dispatch(setEditMode(true));
        }
    }

    const getRenderValue=(selected:any)=>{
        const val=stateList.find((item:any)=>{
          return item.name == selected
        })
        if (selected.length === 0 || !val) {
          return <div className="createCompany__wrapper__form__body__label__text">Select State</div>;
        }
        return selected;
      }

    return (
        <div className="createCompany">
            <div className="createCompany__left"></div>
            <div className="createCompany__wrapper">
                <div className="createCompany__wrapper__company-image">
                    <img className="img-responsive" src={companyIcon} alt="user" />
                    <span className="closeIcon">
                        <HighlightOffIcon data-testid={'close-sideBar'} onClick={cancelChanges}/>
                    </span>
                </div>
                <div className="createCompany__wrapper__form">
                    <div className="createCompany__wrapper__form__body">
                        <div className="createCompany__wrapper__form__body__header">
                            Add Company
                        </div>
                        <div className="createCompany__wrapper__form-wrapper">
                            <div  className="createCompany__wrapper__form__body__container">
                                <div className="createCompany__wrapper__form__body__label">
                                    <InputLabel required={true}>Name </InputLabel>
                                </div>
                                <div className="createCompany__wrapper__form__body__input-field">                                    
                                    <Autocomplete
                                        value={value}
                                        onChange={(event, newValue) => handleCompanyName(event, newValue)}
                                        onBlur={(event: any) => handleCompanyNameOnBlur(event)}
                                        selectOnFocus
                                        handleHomeEndKeys
                                        id="free-solo-with-text-demo"
                                        options={masterCompany}
                                        getOptionLabel={(option) => {
                                            // Value selected with enter, right from the input
                                            if (typeof option === "string") {
                                                return option;
                                            }
                                            // Add "xxx" option created dynamically
                                            if(option.inputValue) {
                                                return option.inputValue;
                                            }
                                            // Regular option

                                            return option.name;
                                        }}
                                        renderOption={(option) => option.name}
                                        freeSolo
                                        renderInput={(params) => (
                                            <TextField {...params} 
                                            // onChange={(event, newValue) => handleCompanyName(event, newValue)}
                                            placeholder="Enter / Select Company" />
                                        )}
                                    />
                                    <div className="createCompany__error-wrap">
                                            <p className="createCompany__error-wrap__message">
                                                {
                                                     companyNameValidation ? (
                                                        <span>Company name is required</span>
                                                    ) : (
                                                        (uniqueCompanyName && !userDefinedValue) && (
                                                            <span>*Company name already exists. Add a unique alias </span>
                                                        )
                                                    )
                                                }
                                            </p>
                                    </div>
                                </div>
                            </div>

                            <div  className="createCompany__wrapper__form__body__container">
                                <div className="createCompany__wrapper__form__body__label">
                                    <InputLabel required={false}>
                                         Company Alias
                                    </InputLabel>
                                    {/* <div className="createCompany__wrapper__form__body__label__icon"><InfoIcon /></div> */}
                                </div>
                                <div className="createCompany__wrapper__form__body__input-field">
                                    <TextField
                                        type="text"
                                        fullWidth
                                        autoComplete='off'
                                        placeholder='Type your Company Name'
                                        onChange={(e) => handleUserDefinedChange(e)}
                                    />  
                                    <div className="createCompany__error-wrap">
                                            <p className="createCompany__error-wrap__message">
                                                {
                                                     uniqueAliasName && (
                                                        <span>This alias already exists in the tenant</span>
                                                     )
                                                }
                                            </p>
                                    </div>                  
                                </div>
                            </div>


                            <div  className="createCompany__wrapper__form__body__container">
                                <div className="createCompany__wrapper__form__body__label">
                                    <InputLabel required={true}>Type  </InputLabel>
                                </div>
                                <div className="createCompany__wrapper__form__body__input-field">
                                        <Select 
                                            id="custom-dropdown"
                                            fullWidth
                                            autoComplete='off'
                                            displayEmpty
                                            onChange={(e) => handleTypeChange(e)}
                                            renderValue={
                                                companyType !== "" ? undefined : () => <div className="createCompany__wrapper__form__body__label__text">Select Type</div>
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
                                            {/* <MenuItem className={classes.root} id="custom-list" value=""><em>None</em></MenuItem> */}
                                            {
                                                companyTypesLists?.map((type: any) => (
                                                    <MenuItem className="mat-menu-item-sm"
                                                         key={type.id} value={type.nodeName}>{type.nodeName}</MenuItem>
                                                ))
                                            }
                                        </Select>                    
                                    <div className="createCompany__error-wrap">
                                        <p className="createCompany__error-wrap__message">
                                            {
                                                companyTypeValidation && (
                                                    <span>Type is required</span>
                                                )
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div  className="createCompany__wrapper__form__body__container">
                                <div className="createCompany__wrapper__form__body__label">
                                    <InputLabel required={true}>Address Line 1  </InputLabel>
                                </div>
                                <div className="createCompany__wrapper__form__body__input-field">
                                    <Autocomplete
                                        freeSolo
                                        id="free-solo-2-demo"
                                        disableClearable
                                        value={inputValue}
                                        onChange={(event, newValue) => {
                                          changeInOptionValue(newValue);
                                        }}
                                        inputValue={placesSearchText}
                                        onInputChange={(event, newInputValue) => {
                                            setPlacesSearchText(newInputValue);
                                            setCompanyAddressValidation(false)
                                        }}
                                        options={placesList.map((option: any) => option.description)}
                                        renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label=""
                                            margin="normal"
                                            placeholder='Enter Address'
                                            InputProps={{ ...params.InputProps, type: 'search' }}
                                        />
                                        )}
                                    />                                    
                                    <div className="createCompany__error-wrap">
                                        <p className="createCompany__error-wrap__message">
                                            {
                                                companyAddressValidation && (
                                                    <span>Address is required</span>
                                                )
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div  className="createCompany__wrapper__form__body__container">
                                <div className="createCompany__wrapper__form__body__label">
                                    <InputLabel required={false}>
                                        Address Line 2
                                    </InputLabel>
                                </div>
                                <div className="createCompany__wrapper__form__body__input-field">
                                            <TextField
                                                value={addressLine2}
                                                type="text"
                                                fullWidth
                                                autoComplete='off'
                                                placeholder='Enter Address Line 2'
                                                onChange={(e) =>{ setAddressLine2((e.target.value).trim());        
                                                    if(!state.editMode){
                                                    dispatch(setEditMode(true));
                                                }}}
                                            />   
                                    <div className="createCompany__error-wrap">
                                            <p className="createCompany__error-wrap__message">

                                            </p>
                                    </div>                  
                                </div>
                            </div>

                            <div  className="createCompany__wrapper__form__body__container">
                                <div className="createCompany__wrapper__form__body__label">
                                    <InputLabel required={true}>Country  </InputLabel>
                                </div>
                                <div className="createCompany__wrapper__form__body__input-field">
                                        <Select 
                                            id="custom-dropdown"
                                            fullWidth
                                            autoComplete='off'
                                            displayEmpty
                                            value = {country}
                                            onChange={(e:any) =>
                                                changeInCountrytOptionValue(e)
                                              }
                                              renderValue={
                                                country !== "" ? undefined : () => <div className="createCompany__wrapper__form__body__label__text">Select Country</div>
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
                                                Country.getAllCountries()?.map((type: any) => (
                                                    <MenuItem className="mat-menu-item-sm"
                                                         key={type.flag} value={type.name}>{type.name}</MenuItem>
                                                ))
                                            }
                                        </Select>                    
                                    <div className="createCompany__error-wrap">
                                        <p className="createCompany__error-wrap__message">
                                            {
                                                companyCountryValidation && (
                                                    <span>Country is required</span>
                                                )
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div  className="createCompany__wrapper__form__body__container">
                                <div className="createCompany__wrapper__form__body__label">
                                    <InputLabel required={false}>State / Province   </InputLabel>
                                </div>
                                <div className="createCompany__wrapper__form__body__input-field">
                                        <Select 
                                            id="custom-dropdown"
                                            fullWidth
                                            autoComplete='off'
                                            displayEmpty
                                            value = {provinceValue}
                                            onChange={(e:any) =>{
                                                if(!state.editMode){
                                                    dispatch(setEditMode(true));
                                                }
                                                setProvinceValue(e.target.value)
                                            }}
                                            renderValue={
                                                (selected: any) => getRenderValue(selected)
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
                                </div>
                            </div>


                            <div  className="createCompany__wrapper__form__body__container">
                                <div className="createCompany__wrapper__form__body__label">
                                    <InputLabel required={false}>
                                    City / Locality
                                    </InputLabel>
                                </div>
                                <div className="createCompany__wrapper__form__body__input-field">
                                            <TextField
                                                value={city}
                                                type="text"
                                                fullWidth
                                                autoComplete='off'
                                                placeholder='Enter City'
                                                onChange={(e) => {setCompanyCityValidation(false);setCity((e.target.value).trim())
                                                    if(!state.editMode){
                                                        dispatch(setEditMode(true));
                                                    }
                                                }}
                                            />   
                                    <div className="createCompany__error-wrap">
                                            <p className="createCompany__error-wrap__message">
                                            {
                                                companyCityValidation && (
                                                    <span>City is required</span>
                                                )
                                            }
                                            </p>
                                    </div>                  
                                </div>
                            </div>


                            <div  className="createCompany__wrapper__form__body__container">
                                <div className="createCompany__wrapper__form__body__label">
                                    <InputLabel required={true}>
                                    Zip / Postcode  
                                    </InputLabel>
                                </div>
                                <div className="createCompany__wrapper__form__body__input-field">
                                            <TextField
                                                value={postalCode}
                                                type="text"
                                                fullWidth
                                                autoComplete='off'
                                                placeholder='Enter Zip / Postcode'
                                                onChange={(e) => {setCompanyPostalCodeValidation(false);setPostalCode((e.target.value).trim())
                                                    if(!state.editMode){
                                                        dispatch(setEditMode(true));
                                                    }
                                                }}
                                            />   
                                    <div className="createCompany__error-wrap">
                                            <p className="createCompany__error-wrap__message">
                                            {
                                                companyPostalCodeValidation && (
                                                    <span>Postcode is required</span>
                                                )
                                            }
                                            </p>
                                    </div>                  
                                </div>
                            </div>

                            <div  className="createCompany__wrapper__form__body__container">
                                <div className="createCompany__wrapper__form__body__label">
                                    <InputLabel required={false}>
                                         Company ID
                                    </InputLabel>
                                    {/* <div className="createCompany__wrapper__form__body__label__icon"><InfoIcon /></div> */}
                                </div>
                                <div className="createCompany__wrapper__form__body__input-field">
                                    <TextField
                                        type="text"
                                        fullWidth
                                        autoComplete='off'
                                        placeholder='Enter your Company ID'
                                        onChange={(e) => handleCompanyId(e)}
                                    />  
                                    <div className="createCompany__error-wrap">
                                            <p className="createCompany__error-wrap__message">
                                                {
                                                     uniqueCompanyId && (
                                                        <span>Company ID already exists in the tenant</span>
                                                     )
                                                }
                                            </p>
                                    </div>                  
                                </div>
                            </div>

                        </div>
                        
                        
                    </div>
                    <div className="createCompany__wrapper__form__action">
                        <Button data-testid={'cancel-create'} variant="outlined" onClick={cancelChanges}>
                            Cancel
                        </Button>
                        <Button 
                                type="submit" 
                                data-testid={'create-company'} 
                                variant="outlined"
                                className="company-primary"
                                disabled={(uniqueCompanyName && !userDefinedValue)   || uniqueAliasName || uniqueCompanyId}
                                onClick={handleSubmit}
                            >
                            Create 
                        </Button>
                    </div>
                </div>
            </div>

            {
                confirmOpen ? (
                    <ConfirmDialog open={confirmOpen} message={dialogMessage} close={handleConfirmBoxClose} proceed={detailsCompany} />
                ) : ('')
            }
        </div>  
    )
}
