import React, { useContext, useEffect, useState } from "react";
import "./InsightsInfoPopover.scss";
import CloseIcon from "src/assets/images/closeIcon.svg";
import AddCircleRoundedIcon from "@mui/icons-material/AddCircleRounded";
import RemoveCircleRoundedIcon from "@mui/icons-material/RemoveCircleRounded";
import {
  Paper,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  FormControlLabel,
  Checkbox,
  TableSortLabel,
  Box,
  Button,
} from "@mui/material";
import { visuallyHidden } from "@mui/utils";
import { stateContext } from "src/modules/root/context/authentication/authContext";
import { client } from "src/services/graphql";
import { decodeExchangeToken } from "src/services/authservice";
import moment from "moment";
import { Collapse, Dialog, IconButton, makeStyles } from "@material-ui/core";
import { GET_ROOT_PROJECT_TASK } from "src/modules/Dashboard/api/queries/task";
import axios from "axios";

const useStyles: any = makeStyles(() => ({
  dialogPaper: {
    maxWidth: "85%",
    minWidth: "85%",
    minHeight: "80%",
    maxHeight: "80%",
    background: "#171d25",
  },
}));

const columns: any = [
  { id: "icon", label: "", align: "left" },
  { id: "taskName", label: "Task", align: "left", width: 200 },
  {
    id: "plannedStartDate",
    label: "Planned Start Date",
    align: "center",
    width: 105,
  },
  {
    id: "plannedEndDate",
    label: "Planned End Date",
    align: "center",
    width: 100,
  },
  {
    id: "forecastedStartDate",
    label: "Forecasted Start Date",
    align: "center",
    width: 100,
  },
  {
    id: "forecastedEndDate",
    label: "Forecasted End Date",
    align: "center",
    width: 100,
  },
  {
    id: "overalldelay",
    label: "Overall Delay",
    align: "center",
    width: 80,
  },
  {
    id: "delay",
    label: "Delay",
    align: "center",
    width: 60,
  },
  {
    id: "float",
    label: "Float",
    align: "center",
    width: 60,
  },
  {
    id: "impactDetails",
    label: "Impact Details",
    align: "left",
    width: 100,
  },
];

type Order = "asc" | "desc";

