import { Box, TextField } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import {
  createStyles,
  makeStyles,
  Theme,
  useTheme,
} from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import DeleteOutlineOutlinedIcon from '@material-ui/icons/DeleteOutlineOutlined';
import { Autocomplete } from '@material-ui/lab';
import React, { useContext, useEffect, useState } from 'react';
import SelectListGroup from 'src/modules/dynamicScheduling/components/SelectCustom/SelectCustom';
import ConfirmDialog from 'src/modules/shared/components/ConfirmDialog/ConfirmDialog';
import { decodeExchangeToken } from 'src/services/authservice';
import { stateContext } from '../../../../../root/context/authentication/authContext';
import { CustomPopOver } from '../../../../../shared/utils/CustomPopOver';
import TextFieldCustom from '../../../../components/TextFieldCustom/TextFieldCustom';
import EquipmentMasterContext from '../../../../context/EquipmentMaster/equipmentMasterContext';
import './AddEquipmentMaster.scss';
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    selectEmpty: {
      margin: '4px 0px 8px 0px',
    },
    chips: {
      display: 'flex',
      flexWrap: 'wrap',
    },
    chip: {
      margin: 2,
      maxHeight: '24px',
    },
    noLabel: {
      marginTop: theme.spacing(3),
    },
    placeholder: {
      color: '#aaa',
    },
    inputLabel: {
      fontWeight: 600,
    },
    materialName: {
      fontWeight: 'bold',
    },
  })
);

