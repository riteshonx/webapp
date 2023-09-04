import React, { createContext, useContext, useEffect, useState } from "react";
import {
  Paper,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  Button,
  TextField,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";
import FiberManualRecordRoundedIcon from "@mui/icons-material/FiberManualRecordRounded";
import moment from "moment";
import { GET_CONNECTORS_DETAILS } from "src/modules/Dashboard/graphql/queries/dashboard";
import {
  decodeExchangeToken,
  getExchangeToken,
} from "src/services/authservice";
import { client } from "src/services/graphql";
import { useHistory } from "react-router-dom";
import { stateContext } from "src/modules/root/context/authentication/authContext";
import img from "../../../../../../assets/images/connectorbg.png";
import "./ConnectorsScreen.scss";
import {
  setIsLoading,
  setSourceSystem,
} from "src/modules/root/context/authentication/action";
import {
  fetchConnectorToken,
  getConnectorsToken,
  getSlateProjects,
  getSyncedProjectFromConnectors,
} from "../../../Connectors/actions/actions";
import {
  AgaveLinkType,
  ConnRowData,
  Project,
  ProjectDataInterface,
} from "../../../Connectors/utils/types";
import { getSourceSystemLabel } from "../../../Connectors/utils/helper";
import SourceProjectDropDown from "../../../Connectors/SourceProjectDropDown";
import MenuListComposition from "../../../Connectors/MenuListComposition";
import { Theme, createStyles, makeStyles } from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";
import AgaveLink from "../../../Connectors/AgaveLink";

const columns: any = [
  {
    id: "connectedSystem",
    label: "Connected System",
    align: "left",
    tabs: [1, 2],
    color: "#B27F3B",
  },
  {
    id: "artifactsIngested",
    label: "Artifact Ingested",
    align: "left",
    tabs: [1, 2],
    color: "#A37938",
  },
  {
    id: "count",
    label: "Count",
    align: "left",
    tabs: [1, 2],
    color: "#8F6C35",
  },
  {
    id: "lastSyncedOn",
    label: "Last Synced on",
    align: "left",
    tabs: [1],
    color: "#A28F71",
  },
  {
    id: "lastUpdatedOn",
    label: "Last Updated on",
    align: "left",
    tabs: [2],
    color: "#634E2E",
  },
  {
    id: "sourceproject",
    label: "Source project",
    align: "left",
    tabs: [1],
    color: "#634E2E",
  },
  {
    id: "status",
    label: "Status",
    align: "left",
    tabs: [1],
    color: "#171D25",
  },
  {
    id: "redirect",
    label: "",
    align: "right",
    tabs: [1, 2],
    color: "#171D25",
  },
];

const uploadActions: any = ["BIM", "Documents", "Drawings", "Specifications"];

interface Props {
  fetchProjectState: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
}

export const SelSourceProjectContext = createContext<{
  selSourceProjectState: [
    {
      [key: string]: { value: ProjectDataInterface | undefined; idx: number };
    },
    React.Dispatch<
      React.SetStateAction<{
        [key: string]: { value: ProjectDataInterface | undefined; idx: number };
      }>
    >
  ];
}>({
  selSourceProjectState: [
    {},
    () => {
      return;
    },
  ],
});

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: "100%",
      "& .MuiPaper-elevation1": {
        boxShadow: "none",
      },
      MuiTableCell: {
        head: {
          backgroundColor: "red !important",
        },
      },
    },
    container: {
      height: "calc(100vh - 300px)",
      width: "100%",
      flexGrow: 1,
      overflow: "auto",
      margin: "10px 0px",
      boxShadow: "0 0px 5px 0 rgba(0,0,0,.12), 0 1px 10px 0 #000",
    },
    paper: {
      width: "100%",
      marginBottom: theme.spacing(0),
      padding: "0 15rem",
      backgroundColor: "#171d25 !important",
      boxShadow: "none !important",
    },
    table: {},
  })
);

const filterOptions = ["All", "Connected", "Not Connected"];

