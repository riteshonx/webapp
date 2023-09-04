import { useState } from "react";
import Header from "src/modules/authentication/components/Header";
import {
  forgotPasswordValidationSchema,
  ForgotPasswordFormInputData,
  getRememberMeValue,
} from "src/modules/authentication/utils";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, SubmitHandler } from "react-hook-form";
import { postApi } from "src/services/api";
import "./index.scss";
import InputWithCustomOnChange from "../../components/InputWithCustomOnChange";
import ReturnToLogin from "../../components/ReturnToLogin";
import SubmitButton from "../../components/SubmitButton";
import { useLocation } from "react-router-dom";
import SlateLogo from "src/assets/images/logoWhite.png";

const disableUserMessage= 'Your account is deactivated. Please contact your admin for getting access';

const ForgotPassword = () => {
  const { state } = useLocation<any>();

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<ForgotPasswordFormInputData>({
    defaultValues: {
      email: state?.emailId || getRememberMeValue() || "",
    },
    mode: "all",
    resolver: yupResolver(forgotPasswordValidationSchema),
  });

  const emailRegistered = register("email");
  const [isLoading, setIsLoading] = useState(false);
  const [unregisteredEmail, setUnregisteredEmail] = useState(false);
  const [screenData, setScreenData] = useState({
    heading: "Forgot your password?",
    description: "Please enter the email linked to your Slate account",
    buttonText: "Send Reset Link",
  });

  const handleChange = () => {
    setUnregisteredEmail(false);
  };

  const onSubmit: SubmitHandler<ForgotPasswordFormInputData> = async (
    values
  ) => {
    try {
      setIsLoading(true);
      await postApi("v1/user/forgetPassword", values);
      setScreenData({
        heading: "Password Reset",
        description:
          "If you have an account with Slate, you would have received an email to reset your password. If you're unable to find it, check your spam folder. If you still can't find it, click the button below to resend the email",
        buttonText: "Resend Reset Link",
      });
    } catch (error: any) {
      if (error?.response?.status === 400) {
        if (error?.response?.data?.error === "USER_DELETED_VALIDATION") {
          setScreenData({
            heading: "Deactivated Account",
            description:disableUserMessage,
            buttonText: "Resend Reset Link",
          });
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="forgotPassword">
      <div className="forgotPassword_logo">
        <img src={SlateLogo} width={"55px"} height={"40px"} />
      </div>
      <div className="ftLogin_leftContainer">
        <div className={"ftLogin_leftContainer_text"}>
          <div className={"ftLogin_leftContainer_text_1"}>
            <b>Slate</b>
            <span className={"ftLogin_leftContainer_text_2"}>
              &nbsp;Technologies
            </span>
          </div>
          {/* <div className={"ftLogin_leftContainer_text_3"}>
            Building Bridges to the <b>future</b> through{" "}
            <b>smart technologies</b> and <b>smarter construction.</b>
          </div> */}
        </div>
      </div>
      <div className={"ftLogin_container_parent1"}>
        <div className={"ftLogin_container_parent2"}>
          <div className="forgotPassword_container">
            <div  className={screenData.description==disableUserMessage?'forgotPassword_container_errorBox':''}>
            <Header
              heading={screenData.heading}
              description={screenData.description}
            />
            </div>
            <form
              className="forgotPassword_container_form"
              onSubmit={handleSubmit(onSubmit)}
            >
              <InputWithCustomOnChange
                registeredField={emailRegistered}
                label="Email"
                error={errors.email}
                handleChange={handleChange}
                placeholder="Enter email linked to your slate account"
              />
              <SubmitButton
                value={screenData.buttonText}
                isSubmitting={isLoading}
                disabled={isLoading || errors.email || !getValues("email")}
              />
            </form>
            <ReturnToLogin />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
