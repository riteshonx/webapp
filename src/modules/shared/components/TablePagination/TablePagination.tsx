import React from "react";
import { makeStyles, createStyles } from "@material-ui/core/styles";
import Pagination from "@material-ui/lab/Pagination";


const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
      marginRight: "2rem",
      display:"flex",
      justifyContent:"end",
     // marginTop:"0.1rem"
     "& .MuiPaginationItem-page.Mui-selected":{
      backgroundColor:"#171d25",
      color:"white"
     },
     "& .MuiPaginationItem-outlined":{
      backgroundColor:"#c4c4c4",
      border:"none"
    }
    },
    pagination: {
      margin: 0,
    },
  })
);

export default function TablePagination({ count, page, onChange }: any) {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Pagination
        count={count}
        page={page}
        onChange={onChange}
        variant="outlined"
        shape="rounded"
        size="medium"
        className={classes.pagination}
      />
    </div>
  );
}
