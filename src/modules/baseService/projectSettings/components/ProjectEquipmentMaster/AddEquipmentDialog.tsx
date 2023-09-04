import DateFnsUtils from '@date-io/date-fns';
import {
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@material-ui/core';
import InsertInvitationIcon from '@material-ui/icons/InsertInvitation';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { DialogActions } from '@mui/material';
import moment from 'moment';
import 'moment-timezone';
import React, { useContext, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { match, useRouteMatch } from 'react-router-dom';
import { useDebounce } from 'src/customhooks/useDebounce';
import { projectDetailsContext } from 'src/modules/baseService/projects/Context/ProjectDetailsContext';
import { setIsLoading } from 'src/modules/root/context/authentication/action';
import { stateContext } from 'src/modules/root/context/authentication/authContext';
import Notification, {
  AlertTypes,
} from 'src/modules/shared/components/Toaster/Toaster';
import GlobalDatePicker from '../../../../shared/components/GlobalDatePicker/GlobalDatePicker';
import { EquipmentDetail } from '../../pages/ProjectEquipmentMaster';
import EquipmentHeader from './EquipmentHeader';
import {
  addEquipmentMaster,
  EquipmentMaster,
  getEquipmentMaster,
  ProjectEquipmentMaster,
  ProjectEquipmentMasterInsertType,
} from './EquipmentMasterAction';

moment.tz.setDefault('Europe/London'); // dynamic time-zone will come in future

const defaultValues: any = {
  start_date: '',
  end_date: '',
};
interface Props {
  visible: boolean;
  onClose: () => void;
  onSelect?: () => void;
  onSave: () => void;
  projectEquipmentMaster?: ProjectEquipmentMaster[];
  countryCode?: string;
}

const AddEquipmentDialog: React.FC<Props> = (props) => {
  const pathMatch: match<{ projectId: string }> = useRouteMatch();
  const [equipmentMaster, setEquipmentMaster] = useState<
    Array<EquipmentMaster>
  >([]);
  const [loading, setLoading] = useState(false);
  const { dispatch }: any = useContext(stateContext);
  const { projectDetailsState }: any = useContext(projectDetailsContext);
  const [pageNo, setPageNo] = useState(0);
  const [total, setTotal] = useState(0);
  const [selectedAll, setSelectedAll] = useState(false);
  const [detailEquipmentMaster, setDetailEquipmentMaster] = useState<
    Array<EquipmentDetail>
  >(new Array<EquipmentDetail>());

  const [selectedStartdDate, setSelectedStartDate] = useState<any>(new Date());
  const [selectedEndDate, setSelectedEndDate] = useState<any>(new Date());
  const [startdateOpen, setStartDateOpen] = useState(false);
  const [enddateOpen, setEndDateOpen] = useState(false);
  const {
    control,
    setValue,
    setError,
    clearErrors,
    getValues,
    formState: { errors },
  } = useForm<any>({
    defaultValues,
  });
  const fetchData = async (pageNum: number) => {
    try {
      setLoading(true);
      const token = projectDetailsState.projectToken;
      const res = await getEquipmentMaster(debouncedSearch, token, pageNum);
      setPageNo(pageNum);
      const total = res.equipmentMaster_aggregate.aggregate.count;

      const tempProjectTaskEquipment = new Map();
      props.projectEquipmentMaster?.forEach((equipment: any) => {
        tempProjectTaskEquipment.set(equipment.equipmentId, equipment);
      });

      const tempProjectEquipment: any = [];
      res.equipmentMaster.forEach((equipment: any) => {
        if (!tempProjectTaskEquipment.get(equipment.id))
          tempProjectEquipment.push(equipment);
      });

      setTotal(tempProjectEquipment.length);
      setEquipmentMaster(tempProjectEquipment);
    } catch (error) {
      console.log('error in getting equipment list', error);
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

  const [selected, setSelected] = useState<Array<string>>([]);

  const handleSelect = (
    event: React.ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => {
    if (event.target.value === 'all') {
      if (checked) {
        const equipmentIds = equipmentMaster.map((el) => {
          return el.equipmentId;
        });
        const detailArr = equipmentMaster.map((el) => {
          return {
            baselineHours: el.baselineHours,
            capacity: el.capacity || '',
            description: el.description || '',
            documentation: el.documentation || '',
            equipmentCategory: el.equipmentCategory,
            equipmentId: el.equipmentId,
            equipmentType: el.equipmentType,
            id: el.id,
            metadata: el.metadata || '',
            model: el.model,
            oemName: el.oemName,
            status: el.status || '',
            supplier: el.supplier,
            tenantId: el.tenantId,
            projectId: pathMatch.params.projectId,
            startDate: selectedStartdDate,
            endDate: selectedEndDate,
            startDateOpen: false,
            endDateOpen: false,
          };
        });

        const newArr = [...equipmentIds, ...selected];
        const uniqueArray = [...Array.from(new Set(newArr))];
        setSelected(uniqueArray);
        setDetailEquipmentMaster((prevDetail) => {
          const newDetailArr = [...prevDetail];
          detailArr.forEach((mat) => {
            const match = newDetailArr.find(
              (el) => el.equipmentId === mat.equipmentId
            );
            if (!match) {
              newDetailArr.push(mat);
            }
          });
          return newDetailArr;
        });
      } else {
        const equipmentIds = equipmentMaster.map((el) => {
          return el.equipmentId;
        });
        setSelected((ps) => ps.filter((el) => !equipmentIds.includes(el)));
        setDetailEquipmentMaster((ps) =>
          ps.filter((el) => !equipmentIds.includes(el.equipmentId))
        );
      }
    } else {
      if (checked) {
        const matchedDetail = equipmentMaster.find(
          (el) => el.equipmentId === event.target.value
        );
        if (matchedDetail) {
          setSelected((ps) => [...ps, event.target.value]);
          const newDetail = {
            baselineHours: matchedDetail.baselineHours,
            capacity: matchedDetail.capacity || '',
            description: matchedDetail.description || '',
            documentation: matchedDetail.documentation || '',
            equipmentCategory: matchedDetail.equipmentCategory,
            equipmentId: matchedDetail.equipmentId,
            equipmentType: matchedDetail.equipmentType,
            id: matchedDetail.id,
            metadata: matchedDetail.metadata || '',
            model: matchedDetail.model,
            oemName: matchedDetail.oemName,
            status: matchedDetail.status || '',
            supplier: matchedDetail.supplier,
            tenantId: matchedDetail.tenantId,
            projectId: pathMatch.params.projectId,
            startDate: selectedStartdDate,
            endDate: selectedEndDate,
            startDateOpen: false,
            endDateOpen: false,
          };
          setDetailEquipmentMaster((ps) => [...ps, newDetail]);
        }
      } else {
        setSelected((ps) => {
          return ps.filter((el) => {
            if (!(el === event.target.value)) return el;
          });
        });
        setDetailEquipmentMaster((ps) =>
          ps.filter((el) => el.equipmentId !== event.target.value)
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
      setDetailEquipmentMaster([]);
    } else {
      setSearch('');
    }
  }, [visible, setSearch, setSelected, setDetailEquipmentMaster]);

  const handleSave = async () => {
    try {
      dispatch(setIsLoading(true));
      let data: Array<ProjectEquipmentMasterInsertType> = [];
      let token = '';
      data = detailEquipmentMaster.map((el) => {
        return {
          startDate: el.startDate,
          endDate: el.endDate,
          equipmentId: el.id,
          updatedBy: '1f7a718d-bb0c-408d-b3c0-e9dee66e8316',
        };
      });
      if (projectDetailsState.projectToken) {
        token = projectDetailsState.projectToken;
      }
      await addEquipmentMaster(data, token);
      Notification.sendNotification(
        'Equipment added successfully',
        AlertTypes.success
      );
      props.onSave();
    } catch (err) {
      console.log(err);
      Notification.sendNotification(
        'Something went wrong while adding equipment',
        AlertTypes.warn
      );
    } finally {
      props.onClose();
      setSelected([]);
      setDetailEquipmentMaster([]);
      dispatch(setIsLoading(false));
    }
  };

  const handleChangePage = (e: any, page: number) => {
    fetchData(page);
  };

  useEffect(() => {
    const selectedAll =
      selected.length > 0
        ? equipmentMaster.every((mat) => {
            return selected.includes(mat.equipmentId);
          })
        : false;
    setSelectedAll(selectedAll);
  }, [equipmentMaster, selected, setSelectedAll]);

  const openStartDateChanger = (isOpened: any, element: any) => {
    setDetailEquipmentMaster((previousState) => {
      const newState = previousState.map((equipment) => {
        if (equipment.equipmentId === element.equipmentId) {
          return {
            ...equipment,
            startDateOpen: isOpened,
          };
        } else {
          return equipment;
        }
      });
      return newState;
    });
  };

  const openEndDateChanger = (isOpened: any, element: any) => {
    setDetailEquipmentMaster((previousState) => {
      const newState = previousState.map((equipment) => {
        if (equipment.equipmentId === element.equipmentId) {
          return {
            ...equipment,
            endDateOpen: isOpened,
          };
        } else {
          return equipment;
        }
      });
      return newState;
    });
  };

  const startDateOnChangeHandler = (e: any, index: number, element: any) => {
    setDetailEquipmentMaster((previousState) => {
      return previousState.map((equipment, i) => {
        if (equipment.equipmentId === element.equipmentId)
          return {
            ...equipment,
            startDate: e,
          };
        else {
          return equipment;
        }
      });
    });
  };

  const endDateOnchangeHandler = (e: any, equipmentItem: any, index: any) => {
    setDetailEquipmentMaster((previousState) => {
      return previousState.map((equipment, i) => {
        if (equipment.equipmentId === equipmentItem.equipmentId)
          return {
            ...equipment,
            endDate: e,
          };
        else {
          return equipment;
        }
      });
    });
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
        <EquipmentHeader
          SearchVisible={currentPage === 'selectionStep'}
          title="Add Equipment"
          searchText={search}
          onChange={(e) => {
            setSearch(e.currentTarget.value);
          }}
          deleteButtonVisible={false}
        />
      </DialogTitle>
      <DialogContent className="modalContent">
        {equipmentMaster.length > 0 ? (
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
                    <TableCell className="ProjectEquipmentMasterTableHeader">
                      Oem Name*
                    </TableCell>
                    <TableCell className="ProjectEquipmentMasterTableHeader">
                      ID*
                    </TableCell>
                    <TableCell className="ProjectEquipmentMasterTableHeader">
                      Equipment Model*{' '}
                    </TableCell>
                    <TableCell className="ProjectEquipmentMasterTableHeader">
                      Equipment Type*
                    </TableCell>
                    <TableCell className="ProjectEquipmentMasterTableHeader">
                      Supplier*
                    </TableCell>
                    <TableCell className="ProjectEquipmentMasterTableHeader">
                      Equipment Category*
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {equipmentMaster?.map((el, index) => {
                    return (
                      <TableRow key={el.equipmentId}>
                        <TableCell>
                          <Checkbox
                            color="primary"
                            checked={selected.includes(el.equipmentId)}
                            onChange={handleSelect}
                            value={el.equipmentId}
                          ></Checkbox>
                        </TableCell>
                        <TableCell>{el.oemName}</TableCell>
                        <TableCell>{el.equipmentId}</TableCell>
                        <TableCell>{el.model}</TableCell>
                        <TableCell>{el.equipmentType}</TableCell>
                        <TableCell>{el.supplier}</TableCell>
                        <TableCell>{el.equipmentCategory}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              <TablePagination
                className="ProjectEquipmentMasterTablePagination"
                component="div"
                count={total}
                rowsPerPage={15}
                page={pageNo}
                onChangePage={handleChangePage}
                rowsPerPageOptions={[]}
              />
            </TableContainer>
          ) : currentPage === 'detailStep' ? (
            detailEquipmentMaster.length > 0 ? (
              <TableContainer component={Paper}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell className="ProjectEquipmentMasterTableHeader">
                        Oem Name *
                      </TableCell>
                      <TableCell className="ProjectEquipmentMasterTableHeader">
                        ID*
                      </TableCell>
                      <TableCell className="ProjectEquipmentMasterTableHeader">
                        Equipment Model*
                      </TableCell>
                      <TableCell className="ProjectEquipmentMasterTableHeader">
                        Equipment Type*
                      </TableCell>
                      <TableCell className="ProjectEquipmentMasterTableHeader">
                        Start Date
                      </TableCell>
                      <TableCell className="ProjectEquipmentMasterTableHeader">
                        End Date
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {detailEquipmentMaster?.map((el, index) => {
                      return (
                        <TableRow key={el.equipmentId}>
                          <TableCell width={100}>{el.oemName}</TableCell>
                          <TableCell width={100}>{el.equipmentId}</TableCell>
                          <TableCell width={100}>{el.model}</TableCell>
                          <TableCell width={100}>{el.equipmentType}</TableCell>
                          <TableCell width={250}>
                            <form>
                              <div>
                                <div>
                                  <MuiPickersUtilsProvider
                                    libInstance={moment}
                                    utils={DateFnsUtils}
                                  >
                                    <Controller
                                      render={({ field }: { field: any }) => (
                                        <div
                                          className="date-picker"
                                          key={index}
                                        >
                                          <GlobalDatePicker
                                            id={`start-date-${el.equipmentId}`}
                                            {...field}
                                            value={
                                              el.startDate
                                                ? el.startDate
                                                : field?.value
                                            }
                                            clearable={true}
                                            inputVariant={'outlined'}
                                            fullWidth
                                            emptyLabel="DD-MMM-YYYY"
                                            format="dd-MMM-yyyy"
                                            keyboardbuttonprops={{
                                              'aria-label': 'change date',
                                            }}
                                            key={`start-date-${el.equipmentId}`}
                                            tabIndex={index}
                                            open={el.startDateOpen}
                                            onClose={() =>
                                              openStartDateChanger(false, el)
                                            }
                                            {...field.rest}
                                            onChange={(e: any) => {
                                              startDateOnChangeHandler(
                                                e,
                                                index,
                                                el
                                              );
                                            }}
                                          />
                                          <IconButton
                                            aria-label="delete"
                                            className="calendar-icon"
                                            onClick={() =>
                                              openStartDateChanger(true, el)
                                            }
                                          >
                                            <InsertInvitationIcon />
                                          </IconButton>
                                        </div>
                                      )}
                                      name={`start-date-${el.equipmentId}`}
                                      control={control}
                                      rules={{
                                        required: true,
                                      }}
                                    />
                                  </MuiPickersUtilsProvider>
                                </div>
                              </div>
                            </form>
                          </TableCell>
                          <TableCell width={250}>
                            <form>
                              <div>
                                <div>
                                  <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                    <Controller
                                      render={({ field }: { field: any }) => (
                                        <div className="date-picker">
                                          <GlobalDatePicker
                                            id={`end-date-${el.equipmentId}`}
                                            {...field}
                                            clearable={true}
                                            value={
                                              el?.endDate
                                                ? el.endDate
                                                : field?.value
                                            }
                                            inputVariant={'outlined'}
                                            fullWidth
                                            emptyLabel="DD-MMM-YYYY"
                                            format="dd-MMM-yyyy"
                                            keyboardbuttonprops={{
                                              'aria-label': 'change date',
                                            }}
                                            minDate={el.startDate}
                                            open={el.endDateOpen}
                                            key={`end-date-${el.equipmentId}`}
                                            onClose={() =>
                                              openEndDateChanger(false, el)
                                            }
                                            {...field.rest}
                                            onChange={(e: any) => {
                                              field.onChange(e),
                                                endDateOnchangeHandler(
                                                  e,
                                                  el,
                                                  index
                                                );
                                            }}
                                          />
                                          <IconButton
                                            aria-label="delete"
                                            className="calendar-icon"
                                            onClick={() =>
                                              openEndDateChanger(true, el)
                                            }
                                          >
                                            <InsertInvitationIcon />
                                          </IconButton>
                                        </div>
                                      )}
                                      name={`end-date-${el.equipmentId}`}
                                      control={control}
                                      rules={{
                                        required: true,
                                      }}
                                    />
                                  </MuiPickersUtilsProvider>
                                </div>
                              </div>
                            </form>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="h6" color="textSecondary">
                Please select a Equipment
              </Typography>
            )
          ) : (
            <></>
          )
        ) : (
          // : <Typography variant="h6" color="textSecondary" >All Equipments have been added to the project already.</Typography>
          <Typography variant="h6" color="textSecondary">
            No Equipments found
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
              setDetailEquipmentMaster([]);
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
              setDetailEquipmentMaster([]);
            }}
            className="btn-secondary"
          >
            Discard
          </Button>
          <Button
            variant="outlined"
            disabled={detailEquipmentMaster.length < 1}
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

export default AddEquipmentDialog;
