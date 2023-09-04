import { styled } from '@mui/material';
import { createGenerateClassName, StylesProvider } from '@mui/styles';
import { SmartProjectSite } from 'location-intelligence-viewer';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';

import { LocationIntelligenceThemeProvider, Theme } from '../theme';
import { Forms } from './components/Forms';
import { FormTypeGroup } from './components/Forms/groupingWhiteList/FormTypeGroup';
import { LocationFormStatusFilters } from './components/LocationTreeFormStatus/LocationFormStatusFilters';
import { MapNavigation } from './components/MapNavigation';
import { SearchPanel } from './components/SearchPanel/Search.Panel';
import { Viewer } from './components/Viewer';
import { useMapNavigation } from './hooks/useMapNavigation';
import { useModelStatusColors } from './hooks/useModelStatusColors';
import { useProject } from './hooks/useProject';
import { Form } from './models/form';
import { FormType } from './models/formType';
import { ProjectTreeAndSmartObjectNodeMap } from './models/projectTreeAndSmartObjectNodeMap';
import { SmartNodes } from './models/SmartNodes';
import { AnalyticsProvider } from './utils/analytics/Analytics.Context';
import { DataModeProvider, useDataMode } from './utils/DataMode';
import { UserBackProvider, useUserBack } from './utils/UserBack/UserBack.Context';
import { UserDetailProvider } from './utils/UserDetail';
import { WithLoadingSpinner } from './utils/WithLoadingSpinner';

const minMapNavigationWidth = 206;
const maxMapNavigationWidth = 400;
const formsMinWidth = 355;
const formsMaxWidth = 520;
const searchPanelHeight = 90;

const LocationIntelligenceContainer = styled('div')(({theme}) => ({
    height: `calc(${(theme as Theme).windowHeight}px - 54px)`,
    display: 'flex',
    flexDirection: 'row',
    overflow: 'hidden',
    boxSizing: 'border-box',
    maxWidth: `calc(100vw - ${(theme as Theme).navMenuWidth}px)`,
}));

const SidePanelContainer = styled('div')(({theme}) => ({
    height: `calc(${(theme as Theme).windowHeight}px - 54px)`,
    overflow: 'hidden',
    flex: '1 1 60%',
}));

const SplitSidePanelContainer = styled('div')(({theme}) => ({
    display: 'flex',
    flexDirection: 'row',
    height: `calc(${(theme as Theme).windowHeight}px -  ${searchPanelHeight}px - 54px)`,
    overflow: 'hidden',
}));

const SearchPanelContainer = styled('div')(({theme}) => ({
    width: '100%',
    height: `${searchPanelHeight}px`,
    overflow: 'hidden',
    borderBottom: 'solid 1px #BDBDBD'
}));

const MapNavigationContainer = styled('div')(({theme}) => ({
    minWidth: `${minMapNavigationWidth}px`,
    flex: '1 1 7%',
    maxWidth: `${maxMapNavigationWidth}px`,
    height: `calc(${(theme as Theme).windowHeight}px - ${searchPanelHeight}px - 54px)`,
    overflow: 'hidden',

    [(theme as Theme).breakpoints.down('lg')]: {
        maxWidth: `${minMapNavigationWidth}px`,
    },
}));

const FormsContainer = styled('div')(({theme}) => ({
    minWidth: `${formsMinWidth}px`,
    flex: '1 1 40%',
    backgroundColor: 'white',
    maxWidth: `${formsMaxWidth}px`,
    height: `calc(${(theme as Theme).windowHeight}px - ${searchPanelHeight}px - 54px)`,
    boxShadow: '0px 4px 4px 0px rgba(0, 0, 0, 0.25)',
    overflow: 'hidden',
}));

const ViewerContainer = styled('div')(({theme}) => ({
    position: 'relative',
    display: 'flex',
    flex: '1 1 100%',
    width: 'unset',
    height: `calc(${(theme as Theme).windowHeight}px - 54px)`,
    maxWidth: `calc(100vw - (${minMapNavigationWidth}px + ${formsMinWidth}px + ${(theme as Theme).navMenuWidth}px))`,
    overflow: 'hidden',

    [(theme as Theme).breakpoints.down('lg')]: {
        flex: 'unset',
        width: `calc(100% - (${minMapNavigationWidth}px + ${formsMinWidth}px))`,
    },
}));

