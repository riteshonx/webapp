import { ReactElement, useContext, useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useForm, SubmitHandler } from 'react-hook-form';
import { login, postApi } from 'src/services/api';
import {
  decodeExchangeToken,
  decodeToken,
  logout,
  setActiveTenantId,
  setExchangeToken,
  setToken,
} from 'src/services/authservice';
import {
  LoginFormInputData,
  ExchangeToken,
  exchangeTokenFeatures,
  loginValidationSchema,
  getRememberMeValue,
  setRememberMeValue,
} from 'src/modules/authentication/utils';
import { setIsAuthenticated } from 'src/modules/root/context/authentication/action';
import { yupResolver } from '@hookform/resolvers/yup';
import { stateContext } from 'src/modules/root/context/authentication/authContext';
import './Login.scss';
import Notification, {
  AlertTypes,
} from 'src/modules/shared/components/Toaster/Toaster';
import InputWithCustomOnChange from '../../components/InputWithCustomOnChange';
import { Link } from 'react-router-dom';
import SubmitButton from '../../components/SubmitButton';
import SlateLogo from 'src/assets/images/logoWhite.png';
import BannerLogo from 'src/assets/images/BannerLogo.svg';
import ForgotPassword from '../ForgotPassword';
import Tooltip from '@mui/material/Tooltip';
import Zoom from '@mui/material/Zoom';
import HelpIcon from '@material-ui/icons/Help';

const disableUserMessage =
  'Your account is deactivated. Please contact your admin for getting access';
