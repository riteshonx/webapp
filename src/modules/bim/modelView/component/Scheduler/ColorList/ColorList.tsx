import React, { useContext, useState, useEffect } from 'react';
import './ColorList.scss';
import Popover from '@mui/material/Popover';

import { rgbToHex } from '../../../../container/utils';
import { bimContext } from '../../../../contextAPI/bimContext';
import { setActiveFilterList } from '../../../../contextAPI/action';

export default function ColorList(props: any) {
    const context: any = useContext(bimContext);
    const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
    const colorLimit =  props.listLimit || 3;
    const noOfRows = Math.ceil(props.colors.length/colorLimit);
    const [filterHidnSts, setFilterHidnSts] = useState<any>({}) 

    useEffect(() => {
        setFilterHidnSts(context.state.activeFilterList.reduce((result :any, filter: any) => {
            result[filter.id] = filter.hidden;
            return result;
        }, {}));
    }, [context.state.activeFilterList]);
    
    const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
        (props.colors.length > colorLimit) && setAnchorEl(event.currentTarget);
    };

    const handlePopoverClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    const arr1 = Array(noOfRows).fill(0);
    
    const onSingleColorVisibiltyChange=(bimFilterId:string,value:boolean)=>{
        const filters = context.state.activeFilterList.map((filter: any) => {
            return bimFilterId === filter.id ? { ...filter , hidden : value} :  filter;
        });
        context.dispatch(setActiveFilterList(filters));
        props.onVisbiltyChange(props.id, filters);
    }

    return (
        <div className="bimColorList" >
            {arr1.map((_,index)=>{
                return <div key={index} style={{"display":"flex"}}>
                {props.colors.slice(index*colorLimit,colorLimit+index*colorLimit).map((color : {color:number[],bimFilterId:string}, indx: number) => {
                    return !filterHidnSts[`${color.bimFilterId}`] ? <div key={indx} className="bimColorIcon" style={{ background: rgbToHex(color.color) }} onClick={()=>onSingleColorVisibiltyChange(color.bimFilterId,true)}></div>
                    : <div key={indx} className="bimColorIcon" style={{ background: rgbToHex(color.color) }} onClick={()=>onSingleColorVisibiltyChange(color.bimFilterId,false)}><span>\</span></div>
                })}
                <br />
                <p></p>
                </div>
            })}
            <Popover
                sx={{
                    pointerEvents: 'none',
                }}
                className="bimColorPop"
                open={open}
                anchorEl={anchorEl}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                onClose={handlePopoverClose}
            >
                <div className="colorPopList">
                    {props.colors.slice(colorLimit).map((color: string, index: number) => {
                        return <div key={index} className="bimColorIcon" style={{ background: color }}></div>
                    })}
                </div>
            </Popover>
        </div>
    );
}
