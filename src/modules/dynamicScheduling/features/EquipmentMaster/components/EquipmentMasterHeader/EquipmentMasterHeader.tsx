import { Button, IconButton } from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import SearchIcon from '@material-ui/icons/Search';
import React, { useEffect, useState } from 'react';
import { decodeExchangeToken } from '../../../../../../services/authservice';
import BackNavigation from '../../../../../shared/components/BackNavigation/BackNavigation';
import './EquipmentMasterHeader.scss';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: '2px 4px',
    display: 'flex',
    alignItems: 'center',
    width: '32%',
    height: '36px',
    position: 'relative',
    left: '30px',
    float: 'left',
  },
  iconButton: {
    padding: 10,
  },
}));

const EquipmentMasterHeader = (props: any) => {
  const { addEquipmentMaster } = props;
  const classes = useStyles();
  const [canCreateEquipmentMaster, setCanCreateEquipmentMaster] =
    useState(false);

  const handleSearchChange = (value: string) => {
    props.search(value);
  };

  useEffect(() => {
    //  change permission to equipment master
    const hasWriteAccess = decodeExchangeToken().allowedRoles.includes(
      'createTenantMaterialMaster'
    );
    setCanCreateEquipmentMaster(hasWriteAccess);
  }, [setCanCreateEquipmentMaster]);

  return (
    <div className="equipment-master-header">
      <div className="equipment-master-header__left">
        <div className="equipment-master-header__title">
          {props.header.name}
        </div>
        <div className="equipment-master-header__description">
          {props.header.description}
        </div>
        <Paper component="form" className={classes.root} variant="outlined">
          <IconButton className={classes.iconButton} aria-label="menu">
            <SearchIcon />
          </IconButton>
          <TextField
            value={props.searchText}
            id="list-search-text"
            type="text"
            fullWidth
            placeholder="Search Equipment Name"
            // autoComplete="search"
            variant="standard"
            onChange={(e) => handleSearchChange(e.target.value)}
            onKeyPress={(e: any) => {
              if (e.key === 'Enter') {
                e.stopPropagation();
                e.preventDefault();
              }
            }}
            InputProps={{
              disableUnderline: true,
            }}
          />
        </Paper>
      </div>

      <div className="equipment-master-header__right">
        {canCreateEquipmentMaster && (
          <Button
            variant="outlined"
            data-testid={`export data`}
            size="small"
            className="btn-primary"
            aria-controls="simple-menu"
            aria-haspopup="true"
            onClick={() => {
              addEquipmentMaster(true);
            }}
          >
            Add Equipment
          </Button>
        )}

        {/* {canCreateEquipmentMaster && (
          <Button
            variant="outlined"
            data-testid={`export data`}
            size="small"
            className="btn-secondary"
            startIcon={<ImportExportIcon />}
            aria-controls="simple-menu"
            aria-haspopup="true"
            onClick={importHandleClick}
          >
            Import
          </Button>
        )} */}
      </div>
    </div>
  );
};

export default EquipmentMasterHeader;
