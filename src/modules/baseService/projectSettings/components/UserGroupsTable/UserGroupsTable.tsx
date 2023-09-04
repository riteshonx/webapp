import React, { ReactElement, useContext } from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Paper from '@material-ui/core/Paper';
import EditIcon from '@material-ui/icons/Edit';
import IconButton from '@material-ui/core/IconButton';
import { Tooltip } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import './UserGroupsTable.scss';
import { stateContext } from '../../../../root/context/authentication/authContext';
import {Order, getComparator, stableSort} from '../../../../../utils/helper';
import { projectDetailsContext } from '../../../projects/Context/ProjectDetailsContext';

interface HeadCell {
  disablePadding: boolean;
  id: string;
  label: string;
  numeric: boolean;
  sorting: boolean;
  hidden:boolean
}

interface EnhancedTableProps {
  onRequestSort: (event: React.MouseEvent<unknown>, property: keyof any) => void;
  order: Order;
  orderBy: any;
  headCells:HeadCell[]
}

interface TableProps{
  rows: Array<any>,
  editUserGroup:(argValue: any)=>any,
  deleteUserGroup:(argValue: any)=>any
}


/**
 * Component to render headet cells of table 
 * @param props : EnhancedTableProps
 * @returns : RecatElement
 */
function EnhancedUserGroupTableHead(props: EnhancedTableProps) {
  const { order, orderBy, onRequestSort,headCells } = props;
  const {projectDetailsState}: any = useContext(projectDetailsContext);
  const createSortHandler = (property: HeadCell) => (event: React.MouseEvent<unknown>) => {
    if(property.sorting){
      onRequestSort(event, property.id);
    }
  };

  return (
    <TableHead>
      <TableRow>
        {headCells.map(((headCell: HeadCell, index: number) => (
          !headCell.hidden ? <TableCell className={`${index!==headCells.length-1?"usergroupTable__headecell":"usergroupTable__headecelllast"}`}
            key={`${headCell.id}`}
            align={headCell.id==='actions'?'right':'left'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel data-testid={`usergroup-${headCell.id}-sort`}
              active={orderBy === headCell.id && headCell.sorting}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell)}
              hideSortIcon={!headCell.sorting}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <span className="usergroupTable__visuallyHidden">
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
export default function EnhancedUserGroupTable({rows, editUserGroup, deleteUserGroup}:TableProps): ReactElement {
  const [order, setOrder] = React.useState<Order>('asc');
  const [orderBy, setOrderBy] = React.useState<keyof any>('groupName');
  const {state }:any = useContext(stateContext);
  const {projectDetailsState}: any = useContext(projectDetailsContext);

  const handleRequestSort = (event: React.MouseEvent<unknown>, property: keyof any) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };
  const headCells: HeadCell[] = [
    { id: 'groupName', numeric: false, disablePadding: true, label: 'Group name', sorting: true ,hidden:false},
    { id: 'description', numeric: false, disablePadding: true, label: 'Description', sorting: true ,hidden:false},
    { id: "createdBy", numeric: false, disablePadding: true, label: 'Created by', sorting: true ,hidden:false},
    { id: 'teammates', numeric: true, disablePadding: true, label: 'Teammates', sorting: true ,hidden:false},
    { id: 'actions', numeric: true, disablePadding: false, label: 'Actions',sorting: false ,hidden:!projectDetailsState?.projectPermission.canDeleteUserGroup }
  ];


  const deleteCurrentUserGroup =(e:React.MouseEvent<HTMLButtonElement, MouseEvent>,argItem: any)=>{
    e.stopPropagation();
    e.preventDefault();
    deleteUserGroup(argItem);
  }

  const viewUserList=  (argItem: any)=>{
    editUserGroup(argItem);
  }


  return (
    <div className="usergroupTable__root">
          <Paper className="usergroupTable__paper">
          <TableContainer className="usergroupTable__container">
              <Table
                className="usergroupTable__table"
                aria-labelledby="tableTitle"
                size={'medium'}
                aria-label="enhanced table"
                stickyHeader
              >
                <EnhancedUserGroupTableHead
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
                          <TableRow key={`${row.groupName}-${index}`}
                            className="usergroupTable__row">
                            <TableCell className="usergroupTable__cell" onClick={()=>viewUserList(row)}>
                                <Tooltip title={row.groupName} aria-label="User group Name">
                                    <div className="usergroupTable__cell__namefield" data-testid={`groupName-name-${index}`}>
                                        {row.groupName.length>35?`${row.groupName.slice(0,33)} . . .`:row.groupName}</div>
                                </Tooltip>
                            </TableCell>
                            <TableCell className="usergroupTable__cell" onClick={()=>viewUserList(row)}>
                                <Tooltip title={row.description} aria-label="User group description">
                                   <label> {row.description.length>35?`${row.description.slice(0,33)} . . .`:row.description}</label>
                                </Tooltip>
                            </TableCell>
                            <TableCell className="usergroupTable__cell" onClick={()=>viewUserList(row)}>
                                <Tooltip title={row.createdBy} aria-label="User group createdBy">
                                   <label> {row.createdBy}</label>
                                </Tooltip>
                            </TableCell>
                            <TableCell className="usergroupTable__cell" onClick={()=>viewUserList(row)}>
                                <Tooltip title={row.teammates} aria-label="User group teammates">
                                   <label> {row.teammates}</label>
                                </Tooltip>
                            </TableCell>
                            {projectDetailsState?.projectPermission.canDeleteUserGroup && <TableCell className="usergroupTable__actioncell" align="right" data-testid={`usergroup-action-${index}`}>                                  
                                        <Tooltip title={`Delete ${row.groupName}`} aria-label="Delete usergroup">
                                            <IconButton data-testid={`usergroup-delete-${row.id}`} onClick={(e)=>deleteCurrentUserGroup(e,row)}> 
                                                <DeleteIcon className="usergroupTable__cellicon"/> 
                                            </IconButton>
                                    </Tooltip>
                                </TableCell>}
                          </TableRow>
                        );
                      })}
                  </TableBody>
                  ):!state.isLoading ?(
                    <TableBody>
                       <TableRow className="usergroupTable__row">
                          <TableCell className="usergroupTable__row__nodata" 
                            colSpan={headCells.length}>No user groups were found.</TableCell>
                      </TableRow>
                    </TableBody>
                  ):("")}
              </Table>
            </TableContainer>
          </Paper>
    </div>
  );
}