const ConnectorsScreen = () => {
  const classes = useStyles();
  const history = useHistory();
  const { dispatch, state }: any = useContext(stateContext);
  const selectedConnectorTab = localStorage.getItem("selectedConnectorTab");
  const sourceSystem = state?.sourceSystem;
  const [connectorsData, setConnectorsData]: any = useState(null);
  const [isRefetchProject, setRefetchProject]: any = useState(false);
  const [selectedFilter, setSelectedFilter]: any = useState("All");
  const [searchQry, setSearchQry] = useState("");
  const [selectedTab, setSelectedTab] = useState(
    selectedConnectorTab ? JSON.parse(selectedConnectorTab) : 1
  );
  const [projects, setProjects] = useState<{
    sourceProject: ProjectDataInterface[];
    targetProject: Array<ProjectDataInterface | Project>;
  }>({
    sourceProject: [],
    targetProject: [],
  });
  const selSourceProjectState = useState<{
    [key: string]: { value: ProjectDataInterface | undefined; idx: number };
  }>({});

  useEffect(() => {
    state.currentProject?.projectId && getFeatureDetails();
  }, [state.currentProject]);

  const handleFetchProjects = async (): Promise<any> => {
    try {
      dispatch(setIsLoading(true));
      const { sourceProject, targetProject } = await getSlateProjects(
        sourceSystem
      );
      setProjects({ sourceProject, targetProject });
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  const handleTabSelection = (tab: any) => {
    localStorage.setItem("selectedConnectorTab", JSON.stringify(tab));
    setSelectedTab(tab);
  };

  React.useEffect(() => {
    async function apiCall() {
      await handleFetchProjects();
    }
    if (isRefetchProject) {
      apiCall();
      setRefetchProject(false);
    }
  }, [isRefetchProject]);

  React.useEffect(() => {
    async function apiCall() {
      try {
        dispatch(setIsLoading(true));
        await fetchConnectorToken();
        await handleFetchProjects();
        const agaveInfo = localStorage.getItem("agaveInfo");
        if (agaveInfo) {
          dispatch(setSourceSystem(JSON.parse(agaveInfo)));
        }
      } catch (err) {
      } finally {
        dispatch(setIsLoading(false));
      }
    }
    apiCall();
    return () => {
      localStorage.removeItem("connectorToken");
    };
  }, []);

  React.useEffect(() => {
    async function apiCall() {
      try {
        dispatch(setIsLoading(true));
        const sourceProject = await getSyncedProjectFromConnectors(
          sourceSystem as AgaveLinkType
        );
        setProjects((prev) => ({
          ...prev,
          sourceProject,
        }));
        selSourceProjectState[1]({});
      } finally {
        dispatch(setIsLoading(false));
      }
    }
    const token = getConnectorsToken();
    if (sourceSystem && token) {
      apiCall();
    }
  }, [sourceSystem]);
  const rows = projects.targetProject.map((item) => {
    if ("id" in item) {
      return {
        id: item.id.toString(),
        projectId: item.id,
        targetProjectName: item.name,
        sourceProject: projects.sourceProject,
        source: "Slate",
        metadata: {},
        agaveProjectId: "",
      };
    } else {
      const label = getSourceSystemLabel(item.metadata);
      return {
        id: `${item.projectId}__${label}`,
        projectId: item.projectId,
        sourceProject: projects.sourceProject,
        source: label,
        targetProjectName: item.project.name,
        metadata: item.metadata,
        agaveProjectId: item.agaveProjectId,
      };
    }
  });

  const selectedRow: any = rows?.find(
    ({ projectId }: any) => projectId === state.currentProject?.projectId
  );

  const sources =
    selectedRow &&
    Object.keys(selectedRow) &&
    connectorsData
      ?.filter(({ connectedSystem }: any) => connectedSystem !== "Slate")
      ?.map(({ featureId, sourceProject }: any) => {
        return {
          ...selectedRow,
          featureId,
          agaveProjectId: sourceSystem
            ? sourceProject?.agaveProjectId
            : selectedRow?.agaveProjectId,
          metadata: sourceSystem
            ? sourceProject?.metadata
            : selectedRow?.metadata,
        };
      });

  const getFeatureDetails = async () => {
    try {
      const response = await client.query({
        query: GET_CONNECTORS_DETAILS,
        variables: {
          tenantId: decodeExchangeToken().tenantId,
          projectId: state.currentProject?.projectId,
          sourceSystem: ["Procore", "BIM 360"],
        },
        fetchPolicy: "network-only",
        context: {
          role: "viewMyProjects",
          token: getExchangeToken(),
        },
      });
      setConnectorsData(response?.data?.connectorsDashboard_query);
    } catch (error) {
      console.log(error);
    }
  };

  const handleUrlRedirection = (featureName: string, featureId: number) => {
    if (featureName === "Schedule") {
      history.push(
        `/scheduling/project-plan/${state.currentProject?.projectId}`
      );
    } else if (featureName === "Visualize") {
      history.push(`/visualize/${state.currentProject?.projectId}`);
    } else if (featureName === "Documents") {
      history.push(
        `/documentlibrary/projects/${state.currentProject?.projectId}?upload=true`
      );
    } else if (featureName === "Drawings") {
      history.push(
        `/drawings/projects/${state.currentProject?.projectId}/lists?upload=true`
      );
    } else if (featureName === "Specifications") {
      history.push(
        `/specifications/projects/${state.currentProject?.projectId}/lists`
      );
    } else if (featureName === "BIM") {
      history.push(`/bim/${state.currentProject?.projectId}/list?upload=true`);
    } else {
      history.push(
        `/base/projects/${state.currentProject?.projectId}/form/${featureId}`
      );
    }
  };

  const handleSearchQry = (ev: any) => {
    setSearchQry(ev?.target.value);
  };
  const handleFilterChange = (evt: SelectChangeEvent) => {
    setSelectedFilter(evt?.target?.value);
  };
  return (
    <SelSourceProjectContext.Provider
      value={{
        selSourceProjectState,
      }}
    >
      <div className="connectorsScreen-main">
        <div className="connectorsScreen-main__title">
          Slate Connected Ecosystem
        </div>
        <div className="connectorsScreen-main__content">
          <div className="connectorsScreen-main__content__headContainer">
            <div className="connectorsScreen-main__content__headContainer__imgTxtContainer">
              <img
                src={img}
                className="connectorsScreen-main__content__headContainer__imgTxtContainer__img"
              ></img>
              <div className="connectorsScreen-main__content__tabs">
                <div
                  className={`connectorsScreen-main__content__tabs__tab ${
                    selectedTab === 1
                      ? "connectorsScreen-main__content__tabs__tab__active"
                      : ""
                  }`}
                  onClick={() => handleTabSelection(1)}
                >
                  3rd Party Connections
                </div>
                <div
                  className={`connectorsScreen-main__content__tabs__tab ${
                    selectedTab === 2
                      ? "connectorsScreen-main__content__tabs__tab__active"
                      : ""
                  }`}
                  onClick={() => handleTabSelection(2)}
                >
                  Slate Connections
                </div>
              </div>
            </div>
            {/* {selectedTab === 1 && (
              <div className="connectorsScreen-main__content__headContainer__loginBtn">
                <AgaveLink />
              </div>
            )} */}
            {/* <div className="connectorsScreen-main__content__headContainer__searchAndFilterContainer">
              <div className="connectorsScreen-main__content__headContainer__searchAndFilterContainer__search">
                <TextField
                  id="team-list-search-text"
                  label="Search by Artifacts"
                  type="text"
                  fullWidth
                  placeholder="Search"
                  autoComplete="off"
                  variant="outlined"
                  onChange={handleSearchQry}
                />
                <SearchIcon className="connectorsScreen-main__content__headContainer__searchAndFilterContainer__search__icon" />
              </div>
              <div className="connectorsScreen-main__content__headContainer__searchAndFilterContainer__filter">
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  onChange={handleFilterChange}
                  value={selectedFilter}
                  variant="outlined"
                  sx={{
                    height: "32px",
                    width: "90%",
                    fontSize: "1.2rem",
                    color: "#fff",
                    "&:hover::before": {
                      borderBottom: "0.5px solid #fff !important",
                    },
                    "&::before": {
                      borderColor: "#fff",
                    },
                    "&::after": {
                      borderColor: "#fff",
                    },
                    ".MuiSvgIcon-root ": {
                      fill: "white !important",
                    },
                  }}
                >
                  {filterOptions.map((option, idx) => (
                    <MenuItem
                      key={idx}
                      value={option}
                      sx={{ fontSize: "1.2rem" }}
                    >
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </div>
            </div> */}
          </div>
          {state?.sourceSystem && selectedTab === 1 ? (
            <div className="connectorsScreen-main__content__connectedSystemName">{`Connected to ${state?.sourceSystem?.name}`}</div>
          ) : null}
          <Paper className={classes.paper}>
            <TableContainer className={classes.container}>
              <Table
                stickyHeader
                aria-label="sticky table"
                className={classes.table}
              >
                <TableHead>
                  <TableRow
                    sx={{ "& th": { backgroundColor: "#8F6C35 !important" } }}
                  >
                    {columns
                      ?.filter((col: any) => col?.tabs.includes(selectedTab))
                      .map((column: any) => (
                        <TableCell key={column.id} align={column.align}>
                          {column.label}
                        </TableCell>
                      ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {connectorsData?.length ? (
                    connectorsData
                      ?.filter((row: any) =>
                        selectedTab === 1
                          ? row?.connectedSystem !== "Slate"
                          : row?.connectedSystem === "Slate"
                      )
                      ?.filter((row: any) =>
                        searchQry !== ""
                          ? row?.artifactsIngested
                              ?.toLowerCase()
                              .indexOf(searchQry?.toLocaleLowerCase()) > -1
                          : true
                      )
                      ?.filter((row: any) =>
                        selectedFilter === "All"
                          ? true
                          : row?.status === selectedFilter
                      )
                      ?.map((row: any, i: number) => {
                        return (
                          <TableRow hover role="checkbox" tabIndex={-1} key={i}>
                            <TableCell align={"left"}>
                              {row?.connectedSystem}
                            </TableCell>
                            <TableCell align={"left"}>
                              <span
                                style={{ color: "#fe9a0b" }}
                                className={
                                  "connectorsScreen-main__content__artifactsIngestedText"
                                }
                                onClick={() =>
                                  handleUrlRedirection(
                                    row?.artifactsIngested,
                                    row?.featureId
                                  )
                                }
                              >
                                {row?.artifactsIngested}
                              </span>
                            </TableCell>
                            <TableCell align={"left"}>{row?.count}</TableCell>
                            <TableCell align={"left"}>
                              <div className="connectorsScreen-main__content__lastSyncDiv">
                                {row?.lastSyncDate
                                  ? moment(row?.lastSyncDate)
                                      .utc()
                                      .format("MM/DD/YYYY HH:mm:ss")
                                  : "-"}
                                {row?.lastSyncDate ? (
                                  moment().diff(
                                    moment(row?.lastSyncDate),
                                    "hours"
                                  ) < 48 ? (
                                    <FiberManualRecordRoundedIcon
                                      className="connectorsScreen-main__content__lastSyncDiv__icon"
                                      htmlColor="#008000"
                                    />
                                  ) : (
                                    <FiberManualRecordRoundedIcon
                                      className="connectorsScreen-main__content__lastSyncDiv__icon"
                                      htmlColor="#fe9a0b"
                                    />
                                  )
                                ) : (
                                  "-"
                                )}
                              </div>
                            </TableCell>{" "}
                            {row?.connectedSystem !== "Slate" && (
                              <TableCell align={"left"}>
                                {sources?.length && (
                                  <SourceProjectDropDown
                                    row={sources[i] as ConnRowData}
                                    data={row}
                                  />
                                )}
                              </TableCell>
                            )}
                            {row?.connectedSystem !== "Slate" && (
                              <TableCell align={"left"}>
                                {row?.status}
                              </TableCell>
                            )}
                            <TableCell
                              align={
                                row?.connectedSystem !== "Slate"
                                  ? "right"
                                  : "left"
                              }
                            >
                              {row?.connectedSystem !== "PM4" ? (
                                row?.connectedSystem !== "Slate" &&
                                row?.artifactsIngested !== "Schedule" ? (
                                  sources?.length && (
                                    <MenuListComposition
                                      status={row?.status}
                                      row={sources[i] as ConnRowData}
                                      selectedArtifact={row?.artifactsIngested}
                                    />
                                  )
                                ) : (
                                  <Button
                                    onClick={() => {
                                      handleUrlRedirection(
                                        row?.artifactsIngested,
                                        row?.featureId
                                      );
                                    }}
                                    variant="outlined"
                                    data-testid="connectors-agavelink"
                                    className="btn-primary"
                                  >
                                    {uploadActions?.includes(
                                      row?.artifactsIngested
                                    )
                                      ? `Upload`
                                      : row?.artifactsIngested === "Schedule"
                                      ? "Import"
                                      : "Create"}
                                  </Button>
                                )
                              ) : null}
                            </TableCell>
                          </TableRow>
                        );
                      })
                  ) : (
                    <TableRow hover role="checkbox" tabIndex={-1}>
                      <TableCell colSpan={6} align={"center"}>
                        {connectorsData?.length === 0 &&
                          !state?.isLoading &&
                          "No Data Available!"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </div>
      </div>
    </SelSourceProjectContext.Provider>
  );
};

export default ConnectorsScreen;
