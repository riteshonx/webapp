import React, { ReactElement, useContext } from "react";
import { useHistory } from "react-router-dom";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";
import "./BackNavigation.scss";
import { stateContext } from "src/modules/root/context/authentication/authContext";
import { setPreviousRoute, setSelectedMenu } from "src/modules/root/context/authentication/action";

export default function BackNavigation(props: any): ReactElement {
  const history = useHistory();
  const { state, dispatch }: any = useContext(stateContext);

  const navBack = () => {
    const path = props.navBack ? `${props.navBack}` : "/";
    if (path === "/") {
      dispatch(setSelectedMenu("Home"));
      sessionStorage.setItem("selectedMenu", "Home");
    }

    if (state.previousRotue == "/productionCenter") {
      dispatch(setSelectedMenu("Production Center"));
      sessionStorage.setItem("selectedMenu", "Production Center");
      dispatch(setPreviousRoute(""));
      history.push("/productionCenter");
    } else {
      history.push(`${path}`);
    }
  };
  return (
    <>
      <ArrowBackIosIcon onClick={navBack} className="backNavigation" />
    </>
  );
}
