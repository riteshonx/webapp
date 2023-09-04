import { Tooltip } from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import React, { useContext, useEffect, useState } from 'react';
import { stateContext } from '../../../../root/context/authentication/authContext';
import ConfirmDialog from '../../../../shared/components/ConfirmDialog/ConfirmDialog';
import NoDataMessage from '../../../../shared/components/NoDataMessage/NoDataMessage';
import {
  createTenantCalendar,
  deleteTenantCalendar,
  updateTenantCalendar,
} from '../../../permission/scheduling';
import CalendarContext from '../../../context/calendar/calendarContext';
import CreateCalendarTemplate from '../CreateCalendarTemplate/CreateCalendarTemplate';

import defualt from '../../../../../assets/images/defualt.svg';
import star from '../../../../../assets/images/star.svg';
import './CalendarTable.scss';
import CalenderOption from '../calendarActionOption/calendarActionOption';
interface tableHeader {
  calendarName: string;
  workingHours: string;
  workingDays: string;
  holidayList: string;
  createdBy: string;
  action: string;
}

interface rowData {
  calendarName: string;
  description: string;
  workingDays: string[];
  workingDaysCount: string;
  workingDaysLength: number;
  workingHours: number;
  isEditable: string;
  id: number;
  createdBy: string;
  action: string;
  holidayList: HolidayList[];
  holidayListCount: number;
  tenantAssociation: TenantAssociation;
  user: User;
  firstName: string;
  lastName: string;
  isDefault: string
}

export interface TenantAssociation {
  user: User;
}

export interface User {
  firstName: string;
  lastName: string;
}

export interface HolidayList {
  holidayName: string;
  year: number;
  date: Date;
}

interface message {
  header: string;
  text: string;
  cancel: string;
  proceed: string;
}

type nameBtn = {
  name: string;
  submit: string;
};

const noDataMessage = 'No calendars were found.';

function createData(
  calendarName: string,
  description: string,
  workingDays: string[],
  workingHours: number,
  action: string,
  isEditable: string,
  id: number,
  createdBy: string,
  holidayList: HolidayList[],
  tenantAssociation: TenantAssociation,
  user: User,
  firstName: string,
  lastName: string,
  isDefault: string
): rowData {
  return {
    calendarName,
    description,
    workingDaysLength: workingDays.length,
    workingDaysCount: workingDays
      .map((item) => item.substring(0, 3))
      .join(', '),
    workingDays: workingDays,
    workingHours,
    action,
    isEditable,
    id,
    createdBy,
    holidayListCount:  holidayList?.length || 0,
    holidayList: holidayList,
    tenantAssociation,
    user,
    firstName,
    lastName,
    isDefault
  };
}

function descendingComparator(a: any, b: any, orderBy: keyof any) {
  if (
    b[orderBy].toString().toLocaleLowerCase() <
    a[orderBy].toString().toLocaleLowerCase()
  ) {
    return -1;
  }
  if (
    b[orderBy].toString().toLocaleLowerCase() >
    a[orderBy].toString().toLocaleLowerCase()
  ) {
    return 1;
  }
  return 0;
}

type Order = 'asc' | 'desc';

function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key
): (
  a: { [key in Key]: number | string },
  b: { [key in Key]: number | string }
) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort<T>(array: T[], comparator: (a: T, b: T) => number) {
  const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

interface HeadCell {
  disablePadding: boolean;
  id: keyof tableHeader;
  label: string;
  numeric: boolean;
  isSorting: boolean;
}

const headCells: HeadCell[] = [
  {
    id: 'calendarName',
    numeric: false,
    disablePadding: true,
    label: 'Name',
    isSorting: false,
  },
  {
    id: 'workingHours',
    numeric: false,
    disablePadding: false,
    label: 'Details',
    isSorting: false,
  },
  {
    id: 'workingDays',
    numeric: false,
    disablePadding: false,
    label: 'Days',
    isSorting: false,
  },
  {
    id: 'holidayList',
    numeric: true,
    disablePadding: false,
    label: 'Projects Associated',
    isSorting: true,
  },
  {
    id: 'createdBy',
    numeric: true,
    disablePadding: false,
    label: 'Created by',
    isSorting: false,
  },
  {
    id: 'action',
    numeric: true,
    disablePadding: false,
    label: ' ',
    isSorting: true,
  },
];

interface EnhancedTableProps {
  classes: ReturnType<typeof useStyles>;
  onRequestSort: (
    event: React.MouseEvent<unknown>,
    property: keyof rowData
  ) => void;
  order: Order;
  orderBy: string;
  rowCount: number;
}

function EnhancedTableHead(props: EnhancedTableProps) {
  const { classes, order, orderBy, onRequestSort } = props;
  const createSortHandler =
    (property: keyof rowData) => (event: React.MouseEvent<unknown>) => {
      onRequestSort(event, property);
    };

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            className={classes.headecell}
            key={headCell.id}
            align="left"
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
              hideSortIcon={headCell.isSorting}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <span className={classes.visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </span>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
      '& .MuiPaper-elevation1': {
        boxShadow: 'none',
      },
    },
    container: {
      height: 'calc(100vh - 290px)',
      width: '100%',
      flexGrow: 1,
      padding: '0px 1px',
      overflow: 'auto',
    },
    paper: {
      width: '100%',
      marginBottom: theme.spacing(0),
    },
    table: {
      //   minWidth: 750,
    },
    visuallyHidden: {
      border: 0,
      clip: 'rect(0 0 0 0)',
      height: 1,
      margin: 0,
      overflow: 'hidden',
      padding: 0,
      position: 'absolute',
      top: 20,
      width: 1,
    },
    cell: {
      fontSize: '11px',
      color: '#333333',
    },
    headecell: {
      fontSize: '12px',
      color: '#333333',
      fontWeight: 600,
    },
    cellicon: {
      fontSize: '16px',
      cursor: 'pointer',
      color: '#B0B0B0',
    },
  })
);

