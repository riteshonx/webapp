import "./App.scss";
import "react-toastify/dist/ReactToastify.css";

import { CircularProgress } from "@material-ui/core";
import { useEffect, useReducer } from "react";
import ReactDOM from "react-dom";
import {
  BrowserRouter as Router,
  Redirect,
  Route,
  Switch,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";

import ForgotPassword from "./modules/authentication/pages/ForgotPassword";
import Login from "./modules/authentication/pages/Login/Login";
import ResetPassword from "./modules/authentication/pages/ResetPassword";
import SignUp from "./modules/authentication/pages/Signup";
import Header from "./modules/root/components/Header/Header";
import { stateContext } from "./modules/root/context/authentication/authContext";
import {
  initialState,
  stateReducer,
} from "./modules/root/context/authentication/reducer";
import NavigationInterceptor from "./modules/shared/components/NavigationInterceptor/NavigationInterceptor";
import Notify from "./modules/shared/components/Toaster/Toaster";
import { IsPCLProvider } from "./modules/visualize/VisualizeRouting/PCL";

function App(): any {
  const [state, dispatch] = useReducer(stateReducer, initialState);

  useEffect(() => {
    Notify.notifications.subscribe(
      (alert: any) => alert instanceof Function && alert()
    );
  }, []);

  return (
    <stateContext.Provider value={{ state, dispatch }}>
      <Router
        getUserConfirmation={(message: any, callBack: any) => {
          ReactDOM.render(
            <NavigationInterceptor message={message} callBack={callBack} />,
            document.getElementById("redirect-confirmation")
          );
        }}
      >
        {state.isAuthenticated ? (
          <div className="container">
            {
              <IsPCLProvider>
                <Header />
              </IsPCLProvider>
            }
          </div>
        ) : (
          <Switch>
            <Route path="/login" component={Login} />
            <Route path="/signup" component={SignUp} />
            <Route path="/forgot-password" component={ForgotPassword} />
            <Route path="/reset-password" component={ResetPassword} />
            <Route path="/">
              <Redirect to="/login" />
            </Route>
          </Switch>
        )}
      </Router>
      <ToastContainer autoClose={5000} />
      {state.isLoading && (
        <div className="backdrop">
          <CircularProgress color="inherit" />
        </div>
      )}
    </stateContext.Provider>
  );
}

export default App;
