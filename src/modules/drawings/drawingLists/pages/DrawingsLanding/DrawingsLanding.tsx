import React, { ReactElement, useContext, useEffect, useState } from "react";
import { match, useHistory, useRouteMatch } from "react-router-dom";
import { client } from "../../../../../services/graphql";
import { projectFeatureAllowedRoles } from "../../../../../utils/role";
import {
  setIsLoading,
  setSelectedMenu,
} from "../../../../root/context/authentication/action";
import { stateContext } from "../../../../root/context/authentication/authContext";
import DrawingAction from "../../components/DrawingAction/DrawingAction";
import DrawingHeaders from "../../components/DrawingHeaders/DrawingHeaders";
import DrawingListsMain from "../../components/DrawingListsMain/DrawingListsMain";
import {
  DELETE_DRAWING,
  FETCH_FILTEREDED_DRAWINGS,
  FETCH_PUBLISHED_DRAWINGS,
} from "../../graphql/queries/drawingSheets";
import "./DrawingsLanding.scss";
import Notification, {
  AlertTypes,
} from "../../../../shared/components/Toaster/Toaster";
import { useDebounce } from "../../../../../customhooks/useDebounce";
import { DrawingLibDetailsContext } from "../../context/DrawingLibDetailsContext";
import {
  setConfirmBoxStatus,
  setDrawingList,
  setDrawingListPageNumber,
  setDrawingView,
  setIsFilterOn,
  setSelectedFilterData,
} from "../../context/DrawingLibDetailsAction";
import NoDataMessage from "../../../../shared/components/NoDataMessage/NoDataMessage";
import FilterDrawings from "../../components/FilterDrawings/FilterDrawings";
import Header from "src/modules/shared/components/Header/Header";

const header = {
  name: "Drawings",
  description: "View all drawings inside your project",
};

export interface Params {
  projectId: string;
}

const noPermissionMessage = `You don't have permission to view drawings`;

