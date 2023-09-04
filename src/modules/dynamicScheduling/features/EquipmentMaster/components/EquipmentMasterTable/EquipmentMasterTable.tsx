import { Box } from '@material-ui/core';
import {
  createMuiTheme,
  makeStyles,
  MuiThemeProvider,
  styled,
} from '@material-ui/core/styles';
import ErrorOutlineOutlinedIcon from '@material-ui/icons/ErrorOutlineOutlined';
import Tooltip, { tooltipClasses, TooltipProps } from '@mui/material/Tooltip';
import { DataGrid, GridColumns, GridRenderCellParams } from '@mui/x-data-grid';
import React, { ReactElement, useContext, useEffect, useState } from 'react';
import popupEditMaterialIcon from '../../../../../../assets/images/editmaterialpopup.svg';
import { decodeExchangeToken } from '../../../../../../services/authservice';
import { stateContext } from '../../../../../root/context/authentication/authContext';
import EquipmentMasterContext from '../../../../context/EquipmentMaster/equipmentMasterContext';
import Stack from '@mui/material/Stack';
import './EquipmentMasterTable.scss';

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
  root: {
    '& .wrapHeader .MuiDataGrid-columnHeaderTitle': {
      overflow: 'hidden',
      lineHeight: '20px',
      whiteSpace: 'normal',
    },
  },
  tooltip: {
    backgroundColor: '#ffffff',
    color: '#113388',
  },
});

const defaultTheme = createMuiTheme();
const themeOverride = createMuiTheme({
  overrides: {
    MuiTooltip: {
      tooltip: {
        fontSize: '2em',
        color: 'yellow',
        backgroundColor: 'red',
      },
    },
  },
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
  <Tooltip {...props} classes={{ popper: className }} leaveDelay={0} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: '#00000000',
    color: 'rgba(1, 0, 0, 0.87)',
    minWidth: 100,
    background: undefined,
  },
}));

function createData(
  name: string,
  calories: number,
  fat: number,
  carbs: number,
  protein: number
) {
  return { name, calories, fat, carbs, protein };
}

