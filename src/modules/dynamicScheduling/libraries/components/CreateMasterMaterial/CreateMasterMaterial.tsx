import { ApolloQueryResult } from '@apollo/client';
import { Box, fade, InputBase, withStyles } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import {
  createStyles,
  makeStyles,
  Theme,
  useTheme,
} from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import DeleteOutlineOutlinedIcon from '@material-ui/icons/DeleteOutlineOutlined';
import { Autocomplete } from '@material-ui/lab';
// import Select from '@material-ui/core/Select';
import Select from '@mui/material/Select';
import React, { useContext, useEffect, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { decodeExchangeToken } from 'src/services/authservice';
import { useDebounce } from '../../../../../customhooks/useDebounce';
import { client } from '../../../../../services/graphql';
import { MasterMaterialRoles } from '../../../../../utils/role';
import { setIsLoading } from '../../../../root/context/authentication/action';
import { stateContext } from '../../../../root/context/authentication/authContext';
import { CustomPopOver } from '../../../../shared/utils/CustomPopOver';
import {
  CarbonCategory,
  CarbonCategoryList,
} from '../../grqphql/models/material';
import {
  FETCH_SUPPLIERS,
  GET_MATERIAL_CATEGORY,
  GET_MATERIAL_TYPE_QUERY,
  SEARCH_MATERIAL_MASTER_ILIKE_NAME,
} from '../../grqphql/queries/material';
import './CreateMasterMaterial.scss';

const BootstrapInput = withStyles((theme) => ({
  input: {
    position: 'relative',
    backgroundColor: theme.palette.common.white,
    fontSize: 14,
    width: '100%',
    height: '3.5rem',
    minHeight: '36px',
    margin: '0.5rem 0',
    padding: '7px 12px',
    background: '#FFFFFF',
    border: '0.5px solid #828282',
    boxSizing: 'border-box',
    borderRadius: '4px',
    transition: theme.transitions.create(['border-color', 'box-shadow']),
    fontFamily: 'Poppins',
    '&:focus': {
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

export default function CreateMasterMaterial(props: any): any {
  const { dispatch }: any = useContext(stateContext);

  const classes = useStyles();
  const customPopOver = CustomPopOver();
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
  const [isUniqueMaterialId, setIsUniqueMaterialId] = useState(true);
  const [isEditingMaterialName, setIsEditingMaterialName] =
    React.useState(false);
  const [materialName, setMaterialName] = useState<string>('');
  const [allSuppliers, setAllSuppliers] = React.useState<string[]>([]);
  const [selectedSuppliers, setSelectedSuppliers] = React.useState<any>([]);
  const [unit, setUnit] = useState<string | undefined>('');
  const [type, setType] = useState('IC');
  const [category, setCategory] = useState('');
  const [materialCategory, setMaterialCategory] = useState<number | 'NA'>('NA');
  const [materialMasterDBId, setMaterialMasterDBId] = useState(-1);
  const [materialGroup, setMaterialGroup] = useState('');
  //const materialData = useContext(MaterialContext);
  const [materialMasterData, setMaterialMasterData] = useState<any>([]);
  const [materialTypeCategory, setMaterialTypeCategory] = useState<any>([]);
  const [materialNameRequired, setMaterialNameRequired] = React.useState(false);
  const [materialIDRequired, setMaterialIDRequired] = React.useState(false);
  const [materialUnitRequired, setMaterialUnitRequired] = React.useState(false);
  const [materialTypeRequired, setMaterialTypeRequired] = React.useState(false);
  const [materialCategoryRequired, setMaterialCategoryRequired] =
    React.useState(false);
  const [carbonCategory, setCarbonCategory] = useState<Array<CarbonCategory>>();

  // set the initial value for the form
  useEffect(() => {
    getMasterMaterialSupplierList();
    getMasterMaterialList();
    getCarbonCategory();
    getMaterialType();
    if (props?.action?.materialData) {
      const materialData = props?.action?.materialData;
      setMaterialName(materialData.materialName);
      setSelectedSuppliers(materialData.supplier);
      setUnit(materialData.unit);
      setType('IC');
      setNewMaterialId(materialData.materialId);
      setMaterialMasterDBId(materialData.id);
      setMaterialGroup(materialData.materialGroup);
      setMaterialCategory(
        materialData?.carbonCategory?.id
          ? materialData?.carbonCategory?.id
          : 'NA'
      );
      setCategory(materialData.category);
    }
  }, []);

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

  const getMasterMaterialSupplierList = async () => {
    try {
      dispatch(setIsLoading(true));
      const response: any = await client.query({
        query: FETCH_SUPPLIERS,
        variables: {},
        fetchPolicy: 'network-only',
        context: { role: MasterMaterialRoles.read },
      });
      const supplierNameList: Array<string> = [];
      response.data.tenantCompanyAssociation.forEach((supplier: any) => {
        supplierNameList.push(supplier.name);
      });

      setAllSuppliers(supplierNameList);
      dispatch(setIsLoading(false));
    } catch (error: any) {
      dispatch(setIsLoading(false));
    }
  };

  // submit the form
  const onSubmit: SubmitHandler<FormValues> = async (value: FormValues) => {
    switch (props?.action?.actionType) {
      case 'create':
      case 'copy':
        await props.create(
          newMaterialId,
          materialName,
          type,
          unit,
          materialCategory === 'NA' ? null : materialCategory,
          getSelectedSuppliersString(),
          category
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
          unit,
          materialCategory === 'NA' ? null : materialCategory
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
    // console.log('calling selected suppliers', selectedSuppliers);
    return typeof selectedSuppliers === 'string'
      ? selectedSuppliers
      : selectedSuppliers.join(',');
  };

  const getMasterMaterialList = async () => {
    try {
      const response: any = await client.query({
        query: SEARCH_MATERIAL_MASTER_ILIKE_NAME,
        variables: {
          materialSearchName: `%${''}%`,
        },
        fetchPolicy: 'network-only',
        context: { role: MasterMaterialRoles.read },
      });

      setMaterialMasterData(response.data.materialMaster);
    } catch (error: any) {
      console.log('error');
    }
  };

  const getCarbonCategory = async () => {
    dispatch(setIsLoading(true));
    try {
      const response: ApolloQueryResult<CarbonCategoryList> =
        await client.query({
          query: GET_MATERIAL_CATEGORY,
          fetchPolicy: 'network-only',
          context: { role: MasterMaterialRoles.read },
        });
      setCarbonCategory(response.data.carbonCategory);
    } catch (error) {
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  // Material ID changed
  const handleMaterialIdChange = async (materialID: any) => {
    setIsUniqueMaterialId(true);
    if (materialID.trim() == '') {
      setMaterialIDRequired(true);
    } else {
      setMaterialIDRequired(false);
    }
    materialMasterData.forEach((item: any) => {
      if (
        item?.externalMaterialId.toLowerCase() == materialID.toLowerCase() &&
        props?.action?.materialData?.id != item.id
      ) {
        setIsUniqueMaterialId(false);
      }
    });
    setNewMaterialId(materialID);
  };

  // handle Material name change
  const handleMaterialNameChange = (e: any) => {
    const value = e.target.value;
    if (value.trim() == '') {
      setMaterialNameRequired(true);
    } else {
      setMaterialNameRequired(false);
    }

    setMaterialName(value);
  };

  // handle Material type change
  const handleMaterialTypeChange = (e: any) => {
    const value = e.target.value;
    if (value.trim() == '') {
      setMaterialTypeRequired(true);
    } else {
      setMaterialTypeRequired(false);
    }
    setCategory(value);
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

  const handleChangeSupplierSelection = (event: any, values: any) => {
    event.preventDefault();
    event.stopPropagation();
    // const tempData: any = [];
    // tempData.push(allSuppliers[+value]);
    setSelectedSuppliers(
      values
      // On autofill we get a the stringified value.
      // values.length > 1 ? values.join(',') : values[0],
    );
  };

  const unselectSupplier = (e: any) => {
    const value = e.target.value;
    // console.log(value);
  };

  const testMaterialName = (e: any) => {
    // console.log('materialName.length', materialName.length);
    const re = /^(\w+\s?)*\s*$/g;
    if (!re.test(e.key)) {
      e.preventDefault();
    } else if (materialName.length >= 50) {
      e.preventDefault();
    }
  };

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
  const MenuSelectProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 250,
      },
    },
  };
  const getMaterialType = async () => {
    try {
      const response: any = await client.query({
        query: GET_MATERIAL_TYPE_QUERY,
        variables: {
          name: 'Material Type',
        },
        fetchPolicy: 'network-only',
        context: { role: MasterMaterialRoles.read },
      });
      const materialTypeList: Array<any> = [];
      response.data.configurationLists[0].configurationValues.forEach(
        (materialType: any) => {
          const equipmentTypeValue = {
            label: materialType.nodeName,
            value: materialType.nodeName,
          };
          materialTypeList.push(equipmentTypeValue);
        }
      );

      setMaterialTypeCategory(materialTypeList);
    } catch (error: any) {
      console.log('error:', error);
    }
  };
  return (
    <div className="material-dialog">
      <Dialog
        open={props.open}
        disableEnforceFocus
        disableBackdropClick={true}
        onClose={handleDialogClose}
        aria-labelledby="form-dialog-title"
        fullScreen={fullScreen}
        //  onClick={() => setIsEditingMaterialName(!isEditingMaterialName ? true:  false)}
      >
        <DialogTitle id="form-dialog-title">
          <Box className="material-dialog__content__fields__header">
            {' '}
            Add Material{' '}
          </Box>
        </DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="material-dialog__content">
              <div className="material-dialog__content__fields">
                <Grid container>
                  <Grid item xs={12}>
                    <Grid xs={4}>
                      <InputLabel
                        data-testid="material-master-field-label-material-name"
                        shrink
                        className={classes.inputLabel}
                      >
                        Material Name*
                      </InputLabel>
                    </Grid>
                    <Grid xs={8}>
                      <Controller
                        render={({ field }: { field: any }) => (
                          <TextField
                            {...field}
                            data-testid="material-master-field-input-material-name"
                            placeholder="Enter Material Name"
                            fullWidth
                            InputProps={{
                              inputProps: { style: { textAlign: 'left' } },
                              style: { borderRadius: 4 },
                            }}
                            variant="outlined"
                            margin="normal"
                            value={materialName}
                            onChange={(e) => {
                              setMaterialName(e.target.value);
                            }}
                            InputLabelProps={{
                              shrink: true,
                            }}
                            required={true}
                            maxLength={20}
                          />
                        )}
                        name="Name"
                        control={control}
                      />
                      <div className="error-wrap">
                        <p className="error-wrap__message">
                          {materialNameRequired && (
                            <span>Material name is required</span>
                          )}
                          {materialName.length >= 100 && (
                            <span>Maximum 100 characters are allowed</span>
                          )}
                          {!errors?.Name && isUniqueMaterialName && (
                            <span>Material name must be unique</span>
                          )}
                        </p>
                      </div>
                    </Grid>
                  </Grid>

                  <Grid item xs={12}>
                    <Grid xs={4}>
                      <InputLabel
                        data-testid="material-master-field-label-material-id"
                        shrink
                        className={classes.inputLabel}
                      >
                        ID *
                      </InputLabel>
                    </Grid>
                    <Grid xs={8}>
                      <Controller
                        render={({ field }: { field: any }) => (
                          <TextField
                            {...field}
                            data-testid="material-master-field-input-material-id"
                            placeholder="Enter ID"
                            fullWidth
                            InputProps={{
                              inputProps: { style: { textAlign: 'left' } },
                              style: { borderRadius: 4 },
                            }}
                            variant="outlined"
                            margin="normal"
                            value={newMaterialId}
                            onChange={(e) => {
                              field.onChange(e);
                              handleMaterialIdChange(e.target.value);
                            }}
                            InputLabelProps={{
                              shrink: true,
                            }}
                            required={true}
                            maxLength={20}
                          />
                        )}
                        name="Name"
                        control={control}
                      />
                      <div className="error-wrap">
                        <p className="error-wrap__message-small">
                          {materialIDRequired && <span>ID is required.</span>}
                          {newMaterialId.length > 20 && (
                            <span>Maximum 20 characters allowed</span>
                          )}
                          {newMaterialId != '' && !isUniqueMaterialId && (
                            <span>ID must be unique.</span>
                          )}
                        </p>
                      </div>
                    </Grid>
                  </Grid>

                  <Grid item xs={12}>
                    <Grid xs={4}>
                      <InputLabel
                        data-testid="material-master-field-label-material-type"
                        shrink
                        className={classes.inputLabel}
                      >
                        Type *
                      </InputLabel>
                    </Grid>
                    <Grid xs={8}>
                      <Controller
                        render={({ field }: { field: any }) => (
                          <Select
                            displayEmpty
                            variant="outlined"
                            {...field}
                            data-testid="material-master-field-select-material-type"
                            className="type-container "
                            // placeholder="Select type"
                            fullWidth
                            value={category}
                            // onChange={handleMaterialTypeChange}
                            onChange={(e: any) => {
                              field.onChange(e);
                              if (field.value) {
                                setMaterialCategoryRequired(true);
                              } else {
                                setMaterialCategoryRequired(false);
                              }
                              setCategory(e.target.value.trim());
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                            MenuProps={{
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
                            renderValue={(selected: string) => {
                              if (!selected || selected.length === 0) {
                                return <div>Select type</div>;
                              }
                              return selected;
                            }}
                          >
                            {/* <MenuItem className="material-dialog__content__fields__select-box" key={'Non IC'} value={'Non IC'}>Non IC</MenuItem> */}
                            {materialTypeCategory?.map((material: any) => {
                              return (
                                <MenuItem
                                  className="material-dialog__content__fields__select-box"
                                  key={material.id}
                                  value={material.value}
                                >
                                  {material.value}
                                </MenuItem>
                              );
                            })}
                          </Select>
                        )}
                        name="CustomType"
                        control={control}
                      />

                      <div className="error-wrap">
                        <p className="error-wrap__message">
                          {materialTypeRequired && (
                            <span>Please select the type.</span>
                          )}
                        </p>
                      </div>
                    </Grid>
                  </Grid>

                  <Grid item xs={12}>
                    <Grid xs={4}>
                      <InputLabel
                        data-testid="material-master-field-label-material-category"
                        shrink
                        className={classes.inputLabel}
                      >
                        Material Category *
                      </InputLabel>
                    </Grid>
                    <Grid xs={8}>
                      <Controller
                        render={({ field }: { field: any }) => (
                          <Select
                            displayEmpty
                            variant="outlined"
                            {...field}
                            data-testid="material-master-field-select-material-category"
                            className="type-container "
                            placeholder="Select Material category"
                            fullWidth
                            value={materialCategory}
                            // onChange={handleMaterialTypeChange}
                            onChange={(e: any) => {
                              field.onChange(e);
                              if (e.target.value) {
                                setMaterialCategoryRequired(false);
                              } else {
                                setMaterialCategoryRequired(true);
                              }
                              setMaterialCategory(e.target.value);
                              if (e.target.value !== 'NA')
                                setUnit(() => {
                                  return carbonCategory?.filter(
                                    (el) => el.id === e.target.value
                                  )[0]?.unit;
                                });
                              else {
                                setUnit('');
                              }
                            }}
                            MenuProps={{
                              classes: { paper: customPopOver.root },
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
                            // renderValue={(value: number) => {
                            //   if (materialCategory === "NA") {
                            //     return <div>Select Material Category</div>;
                            //   }
                            //   return carbonCategory?.filter(item => item.id === materialCategory)[0]?.name
                            // }}
                          >
                            <MenuItem
                              className="material-dialog__content__fields__select-box"
                              key={'NA'}
                              value={'NA'}
                            >
                              None
                            </MenuItem>
                            {carbonCategory?.map((carbon) => {
                              return (
                                <MenuItem
                                  className="material-dialog__content__fields__select-box"
                                  key={carbon.id}
                                  value={carbon.id}
                                >
                                  {carbon.name}
                                </MenuItem>
                              );
                            })}
                          </Select>
                        )}
                        name="CustomType"
                        control={control}
                      />
                      <div className="error-wrap">
                        <p className="error-wrap__message">
                          {materialCategoryRequired && (
                            <span>Material Category is required.</span>
                          )}
                        </p>
                      </div>
                    </Grid>
                  </Grid>

                  {carbonCategory?.filter(
                    (item) => item.id === materialCategory
                  )[0]?.baselineValue &&
                    carbonCategory?.filter(
                      (item) => item.id === materialCategory
                    )[0]?.unit && (
                      <Grid item xs={12}>
                        <Grid xs={4}>
                          <InputLabel
                            data-testid="material-master-field-label-material-baseline"
                            shrink
                            className={classes.inputLabel}
                          >
                            Baseline EC
                          </InputLabel>
                        </Grid>
                        <Grid xs={8}>
                          {`${
                            carbonCategory?.filter(
                              (item) => item.id === materialCategory
                            )[0]?.baselineValue
                          } kgCO2e`}
                        </Grid>
                      </Grid>
                    )}

                  <Grid item xs={12}>
                    <Grid xs={4}>
                      <InputLabel
                        data-testid="material-master-field-label-material-uom"
                        shrink
                        className={classes.inputLabel}
                      >
                        Unit of Measure*
                      </InputLabel>
                    </Grid>
                    <Grid xs={8}>
                      <Controller
                        render={({ field }: { field: any }) => (
                          <TextField
                            {...field}
                            data-testid="material-master-field-input-material-uom"
                            placeholder="eg: Kgs"
                            fullWidth
                            InputProps={{
                              inputProps: { style: { textAlign: 'left' } },
                              style: { borderRadius: 4 },
                            }}
                            variant="outlined"
                            margin="normal"
                            disabled={materialCategory !== 'NA'}
                            value={unit}
                            onChange={(e) => {
                              field.onChange(e);
                              if (e.target.value.trim() == '') {
                                setMaterialUnitRequired(true);
                              } else {
                                setMaterialUnitRequired(false);
                              }
                              setUnit(e.target.value);
                            }}
                            InputLabelProps={{
                              shrink: true,
                            }}
                          />
                        )}
                        name="Name"
                        control={control}
                      />
                      <div className="error-wrap">
                        <p className="error-wrap__message">
                          {materialUnitRequired &&
                            (!unit || (unit && unit?.length <= 0)) && (
                              <span>Unit is required.</span>
                            )}
                        </p>
                      </div>
                    </Grid>
                  </Grid>

                  <Grid item xs={12}>
                    <Grid xs={4}>
                      <InputLabel
                        id="demo-mutiple-chip-label"
                        data-testid="material-master-field-label-material-supplier"
                        className={classes.inputLabel}
                        shrink
                      >
                        Supplier
                      </InputLabel>
                    </Grid>
                    <Grid xs={8}>
                      <Autocomplete
                        multiple
                        id="tags-outlined"
                        limitTags={3}
                        options={allSuppliers}
                        getOptionLabel={(option: any) => option}
                        defaultValue={selectedSuppliers.filter(
                          (a: any) => a != ''
                        )}
                        onChange={handleChangeSupplierSelection}
                        renderInput={(params: any) => (
                          <TextField
                            {...params}
                            data-testid="material-master-field-input-material-supplier"
                            placeholder="Supplier"
                          />
                        )}
                      />
                    </Grid>
                    {/* <Select
                      labelId="demo-mutiple-chip-label"
                      id="demo-mutiple-chip"
                      multiple
                      variant="outlined"
                      value={selectedSuppliers}
                      style={{ margin: "8px 0px", height: "36px" }}
                      onChange={handleChangeSupplierSelection}
                      input={<OutlinedInput fullWidth margin="dense" id="select-multiple-chip" />}
                      onClick={(e)=>{
                        e.stopPropagation()
                      }}
                      renderValue={(selected) => (
                        <div className={classes.chips}>
                          {
                            // (selected as string[]).map((value) => (
                            selectedSuppliers.map((value: any) => (
                              value != "" &&
                              <Chip key={value} label={value} className={classes.chip}/>
                            ))}
                        </div>
                      )}
                      MenuProps={MenuSelectProps}

                    >
                      {allSuppliers.map((supplierName) => (
                        <MenuItem key={supplierName} value={supplierName}>
                          {supplierName}
                        </MenuItem>
                      ))}
                    </Select> */}
                  </Grid>
                </Grid>
              </div>
            </div>
            <div className="material-dialog__footer">
              {props?.action?.actionType == 'edit' &&
              decodeExchangeToken().allowedRoles.includes(
                'deleteTenantMaterialMaster'
              ) ? (
                <Button
                  // data-testid={'create-material-clse'}
                  variant="outlined"
                  onClick={deleteMaterial}
                  startIcon={<DeleteOutlineOutlinedIcon />}
                  className="button-delete"
                >
                  Delete
                </Button>
              ) : (
                ''
              )}
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
                disabled={
                  !category ||
                  category.length <= 0 ||
                  !unit ||
                  unit.length <= 0 ||
                  materialName.trim() == '' ||
                  materialName.length >= 100 ||
                  isUniqueMaterialName ||
                  newMaterialId.trim() == '' ||
                  newMaterialId.length > 20 ||
                  (newMaterialId != '' && !isUniqueMaterialId) ||
                  (unit && unit.trim() == '') ||
                  type == '' ||
                  materialCategory == 0 ||
                  !isUniqueMaterialId
                }
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
