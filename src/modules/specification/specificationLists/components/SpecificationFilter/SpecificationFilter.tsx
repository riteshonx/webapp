import React, { ReactElement, useContext, useEffect, useState } from "react";
import "./SpecificationFilter.scss";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import { Button } from "@material-ui/core";
import { SpecificationLibDetailsContext } from "../../context/SpecificationLibDetailsContext";
import SpecificationFilterMultiSelect from "../SpecificationFilterMultiSelect/SpecificationFilterMultiSelect";
import SpecificationFilterDateRange from "../SpecificationFilterDateRange/SpecificationFilterDateRange";
import {
  setSpecFilterList,
  setIsSpecFilterOn,
  setSelectedSpecFilterData,
} from "../../context/SpecificationLibDetailsAction";
import { match, useRouteMatch } from "react-router-dom";
import { stateContext } from "src/modules/root/context/authentication/authContext";
import { client } from "src/services/graphql";
import { FETCH_PUBLISHED_DOCUMENTS } from "../../graphql/queries/specificationTable";
import { specificationRoles } from "src/utils/role";
import Notification, {
  AlertTypes,
} from "../../../../shared/components/Toaster/Toaster";
import { setIsLoading } from "src/modules/root/context/authentication/action";

export interface Params {
  projectId: string;
}

interface SpecFilterProps {
  shouldExpand: boolean;
}

