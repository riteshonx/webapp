import React, { ReactElement, useContext, useEffect, useReducer, useState } from "react"
import { setActiveDraggerName} from "../../../contextAPI/action";
import { bimContext } from "../../../contextAPI/bimContext";
import './actionPanel.scss';
import HomeIcon from '../../../../../assets/images/Home-icon.svg';
import DraggableComponent from '../../component/DraggableComponent/DraggableComponent';
import PanIcon from '@material-ui/icons/OpenWith';
import ZoomIcon from '@material-ui/icons/Search';
import OrbitIcon from '@material-ui/icons/Cached';
import DirectionsWalkIcon from '@material-ui/icons/DirectionsWalk';
import ListIcon from '@material-ui/icons/List';
import BimProps from './BimProps/BimProps';
import FlipToBackIcon from '@material-ui/icons/FlipToBack';
import FlipToFrontIcon from '@material-ui/icons/FlipToFront';
import BorderColorIcon from '@material-ui/icons/BorderColor';

const draggableBottomStyle = {
    position: "absolute",
    left: "45%",
    top: "calc(100vh - 140px)",
    background: "#F9F9F9",
    border: "1px solid #EDEDED",
    boxSizing: "border-box",
    boxShadow: "0px 0px 8px rgba(0, 0, 0, 0.25)"
};

const draggableTopStyle = {
    position: "absolute",
    left: "45%",
    top: "50px",
    background: "#F9F9F9",
    border: "1px solid #EDEDED",
    boxSizing: "border-box",
    boxShadow: "0px 0px 8px rgba(0, 0, 0, 0.25)"
};

let scaling = false;
let viewer: any;
let openCloud: any;
let canvasElement: any;
let zoomDist = 0;

let context: any = null;

export default function ActionPanel(): ReactElement {

    context = useContext(bimContext);
    viewer = context.state.viewer;
    openCloud = context.state.openCloud;
    canvasElement = document.getElementById("canvas");
    const [draggableStyle, setDraggableStyle] = useState(draggableBottomStyle);
    const [showProps, setShowProps] = useState(false);
    const [explodeIndex, setExplodeIndex] = useState(1);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        handlePan();
        addTouchListener();

        return () => removeTouchListener();
    }, []);

    useEffect(() => {
        context.state.isActiveViewTimeline ? setDraggableStyle(draggableTopStyle) : setDraggableStyle(draggableBottomStyle)
    }, [context.state.isActiveViewTimeline]);

    useEffect(()=>{
        if(context.state.activeGeometryName !== '3D-Views') {
            changePlugin("Pan");
            context.dispatch(setActiveDraggerName("Pan"))
            setShowProps(false);
        }    
    },[context.state.activeGeometryName])

    const getActivityClassName=(activity:string)=>{

        if(activity === "Orbit" || activity === "Walk" || activity === "Home" || activity === "Properties" || activity === "collect" || activity === "explode" || activity === "MeasureLine") {
          if(context.state.activeGeometryName !== '3D-Views' ) 
            return "disabled"
        }   
        
        if (activity === "collect" && explodeIndex === 1) 
            return "disabled"

        if(context.state.activeDraggerName === activity) {
            return "active";
        }
        else if(context.state.activeDraggerName == "Walk" && activity !== "Home") {
            return "disabled";
        }    
        else 
            return '';
    }   

    async function explode(index: number) {
        setIsUpdating(true);
        setTimeout(async () => {
            try {
                setExplodeIndex(index)
                await viewer.explode(index)
                handlePan();
                setIsUpdating(false); 
            } catch(error: any) {
                console.error(error.message);
                setIsUpdating(false); 
            }
        }, 1000)
    }

    return (
        <>
            <DraggableComponent styles={draggableStyle}>
                <div className="action-panel">
                    <div id="pan_btn" title="Move model Left or Right" className={"action-item " + getActivityClassName("Pan")} onClick={() => handlePan()}>
                        <PanIcon className="fontSize" />
                        <div className="action-item-text" >
                            <span>Pan</span>
                        </div>
                    </div>

                    <div id="orbit_btn" title="Spin model" className={"action-item " + getActivityClassName("Orbit")} onClick={() => handleOrbit()}>
                        <OrbitIcon className="fontSize" />
                        <div className="action-item-text">
                            Orbit
                        </div>
                    </div> 

                    <div id="zoom_btn" title="Move model Closer or Farther Away" className={"action-item " + getActivityClassName("Zoom")} onClick={() => handleZoom()}>
                        <ZoomIcon className="fontSize" />
                        <div className="action-item-text" >
                            Zoom
                        </div>
                    </div> 

                    <div id="walk_btn" title="Walkthrough the model using keyboard keys w, s, a, d, q, and e" className={"action-item " + getActivityClassName("Walk")} onClick={() => handleWalk()}>
                        <DirectionsWalkIcon className="fontSize" />
                        <div className="action-item-text" >
                            Walk
                        </div>
                    </div>

                    <div id="walk_btn" title="Measure the distance between two points in Feet unit for rvt file and model input unit for ifc" className={"action-item " + getActivityClassName("MeasureLine")} onClick={() => handleRuler()}>
                        <BorderColorIcon className="fontSize" />
                        <div className="action-item-text" >
                            Ruler
                        </div>
                    </div>

                    {!context.state.isAssembly && <div id="walk_btn" title="Explode elements in the model" className={"action-item " + getActivityClassName("explode")} onClick={() => explode(explodeIndex + 1)}>
                        <FlipToFrontIcon className="fontSize" />
                        <div className="action-item-text" >
                            Explode
                        </div>
                    </div>}
                    
                    {!context.state.isAssembly && <div id="walk_btn" title="Collect elements in the model" className={"action-item " + getActivityClassName("collect")} onClick={() => explode(1)}>
                        <FlipToBackIcon className="fontSize" />
                        <div className="action-item-text" >
                            Collect
                        </div>
                    </div>}

                    <div id="zoom_btn" title="Reorient model to default position" className={"action-item " + getActivityClassName("Home")} onClick={resetView}>
                        <img src={HomeIcon} className="action-item-reset" />
                        <div className="action-item-text" >
                            Home
                        </div>
                    </div>

                    <div id="walk_btn" title="Show selected element's properties" className={"action-item " + getActivityClassName("Properties")} onClick={() => setShowProps(true)}>
                        <ListIcon className="fontSize" />
                        <div className="action-item-text" >
                            Props
                        </div>
                    </div>
                </div>
            </DraggableComponent>
            {showProps && <BimProps onClose={() => {setShowProps(false)}}/> }
            <div>{isUpdating && <div className="loading-info4">Updating Model...</div>}</div>
        </>
    );
}


