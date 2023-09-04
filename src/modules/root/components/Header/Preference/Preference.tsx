import React, { ReactElement, useContext, useEffect, useState } from 'react';
import CloseIcon from '@material-ui/icons/Close';
import {
  decodeToken,
  getAllExchangeToken,
  getExchangeToken,
  getToken,
  setActiveTenantId,
  setExchangeToken,
  setToken,
} from 'src/services/authservice';
import { FormControl, MenuItem, Select } from '@material-ui/core';
import { CustomPopOver } from 'src/modules/shared/utils/CustomPopOver';
import { stateContext } from 'src/modules/root/context/authentication/authContext';
import {
  setCurrentTheme,
  setIsLoading,
  setTenantSwitch,
} from 'src/modules/root/context/authentication/action';
import { postApi } from 'src/services/api';
import { useHistory } from 'react-router-dom';
import { ExchangeToken } from '../../../../authentication/utils';
import { Dialog, DialogContent, IconButton } from '@material-ui/core';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import './Preference.scss';
import { exchangeTokenFeatures } from 'src/modules/authentication/utils';

interface Props {
  open: boolean;
  currentTenant: number;
  handleClose: (event: boolean) => void;
}

export interface Params {
  id: any;
}

export function Preference({
  open,
  currentTenant,
  handleClose,
}: Props): ReactElement {
  const [tenantList, setTenantList] = useState<Array<any>>([]);
  const popOverclasses = CustomPopOver();
  const {
    dispatch,
    state: { sourceSystem,dashboardType },
  }: any = useContext(stateContext);
  const history = useHistory();
  const [tenantId, setTenantId] = useState(-1);
  useEffect(() => {
    setTenantList(decodeToken().tenants);
    setTenantId(currentTenant);
  }, []);

  const handleChangeInTenant = async (event: any) => {
    try {
      setTenantId(event.target.value);
      dispatch(setIsLoading(true));
      handleClose(false);

      const mainToken = getToken();
      const allTokens = JSON.parse(getAllExchangeToken());

      if (!allTokens[event.target.value]) {
        const response = await postApi('V1/user/login/exchange', {
          tenantId: Number(event.target.value),
          features: exchangeTokenFeatures,
        });
        setExchangeToken(response.success, Number(event.target.value));
      }

      const exchangeToken = getAllExchangeToken();

      localStorage.clear();
      sessionStorage.clear();
      const activeTenantName = tenantList.find(
        (item: any) => item.id === event.target.value
      )?.name;
      localStorage.setItem('exchangetoken', exchangeToken);

      setActiveTenantId(event.target.value, activeTenantName);
      setToken(mainToken);
      if (sourceSystem) {
        localStorage.setItem('agaveInfo', JSON.stringify(sourceSystem));
      }
      dispatch(setIsLoading(false));
      dispatch(setTenantSwitch(true));
    } catch (error: any) {
      console.error(error);
      dispatch(setIsLoading(false));
    }
  };

  const chnageInTheme = (argThemeItem: any) => {
    dispatch(setCurrentTheme(argThemeItem));
    for (const [key, value] of Object.entries(argThemeItem.values)) {
      document.documentElement.style.setProperty(
        `--${key}`,
        `${value ? value : ''}`
      );
    }
  };

  return (
    <Dialog
      open={open}
      className= {dashboardType =='slate2.0'? "columnConfiguration configuration2.0 ":"columnConfiguration"} 
      disableBackdropClick={true}
      fullWidth={true}
      maxWidth={'sm'}
      onClose={handleClose}
      aria-labelledby="form-dialog-title"
    >
      <DialogContent className= {dashboardType =='slate2.0'? 'slateDashboard Preference':"Preference"}>
        <div className= {dashboardType =='slate2.0'? 'slateDashboard slateDashboard__updatedPreference  Preference__title':"Preference__title"}>
          <IconButton
            className= {dashboardType =='slate2.0'? ' slateDashboard Preference__title__close':"Preference__title__close"}
            onClick={() => handleClose(false)}
          >
            <CloseIcon className="Preference__close__icon" style={{color: dashboardType =='slate2.0'?"white":""}} />
          </IconButton>
        </div>
        <div className="Preference__body">
          <div className="Preference__body__tenants">
            <div
              className=  {dashboardType =='slate2.0'? ' slateDashboard__title':"Preference__body__tenants__title"}
              data-testid={`header-portfolio`}
            >
              Account
            </div>
            <div className={dashboardType =='slate2.0'?"Preference__body__tenants__option slateDashboard__option" :"Preference__body__tenants__option"}>
              <FormControl fullWidth  className ={dashboardType =='slate2.0'?'slateDashboard__options':''} >
                <Select
                  className ={dashboardType =='slate2.0'?'slateDashboard__options':''}
                  data-testid={`header-project-select`}
                  labelId="demo-simple-select-helper-label"
                  id="demo-simple-select-helper"
                  variant="outlined"
                  value={tenantId || 'Add Tenant'}
                  onChange={handleChangeInTenant}
                  MenuProps={{
                    classes: { paper: popOverclasses.root },
                    anchorOrigin: {
                      vertical: 'bottom',
                      horizontal: 'left',
                    },
                    transformOrigin: {
                      vertical: 'top',
                      horizontal: 'left',
                    },
                    getContentAnchorEl: null,
                  }}
                >
                  {tenantList.map((item: any, index: number) => (
                    <MenuItem
                      value={item.id}
                      className={'addIconContainer__optionFont'}
                      data-testid={`header-project-select-${index}`}
                      key={`Project-${item.name}-${index}`}
                    >
                      {item.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
          </div>
          {/* <div className="Preference__body__theme">
                        <div className="Preference__body__theme__title">
                            Theme
                        </div>
                        <div className="Preference__body__theme__options">
                        {themes.map((row: any)=>(
                            <div className="Preference__body__theme__options__item" key={row.label}
                                style={{'background': `${row.values['onx-btn-primary']}`}} onClick={()=>chnageInTheme(row)}>
                                {state.currentTheme.label===row.label &&(<CheckCircleIcon className="Preference__body__theme__options__item__icon"/>)}
                            </div>
                        ))}
                        </div>
                    </div> */}
          {/* <div className="Preference__body__build">
            {process.env['REACT_APP_BUILDTAG']} <span>-DEV1</span>
          </div> */}
        </div>
      </DialogContent>
    </Dialog>
  );
}
