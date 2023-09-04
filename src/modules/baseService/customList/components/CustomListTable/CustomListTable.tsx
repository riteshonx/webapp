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
import DeleteIcon from '@material-ui/icons/Delete';
import moment from 'moment';
import { useHistory } from 'react-router-dom';
import { ConfigurationList } from '../../models/customList';
import { Tooltip } from '@material-ui/core';
import { canUpdateCustomList, canDeleteCustomList, canViewCustomList } from '../../utils/permission';
import './CustomListTable.scss';
import { stateContext } from '../../../../root/context/authentication/authContext';
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

function getComparator<Key extends keyof ConfigurationList>(
  order: Order,
  orderBy: Key,
): (a: { [key in Key]: number | string }, b: { [key in Key]: number | string }) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort<T>(array: ConfigurationList[], comparator: (a: any, b: any) => number) {
  const stabilizedThis = array.map((el, index) => [el, index] as [ConfigurationList, any]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

interface HeadCell {
  disablePadding: boolean;
  id: keyof ConfigurationList;
  label: string;
  numeric: boolean;
  sorting: boolean;
  isHidden:boolean
}

interface EnhancedTableProps {
  onRequestSort: (event: React.MouseEvent<unknown>, property: keyof ConfigurationList) => void;
  order: Order;
  orderBy: string;
  headCells:any;
}

interface TableProps{
  rows: Array<ConfigurationList>,
  deleteCustomList: (event: ConfigurationList)=> void,
  hasNonSytemGenaratedItem:boolean
}


/**
 * Component to render headet cells of table 
 * @param props : EnhancedTableProps
 * @returns : RecatElement
 */
function EnhancedTableHead(props: EnhancedTableProps) {
  const { order, orderBy, onRequestSort,headCells } = props;
  const createSortHandler = (property: HeadCell) => (event: React.MouseEvent<unknown>) => {
    if(property.sorting){
      onRequestSort(event, property.id);
    }
  };

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell:any) => (
         !headCell.isHidden ? (headCell.id!=='actions' ?(
          <TableCell className="customListTable__headecell"
            key={headCell.id}
            align="left"
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
                <span className="customListTable__visuallyHidden">
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </span>
              ) : null}
            </TableSortLabel>
          </TableCell>):(
            canUpdateCustomList &&  <TableCell className="customListTable__headecell"
            key={headCell.id}
            align="left"
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
                <span className="customListTable__visuallyHidden">
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </span>
              ) : null}
            </TableSortLabel>
          </TableCell>
          )):""
        ))}
      </TableRow>
    </TableHead>
  );
}


/**
 * Component to render Table of Form templates
 * @param props : TableProps
 * @returns : ReactElement
 */
