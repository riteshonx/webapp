import React, { useContext, useState, useEffect, useCallback } from 'react';
import { Button } from "@material-ui/core";
import { bimContext } from "../../../../contextAPI/bimContext";
import './SpatialCubeOperation.scss'
import { setActiveDraggerName } from "../../../../contextAPI/action";
import AspectRatio from '@material-ui/icons/AspectRatio';
import OpenWithIcon from '@material-ui/icons/OpenWith';
import CachedIcon from '@material-ui/icons/Cached';

let overlayController: any;
let mouseSnapPosition: any = null;
let mouseStartPosition: any = null;
let actionType: any;
const scaleSphere: any = [];
let scaleSphereIndex = -1;

export default function SpatialCubeOperation(props: any) {
    const context: any = useContext(bimContext);
    const [action, setAction] = useState('none');
    const viewer = context.state.viewer;
    const visualizeJS = context.state.visualizeJS;
    const canvasElement = document.getElementById("canvas");
    const openCloud = context.state.openCloud;
    const model = viewer.getActiveModel();
    const activeView = viewer.activeView;

    useEffect(() => {
        initializeEvents();
        return () => {
            resetPan();
            uninitializeEvents();
            clearScalePoints();
            document.removeEventListener("keydown", selectSphereWithKeyBoard, true);
            document.removeEventListener("keydown", rotateWithKeyBoard, true);
            document.removeEventListener("keydown", translateWithKeyBoard, true);
        };
    }, []);

    useEffect(() => {
        if(context.state.activeDraggerName === "Pan"  && actionType === "Scale"  ) return;
        setAction("none");
        actionType = "none";
        clearScalePoints();
    }, [context.state.activeDraggerName]);

    const initializeEvents = () => {
        canvasElement?.addEventListener("mousedown", mouseDownFn);
        canvasElement?.addEventListener("mouseup", mouseup);
        canvasElement?.addEventListener("mousemove", mousemove);
        document?.addEventListener("mouseup", mouseup);
    };

    const uninitializeEvents = () => {
        canvasElement?.removeEventListener("mousedown", mouseDownFn);
        canvasElement?.removeEventListener("mouseup", mouseup);
        canvasElement?.removeEventListener("mousemove", mousemove);
        document?.removeEventListener("mouseup", mouseup);
    };

    const mouseDownFn = (ev: any) => {
        const x = ev.offsetX * window.devicePixelRatio;
        const y = ev.offsetY * window.devicePixelRatio;
        mouseStartPosition = {x, y};
        mouseSnapPosition = viewer.screenToWorld(x, y);
    }

    const mousemove = (ev: any) => {
        if (mouseSnapPosition) {
            const x = ev.offsetX * window.devicePixelRatio;
            const y = ev.offsetY * window.devicePixelRatio;
            const mousenewPosition = {x, y};
            const newSnapPosition = viewer.screenToWorld(x, y);
            if (newSnapPosition) {
                if ('Translate'=== actionType) {
                    translate(mouseSnapPosition, newSnapPosition)
                } else if('Rotate'=== actionType) {
                    rotate(mouseSnapPosition, newSnapPosition, mouseStartPosition, mousenewPosition)
                } else if('Scale'=== actionType) {
                    scale(mouseSnapPosition, newSnapPosition)
                }
            }
        }
    }

    const mouseup = (ev: any) => {
        if(!mouseSnapPosition) return;
        
        mouseSnapPosition = null;
        if (scaleSphereIndex > -1) {
            clearScalePoints();
            drawScalePoints();
            resetPan();
        } else {
            if(actionType === 'Scale') {
                setTimeout(() => {
                    const selectedHandle = viewer.getSelected()?.getIterator()?.getEntity()?.openObject()?.getDatabaseHandle();
                    if(selectedHandle) {
                        scaleSphereIndex = scaleSphere.findIndex((value: any) => value === selectedHandle);
                        (scaleSphereIndex > -1) ? openCloud.activeDragger().dispose() : resetPan();
                    }
                }, 500);
            }
        }
    }


    const drawCircle = (startPoint: any, radiusFactor: any, trnMatrx: any = null) => {
        try {
            const model = viewer.getActiveModel();

            //Create an Entity under the model.
            //Use this entity name to find the entity for attributes
            const entity = model.appendEntity("spatial-points");

            const entityPtr = entity.openObject();
            const entityStr = entityPtr.getDatabaseHandle();
            const axis = [0, 1, 0];
            const meridien = [1, 0, 0];
            const sphere = entityPtr.appendSphere(startPoint, radiusFactor * 0.050 || 2, axis, meridien);
            entityPtr.setColor(0, 255, 0);

            //Applying Visual style, so the ghost style is not applied to the sphere
            const defaultStyleId = viewer.findVisualStyle('GouraudWithEdges');

            const spatialVisualStyleName = "SQ" + Date.now();
            const spatialVisualStyleId = viewer.createVisualStyle(spatialVisualStyleName);
            const visualStyle = spatialVisualStyleId.openObject();
            visualStyle.copyFrom(defaultStyleId);
            entityPtr.setVisualStyle(spatialVisualStyleId)

            if (trnMatrx) {
                const gmtryData = entityPtr?.getGeometryDataIterator()?.getGeometryData().openObject();
                gmtryData.appendModelingMatrix(trnMatrx)
            }

            entityPtr.delete();

            viewer.unselect();
            viewer.update();
            render();
            return entityStr;
        } catch (err) {
            console.log(err);
        }
    };

    const translate = (mouseSnapPosition: any, newSnapPosition: any) => {
        const target = new visualizeJS.Vector3d()
        target.set(...newSnapPosition);
        const position = new visualizeJS.Vector3d()
        position.set(...mouseSnapPosition);
        const arr = target.sub(position)
        arr.normalize()
        const entityId = model.findEntity(props.cubeEntityString);
        if(entityId) {
            const entity = entityId?.openObject();
            const gmtryData = entity?.getGeometryDataIterator()?.getGeometryData().openObject();
            const matrix3d = new visualizeJS.Matrix3d()
            const factor = activeView?.viewFieldHeight * 0.004;
            matrix3d.setTranslation([arr.x*factor, arr.y*factor, arr.z*factor])
            gmtryData.appendModelingMatrix(matrix3d)
            entity?.delete();
        }
    }

    const translateWithKeyBoard = useCallback((event: any) => {
        const entityId = model.findEntity(props.cubeEntityString);
        if(entityId) {
            const entity = entityId?.openObject();
            const gmtryData = entity?.getGeometryDataIterator()?.getGeometryData().openObject();
            const matrix3d = new visualizeJS.Matrix3d();
            switch (event.keyCode) {
                case 87:
                    matrix3d.setTranslation([0, 0, 1]);
                    break;
                case 83:
                    matrix3d.setTranslation([0, 0, -1]);
                    break;
                case 65:
                    matrix3d.setTranslation([-1, 0, 0]);
                    break;
                case 68:
                    matrix3d.setTranslation([1, 0, 0]);
                    break;
                case 81:
                    matrix3d.setTranslation([0, -1, 0]);
                    break;
                case 69:
                    matrix3d.setTranslation([0, 1, 0]);
                    break;
                default:
                    break;
            }
            gmtryData.appendModelingMatrix(matrix3d)
        }
    }, [])

    const rotate = (mouseSnapPos: any, newSnapPos: any, mouseStartPos: any, mousenewPos: any) => {
        const entityId = model.findEntity(props.cubeEntityString);
        if(entityId) {
            const entity = entityId?.openObject();
            const extents = entity.getExtents();
            const center = extents.center();
        
            const deltaX = mousenewPos.x - mouseStartPos.x;
	        const deltaY = mousenewPos.y - mouseStartPos.y;

            const gmtryData = entity?.getGeometryDataIterator()?.getGeometryData().openObject();
            const matrix3dX = new visualizeJS.Matrix3d()
            matrix3dX.setToRotation(deltaX*0.0010, [0, 0, 1], center)
            gmtryData.appendModelingMatrix(matrix3dX)
            const matrix3dY = new visualizeJS.Matrix3d()
            matrix3dY.setToRotation(deltaY*0.0010, [1, 0, 0], center)
            gmtryData.appendModelingMatrix(matrix3dY)
            
            mouseStartPosition = mousenewPos;
        }
    }

    const rotateWithKeyBoard = useCallback((event: any) => {
        const entityId = model.findEntity(props.cubeEntityString);
        if(entityId) {
            const entity = entityId?.openObject();
            const extents = entity.getExtents();
            const center = extents.center();
            const gmtryData = entity?.getGeometryDataIterator()?.getGeometryData().openObject();
            const matrix3d = new visualizeJS.Matrix3d();

            switch (event.keyCode) {
                case 87:
                    matrix3d.setToRotation(-0.01, [1, 0, 0], center)
                    break;
                case 83:
                    matrix3d.setToRotation(0.01, [1, 0, 0], center)
                    break;
                case 65:
                    matrix3d.setToRotation(-0.01, [0, 0, 1], center)
                    break;
                case 68:
                    matrix3d.setToRotation(0.01, [0, 0, 1], center)
                    break;
                case 81:
                    matrix3d.setToRotation(-0.01, [0, 1, 0], center)
                    break;
                case 69:
                    matrix3d.setToRotation(0.01, [0, 1, 0], center)
                    break;
                default:
                    break;
            }
            gmtryData.appendModelingMatrix(matrix3d)
        }
    }, [])

    const scale = ( mouseSnapPos: any, newSnapPos: any) => {
        const entityId = model.findEntity(props.cubeEntityString);
        if(entityId && scaleSphereIndex > -1) {
            const target = new visualizeJS.Vector3d()
            target.set(...newSnapPos);
            const position = new visualizeJS.Vector3d()
            position.set(...mouseSnapPos);
            const arr = target.sub(position)
            const entity = entityId?.openObject();
            const boxData = entity?.getGeometryDataIterator()?.getGeometryData()?.openAsBox();
            const factor = activeView?.viewFieldHeight * 0.004;

            if (boxData) {
                const boxCenter =  boxData.getCenterPoint();
                switch (scaleSphereIndex) {
                    case 0:
                        boxData.setLength(boxData.getLength() + (arr.x*factor));
                        boxData.setCenterPoint([boxCenter[0] + ((arr.x/2)*factor), boxCenter[1], boxCenter[2]]);
                        break;
                    case 1:
                        boxData.setLength(boxData.getLength() - (arr.x*factor));
                        boxData.setCenterPoint([boxCenter[0] + ((arr.x/2)*factor), boxCenter[1], boxCenter[2]]);
                        break;
                    case 2:
                        boxData.setWidth(boxData.getWidth() + (arr.y*factor));
                        boxData.setCenterPoint([boxCenter[0], boxCenter[1] + ((arr.y/2)*factor), boxCenter[2]]);
                        break;
                    case 3:
                        boxData.setWidth(boxData.getWidth() - (arr.y*factor));
                        boxData.setCenterPoint([boxCenter[0], boxCenter[1] + ((arr.y/2)*factor), boxCenter[2]]);
                        break;
                    case 4:
                        boxData.setHeight(boxData.getHeight() + (arr.z*factor));
                        boxData.setCenterPoint([boxCenter[0], boxCenter[1], boxCenter[2] + ((arr.z/2)*factor)]);
                        break;
                    case 5:
                        boxData.setHeight(boxData.getHeight() - (arr.z*factor));
                        boxData.setCenterPoint([boxCenter[0], boxCenter[1], boxCenter[2] + ((arr.z/2)*factor)]);
                        break;
                    default:
                        break;
                }
                mouseSnapPosition = newSnapPos;
            }
        }
    }

    const selectSphereWithKeyBoard = useCallback((event: any) => {
        const entityId = model.findEntity(props.cubeEntityString);
        if(entityId) {
            switch (event.keyCode) {
                case 9:
                    event.preventDefault();
                    scaleSphereIndex = scaleSphereIndex === scaleSphere.length - 1 ? 0 : scaleSphereIndex + 1;
                    const entityPtr = model.findEntity(scaleSphere[scaleSphereIndex]);
                    entityPtr && viewer.setSelectedEntity(entityPtr);
                    openCloud.activeDragger().dispose();
                    break;
                default:
                    break;
            }
        }
    }, [])

    const setActionType = (type: string) => {
        if(type === action) {
            setAction("none");
            actionType = "none";
            clearScalePoints();
            document.removeEventListener("keydown", selectSphereWithKeyBoard, true);
            document.removeEventListener("keydown", rotateWithKeyBoard, true);
            document.removeEventListener("keydown", translateWithKeyBoard, true);
        } else {
            if (type === "Scale") {
                resetPan();
                drawScalePoints(); 
                document.addEventListener("keydown", selectSphereWithKeyBoard, true);
                document.removeEventListener("keydown", rotateWithKeyBoard, true);
                document.removeEventListener("keydown", translateWithKeyBoard, true);
            } else {
                if(type === "Rotate") {
                    document.addEventListener("keydown", rotateWithKeyBoard, true)
                    document.removeEventListener("keydown", translateWithKeyBoard, true);
                    document.removeEventListener("keydown", selectSphereWithKeyBoard, true);
                } else {
                    document.addEventListener("keydown", translateWithKeyBoard, true);
                    document.removeEventListener("keydown", rotateWithKeyBoard, true);
                    document.removeEventListener("keydown", selectSphereWithKeyBoard, true);
                }
                scaleSphereIndex = -1;
                openCloud.activeDragger().dispose();
                clearScalePoints()
            }
            setAction(type);
            actionType = type;
        }
    }

    const drawScalePoints = () => {
        try {
            viewer.setEnableAutoSelect(true);
            const entityId = model.findEntity(props.cubeEntityString);
            if(entityId) {
                const entity = entityId?.openObject();
                const boxData = entity?.getGeometryDataIterator()?.getGeometryData()?.openAsBox();
                const gmtryData = entity?.getGeometryDataIterator()?.getGeometryData().openObject();
                const trnMatrx = gmtryData.getModelingMatrix()
                const invMatrx = trnMatrx.invert();
                gmtryData.appendModelingMatrix(invMatrx)
                setTimeout(async() => {
                    const extents = entity.getExtents();
                    const center = extents.center();
                    const min = extents.min();
                    const max = extents.max();
                    const activeView = viewer.activeView;
                    const rvtTrnMatrx = invMatrx.invert();
                    const radius = Math.max(boxData?.getLength(), boxData.getHeight(), boxData.getWidth())/2 || activeView?.viewFieldHeight;
                    scaleSphere[0] = drawCircle([max[0], center[1], center[2]], radius, rvtTrnMatrx);
                    scaleSphere[1] = drawCircle([min[0], center[1], center[2]], radius, rvtTrnMatrx);
                    scaleSphere[2] = drawCircle([center[0], max[1], center[2]], radius, rvtTrnMatrx);
                    scaleSphere[3] = drawCircle([center[0], min[1], center[2]], radius, rvtTrnMatrx);
                    scaleSphere[4] = drawCircle([center[0], center[1], max[2]], radius, rvtTrnMatrx);
                    scaleSphere[5] = drawCircle([center[0], center[1], min[2]], radius, rvtTrnMatrx);
                    const visualStyleId = entity.getVisualStyle();
                    const visualStyle = visualStyleId.openObject();
                    visualStyle.setOptionInt32(visualizeJS.VisualStyleOptions.kFaceModifiers, 1, visualizeJS.VisualStyleOperations.kSet)
                    visualStyle.setOptionDouble(visualizeJS.VisualStyleOptions.kFaceOpacityAmount, 0.75, visualizeJS.VisualStyleOperations.kSet)
                    gmtryData.appendModelingMatrix(rvtTrnMatrx)

                    //select First sphere
                    scaleSphereIndex = scaleSphereIndex === -1 ? 0 : scaleSphereIndex;
                    const entityPtr = model.findEntity(scaleSphere[scaleSphereIndex]);
                    entityPtr && viewer.setSelectedEntity(entityPtr);
                    openCloud.activeDragger().dispose();
                }, 100);
            }
        } catch (err) {
            console.log("On add scale points", err);
        }
    } 

    const clearScalePoints = () => {
        try {
            viewer.setEnableAutoSelect(false);
            const model = viewer.getActiveModel();
            scaleSphere.map((entityId: any) => {
                const entityPtr = model.findEntity(entityId);
                entityPtr && model.removeEntity(entityPtr);
            })
            const entityId = model.findEntity(props.cubeEntityString);
            if(entityId) {
                const entity = entityId?.openObject();
                const visualStyleId = entity.getVisualStyle();
                const visualStyle = visualStyleId.openObject();
                visualStyle.setOptionInt32(visualizeJS.VisualStyleOptions.kFaceModifiers, 1, visualizeJS.VisualStyleOperations.kSet)
                visualStyle.setOptionDouble(visualizeJS.VisualStyleOptions.kFaceOpacityAmount, 0.001, visualizeJS.VisualStyleOperations.kSet)
            }
        } catch (err) {
            console.log("On clear scale points", err);
        }
    } 
 
    const render = () => {
        viewer.update();
        requestAnimationFrame(render);
    };

    const resetPan = () => {
        openCloud.setActiveDragger("Orbit")
        context.dispatch(setActiveDraggerName("Pan"));
        openCloud.setActiveDragger("Pan");
    };

    return (
        <div className="spatialCubeOperation">
            <div className="spatial-buttons spatial-actions">
                <Button title='Translate cube using mouse pointer or w, s, a, d, q, e keyboard keys' 
                    className={'Translate'=== action ? "btn-primary" : "btn-secondary"} 
                    onClick={() => setActionType('Translate')}>
                    <OpenWithIcon />
                </Button>
            </div>
            {/* <div className="spatial-buttons spatial-actions">
                <Button title='Rotate cube using mouse pointer or w, s, a, d, q, e keyboard keys' 
                    className={'Rotate'=== action ? "btn-primary" : "btn-secondary"} 
                    onClick={() => setActionType('Rotate')}
                >
                    <CachedIcon />
                </Button>
            </div> */}
            <div className="spatial-buttons spatial-actions">
                <Button title='Select sphere on faces of cube and drag the mouse to expand/shrink the cube. Use tab key to switch sphere selection' 
                    className={'Scale'=== action ? "btn-primary" : "btn-secondary"} 
                    onClick={() => setActionType('Scale')}>
                    <AspectRatio />
                </Button>
            </div>
        </div>
    );
}
