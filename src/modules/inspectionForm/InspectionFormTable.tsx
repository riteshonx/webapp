import {
  Avatar,
  Collapse,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@material-ui/core";
import React, { ReactElement, useContext, useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import KeyboardArrowDownIcon from "@material-ui/icons/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@material-ui/icons/KeyboardArrowUp";
import { AvatarGroup } from "@mui/material";
import ImageCarousel from "../Dashboard/shared/ImageCarousel/ImageCarousel";
import StatusDropdown from "./StatusDropdown";
import ClickTooltip from "./Tooltip";
import "./InspectionFormTable.scss";
import { decodeToken } from "src/services/authservice";
import { getActiveTenantId } from "src/services/authservice";
import PictureAsPdfIcon from "@material-ui/icons/PictureAsPdf";
import { postApi } from "src/services/api";
import { stateContext } from "../root/context/authentication/authContext";
import { setIsLoading } from "../root/context/authentication/action";

const childStatusList: any = [
  { id: 1, status: "OPEN" },
  { id: 2, status: "IN PROGRESS" },
  { id: 3, status: "PENDING PARTS" },
  { id: 4, status: "CLOSED" },
];
const parentStatusList: any = [
  { id: 1, status: "OPEN" },
  { id: 2, status: "CLOSED" },
];

const InspectionFormTable = ({
  row,
  handleOpenRow,
  fetchData,
  handleStatusChange,
  header,
}: any): ReactElement => {
  const { state, dispatch }: any = useContext(stateContext);
  const [headers, setHeaders]: any = useState([
    "Area",
    "Item",
    "Status",
    "Notes",
    "Issue Resolved",
    "Supervisor Notes",
    "Attachments",
  ]);
  const [rowData, setRowData]: any = useState(null);
  const [openCarousel, setOpenCarousel]: any = useState(false);
  const [attachmentList, setAttachmentList]: any = useState({
    pictures: [],
    videos: [],
  });

  useEffect(() => {
    if (!decodeToken()?.adminUser) {
      const data: any = [...headers]?.filter(
        (item: string) =>
          item !== "Supervisor Notes" && item !== "Issue Resolved"
      );
      setHeaders(data);
    }
  }, []);

  useEffect(() => {
    setRowData(row);
  }, [row]);

  const handleAttachments = (data: any) => {
    const pictures = data?.attachments
      .filter((item: any) => item?.fileType?.split("/")[0] === "image")
      .map((val: any) => val?.url);
    const videos = data?.attachments
      .filter((item: any) => item?.fileType?.split("/")[0] === "video")
      .map((val: any) => val?.url);
    setAttachmentList({
      pictures: pictures,
      videos: videos,
    });
    setOpenCarousel(true);
  };

  const handlePdfDownload = async (id: any) => {
    const temp: any = [];
    const fileName = header?.child?.id
      ? rowData?.item !== "-"
        ? `${state.currentProject?.projectName}_${header?.parent?.name}_${header?.child?.name}_${rowData?.area}_${rowData?.item}.pdf`
        : `${state.currentProject?.projectName}_${header?.parent?.name}_${header?.child?.name}_${rowData?.area}.pdf`
      : rowData?.item !== "-"
      ? `${state.currentProject?.projectName}_${header?.parent?.name}_${rowData?.area}_${rowData?.item}.pdf`
      : `${state.currentProject?.projectName}_${header?.parent?.name}_${rowData?.area}.pdf`;
    temp.push({
      key: `tenant/${getActiveTenantId()}/project/${
        state.currentProject?.projectId
      }/feature/${id}/tenant_${getActiveTenantId()}__project_${
        state.currentProject?.projectId
      }__feature_${id}.pdf`,
      fileName: fileName.replaceAll(" ", ""),
      expiresIn: 1000,
    });

    try {
      dispatch(setIsLoading(true));
      const response = await postApi("V1/S3/downloadLink", temp);
      window.open(response.success[0].url, "_parent");
      dispatch(setIsLoading(false));
    } catch (error) {
      dispatch(setIsLoading(false));
    }
  };

  return rowData ? (
    <React.Fragment>
      <TableRow
        className={
          rowData?.isOpen
            ? "inspectionFormTable-main inspectionFormTable-main__highlightRow"
            : "inspectionFormTable-main"
        }
      >
        <TableCell align="center">
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => {
              handleOpenRow(rowData?.id);
            }}
          >
            {rowData?.isOpen ? (
              <KeyboardArrowUpIcon />
            ) : (
              <KeyboardArrowDownIcon />
            )}
          </IconButton>
        </TableCell>
        <ClickTooltip title={rowData?.area} align={"left"} />
        <TableCell align="center">{rowData?.item}</TableCell>
        <TableCell
          className="inspectionFormTable-main__statusCell"
          align="center"
        >
          {decodeToken()?.adminUser ? (
            <StatusDropdown
              value={rowData?.status}
              handleChange={(e: any) =>
                handleStatusChange(e, rowData?.id, "parent")
              }
              statusList={parentStatusList}
            />
          ) : (
            "DRAFT"
          )}
        </TableCell>
        <ClickTooltip title={rowData?.createdBy} align={"center"} />
        <TableCell align="center">{rowData?.submissionDate}</TableCell>
        <TableCell align="center">{rowData?.inspectionDate}</TableCell>
        <ClickTooltip title={rowData?.notes} align={"center"} />
        {decodeToken()?.adminUser && (
          <TableCell align="center">{rowData?.issueResolved}</TableCell>
        )}
        {decodeToken()?.adminUser && (
          <ClickTooltip title={rowData?.supervisorNotes} align={"center"} />
        )}
        <TableCell align="center">
          {rowData?.attachments?.length ? (
            <AvatarGroup
              max={3}
              className={"inspectionFormTable-main__avatarGroup"}
              onClick={() => {
                handleAttachments(rowData);
              }}
            >
              {rowData?.attachments?.map((attachment: any, i: number) => (
                <Avatar
                  key={i}
                  className={"inspectionFormTable-main__avatarGroup__avatar"}
                  alt={
                    attachment?.fileType?.split("/")[0] === "image" ? "I" : "V"
                  }
                  src={
                    attachment?.fileType?.split("/")[0] === "image"
                      ? attachment?.url
                      : "video"
                  }
                />
              ))}
            </AvatarGroup>
          ) : (
            "-"
          )}
        </TableCell>
        {decodeToken()?.adminUser && (
          <TableCell>
            <PictureAsPdfIcon
              htmlColor="red"
              className="inspectionFormTable-main__pdfIcon"
              onClick={(e: any) => {
                handlePdfDownload(rowData?.id);
              }}
            />
          </TableCell>
        )}
      </TableRow>
      <TableRow>
        <TableCell
          className="inspectionFormTable-main__collapseTabelCell"
          colSpan={12}
        >
          <Collapse
            className="inspectionFormTable-main__collapseTabelCell__collapse"
            in={rowData?.isOpen}
            timeout="auto"
            unmountOnExit
          >
            {rowData?.childData?.length ? (
              <InfiniteScroll
                dataLength={
                  rowData?.childData?.length ? rowData?.childData?.length : 0
                } //This is important field to render the next data
                next={() => fetchData()}
                hasMore={true}
                loader={""}
                scrollableTarget="scrollableDiv2"
              >
                <TableContainer
                  className={
                    "inspectionFormTable-main__collapseTabelCell__tableContainer"
                  }
                  component={Paper}
                  id={"scrollableDiv2"}
                >
                  <Table
                    aria-label="purchases"
                    className={
                      "inspectionFormTable-main__collapseTabelCell__tableContainer__table"
                    }
                  >
                    <TableHead>
                      <TableRow>
                        {headers?.map((item: any, i: number) => (
                          <TableCell
                            key={i}
                            className="inspectionFormTable-main__collapseTabelCell__tableContainer__table__headCell"
                            align={i === 0 ? "left" : "center"}
                          >
                            {item}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rowData?.childData?.map(
                        (row: any, i: number) =>
                          i !== 0 && (
                            <TableRow key={i}>
                              <ClickTooltip title={row?.area} align={"left"} />
                              <TableCell align="center">{row?.item}</TableCell>
                              <TableCell
                                className="inspectionFormTable-main__statusCell"
                                align="center"
                              >
                                {decodeToken()?.adminUser ? (
                                  <StatusDropdown
                                    value={row?.status}
                                    handleChange={(e: any) =>
                                      handleStatusChange(
                                        e,
                                        row?.id,
                                        "child",
                                        rowData?.id
                                      )
                                    }
                                    statusList={childStatusList}
                                  />
                                ) : (
                                  "DRAFT"
                                )}
                              </TableCell>

                              <ClickTooltip
                                title={row?.notes}
                                align={"center"}
                              />
                              {decodeToken()?.adminUser && (
                                <TableCell align="center">
                                  {row?.issueResolved}
                                </TableCell>
                              )}
                              {decodeToken()?.adminUser && (
                                <ClickTooltip
                                  title={row?.supervisorNotes}
                                  align={"center"}
                                />
                              )}
                              <TableCell align="center">
                                {row?.attachments?.length ? (
                                  <AvatarGroup
                                    max={3}
                                    className={
                                      "inspectionFormTable-main__avatarGroup"
                                    }
                                    onClick={() => handleAttachments(row)}
                                  >
                                    {row?.attachments?.map(
                                      (attachment: any, i: number) => (
                                        <Avatar
                                          className={
                                            "inspectionFormTable-main__avatarGroup__avatar"
                                          }
                                          key={i}
                                          alt={attachment?.fileType ? "V" : "I"}
                                          src={
                                            attachment?.fileType?.split(
                                              "/"
                                            )[0] === "image"
                                              ? attachment?.url
                                              : "video"
                                          }
                                        />
                                      )
                                    )}
                                  </AvatarGroup>
                                ) : (
                                  "-"
                                )}
                              </TableCell>
                            </TableRow>
                          )
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </InfiniteScroll>
            ) : (
              <div className={"inspectionFormTable-main__noContent"}>
                No forms available!
              </div>
            )}
          </Collapse>
        </TableCell>
      </TableRow>
      <ImageCarousel
        open={openCarousel}
        close={() => {
          setAttachmentList({
            pictures: [],
            videos: [],
          });
          setOpenCarousel(false);
        }}
        pictures={attachmentList?.pictures}
        videos={attachmentList?.videos}
      />
    </React.Fragment>
  ) : (
    <></>
  );
};

export default InspectionFormTable;