export default function EnhancedTable({rows, deleteCustomList,hasNonSytemGenaratedItem}:TableProps): ReactElement {
  const [order, setOrder] = React.useState<Order>('asc');
  const [orderBy, setOrderBy] = React.useState<keyof ConfigurationList>('name');
  const {state }:any = useContext(stateContext);
  const history= useHistory();

  const handleRequestSort = (event: React.MouseEvent<unknown>, property: keyof ConfigurationList) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const editCustomList= (e:React.MouseEvent<HTMLButtonElement, MouseEvent>,argItem: ConfigurationList)=>{
    e.stopPropagation();
    e.preventDefault();
    history.push(`/base/customList/${argItem.id}`)
  }

  const deleteSelectedCustomList=(e:React.MouseEvent<HTMLButtonElement, MouseEvent>,row: ConfigurationList)=>{
    e.stopPropagation();
    e.preventDefault();
    deleteCustomList(row);
  }

  const viewCustomList=  (argItem: ConfigurationList)=>{
    if(canViewCustomList && !canUpdateCustomList){
      history.push(`/base/customList/view/${argItem.id}`)
    }else if(canUpdateCustomList){
      history.push(`/base/customList/${argItem.id}`)
    }
  }

  
  /**
 * Head cell configuration
 */
const headCells: HeadCell[] = [
  { id: 'name', numeric: false, disablePadding: true, label: 'List Name', sorting: true,isHidden:false },
  { id: 'configurationValues', numeric: false, disablePadding: true, label: 'No. Items', sorting: true,isHidden:false },
  { id: 'createdAt', numeric: true, disablePadding: true, label: 'Created on', sorting: true,isHidden:false },
  { id: 'updatedAt', numeric: true, disablePadding: true, label: 'Updated on', sorting: true,isHidden:false },
  { id: 'actions', numeric: true, disablePadding: false, label: 'Actions',sorting: false,isHidden:((!canDeleteCustomList || !hasNonSytemGenaratedItem)?true:false)}
];


  return (
    <div className="customListTable__root">
          <Paper className="customListTable__paper">
          <TableContainer className="customListTable__container">
              <Table
                className="customListTable__table"
                aria-labelledby="tableTitle"
                size={'medium'}
                aria-label="enhanced table"
                stickyHeader
              >
                <EnhancedTableHead
                  order={order}
                  orderBy={orderBy}
                  onRequestSort={handleRequestSort}
                  headCells = {headCells}
                />
                {
                  rows.length > 0 ? (
                    <TableBody>
                    {stableSort(rows, getComparator(order, orderBy)).map((row:ConfigurationList, index: number) => {
                        return (
                          <TableRow role="checkbox" key={`${row.name}-${index}`} 
                            className="customListTable__row">
                            <TableCell className="customListTable__cell" onClick={()=>viewCustomList(row)}>
                                <Tooltip title={row.name} aria-label="Customlist Name">
                                    <div className="customListTable__cell__namefield" data-testid={`customlist-name-${index}`}>
                                        {row.name.length>20?`${row.name.slice(0,18)} . . .`:validateTableCell(row.name)}</div>
                                </Tooltip>
                            </TableCell>
                            <TableCell className="customListTable__cell" onClick={()=>viewCustomList(row)}>
                                <Tooltip title={row.configurationValues} aria-label="customlist no. of Items">
                                    <div className="customListTable__cell__namefield" data-testid={`customlist-numberoffield-${index}`}>
                                        {validateTableCell(row.configurationValues)}</div>
                                </Tooltip>
                            </TableCell>
                            <TableCell className="customListTable__cell" onClick={()=>viewCustomList(row)}>
                                <Tooltip title={moment(row.createdAt).format('DD MMM YYYY')} aria-label="customlist Created at">
                                   <label>  {validateTableCell(moment(row.createdAt).format('DD MMM YYYY'))}</label>
                                </Tooltip>
                            </TableCell>
                            <TableCell className="customListTable__cell" onClick={()=>viewCustomList(row)}>
                                <Tooltip title={moment(row.updatedAt).format('DD MMM YYYY')} aria-label="customlist updated at">
                                   <label>  {validateTableCell(moment(row.updatedAt).format('DD MMM YYYY'))}</label>
                                </Tooltip>
                            </TableCell>
                            {canDeleteCustomList && hasNonSytemGenaratedItem ?  ( <TableCell className="customListTable__cell" align="left" 
                              data-testid={`customlist-action-${index}`}>
                               { !row.systemGenerated &&    <Tooltip title={`Delete ${row.name}`} aria-label="number of fields">
                                        <IconButton  data-testid={`Delete-${index}`} onClick={(e)=>deleteSelectedCustomList(e,row)}> 
                                            <DeleteIcon className="customListTable__cellicon"/> 
                                        </IconButton>
                                    </Tooltip>}
                            </TableCell>):""}
                          </TableRow>
                        );
                      })}
                  </TableBody>
                  ):!state.isLoading ?(
                    <TableBody>
                        <TableRow className="customListTable__row">
                          <TableCell className="customListTable__row__nodata" 
                            colSpan={headCells.length}>There are no active lists</TableCell>
                      </TableRow>
                    </TableBody>
                  ):("")}
              </Table>
            </TableContainer>
          </Paper>
    </div>
  );
}
