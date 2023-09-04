import React, { ReactElement, useContext, useEffect } from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Paper from '@material-ui/core/Paper';
import DeleteIcon from '@material-ui/icons/Delete';
import IconButton from '@material-ui/core/IconButton';
import {Order, getComparator, stableSort} from '../../../../../utils/helper';
import './UserGroupUsersTable.scss';
import { stateContext } from '../../../../root/context/authentication/authContext';
import { Avatar, Tooltip } from '@material-ui/core';
import { projectDetailsContext } from '../../../projects/Context/ProjectDetailsContext';

interface HeadCell {
  disablePadding: boolean;
  id: string;
  label: string;
  numeric: boolean;
  sorting: boolean;
  hidden:boolean;
}

interface EnhancedTableProps {
  onRequestSort: (event: React.MouseEvent<unknown>, property: keyof any) => void;
  order: Order;
  orderBy: any;
  headCells:any
}

interface TableProps{
  rows: Array<any>,
  removeUser:(argItem: any) => void,
  type: string
}


/**
 * Component to render headet cells of table 
 * @param props : EnhancedTableProps
 * @returns : RecatElement
 */
function EnhancedUserGroupUserListTableHead(props: EnhancedTableProps) {
  const { order, orderBy, onRequestSort,headCells } = props;
  const createSortHandler = (property: HeadCell) => (event: React.MouseEvent<unknown>) => {
    if(property.sorting){
      onRequestSort(event, property.id);
    }
  };

  return (
    <TableHead>
      <TableRow>
        {headCells.map(((headCell: HeadCell, index: number) => (
         !headCell.hidden? <TableCell className={`${index!==headCells.length-1?"userGroupUsersTable__headecell":"userGroupUsersTable__headecelllast"}`}
            key={`${headCell.id}`}
            align={headCell.id==='actions'?'right':'left'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel data-testid={`${headCell.id}-sort`}
              active={orderBy === headCell.id && headCell.sorting}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell)}
              hideSortIcon={!headCell.sorting}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <span className="userGroupUsersTable__visuallyHidden">
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </span>
              ) : null}
            </TableSortLabel>
          </TableCell>:""
        )))}
      </TableRow>
    </TableHead>
  );
}


