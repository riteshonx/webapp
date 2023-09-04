import React, { ReactElement, useState, useEffect, useContext } from "react";
import { makeStyles } from "@material-ui/styles";
import { Button, Dialog, TextField } from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import { FETCH_MASTER_COMPANY } from "../../../baseService/companies/graphql/queries/companies";
import { Autocomplete } from "@material-ui/lab";
import axios from "axios";
import Notify, { AlertTypes } from "../../../shared/components/Toaster/Toaster";
import { IconButton, Grid, Switch as SwitchUI } from "@material-ui/core";
import { AdminRoles } from "../../../../utils/role";
import {
  decodeExchangeToken,
  getExchangeToken,
} from "../../../../services/authservice";
import { stateContext } from "../../context/authentication/authContext";
import { setIsLoading } from "../../context/authentication/action";
import { client } from "../../../../services/graphql";
import ResponseCode from "../../../../utils/errorCodeForMessage";
import SlateLogo from "../../../../assets/images/SlateBlackLogo.png";
import { useDebounce } from "src/customhooks/useDebounce";
import { axiosApiInstance } from 'src/services/api';
import { fetchAddressComponents } from "src/modules/baseService/projects/utils/helper";

const useStyles: any = makeStyles((theme: any) => ({
  dialogPaper: {
    display: "flex",
    background: "linear-gradient(132.77deg, #FCFCFC 11.98%, #F1F1F1 111.18%)",
    border: "0.5px solid #FFFFFF",
    boxSizing: "border-box",
    boxShadow:
      "0px 2px 1px -1px rgba(180, 179, 189, 0.35), 2px 0px 1px rgba(180, 179, 189, 0.24), 0px 2px 8px rgba(180, 179, 189, 0.5), inset 1px 2px 0px #FFFFFF",
    borderRadius: "3px",
    minWidth: "40rem",
    minHeight: "47rem",
    padding: "2.5rem 2rem",
  },
  closeButton: {
    position: "absolute",
    right: "1px",
    top: "1px",
    fontSize: "1rem !important",
    color: theme.palette.grey[500],
  },
  button: {
    marginTop: theme.spacing(12),
    color: "black !important",
    textTransform: "none",
    fontWeight: 400,
  },
  textField: {
    backgroundColor:
      "linear-gradient(132.77deg, #FCFCFC 11.98%, #F1F1F1 111.18%)",
    "& .MuiFilledInput-input ": {
      padding: "20px 12px 10px",
    },
    "& .MuiFilledInput-root": {
      backgroundColor:
        "linear-gradient(132.77deg, #FCFCFC 11.98%, #F1F1F1 111.18%)",
    },
    "& .MuiFormLabel-root": {
      fontSize: "1.2rem",
      fontWeight: "300",
      color: "#42414169",
    },
    "& .MuiOutlinedInput-input ": {
      padding: " 18.5px 14px",
    },
  },
}));

