
import React, { ReactElement, useContext, useState, useEffect, useRef } from 'react';
import { makeStyles, styled, MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import './MaterialMasterTable.scss';
import { KeyboardArrowDown, KeyboardArrowUp } from '@material-ui/icons';
import { DataGrid, GridCellParams, GridColumns, GridRenderCellParams } from '@mui/x-data-grid';

import { MasterMaterialRoles } from "../../../../../utils/role";
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import { Select, MenuItem, Box } from '@material-ui/core';
import { setIsLoading } from "../../../../root/context/authentication/action";
import { client } from "../../../../../services/graphql";

import { stateContext } from '../../../../root/context/authentication/authContext';
import {
  FETCH_SUPPLIERS
} from '../../grqphql/queries/material';

import popupEditMaterialIcon from '../../../../../assets/images/editmaterialpopup.svg';
import { MaterialContext } from '../../pages/MaterialMaster/MaterialMaster';
import ErrorOutlineOutlinedIcon from '@material-ui/icons/ErrorOutlineOutlined';
import { Instance } from '@popperjs/core';
import { decodeExchangeToken } from 'src/services/authservice';
import MaterialMasterSupplier from './MaterialMasterSupplier';

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
  root: {
    "& .wrapHeader .MuiDataGrid-columnHeaderTitle": {
      overflow: "hidden",
      lineHeight: "20px",
      whiteSpace: "normal",
      // font
    }
  },
  tooltip: {
    backgroundColor: "#ffffff",
    color: '#113388'
  }
});

const defaultTheme = createMuiTheme();
const themeOverride = createMuiTheme({
  overrides: {
    MuiTooltip: {
      tooltip: {
        fontSize: "2em",
        color: "yellow",
        backgroundColor: "red"
      }
    }
  }
});

const LightTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.common.white,
    color: '#212121',
    // boxShadow: ,
    boxShadow: theme.shadows[1],
    fontSize: 11,
    border: '1px solid #212121',
    borderRadius: '0px',
  },
}));

const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }}
    leaveDelay={0} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: '#00000000',
    color: 'rgba(1, 0, 0, 0.87)',
    minWidth: 100,
    background: undefined,
  },
}));


function createData(name: string, calories: number, fat: number, carbs: number, protein: number) {
  return { name, calories, fat, carbs, protein };
}


