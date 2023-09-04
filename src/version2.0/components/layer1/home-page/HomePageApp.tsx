import React from 'react';
import '../../../assets/styles/index.scss';
import { LandingPageMenu } from '../menu/LandingPageMenu';
import { Header } from '../header/header';
import Feed from '../../layer2/Feed/Feed'
import { BrowserRouter as Router } from 'react-router-dom';
import RouterConfigurations from 'src/version2.0/config/router-config/Router';
import FloatingMenu from "../../../components/layer1/floating-menu/FloatingMenu";

export const HomePageApp = (): React.ReactElement => {

  return (
    <div className="v2-components-homepage-container">
      <Router>
        <Header />
        <div className="v2-components-homepage-main">
          <RouterConfigurations />
        </div>
         <Feed/>
      </Router>
      {/* <Forms/> */}
      <FloatingMenu/>
    </div>
  );
};
