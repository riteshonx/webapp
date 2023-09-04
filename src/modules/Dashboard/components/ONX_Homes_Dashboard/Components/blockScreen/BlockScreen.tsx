import {
  FormControl,
  IconButton,
  makeStyles,
  MenuItem,
  Select,
} from "@material-ui/core";
import { useContext, useEffect, useState } from "react";
import {
  GET_LOCATION_TREE_BY_ID,
  GET_PROJECT_PARENT_LOCATION_NODE,
} from "src/modules/Dashboard/graphql/queries/dashboard";
import { setIsLoading } from "src/modules/root/context/authentication/action";
import { stateContext } from "src/modules/root/context/authentication/authContext";
import { decodeToken } from "src/services/authservice";
import { client } from "src/services/graphql";
import bgNav from "../../../../../../assets/images/bgNav.png";
import BusinessIcon from "@material-ui/icons/Business";
import "./BlockScreen.scss";
import { useHistory } from "react-router-dom";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";

const useStyles = makeStyles((theme: any) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
}));

const BlockScreen = () => {
  const classes = useStyles();
  const { state, dispatch }: any = useContext(stateContext);
  const history = useHistory();
  const [locationTreeData, setLocationTreeData]: any = useState(null);
  const [activeHeaderList, setActiveHeaderList]: any = useState([]);
  const [dropdownData, setDropdownData]: any = useState([]);

  useEffect(() => {
    dispatch(setIsLoading(true));
    state?.selectedProjectToken && fetchProjectLocationTreeData();
  }, [state?.selectedProjectToken]);

  const fetchProjectLocationTreeData = async () => {
    try {
      dispatch(setIsLoading(true));
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
      dispatch(setIsLoading(false));
      const val = {
        id: responseData.data.projectLocationTree[0]?.id,
        nodeName: "Buildings",
      };
      setActiveHeaderList([val]);

      const data: any = {
        ...responseData.data.projectLocationTree[0],
        childNodes: responseData.data.projectLocationTree[0]?.childNodes?.map(
          (item: any) => {
            let inProgressCount = 0;
            let openCount = 0;
            item.childNodes?.forEach((val: any) =>
              val?.formsLocationLists?.length ? inProgressCount++ : openCount++
            );
            return {
              ...item,
              numOfForms: item?.formsLocationLists?.length,
              numOfLots: item?.childNodes?.length,
              inProgress: inProgressCount,
              open: openCount,
              isParent: true,
            };
          }
        ),
      };
      setDropdownData(data?.childNodes);
      setLocationTreeData(data);
    } catch (error: any) {
      dispatch(setIsLoading(false));
      console.log(error.message);
    }
  };

  const fetchProjectLocationById = async (id: string) => {
    dispatch(setIsLoading(true));
    try {
      const responseData = await client.query({
        query: GET_LOCATION_TREE_BY_ID,
        variables: {
          id: id,
          status: decodeToken()?.adminUser ? ["2", "3"] : ["1"],
        },
        fetchPolicy: "network-only",
        context: {
          role: "viewForm",
          token: state?.selectedProjectToken,
        },
      });
      dispatch(setIsLoading(false));
      const sortedData = {
        ...responseData.data.projectLocationTree[0],
        childNodes: [
          ...responseData.data.projectLocationTree[0]?.childNodes,
        ]?.sort((a, b) => a.nodeName.split(" ")[1] - b.nodeName.split(" ")[1]),
      };
      if (sortedData?.parentId === null) {
        const data = {
          ...sortedData,
          childNodes: sortedData?.childNodes?.map((item: any) => {
            return {
              ...item,
              numOfLots: item?.childNodes?.length,
              isParent: true,
            };
          }),
        };
        setActiveHeaderList([
          activeHeaderList[0],
          {
            id: data?.id,
            nodeName: data?.nodeName,
          },
        ]);
        setLocationTreeData(data);
      } else {
        let inProgressCount = 0;
        let openCount = 0;
        sortedData.childNodes?.forEach((val: any) =>
          val?.formsLocationLists?.length ? inProgressCount++ : openCount++
        );
        const data = {
          ...sortedData,
          inProgress: inProgressCount,
          open: openCount,
          numOfForms: sortedData?.formsLocationLists?.length,
          numOfLots: sortedData?.childNodes?.length,
        };
        setActiveHeaderList([
          activeHeaderList[0],
          {
            id: data?.id,
            nodeName: data?.nodeName,
          },
        ]);
        setLocationTreeData(data);
      }
    } catch (error: any) {
      dispatch(setIsLoading(false));
      console.log(error.message);
    }
  };

  const handleHeaderClick = (item: any, i: number) => {
    activeHeaderList?.length > 1 &&
      activeHeaderList?.length - 1 !== i &&
      setLocationTreeData(null);
    activeHeaderList?.length === 1 || activeHeaderList?.length - 1 === i
      ? ""
      : handleActiveHeaderList(item);
  };

  const handleActiveHeaderList = (val: any) => {
    const isExist = activeHeaderList?.some(({ id }: any) => val?.id === id);
    if (isExist) {
      fetchProjectLocationTreeData();
    } else {
      setActiveHeaderList([...activeHeaderList, val]);
    }
  };

  const navToInspectionFormScreen = (id: any) => {
    id && history.push(`/inspectionForm/${id}`);
  };

  const handleLotClick = (item: any) => {
    if (item?.isParent) {
      fetchProjectLocationById(item?.id);
      handleActiveHeaderList(item);
    } else {
      history.push(`/inspectionForm/${item?.id}`);
    }
  };

  return (
    <div className="blockScreen">
      <div className="blockScreen__projectName">
        <ArrowBackIosIcon
          className="blockScreen__projectName__icon"
          onClick={() => {
            history.push("/");
          }}
        />
        {state?.currentProject?.projectId !== 0
          ? state?.currentProject?.projectName
          : ""}
      </div>

      <div className="blockScreen__breadCrumbDropdownContainer">
        <div className="blockScreen__breadCrumbDropdownContainer__breadCrumbContainer">
          {activeHeaderList?.length
            ? activeHeaderList?.map((item: any, i: number) => (
                <div
                  className={
                    activeHeaderList?.length - 1 === i
                      ? "blockScreen__breadCrumbDropdownContainer__breadCrumbContainer__listItems blockScreen__breadCrumbDropdownContainer__breadCrumbContainer__listItems__bold"
                      : "blockScreen__breadCrumbDropdownContainer__breadCrumbContainer__listItems"
                  }
                  key={i}
                  onClick={() => handleHeaderClick(item, i)}
                >
                  {i === 0 ? (
                    <span className="blockScreen__breadCrumbDropdownContainer__breadCrumbContainer__listItems__textContainer">
                      <BusinessIcon
                        htmlColor="#FBC30A"
                        className="blockScreen__breadCrumbDropdownContainer__breadCrumbContainer__listItems__textContainer__iconStyle"
                      />
                      <span className="blockScreen__breadCrumbDropdownContainer__breadCrumbContainer__listItems__textContainer__text">
                        Home
                      </span>
                    </span>
                  ) : (
                    "> " + item?.nodeName
                  )}
                </div>
              ))
            : null}
        </div>
        {activeHeaderList?.length > 1 && (
          <div>
            <FormControl className={classes.formControl}>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                onChange={(e: any, val: any) => {
                  fetchProjectLocationById(e?.target?.value);
                }}
                style={{ fontWeight: "bold" }}
                MenuProps={{
                  MenuListProps: {
                    style: {
                      color: "#fff",
                      backgroundImage: `url(${bgNav})`,
                      backgroundRepeat: "no-repeat",
                      backgroundSize: "100%",
                    },
                  },
                  anchorOrigin: {
                    vertical: "bottom",
                    horizontal: "left",
                  },
                  transformOrigin: {
                    vertical: "top",
                    horizontal: "left",
                  },
                  getContentAnchorEl: null,
                }}
                value={locationTreeData?.id}
                defaultValue={locationTreeData?.id}
              >
                {dropdownData?.map((item: any) => (
                  <MenuItem key={item?.id} value={item?.id}>
                    {item?.nodeName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
        )}
      </div>
      <div className="blockScreen__container">
        <div
          className={
            locationTreeData?.parentId &&
            "blockScreen__container__parentContainer"
          }
        >
          {locationTreeData?.parentId && (
            <div
              className={
                "blockScreen__container__block blockScreen__container__parentContainer__parentBlock"
              }
              onClick={() => {
                navToInspectionFormScreen(locationTreeData?.id);
              }}
            >
              <IconButton
                className={
                  locationTreeData?.formsLocationLists?.length > 0
                    ? "blockScreen__container__block__iconContainer blockScreen__container__block__formsExist"
                    : "blockScreen__container__block__iconContainer"
                }
              >
                <BusinessIcon
                  htmlColor="#fff"
                  className={
                    "blockScreen__container__block__iconContainer__icon"
                  }
                />
              </IconButton>
              <div className="blockScreen__container__block__detailsContainer">
                <div className="blockScreen__container__block__detailsContainer__head">
                  {locationTreeData?.nodeName}
                </div>
                <div className="blockScreen__container__block__detailsContainer__textContainer">
                  <span className="blockScreen__container__block__detailsContainer__textContainer__headText">
                    Inspection Forms:
                  </span>{" "}
                  {locationTreeData?.numOfForms}
                </div>
                <div className="blockScreen__container__block__detailsContainer__textContainer">
                  <span className="blockScreen__container__block__detailsContainer__textContainer__headText">
                    Residential Units:
                  </span>{" "}
                  {locationTreeData?.numOfLots}
                </div>
                <div className="blockScreen__container__block__detailsContainer__textContainer">
                  <span className="blockScreen__container__block__detailsContainer__textContainer__headText">
                    Inspection in progress:
                  </span>{" "}
                  {locationTreeData?.inProgress}
                </div>{" "}
                <div className="blockScreen__container__block__detailsContainer__textContainer">
                  <span className="blockScreen__container__block__detailsContainer__textContainer__headText">
                    Inspection yet to start:
                  </span>{" "}
                  {locationTreeData?.open}
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="blockScreen__container__childContainer">
          {locationTreeData?.childNodes?.map((item: any, i: number) => (
            <div
              key={i}
              className={"blockScreen__container__block"}
              onClick={() => {
                handleLotClick(item);
              }}
            >
              <IconButton
                className={
                  item?.formsLocationLists?.length > 0
                    ? "blockScreen__container__block__iconContainer blockScreen__container__block__formsExist"
                    : "blockScreen__container__block__iconContainer"
                }
              >
                <BusinessIcon
                  htmlColor="#fff"
                  className={
                    "blockScreen__container__block__iconContainer__icon"
                  }
                />
              </IconButton>
              <div className="blockScreen__container__block__detailsContainer">
                <div className="blockScreen__container__block__detailsContainer__head">
                  {item.nodeName}
                </div>
                <div className="blockScreen__container__block__detailsContainer__textContainer">
                  <span className="blockScreen__container__block__detailsContainer__textContainer__headText">
                    {item?.isParent
                      ? "Residential Units:"
                      : "Inspection Forms:"}
                  </span>{" "}
                  {item?.isParent
                    ? item?.numOfLots
                    : item?.formsLocationLists?.length}
                </div>

                {item?.isParent && (
                  <>
                    <div className="blockScreen__container__block__detailsContainer__textContainer">
                      <span className="blockScreen__container__block__detailsContainer__textContainer__headText">
                        Inspection Forms:
                      </span>
                      {" " + item?.numOfForms}
                    </div>
                    <div className="blockScreen__container__block__detailsContainer__textContainer">
                      <span className="blockScreen__container__block__detailsContainer__textContainer__headText">
                        Inspection in progress:
                      </span>
                      {" " + item?.inProgress}
                    </div>
                    <div className="blockScreen__container__block__detailsContainer__textContainer">
                      <span className="blockScreen__container__block__detailsContainer__textContainer__headText">
                        Inspection yet to start:
                      </span>{" "}
                      {" " + item?.open}
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlockScreen;
