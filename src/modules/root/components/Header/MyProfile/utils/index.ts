import * as Yup from "yup";
import {useContext } from "react";
import { stateContext } from "src/modules/root/context/authentication/authContext";

export const myProfileValidationSchema =()=>{
const {state:{passwordConfig}} = useContext(stateContext);
const passwordRegex = new RegExp(
  `^(?=.*[A-Z]{${passwordConfig.minUpperCase},})(?=.*[0-9]{${passwordConfig.minNumeric},})(?=.*[@#$%^&+*!=]{${passwordConfig.minSpecialChar},}).*$`
);
return Yup.object().shape({
  firstName: Yup.string(),
  lastName: Yup.string(),
  email: Yup.string(),
  jobTitle: Yup.string(),
  //Phone number validation regex refer to: https://stackoverflow.com/questions/2113908/what-regular-expression-will-match-valid-international-phone-numbers#answer-19592342
  phone: Yup.string()
    .matches(
      /^$|(\+|0)*[1-9][0-9 \-\(\)\.]{7,32}$/,
      "Please provide a valid phone number"
    )
    .nullable(),
  secondaryEmail: Yup.string()
    .email("that doesn't quite look like an email")
    .notOneOf(
      [Yup.ref("email")],
      "secondary email cannot be same as primary email"
    ),
  changePassword: Yup.boolean(),
  postalCode: Yup.string().max(10, "max 10 characters").required("Postcode is required"),
  country: Yup.string().max(30, "max 30 characters").required("Country is required"),
  state: Yup.string().max(30, "max 30 characters"),
  city: Yup.string().max(30, "max 30 characters"),
  fullAddress:Yup.string().required(),
   currentPassword: Yup.string()
    .required("Please enter your current password"),
    // .min(passwordConfig.minLength, `Password is at least ${passwordConfig.minLength} characters`)
    // .max(passwordConfig.maxLength, "Password is at most 12 characters")
    // .matches(
    //   passwordRegex,
    //   `Your password must contain atleast ${passwordConfig.minUpperCase}  UPPERCASE, ${passwordConfig.minNumeric} number and ${passwordConfig.minSpecialChar} $peci@l character`
    // )
  newPassword: Yup.string()
    .required("Please enter your new password")
    .min(passwordConfig.minLength, `For your security, the password must be at least ${passwordConfig.minLength} characters`)
    .max(passwordConfig.maxLength, `For your sanity and ours, the password should be a maximum of ${passwordConfig.maxLength} characters`)
    .matches(
      passwordRegex,
      `Your password must contain atleast ${passwordConfig.minUpperCase}  UPPERCASE, ${passwordConfig.minNumeric} number and ${passwordConfig.minSpecialChar} $peci@l character`
    ),
  confirmPassword: Yup.string()
    .oneOf(
      [Yup.ref("newPassword")],
      "Uh-oh! The passwords aren't matching"
    ),
})};

export type MyProfileFormInputData = {
  firstName: string;
  lastName: string;
  email: string;
  id: string;
  jobTitle: string;
  phone: string;
  secondaryEmail: string;
  userEmailAssociations?: any;
  addresses?: any;
  changePassword: boolean;
  currentPassword: string;
  confirmPassword: string;
  newPassword: string;
  fullAddress: string;
  postalCode: string;
  addressLine2: string;
  country: string;
  state: string;
  city: string;
};

export type MyProfileProps = {
  open: boolean;
  handleCloseModal: () => void;
};

export type AddressData = {
  description: string;
  place_id: string;
};

export const extractAddressComponents = (addressComponents: any) =>
  addressComponents.reduce((obj: any, current: any) => {
    const { types, long_name } = current;
    if (types.includes("locality")) {
      obj.city = long_name;
    } else if (types.includes("administrative_area_level_1")) {
      obj.state = long_name;
    } else if (types.includes("country")) {
      obj.country = long_name;
    } else if (types.includes("postal_code")) {
      obj.postalCode = long_name;
    } else if (types.includes("street_number")) {
      obj.streetNumber = long_name;
    }
    return obj;
  }, {});

export const initSeedData = {
  firstName: "",
  lastName: "",
  email: "",
  jobTitle: "",
  phone: "",
  id: "",
  changePassword: false,
  secondaryEmail: "",
  currentPassword: "",
  confirmPassword: "",
  newPassword: "",
  fullAddress: "",
  postalCode: "",
  addressLine2: "",
  country: "",
  state: "",
  city: "",
};
