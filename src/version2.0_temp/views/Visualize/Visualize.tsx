import React, { useContext, useEffect, useMemo, useState } from 'react';
import { stateContext } from 'src/modules/root/context/authentication/authContext';
import { projectFeatureAllowedRoles } from 'src/utils/role';
import { fetchData } from 'src/utils/helper';
import './Visualize.scss';
import 'src/version2.0_temp/components/visualize/visualizeHeader/visualizeHeader.scss';
import NotificationMessage, { AlertTypes } from '../../../modules/shared/components/Toaster/Toaster';
import { LIST_LOCATION_MODELS } from 'src/version2.0_temp/api/queries/locationQueries';
import { useLocationModel } from 'src/version2.0_temp/hooks/visualize/useLocationModel';
import { VisualizeHeader } from 'src/version2.0_temp/components/visualize/visualizeHeader/visualizeHeader';
import { VisualizesideBar } from 'src/version2.0_temp/components/visualize/visualizeSideBar/visualizeSideBar';
import { VisualizeViewer } from 'src/version2.0_temp/components/visualize/visualizeViewer/visualizeViewer';
import { SmartProjectSite } from 'location-intelligence-viewer';
import { LocationFormStatusFilters } from 'src/modules/visualize/VisualizeView/components/LocationTreeFormStatus/LocationFormStatusFilters';
import { ProjectTreeAndSmartObjectNodeMap } from 'src/modules/visualize/VisualizeView/models/projectTreeAndSmartObjectNodeMap';
import { SmartNodes } from 'src/modules/visualize/VisualizeView/models/SmartNodes';
import { ILocationModel, LocationModel } from 'src/modules/visualize/VisualizeView/models/locationModel';
import { LocationTree } from 'src/modules/visualize/VisualizeView/models/locationTree';
import { Form } from 'src/modules/visualize/VisualizeView/models/form';
import { useMapNavigation } from 'src/modules/visualize/VisualizeView/hooks/useMapNavigation';
import { AnalyticsProvider } from 'src/modules/visualize/VisualizeView/utils/analytics';
import { DataModeProvider } from 'src/modules/visualize/VisualizeView/utils/DataMode';
import { UserBackProvider, useUserBack } from 'src/modules/visualize/VisualizeView/utils/UserBack/UserBack.Context';
import { UserDetailProvider } from 'src/modules/visualize/VisualizeView/utils/UserDetail';
import { setIsLoading } from 'src/modules/root/context/authentication/action';
import { match, useRouteMatch } from 'react-router-dom';

interface Params {
  projectId: string;
  locationId: string;
}

