import React, { useContext, useState, useEffect } from 'react';
import './BimRightPanel.scss'
import { stateContext } from '../../../../root/context/authentication/authContext';
import { bimContext } from '../../../contextAPI/bimContext';
import { iterrateOverElementsAssembly, iterrateOverElements } from '../../../container/utils';
import { setHighLightedElementId, setQuerySelectedElements } from "../../../contextAPI/action";
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import QueryPopup from './QueryPopUp/QueryPopUp';
import Notification,{ AlertTypes } from '../../../../shared/components/Toaster/Toaster';

let menuElement: any = null;
let menuList: any = null;
let multiSelect = false;
let selectedList: any = [];

export default function BimRightPanel(props: any) {
    const { dispatch, state }: any = useContext(stateContext);
    const context: any = useContext(bimContext);
    const viewer = context.state.viewer;
    const openCloud = context.state.openCloud;
    const visualizeJS = context.state.visualizeJS;
    const canvasElement = document.getElementById("canvas");
    const selectionSetObj = new visualizeJS.OdTvSelectionSet();
    const [showRightPanel, setShowRightPanel] = useState(false);
    const [showQueryPopup, setShowQueryPopup] = useState(false);
    const [seletedHandleIds, setSeletedHandleIds] = useState([]);

    useEffect(() => {
        context.state.querySelectedElements && selectEvent(null, true);
    }, [context.state.querySelectedElements]);

    useEffect(() => {
        openCloud.addEventListener('select', selectEvent)
        openCloud.addEventListener('click', removeSelectEvent)
        document.addEventListener("keydown", shiftKeyDown, false)
        document.addEventListener("keyup", shiftKeyUp, false)
        canvasElement?.addEventListener('contextmenu', handleRightClick)
        document?.addEventListener('click', handleLeftClick)

        return () => {
            openCloud.removeEventListener('select', selectEvent)
            openCloud.removeEventListener('click', removeSelectEvent)
            document.removeEventListener("keydown", shiftKeyDown, false);
            document.removeEventListener("keyup", shiftKeyUp, false);
            canvasElement?.removeEventListener('contextmenu', handleRightClick)
            document?.removeEventListener('click', handleLeftClick)
            menuList?.removeEventListener('contextmenu', handleLeftClick)
            menuElement = null;
            multiSelect = false;
            selectedList = [];
        };
    }, []);

    const selectEvent = (event: any,  isQuerySelect = false) => {
        try {
            if ((multiSelect && selectedList.length > 0) || isQuerySelect) {
                if (isQuerySelect) {
                    selectedList =  [...context.state.querySelectedElements]
                } else {
                    const newSelectedList = !context.state.isAssembly ? [...selectedList, ...openCloud.getSelected()]:
                        [...selectedList, ...openCloud.getSelected().map((eleId: string) => eleId.includes("_") ? eleId.split("_")[1] : eleId)]; 
                    selectedList =  Array.from(new Set(newSelectedList))
                }
                const highlightElement = (entityId: any, entity: any, child: any) => {
                    if (entityId.getType() === 1) {
                        const handleId = (context.state.isAssembly) ? entity.getNativeDatabaseHandle().split("_")[1] : child.getUniqueSourceID();
                        if (selectedList.includes(handleId)) {
                            selectionSetObj.appendEntity(entityId)
                        }
                    }
                }

                const highlightElement2312 = () => {
                    selectedList.forEach((id: any) => {
                        const entityId = viewer.getEntityByOriginalHandle(id.toString()); 
                        if (entityId.getType() === 1) 
                            selectionSetObj.appendEntity(entityId)
                    });
                }

                (context.state.jobrunnerVersion == '23.12')? highlightElement2312() :
                    (context.state.isAssembly) ? iterrateOverElementsAssembly(highlightElement.bind(null), viewer) : iterrateOverElements(highlightElement.bind(null), viewer);
                viewer.setSelected(selectionSetObj);
            } else {
                const handleIds = openCloud.getSelected();
                selectedList = !handleIds[0].includes("_") ? [handleIds[0]] : [handleIds[0].split("_")[1]];
                selectionSetObj.remove(selectionSetObj);
            }
            
            (selectedList.length === 1) ? context.dispatch(setHighLightedElementId(selectedList[0])) : context.dispatch(setHighLightedElementId(null));
            setSeletedHandleIds(selectedList);
            (!isQuerySelect) &&context.dispatch(setQuerySelectedElements(selectedList));
        } catch (error: any) {
            console.error(error.message);
        }
    }

    const removeSelectEvent = () => {
        try {
            setTimeout(() => {
                const handleIds = openCloud.getSelected();
                if (handleIds.length === 0) {
                    selectedList = [];
                    selectionSetObj.remove(selectionSetObj);
                    context.dispatch(setHighLightedElementId(null));
                    context.dispatch(setQuerySelectedElements([]));
                }
            }, 500);
        } catch (error: any) {
            console.error(error.message);
        }
    }

    const shiftKeyDown = (event: any) => multiSelect = event.shiftKey;
    const shiftKeyUp = (event: any) => multiSelect = event.shiftKey;

    const handleLeftClick = (e: any) => {
        if (e.type === 'click' || e.type === 'contextmenu') {
            setShowRightPanel(false)
        }
    };

    const handleRightClick = (e: any) => {
        menuElement = document.getElementById("rightPanelPosition");
        if(!menuList) {
            menuList = document.getElementById("simple-menu")
            menuList?.addEventListener('contextmenu', handleLeftClick)
        }
        if (e.type === 'contextmenu' && selectedList.length > 0) {
            e.preventDefault();
            menuElement.style.left= e.pageX + 'px';
            menuElement.style.top= e.pageY + 'px';
            setShowRightPanel(!showRightPanel)
        }
    };

    const handleClose = () => setShowRightPanel(false);

    const showQueryForm = () => {
        if (selectedList.length > 0) {
            setShowRightPanel(false);
            setShowQueryPopup(true);
        } else {
            Notification.sendNotification('Please select atleast one element to create query', AlertTypes.error);
        }
    }

    return (
        <div className='bimRightPanel'>
            <div id="rightPanelPosition" style={{position: "fixed"}}></div>
            <Menu
                anchorEl={menuElement}
                id="simple-menu"
                keepMounted
                open={Boolean(showRightPanel)}
                onClose={handleClose}
            >
                <MenuItem onClick={showQueryForm}>Create Query</MenuItem>
            </Menu>
            <QueryPopup open={showQueryPopup} handleClose={()=> setShowQueryPopup(false)} handleIds={seletedHandleIds}/>
        </div>
    );
}
