import React, { ReactElement, useContext, useEffect, useState } from 'react';
import Button from '@material-ui/core/Button';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import companyIcon from '../../../../../assets/images/project.svg';
import { stateContext } from '../../../../root/context/authentication/authContext';
import { match, useRouteMatch } from 'react-router-dom';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { CustomPopOver } from '../../../../shared/utils/CustomPopOver';
import './CompanyInfo.scss';
import { CompanyDetailsContext } from '../../Context/CompanyDetailsContext';
import { setCompanyDetailsDirty, setCompanyInfo } from '../../Context/CompanyDetailsAction';
import { useDebounce } from '../../../../../customhooks/useDebounce';
import { tenantCompanyRole } from '../../../../../utils/role';
import { client } from '../../../../../services/graphql';
import { FETCH_COMPANY_BY_NAME } from '../../graphql/queries/companies';
import { decodeExchangeToken } from '../../../../../services/authservice';
import { updateTenantCompany, updateTenantCompanyStatus } from '../../../roles/utils/permission';
import { Autocomplete } from '@material-ui/lab';
import { axiosApiInstance } from 'src/services/api';
import { extractAddressFromProject, fetchAddressComponents } from 'src/modules/baseService/projects/utils/helper';
import { Grid, makeStyles} from '@material-ui/core';
import { Country, State, City }  from 'country-state-city';
export interface Params {
    companyId: string;
}

const defaultValues: any ={
    MaterCompanyName: '',
    CompanyName: '',
    CompanyType: '',
    CompanyAddress:'',
    country:'',
    state:''
};

