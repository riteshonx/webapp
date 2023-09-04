import React, { useContext, useEffect, useState } from 'react';
import { CustomPopOver } from '../../../../shared/utils/CustomPopOver';
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
import './TenantAssociationTable.scss';

import NoDataMessage from '../../../../shared/components/NoDataMessage/NoDataMessage';
import { stateContext } from '../../../../root/context/authentication/authContext';
import { match, useHistory, useRouteMatch } from 'react-router-dom';
import Checkbox from '@material-ui/core/Checkbox';
import ProjectUserRoleSelect from '../ProjectUserRoleSelect/ProjectUserRoleSelect';

export interface Params {
  projectId: string;
}

interface tableHeader {
  firstName: string,
  lastName: string,
  company: string,
  email: string,
  mobile: string,
  role: string
}
interface rowData {
  firstName: string,
  lastName: string,
  company: string,
  email: string,
  mobile: string,
  role: string,
  projectId: number,
  userId: string,
  roleId :number,
  status:number,
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
    company: string,
    email: string,
    mobile: string,
    role: string,
    projectId: number,
    userId: string,
    roleId :number,
    status:number,
): rowData {
  return { firstName, lastName, company, email, mobile, role, projectId, userId, roleId, status};
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
  { id: 'company', numeric: false, disablePadding: true, label: 'Company', isSorting: false},
  { id: 'email', numeric: true, disablePadding: true, label: 'Email ', isSorting: false}, 
  { id: 'mobile', numeric: false, disablePadding: true, label: 'Mobile', isSorting: false},
  { id: 'role', numeric: false, disablePadding: true, label: 'Role', isSorting: true},
];


interface EnhancedTableProps {
  classes: ReturnType<typeof useStyles>;
  numSelected: number;
  onRequestSort: (event: React.MouseEvent<unknown>, property: keyof rowData) => void;
  onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
  order: Order;
  orderBy: string;
  rowCount: number;
}

function EnhancedTableHead(props: EnhancedTableProps) {
  const { classes, numSelected, onRequestSort, onSelectAllClick, order, orderBy, rowCount } = props;
  const createSortHandler = (property: keyof rowData, isSorting:boolean) => (event: React.MouseEvent<unknown>) => {
    if(!isSorting){
      onRequestSort(event, property);
    }
  };

  return (
    <TableHead>
    <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{ 'aria-label': 'select all desserts' }}
            color='default'
          />
        </TableCell>
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
      height: '100%',
      display: 'flex',
      overflow: 'hidden',
      '& .MuiPaper-elevation1':{
        boxShadow: 'none'
      }
    },
    container:{
      width: '100%',
      height: '100%',
      margin: '10px 0px',
    },
    paper: {
      width: '100%',
      marginBottom: theme.spacing(0),
      display:"flex"
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

    disable:{
      fontSize:'11px',
      color: '#33333380'
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
  const [projectUsers, setProjectUsers] = useState<Array<any>>([]);
  const [selected, setSelected] = React.useState<string[]>([]);
  const [rolesLists, setRolesLists] = useState<any>();

  useEffect(() => {
      setProjectUsers(props?.tenantMembersData);
      setRolesLists(props?.rolesList);
      const newSelecteds = props?.tenantMembersData.filter((n: any) => n.isPartOf);
      setSelected(newSelecteds.map((n: any) => n.email));
  }, [props?.tenantMembersData]);
  

  const handleRequestSort = (event: React.MouseEvent<unknown>, property: keyof rowData) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    props.selectAll(event.target.checked);
  };

  
  const handleClick = (event: any, row: any) => {
    props.toggleUserSelection(event.target.checked,row.userId);
  };

  const handleRoleChange = (e: any, row: any) => {
    props.changeInRole(e.target.value,row.userId);
  }

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
              numSelected={selected.length}
              onSelectAllClick={handleSelectAllClick}
              classes={classes}
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
              rowCount={projectUsers.length}
            />
            {
                projectUsers.length>0 ? (
                  <TableBody className="tenantMembers">
                    {stableSort(projectUsers, getComparator(order, orderBy))
                      .map((row: any, index: number) => {
                        const labelId = `enhanced-table-checkbox-${index}`;
                        return (
                          <TableRow key={row?.userId}>
                             <TableCell padding="checkbox">
                                <Checkbox
                                  onClick={(event) => handleClick(event, row)}
                                  checked={row.isPartOf}
                                  inputProps={{ 'aria-labelledby': labelId }}
                                  color='default'
                                />
                            </TableCell>
                            <TableCell className={row.isPartOf ? classes.cell : classes.disable}>
                              <Tooltip title={row?.firstName} aria-label="first name">
                                <label>
                                  { (row?.firstName && row?.firstName.length > 30) ? `${row?.firstName.slice(0,18)} . . .`: (row?.firstName?row.firstName:"--") }
                                </label>
                              </Tooltip>
                            </TableCell>
                            <TableCell className={row.isPartOf ? classes.cell : classes.disable} >
                                <Tooltip title={row?.lastName} aria-label="last name">
                                    <label>
                                    { (row.lastName && row?.lastName.length > 30) ? `${row?.lastName.slice(0,18)} . . .`: (row?.lastName?row.lastName:"--") }
                                    </label>
                                </Tooltip>
                            </TableCell>
                            <TableCell className={row.isPartOf ? classes.cell : classes.disable} >
                              <Tooltip title={row?.company} aria-label="company name">
                                    <label>
                                    { (row.lastName && row?.company.length > 30) ? `${row?.company.slice(0,18)} . . .`: row?.company }
                                    </label>
                              </Tooltip>
                            </TableCell>
                            <TableCell className={row.isPartOf ? classes.cell : classes.disable} >
                              <Tooltip title={row?.email} aria-label="email name">
                                    <label>
                                    { (row.lastName && row?.email.length > 30) ? `${row?.email.slice(0,18)} . . .`: row?.email }
                                    </label>
                              </Tooltip>
                            </TableCell>
                            <TableCell className={row.isPartOf ? classes.cell : classes.disable} >{row?.mobile}</TableCell>
                            <TableCell className={row.isPartOf ? classes.cell : classes.disable} >
                                {/* <Select
                                    value={row?.role}
                                    id={`user-role-${row?.user?.id}`}
                                    fullWidth
                                    autoComplete='off'
                                    placeholder="select a value"
                                    MenuProps={{ classes: { paper: popClass.root } }}
                                    onChange={(e: any) => handleRoleChange(e, row)}
                                    disabled={!row.isPartOf}
                                >
                                    {
                                        rolesLists?.map((role: any) => (
                                            <MenuItem key={role.id} value={role.id}>{role.role}</MenuItem>
                                        ))
                                    }
                                </Select>  */}
                                <ProjectUserRoleSelect roles={rolesLists} changeInRole={handleRoleChange} currentUser={row}/>
                                  {
                                    (row.isPartOf && row?.role === -1) ? (
                                      <span className="tenantMembers__error-wrap">
                                        Select a project role 
                                      </span>
                                    ) : ''
                                  }
                                
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
