import React, { ReactElement, useContext, useEffect, useState } from 'react';
import './FilterDrawings.scss';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import { Button } from '@material-ui/core';
import { DrawingLibDetailsContext } from '../../context/DrawingLibDetailsContext';
import FilterDrawingsMultiSelect from '../FilterDrawingsMultiSelect/FilterDrawingsMultiSelect';
// import FilterDrawingsDateRange from '../FilterDrawingsDateRange/FilterDrawingsDateRange';
import { setDrawingList, setDrawingListPageNumber, 
        setFilterDrawingList, setIsFilterOn, setSelectedFilterData } from '../../context/DrawingLibDetailsAction';
import { match, useRouteMatch } from 'react-router-dom';
import { stateContext } from 'src/modules/root/context/authentication/authContext';
import { client } from 'src/services/graphql';
import { FETCH_UNIQUE_CATEGORIES, FETCH_UNIQUE_DWG_REVISION, 
          FETCH_UNIQUE_VERSION_DATE, FETCH_UNIQUE_VERSION_NAME } from '../../graphql/queries/drawingSheets';
import { projectFeatureAllowedRoles } from 'src/utils/role';
import Notification,{ AlertTypes } from '../../../../shared/components/Toaster/Toaster';
import { setIsLoading } from 'src/modules/root/context/authentication/action';

export interface Params {
  projectId: string;
}