export default function CompanyInfo(props: any): ReactElement {
    
    const {dispatch , state}:any = useContext(stateContext);
    const pathMatch:match<Params>= useRouteMatch();
    const classes = CustomPopOver();
    const [companyNameValue, setCompanyNameValue] = useState(''); 
    const debounceCompanyName = useDebounce(companyNameValue, 700);
    const [isDisableCreateBtn, setIsDisableCreateBtn] = useState(false);
    const {companyDetailsState, companyDetailsDispatch}: any = useContext(CompanyDetailsContext);
    const [isUniqueCompanyName, setisUniqueCompanyName] = useState(false);
    const [typeLists, setTypeLists] = useState<Array<any>>([]);
    const [placesList, setPlacesList] = useState<Array<any>>([]);
    const [placesSearchText, setPlacesSearchText] = useState(''); 
    const debouncePlacesSearchText = useDebounce(placesSearchText, 300);
    const [inputValue, setInputValue] = React.useState("");
    const [selectedPlace, setSelectedPlace] = useState<any>(null);
    const [Location, setLocation] = useState<any>(null);
    const [addressId, setAddressId] = useState(-1);
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
        if(props?.companyTypeLists?.length > 0){
            updateCustomList(props?.companyTypeLists)
        }
    }, [props?.companyTypeLists])

    useEffect(() => {
       if(companyDetailsState?.companyDetails.length > 0){
            setFormValue(companyDetailsState?.companyDetails);
            updateCustomList(props?.companyTypeLists)
        }
    }, [companyDetailsState?.companyDetails]);

    useEffect(() => {
        if(companyDetailsState?.companyDetails && companyDetailsState?.companyDetails?.length){
             setAddressFormValue();
         }
     }, [companyDetailsState?.companyDetails])

    useEffect(() => {
        disableCreatebtn();
    }, [watchAllFields]);

    useEffect(() => {
        if(companyNameValue){
            uniqueCompanyNameValidation();
        }else{
            clearErrors("CompanyName")
            setisUniqueCompanyName(false)
        }
    }, [debounceCompanyName]);

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

     const updateCustomList = (companyTypeLists:any)=>{
        const typeListArr = companyTypeLists.filter((item:any,index:any)=>{
            if(item.deleted){
                if(item.nodeName == companyDetailsState?.companyDetails[0]?.type)
                 return item
            }else{
                return item
            }
        })
        setTypeLists(typeListArr)
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
                setValue('addressLine1',selectedPlace.description);
                setValue('city',address.city);
                setValue('postalcode',address.pinCode);
                setValue('streetno',address.streetNo);
                setLocation({lat:response.data.success.geometry.location.lat,lng:response.data.success.geometry.location.lng})
                clearErrors("city");
                clearErrors("country");
                clearErrors("postalcode");
                clearErrors("state");
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


    const setAddressFormValue=()=>{
        try{
           const { addressLine1,
            addressLine2,
            streetNo,
            city,
            state,
            country,
            postalCode,
            id}=  extractAddressFromProject(companyDetailsState?.companyDetails[0]);
            const fullAddress = companyDetailsState?.companyDetails[0] && companyDetailsState?.companyDetails[0]?.addresses && companyDetailsState?.companyDetails[0]?.addresses.length
            && companyDetailsState?.companyDetails[0]?.addresses[0]?.fullAddress?companyDetailsState?.companyDetails[0]?.addresses[0].fullAddress:"";
           setValue('addressLine1',addressLine1);
           setValue('addressLine2',addressLine2);
           setValue('streetno',streetNo);
           setValue('city',city);
           setValue('country',country);
           setValue('state',state);
           setValue('postalcode',postalCode);
           setValue('CompanyAddress', addressLine1, { shouldValidate: true });
           setInputValue(fullAddress?fullAddress:addressLine1);
           setAddressId(id); 
           const contVal = Country.getAllCountries().find((item:any)=>item.name == country)
           if(contVal){
               const stateList = State.getStatesOfCountry(contVal.isoCode)
               setStateList(stateList && stateList.length?stateList:["No States"])
           }
           let locationValue={lat:0,lng:0}
            if(companyDetailsState?.companyDetails[0]?.location){
                const cordinates= companyDetailsState?.companyDetails[0]?.location.split(',');
                if(cordinates.length>1){
                    locationValue={lat: cordinates[0].replace('(',''),lng: cordinates[1].replace(')','')};
                }
            }
           setLocation(locationValue)
        }catch(error: any){

        }
    }

    const onSubmit: SubmitHandler<any> = (value: any) => {
        if(placesList && placesList.length ==0){
            setError("CompanyAddress", {
                type: "empty",
                message: "* CompanyAddress required",
            })
            return;
        }else {
            clearErrors("CompanyAddress")
        }
        if(validateFormFieldsBeforeSave(getValues())>0){
            return
        }
        props.updateCompany(addressId,getValues(),Location);
    }

    const validateFormFieldsBeforeSave=(argValue: any): number=>{
        let count=0;
        if(!argValue.country.trim()){
            setError("country", {type: "required"});
            count++;
        }
        if(!argValue.postalcode.trim()){
            setError("postalcode", {type: "required"});
            count++;
        }
        return count;
    }

    const handleCompanyName = (e: any) => {
        companyDetailsDispatch(setCompanyDetailsDirty(true));
        setCompanyNameValue(e.target.value.trim());
        dispatchInfo();
    }

    const handleCompanyType = (e: any) => {
        companyDetailsDispatch(setCompanyDetailsDirty(true));
        dispatchInfo();
    }

    const dispatchInfo = () => {
        const values: any = getValues();
        const projectInfo: any =  {
            CompanyType: values.CompanyType,
            CompanyName: (values.CompanyName)?.trim(),
            tenantId: companyDetailsState.companyInfo.tenantId,
            active: companyDetailsState.companyInfo.active,
        }
        companyDetailsDispatch(setCompanyInfo(projectInfo));
    }       

    const setFormValue = (value: any) => {
        setValue('MaterCompanyName', value[0]?.companyMaster?.name||'', { shouldValidate: true });
        setValue('CompanyName', value[0]?.name, { shouldValidate: true });
        setValue('CompanyType', value[0]?.type, { shouldValidate: true });
    }

    
    const navigateback = () => {
        props.navBack();
    }

    const uniqueCompanyNameValidation= async()=>{
        try{
            const role= tenantCompanyRole.viewTenantCompanies;
            const companiessResponse= await client.query({
                query: FETCH_COMPANY_BY_NAME,
                variables:{
                    searchText: `${debounceCompanyName}`,
                    userId: decodeExchangeToken().userId,
                },
                fetchPolicy: 'network-only',
                context:{role}
            });
            const companies: Array<any>=[];
            if(companiessResponse.data.tenantCompanyAssociation.length>0){
                companies.push(...companiessResponse.data.tenantCompanyAssociation);
            }

            if(companies.length > 0 && companies[0].id !==  Number(pathMatch?.params?.companyId)){
                setError("CompanyName", {
                    type: "unique",
                    message: "* Company name already exists",
                })
                setisUniqueCompanyName(true)
            }else{
                clearErrors("CompanyName")
                setisUniqueCompanyName(false)
            }
              

        }catch(error){
            console.log(error);
        }
    }

    const disableCreatebtn = () => {
        if(Object.keys(errors).length > 0){
            setIsDisableCreateBtn(true)
        }else{
            setIsDisableCreateBtn(false)
        } 
    }

    const handlecompanyStatus = () => {
        props.companyStatus()
    }

    const changeInOptionValue=(argValue: string)=>{
        setInputValue(argValue);
        clearErrors("CompanyAddress")
        const selectedPlaceValue= placesList.find((item: any)=>item.description === argValue);
        if(selectedPlaceValue){
            setSelectedPlace(selectedPlaceValue);
        } else{
            setSelectedPlace(null);
        }
    }
    const updateStateList = (argValue:any)=>{
        const contVal= Country.getAllCountries().find((item:any)=>item.name == argValue)
        if(contVal){
            const stateList = State.getStatesOfCountry(contVal.isoCode)
            setStateList(stateList && stateList.length?stateList:["No States"])
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

      
    const getCompanyTypeRenderValue=(selected:any)=>{
        const val=typeLists.find((item:any)=>{
          return item.nodeName == selected
        })
        if ( !val) {
          return <div>{selected}</div>;
        }
        return selected;
      }

    return (
        <div className="companyInfo__wrapper">
                <div className="companyInfo__wrapper__company-image">
                    <img className="img-responsive" src={companyIcon} alt="user" />
                </div>
                <form className="companyInfo__wrapper__form" onSubmit={handleSubmit(onSubmit)}>
                    <div className="companyInfo__wrapper__form__body">
                        <div className="companyInfo__wrapper__form__body__header">
                            <div>Company Info</div>
                            {
                                updateTenantCompanyStatus &&
                                    (companyDetailsState?.companyInfo && (
                                    <div>
                                        <Button
                                        size="small"
                                        data-testid={"activate-company"}
                                        variant="outlined"
                                        className="company-primary"
                                        onClick={handlecompanyStatus}
                                        disabled={
                                            companyDetailsState?.companyInfo?.active &&
                                            companyDetailsState?.companyInfo?.defaultCompany
                                        }
                                        >
                                        {companyDetailsState?.companyInfo?.active ? "Deactivate" : "Activate"}
                                        </Button>
                                    </div>
                                    ) )
                                }
                        </div>
                        <div className="companyInfo__wrapper__form-wrapper">

                            <Grid container className="companyInfo__wrapper__form__body__container">
                                <Grid item xs={4} className="companyInfo__wrapper__form__body__label">
                                    <InputLabel>Name </InputLabel>
                                </Grid>
                                <Grid item xs={8} className="companyInfo__wrapper__form__body__input-field">
                                    <Controller 
                                        render={({ field }:{field:any}) => (
                                            <TextField
                                                type="text"
                                                {...field}
                                                fullWidth
                                                autoComplete='off'
                                                placeholder=''
                                                disabled = {true}
                                            />                      
                                        )}
                                        name="MaterCompanyName"
                                        control={control}
                                    />
                                </Grid>
                            </Grid>
                            
                            <Grid container  className="companyInfo__wrapper__form__body__container">
                                <Grid item xs={4} className="companyInfo__wrapper__form__body__label">
                                    <InputLabel required={true}>Company alias</InputLabel>
                                </Grid>
                                <Grid item xs={8} className="companyInfo__wrapper__form__body__input-field">
                                    <Controller 
                                        render={({ field }:{field:any}) => (
                                            <TextField
                                                type="text"
                                                {...field}
                                                fullWidth
                                                autoComplete='off'
                                                placeholder='Type your Company Name'
                                                disabled={!updateTenantCompany || !companyDetailsState?.companyInfo?.active}
                                                onChange={(e) => {field.onChange(e), handleCompanyName(e)}}
                                            />                      
                                        )}
                                        name="CompanyName"
                                        control={control}
                                        rules={{
                                            required: true
                                            // validate: isUniqueProjectName
                                        }}
                                    />
                                    <div className="companyInfo__wrapper__error-wrap">
                                            <p className="createCompany__error-wrap__message">
                                                {
                                                    errors.CompanyName?.type === "required" ? (
                                                        <span>Company alias required</span>
                                                    ) : (
                                                        errors.CompanyName?.type === "unique" && (
                                                            <span>* Company alias already exists</span>
                                                        )
                                                    )
                                                }
                                            </p>
                                    </div>
                                </Grid>
                            </Grid>

                                <Grid container  className="companyInfo__wrapper__form__body__container">
                                    <Grid item xs={4} className="companyInfo__wrapper__form__body__label">
                                        <InputLabel required={true}>Type  </InputLabel>
                                    </Grid>
                                    {updateTenantCompany?(
                                    <Grid xs={8} className="companyInfo__wrapper__form__body__input-field">
                                        <Controller 
                                            render={({ field }:{field:any}) => (
                                                <Select
                                                    id="custom-dropdown"
                                                    fullWidth
                                                    {...field}
                                                    // disabled={true}
                                                    autoComplete='off'
                                                    placeholder="select a value"
                                                    disabled={!updateTenantCompany || !companyDetailsState?.companyInfo?.active}
                                                    onChange={(e) => {field.onChange(e), handleCompanyType(e)}}
                                                    displayEmpty
                                                    renderValue={
                                                        (selected: any) => getCompanyTypeRenderValue(selected)
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
                                                        typeLists.map((type: any) => (
                                                            type?.deleted ?
                                                            <MenuItem key={type.id} disabled value={type.nodeName} className="mat-menu-item-sm">
                                                            {type.nodeName}</MenuItem>
                                                            :  <MenuItem key={type.id} value={type.nodeName} className="mat-menu-item-sm">
                                                            {type.nodeName}</MenuItem>
                                                        ))
                                                    }
                                                </Select>
                                            )}
                                            name="CompanyType"
                                            control={control}
                                            rules={{
                                                required: true
                                            }}
                                        />
                                        <div className="companyInfo__wrapper__error-wrap">
                                            <p className="createCompany__error-wrap__message">
                                                {
                                                    errors.CompanyType?.type === "required" && (
                                                        <span>Type is required</span>
                                                    )
                                                }
                                            </p>
                                        </div>
                                    </Grid>  
                                ):(
                                    <Grid xs={8} className="companyInfo__wrapper__form__body__input-field">
                                        <div className="companyInfo__wrapper__form__body__input-field__view">
                                        {companyDetailsState?.companyDetails[0]?.type}
                                        </div>
                                    </Grid>
                                )}
                               </Grid>
                               <Grid container className="companyInfo__wrapper__form__body__container">
                                    <Grid item xs={4}className="companyInfo__wrapper__form__body__label">
                                        <InputLabel required={true}>Address  Line 1</InputLabel>
                                    </Grid>
                                <Grid item xs={8} className="companyInfo__wrapper__form__body__input-field">
                                    <Autocomplete
                                        freeSolo
                                        id="free-solo-2-demo"
                                        disableClearable 
                                        value={inputValue}
                                        title = {inputValue}
                                        onChange={(event, newValue) => {
                                          changeInOptionValue(newValue);
                                        }}
                                        inputValue={placesSearchText}
                                        onInputChange={(event, newInputValue) => {
                                            setPlacesSearchText(newInputValue);
                                            clearErrors("CompanyAddress")
                                        }}
                                        options={placesList.map((option: any) => option.description)}
                                        renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label=""
                                            margin="normal"
                                            placeholder='Enter Address'
                                            InputProps={{ ...params.InputProps, type: 'search'}}
                                        />
                                        )}
                                    />           
                                    <div className="companyInfo__wrapper__error-wrap">
                                            <p className="createCompany__error-wrap__message">
                                                {
                                                    errors.CompanyAddress?.type ===  "empty" && (
                                                        <span>Address is required</span>
                                                    )
                                                }
                                            </p>
                                    </div>
                                </Grid>
                            </Grid>


                            <Grid container className="companyInfo__wrapper__form__body__container">
                                    <Grid item xs={4}className="companyInfo__wrapper__form__body__label">
                                        <InputLabel required={false}>Address Line 2  </InputLabel>
                                    </Grid>
                                <Grid item xs={8} className="companyInfo__wrapper__form__body__input-field">
                                    <Controller 
                                        render={({ field }:{field:any}) => (
                                            <TextField
                                                disabled={!updateTenantCompany || !companyDetailsState?.companyInfo?.active}
                                                type="text"
                                                {...field}
                                                fullWidth
                                                autoComplete='off'
                                                placeholder='Enter Address Line 2'
                                                onChange={(e) => field.onChange(e)}
                                            />                      
                                        )}
                                        name= "addressLine2"
                                        control={control}
                                        rules={{
                                            required: false
                                        }}
                                    />    
                                    <div className="companyInfo__wrapper__error-wrap">
                                    </div>
                                </Grid>
                            </Grid>

                            <Grid container  className="companyInfo__wrapper__form__body__container">
                                    <Grid item xs={4} className="companyInfo__wrapper__form__body__label">
                                        <InputLabel required={true}>Country  </InputLabel>
                                    </Grid>
                                    <Grid xs={8} className="companyInfo__wrapper__form__body__input-field">
                                        <Controller 
                                            render={({ field }:{field:any}) => (
                                                <Select
                                                    id="custom-dropdown"
                                                    fullWidth
                                                    {...field}
                                                    autoComplete='off'
                                                    placeholder="select a value"
                                                    disabled={!updateTenantCompany || !companyDetailsState?.companyInfo?.active}
                                                    onChange={(e) => {field.onChange(e.target.value as string[]);
                                                        updateStateList(e.target.value)}}
                                                    //renderValue={(selected: Array<number>) => getRenderValue(selected)}
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
                                        <div className="companyInfo__wrapper__error-wrap">
                                            <p className="createCompany__error-wrap__message">
                                            {
                                                errors.country?.type ===  "required" && (
                                                    <span>* Country is required</span>
                                                )
                                            }
                                            </p>
                                        </div>
                                    </Grid>  
                               </Grid>

                              <Grid container  className="companyInfo__wrapper__form__body__container">
                                    <Grid item xs={4} className="companyInfo__wrapper__form__body__label">
                                        <InputLabel required={false}>State / Province  </InputLabel>
                                    </Grid>
                                    <Grid xs={8} className="companyInfo__wrapper__form__body__input-field">
                                        <Controller 
                                            render={({ field }:{field:any}) => (
                                                <Select
                                                    id="custom-dropdown"
                                                    fullWidth
                                                    {...field}
                                                    autoComplete='off'
                                                    displayEmpty
                                                    disabled={!updateTenantCompany || !companyDetailsState?.companyInfo?.active}
                                                    onChange={(e) => field.onChange(e.target.value as string[])}
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
                                            )}
                                            name= "state"
                                            control={control}
                                            rules={{
                                                required: false
                                            }}
                                        />
                                        <div className="companyInfo__wrapper__error-wrap">
                                            <p className="createCompany__error-wrap__message">
                                            {
                                                errors.state?.type ===  "required" && (
                                                    <span>* State is required</span>
                                                )
                                            }
                                            </p>
                                        </div>
                                    </Grid>  
                               </Grid> 

                            <Grid container  className="companyInfo__wrapper__form__body__container">
                                <Grid item xs={4} className="companyInfo__wrapper__form__body__label">
                                    <InputLabel required={false}>City / Locality </InputLabel>
                                </Grid>
                                <Grid item xs={8} className="companyInfo__wrapper__form__body__input-field">
                                    <Controller 
                                        render={({ field }:{field:any}) => (
                                            <TextField
                                                disabled={!updateTenantCompany || !companyDetailsState?.companyInfo?.active}
                                                type="text"
                                                {...field}
                                                fullWidth
                                                autoComplete='off'
                                                placeholder='Enter City'
                                                onChange={(e) => field.onChange(e)}
                                            />                      
                                        )}
                                        name= "city"
                                        control={control}
                                        rules={{
                                            required: false
                                        }}
                                    />
                                    <div className="companyInfo__wrapper__error-wrap">
                                        <p className="createCompany__error-wrap__message">
                                            {
                                                errors.city?.type ===  "required" && (
                                                    <span>* City is required</span>
                                                )
                                            }
                                        </p>
                                    </div>
                                </Grid>
                            </Grid>


                            <Grid container  className="companyInfo__wrapper__form__body__container">
                                <Grid item xs={4} className="companyInfo__wrapper__form__body__label">
                                    <InputLabel required={true}> Zip / Postcode</InputLabel>
                                </Grid>
                                <Grid item xs={8} className="companyInfo__wrapper__form__body__input-field">
                                    <Controller 
                                        render={({ field }:{field:any}) => (
                                            <TextField
                                                disabled={!updateTenantCompany || !companyDetailsState?.companyInfo?.active}
                                                type="text"
                                                {...field}
                                                fullWidth
                                                autoComplete='off'
                                                placeholder='Enter Zip / Postcode'
                                                onChange={(e) => field.onChange(e)}
                                            />                      
                                        )}
                                        name= "postalcode"
                                        control={control}
                                        rules={{
                                            required: true
                                        }}
                                    />
                                    <div className="companyInfo__wrapper__error-wrap">
                                        <p className="createCompany__error-wrap__message">
                                            {
                                                errors.postalcode?.type ===  "required" && (
                                                    <span>* Postcode is required</span>
                                                )
                                            }
                                        </p>
                                    </div>
                                </Grid>
                            </Grid>
                        </div>
                        
                        
                    </div>
                    {updateTenantCompany &&(
                        <div className="companyInfo__wrapper__form__action">
                        <Button data-testid={'cancel-update'} variant="outlined" onClick={navigateback}>
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            data-testid={'update-company'} 
                            variant="outlined"
                            className="btn-primary"
                            disabled={isDisableCreateBtn || companyDetailsState.companyValidation ||
                            companyDetailsState.companyIDValidation || !companyDetailsState?.companyInfo?.active}>
                            Update 
                        </Button>
                    </div>
                    )}
                </form>
            </div>
    )
}