export default function Login(): ReactElement {
  const rememberMeValue = getRememberMeValue();
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<LoginFormInputData>({
    defaultValues: {
      email: rememberMeValue || '',
    },
    mode: 'onBlur',
    resolver: yupResolver(loginValidationSchema),
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [invalidCredentials, setInValidCredentials] = useState(false);
  const [rememberMe, setRememberMe] = useState(rememberMeValue ? true : false);
  const [errorMessage, setErrorMessage] = useState('');
  const context: any = useContext(stateContext);
  const history = useHistory();
  const [accountNotLocked, setAccountNotLocked] = useState(true);

  const emailRegistered = register('email');
  const passwordRegistered = register('password');

  const handleChange = (e: any) => {
    setInValidCredentials(false);
  };

  const getLocation = (href: any) => {
    const l = document.createElement('a');
    l.href = href;
    return l.pathname + l.search;
  };

  const fetchExchangeToken = async () => {
    const redirectURL = localStorage.getItem('redirectURL');
    setActiveTenantId(
      Number(decodeToken().tenantId),
      decodeToken().tenantCompany
    );
    const exchangeToken: ExchangeToken = {
      tenantId: Number(decodeToken().tenantId),
      features: exchangeTokenFeatures,
    };
    const response = await postApi('V1/user/login/exchange', exchangeToken);
    setExchangeToken(response.success, Number(decodeToken().tenantId));

    if (redirectURL) {
      //history.push(getLocation(redirectURL));
      localStorage.removeItem('redirectURL');
      location.replace(redirectURL);
      //location.reload();
    } else {
      context.dispatch(setIsAuthenticated(true));
      history.push('/');
    }
  };

  const onSubmit: SubmitHandler<LoginFormInputData> = async (values) => {
    try {
      setIsLoading(true);
      setAccountNotLocked(true);
      const response = await login(values);
      if (rememberMe) setRememberMeValue(values.email);
      else setRememberMeValue('');
      setToken(response.data.success);
      try {
        await fetchExchangeToken();
      } catch (e) {
        Notification.sendNotification(
          'Something went wrong while logging you in',
          AlertTypes.warn
        );
        console.error('Error occurred while fetching exchange token', e);
        logout();
      }
    } catch (error: any) {
      if (error?.response?.status === 400) {
        setInValidCredentials(true);
        if (error?.response?.data?.error === 'INVALID_CREDENTIALS') {
          setErrorMessage(
            'The email or password you have entered is incorrect.'
          );
        } else if (error?.response?.data?.error === 'USER_ACCOUNT_LOCKED') {
          setAccountNotLocked(false);
          setErrorMessage(`A wrong password has been entered for this email address multiple times.
           As a security precaution, we have locked your account for 24 hours.`);
        } else if (error?.response?.data?.error === 'UNREGISTERED') {
          setErrorMessage(`Email-Id(s) not registered.`);
        } else if (error?.response?.data?.error === 'SIGNUP_INCOMPLETE') {
          setErrorMessage(`Sign Up is Incomplete`);
        } else if (
          error?.response?.data?.error === 'INVALID_TENANT_USER_ASSOCIATION'
        ) {
          setErrorMessage(disableUserMessage);
        } else {
          setErrorMessage(
            'The email or password you have entered is incorrect.'
          );
        }
      } else if (error?.response?.status === 401) {
        setInValidCredentials(true);
        if (error?.response?.data?.error === 'INVALID_CREDENTIALS') {
          setErrorMessage(
            'The email or password you have entered is incorrect.'
          );
        }
      } else if (error == 'Error: Network Error')
        Notification.sendNotification(
          'Please check your network connection',
          AlertTypes.warn
        );
      else
        Notification.sendNotification('Something went wrong', AlertTypes.warn);
      console.error('Error occurred while signing in', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="ftLogin">
      <div className="ftLogin_logo">
        <img src={SlateLogo} width={'55px'} height={'40px'} />
      </div>

      <div className="ftLogin_leftContainer">
        <div className={'ftLogin_leftContainer_text'}>
          <div className={'ftLogin_leftContainer_text_1'}>
            <img src={BannerLogo} width={'475px'} />
          </div>
          <div className={'ftLogin_leftContainer_text_3'}>
            Building Bridges to the <b>future</b> through{' '}
            <b>smart technologies</b> and <b>smarter construction.</b>
          </div>
        </div>
      </div>
      <div>
        {/* <div className={"ftLogin_rightContainerLabel"}>Login</div> */}
        <div className={'ftLogin_container_parent1'}>
          <div className={'ftLogin_container_parent2'}>
            <div className="ftLogin_container">
              {/* <Header
              heading="Login"
              description="Enter email and password to login"
            /> */}

              {invalidCredentials && (
                <p className="ftLogin_error_box">
                  {errorMessage}
                  {accountNotLocked ? (
                    <Tooltip
                      title={
                        <>
                          <ul className="ftLogin_error_tooltip">
                            <li>
                              Confirm your email address is correct, and matches
                              the account that was invited to Slate.
                            </li>
                            <li>
                              If you are having trouble recalling your password,
                              click on “Forgot Password” to reset your password.
                            </li>
                            <li>
                              If you have not finished signing up, please click
                              the link in your invite to setup your Slate
                              account.
                            </li>
                            <li>
                              If you are still having issues, please contact
                              Slate at support@slate.ai.
                            </li>
                          </ul>
                        </>
                      }
                      arrow
                      TransitionComponent={Zoom}
                    >
                      <div className="ftLogin_error_info">
                        &nbsp;
                        <HelpIcon className="ftLogin_error_info_info_icon"></HelpIcon>
                      </div>
                    </Tooltip>
                  ) : (
                    ''
                  )}
                </p>
              )}

              <form
                className="ftLogin_container_form"
                onSubmit={handleSubmit(onSubmit)}
              >
                <InputWithCustomOnChange
                  label="Email"
                  registeredField={emailRegistered}
                  error={errors.email}
                  handleChange={handleChange}
                  placeholder="Enter email"
                />
                <InputWithCustomOnChange
                  label="Password"
                  type="password"
                  registeredField={passwordRegistered}
                  showPassword={showPassword}
                  error={errors.password}
                  handleShowPasswordClick={() =>
                    setShowPassword((prev) => !prev)
                  }
                  handleChange={handleChange}
                  placeholder="Enter password"
                />
                <SubmitButton
                  disabled={isLoading}
                  value="Login"
                  isSubmitting={isLoading}
                />
              </form>
              <div className="ftLogin_container_actions">
                <div className="ftLogin_container_rememberMeBox">
                  <input
                    id="rememberMeCheckBox"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => {
                      setRememberMe(e.target.checked);
                    }}
                  />
                  <label
                    htmlFor="rememberMeCheckBox"
                    className="ftLogin_container_rememberMeText"
                  >
                    Remember Me
                  </label>
                </div>
                {errorMessage === disableUserMessage ? (
                  <div className="ftLogin_container_forgotPasswordLink ftLogin_container_forgotPasswordLink_disabled">
                    <p>Forgot Password?</p>
                  </div>
                ) : (
                  <Link
                    className="ftLogin_container_forgotPasswordLink"
                    to={{
                      pathname: '/forgot-password',
                      state: { emailId: getValues('email') },
                    }}
                  >
                    <p>Forgot Password?</p>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
