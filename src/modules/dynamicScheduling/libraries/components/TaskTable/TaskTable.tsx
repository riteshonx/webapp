import React, { useContext, useState } from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { TaskLibContext } from '../../pages/TaskLibrary/TaskLibrary';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Paper from '@material-ui/core/Paper';
import { Tooltip } from '@material-ui/core';
import DeleteIcon from "@material-ui/icons/Delete";
import CreateTask from '../CreateTask/CreateTask';
import EditIcon from "@material-ui/icons/Edit";
import FileCopyIcon from '@material-ui/icons/FileCopy';

import './TaskTable.scss'
import ConfirmDialog from '../../../../shared/components/ConfirmDialog/ConfirmDialog';
import NoDataMessage from '../../../../shared/components/NoDataMessage/NoDataMessage';
import { createTenantTask, deleteTenantTask, updateTenantTask } from '../../../permission/scheduling';
import { stateContext } from '../../../../root/context/authentication/authContext';
import { getUniqueName } from '../../../../../utils/helper';

interface tableHeader {
  taskName: string,
  description: string,
  taskType: string,
  duration: number,
  createdBy: string,
  action: string
}
interface rowData {
  taskName: string,
  description: string,
  taskType: string,
  duration: number,
  action: string
  customId: string,
  customTaskType: string,
  classification: string,
  tag: null,
  id: number,
  createdBy: number,
  createdAt: Date
  tenantAssociation: TenantAssociation
  user: User,
  firstName: string,
  lastName: string
}

interface actionData{
  actionType:string,
  taskData:rowData
}
export interface TenantAssociation{
  user: User
}
export interface User{
  firstName: string
  lastName: string
}

interface message {
  header: string,
  text: string,
  cancel: string,
  proceed: string,
}

type nameBtn = {
  name: string,
  submit: string
}

const btnNamae: nameBtn = {
  name: "Edit Task",
  submit: "Update",
};

const confirmMessage: message = {
  header: "Are you sure?",
  text: "If you delete this task, all data related to this task will be lost.",
  cancel: "Cancel",
  proceed: "Proceed",
}

const noDataMessage= 'No task libraries were found.';


function createData(
  taskName: string,
  description: string,
  taskType: string,
  duration: number,
  action: string,
  customId: string,
  customTaskType: string,
  classification: string,
  tag: null,
  id: number,
  createdBy: number,
  createdAt: Date,
  tenantAssociation: TenantAssociation,
  user: User,
  firstName: string,
  lastName: string
): rowData {
  return { taskName, description, taskType, duration, action, customId, customTaskType,
    classification, tag, id, createdBy, createdAt, tenantAssociation, user, firstName, lastName };
}


function descendingComparator(a: any, b: any, orderBy: keyof any) {
  if (b[orderBy].toString().toLocaleLowerCase() < a[orderBy].toString().toLocaleLowerCase()) {
    return -1;
  }
  if (b[orderBy].toString().toLocaleLowerCase() > a[orderBy].toString().toLocaleLowerCase()) {
    return 1;
  }
  return 0;
}

type Order = 'asc' | 'desc';

function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key,
): (a: { [key in Key]: number | string }, b: { [key in Key]: number | string }) => number {
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
  { id: 'taskName', numeric: false,  disablePadding: true, label: 'Task Name', isSorting: false},
  { id: 'description', numeric: false, disablePadding: true, label: 'Description', isSorting: false},
  { id: 'taskType', numeric: false, disablePadding: true, label: 'Type', isSorting: false},
  { id: 'duration', numeric: true, disablePadding: true, label: 'Duration ', isSorting: false}, 
  { id: 'createdBy', numeric: true, disablePadding: true, label: 'Created by ', isSorting: false},
  { id: 'action', numeric: false, disablePadding: true, label: ' ', isSorting: true},
];


interface EnhancedTableProps {
  classes: ReturnType<typeof useStyles>;
  onRequestSort: (event: React.MouseEvent<unknown>, property: keyof rowData) => void;
  order: Order;
  orderBy: string;
  rowCount: number;
}