// For Panning
async function handlePan() {
    await changePlugin("Pan");
    await context.dispatch(setActiveDraggerName("Pan"));
}

// For Orbit
async function handleOrbit() {
    await changePlugin("Orbit");
    await context.dispatch(setActiveDraggerName("Orbit"));
}

// For Zooming
async function handleZoom() {
    await changePlugin("Zoom");
    await context.dispatch(setActiveDraggerName("Zoom"));
}

async function handleWalk() {
    await changePlugin("Walk");
    await context.dispatch(setActiveDraggerName("Walk"));
}

async function handleRuler() {
    await changePlugin("MeasureLine");
    await context.dispatch(setActiveDraggerName("MeasureLine"));
}

async function changePlugin(name: any) {
    (name === 'MeasureLine') ? viewer.setEnableAutoSelect(false) : viewer.setEnableAutoSelect(true);
    openCloud.setActiveDragger(name);
}

function onTouchStart(event: any) {
    if (event.touches.length === 2) {
        scaling = true;
    }
}

function onTouchMove(event: any) {
    if (scaling && event.cancelable) {
        event.preventDefault();
        const extView = viewer.getActiveTvExtendedView();
        const dist = Math.hypot(
            event.touches[0].pageX - event.touches[1].pageX,
            event.touches[0].pageY - event.touches[1].pageY);
        (dist > zoomDist) ? extView.zoomIn() : extView.zoomOut();
        zoomDist = dist;
    }
}

function onTouchEnd(event: any) {
    scaling = false;
}

function zoom(event: any) {
    if (event.ctrlKey) {
        event.preventDefault();
        const extView = viewer.getActiveTvExtendedView();
        (event.deltaY < 0) ? extView.zoomIn() : extView.zoomOut();
    }
}

function onGestureStart(event: any) {
    scaling = true;
}

function addTouchListener() {
    canvasElement.addEventListener('touchstart', onTouchStart, { passive: false });
    canvasElement.addEventListener('touchmove', onTouchMove, { passive: false });
    canvasElement.addEventListener('touchend', onTouchEnd, { passive: false });
    canvasElement.addEventListener('wheel', zoom);
    canvasElement.addEventListener('gesturestart', onGestureStart, { passive: false });
    canvasElement.addEventListener('gesturechange', onTouchMove, { passive: false });
    canvasElement.addEventListener('gestureend', onTouchEnd, { passive: false });
}

function removeTouchListener() {
    canvasElement.removeEventListener("touchstart", onTouchStart);
    canvasElement.removeEventListener("touchmove", onTouchMove);
    canvasElement.removeEventListener("touchend", onTouchEnd);
    canvasElement.removeEventListener('wheel', zoom);
    canvasElement.removeEventListener("gesturestart", onGestureStart);
    canvasElement.removeEventListener("gesturechange", onTouchMove);
    canvasElement.removeEventListener("gestureend", onTouchEnd);
}

function resetView() {
    const visualizeJS = context.state.visualizeJS;
    const viewer = context.state.viewer;
    (context.state.activeDraggerName === "Walk" || context.state.activeDraggerName === "MeasureLine") && handlePan();
    //Code from Cube Navigation
    function rotate_cube(x: number, y: number, z: number) {
        const cube: any = document.getElementById("cube");
        const cubeCalculator: any = document.getElementById("cubecalculator");
        if (cube && cubeCalculator) {
            cube.style.webkitTransform = "translateZ( -50px) rotateX(" + x + "rad) rotateY(" + y + "rad) rotateZ(" + z + "rad)";
            cube.style.MozTransform = "translateZ( -50px) rotateX(" + x + "rad) rotateY(" + y + "rad) rotateZ(" + z + "rad)";
            cube.style.transform = "translateZ( -50px) rotateX(" + x + "rad) rotateY(" + y + "rad) rotateZ(" + z + "rad)";
            cubeCalculator.style.webkitTransform = "rotateX(" + x + "rad) rotateY(" + y + "rad) rotateZ(" + z + "rad)";
            cubeCalculator.style.MozTransform = "rotateX(" + x + "rad) rotateY(" + y + "rad) rotateZ(" + z + "rad)";
            cubeCalculator.style.transform = "rotateX(" + x + "rad) rotateY(" + y + "rad) rotateZ(" + z + "rad)";
        }
    }
    const angle45 = 0.7853981634;
    const angle35 = 0.6154797086;
    rotate_cube(-(angle45), -(angle35), 0);
    viewer.setDefaultViewPositionWithAnimation(visualizeJS.DefaultViewPosition.k3DViewSE);
}