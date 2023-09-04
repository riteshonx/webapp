import { Button } from '@material-ui/core';
// import Paper from '@material-ui/core/Paper';
import Dialog from '@material-ui/core/Dialog';
// import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import { makeStyles } from '@material-ui/core/styles';
// import TextField from '@material-ui/core/TextField';
// import SearchIcon from '@material-ui/icons/Search';
import ImportExportIcon from '@material-ui/icons/ImportExport';
// import MoreVertIcon from '@material-ui/icons/MoreVert';
import ViewWeekIcon from '@material-ui/icons/ViewWeek';
// import DialogTitle from '@material-ui/core/DialogTitle';
import axios from 'axios';
import { ReactElement, useContext, useEffect, useState } from 'react';
import tipIcon from '../../../../../assets/images/hereisatip.png';
import {
  decodeExchangeToken,
  getExchangeToken,
} from '../../../../../services/authservice';
import { setIsLoading } from '../../../../root/context/authentication/action';
import { stateContext } from '../../../../root/context/authentication/authContext';
import Notify, {
  AlertTypes,
} from '../../../../shared/components/Toaster/Toaster';
import AddColumnMasterMaterial from '../AddColumnMasterMaterial/AddColumnMasterMaterial';
import CreateMasterMaterial from '../CreateMasterMaterial/CreateMasterMaterial';
import ImportMasterMaterial from '../ImportMasterMaterial/ImportMasterMaterial';
// import { IconButton, Menu, MenuItem } from '@material-ui/core';
import './MaterialMasterAction.scss';

interface iactionData {
  actionType: string;
  materialData: null;
}

const useStyles = makeStyles((theme) => ({
  // root: {
  //   padding: '2px 4px',
  //   display: 'flex',
  //   alignItems: 'center',
  //   width: '25%',
  //   height: '36px',
  //   position: 'relative',
  //   left: '1%'
  // },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1,
  },
  // iconButton: {
  //   padding: 10,
  // },
  divider: {
    height: 28,
    margin: 4,
  },
  createMaterialContainer: {
    display: 'flex',
    border: '0.5px solid #FFFFFF',
    boxSizing: 'border-box',
    minWidth: '35rem',
    minHeight: '18rem',
  },
  dialogPaper: {
    minHeight: '40vh',
    maxHeight: '40vh',
    minWidth: '33vw',
    maxWidth: '33vw',
  },
}));

