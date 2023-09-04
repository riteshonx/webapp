import React from 'react';
import { NavLink } from 'react-router-dom';
import { LandingPageLinks } from 'src/version2.0/utils/constants/LandingPageMenuConstants';
import './LandingPageMenu.scss';

export const LandingPageMenu = (): React.ReactElement => {
  const renderMenu = LandingPageLinks.map((link) => {
    return (
      <NavLink
        className="v2-component-menu-landing-page-link"
        key={link.label}
        to={link.path}
        exact
      >
        <div>{link.label}</div>
        <div className="v2-component-menu-landing-page-link-detail">
          {link.subLabel}
        </div>
      </NavLink>
    );
  });
  return <div className="v2-component-menu-landing-page">{renderMenu}</div>;
};
