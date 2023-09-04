import { useEffect, useState, useContext } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import Header from "src/modules/authentication/components/Header";
import InputWithLabel from "src/modules/authentication/components/InputWithLabel";
import "./index.scss";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  signUpValidationSchema,
  SignUpFormInputData,
  useQuery,
  exchangeTokenFeatures,
} from "src/modules/authentication/utils";
import jwtDecode from "jwt-decode";
import { axiosApiInstance, getApi } from "src/services/api";
import { setExchangeToken } from "src/services/authservice";
import { setToken } from "src/services/authservice";
import { setIsAuthenticated,setPasswordConfig } from "src/modules/root/context/authentication/action";
import { login, postApi } from "src/services/api";
import { ExchangeToken } from "../../utils";
import { stateContext } from "src/modules/root/context/authentication/authContext";
import Notification, {
  AlertTypes,
} from "src/modules/shared/components/Toaster/Toaster";
import useUpdateEffect from "src/modules/authentication/hooks/useUpdateEffect";
import SubmitButton from "../../components/SubmitButton";
import SlateLogo from "src/assets/images/logoWhite.png";
import { useHistory } from "react-router-dom";
import CircularProgress from "@material-ui/core/CircularProgress";
import { Token } from "graphql";
import BannerLogo from "src/assets/images/BannerLogo.svg";
import axios from "axios";

const URL = process.env["REACT_APP_ENVIRONMENT"];
const AUTH_URL = process.env["REACT_APP_AUTHENTICATION_URL"];
enum TokenState {
  TOKEN_EXPIRED = "TOKEN_EXPIRED",
  USER_ALREADY_SIGNEDUP = "USER_ALREAD_SIGNEDUP",
}