export default function MaterialMasterTable(props: any): ReactElement {
  const { dispatch }: any = useContext(stateContext);
  const classes = useStyles();
  const [isOpen, setIsOpen] = useState(false);
  const materialData = useContext(MaterialContext);
  const [gridData, setGridData] = useState(materialData);
  const [selectedSupplier, setSelectedSupplier] = useState<any>([]);
  const [allSuppliers, setAllSuppliers] = React.useState<string[]>([]);
  const [hasEditAccess, setEditAccess] = React.useState<boolean>(false);

  useEffect(() => {
    const access = decodeExchangeToken().allowedRoles.includes("updateTenantMaterialMaster");
    setEditAccess(access);
  }, [setEditAccess]);

  const materialTypeData = (params: any) => {
    const materialCategoryData = props.materialTypeCategory?.map((material: any) => {
      return (
        <MenuItem className="material-dialog__content__fields__select-box"
          key={material.id}
          value={material.value}>{material.value}</MenuItem>
      )
    })

    if (props.materialTypeCategory?.filter((material: any) => (material.value === params.value)).length == 0) {
      materialCategoryData.unshift(<MenuItem className="material-dialog__content__fields__select-box"
        key={0}
        value={params.value}>{params.value}</MenuItem>)
    }
    return materialCategoryData;
  }

  const renderUnit = (params: GridRenderCellParams) => {
    let unit;
    if (params.row.carbonCategory) {
      unit = params.row.carbonCategory.unit
    } else {
      unit = params.row?.unit;
    }
    return params.value?.toString().trim() == '' ?
      <div className="MaterialMasterTable__empty-text-cell">
        {unit}
        <ErrorOutlineOutlinedIcon className="MaterialMasterTable__empty-text-cell-icon" />
      </div> :

      unit && unit.length > 8 ?
        <LightTooltip title={unit}>
          <div className="MaterialMasterTable__text-cell">
            {unit.length > 8 ? unit?.slice(0, 8) + '. . .' : unit}
          </div>
        </LightTooltip>
        :
        <div className="MaterialMasterTable__text-cell">
        {unit}
      </div>
  }

  const configureColumns = (): GridColumns => {
    return [
      {
        field: 'materialName',
        headerName: 'Material *',
        width: 256,
        editable: false,
        renderCell: (params: GridRenderCellParams) => (
          <MuiThemeProvider theme={defaultTheme} >
            <Box display="flex" justifyContent="space-between" minWidth="100%">
              {
              params.value?.toString().trim() == '' ?
                  <div className="MaterialMasterTable__empty-text-cell">
                    {params.value}
                    <ErrorOutlineOutlinedIcon className="MaterialMasterTable__empty-text-cell-icon" />
                  </div> :
                  <LightTooltip
                    title={params?.row?.materialName}
                    aria-label="material name"
                    followCursor leaveDelay={0}
                  >
                    <div className="MaterialMasterTable__text-cell">
                      {typeof params?.value == "string" && params?.value?.length > 25 ? params?.value?.slice(0, 25) + '. . .' : params.value}
                    </div>
                  </LightTooltip>
            }
              {
                hasEditAccess &&
                <img className="MaterialMasterTable__popuptooltip" src={popupEditMaterialIcon} alt="user"
                  onClick={(e) => {
                    props.editRow(e, params.row);
                  }} />
              }
            </Box>
          </MuiThemeProvider>
        ),
        headerClassName: 'MaterialMasterTable__header',
        cellClassName: 'MaterialMasterTable__row',
      },
      {
        field: 'materialId',
        headerName: 'ID *',
        width: 150,
        renderCell: (params: GridRenderCellParams) => (
          params.value?.toString().trim() == '' || gridData.filter((item: any) => { item.materialId.toLowerCase().trim() == params.value?.toString().toLowerCase().trim() }).length > 0 ?
            <div className="MaterialMasterTable__empty-text-cell">
              {params.value}
              <ErrorOutlineOutlinedIcon className="MaterialMasterTable__empty-text-cell-icon" />
            </div> :
            params && params?.row?.materialId.length > 15 ?
              <LightTooltip title={params?.row?.materialId}>
                <div className="MaterialMasterTable__text-cell">
                  {params && params?.row?.materialId?.length > 15 ? params?.row?.materialId?.slice(0, 15) + '. . .' : params.value}
                </div>
              </LightTooltip>
              :
              <div className="MaterialMasterTable__text-cell">
              {params.value}
            </div>
        ),
        editable: false,
        headerClassName: 'MaterialMasterTable__header',
        cellClassName: 'MaterialMasterTable__row',
      },
      {
        field: 'category',
        headerName: 'Type *',
        flex: 100,
        editable: hasEditAccess,
        renderCell: (params: GridRenderCellParams) => (
          <Select
            displayEmpty
            style={{ margin: "8px 0px", height: "48%" }}
            placeholder="Select type"
            fullWidth
            disableUnderline
            onChange={(e) => {
              updateMaterialCategory(e, params.row);
            }}
            value={params.value}
            title={params?.row?.category}
            MenuProps={{
              anchorOrigin: {
                vertical: "bottom",
                horizontal: "left"
              },
              transformOrigin: {
                vertical: "top",
                horizontal: "left"
              },
              getContentAnchorEl: null
            }}
            disabled={!hasEditAccess}
          >
            {materialTypeData(params)}
          
          </Select>
     ),
        headerClassName: 'MaterialMasterTable__header',
        cellClassName: 'MaterialMasterTable__row',
      },
      {
        field: 'unit',
        headerName: 'Unit *',
        width: 120,
        renderCell: (params: GridRenderCellParams) => (
          renderUnit(params)
        ),
        editable: false,
        headerClassName: 'MaterialMasterTable__header',
        cellClassName: 'MaterialMasterTable__row',
      },
      {
        field: 'materialcategory',
        headerName: 'Material Category *',
        headerClassName: 'MaterialMasterTable__header',
        cellClassName: 'MaterialMasterTable__row',
        flex: 80,
        editable: false,
        renderCell: (params: GridRenderCellParams) => {
          if (!params.value) {
            return "None";
          }
        }
      },
      {
        field: 'carbon',
        headerName: 'Baseline EC (kgCO2e)',
        flex: 80,
        editable: false,
        headerClassName: 'MaterialMasterTable__header',
        cellClassName: 'MaterialMasterTable__row',
      },

      {
        field: 'supplier',
        headerName: 'Supplier',
        flex: 150,
        editable: hasEditAccess,
        renderCell: (params: GridRenderCellParams) => (
          <MaterialMasterSupplier
            allSuppliers={allSuppliers}
            params={params}
            updateSelectedSupplier={updateSelectedSupplier}
            hasEditAccess={hasEditAccess}
          />

        ),
        headerClassName: 'MaterialMasterTable__header',
        cellClassName: 'MaterialMasterTable__row',
      }
    ]
  }
  const [columns, setColumns] = React.useState<GridColumns>(configureColumns);
  useEffect(() => {
    const materials = materialData.map(item => {
      return {
        ...item,
        carbon: item.carbonCategory?.baselineValue,
        materialcategory: item.carbonCategory?.name,

      }
    })
    setGridData(materials);

  }, [materialData]);
  useEffect(() => {
    setColumns(configureColumns);
    if (isOpen) {
      setColumns([...columns, {
        field: 'quantityRequired',
        headerName: 'Quantity Required',
        flex: 150,
        editable: false,
        headerClassName: 'MaterialMasterTable__header',
        cellClassName: (params: GridCellParams) => {
          if (params.row.color == 'white') {
            return 'MaterialMasterTable__row'
          } else {
            return 'MaterialMasterTable__darkrow'
          }
        }
      },
      {
        field: 'quantityAvailable',
        headerName: 'Quantity Available',
        flex: 150,
        editable: false,
        headerClassName: 'MaterialMasterTable__header',
        cellClassName: (params: GridCellParams) => {
          if (params.row.color == 'white') {
            return 'MaterialMasterTable__row'
          } else {
            return 'MaterialMasterTable__darkrow'
          }
        }
      },
      {
        field: 'quantityAllocated',
        headerName: 'Quantity Allocated',
        flex: 150,
        editable: false,
        headerClassName: 'MaterialMasterTable__header',
        cellClassName: (params: GridCellParams) => {
          if (params.row.color == 'white') {
            return 'MaterialMasterTable__row'
          } else {
            return 'MaterialMasterTable__darkrow'
          }
        }
      },
      {
        field: 'quantityConsumed',
        headerName: 'Quantity Consumed',
        flex: 150,
        editable: false,
        headerClassName: 'MaterialMasterTable__header',
        cellClassName: (params: GridCellParams) => {
          if (params.row.color == 'white') {
            return 'MaterialMasterTable__row'
          } else {
            return 'MaterialMasterTable__darkrow'
          }
        }
        }]);


    }
    //Dont remove material data from dependency array, although not used, the props.edit method
    //needs access to the updated material data in the MaterialMaster.tsx, which would be triggered by the material data change
  }, [isOpen, allSuppliers, selectedSupplier, hasEditAccess, materialData]);

  useEffect(() => {
    getMasterMaterialSupplierList();
    props.getMaterialType();
  }, []);

  const getMasterMaterialSupplierList = async () => {
    try {
      dispatch(setIsLoading(true));
      const response: any = await client.query({
        // query: FETCH_MATERIAL_MASTER,
        query: FETCH_SUPPLIERS,
        variables: {
        },
        fetchPolicy: 'network-only', context: { role: MasterMaterialRoles.read }
      });
      const supplierNameList: Array<string> = [];
      response.data.tenantCompanyAssociation.forEach((supplier: any) => {
        supplierNameList.push(supplier.name);
      });

      setAllSuppliers(supplierNameList);
      // setMaterialData(materialList);
      dispatch(setIsLoading(false));
    } catch (error: any) {
      console.log(error.message);
      dispatch(setIsLoading(false));
    }
  }
  const toggleView = async (operation: string) => {
    if (operation == 'open') {
      setIsOpen(true);
    } else {
      setIsOpen(false);
      setColumns(configureColumns);
    }
  }

  const updateSelectedSupplier = (selectedValues: any[], rowData: any) => {
    const updatedRow = JSON.parse(JSON.stringify(rowData));
    updatedRow.supplier = selectedValues.join(",");

    props.edit(updatedRow.id,
      updatedRow.materialId,
      updatedRow.materialName,
      updatedRow.materialGroup,
      updatedRow.category,
      updatedRow.materialType,
      updatedRow.supplier,
      updatedRow.unit,
      updatedRow.carbonCategory?.id
    );
  }

  const updateMaterialType = (param: any, rowData: any) => {
    const updatedRow = JSON.parse(JSON.stringify(rowData));
    updatedRow.supplier = updatedRow.supplier.join(',');
    updatedRow.materialType = param.target.value;
    props.edit(updatedRow.id,
      updatedRow.materialId,
      updatedRow.materialName,
      updatedRow.materialGroup,
      updatedRow.category,
      updatedRow.materialType,
      updatedRow.supplier,
      updatedRow.unit,
      updatedRow.carbonCategory?.id
    );
  }

  const updateMaterialCategory = (param: any, rowData: any) => {
    const updatedRow = JSON.parse(JSON.stringify(rowData));
    updatedRow.supplier = updatedRow.supplier.join(',');
    updatedRow.category = param.target.value;
    props.edit(
      updatedRow.id,
      updatedRow.materialId,
      updatedRow.materialName,
      updatedRow.materialGroup,
      updatedRow.category,
      updatedRow.materialType,
      updatedRow.supplier,
      updatedRow.unit,
      updatedRow.carbonCategory?.id
    );
  }

  const materialEdited = (editParam: any) => {
    let updatedRow = null;
    let index = 0;

    for (let i = 0; i < gridData.length; ++i) {
      if (gridData[i].id == editParam.id) {
        updatedRow = JSON.parse(JSON.stringify(gridData[i]));
        index = i;
        break;
      }
    }

    if (updatedRow == null) {
      return;
    }

    updatedRow[editParam.field] = editParam.value;
    updatedRow.supplier = updatedRow.supplier.join(',');
    props.edit(
      updatedRow.id,
      updatedRow.materialId,
      updatedRow.materialName,
      updatedRow.materialGroup,
      updatedRow.category,
      updatedRow.materialType,
      updatedRow.supplier,
      updatedRow.unit,
      updatedRow.carbonCategory?.id
    );
  }

  return (
    <>
      <div className={`MaterialMasterTable`}>
        <div className={`MaterialMasterTable__editableTable ${isOpen ? ' open' : ' close'}`}>
          <DataGrid
            rows={gridData}
            columns={columns}
            showColumnRightBorder={true}
            showCellRightBorder={true}
            rowHeight={40}
            headerHeight={40}
            onCellEditCommit={(params, event) => {
              materialEdited(params);
            }}
            autoPageSize
            hideFooterSelectedRowCount={true}
            pagination
          />
        </div>

        {!isOpen && <div className="MaterialMasterTable__sidebar" onClick={() => toggleView("open")}
        >
          <div className={`MaterialMasterTable__sidebar__tab`}>
            <div className="MaterialMasterTable__sidebar__tab__title">
              View Quantities used
              <KeyboardArrowDown />
            </div>
          </div>
        </div>}
        {isOpen &&
          <div className="MaterialMasterTable__sidebar" onClick={() => toggleView("close")}>
            <div className={`MaterialMasterTable__sidebar__tab`}>

              <div className="MaterialMasterTable__sidebar__tab__title">

                Hide Quantities used
                <KeyboardArrowUp />
              </div>
            </div>
          </div>
        }
      </div>
    </>
  );
}





