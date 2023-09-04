import React, { useContext, useEffect } from "react";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableSortLabel from "@material-ui/core/TableSortLabel";
import Paper from "@material-ui/core/Paper";
import NoDataMessage from "../../../../shared/components/NoDataMessage/NoDataMessage";
import { stateContext } from "../../../../root/context/authentication/authContext";
import Checkbox from "@material-ui/core/Checkbox";
import { LinkContext } from "../../Context/link/linkContext";
import {
  setDraftSelectedFormLinks,
  setSelectedFeatureFormList,
} from "../../Context/link/linkAction";
import "./FormsLinkTable.scss";
import { stableSort, getComparator, Order } from "../../../../../utils/helper";

export interface Params {
  projectId: string;
}

interface tableHeader {
  targetAutoIncremenId: number;
  label: string;
}

interface rowData {
  targetAutoIncremenId: number;
  label: string;
}

const noDataMessage = "No forms were found.";

interface HeadCell {
  disablePadding: boolean;
  id: keyof tableHeader;
  label: string;
  numeric: boolean;
  isSorting: boolean;
}

const headCells: HeadCell[] = [
  {
    id: "targetAutoIncremenId",
    numeric: true,
    disablePadding: true,
    label: "Id",
    isSorting: true,
  },
  {
    id: "label",
    numeric: false,
    disablePadding: true,
    label: "Subject",
    isSorting: true,
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
}

function EnhancedTableHead(props: EnhancedTableProps) {
  const { linkState, linkDispatch }: any = useContext(LinkContext);
  const { formToFormLinks } = linkState;
  const {
    numSelected,
    onRequestSort,
    onSelectAllClick,
    order,
    orderBy,
    rowCount,
  } = props;
  const createSortHandler = (property: HeadCell) => (event: React.MouseEvent<unknown>) => {
    if(property.isSorting){
      onRequestSort(event, property.id);
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
            inputProps={{ "aria-label": "select all desserts" }}
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
              direction={orderBy === headCell.id ? order : "asc"}
              onClick={createSortHandler(headCell)}
              hideSortIcon={headCell.isSorting}
            >
              {headCell.label === "Id"
                ? `${formToFormLinks?.selectedFeature?.feature || ""} Id`
                : headCell.label}
              {orderBy === headCell.id ? (
                <span className="FormsLinkTable__visuallyHidden">
                  {order === "desc" ? "sorted descending" : "sorted ascending"}
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
  const [order, setOrder] = React.useState<Order>("asc");
  const [orderBy, setOrderBy] = React.useState<keyof rowData>("targetAutoIncremenId");
  const [selected, setSelected] = React.useState<string[]>([]);
  const { linkState, linkDispatch }: any = useContext(LinkContext);
  const { formToFormLinks } = linkState;

  useEffect(() => {
    if (formToFormLinks?.selectedFeatureFormsList) {
      const newSelecteds = formToFormLinks.selectedFeatureFormsList.filter(
        (n: any) => n.isSelected
      );
      setSelected(newSelecteds.map((n: any) => n.id));
    }
  }, [formToFormLinks.selectedFeatureFormsList]);

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: keyof rowData
  ) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    const list = [...formToFormLinks.selectedFeatureFormsList];
    list.forEach((item: any) => {
      if (item.new) {
        item.isSelected = event.target.checked;
      }
    });
    if (event.target.checked) {
      const ids = formToFormLinks.draftSelectedFormLinks.map(
        (item: any) => item.id
      );
      const targetList = formToFormLinks.selectedFeatureFormsList.filter(
        (item: any) => ids.indexOf(item.id) === -1
      );
      targetList.push(...formToFormLinks.draftSelectedFormLinks);
      linkDispatch(setDraftSelectedFormLinks(targetList));
    } else {
      const ids = list.map((item) => item.id);
      const targetList = formToFormLinks.draftSelectedFormLinks.filter(
        (item: any) => ids.indexOf(item.id) == -1
      );
      linkDispatch(setDraftSelectedFormLinks(targetList));
    }
    linkDispatch(setSelectedFeatureFormList(list));
  };

  const handleClick = (event: any, row: any) => {
    const list = [...formToFormLinks.selectedFeatureFormsList];
    const selectedLinks = JSON.parse(
      JSON.stringify(formToFormLinks.draftSelectedFormLinks)
    );
    const currentitem = list.filter((item: any) => item.id === row.id);
    if (currentitem.length > 0) {
      const currentIndex = formToFormLinks.selectedFeatureFormsList.indexOf(
        currentitem[0]
      );
      list[currentIndex].isSelected = event.target.checked;
    }
    if (event.target.checked) {
      const currentItem = selectedLinks.find(
        (item: any) => row.targetId === item.targetId
      );
      if (!currentItem) {
        row.isSelected = true;
        selectedLinks.push(row);
      }
      linkDispatch(setDraftSelectedFormLinks([...selectedLinks]));
    } else {
      const currentItem = selectedLinks.find(
        (item: any) => row.targetId === item.targetId
      );
      if (currentItem) {
        const index = selectedLinks.indexOf(currentItem);
        selectedLinks.splice(index, 1);
      }
      linkDispatch(setDraftSelectedFormLinks([...selectedLinks]));
    }
    linkDispatch(setSelectedFeatureFormList(list));
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
              rowCount={formToFormLinks.selectedFeatureFormsList.length}
            />
            {formToFormLinks.selectedFeatureFormsList.length > 0 ? (
              <TableBody>
                {stableSort(
                  formToFormLinks.selectedFeatureFormsList,
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
                          disabled={!row.new}
                          onClick={(event) => handleClick(event, row)}
                          checked={row.isSelected}
                          inputProps={{ "aria-labelledby": labelId }}
                          color="default"
                        />
                      </TableCell>
                      <TableCell className="FormsLinkTable__cell">
                        {row?.targetAutoIncremenId}  
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
                  <TableCell colSpan={7} align={"center"}>
                    <NoDataMessage message={noDataMessage} />
                  </TableCell>
                </TableRow>
              </TableBody>
            ) : (
              ""
            )}
          </Table>
        </TableContainer>
      </Paper>
    </div>
  );
}

