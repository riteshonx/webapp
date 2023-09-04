import * as Yup from "yup";
import {useContext } from "react";
import { useLocation } from "react-router-dom";
import { features } from "src/utils/constants";
import { stateContext } from "src/modules/root/context/authentication/authContext";


export const signUpValidationSchema =()=>{
 const {state:{passwordConfig}} = useContext(stateContext);
 const passwordRegex = new RegExp(
  `^(?=.*[A-Z]{${passwordConfig.minUpperCase},})(?=.*[0-9]{${passwordConfig.minNumeric},})(?=.*[@#$%^&+*!=]{${passwordConfig.minSpecialChar},}).*$`
);
 return Yup.object().shape({
  password: Yup.string()
    .required("Please enter your password")
    .min(passwordConfig.minLength, `For your security, the password must be at least ${passwordConfig.minLength} characters`)
    .max(
      passwordConfig.maxLength,
      `For your sanity and ours, the password should be a maximum of ${passwordConfig.maxLength} characters`
    )
    .matches(
      passwordRegex,
      `Your password must contain atleast ${passwordConfig.minUpperCase}  UPPERCASE, ${passwordConfig.minNumeric} number and ${passwordConfig.minSpecialChar} $peci@l character`
    ),
  confirmPassword: Yup.string()
    .required("Please confirm your password")
    .oneOf([Yup.ref("password")], "Uh-oh!  The passwords aren't matching"),
})};

export const loginValidationSchema = Yup.object().shape({
  email: Yup.string()
    .email("Hmm...This doesn't quite look like an email address")
    .required("Please enter your email address"),
  password: Yup.string().required("Please enter your password"),
});

export const forgotPasswordValidationSchema = Yup.object().shape({
  email: Yup.string()
    .email("Hmm...This doesn't quite look like an email address")
    .required("Please enter your registered email address"),
});

export const resetPasswordValidationSchema =()=>{
const {state:{passwordConfig}} = useContext(stateContext);
const passwordRegex = new RegExp(
  `^(?=.*[A-Z]{${passwordConfig.minUpperCase},})(?=.*[0-9]{${passwordConfig.minNumeric},})(?=.*[@#$%^&+*!=]{${passwordConfig.minSpecialChar},}).*$`
);
  const matchesMessage = [
    passwordConfig.minUpperCase > 0 && `${passwordConfig.minUpperCase} uppercase`,
    passwordConfig.minNumeric > 0 && `${passwordConfig.minNumeric} numeric`,
    passwordConfig.minSpecialChar > 0 && `${passwordConfig.minSpecialChar} special character`
  ]
    .filter(Boolean)
    .join(', ');
 return Yup.object().shape({
  password: Yup.string()
    .required("Please enter your password")
    .min(passwordConfig.minLength, `For your security, the password must be at least ${passwordConfig.minLength} characters`)
    .max(
      passwordConfig.maxLength,
      `For your sanity and ours, the password should be a maximum of ${passwordConfig.maxLength} characters`
    )
    .matches(
      passwordRegex,
       matchesMessage ? `Your password must contain ${matchesMessage}` :''
    ),
  confirmPassword: Yup.string()
    .required("Please confirm your password")
    .oneOf([Yup.ref("password")], "Uh-oh! The passwords aren't matching"),
});
}
export type SignUpFormInputData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  company: string;
};

export type LoginFormInputData = {
  email: string;
  password: string;
};

export type ForgotPasswordFormInputData = {
  email: string;
};

export type ResetPasswordFormInputData = {
  password: string;
  confirmPassword: string;
};

export function useQuery(): URLSearchParams {
  return new URLSearchParams(useLocation().search);
}

export interface ExchangeToken {
  tenantId: number;
  features: Array<string>;
}

export interface ProjectExchangeToken {
  tenantId: number;
  projectId: number;
  features: Array<string>;
}

export const exchangeTokenFeatures = [
  features.PROJECT,
  features.USER,
  features.ROLE,
  features.COMPANY,
  features.FORM,
  features.TASK,
  features.CUSTOMLIST,
  features.CALENDAR,
  features.WORKFLOW,
  features.MATERIAL_MASTER,
  features.DVA
];

export const projectExchangeTokenFeatures = [
  features.MASTERPLAN,
  features.BIM,
  features.PLANCOMPONENT,
  features.DRAWINGS,
  features.SPECIFICATIONS,
  features.FORMS,
  features.DMS,
  features.DAILYLOG,
];

const REMEMBER_ME_KEY = "remember-me-email-id";

export const setRememberMeValue = (value: string): void => {
  if (value === "null" || value === "undefined") return;
  if (value) {
    localStorage.setItem(REMEMBER_ME_KEY, value);
  }
};

export const getRememberMeValue = () => {
  const value = localStorage.getItem(REMEMBER_ME_KEY);
  if (value) return value;
  return "";
};

export const getLocalStorgeValue = (keyRegex: RegExp) => {
  const items = Object.entries({ ...localStorage });
  const filtereditems = items.filter(([key, value]) => keyRegex.test(key));
  return Object.fromEntries(filtereditems);
};

export const setLocalStorgeValue = (keyValuePair: Record<string, string>) => {
  Object.keys(keyValuePair).map((key) =>
    localStorage.setItem(key, keyValuePair[key])
  );
};