const AddEquipmentMaster = (props: any) => {
  const { dispatch }: any = useContext(stateContext);
  const equipmentContext = useContext(EquipmentMasterContext);
  const { close, editEquipment } = props;
  const {
    equipmentType,
    equipmentCategory,
    getEquipmentType,
    getEquipmentCategory,
    supplier,
    getEquipmentSupplierList,
    addEquipmentMaster,
    deleteEquipmentMaster,
    updateEquipmentMaster,
    equipmentMasterList,
  } = equipmentContext;
  const defaultValue = {
    equipmentName: '',
    oemName: '',
    equipmentType: '',
    equipmentCategory: 'owned',
    model: '',
    supplier: '',
    baselineHours: 8,
    equipmentId: null,
  };
  useEffect(() => {
    if (equipmentType.length > 0) {
      setEquipmentMaster({
        ...equipmentMaster,
        equipmentType: equipmentType[0].label,
      });
    }
  }, [equipmentType]);

  const [discardConfirmDialog, setDiscardConfirmDialog] = useState(false);
  const [equipmentMaster, setEquipmentMaster] = useState<any>(defaultValue);
  const [errorMessage, setErrorMessage] = useState<any>({
    equipmentBaseLineHoursError: null,
    oemNameError: null,
    modelError: null,
    equipmentTypeError: null,
    equipmentCategoryError: null,
    supplierError: null,
    equipmentIdError: null,
  });
  const [isDisabled, setIsDisabled] = useState(false);
  const classes = useStyles();
  const customPopOver = CustomPopOver();

  useEffect(() => {
    getEquipmentType();
    getEquipmentCategory();
    getEquipmentSupplierList();
  }, []);

  useEffect(() => {
    if (editEquipment) {
      setEquipmentMaster(editEquipment);
    }
  }, [editEquipment]);

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('xs'));

  const onChangeHandler = (e: any) => {
    e.preventDefault();
    setEquipmentMaster({ ...equipmentMaster, [e.target.name]: e.target.value });

    switch (e.target.name) {
      case 'oemName': {
        setErrorMessage({ ...errorMessage, oemNameError: null });
        break;
      }
      case 'equipmentType': {
        setErrorMessage({ ...errorMessage, equipmentTypeError: null });
        break;
      }
      case 'equipmentCategory': {
        setErrorMessage({ ...errorMessage, equipmentCategoryError: null });
        break;
      }
      case 'model': {
        setErrorMessage({ ...errorMessage, modelError: null });
        break;
      }

      case 'equipmentId': {
        if (e.target.value.trim()) {
          if (
            equipmentMasterList.filter(
              (item: any) =>
                item.equipmentId != null &&
                item.equipmentId.trim().toLowerCase() ===
                  e.target.value.trim().toLowerCase() &&
                editEquipment?.equipmentId != e.target.value
            ).length > 0
          ) {
            setErrorMessage({
              ...errorMessage,
              equipmentIdError: 'ID must be unique',
            });
            setIsDisabled(true);
          } else {
            setErrorMessage({
              ...errorMessage,
              equipmentIdError: '',
            });
            setIsDisabled(false);
          }
        }
        break;
      }
      case 'baselineHours':
        {
          if (e.target.value.trim() > 24 || e.target.value.trim() < 1) {
            setErrorMessage({
              ...errorMessage,
              equipmentBaseLineHoursError:
                'Baseline Hours must be between 1 and 24',
            });
            setEquipmentMaster({ ...equipmentMaster, baselineHours: '' });
          } else {
            setErrorMessage({
              ...errorMessage,
              equipmentBaseLineHoursError: null,
            });
            setEquipmentMaster({
              ...equipmentMaster,
              baselineHours: e.target.value,
            });
          }
        }
        break;

      default: {
      }
    }
  };

  const onBlurHandler = (e: any) => {
    switch (e.target.name) {
      case 'oemName': {
        if (e.target.value.length <= 0) {
          setErrorMessage({
            ...errorMessage,
            oemNameError: 'oemName is Required',
          });
        }
        break;
      }
      case 'equipmentType': {
        if (e.target.value.length <= 0) {
          setErrorMessage({
            ...errorMessage,
            equipmentTypeError: 'Equipment Type is Required',
          });
        }
        break;
      }
      case 'equipmentCatergory': {
        if (e.target.value.length <= 0) {
          setErrorMessage({
            ...errorMessage,
            equipmentNameError: 'Equipment Category is Required',
          });
        }
        break;
      }
      case 'model': {
        if (e.target.value.length <= 0) {
          setErrorMessage({
            ...errorMessage,
            modelError: 'Equipment model is Required',
          });
        }
        break;
      }
      case 'equipmentId': {
        if (e.target.value.length <= 0) {
          setErrorMessage({
            ...errorMessage,
            equipmentIdError: 'Equipment id is Required',
          });
        }
        break;
      }
      default: {
      }
    }
  };

  const addEquipment = () => {
    addEquipmentMaster(equipmentMaster);
  };

  const deleteEquipment = () => {
    deleteEquipmentMaster(editEquipment.id);
    close();
  };

  const updateEquipment = () => {
    updateEquipmentMaster(equipmentMaster);
  };

  const onCreate = (e: any) => {
    e.preventDefault();

    if (editEquipment) {
      updateEquipment();
    } else {
      addEquipment();
    }

    setEquipmentMaster(defaultValue);
    close();
  };

  const handleChangeSupplierSelection = (event: any, value: any) => {
    event.preventDefault();
    event.stopPropagation();
    setEquipmentMaster({ ...equipmentMaster, supplier: value.join(',') });
  };
  const onKeyDown = (e: any) => {
    if (e.charCode === 45) {
      e.preventDefault();
      return false;
    }
    try {
      if (e.charCode === 101 || e.charCode === 46) {
        e.preventDefault();
        return false;
      }
    } catch (e) {}
  };

  return (
    <div className="material-dialog">
      <Dialog
        open={props.open}
        disableEnforceFocus
        disableBackdropClick={true}
        aria-labelledby="form-dialog-title"
        fullScreen={fullScreen}
      >
        <DialogTitle id="form-dialog-title">
          <Box className="material-dialog__content__fields__header">
            {editEquipment ? 'Update Equipment' : 'Add Equipment'}
          </Box>
        </DialogTitle>
        <hr className="add-equipment-master__hr" />
        <DialogContent>
          <form>
            <div className="material-dialog__content">
              <div className="material-dialog__content__fields">
                <Grid container>
                  <Grid
                    item
                    xs={12}
                    className="add-equipment-master__grid__item-2"
                  >
                    <Grid xs={5}>
                      <InputLabel shrink className={classes.inputLabel}>
                        OEM Name*
                      </InputLabel>
                    </Grid>
                    <Grid xs={7}>
                      <TextFieldCustom
                        data-testid="equipment-make"
                        placeholder="Enter OEM Name"
                        value={equipmentMaster.oemName}
                        onChange={onChangeHandler}
                        required={true}
                        maxLength={50}
                        name="oemName"
                        error={errorMessage.oemNameError}
                      />
                    </Grid>
                  </Grid>

                  <Grid
                    item
                    xs={12}
                    className="add-equipment-master__grid__item-1"
                  >
                    <Grid xs={5}>
                      <InputLabel shrink className={classes.inputLabel}>
                        ID*
                      </InputLabel>
                    </Grid>
                    <Grid xs={7}>
                      <TextFieldCustom
                        data-testid="equipment-id"
                        placeholder="Enter Equipment ID"
                        value={equipmentMaster.equipmentId}
                        onChange={onChangeHandler}
                        required={true}
                        maxLength={50}
                        name="equipmentId"
                        error={errorMessage.equipmentIdError}
                      />
                    </Grid>
                  </Grid>

                  <Grid
                    item
                    xs={12}
                    className="add-equipment-master__grid__item-5"
                  >
                    <Grid xs={5}>
                      <InputLabel shrink className={classes.inputLabel}>
                        Equipment Model*
                      </InputLabel>
                    </Grid>
                    <Grid xs={7}>
                      <TextFieldCustom
                        data-testid="equipment-model"
                        placeholder="Enter Equipment Model"
                        value={equipmentMaster.model}
                        onChange={onChangeHandler}
                        required={true}
                        maxLength={50}
                        name="model"
                      />
                    </Grid>
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    className="add-equipment-master__grid__item-5"
                  >
                    <Grid xs={5}>
                      <InputLabel shrink className={classes.inputLabel}>
                        Baseline Hours*
                      </InputLabel>
                    </Grid>
                    <Grid xs={7}>
                      <TextFieldCustom
                        data-testid="equipment-baseline-hours"
                        placeholder="Enter Baseline Hours"
                        value={equipmentMaster.baselineHours}
                        onChange={onChangeHandler}
                        maxLength={3}
                        name="baselineHours"
                        type="number"
                        onKeyDown={onKeyDown}
                        error={errorMessage.equipmentBaseLineHoursError}
                      />
                    </Grid>
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    className="add-equipment-master__grid__item-3"
                  >
                    <Grid xs={5}>
                      <InputLabel shrink className={classes.inputLabel}>
                        Equipment Type*
                      </InputLabel>
                    </Grid>
                    <Grid xs={7}>
                      <SelectListGroup
                        data-testid="equipment-type"
                        className="type-container "
                        value={equipmentMaster.equipmentType}
                        onChange={onChangeHandler}
                        name="equipmentType"
                        options={equipmentType}
                        required={true}
                      ></SelectListGroup>
                    </Grid>
                  </Grid>

                  <Grid
                    item
                    xs={12}
                    className="add-equipment-master__grid__item-4"
                  >
                    <Grid xs={5}>
                      <InputLabel shrink className={classes.inputLabel}>
                        Equipment Category*
                      </InputLabel>
                    </Grid>
                    <Grid xs={7}>
                      <SelectListGroup
                        data-testid="equipment-category"
                        className="type-container "
                        value={equipmentMaster.equipmentCategory}
                        onChange={onChangeHandler}
                        name="equipmentCategory"
                        options={equipmentCategory}
                        required={true}
                      ></SelectListGroup>
                    </Grid>
                  </Grid>

                  <Grid
                    item
                    xs={12}
                    className="add-equipment-master__grid__item-6"
                  >
                    <Grid xs={5}>
                      <InputLabel
                        id="demo-mutiple-chip-label"
                        className={classes.inputLabel}
                        shrink
                      >
                        Supplier
                      </InputLabel>
                    </Grid>
                    <Grid xs={7}>
                      <Autocomplete
                        multiple
                        id="tags-outlined"
                        limitTags={3}
                        options={supplier}
                        onChange={handleChangeSupplierSelection}
                        getOptionLabel={(option: any) => option}
                        defaultValue={(equipmentMaster.supplier
                          ? equipmentMaster.supplier
                          : ''
                        )
                          .split(',')
                          .filter((s: any) => s != '')}
                        renderInput={(params: any) => (
                          <TextField {...params} placeholder="Supplier" />
                        )}
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </div>
            </div>
            <hr className="add-equipment-master__hr add-equipment-master__hr__bottom" />
            <div className="material-dialog__footer">
              {editEquipment &&
              decodeExchangeToken().allowedRoles.includes(
                'deleteTenantMaterialMaster'
              ) ? (
                <Button
                  data-testid={'delete-equipment-master'}
                  variant="outlined"
                  onClick={() => setDiscardConfirmDialog(true)}
                  startIcon={<DeleteOutlineOutlinedIcon />}
                  className="button-delete"
                >
                  Delete
                </Button>
              ) : (
                ''
              )}
              {discardConfirmDialog && (
                <ConfirmDialog
                  open={discardConfirmDialog}
                  message={{
                    text: 'You are about to delete this equipment. Are you sure you want to delete?',
                    cancel: 'Cancel',
                    proceed: 'Proceed',
                  }}
                  close={() => {
                    setDiscardConfirmDialog(false);
                  }}
                  proceed={() => {
                    deleteEquipment();
                  }}
                />
              )}
              <Button
                data-testid={'create-material-clse'}
                variant="outlined"
                onClick={() => {
                  close();
                }}
                className="btn-secondary btn-text"
              >
                Discard
              </Button>

              <Button
                data-testid={'create-material-save'}
                variant="outlined"
                disabled={
                  equipmentMaster.oemName?.length === 0 ||
                  equipmentMaster.equipmentType?.length === 0 ||
                  equipmentMaster.equipmentCategory?.length === 0 ||
                  equipmentMaster.model?.length === 0 ||
                  equipmentMaster.equipmentId?.length === 0 ||
                  equipmentMaster.baselineHours?.length === 0 ||
                  isDisabled
                }
                className="btn-primary"
                onClick={onCreate}
              >
                {editEquipment ? 'Update Equipment' : 'Add Equipment'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddEquipmentMaster;
