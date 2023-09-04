import { useLazyQuery } from '@apollo/client';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import { MasterMaterialRoles } from "../../../../../utils/role";

import DeleteOutlineOutlinedIcon from '@material-ui/icons/DeleteOutlineOutlined';
// import Select from '@material-ui/core/Select';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import {
  Box,
  fade,
  FormControl,
  FormControlLabel,
  InputBase,
  NativeSelect,
  withStyles,
  Input,
  Chip,
  // SelectChangeEvent
} from "@material-ui/core";
import { createStyles, makeStyles, useTheme, Theme } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import React, { useContext, useEffect, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { useDebounce } from '../../../../../customhooks/useDebounce';
import { TaskRoles } from '../../../../../utils/role';
import { stateContext } from '../../../../root/context/authentication/authContext';
import {
  SEARCH_MATERIAL_MASTER_ILIKE_NAME,
  SEARCH_MATERIAL_MASTER_BY_MATERIALID
} from '../../grqphql/queries/material';

import { client } from "../../../../../services/graphql";
import './AddColumnMasterMaterial.scss';

const BootstrapInput = withStyles((theme) => ({
  input: {
    position: "relative",
    backgroundColor: theme.palette.common.white,
    fontSize: 14,
    width: "100%",
    height: "3.5rem",
    margin: "0.5rem 0",
    padding: "7px 12px",
    background: "#FFFFFF",
    border: "0.5px solid #828282",
    boxSizing: "border-box",
    borderRadius: "4px",
    transition: theme.transitions.create(["border-color", "box-shadow"]),
    fontFamily: "Poppins",
    "&:focus": {
      boxShadow: `${fade(theme.palette.primary.main, 0.25)} 0 0 0 0.2rem`,
      borderColor: theme.palette.primary.main,
    },
  },
}))(InputBase);

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
    },
    noLabel: {
      marginTop: theme.spacing(3),
    },
  })
);

const defaultValues = {
  Name: '',
  CustomType: '',
  Description: '',
  Classification: '',
  CustomId: '',
  Duration: null,
};

type FormValues = {
  Name: string;
  CustomType: string;
  Description: string;
  Classification: number;
  CustomId: string;
  Duration: number;
};

