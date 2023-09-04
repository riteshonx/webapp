import {
  Checkbox,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@material-ui/core";
import {
  AddCircleOutline,
  CheckCircle,
  PortraitSharp,
} from "@material-ui/icons";
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import { Box } from "@mui/system";
import React, { useContext, useEffect, useState } from "react";
import PMM from "src/assets/images/ProjectMaterialMaster.jpg";
import { useDebounce } from "src/customhooks/useDebounce";
import { projectDetailsContext } from "src/modules/baseService/projects/Context/ProjectDetailsContext";
import { setIsLoading } from "src/modules/root/context/authentication/action";
import { stateContext } from "src/modules/root/context/authentication/authContext";
import { decodeExchangeToken } from "src/services/authservice";
import {
  Carbon,
  getAllSupplier,
  ProjectMaterialMaster,
} from "./MaterialMasterActions";
import CustomToolTip from "../../../../shared/components/CustomToolTip/CustomToolTip";
import {materialHeaderInfo} from "../../../../../utils/MaterialConstant";
interface SelectionType {
  all: boolean;
  selected: Array<number>;
}
interface Props {
  btnProps: any;
  countryCode?: string;
  MaterialData: Array<ProjectMaterialMaster>;
  loading: boolean;
  searchText: string;
  handleEdit?: any;
  handleEditSave?: any;
  setEscapeKeyPressed?: any;
  selectDropDown?: (
    event: React.ChangeEvent<{ name?: string | undefined; value: unknown }>,
    child: React.ReactNode
  ) => void;
  onSelect?: (selection: "all" | number, checked: boolean) => void;
  selected?: SelectionType;
}

const CUSTOM_TEXT_LENGTH = 8;

const MaterialPage: React.FC<Props> = (props) => {
  const [allSupplier, setAllSupplier] = useState<Array<any>>(new Array<any>());
  const [editPermission, setEditPermission] = useState(false);
  const { projectDetailsState }: any = useContext(projectDetailsContext);
  const { dispatch }: any = useContext(stateContext);
  const [disabledSelectAll, setDisabledSelectAll] = useState(false);

  const fetchAllSupplier = async (search: string) => {
    try {
      dispatch(setIsLoading(true));
      const res = await getAllSupplier(
        projectDetailsState.projectToken,
        search
      );
      setAllSupplier(
        res.data.tenantCompanyAssociation.map((el: { name: any }) => el.name)
      );
    } catch (error) {
    } finally {
      dispatch(setIsLoading(false));
    }
  };
  const [searchSupplier, setSearchSupplier] = useState<string>("");
  const supplierDebounced = useDebounce(searchSupplier, 500);

  useEffect(() => {
    setEditPermission(
      decodeExchangeToken(
        projectDetailsState.projectToken
      ).allowedRoles.includes("createProjectMaterial")
    );
  }, [projectDetailsState]);
  useEffect(() => {
    if (editPermission) {
      fetchAllSupplier(supplierDebounced);
    }
  }, [supplierDebounced, editPermission]);

  useEffect(() => {
    isSelectAllDisabled();
  }, [props.MaterialData]);
  const getBaselineValue = (carbon: Carbon) => {
    if (carbon) {
      if (props.countryCode === "US") {
        return carbon?.baselineValueImperial;
      } else {
        return carbon?.baselineValue;
      }
    } else {
      return 0;
    }
  };

  const getUnit = (carbon: Carbon) => {
    if (props.countryCode === "US") {
      return carbon?.unitImperial;
    } else {
      return carbon?.unit;
    }
  };

  const getDesignValue = (carbon: Carbon) => {
    if (carbon) {
      const average = carbon?.averageValue?.filter((el) => {
        if (
          props.countryCode &&
          (props.countryCode === "US" || props.countryCode === "GB")
        ) {
          return el.region === props.countryCode;
        } else {
          return el.region === "Global";
        }
      })[0];

      if (average && props.countryCode === "US") {
        return average?.average_imperial;
      } else {
        return average?.average_si;
      }
    } else {
      return 0;
    }
  };

  const getTotalBaseline = (carbon: Carbon, required: number) => {
    if (carbon && required) {
      return getBaselineValue(carbon) * required;
    } else {
      return 0;
    }
  };

  const getTotalDesign = (carbon: Carbon, required: number) => {
    if (carbon && required) {
      return getDesignValue(carbon) * required;
    } else {
      return 0;
    }
  };

  const isSelectAllDisabled = () => {
    const filteredMaterials = props.MaterialData.filter(
      (item) => item.projectTaskMaterialAssociations.length <= 0
    );
    if (filteredMaterials && filteredMaterials.length > 0) {
      setDisabledSelectAll(false);
    } else {
      setDisabledSelectAll(true);
    }
  };

  const isSelectAllChecked = () => {
    const filteredMaterials = props.MaterialData.filter(
      (item) => item.projectTaskMaterialAssociations.length <= 0
    );
    if (
      props?.selected?.all ||
      (props?.selected &&
        filteredMaterials &&
        filteredMaterials.length > 0 &&
        props?.selected?.selected?.length === filteredMaterials.length)
    ) {
      return true;
    } else {
      return false;
    }
  };

  return props.MaterialData.length > 0 ? (
    <TableContainer>
      <Table stickyHeader className="ProjectMaterialMasterTable">
        <TableHead className="ProjectMaterialMasterTable__tableHead">
          <TableRow className="ProjectMaterialMasterTable__tableRow">
            {editPermission && (
              <TableCell className="ProjectMaterialMasterTableHeader">
                <Checkbox
                  disabled={disabledSelectAll}
                  checked={isSelectAllChecked()}
                  onChange={(event, checked) => props.onSelect!("all", checked)}
                  value="all"
                />
              </TableCell>
            )}
            <TableCell className="ProjectMaterialMasterTableHeader">
              {materialHeaderInfo?.materialName.length>CUSTOM_TEXT_LENGTH ?(  
              <CustomToolTip
              element={materialHeaderInfo?.materialName}
              textLength={CUSTOM_TEXT_LENGTH}
              className={"ProjectMaterialMasterTableHeader__text-cell"}
              />
              ):
              <div className="ProjectMaterialMasterTableHeader__text-cell">{materialHeaderInfo?.materialName}</div>
              }            
            </TableCell>
            <TableCell className="ProjectMaterialMasterTableHeader">
              {materialHeaderInfo?.materialId.length>CUSTOM_TEXT_LENGTH ?( 
              <CustomToolTip
              element={materialHeaderInfo?.materialId}
              textLength={CUSTOM_TEXT_LENGTH}
              className={"ProjectMaterialMasterTableHeader__text-cell"}
              />
              ):
              <div className="ProjectMaterialMasterTableHeader__text-cell">{materialHeaderInfo?.materialId}</div>
              }
            </TableCell>
            <TableCell className="ProjectMaterialMasterTableHeader">
              {materialHeaderInfo?.materialcategory.length>CUSTOM_TEXT_LENGTH ?(  
              <CustomToolTip
              element={materialHeaderInfo?.materialcategory}
              textLength={CUSTOM_TEXT_LENGTH}
              className={"ProjectMaterialMasterTableHeader__text-cell"}
              />
              ):
              <div className="ProjectMaterialMasterTableHeader__text-cell">{materialHeaderInfo?.materialcategory}</div>
              }
            </TableCell>
            <TableCell className="ProjectMaterialMasterTableHeader">
              {materialHeaderInfo?.UoM.length>CUSTOM_TEXT_LENGTH ?(
              <CustomToolTip
              element={materialHeaderInfo?.UoM}
              textLength={CUSTOM_TEXT_LENGTH}
              className={"ProjectMaterialMasterTableHeader__text-cell"}
              />
              
              ):
              <div className="ProjectMaterialMasterTableHeader__text-cell">{materialHeaderInfo?.UoM}</div>
              }
            </TableCell>
            <TableCell className="ProjectMaterialMasterTableHeader">
              {materialHeaderInfo?.unitBaseline.length>CUSTOM_TEXT_LENGTH ?(
              <CustomToolTip
              element={materialHeaderInfo?.unitBaseline}
              textLength={CUSTOM_TEXT_LENGTH}
              className={"ProjectMaterialMasterTableHeader__text-cell"}
              />
              ):
              <div className="ProjectMaterialMasterTableHeader__text-cell">{materialHeaderInfo?.unitBaseline}</div>
              }
            </TableCell>

            <TableCell className="ProjectMaterialMasterTableHeader">
              {materialHeaderInfo?.unitDesign.length>CUSTOM_TEXT_LENGTH ?(
              <CustomToolTip
              element={materialHeaderInfo?.unitDesign}
              textLength={CUSTOM_TEXT_LENGTH}
              className={"ProjectMaterialMasterTableHeader__text-cell"}
              /> 
              ):
              <div className="ProjectMaterialMasterTableHeader__text-cell">{materialHeaderInfo?.unitDesign}</div>
              }
            </TableCell>

            <TableCell className="ProjectMaterialMasterTableHeader">
              {materialHeaderInfo?.totalBaseline.length>CUSTOM_TEXT_LENGTH ?( 
              <CustomToolTip
              element={materialHeaderInfo?.totalBaseline}
              textLength={CUSTOM_TEXT_LENGTH}
              className={"ProjectMaterialMasterTableHeader__text-cell"}
              /> 
              ):
              <div className="ProjectMaterialMasterTableHeader__text-cell">{materialHeaderInfo?.totalBaseline}</div>
              }
            </TableCell>

            <TableCell className="ProjectMaterialMasterTableHeader">
              {materialHeaderInfo?.totalDesignEmbodiedCarbon.length>CUSTOM_TEXT_LENGTH ?( 
              <CustomToolTip
              element={materialHeaderInfo?.totalDesignEmbodiedCarbon}
              textLength={CUSTOM_TEXT_LENGTH}
              className={"ProjectMaterialMasterTableHeader__text-cell"}
              />
              ):
              <div className="ProjectMaterialMasterTableHeader__text-cell">{materialHeaderInfo?.totalDesignEmbodiedCarbon}</div>
              }
            </TableCell>

            <TableCell
              className={
                editPermission
                  ? "bordered-cell left-border ProjectMaterialMasterTableHeader"
                  : "ProjectMaterialMasterTableHeader"
              }
            >
              {materialHeaderInfo?.quantityRequired.length>CUSTOM_TEXT_LENGTH ?(
                <CustomToolTip
                element={materialHeaderInfo?.quantityRequired}
                textLength={CUSTOM_TEXT_LENGTH}
                className={"ProjectMaterialMasterTableHeader__text-cell"}
                />
              ):
              <div className="ProjectMaterialMasterTableHeader__text-cell">{materialHeaderInfo?.quantityRequired}</div>
              }
            </TableCell>

            <TableCell
              className={
                editPermission
                  ? "bordered-cell ProjectMaterialMasterTableHeader"
                  : "ProjectMaterialMasterTableHeader"
              }
            >
              {materialHeaderInfo?.quantityAvailable.length>CUSTOM_TEXT_LENGTH ?(  
              <CustomToolTip
              element={materialHeaderInfo?.quantityAvailable}
              textLength={CUSTOM_TEXT_LENGTH}
              className={"ProjectMaterialMasterTableHeader__text-cell"}
              />
              ):
              <div className="ProjectMaterialMasterTableHeader__text-cell">{materialHeaderInfo?.quantityAvailable}</div>
              }
            </TableCell>
            <TableCell className="ProjectMaterialMasterTableHeader">
              {materialHeaderInfo?.quantityAssigned.length>CUSTOM_TEXT_LENGTH ?(  
              <CustomToolTip
              element={materialHeaderInfo?.quantityAssigned}
              textLength={CUSTOM_TEXT_LENGTH}
              className={"ProjectMaterialMasterTableHeader__text-cell"}
              />
              ):
              <div className="ProjectMaterialMasterTableHeader__text-cell">{materialHeaderInfo?.quantityAssigned}</div>
              }
            </TableCell>
            <TableCell className="ProjectMaterialMasterTableHeader">
              {materialHeaderInfo?.quantityConsumed.length>CUSTOM_TEXT_LENGTH ?(  
              <CustomToolTip
              element={materialHeaderInfo?.quantityConsumed}
              textLength={CUSTOM_TEXT_LENGTH}
              className={"ProjectMaterialMasterTableHeader__text-cell"}
              />
              ):
              <div className="ProjectMaterialMasterTableHeader__text-cell">{materialHeaderInfo?.quantityConsumed}</div>
              }
              
            </TableCell>
            <TableCell className="ProjectMaterialMasterTableHeader">
              {materialHeaderInfo?.type.length>CUSTOM_TEXT_LENGTH ?(  
              <CustomToolTip
              element={materialHeaderInfo?.type}
              textLength={CUSTOM_TEXT_LENGTH}
              className={"ProjectMaterialMasterTableHeader__text-cell"}
              />
              ):
              <div className="ProjectMaterialMasterTableHeader__text-cell">{materialHeaderInfo?.type}</div>
              }
            </TableCell>
            <TableCell
              className={
                editPermission
                  ? "bordered-cell left-border ProjectMaterialMasterTableHeader"
                  : "ProjectMaterialMasterTableHeader"
              }
            >
              {materialHeaderInfo?.suppliers.length>CUSTOM_TEXT_LENGTH ?(  
              <CustomToolTip
              element={materialHeaderInfo?.suppliers}
              textLength={CUSTOM_TEXT_LENGTH}
              className={"ProjectMaterialMasterTableHeader__text-cell"}
              />
              ):
              <div className="ProjectMaterialMasterTableHeader__text-cell">{materialHeaderInfo?.suppliers}</div>
              }
            </TableCell>
            <TableCell
              className={
                editPermission
                  ? "bordered-cell ProjectMaterialMasterTableHeader"
                  : "ProjectMaterialMasterTableHeader"
              }
            >
              {materialHeaderInfo?.notes.length>CUSTOM_TEXT_LENGTH?(  
              <CustomToolTip
              element={materialHeaderInfo?.notes}
              textLength={CUSTOM_TEXT_LENGTH}
              className={"ProjectMaterialMasterTableHeader__text-cell"}
              />
              ):
              <div className="ProjectMaterialMasterTableHeader__text-cell">{materialHeaderInfo?.notes}</div>
              }
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {props.MaterialData.sort(function (a, b) {
            return (
              parseFloat(a.materialMaster.externalMaterialId) -
              parseFloat(b.materialMaster.externalMaterialId)
            );
          }).map((el, index) => {
            return (
              <TableRow>
                {editPermission && (
                  <TableCell>
                    {
                      <Tooltip
                        placement="bottom"
                        arrow
                        title={
                          <h2>
                            {el.projectTaskMaterialAssociations.length > 0
                              ? "Material can't be deleted as its being used in activities."
                              : ""}
                          </h2>
                        }
                      >
                        <span>
                          <Checkbox
                            disabled={
                              el.projectTaskMaterialAssociations.length > 0
                            }
                            checked={props?.selected?.selected?.includes(el.id)}
                            onChange={(event, checked) =>
                              props?.onSelect!(el.id, checked)
                            }
                            value="all"
                          />
                        </span>
                      </Tooltip>
                    }
                  </TableCell>
                )}
                <TableCell>
                  <CustomToolTip
                  element={el.materialMaster.materialName}
                  textLength={materialHeaderInfo?.CUSTOM_TEXT_LENGTH_MATERIAL_NAME}
                  className={"ProjectMaterialMasterTableHeader__text-cell"}
                  />
                  </TableCell>
                <TableCell>
                  <CustomToolTip
                  element={el.materialMaster.externalMaterialId}
                  textLength={10}
                  className={"ProjectMaterialMasterTableHeader__text-cell"}
                  />
                  
                  </TableCell>
                <TableCell>{el.materialMaster?.carbonCategory?.name}</TableCell>
                <TableCell>
                  <div className="unitWidth d-flex">
                    {el.materialMaster.carbonCategory
                      ? getUnit(el.materialMaster?.carbonCategory)
                      : el.materialMaster?.unit}
                  </div>
                </TableCell>
                <TableCell>
                  {getBaselineValue(el.materialMaster?.carbonCategory)?.toFixed(
                    2
                  )}
                </TableCell>
                <TableCell>
                  {getDesignValue(el.materialMaster?.carbonCategory)?.toFixed(
                    2
                  )}
                </TableCell>

                <TableCell>
                  {getTotalBaseline(
                    el?.materialMaster?.carbonCategory,
                    el.quantityRequired
                  )?.toFixed(2)}
                </TableCell>
                <TableCell>
                  {getTotalDesign(
                    el?.materialMaster?.carbonCategory,
                    el.quantityRequired
                  )?.toFixed(2)}
                </TableCell>

                <TableCell
                  className={editPermission ? "bordered-cell left-border" : ""}
                  title={el.quantityRequired ? el.quantityRequired.toString() : ""}
                >
                  {editPermission ? (
                    <TextField
                      variant="outlined"
                      className="project-material-editable-field"
                      value={el.quantityRequired}
                      onBlur={props.handleEditSave}
                      placeholder="Enter Qty"
                      type="number"
                      id={`QtyReq-${index}`}
                      onChange={props.handleEdit}
                    />
                  ) : (
                    el.quantityRequired
                  )}
                </TableCell>
                <TableCell
                  className={editPermission ? "bordered-cell" : ""}
                  title={el.quantityAvailable ? el.quantityAvailable.toString() : ""}
                >
                  {editPermission ? (
                    <TextField
                      variant="outlined"
                      className="project-material-editable-field"
                      value={
                        el.quantityAvailable == 0 || isNaN(el.quantityAvailable)
                          ? ""
                          : el.quantityAvailable
                      }
                      onBlur={props.handleEditSave}
                      placeholder="Enter Qty"
                      type="number"
                      id={`QtyAvl-${index}`}
                      onChange={props.handleEdit}
                    />
                  ) : (
                    el.quantityAvailable
                  )}
                </TableCell>
                <TableCell
                  title={el.quantityAllocated == 0 ? "" : el.quantityAllocated.toString()}
                >
                  {el.quantityAllocated == 0 ? "" : el.quantityAllocated}
                </TableCell>
                <TableCell
                  title={el.quantityConsumed == 0 ? "" : el.quantityConsumed.toString()}
                >
                  {el.quantityConsumed == 0 ? "" : el.quantityConsumed}
                </TableCell>
                <TableCell>{el.materialMaster.category}</TableCell>
                <TableCell
                  title={el.supplier}
                  style={{ width: "250px" }}
                  className={
                    editPermission
                      ? "bordered-cell left-border"
                      : "non-editable-cell"
                  }
                >
                  {editPermission ? (
                    <Select
                      MenuProps={{
                        getContentAnchorEl: null,
                        anchorOrigin: {
                          vertical: "bottom",
                          horizontal: "left",
                        },
                      }}
                      labelId="mutiple-select-label"
                      renderValue={() =>
                        el.supplier && el.supplier.length > 0
                          ? el.supplier
                          : "Select Supplier"
                      }
                      fullWidth
                      displayEmpty
                      className="project-material-editable-field"
                      name={`${index}`}
                      variant="outlined"
                      style={{ width: "250px" }}
                      onClose={(e) => props.handleEditSave(e, index)}
                      multiple
                      value={el.supplier ? el.supplier.split(",") : []}
                      onChange={props.selectDropDown}
                    >
                      {allSupplier.map((elem, index) => {
                        return (
                          <MenuItem key={`${elem}${index}`} value={elem}>
                            <Box
                              width="100%"
                              justifyContent="space-between"
                              display="flex"
                            >
                              <span style={{ marginRight: "10px" }}>
                                {elem}
                              </span>
                              <span>
                                {el?.supplier?.split(",").includes(elem) ? (
                                  <CheckCircle />
                                ) : (
                                  <AddCircleOutline />
                                )}
                              </span>
                            </Box>
                          </MenuItem>
                        );
                      })}
                    </Select>
                  ) : (
                    el.supplier
                  )}
                </TableCell>
                <TableCell
                  title={el.notes}
                  className={
                    editPermission ? "bordered-cell" : "non-editable-cell"
                  }
                >
                  {editPermission ? (
                    <TextField
                      variant="outlined"
                      className="project-material-editable-field"
                      inputProps={{ maxLength: 400 }}
                      value={el.notes}
                      onBlur={props.handleEditSave}
                      placeholder="Notes"
                      onKeyDown={(e: any) => {
                        if (e.key === "Escape" || e.keyCode == 27) {
                          props.setEscapeKeyPressed(true);
                          props.handleEdit(e);
                        } else {
                          props.setEscapeKeyPressed(false);
                        }
                      }}
                      id={`Notes-${index}`}
                      onChange={props.handleEdit}
                    />
                  ) : (
                    el.notes
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  ) : !props.loading ? (
    <Box
      display="flex"
      flexDirection="column"
      gap="1.5rem"
      alignItems="center"
      height="100%"
      justifyContent="center"
    >
      <Box component="img" src={PMM} />
      {props.searchText ? (
        <Typography color="textSecondary">No results found</Typography>
      ) : props.btnProps.addBtn ? (
        <>
          <Typography color="textSecondary">
            Add some materials to your project to get started
          </Typography>
          {props.btnProps.addBtn}
        </>
      ) : (
        <Typography color="textSecondary">
          No materials found in your project
        </Typography>
      )}
    </Box>
  ) : null;
};

export default MaterialPage;
