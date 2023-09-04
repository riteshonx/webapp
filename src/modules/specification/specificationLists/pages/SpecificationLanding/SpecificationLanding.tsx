import React, { ReactElement, useContext, useEffect, useState } from "react";
import { match, useHistory, useRouteMatch } from "react-router-dom";
import { client } from "../../../../../services/graphql";
import { specificationRoles } from "../../../../../utils/role";
import {
  setIsLoading,
  setSelectedMenu,
} from "../../../../root/context/authentication/action";
import { stateContext } from "../../../../root/context/authentication/authContext";
import SpecificationAction from "../../components/SpecificationAction/SpecificationAction";
import SpeecificationHeaders from "../../components/SpecificationHeaders/SpeecificationHeaders";
import SpecificationListsMain from "../../components/SpecificationListsMain/SpecificationListsMain";
import {
  FETCH_PUBLISHED_DOCUMENTS,
  DELETE_SECTION,
  FETCH_FILTEREDED_DOCUMENTS,
} from "../../graphql/queries/specificationTable";
import "./SpecificationLanding.scss";
import Notification, {
  AlertTypes,
} from "../../../../shared/components/Toaster/Toaster";
import { useDebounce } from "../../../../../customhooks/useDebounce";
import { SpecificationLibDetailsContext } from "../../context/SpecificationLibDetailsContext";
import {
  setSpecificationList,
  setConfirmBoxStatus,
  setOffset,
  setIsSpecFilterOn,
} from "../../context/SpecificationLibDetailsAction";
import NoDataMessage from "../../../../shared/components/NoDataMessage/NoDataMessage";
import Header from "src/modules/shared/components/Header/Header";
import SpecificationFilter from "../../components/SpecificationFilter/SpecificationFilter";
const header = {
  name: "Specifications",
  description: "View all specifications inside your project.",
};

export interface Params {
  projectId: string;
}

