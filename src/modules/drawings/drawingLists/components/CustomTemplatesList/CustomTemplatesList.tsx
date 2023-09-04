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
import './CustomTemplatesList.scss';
import { stateContext } from '../../../../root/context/authentication/authContext';
import Tooltip from '@material-ui/core/Tooltip';
import DeleteIcon from '@material-ui/icons/Delete';
import VisibilityIcon from '@material-ui/icons/Visibility';
import { templateFormatId } from 'src/modules/drawings/utils/drawingsConstant';
import ConfirmDialog from 'src/modules/shared/components/ConfirmDialog/ConfirmDialog';
import PreviewTemplateFormat from '../PreviewTemplateFormat/PreviewTemplateFormat';
import { setIsLoading } from 'src/modules/root/context/authentication/action';
import { client } from 'src/services/graphql';
import { FETCH_CUSTOM_TEMPLATE_DETAILS } from '../../graphql/queries/customFormatTemplate';
import { projectFeatureAllowedRoles } from 'src/utils/role';
import Notification,{ AlertTypes } from '../../../../shared/components/Toaster/Toaster';
import { setTemplateFieldFormat } from '../../context/DrawingLibDetailsAction';
import { DrawingLibDetailsContext } from '../../context/DrawingLibDetailsContext';
import NoDataMessage from 'src/modules/shared/components/NoDataMessage/NoDataMessage';
import moment from 'moment';
import EditIcon from '@material-ui/icons/Edit';
import { match, useHistory, useRouteMatch } from 'react-router-dom';
// import StarIcon from '@material-ui/icons/Star';

export interface Params {
  projectId: string;
}

interface message {
  header: string,
  text: string,
  cancel: string,
  proceed?: string
}

let confirmMessage: message 
interface tableHeader {
  name: string,
  createdBy: string,
  createdAt: string,
  action: string
}

interface rowData {
    name: string,
    createdBy: string,
    createdAt: string,
    action: string
}

const noDataMessage = "No data available";


function descendingComparator(a: any, b: any, orderBy: keyof any) {
    if (b[orderBy]?.toString()?.toLocaleLowerCase() < a[orderBy]?.toString()?.toLocaleLowerCase()) {
      return -1;
    }
    if (b[orderBy]?.toString()?.toLocaleLowerCase() > a[orderBy]?.toString()?.toLocaleLowerCase()) {
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
  { id: 'name', numeric: false,  disablePadding: true, label: 'Template Name', isSorting: false},
  { id: 'createdBy', numeric: false, disablePadding: true, label: 'Created By', isSorting: false},
  { id: 'createdAt', numeric: false, disablePadding: true, label: 'Created On', isSorting: false},
  { id: 'action', numeric: false, disablePadding: true, label: '', isSorting: true},
];


interface EnhancedTableProps {
    classes: ReturnType<typeof useStyles>;
    onRequestSort: (event: React.MouseEvent<unknown>, property: keyof rowData) => void;
    order: Order;
    orderBy: any;
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
      marginTop: '25px',
      width: '100%',
      '& .MuiPaper-elevation1':{
        boxShadow: 'none'
      }
    },
    container:{
      height: 'calc(100vh - 235px)',
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
      // minWidth: 750,
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
      // cursor : "pointer",
      "&:hover":{
        backgroundColor:"#c8c8c842"
      }
    }
  }),
);