const SignUp = (): JSX.Element => {
  const history = useHistory();
  const token: any = useQuery().get("token");
  const [isPageError, setPageError] = useState({ value: false, message: "" });
  const [decodedToken, setDecodedToken] = useState<any>({});
  const [dataSubmitted, setDataSubmitted] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState({
    password: false,
    confirmPassword: false,
  });
  const authContext: any = useContext(stateContext);
  const [canUserSignup, setCanUserSignup] = useState<{
    value: null | boolean;
    reason: null | TokenState;
  }>({
    value: null,
    reason: null,
  });
  const DASHBOARD_URL: any = process.env["REACT_APP_DASHBOARD_URL"];
  const {
    getValues,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SignUpFormInputData>({
    mode: "all",
    resolver: yupResolver(signUpValidationSchema()),
  });

  useEffect(() => {
    try {
      const decoded: any = jwtDecode(token);
      const currentEpochInSeconds = Math.floor(new Date().getTime() / 1000);
      const expiry = Number(decoded["exp"]);
      const hasTokenExpired = expiry < currentEpochInSeconds + 600; // we make sure that there is atleast a 10 min window
      if (hasTokenExpired) {
        setCanUserSignup({ value: false, reason: TokenState.TOKEN_EXPIRED });
      }
      setDecodedToken(decoded);
      (async () => {
        try {
          const response = await getApi(
            `V1/user/${decoded["x-hasura-user-id"]}/status`
          );
          if (response?.success?.status === "ACTIVE") {
            setCanUserSignup({ value: false, reason: null });
            history.push("/");
          } else if (!hasTokenExpired)
            setCanUserSignup({
              value: true,
              reason: null,
            });
        } catch {
          setPageError({
            value: true,
            message: "Invalid / no token passed in URL",
          });
        }
      })();
    } catch (e) {
      console.error("Error occurred while decoding token", e);
      setPageError({
        value: true,
        message: "Invalid / no token passed in URL",
      });
    }
  }, []);
  useEffect(() => {
    setValue("email", decodedToken["user-email"]);
    setValue("company", decodedToken["tenant-company"]);
    if (decodedToken["last-name"]) {
      setValue("lastName", decodedToken["last-name"]);
    }
    if (decodedToken["first-name"]) {
      setValue("firstName", decodedToken["first-name"]);
    }
  }, [decodedToken]);

  useUpdateEffect(() => {
    setIsLoading(true);
    (async () => {
      try {
        await axiosApiInstance.patch(
          `${AUTH_URL}V1/user/${decodedToken["x-hasura-user-id"]}`,
          dataSubmitted,
          {
            headers: {
              token: "queryToken",
              tokenString: token,
            },
          }
        );
        const user = {
          email: getValues("email"),
          password: getValues("password"),
        };
        const loginResponse = await login(user);
        setToken(loginResponse.data.success);

        const exchangeToken: ExchangeToken = {
          tenantId: decodedToken["x-hasura-tenant-id"],
          features: exchangeTokenFeatures,
        };
        const exchangeResponse = await postApi(
          "V1/user/login/exchange",
          exchangeToken
        );
        setExchangeToken(
          exchangeResponse.success,
          decodedToken["x-hasura-tenant-id"]
        );
        authContext.dispatch(setIsAuthenticated(true));
        history.push("/");
      } catch (e) {
        console.error("Error occurred while signing up", e);
        Notification.sendNotification(
          "Your sign up invitation link has expired. Please reach out to your system administrator to get a new invitation.",
          AlertTypes.error
        );
      } finally {
        setIsLoading(false);
      }
    })();
  }, [dataSubmitted]);
  useEffect(()=>{
    getPasswordConfiguration()
  },[])
  const onSubmit: SubmitHandler<SignUpFormInputData> = (values) => {
    const toBeSubmitted = JSON.parse(JSON.stringify(values));
    delete toBeSubmitted.email;
    delete toBeSubmitted.confirmPassword;
    //toBeSubmitted.companyType = "Supplier";
    toBeSubmitted.tenant = decodedToken["x-hasura-tenant-id"];
    setDataSubmitted(toBeSubmitted);
  };

  if (isPageError.value) {
    return (
      <div className="ftSignup_error">
        <div className="ftSignup_error_message">
          <h2>Something went wrong!</h2>
          <p>ERR_MSG: {isPageError.message}</p>
        </div>
      </div>
    );
  }
   const getPasswordConfiguration = async () => {
			try {
				const decodedToken: any = jwtDecode(token);
				const tenantId = decodedToken['x-hasura-tenant-id'];
				const authorizationToken = token;
				const response = await axios.post(
					`https://authentication.service.${URL}.slate.ai/V1/getPasswordFormat`,
					{ tenantId },
					{
						headers: {
							Authorization: `Bearer ${authorizationToken}`,
						},
					}
				);
				const responseData = response?.data.success?.Data.passwordFormat;
				authContext.dispatch(setPasswordConfig(responseData));
			} catch (err) {
				console.log('error while fetching the password configuration', err);
			}
		};

  return (
    <div className="ftSignup">
      {/* <SkewedDiagonal /> */}
      <div className="ftSignup_logo">
        <img src={SlateLogo} width={"55px"} height={"40px"} />
      </div>
      <div className="ftSignup_leftContainer">
        <div className={"ftSignup_leftContainer_text"}>
          <div className={"ftSignup_leftContainer_text_1"}>
            {/* <b>Slate</b> */}
            <img src={BannerLogo} width={"475px"} />
            {/* <span className={"ftSignup_leftContainer_text_2"}>
              &nbsp;Technologies
            </span> */}
          </div>
          <div className={"ftSignup_leftContainer_text_3"}>
            Building Bridges to the <b>future</b> through{" "}
            <b>smart technologies</b> and <b>smarter construction.</b>
          </div>
        </div>
      </div>
      <div className="ftSignup_container_parent1">
        <div className={"ftSignup_container_parent2"}>
          {canUserSignup.value === null ? (
            <div className="ftSignup_loading">
              <CircularProgress style={{ color: "black" }} />
              <p style={{ marginTop: "1rem" }}>Please wait...</p>
            </div>
          ) : canUserSignup.value === false &&
            canUserSignup.reason === TokenState.TOKEN_EXPIRED ? (
            <div className="ftSignup_expiredLink">
              <h3>Uh oh! This invitation link has expired.</h3>
              <p style={{ marginTop: "1rem" }}>
                Please contact your admin and ask them to re-send the
                invitation.
              </p>
            </div>
          ) : (
            <div className={"ftSignup_container"}>
              <Header heading="Set up your account" description="" />
              <form
                className="ftSignup_container_form"
                onSubmit={handleSubmit(onSubmit)}
              >
                <div className="ftSignup_container_form_nameBox">
                  <InputWithLabel
                    label="First Name"
                    field="firstName"
                    register={register}
                    readOnly
                  />
                  <InputWithLabel
                    label="Last Name"
                    field="lastName"
                    register={register}
                    readOnly
                  />
                </div>

                <InputWithLabel
                  label="Email"
                  field="email"
                  register={register}
                  readOnly
                />

                <InputWithLabel
                  label="Create Password"
                  field="password"
                  type="password"
                  register={register}
                  showPassword={showPassword.password}
                  error={errors.password}
                  handleShowPasswordClick={() =>
                    setShowPassword((prev: any) => {
                      return { ...prev, password: !prev.password };
                    })
                  }
                  placeholder="Create password"
                />

                <InputWithLabel
                  label="Confirm Password"
                  field="confirmPassword"
                  type="confirm_password"
                  register={register}
                  showPassword={showPassword.confirmPassword}
                  error={errors.confirmPassword}
                  handleShowPasswordClick={() =>
                    setShowPassword((prev: any) => {
                      return {
                        ...prev,
                        confirmPassword: !prev.confirmPassword,
                      };
                    })
                  }
                  placeholder="Confirm password"
                />

                <InputWithLabel
                  label="Company"
                  field="company"
                  register={register}
                  readOnly
                />
                <SubmitButton
                  value="Sign Up"
                  isSubmitting={isLoading}
                  disabled={isLoading}
                />
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignUp;


