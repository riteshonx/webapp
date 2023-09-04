import * as three from 'three';
import { ColorRepresentation, Vector3, Box3, Scene, Light, Camera, Group, Object3D, PerspectiveCamera, Plane, PlaneHelper, Mesh, BufferGeometry, Material, BoxBufferGeometry, Color } from 'three';
import mapboxgl, { LngLatLike } from 'mapbox-gl';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer';
import Stats from 'three/examples/jsm/libs/stats.module';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';

interface IMapboxInfo {
    token?: string;
    tilesets?: string[];
}

declare enum DisplayStyle {
    Color = 0,
    Greyscale = 1
}

interface IBuilding {
    buildingId: string;
    externalReferenceId: string;
    modelId: string;
    name: string;
    latitude: number;
    longitude: number;
    heightmapBaseElevation: number;
    flatmapBaseElevation: number;
    baseElevation: number;
    trueNorth: number;
}

declare class ProjectBuilding implements IBuilding {
    buildingId: string;
    externalReferenceId: string;
    modelId: string;
    name: string;
    baseElevation: number;
    latitude: number;
    longitude: number;
    trueNorth: number;
    heightmapBaseElevation: number;
    flatmapBaseElevation: number;
    constructor(buildingId: string, externalReferenceId: string, modelId: string, name: string, baseElevation: number, latitude: number, longitude: number, trueNorth: number);
}

interface IRoom {
    sourceId: string;
    externalReferenceId: string;
    title: string;
}

interface IZone {
    name: string;
    externalReferenceId: string;
    rooms: IRoom[];
    zones: IZone[];
}

interface ILevel {
    title: string;
    externalReferenceId: string;
    sourceId: string;
    elevation: number;
    rooms: IRoom[];
    bounds: {
        min: number[];
        max: number[];
    };
    zones: IZone[];
}

declare class ProjectLevelBounds {
    min: number[];
    max: number[];
    constructor(min: number[], max: number[]);
}

declare class ProjectRoom implements IRoom {
    sourceId: string;
    externalReferenceId: string;
    title: string;
    constructor(sourceId: string, externalReferenceId: string, title: string);
}

declare class ProjectZone implements IZone {
    externalReferenceId: string;
    name: string;
    zones: ProjectZone[];
    rooms: ProjectRoom[];
    constructor(name: string, externalReferenceId: string, zones: ProjectZone[], rooms: ProjectRoom[]);
}

declare class ProjectLevel implements ILevel {
    sourceId: string;
    externalReferenceId: string;
    title: string;
    bounds: ProjectLevelBounds;
    elevation: number;
    rooms: ProjectRoom[];
    zones: ProjectZone[];
    constructor(sourceId: string, externalReferenceId: string, title: string, bounds: ProjectLevelBounds, elevation: number, rooms?: ProjectRoom[], zones?: ProjectZone[]);
}

declare class ProjectModel {
    modelId: string;
    title: string;
    geometry: ArrayBuffer;
    levels: ProjectLevel[];
    constructor(modelId: string, title: string, geometry: ArrayBuffer, levels: ProjectLevel[]);
}

interface IProject {
    projectId: number;
    name: string;
    editable: boolean;
}

declare class ProjectOutline implements IProject {
    projectId: number;
    name: string;
    models: ProjectModel[];
    buildings: ProjectBuilding[];
    editable: boolean;
    constructor(projectId: number, name: string, models: ProjectModel[], buildings: ProjectBuilding[]);
}

declare enum HoverHighlightMode {
    Replace = 0,
    Darken = 1,
    Mix = 2,
    Nothing = 3
}

interface HighlightOptions {
    strength?: number;
    persist?: boolean;
    hoverHighlightMode?: HoverHighlightMode;
}

declare class SmartZone extends SmartNode {
    parentBuilding: SmartBuilding;
    parentLevel: SmartLevel;
    zones: SmartZone[];
    rooms: SmartRoom[];
    constructor(id: number, externalReferenceId: string, name: string, parent: SmartLevel | SmartZone, parentLevel: SmartLevel, nodeDepth: number);
    traverse(callback: (node: SmartNode) => void): void;
    findNodeById(id: number): SmartNode;
    findNodeByExternalId(externalId: string): SmartNode;
}

