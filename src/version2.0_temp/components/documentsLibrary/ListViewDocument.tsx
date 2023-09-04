import React, { useMemo } from 'react';
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import { validateTableCell } from "../../../utils/helper";
import { IconButton, Tooltip } from "@material-ui/core";
import DeleteOutlinedIcon from "@material-ui/icons/DeleteOutlined";
import DownloadIcon from "@material-ui/icons/GetApp";
import moment from "moment";
import InfiniteScroll from "react-infinite-scroll-component";
import DescriptionIcon from "@material-ui/icons/Description";
import AudioIcon from "@material-ui/icons/Audiotrack";
import VideoIcon from "@material-ui/icons/Videocam";
import "./listviewdocument.scss";

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
export default function ListViewDocument(props:any) {
const {files,fetchData,documentResponse,getImageCarouselFile} =props;
	const count = documentResponse?.data?.documents_aggregate.aggregate.count;
const loader = useMemo(() => {
  if (files?.length === count) {
    return '';
  } else {
    return <h4>Loading...</h4>;
  }
}, [files?.length, count]);
  return (
      <div className="v2-table-root">
      <Paper className="v2-table-paper">
        <InfiniteScroll
          dataLength={files?.length ? files?.length : 0} //This is important field to render the next data
          next={fetchData}
          hasMore={true}
          loader={loader}
          scrollableTarget="scrollableDiv1"
        >
          <TableContainer
            className="v2-table-container"
            component={Paper}
            id={"scrollableDiv1"}
          >
            <Table
              stickyHeader
              className="v2-list-table"
              aria-label="customized table"
            >
              <TableHead className="v2-table-head">
                <TableRow className='v2-projectfilestable'>
                  {head.map((item: string, index: number) => (
                    <TableCell
                      key={index}
                      className={"v2-projectfilestable-tableHead"}
                      align={"left"}
                    >
                      {item}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {files &&
                  files?.length !== 0 &&
                  files?.map((row: any, index: number) => (
                    <TableRow
                      className="v2-table-row"
                      key={index}
                      onClick={()=>getImageCarouselFile(row)}
                    >
                      <TableCell
                        className="v2-table-body"
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
                            className="v2-projectfilestable-img"
                          />
                        )}
                        {row.documentType.name === "docs" && (
                          <DescriptionIcon className="v2-projectfilestable-docsandvideoicon"></DescriptionIcon>
                        )}
                        {row.documentType.name === "video" && (
                          <VideoIcon className="v2-projectfilestable-docsandvideoIcon " />
                        )}
                        {row.documentType.name === "audio" && (
                          <AudioIcon className="v2-projectfilestable-docsandvideoIcon "  />
                        )}
                      </TableCell>
                      <TableCell
                        className="v2-table-body"
                        align="left"
                        component="th"
                        scope="row"
                      >
                        {validateTableCell(row.description)}
                      </TableCell>
                      <TableCell className="v2-table-body" align="left">
                        {row.documentTagAssociations?.length
                          ? row.documentTagAssociations?.map(
                              (item: any, i: number) =>
                                i !== row.documentTagAssociations.length - 1
                                  ? `${validateTableCell(item.tag.name)}, `
                                  : validateTableCell(item.tag.name)
                            )
                          : "--"}
                      </TableCell>
                      <TableCell className="v2-table-body" align="left">
                        {validateTableCell(row?.location)}
                      </TableCell>
                      <TableCell className="v2-table-body" align="left">
                        {validateTableCell(
                          row.createdByUser.firstName +
                            " " +
                            row.createdByUser.lastName
                        )}
                      </TableCell>
                      <TableCell className="v2-table-body" align="left">
                        {validateTableCell(
                          moment(row?.createdAt).format("DD MMM YYYY")
                        )}
                      </TableCell>
                      <TableCell className="v2-table-body"align="left">
                        {validateTableCell(
                          row.updatedByUser.firstName +
                            " " +
                            row.updatedByUser.lastName
                        )}
                      </TableCell>
                      <TableCell className="v2-table-body" align="left">
                        {validateTableCell(
                          moment(row?.updatedAt).format("DD MMM YYYY")
                        )}
                      </TableCell>
                      <TableCell
                        align="right"
                        component="th"
                        scope="item"
                        className={"v2-projectfilestable-iconcontainer"}
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
                        {/* {canDeleteUploads() && (
                          <Tooltip title={"Delete"} placement="top">
                            <IconButton
                              onClick={(e: any) => {
                                props.handleDeleteRow(e, row?.id);
                              }}
                            >
                              <DeleteOutlinedIcon htmlColor="#B0B0B0" />
                            </IconButton>
                          </Tooltip>
                        )} */}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>

            {files?.length === 0 && (
              <div className="v2-projectfilestable-nocontent">
                No data available
              </div>
            )}
          </TableContainer>
        </InfiniteScroll>
      </Paper>
    </div>
  );
}


