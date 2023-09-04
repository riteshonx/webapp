import React, { ReactElement, useContext, useEffect } from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Paper from '@material-ui/core/Paper';
import { Checkbox, Tooltip } from '@material-ui/core';
import './ProjectUserListTable.scss';
import { stateContext } from '../../../../root/context/authentication/authContext';
import {Order, getComparator, stableSort} from '../../../../../utils/helper';
import { Avatar } from '@material-ui/core';


interface HeadCell {
  disablePadding: boolean;
  id: string;
  label: string;
  numeric: boolean;
  sorting: boolean
}

interface EnhancedTableProps {
  onRequestSort: (event: React.MouseEvent<unknown>, property: keyof any) => void;
  order: Order;
  orderBy: any;
  numSelected: number;
  rowCount: number;
  onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

interface TableProps{
  rows: Array<any>,
  selectAll:(argValue: boolean)=> void,
  selectUser: (argValue: boolean, argUserId: any)=> void,
  type: string
}

/**
 * Head cell configuration
 */
const headCells: HeadCell[] = [
  { id: 'name', numeric: false, disablePadding: true, label: 'Name', sorting: true },
  { id: 'email', numeric: false, disablePadding: true, label: 'Email', sorting: true },
  { id: 'role', numeric: false, disablePadding: true, label: 'Role', sorting: true },
  { id: 'company', numeric: false, disablePadding: true, label: 'Company', sorting: false },
];

/**
 * Component to render headet cells of table 
 * @param props : EnhancedTableProps
 * @returns : RecatElement
 */
function EnhancedProjectUserListTableHead(props: EnhancedTableProps) {
  const { order, orderBy, onRequestSort } = props;
  const createSortHandler = (property: HeadCell) => (event: React.MouseEvent<unknown>) => {
    if(property.sorting){
      onRequestSort(event, property.id);
    }
  };

  return (
    <TableHead>
      <TableRow>
      <TableCell padding="checkbox" className="ProjectUserListTable__checkbox">
          <Checkbox
            indeterminate={props.numSelected > 0 && props.numSelected < props.rowCount}
            checked={props.rowCount > 0 && props.numSelected === props.rowCount}
            onChange={props.onSelectAllClick}
            inputProps={{ 'aria-label': 'select all desserts' }}
            color='default'
          />
        </TableCell>
        {headCells.map(((headCell: HeadCell, index: number) => (
          <TableCell className={`${index!==headCells.length-1?"ProjectUserListTable__headecell":"ProjectUserListTable__headecelllast"}`}
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
                <span className="ProjectUserListTable__visuallyHidden">
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </span>
              ) : null}
            </TableSortLabel>
          </TableCell>
        )))}
      </TableRow>
    </TableHead>
  );
}


/**
 * Component to render Table of Project Users
 * @param props : TableProps
 * @returns : ReactElement
 */
export default function ProjectUsersTable({rows, selectAll, selectUser}:TableProps): ReactElement {
  const [order, setOrder] = React.useState<Order>('asc');
  const [orderBy, setOrderBy] = React.useState<keyof any>('groupName');
  const {state }:any = useContext(stateContext);
  const [selected, setSelected] = React.useState(0);

  useEffect(() => {
    const selectedUsers= rows.filter((item: any)=> item.isSelected);
    setSelected(selectedUsers.length);
  }, [rows])

  const handleRequestSort = (event: React.MouseEvent<unknown>, property: keyof any) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    selectAll(event.target.checked);
  }

  const handleClick = (event: React.ChangeEvent<HTMLInputElement>, row: any) => {
    selectUser(event.target.checked,row);
  }


  return (
    <div className="ProjectUserListTable__root">
          <Paper className="ProjectUserListTable__paper">
          <TableContainer className="ProjectUserListTable__container">
              <Table
                className="ProjectUserListTable__table"
                aria-labelledby="tableTitle"
                size={'medium'}
                aria-label="enhanced table"
                stickyHeader
              >
                <EnhancedProjectUserListTableHead
                 numSelected={selected}
                 onSelectAllClick={handleSelectAllClick}
                 order={order}
                 orderBy={orderBy}
                 onRequestSort={handleRequestSort}
                 rowCount={rows.length}
                />
                {
                  rows.length > 0 ? (
                    <TableBody>
                    {stableSort(rows, getComparator(order, orderBy)).map((row:any, index: number) => {
                        const labelId = `enhanced-table-checkbox-${index}`;
                        return (
                          <TableRow key={`${row.name}-${index}`}
                            className="ProjectUserListTable__row">
                            <TableCell padding="checkbox" className="ProjectUserListTable__cell">
                              <Checkbox
                              data-testid={`check-usergroup-${row.id}`}
                                  onChange={(event) => handleClick(event, row)}
                                  checked={row.isSelected}
                                  inputProps={{ 'aria-labelledby': labelId }}
                                  color='default'
                              />
                            </TableCell>
                            <TableCell className="ProjectUserListTable__cell">
                                <Tooltip title={row.name} aria-label="User group Name">
                                    <div className="ProjectUserListTable__cell__namefield" data-testid={`name-name-${index}`}>
                                        {row.name.length>35?`${row.name.slice(0,33)} . . .`:row.name}</div>
                                </Tooltip>
                            </TableCell>
                            <TableCell className="ProjectUserListTable__cell">
                                <Tooltip title={row.email} aria-label="User group email">
                                   <label> {row.email.length>35?`${row.email.slice(0,33)} . . .`:row.email}</label>
                                </Tooltip>
                            </TableCell>
                            <TableCell className="ProjectUserListTable__cell">
                                <Tooltip title={row.role} aria-label="User group role">
                                   <label> {row.role && row.role.length>35?`${row.role.slice(0,33)} . . .`:row.role}</label>
                                </Tooltip>
                            </TableCell>
                            <TableCell className="ProjectUserListTable__cell__company">
                                  { row.company && row.company.map((item:any,i:any)=>{return (
                                    item.company &&
                                     <Tooltip key={`${item.companyId}-${i}`} title={item.company.name} aria-label="User group company">
                                       <div className = "userSelect__parent">
                                         <Avatar key ={`${item.companyId}`} className="userSelect__parent__icon" >
                                           {`${item.company.name[0]}`}</Avatar>
                                         <label key ={`${item.companyId}`} className="userSelect__parent__label__name"> 
                                         {item.company && item.company.name && item.company.name.length>12?
                                         `${item.company.name.slice(0,10)}...`:item.company.name}</label>
                                       </div>
                                     </Tooltip>
                                   ) })} 
                              </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                  ):!state.isLoading ?(
                    <TableBody>
                       <TableRow className="ProjectUserListTable__row">
                          <TableCell className="ProjectUserListTable__row__nodata" 
                            colSpan={headCells.length}>You must add atleast one user to create a user group. </TableCell>
                      </TableRow>
                    </TableBody>
                  ):("")}
              </Table>
            </TableContainer>
          </Paper>
    </div>
  );
}