declare class SmartRoom extends SmartNode {
    parentBuilding: SmartBuilding;
    parentLevel: SmartLevel;
    constructor(id: number, externalReferenceId: string, name: string, parent: SmartLevel | SmartZone, parentLevel: SmartLevel, nodeDepth: number);
    traverse(callback: (node: SmartNode) => void): void;
}

declare type NodeTypeStrings = 'Building' | 'Level' | 'Zone' | 'Room';
declare type NodeTypes$2 = SmartBuilding | SmartLevel | SmartZone | SmartRoom;
declare type FocusCallbacks$1 = {
    callbackOnVisible?: () => void;
    callbackOnFinish?: () => void;
};
declare class SmartNode {
    id: number;
    externalReferenceId: string;
    name: string;
    nodeType: NodeTypeStrings;
    parentNode: NodeTypes$2;
    parentProject: SmartProjectSite;
    isVisibleOnTree: boolean;
    nodeDepth: number;
    protected constructor(id: number, externalReferenceId: string, name: string, nodeType: NodeTypeStrings, parentNode: NodeTypes$2, nodeDepth: number);
    traverseAncestors(callback: (ancestor: SmartNode) => void): void;
    focus: (focusCallbacks?: FocusCallbacks$1) => void;
    /** Highlights The Node. Note: Highlighting a building actually highlights the levels that make up the building and highlighting a zone actually highlights the rooms that make up that zone. Calling highlight on a zone then calling highlight on a room within that zone will overwrite whatever color was set by the zone. */
    highlight: (color?: ColorRepresentation, options?: HighlightOptions) => void;
    unHighlight: (removeHighlightPersistance?: boolean) => void;
    setIssueCount: (count: number) => void;
    get isBuilding(): boolean;
    get isLevel(): boolean;
    get isZone(): boolean;
    get isRoom(): boolean;
    setIsVisibleOnTree(value: boolean): void;
}

declare class SmartLevel extends SmartNode {
    parentBuilding: SmartBuilding;
    zones: SmartZone[];
    rooms: SmartRoom[];
    constructor(id: number, externalReferenceId: string, name: string, parent: SmartBuilding, nodeDepth: number);
    setContext(): void;
    setRoomContext(): void;
    hideOtherLevels(): void;
    traverse(callback: (node: SmartNode) => void): void;
    findNodeById(id: number): SmartNode;
    findNodeByExternalId(externalId: string): SmartNode;
}

declare class SmartBuilding extends SmartNode {
    levels: SmartLevel[];
    constructor(id: number, externalReferenceId: string, name: string, nodeDepth: number);
    show: () => void;
    hide: () => void;
    onlyShowLevel: (level: SmartLevel) => void;
    setDisplayStyle: (displayStyle: DisplayStyle) => void;
    setBuildingContext: () => void;
    setLevelContext: (levels?: SmartLevel[]) => void;
    setRoomContext: (level: SmartLevel) => void;
    unHighlightAll(): void;
    traverse(callback: (node: SmartNode) => void): void;
    findNodeById(id: number): SmartNode;
    findNodeByExternalId(externalId: string): SmartNode;
}

declare class SmartNodeCollection {
    id: number;
    name: string;
    externalReferenceId: string;
    nodeType: 'NodeCollection';
    nodes: (SmartNode | SmartNodeCollection)[];
    private nodesByExternalReferenceIdMap;
    nodeDepth: number;
    highestNode: SmartNode | SmartNodeCollection;
    parentLevel?: SmartLevel;
    constructor(id: number, name: string, externalReferenceId: string, nodes: (SmartNode | SmartNodeCollection)[], parentLevel: SmartLevel);
    highlight: () => void;
    unHighlight: () => void;
    focus: () => void;
    focusOnLevel: () => void;
    get parentNode(): SmartNode | SmartNodeCollection;
    findNodeByExternalReferenceId(externalReferenceId: string): SmartNode | SmartNodeCollection;
    traverseAncestors(callback: (ancestor: SmartNode | SmartNodeCollection) => void): void;
    private findHighestNode;
    updateParentNode(locationTreeNodeId: string): void;
}

