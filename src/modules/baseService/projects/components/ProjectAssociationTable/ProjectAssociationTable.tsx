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
import { Tooltip ,IconButton, } from '@material-ui/core';
import './ProjectAssociationTable.scss';
import { Typography } from '@material-ui/core';
import NoDataMessage from '../../../../shared/components/NoDataMessage/NoDataMessage';
import { stateContext } from '../../../../root/context/authentication/authContext';
import { match, useHistory, useRouteMatch } from 'react-router-dom';
import EmailIcon from "@material-ui/icons/Email";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ResendInvite from '../../../../baseService/teammates/components/resendInvite';


export interface Params {
  projectId: string;
}

interface tableHeader {
  firstName: string,
  lastName: string,
  company: string,
  email: string,
  mobile: string,
  role: string,
  status:any,
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
  status:number|string
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
    status:number|string
): rowData {
  return { firstName, lastName, company, email, mobile, role, projectId, userId,status};
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
  // { id: 'company', numeric: false, disablePadding: true, label: 'Company', isSorting: false},
  { id: 'email', numeric: true, disablePadding: true, label: 'Email ', isSorting: false}, 
  { id: 'mobile', numeric: false, disablePadding: true, label: 'Mobile', isSorting: false},
  { id: 'role', numeric: false, disablePadding: true, label: 'Role', isSorting: false},
  {id:'status',numeric: false, disablePadding: true, label: 'Status', isSorting: false}
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
  const [selectedProject, setSelectedProject] = useState<any>();
  const [openInvite, setOpenInvite] = useState(false);
  const [currentEmail,setCurrentEmail] = useState('')
  const history = useHistory();
  const pathMatch:match<Params>= useRouteMatch();

  useEffect(() => {
      setProjectList(props.projectMembersData)
  }, [props.projectMembersData])

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
        row?.company, 
        row?.email,
        row?.phone, 
        row?.role, 
        row?.projectId,
        row?.userId,
        row?.status
      ))
  });
  const handleInvite=(row:any)=>{
    setOpenInvite(true)
    setCurrentEmail(row.email)
  }

  return (
    <div className={classes.root}>
      <ResendInvite
        open={openInvite}
				closeInvite={() => setOpenInvite(false)}
        emails={currentEmail}
        />
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
															<Tooltip
																title={row?.firstName}
																aria-label="first name"
															>
																<label>
																	{row?.firstName && row?.firstName.length > 30
																		? `${row?.firstName.slice(0, 18)} . . .`
																		: row?.firstName
																		? row.firstName
																		: '--'}
																</label>
															</Tooltip>
														</TableCell>
														<TableCell className={classes.cell}>
															<Tooltip
																title={row?.lastName}
																aria-label="last name"
															>
																<label>
																	{row.lastName && row?.lastName.length > 30
																		? `${row?.lastName.slice(0, 18)} . . .`
																		: row?.lastName
																		? row.lastName
																		: '--'}
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
														<TableCell className={classes.cell}>
															<Tooltip
																title={row?.email}
																aria-label="user email"
															>
																<label>
																	{row.lastName && row?.email.length > 30
																		? `${row?.email.slice(0, 18)} . . .`
																		: row?.email
																		? row.email
																		: '--'}
																</label>
															</Tooltip>
														</TableCell>
														<TableCell className={classes.cell}>
															{row.mobile ? row.mobile : '--'}
														</TableCell>
														<TableCell className={classes.cell}>
															<Tooltip
																title={row?.role}
																aria-label="user role"
															>
																<label>
																	{row.role
																		? row.role.length > 30
																			? `${row.role.slice(0, 26)}..`
																			: row.role
																		: '--'}
																</label>
															</Tooltip>
														</TableCell>
														<TableCell>
															<Tooltip
																title={
																	row.status === 2 ? (
																		"Reinvite"
																		) : row.status === 3 ? (
																	"Active"
																	) : ''
																}
																placement="bottom"
															>
                                <label>
																{row.status == 2 ? (
																	<IconButton onClick={() => handleInvite(row)}>
																		<EmailIcon
																			className="teammates__editIconSize"
																			style={{ color: 'black', height:"2rem" , width:"2rem" }}
																		/>
																	</IconButton>
																) : row.status == 3 ? (
                                  <IconButton>
																	<CheckCircleIcon style={{ color: 'black', height:"2rem" , width:"2rem" }} />
                                  </IconButton>
																) : (
																	''
																)}
                                
                                </label>
															</Tooltip>
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
