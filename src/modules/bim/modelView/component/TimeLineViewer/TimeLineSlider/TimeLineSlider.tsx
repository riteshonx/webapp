import React, { useState, useEffect } from 'react';
import './TimeLineSlider.scss'
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import moment from 'moment';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import KeyboardArrowLeftIcon from '@material-ui/icons/KeyboardArrowLeft';

const { Range } = Slider;
let pressInterval: any;
let pressTimer: any;
let isLongPress = false;
let container: any = null;
let trackElement: any;
let handleElementLeft: any;
let handleElementRight: any;
let isDrag = false;
let oldx = 0;
let pressIntervalLeft: any;
let pressIntervalRight: any;
let isLeftScroll= false;
let isScrollButtonClik = false;

export default function TimeLineSlider(props: any) { 
    const selectedStart = moment(props.startTime)
    const selectedEnd = moment(props.endTime)
    const [duration, setDuration] = useState(moment.duration(selectedEnd.diff(selectedStart)).asDays());
    const [marks, setMarks] = useState<any>({})
    const [scrollBtnVisblty, setScrollBtnVisblty] = useState<any>({left: false, right: false})
    const [selectedValue, setSelectedValue] = useState<any>([0, duration])

    useEffect(() => {  
        addListener();
        checkScrollBtnVisblty();
    
        return () => {
          removeListener();
        };
    }, []);

    useEffect(() => {  
        trackElement.removeEventListener('mousedown',  seletecdtrackElementClick, true)
        trackElement.addEventListener('mousedown',   seletecdtrackElementClick, true)
    
        return () => {
            trackElement.removeEventListener('mousedown',  seletecdtrackElementClick, true)
        };
    }, [selectedValue]);

    useEffect(() => {
        const noOfDays = moment.duration(selectedEnd.diff(selectedStart)).asDays();
        let durtn = 0;   
        let mrks: any;
        if(props.scale === 'Daily') {
            mrks = Array.from({ length: noOfDays + 1 | 0 }).reduce((result: any, currentElement, index) => {
                result[index] = moment(props.startTime, "DD-MM-YYYY").add(index, 'days').format("DD MMM YY");
                return result;
            }, {} as any)
            durtn = noOfDays;
        } else if (props.scale === 'Weekly' || props.scale === 'Monthly' || props.scale === 'Yearly' ){
            let currnScaleNumber = (props.scale === 'Monthly') ? selectedStart.month() :
                (props.scale === 'Yearly') ? selectedStart.year(): selectedStart.isoWeek();
            
                mrks = Array.from({ length: noOfDays + 1 | 0 }).reduce((result: any, currentElement, index) => {
                const currnDate = moment(props.startTime, "DD-MM-YYYY").add(index, 'days')
                const currnDateScaleNumber = (props.scale === 'Monthly') ? currnDate.month() :
                    (props.scale === 'Yearly') ? currnDate.year(): currnDate.isoWeek();
                if(currnScaleNumber !== currnDateScaleNumber) {
                    result[++durtn] = currnDate.format("DD MMM YY");
                    currnScaleNumber = currnDateScaleNumber;
                }
                return result;
            }, {0: selectedStart.format("DD MMM YY")} as any)
            if (selectedEnd.format("DD MMM YY") !== mrks[durtn]) {
                mrks[++durtn] = selectedEnd.format("DD MMM YY")
            }
        } else {
            let currentDate = moment(props.startTime).startOf('month');
            mrks= {0: selectedStart.format("DD MMM YY")}
            do {
                currentDate = currentDate.add(props.scale, 'months');
                mrks[++durtn] = currentDate.format("DD MMM YY");
            } while (selectedEnd.diff(currentDate) >= 0);
            mrks[durtn] = selectedEnd.format("DD MMM YY")
        }
        setDuration(durtn);
        setMarks(mrks);
        if(durtn > 7) {
            setSelectedValue([0, 7]);
            const endDate = (props.scale === 'Daily' || mrks[7] === selectedEnd.format("DD MMM YY")) ? 
                moment(mrks[7], "DD MMM YY").format("DD/MM/yyyy") :
                moment(mrks[7], "DD MMM YY").subtract(1, 'days').format("DD/MM/yyyy");
            props.onSliderChange([selectedStart.format("DD/MM/yyyy"), endDate])
        } else {
            setSelectedValue([0, durtn]);
            props.onSliderChange([selectedStart.format("DD/MM/yyyy"), selectedEnd.format("DD/MM/yyyy")])
        }
        checkScrollBtnVisblty();
    }, [props.scale]);

    function afterSliderChange(value: any) {
        const endDate = (props.scale === 'Daily' || marks[value[1]] === selectedEnd.format("DD MMM YY")) ? 
            moment(marks[value[1]], "DD MMM YY").format("DD/MM/yyyy") :
            moment(marks[value[1]], "DD MMM YY").subtract(1, 'days').format("DD/MM/yyyy");
        props.onSliderChange([moment(marks[value[0]], "DD MMM YY").format("DD/MM/yyyy"), endDate])
    }

    function onSliderChange(value: any) {
        if(value[0] != value[1]) {
            setSelectedValue(value);
        }
    }

    const onScrollButtonUp = (event: any, direction: string) => {
        if(isDrag || !isScrollButtonClik) return;
        event.stopPropagation();
        event.preventDefault();
        clearInterval(pressTimer);
        clearInterval(pressInterval);
        if(isLongPress) {
            isLongPress = false;
        }  else {
            const container = document.getElementById('range-container');
            container && sideScroll(container, 90 , direction);
        }
        isScrollButtonClik = false;
        checkScrollBtnVisblty();
    }

    const onScrollButtonDown = (event: any, direction: string) => {
        event.stopPropagation();
        event.preventDefault();
        isScrollButtonClik = true;
        isLongPress = false;
        pressTimer = setTimeout(() => {
            pressInterval = setInterval(function() {
                isLongPress = true;
                container = document.getElementById('range-container');
                sideScroll(container, 30, direction)
            }, 100);
        }, 300);
    }

    function sideScroll(element: any, step: number, direction: string) {
        (direction == 'left') ? element.scrollLeft -= step : element.scrollLeft += step;
    }

    function checkScrollBtnVisblty() {
        setTimeout(()=> {
            container = document.getElementById('range-container');
            container && setScrollBtnVisblty({
                left: container.scrollLeft !== 0,
                right: Math.ceil(container.scrollLeft + container.clientWidth)  < container.scrollWidth,
            });
            isLeftScroll = container?.scrollLeft !== 0;
        }, 100);
    }

    const addListener = () => {
        trackElement = document.querySelector('.timeLineSlider .rc-slider-track-1');
        handleElementLeft = document.querySelector('.timeLineSlider .rc-slider-handle-1');
        handleElementRight = document.querySelector('.timeLineSlider .rc-slider-handle-2');

        //trackElement.addEventListener('mousemove', (e: any) => moveListener(e, "rangeHandle"), {passive: false})
        trackElement.addEventListener('mouseup', upListener, {passive: false})

        handleElementLeft.addEventListener('mousedown', downListener, {passive: false})
        handleElementLeft.addEventListener('mousemove', (e: any) => moveListener(e, "leftHandle"), {passive: false})
        handleElementLeft.addEventListener('mouseup', upListener, {passive: false})

        handleElementRight.addEventListener('mousedown', downListener, {passive: false})
        handleElementRight.addEventListener('mousemove', (e: any) => moveListener(e, "rightHandle"), {passive: false})
        handleElementRight.addEventListener('mouseup', upListener, {passive: false})

        document.addEventListener('mouseup', upListener, {passive: false})
    }

    const removeListener = () => {
        trackElement.removeEventListener('mousedown', seletecdtrackElementClick)
        trackElement.removeEventListener('mousemove', moveListener)
        trackElement.removeEventListener('mouseup', upListener)
        handleElementLeft.removeEventListener('mousedown', downListener)
        handleElementLeft.removeEventListener('mousemove', moveListener)
        handleElementLeft.removeEventListener('mouseup', upListener)
        handleElementRight.removeEventListener('mousedown', downListener)
        handleElementRight.removeEventListener('mousemove', moveListener)
        handleElementRight.removeEventListener('mouseup', upListener)
        document.removeEventListener('mouseup', upListener)
    }

    const seletecdtrackElementClick = (event: any) => {
        event.preventDefault();
        isDrag = true;
        let newSelected = [];
        setTimeout(() => {
            if(!isDrag) {
                const diff = selectedValue[1] - selectedValue[0]
                if(diff > 1) {
                    const track:any = document.querySelector(".timeLineSlider .rc-slider-track-1");
                    const contaner:any = document.getElementById('range-container');
                    const bcr = trackElement.getBoundingClientRect();
                    const left = bcr.left < 0 ? bcr.width - bcr.right : bcr.left;

                    let offsetLeft = track.offsetLeft;
                    let reference = track.offsetParent;
                    while(reference){
                        offsetLeft += reference.offsetLeft;
                        reference = reference.offsetParent;
                    }
                    const clickPerenatge = isLeftScroll ? Math.round((((contaner.scrollLeft + event.clientX) - offsetLeft) / bcr.width) * 100):
                        Math.round((((event.clientX) - offsetLeft) / bcr.width) * 100);
                    const selectOffsset = Math.abs(Math.round(diff*(clickPerenatge/100)));
                    if(selectOffsset >=  diff/2) {
                        newSelected = [selectedValue[0], selectedValue[0] + selectOffsset]
                    } else {
                        newSelected = [selectedValue[0] + selectOffsset, selectedValue[1]]
                    }
                    if(newSelected[0] != newSelected[1]) {
                        setSelectedValue(newSelected);
                        afterSliderChange(newSelected);
                    }
                }
            }
        }, 200)
    }

    const downListener = () => {
        isDrag = true;
    }

    const upListener = () => {
        isDrag = false;
        clearInterval(pressIntervalRight);
        pressIntervalRight = null;
        clearInterval(pressIntervalLeft);
        pressIntervalLeft = null;
        isScrollButtonClik = false;
        clearInterval(pressTimer);
        clearInterval(pressInterval);
        checkScrollBtnVisblty();
    }

    const moveListener = (event: any, handler: string) => {
        if (isDrag) {
            const container:any = document.querySelector(".timeLineSlider");
            let direction : string;
            const contLeft = container?.scrollLeft || 0;
            const contRight = (container?.clientWidth  || 0) + contLeft ;

            if (event.pageX < oldx) {
                clearInterval(pressIntervalRight);
                pressIntervalRight = null;
                direction = "left";
            } else {
                clearInterval(pressIntervalLeft);
                pressIntervalLeft = null;
                direction = "right";
            }

            const element: any = (handler === 'leftHandle' || 
                (handler === 'rangeHandle' &&  direction === "left"))? handleElementLeft : handleElementRight;

            const elemLeft = element.offsetLeft - container?.offsetLeft || 0;
            const elemRight = element.offsetLeft + element?.clientWidth + 35 || 0;
            
            if(direction === "right" &&!pressIntervalRight && elemRight  >= contRight) {
                pressIntervalRight = setInterval(function() {
                    sideScroll(container, 20, direction)
                }, 100);
            }

            if(direction === "left" &&!pressIntervalLeft && contLeft  >= elemLeft - 35) {
                pressIntervalLeft = setInterval(function() {
                    sideScroll(container, 20, direction)
                }, 100);
            }
            oldx = event.pageX;
        }
    }


    return (
        <div className={"timeLineSliderContainer"}>
            {scrollBtnVisblty.left ? <KeyboardArrowLeftIcon 
                onMouseDown={(e) => onScrollButtonDown(e, 'left') } 
                onMouseUp={(e) => onScrollButtonUp(e, 'left') }
            />: <span className='btn-placeholder' />}
            <div className={"timeLineSlider"} id="range-container">
                <Range
                    allowCross={false}
                    draggableTrack={true}
                    onChange={onSliderChange}
                    onAfterChange={afterSliderChange}
                    value={selectedValue}
                    max={duration}
                    marks={marks}
                    defaultValue={[0, duration]}  
                    style={{
                        width: duration * 90,
                        minWidth: '93%'
                    }}
                    dots={true}
                />
            </div>
            {scrollBtnVisblty.right ? <KeyboardArrowRightIcon 
                onMouseDown={(e) => onScrollButtonDown(e, 'right') } 
                onMouseUp={(e) => onScrollButtonUp(e, 'right') } 
            />: <span className='btn-placeholder' />}
        </div>
    );
}