declare type FocusCallbacks = {
    callbackOnVisible?: () => void;
    callbackOnFinish?: () => void;
};
declare class SmartProjectSite {
    id: number;
    buildings: SmartBuilding[];
    private externalReferenceNodeMap;
    constructor(id: number, buildings: SmartBuilding[]);
    findNodeById(id: number): SmartNode;
    findNodeByExternalId(externalId: string): SmartNode | SmartNodeCollection;
    focus: (focusCallbacks?: FocusCallbacks) => void;
    jumpTo: () => void;
    addToMap: () => void;
    removeFromMap: () => void;
    addToExternalReferenceNodes(node: SmartNode | SmartNodeCollection): void;
    createNodeCollectionFromIds: (ids: number[], name: string, externalReferenceId: string) => SmartNodeCollection;
    createNodeCollectionFromExternalReferenceIds(externalReferenceIds: string[], name: string, newNodeCollectionExternalReferenceId: string, metaDataInCaseOfError?: any): SmartNodeCollection;
    traverse(callback: (node: SmartNode) => void): void;
    setBuildingContext(): void;
    setLevelContext(): void;
    setRoomContext(level: SmartLevel): void;
    unHighlightAll(): void;
    show(): void;
    hide(): void;
    private setUpReferences;
}

declare class SmartViewer {
    name: string;
    focusedSmartNodeId: number;
    color: string;
    constructor(name: string, focusedSmartNodeId: number, color: string);
}

declare class CancellationToken {
    private cancellableActions;
    private _cancelled;
    onCancel(cancellableAction: () => void): void;
    cancel(): void;
    get isCancelled(): boolean;
}

declare class ViewerController {
    addProject: (project: ProjectOutline) => Promise<SmartProjectSite>;
    flyTo: ({ lat, lon, zoom, cancellationToken }: {
        lat: number;
        lon: number;
        zoom: number;
        cancellationToken?: CancellationToken;
    }) => Promise<void>;
    resize: () => void;
    setSelectedObject: (smartNode: SmartNode) => Promise<void>;
}

interface LocationIntelligenceViewerProps$1 {
    project: ProjectOutline;
    onProjectInitialized?: (smartProjectSite: SmartProjectSite) => void;
    onViewerInitialized?: (viewer: ViewerController) => void;
    selectedNode?: SmartNode | SmartNodeCollection;
    onNodeClick?: (node: SmartNode) => void;
    onNodeHoverEnter?: (node: SmartNode) => void;
    onNodeHoverExit?: (node: SmartNode) => void;
    onViewersChange?: (viewers: SmartViewer[]) => void;
    onBuildingLeave?: () => void;
    mapboxInfo?: IMapboxInfo;
    displayStyle?: DisplayStyle;
}
declare function MuiSeededLocationIntelligenceViewer$1(props: LocationIntelligenceViewerProps$1): JSX.Element;

declare enum VisualizeFocusType {
    GLOBE = 0,
    LOCAL = 1
}

declare class Coordinate extends Vector3 {
    constructor(lat: number, lon: number, alt?: number);
    get lon(): number;
    get lat(): number;
    get alt(): number;
    asLonLatArray(): number[];
    toScene(): Vector3;
    static toGps(scene: Vector3): Coordinate;
    private static projectToWorld;
    private static unprojectFromWorld;
    static centerBetween(coordinates: Coordinate[]): Coordinate;
    distanceTo(other: Coordinate): number;
    static fromLngLatLike(lngLatLike: LngLatLike): Coordinate;
}

interface FocusableObject {
    cameraFocusPoint: Vector3;
    maximumBoundingDimension: number;
    boundingDimensions: Box3;
    intermediateCoordinate: Coordinate;
    bearing?: number;
    nodeType?: string;
}

interface GlobeFocusableObject extends FocusableObject {
    focusableType: VisualizeFocusType.GLOBE;
}

declare class Label extends CSS2DObject {
    ownerId: number;
    contents: Element;
    constructor(ownerId: number, contents: Element, position: Vector3);
    isEqual(other: Label): boolean;
    copyLabel(label: Label): void;
}

declare enum VisualizeControlScope {
    MAPBOX = 0,
    THREE = 1
}

declare class VisualizeDiagnostics {
    private _stats;
    constructor();
    private positionStats;
    get stats(): Stats;
    dispose(): void;
}