export default function InsightsInfoPopover(props: any): React.ReactElement {
  const classes = useStyles();
  const { state }: any = useContext(stateContext);
  const [insightsInfo, setInsightsInfo]: any = useState(null);
  const [delayDetails, setDelayDetails]: any = useState(null);
  const [isCritical, setIsCritical]: any = useState(false);
  const [order, setOrder] = useState<Order>("asc");
  const [orderBy, setOrderBy] = useState("plannedStartDate");
  const [isOpen, setIsOpen] = useState(true);
  const [showTop5Contributors, setShowTop5Contributors] = useState(false);

  useEffect(() => {
    state?.currentProject?.projectId && getInsightsInfoData();
  }, [
    state.selectedProjectToken,
    state?.selectedPreference,
    orderBy,
    order,
    isCritical,
    showTop5Contributors,
  ]);

  const getInsightsInfoData = async () => {
    try {
      const response = await axios.post(
        `${process.env["REACT_APP_AUTHENTICATION_URL"]}v1/projectSchedImpactDetails`,
        {
          sortBy: orderBy,
          sortOrder: order,
          isCritical: isCritical,
          showTop5Contributors: showTop5Contributors,
        },
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${state?.selectedProjectToken}`,
          },
        }
      );
      const res = await client.query({
        query: GET_ROOT_PROJECT_TASK,
        fetchPolicy: "network-only",
        variables: {
          projectId: state.currentProject?.projectId,
          tenantId: Number(decodeExchangeToken().tenantId),
        },
        context: { role: "viewMasterPlan", token: state.selectedProjectToken },
      });

      setInsightsInfo(response.data?.data?.projectInsightsDrilldown);

      const data: any = {
        delay: res.data?.projectInsightsTaskDelay?.length
          ? res.data?.projectInsightsTaskDelay[0]?.forecastedDelay
          : 0,
        estimatedEndDate: res.data?.projectInsightsTaskDelay?.length
          ? res.data?.projectInsightsTaskDelay[0]?.forecastedEndDate
          : 0,
      };

      setDelayDetails(data);
    } catch (error) {
      console.log(error);
    }
  };

  const createSortHandler =
    (property: any) => (event: React.MouseEvent<unknown>) => {
      const isAsc = orderBy === property && order === "asc";
      setOrder(isAsc ? "desc" : "asc");
      setOrderBy(property);
    };

  return (
    <Dialog
      open={props.selectedInsight?.showInfo}
      onClose={props?.onClose}
      classes={{ paper: classes.dialogPaper }}
    >
      <div className="insightsInfoPopover-main__header">
        <div className="insightsInfoPopover-main__header__title">Analysis</div>
        <img
          src={CloseIcon}
          alt=""
          width={"22px"}
          onClick={props?.onClose}
          className="insightsInfoPopover-main__header__closeIcon"
        />
      </div>
      <div className="insightsInfoPopover-main__content">
        {insightsInfo?.filter(
          (item: any) => item?.projectTask?.taskType === "project"
        )?.length ? (
          <>
            <div className="insightsInfoPopover-main__content__titleContainer">
              <div>
                The following delays are likely to impact the overall project’s
                schedule:
              </div>
              <div className="insightsInfoPopover-main__content__titleContainer__subTitle">
                Forecasted project end date is{" "}
                <span style={{ color: "#ffa80d" }}>
                  {delayDetails?.estimatedEndDate
                    ? moment(delayDetails?.estimatedEndDate).format(
                        "DD MMM YYYY"
                      )
                    : ""}
                </span>{" "}
                which is{" "}
                <span style={{ color: "#ffa80d" }}>
                  {delayDetails?.delay} days behind{" "}
                </span>
                planned schedule.
              </div>
              <FormControlLabel
                control={
                  <Checkbox
                    sx={{
                      transform: "scale(1.3)",
                      color: "#ffa80d",
                      "&.Mui-checked": {
                        color: "#ffa80d",
                      },
                    }}
                    checked={showTop5Contributors}
                    onChange={() =>
                      setShowTop5Contributors(!showTop5Contributors)
                    }
                  />
                }
                sx={{
                  color: "#ffa80d",
                  float: "right",
                  marginRight: "0px",
                  marginLeft: "1rem",
                  "& .MuiFormControlLabel-label": {
                    fontSize: "1.3rem",
                    fontFamily: "Poppins",
                  },
                }}
                label="Top 5 contributors"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    sx={{
                      transform: "scale(1.3)",
                      color: "#ffa80d",
                      "&.Mui-checked": {
                        color: "#ffa80d",
                      },
                    }}
                    checked={isCritical}
                    onChange={(e) => setIsCritical(!isCritical)}
                  />
                }
                sx={{
                  color: "#ffa80d",
                  float: "right",
                  marginRight: "0px",
                  "& .MuiFormControlLabel-label": {
                    fontSize: "1.3rem",
                    fontFamily: "Poppins",
                  },
                }}
                label="Critical Tasks"
              />
            </div>

            <Paper sx={{ height: "100%", width: "100%" }}>
              <TableContainer className="insightsInfoPopover-main__content__tableContainer">
                <Table stickyHeader aria-label="sticky table">
                  <TableHead>
                    <TableRow>
                      {columns.map((column: any) =>
                        ["plannedStartDate", "float"].includes(column?.id) ? (
                          <TableCell
                            style={{ width: column?.width ? column?.width : 0 }}
                            key={column.id}
                            sortDirection={
                              orderBy === column.id ? order : false
                            }
                            align={column.align}
                          >
                            <TableSortLabel
                              active={orderBy === column.id}
                              direction={orderBy === column.id ? order : "asc"}
                              onClick={createSortHandler(column.id)}
                            >
                              {column.label}
                              {orderBy === column.id ? (
                                <Box component="span" sx={visuallyHidden}>
                                  {order === "desc"
                                    ? "sorted descending"
                                    : "sorted ascending"}
                                </Box>
                              ) : null}
                            </TableSortLabel>
                          </TableCell>
                        ) : (
                          <TableCell
                            style={{ width: column?.width ? column?.width : 0 }}
                            key={column.id}
                            align={column.align}
                          >
                            {column.label}
                          </TableCell>
                        )
                      )}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {insightsInfo?.map(
                      (row: any, i: number) =>
                        row?.projectTask?.taskType === "project" && (
                          <TableRow
                            hover
                            role="checkbox"
                            tabIndex={-1}
                            key={i}
                            className={
                              props.selectedInsight?.taskId === row?.taskId
                                ? "insightsInfoPopover-main__content__activeRow"
                                : ""
                            }
                          >
                            <TableCell
                              align="center"
                              className="insightsInfoPopover-main__content__tableCell__projectCell"
                            >
                              <IconButton
                                aria-label="expand row"
                                size="small"
                                onClick={() => {
                                  setIsOpen(!isOpen);
                                }}
                              >
                                {isOpen ? (
                                  <RemoveCircleRoundedIcon htmlColor="#fff" />
                                ) : (
                                  <AddCircleRoundedIcon htmlColor="#fff" />
                                )}
                              </IconButton>
                            </TableCell>
                            <TableCell
                              className={`insightsInfoPopover-main__content__tableCell insightsInfoPopover-main__content__tableCell__cursor 
                            insightsInfoPopover-main__content__tableCell__taskName insightsInfoPopover-main__content__tableCell__projectCell`}
                              align={"left"}
                              onClick={() => {
                                setIsOpen(!isOpen);
                              }}
                            >
                              {row?.projectTask?.taskName}
                            </TableCell>
                            <TableCell
                              className="insightsInfoPopover-main__content__tableCell insightsInfoPopover-main__content__tableCell__startDate insightsInfoPopover-main__content__tableCell__projectCell"
                              align={"center"}
                            >
                              {row?.projectTask?.plannedStartDate
                                ? moment(
                                    row?.projectTask?.plannedStartDate
                                  ).format("DD MMM YYYY")
                                : "-"}
                            </TableCell>
                            <TableCell
                              className="insightsInfoPopover-main__content__tableCell insightsInfoPopover-main__content__tableCell__projectCell"
                              align={"center"}
                            >
                              {row?.projectTask?.plannedEndDate
                                ? moment(
                                    row?.projectTask?.plannedEndDate
                                  ).format("DD MMM YYYY")
                                : "-"}
                            </TableCell>
                            <TableCell
                              className="insightsInfoPopover-main__content__tableCell insightsInfoPopover-main__content__tableCell__projectCell"
                              align={"center"}
                            >
                              {row?.projectTask?.projectInsightsTaskDelays
                                ?.length
                                ? row?.projectTask?.projectInsightsTaskDelays[0]
                                    ?.forecastedStartDate
                                  ? moment(
                                      row?.projectTask
                                        ?.projectInsightsTaskDelays[0]
                                        ?.forecastedStartDate
                                    ).format("DD MMM YYYY")
                                  : "-"
                                : "-"}
                            </TableCell>
                            <TableCell
                              className="insightsInfoPopover-main__content__tableCell insightsInfoPopover-main__content__tableCell__projectCell"
                              align={"center"}
                            >
                              {row?.projectTask?.projectInsightsTaskDelays
                                ?.length
                                ? row?.projectTask?.projectInsightsTaskDelays[0]
                                    ?.forecastedEndDate
                                  ? moment(
                                      row?.projectTask
                                        ?.projectInsightsTaskDelays[0]
                                        ?.forecastedEndDate
                                    ).format("DD MMM YYYY")
                                  : "-"
                                : "-"}
                            </TableCell>
                            <TableCell
                              className="insightsInfoPopover-main__content__delayTableCell insightsInfoPopover-main__content__tableCell__projectCell"
                              align={"center"}
                            >
                              {row?.projectTask?.projectInsightsTaskDelays
                                ?.length
                                ? row?.projectTask?.projectInsightsTaskDelays[0]
                                    ?.forecastedDelay
                                  ? row?.projectTask
                                      ?.projectInsightsTaskDelays[0]
                                      ?.forecastedDelay
                                  : 0
                                : 0}
                            </TableCell>
                            <TableCell
                              className="insightsInfoPopover-main__content__floatTableCell insightsInfoPopover-main__content__tableCell__projectCell"
                              align={"center"}
                            >
                              {/* {row?.projectTask?.projectInsightsTaskDelays
                                ?.length
                                ? row?.projectTask?.projectInsightsTaskDelays[0]
                                    ?.delayDays
                                  ? row?.projectTask
                                      ?.projectInsightsTaskDelays[0]?.delayDays
                                  : 0
                                : 0} */}
                              -
                            </TableCell>
                            <TableCell
                              className="insightsInfoPopover-main__content__floatTableCell insightsInfoPopover-main__content__tableCell__projectCell"
                              align={"center"}
                            >
                              {/* {row?.projectTask?.float} */} -
                            </TableCell>
                            <TableCell
                              className="insightsInfoPopover-main__content__tableCell insightsInfoPopover-main__content__tableCell__projectCell"
                              align={"left"}
                            >
                              {row?.projectTask?.projectInsightsTaskDelays
                                ?.length
                                ? row?.projectTask?.projectInsightsTaskDelays[0]
                                    ?.impactDetails?.length
                                  ? Array.from(
                                      new Set(
                                        row?.projectTask?.projectInsightsTaskDelays[0]?.impactDetails?.map(
                                          ({ delay_reason }: any) =>
                                            delay_reason
                                        ) || []
                                      )
                                    ).join(", ")
                                  : "-"
                                : "-"}
                            </TableCell>
                          </TableRow>
                        )
                    )}
                    <TableRow>
                      <TableCell
                        colSpan={12}
                        style={{
                          borderBottom: "none",
                          display: isOpen ? "table-cell" : "none",
                        }}
                      >
                        <Collapse
                          className="insightsInfoPopover-main__content__collapseTabelCell__collapse"
                          in={isOpen}
                          timeout="auto"
                          unmountOnExit
                        >
                          {insightsInfo?.filter(
                            (item: any) =>
                              item?.projectTask?.taskType !== "project"
                          )?.length ? (
                            <TableContainer
                              className={
                                "insightsInfoPopover-main__content__collapseTabelCell__tableContainer"
                              }
                              component={Paper}
                              id={"scrollableDiv2"}
                            >
                              <Table
                                stickyHeader
                                aria-label="sticky table"
                                className={
                                  "insightsInfoPopover-main__content__collapseTabelCell__tableContainer__table"
                                }
                              >
                                <TableBody>
                                  {insightsInfo?.map(
                                    (row: any, j: number) =>
                                      row?.projectTask?.taskType !==
                                        "project" && (
                                        <TableRow
                                          hover
                                          role="checkbox"
                                          tabIndex={-1}
                                          key={j}
                                          className={
                                            props.selectedInsight?.taskId ===
                                            row?.taskId
                                              ? "insightsInfoPopover-main__content__activeRow"
                                              : ""
                                          }
                                        >
                                          <TableCell align="center">
                                            <IconButton
                                              aria-label="expand row"
                                              size="small"
                                              className="insightsInfoPopover-main__content__hiddenTableCell"
                                            >
                                              <RemoveCircleRoundedIcon htmlColor="#fff" />
                                            </IconButton>
                                          </TableCell>
                                          <TableCell
                                            className="insightsInfoPopover-main__content__tableCell insightsInfoPopover-main__content__tableCell__taskName"
                                            align={"left"}
                                          >
                                            {row?.projectTask?.taskName}
                                          </TableCell>
                                          <TableCell
                                            className="insightsInfoPopover-main__content__tableCell insightsInfoPopover-main__content__tableCell__startDate"
                                            align={"center"}
                                          >
                                            {row?.projectTask?.plannedStartDate
                                              ? moment(
                                                  row?.projectTask
                                                    ?.plannedStartDate
                                                ).format("DD MMM YYYY")
                                              : "-"}
                                          </TableCell>
                                          <TableCell
                                            className="insightsInfoPopover-main__content__tableCell"
                                            align={"center"}
                                          >
                                            {row?.projectTask?.plannedEndDate
                                              ? moment(
                                                  row?.projectTask
                                                    ?.plannedEndDate
                                                ).format("DD MMM YYYY")
                                              : "-"}
                                          </TableCell>
                                          <TableCell
                                            className="insightsInfoPopover-main__content__tableCell"
                                            align={"center"}
                                          >
                                            {row?.projectTask
                                              ?.projectInsightsTaskDelays
                                              ?.length
                                              ? row?.projectTask
                                                  ?.projectInsightsTaskDelays[0]
                                                  ?.forecastedStartDate
                                                ? moment(
                                                    row?.projectTask
                                                      ?.projectInsightsTaskDelays[0]
                                                      ?.forecastedStartDate
                                                  ).format("DD MMM YYYY")
                                                : "-"
                                              : "-"}
                                          </TableCell>
                                          <TableCell
                                            className="insightsInfoPopover-main__content__tableCell"
                                            align={"center"}
                                          >
                                            {row?.projectTask
                                              ?.projectInsightsTaskDelays
                                              ?.length
                                              ? row?.projectTask
                                                  ?.projectInsightsTaskDelays[0]
                                                  ?.forecastedEndDate
                                                ? moment(
                                                    row?.projectTask
                                                      ?.projectInsightsTaskDelays[0]
                                                      ?.forecastedEndDate
                                                  ).format("DD MMM YYYY")
                                                : "-"
                                              : "-"}
                                          </TableCell>
                                          <TableCell
                                            className="insightsInfoPopover-main__content__delayTableCell"
                                            align={"center"}
                                          >
                                            {row?.projectTask
                                              ?.projectInsightsTaskDelays
                                              ?.length
                                              ? row?.projectTask
                                                  ?.projectInsightsTaskDelays[0]
                                                  ?.forecastedDelay
                                                ? row?.projectTask
                                                    ?.projectInsightsTaskDelays[0]
                                                    ?.forecastedDelay
                                                : 0
                                              : 0}
                                          </TableCell>
                                          <TableCell
                                            className="insightsInfoPopover-main__content__floatTableCell"
                                            align={"center"}
                                          >
                                            {row?.projectTask
                                              ?.projectInsightsTaskDelays
                                              ?.length
                                              ? row?.projectTask
                                                  ?.projectInsightsTaskDelays[0]
                                                  ?.delayDays
                                                ? row?.projectTask
                                                    ?.projectInsightsTaskDelays[0]
                                                    ?.delayDays
                                                : 0
                                              : 0}
                                          </TableCell>
                                          <TableCell
                                            className="insightsInfoPopover-main__content__floatTableCell"
                                            align={"center"}
                                          >
                                            {row?.projectTask?.float}
                                          </TableCell>
                                          <TableCell
                                            className="insightsInfoPopover-main__content__tableCell"
                                            align={"left"}
                                          >
                                            {row?.projectTask
                                              ?.projectInsightsTaskDelays
                                              ?.length
                                              ? row?.projectTask
                                                  ?.projectInsightsTaskDelays[0]
                                                  ?.impactDetails?.length
                                                ? Array.from(
                                                    new Set(
                                                      row?.projectTask?.projectInsightsTaskDelays[0]?.impactDetails?.map(
                                                        ({
                                                          delay_reason,
                                                        }: any) => delay_reason
                                                      ) || []
                                                    )
                                                  ).join(", ")
                                                : "-"
                                              : "-"}
                                          </TableCell>
                                        </TableRow>
                                      )
                                  )}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          ) : (
                            <div
                              className={"insightsInfoPopover-main__noContent"}
                            >
                              No data available!
                            </div>
                          )}
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </>
        ) : (
          <div className="insightsInfoPopover-main__content__noDataContainer">
            {insightsInfo === null ? (
              <CircularProgress />
            ) : (
              "No Data Available!"
            )}
          </div>
        )}
      </div>
    </Dialog>
  );
}