export default function SpecificationFilter({
  shouldExpand,
}: SpecFilterProps): ReactElement {
  const pathMatch: match<Params> = useRouteMatch();
  const { state, dispatch }: any = useContext(stateContext);
  const [expandView, setExpandView] = useState(shouldExpand);
  const { SpecificationLibDetailsState, SpecificationLibDetailsDispatch }: any =
    useContext(SpecificationLibDetailsContext);
  const [versionNameListData, setversionNameListData] = useState<Array<any>>(
    []
  );
  const [versionDateListData, setversionDateListData] = useState<Array<any>>(
    []
  );
  const [clearDateRange, setClearDateRange] = useState(0);
  // console.log(SpecificationLibDetailsState,'SpecificationLibDetailsState')
  useEffect(() => {
    if (
      pathMatch.path.includes("/specifications/projects/") &&
      pathMatch.path.includes("/lists") &&
      state.selectedProjectToken &&
      state?.projectFeaturePermissons?.canviewSpecifications
    ) {
      fetchPublishedSpecification();
    }
  }, [state.selectedProjectToken]);

  useEffect(() => {
    if (SpecificationLibDetailsState?.specFilterList?.length > 0) {
      const specificationList = [
        ...SpecificationLibDetailsState?.specFilterList,
      ];

      //get unique version name
      const versionNameLists: any = specificationList
        ?.map((item: any) => item.versionName)
        ?.filter((item: any) => item)
        ?.sort();
      const uniqueVersionName: any = new Set(versionNameLists);
      setversionNameListData([...uniqueVersionName]);

      //get unique version date
      const versionDateLists: any = specificationList
        ?.map((item: any) => item.versionDate)
        ?.filter((item: any) => item)
        ?.sort();
      const uniqueVersionDate: any = new Set(versionDateLists);
      setversionDateListData([...uniqueVersionDate]);
    }
  }, [SpecificationLibDetailsState?.specFilterList]);

  useEffect(() => {
    return () => {
      SpecificationLibDetailsDispatch(setSpecFilterList([]));
      SpecificationLibDetailsDispatch(setIsSpecFilterOn(false));
    };
  }, []);

  const clearFilter = () => {
    const initialValues = {
      versionName: [],
      versionDate: [],
    };
    setClearDateRange(clearDateRange + 1);
    SpecificationLibDetailsDispatch(setSelectedSpecFilterData(initialValues));
  };

  const changeVersionData = (
    event: React.ChangeEvent<HTMLInputElement>,
    item: string
  ) => {
    const filterData = [
      ...SpecificationLibDetailsState.selectedSpecFilterData.versionName,
    ];
    const currentIndex = filterData.indexOf(item);
    if (currentIndex > -1) {
      filterData.splice(currentIndex, 1);
    } else {
      filterData.push(item);
    }
    SpecificationLibDetailsDispatch(
      setSelectedSpecFilterData({
        ...SpecificationLibDetailsState.selectedSpecFilterData,
        versionName: filterData,
      })
    );
  };

  const changeVersionDateData = (
    event: React.ChangeEvent<HTMLInputElement>,
    item: string
  ) => {
    const filterData = [
      ...SpecificationLibDetailsState.selectedSpecFilterData.versionDate,
    ];
    const currentIndex = filterData.indexOf(item);
    if (currentIndex > -1) {
      filterData.splice(currentIndex, 1);
    } else {
      filterData.push(item);
    }
    SpecificationLibDetailsDispatch(
      setSelectedSpecFilterData({
        ...SpecificationLibDetailsState.selectedSpecFilterData,
        versionDate: filterData,
      })
    );
  };

  //fetch published specification
  const fetchPublishedSpecification = async () => {
    try {
      dispatch(setIsLoading(true));
      const specificationLibraryResponse = await client.query({
        query: FETCH_PUBLISHED_DOCUMENTS,
        variables: {
          searchText: `%%`,
          offset: 0,
          limit: 1000,
        },
        fetchPolicy: "network-only",
        context: {
          role: specificationRoles.viewSpecifications,
          token: state.selectedProjectToken,
        },
      });
      const specificationLibraries: any = [];
      if (specificationLibraryResponse?.data?.techspecSections?.length > 0) {
        specificationLibraryResponse?.data?.techspecSections.forEach(
          (item: any) => {
            const newItem = JSON.parse(JSON.stringify(item));
            newItem.isPartOf = false;
            specificationLibraries.push(newItem);
          }
        );
      }
      dispatch(setIsLoading(false));
      //get category list from here
      SpecificationLibDetailsDispatch(
        setSpecFilterList(specificationLibraries)
      );
    } catch (error) {
      console.log(error);
      Notification.sendNotification(error, AlertTypes.warn);
      dispatch(setIsLoading(false));
    }
  };

  return (
    <div className={`specificationFilter ${expandView ? "expand" : "closed"}`}>
      <div
        className="specificationFilter__left"
        onClick={() => setExpandView(!expandView)}
      >
        <div className="specificationFilter__left__title">Filters</div>
        <div className="specificationFilter__left__arrow">
          {expandView ? (
            <ChevronRightIcon className="specificationFilter__left__arrow__icon" />
          ) : (
            <ChevronLeftIcon className="specificationFilter__left__arrow__icon" />
          )}
        </div>
      </div>
      <div className="specificationFilter__right">
        <div className="specificationFilter__right__header">
          <div className="specificationFilter__right__header__title">
            Filters
          </div>
          <div className="specificationFilter__right__header__option">
            <Button
              data-testid={"create-form-template"}
              variant="outlined"
              size="small"
              className="rfi-action__left__filter__btn btn-secondary"
              onClick={clearFilter}
            >
              Clear All
            </Button>
          </div>
        </div>
        <div className="specificationFilter__right__options">
          <div className="specificationFilter__right__options__item">
            <SpecificationFilterMultiSelect
              itemListData={versionNameListData}
              changeSelectValue={changeVersionData}
              field={"Version Name"}
              values={
                SpecificationLibDetailsState.selectedSpecFilterData.versionName
              }
            />
            <SpecificationFilterMultiSelect
              itemListData={versionDateListData}
              changeSelectValue={changeVersionDateData}
              field={"Version Date"}
              values={
                SpecificationLibDetailsState.selectedSpecFilterData.versionDate
              }
              isDate={true}
            />
            {/* <FilterspecificationsMultiSelect itemListData={categoryListData} changeSelectValue={changeCategoriesData} field={'Categories'}
                                                values={specificationLibDetailsState.selectedFilterData.specificationCategories}/> */}
          </div>
        </div>
      </div>
    </div>
  );
}
