import React from 'react';
import { TableCell, Typography } from '@material-ui/core';
import Box from '@mui/material/Box';
import TableSortLabel from '@mui/material/TableSortLabel';
import { visuallyHidden } from '@mui/utils';

export interface ConstraintType {
  id?: string;
  name: string;
  category: string;
  taskId: string;
  task?: string;
  assignee: string;
  dueDate: string;
  desc: string;
  status?: string;
}

export interface Data {
  name: string;
  category: string;
  task: string;
  assigneeName: string;
  dueDate: string;
}
export interface HeadCell {
  disablePadding: boolean;
  id: keyof Data;
  label: string;
  numeric: boolean;
}
export const headCells: readonly HeadCell[] = [
  {
    id: 'name',
    numeric: false,
    disablePadding: false,
    label: 'Title',
  },
  {
    id: 'category',
    numeric: false,
    disablePadding: false,
    label: 'Category',
  },
  {
    id: 'task',
    numeric: false,
    disablePadding: false,
    label: 'Activity',
  },
  {
    id: 'assigneeName',
    numeric: false,
    disablePadding: false,
    label: 'Assignee',
  },
  {
    id: 'dueDate',
    numeric: true,
    disablePadding: false,
    label: 'Due Date',
  },
];
function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (orderBy === 'dueDate') {
    return sorter(
      new Date(b[orderBy] as unknown as string),
      new Date(a[orderBy] as unknown as string)
    );
  }
  return sorter(b[orderBy], a[orderBy]);
}
function sorter(b: any, a: any) {
  if (b < a) {
    return -1;
  }
  if (b > a) {
    return 1;
  }
  return 0;
}

type Order = 'asc' | 'desc';

export function getComparator<Key extends keyof any>(
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
interface Props {
  order: Order;
  orderBy: string;
  onRequestSort: (e: React.MouseEvent<unknown>, prop: string) => void;
}
export const EnhancedTableHead = (props: Props): React.ReactElement => {
  const { order, orderBy, onRequestSort } = props;
  const createSortHandler =
    (property: keyof Data) => (event: React.MouseEvent<unknown>) => {
      onRequestSort(event, property);
    };
  return (
    <React.Fragment>
      {headCells.map((headCell: HeadCell) => (
        <TableCell
          key={headCell.id}
          align={headCell.numeric ? 'right' : 'left'}
          // padding={headCell.disablePadding ? "none" : "default"}
          sortDirection={orderBy === headCell.id ? order : false}
          style={{ padding: '15px' }}
        >
          <TableSortLabel
            active={orderBy === headCell.id}
            direction={orderBy === headCell.id ? order : 'asc'}
            onClick={createSortHandler(headCell.id)}
          >
            <Typography variant="body2" noWrap>
              {headCell.label}
            </Typography>
            {orderBy === headCell.id ? (
              <Box component="span" sx={visuallyHidden}>
                {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
              </Box>
            ) : null}
          </TableSortLabel>
        </TableCell>
      ))}
    </React.Fragment>
  );
};
