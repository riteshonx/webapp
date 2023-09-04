import { useState, useEffect, useContext } from "react";
import Header from "src/modules/authentication/components/Header";
import {
  resetPasswordValidationSchema,
  ResetPasswordFormInputData,
  useQuery,
} from "src/modules/authentication/utils";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, SubmitHandler } from "react-hook-form";
import InputWithLabel from "src/modules/authentication/components/InputWithLabel";
import jwtDecode from "jwt-decode";
import "./index.scss";
import { axiosApiInstance } from "src/services/api";
import Notification, {
  AlertTypes,
} from "src/modules/shared/components/Toaster/Toaster";
import { useHistory } from "react-router-dom";
import SubmitButton from "../../components/SubmitButton";
import SlateLogo from "src/assets/images/logoWhite.png";
import axios from "axios";
import { stateContext } from "src/modules/root/context/authentication/authContext";
import { setPasswordConfig } from "src/modules/root/context/authentication/action";

const AUTH_URL = process.env["REACT_APP_AUTHENTICATION_URL"];

const ResetPassword = (): JSX.Element => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormInputData>({
    mode: "all",
    resolver: yupResolver(resetPasswordValidationSchema()),
  });

  const history = useHistory();
  const token: any = useQuery().get("token");
  const [showPassword, setShowPassword] = useState({
    password: false,
    confirmPassword: false,
  });
  const [decodedToken, setDecodedToken] = useState<any>({});
  const [isPageError, setPageError] = useState({ value: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
const { state :{passwordConfig},dispatch } = useContext(stateContext);
  useEffect(() => {
    try {
      const decoded = jwtDecode(token);
      setDecodedToken(decoded);
    } catch (e) {
      console.error("Error occurred while decoding token", e);
      setPageError({
        value: true,
        message: "Invalid / no token passed in URL",
      });
    }
  }, []);

  useEffect(()=>{
    getPasswordConfiguration()
  },[])
     const getPasswordConfiguration = async () => {
			try {
        const URL = process.env["REACT_APP_ENVIRONMENT"];
				const decodedToken: any = jwtDecode(token);
				const userId = decodedToken['x-hasura-user-id'];
				const authorizationToken = token;
				const response = await axios.post(
					`https://authentication.service.${URL}.slate.ai/V1/getPasswordFormat`,
					{userId},
					{
						headers: {
							Authorization: `Bearer ${authorizationToken}`,
						},
					}
				);
				const responseData = response?.data?.success?.Data?.passwordFormat;
				dispatch(setPasswordConfig(responseData));
			} catch (err) {
				console.log('error while fetching the password configuration', err);
        setPageError({
        value: true,
        message: "Token Expired!!",
      });
    }
		};

  const onSubmit: SubmitHandler<ResetPasswordFormInputData> = async (
    values
  ) => {
    const toBeSubmitted = JSON.parse(JSON.stringify(values));
    delete toBeSubmitted.confirmPassword;
    try {
      setIsLoading(true);
      await axiosApiInstance.patch(
        `${AUTH_URL}V1/user/${decodedToken["x-hasura-user-id"]}/resetPassword`,
        toBeSubmitted,
        {
          headers: {
            token: "queryToken",
            tokenString: token,
          },
        }
      );
      Notification.sendNotification(
        "Successfully updated password",
        AlertTypes.success
      );
      history.push("/login");
    } catch (e) {
      Notification.sendNotification(
        "Something went wrong. Please try again",
        AlertTypes.warn
      );
      console.error("Error occurred while resetting password", e);
      setIsLoading(false);
    }
  };

  if (isPageError.value) {
    return (
      <div className="resetPassword_error">
        <div className="resetPassword_error_message">
          <h2>Something went wrong!</h2>
          <p>ERR_MSG: {isPageError.message}</p>
        </div>
      </div>
    );
  }
 const matchesMessage = [
    passwordConfig.minUpperCase > 0 && `${passwordConfig.minUpperCase} uppercase`,
    passwordConfig.minNumeric > 0 && `${passwordConfig.minNumeric} numeric`,
    passwordConfig.minSpecialChar > 0 && `${passwordConfig.minSpecialChar} special character`
  ]
    .filter(Boolean)
    .join(', ');
  const description = `Please ensure that your password has min.${passwordConfig.minLength} and max. 
              ${passwordConfig.maxLength} characters ${matchesMessage}`
  return (
    <div className="resetPassword">
      {/* <SkewedDiagonal /> */}
      <div className="resetPassword_logo">
        <img src={SlateLogo} width={"55px"} height={"40px"} />
      </div>
      <div className="resetPassword_leftContainer">
        <div className={"resetPassword_leftContainer_text"}>
          <div className={"resetPassword_leftContainer_text_1"}>
            <b>Slate</b>
            <span className={"resetPassword_leftContainer_text_2"}>
              &nbsp;Technologies
            </span>
          </div>
          {/* <div className={"resetPassword_leftContainer_text_3"}>
            Building Bridges to the <b>future</b> through{" "}
            <b>smart technologies</b> and <b>smarter construction.</b>
          </div> */}
        </div>
      </div>
      <div className="resetPassword_container_parent1">
        <div className={"resetPassword_container_parent2"}>
          <div className="resetPassword_container">
            <Header
              heading="Password Reset"
              description={description}
            />

            <form
              className="resetPassword_container_form"
              onSubmit={handleSubmit(onSubmit)}
            >
              <InputWithLabel
                label="New Password"
                field="password"
                type="password"
                placeholder="Enter your new password"
                register={register}
                error={errors.password}
                showPassword={showPassword.password}
                handleShowPasswordClick={() =>
                  setShowPassword((prev: any) => {
                    return { ...prev, password: !prev.password };
                  })
                }
              />
              <InputWithLabel
                label="Confirm Password"
                field="confirmPassword"
                type="confirm_password"
                placeholder="Repeat your new password"
                showPassword={showPassword.confirmPassword}
                register={register}
                error={errors.confirmPassword}
                handleShowPasswordClick={() =>
                  setShowPassword((prev: any) => {
                    return { ...prev, confirmPassword: !prev.confirmPassword };
                  })
                }
              />
              <SubmitButton
                value="Update Password"
                isSubmitting={isLoading}
                disabled={isLoading}
                halfWidth={false}
              />
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
