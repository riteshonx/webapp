import React, { useContext, useState, useEffect, useRef } from 'react';
import  {Button } from "@material-ui/core";
import { bimContext } from "../../../../contextAPI/bimContext";

let startPointEntityId = '';
let cubeEntityId = '';
let overlayController: any;
let startPoint: any = null;
let endPoint: any = null;

export default function DrawSpatialCube(props: any) {

    const context: any = useContext(bimContext);
    const [cubeDrawn, setCubeDrawn] = useState(false);
    const [selctingPoints, setSelctingPoints] = useState(false);
    const [isStartPointSet, setIsStartPointSet] = useState(false);
    const [isEndPointSet, setIsEndPointSet] = useState(false);
    const viewer = context.state.viewer;
    const visualizeJS = context.state.visualizeJS;
    const canvasElement = document.getElementById("canvas");

    useEffect(() => {
        canvasElement?.addEventListener("mousedown", mouseDownFn);
        viewer.setEnableAutoSelect(false);

        return(() => {
            canvasElement?.removeEventListener("mousedown", mouseDownFn);
            clearAll();
            detachOverlayController();
            setTimeout(() => viewer.setEnableAutoSelect(true), 1000); 
        })
    }, [])

    useEffect(() => {
        if (props.queryOption && props.queryOption.minBoundingBox && props.queryOption.maxBoundingBox) {
            drawBox( props.queryOption.minBoundingBox,  props.queryOption.maxBoundingBox, props.queryOption.tranformationnMatrxAry);
        }
    }, [props.queryOption])

    useEffect(() => {
        detachOverlayController();
        setSelctingPoints(false);
    }, [context.state.activeDraggerName]);

    const mouseDownFn = (ev: any) => {
        if (context.state.jobrunnerVersion === '23.4' && !overlayController) {
            return;
        }
        const x = ev.offsetX * window.devicePixelRatio;
        const y = ev.offsetY * window.devicePixelRatio;
        const point = viewer.getSnapPoint(x, y, 10);
        if(!point) return;

        if (!startPoint && cubeEntityId == '') {
            startPoint = point;
            setIsStartPointSet(true);
            drawCircle();
        } else if (!endPoint && cubeEntityId == '') {
            endPoint = point;
            setIsEndPointSet(true);
            removeEntity(startPointEntityId);
            drawBox(startPoint, endPoint);
        }
        setSelctingPoints(false);
        detachOverlayController();
    }

    const drawCircle = () => {
        try {
            const activeView = viewer.activeView;
            const model = viewer.getActiveModel();

            //Create an Entity under the model.
            //Use this entity name to find the entity for attributes
            const entity = model.appendEntity("spatial-points");

            const entityPtr = entity.openObject();
            const entityStr = entityPtr.getDatabaseHandle();
            const axis = [0, 1, 0];
            const meridien = [1, 0, 0];
            const sphere = entityPtr.appendSphere(startPoint, activeView?.viewFieldHeight * 0.002 || 2, axis, meridien);
            entityPtr.setColor(255, 0, 0);

            //Applying Visual style, so the ghost style is not applied to the sphere
            const defaultStyleId = viewer.findVisualStyle('GouraudWithEdges');

            const spatialVisualStyleName = "SQ" + Date.now();
            const spatialVisualStyleId = viewer.createVisualStyle(spatialVisualStyleName);
            const visualStyle = spatialVisualStyleId.openObject();
            visualStyle.copyFrom(defaultStyleId);
            entityPtr.setVisualStyle(spatialVisualStyleId)

            entityPtr.delete();

            viewer.unselect();
            viewer.update();
            startPointEntityId = entityStr;
            render();
        } catch (err) {
            console.log(err);
            startPoint = null;
            setIsStartPointSet(false);
        }
    };
    
    const drawBox = (startPoint: any[], endPoint: any[], trnMatrxAry: any = null) => {
        if (startPoint.length && endPoint.length) {
            setSelctingPoints(false);
            
            //Fetch the active model in the viewer
            const model = viewer.getActiveModel();

            //Create an Entity under the model.
            //Use this entity name to find the entity for attributes
            const entity = model.appendEntity("spatial-cube");

            const entityPtr = entity.openObject();
            const entityStr = entityPtr.getDatabaseHandle();

            //Set Color for all geometries' edges under the entity
            const redcolorDef = new visualizeJS.OdTvColorDef(255, 0, 0);
            entityPtr.setColor?.(redcolorDef, visualizeJS.GeometryTypes.kEdges);

            //Setting Face invisibility
            const defaultStyleId = viewer.findVisualStyle('GouraudWithEdges');

            const spatialVisualStyleName = "SQ" + Date.now();
            const spatialVisualStyleId = viewer.createVisualStyle(spatialVisualStyleName);
            const visualStyle = spatialVisualStyleId.openObject();
            visualStyle.copyFrom(defaultStyleId);

            // Setting Face Opacity to 0.001, since 0 is not reflected 
            visualStyle.setOptionInt32(visualizeJS.VisualStyleOptions.kEdgeModel, 1, visualizeJS.VisualStyleOperations.kSet);
            visualStyle.setOptionInt32(visualizeJS.VisualStyleOptions.kEdgeStyles, 1, visualizeJS.VisualStyleOperations.kSet);
            visualStyle.setOptionInt32(visualizeJS.VisualStyleOptions.kEdgeModifiers, 1, visualizeJS.VisualStyleOperations.kSet);
            visualStyle.setOptionInt32(visualizeJS.VisualStyleOptions.kFaceModifiers, 1, visualizeJS.VisualStyleOperations.kSet)
            visualStyle.setOptionDouble(visualizeJS.VisualStyleOptions.kFaceOpacityAmount, 0.001, visualizeJS.VisualStyleOperations.kSet)
            entityPtr.setVisualStyle(spatialVisualStyleId)

            //Set Box with Coordinates
            const smallX = startPoint[0] > endPoint[0] ? endPoint[0] : startPoint[0];
            const largeX = startPoint[0] < endPoint[0] ? endPoint[0] : startPoint[0];
            const smallY = startPoint[1] > endPoint[1] ? endPoint[1] : startPoint[1];
            const largeY = startPoint[1] < endPoint[1] ? endPoint[1] : startPoint[1];
            const smallZ = startPoint[2] > endPoint[2] ? endPoint[2] : startPoint[2];
            const largeZ = startPoint[2] < endPoint[2] ? endPoint[2] : startPoint[2];

            const center = [
                smallX + (largeX - smallX) / 2,
                smallY + (largeY - smallY) / 2,
                smallZ + (largeZ - smallZ) / 2,
            ];
            const length = largeX - smallX;
            const width = largeY - smallY;
            const height = largeZ - smallZ;
            const baseNormal = [0, 0, 1];
            const lengthDir = [1, 0, 0];
            const box = entityPtr.appendBox(center, length, width,height, baseNormal, lengthDir);
            const boxPtr = box.openObject();

            const lineWeight = new visualizeJS.OdTvLineWeightDef();
            lineWeight.setValue(2);
            boxPtr.setLineWeight(lineWeight);

            if (trnMatrxAry) {
               const matrix3d = setMatrix3d(trnMatrxAry);
               const gmtryData = entityPtr?.getGeometryDataIterator()?.getGeometryData().openObject();
               gmtryData.appendModelingMatrix(matrix3d)
            }

            //remove pointers
            boxPtr.delete();
            entityPtr.delete();
            viewer.unselect();

            setCubeDrawn(true);
            cubeEntityId = entityStr;
            props.setCubeInfo(true, entityStr);
            render();
        }
    };

    const removeEntity = (entityId: string) => {
        try {
            if (entityId === '') return;
            const model = viewer.getActiveModel();
            const entityPtr = model.findEntity(entityId);
            entityPtr && model.removeEntity(entityPtr);
        } catch (err) {
            console.log(err);
        }
    };

    const clearAll = () => {
        startPoint = null;
        endPoint = null;
        setCubeDrawn(false);
        setIsStartPointSet(false);
        setIsEndPointSet(false);
        removeEntity(startPointEntityId);
        removeEntity(cubeEntityId);
        startPointEntityId = '';
        cubeEntityId = ''
        setSelctingPoints(false);
        props.setCubeInfo(false, null);
    };

    const allowPoints = () => {
        attachOverlayController();
        setSelctingPoints(true);
    };

    const detachOverlayController = () => {
        if (overlayController && context.state.jobrunnerVersion == '23.4') {
            overlayController.detach();
            overlayController = null;
        }
    };

    const attachOverlayController = () => {
        if (context.state.jobrunnerVersion == '23.4') {
            overlayController = visualizeJS.getOverlayController(
                canvasElement,
                viewer
            );
            overlayController.attach();
        }
    };

    const render = () => {
        if (viewer){
            viewer.update();
            requestAnimationFrame(render);
        }
    };

    const setMatrix3d = (matrixAry: any) => {
        const matrix3d = new visualizeJS.Matrix3d()
        const colLength = matrixAry[0].length;
        for (let i = 0; i < matrixAry.length; i++) {
            for (let j = 0; j < colLength; j++) {
                matrix3d.set(i, j, matrixAry[i][j] )                
            }
        }
        return matrix3d;
    }

    return (
        <div className={"drawSpatialCube"}>
            <div className="button-container">
                <div className="spatial-buttons">
                    <Button fullWidth disabled={cubeDrawn || selctingPoints || isStartPointSet } className="btn-primary" onClick={allowPoints}>
                        Set Start Point
                    </Button>
                </div>
                <div className="spatial-buttons">
                    <Button fullWidth disabled={cubeDrawn || selctingPoints || !isStartPointSet } className="btn-primary" onClick={allowPoints}>
                        Set End Point
                    </Button>
                </div>
                <div className="spatial-buttons">
                    <Button fullWidth disabled={!(isStartPointSet || isEndPointSet || cubeDrawn)} className="btn-primary" onClick={clearAll} >
                        Clear
                    </Button>
                </div>
            </div>
        </div>
    );
}
