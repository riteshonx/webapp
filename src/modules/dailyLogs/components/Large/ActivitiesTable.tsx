import React from "react";
import { withStyles, createStyles, makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Box from "@material-ui/core/Box";
import BoldText from "../Micro/BoldText";
import CircularProgress from "@material-ui/core/CircularProgress";
import AbsoluteCenteredBox from "../Micro/AbsoluteCenteredBox";

const StyledTableCell = withStyles(() =>
  createStyles({
    head: {
      backgroundColor: "#edecec",
      color: "#000",
      fontWeight: "bold",
    },
    body: {
      fontSize: 14,
    },
  })
)(TableCell);

const StyledTableHead = withStyles(() =>
  createStyles({
    root: {
      position: "sticky",
      top: 0,
      zIndex: 0,
    },
  })
)(TableHead);

const StyledTableRow = withStyles(() =>
  createStyles({
    root: {
      backgroundColor: (props: any) => props.color,
      verticalAlign: "top",
    },
  })
)(TableRow);

const useStyles = makeStyles({
  tableContainer: {
    marginTop: "2rem",
    minHeight: "250px",
    maxHeight: (props: any) => props.contentHeight,
    //overflow: "unset",
  },
});

interface RowItem {
  key: React.ReactText;
  components: Array<React.ReactNode>;
}

interface ColumnType {
  name: string;
  width: string;
}

interface ActivitiesTableProps {
  tableName: string;
  tableDescription?: string;
  columns: Array<ColumnType>;
  rowComponents: Array<RowItem>;
  isLoading: boolean;
  hasError: boolean;
  hasDataAfterFetch: boolean;
  contentHeight?: string;
  topOffset?: string;
}

export default function ActivitiesTable({
  tableName,
  tableDescription,
  columns,
  rowComponents,
  isLoading,
  hasError,
  hasDataAfterFetch,
  contentHeight = "55vh",
  topOffset = "178px",
}: ActivitiesTableProps): JSX.Element {
  const classes = useStyles({ contentHeight });

  return (
    <Box
    marginLeft='50px'
    >
      {/* <Box
        position="sticky"
        top="110px"
        padding="20px 0 25px 0"
        zIndex={200}
        bgcolor="white"
      > */}
      <BoldText collapseMargin={true}>{tableName}</BoldText>
      {tableDescription && (
        <BoldText size="1.5rem" color="#848484">
          {tableDescription}
        </BoldText>
      )}
      {/* </Box> */}
      <Box position="relative">
        <TableContainer className={classes.tableContainer}>
          <Table aria-label="customized table">
            <colgroup>
              {columns.map((column) => (
                <col key={column.name} style={{ width: column.width }} />
              ))}
            </colgroup>
            <StyledTableHead>
              <TableRow>
                {columns.map((column) => (
                  <StyledTableCell key={column.name}>
                    {column.name}
                  </StyledTableCell>
                ))}
              </TableRow>
            </StyledTableHead>
            {!hasError && !isLoading && (
              <TableBody>
                {rowComponents.map(({ key, components }, rowIndex) => (
                  <StyledTableRow key={`row-${key}-${rowIndex}`}>
                    {components.map((component, index) => (
                      <StyledTableCell key={`cell-${key}-${index}`} scope="row">
                        {component}
                      </StyledTableCell>
                    ))}
                  </StyledTableRow>
                ))}
              </TableBody>
            )}
          </Table>
        </TableContainer>
        {hasError ? (
          <AbsoluteCenteredBox color="#cc4444">
            Something went wrong
          </AbsoluteCenteredBox>
        ) : isLoading ? (
          <AbsoluteCenteredBox>
            <CircularProgress style={{ color: "#000" }} />
            <p style={{ marginTop: "1rem" }}>Please wait..</p>
          </AbsoluteCenteredBox>
        ) : (
          !hasDataAfterFetch && (
            <AbsoluteCenteredBox style={{ fontWeight: "bold" }}>
              No activities found
            </AbsoluteCenteredBox>
          )
        )}
      </Box>
    </Box>
  );
}
