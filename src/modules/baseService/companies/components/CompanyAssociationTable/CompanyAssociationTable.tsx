import React, { useContext, useEffect, useState } from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Paper from '@material-ui/core/Paper';
import { Tooltip } from '@material-ui/core';
import './CompanyAssociationTable.scss';
import EditIcon from "@material-ui/icons/Edit";
import NoDataMessage from '../../../../shared/components/NoDataMessage/NoDataMessage';
import { stateContext } from '../../../../root/context/authentication/authContext';
import { match, useHistory, useRouteMatch } from 'react-router-dom';
import { validateTableCell } from '../../../../../utils/helper';
export interface Params {
  projectId: string;
}

interface tableHeader {
  firstName: string,
  lastName: string,
  email: string,
  mobile: string,
  role: string,
  status: string,
  action: string
}
interface rowData {
  firstName: string,
  lastName: string,
  email: string,
  mobile: string,
  role: string,
  status: string,
  action: any,
  companyId: number,
  userId: string
}

interface message {
  header: string,
  text: string,
  cancel: string,
  proceed: string,
}

const noDataMessage= 'No users were found.';


function createData(
    firstName: string,
    lastName: string,
    email: string,
    mobile: string,
    role: string,
    status: string,
    action: string,
    companyId: number,
    userId: string
): rowData {
  return { firstName, lastName, email, mobile, role, status, action, companyId, userId};
}


function descendingComparator(a: any, b: any, orderBy: keyof any) {
  if (b[orderBy]?.toString().toLocaleLowerCase() < a[orderBy]?.toString().toLocaleLowerCase()) {
    return -1;
  }
  if (b[orderBy]?.toString().toLocaleLowerCase() > a[orderBy]?.toString().toLocaleLowerCase()) {
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
  { id: 'firstName', numeric: false,  disablePadding: true, label: 'First name', isSorting: false},
  { id: 'lastName', numeric: false, disablePadding: true, label: 'Last Name', isSorting: false},
  { id: 'email', numeric: true, disablePadding: true, label: 'Email ', isSorting: false}, 
  { id: 'mobile', numeric: false, disablePadding: true, label: 'Mobile', isSorting: false},
  { id: 'role', numeric: false, disablePadding: true, label: 'Role', isSorting: false},
  { id: 'status', numeric: false, disablePadding: true, label: 'Status', isSorting: false},
  { id: 'action', numeric: false, disablePadding: true, label: '', isSorting: true},
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
  const createSortHandler = (property: keyof rowData, isSorting:boolean) => (event: React.MouseEvent<unknown>) => {
    if(!isSorting){
      onRequestSort(event, property);
    }
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
            onClick={createSortHandler(headCell.id, headCell.isSorting)}
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
      height: 'calc(100vh - 300px)',
      width: '100%',
      flexGrow: 1,
      padding: '0px 1px',
      overflow: 'auto',
      margin: '10px 0px'
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
  const [order, setOrder] = React.useState<Order>('asc');
  const [orderBy, setOrderBy] = React.useState<keyof rowData>('firstName');
  const [projectList, setProjectList] = useState<Array<any>>([]);
  const [selectedProject, setSelectedCompany] = useState<any>();

  useEffect(() => {
      setProjectList(props.companyMembersData)
  }, [props.companyMembersData])

  const handleRequestSort = (event: React.MouseEvent<unknown>, property: keyof rowData) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };


  const rows: any = [];
  const allTaskData: any = [];

  projectList?.forEach((row:any) => {
    allTaskData.push(row) 
    rows?.push(createData(
        row?.firstName,
        row?.lastName,
        row?.email,
        row?.mobile, 
        row?.role, 
        row?.status, 
        '',
        row.companyId,
        row.userId,
      ))
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
                      .map((row: any) => {
                        return (
                          <TableRow key={row.userId}>
                            <TableCell className={classes.cell}>
                              <Tooltip title={row?.firstName} aria-label="first name">
                                <label>
                                  { (row?.firstName && row?.firstName.length > 30) ? `${row?.firstName.slice(0,18)} . . .`: validateTableCell(row?.firstName) }
                                </label>
                              </Tooltip>
                            </TableCell>
                            <TableCell className={classes.cell} >
                                <Tooltip title={row?.lastName} aria-label="last name">
                                    <label>
                                    { (row.lastName && row?.lastName.length > 30) ? `${row?.lastName.slice(0,18)} . . .`: validateTableCell(row?.lastName) }
                                    </label>
                                </Tooltip>
                            </TableCell>
                            {/* <TableCell className={classes.cell} >
                                <Tooltip title={row?.company} aria-label="company name">
                                      <label>
                                      { (row.lastName && row?.company.length > 30) ? `${row?.company.slice(0,18)} . . .`: row?.company }
                                      </label>
                                </Tooltip>
                            </TableCell> */}
                            <TableCell className={classes.cell} >
                              <Tooltip title={row?.email} aria-label="email name">
                                      <label>
                                      { (row.lastName && row?.email.length > 30) ? `${row?.email.slice(0,18)} . . .`: validateTableCell(row?.email) }
                                      </label>
                                </Tooltip>
                            </TableCell>
                            <TableCell className={classes.cell} >{validateTableCell(row?.mobile)}</TableCell>
                            <TableCell className={classes.cell} >{validateTableCell(row?.role)}</TableCell>
                            <TableCell className={classes.cell} >
                                { row.status===1 ? 'Deactivated': row.status===2 ? 'Invited':'Active'}
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
      </Paper>
    </div>
  );
}
