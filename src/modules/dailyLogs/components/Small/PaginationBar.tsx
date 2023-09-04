import React from "react";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import TableRowsSelectionPerPage from "src/modules/shared/components/TableRowsSelectionPerPage/TableRowsSelectionPerPage";
import TablePagination from "src/modules/shared/components/TablePagination/TablePagination";

interface PaginationBarProps {
  page: number;
  limit: number;
  totalPageCount: number;
  totalRecords: number;
  pageLimitOptions?: Array<number>;
  style?: React.CSSProperties;
  onChangeRowsSelection: (e: any) => void;
  onChangePageNo: (e: any, v: number) => void;
  isLoading: boolean;
  disabled: boolean;
}

const PaginationBar: React.VFC<PaginationBarProps> = ({
  disabled,
  page,
  limit,
  totalPageCount,
  totalRecords,
  style,
  pageLimitOptions = [5, 10, 15, 20, 50, 100],
  onChangeRowsSelection,
  onChangePageNo,
  isLoading,
}: any) => {
  if (isLoading || disabled) return null;
  return (
    <Box style={style} marginLeft="50px">
      <Grid container>
        <Grid item xs={5}>
          <span>
            Showing {(page - 1) * limit + 1} -{" "}
            {totalRecords < page * limit ? totalRecords : page * limit} of{" "}
            {totalRecords}
          </span>
        </Grid>
        <Grid item xs={3}>
          <TableRowsSelectionPerPage
            rowsPerPage={limit}
            values={pageLimitOptions}
            onChangeRowsPerPage={onChangeRowsSelection}
          />
        </Grid>
        <Grid item xs={4}>
          <TablePagination
            count={totalPageCount}
            page={page}
            onChange={onChangePageNo}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default PaginationBar;