const noPermissionMessage = `You don't have permission to view specification`;
// let entireData: any=[]
export default function SpecificationsLanding(): ReactElement {
  const history = useHistory();
  const pathMatch: match<Params> = useRouteMatch();
  const { state, dispatch }: any = useContext(stateContext);
  const [searchText, setsearchText] = useState("");
  const debounceName = useDebounce(searchText, 1000);
  const [isSearchTextExist, setIsSearchTextExist] = useState(false);
  const [filterSideBar, setFilterSideBar] = useState({
    show: false,
    expand: false,
  });
  const { SpecificationLibDetailsState, SpecificationLibDetailsDispatch }: any =
    useContext(SpecificationLibDetailsContext);

  useEffect(() => {
    if (
      pathMatch.path.includes("/specifications/projects/") &&
      pathMatch.path.includes("/lists") &&
      state.selectedProjectToken &&
      state?.projectFeaturePermissons?.canviewSpecifications
    ) {
      determineToFetchWithOrWithoutFilters();
    }
  }, [
    state.selectedProjectToken,
    SpecificationLibDetailsState.selectedSpecFilterData,
  ]);

  useEffect(() => {
    return () => {
      // SpecificationLibDetailsDispatch(setToggleFilter(false));
      SpecificationLibDetailsDispatch(setSpecificationList([]));
      SpecificationLibDetailsDispatch(setConfirmBoxStatus(false));
      SpecificationLibDetailsDispatch(setOffset(0));
    };
  }, []);

  const navigateBack = () => {
    dispatch(setSelectedMenu("Home"));
    sessionStorage.setItem("selectedMenu", "Home");
    history.push(`/`);
  };

  // const toggleFilter = (flag: boolean) => {
  //     SpecificationLibDetailsDispatch(setToggleFilter(flag));
  // }

  useEffect(() => {
    debounceName ? setIsSearchTextExist(true) : setIsSearchTextExist(false);
    refreshList();
  }, [debounceName]);

  const refreshList = () => {
    if (
      state.selectedProjectToken &&
      state?.projectFeaturePermissons?.canviewSpecifications
    ) {
      determineToFetchWithOrWithoutFilters();
    }
  };

  //fetch published specification
  const fetchPublishedSpecification = async () => {
    try {
      dispatch(setIsLoading(true));
      const specificationLibraryResponse = await client.query({
        query: FETCH_PUBLISHED_DOCUMENTS,
        variables: {
          searchText: `%${debounceName}%`,
          offset: 0,
          limit: 500,
        },
        fetchPolicy: "network-only",
        context: {
          role: specificationRoles.viewSpecifications,
          token: state.selectedProjectToken,
        },
      });
      const specificationLibraries: any = [];
      if (specificationLibraryResponse?.data?.techspecSections.length > 0) {
        specificationLibraryResponse?.data?.techspecSections.forEach(
          (item: any) => {
            const newItem = JSON.parse(JSON.stringify(item));
            newItem.isPartOf = false;
            specificationLibraries.push(newItem);
          }
        );
      }
      const filteredData = specificationLibraries.filter((item: any) => {
        return (
          item.sectionName !== "Not a section" &&
          item.sectionName !== "Not A Section" &&
          item.sectionName !== "Not-A-Section"
        );
      });
      //             console.log(filteredData,'filteredData')
      //             const result=[...entireData, ...filteredData]
      //             entireData=[...result]
      //                     const flags = [], output = [], l = entireData.length;
      // for( let i=0; i<l; i++) {
      //     if( flags[entireData[i].id]) continue;
      //     flags[entireData[i].id] = true;
      //     output.push(entireData[i]);
      // }
      //             console.log(output,'output')
      SpecificationLibDetailsDispatch(setSpecificationList(filteredData));
      // SpecificationLibDetailsDispatch(setFilterOptions(filteredData));
      dispatch(setIsLoading(false));
    } catch (error) {
      console.log(error);
      Notification.sendNotification(error, AlertTypes.warn);
      dispatch(setIsLoading(false));
    }
  };

  const searchTaskBySpecName = (value: string) => {
    setsearchText(value);
  };

  const deleteSpecification = (specificationDetails: any) => {
    const payload = [];
    payload.push(specificationDetails.id);
    deleteSpecificationSection(payload);
  };

  const handleRefresh = () => {
    if (
      state.selectedProjectToken &&
      state?.projectFeaturePermissons?.canviewSpecifications
    ) {
      fetchPublishedSpecification();
    }
  };
  const handleMultiDelete = () => {
    const payload: any = [];
    const isSelected = SpecificationLibDetailsState?.specificationLists.filter(
      (item: any) => item.isPartOf
    );
    isSelected.forEach((item: any) => {
      payload.push(item.id);
    });
    deleteSpecificationSection(payload);
  };
  const deleteSpecificationSection = async (payload: any) => {
    try {
      dispatch(setIsLoading(true));
      const deleteSection: any = await client.mutate({
        mutation: DELETE_SECTION,
        variables: {
          id: payload,
          isDeleted: true,
        },
        context: {
          role: specificationRoles.deleteSpecifications,
          token: state.selectedProjectToken,
        },
      });
      if (deleteSection.data.update_techspecSections.affected_rows > 0) {
        SpecificationLibDetailsDispatch(setConfirmBoxStatus(true));
        Notification.sendNotification(
          "Section Deleted successfully",
          AlertTypes.success
        );
        handleRefresh();
      }
      dispatch(setIsLoading(false));
    } catch (err: any) {
      dispatch(setIsLoading(false));
      Notification.sendNotification(err, AlertTypes.warn);
      console.log(err);
    }
  };
  const handleFilterBar = (show: boolean, expand: boolean) => {
    setFilterSideBar({ show, expand });
  };

  const determineToFetchWithOrWithoutFilters = () => {
    SpecificationLibDetailsDispatch(setIsSpecFilterOn(false));
    const {
      selectedSpecFilterData: { versionName, versionDate },
    } = SpecificationLibDetailsState;

    const payload: any = {
      offset: 0,
      limit: 1000,
      searchText: `%${debounceName}%`,
    };

    let filterCount = 0;
    if (versionName?.length) {
      payload.versionName = versionName;
      filterCount += 1;
    }
    if (versionDate?.length) {
      payload.versionDate = versionDate;
      filterCount += 1;
    }
    if (filterCount) {
      SpecificationLibDetailsDispatch(setIsSpecFilterOn(true));
      fetchFilteredPublishedSpecification(payload);
      setFilterSideBar({ show: true, expand: false });
    } else {
      fetchPublishedSpecification();
    }
  };

  const handleMultiDownload = () => {
    // console.log(sepecificationDetails) delete and refresh
  };
  //fetch all published specifcation wrt project
  const fetchFilteredPublishedSpecification = async (payload: any) => {
    try {
      dispatch(setIsLoading(true));
      const specificationLibraryResponse = await client.query({
        query: FETCH_FILTEREDED_DOCUMENTS,
        variables: payload,
        fetchPolicy: "network-only",
        context: {
          role: specificationRoles.viewSpecifications,
          token: state.selectedProjectToken,
        },
      });
      const specificationLibraries: any = [];
      if (specificationLibraryResponse?.data?.techspecSections.length > 0) {
        specificationLibraryResponse?.data?.techspecSections.forEach(
          (item: any) => {
            const newItem = JSON.parse(JSON.stringify(item));
            newItem.isPartOf = false;
            specificationLibraries.push(newItem);
          }
        );
      }

      //get category list from here
      SpecificationLibDetailsDispatch(
        setSpecificationList(specificationLibraries)
      );

      dispatch(setIsLoading(false));
    } catch (error) {
      console.log(error);
      Notification.sendNotification(error, AlertTypes.warn);
      dispatch(setIsLoading(false));
    }
  };

  const goBack = () => {
    history.goBack();
  };

  return (
    <>
      {state.projectFeaturePermissons ? (
        state?.projectFeaturePermissons?.canviewSpecifications ? (
          <div className="specifications">
            <SpeecificationHeaders
              headerInfo={header}
              style={{ marginLeft: "20px" }}
              navigate={goBack}
            />
            <SpecificationAction
              isFilterOpen={handleFilterBar}
              searchText={searchText}
              searchTask={searchTaskBySpecName}
              multiDelete={handleMultiDelete}
              multiDownload={handleMultiDownload}
            />
            <SpecificationListsMain
              deleteSpecification={deleteSpecification}
              refresh={handleRefresh}
              isSearchTextExist={isSearchTextExist}
            />
          </div>
        ) : (
          !state.isLoading && (
            <div className="noSpecificationPermission">
              <div className="noCreatePermission____header">
                <Header header={"Specifications"} navigate={navigateBack} />
              </div>
              <div className="no-permission">
                <NoDataMessage message={noPermissionMessage} />
              </div>
            </div>
          )
        )
      ) : (
        <div className="specifications_pleaseWait">Please wait...</div>
      )}
      {filterSideBar.show && (
        <SpecificationFilter shouldExpand={filterSideBar.expand} />
      )}
    </>
  );
}