function AddTenantDialog({
  openDialog,
  companyIds,
  showAddTenant,
  handleClose,
}: any): ReactElement {
  const { dispatch, state:dashboardType }: any = useContext(stateContext);
  const dialogClasses = useStyles();
  const [userEmail, setUserEmail] = useState("");
  const [masterCompany, setMasterCompany] = useState<Array<any>>([]);
  const [companyName, setCompanyName] = React.useState<any | null>(null);
  const [hasNoUseremail, setHasNoUseremail] = useState(false);
  const [hasNoCompanyName, setHasNoCompanyName] = useState(false);
  const [hasError, setHasError] = useState<null | boolean>(false);
  const [error, setError] = useState<any>("");
  const [companyId, setCompanyId] = React.useState<any>("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [firstNameError, setFirstNameError] = useState(false);
  const [lastNameError, setLastNameError] = useState(false);
  const [jobTitleError, setJobTitleError] = useState(false);
  const [disableFirstName, setDisableFirstName] = useState(false);
  const [disableLastName, setDisableLastName] = useState(false);
  const [disableJobTitle, setDisableJobTitle] = useState(false);
  const [placesList, setPlacesList] = useState<Array<any>>([]);
  const [placesSearchText, setPlacesSearchText] = useState(''); 
  const debouncePlacesSearchText = useDebounce(placesSearchText, 300);
  const [inputValue, setInputValue] = React.useState("");
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const [city,setCity] = React.useState("");
  const [stateRegion,setStateRegion] = React.useState("");
  const [country,setCountry] = React.useState("");
  const [postalCode,setPostalCode] = React.useState("");
  const [streetNo,setStreetNo] = React.useState("");
  const [postalCodeError, setPostalCodeError] = useState(false);
  const [locationError, setLocationError] = useState(false);

  useEffect(() => {
    fetchMasterCompanies();
  }, []);

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
            setCity(address.city);
            setStateRegion(address.state);
            setCountry(address.country);
            setPostalCode(address.pinCode);
            setStreetNo(address.streetNo);
            setPostalCodeError(false)
        } else{
            setPlacesList([]);
        }
    }catch(error: any){

    }
  }

  const handleEmailChange = (event: any) => {
    setUserEmail(event.target.value);
    if (event.target.value) {
      setHasNoUseremail(false);
    }
  };

  const addTenantUser = async (e: any) => {
    setError(null);
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
     if (!userEmail || !emailRegex.exec(userEmail)) {
        setHasNoUseremail(true);
        return;
      }else if(firstName.trim() == ""){
        setFirstNameError(true)
        return
    }else if(lastName.trim() == ""){
        setLastNameError(true)
        return
    }else if(jobTitle.trim() == ""){
        setJobTitleError(true)
        return
    }else if (!companyName) {
      setHasNoCompanyName(true);
      return;
    }else if (placesList.length == 0) {
        setLocationError(true);
        return;
    }  else if (!postalCode.trim()) {
        setPostalCodeError(true);
        return;
    } else {
      const data: any = {
        company: companyName,
        email: userEmail,
        companyId: companyId ? companyId : undefined,
        firstName:firstName,
        lastName:lastName,
        jobTitle:jobTitle,
        fullAddress: inputValue || placesSearchText,  
        city: city || undefined,    
        country: country || undefined,   
        postalCode: postalCode || undefined,    
        state : stateRegion || undefined,
        streetNo: streetNo || undefined
      };

      try {
        const token = getExchangeToken();
        const response = await axios.post(
          `${process.env["REACT_APP_AUTHENTICATION_URL"]}V1/tenant`,
          data,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        dispatch(setIsLoading(true));
        if (response && response.status && response.statusText == "Created") {
          handleClose(e);
          setCompanyName(null);
          setUserEmail("");
          setHasError(false);
          setHasNoCompanyName(false);
          setHasNoUseremail(false);
          dispatch(setIsLoading(false));
          Notify.sendNotification(
            "Tenant created successfully",
            AlertTypes.success
          );
        }
      } catch (error: any) {
        setHasError(true);
        dispatch(setIsLoading(false));
        if (error?.response?.data?.error) {
          const message =
            error.response.data.error &&
            getResponseMessage(error.response.data.error);
          setError(message);
        } else setError(error.toString());
      }
    }
  };
  const getResponseMessage = (argCode: any): any => {
    if (ResponseCode[argCode]) {
      return ResponseCode[argCode].DESCRIPTION;
    } else if (argCode) return argCode;
    else return "Something went wrong";
  };

  const handleCompanyName = (event: any, newValue: any) => {
    if (typeof newValue === "string") {
      setCompanyName({
        title: newValue,
      });
    } else if (newValue && newValue.inputValue) {
      setCompanyName({
        title: newValue.inputValue,
      });
    } else {
      setCompanyName(newValue);
      if (newValue && newValue.id) setCompanyId(newValue.id);
      else setCompanyId("");
    }
  };

  const fetchMasterCompanies = async () => {
    try {
      const role = AdminRoles.systemAdmin;
      const compananyResponse = await client.query({
        query: FETCH_MASTER_COMPANY,
        variables: {
          limit: 1000,
          offset: 0,
          searchText: `%%`,
          CompanyIds: companyIds,
          userId: decodeExchangeToken().userId,
        },
        fetchPolicy: "network-only",
        context: { role },
      });
      const companies: Array<any> = [];
      if (compananyResponse.data.companyMaster?.length > 0) {
        companies.push(...compananyResponse.data.companyMaster);
      }
      setMasterCompany(companies);
    } catch (error) {
      console.log(error);
    }
  };

  const handleCompanyNameOnBlur = (e: any) => {
    if (e.target.value) {
      setCompanyName(e.target.value?.trim());
      setHasNoCompanyName(false);
    }
  };

  const handleDialogClose = (e: any) => {
    handleClose(e);
    setCompanyName(null);
    setUserEmail("");
    setHasError(false);
    setHasNoCompanyName(false);
    setHasNoUseremail(false);
  };

  const handleGetUserDetails = async () => {
    try {
      const token = getExchangeToken();
      await axios
        .get(
          `${process.env["REACT_APP_AUTHENTICATION_URL"]}V1/user/details?email=${userEmail}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then((response: any) => {
          if (response?.data?.success) {
            if (response.data.success?.firstName) {
              setFirstName(response.data.success?.firstName);
              setDisableFirstName(true);
              setFirstNameError(false);
            }
            if (response.data.success?.lastName) {
              setLastName(response.data.success?.lastName);
              setDisableLastName(true);
              setLastNameError(false);
            }
            if (response.data.success?.jobTitle) {
              setJobTitle(response.data.success?.jobTitle);
              setDisableJobTitle(true);
              setJobTitleError(false);
            }
          }
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (error) {}
  };

  const handleFirstNameChange = (event: any) => {
    setFirstName(event.target.value);
    setFirstNameError(false)
  };

  const handleLastNameChange = (event: any) => {
    setLastName(event.target.value);
    setLastNameError(false)
  };
  const handleJobChange = (event: any) => {
    setJobTitle(event.target.value);
    setJobTitleError(false)
  };
 const  handlePostalCodeChange = (event: any) => {
  setPostalCode(event.target.value);
  setPostalCodeError(false)
};
  const changeInOptionValue=(argValue: string)=>{
    setInputValue(argValue);
    const selectedPlaceValue= placesList.find((item: any)=>item.description === argValue);
    if(selectedPlaceValue){
        setSelectedPlace(selectedPlaceValue);
    } else{
        setSelectedPlace(null);
    }
}

  return (
    <Dialog open={openDialog} classes={{ paper:dialogClasses.dialogPaper }}>
      <Grid>
        <Grid container>
          <IconButton
            aria-label="close"
            className={dialogClasses.closeButton}
            onClick={(e) => handleDialogClose(e)}
          >
            <CloseIcon />
          </IconButton>
        </Grid>
        <Grid container justify="center">
          <Grid item>
            <img
              style={{ marginTop: "25px", height: "4rem" }}
              className="img-responsive"
              src={SlateLogo}
              alt="user"
            />
          </Grid>
        </Grid>
        <Grid container justify="center">
          <h3 style={{ marginTop: "5px" }}>Add Account</h3>
        </Grid>
        <Grid container justify="center">
          <Grid item xs={12} className={"createTenant-textcell"}>
            <div
              className={`addIconContainer__error-wrap  ${
                hasError ? "alert-shown" : "alert-hidden"
              }`}
              onTransitionEnd={() => setHasError(false)}
            >
              <p className="addIconContainer__error-wrap__message">
                <span>{error}</span>
              </p>
            </div>
            <TextField
              id="accountEmail"
              type="text"
              value={userEmail}
              label="Account Owner Email"
              className={dialogClasses.textField}
              fullWidth
              variant="outlined"
              onChange={(e) => handleEmailChange(e)}
              onBlur={handleGetUserDetails}
            />
            {hasNoUseremail && (
              <div className="addIconContainer__error-wrap">
                <p className="addIconContainer__error-wrap__message">
                  <span>User Email Is Required</span>
                </p>
              </div>
            )}
          </Grid>
        </Grid>
        <Grid container justify="center">
        <Grid item xs={12} className={"createTenant-textcell__firstName"}>
          <TextField
            id="accountEmail"
            type="text"
            value={firstName}
            label="First name"
            className={dialogClasses.textField}
            fullWidth
            disabled={disableFirstName}
            variant="outlined"
            onChange={(e) => handleFirstNameChange(e)}
          />
          {firstNameError && (
              <div className="addIconContainer__error-wrap">
                <p className="addIconContainer__error-wrap__message">
                  <span>First name Is Required</span>
                </p>
              </div>
            )}
            </Grid>
        </Grid>
        <Grid container justify="center">
        <Grid item xs={12} className={"createTenant-textcell__lastName"}>
          <TextField
            id="accountEmail"
            type="text"
            value={lastName}
            label="Last name"
            className={dialogClasses.textField}
            fullWidth
            variant="outlined"
            disabled={disableLastName}
            onChange={(e) => handleLastNameChange(e)}
          />
          {lastNameError && (
              <div className="addIconContainer__error-wrap">
                <p className="addIconContainer__error-wrap__message">
                  <span>Last name Is Required</span>
                </p>
              </div>
            )}
            </Grid>
        </Grid>
        <Grid container justify="center">
        <Grid item xs={12} className={"createTenant-textcell__lastName"}>
          <TextField
            id="accountEmail"
            type="text"
            value={jobTitle}
            label="Job title"
            className={dialogClasses.textField}
            fullWidth
            variant="outlined"
            disabled={disableJobTitle}
            onChange={(e) => handleJobChange(e)}
          />
          {jobTitleError && (
              <div className="addIconContainer__error-wrap">
                <p className="addIconContainer__error-wrap__message">
                  <span>Job title Is Required</span>
                </p>
              </div>
            )}
            </Grid>
        </Grid>
        <Grid container justify="center">
          <Grid item xs={12} className={"createTenant-textcell__company"}>
            <Autocomplete
              value={companyName}
              onChange={(event, newValue) => handleCompanyName(event, newValue)}
              onBlur={(event: any) => handleCompanyNameOnBlur(event)}
              selectOnFocus
              handleHomeEndKeys
              id="free-solo-with-text-demo"
              options={masterCompany}
              getOptionLabel={(option) => {
                if (typeof option === "string") {
                  return option;
                }
                if (option.inputValue) {
                  return option.inputValue;
                }
                return option.name;
              }}
              renderOption={(option) => option.name}
              freeSolo
              renderInput={(params) => (
                <TextField
                  {...params}
                  className={dialogClasses.textField}
                  fullWidth
                  id="companyName"
                  type="text"
                  variant="outlined"
                  label="Company Name For Account"
                />
              )}
            />
            {hasNoCompanyName && (
              <div className="addIconContainer__error-wrap">
                <p className="addIconContainer__error-wrap__message">
                  <span>Company Name Is Required</span>
                </p>
              </div>
            )}
          </Grid>
        </Grid>
        <Grid container justify="center">
          <Grid item xs={12} className={"createTenant-textcell__location"}>
            <Autocomplete
                  freeSolo
                  id="free-solo-2-demo"
                  disableClearable
                  handleHomeEndKeys
                  value={inputValue}
                  onChange={(event, newValue) => {
                    changeInOptionValue(newValue);
                  }}
                  inputValue={placesSearchText}
                  onInputChange={(event, newInputValue) => {
                      setPlacesSearchText(newInputValue);
                      setLocationError(false)
                  }}
                  options={placesList.map((option: any) => option.description)}
                  renderInput={(params) => (
                  <TextField
                      {...params}
                      className={dialogClasses.textField}
                      label="Address"
                      margin="normal"
                      variant="outlined"
                      type="text"
                      InputProps={{ ...params.InputProps, type: 'search' }}
                  />
                                        )}
            />
            {locationError && (
              <div className="addIconContainer__error-wrap">
                <p className="addIconContainer__error-wrap__message">
                  <span>Address Is Required</span>
                </p>
              </div>
            )}
          </Grid>
        </Grid>
        <Grid container justify="center">
        <Grid item xs={12} className={"createTenant-textcell__jobTitle"}>
          <TextField
            id="postalCode"
            type="text"
            value={postalCode}
            label="Postcode"
            className={dialogClasses.textField}
            fullWidth
            variant="outlined"
            onChange={(e) => handlePostalCodeChange(e)}
          />
          {postalCodeError && (
              <div className="addIconContainer__error-wrap">
                <p className="addIconContainer__error-wrap__message">
                  <span>Postcode Is Required</span>
                </p>
              </div>
            )}
            </Grid>
        </Grid>
        <Grid container justify="center">
          <Grid item xs={12}>
            <Button
              variant="contained"
              disabled={!userEmail && !companyName ? true : false}
              fullWidth
              className="btn-primary"
              onClick={(e) => addTenantUser(e)}
            >
              Submit
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </Dialog>
  );
}

export default AddTenantDialog;