export default function EnhancedTable(props: any): any {
  
    const history = useHistory();
    const {state, dispatch }:any = useContext(stateContext);
    const classes = useStyles();
    const [order, setOrder] = React.useState<Order>('asc');
    const [orderBy, setOrderBy] = React.useState<keyof any>('createdAt');
    const pathMatch:match<Params>= useRouteMatch();

    const [templateLists, setTemplateLists] = useState<Array<any>>([]);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<any>();
    const [isPreviewOpen, setIsPreviewOpen] = useState(false)
    const {DrawingLibDetailsDispatch}: any = useContext(DrawingLibDetailsContext);

    useEffect(() => {
      if(props?.templateFormatData){
        setTemplateLists(props?.templateFormatData);
        handleConfirmBoxClose();
      }
    }, [props?.templateFormatData]);

    const handleRequestSort = (event: React.MouseEvent<unknown>, property: keyof any) => {
      const isAsc = orderBy === property && order === 'asc';
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(property);
    };

    //clean up the template data
    useEffect(() => {
      return () => {
        DrawingLibDetailsDispatch(setTemplateFieldFormat(null));
      }
    }, [])

    const handlePreviewTemplate = (event: any, template: any) => {
      fetchCustomTemplateDetails(template)

    }

    const handleDeleteTemplate = (event: any, template: any) => {
      event.stopPropagation();
      event.preventDefault();

      if(template?.drawingUploadStatus?.length > 0 || template?.drawingSheets?.length > 0){
        confirmMessage = {
          header: "You can't delete this template",
          text: `This template is associated with the drawing file`,
          cancel: "Cancel",
        }
      }else{
        confirmMessage= {
          header: "Are you sure?",
          text: `If you delete this, all data related to this drawing will be lost.`,
          cancel: "Cancel",
          proceed: "Confirm",
        }
      }
      setSelectedTemplate(template);
      setConfirmOpen(true);
    }

    const handleConfirmBoxClose = () => {
      setSelectedTemplate(null);
      setConfirmOpen(false);
    }

    const deleteCustomTemplate = () => {
      props.deleteTemplate(selectedTemplate)
    }

    const closePreview = () => {
      DrawingLibDetailsDispatch(setTemplateFieldFormat(null));
      setIsPreviewOpen(false)
    }

    const handleEditTemplate = (e: any, row: any) => {
      history.push(`/drawings/projects/${pathMatch.params.projectId}/update-custom-template/${row.id}`);     
    }

    //fetch template details
    const fetchCustomTemplateDetails = async(templateData: any)=>{
        try{
            dispatch(setIsLoading(true));
            const customTempDetailsResponse = await client.query({
                query: FETCH_CUSTOM_TEMPLATE_DETAILS,
                variables:{
                  formatId: templateData.id,
                },
                fetchPolicy: 'network-only',
                context:{role: projectFeatureAllowedRoles.uploadDrawings, token: state.selectedProjectToken}
            });

            const drawingTemplateFieldData: any = [];
            let fieldData: any = {};

            if(customTempDetailsResponse?.data?.drawingTemFieldFormatAssociation.length > 0){
              customTempDetailsResponse?.data?.drawingTemFieldFormatAssociation.forEach((item: any) => {

                  const newItem= JSON.parse(JSON.stringify(item?.drawingTemplateField));

                  if( templateData.id === templateFormatId.US_CANADA && newItem.name === "Set_Title"){
                      newItem.isMandatory = true
                  }
                    drawingTemplateFieldData.push(newItem);
                })

                const versionFields = drawingTemplateFieldData?.filter((item: any) => item.groupType === "version_info");
                const sheetFields = drawingTemplateFieldData?.filter((item: any) => item.groupType === "sheet_info");

                fieldData = {
                    templateName : templateData.name,
                    templateId: templateData.id,
                    versionFieldData: versionFields,
                    sheetFieldData: sheetFields
                }
            }
            
            DrawingLibDetailsDispatch(setTemplateFieldFormat(fieldData));
            dispatch(setIsLoading(false));
            setIsPreviewOpen(true)
            
        }catch(error){
            console.log(error);
            Notification.sendNotification(error, AlertTypes.warn);
            dispatch(setIsLoading(false));
        }
    }

    const renderEditIcon = (row: any) => {
      return (
        row.id !== templateFormatId.US_CANADA && row.id !== templateFormatId.BS1192_UK &&
          row?.drawingUploadStatus?.length < 1 && row?.drawingSheets?.length < 1  ?  (
            <div className="templateAction__icon-wrapper">
                    <Tooltip title={'Edit'} aria-label="edit template">
                        <label>
                            <EditIcon className="mat-icon" 
                            onClick={(e: any) => handleEditTemplate(e, row) }/>
                        </label>
                    </Tooltip>
            </div>
          ): ('') 
      )
    }
  
    return (
      <>  
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
                    rowCount={templateLists.length}
                  />
                  {
                    templateLists?.length > 0 ? (
                      <TableBody>
                          {stableSort(templateLists, getComparator(order, orderBy))
                          .map((row: any) => {
                              return (
                              <TableRow className={classes.cursor } key={row.id}>
                                
                                <TableCell className={classes.cell}>
                                  <Tooltip title={row.name ? row.name.length > 25 ? `${row.name.toString().slice(0,18)} . . .`: 
                                            row.name.toString() : '-'} aria-label="createdBy">
                                      <label>
                                          {row.name ? row.name.length > 25 ? `${row.name.toString().slice(0,18)} . . .`: 
                                          row.name.toString() : '-'}
                                      </label>
                                  </Tooltip>
                                </TableCell>
                                
                                <TableCell className={classes.cell}>
                                    <label>
                                        {row.createdBy || '--'}
                                    </label>
                                </TableCell>

                                <TableCell className={classes.cell}>
                                    <label>
                                      { moment(row.createdAt).format('DD-MMM-YYYY').toString() || '--'}
                                    </label>
                                </TableCell>
                                <TableCell className={classes.cell}>
                                  <div className="templateAction">

                                    <div className="templateAction__icon-wrapper">
                                        <Tooltip title={'Preview'} aria-label="first name">
                                            <label>
                                                <VisibilityIcon className="mat-icon" 
                                                onClick={(e: any) => handlePreviewTemplate(e, row) }/>
                                            </label>
                                        </Tooltip>
                                    </div>

                                    {
                                     state?.projectFeaturePermissons?.canuploadDrawings && renderEditIcon(row)
                                    }

                                    {
                                      (state?.projectFeaturePermissons?.canuploadDrawings 
                                        && row.id !== templateFormatId.US_CANADA && row.id !== templateFormatId.BS1192_UK) && (
          
                                          <div className="templateAction__icon-wrapper">
                                                <Tooltip title={'Delete'} aria-label="first name">
                                                    <label>
                                                        <DeleteIcon className="mat-icon" 
                                                        onClick={(e: any) => handleDeleteTemplate(e, row) }/>
                                                    </label>
                                                </Tooltip>
                                            </div>
                                      )
                                    }

                                    {/* {
                                      (row.id === templateFormatId.US_CANADA || row.id === templateFormatId.BS1192_UK) && (
                                        <div className="templateAction__icon-wrapper">
                                            <Tooltip title={'Default Template'} aria-label="first name">
                                                <label>
                                                    <StarIcon className="mat-icon" />
                                                </label>
                                            </Tooltip>
                                        </div>
                                      )
                                    } */}


                                                            
                                  </div>
                                </TableCell>
                              </TableRow>
                              );
                          })}
                      </TableBody>
                    ): (
                        !state.isLoading && (
                          <TableBody>
                            <TableRow>
                              <TableCell colSpan={4} align={'center'}>
                                <NoDataMessage message={noDataMessage} />
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        ) 
                      )
                  }
              </Table>
            </TableContainer>
          </Paper>
        </div>
        <div>
          {/* confirm box for delete drawing */}
          {
                confirmOpen ? (
                    <ConfirmDialog open={confirmOpen} message={confirmMessage} 
                    close={handleConfirmBoxClose} proceed={deleteCustomTemplate} />
                ) : ('')
          }

          {
            isPreviewOpen && ( <PreviewTemplateFormat closePreview={closePreview}/>)
          }
        </div>
      </>

    );
}
