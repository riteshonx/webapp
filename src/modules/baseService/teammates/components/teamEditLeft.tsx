import React, { ReactElement, useState, useEffect } from "react";
import { Button, TextField } from "@material-ui/core";
import "./teamEditLeft.scss";
import { canViewActiveteOrDeactivateUser } from "src/services/permission";
import USER_AVATAR from "../../../../assets/images/account_circle.svg"
import { extractAddressFromProject } from "../../projects/utils/helper";
import { useDebounce } from "src/customhooks/useDebounce";
import { axiosApiInstance } from 'src/services/api';
import { Autocomplete } from "@material-ui/lab";
import { decodeExchangeToken } from "src/services/authservice";
import EmailIcon from "@material-ui/icons/Email";
import ResendInvite from './resendInvite';
import {
  Tooltip,
  IconButton,
} from "@material-ui/core";

export default function TeamEditLeft(props: any): ReactElement {
  const [firstName, setFirstName] = useState("");
  const [firstNameError, setFirstNameError] = useState(false)
  const [lastNameError,setLastNameError] = useState(false)
  const [lastName, setLastName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [phone, setPhone] = useState("");
  const [secondaryEmail,setSecondaryEmail]=useState("");
  const [location, setLocation] = useState("");
  const [placesList, setPlacesList] = useState<Array<any>>([]);
  const [placesSearchText, setPlacesSearchText] = useState(''); 
  const [addressId, setAddressId] = useState<any>('')
  const debouncePlacesSearchText = useDebounce(placesSearchText, 300);
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const [postalCode, setPostalCode] = useState<any>('')
  const [addressLine2, setAddressLine2] = useState<any>('')
  const [city, setCity] = useState<any>('')
  const [country, setCountry] = useState<any>('')
  const [province,setProvince] = useState<any>('')
  const [openInvite, setOpenInvite] = useState(false);
  
  useEffect(() => {
    if(debouncePlacesSearchText.trim()){
     fetchPlacesByText();
    } else{
        setPlacesList([]);
    }
 }, [debouncePlacesSearchText])
 
  useEffect(() => {
    if (props.userDetails) {
      const address = props.userDetails?.user?.addresses?.length?extractAddressFromProject(props.userDetails?.user):"";
      const address1 = address ? formatAddress(address):"";
      const location = props.userDetails?.user && props.userDetails.user?.addresses && 
        props.userDetails?.user?.addresses.length && props.userDetails.user.addresses[0].fullAddress ?
      props.userDetails.user.addresses[0].fullAddress:(address1?address1:"");
      setFirstName(props.userDetails?.user?.firstName);
      setLastName(props.userDetails?.user?.lastName);
      setJobTitle(props.userDetails?.user?.jobTitle);
      setPhone(props.userDetails?.user?.phone);
      setLocation(location);
      setAddressId(address?address.id:"")
      setPostalCode(address?address.postalCode:"")
      setCountry(address?address.country:"")
      setProvince(address?address.state:"")
      setAddressLine2(address?address.addressLine2:"")
      setCity(address?address.city:"")
    }
  }, [props.userDetails]);
  const handleChangeName = (event: any) => {
    const userFirstName = event.target.value;
    const userName = userFirstName.trim();
    setFirstName(userFirstName);
    if(!userName){
      setFirstNameError(true)
      props.setUserValue(event.target.value.trim(), "firstName");
      return 
    }else{
      setFirstNameError(false)
      props.setUserValue(event.target.value, "firstName");
    }  
  };

  const formatAddress=(address:any)=>{
    let addStr = ""
    if(address && typeof address === 'object'){
      for (const property in address){
        if(address.hasOwnProperty(property) && address[property] && property !== "id"){
            addStr = addStr?addStr+" ,"+address[property]:address[property]
        }
      }
    }
    return addStr;
  }

  const handleChangeLastName = (event: any) => {
    const userLastName = event.target.value;
    const lastName = userLastName.trim();
    setLastName(userLastName);
    if(!lastName){
      setLastNameError(true)
      props.setUserValue(event.target.value.trim(), "lastName");
      return 
    }else{
      setLastNameError(false)
      props.setUserValue(event.target.value, "lastName");
    }  
  };
  const handleChangeJobTitle = (event: any) => {
    setJobTitle(event.target.value);
    props.setUserValue(event.target.value, "jobTitle");
  };
  const handleChangePhone = (event: any) => {
    setPhone(event.target.value);
    props.setUserValue(event.target.value, "phone");
  };


  const handleValidationFirstName = () => {
    if(firstName && firstName.length == 0){
      setFirstNameError(true)
    }
  }

  const handleValidationLastName = () => {
    if(lastName && lastName.length == 0){
      setLastNameError(true)
    }
  }


  useEffect(() => {
    if(firstName && firstName.length == 0){
      setFirstNameError(true)
    }
    if(lastName && lastName.length == 0){
      setLastNameError(true)
    }
  },[firstName && lastName])


  const handleSecondaryEmail = (event : any) => {
    setSecondaryEmail(event.target.value)
    props.setUserValue(event.target.value, "secondaryEmail");
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

  const changeInOptionValue=(argValue: string)=>{
    setLocation(argValue);
    props.setUserValue({value:argValue.trim(),id:addressId}, "location");
    const selectedPlaceValue= placesList.find((item: any)=>item.description === argValue);
    if(selectedPlaceValue){
        setSelectedPlace(selectedPlaceValue);
    } else{
        setSelectedPlace(null);
    }
}
  const accountAccessRight = ()=>{
    if(props.userDetails.role && props.userDetails?.user?.id !== decodeExchangeToken().userId 
    && canViewActiveteOrDeactivateUser()){
      return true
    }else return false
  }

  const accountLocked = () =>{
    if(props.userAccountStatus ==4 && accountAccessRight()){
      return true
    }
    else return false
  }
  const handleInvite =()=>{
  setOpenInvite(true);
  }

  return (
		<div className="editTeamLeft">
			<ResendInvite
				open={openInvite}
				closeInvite={() => setOpenInvite(false)}
				emails={props?.userDetails?.user?.email}
			/>
			<div className="editTeamLeft__imageView"></div>
			<div className="editTeamLeft__details">
				<div style={{ fontWeight: 'bold', fontSize: 20 }}>Edit Details</div>
				<div>
					{accountLocked() && (
						<Button
							className="editTeamLeft__button editTeamLeft__button__unblock"
							onClick={() => {
								props.unLockUserProfile();
							}}
						>
							Unlock
						</Button>
					)}
					{accountAccessRight() &&
						(props.userDetails.role !== 1 && props.userDetails?.status === 1 ? (
							<Button
								onClick={() => props.reactivate()}
								className="editTeamLeft__button"
							>
								Reactivate
							</Button>
						) : (
							props.userDetails.role !== 1 &&
							props.userDetails.role !== 5 && (
								<Button
									className="btn-secondary editTeamLeft__button"
									onClick={() => props.deactivate()}
								>
									Deactivate
								</Button>
							)
						))}

					{props.userAccountStatus == 2 && (
						<Tooltip
							title="Reinvite"
							placement="bottom"
						>
							<IconButton onClick={handleInvite}>
								<EmailIcon
									className="teammates__editIconSize"
									style={{ color: 'black',height:'2.4rem',width:'2.4rem' }}
								/>
							</IconButton>
						</Tooltip>
					)}
				</div>
			</div>
			<div className="editTeamLeft__textFieldView">
				<div className="editTeamLeft__textField">
					<div className="editTeamLeft__textFieldName">First Name</div>
					<div className="editTeamLeft__textFieldWidth">
						<TextField
							error={firstNameError}
							onBlur={() => handleValidationFirstName()}
							required={true}
							disabled
							onChange={() => handleChangeName(event)}
							value={firstName}
						/>
					</div>
				</div>
				{firstNameError && (
					<div className="editTeamLeft__textField_error">
						<div className="editTeamLeft__textFieldName"></div>
						<div className="editTeamLeft__textFieldWidth_error">
							Please enter first name.
						</div>
					</div>
				)}
				<div className="editTeamLeft__textField">
					<div className="editTeamLeft__textFieldName">Last Name</div>
					<div className="editTeamLeft__textFieldWidth">
						<TextField
							error={lastNameError}
							onBlur={() => handleValidationLastName()}
							required={true}
							disabled
							onChange={() => handleChangeLastName(event)}
							value={lastName}
						/>
					</div>
				</div>
				{lastNameError && (
					<div className="editTeamLeft__textField_error">
						<div className="editTeamLeft__textFieldName"></div>
						<div className="editTeamLeft__textFieldWidth_error">
							Please enter last name.
						</div>
					</div>
				)}
				<div className="editTeamLeft__textField">
					<div className="editTeamLeft__textFieldName">Job Title</div>
					<div className="editTeamLeft__textFieldWidth">
						<TextField
							onChange={() => handleChangeJobTitle(event)}
							value={jobTitle}
							disabled
						/>
					</div>
				</div>
				<div className="editTeamLeft__textField_autocomplete">
					<div className="editTeamLeft__textFieldName">Address Line 1</div>
					<div className="editTeamLeft__textFieldWidth">
						{/* <TextField 
             value={props.userDetails?.user?.location} disabled /> */}
						<Autocomplete
							freeSolo
							id="free-solo-2-demo"
							disabled={true}
							disableClearable
							value={location}
							title={location}
							onChange={(event, newValue) => {
								changeInOptionValue(newValue);
							}}
							inputValue={placesSearchText}
							onInputChange={(event, newInputValue) => {
								setPlacesSearchText(newInputValue);
							}}
							options={placesList.map((option: any) => option.description)}
							renderInput={(params) => (
								<TextField
									{...params}
									label=""
									margin="normal"
									placeholder=""
									InputProps={{ ...params.InputProps, type: 'search' }}
								/>
							)}
						/>
					</div>
				</div>{' '}
				<div className="editTeamLeft__textField">
					<div className="editTeamLeft__textFieldName">Address LIne 2</div>
					<div className="editTeamLeft__textFieldWidth">
						<TextField
							value={addressLine2}
							disabled
						/>
					</div>
				</div>
				<div className="editTeamLeft__textField">
					<div className="editTeamLeft__textFieldName">City / Locality</div>
					<div className="editTeamLeft__textFieldWidth">
						<TextField
							value={city}
							disabled
						/>
					</div>
				</div>
				<div className="editTeamLeft__textField">
					<div className="editTeamLeft__textFieldName">State / Province</div>
					<div className="editTeamLeft__textFieldWidth">
						<TextField
							value={province}
							disabled
						/>
					</div>
				</div>
				<div className="editTeamLeft__textField">
					<div className="editTeamLeft__textFieldName">Country</div>
					<div className="editTeamLeft__textFieldWidth">
						<TextField
							value={country}
							disabled
						/>
					</div>
				</div>
				<div className="editTeamLeft__textField">
					<div className="editTeamLeft__textFieldName">ZIP / Postcode</div>
					<div className="editTeamLeft__textFieldWidth">
						<TextField
							value={postalCode}
							disabled
						/>
					</div>
				</div>
				<div className="editTeamLeft__textField">
					<div className="editTeamLeft__textFieldName">Mobile</div>
					<div className="editTeamLeft__textFieldWidth">
						<TextField
							onChange={() => handleChangePhone(event)}
							value={phone}
							disabled={true}
						/>
					</div>
				</div>{' '}
				<div className="editTeamLeft__textField">
					<div className="editTeamLeft__textFieldName">Email</div>
					<div className="editTeamLeft__textFieldWidth">
						<TextField
							value={props?.userDetails?.user?.email}
							disabled={true}
						/>
					</div>
				</div>
				<div className="editTeamLeft__textField">
					<div className="editTeamLeft__textFieldName">Secondary Email</div>
					<div className="editTeamLeft__textFieldWidth">
						<TextField
							onChange={() => handleSecondaryEmail(event)}
							value={
								props.secondaryEmail && props.secondaryEmail.length !== 0
									? props.secondaryEmail
									: props?.userDetails?.user?.userEmailAssociations[0]?.email
							}
							disabled={true}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