declare type ProjectionType = 'mercator' | 'globe';
declare class VisualizeMapboxMap extends mapboxgl.Map {
    projectionMode: ProjectionType;
    private inputHandlers;
    private _visible;
    static readonly MIN_MERCATOR_ZOOM = 8;
    private markers;
    constructor(options?: mapboxgl.MapboxOptions);
    private _addMarker;
    addMarker: (id: number, coordinate: Coordinate, onClick: (id: number) => void) => void;
    private _removeMarker;
    removeMarker: (id: number) => void;
    private _hasMarker;
    hasMarker: (id: number) => boolean;
    private _showMarker;
    showMarker: (id: number) => void;
    private _hideMarker;
    hideMarker: (id: number) => void;
    getScaleAtZoomLevel(zoomLevel: number): any;
    getZoomLevelFromScale(scale: number): any;
    update(): void;
    set visible(visible: boolean);
    get fov(): any;
    set interactive(interactive: boolean);
    get canvas(): HTMLCanvasElement;
    get center(): Coordinate;
    get zoom(): number;
    private setup;
    private setMapProjection;
    private cacheHandlers;
    private setEventListeners;
    private onZoomChange;
}

declare class VisualizeScene extends Scene {
    lights: Light[];
    boundingBox: Box3;
    private boundingBoxCenter;
    private width;
    private height;
    private depth;
    private camera;
    private root;
    private _models;
    private _displayStyle;
    displayBelowGrade(displayBelowGrade: boolean): void;
    dispose(): void;
    constructor(lights: Light[], camera: Camera, root: Group);
    addUnscaled(...object: Object3D<Event | any>[]): void;
    addTemporary(duration: number, ...object: Object3D<Event | any>[]): void;
    setCenter(coordinate: Coordinate): void;
    setDisplayStyle(displayStyle: DisplayStyle): void;
    getLocalPositionFromWorld(worldPosition: Vector3): Vector3;
    getWorldPositionFromLocal(localPosition: Vector3): Vector3;
    getValueInWorldScale(value: number): number;
    getWorldScale(): Vector3;
    get north(): Vector3;
    get rootUp(): Vector3;
    get worldOrigin(): Vector3;
    get cameraFocusPoint(): Vector3;
    get maximumBoundingDimension(): number;
    get boundingDimensions(): Box3;
    private calculateBoundingBox;
    addToWorld(...object: Object3D<Event | any>[]): Window & typeof globalThis;
    removeFromWorld(...object: Object3D<Event | any>[]): Window & typeof globalThis;
    private _addUnscaled;
    private _addTemporary;
    clear(): this;
    private addPermanentFixtures;
}

declare class VisualizeRenderer {
    private externalRenderFuncs;
    private state;
    private _ssaoPass;
    private _composer;
    private _mapboxCanvas;
    private _threeCanvas;
    private _container;
    private _renderer;
    private _labelRenderer;
    private _scene;
    private _camera;
    private _autoRender;
    private _mapboxMap;
    private _diagnostics;
    private _resizeObserver;
    constructor(container: HTMLDivElement, gl: WebGLRenderingContext, scene: VisualizeScene, camera: PerspectiveCamera, mapboxMap: VisualizeMapboxMap, diagnostics: VisualizeDiagnostics);
    private setupComposer;
    private createRenderer;
    private createLabelRenderer;
    private setupResize;
    private resizeCanvas;
    private internalRender;
    private _internalRender;
    render(): void;
    set autoRender(autoRender: boolean);
    setSsaoClippingPlanesFunc(clippingPlanes: Plane[]): void;
    addRenderFunc(renderFunc: () => void): void;
    removeRenderFunc(renderFunc: () => void): void;
    get threeCanvas(): HTMLCanvasElement;
    get mapboxCanvas(): HTMLCanvasElement;
    updateLabels(labels: Label[]): void;
    setInputListener(visualizeScope: VisualizeControlScope): void;
    setRenderBelowGrade(displayBelowGrade: boolean): void;
    get isDisplayingBelowGrade(): boolean;
    dispose(): void;
    enableSsaoPass(enable: boolean): void;
}

interface LocalFocusableObject extends FocusableObject {
    focusableType: VisualizeFocusType.LOCAL;
    show?(): void;
}

