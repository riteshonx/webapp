import Checkbox from '@material-ui/core/Checkbox';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import React, { useContext, useEffect } from 'react';
import { stateContext } from '../../../../../../../root/context/authentication/authContext';
import NoDataMessage from '../../../../../../../shared/components/NoDataMessage/NoDataMessage';
// import { LinkContext } from '../../Context/link/linkContext';
// import {
//   setDraftSelectedFormLinks,
//   setSelectedFeatureFormList,
// } from '../../Context/link/linkAction';
import './CommonFormLinkTable.scss';

export interface Params {
  projectId: string;
}

interface tableHeader {
  id: number;
  label: string;
}

interface rowData {
  id: number;
  label: string;
}

const noDataMessage = 'No forms were found.';

function descendingComparator(a: any, b: any, orderBy: keyof any) {
  if (
    b[orderBy]?.toString().toLocaleLowerCase() <
    a[orderBy]?.toString().toLocaleLowerCase()
  ) {
    return -1;
  }
  if (
    b[orderBy]?.toString().toLocaleLowerCase() >
    a[orderBy]?.toString().toLocaleLowerCase()
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

interface HeadCell {
  disablePadding: boolean;
  id: keyof tableHeader;
  label: string;
  numeric: boolean;
  isSorting: boolean;
}

const headCells: HeadCell[] = [
  {
    id: 'id',
    numeric: false,
    disablePadding: true,
    label: 'Id',
    isSorting: false,
  },
  {
    id: 'label',
    numeric: false,
    disablePadding: true,
    label: 'Subject',
    isSorting: false,
  },
];

interface EnhancedTableProps {
  numSelected: number;
  onRequestSort: (
    event: React.MouseEvent<unknown>,
    property: keyof rowData
  ) => void;
  onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
  order: Order;
  orderBy: string;
  rowCount: number;
  selectedFeature: any;
}

function EnhancedTableHead(props: EnhancedTableProps) {
  const { selectedFeature } = props;
  const {
    numSelected,
    onRequestSort,
    onSelectAllClick,
    order,
    orderBy,
    rowCount,
  } = props;
  const createSortHandler =
    (property: keyof rowData, isSorting: boolean) =>
    (event: React.MouseEvent<unknown>) => {
      if (!isSorting) {
        onRequestSort(event, property);
      }
    };

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{ 'aria-label': 'select all desserts' }}
            color="default"
          />
        </TableCell>
        {headCells.map((headCell) => (
          <TableCell
            className="FormsLinkTable__headecell"
            key={headCell.id}
            align="left"
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id, headCell.isSorting)}
              hideSortIcon={headCell.isSorting}
            >
              {headCell.label === 'Id'
                ? `${selectedFeature?.feature || ''} Id`
                : headCell.label}
              {orderBy === headCell.id ? (
                <span className="FormsLinkTable__visuallyHidden">
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

export default function EnhancedTable(props: any): any {
  const { state }: any = useContext(stateContext);
  const [order, setOrder] = React.useState<Order>('asc');
  const [orderBy, setOrderBy] = React.useState<keyof rowData>('id');
  const [selected, setSelected] = React.useState<string[]>([]);

  const {
    selectedFeatureFormsList,
    draftSelectedFormLinks,
    setDraftSelectedFormLinks,
    setSelectedFeatureFormList,
    selectedFeature,
  } = props;
  useEffect(() => {
    if (selectedFeatureFormsList) {
      const newSelecteds = selectedFeatureFormsList.filter(
        (n: any) => n.isSelected
      );
      setSelected(newSelecteds.map((n: any) => n.id));
    }
  }, [selectedFeatureFormsList]);

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: keyof rowData
  ) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    const list = [...selectedFeatureFormsList];

    list.forEach((item: any) => {
      if (!item.isDisabled) {
        item.isSelected = event.target.checked;
      }
    });
    if (event.target.checked) {
      const ids = draftSelectedFormLinks.map((item: any) => item.id);
      let targetList = selectedFeatureFormsList.filter(
        (item: any) => ids.indexOf(item.id) === -1
      );
      targetList.push(...draftSelectedFormLinks);
      targetList = targetList.filter((item: any) => !item.isDisabled);
      setDraftSelectedFormLinks(targetList);
    } else {
      const ids = list.map((item) => item.id);
      const targetList = draftSelectedFormLinks.filter(
        (item: any) => ids.indexOf(item.id) == -1
      );
      setDraftSelectedFormLinks(targetList);
    }
    setSelectedFeatureFormList(list);
  };

  const handleClick = (event: any, row: any) => {
    const list = [...selectedFeatureFormsList];
    const selectedLinks = JSON.parse(JSON.stringify(draftSelectedFormLinks));
    const currentitem = list.filter((item: any) => item.id === row.id);
    if (currentitem.length > 0) {
      const currentIndex = selectedFeatureFormsList.indexOf(currentitem[0]);
      list[currentIndex].isSelected = event.target.checked;
    }
    if (event.target.checked) {
      const currentItem = selectedLinks.find((item: any) => row.id === item.id);
      if (!currentItem) {
        row.isSelected = true;
        selectedLinks.push(row);
      }
      setDraftSelectedFormLinks([...selectedLinks]);
    } else {
      const currentItem = selectedLinks.find((item: any) => row.id === item.id);
      if (currentItem) {
        const index = selectedLinks.indexOf(currentItem);
        selectedLinks.splice(index, 1);
      }
      setDraftSelectedFormLinks([...selectedLinks]);
    }
    setSelectedFeatureFormList(list);
  };

  return (
    <div className="FormsLinkTable">
      <Paper className="FormsLinkTable__paper">
        <TableContainer className="FormsLinkTable__container">
          <Table
            stickyHeader
            className="FormsLinkTable__table"
            aria-labelledby="tableTitle"
            aria-label="enhanced table"
          >
            <EnhancedTableHead
              numSelected={selected.length}
              onSelectAllClick={handleSelectAllClick}
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
              rowCount={selectedFeatureFormsList.length}
              selectedFeature={selectedFeature}
            />
            {selectedFeatureFormsList.length > 0 ? (
              <TableBody>
                {stableSort(
                  selectedFeatureFormsList,
                  getComparator(order, orderBy)
                ).map((row: any, index: number) => {
                  const labelId = `enhanced-table-checkbox-${index}`;
                  return (
                    <TableRow key={row?.id}>
                      <TableCell
                        padding="checkbox"
                        className="FormsLinkTable__checkcell"
                      >
                        <Checkbox
                          disabled={row.isDisabled ? true : false}
                          onClick={(event) => handleClick(event, row)}
                          checked={row.isSelected ? true : false}
                          inputProps={{ 'aria-labelledby': labelId }}
                          color="default"
                        />
                      </TableCell>
                      <TableCell className="FormsLinkTable__cell">
                        {row?.targetAutoIncremenId
                          ? row?.targetAutoIncremenId
                          : '-'}
                      </TableCell>
                      <TableCell className="FormsLinkTable__cell">
                        {row?.label}
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
      </Paper>
    </div>
  );
}
