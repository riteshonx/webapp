import {
  FC,
  ReactElement,
  useEffect,
  useRef,
  useState,
  useCallback,
  useContext
} from "react";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import AddIcon from '@mui/icons-material/Add';
import "./index.scss";
import ActionButtons from "./components/ActionButtons";
import CloseButton from "./components/CloseButton";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { useDebounce } from "src/customhooks/useDebounce";
import { stateContext } from 'src/modules/root/context/authentication/authContext';
import {
  myProfileValidationSchema,
  MyProfileFormInputData,
  extractAddressComponents,
  initSeedData,
  MyProfileProps,
  AddressData,
} from "./utils";
import { yupResolver } from "@hookform/resolvers/yup";
import InputWithLabel from "src/modules/authentication/components/InputWithLabel";
import useUpdateEffect from "src/modules/authentication/hooks/useUpdateEffect";
import { decodeExchangeToken, decodeToken, getExchangeToken } from "src/services/authservice";
import { client } from "src/services/graphql";
import {
  GET_USER_DETAILS,
  UPDATE_TENANT_USER_PHONE_NUMBER,
  UPDATE_TENANT_USER_SECONDARY_EMAIL,
  UPDATE_TENANT_USER_ADDRESS,
  INSERT_TENANT_USER_ADDRESS,
} from "src/modules/baseService/teammates/queries";
import Notification, {
  AlertTypes,
} from "src/modules/shared/components/Toaster/Toaster";
import { DeleteOutline as DeleteIcon, ErrorOutline } from "@material-ui/icons";
import { axiosApiInstance } from "src/services/api";
import { Autocomplete } from "@material-ui/lab";
import { makeStyles, MenuItem, Select } from "@material-ui/core";
import { getCountries, getCountry, getStates }  from 'country-state-picker';
import { CustomPopOver } from '../../../../shared/utils/CustomPopOver';
import axios from "axios";
import { setPasswordConfig } from "src/modules/root/context/authentication/action";


function generateInitials(userDetails: any) {
  const { firstName, lastName } = userDetails;
  const firstAlphabet = firstName.charAt(0).toUpperCase();
  const secondAlphabet = lastName.charAt(0).toUpperCase();
  if (!secondAlphabet) return firstAlphabet;
  return firstAlphabet + secondAlphabet;
}

const AUTH_URL = process.env["REACT_APP_AUTHENTICATION_URL"];
const NOTIFICATION_PATH = `${process.env["REACT_APP_NOTIFICATION_URL"]}v1/places`;
const COMMON_AXIOS_PARAMS = { headers: { token: "exchange" } };

const useStyles = makeStyles(theme => ({
  select:{
    "& .MuiOutlinedInput-input":{
      padding: "9px"
    },
    "& .MuiPopover-paper":{
      width:"80px"
    }  
  },
  text:{
    color:"#bfbdbd"
  },
  updatedSelect:{
    "& .MuiSvgIcon-root":{
      color:"#fff"
    },
    "& .MuiSelect-outlined.MuiSelect-outlined ":{
      border:"1px solid #fff",
      padding:"10px 10px"
    },
    "& .MuiSelect-selectMenu":{
      color:'#fff'
    },
    "& .MuiPopover-paper":{
      width:"80px"
    },
    "& .MuiMenuItem-root":{
      width:"80px"
    }
  }
}));