export default function FilterDrawings(props: any): ReactElement {

  const pathMatch:match<Params>= useRouteMatch();
  const {state, dispatch }:any = useContext(stateContext);
  const [expandView, setExpandView] = useState(true);
  const {DrawingLibDetailsState, DrawingLibDetailsDispatch}: any = useContext(DrawingLibDetailsContext);
  const [categoryListData, setcategoryListData] = useState<Array<any>>([]);
  const [versionNameListData, setversionNameListData] = useState<Array<any>>([]);
  const [versionDateListData, setversionDateListData] = useState<Array<any>>([]);
  const [drawingRevisionData, setDrawingRevisionData] = useState<Array<any>>([]);

  useEffect(() => {
    if(pathMatch.path.includes('/drawings/projects/') && pathMatch.path.includes('/lists') && state.selectedProjectToken && 
    state?.projectFeaturePermissons?.canviewDrawings){
      if(sessionStorage.getItem('drawing_filters')){
        setExpandView(false);
      }else{
        setExpandView(true);
      }
      fetchUniqueFilterData()
    }
  }, [state.selectedProjectToken])

  useEffect(() => {
    if(DrawingLibDetailsState.selectedFilterData){
       DrawingLibDetailsDispatch(setDrawingListPageNumber(0))
       DrawingLibDetailsDispatch(setDrawingList([]));
      props.filter();
    }
  }, [DrawingLibDetailsState.selectedFilterData])

  const clearFilter= () =>{
    const initialValues = {
      versionName: [],
      versionDate: [],
      drawingCategories: [],
      drawingRevision: []
    }
    sessionStorage.removeItem("drawing_filters");
    DrawingLibDetailsDispatch(setFilterDrawingList([]));
    DrawingLibDetailsDispatch(setIsFilterOn(false));
    DrawingLibDetailsDispatch(setSelectedFilterData({...initialValues}));
    DrawingLibDetailsDispatch(setDrawingListPageNumber(0))
    DrawingLibDetailsDispatch(setDrawingList([]));
  }

  const changeVersionNameData = (event: React.ChangeEvent<HTMLInputElement>, item: string) => {
    const filterData= [...DrawingLibDetailsState.selectedFilterData.versionName];
    const currentIndex= filterData.indexOf(item)
    if(currentIndex>-1){
        filterData.splice(currentIndex,1);
    } else{
        filterData.push(item);
    }
    updateSessionData({...DrawingLibDetailsState.selectedFilterData, versionName:filterData})
  }

  const changeVersionDateData = (event: React.ChangeEvent<HTMLInputElement>, item: string) => {
    const filterData= [...DrawingLibDetailsState.selectedFilterData.versionDate];
    const currentIndex= filterData.indexOf(item)
    if(currentIndex>-1){
        filterData.splice(currentIndex,1);
    } else{
        filterData.push(item);
    }

    updateSessionData({...DrawingLibDetailsState.selectedFilterData, versionDate:filterData})
  }

  const changeCategoriesData = (event: React.ChangeEvent<HTMLInputElement>, item: string) => {
    const filterData= [...DrawingLibDetailsState.selectedFilterData.drawingCategories];
    const currentIndex= filterData.indexOf(item)
    if(currentIndex>-1){
        filterData.splice(currentIndex,1);
    } else{
        filterData.push(item);
    }

    updateSessionData({...DrawingLibDetailsState.selectedFilterData, drawingCategories:filterData})
  }

  const changeDrawingRevisionData = (event: React.ChangeEvent<HTMLInputElement>, item: string) => {
    const filterData= [...DrawingLibDetailsState.selectedFilterData.drawingRevision];
    const currentIndex= filterData.indexOf(item)
    if(currentIndex>-1){
        filterData.splice(currentIndex,1);
    } else{
        filterData.push(item);
    }

    updateSessionData({...DrawingLibDetailsState.selectedFilterData, drawingRevision:filterData})
  }

  const updateSessionData = (filterValue: any) => {
    // DrawingLibDetailsDispatch(setDrawingListPageNumber(0))
    // DrawingLibDetailsDispatch(setDrawingList([]));
    DrawingLibDetailsDispatch(setSelectedFilterData({...filterValue}));
    sessionStorage.setItem("drawing_filters", JSON.stringify({...filterValue, projectId: pathMatch.params.projectId}));
  }

  //fetch unique filter data
  const fetchUniqueFilterData= async()=>{
    try{
      dispatch(setIsLoading(true));

      //fetch unique version name starts
        const versionNameResponse = await client.query({
            query: FETCH_UNIQUE_VERSION_NAME,
            fetchPolicy: 'network-only',
            context:{role: projectFeatureAllowedRoles.viewDrawings, token: state.selectedProjectToken}
        });
        const versionNameLists: any = [];
        if(versionNameResponse?.data?.drawingSheets.length > 0){
            versionNameResponse?.data?.drawingSheets.forEach((item: any) => {
                const newItem= JSON.parse(JSON.stringify(item));
                versionNameLists.push(newItem.setVersionName);
            })

        }
        setversionNameListData([...versionNameLists])
    //fetch unique version name ends

    //fetch unique version date starts
        const versionDateResponse = await client.query({
            query: FETCH_UNIQUE_VERSION_DATE,
            fetchPolicy: 'network-only',
            context:{role: projectFeatureAllowedRoles.viewDrawings, token: state.selectedProjectToken}
        });
        const versionDateLists: any = [];
        if(versionDateResponse?.data?.drawingSheets.length > 0){
            versionDateResponse?.data?.drawingSheets.forEach((item: any) => {
                const newItem= JSON.parse(JSON.stringify(item));
                versionDateLists.push(newItem.setVersionDate);
            })

        }
        setversionDateListData([...versionDateLists])
      //fetch unique version date ends


      //fetch unique category starts
      const drawingCategoryResponse = await client.query({
          query: FETCH_UNIQUE_CATEGORIES,
          fetchPolicy: 'network-only',
          context:{role: projectFeatureAllowedRoles.viewDrawings, token: state.selectedProjectToken}
      });
      const dwgCategoryLists: any = [];
      if(drawingCategoryResponse?.data?.drawingSheets.length > 0){
          drawingCategoryResponse?.data?.drawingSheets.forEach((item: any) => {
              const newItem= JSON.parse(JSON.stringify(item));
              dwgCategoryLists.push(newItem.drawingCategory);
          })

      }
      setcategoryListData([...dwgCategoryLists.filter((item: any) => item)])
    //fetch unique category ends


    //fetch unique revision starts
      const drawingRevisionResponse = await client.query({
        query: FETCH_UNIQUE_DWG_REVISION,
          fetchPolicy: 'network-only',
          context:{role: projectFeatureAllowedRoles.viewDrawings, token: state.selectedProjectToken}
      });

      const dwgRevisionLists: any = [];
      if(drawingRevisionResponse?.data?.drawingSheets.length > 0){
          drawingRevisionResponse?.data?.drawingSheets.forEach((item: any) => {
              const newItem= JSON.parse(JSON.stringify(item));
              dwgRevisionLists.push(newItem.dwgRevision);
          })

      }
      setDrawingRevisionData([...dwgRevisionLists?.filter((item: any) => item)])
    //fetch unique revision ends

    dispatch(setIsLoading(false));

    }catch(error){
        console.log(error);
        Notification.sendNotification(error, AlertTypes.warn);
        dispatch(setIsLoading(false));
    }
  }

    return (
        <div className={`drawingFilter ${expandView?'expand':'closed'}`}>
          <div className="drawingFilter__left" onClick={()=>setExpandView(!expandView)}>
            <div className="drawingFilter__left__title" >Filters</div>  
            <div className="drawingFilter__left__arrow" >
              {expandView?(<ChevronRightIcon className="drawingFilter__left__arrow__icon"/>):(
                <ChevronLeftIcon className="drawingFilter__left__arrow__icon"/>)}    
            </div>
          </div>
          <div className="drawingFilter__right">
              <div className="drawingFilter__right__header">
                <div className="drawingFilter__right__header__title">
                  Filters
                </div>
                <div className="drawingFilter__right__header__option">
                  <Button data-testid={'create-form-template'} variant="outlined" size="small"
                          className="rfi-action__left__filter__btn btn-secondary" onClick={clearFilter}>
                          Clear All
                  </Button>
                </div>
              </div>
              <div className="drawingFilter__right__options">

                   <div className="drawingFilter__right__options__item">
                     <FilterDrawingsMultiSelect itemListData={versionNameListData} changeSelectValue={changeVersionNameData} field={'Version Name'}
                                                values={DrawingLibDetailsState.selectedFilterData.versionName}/>
                     <FilterDrawingsMultiSelect itemListData={versionDateListData} changeSelectValue={changeVersionDateData} field={'Version Date'}
                                                values={DrawingLibDetailsState.selectedFilterData.versionDate} isDate={true}/>
                     <FilterDrawingsMultiSelect itemListData={categoryListData} changeSelectValue={changeCategoriesData} field={'Categories'}
                                                values={DrawingLibDetailsState.selectedFilterData.drawingCategories}/>

                     <FilterDrawingsMultiSelect itemListData={drawingRevisionData} changeSelectValue={changeDrawingRevisionData} field={'Revision'}
                                                values={DrawingLibDetailsState.selectedFilterData.drawingRevision}/>
                  </div>
              </div>
          </div>
        </div>
    )
}