import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from '@material-ui/core';
import { AddCircleOutline } from '@material-ui/icons';
import CheckCircle from '@material-ui/icons/CheckCircle';
import { DialogActions } from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import { match, useRouteMatch } from 'react-router-dom';
import { useDebounce } from 'src/customhooks/useDebounce';
import { projectDetailsContext } from 'src/modules/baseService/projects/Context/ProjectDetailsContext';
import { setIsLoading } from 'src/modules/root/context/authentication/action';
import { stateContext } from 'src/modules/root/context/authentication/authContext';
import Notification, {
  AlertTypes,
} from 'src/modules/shared/components/Toaster/Toaster';
import { materialHeaderInfo } from '../../../../../utils/MaterialConstant';
import CustomToolTip from '../../../../shared/components/CustomToolTip/CustomToolTip';
import { MaterialDetail } from '../../pages/ProjectMaterialMaster';
import MaterialHeader from './MaterialHeader';
import {
  addMaterialMaster,
  Carbon,
  fetchMaterialMaster,
  getAllSupplier,
  MaterialMaster,
  ProjectMaterialMasterInsertType,
  refreshWidget,
} from './MaterialMasterActions';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelect?: () => void;
  onSave: () => void;
  countryCode?: string;
}

const AddMaterialDialog: React.FC<Props> = (props) => {
  const pathMatch: match<{ projectId: string }> = useRouteMatch();
  const [materialMaster, setMaterialMaster] = useState<Array<MaterialMaster>>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [allSuppliers, setAllSuppliers] = useState<string[]>([]);
  const { dispatch }: any = useContext(stateContext);
  const { projectDetailsState }: any = useContext(projectDetailsContext);
  const [pageNo, setPageNo] = useState(0);
  const [total, setTotal] = useState(0);
  const [selectedAll, setSelectedAll] = useState(false);
  const [detailMaterialMaster, setDetailMaterialMaster] = useState<
    Array<MaterialDetail>
  >(new Array<MaterialDetail>());

  const [supplierSearch, setSupplierSearch] = useState<string>('');
  const debouncedSupplierSearch = useDebounce(supplierSearch, 500);

  const fetchData = async (pageNum: number) => {
    try {
      setLoading(true);
      const token = projectDetailsState.projectToken;
      const res = await fetchMaterialMaster(debouncedSearch, token, pageNum);
      setPageNo(pageNum);
      const total = res.materialMaster_aggregate.aggregate.count;
      setTotal(total);
      setMaterialMaster(res.materialMaster);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  const [search, setSearch] = useState<string>('');
  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    if (props.visible) {
      fetchData(0);
    }
  }, [debouncedSearch, props.visible]);

  useEffect(() => {
    getMasterMaterialSupplierList();
  }, [debouncedSupplierSearch]);

  const [selected, setSelected] = useState<Array<string>>([]);

  const handleSelect = (
    event: React.ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => {
    if (event.target.value === 'all') {
      if (checked) {
        const materialIds = materialMaster.map((el) => {
          return el.externalMaterialId;
        });
        const detailArr = materialMaster.map((el) => {
          return {
            material: el.materialName,
            materialid: el.externalMaterialId,
            unit: el.unit,
            projectId: pathMatch.params.projectId,
            Qty: '1',
            Notes: '',
            ID: el.id,
            supplier: el.supplier || '',
            carbonCategory: el.carbonCategory,
          };
        });
        const newArr = [...materialIds, ...selected];
        const uniqueArray = [...Array.from(new Set(newArr))];
        setSelected(uniqueArray);
        setDetailMaterialMaster((prevDetail) => {
          const newDetailArr = [...prevDetail];
          detailArr.forEach((mat) => {
            const match = newDetailArr.find(
              (el) => el.materialid === mat.materialid
            );
            if (!match) {
              newDetailArr.push(mat);
            }
          });
          return newDetailArr;
        });
      } else {
        const materialIds = materialMaster.map((el) => {
          return el.externalMaterialId;
        });
        setSelected((ps) => ps.filter((el) => !materialIds.includes(el)));
        setDetailMaterialMaster((ps) =>
          ps.filter((el) => !materialIds.includes(el.materialid))
        );
      }
    } else {
      if (checked) {
        const matchedDetail = materialMaster.find(
          (el) => el.externalMaterialId === event.target.value
        );
        if (matchedDetail) {
          setSelected((ps) => [...ps, event.target.value]);
          const newDetail = {
            material: matchedDetail.materialName,
            materialid: matchedDetail.externalMaterialId,
            unit: matchedDetail.unit,
            projectId: pathMatch.params.projectId,
            Qty: '1',
            Notes: '',
            ID: matchedDetail.id,
            supplier: matchedDetail.supplier || '',
            carbonCategory: matchedDetail.carbonCategory,
          };
          setDetailMaterialMaster((ps) => [...ps, newDetail]);
        }
      } else {
        setSelected((ps) => {
          return ps.filter((el) => {
            if (!(el === event.target.value)) return el;
          });
        });
        setDetailMaterialMaster((ps) =>
          ps.filter((el) => el.materialid !== event.target.value)
        );
      }
    }
  };

  const [currentPage, setCurrentPage] =
    useState<'selectionStep' | 'detailStep'>('selectionStep');
  const handleNextPage = () => {
    setCurrentPage('detailStep');
  };

  const { visible } = props;
  useEffect(() => {
    if (visible) {
      setCurrentPage('selectionStep');
      setSelected([]);
      setDetailMaterialMaster([]);
    } else {
      setSearch('');
    }
  }, [visible, setSearch, setSelected, setDetailMaterialMaster]);

  const handleSave = async () => {
    try {
      dispatch(setIsLoading(true));
      let data: Array<ProjectMaterialMasterInsertType> = [];
      let token = '';
      data = detailMaterialMaster.map((el) => {
        let qty = parseFloat(el.Qty);
        if (!qty || qty < 1) {
          qty = 1;
        }
        return {
          materialId: el.ID,
          notes: el.Notes,
          projectId: parseInt(el.projectId),
          quantityAllocated: 0,
          quantityAvailable: 0,
          quantityConsumed: 0,
          quantityRequired: qty,
          supplier: el.supplier,
        };
      });
      if (projectDetailsState.projectToken) {
        token = projectDetailsState.projectToken;
      }
      await addMaterialMaster(data, token);
      Notification.sendNotification(
        'Material added successfully',
        AlertTypes.success
      );
      props.onSave();
    } catch (err) {
      console.log(err);
      Notification.sendNotification(
        'Something went wrong while adding materials',
        AlertTypes.warn
      );
    } finally {
      props.onClose();
      setSelected([]);
      setDetailMaterialMaster([]);
      refreshWidget();
      dispatch(setIsLoading(false));
    }
  };

  const getMasterMaterialSupplierList = async () => {
    try {
      dispatch(setIsLoading(true));
      const response = await getAllSupplier(
        projectDetailsState.projectToken,
        debouncedSupplierSearch
      );
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

  const handleChangePage = (e: any, page: number) => {
    fetchData(page);
  };

  useEffect(() => {
    const selectedAll =
      selected.length > 0
        ? materialMaster.every((mat) => {
            return selected.includes(mat.externalMaterialId);
          })
        : false;
    setSelectedAll(selectedAll);
  }, [materialMaster, selected, setSelectedAll]);

  const getUnit = (carbon: Carbon) => {
    if (props.countryCode === 'US') {
      return carbon?.unitImperial;
    } else {
      return carbon?.unit;
    }
  };

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

  return (
    <Dialog
      open={props.visible}
      maxWidth="md"
      fullWidth
      onClose={props.onClose}
      disableBackdropClick={true}
    >
      <DialogTitle>
        <MaterialHeader
          SearchVisible={currentPage === 'selectionStep'}
          title="Add Material"
          searchPlaceHolder="Search Material Name, Material Id"
          searchText={search}
          onChange={(e) => {
            setSearch(e.currentTarget.value);
          }}
          deleteButtonVisible={false}
        />
      </DialogTitle>
      <DialogContent className="modalContent">
        {materialMaster.length > 0 ? (
          loading ? (
            <CircularProgress color="inherit" className="spinner" />
          ) : currentPage === 'selectionStep' ? (
            <TableContainer>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <Checkbox
                        color="primary"
                        onChange={handleSelect}
                        checked={selectedAll}
                        value="all"
                      ></Checkbox>
                    </TableCell>
                    <TableCell className="ProjectMaterialMasterTableHeader">
                      Name
                    </TableCell>
                    <TableCell className="ProjectMaterialMasterTableHeader">
                      ID
                    </TableCell>
                    <TableCell className="ProjectMaterialMasterTableHeader">
                      UoM
                    </TableCell>
                    <TableCell className="ProjectMaterialMasterTableHeader">
                      Material Category
                    </TableCell>
                    {/* <TableCell className="ProjectMaterialMasterTableHeader">Type</TableCell> */}
                    <TableCell className="ProjectMaterialMasterTableHeader">
                      Type
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {materialMaster?.map((el, index) => {
                    return (
                      <TableRow>
                        <TableCell>
                          <Checkbox
                            color="primary"
                            checked={selected.includes(el.externalMaterialId)}
                            onChange={handleSelect}
                            value={el.externalMaterialId}
                          ></Checkbox>
                        </TableCell>
                        <TableCell>
                          <CustomToolTip
                            element={el.materialName}
                            textLength={
                              materialHeaderInfo?.CUSTOM_TEXT_LENGTH_MATERIAL_NAME
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <CustomToolTip
                            element={el.externalMaterialId}
                            textLength={materialHeaderInfo?.CUSTOM_TEXT_LENGTH}
                          />
                        </TableCell>
                        <TableCell>
                          {el.carbonCategory
                            ? getUnit(el.carbonCategory)
                            : el?.unit}
                        </TableCell>
                        <TableCell>{el.carbonCategory?.name}</TableCell>
                        {/* <TableCell>{el.materialType}</TableCell> */}
                        <TableCell>{el.category}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              <TablePagination
                className="ProjectMaterialMasterTablePagination"
                component="div"
                count={total}
                rowsPerPage={15}
                page={pageNo}
                onChangePage={handleChangePage}
                rowsPerPageOptions={[]}
              />
            </TableContainer>
          ) : currentPage === 'detailStep' ? (
            detailMaterialMaster.length > 0 ? (
              <TableContainer component={Paper}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell className="ProjectMaterialMasterTableHeader">
                        {materialHeaderInfo?.materialName.length > 8 ? (
                          <CustomToolTip
                            element={materialHeaderInfo?.materialName}
                            textLength={8}
                            className={
                              'ProjectMaterialMasterTableHeader__text-cell'
                            }
                          />
                        ) : (
                          <div className="ProjectMaterialMasterTableHeader__text-cell">
                            {materialHeaderInfo?.materialName}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="ProjectMaterialMasterTableHeader">
                        {materialHeaderInfo?.materialId.length > 8 ? (
                          <CustomToolTip
                            element={materialHeaderInfo?.materialId}
                            textLength={8}
                            className={
                              'ProjectMaterialMasterTableHeader__text-cell'
                            }
                          />
                        ) : (
                          <div className="ProjectMaterialMasterTableHeader__text-cell">
                            {materialHeaderInfo?.materialId}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="ProjectMaterialMasterTableHeader">
                        {materialHeaderInfo?.materialcategory.length > 8 ? (
                          <CustomToolTip
                            element={materialHeaderInfo?.materialcategory}
                            textLength={8}
                            className={
                              'ProjectMaterialMasterTableHeader__text-cell'
                            }
                          />
                        ) : (
                          <div className="ProjectMaterialMasterTableHeader__text-cell">
                            {materialHeaderInfo?.materialcategory}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="ProjectMaterialMasterTableHeader">
                        {materialHeaderInfo?.quantityRequired.length > 8 ? (
                          <CustomToolTip
                            element={materialHeaderInfo?.quantityRequired}
                            textLength={8}
                            className={
                              'ProjectMaterialMasterTableHeader__text-cell'
                            }
                          />
                        ) : (
                          <div className="ProjectMaterialMasterTableHeader__text-cell">
                            {materialHeaderInfo?.quantityRequired}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="ProjectMaterialMasterTableHeader">
                        {materialHeaderInfo?.unitBaseline.length > 8 ? (
                          <CustomToolTip
                            element={materialHeaderInfo?.unitBaseline}
                            textLength={8}
                            className={
                              'ProjectMaterialMasterTableHeader__text-cell'
                            }
                          />
                        ) : (
                          <div className="ProjectMaterialMasterTableHeader__text-cell">
                            {materialHeaderInfo?.unitBaseline}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="ProjectMaterialMasterTableHeader">
                        {materialHeaderInfo?.suppliers.length > 8 ? (
                          <CustomToolTip
                            element={materialHeaderInfo?.suppliers}
                            textLength={8}
                            className={
                              'ProjectMaterialMasterTableHeader__text-cell'
                            }
                          />
                        ) : (
                          <div className="ProjectMaterialMasterTableHeader__text-cell">
                            {materialHeaderInfo?.suppliers}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="ProjectMaterialMasterTableHeader">
                        {materialHeaderInfo?.notes.length > 8 ? (
                          <CustomToolTip
                            element={materialHeaderInfo?.notes}
                            textLength={8}
                            className={
                              'ProjectMaterialMasterTableHeader__text-cell'
                            }
                          />
                        ) : (
                          <div className="ProjectMaterialMasterTableHeader__text-cell">
                            {materialHeaderInfo?.notes}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {detailMaterialMaster?.map((el, index) => {
                      return (
                        <TableRow>
                          <TableCell width={100}>
                            <CustomToolTip
                              element={el.material}
                              textLength={25}
                              className={
                                'ProjectMaterialMasterTableHeader__text-cell'
                              }
                            />
                          </TableCell>
                          <TableCell width={100}>
                            <CustomToolTip
                              element={el.materialid}
                              textLength={25}
                              className={
                                'ProjectMaterialMasterTableHeader__text-cell'
                              }
                            />
                          </TableCell>
                          <TableCell width={100}>
                            {el.carbonCategory?.name}
                          </TableCell>
                          <TableCell width={100}>
                            <Box
                              display="flex"
                              alignItems="center"
                              justifyContent="space-between"
                              gridGap="1rem"
                            >
                              <TextField
                                fullWidth
                                value={el.Qty}
                                id="qty"
                                style={{ minWidth: '100px' }}
                                type="number"
                                variant="outlined"
                                placeholder="Qty"
                                inputProps={{ min: 1 }}
                                onChange={(event) => {
                                  setDetailMaterialMaster((ps) => {
                                    return ps.map((q, i) => {
                                      if (i === index)
                                        return {
                                          ...q,
                                          Qty: event.target.value,
                                        };
                                      else return q;
                                    });
                                  });
                                }}
                                onBlur={(event) => {
                                  setDetailMaterialMaster((ps) => {
                                    return ps.map((q, i) => {
                                      if (i === index) {
                                        return {
                                          ...q,
                                          Qty:
                                            q.Qty === '' ||
                                            parseFloat(q.Qty) < 1
                                              ? '1'
                                              : q.Qty,
                                        };
                                      } else return q;
                                    });
                                  });
                                }}
                              />
                              <Typography style={{ minWidth: 'fit-content' }}>
                                {el.carbonCategory
                                  ? getUnit(el.carbonCategory)
                                  : el?.unit}
                              </Typography>
                            </Box>
                          </TableCell>

                          <TableCell width={100}>
                            {getBaselineValue(el.carbonCategory)}
                          </TableCell>
                          <TableCell width={100}>
                            <Select
                              MenuProps={{
                                getContentAnchorEl: null,
                                anchorOrigin: {
                                  vertical: 'bottom',
                                  horizontal: 'left',
                                },
                              }}
                              fullWidth
                              labelId="mutiple-select-label"
                              renderValue={() => el.supplier}
                              style={{ width: '200px' }}
                              variant="outlined"
                              multiple
                              value={el.supplier ? el.supplier.split(',') : []}
                              onChange={(event) => {
                                setDetailMaterialMaster((ps) => {
                                  return ps.map((q, i) => {
                                    if (i === index) {
                                      const val = Array.isArray(
                                        event.target.value
                                      )
                                        ? event.target.value.join(',')
                                        : (event.target.value as string);
                                      return {
                                        ...q,
                                        supplier: val,
                                      };
                                    } else return q;
                                  });
                                });
                              }}
                            >
                              {allSuppliers.map((elem, index) => {
                                return (
                                  <MenuItem
                                    key={`${elem}${index}`}
                                    value={elem}
                                  >
                                    <Box
                                      width="100%"
                                      justifyContent="space-between"
                                      display="flex"
                                    >
                                      <span style={{ marginRight: '10px' }}>
                                        {elem}
                                      </span>
                                      <span>
                                        {el.supplier
                                          .split(',')
                                          .includes(elem) ? (
                                          <CheckCircle />
                                        ) : (
                                          <AddCircleOutline />
                                        )}
                                      </span>
                                    </Box>
                                  </MenuItem>
                                );
                              })}
                              {/* <Box marginTop="1rem" display="flex" justifyContent="flex-end" ><Button className="btn-primary">Add</Button></Box> */}
                            </Select>
                          </TableCell>

                          <TableCell width={100}>
                            <TextField
                              fullWidth
                              inputProps={{ maxLength: 400 }}
                              value={el.Notes}
                              id="notes"
                              style={{ minWidth: '100px' }}
                              onChange={(event) => {
                                setDetailMaterialMaster((ps) => {
                                  return ps.map((q, i) => {
                                    if (i === index)
                                      return {
                                        ...q,
                                        Notes: event.target.value,
                                      };
                                    else return q;
                                  });
                                });
                              }}
                              type="text"
                              variant="outlined"
                              placeholder="Notes"
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="h6" color="textSecondary">
                Please select a Material
              </Typography>
            )
          ) : (
            <></>
          )
        ) : (
          <Typography variant="h6" color="textSecondary">
            All materials have been added to the project already.
          </Typography>
        )}
      </DialogContent>
      {currentPage === 'selectionStep' ? (
        <DialogActions className="gap-1">
          <Button
            variant="outlined"
            onClick={() => {
              props?.onClose();
              setSelected([]);
              setDetailMaterialMaster([]);
            }}
            className="btn-secondary"
          >
            Discard
          </Button>
          <Button
            variant="outlined"
            onClick={handleNextPage}
            className="btn-primary"
            disabled={selected.length === 0}
          >
            Next
          </Button>
        </DialogActions>
      ) : (
        <DialogActions className="gap-1">
          <Button
            variant="outlined"
            onClick={() => {
              props?.onClose();
              setSelected([]);
              setDetailMaterialMaster([]);
            }}
            className="btn-secondary"
          >
            Discard
          </Button>
          <Button
            variant="outlined"
            disabled={detailMaterialMaster.length < 1}
            onClick={handleSave}
            className="btn-primary"
          >
            Add
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default AddMaterialDialog;
