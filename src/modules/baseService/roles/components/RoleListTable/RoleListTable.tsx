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
import moment from 'moment';
import { Role, RoleTye } from '../../models/role';
import { Tooltip } from '@material-ui/core';
import { canCreateProjectRole, canCreateSystemtRole,
        canDeleteProjectRole,
        canDeleteSystemRole,
        canUpdateProjectRole, canUpdateSystemRole, canViewProjectRole } from '../../utils/permission';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import './RoleListTable.scss';
import { CustomMenuRoleList } from '../CustomMenuItem/CustomMenuRoleList';
import { stateContext } from '../../../../root/context/authentication/authContext';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import { validateTableCell } from '../../../../../utils/helper';

type Order = 'asc' | 'desc';

function descendingComparator(a: any, b: any, orderBy: keyof any) {
    if(typeof a[orderBy] === 'number'){
      if (b[orderBy] < a[orderBy]) {
        return -1;
      }
      if (b[orderBy] > a[orderBy]) {
        return 1;
      }
    } else if(typeof a[orderBy] === 'object'){
        if (new Date(b[orderBy]) < new Date(a[orderBy])) {
            return -1;
          }
          if (new Date(b[orderBy]) > new Date(a[orderBy])) {
            return 1;
          }
    }else{
      if (b[orderBy]?.toString().toLocaleLowerCase() < a[orderBy]?.toString().toLocaleLowerCase()) {
        return -1;
      }
      if (b[orderBy]?.toString().toLocaleLowerCase() > a[orderBy]?.toString().toLocaleLowerCase()) {
        return 1;
      }
    }
  
    return 0;
  }

function getComparator<Key extends keyof Role>(
  order: Order,
  orderBy: Key,
): (a: { [key in Key]: number | string }, b: { [key in Key]: number | string }) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort<T>(array: Role[], comparator: (a: any, b: any) => number) {
  const stabilizedThis = array.map((el, index) => [el, index] as [Role, any]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

interface HeadCell {
  disablePadding: boolean;
  id: keyof Role;
  label: string;
  numeric: boolean;
  sorting: boolean
}

interface EnhancedTableProps {
  onRequestSort: (event: React.MouseEvent<unknown>, property: keyof Role) => void;
  order: Order;
  orderBy: string;
}

interface TableProps{
  rows: Array<Role>,
  roleType: RoleTye,
  editRole: (Event: Role)=> void,
  deleteRole: (event: Role)=> void,
  copyRole: (event: Role)=> void,
  addRole: ()=> void,
  view: (event: Role)=> void,
  closeEditSystemRole:(argValue: boolean) => void,
  closeCreateProjectRole:(argValue: boolean) => void,
  closeCreateSystemRole :(argValue: boolean) => void,
  closeView :(argValue: boolean) => void,
}

/**
 * Head cell configuration
 */
const headCells: HeadCell[] = [
  { id: 'role', numeric: false, disablePadding: true, label: 'Role Name', sorting: true },
  // { id: 'description', numeric: false, disablePadding: true, label: 'Description', sorting: true },
  { id: 'createdAt', numeric: true, disablePadding: true, label: 'Date Created', sorting: true },
  { id: 'updatedAt', numeric: true, disablePadding: true, label: 'Date Updated', sorting: true },
  { id: 'actions', numeric: true, disablePadding: false, label: 'Actions',sorting: false  }
];

/**
 * Component to render headet cells of table 
 * @param props : EnhancedTableProps
 * @returns : RecatElement
 */
function EnhancedRoleTableHead(props: EnhancedTableProps) {
  const { order, orderBy, onRequestSort } = props;
  const createSortHandler = (property: HeadCell) => (event: React.MouseEvent<unknown>) => {
    if(property.sorting){
      onRequestSort(event, property.id);
    }
  };

  return (
    <TableHead>
      <TableRow>
        {headCells.map(((headCell: HeadCell, index: number) => (
          headCell.label!=='Actions'?(
          <TableCell className={`${index!==headCells.length-1?"RolesTable__headecell":"RolesTable__headecelllast"}`}
            key={headCell.id}
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
                <span className="RolesTable__visuallyHidden">
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </span>
              ) : null}
            </TableSortLabel>
          </TableCell>):(
            canUpdateSystemRole?(
            <TableCell className={`${index!==headCells.length-1?"RolesTable__headecell":"RolesTable__headecelllast"}`}
            key={headCell.id}
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
                <span className="RolesTable__visuallyHidden">
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </span>
              ) : null}
            </TableSortLabel>
          </TableCell>):(  canUpdateProjectRole && (
            <TableCell className={`${index!==headCells.length-1?"RolesTable__headecell":"RolesTable__headecelllast"}`}
            key={headCell.id}
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
                <span className="RolesTable__visuallyHidden">
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </span>
              ) : null}
            </TableSortLabel>
          </TableCell>
          ))
          )
        )))}
      </TableRow>
    </TableHead>
  );
}


