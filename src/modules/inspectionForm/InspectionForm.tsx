import React, {
  ReactElement,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import "./InspectionForm.scss";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";
import { useHistory } from "react-router-dom";
import { stateContext } from "../root/context/authentication/authContext";
import {
  FETCH_PUNCHLIST_FORMS,
  FETCH_PUNCHLIST_FORMS_BY_ID,
  GET_CLOSED_INSPECTION_FORMS,
  GET_PROJECT_LOCATION_NODE,
  GET_PROJECT_PARENT_LOCATION_NODE,
  UPDATE_PUNCHLIST_FORM_STATUS,
} from "../Dashboard/graphql/queries/dashboard";
import { client } from "src/services/graphql";
import { decodeToken } from "src/services/authservice";
import BusinessIcon from "@material-ui/icons/Business";
import bgNav from "../../assets/images/bgNav.png";
import {
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  makeStyles,
  Menu,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@material-ui/core";
import { postApi } from "src/services/api";
import moment from "moment";
import axios from "axios";
import { getExchangeToken } from "src/services/authservice";
import InfiniteScroll from "react-infinite-scroll-component";
import InspectionFormTable from "./InspectionFormTable";
import Notify, { AlertTypes } from "../shared/components/Toaster/Toaster";

const useStyles = makeStyles((theme: any) => ({
  paperTransparent: {
    color: "#fff !important",
    fontWeight: "bold",
    boxShadow:
      "0px 5px 1px -1px rgb(0 0 0 / 28%), 0px 1px 1px 0px rgb(0 0 0 / 16%), 0px 1px 3px 0px rgb(0 0 0 / 11%)",
    minWidth: "20rem",
    maxHeight: "20rem",
    backgroundImage: `url(${bgNav})`,
    backgroundRepeat: "no-repeat",
    backgroundSize: "100%",
  },
}));

const InspectionForm = (): ReactElement => {
  const classes: any = useStyles();
  const history = useHistory();
  const { state, dispatch }: any = useContext(stateContext);
  const [headers, setHeaders]: any = useState([
    "",
    "Area",
    "Item",
    "Status",
    "Created By",
    "Submitted On",
    "Inspected on",
    "Notes",
    "Issue Resolved",
    "Supervisor Notes",
    "Attachments",
    "",
  ]);
  const [header, setHeader]: any = useState({
    parent: {},
    child: {},
  });
  const [headerList, setHeaderList]: any = useState({
    parent: [],
    child: [],
  });
  const [currentHeaderList, setCurrentHeaderList]: any = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [pageLimitAndOffset, setPageLimitAndOffset] = useState({
    limit: 10,
    offset: 0,
  });
  const [rows, setRows]: any = useState([]);
  const [childPageLimitAndOffset, setChildPageLimitAndOffset] = useState({
    limit: 5,
    offset: 0,
  });
  const [selectedFormId, setSelectedFormId] = useState("");
  const [isLoading, setIsLoading]: any = useState(null);

  const configId =
    history?.location?.pathname?.split("/")[
      history?.location?.pathname?.split("/")?.length - 1
    ];

  const tableRef: any = useRef(null);
  const token = getExchangeToken();

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
    setIsLoading(true);
    state?.selectedProjectToken && fetchProjectLocationTreeData();
  }, [state?.selectedProjectToken]);

  useEffect(() => {
    state?.selectedProjectToken && fetchProjectLocationById();
  }, [state?.selectedProjectToken, configId]);

  useEffect(() => {
    state?.inspectionFormFeatureId && fetchFormData();
  }, [state?.inspectionFormFeatureId, configId, pageLimitAndOffset]);

  useEffect(() => {
    state?.inspectionFormFeatureId && selectedFormId && fetchFormDataByFormId();
  }, [state?.inspectionFormFeatureId, selectedFormId, childPageLimitAndOffset]);

  const fetchFormData = async () => {
    if (decodeToken()?.adminUser === undefined) return;
    setIsLoading(true);
    try {
      const responseData = await client.query({
        query: FETCH_PUNCHLIST_FORMS,
        variables: {
          featureId: state?.inspectionFormFeatureId,
          limit: pageLimitAndOffset?.limit,
          offset: pageLimitAndOffset?.offset,
          status: decodeToken()?.adminUser ? ["2", "3"] : ["1"],
          configId: configId,
        },
        fetchPolicy: "network-only",
        context: {
          role: "viewForm",
          token: state?.selectedProjectToken,
        },
      });

      if (responseData.data.forms?.length > 0) {
        const rowGridData = await formatFormResponseData(
          responseData.data.forms
        );
        setRows([...rows, ...rowGridData]);
      }
      setIsLoading(false);
    } catch (error) {
      console.log("error", error);
      setRows([]);
      setIsLoading(false);
    }
  };

  const formatFormResponseData = async (responseData: any) => {
    try {
      const rowGridData: any = [];
      for (const item of responseData) {
        const buildingfield = item.formsLocationLists.find(
          (field: any) =>
            field.formTemplateFieldData.caption === "Building/Lot#"
        );

        const datefield = item?.formsData[0];

        const status = item?.metadata?.status;

        const updatedatfield = item?.updatedAt;

        const area = item.childForms[0]?.formsConfigLists.find(
          (field: any) =>
            field.formTemplateFieldData.caption === "Quality Control Area"
        );

        const itemVal = item.childForms[0]?.formsConfigLists.find(
          (field: any) =>
            field.formTemplateFieldData.caption === "Quality Control Item"
        );

        const qualityStandardMet = item.childForms[0]?.formsData?.find(
          (field: any) => field?.caption === "Quality Standard Met?"
        );

        const supervisorNotes = item.childForms[0]?.formsData?.find(
          (field: any) => field?.caption === "Supervisor Notes"
        );
        const issueResolved = item.childForms[0]?.formsData?.find(
          (field: any) => field?.caption === "Issue Resolved?"
        );
        const notes = item.childForms[0]?.formsData?.find(
          (field: any) => field?.caption === "Notes"
        );

        const attachments = await generateUrlForAttachments(
          item.childForms[0]?.attachments
        );
        rowGridData.push({
          parent:
            buildingfield.locationValue?.length > 1
              ? buildingfield.locationValue[1]
              : buildingfield.locationValue[0],
          buildingId: buildingfield.formLocationValue.nodeName,
          id: item?.id,
          createdBy: `${item?.createdByUser?.firstName} ${item?.createdByUser?.lastName}`,
          submissionDate: moment(updatedatfield).format("DD MMM YYYY"),
          inspectionDate: moment(datefield?.valueDate).format("DD MMM YYYY"),
          status: status,
          area: area?.configurationValue?.nodeName
            ? area?.configurationValue?.nodeName
            : "-",
          item: itemVal?.configurationValue?.nodeName
            ? itemVal?.configurationValue?.nodeName
            : "-",
          qualityStandardMet:
            qualityStandardMet?.valueBool === true ? "Yes" : "No",
          supervisorNotes: supervisorNotes?.valueString
            ? supervisorNotes?.valueString
            : "-",
          issueResolved: issueResolved?.valueBool === true ? "Yes" : "No",
          notes: notes?.valueString ? notes?.valueString : "-",
          attachments: attachments,
          isOpen: false,
        });
      }
      return rowGridData;
    } catch (error: any) {
      console.log(error);
    }
  };

  const generateUrlForAttachments = async (attachments: any) => {
    if (attachments?.length === 0) return [];
    const payload: any = [];

    attachments?.forEach((item: any) => {
      payload.push({
        fileName: item?.fileName,
        key: item?.blobKey,
        expiresIn: 1000,
      });
    });

    try {
      const fileUploadResponse = await postApi("V1/S3/downloadLink", payload);
      const temp: any = [];
      attachments?.forEach((item: any) => {
        const data = fileUploadResponse?.success.find(
          (res: any) => res.key === item?.blobKey
        );

        if (data) {
          temp.push({ ...item, url: data.url });
        }
      });
      return temp;
    } catch (error) {
      setIsLoading(false);
    }
  };

  const fetchData = () => {
    tableRef.current.scrollTop > 0 &&
      setPageLimitAndOffset({
        limit: 10,
        offset: pageLimitAndOffset.offset + 10,
      });
  };

  const fetchFormDataByFormId = async () => {
    try {
      setIsLoading(true);
      const responseData = await client.query({
        query: FETCH_PUNCHLIST_FORMS_BY_ID,
        variables: {
          featureId: state?.inspectionFormFeatureId,
          limit: childPageLimitAndOffset?.limit,
          offset: childPageLimitAndOffset?.offset,
          status: decodeToken()?.adminUser ? ["2", "3"] : ["1"],
          formId: selectedFormId,
        },
        fetchPolicy: "network-only",
        context: {
          role: "viewForm",
          token: state?.selectedProjectToken,
        },
      });
      if (responseData.data.forms[0]?.childForms?.length > 1) {
        const childFormsData: any = [];
        for (const item of responseData.data.forms[0]?.childForms) {
          const area = item?.formsConfigLists.find(
            (field: any) =>
              field.formTemplateFieldData.caption === "Quality Control Area"
          );

          const itemVal = item?.formsConfigLists.find(
            (field: any) =>
              field.formTemplateFieldData.caption === "Quality Control Item"
          );
          const status = item?.metadata?.status;
          const qualityStandardMet = item?.formsData?.find(
            (field: any) => field?.caption === "Quality Standard Met?"
          );

          const supervisorNotes = item?.formsData?.find(
            (field: any) => field?.caption === "Supervisor Notes"
          );
          const issueResolved = item?.formsData?.find(
            (field: any) => field?.caption === "Issue Resolved?"
          );
          const notes = item?.formsData?.find(
            (field: any) => field?.caption === "Notes"
          );
          const attachments = await generateUrlForAttachments(item.attachments);
          childFormsData.push({
            id: item?.id,
            area: area?.configurationValue?.nodeName
              ? area?.configurationValue?.nodeName
              : "-",
            item: itemVal?.configurationValue?.nodeName
              ? itemVal?.configurationValue?.nodeName
              : "-",
            qualityStandardMet:
              qualityStandardMet?.valueBool === true ? "Yes" : "No",
            supervisorNotes: supervisorNotes?.valueString
              ? supervisorNotes?.valueString
              : "-",
            issueResolved: issueResolved?.valueBool === true ? "Yes" : "No",
            notes: notes?.valueString ? notes?.valueString : "-",
            attachments: attachments,
            status: status,
          });
        }
        const data = [...rows]?.map((item: any) => {
          if (item?.id === selectedFormId) {
            return {
              ...item,
              isOpen: true,
              childData: item?.childData?.length
                ? [...item?.childData, ...childFormsData]
                : childFormsData,
            };
          } else {
            return {
              ...item,
              isOpen: false,
              childData: [],
            };
          }
        });
        setRows(data);
      } else if (childPageLimitAndOffset?.offset === 0) {
        const data = [...rows]?.map((item: any) => {
          if (item?.id === selectedFormId) {
            return {
              ...item,
              isOpen: true,
              childData: [],
            };
          } else {
            return {
              ...item,
              isOpen: false,
              childData: [],
            };
          }
        });
        setRows(data);
      }
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.log(error);
    }
  };

  const fetchChildData = () => {
    setChildPageLimitAndOffset({
      limit: 5,
      offset: childPageLimitAndOffset.offset + 5,
    });
  };

  const fetchProjectLocationTreeData = async () => {
    try {
      const responseData = await client.query({
        query: GET_PROJECT_PARENT_LOCATION_NODE,
        variables: {
          status: decodeToken()?.adminUser ? ["2", "3"] : ["1"],
        },
        fetchPolicy: "network-only",
        context: {
          role: "viewForm",
          token: state?.selectedProjectToken,
        },
      });

      const sortedData: any = [
        ...responseData.data.projectLocationTree[0]?.childNodes,
      ]
        ?.sort(
          (a: any, b: any) =>
            a.nodeName.split(" ")[1] - b.nodeName.split(" ")[1]
        )
        ?.map((item: any) => {
          return {
            id: item?.id,
            name: item?.nodeName,
            isParent: true,
          };
        });

      sortedData?.forEach((item: any) => {
        item?.id === configId &&
          setHeader(() => {
            return {
              parent: { id: item?.id, name: item?.name },
              child: { id: "", name: "Select Item" },
            };
          });
      });

      setHeaderList((prevState: any) => {
        return {
          ...prevState,
          parent: sortedData,
        };
      });
    } catch (error) {
      console.log("error", error);
      setIsLoading(false);
    }
  };

  const fetchProjectLocationById = async (id?: any) => {
    setIsLoading(true);
    try {
      const responseData = await client.query({
        query: GET_PROJECT_LOCATION_NODE,
        variables: {
          id: configId,
          status: decodeToken()?.adminUser ? ["2", "3"] : ["1"],
        },
        fetchPolicy: "network-only",
        context: {
          role: "viewForm",
          token: state?.selectedProjectToken,
        },
      });
      let sortedData: any = [];
      if (
        responseData.data.projectLocationTree?.length &&
        responseData.data.projectLocationTree[0]?.childNodes?.length
      ) {
        sortedData = [...responseData.data.projectLocationTree[0]?.childNodes]
          ?.sort(
            (a: any, b: any) =>
              a.nodeName.split(" ")[1] - b.nodeName.split(" ")[1]
          )
          ?.map((item: any) => {
            return {
              id: item?.id,
              name: item?.nodeName,
            };
          });
      } else if (responseData.data.projectLocationTree?.length) {
        sortedData = [
          ...responseData.data.projectLocationTree[0]?.locationByParentId
            ?.childNodes,
        ]
          ?.sort(
            (a: any, b: any) =>
              a.nodeName.split(" ")[1] - b.nodeName.split(" ")[1]
          )
          ?.map((item: any) => {
            return {
              id: item?.id,
              name: item?.nodeName,
            };
          });
        setHeader(() => {
          return {
            parent: {
              id: responseData.data.projectLocationTree[0]?.locationByParentId
                ?.id,
              name: responseData.data.projectLocationTree[0]?.locationByParentId
                ?.nodeName,
            },
            child: sortedData.find(
              (item: any) =>
                item?.id === configId && {
                  id: item?.id,
                  name: item?.name,
                }
            ),
          };
        });
      }
      setHeaderList((prevState: any) => {
        return {
          ...prevState,
          child: [{ id: "", name: "Select Item" }, ...sortedData],
        };
      });
    } catch (error) {
      console.log("error", error);
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleClick = (event: any) => {
    event.preventDefault();
    setAnchorEl(event.currentTarget);
  };

  const handleBuildingOrLotChange = (item: any) => {
    tableRef.current.scrollTop = 0;
    let id = "";
    if (item?.isParent) {
      setHeader({
        ...header,
        [currentHeaderList]: {
          id: item?.id,
          name: item?.name,
        },
        child: { id: "", name: "Select Item" },
      });
      id = item?.id;
      history.replace(`/inspectionForm/${item?.id}`);
    } else if (!item?.id) {
      setHeader({
        ...header,
        child: { id: "", name: "Select Item" },
      });
      id = header?.parent?.id;
    } else {
      setHeader({
        ...header,
        child: { id: item?.id, name: item?.name },
      });
      id = item?.id;
    }
    id && history.replace(`/inspectionForm/${id}`);
    handleClose();
    setRows([]);
    setPageLimitAndOffset({
      limit: 10,
      offset: 0,
    });
  };

  const handleOpenRow = (id: string) => {
    setIsLoading(true);
    if (id !== selectedFormId) {
      setChildPageLimitAndOffset({ limit: 5, offset: 0 });
      setSelectedFormId(id);
    } else {
      setSelectedFormId("");
      const data = [...rows]?.map((item: any) => {
        if (item?.id === selectedFormId) {
          return {
            ...item,
            isOpen: false,
            childData: [],
          };
        } else {
          return {
            ...item,
            isOpen: false,
            childData: [],
          };
        }
      });
      setRows(data);
      setIsLoading(false);
    }
  };

  const generatePdf = async (id: number) => {
    try {
      setIsLoading(true);
      await axios.get(
        `${process.env["REACT_APP_DASHBOARD_URL"]}dashboard/v1/generatePdf?portfolioId=${state.currentPortfolio?.portfolioId}&projectId=${state.currentProject?.projectId}&formId=${id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      setIsLoading(false);
    }
  };

  const updatePunchlistForm = async (
    e: any,
    id: number,
    formType: string,
    parentId?: number
  ) => {
    try {
      setIsLoading(true);
      if (formType === "parent") {
        const responseData = await client.mutate({
          mutation: GET_CLOSED_INSPECTION_FORMS,
          variables: {
            formId: id,
            status: "CLOSED",
          },
          context: {
            role: "viewForm",
            token: state?.selectedProjectToken,
          },
        });
        if (responseData?.data?.qcforms?.length > 1) {
          setIsLoading(false);
          Notify.sendNotification("Open forms available!", AlertTypes.error);
          return;
        }
      }
      const status = e.target.value;
      const responseData = await client.mutate({
        mutation: UPDATE_PUNCHLIST_FORM_STATUS,
        variables: {
          formId: id,
          status: status,
        },
        context: {
          role: "updateForm",
          token: state?.selectedProjectToken,
        },
      });
      const selectedStatus =
        responseData?.data?.update_forms?.returning[0]?.metadata?.status;
      if (selectedStatus === status) {
        const data = rows?.map((item: any) => {
          if (item?.id === id) {
            return {
              ...item,
              status: selectedStatus,
            };
          } else {
            return {
              ...item,
              childData: item?.childData?.map((val: any) => {
                if (val?.id === id) {
                  return {
                    ...val,
                    status: selectedStatus,
                  };
                } else {
                  return val;
                }
              }),
            };
          }
        });
        setRows(data);
        formType === "parent"
          ? generatePdf(id)
          : parentId && generatePdf(parentId);
        Notify.sendNotification(
          "Status updated successfully!",
          AlertTypes.success
        );
      }
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.log("error", error);
    }
  };

  if (
    isLoading &&
    pageLimitAndOffset.offset === 0 &&
    !header?.parent?.id &&
    !header?.child?.id
  ) {
    return (
      <div className="inspectionForm-main__loadContainer">
        <CircularProgress color="inherit" />
      </div>
    );
  }

  return (
    <div className={"inspectionForm-main"}>
      <div className={"inspectionForm-main__header"}>
        <ArrowBackIosIcon
          className={"inspectionForm-main__header__icon"}
          onClick={() => {
            history.push("/inspection");
          }}
        />
        Inspection Form
      </div>
      {header?.parent?.id || header?.child?.id ? (
        <>
          <div
            className={
              header?.child?.id
                ? "inspectionForm-main__breadCrumbContainer"
                : "inspectionForm-main__breadCrumbContainer inspectionForm-main__breadCrumbContainer__boldText"
            }
          >
            <span
              className={
                "inspectionForm-main__breadCrumbContainer__iconContainer"
              }
              onClick={(e: any) => {
                setCurrentHeaderList("parent");
                handleClick(e);
              }}
            >
              <BusinessIcon
                htmlColor="orange"
                className={
                  "inspectionForm-main__breadCrumbContainer__iconContainer__icon"
                }
              />
              <span>{header?.parent?.name}</span>
            </span>
            <span
              className={
                header?.child?.id
                  ? "inspectionForm-main__breadCrumbContainer__boldText"
                  : "inspectionForm-main__breadCrumbContainer__normalText"
              }
            >
              <span
                className={"inspectionForm-main__breadCrumbContainer__arrow"}
              >
                {">"}
              </span>
              <span
                className={
                  "inspectionForm-main__breadCrumbContainer__arrow__text"
                }
                onClick={(e: any) => {
                  setCurrentHeaderList("child");
                  handleClick(e);
                }}
              >
                {header?.child?.name}
              </span>
            </span>
          </div>
          <Menu
            className="moduleDropdown-main"
            id="module-appbar"
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleClose}
            getContentAnchorEl={null}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "left",
            }}
            classes={{
              paper: classes.paperTransparent,
            }}
          >
            {headerList?.[currentHeaderList]?.map((item: any) => (
              <List key={item?.id} component="div" disablePadding>
                <ListItem
                  button
                  onClick={() => {
                    handleBuildingOrLotChange(item);
                  }}
                  disabled={item?.disable}
                  selected={item?.id === header?.[currentHeaderList]?.id}
                >
                  <ListItemText primary={item.name} />
                </ListItem>
              </List>
            ))}
          </Menu>
          <InfiniteScroll
            dataLength={rows?.length ? rows?.length : 0} //This is important field to render the next data
            next={() => fetchData()}
            hasMore={true}
            loader={""}
            scrollableTarget="scrollableDiv1"
            className="inspectionForm-main__infiniteScrollContainer"
          >
            <TableContainer
              ref={tableRef}
              className="inspectionForm-main__infiniteScrollContainer__tableContainer"
              component={Paper}
              id={"scrollableDiv1"}
            >
              <Table aria-label="collapsible table" stickyHeader>
                <TableHead>
                  <TableRow>
                    {headers?.map((item: string, i: number) => (
                      <TableCell
                        key={i}
                        className="inspectionForm-main__infiniteScrollContainer__tableContainer__headCell"
                        align={i === 1 ? "left" : "center"}
                      >
                        {item}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows?.length
                    ? rows.map((row: any, i: number) => (
                        <InspectionFormTable
                          key={i}
                          row={row}
                          handleOpenRow={handleOpenRow}
                          fetchData={fetchChildData}
                          handleStatusChange={updatePunchlistForm}
                          header={header}
                        />
                      ))
                    : header?.parent?.id &&
                      !isLoading && (
                        <TableRow>
                          <TableCell
                            colSpan={12}
                            align="center"
                            style={{
                              borderBottom: 0,
                            }}
                          >
                            No forms available!
                          </TableCell>
                        </TableRow>
                      )}
                </TableBody>
              </Table>
            </TableContainer>
          </InfiniteScroll>
        </>
      ) : (
        !isLoading &&
        !header?.parent?.id && (
          <div className="inspectionForm-main__invalidUrl">
            Something went wrong. Please enter valid URL!
          </div>
        )
      )}
    </div>
  );
};

export default InspectionForm;