export default function EnhancedTable(props: any): any {
  const { state }: any = useContext(stateContext);
  const classes = useStyles();
  const calendarContext = useContext(CalendarContext);
  const { calendars, makeCalendarDefault,  setCurrentCalendar,  setCalendarAction, getProjectCalendar,  associatedCalendar } = calendarContext;
  const { deleteCalendar } = calendarContext;
  const [dialogOpen, setdialogOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  //  Action to display confirmation popup for edit or delete values 'edit'/'delete'
  const [action, setAction] = useState('delete');

  //  set confirmation messages header, messages, button title
  const [confirmMessage, setConfirmMessage] = useState({});

  const [selectedItem, setSelectedItem] = useState<any>();

  const [order, setOrder] = React.useState<Order>('asc');
  const [orderBy, setOrderBy] = React.useState<keyof rowData>('calendarName');
  
  useEffect(() => {
    const calendarIds: any = [];
    if(calendars.length > 0) {
      calendars.forEach(element => {
        calendarIds.push(element.id);
      });
      getProjectCalendar(calendarIds);
    }
   
  }, [associatedCalendar]);

  const isAssociated = (id: any) =>  {
      return !associatedCalendar.every((d: any) => {
        return d.calendarId != id;
      });
  };


  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: keyof rowData
  ) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleDialogOpen = (calendar: any, action: string) => {
    setdialogOpen(true);
    setCurrentCalendar(calendar);
    setCalendarAction(action);
  };

  const handleDialogClose = () => {
    setdialogOpen(false);
    setCalendarAction('create');
  };

  const handleConfirmBoxOpen = (row: any, action: string) => {
    if (action === 'edit') {
      setConfirmMessage({
        header: 'Are you sure?',
        text: 'The changes made will only apply to all upcoming tasks in all projects associated to this calendar. Tasks in past will not be impacted by this change.',
        cancel: 'Cancel',
        proceed: 'Proceed',
      });
      setAction('edit');
    }
    if (action === 'delete') {
      setConfirmMessage({
        header: 'Are you sure?',
        text: 'If you delete this calendar, all data related to this calendar will be lost.',
        cancel: 'Cancel',
        proceed: 'Proceed',
      });
      setAction('delete');
    }
    setSelectedItem(row);
    setConfirmOpen(true);
  };

  const handleConfirmBoxClose = () => {
    setAction('delete');
    setConfirmOpen(false);
  };

  const proceedConfirm = () => {
    if (action === 'edit') {
      handleDialogOpen(selectedItem, action);
    }

    if (action === 'delete') {
      deleteCalendar(selectedItem.id);
    }
    setConfirmOpen(false);
  };

  const makeDefault = (calendarId: any) => {
    makeCalendarDefault(calendarId);
  }

  const rows: any = [];
  const allCalendarData: any = [];

  calendars.forEach((row: any) => {
    allCalendarData.push(row);
    rows.push(
      createData(
        row.calendarName,
        row.description,
        row.workingDays,
        row.workingHours,
        ' ',
        row.isEditable,
        row.id,
        row.createdBy,
        row.holidayList,
        row.tenantAssociation,
        row.tenantAssociation.user,
        row.tenantAssociation.user == null  ? "-": row.tenantAssociation.user?.firstName,
        row.tenantAssociation.user == null ? "": row.tenantAssociation.user?.lastName,
        row.isDefault
      )
    );
  });

  return (
    <div className={classes.root}>
      <Paper className={classes.paper}>
        <TableContainer className={classes.container}>
          <Table
            stickyHeader
            className={classes.table}
            aria-labelledby="tableTitle"
            aria-label="enhanced table"
          >
            <EnhancedTableHead
              classes={classes}
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
              rowCount={rows.length}
            />
            {calendars.length > 0 ? (
              <TableBody>
                {stableSort(rows, getComparator(order, orderBy)).map(
                  (row: any, index: any) => {
                    return (
                      <TableRow key={row.id} style={{cursor: 'pointer'}}>
                        <TableCell className={`${classes.cell} ${row.isDefault ? 'formlistTable__defaultIconRow': ''}`} onClick={() =>
                                  handleDialogOpen(row, 'edit')
                                }>

                          {row?.calendarName.length > 25 ? row?.calendarName.slice(0,15)+'. . .': row.calendarName}
                          {row.isDefault ? <div className="formlistTable__default">
                            <img className="img-responsive" src={defualt}/>
                            <img className="img-responsive formlistTable__default__star" src={star}/>
                        </div>: <div></div> }

                        </TableCell>
                        <TableCell className={classes.cell} onClick={() =>
                                  handleDialogOpen(row, 'edit')
                                }>
                          {row.workingDaysLength} days, {row.workingHours} hours
                        </TableCell>
                        <TableCell className={classes.cell} onClick={() =>
                                  handleDialogOpen(row, 'edit')
                                }>
                          {row.workingDaysCount}
                        </TableCell>
                        <TableCell className={classes.cell} onClick={() =>
                                  handleDialogOpen(row, 'edit')
                                }>
                            {associatedCalendar.filter((item: any) => 
                                item.calendarId == row.id).length == 0 ? "NONE" : 
                                associatedCalendar.filter((item: any) => item.calendarId == row.id).length}
                        </TableCell>
                        <TableCell className={classes.cell} onClick={() =>
                                  handleDialogOpen(row, 'edit')
                                }>
                          {row.firstName} {row.lastName}
                        </TableCell>
                        <TableCell className={classes.cell}>
                        { (createTenantCalendar || deleteTenantCalendar || updateTenantCalendar) ? (<CalenderOption
                            item={row} 
                            key={row.id}
                            isAssociated = {!associatedCalendar.every((d: any) => {
                              return d.calendarId != row.id;
                            })}
                            index={index}
                            handleDialogOpen={handleDialogOpen}
                            confirmDelete={handleConfirmBoxOpen}
                            makeCalendarDefault={makeDefault}/>) : ('')}
                        {/* {updateTenantCalendar && !row.isDefault ? (
                            <Tooltip title="Make Default">
                              <FileCopyIcon
                                data-testid={`edit-task-${row.id}`}
                                className="formlistTable__cellicon"
                                onClick={() =>
                                  makeDefault(row.id)
                                }
                              />
                            </Tooltip>
                          ) : (
                            ''
                          )}
                          {createTenantCalendar ? (
                            <Tooltip title="Copy">
                              <FileCopyIcon
                                data-testid={`edit-task-${row.id}`}
                                className="formlistTable__cellicon"
                                onClick={() =>
                                  handleDialogOpen(row, 'duplicate')
                                }
                              />
                            </Tooltip>
                          ) : (
                            ''
                          )}
                          {updateTenantCalendar ? (
                            <Tooltip title="Edit">
                              <EditIcon
                                data-testid={`edit-task-${row.id}`}
                                className="grid-view__card__info__action__icon"
                                onClick={() =>
                                  handleDialogOpen(row, 'edit')
                                }
                              />
                            </Tooltip>
                          ) : (
                            ''
                          )}
                          {deleteTenantCalendar &&  !row.isDefault && !isAssociated(row.id) ? (
                            <Tooltip title="Delete">
                              <DeleteIcon
                                data-testid={`delete-task-${row.id}`}
                                className="grid-view__card__info__action__icon"
                                onClick={() =>
                                  handleConfirmBoxOpen(Number(row.id), 'delete')
                                }
                              />
                            </Tooltip>
                          ) : (
                            ''
                          )} */}
                        </TableCell>
                      </TableRow>
                    );
                  }
                )}
              </TableBody>
            ) : !state.isLoading ? (
              <TableBody>
                <TableRow>
                  <TableCell colSpan={7} align={'center'}>
                    <NoDataMessage message={noDataMessage} />
                  </TableCell>
                </TableRow>
              </TableBody>
            ) : (
              ''
            )}
          </Table>
        </TableContainer>
        {dialogOpen ? (
          <CreateCalendarTemplate open={dialogOpen} close={handleDialogClose} />
        ) : (
          ''
        )}
        {confirmOpen ? (
          <ConfirmDialog
            open={confirmOpen}
            message={confirmMessage}
            close={handleConfirmBoxClose}
            proceed={proceedConfirm}
          />
        ) : (
          ''
        )}
      </Paper>
    </div>
  );
}