declare class ClippingPlanes {
    minYClippingPlane: Plane;
    worldPlane: Plane;
    maxYClippingPlane: Plane;
    minPlaneHelper: PlaneHelper;
    maxPlaneHelper: PlaneHelper;
    clippingPlanes: Plane[];
    private tweens;
    private planeCapMap;
    private max;
    private min;
    private worldMin;
    private currentLocalTopPlanePosition;
    private currentLocalBottomPlanePosition;
    private currentWorldPlanePosition;
    private parent;
    private _hidden;
    private _renderer;
    constructor(parent: Object3D, renderer: VisualizeRenderer);
    setMinMax(worldMin: Vector3, min: Vector3, max: Vector3): void;
    setPos(minPos: number, maxPos: number): Promise<void>;
    hide(): void;
    show(): void;
    displayBelowGrade(): void;
    getDebuggablePlaneGroup(): Group;
    private animatePlanes;
    private render;
}

declare enum BoundaryType {
    Room = "room",
    Area = "area"
}
declare class Boundary {
    sourceId: string;
    roomLevels: string[];
    type: BoundaryType;
    level: string;
    center: Vector3;
    mesh: Mesh;
    name: string;
    private scaleToMeters;
    constructor(source: Object3D);
    private findMesh;
}

declare class Element3d {
    private scaleToMeters;
    sourceId: string;
    level: string;
    meshes: Mesh[];
    name: string;
    userData: {
        [key: string]: any;
    };
    constructor(source: Object3D);
    private findMeshes;
}

declare class Bounds {
    center: number[];
    min: number[];
    max: number[];
}

declare class Level$1 {
    bounds: Bounds;
    next: string;
    prev: string;
    sourceId: string;
}

declare class Gltf {
    boundaries: Map<string, Boundary>;
    boundariesByLevel: Map<string, Boundary[]>;
    elements: Element3d[];
    private lidata;
    private group;
    constructor(source: GLTF);
    private createHierarchy;
    get model(): Group;
    get levelsMetadata(): Level$1[];
}

interface _Interactable {
    geometry?: BufferGeometry;
    material?: Material | Material[];
    interactableId?: string;
}
interface IInteractable extends Object3D {
    onHoverEnter: () => void;
    onHoverExit: () => void;
    onClick: () => void;
}
declare class Interactable extends Mesh implements IInteractable {
    managerId: string;
    interactableId: string;
    type: 'Interactable';
    interactable: boolean;
    objectBeingInteracted: IInteractable;
    constructor(interactable?: _Interactable);
    onHoverEnter(): void;
    onHoverExit(): void;
    onClick(): void;
    static convertMeshToInteractable(mesh: Mesh, interactableId: string, onHover: () => void, onUnHover: () => void, onClick: () => void, objectBeingInteracted?: IInteractable): void;
}

declare class Model extends Object3D implements FocusableObject, IInteractable {
    coordinate: Coordinate;
    intermediateCoordinate: Coordinate;
    setSsaoClippingPlanes: (clippingPlanes: Plane[]) => void;
    protected clippingPlanes: ClippingPlanes;
    private interactableMeshes;
    protected clippingGroup: Group;
    private boundingVolume;
    constructor(gltf: Gltf, name: string, renderer: VisualizeRenderer);
    get center(): Vector3;
    get cameraFocusPoint(): Vector3;
    get maximumBoundingDimension(): number;
    get boundingDimensions(): Box3;
    get isModel(): boolean;
    getBoundingObject(): Mesh<BoxBufferGeometry, three.Material | three.Material[]>;
    setBoundingBox(): void;
    rotateX90Degrees(): void;
    centerOnGround(): void;
    setAllInteractable(interactable: boolean): void;
    displayBelowGrade(): void;
    hide(): void;
    show(): void;
    onClick(): void;
    onHoverEnter(): void;
    onHoverExit(): void;
    buildClippingPlanes(): void;
    getDebuggablePlaneGroup(): Group;
    set interactable(interactable: boolean);
    addMesh(mesh: Mesh, parent: Group): void;
    removeMesh(mesh: Mesh, parent: Group): void;
    setDisplayStyle(displayStyle: DisplayStyle): void;
    protected unitsPerMeter(): number;
    protected setUpMesh(mesh: Mesh): void;
    protected createPlaneStencilGroup(geometry: BufferGeometry, plane: Plane, renderOrder: number): Group;
}