/**
 * Component to render Table of Form templates
 * @param props : TableProps
 * @returns : ReactElement
 */
export default function EnhancedRoleTable({rows, deleteRole, roleType, copyRole, editRole, addRole, view, closeEditSystemRole,closeCreateProjectRole,closeCreateSystemRole,closeView}:TableProps): ReactElement {
  const [order, setOrder] = React.useState<Order>('asc');
  const [orderBy, setOrderBy] = React.useState<keyof Role>('role');
  const {state }:any = useContext(stateContext);

  const handleRequestSort = (event: React.MouseEvent<unknown>, property: keyof Role) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const edit= (e:React.MouseEvent<HTMLButtonElement, MouseEvent>,argItem: Role)=>{
    e.stopPropagation();
    e.preventDefault();
    editRole(argItem);
  }

  const deletSelectedeRole=(e:React.MouseEvent<HTMLButtonElement, MouseEvent>,argItem: Role)=>{
    e.stopPropagation();
    e.preventDefault();
    deleteRole(argItem);
  }

  const copy= (e:React.MouseEvent<HTMLButtonElement, MouseEvent>,row: Role)=>{
    copyRole(row);
  }

  const addNewRole=()=>{
    addRole();
    closeEditSystemRole(false);
    closeView(false)
  }

  const viewRole=(argRole: Role)=>{
    view(argRole);
    closeCreateProjectRole(false);
    closeCreateSystemRole(false);
  }

  return (
    <div className="RolesTable__root">
          <Paper className="RolesTable__paper">
          <TableContainer className="RolesTable__container">
              <Table
                className="RolesTable__table"
                aria-labelledby="tableTitle"
                size={'medium'}
                aria-label="enhanced table"
                stickyHeader
              >
                <EnhancedRoleTableHead
                  order={order}
                  orderBy={orderBy}
                  onRequestSort={handleRequestSort}
                />
                {
                  rows.length > 0 ? (
                    <TableBody>
                    {stableSort(rows, getComparator(order, orderBy)).map((row:Role, index: number) => {
                        return (
                          <TableRow key={`${row.role}-${index}`}
                            className="RolesTable__row">
                            <TableCell className="RolesTable__cell" onClick={()=>viewRole(row)}>
                                <Tooltip title={row.role} aria-label="Role Name">
                                    <div className="RolesTable__cell__namefield" data-testid={`role-name-${index}`}>
                                        {row.role.length>35?`${row.role.slice(0,33)} . . .`:validateTableCell(row.role)}</div>
                                </Tooltip>
                            </TableCell>
                            {/* <TableCell className="RolesTable__cell" onClick={()=>viewRole(row)}>
                                <Tooltip title={row.description} aria-label="Role description">
                                   <label> {row.description.length>35?`${row.description.slice(0,33)} . . .`:row.description}</label>
                                </Tooltip>
                            </TableCell> */}
                            <TableCell className="RolesTable__cell" onClick={()=>viewRole(row)}>
                                <Tooltip title={moment(row.createdAt).format('DD MMM YYYY')} aria-label="role Created at">
                                   <label>  {validateTableCell(moment(row.createdAt).format('DD MMM YYYY'))}</label>
                                </Tooltip>
                            </TableCell>
                            <TableCell className="RolesTable__cell" onClick={()=>viewRole(row)}>
                                <Tooltip title={moment(row.updatedAt).format('DD MMM YYYY')} aria-label="role updated at">
                                   <label>  {validateTableCell(moment(row.updatedAt).format('DD MMM YYYY'))}</label>
                                </Tooltip>
                            </TableCell>
                            {canUpdateSystemRole && roleType=== RoleTye.tenant?(
                                    <TableCell className="RolesTable__actioncell" align="right" data-testid={`role-action-${index}`}>
                                          {/* <CustomMenuRoleList deleteRole={deletSelectedeRole}  row={row} 
                                              index={index} 
                                              roleType={roleType}/> */}
                                          {canDeleteSystemRole && !row.systemGenerated &&(
                                              <Tooltip title={`Delete ${row.role}`} aria-label="delete role">
                                                  <IconButton onClick={(e)=>deletSelectedeRole(e,row)} data-testid={`role-copy-${index}`}> 
                                                      <DeleteIcon className="RolesTable__cellicon"/> 
                                                  </IconButton>
                                              </Tooltip>
                                          )}
                                           {/* {canUpdateSystemRole && !row?.systemGenerated  && 
                                            (<Tooltip title={`Edit ${row.role}`} aria-label="EditRole">
                                              <IconButton  data-testid={`role-edit-${index}`} onClick={(e)=>edit(e,row)}> 
                                                  <EditIcon className="RolesTable__cellicon"/> 
                                              </IconButton>
                                          </Tooltip>)} */}
                                          {canCreateSystemtRole &&(
                                          <Tooltip title={`Copy ${row.role}`} aria-label="Copy role">
                                            <IconButton onClick={(e)=>copy(e,row)} data-testid={`role-copy-${index}`}> 
                                                <FileCopyIcon className="RolesTable__cellicon"/> 
                                            </IconButton>
                                          </Tooltip>)}
                                      </TableCell>
                            ):( canUpdateProjectRole && roleType=== RoleTye.project &&
                                <TableCell className="RolesTable__actioncell" align="right" data-testid={`role-action-${index}`}>
                                      {canDeleteProjectRole && !row.systemGenerated &&(
                                          <Tooltip title={`Delete ${row.role}`} aria-label="Copy role">
                                            <IconButton onClick={(e)=>deletSelectedeRole(e,row)} data-testid={`role-copy-${index}`}> 
                                                <DeleteIcon className="RolesTable__cellicon"/> 
                                            </IconButton>
                                        </Tooltip>
                                      )}
                                      {/* {canUpdateProjectRole  && !row?.systemGenerated &&(  <Tooltip title={`Edit ${row.role}`} aria-label="editRole">
                                        <IconButton  data-testid={`role-copy-${index}`} onClick={(e)=>edit(e,row)}> 
                                            <EditIcon className="RolesTable__cellicon"/> 
                                        </IconButton>
                                       </Tooltip>)} */}
                                      {canCreateProjectRole &&(
                                        <Tooltip title={`Copy ${row.role}`} aria-label="Copy role">
                                                <IconButton onClick={(e)=>copy(e,row)} data-testid={`role-copy-${index}`}> 
                                                    <FileCopyIcon className="RolesTable__cellicon"/> 
                                                </IconButton>
                                      </Tooltip>)}
                                    {/* <CustomMenuRoleList 
                                        deleteRole={deletSelectedeRole} 
                                        row={row} 
                                        index={index} 
                                        roleType={roleType}/> */}
                                </TableCell>
                            )}
                          </TableRow>
                        );
                      })}
                      {roleType === RoleTye.tenant?(
                        canCreateSystemtRole && (<TableRow className="RolesTable__row" onClick={addNewRole}>
                        <TableCell className="RolesTable__row__addRole" colSpan={headCells.length}>
                        <AddIcon className="RolesTable__row__addRole__icon"/> 
                        <span className="RolesTable__row__addRole__text">Create a New Role</span></TableCell>
                    </TableRow>)
                      ):( canCreateProjectRole && (<TableRow className="RolesTable__row" onClick={addNewRole}>
                      <TableCell className="RolesTable__row__addRole" colSpan={headCells.length}>
                      <AddIcon className="RolesTable__row__addRole__icon"/> 
                      <span className="RolesTable__row__addRole__text">Create a New Role</span></TableCell>
                  </TableRow>))}
                  </TableBody>
                  ):!state.isLoading ?(
                    <TableBody>
                       <TableRow className="RolesTable__row">
                          <TableCell className="RolesTable__row__nodata" colSpan={headCells.length}>There are no active Roles</TableCell>
                      </TableRow>
                    </TableBody>
                  ):("")}
              </Table>
            </TableContainer>
          </Paper>
    </div>
  );
}