function EnhancedTableHead(props: EnhancedTableProps) {
  const { classes, order, orderBy, onRequestSort } = props;
  const createSortHandler = (property: keyof rowData) => (event: React.MouseEvent<unknown>) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
    <TableRow>
      {headCells.map((headCell) => (
        <TableCell className={classes.headecell}
          key={headCell.id}
          align="left"
          sortDirection={orderBy === headCell.id ? order : false}
        >
          <TableSortLabel
            active={orderBy === headCell.id}
            direction={orderBy === headCell.id ? order : 'asc'}
            onClick={createSortHandler(headCell.id)}
            hideSortIcon = {headCell.isSorting}
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
      '& .MuiPaper-elevation1':{
        boxShadow: 'none'
      }
    },
    container:{
      height: 'calc(100vh - 270px)',
      width: '100%',
      flexGrow: 1,
      padding: '0px 1px',
      overflow: 'auto'
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
    cell:{
        fontSize:'11px',
        color: '#333333'
    },
    headecell:{
        fontSize:'12px',
        color: '#333333',
        fontWeight: 600
    },
    cellicon:{
        fontSize:"16px",
        cursor: 'pointer',
        color: '#B0B0B0'
    }
  }),
);

export default function EnhancedTable(props: any): any {
  const { state }:any = useContext(stateContext);
  const classes = useStyles();
  const taskData = useContext(TaskLibContext);
  const [selectItem, setSelectItem] = useState({});
  const [dialogOpen, setdialogOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<any>();
  const [actionData,setActionData] = useState<actionData>();


  const [order, setOrder] = React.useState<Order>('asc');
  const [orderBy, setOrderBy] = React.useState<keyof rowData>('taskName');

  const handleRequestSort = (event: React.MouseEvent<unknown>, property: keyof rowData) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleDialogOpen = (row:any, actionType: string) => {
      setdialogOpen(true);
      setSelectItem(row);
      const data= {...row};
      if(actionType=== 'copy'){
          const namesList= taskData.map((current: any)=>current.taskName);
          namesList.push(data.taskName);
          data.taskName= getUniqueName(namesList);
      }
      setActionData({ actionType:actionType, taskData:data});
  }

  const handleDialogClose = () => {
      setdialogOpen(false);
  }

  const handleConfirmBoxOpen = (id: number) => {
    setConfirmOpen(true);
    setSelectedId(id);
  }

  const handleConfirmBoxClose = () => {
    setConfirmOpen(false);
  }

  const deleteTask = () => {
    props.deleteTask(selectedId);
    setConfirmOpen(false);
};

  const rows: any = [];
  const allTaskData: any = [];

  const refreshTaskList = () => {
    props.refresh();
}
  
  taskData.forEach((row:rowData) => {  
    allTaskData.push(row) 
    rows.push(createData(
      row.taskName, row.description, row.taskType, row.duration, ' ', row.customId,
      row.customTaskType, row.classification, row.tag, row.id, row.createdBy, row.createdAt, row.tenantAssociation,
      row.tenantAssociation.user, row.tenantAssociation.user.firstName,  row.tenantAssociation.user.lastName))
  });

  return (
    <div className={classes.root}>
      <Paper className={classes.paper}>
        <TableContainer className={classes.container}>
        <Table stickyHeader
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
            {
                rows.length>0 ? (
                  <TableBody>
                    {stableSort(rows, getComparator(order, orderBy))
                      .map((row) => {
                        return (
                          <TableRow key={row.id}>
                            <TableCell className={classes.cell}>{row.taskName}</TableCell>
                            <TableCell className={classes.cell} >{row.description}</TableCell>
                            <TableCell className={classes.cell} >{row.taskType}</TableCell>
                            <TableCell className={classes.cell} >{row.duration}</TableCell>
                            <TableCell className={classes.cell} >
                              {row.firstName} {row.lastName}
                            </TableCell>
                            <TableCell className={classes.cell} >
                              {createTenantTask ? (
                                <Tooltip title="Copy">
                                  <FileCopyIcon
                                    data-testid={`edit-task-${row.id}`}
                                    className="formlistTable__cellicon"
                                    onClick={() => handleDialogOpen(row, 'copy')}
                                  />
                                </Tooltip>
                              ) : (
                                ''
                              )}
                            { updateTenantTask ? (
                              <Tooltip title="Edit">
                                <EditIcon data-testid={`edit-task-${row.id}`} className="grid-view__card__info__action__icon"
                                onClick={() => handleDialogOpen(row,'edit')} />
                              </Tooltip>) : '' }
                               { deleteTenantTask ? (
                                <Tooltip title="Delete">
                                  <DeleteIcon data-testid={`delete-task-${row.id}`} className="grid-view__card__info__action__icon"
                                  onClick={() => handleConfirmBoxOpen(Number(row.id))} />
                                </Tooltip>) : '' }
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                ): (
                  !state.isLoading ? (
                    <TableBody>
                      <TableRow>
                        <TableCell colSpan={7} align={'center'}>
                          <NoDataMessage message={noDataMessage} />
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  ) : ("") 
                )
              }

          </Table>
        </TableContainer>
          {
              dialogOpen ? (
                  <CreateTask open={dialogOpen} taskActionItem={actionData}
                    refreshTaskList={refreshTaskList} btnName={btnNamae} close={handleDialogClose} />
              ) : ('')
          }
          {
              confirmOpen ? (
                  <ConfirmDialog open={confirmOpen} message={confirmMessage} close={handleConfirmBoxClose} proceed={deleteTask} />
              ) : ('')
          }
      </Paper>
    </div>
  );
}
