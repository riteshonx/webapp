import DateFnsUtils from '@date-io/date-fns';
import {
  Checkbox,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@material-ui/core';
import InsertInvitationIcon from '@material-ui/icons/InsertInvitation';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { Box } from '@mui/system';
import React, { useContext, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import PMM from 'src/assets/images/ProjectMaterialMaster.jpg';
import { projectDetailsContext } from 'src/modules/baseService/projects/Context/ProjectDetailsContext';
import Notification, {
  AlertTypes,
} from 'src/modules/shared/components/Toaster/Toaster';
import { decodeExchangeToken } from 'src/services/authservice';
import GlobalDatePicker from '../../../../shared/components/GlobalDatePicker/GlobalDatePicker';
import { updateProjectEquipmentMaster } from './EquipmentMasterAction';
interface SelectionType {
  all: boolean;
  selected: Array<number>;
}

interface EquipmentData {
  endDate: any;
  startDate: any;
  startDateOpen: boolean;
  endDateOpen: boolean;
  equipmentId: number;
  equipmentMaster: {
    equipmentType: string;
    model: string;
    oemName: string;
  };
}
interface Props {
  btnProps: any;
  EquipmentData: any;
  loading: boolean;
  searchText: string;
  projectId: any;
  projectToken: any;
  onSelect?: (selection: 'all' | number, checked: boolean) => void;
  selected?: SelectionType;
  fetchData: any;
}

const EquipmentPage: React.FC<Props> = (props) => {
  const [equipmentData, setEquipmentData] = useState<Array<EquipmentData>>(
    new Array<EquipmentData>()
  );
  const [editPermission, setEditPermission] = useState(false);
  const { projectDetailsState }: any = useContext(projectDetailsContext);
  const [disabledSelectAll, setDisabledSelectAll] = useState(false);
  const [startdateOpen, setStartDateOpen] = useState(false);
  const [enddateOpen, setEndDateOpen] = useState(false);
  const {
    control,
    setValue,
    setError,
    clearErrors,
    getValues,
    formState: { errors },
  } = useForm<any>({});

  useEffect(() => {
    setEditPermission(
      decodeExchangeToken(
        projectDetailsState.projectToken
      ).allowedRoles.includes('createProjectMaterial')
    );
  }, [projectDetailsState]);

  useEffect(() => {
    const detailArr = props.EquipmentData.map((el: any) => {
      return {

        equipmentIdDet:el?.equipmentId,
        equipmentId: el?.equipmentMaster?.equipmentId,

        equipmentMaster: {
          equipmentType: el.equipmentMaster.equipmentType,
          model: el.equipmentMaster.model,
          oemName: el.equipmentMaster.oemName,
        },
        startDate: el.startDate,
        endDate: el.endDate,
        startDateOpen: false,
        endDateOpen: false,
      };
    });
    setEquipmentData(detailArr);
  }, [props.EquipmentData]);

  const startDateOnChangeHandler = async (e: any, equipmentItem: any) => {
    const skipFetch = false;
    try {

      await updateProjectEquipmentMaster(props.projectToken, props.projectId, equipmentItem?.equipmentIdDet, e ? e : equipmentItem.startDate, equipmentItem.endDate)
      Notification.sendNotification("Successfully updated equipments", AlertTypes.success);

    } catch (err) {
      console.log(err);
      Notification.sendNotification(
        'Something went wrong while updating equipments',
        AlertTypes.error
      );
    } finally {
      if (!skipFetch) await props.fetchData();
    }
  };
  const endDateOnChangeHandler = async (e: any, equipmentItem: any) => {
    const skipFetch = false;
    try {

      await updateProjectEquipmentMaster(props.projectToken, props.projectId, equipmentItem?.equipmentIdDet, equipmentItem.startDate, e)
      Notification.sendNotification("Successfully updated equipments", AlertTypes.success);

    } catch (err) {
      console.log(err);
      Notification.sendNotification(
        'Something went wrong while updating equipments',
        AlertTypes.error
      );
    } finally {
      if (!skipFetch) await props.fetchData();
    }
  };

  const isSelectAllChecked: any = () => {
    if (
      props?.selected?.all ||
      (props?.selected &&
        props?.selected?.selected?.length === equipmentData.length)
    ) {
      return true;
    } else {
      return false;
    }
  };

  const openStartDateChanger = (isOpened: any, element: any) => {
    setEquipmentData((previousState) => {
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
    setEquipmentData((previousState) => {
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
  return equipmentData && equipmentData.length > 0 ? (
    <TableContainer>
      <Table stickyHeader className="ProjectEquipmentMasterTable">
        <TableHead>
          <TableRow>
            {editPermission && (
              <TableCell className="ProjectEquipmentMasterTableHeader">
                <Checkbox
                  disabled={disabledSelectAll}
                  checked={isSelectAllChecked()}
                  onChange={(event, checked) => props.onSelect!('all', checked)}
                  value="all"
                />
              </TableCell>
            )}
            <TableCell className="ProjectEquipmentMasterTableHeader">
              Oem Name*
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
          {equipmentData
            .sort(function (a: any, b: any) {
              return parseFloat(a.equipmentId) - parseFloat(b.equipmentId);
            })
            .map((el: any, index: any) => {
              return (
                <TableRow>
                  {editPermission && (
                    <TableCell className="ProjectEquipmentMasterTableHeader">
                      <Checkbox
                        checked={props?.selected?.selected?.includes(
                          el.equipmentId
                        )}
                        onChange={(event, checked) =>
                          props?.onSelect!(el.equipmentId, checked)
                        }
                        value="all"
                      />
                    </TableCell>
                  )}
                  <TableCell>{el.equipmentMaster.oemName}</TableCell>
                  <TableCell>{el.equipmentId}</TableCell>
                  <TableCell>{el.equipmentMaster.model}</TableCell>
                  <TableCell>{el.equipmentMaster.equipmentType}</TableCell>
                  <TableCell>
                    <form>
                      <div>
                        <div>
                          <MuiPickersUtilsProvider utils={DateFnsUtils}>
                            <Controller
                              render={({ field }: { field: any }) => (
                                <div className="date-picker">
                                  <GlobalDatePicker
                                    id={`start-date-${el.equipmentId}`}
                                    {...field}
                                    value={el?.startDate}
                                    clearable={true}
                                    inputVariant={'outlined'}
                                    fullWidth
                                    emptyLabel="DD-MMM-YYYY"
                                    format="dd-MMM-yyyy"
                                    keyboardbuttonprops={{
                                      'aria-label': 'change date',
                                    }}
                                    open={el.startDateOpen}
                                    onClose={() =>
                                      openStartDateChanger(false, el)
                                    }
                                    {...field.rest}
                                    onChange={(e: any) => {
                                      field.onChange(e),
                                        startDateOnChangeHandler(e, el);
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
                              name="start_date"
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
                  <TableCell>
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
                                    value={el.endDate}
                                    clearable={true}
                                    inputVariant={'outlined'}
                                    fullWidth
                                    emptyLabel="DD-MMM-YYYY"
                                    format="dd-MMM-yyyy"
                                    keyboardbuttonprops={{
                                      'aria-label': 'change date',
                                    }}
                                    minDate={el.startDate}
                                    open={el.endDateOpen}
                                    onClose={() =>
                                      openEndDateChanger(false, el)
                                    }
                                    {...field.rest}
                                    onChange={(e: any) => {
                                      field.onChange(e),
                                        endDateOnChangeHandler(e, el);
                                    }}
                                  />
                                  <IconButton
                                    aria-label="delete"
                                    className="calendar-icon"
                                    onClick={() => openEndDateChanger(true, el)}
                                  >
                                    <InsertInvitationIcon />
                                  </IconButton>
                                </div>
                              )}
                              name="end_date"
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
            Add some Equipment to your project to get started
          </Typography>
          {props.btnProps.addBtn}
        </>
      ) : (
        <Typography color="textSecondary">
          No Equipment found in your project
        </Typography>
      )}
    </Box>
  ) : null;
};

export default EquipmentPage;