export default function MaterialMasterAction(props: any): ReactElement {
  // const classes = useStyles();

  const { dispatch, state }: any = useContext(stateContext);
  // const [dialogOpen, setdialogOpen] = useState(false);
  const [dialogAddColumnOpen, setDialogAddColumnOpen] = useState(false);
  const [dialogCreateMaterialOpen, setdialogCreateMaterialOpen] =
    useState(false);
  const [dialogImportMaterialOpen, setDialogImportMaterialOpen] =
    useState(false);
  const [anchorEl, setAnchorEl] = useState<any>(null);
  const open = Boolean(anchorEl);
  const [actionData, setActionData] = useState<iactionData>({
    actionType: 'create',
    materialData: null,
  });
  const [canCreateMaterial, setCanCreateMaterial] = useState(false);
  const [addMaterialTipVisiblity, setAddMaterialTipVisiblity] = useState(false);

  type nameBtn = {
    name: string;
    submit: string;
  };

  const btnName: nameBtn = {
    name: 'Enter Material Name',
    submit: 'Add Material',
  };

  const addCustomColumn = () => {
    // console.log('addCustomColumn:');
  };

  const handleCloseMaterialHandleClick = () => {
    setAddMaterialTipVisiblity(false);
  };

  const handleAutoImportClick = () => {
    setDialogImportMaterialOpen(true);
    setAddMaterialTipVisiblity(false);
  };

  const handleManualImportClick = () => {
    setAddMaterialTipVisiblity(false);
    setdialogCreateMaterialOpen(true);
  };

  const closeImportMaterialDialog = () => {
    setDialogImportMaterialOpen(false);
  };
  const closeCreateMaterialDialog = () => {
    setdialogCreateMaterialOpen(false);
    setActionData({
      actionType: 'create',
      materialData: null,
    });
  };
  const closeAddColumnDialog = () => {
    setDialogAddColumnOpen(false);
  };

  const closeTableMenu = (event: any) => {
    event.stopPropagation();
    event.preventDefault();
    setAnchorEl(null);
  };

  const addMaterialHandleClick = () => {
    setAddMaterialTipVisiblity(true);
  };

  // const handleSearchChange = (value: string) => {
  //   props.search(value);
  // }

  const refreshMasterMaterialList = () => {
    props.refresh();
  };

  const importHandleClick = (event: any) => {
    // setImportAnchorEl(null);
    // console.log('import material');
    setDialogImportMaterialOpen(true);
  };

  useEffect(() => {
    const hasWriteAccess = decodeExchangeToken().allowedRoles.includes(
      'createTenantMaterialMaster'
    );
    setCanCreateMaterial(hasWriteAccess);
  }, [setCanCreateMaterial]);

  const exportTemplate = async () => {
    // const payload: any = [];

    try {
      dispatch(setIsLoading(true));
      // const fileUploadResponse = await postApi('V1/materialMaster/excelUpload', payload);
      const token = getExchangeToken();
      const formData = new FormData();

      const response = await axios.get(
        `${process.env['REACT_APP_SCHEDULER_URL']}V1/materialMaster/excel/template`,
        {
          headers: {
            // "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
            accept: 'application/vnd.ms-excel',
          },
          responseType: 'arraybuffer',
        }
      );
      // console.log(response);
      if (response && response.status === 200) {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'material_template.xlsx'); //or any other extension
        document.body.appendChild(link);
        link.click();
        window.URL.revokeObjectURL(url);
        // return true;
      }
      // console.log()
      dispatch(setIsLoading(false));
    } catch (error) {
      Notify.sendNotification(error, AlertTypes.warn);
      dispatch(setIsLoading(false));
    }
  };

  const showMenuItems = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.stopPropagation();
    event.preventDefault();
    setAnchorEl(event.currentTarget);
  };

  return (
    <div className="material-header">
      <div className="material-header__tab">
        <div className="material-header__tab__controls">
          {canCreateMaterial && (
            <Button
              variant="outlined"
              data-testid={`export data`}
              size="small"
              className="btn-primary"
              startIcon={<ViewWeekIcon />}
              aria-controls="simple-menu"
              aria-haspopup="true"
              onClick={addMaterialHandleClick}
            >
              Add Material
            </Button>
          )}

          {/* <Button
            variant="outlined"
            data-testid={`export data`}
            size="small"
            className="btn-secondary"
            startIcon={<ImportExportIcon />}
            aria-controls="simple-menu"
            aria-haspopup="true"
          // onClick={importHandleClick}
          >
            View History
          </Button> */}
          {canCreateMaterial && (
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
          )}
          {/* <IconButton style={{ padding: '0px' }} aria-label="more"
            aria-controls="long-menu"
            aria-haspopup="true"
            onClick={(event) => showMenuItems(event)}
          >
            <MoreVertIcon className="cellicon" />
          </IconButton>
          <Menu
            elevation={0}
            id="long-menu"
            anchorEl={anchorEl}
            keepMounted
            className="custommenu"
            transformOrigin={{
              horizontal: "center",
              vertical: -45
            }}
            open={open}
            onClose={(e) => closeTableMenu(e)}
          >
            <MenuItem className="custommenu__menu__item"
              data-testid={`configureTemplate-${props.index}`}
              onClick={(e) => {
                // console.log(e);
                exportTemplate();
                closeTableMenu(e);
              }}>Export Template</MenuItem>
            <MenuItem className="custommenu__menu__item"
              data-testid={`configureTemplate-${props.index}`}
              onClick={(e) => {
                // console.log(e);
                closeTableMenu(e);
              }}>Clear Data</MenuItem>

            <MenuItem className="custommenu__menu__item"
              data-testid={`configureTemplate-${props.index}`}
              onClick={(e) => {
                console.log('add column', e);
                setDialogAddColumnOpen(true);
                closeTableMenu(e);
              }}>Add Column</MenuItem>
          </Menu> */}
        </div>
        <Dialog
          open={addMaterialTipVisiblity}
          onClose={handleCloseMaterialHandleClick}
          fullWidth
          maxWidth="xs"
        >
          <img className="avatar-icon tip-icon" src={tipIcon} />
          <DialogContent>
            <DialogContentText
              className="create-dialogue-text"
              id="alert-dialog-description"
            >
              Adding materials manually can be an exhausting process. Would you
              like to import an existing file?
            </DialogContentText>
          </DialogContent>
          <div className="actionBtn">
            <Button
              variant="outlined"
              size="small"
              className="btn-secondary"
              aria-controls="simple-menu"
              aria-haspopup="true"
              onClick={handleAutoImportClick}
            >
              Import
            </Button>

            <Button
              variant="outlined"
              data-testid={`export data`}
              size="small"
              className="btn-primary"
              aria-controls="simple-menu"
              aria-haspopup="true"
              onClick={handleManualImportClick}
            >
              Add Manually
            </Button>
          </div>
        </Dialog>
        {dialogAddColumnOpen ? (
          <AddColumnMasterMaterial
            open={dialogAddColumnOpen}
            action={actionData}
            btnName={btnName}
            addColumn={addCustomColumn}
            refresh={refreshMasterMaterialList}
            close={closeAddColumnDialog}
            create={props.create}
            edit={props.edit}
          />
        ) : (
          ''
        )}
        {dialogCreateMaterialOpen ? (
          <CreateMasterMaterial
            open={dialogCreateMaterialOpen}
            action={actionData}
            btnName={btnName}
            refresh={refreshMasterMaterialList}
            close={closeCreateMaterialDialog}
            create={props.create}
            edit={props.edit}
          />
        ) : (
          ''
        )}
        {dialogImportMaterialOpen ? (
          <ImportMasterMaterial
            open={dialogImportMaterialOpen}
            refresh={refreshMasterMaterialList}
            close={closeImportMaterialDialog}
            exportTemplate={exportTemplate}
          />
        ) : (
          ''
        )}
      </div>
    </div>
  );
}
