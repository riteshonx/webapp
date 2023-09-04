import React from "react";
import { makeStyles, createStyles } from "@material-ui/core/styles";
import Pagination from "@material-ui/lab/Pagination";

const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
      marginLeft: "2rem",
    },
    pagination: {
      margin: 0,
    },
  })
);

interface PaginationProps {
  count: number;
  page: number;
  onChange: (e: any, v: number) => void;
}

export default function PaginationRounded({
  count,
  page,
  onChange,
}: PaginationProps) {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Pagination
        count={count}
        page={page}
        onChange={onChange}
        variant="outlined"
        shape="rounded"
        className={classes.pagination}
      />
    </div>
  );
}