function LocationIntelligenceView() {
    const {dataMode} = useDataMode();
    const bim360Mode = dataMode === 'BIM360';

    const {userbackLoaded, showUserback, destroyUserback, hideUserback} = useUserBack();

    const {project, projectLocationTree} = useProject();
    const [projectSite, setProjectSite] = useState<SmartProjectSite>();
    const [activeFormTypes, setActiveFormTypes] = useState<FormType[]>([]);
    const [activeFormTemplate, setActiveFormTemplate] = useState<FormType[]>();
    const [selectedForm, setSelectedForm] = useState<Form>();
    const [activeAssigneeToFormTypes, setActiveAssigneeToFormTypes] = useState<string[]>([]);

    const {selectedMapNode, selectedMapNodeForViewer, onExteriorClicked, onMapNavNodeClicked, onNodeClickInViewer, onSelectedFormChanged: onSelectedFormChangedForNavigation, onFormsBackButtonClicked} = useMapNavigation(projectSite!);

    const projectTreeMap = useMemo(() =>
        Boolean(projectLocationTree) && Boolean(projectSite) ? new ProjectTreeAndSmartObjectNodeMap(projectLocationTree!, projectSite!) : undefined
    , [projectLocationTree, projectSite]);

    const [formStatusFilter, setFormStatusFilter] = useState<LocationFormStatusFilters>(LocationFormStatusFilters.Open);
    const [formSearchKey, setFormSearchKey] = useState<string>('');

    const [featureTypeGroups, setFeatureTypeGroups] = useState<FormTypeGroup[]>([]);
    const featureTypeTasks = useMemo(() => featureTypeGroups.map((group) => group.featureTypeTasks).flat(), [featureTypeGroups]);
    useModelStatusColors(projectTreeMap!, projectLocationTree!, projectSite!, formStatusFilter, selectedMapNode!, activeFormTypes, selectedForm!, featureTypeTasks, activeFormTemplate!, activeAssigneeToFormTypes);

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

    useEffect(() => {
        if (Boolean(selectedMapNode) && Boolean(selectedForm) && selectedMapNode!.externalReferenceId !== selectedForm!.locationId && selectedForm?.isLinkedToLocation) {
            setSelectedForm(undefined);
        }
    }, [selectedMapNode, selectedForm]);

    useEffect(() => {
        console.log('Slate Visualize - 1.2.3');
        return () => {
            destroyUserback();
        }
    }, []);

    return (
        <LocationIntelligenceThemeProvider>
            <LocationIntelligenceContainer>
                <SidePanelContainer>

                    <SearchPanelContainer>
                        <SearchPanel 
                            buildings={projectSite?.buildings}
                            onChange={(value: string) => {setFormSearchKey(value)}} 
                            smartProjectSite={projectSite}
                            reset={_onExteriorViewClicked}
                        />
                    </SearchPanelContainer>

                    <SplitSidePanelContainer>
                        <MapNavigationContainer>
                            <WithLoadingSpinner loading={!Boolean(projectSite)}>
                                <MapNavigation
                                    // eslint-disable-next-line
                                    buildings={projectSite?.buildings!}
                                    onHomeViewClicked={_onExteriorViewClicked}
                                    onMapNavNodeClicked={onMapNavNodeClicked}
                                    selectedNode={selectedMapNode!}
                                />
                            </WithLoadingSpinner>
                        </MapNavigationContainer>

                        <FormsContainer>
                            <Forms
                                selectedForm={selectedForm!}
                                setSelectedForm={onFormSelected}
                                selectedMapNode={selectedMapNode!}
                                projectTreeAndSmartNodeMap={projectTreeMap!}
                                projectSite={projectSite!}
                                locationTree={projectLocationTree!}
                                formStatusFilter={formStatusFilter}
                                formSearchKey={formSearchKey}
                                onActiveFeatureTypesChanged={setActiveFormTypes}
                                onBackButtonClick={onFormsBackButtonClicked}
                                setFeatureTypeGroups={setFeatureTypeGroups}
                                allowDrafts={bim360Mode!}
                                onActiveTemplateChanged={setActiveFormTemplate}
                            />
                        </FormsContainer>
                    </SplitSidePanelContainer>
                </SidePanelContainer>

                <ViewerContainer>
                    <WithLoadingSpinner loading={!Boolean(projectSite)} overlay={true}>
                        <Viewer
                            project={project!}
                            onProjectInitialized={setProjectSite}
                            onNodeClick={_onNodeClickInViewer}
                            selectedMapNode={selectedMapNodeForViewer!}
                            onBuildingLeave={_onExteriorViewClicked}
                            setFormStatusFilter={setFormStatusFilter}
                        />
                    </WithLoadingSpinner>
                </ViewerContainer>
            </LocationIntelligenceContainer>
        </LocationIntelligenceThemeProvider>
    )
}

const generateClassName = createGenerateClassName({
    seed: 'LI'
});

function AnalyticsProvidedLocationIntelligenceView() {
    return (
        <UserDetailProvider>
            <AnalyticsProvider>
                <UserBackProvider>
                    <DataModeProvider>
                        <LocationIntelligenceView />
                    </DataModeProvider>
                </UserBackProvider>
            </AnalyticsProvider>
        </UserDetailProvider>
    )
}

export function MuiSeededLocationIntelligenceView() {
    return (
        <StylesProvider generateClassName={ generateClassName }>
            <AnalyticsProvidedLocationIntelligenceView />
        </StylesProvider>
    )
}