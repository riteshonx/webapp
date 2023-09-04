import React, { ReactElement, useContext } from "react";
import { stateContext } from "src/modules/root/context/authentication/authContext";
import TenantView from "../Dashboard1/Components/TenantView/TenantView";
import PortfolioView from "./Components/PortfolioView/PortfolioView";
import ProjectView from "./Components/ProjectView/ProjectView";
import "./PCLandingPage.scss";

const PCLandingPage = (): ReactElement => {
  const { state }: any = useContext(stateContext);

  return state.currentLevel === "portfolio" ? (
    <div className={"pcLandingPage-main"}>
      <PortfolioView />
    </div>
  ) : state.currentLevel === "project" ? (
    <div className={"pcLandingPage-main"}>
      <ProjectView />
    </div>
  ) : (
    <TenantView />
  );
};

export default PCLandingPage;
