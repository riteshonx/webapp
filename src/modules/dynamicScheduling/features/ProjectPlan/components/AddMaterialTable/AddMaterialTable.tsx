import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@material-ui/core';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import { makeStyles, styled, MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import Checkbox from '@material-ui/core/Checkbox';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Carbon } from 'src/modules/baseService/projectSettings/components/ProjectMaterialMaster/MaterialMasterActions';
import TextFieldCustom from '../../../../components/TextFieldCustom/TextFieldCustom';
import EditProjectPlanContext from '../../../../context/editProjectPlan/editProjectPlanContext';
import CustomToolTip from "../../../../../shared/components/CustomToolTip/CustomToolTip";
import {materialHeaderInfo} from "../../../../../../utils/MaterialConstant";
import './AddMaterialTable.scss';
import { useDebounce } from "src/customhooks/useDebounce";

const CustomDialog = withStyles((theme) => ({
  paper: {
    height: '846px',
    width: '1128px',
    minHeight: '500px',
  },
}))(Dialog);


const AddMaterialTable = (props: any) => {
  const { open, setAddMaterialPop, addMaterial } = props;
  const { id } = useParams<{ id?: string }>();
  const editProjectPlanContext = useContext(EditProjectPlanContext);
  const {
    projectMaterials,
    getProjectMaterials,
    clearProjectMaterials,
    currentTaskMaterial,
    getProjectMaterialsBasedOnSearch,
  } = editProjectPlanContext;

  const [selectedMaterial, setSelectedMaterial] = React.useState<any>([]);
  const [materials, setMaterials] = useState<any>([]);
  const [searchText, setSearchText] = useState<any>('');
  const debouncedSearch = useDebounce(searchText, 500);

  useEffect(() => {
    getMaterialNotAddedToTask();
  }, [projectMaterials, currentTaskMaterial]);

  useEffect(() => {
    if (open) {
      getProjectMaterials();
    } else {
      clearProjectMaterials();
    }
  }, [open]);

  useEffect(() => {
    return () => {
      clearProjectMaterials();
    };
  }, []);

  useEffect(() => {
    // searchMaterials(searchText)
    getProjectMaterialsBasedOnSearch(searchText);
  }, [debouncedSearch]);

  const handleSelectAllClick = (event: { target: { checked: any } }) => {
    if (event.target.checked) {
      setSelectedMaterial(materials);
      return;
    }
    setSelectedMaterial([]);
  };

  const handleClick = (
    event: React.MouseEvent<HTMLTableRowElement, MouseEvent>,
    row: any
  ) => {
    const selectedIndex = selectedMaterial.indexOf(row);
    let newSelected: any[] | ((prevState: never[]) => never[]) = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedMaterial, row);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedMaterial.slice(1));
    } else if (selectedIndex === selectedMaterial.length - 1) {
      newSelected = newSelected.concat(selectedMaterial.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selectedMaterial.slice(0, selectedIndex),
        selectedMaterial.slice(selectedIndex + 1)
      );
    }

    setSelectedMaterial(newSelected);
  };

  const isSelected = (row: any) => {
    const selectedMaterialMap = new Map();

    selectedMaterial.forEach((material: any) => {
      selectedMaterialMap.set(material.id, material);
    });

    const flag = selectedMaterialMap.get(row.id) ? true : false;
    return flag;
  };

  const getMaterialNotAddedToTask = () => {
    const tempCurrentTaskMaterial = new Map();
    currentTaskMaterial.forEach((material: any) => {
      tempCurrentTaskMaterial.set(material.materialId, material);
    });

    const tempProjectMaterial: any = [];
    projectMaterials.forEach((material: any) => {
      if (!tempCurrentTaskMaterial.get(material.materialId))
        tempProjectMaterial.push(material);
    });
    setMaterials(tempProjectMaterial);
  };

  // const searchMaterials = (e: any) => {
  //   setSearchText(e.target.value);
  //   const temp: any = [];
  //   if (e.target.value.length >= 3) {
  //     materials.forEach((material: any) => {
  //       if (
  //         material.name.toLowerCase().includes(e.target.value.toLowerCase()) ||
  //         material.materialId
  //           .toLowerCase()
  //           .includes(e.target.value.toLowerCase())
  //       ) {
  //         temp.push(material);
  //       }
  //     });

  //     setMaterials(temp);
  //   } else {
  //     getMaterialNotAddedToTask();
  //   }
  // };

  const getBaselineValue = (carbon: Carbon) => {
    if (carbon) {
      if (props.countryCode === 'US') {
        return carbon?.baselineValueImperial;
      } else {
        return carbon?.baselineValue;
      }
    } else {
      return 0;
    }
  };

  const getUnit = (carbon: Carbon) => {
    if (props.countryCode === 'US') {
      return carbon?.unitImperial;
    } else {
      return carbon?.unit;
    }
  };

  const getDesignValue = (carbon: Carbon) => {
    if (carbon) {
      const average = carbon?.averageValue?.filter((el) => {
        if (props.countryCode && (props.countryCode === "US" || props.countryCode === "GB")) {
          return el.region === props.countryCode;
        } else {
          return el.region === 'Global';
        }
      })[0];

      if (props.countryCode === 'US') {
        return average?.average_imperial;
      } else {
        return average?.average_si;
      }
    } else {
      return 0;
    }
  };


  return (
    <CustomDialog
      data-testid="add-material-popup"
      open={open}
      onClose={() => {
        setAddMaterialPop(false);
      }}
      area-labelledby="form-dialog-title"
      maxWidth="xl"
      disableBackdropClick={true}
      className="add-material-popup"
    >
      <div className="add-material-popup-title">
        <DialogTitle className="add-material-popup-title-heading">
          Add Material
        </DialogTitle>
        <div>
          <TextFieldCustom
            data-testid="task-name"
            className="add-material-popup-title-search"
            placeholder="Search"
            name="text"
            value={searchText}
            searchIcon={true}
            onChange={(e: any) => setSearchText(e.target.value)}
          ></TextFieldCustom>
        </div>
      </div>

      <DialogContent
        className={`add-material-popup-content ${
          materials.length === 0 ? "add-material-popup-content-empty" : ""
        }`}
      >
        {projectMaterials.length === 0 ? (
          <span>No material added to the project library yet</span>
        ) : materials.length === 0 ? (
          <span>All project materials already assigned to this task</span>
        ) : (
          ""
        )}

        {materials.length > 0 && (
          <TableContainer className="add-material-table-container">
            <Table
              stickyHeader
              aria-labelledby="tableTitle"
              aria-label="enhanced table"
            >
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      className="add-material-table-head-checkbox"
                      color="default"
                      indeterminate={
                        selectedMaterial.length > 0 &&
                        selectedMaterial.length < materials.length
                      }
                      checked={
                        materials.length > 0 &&
                        selectedMaterial.length === materials.length
                      }
                      onChange={handleSelectAllClick}
                      inputProps={{ "aria-label": "select all desserts" }}
                    />
                  </TableCell>
                  <TableCell className="add-material-table-head-cell add-material-table-head-cell-1">
                    <CustomToolTip
                      element={materialHeaderInfo?.materialName}
                      textLength={materialHeaderInfo?.CUSTOM_TEXT_LENGTH}
                      />

                  </TableCell>
                  <TableCell className="add-material-table-head-cell add-material-table-head-cell-2 ">
                    ID
                  </TableCell>
                  <TableCell className="add-material-table-head-cell add-material-table-head-cell-1">
                    <CustomToolTip
                      element={materialHeaderInfo?.materialcategory}
                      textLength={materialHeaderInfo?.CUSTOM_TEXT_LENGTH}
                      />
                  </TableCell>
                  <TableCell className="add-material-table-head-cell add-material-table-head-cell-3">
                    Unit
                  </TableCell>
                  <TableCell className="add-material-table-head-cell add-material-table-head-cell-3">
                      <CustomToolTip
                      element={materialHeaderInfo?.unitBaseline}
                      textLength={materialHeaderInfo?.CUSTOM_TEXT_LENGTH}
                      className="add-material-table-head-cell-3-customToolTip"
                      />
                  </TableCell>
                  <TableCell className="add-material-table-head-cell add-material-table-head-cell-3">
                      <CustomToolTip
                      element={materialHeaderInfo?.unitDesign}
                      textLength={materialHeaderInfo?.CUSTOM_TEXT_LENGTH}
                      className="add-material-table-head-cell-3-customToolTip"
                      />
                  </TableCell>
                  {/* <TableCell className="add-material-table-head-cell add-material-table-head-cell-4">
                    Type
                  </TableCell> */}
                  <TableCell className="add-material-table-head-cell add-material-table-head-cell-5">
                    Type
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody className="add-material-table-body">
                {materials.map((row: any, index: any) => {
                  const isItemSelected = isSelected(row);
                  const labelId = `enhanced-table-checkbox-${index}`;

                  return (
                    <TableRow
                      hover
                      onClick={(event) => handleClick(event, row)}
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={row.id}
                      selected={isItemSelected}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          className="add-material-table-body-checkbox"
                          color="default"
                          checked={isItemSelected}
                          inputProps={{ "aria-labelledby": labelId }}
                        />
                      </TableCell>
                      <TableCell
                        component="th"
                        id={labelId}
                        scope="row"
                        padding="none"
                      >
                    <CustomToolTip
                      element={row?.name}
                      textLength={materialHeaderInfo?.CUSTOM_TEXT_LENGTH_MATERIAL_NAME}
                      className='add-material-table-body-materialName'
                      />
                        
                      </TableCell>
                      <TableCell>
                    <CustomToolTip
                      element={row.materialId}
                      textLength={materialHeaderInfo?.CUSTOM_TEXT_LENGTH}
                      className='add-material-table-body-materialName'
                      />
                        </TableCell>
                      <TableCell>{row.carbonCategory?.name}</TableCell>
                      <TableCell>
                        {row.carbonCategory
                          ? getUnit(row.carbonCategory)
                          : row.unit}
                      </TableCell>
                      <TableCell>
                        {getBaselineValue(row.carbonCategory)?.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {getDesignValue(row.carbonCategory)?.toFixed(2)}
                      </TableCell>
                      {/* <TableCell>{row.type}</TableCell> */}
                      <TableCell>{row.category}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      <DialogActions className="add-material-popup-footer">
        <Button
          onClick={() => {
            setAddMaterialPop(false);
          }}
          variant="outlined"
          className="btn-secondary add-material-popup-footer-discard"
        >
          Discard
        </Button>
        <Button
          onClick={() => {
            addMaterial(selectedMaterial);
            setAddMaterialPop(false);
          }}
          className="btn-primary add-material-popup-footer-add-material"
          disabled={selectedMaterial.length === 0}
        >
          Add Materials
        </Button>
      </DialogActions>
    </CustomDialog>
  );
};

export default AddMaterialTable;
