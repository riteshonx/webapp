import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import { validateTableCell } from "../../../../utils/helper";
import { IconButton, Tooltip } from "@material-ui/core";
import DeleteOutlinedIcon from "@material-ui/icons/DeleteOutlined";
import DownloadIcon from "@material-ui/icons/GetApp";
import moment from "moment";
import InfiniteScroll from "react-infinite-scroll-component";
import DescriptionIcon from "@material-ui/icons/Description";
import AudioIcon from "@material-ui/icons/Audiotrack";
import VideoIcon from "@material-ui/icons/Videocam";
import "./ProjectFilesTable.scss";
import { canDeleteUploads } from "src/modules/root/components/Sidebar/permission";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      paddingTop: "23rem",
      // paddingBottom: "2rem",
      width: "100%",
      "& .MuiPaper-elevation1": {
        boxShadow: "none",
      },
      "& .MuiTableCell-root": {
        padding: "10px",
      },
      "& .MuiOutlinedInput-input": {
        padding: "9px 14px",
        fontSize: "1.2rem",
      },
      "& .MuiInputBase-root": {
        width: "20rem",
      },
      fontSize: 11,
    },
    container: {
      height: "calc(100vh - 250px)",
      width: "100%",
      flexGrow: 1,
      padding: "0px 1px",
      overflow: "auto",
      marginTop: "0",
    },
    paper: {
      width: "100%",
      marginBottom: theme.spacing(0),
    },
    table: {
      width: "100%",
      fontSize: 11,
    },
    head: {
      backgroundColor: "#f5f5f5",
      color: theme.palette.common.black,
    },
    body: {
      fontSize: 11,
      width: "20rem",
    },
    row: {
      cursor: "pointer",
      "&:hover": {
        backgroundColor: "#c8c8c842",
      },
    },
    select: {
      maxHeight: "150px !important",
      overflowY: "auto",
    },
  })
);

const head = [
  "Name",
  "Image",
  "Description",
  "Tags",
  "Location",
  "Uploaded By",
  "Uploaded Date",
  "Updated By",
  "Updated Date",
  "",
];

export default function CustomizedTables(props: any) {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Paper className={classes.paper}>
        <InfiniteScroll
          dataLength={props.files?.length ? props.files?.length : 0} //This is important field to render the next data
          next={props.fetchData}
          hasMore={true}
          loader={
            props.files?.length === props.totalDocumentCount ? (
              ""
            ) : (
              <h4>Loading...</h4>
            )
          }
          scrollableTarget="scrollableDiv1"
        >
          <TableContainer
            className={classes.container}
            component={Paper}
            id={"scrollableDiv1"}
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
                      className={"projectFilesTable__tableHead"}
                      align={"left"}
                    >
                      {item}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {props.files &&
                  props.files?.length !== 0 &&
                  props.files?.map((row: any, i: number) => (
                    <TableRow
                      className={classes.row}
                      key={i}
                      onClick={() => props.handleCarouselOpen(row)}
                    >
                      <TableCell
                        className={classes.body}
                        align="left"
                        component="th"
                        scope="row"
                      >
                        {validateTableCell(row.name)}
                      </TableCell>
                      <TableCell align="left" component="th" scope="row">
                        {row.documentType.name === "image" && (
                          <img
                            src={row.url}
                            className="projectFilesTable__img"
                          />
                        )}
                        {row.documentType.name === "docs" && (
                          <DescriptionIcon className="projectFilesTable__docsAndVideoIcon"></DescriptionIcon>
                        )}
                        {row.documentType.name === "video" && (
                          <VideoIcon className="projectFilesTable__docsAndVideoIcon" />
                        )}
                        {row.documentType.name === "audio" && (
                          <AudioIcon className="projectFilesTable__docsAndVideoIcon" />
                        )}
                      </TableCell>
                      <TableCell
                        className={classes.body}
                        align="left"
                        component="th"
                        scope="row"
                      >
                        {validateTableCell(row.description)}
                      </TableCell>
                      <TableCell className={classes.body} align="left">
                        {row.documentTagAssociations?.length
                          ? row.documentTagAssociations?.map(
                              (item: any, i: number) =>
                                i !== row.documentTagAssociations.length - 1
                                  ? `${validateTableCell(item.tag.name)}, `
                                  : validateTableCell(item.tag.name)
                            )
                          : "--"}
                      </TableCell>
                      <TableCell className={classes.body} align="left">
                        {validateTableCell(row?.location)}
                      </TableCell>
                      <TableCell className={classes.body} align="left">
                        {validateTableCell(
                          row.createdByUser.firstName +
                            " " +
                            row.createdByUser.lastName
                        )}
                      </TableCell>
                      <TableCell className={classes.body} align="left">
                        {validateTableCell(
                          moment(row?.createdAt).format("DD MMM YYYY")
                        )}
                      </TableCell>
                      <TableCell className={classes.body} align="left">
                        {validateTableCell(
                          row.updatedByUser.firstName +
                            " " +
                            row.updatedByUser.lastName
                        )}
                      </TableCell>
                      <TableCell className={classes.body} align="left">
                        {validateTableCell(
                          moment(row?.updatedAt).format("DD MMM YYYY")
                        )}
                      </TableCell>
                      <TableCell
                        align="right"
                        component="th"
                        scope="item"
                        className={"projectFilesTable__iconContainer"}
                      >
                        <Tooltip title={"Download"} placement="top">
                          <IconButton
                            onClick={(e: any) => {
                              e.stopPropagation();
                              window.open(row?.url, "_blank");
                            }}
                          >
                            <DownloadIcon htmlColor="#B0B0B0" />
                          </IconButton>
                        </Tooltip>
                        {canDeleteUploads() && (
                          <Tooltip title={"Delete"} placement="top">
                            <IconButton
                              onClick={(e: any) => {
                                props.handleDeleteRow(e, row?.id);
                              }}
                            >
                              <DeleteOutlinedIcon htmlColor="#B0B0B0" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>

            {props.files?.length === 0 && (
              <div className="projectFilesTable__noContent">
                No data available
              </div>
            )}
          </TableContainer>
        </InfiniteScroll>
      </Paper>
    </div>
  );
}
