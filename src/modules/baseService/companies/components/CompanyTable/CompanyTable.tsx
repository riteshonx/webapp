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
import EditIcon from "@material-ui/icons/Edit";
import './CompanyTable.scss';

import NoDataMessage from '../../../../shared/components/NoDataMessage/NoDataMessage';
import { stateContext } from '../../../../root/context/authentication/authContext';
import { match, useHistory, useRouteMatch } from 'react-router-dom';
import { updateTenantCompany } from '../../../roles/utils/permission';
import { validateTableCell } from '../../../../../utils/helper';

export interface Params {
  companyId: string;
}

interface tableHeader {
  name: string,
  contactInfo: string,
  address: string,
  trades: any,
  active: any,
  performanceRating:any,
  action: string,
}
interface rowData {
    name: string,
    contactInfo: string,
    address: string,
    trades: string,
    active: any,
    performanceRating:any,
    action: string,
    id: number,
    companyId: string
}

interface message {
  header: string,
  text: string,
  cancel: string,
  proceed: string,
}

const confirmMessage: message = {
  header: "Are you sure?",
  text: "If you delete this task, all data related to this task will be lost.",
  cancel: "Cancel",
  proceed: "Proceed",
}

const noDataMessage= 'No companies were found.';


function createData(
  name: string,
  contactInfo: string,
  address: string,
  trades: string,
  active: any,
  performanceRating:any,
  action: string,
  id: number,
  companyId: string
): rowData {
  return { name, contactInfo, address, trades, active, performanceRating,  action, id, companyId};
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
  { id: 'name', numeric: false,  disablePadding: true, label: 'Name', isSorting: false},
  { id: 'contactInfo', numeric: false, disablePadding: true, label: 'Contact Number', isSorting: false},
  { id: 'address', numeric: false, disablePadding: true, label: 'Address', isSorting: false},
  { id: 'trades', numeric: false, disablePadding: true, label: 'Trades', isSorting: false},
  { id: 'active', numeric: true, disablePadding: true, label: 'Status ', isSorting: false}, 
  { id: 'performanceRating', numeric: true, disablePadding: true, label: 'Performance Rating', isSorting: false},
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
        headCell.label!=='action'?(
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
        </TableCell>):(
          updateTenantCompany && <TableCell className={classes.headecell}
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
        )
      ))}
    </TableRow>
  </TableHead>
  );
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      marginTop: '25px',
      width: '100%',
      '& .MuiPaper-elevation1':{
        boxShadow: 'none'
      }
    },
    container:{
      height: 'calc(100vh - 250px)',
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
    },
    cursor:{
      cursor : "pointer",
      "&:hover":{
        backgroundColor:"#c8c8c842"
      }
    }
  }),
);

export default function EnhancedTable(props: any): any {
  const { state }:any = useContext(stateContext);
  const classes = useStyles();
  const [order, setOrder] = React.useState<Order>('asc');
  const [orderBy, setOrderBy] = React.useState<keyof rowData>('name');
  const [companyLists, setCompanyLists] = useState<Array<any>>([]);
  const [selectedCompanyt, setSelectedCompany] = useState<any>();
  const history = useHistory();
  const pathMatch:match<Params>= useRouteMatch();

  useEffect(() => {
    setCompanyLists(props.companyLists)
  }, [props.companyLists])

  const handleRequestSort = (event: React.MouseEvent<unknown>, property: keyof rowData) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const rows: any = [];
  const allTaskData: any = [];

  companyLists?.forEach((row:any) => {
      const contacts = row.contactInfo?.companyPhone ? row.contactInfo?.companyPhone : '';
     // const address = row.address ? `${row?.address?.city}, ${row?.address?.state}, ${row?.address?.country}, ${row?.address?.pin}` : ''
      const trades =row.trade?.length>0 ? row.trade?.toString(): '';
      const active = row.active ? 'Active' : 'Inactive';
      const address = row.addresses && row.addresses.length?(row.addresses[0].fullAddress?row.addresses[0].fullAddress:"--"):"--";
      const performanceRating = row.overallRating ?row.overallRating:"--"
    allTaskData.push(row) 
    rows?.push(createData(
      row.name, contacts, address, trades, active,performanceRating, ' ', row.id, row.companyId))
  });

  const editCompany = (row: rowData) => {
      setSelectedCompany(row);
      history.push(`/base/companies/${row?.id}/details`)
      props.UpdateCompany();
  }

  const view = (row: rowData) => {
    if(!updateTenantCompany){
      setSelectedCompany(row);
      history.push(`/base/companies/${row?.id}/details`)
      props.UpdateCompany();
    }
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
                          <TableRow className={classes.cursor } key={row.id} onClick={()=>view(row)}>
                            <TableCell className={classes.cell} onClick={() => editCompany(row)}>
                              <Tooltip title={row.name} aria-label="company name">
                                <label>
                                  { (row.name && row.name.length > 30) ? `${row.name.slice(0,18)}...`: (row.name?row.name:"--") }
                                </label>
                              </Tooltip>
                            </TableCell>
                            <TableCell className={classes.cell} onClick={() => editCompany(row)}>{validateTableCell(row?.contactInfo)}</TableCell>
                            <TableCell className={classes.cell} onClick={() => editCompany(row)}>{validateTableCell(row?.address)}</TableCell>
                            <TableCell className={classes.cell} onClick={() => editCompany(row)}>{validateTableCell(row.trades)}</TableCell>
                            <TableCell className={classes.cell} onClick={() => editCompany(row)}>{validateTableCell(row.active)}</TableCell>
                            <TableCell className={classes.cell} onClick={() => editCompany(row)}>{validateTableCell(row.performanceRating)}</TableCell>
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
