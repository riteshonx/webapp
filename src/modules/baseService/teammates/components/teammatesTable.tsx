import React, { useState } from "react";
import {
  withStyles,
  createStyles,
  makeStyles,
  Theme
} from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import { validateTableCell } from "../../../../utils/helper";
import { useHistory } from "react-router-dom";
import {
  Tooltip,
  IconButton,
} from "@material-ui/core";
import EmailIcon from "@material-ui/icons/Email";
import ResendInvite from './resendInvite';
import { canUpdateUsers } from "src/services/permission";
// const TableCell = withStyles((theme: Theme) =>
//   createStyles({
    // root: {
    //   marginTop: '25px',
    //   width: '100%',
    //   '& .MuiPaper-elevation1':{
    //     boxShadow: 'none'
    //   }
    // },
    // container:{
    //   height: 'calc(100vh - 270px)',
    //   width: '100%',
    //   flexGrow: 1,
    //   padding: '0px 1px',
    //   overflow: 'auto'
    // },
    // paper: {
    //   width: '100%',
    //   marginBottom: theme.spacing(0),
    // },
    // head: {
    //   backgroundColor: "#f5f5f5",
    //   color: theme.palette.common.black,
    // },
//     body: {
//       fontSize: 11,
//     },
//   })
// )(TableCell);

const status: any = {
  1: "Deactivated",
  2: "Invited",
  3: "Active",
};


const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      marginTop: '25px',
      width: '100%',
      '& .MuiPaper-elevation1':{
        boxShadow: 'none'
      },
      fontSize : 11
    },
    container:{
      height: 'calc(100vh - 250px)',
      width: '100%',
      flexGrow: 1,
      padding: '0px 1px',
      overflow: 'auto',
      marginTop: "0"
    },
    paper: {
      width: '100%',
      marginBottom: theme.spacing(0),
    },
    table: {
      width: "100%",
      fontSize : 11
      // minWidth: 700,
    },
    head: {
      backgroundColor: "#f5f5f5",
      color: theme.palette.common.black,
    },
    body : {
      fontSize : 11
    },
    row:{
      cursor: "pointer",
      "&:hover":{
          backgroundColor: "#c8c8c842"
      }
    }
  }),
);




const head = [
  "First Name",
  "Last Name",
  "Company",
  "Email",
  "Mobile",
  "Address",
  "Role",
  "Status",
  "Reinvite"
];

export default function CustomizedTables(props: any) {
  const [openInvite, setOpenInvite] = useState(false);
  const [currentEmail,setCurrentEmail] = useState('')
  const classes = useStyles();
  const history = useHistory()
  const handleEditFromTable = (row : any) => {
      history.push(`/base/teammates/edit/${row.user.id}`);
  }
const handleInvite=(e:any,row:any)=>{
  e.stopPropagation();
  setOpenInvite(true);
  setCurrentEmail(row?.user?.email)
}
const closeInvite =()=>{
  setOpenInvite(false)
}

  return (
		<div className={classes.root}>
			<ResendInvite
				open={openInvite}
				closeInvite={() => closeInvite()}
				emails={currentEmail}
			/>
			<Paper className={classes.paper}>
				<TableContainer
					className={classes.container}
					component={Paper}
				>
					<Table
						stickyHeader
						className={classes.table}
						aria-label="customized table"
					>
						<TableHead className={classes.head}>
							<TableRow>
								{head.map((item: string, index: number) => (
									<TableCell
										key={index}
										style={{ fontSize: 12, fontWeight: 'bold' }}
										align={'left'}
									>
										{item}
									</TableCell>
								))}
							</TableRow>
						</TableHead>
						<TableBody>
							{props.teammates &&
								props.teammates.length !== 0 &&
								props.teammates.map((row: any, i: number) => (
									<TableRow
										onClick={() => handleEditFromTable(row)}
										className={classes.row}
										key={row?.user?.id}
									>
										<TableCell
											className={classes.body}
											align="left"
											component="th"
											scope="row"
										>
											{validateTableCell(row.user.firstName)}
										</TableCell>
										<TableCell
											className={classes.body}
											align="left"
											component="th"
											scope="row"
										>
											{validateTableCell(row.user.lastName)}
										</TableCell>
										<TableCell
											className={classes.body}
											align="left"
										>
											{row &&
												row?.companyAssociations &&
												row?.companyAssociations.length !== 0 &&
												row?.companyAssociations.map(
													(company: any, index: number) => (
														<div
															key={company?.company.id}
															style={{
																display: 'flex',
																flexDirection: 'column',
															}}
														>
															{validateTableCell(company.company.name)}
														</div>
													)
												)}
											{/* {row.companyAssociations[0].company.name} */}
										</TableCell>
										<TableCell
											className={classes.body}
											align="left"
										>
											{validateTableCell(row.user.email)}
										</TableCell>
										<TableCell
											className={classes.body}
											align="left"
										>
											{validateTableCell(row.user.phone)}
										</TableCell>
										<TableCell
											className={classes.body}
											align="left"
										>
											{validateTableCell(
												row.user.addresses.length > 0
													? row.user.addresses[0].fullAddress
													: ''
											)}
										</TableCell>
										<TableCell
											className={classes.body}
											align="left"
										>
											{validateTableCell(row?.tenantRole?.role)}
										</TableCell>
										<TableCell
											className={classes.body}
											align="left"
										>
											{validateTableCell(status[row.status])}
										</TableCell>

										<TableCell
											className={classes.body}
											align="left"
										>
											{row.status === 2 && (
												<Tooltip
													title="Reinvite"
													placement="bottom"
												>
													<IconButton
														onClick={(e: any) => handleInvite(e, row)}
													>
														<EmailIcon
															className="teammates__editIconSize"
															style={{ color: 'black',height:'2rem',width:'2rem' }}
														/>
													</IconButton>
												</Tooltip>
											)}
										</TableCell>
									</TableRow>
								))}
						</TableBody>
					</Table>
				</TableContainer>
			</Paper>
		</div>
	);
}
