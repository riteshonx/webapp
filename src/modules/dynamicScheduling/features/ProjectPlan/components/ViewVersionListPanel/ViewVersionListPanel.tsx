import { Button, Menu, MenuItem, Tooltip } from '@material-ui/core';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import moment from 'moment';
import React, { useState,useContext } from 'react';
import { match, useRouteMatch } from 'react-router-dom';
import BaselineSVG from '../../../../../../assets/images/baseline.svg';
import './ViewVersionListPanel.scss';
import { stateContext } from '../../../../../root/context/authentication/authContext';
export interface Params {
  id: string;
  featureId: string;
}
const ViewVersionListPanel = (props: any) => {
  const {
    currentVersionList,
    projectUser,
    deleteVersion,
    setViewVersionOutSideClickDisabled,
    setSelectedVersion,
    onVersionChange
  } = props;
  const pathMatch: match<Params> = useRouteMatch();

  const [onActionAnchorEl, setOnActionAnchorEl] =
    React.useState<null | HTMLElement>(null);
  const [selectDiscardVersion, setSelectDiscardVersion] = useState<any>(null);
  const actionMenuOpen = Boolean(onActionAnchorEl);
  const { state: authState }: any = useContext(stateContext);

  const onActionClick = (event: any, version: any) => {
    setSelectDiscardVersion(version);
    setOnActionAnchorEl(event.currentTarget);
    setViewVersionOutSideClickDisabled(true);
  };

  const onActionMenuItemClose = () => {
    setOnActionAnchorEl(null);
    setViewVersionOutSideClickDisabled(false);
    setSelectDiscardVersion(null);
  };

  const onDiscardVersionClick = () => {
    deleteVersion(selectDiscardVersion.id);
    setSelectDiscardVersion(null);
    setOnActionAnchorEl(null);
    setViewVersionOutSideClickDisabled(false);
    setSelectedVersion('');
    onVersionChange('');
  };
  const navigateToVersion = (version: any) => {
    const protocol = location.protocol;

    const host = location.host;

    const url = `${protocol}//${host}`;
    const targetUrl = `${url}/scheduling/project-plan/${Number(
      pathMatch.params.id
    )}?versionId=${version.id}&&isBaseline=${version.isBaseline}`;
    window.open(targetUrl, '_blank');
  };
  return (
    <div className="viewVersion">
      <div className="viewVersion__title">
        <span>Previous Schedule Versions</span>
      </div>
      <div className="viewVersion__container">
        <table className="viewVersion__container__table">
          <thead>
            <tr className="viewVersion__container__table__row__header">
              <th className="item-1"></th>
              <th className="item-2"> Name</th>
              <th className="item-3">Date</th>
              <th className="item-4">Saved By</th>
              <th className="item-5">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentVersionList.map((version: any) => {
              return (
                <tr
                  key={version.id}
                  className={`viewVersion__container__table__row__body ${
                    version.isBaseline ? 'baseline' : ''
                  }`}
                >
                  <td className="item-1">
                    {version.isBaseline && (
                      <img src={BaselineSVG} alt="baseline"></img>
                    )}
                  </td>
                  <Tooltip title={version.baselineName}>
                    <td
                      className="item-2"
                      onClick={() => {
                        navigateToVersion(version);
                      }}
                    >
                      {`${
                        version.baselineName.length > 12
                          ? version.baselineName.slice(0, 13) + '...'
                          : version.baselineName
                      } `}
                    </td>
                  </Tooltip>
                  <td className="item-3">
                    {moment(version.createdAt).format('DD MMM YY')}
                  </td>
                  <td className="item-4">{`${
                    projectUser[version.createdBy]?.firstName
                  } ${projectUser[version.createdBy]?.lastName}`}</td>
                  <td className="item-5">
                    {!version.isBaseline && authState.projectFeaturePermissons.candeleteComponentPlan ?
                      
                    (
                      <>
                        <Button
                          aria-label="more"
                          aria-controls="edit-save-mode"
                          aria-haspopup="true"
                          key={version.id}
                          onClick={(e: any) => {
                            onActionClick(e, version);
                          }}
                          className="  viewVersion__container__table__row__body__actionButton"
                          size="small"
                        >
                          <MoreVertIcon className="viewVersion__container__table__row__body__actionButton-morevert" />
                        </Button>
                      </>
                    ): " "}
                  </td>
                </tr>
              );
            })}
            <Menu
              id="edit-save-mode"
              anchorEl={onActionAnchorEl}
              open={actionMenuOpen}
              onClose={onActionMenuItemClose}
              getContentAnchorEl={null}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'center',
              }}
            >
              <MenuItem
                key="edit-menu-item-discard-version"
                onClick={onDiscardVersionClick}
              >
                Delete version
              </MenuItem>
            </Menu>

            {currentVersionList.length == 0 && (
              <div className="viewVersion__container__table__row__body__no-data">
                <span>No versions saved until now</span>
              </div>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ViewVersionListPanel;
