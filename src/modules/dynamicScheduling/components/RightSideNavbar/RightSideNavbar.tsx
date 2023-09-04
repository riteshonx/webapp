import React, { ReactElement, useEffect, useState } from 'react';
import OutsideClickHandler from 'react-outside-click-handler';
import PullPlanPanel from '../../features/ProjectPullPlan/PullPlanPanel/PullPlanPanel';
import ScheduleRecipesPanel from '../../features/RecipesImport/RecipesImport';
import './RightSideNavbar.scss';

function RightSideNavbar(props: any): ReactElement {
    const [activeTab, setActiveTab] = useState('');
    const [panelInsideClick, setPanelInsideClick] = useState(false);
    
    useEffect(() => {
        if(props.openPullPlanPanel)
        setActiveTab('Plans');
    }, [props.openPullPlanPanel])

    const setTab=(argTab: string)=>{
        if(activeTab === argTab){
            setActiveTab('');
        } else{
            setActiveTab(argTab);
        }
    }

    const outsideClickEventHandler = (panelType: string) => {
        if(!panelInsideClick)
        setTab(panelType);
    }

    const onPanelInsideClick = (status: boolean) => {
        setPanelInsideClick(status);
    }


    return (
        <div className={`RightSideNavbar ${activeTab?'open':'close'}`}>
            <div className="RightSideNavbar__options">
                <div className={`RightSideNavbar__options__tab ${activeTab!=='Plans'?'activetab':'tab1'}`}
                onClick={()=>setTab('Plans')}>
                    <div className="RightSideNavbar__options__tab__title title1">
                        Plans
                    </div>
                </div>  
                <div className={`RightSideNavbar__options__tab ${activeTab!=='Templates'?'activetab':'tab2'}`}
                onClick={()=>setTab('Templates')}>
                    <div className="RightSideNavbar__options__tab__title">
                        Recipes
                    </div>
                </div>  
                {/* <div className={`RightSideNavbar__options__tab ${activeTab==='Recommends'?'activetab':'tab3'}`}>
                    <div className="RightSideNavbar__options__tab__title title3">
                        
                    </div>
                </div>  */}
            </div> 
            {activeTab==='Plans'&&( <div className="RightSideNavbar__view">
                <OutsideClickHandler  onOutsideClick={() => outsideClickEventHandler('Plans')} useCapture={true}>
                    <PullPlanPanel scheduledPullPlanDetail = {props.scheduledPullPlanDetail} 
                                   pullPanelStatus={props.pullPanelStatus} 
                                   onPanelInsideClick={onPanelInsideClick}/>
                </OutsideClickHandler>
                    
            </div>)}
            {activeTab==='Templates'&&( <div className="RightSideNavbar__view">
                <OutsideClickHandler  onOutsideClick={() => outsideClickEventHandler('Templates')} useCapture={true}>
                    <ScheduleRecipesPanel onPanelInsideClick={onPanelInsideClick} currentGanttView={props.currentGanttView}/>
                </OutsideClickHandler>    
            </div>)}
            {/* {activeTab==='Recommends'&&( <div className="RightSideNavbar__view">
                <OutsideClickHandler  onOutsideClick={() => outsideClickEventHandler('Recommends')} useCapture={true}>
                    Recommends
                </OutsideClickHandler>      
            </div>)} */}
        </div>
    )
}

export default RightSideNavbar;
