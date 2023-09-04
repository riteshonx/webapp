import React, { useState, useEffect } from 'react';
import './TimeLineScale.scss'
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import moment from 'moment';
import ZoomOutIcon from '@material-ui/icons/ZoomOut';
import ZoomInIcon from '@material-ui/icons/ZoomIn';

export default function TimeLineScale(props: any) { 
    const selectedStart = moment(props.startTime)
    const selectedEnd = moment(props.endTime)
    const [monDuration, setMonDuration] = useState(Math.ceil(moment.duration(selectedEnd.diff(selectedStart)).asMonths()));
    const [seletedScale, setSeletedScale] = useState<string>('Daily')
    const [scales, setScales] = useState<Record<number, string>>({})
    const [step, setStep] = useState<any>(100)
    const [value, setValue] = useState<any>(100)
    const [noOfstep, setNoOfStep] = useState<any>(1)

    useEffect(() => {
        if(monDuration >= 2) {
            const newScale: Record<number, string> = {} 
            let i = Math.ceil(monDuration/2);
            let j = 0;
            for(; i > 0; i--) {
                newScale[j++] = String(i * 2);
            }
            newScale[j++] = 'Weekly';
            newScale[j] = 'Daily';
            setStep(Math.floor(100/j));
            setValue(Math.floor(100/j)*j)
            setNoOfStep(j)
            setScales(newScale)
        } else if (moment.duration(selectedEnd.diff(selectedStart)).asDays() > 7 || 
            selectedStart.isoWeek() !==  selectedEnd.isoWeek()) {
            setStep(100);
            const newScale: Record<number, string> = {0: 'Weekly', 1: 'Daily'} 
            setScales(newScale)
            setNoOfStep(1)
        } else {
            setStep(null);
        }
    }, []);

    function onSliderChange(value: any) {
        setValue(value);
        const scaleIndex: number = Math.floor(value/step);
        if(scales[scaleIndex]) {
            setSeletedScale(scales[scaleIndex])
            props.handleScaleChange(scales[scaleIndex])
        }
    }

    function getSelectedScaleString(scale: string) {
        const year = Math.floor(parseInt(scale)/12); 
        return scale === 'Weekly' || scale === 'Daily' ? scale : 
            `${year ? year + 'years' : '' }  ${parseInt(scale)%12} Months`
    } 

    return step && (
        <div className={"timeLineScale"}>
            <ZoomOutIcon onClick={() =>{onSliderChange(value - step)}} fontSize='small' className={`zoomIcons ${value <= 0 && 'disabled'}`} />
            <Slider min={0} step={step} onAfterChange={onSliderChange} onChange={setValue} value={value} defaultValue={100} />
            <ZoomInIcon onClick={() =>{onSliderChange(value + step)}} fontSize='small' className={`zoomIcons ${value >= (noOfstep * step) && 'disabled'}`}/>
            <div className='seletedScale'>{getSelectedScaleString(seletedScale)}</div>
        </div>
    );
}