export const Visualize = (): React.ReactElement => {
  const { dispatch, state }: any = useContext(stateContext);
  const [locationModels, setlocationModels] = useState<LocationModel[]>();
  const [projectSite, setProjectSite] = useState<SmartProjectSite>();
  const [projectLocationTree, setProjectLocationTree] = useState<LocationTree>();
  const [formStatusFilter, setFormStatusFilter] = useState<LocationFormStatusFilters[]>([LocationFormStatusFilters.Mixed]);
  const [formSearchKey, setFormSearchKey] = useState<string>('');
  const [selectedForm, setSelectedForm] = useState<Form>();
  const {userbackLoaded, showUserback, destroyUserback, hideUserback} = useUserBack();
  const [updateSelectedRoomLabel, setUpdateSelectedRoomLabel] = useState(0);
  const pathMatch: match<Params> = useRouteMatch();
  
  const projectTreeMap = useMemo(() =>
    Boolean(projectLocationTree) && Boolean(projectSite) ? new ProjectTreeAndSmartObjectNodeMap(projectLocationTree!, projectSite!) : undefined
    , [projectLocationTree, projectSite]);

  const { selectedMapNode, selectedMapNodeForViewer, onExteriorClicked, onMapNavNodeClicked, onNodeClickInViewer, onSelectedFormChanged: onSelectedFormChangedForNavigation, onFormsBackButtonClicked } = useMapNavigation(projectSite!)

  useEffect(() => {
    if (state.selectedProjectToken)
      fetchLocationModel();
  }, [state.selectedProjectToken])

  useEffect(() => {
    return () => {
      destroyUserback();
    }
  }, []);

  useEffect(() => {
    if(pathMatch.params.locationId && projectTreeMap && projectTreeMap.get(pathMatch.params.locationId)) {
      const smartNode = projectTreeMap.get(pathMatch.params.locationId)?.smartObject
      smartNode && onMapNavNodeClicked(smartNode, true)
    }
  }, [projectTreeMap])

  useEffect(() => {
    if (state.chatLocation && projectTreeMap && projectTreeMap.get(state.chatLocation)) {
      const smartNode = projectTreeMap.get(state.chatLocation)?.smartObject
      smartNode && onMapNavNodeClicked(smartNode, true)
    }
  }, [state.chatLocation])

  async function fetchLocationModel() {
    dispatch(setIsLoading(true));
    const response = await fetchData(LIST_LOCATION_MODELS, {}, state.selectedProjectToken, projectFeatureAllowedRoles.viewBimModel);
    if (response.error) {
      NotificationMessage.sendNotification(`Error occurred while fetching model info`, AlertTypes.error);
      return;
    }

    const loctnModels: ILocationModel[] = response.data.locationModels.filter((model: ILocationModel) => {
      return model.locationModelStatuses.find((modelstatus) => modelstatus.status === 'COMPLETED')
    });

    if (loctnModels.length > 0) {
      setlocationModels(await useLocationModel(loctnModels));
    } else {
      setlocationModels([]);
    }
    dispatch(setIsLoading(false));
  }

  function onProjectInitialized(smartProjectSite: SmartProjectSite, locationTree?: LocationTree) {
    setProjectSite(smartProjectSite);
    setProjectLocationTree(locationTree);
  }

  function _onExteriorViewClicked() {
    onExteriorClicked();
    setSelectedForm(undefined);
    projectSite?.setBuildingContext
  }

  function onFormSelected(form: Form | undefined) {
    setSelectedForm(form);
    onSelectedFormChangedForNavigation(form);
  }

  function _onNodeClickInViewer(node: SmartNodes) {
    setSelectedForm(undefined);
    onNodeClickInViewer(node);
  }

  function _onMapNavNodeClicked(node: SmartNodes) {
    setSelectedForm(undefined);
    onMapNavNodeClicked(node);
  }

  function _onActiveTemplateChanged() {
    setSelectedForm(undefined);
  }

  function onUpdateSelectedRoomLabel() {
    setUpdateSelectedRoomLabel(updateSelectedRoomLabel + 1)
  }

  return (
    <div className={`v2-visualize v2-visualize-container  ${state.dashboardType === "classic" && 'classic-colors'}`}>
      {/* <VisualizeHeader setFormStatusFilter={setFormStatusFilter}/> */}
      <div className="v2-visualize-container-content">
        <VisualizesideBar
          projectSite={projectSite}
          projectLocationTree={projectLocationTree}
          selectedMapNode={selectedMapNode}
          onMapNavNodeClicked={_onMapNavNodeClicked}
          formStatusFilter={formStatusFilter}
          formSearchKey={formSearchKey}
          projectTreeAndSmartNodeMap={projectTreeMap!}
          selectedForm={selectedForm!}
          setSelectedForm={onFormSelected}
          onActiveTemplateChanged={_onActiveTemplateChanged}
          onBackButtonClick={onFormsBackButtonClicked}
          onHomeViewClicked={_onExteriorViewClicked}
          onUpdateSelectedRoomLabel={onUpdateSelectedRoomLabel}
        />
        <div className="v2-visualize-container-content-viewer">
          {locationModels && locationModels.length > 0 &&
            <VisualizeViewer
              locationModels={locationModels}
              projectId={state.currentProject.projectId}
              onProjectInitialized={onProjectInitialized}
              onNodeClickInViewer={_onNodeClickInViewer}
              selectedNode={selectedMapNodeForViewer}
              onBuildingLeave={_onExteriorViewClicked}
              setFormStatusFilter={setFormStatusFilter}
              defaultLocation={[locationModels[0].longitude || 0, locationModels[0].latitude || 0]}
              updateSelectedRoomLabel={updateSelectedRoomLabel}
            /> 
          }
          {
            locationModels && locationModels.length === 0 && <div className='info-msg'>Please upload model</div>
          }
          {
            locationModels && locationModels.length > 0 && !projectSite && <div className='info-msg-2'>Optimizing model for rendering...</div>
          }
        </div>
      </div>
    </div>
  );
};


export default function AnalyticsProvidedVisualize() {
  return (
    <UserDetailProvider>
      <AnalyticsProvider>
        <UserBackProvider>
          <DataModeProvider>
            <Visualize />
          </DataModeProvider>
        </UserBackProvider>
      </AnalyticsProvider>
    </UserDetailProvider>
  )
}