export default function DrawingsLanding(): ReactElement {
  const history = useHistory();
  const pathMatch: match<Params> = useRouteMatch();
  const { state, dispatch }: any = useContext(stateContext);
  const [searchText, setsearchText] = useState("");
  const debounceName = useDebounce(searchText, 1000);
  const { DrawingLibDetailsState, DrawingLibDetailsDispatch }: any = useContext(
    DrawingLibDetailsContext
  );
  const [filterSideBar, setFilterSideBar] = useState(false);
  const [totalCount, seTtotalCount] = useState(0);
  const [isSearchTextExist, setIsSearchTextExist] = useState(false);

  useEffect(() => {
    if (
      pathMatch.path.includes("/drawings/projects/") &&
      pathMatch.path.includes("/lists") &&
      state.selectedProjectToken &&
      state?.projectFeaturePermissons?.canviewDrawings
    ) {
      const sessionData: any = sessionStorage.getItem("drawing_filters");
      const filteredValue: any = sessionData ? JSON.parse(sessionData) : null;
      if (
        filteredValue &&
        filteredValue.projectId === pathMatch.params.projectId
      ) {
        const filteredData = {
          versionName: filteredValue.versionName,
          versionDate: filteredValue.versionDate,
          drawingCategories: filteredValue.drawingCategories,
          drawingRevision: filteredValue.drawingRevision,
        };
        DrawingLibDetailsDispatch(setSelectedFilterData({ ...filteredData }));
      } else {
        sessionStorage.removeItem("drawing_filters");
        handleFilter();
      }
    }
  }, [state.selectedProjectToken]);

  useEffect(() => {
    if (
      pathMatch.path.includes("/drawings/projects/") &&
      pathMatch.path.includes("/lists") &&
      state.selectedProjectToken &&
      state?.projectFeaturePermissons?.canviewDrawings &&
      DrawingLibDetailsState.drawingListPageNumber > 0
    ) {
      handleFilter();
    }
  }, [DrawingLibDetailsState.drawingListPageNumber]);

  useEffect(() => {
    return () => {
      DrawingLibDetailsDispatch(setDrawingView("list"));
      DrawingLibDetailsDispatch(setDrawingList([]));
      DrawingLibDetailsDispatch(setConfirmBoxStatus(false));
      DrawingLibDetailsDispatch(setDrawingListPageNumber(0));
    };
  }, []);

  const navigateBack = () => {
    dispatch(setSelectedMenu("Home"));
    sessionStorage.setItem("selectedMenu", "Home");
    history.push(`/`);
  };

  const viewType = (view: string) => {
    DrawingLibDetailsDispatch(setDrawingView(view));
  };

  useEffect(() => {
    debounceName ? setIsSearchTextExist(true) : setIsSearchTextExist(false);
    refreshList();
  }, [debounceName]);

  const refreshList = async () => {
    if (
      state.selectedProjectToken &&
      state?.projectFeaturePermissons?.canviewDrawings
    ) {
      await DrawingLibDetailsDispatch(setDrawingListPageNumber(0));
      await DrawingLibDetailsDispatch(setDrawingList([]));
      await handleFilter(true);
    }
  };

  //fetch all published drawing wrt project
  const fetchPublishedDrawings = async (
    pageNo: number,
    property?: string,
    currentDrawing = true
  ) => {
    try {
      dispatch(setIsLoading(true));
      const drawingLibraryResponse = await client.query({
        query: FETCH_PUBLISHED_DRAWINGS,
        variables: {
          searchText: `${debounceName}`,
          offset: pageNo * 20,
          limit: 20,
          currentDrawing: currentDrawing,
          sortColumn: property || "drawingNumber",
        },
        fetchPolicy: "network-only",
        context: {
          role: projectFeatureAllowedRoles.viewDrawings,
          token: state.selectedProjectToken,
        },
      });
      const drawingLibraries: any = [];
      if (drawingLibraryResponse?.data?.drawingSheet_query.data.length > 0) {
        drawingLibraryResponse?.data?.drawingSheet_query.data.forEach(
          (item: any) => {
            const newItem = JSON.parse(JSON.stringify(item));
            newItem.isPartOf = false;
            drawingLibraries.push(newItem);
          }
        );
      }
      //get category list from here
      const data =
        pageNo > 0
          ? [...DrawingLibDetailsState?.drawingsLists, ...drawingLibraries]
          : [...drawingLibraries];

      DrawingLibDetailsDispatch(setDrawingList(data));

      dispatch(setIsLoading(false));
    } catch (error) {
      console.log(error);
      Notification.sendNotification(error, AlertTypes.warn);
      dispatch(setIsLoading(false));
    }
  };

  //fetch all published drawing count project
  const fetchPublishedDrawingCount = async (
    payload: any,
    property?: string,
    isFilterOn = false,
    currentDrawing = true
  ) => {
    try {
      dispatch(setIsLoading(true));
      if (!isFilterOn) {
        payload = {
          searchText: `${debounceName}`,
          offset: 0,
          limit: 0,
          currentDrawing: currentDrawing,
          sortColumn: property || "drawingNumber",
          filterData: [],
        };
      } else {
        payload.offset = 0;
        payload.limit = 0;
      }
      const drawingSheetCountResponse = await client.query({
        query: FETCH_FILTEREDED_DRAWINGS,
        variables: payload,
        fetchPolicy: "network-only",
        context: {
          role: projectFeatureAllowedRoles.viewDrawings,
          token: state.selectedProjectToken,
        },
      });
      if (drawingSheetCountResponse?.data?.drawingSheet_query?.data) {
        seTtotalCount(
          drawingSheetCountResponse?.data?.drawingSheet_query?.data[0]?.count
        );
      }

      dispatch(setIsLoading(false));
    } catch (error) {
      console.log(error);
      Notification.sendNotification(error, AlertTypes.warn);
      dispatch(setIsLoading(false));
    }
  };

  const searchTaskByDwgName = (value: string) => {
    setsearchText(value);
  };

  const deleteDrawing = (drawingDetail: any) => {
    const payload = [];
    payload.push(drawingDetail.id);
    deleteDrawingPdf(payload);
  };

  const handleMultiDelete = () => {
    const payload: any = [];
    const isSelected = DrawingLibDetailsState?.drawingsLists.filter(
      (item: any) => item.isPartOf
    );
    isSelected.forEach((item: any) => {
      payload.push(item.id);
    });

    deleteDrawingPdf(payload);
  };

  const handleMultiDownload = () => {
    // console.log('multi downoad API')
  };

  const handleRefresh = async (property?: any) => {
    if (
      state.selectedProjectToken &&
      state?.projectFeaturePermissons?.canviewDrawings
    ) {
      await DrawingLibDetailsDispatch(setDrawingListPageNumber(0));
      await DrawingLibDetailsDispatch(setDrawingList([]));
      handleFilter(true, property);
    }
  };

  const deleteDrawingPdf = async (drawingId: any) => {
    try {
      dispatch(setIsLoading(true));
      const deleteDrawingResponse: any = await client.mutate({
        mutation: DELETE_DRAWING,
        variables: {
          id: drawingId,
          isDeleted: true,
        },
        context: {
          role: projectFeatureAllowedRoles.deleteDrawings,
          token: state.selectedProjectToken,
        },
      });
      if (deleteDrawingResponse.data.update_drawingSheets.affected_rows > 0) {
        DrawingLibDetailsDispatch(setConfirmBoxStatus(true));
        Notification.sendNotification(
          "Drawing Deleted successfully",
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

  const handleFilterBar = (value: boolean) => {
    setFilterSideBar(value);
  };

  const handleFilter = async (isRefresh?: boolean, property?: any) => {
    let pageNo = 0;
    if (isRefresh) {
      pageNo = 0;
    } else {
      pageNo = DrawingLibDetailsState.drawingListPageNumber;
    }
    const payload: any = {};
    let count: any = 0;
    if (
      DrawingLibDetailsState?.selectedFilterData?.drawingCategories?.length > 0
    ) {
      count = count + 1;
      if (!payload.filterData) payload.filterData = [];
      payload.filterData.push({
        key: "drawingCategory",
        values: DrawingLibDetailsState?.selectedFilterData?.drawingCategories,
      });
    }
    if (DrawingLibDetailsState?.selectedFilterData?.versionName?.length > 0) {
      count = count + 1;
      if (!payload.filterData) payload.filterData = [];
      payload.filterData.push({
        key: "setVersionName",
        values: DrawingLibDetailsState?.selectedFilterData?.versionName,
      });
    }
    // if(DrawingLibDetailsState?.selectedFilterData?.versionStartDate && DrawingLibDetailsState?.selectedFilterData?.versionEndDate ){
    //     count = count + 1;
    //     payload.setVersionDate = DrawingLibDetailsState?.selectedFilterData?.setVersionDate
    // }
    let currentDrawing = true;
    const currentDrawingFromStore = sessionStorage.getItem(
      "currentVesrionDrawings"
    );
    if (currentDrawingFromStore && currentDrawingFromStore == "n") {
      currentDrawing = false;
    }

    if (DrawingLibDetailsState?.selectedFilterData?.versionDate?.length > 0) {
      count = count + 1;
      if (!payload.filterData) payload.filterData = [];
      payload.filterData.push({
        key: "setVersionDate",
        values: DrawingLibDetailsState?.selectedFilterData?.versionDate,
      });
    }

    if (
      DrawingLibDetailsState?.selectedFilterData?.drawingRevision?.length > 0
    ) {
      count = count + 1;
      if (!payload.filterData) payload.filterData = [];
      payload.filterData.push({
        key: "dwgRevision",
        values: DrawingLibDetailsState?.selectedFilterData?.drawingRevision,
      });
    }
    const sortColumnProperty = property
      ? property
      : DrawingLibDetailsState.sortColumnProperty;
    payload.offset = pageNo * 20;
    payload.limit = 20;
    payload.searchText = `%${debounceName}%`;
    payload.currentDrawing = currentDrawing;
    payload.sortColumn = sortColumnProperty;

    count > 0
      ? DrawingLibDetailsDispatch(setIsFilterOn(true))
      : DrawingLibDetailsDispatch(setIsFilterOn(false));

    if (count > 0) {
      await fetchPublishedDrawingCount(
        JSON.parse(JSON.stringify(payload)),
        sortColumnProperty,
        true,
        currentDrawing
      );
      await fetchFilteredPublishedDrawings(payload);
    } else {
      await fetchPublishedDrawingCount(
        payload,
        sortColumnProperty,
        false,
        currentDrawing
      );
      await fetchPublishedDrawings(pageNo, sortColumnProperty, currentDrawing);
    }
  };

  //fetch all published drawing wrt project
  const fetchFilteredPublishedDrawings = async (payload: any) => {
    try {
      dispatch(setIsLoading(true));
      const drawingLibraryResponse = await client.query({
        query: FETCH_FILTEREDED_DRAWINGS,
        variables: payload,
        fetchPolicy: "network-only",
        context: {
          role: projectFeatureAllowedRoles.viewDrawings,
          token: state.selectedProjectToken,
        },
      });
      const drawingLibraries: any = [];
      if (drawingLibraryResponse?.data?.drawingSheet_query.data.length > 0) {
        drawingLibraryResponse?.data?.drawingSheet_query.data.forEach(
          (item: any) => {
            const newItem = JSON.parse(JSON.stringify(item));
            newItem.isPartOf = false;
            drawingLibraries.push(newItem);
          }
        );
      }

      //get category list from here
      const data =
        payload.offset > 0
          ? [...DrawingLibDetailsState?.drawingsLists, ...drawingLibraries]
          : [...drawingLibraries];
      DrawingLibDetailsDispatch(setDrawingList(data));

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
      {state.projectFeaturePermissons?.canviewDrawings ? (
        <div className="drawings">
          <DrawingHeaders
            headerInfo={header}
            style={{ marginLeft: "20px" }}
            navigate={goBack}
          />
          <DrawingAction
            viewType={viewType}
            searchText={searchText}
            searchTask={searchTaskByDwgName}
            multiDelete={handleMultiDelete}
            multiDownload={handleMultiDownload}
            isFilterOpen={handleFilterBar}
            filter={() => handleFilter(true)}
            totalCount={totalCount}
          />
          <DrawingListsMain
            deleteDrawing={deleteDrawing}
            refresh={handleRefresh}
            totalCount={totalCount}
            isSearchTextExist={isSearchTextExist}
          />
        </div>
      ) : (
        state.projectFeaturePermissons &&
        (!state.projectFeaturePermissons?.canviewDrawings ? (
          <div className="noDrawingPermission">
            <div className="noCreatePermission____header">
              <Header header={"Drawings"} navigate={navigateBack} />
            </div>
            <div className="no-permission">
              <NoDataMessage message={noPermissionMessage} />
            </div>
          </div>
        ) : (
          ""
        ))
      )}
      {filterSideBar && <FilterDrawings filter={() => handleFilter(true)} />}
    </>
  );
}
