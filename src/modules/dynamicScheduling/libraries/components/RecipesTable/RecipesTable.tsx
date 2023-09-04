import { Tooltip } from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import Popover from '@material-ui/core/Popover';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Typography from '@material-ui/core/Typography';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { decodeExchangeToken } from '../../../../../services/authservice';
import { getUniqueRecipeName } from '../../../../../utils/helper';
import { stateContext } from '../../../../root/context/authentication/authContext';
import ConfirmDialog from '../../../../shared/components/ConfirmDialog/ConfirmDialog';
import NoDataMessage from '../../../../shared/components/NoDataMessage/NoDataMessage';
import RecipeDetailsContext from '../../../context/Recipe/RecipeContext';
import { RecipeContext } from '../../pages/ScheduleRecipes/ScheduleRecipes';
import CreateRecipeTemplate from '../CreateRecipeTemplate/CreateRecipeTemplate';
import './RecipesTable.scss';

export interface TenantAssociation {
  user: User;
}

export interface User {
  firstName: string;
  lastName: string;
}

export interface HolidayList {
  holidayName: string;
  year: number;
  date: Date;
}

interface iactionData {
  actionType: string;
  recipeData: null;
}

interface message {
  header: string;
  text: string;
  cancel: string;
  proceed: string;
}

const noDataMessage = 'No recipes were found';

function descendingComparator(a: any, b: any, orderBy: keyof any) {
  if (
    b[orderBy].toString().toLocaleLowerCase() <
    a[orderBy].toString().toLocaleLowerCase()
  ) {
    return -1;
  }
  if (
    b[orderBy].toString().toLocaleLowerCase() >
    a[orderBy].toString().toLocaleLowerCase()
  ) {
    return 1;
  }
  return 0;
}

type Order = 'asc' | 'desc';

function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key
): (
  a: { [key in Key]: number | string },
  b: { [key in Key]: number | string }
) => number {
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

const headCells = [
  {
    id: 'recipeName',
    numeric: false,
    disablePadding: true,
    label: 'Recipe Name',
    isSorting: false,
  },
  {
    id: 'description',
    numeric: false,
    disablePadding: false,
    label: 'Description',
    isSorting: false,
  },
  {
    id: 'projects',
    numeric: false,
    disablePadding: false,
    label: 'Projects Associated',
    isSorting: false,
  },
  {
    id: 'recipeType',
    numeric: false,
    disablePadding: false,
    label: 'Type',
    isSorting: false,
  },
  {
    id: 'duration',
    numeric: true,
    disablePadding: false,
    label: 'Duration',
    isSorting: true,
  },
  {
    id: 'createdByUserFullName',
    numeric: true,
    disablePadding: false,
    label: 'Created by',
    isSorting: false,
  },
  {
    id: 'id',
    numeric: true,
    disablePadding: false,
    label: ' ',
    isSorting: true,
  },
];

function EnhancedTableHead(props: any) {
  const { classes, order, orderBy, onRequestSort } = props;
  const createSortHandler =
    (property: any) => (event: React.MouseEvent<unknown>) => {
      onRequestSort(event, property);
    };

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            className={classes.headecell}
            key={headCell.id}
            align="left"
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
              hideSortIcon={headCell.isSorting}
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
      '& .MuiPaper-elevation1': {
        boxShadow: 'none',
      },
    },
    container: {
      height: 'calc(100vh - 290px)',
      width: '100%',
      flexGrow: 1,
      padding: '0px 1px',
      overflow: 'auto',
    },
    paper: {
      width: '100%',
      marginBottom: theme.spacing(0),
    },
    table: {
      minWidth: 750,
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
    cell: {
      fontSize: '11px',
      color: '#333333',
      wordBreak: 'break-word',
      minWidth: 100,
    },
    headecell: {
      fontSize: '12px',
      color: '#333333',
      fontWeight: 600,
    },
    cellicon: {
      fontSize: '16px',
      cursor: 'pointer',
      color: '#B0B0B0',
    },
  })
);