export default function AddColumnMasterMaterial(props: any): any {
  const { dispatch }: any = useContext(stateContext);

  const classes = useStyles();
  // const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
  //   null
  // );
  const {
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<any>({
    defaultValues,
  });

  // const [
  //   uiniqueMaterialName,
  //   { loading: matchingMaterialLoading, data: matchingMaterialData, error: matchingMaterialError },
  // ] = useLazyQuery(SEARCH_RECIPE_BY_EXACT_NAME, {
  //   fetchPolicy: 'network-only',
  //   context: { role: TaskRoles.viewTenantTask },
  // });
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('xs'));

  const [searchMaterialName, setSearchMaterialName] = useState('');
  const [newMaterialId, setNewMaterialId] = useState('');
  const debounceMaterialName = useDebounce(searchMaterialName, 1000);
  const debounceMaterialId = useDebounce(newMaterialId, 1000);
  const [isUniqueMaterialName, setIsUniqueMaterialName] = useState(false);
  const [isUniqueMaterialId, setIsUniqueMaterialId] = useState(false);
  // const [isEditingMaterialName, setIsEditingMaterialName] = React.useState(false);
  const [materialName, setMaterialName] = useState<string>();
  const [selectedSuppliers, setSelectedSuppliers] = React.useState<string[]>([]);
  const [unit, setUnit] = useState('Kg');
  const [type, setType] = useState('Non IC');
  const [category, setCategory] = useState('');
  const [materialMasterDBId, setMaterialMasterDBId] = useState(-1);
  const [materialGroup, setMaterialGroup] = useState('');

  // to close the dialogbox
  const handleDialogClose = () => {
    reset({
      Name: '',
      CustomType: '',
      Description: '',
      CustomId: '',
    });
    props.close();
  };

  // set the initial value for the form
  useEffect(() => {
    setMaterialName(props?.btnName?.name);

    if (props?.action?.materialData) {
      const materialData = props?.action?.materialData;
      setMaterialName(materialData.materialName);
      setSelectedSuppliers(materialData.supplier);
      setUnit(materialData.unit);
      setType(materialData.materialType);
      setCategory(materialData.category);
      setNewMaterialId(materialData.materialId);
      setMaterialMasterDBId(materialData.id);
      setMaterialGroup(materialData.materialGroup);
    }
    // materialNameHandlechange();
  }, []);

  // submit the form
  const onSubmit: SubmitHandler<FormValues> = async (value: FormValues) => {
    // // console.log('on submit:', searchMaterialName);
    // // await materialNameHandlechange();
    // const response: any = await client.query({
    //   query: SEARCH_RECIPE_BY_EXACT_NAME,
    //   variables: {
    //     materialName: searchMaterialName,
    //   },
    //   fetchPolicy: 'network-only', context: { role: TaskRoles.viewTenantTask }
    // });

    // if (response?.data?.scheduleMaterial && response?.data?.scheduleMaterial.length > 0) {
    //   setIsUniqueMaterialName(true);
    //   return;
    // }

    // // console.log('materialNameHandlechange,', response);
    // if (isUniqueMaterialName || errors?.CustomType?.type === 'required') {
    //   // console.log('error:', errors);
    //   return;
    // }
    switch (props?.action?.actionType) {
      case 'create':
      case 'copy':
        await props.create(
          newMaterialId,
          materialName,
          type,
          unit,
          category,
          getSelectedSuppliersString()
        );
        break;
      case 'edit':
        await props.edit(
          materialMasterDBId,
          newMaterialId,
          materialName,
          materialGroup,
          category,
          type,
          getSelectedSuppliersString(),
          unit
        );
        break;
      default:
        console.error('unknown material action type:', props.action.actionType);
        break;
    }
    props.refresh();
    handleDialogClose();
  };

  const deleteMaterial = () => {
    props.delete(materialMasterDBId);
    handleDialogClose();
  };

  const getSelectedSuppliersString = () => {
    return typeof selectedSuppliers === 'string' ? selectedSuppliers : selectedSuppliers.join(',');
  };

  // // check unique materialName starts
  // useEffect(() => {
  //   // console.log('completed downloading data:', matchingMaterialData);
  //   if (matchingMaterialData) {
  //     if (matchingMaterialData?.scheduleMaterial?.length > 0) {
  //       props?.action?.materialData?.id
  //         && matchingMaterialData.scheduleMaterial[0].id === props?.action?.materialData?.id
  //         && props?.action?.actionType === 'edit'
  //         ? setIsUniqueMaterialName(false)
  //         : setIsUniqueMaterialName(true);
  //     } else {
  //       setIsUniqueMaterialName(false);
  //     }
  //   }
  //   if (matchingMaterialError) {
  //     console.log(matchingMaterialError);
  //   }
  // }, [matchingMaterialData, matchingMaterialError, matchingMaterialLoading]);

  useEffect(() => {
    if (debounceMaterialName) {
      materialNameHandlechange();
    } else {
      setIsUniqueMaterialName(false);
    }
  }, [debounceMaterialName]);

  const materialNameHandlechange = async () => {
    if (debounceMaterialName) {
      setIsUniqueMaterialName(false);
    }
    // await uiniqueMaterialName({
    //   variables: {
    //     materialName: debounceMaterialName,
    //   },
    // });
    try {
      // dispatch(setIsLoading(true));
      const response: any = await client.query({
        // query: FETCH_MATERIAL_MASTER,
        query: SEARCH_MATERIAL_MASTER_ILIKE_NAME,
        variables: {
          materialSearchName: `%${debounceMaterialName}%`,
          // limit: 1000,
          // offset: 0,
          // recipeName: `%${debounceName}%`
        },
        fetchPolicy: 'network-only', context: { role: MasterMaterialRoles.read }
      });
      if (response?.data?.scheduleRecipeSet && response?.data?.scheduleRecipeSet.length > 0) {
        setIsUniqueMaterialName(true);
        //  return;
      }

    } catch (error: any) {
      console.log(error.message);
      // dispatch(setIsLoading(false));
    }
  };

  useEffect(() => {
    if (debounceMaterialName) {
      materialIdHandlechange();
    } else {
      setIsUniqueMaterialId(false);
    }
  }, [debounceMaterialId]);

  const materialIdHandlechange = async () => {
    if (debounceMaterialId) {
      setIsUniqueMaterialId(false);
    }
    // console.log('materialIdHandlechange1:', debounceMaterialId);
    // await uiniqueMaterialName({
    //   variables: {
    //     materialName: debounceMaterialName,
    //   },
    // });
    try {
      // dispatch(setIsLoading(true));
      const response: any = await client.query({
        // query: FETCH_MATERIAL_MASTER,
        query: SEARCH_MATERIAL_MASTER_BY_MATERIALID,
        variables: {
          materialIdParam: `%${debounceMaterialId}%`,
          // limit: 1000,
          // offset: 0,
          // recipeName: `%${debounceName}%`
        },
        fetchPolicy: 'network-only', context: { role: MasterMaterialRoles.read }
      });
      if (response?.data?.scheduleRecipeSet && response?.data?.scheduleRecipeSet.length > 0) {
        setIsUniqueMaterialId(true);
        //  return;
      }

    } catch (error: any) {
      console.log(error.message);
      // dispatch(setIsLoading(false));
    }
  };
  // check unique materialName ends




  const handleMaterialNameChange = () => {
    console.log('handleMaterialNameChange');
  };


  const handleMaterialNameInputTextChange = (e: any) => {
    const value = e.target.value;
    setMaterialName(value);
    // if (value === stepName) {
    //   setEnableUpdate({ ...enableUpdate, stepNameUpdate: false });
    // } else {
    //   setEnableUpdate({ ...enableUpdate, stepNameUpdate: true });
    // }
    // setStepText(value);
  };

  const handleMaterialTypeChange = (e: any) => {
    const value = e.target.value;
    setType(value);
    // if (value === stepName) {
    //   setEnableUpdate({ ...enableUpdate, stepNameUpdate: false });
    // } else {
    //   setEnableUpdate({ ...enableUpdate, stepNameUpdate: true });
    // }
    // setStepText(value);
  };

  // const handleChange = (e: any) => {
  //   const value = e.target.value;
  //   // if (value === stepName) {
  //   //   setEnableUpdate({ ...enableUpdate, stepNameUpdate: false });
  //   // } else {
  //   //   setEnableUpdate({ ...enableUpdate, stepNameUpdate: true });
  //   // }
  //   // setStepText(value);
  // };

  const handleChangeSupplierSelection = (event: SelectChangeEvent<typeof selectedSuppliers>) => {
    const {
      target: { value },
    } = event;
    event.preventDefault();
    event.stopPropagation();
    setSelectedSuppliers(
      // On autofill we get a the stringified value.
      typeof value === 'string' ? value.split(',') : value,
    );
  };

  const unselectSupplier = (e: any) => {
    const value = e.target.value;
  };

  const supplierNames = [
    'Prestige',
    'Ambuja',
    'Bajaj',
    'Trojan',
  ];

  function getStyles(name: string, personName: string[], theme: Theme) {
    return {
      fontWeight:
        personName.indexOf(name) === -1
          ? theme.typography.fontWeightRegular
          : theme.typography.fontWeightMedium,
    };
  }

  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 250,
      },
    },
  };

  return (
    <div className="material-dialog">
      <Dialog
        open={props.open}
        disableBackdropClick={true}
        onClose={handleDialogClose}
        aria-labelledby="form-dialog-title"
        fullScreen={fullScreen}
      // onClick={handleMaterialNameChange}
      >
        <DialogTitle id="form-dialog-title">
          <Box
            className="workflowPopUp__main__header"
          >
            {'Add a Custom Column'}
          </Box>
          <div className="error-wrap">
            <p className="error-wrap__message">
              {errors?.Name?.type === 'validate' && <span>Material Name is required.</span>}
              {errors?.Name?.type === 'maxLength' && <span>Maximum 20 characters are allowed..</span>}
              {!errors?.Name && isUniqueMaterialName && <span>Material name must be unique</span>}
            </p>
          </div>
        </DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="material-dialog__content">
              <div className="material-dialog__content__fields">
                <Grid container>
                  <Grid item sm={3} xs={6}>
                    <InputLabel shrink >
                      ID *
                    </InputLabel>
                    <Controller
                      render={({ field }: { field: any, }) => (
                        <TextField
                          {...field}
                          style={{ margin: "8px 0px" }}
                          placeholder="material id"
                          fullWidth
                          InputProps={{ inputProps: { style: { textAlign: 'left' }, }, style: { borderRadius: 4 }, }}
                          variant="outlined"
                          margin="normal"
                          value={newMaterialId}
                          onChange={(e) => {
                            field.onChange(e)
                            setNewMaterialId(e.target.value.trim())
                          }}
                          InputLabelProps={{
                            shrink: true,
                          }}
                        />
                      )}
                      name="Name"
                      control={control}
                    // rules={{
                    //   validate: (value) => { return !!value.trim() },
                    //   maxLength: 20,
                    // }}
                    />
                    <div className="error-wrap">
                      <p className="error-wrap__message">
                        {errors?.Name?.type === 'validate' && <span>Material Name is required.</span>}
                        {errors?.Name?.type === 'maxLength' && <span>Maximum 20 characters are allowed..</span>}
                        {!errors?.Name && isUniqueMaterialId && <span>Material ID must be unique</span>}
                      </p>
                    </div>
                  </Grid>

                  <Grid item sm={3} xs={6}>
                    <InputLabel shrink >
                      Unit *
                    </InputLabel>
                    <Controller
                      render={({ field }: { field: any, }) => (
                        <TextField
                          {...field}
                          style={{ margin: "8px 0px" }}
                          placeholder="Kg"
                          fullWidth
                          InputProps={{ inputProps: { style: { textAlign: 'left' }, }, style: { borderRadius: 4 }, }}
                          variant="outlined"
                          margin="normal"
                          value={unit}
                          // defaultValue="Kg"
                          onChange={(e) => {
                            field.onChange(e)
                            setUnit(e.target.value.trim())
                          }}
                          InputLabelProps={{
                            shrink: true,
                          }}
                        />
                      )}
                      name="Name"
                      control={control}
                    // rules={{
                    //   validate: (value) => { return !!value.trim() },
                    //   maxLength: 20,
                    // }}
                    />
                    <div className="error-wrap">
                      <p className="error-wrap__message">
                        {errors?.Name?.type === 'validate' && <span>Material Name is required.</span>}
                        {errors?.Name?.type === 'maxLength' && <span>Maximum 20 characters are allowed..</span>}
                        {!errors?.Name && isUniqueMaterialName && <span>Material Name must be unique</span>}
                      </p>
                    </div>
                  </Grid>

                  <Grid item sm={3} xs={6}>
                    <InputLabel shrink>
                      Type *
                    </InputLabel>
                    <Controller
                      render={({ field }: { field: any }) => (
                        <Select
                          displayEmpty
                          variant="outlined"
                          {...field}
                          style={{ margin: "8px 0px", height: "37px" }}
                          className="type-container"
                          placeholder="Select type"
                          fullWidth
                          value={type}
                          // onChange={handleMaterialTypeChange}
                          onChange={(e) => {
                            handleMaterialTypeChange(e);
                          }}
                        >
                          <MenuItem className="material-dialog__content__fields__select-box" key={'Non IC'} value={'Non IC'}>Non IC</MenuItem>
                          <MenuItem className="material-dialog__content__fields__select-box" key={'IC'} value={'IC'}>IC</MenuItem>
                        </Select>
                      )}
                      name="CustomType"
                      control={control}
                    // rules={{
                    //   required: true
                    // }}
                    />
                    <div className="error-wrap">
                      <p className="error-wrap__message">
                        {errors?.CustomType?.type === 'required' && <span>Please select the Material type.</span>}
                      </p>
                    </div>

                  </Grid>
                  <Grid item sm={3} xs={6}>
                    <InputLabel shrink >
                      Category *
                    </InputLabel>
                    <Controller
                      render={({ field }: { field: any, }) => (
                        <TextField
                          {...field}
                          style={{ margin: "8px 0px" }}
                          placeholder="Enter material name"
                          fullWidth
                          InputProps={{ inputProps: { style: { textAlign: 'left' }, }, style: { borderRadius: 4 }, }}
                          variant="outlined"
                          margin="normal"
                          value={category}
                          onChange={(e) => {
                            field.onChange(e)
                            setCategory(e.target.value.trim())
                          }}
                          InputLabelProps={{
                            shrink: true,
                          }}
                        />
                      )}
                      name="Name"
                      control={control}
                    // rules={{
                    //   validate: (value) => { return !!value.trim() },
                    //   maxLength: 20,
                    // }}
                    />
                    <div className="error-wrap">
                      <p className="error-wrap__message">
                        {errors?.Name?.type === 'validate' && <span>Material Name is required.</span>}
                        {errors?.Name?.type === 'maxLength' && <span>Maximum 20 characters are allowed..</span>}
                        {!errors?.Name && isUniqueMaterialName && <span>Material Name must be unique</span>}
                      </p>
                    </div>
                  </Grid>
                  <Grid item xs={12}>
                    <InputLabel id="demo-mutiple-chip-label" shrink>Supplier</InputLabel>
                    <Select
                      labelId="demo-mutiple-chip-label"
                      id="demo-mutiple-chip"
                      multiple
                      value={selectedSuppliers}
                      onChange={handleChangeSupplierSelection}
                      input={<Input id="select-multiple-chip" />}
                      renderValue={(selected) => (
                        <div className={classes.chips}>
                          {
                            // (selected as string[]).map((value) => (
                            selectedSuppliers.map((value) => (
                              <Chip key={value} label={value} className={classes.chip}
                                onClick={unselectSupplier} onDelete={unselectSupplier}
                              />
                            ))}
                        </div>
                      )}
                      MenuProps={MenuProps}
                    >
                      {supplierNames.map((supplierName) => (
                        <MenuItem key={supplierName} value={supplierName} style={getStyles(supplierName, supplierNames, theme)}>
                          {supplierName}
                        </MenuItem>
                      ))}
                    </Select>

                  </Grid>
                </Grid>

              </div>
            </div>
            <div className="material-dialog__footer">
              {props?.action?.actionType == 'edit' ?
                <Button
                  // data-testid={'create-material-clse'}
                  variant="outlined"
                  onClick={deleteMaterial}
                  startIcon={<DeleteOutlineOutlinedIcon />}

                  className="button-delete"
                >
                  Delete
                </Button> : ('')
              }
              <Button
                data-testid={'create-material-clse'}
                variant="outlined"
                onClick={handleDialogClose}
                className="btn-secondary"
              >
                Discard
              </Button>
              <Button
                data-testid={'create-material-save'}
                variant="outlined"
                type="submit"
                disabled={false}
                className="btn-primary"
              >
                {props?.btnName?.submit}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