interface GeoMappedObject {
    coordinate: Coordinate;
    elevation: number;
}

interface BuildingLayout {
    name: string;
    levels: ILevel[];
}

declare class Area extends Interactable implements LocalFocusableObject {
    focusableType: VisualizeFocusType.LOCAL;
    isArea: 'Area';
    isValid: boolean;
    boundingBox: Box3;
    private _center;
    private heightOffset;
    private boundary;
    intermediateCoordinate: Coordinate;
    constructor(boundary: Boundary, floorHeight: number, floorCenter: Vector3, material: Material, heightOffset: number, focusOnIntermediateCoordinate: Coordinate);
    get boundingVolume(): Box3;
    get cameraFocusPoint(): Vector3;
    get maximumBoundingDimension(): number;
    get boundingDimensions(): Box3;
    get center(): Vector3;
}

declare class Zone extends Object3D implements LocalFocusableObject {
    focusableType: VisualizeFocusType.LOCAL;
    name: string;
    rooms: Room[];
    zones: Zone[];
    isActive: Boolean;
    nodeType: 'Zone';
    parentBuilding: Building;
    parentLevel: Level;
    parentZone: Zone;
    private boundingBox;
    private nodeDepth;
    private isVisisbleInScene;
    externalReferenceId: string;
    constructor(zone: IZone, boundaries: Map<string, Boundary>, floor: number, floorCenter: Vector3, parentBuilding: Building, parentLevel: Level, parentZone: Zone, nodeDepth: number);
    get isValid(): boolean;
    get parentZoneOrLevel(): Zone | Level;
    private setBoundingBox;
    get boundingVolume(): Box3;
    get center(): Vector3;
    get size(): Vector3;
    get cameraFocusPoint(): Vector3;
    get maximumBoundingDimension(): number;
    get intermediateCoordinate(): Coordinate;
    get boundingDimensions(): Box3;
    highlight(color?: ColorRepresentation, options?: HighlightOptions): void;
    unHighlight(removeHighlightPersistance?: boolean): void;
    setInteractable(interactable: boolean): void;
    onAddToWorld(): void;
    onRemoveFromWorld(): void;
    asSmartZone(parent: SmartLevel | SmartZone, parentLevel: SmartLevel, focusOn: (focusableObject: FocusableObject) => Promise<void>): SmartZone;
    findNodeById(nodeId: number): Zone | Room;
}

declare class Room extends Area {
    nodeType: 'Room';
    parentBuilding: Building;
    parentLevel: Level;
    parentZone: Zone;
    private persistedColor;
    private persistedColorStrength;
    private colorPersist;
    private hoverHighlightMode;
    externalReferenceId: string;
    private isVisisbleInScene;
    private nodeDepth;
    private roomLabel;
    issueCount: number;
    constructor(room: IRoom, boundary: Boundary, floorHeight: number, floorCenter: Vector3, parentBuilding: Building, parentLevel: Level, parentZone: Zone, nodeDepth: number);
    get parentLevelOrZone(): Zone | Level;
    createRoomLabel(show: boolean): void;
    createLabelElement(): HTMLSpanElement;
    highlight(color?: ColorRepresentation, options?: HighlightOptions): void;
    unHighlight(removeHighlightPersistance?: boolean): void;
    setIssueCount(count: number): void;
    onAddToWorld(): void;
    onRemoveFromWorld(): void;
    asSmartRoom(parentNode: SmartLevel | SmartZone, parentLevel: SmartLevel, focusOn: (focusableObject: FocusableObject) => Promise<void>): SmartRoom;
    private _highlight;
    private _unHighlight;
}