const EquipmentMasterTable = (props: any): ReactElement => {
  const { dispatch }: any = useContext(stateContext);
  const classes = useStyles();
  const [isOpen, setIsOpen] = useState(false);
  const equipmentMasterContext = useContext(EquipmentMasterContext);

  const { equipmentMasterList} = equipmentMasterContext;
  const [gridData, setGridData] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState<any>([]);
  const [allSuppliers, setAllSuppliers] = React.useState<string[]>([]);
  const [hasEditAccess, setEditAccess] = React.useState<boolean>(false);

  useEffect(() => {
    const access = decodeExchangeToken().allowedRoles.includes(
      'updateTenantMaterialMaster'
    );
    setEditAccess(access);
  }, [setEditAccess]);

  const renderUnit = (params: GridRenderCellParams) => {
    let unit;
    if (params.row.carbonCategory) {
      unit = params.row.carbonCategory.unit;
    } else {
      unit = params.row?.unit;
    }
    return params.value?.toString().trim() == '' ? (
      <div className="EquipmentMasterTable__empty-text-cell">
        {unit}
        <ErrorOutlineOutlinedIcon className="EquipmentMasterTable__empty-text-cell-icon" />
      </div>
    ) : unit && unit.length > 8 ? (
      <LightTooltip title={unit}>
        <div className="EquipmentMasterTable__text-cell">
          {unit.length > 8 ? unit?.slice(0, 8) + '. . .' : unit}
        </div>
      </LightTooltip>
    ) : (
      <div className="EquipmentMasterTable__text-cell">{unit}</div>
    );
  };

  const configureColumns = (): GridColumns => {
    return [
      {
        field: 'oemName',
        headerName: 'OEM Name *',
        flex: 100,
        renderCell: (params: GridRenderCellParams) => (
          <MuiThemeProvider theme={defaultTheme}>
            <Box display="flex" justifyContent="space-between" minWidth="100%">
              {params.value?.toString().trim() == '' ? (
                <div className="EquipmentMasterTable__empty-text-cell">
                  {params.value}
                  <ErrorOutlineOutlinedIcon className="EquipmentMasterTable__empty-text-cell-icon" />
                </div>
              ) : (
                <LightTooltip
                  title={params?.row?.oemName}
                  aria-label="Equipment Make "
                  followCursor
                  leaveDelay={0}
                >
                  <div className="EquipmentMasterTable__text-cell">
                    {typeof params?.value == 'string' &&
                    params?.value?.length > 25
                      ? params?.value?.slice(0, 25) + '. . .'
                      : params.value}
                  </div>
                </LightTooltip>
              )}
              {hasEditAccess && (
                <img
                  className="EquipmentMasterTable__popuptooltip"
                  src={popupEditMaterialIcon}
                  alt="user"
                  onClick={(e) => {
                    props.editEquimentMaster(e, params.row);
                  }}
                />
              )}
            </Box>
          </MuiThemeProvider>
        ),
        editable: false,
        headerClassName: 'EquipmentMasterTable__header',
        cellClassName: 'EquipmentMasterTable__row',
      },
      
      {
        field: 'equipmentId',
        headerName: 'ID *',
        width: 150,
        editable: false,
        headerClassName: 'EquipmentMasterTable__header',
        cellClassName: 'EquipmentMasterTable__row',
        renderCell: (params: any) => (
          <LightTooltip 
           title={params?.row?.equipmentId}
           aria-label="Equipment ID "
           followCursor
           leaveDelay={0}
           >
            <div className="EquipmentMasterTable__text-cell">
            {params.value}
            </div>
          </LightTooltip>
        ),
      },
      
      {
        field: 'model',
        headerName: 'Equipment Model *',
        width: 256,
        editable: false,
        // renderCell: (params: GridRenderCellParams) => (
        //   <MuiThemeProvider theme={defaultTheme}>
        //     <Box display="flex" justifyContent="space-between" minWidth="100%">
        //       {params.value?.toString().trim() == '' ? (
        //         <div className="MaterialMasterTable__empty-text-cell">
        //           {params.value}
        //           <ErrorOutlineOutlinedIcon className="MaterialMasterTable__empty-text-cell-icon" />
        //         </div>
        //       ) : (
        //         <LightTooltip
        //           title={params?.row?.materialName}
        //           aria-label="material name"
        //           followCursor
        //           leaveDelay={0}
        //         >
        //           <div className="MaterialMasterTable__text-cell">
        //             {typeof params?.value == 'string' &&
        //             params?.value?.length > 25
        //               ? params?.value?.slice(0, 25) + '. . .'
        //               : params.value}
        //           </div>
        //         </LightTooltip>
        //       )}
        //       {hasEditAccess && (
        //         <img
        //           className="MaterialMasterTable__popuptooltip"
        //           src={popupEditMaterialIcon}
        //           alt="user"
        //           onClick={(e) => {
        //             props.editRow(e, params.row);
        //           }}
        //         />
        //       )}
        //     </Box>
        //   </MuiThemeProvider>
        // ),
        headerClassName: 'EquipmentMasterTable__header',
        cellClassName: 'EquipmentMasterTable__row',
      },

      {
        field: 'equipmentType',
        headerName: 'Equipment Type *',
        flex: 100,
        editable: false,

        renderCell: (params: any) => (
          <LightTooltip 
           title={params?.row?.equipmentType}
           aria-label="Equipment Type"
           followCursor
           leaveDelay={0}
           >
            <div className="EquipmentMasterTable__text-cell">
            {params?.row?.equipmentType}
            </div>
          </LightTooltip>
        ),
        // renderCell: (params: GridRenderCellParams) => (
        //   <Select
        //     displayEmpty
        //     style={{ margin: '8px 0px', height: '48%' }}
        //     placeholder="Select type"
        //     fullWidth
        //     disableUnderline
        //     onChange={(e) => {
        //       updateMaterialCategory(e, params.row);
        //     }}
        //     value={params.value}
        //     MenuProps={{
        //       anchorOrigin: {
        //         vertical: 'bottom',
        //         horizontal: 'left',
        //       },
        //       transformOrigin: {
        //         vertical: 'top',
        //         horizontal: 'left',
        //       },
        //       getContentAnchorEl: null,
        //     }}
        //     disabled={!hasEditAccess}
        //   >
        //     <MenuItem
        //       className="material-dialog__content__fields__select-box"
        //       value={'Procured'}
        //     >
        //       Procured
        //     </MenuItem>
        //     <MenuItem
        //       className="material-dialog__content__fields__select-box"
        //       value={'Manufactured'}
        //     >
        //       Manufactured
        //     </MenuItem>
        //   </Select>
        // ),
        headerClassName: 'EquipmentMasterTable__header',
        cellClassName: 'EquipmentMasterTable__row',
      },
      {
        field: 'equipmentCategory',
        headerName: 'Equipment Category *',
        flex: 100,
        // renderCell: (params: GridRenderCellParams) => renderUnit(params),
        editable: false,
        headerClassName: 'EquipmentMasterTable__header',
        cellClassName: 'EquipmentMasterTable__row',
      },
      {
        field: 'supplier',
        headerName: 'Supplier',
        headerClassName: 'EquipmentMasterTable__header',
        cellClassName: 'EquipmentMasterTable__row',
        flex: 110,
        editable: false,
        // renderCell: (params: GridRenderCellParams) => {
        //   if (!params.value) {
        //     return 'None';
        //   }
        // },
      },
      {
        field: 'baselineHours',
        headerName: 'Baseline Hours/Day *',
        flex: 100,
        editable: false,
        headerClassName: 'EquipmentMasterTable__header',
        cellClassName: 'EquipmentMasterTable__row',
      },

      // {
      //   field: 'supplier',
      //   headerName: 'Supplier',
      //   flex: 150,
      //   editable: hasEditAccess,
      // renderCell: (params: GridRenderCellParams) => (
      //   <MaterialMasterSupplier
      //     allSuppliers={allSuppliers}
      //     params={params}
      //     updateSelectedSupplier={updateSelectedSupplier}
      //     hasEditAccess={hasEditAccess}
      //   />
      // ),
      //   headerClassName: 'EquipmentMasterTable__header',
      //   cellClassName: 'EquipmentMasterTable__row',
      // },
    ];
  };

  const [columns, setColumns] = React.useState<GridColumns>(configureColumns);
  //   useEffect(() => {
  //     const materials = materialData.map((item) => {
  //       return {
  //         ...item,
  //         carbon: item.carbonCategory?.baselineValue,
  //         materialcategory: item.carbonCategory?.name,
  //       };
  //     });
  //     setGridData(materials);
  //   }, [materialData]);

  useEffect(() => {
    setColumns(configureColumns);
    // if (isOpen) {
    //   setColumns([
    //     ...columns,
    //     {
    //       field: 'quantityRequired',
    //       headerName: 'Quantity Required',
    //       flex: 150,
    //       editable: false,
    //       headerClassName: 'MaterialMasterTable__header',
    //       cellClassName: (params: GridCellParams) => {
    //         if (params.row.color == 'white') {
    //           return 'MaterialMasterTable__row';
    //         } else {
    //           return 'MaterialMasterTable__darkrow';
    //         }
    //       },
    //     },
    //     {
    //       field: 'quantityAvailable',
    //       headerName: 'Quantity Available',
    //       flex: 150,
    //       editable: false,
    //       headerClassName: 'MaterialMasterTable__header',
    //       cellClassName: (params: GridCellParams) => {
    //         if (params.row.color == 'white') {
    //           return 'MaterialMasterTable__row';
    //         } else {
    //           return 'MaterialMasterTable__darkrow';
    //         }
    //       },
    //     },
    //     {
    //       field: 'quantityAllocated',
    //       headerName: 'Quantity Allocated',
    //       flex: 150,
    //       editable: false,
    //       headerClassName: 'MaterialMasterTable__header',
    //       cellClassName: (params: GridCellParams) => {
    //         if (params.row.color == 'white') {
    //           return 'MaterialMasterTable__row';
    //         } else {
    //           return 'MaterialMasterTable__darkrow';
    //         }
    //       },
    //     },
    //     {
    //       field: 'quantityConsumed',
    //       headerName: 'Quantity Consumed',
    //       flex: 150,
    //       editable: false,
    //       headerClassName: 'MaterialMasterTable__header',
    //       cellClassName: (params: GridCellParams) => {
    //         if (params.row.color == 'white') {
    //           return 'MaterialMasterTable__row';
    //         } else {
    //           return 'MaterialMasterTable__darkrow';
    //         }
    //       },
    //     },
    //   ]);
    // }
    //Dont remove material data from dependency array, although not used, the props.edit method
    //needs access to the updated material data in the MaterialMaster.tsx, which would be triggered by the material data change
  }, [
    isOpen,
    allSuppliers,
    selectedSupplier,
    hasEditAccess,
    equipmentMasterList,
  ]);

  const toggleView = async (operation: string) => {
    if (operation == 'open') {
      setIsOpen(true);
    } else {
      setIsOpen(false);
      setColumns(configureColumns);
    }
  };

  //   const updateSelectedSupplier = (selectedValues: any[], rowData: any) => {
  //     const updatedRow = JSON.parse(JSON.stringify(rowData));
  //     updatedRow.supplier = selectedValues.join(',');

  //     props.edit(
  //       updatedRow.id,
  //       updatedRow.materialId,
  //       updatedRow.materialName,
  //       updatedRow.materialGroup,
  //       updatedRow.category,
  //       updatedRow.materialType,
  //       updatedRow.supplier,
  //       updatedRow.unit,
  //       updatedRow.carbonCategory?.id
  //     );
  //   };

  //   const updateMaterialType = (param: any, rowData: any) => {
  //     const updatedRow = JSON.parse(JSON.stringify(rowData));
  //     updatedRow.supplier = updatedRow.supplier.join(',');
  //     updatedRow.materialType = param.target.value;
  //     props.edit(
  //       updatedRow.id,
  //       updatedRow.materialId,
  //       updatedRow.materialName,
  //       updatedRow.materialGroup,
  //       updatedRow.category,
  //       updatedRow.materialType,
  //       updatedRow.supplier,
  //       updatedRow.unit,
  //       updatedRow.carbonCategory?.id
  //     );
  //   };

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
      updatedRow.carbonCategory?.id,
      updatedRow.equipmentId,
    );
  };

  // const materialEdited = (editParam: any) => {
  //   let updatedRow = null;
  //   let index = 0;

  //   for (let i = 0; i < gridData.length; ++i) {
  //     if (gridData[i].id == editParam.id) {
  //       updatedRow = JSON.parse(JSON.stringify(gridData[i]));
  //       index = i;
  //       break;
  //     }
  //   }

  //   if (updatedRow == null) {
  //     return;
  //   }

  //   updatedRow[editParam.field] = editParam.value;
  //   updatedRow.supplier = updatedRow.supplier.join(',');
  //   props.edit(
  //     updatedRow.id,
  //     updatedRow.materialId,
  //     updatedRow.materialName,
  //     updatedRow.materialGroup,
  //     updatedRow.category,
  //     updatedRow.materialType,
  //     updatedRow.supplier,
  //     updatedRow.unit,
  //     updatedRow.carbonCategory?.id
  //   );
  // };

  return (
    <>
      <div className={`EquipmentMasterTable`}>
        <div
          className={`EquipmentMasterTable__editableTable ${
            isOpen ? ' open' : ' close'
          }`}
        >
          <DataGrid
            rows={equipmentMasterList}
            columns={columns}
            showColumnRightBorder={true}
            showCellRightBorder={true}
            rowHeight={40}
            headerHeight={40}
            onCellEditCommit={(params, event) => {
              // materialEdited(params);
            }}
            autoPageSize
            hideFooterSelectedRowCount={true}
            pagination
            components={{
              NoRowsOverlay: () => (
                <Stack height="100%" alignItems="center" justifyContent="center">
                  No equipment found
                </Stack>
              ),
            }}
           
          />
        </div>

        {/* {!isOpen && (
          <div
            className="EquipmentMasterTable__sidebar"
            onClick={() => toggleView('open')}
          >
            <div className={`EquipmentMasterTable__sidebar__tab`}>
              <div className="EquipmentMasterTable__sidebar__tab__title">
                View Quantities used
                <KeyboardArrowDown />
              </div>
            </div>
          </div>
        )} */}
        {/* {isOpen && (
          <div
            className="EquipmentMasterTable__sidebar"
            onClick={() => toggleView('close')}
          >
            <div className={`EquipmentMasterTable__sidebar__tab`}>
              <div className="EquipmentMasterTable__sidebar__tab__title">
                Hide Quantities used
                <KeyboardArrowUp />
              </div>
            </div>
          </div>
        )} */}
      </div>
    </>
  );
};

export default EquipmentMasterTable;