const MyProfile: FC<MyProfileProps> = ({
  open = false,
  handleCloseModal,
}: MyProfileProps): ReactElement => {
  const [userDetails, setUserDetails] =
    useState<MyProfileFormInputData>(initSeedData);
  const [isSaving, setIsSaving] = useState(false);
  const [secondaryEmailField, setSecondaryEmailField] = useState("unknown");
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [showPassword, setShowPassword] = useState({
    newPassword: false,
    confirmPassword: false,
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [addressData, setAddressData] = useState<AddressData>({
    description: "",
    place_id: "",
  });
  const debouncedAddressDesc = useDebounce(addressData.description, 300);
  const [addressList, setAddressList] = useState([]);
  const [addressComponents, setAddressComponents] = useState({
    country: "",
    state: "",
    city: "",
    postalCode: "",
    streetNo: "",
  });
  const {state: {dashboardType },dispatch}: any = useContext(stateContext);

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
    control,
  } = useForm<MyProfileFormInputData>({
    mode: "all",
    resolver: yupResolver(myProfileValidationSchema()),
  });
  const [countryList,setCountryList] = useState<any>(getCountries());
  const [stateList,setStateList] = useState<any>([]);
  const classes = CustomPopOver();
  const passwordFieldsRef = useRef<any>();
  const updateUserDetailsRole = "updateMyUser";
  const classesMenu = useStyles();

  const fetchAddressData = useCallback(async () => {
    if (debouncedAddressDesc) {
      try {
        const response = await axiosApiInstance.get(NOTIFICATION_PATH, {
          ...COMMON_AXIOS_PARAMS,
          params: {
            text: debouncedAddressDesc,
          },
        });
        setAddressList(response.data?.success);
      } catch (e) {
        console.error("Somehting went wrong while fetching address", e);
      }
    } else {
      setAddressList([]);
    }
  }, [debouncedAddressDesc]);

  const fetchAddressComponentsData = useCallback(async () => {
    if (addressData.place_id) {
      try {
        const response = await axiosApiInstance.get(
          `${NOTIFICATION_PATH}/${addressData.place_id}`,
          COMMON_AXIOS_PARAMS
        );
        const addressComponents = response.data?.success?.address_components;
        const { country, state, city, postalCode, streetNo } =
          extractAddressComponents(addressComponents);
        setAddressComponents({ country, state, city, postalCode, streetNo });
        setValue("postalCode", postalCode || "");
        setValue("state", state || "");
        setValue("city", city || "");
        setValue("country", country || "");
        const contVal= getCountries().find((item:any)=>item.name == country)
        if(contVal){
            const stateList = getStates(contVal.code)
            setStateList(stateList && stateList.length?stateList:["No States"])
        }
      } catch (e) {
        console.error(
          "Somehting went wrong while fetching address components data",
          e
        );
      }
    }
  }, [addressData.place_id]);

  useUpdateEffect(() => {
    fetchAddressData();
  }, [fetchAddressData]);

  useUpdateEffect(() => {
    fetchAddressComponentsData();
  }, [fetchAddressComponentsData]);

  useEffect(() => {
    getPasswordConfiguration()
    try {
      const userId = decodeToken().userId;
      (async () => {
        try {
          const userDetailsResponse = await client.query({
            query: GET_USER_DETAILS,
            variables: {
              userId,
            },
            fetchPolicy: "network-only",
            context: {
              role: updateUserDetailsRole,
            },
          });
          const userDataList = userDetailsResponse.data.tenantAssociation;
          if (userDataList?.length) {
            setUserDetails(userDataList[0].user);
          }
        } catch {
          console.error("Error occurred while fetching user details");
        }
      })();
    } catch {
      console.error("Error occurred while decoding token");
    }
  }, [open]);

  useEffect(() => {
    if (showPasswordFields && passwordFieldsRef.current) {
      passwordFieldsRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [showPasswordFields]);

  useUpdateEffect(() => {
    const {
      firstName,
      lastName,
      email,
      phone,
      jobTitle,
      userEmailAssociations,
      addresses,
    } = userDetails;
    setValue("firstName", firstName);
    setValue("lastName", lastName);
    setValue("email", email);
    setValue("phone", phone);
    setValue("jobTitle", jobTitle || "");
    if (userEmailAssociations.length) {
      setSecondaryEmailField("show");
      setValue("secondaryEmail", userEmailAssociations[0].email || "");
    } else {
      setSecondaryEmailField("hide");
    }
    if (addresses.length) {
      const { fullAddress, postalCode ,addressLine2,state,city,country } = addresses[addresses.length - 1];
      setValue("addressLine2", addressLine2 || "");
      setValue("state", state || "");
      setValue("city", city || "");
      setValue("country", country || "");
      setValue("fullAddress", fullAddress || "");
      setValue("postalCode", postalCode || "");
      const contVal= getCountries().find((item:any)=>item.name == country)
      if(contVal){
          const stateList = getStates(contVal.code);
          setStateList(stateList && stateList.length?stateList:["No States"])
      }
    }
  }, [userDetails]);

  const handleClose = () => {
    handleCloseModal();
  };

  const handleDeleteSecondaryEmail = async () => {
    setValue("secondaryEmail","")
    setSecondaryEmailField("hide");
    if(errors?.secondaryEmail){
      clearErrors("secondaryEmail")
    }
  };

  const handleSave: SubmitHandler<MyProfileFormInputData> = async (values) => {
    if (isSaving) return;
    setIsSaving(true);
    if (secondaryEmailField === "show") {
      if(!values?.secondaryEmail){
        setError("secondaryEmail",{type:"required",message:"Secondary email is required"})
        setIsSaving(false);
        return
      }else{
        clearErrors("secondaryEmail")
      }
    }
    try {
      if (values.newPassword) {
        const toSubmitData = {
          newPassword: values.newPassword,
          currentPassword: values.currentPassword,
        };
        try {
          const response = await axiosApiInstance.patch(
            `${AUTH_URL}V1/user/${userDetails.id}/updatePassword`,
            toSubmitData,
            {
              headers: {
                token: "token",
              },
            }
          );
          setValue("newPassword", "");
          setValue("currentPassword", "");
          setValue("confirmPassword", "");
          if(!response){
            throw new Error("Failed Password Update")
          }
        } catch (err: any) {
          if (
            err?.response?.data?.error === "INVALID_CURRENT_PASSWORD_VALIDATION"
          ) {
            setError("currentPassword", {
              type: "validate",
              message: "Invalid password entered",
            });
          } else {
            Notification.sendNotification(
              "Something went wrong while updating your password",
              AlertTypes.error
            );
          }
          setIsSaving(false);
          console.error("Error occurred while updating password", err);
          return;
        }
      }

      await client.mutate({
        mutation: UPDATE_TENANT_USER_PHONE_NUMBER,
        variables: {
          id: userDetails.id,
          phone: values.phone || null,
        },
        context: {
          role: updateUserDetailsRole,
        },
      });

      const addressObject = {
        fullAddress: values.fullAddress,
        postalCode: values.postalCode,
        addressLine2: values.addressLine2,
        city: values.city,
        country: values.country,
        streetNo: addressComponents.streetNo,
        state: values.state,
      };

      if (userDetails.addresses.length) {
        const { addresses } = userDetails;
        const currentAddress = addresses[addresses.length - 1];
        await client.mutate({
          mutation: UPDATE_TENANT_USER_ADDRESS,
          variables: {
            id: currentAddress.id,
            ...addressObject,
          },
          context: {
            role: updateUserDetailsRole,
          },
        });
      } else {
        await client.mutate({
          mutation: INSERT_TENANT_USER_ADDRESS,
          variables: {
            object: addressObject,
          },
          context: {
            role: updateUserDetailsRole,
          },
        });
      }

      let updateProperties;
      let shouldUpdateSecondaryEmail = true;
      if (secondaryEmailField === "show") {
        updateProperties = {
          secondaryEmail: values.secondaryEmail,
          active: true,
        };
      } else {
        const { userEmailAssociations } = userDetails;
        if (userEmailAssociations.length) {
          updateProperties = {
            secondaryEmail: userEmailAssociations[0].email,
            active: false,
          };
        } else shouldUpdateSecondaryEmail = false;
      }

      if (shouldUpdateSecondaryEmail) {
        await client.mutate({
          mutation: UPDATE_TENANT_USER_SECONDARY_EMAIL,
          variables: {
            id: userDetails.id,
            ...updateProperties,
          },
          context: {
            role: updateUserDetailsRole,
          },
        });
      }
      handleCloseModal();
      Notification.sendNotification(
        "Successfully updated your profile",
        AlertTypes.success
      );
    } catch (e) {
      Notification.sendNotification(
        "Something went wrong while updating your profile",
        AlertTypes.error
      );
      console.error("Error occurred while updating profile => ", e);
      setIsSaving(false);
    }
  };

  const updateStateList = (argValue:any)=>{
    const contVal= getCountries().find((item:any)=>item.name == argValue)
    if(contVal){
        const stateList = getStates(contVal.code);
        setStateList(stateList && stateList.length?stateList:["No States"])
    }
  }

  const getRenderValue=(selected:any)=>{
    const val=stateList.find((item:any)=>{
      return item == selected
    })
    if (!selected || !val) {
      return <div className={classesMenu.text}>Select State</div>;
    }
    return selected;
  }
  	const getPasswordConfiguration = async () => {
		try {
			const token = getExchangeToken();
			const AUTH_URL = process.env['REACT_APP_ENVIRONMENT'];
			const { tenantId } = decodeExchangeToken();
      console.log("tenantId",tenantId)
			const response = await axios.post(
				`https://authentication.service.${AUTH_URL}.slate.ai/V1/getPasswordFormat`,
				{ tenantId },
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);
			const responseData = response?.data.success?.Data.passwordFormat;
      dispatch(setPasswordConfig(responseData))
		} catch (err) {
			console.log('error while fetching the password configuration', err);
		}
	};
  return (
    <Modal
      keepMounted={false}
      open={open}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box className= {dashboardType =='slate2.0'? 'myProfile__slateDashboard myProfile_hero':'myProfile_hero'}>
        <h3 className= {dashboardType =='slate2.0'? 'myProfile__slateDashboard__header myProfile_container_header':'myProfile_container_header'}>My Profile</h3>
        <div className="myProfile_container">
          <div className="myProfile_container_body">
            <div className={dashboardType =='slate2.0'? ' myProfile_container_body_subSection myProfile__slateDashboard__subSection':'myProfile_container_body_subSection'}>
              {/* <div className="myProfile_container_body_subSection_avatar">
                {generateInitials(userDetails)}
              </div> */}
              <form
                onSubmit={handleSubmit(handleSave)}
                className="myProfile_container_body_subSection_content"
              >
                <div className="myProfile_container_body_subSection_content_grouped">
                  <InputWithLabel
                    label="First Name"
                    field="firstName"
                    register={register}
                    smallLabel
                    readOnly
                    dashboardType={dashboardType=="slate2.0"?true:false}
                  />
                  <InputWithLabel
                    label="Last Name"
                    field="lastName"
                    register={register}
                    smallLabel
                    readOnly
                    dashboardType={dashboardType=="slate2.0"?true:false}
                  />
                </div>

                <div className="myProfile_container_body_subSection_content_grouped">
                  <InputWithLabel
                    label="Job Title"
                    field="jobTitle"
                    register={register}
                    smallLabel
                    readOnly
                    dashboardType={dashboardType=="slate2.0"?true:false}
                  />
                  <InputWithLabel
                    label="Phone No"
                    field="phone"
                    register={register}
                    error={errors.phone}
                    smallLabel
                    dashboardType={dashboardType=="slate2.0"?true:false}
                  />
                </div>
                <InputWithLabel
                  label="Primary Email"
                  field="email"
                  register={register}
                  smallLabel
                  readOnly
                  dashboardType={dashboardType=="slate2.0"?true:false}
                />

                {secondaryEmailField === "show" ? (
                  <div className="myProfile_container_body_subSection_content_grouped">
                    <InputWithLabel
                      label="Secondary Email"
                      field="secondaryEmail"
                      register={register}
                      smallLabel
                      error={errors.secondaryEmail}
                      dashboardType={dashboardType=="slate2.0"?true:false}
                    />
                      <DeleteIcon
                      onClick={handleDeleteSecondaryEmail}
                      className="myProfile_container_body_subSection_content_icon"
                    />
                  </div>
                ) : secondaryEmailField === "hide" ? (
                  <span
                    onClick={() => setSecondaryEmailField("show")}
                    className={dashboardType =='slate2.0'?"myProfile__slateDashboard__secondaryEmail myProfile_container_body_subSection_content_addEmail":"myProfile_container_body_subSection_content_addEmail"}
                  >
                     <AddIcon/> <span> Add secondary email</span>
                  </span>
                ) : (
                  <h5 style={{ marginLeft: "1rem" }}>Please wait...</h5>
                )}
                <div className="myProfile_container_body_subSection_content_address">
                  <Controller
                    name="fullAddress"
                    defaultValue=""
                    control={control}
                    render={({
                      field: { onChange, onBlur, value, name, ref },
                    }) => {
                      return (
                        <Autocomplete
                          // options={addressList.map((e: any) => e.description)}
                          options={addressList}
                          getOptionLabel={(e) => {
                            return e.description ? e.description : "";
                          }}
                          onBlur={onBlur}
                          onChange={(e, newValue) => {
                            onChange(newValue.description);
                            setAddressData({
                              description: newValue.description,
                              place_id: newValue.place_id,
                            });
                          }}
                          inputValue={value}
                          value={value}
                          freeSolo
                          selectOnFocus
                          renderInput={(params) => {
                            return (
                              <>
                                <div
                                  className={dashboardType=='slate2.0'?"ftInputContainer myProfile__slateDashboard__ftInputContainer":"ftInputContainer"} 
                                  ref={params.InputProps.ref}
                                >
                                  <label className= "ftInputContainer_label smallFontSizeForLabel">
                                    Address Line 1 *
                                  </label>
                                  <input
                                    {...params.inputProps}
                                    onChange={(e: any) => {
                                      onChange(e);
                                      setAddressData({
                                        description: e.target.value,
                                        place_id: "",
                                      });
                                    }}
                                    placeholder='Enter Address'
                                    className={`ftInputContainer_input ${errors.fullAddress?"myProfile_with_error_border":""}`}
                                  />
                                  {errors.fullAddress ? (
                                  <>
                                    <span
                                      className="myProfile_errorMsg"
                                    >
                                      Address is required
                                    </span>
                                    <i
                                    className={"myProfile_errorIcon"}
                                  >
                                    <ErrorOutline fontSize="small" style={{ fill: "#D02F2F" }} />
                                  </i>
                                  </>
                                  ):""}                               
                                </div>
                              </>
                            );
                          }}
                        />
                      );
                    }}
                  />
                  <InputWithLabel
                      label="Address Line 2"
                      field="addressLine2"
                      register={register}
                      placeholder='Enter Address Line 2'
                      smallLabel
                      dashboardType={dashboardType=="slate2.0"?true:false}
                    />

                  <div className="myProfile_container_body_subSection_content_grouped">
                        <div className={dashboardType=='slate2.0'?"ftInputContainer myProfile__slateDashboard__ftInputContainer":"ftInputContainer"} >
                          <label className="ftInputContainer_label smallFontSizeForLabel">
                              Country *
                          </label>
                          <Controller 
                                render={({ field }:{field:any}) => (
                                    <Select
                                        id="custom-dropdown"
                                        {...field}
                                        autoComplete='off'
                                        displayEmpty
                                        variant = "outlined"
                                        className={dashboardType=='slate2.0'?classesMenu.updatedSelect  : classesMenu.select}
                                        onChange={(e) => {field.onChange(e.target.value as string[]);
                                            updateStateList(e.target.value)}}
                                         renderValue={
                                           field.value !== "" ? undefined : () => <div className={classesMenu.text}>Select Country</div>
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
                                                key={type.code} value={type.name}>{type.name}
                                            </MenuItem>
                                        ))
                                    }
                                    </Select>
                                )}
                                name="country"
                                defaultValue=""
                                control={control}
                                rules={{
                                    required: true
                                }}
                            />
                        </div>
                        <div className={dashboardType=='slate2.0'?"ftInputContainer myProfile__slateDashboard__ftInputContainer":"ftInputContainer"} >
                          <label className="ftInputContainer_label smallFontSizeForLabel">
                               State / Province
                            </label>
                          <Controller 
                                render={({ field }:{field:any}) => (
                                    <Select
                                        id="custom-dropdown"
                                        {...field}
                                        autoComplete='off'
                                        variant = "outlined"
                                        displayEmpty
                                        className={dashboardType=='slate2.0'?classesMenu.updatedSelect  : classesMenu.select}
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
                                    stateList && stateList.length ? stateList.map((type: any) => (
                                        <MenuItem className="mat-menu-item-sm"
                                              key={type} value={type}>{type}</MenuItem>
                                    )):
                                    `No states`
                                }
                                    </Select>
                                )}
                                name= "state"
                                defaultValue=""
                                control={control}
                                rules={{
                                    required: false
                                }}
                            /> 
                        </div>
                     </div>
                     <div className="myProfile_container_body_subSection_content_grouped">
                     <InputWithLabel
                          label="City / Locality"
                          field="city"
                          register={register}
                          placeholder='Enter City'
                          smallLabel
                          dashboardType={dashboardType=="slate2.0"?true:false}
                        />
                    <InputWithLabel
                      label="Zip / Postcode *"
                      field="postalCode"
                      register={register}
                      error={ errors.postalCode}
                      placeholder='Enter Zip / Postcode'
                      smallLabel
                      dashboardType={dashboardType=="slate2.0"?true:false}
                    />
                  </div>
                </div>
              </form>
            </div>
            <div className={dashboardType=='slate2.0'?"myProfile_container_body_subSection myProfile__slateDashboard__subSection":"myProfile_container_body_subSection"}>
              <div className={dashboardType=='slate2.0'?"myProfile_container_body_subSection_heading myProfile__slateDashboard__password":"myProfile_container_body_subSection_heading"}>
                Password
              </div>
              <div
                ref={passwordFieldsRef}
                className="myProfile_container_body_subSection_content"
              >
                {/* {showPasswordFields ? ( */}
                  <>
                    <InputWithLabel
                      label="Current Password"
                      field="currentPassword"
                      type="password"
                      register={register}
                      error={errors.currentPassword}
                      showPassword={showCurrentPassword}
                      handleShowPasswordClick={() =>
                        setShowCurrentPassword((prev: any) => !prev)
                      }
                      smallLabel
                      customStyle={{ marginBottom: "3rem" }}
                      dashboardType={dashboardType=="slate2.0"?true:false}
                    />
                    <InputWithLabel
                      label="New Password"
                      field="newPassword"
                      type="password"
                      register={register}
                      error={errors.newPassword}
                      showPassword={showPassword.newPassword}
                      handleShowPasswordClick={() =>
                        setShowPassword((prev: any) => {
                          return { ...prev, newPassword: !prev.newPassword };
                        })
                      }
                      customStyle={{ marginBottom: "3rem" }}
                      smallLabel
                      dashboardType={dashboardType=="slate2.0"?true:false}
                    />
                    <InputWithLabel
                      label="Confirm Password"
                      field="confirmPassword"
                      type="confirm_password"
                      showPassword={showPassword.confirmPassword}
                      register={register}
                      error={errors.confirmPassword}
                      handleShowPasswordClick={() =>
                        setShowPassword((prev: any) => {
                          return {
                            ...prev,
                            confirmPassword: !prev.confirmPassword,
                          };
                        })
                      }
                      customStyle={{ marginBottom: "3rem" }}
                      smallLabel
                      dashboardType={dashboardType=="slate2.0"?true:false}
                    />
                    {/* <span
                      onClick={() => {
                        setValue("changePassword", false);
                        setShowPasswordFields(false);
                      }}
                      className= {dashboardType =='slate2.0'?"myProfile_container_body_subSection_content_changePassword myProfile_ml1 myProfile__slateDashboard__cancel":"myProfile_container_body_subSection_content_changePassword myProfile_ml1"}
                    >
                      Cancel
                    </span> */}
                  </>
                {/* ) 
                : (
                  <span
                    onClick={() => {
                      setValue("changePassword", true);
                      setShowPasswordFields(true);
                    }}
                    className={dashboardType =='slate2.0'?"myProfile__slateDashboard__secondaryEmail myProfile_container_body_subSection_content_changePassword":"myProfile_container_body_subSection_content_changePassword"}
                  >
                    Change password
                  </span>
                )} */}
              </div>
            </div>
            {/* <div className="myProfile_container_body_subSection">
              <div className="myProfile_container_body_subSection_heading">
                Accounts
              </div>
            </div> */}
          </div>
        </div>
        <CloseButton onHandleClose={handleClose} color={ dashboardType =='slate2.0'? 'white':''} />
        <ActionButtons
          progressText="Save"
          cancelText="Discard"
          isProgressing={isSaving}
          onProgressHandler={handleSubmit(handleSave)}
          onCancelHandler={handleClose}
          slateDashboard = {dashboardType =='slate2.0'?true:false}
        />
      </Box>
    </Modal>
  );
};

export default MyProfile;