declare type NodeTypes$1 = Building | Level | Zone | Room | NodeCollection;
declare class NodeCollection implements LocalFocusableObject {
    focusableType: VisualizeFocusType.LOCAL;
    nodeType: 'NodeCollection';
    nodes: NodeTypes$1[];
    name: string;
    id: number;
    buildingsMap: Map<number, Building>;
    levelsMap: Map<number, Level>;
    zonesMap: Map<number, Zone>;
    roomsMap: Map<number, Room>;
    nodeCollectionMap: Map<number, NodeCollection>;
    boundingBox: Box3;
    externalReferenceId: string;
    private _parentLevel;
    constructor(nodes: NodeTypes$1[], name: string, externalReferenceId: string);
    highlight(): void;
    unHighlight(): void;
    updatedParentLevel(parentLevel: Level): void;
    asSmartNodeCollection(smartProject: SmartProjectSite): SmartNodeCollection;
    get parentNode(): Level;
    get boundingVolume(): Box3;
    get center(): Vector3;
    get parentLevel(): Level;
    private calculateParentLevel;
    private buildNodeMaps;
    private addNodeCollection;
    private getParentLevelId;
    get cameraFocusPoint(): Vector3;
    get intermediateCoordinate(): Coordinate;
    get maximumBoundingDimension(): number;
    get boundingDimensions(): Box3;
    private getBox3;
}

declare class LevelMesh {
    private parentGroup;
    private meshes;
    private meshesAsInteractables;
    private ceilingMeshes;
    private floorMeshes;
    private additionalFloorMeshes;
    private defaultHighlightColor;
    private defaultHighlightStrength;
    private persistedColor;
    private persistedColorStrength;
    private colorPersist;
    private hoverHighlightMode;
    private building;
    constructor(parentGroup: Group, defaultHighlightColor: Color | ColorRepresentation, defaultHighlightStrength: number, building: Building);
    private processGeometry;
    postProcess(levelCenter: Vector3, heightOffset: number): void;
    add(mesh: Mesh): void;
    addAdditionalFloorGeometry(meshes: Mesh[]): void;
    highlight(color?: Color, options?: HighlightOptions): void;
    private _highlight;
    unHighlight(removeHighlightPersistance?: boolean): void;
    private _unHighlight;
    setInteractable(isInteractable: boolean): void;
    claimInteractable(level: Level): void;
    setHighlightLimits(min: number, max: number): void;
    isolateVisibility(show: boolean): void;
    resetVisibility(): void;
    getTemporaryBounds(): Box3;
    private setCeilingVisibility;
}

declare type onMouseEvent = (level: Level) => void;
declare type NodeTypes = Building | Level | Zone | Room | NodeCollection;
declare class Level extends Object3D implements LocalFocusableObject, IInteractable {
    focusableType: VisualizeFocusType.LOCAL;
    visible: boolean;
    sourceId: string;
    rooms: Room[];
    zones: Zone[];
    elevation: number;
    parentBuilding: Building;
    nodeType: 'Level';
    levelMesh: LevelMesh;
    private _center;
    boundingBox: Mesh;
    private _onHover;
    private _onUnHover;
    externalReferenceId: string;
    private nodeDepth;
    private isVisisbleInScene;
    roomLabels: Label[];
    isLabelAdeded: boolean;
    defaultDepth: number;
    private boundsSize;
    constructor(level: ILevel, rooms: Map<string, IRoom>, roomBoundariesByLevel: Map<string, Boundary[]>, boundaries: Map<string, Boundary>, geometryParent: Group, gltfLevel: Level$1, onHover: onMouseEvent, onUnHover: onMouseEvent, parentBuilding: Building);
    addToLevelMesh(mesh: Mesh): void;
    setInteractable(interactable: boolean): void;
    claimInteracatable(): void;
    get maximumBoundingDimension(): number;
    get boundingDimensions(): Box3;
    get cameraFocusPoint(): Vector3;
    get intermediateCoordinate(): Coordinate;
    get center(): Vector3;
    setDebugVisible(visible: boolean): void;
    setZoneRoomInteractable(interactable: boolean): void;
    onHoverEnter(): void;
    onHoverExit(): void;
    onClick(): void;
    onAddToWorld(): void;
    onRemoveFromWorld(): void;
    asSmartLevel(parent: SmartBuilding, focusOn: (focusableObject: FocusableObject) => Promise<void>): SmartLevel;
    findNodeById(nodeId: number): Level | Zone | Room;
    containsPoint(point: Vector3): boolean;
    makeOnlyRoomsInteractable(): void;
    highlight(color?: ColorRepresentation, options?: HighlightOptions): void;
    unHighlight(removeHighlightPersistance?: boolean): void;
    private setDimensionalData;
    private createBoundingBox;
    isolateVisibility(sourceId: string): void;
    showRoomLabels(show: boolean, selectedNode?: NodeTypes): void;
    addRoomLabels(show: boolean): void;
    resetVisibility(): void;
    updateDepth(depth: number): void;
}