let projectsAssociatedTemp: any = [];
interface OpenProjectPopupType {
  openProjectPopup: boolean;
  recipe: {
    [key: string]: string | number;
  } | null;
}
export default function RecipeTable(props: any): any {
  const recipeData = useContext(RecipeContext);
  const [gridData, setGridData] = useState(recipeData);
  //const [projectsAssociated, setProjectsAssociated] = useState<any>([]);
  const [actionData, setActionData] = useState<iactionData>();

  const { state }: any = useContext(stateContext);
  const classes = useStyles();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [openProjectPopup, setOpenProjectPopup] =
    useState<OpenProjectPopupType>({
      openProjectPopup: false,
      recipe: null,
    });
  const history = useHistory();
  //  Action to display confirmation popup for edit or delete values 'edit'/'delete'
  const [action, setAction] = useState('delete');

  //  set confirmation messages header, messages, button title
  const [confirmMessage, setConfirmMessage] = useState({});
  const recipeDetailsContext = useContext(RecipeDetailsContext);
  const { setRecipeDetails, editRecipeMetaData } = recipeDetailsContext;
  const [selectedItem, setSelectedItem] = useState<any>();

  const [anchorEl, setAnchorEl] =
    React.useState<HTMLButtonElement | null>(null);

  const [order, setOrder] = React.useState<Order>('asc');
  const [orderBy, setOrderBy] = React.useState('recipeName');
  const [btnName, setBtnName] = useState({
    name: 'Update Recipe',
    submit: 'Update',
  });

  useEffect(() => {
    setGridData(recipeData);
  }, [recipeData]);

  const handleClick = (
    event: any,
    recipe: { [key: string]: string | number }
  ) => {
    let projectList = [];
    //event.preventDefault();
    // event.stopPropagation();
    setOpenProjectPopup({
      openProjectPopup: true,
      recipe,
    });
    projectsAssociatedTemp = [];
    projectList = props.projectsAssociatedList.filter(
      (item: any) => recipe.id == item.id
    );
    projectsAssociatedTemp = projectList[0]?.projects;
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (e: any) => {
    //e.preventDefault();
    //e.stopPropagation();
    if (openProjectPopup.openProjectPopup && openProjectPopup.recipe) {
      setAnchorEl(null);
      setOpenProjectPopup({
        openProjectPopup: false,
        recipe: null,
      });
    }
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: string
  ) => {
    // console.log('property:', property);
    if (property.trim() === '') {
      return;
    }
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleDialogOpen = async (recipe: any, actionParam: string) => {
    const data = { ...recipe };

    if (actionParam === 'edit') {
      //editRecipeMetaData("draft", decodeToken().userId, data?.id)
      setBtnName({
        name: 'Update Recipe',
        submit: 'Update',
      });
      history.push(`/scheduling/library/recipe-plan/${data?.id}`);
    } else if (actionParam === 'copy') {
      setBtnName({
        name: 'Create duplicate Recipe',
        submit: 'Duplicate',
      });
      const recipeNameList = await props.getSimilarRecipeNameList(
        recipe.recipeName
      );
      // console.log(recipeNameList);
      recipeNameList.push(recipe.recipeName);
      data.recipeName = getUniqueRecipeName(recipeNameList);
      // console.log(data);
    }
    setActionData({
      actionType: actionParam,
      recipeData: data,
    });
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handleConfirmBoxOpen = (row: any, action: string) => {
    if (action === 'delete') {
      setConfirmMessage({
        header: 'Are you sure?',
        text: 'If you delete this recipe, all data related to this recipe will be lost.',
        cancel: 'Cancel',
        proceed: 'Proceed',
      });
      setAction('delete');
    }
    setSelectedItem(row);
    setConfirmOpen(true);
  };

  const handleConfirmBoxClose = () => {
    setAction('delete');
    setConfirmOpen(false);
  };

  const deleteRecipe = (selectedItem: any) => {
    props.deleteRecipe(Number(selectedItem.id));
    setConfirmOpen(false);
  };

  const proceedConfirm = () => {
    if (action === 'delete') {
      deleteRecipe(selectedItem);
    }
    setConfirmOpen(false);
  };

  const refreshRecipeList = () => {
    props.refresh();
  };

  const rows: any = [];
  const allRecipeData: any = [];

  gridData.forEach((row: any) => {
    allRecipeData.push(row);
    rows.push({
      description: row.description,
      id: row.id,
      recipeName: row.recipeName,
      recipeType: row.recipeType,
      duration: row.duration,
      projects: row.projects,
      createdByUserFullName: row.createdByUserFullName,
    });
  });

  return (
    <div className={classes.root}>
      <Paper className={classes.paper}>
        <TableContainer className={classes.container}>
          <Table
            stickyHeader
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
            {gridData.length > 0 ? (
              <TableBody>
                {stableSort(rows, getComparator(order, orderBy)).map((row) => {
                  return (
                    <TableRow key={row.id} style={{ cursor: 'pointer' }}>
                      <TableCell
                        className={classes.cell}
                        onClick={() => handleDialogOpen(row, 'edit')}
                      >
                        {row.recipeName}
                      </TableCell>
                      <TableCell
                        className={classes.cell}
                        onClick={() => handleDialogOpen(row, 'edit')}
                      >
                        {row?.description == '' ? '-' : row.description}
                      </TableCell>
                      <TableCell
                        style={{ textAlign: 'center', width: '180px' }}
                        className={classes.cell}
                        // onMouseLeave={(event) => handleClose(event)}
                      >
                        <span
                          onClick={(e: any) => {
                            handleClick(e, {
                              id: row.id,
                              name: row.recipeName,
                            });
                          }}
                        >
                          {row.projects == 0 ? '-' : row.projects}
                        </span>
                      </TableCell>
                      <TableCell
                        className={classes.cell}
                        onClick={() => handleDialogOpen(row, 'edit')}
                      >
                        {row.recipeType}
                      </TableCell>
                      <TableCell
                        className={classes.cell}
                        onClick={() => handleDialogOpen(row, 'edit')}
                      >
                        {row.duration}
                        {row.duration == 1 ? ' day' : ' days'}
                      </TableCell>
                      <TableCell
                        className={classes.cell}
                        onClick={() => handleDialogOpen(row, 'edit')}
                      >
                        {row.createdByUserFullName}
                      </TableCell>
                      <TableCell className={classes.cell}>
                        {/* {true ? (
                            <Tooltip title="Copy">
                              <FileCopyIcon
                                data-testid={`edit-task-${row.id}`}
                                className="formlistTable__cellicon"
                                onClick={() =>
                                  handleDialogOpen(row, 'copy')
                                }
                              />
                            </Tooltip>
                          ) : (
                            ''
                          )} */}
                        {true &&
                        decodeExchangeToken().allowedRoles.includes(
                          'updateTenantTask'
                        ) ? (
                          <Tooltip title="Edit">
                            <EditIcon
                              data-testid={`edit-task-${row.id}`}
                              className="grid-view__card__info__action__icon"
                              onClick={() => handleDialogOpen(row, 'edit')}
                            />
                          </Tooltip>
                        ) : (
                          ''
                        )}
                        {true &&
                        decodeExchangeToken().allowedRoles.includes(
                          'deleteTenantTask'
                        ) ? (
                          <Tooltip title="Delete">
                            <DeleteIcon
                              data-testid={`delete-task-${row.id}`}
                              className="grid-view__card__info__action__icon"
                              onClick={() =>
                                handleConfirmBoxOpen(row, 'delete')
                              }
                            />
                          </Tooltip>
                        ) : (
                          ''
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            ) : !state.isLoading ? (
              <TableBody>
                <TableRow>
                  <TableCell colSpan={7} align={'center'}>
                    <NoDataMessage message={noDataMessage} />
                  </TableCell>
                </TableRow>
              </TableBody>
            ) : (
              ''
            )}
          </Table>
        </TableContainer>
        {dialogOpen ? (
          <CreateRecipeTemplate
            open={dialogOpen}
            recipeActionItem={actionData}
            btnName={btnName}
            refreshRecipeList={refreshRecipeList}
            close={handleDialogClose}
            createRecipe={props.createRecipe}
            editRecipe={props.editRecipe}
          />
        ) : (
          ''
        )}
        {confirmOpen ? (
          <ConfirmDialog
            open={confirmOpen}
            message={confirmMessage}
            close={handleConfirmBoxClose}
            proceed={proceedConfirm}
          />
        ) : (
          ''
        )}
        {projectsAssociatedTemp[0] != undefined && (
          <Popover
            id={id}
            open={open}
            anchorEl={anchorEl}
            className="formlistTable__projectsAssociated"
            onClose={handleClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'center',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
            //anchorReference="anchorPosition"
            // anchorPosition={{ top: 275, left: 600 }}
          >
            <div className="formlistTable__projectsAssociated__header">
              Projects Associated
            </div>
            <div className="formlistTable__projectsAssociated__name">
              {projectsAssociatedTemp &&
                projectsAssociatedTemp.map((item: any, index: any) => (
                  <Typography
                    key={item?.project?.id}
                    className="formlistTable__projectsAssociated__typography"
                    onClick={() => {
                      localStorage.setItem(
                        'redirect_recipe',
                        (openProjectPopup.recipe?.name as string) || ''
                      );
                      window.open(
                        `${location.origin}/scheduling/project-plan/${item?.project?.id}`,
                        '_blank'
                      );
                    }}
                  >
                    {index + 1}
                    {'.'}
                    <Tooltip title={item.project.name}>
                      <span>
                        {item.project.name.length > 18
                          ? item.project.name.slice(0, 19)
                          : item.project.name}
                      </span>
                    </Tooltip>
                  </Typography>
                ))}
            </div>
          </Popover>
        )}
      </Paper>
    </div>
  );
}
