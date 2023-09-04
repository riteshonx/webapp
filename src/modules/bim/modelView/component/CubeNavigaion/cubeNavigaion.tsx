import React from 'react';
import { ReactElement, useContext, useEffect } from 'react';
import { bimContext } from '../../../contextAPI/bimContext';
import { setActiveDraggerName } from "../../../contextAPI/action";
import "./cubeNavigaion.scss"

let cube: any = null;
let cubeCalculator: any = null;
let lastCameraYAxis: any = null;
let center3dpoint: any = null;
let currentCameraYAxis: any = null;
let lastCameraXAxis: any = null;
let currentCameraXAxis: any = null;
let lastY: any, lastX: any;
let context: any = null;
let isIsometric = true;
let isUpdating = false;

export default function CubeNavigaion(props: any): ReactElement {

    context = useContext(bimContext);
    const viewer = context.state.viewer;
    const visualizeJS = context.state.visualizeJS;
    const center = viewer.getActiveExtents().center()
    const extView = viewer.getActiveTvExtendedView();
    const defaultAngle = 1.5707963268;
    const angle90 = 1.5707963268;
    const angle180 = 3.1415926536;
    const angle45 = 0.7853981634;
    const angle35 = 0.6154797086;

    useEffect(() => {
        cube = document.getElementById("cube");
        cubeCalculator = document.getElementById("cubecalculator");
        lastCameraYAxis = new visualizeJS.Vector3d()
        center3dpoint = new visualizeJS.Vector3d()
        currentCameraYAxis = new visualizeJS.Vector3d()
        center3dpoint.set(...center);
        document.addEventListener("keydown", changeOrbit, false);
        loadMouseListners();
        viewer.setDefaultViewPositionWithAnimation(visualizeJS.DefaultViewPosition.k3DViewSE); 
        rotate_cube(-(angle45), -(angle35), 0);

        return () => {
            document.removeEventListener("keydown", changeOrbit, false);
        };
    }, []);

    function rollWithCenter(angle: number) {
        if(isUpdating) {
            return
        } 
        resetPan();
        isUpdating= true;
        extView.rollWithCenter(angle, center);
        viewer.zoomExtents();
        applyTransform('rotatez('+angle+'rad)')
        isUpdating= false;
    }

    function orbitWithCenter(xOrbit: number, yOrbit: number) {
        if(isUpdating) {
            return
        }
        resetPan(); 
        isUpdating= true;
        if(isIsometric) {
            isIsometric = false;
            rotateIsometriccube(xOrbit, yOrbit); 
            return;
        }
        extView.orbitWithCenter(xOrbit, yOrbit, center);
        viewer.zoomExtents();
        (xOrbit !==0 ) ? applyTransform('rotateX('+xOrbit+'rad)') : applyTransform('rotateY('+-(yOrbit)+'rad)');
        isUpdating = false;
    }

    function rotate_cube(x: number, y: number, z: number) {
        cube.style.webkitTransform = "translateZ( -50px) rotateX(" + x + "rad) rotateY(" + y + "rad) rotateZ(" + z + "rad)";
        cube.style.MozTransform = "translateZ( -50px) rotateX(" + x + "rad) rotateY(" + y + "rad) rotateZ(" + z + "rad)";
        cube.style.transform = "translateZ( -50px) rotateX(" + x + "rad) rotateY(" + y + "rad) rotateZ(" + z + "rad)";
        cubeCalculator.style.webkitTransform = "rotateX(" + x + "rad) rotateY(" + y + "rad) rotateZ(" + z + "rad)";
        cubeCalculator.style.MozTransform = "rotateX(" + x + "rad) rotateY(" + y + "rad) rotateZ(" + z + "rad)";
        cubeCalculator.style.transform = "rotateX(" + x + "rad) rotateY(" + y + "rad) rotateZ(" + z + "rad)";
    }

    function applyTransform (transform: string) {
    
        let myTransform = window.getComputedStyle(cubeCalculator, null)
        let matrix = myTransform.getPropertyValue("transform");
        const composite = transform + ' ' + matrix;
        cubeCalculator.style.transform = composite;
        
        myTransform = window.getComputedStyle(cubeCalculator, null)
        matrix = myTransform.getPropertyValue("transform");
        cube.style.transform = matrix;
    }

    function rotateIsometriccube(xOrbit: number, yOrbit: number) {
        if(xOrbit > 0) {
            set_view("bottom")
        } else if(xOrbit < 0) {
            set_view("top")
        } else if(yOrbit < 0) {
            set_view("front")
        } else {
            set_view("right")
        }
    }

    const changeOrbit = (event: any) => {
        switch (event.keyCode) {
            case 38:
                (event.ctrlKey) ? orbitWithCenter(angle180, 0) :
                    orbitWithCenter(defaultAngle, 0);
                break;
            case 40:
                (event.ctrlKey) ? orbitWithCenter(-(angle180), 0) :
                    orbitWithCenter(-(defaultAngle), 0)
                break;
            case 37:
                (event.ctrlKey) ? orbitWithCenter(0, angle180) :
                    orbitWithCenter(0, defaultAngle)
                break;
            case 39:
                (event.ctrlKey) ? orbitWithCenter(0, -(angle180)) :
                    orbitWithCenter(0, -(defaultAngle))
                break;
            default:
                break;
        }
    }

    const set_view = (view: string) => {
        resetPan();
        isIsometric = false;
        isUpdating= true;
        switch (view) {
            case 'isometric':
                rotate_cube(-(angle45), -(angle35), 0);
                isIsometric = true;
                viewer.setDefaultViewPositionWithAnimation(visualizeJS.DefaultViewPosition.k3DViewSE);
                break;
            case 'front':
                rotate_cube(0, 0, 0);
                viewer.setDefaultViewPositionWithAnimation(visualizeJS.DefaultViewPosition.k3DViewFront);
                break;
            case 'back':
                rotate_cube(-(angle180), 0, angle180);
                viewer.setDefaultViewPositionWithAnimation(visualizeJS.DefaultViewPosition.k3DViewBack);
                break;
            case 'top':
                rotate_cube(-(angle90), 0, 0);
                viewer.setDefaultViewPositionWithAnimation(visualizeJS.DefaultViewPosition.k3DViewTop);
                break;
            case 'bottom':
                rotate_cube(angle90, -(angle180), 0);
                viewer.setDefaultViewPositionWithAnimation(visualizeJS.DefaultViewPosition.k3DViewBottom);
                break;
            case 'left':
                rotate_cube(0, angle90, 0);
                viewer.setDefaultViewPositionWithAnimation(visualizeJS.DefaultViewPosition.k3DViewLeft);
                break;
            case 'right':
                rotate_cube(0, -(angle90), 0);
                viewer.setDefaultViewPositionWithAnimation(visualizeJS.DefaultViewPosition.k3DViewRight);
                break;
            default:
        }
        isUpdating= false;
    }

    function loadMouseListners() {
        props.canvas.onmousedown = (ev: any) => {
            lastX = ev.x;
            lastY = ev.y;
            lastCameraYAxis.set(...viewer.activeView.upVector);
            center3dpoint.set(...center);

            const target = new visualizeJS.Vector3d()
            target.set(...viewer.activeView.viewTarget);
            const position = new visualizeJS.Vector3d()
            position.set(...viewer.activeView.viewPosition);
            lastCameraXAxis = lastCameraYAxis.crossProduct(target.sub(position))
        };

        props.canvas.onmouseup = (ev: any) => {
            isUpdating= true;
            if (context.state.activeDraggerName=== 'Orbit' && (lastX !== ev.x || lastY !== ev.y)) {

                currentCameraYAxis.set(...viewer.activeView.upVector);

                const target = new visualizeJS.Vector3d()
                target.set(...viewer.activeView.viewTarget);
                const position = new visualizeJS.Vector3d()
                position.set(...viewer.activeView.viewPosition);
                currentCameraXAxis = currentCameraYAxis.crossProduct(target.sub(position))

                let newXOrbit = currentCameraYAxis.angleTo(lastCameraYAxis)
                let newYOrbit = lastCameraXAxis.angleTo(currentCameraXAxis)
                
                if((Math.abs(ev.x - lastX)) < props.canvas.height) {
                    newXOrbit = (lastY>ev.y) ? -(newXOrbit) : newXOrbit;
                    newYOrbit = (lastX>ev.x) ? -(newYOrbit) : newYOrbit;
                } else {
                    if(lastY < ev.y){
                        newXOrbit = -(newXOrbit);
                    } 
                    if(lastX > ev.x){
                        newYOrbit = -(newYOrbit);
                    } 
                }
                applyTransform('rotateX('+-(newXOrbit)+'rad) rotateY('+(newYOrbit)+'rad)')
            }
            isUpdating= false;
        };
    }

    function resetPan() {
        if (context.state.activeDraggerName === "Walk" || context.state.activeDraggerName === "MeasureLine") {
            const openCloud = context.state.openCloud;
            openCloud.setActiveDragger("Pan");
            context.dispatch(setActiveDraggerName("Pan"));
        }
    }

    return (
        <div className="cube-navigation">
            <section id="controls">
                <div onClick={() => { orbitWithCenter(defaultAngle, 0) }} className="rotate-x-cw"></div>
                <div onClick={() => { orbitWithCenter(-(defaultAngle), 0) }} className="rotate-x-acw"></div>
                <div onClick={() => { orbitWithCenter(0, defaultAngle) }} className="rotate-y-cw"></div>
                <div onClick={() => { orbitWithCenter(0, -(defaultAngle)) }} className="rotate-y-acw"></div>
                <div onClick={() => { rollWithCenter(angle45) }} className="rotate-z-cw"></div>
                <div onClick={() => { rollWithCenter(-(angle45)) }} className="rotate-z-acw"></div>
                <div id="view_dropdown_container">
                    <ul>
                        <li>
                            <a className="dropdown"></a>
                            <ul className="vc_views">
                                <li onClick={() => { set_view("isometric") }}> Home </li>
                                <li onClick={() => { set_view("separator") }}></li>
                                <li onClick={() => { set_view("top") }}> Top </li>
                                <li onClick={() => { set_view("front") }}> Front </li>
                                <li onClick={() => { set_view("back") }}> Back </li>
                                <li onClick={() => { set_view("left") }}> Left </li>
                                <li onClick={() => { set_view("right") }}> Right  </li>
                                <li onClick={() => { set_view("bottom") }}> Bottom </li>
                                <li onClick={() => { set_view("separator") }}></li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </section>
            <section className="container">
                <div id="cube" className="show-front">
                    <figure className="front" onClick={() => { set_view("front") }}>front</figure>
                    <figure className="back" onClick={() => { set_view("back") }}>back</figure>
                    <figure className="right" onClick={() => { set_view("right") }}>right</figure>
                    <figure className="left" onClick={() => { set_view("left") }}>left</figure>
                    <figure className="top" onClick={() => { set_view("top") }}>top</figure>
                    <figure className="bottom" onClick={() => { set_view("bottom") }}>bottom</figure>
                </div>
                <div id="cubecalculator"></div>
            </section>
        </div>
    )
}