declare class Building extends Model implements GeoMappedObject, LocalFocusableObject {
    focusableType: VisualizeFocusType.LOCAL;
    buildingId: string;
    modelId: string;
    levels: Level[];
    trueNorth: number;
    elevation: number;
    nodeType: 'Building';
    externalReferenceId: string;
    private currentOpenLevel;
    private buildingMesh;
    private nodeDepth;
    private isVisisbleInScene;
    constructor(model: Gltf, layout: BuildingLayout, building: IBuilding, renderer: VisualizeRenderer);
    private mergeGltfLevels;
    private buildLevels;
    private setZoneRoomsInteractable;
    makeOnlyLevelsInteractable(levels?: Level[]): void;
    makeOnlyBuildingInteractable(): void;
    makeOnlyRoomsInteractable(level: Level): void;
    claimSsaoClippingPlanes(): void;
    releaseSsaoClippingPlanes(): void;
    enter(): void;
    leave(): void;
    highlight(color?: ColorRepresentation, options?: HighlightOptions): void;
    unHighlight(removeHighlightPersistance?: boolean): void;
    unHighlightZones(): void;
    highlightZone(zone: Zone, color?: ColorRepresentation): void;
    highlightRoom(room: Room, color?: ColorRepresentation): void;
    unHighlightRooms(): void;
    onlyShowLevel(level: Level): void;
    resetOpenLevel(): void;
    initInWorld(): void;
    show(): void;
    hide(): void;
    onAddToWorld(): void;
    onRemoveFromWorld(): void;
    asSmartBuilding(focusOn: (focusableObject: FocusableObject) => Promise<void>): SmartBuilding;
    findNodeById(nodeId: number): Building | Level | Zone | Room;
    private findLevelBySmartLevel;
    private findLevelsBySmartLevels;
    private isolateVisibility;
    private resetVisibility;
    private setClippingPlanesToLevel;
    protected setUpMesh(mesh: Mesh<BufferGeometry, Material | Material[]>): void;
}

declare class BuildingsFocusable implements GlobeFocusableObject {
    focusableType: VisualizeFocusType.GLOBE;
    private buildings;
    constructor(buildings: Building[]);
    get cameraFocusPoint(): Vector3;
    get bearing(): number;
    get intermediateCoordinate(): Coordinate;
    get maximumBoundingDimension(): number;
    get boundingDimensions(): Box3;
    private getBox3;
}

interface LocationIntelligenceViewerProps {
    project?: ProjectOutline;
    onProjectInitialized?: (smartProjectSite: SmartProjectSite) => void;
    onViewerInitialized?: (viewer: ViewerController) => void;
    selectedNode?: SmartNode | SmartNodeCollection;
    onNodeClick?: (node: SmartNode) => void;
    onNodeHoverEnter?: (node: SmartNode) => void;
    onNodeHoverExit?: (node: SmartNode) => void;
    onViewersChange?: (viewers: SmartViewer[]) => void;
    onBuildingLeave?: () => void;
    mapboxInfo?: IMapboxInfo;
    displayStyle?: DisplayStyle;
    debugging?: boolean;
    defaultLocation: [number, number];
    updateSelectedRoomLabel?: number;
}
declare function MuiSeededLocationIntelligenceViewer(props: LocationIntelligenceViewerProps): JSX.Element;

export { BuildingsFocusable, DisplayStyle, HoverHighlightMode, IMapboxInfo, MuiSeededLocationIntelligenceViewer$1 as LocationIntelligenceViewer, MuiSeededLocationIntelligenceViewer as LocationIntelligenceViewerV2, ProjectOutline as Project, ProjectBuilding, ProjectLevel, ProjectLevelBounds, ProjectModel, ProjectRoom, ProjectZone, SmartBuilding, SmartLevel, SmartNodeCollection, NodeTypeStrings as SmartNodeTypeStrings, SmartProjectSite, SmartRoom, SmartZone, ViewerController };