/**
 * Component to render Table of User groups
 * @param props : TableProps
 * @returns : ReactElement
 */
 export default function UserGroupUsersTable({rows, removeUser, type}:TableProps): ReactElement {
    const [order, setOrder] = React.useState<Order>('asc');
    const [orderBy, setOrderBy] = React.useState<keyof any>('name');
    const {state }:any = useContext(stateContext);
    const {projectDetailsState}: any = useContext(projectDetailsContext);
  
    const handleRequestSort = (event: React.MouseEvent<unknown>, property: keyof any) => {
      const isAsc = orderBy === property && order === 'asc';
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(property);
    };
  
    const edit= (e:React.MouseEvent<HTMLButtonElement, MouseEvent>,argItem: any)=>{
      e.stopPropagation();
      e.preventDefault();
      removeUser(argItem);
    }

    /**
     * Head cell configuration
     */
    const headCells: HeadCell[] = [
      { id: 'name', numeric: false, disablePadding: true, label: 'Name', sorting: true ,hidden:false},
      { id: 'email', numeric: false, disablePadding: true, label: 'Email', sorting: true ,hidden:false},
      { id: 'role', numeric: false, disablePadding: true, label: 'Role', sorting: true ,hidden:false},
      { id: 'company', numeric: false, disablePadding: true, label: 'Company', sorting: false ,hidden:false},
      { id: 'action', numeric: false, disablePadding: true, label: 'Action', sorting: false ,hidden:!projectDetailsState?.projectPermission.canUpdateUserGroup},
    ];
  
  
    return (
      <div className="userGroupUsersTable__root">
            <Paper className="userGroupUsersTable__paper">
            <TableContainer className="userGroupUsersTable__container">
                <Table
                  className="userGroupUsersTable__table"
                  aria-labelledby="tableTitle"
                  size={'medium'}
                  aria-label="enhanced table"
                  stickyHeader
                >
                  <EnhancedUserGroupUserListTableHead
                   order={order}
                   orderBy={orderBy}
                   onRequestSort={handleRequestSort}
                   headCells = {headCells}
                  />
                  {
                    rows.length > 0 ? (
                      <TableBody>
                      {stableSort(rows, getComparator(order, orderBy)).map((row:any, index: number) => {
                          return (
                            <TableRow key={`${row.name}-${index}`}
                              className="userGroupUsersTable__row">
                              <TableCell className="userGroupUsersTable__cell">
                                  <Tooltip title={row.name} aria-label="User group Name">
                                      <div className="userGroupUsersTable__cell__namefield" data-testid={`name-name-${index}`}>
                                          {row.name.length>35?`${row.name.slice(0,33)} . . .`:row.name}</div>
                                  </Tooltip>
                              </TableCell>
                              <TableCell className="userGroupUsersTable__cell">
                                  <Tooltip title={row.email} aria-label="User group email">
                                     <label> {row.email.length>35?`${row.email.slice(0,33)} . . .`:row.email}</label>
                                  </Tooltip>
                              </TableCell>
                              <TableCell className="userGroupUsersTable__cell">
                                  <Tooltip title={row.role} aria-label="User group role">
                                     <label> {row.role && row.role.length>35?`${row.role.slice(0,33)} . . .`:row.role}</label>
                                  </Tooltip>
                              </TableCell>
                              <TableCell className="userGroupUsersTable__cell__company">
                                  { row.company && row.company.map((item:any,i:any)=>{return (
                                    item.company &&
                                     <Tooltip key={`${item.companyId}-${i}`} title={item.company.name} aria-label="User group company">
                                       <span className = "userSelect__parent">
                                         <Avatar key ={`${item.companyId}`} className="userSelect__parent__icon" >{`${item.company.name[0]}`}</Avatar>
                                         <label key ={`${item.companyId}`} className="userSelect__parent__label__name"> {item.company && item.company.name && item.company.name.length>12?`${item.company.name.slice(0,10)}...`:item.company.name}</label>
                                       </span>
                                     </Tooltip>
                                   ) })} 
                              </TableCell>
                              {projectDetailsState?.projectPermission.canUpdateUserGroup && <TableCell className="userGroupUsersTable__cell">
                                {projectDetailsState?.projectPermission.canUpdateUserGroup &&  type==='EDIT' &&
                                <Tooltip title={`Remove ${row.name}`} aria-label="User group email">
                                      <IconButton onClick={(e)=>edit(e,row)} disabled ={rows.length==1?true:false} data-testid={`edit-usergroup-user-${row.id}`}>
                                        <DeleteIcon className="userGroupUsersTable__cellicon"/>
                                      </IconButton>
                                  </Tooltip>}
                                {type==='CREATE' && projectDetailsState?.projectPermission.canCreateUserGroup  &&
                                <Tooltip title={`Remove ${row.name}`} aria-label="User group email">
                                      <IconButton onClick={(e)=>edit(e,row)}  disabled ={rows.length==1?true:false} data-testid={`delete-usergroup-user-${row.id}`}>
                                        <DeleteIcon/>
                                      </IconButton>
                                  </Tooltip>}
                              </TableCell>}
                            </TableRow>
                          );
                        })}
                    </TableBody>
                    ):!state.isLoading ?(
                      <TableBody>
                         <TableRow className="userGroupUsersTable__row">
                            <TableCell className="userGroupUsersTable__row__nodata" 
                              colSpan={headCells.length}>No users were found.</TableCell>
                        </TableRow>
                      </TableBody>
                    ):("")}
                </Table>
              </TableContainer>
            </Paper>
      </div>
    );
  }