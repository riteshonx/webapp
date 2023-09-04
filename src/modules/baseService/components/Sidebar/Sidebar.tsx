import React from 'react';
import { routes } from '../../../../utils/constants';
import DashboardIcon from '@material-ui/icons/Dashboard';
import { useHistory, useLocation } from "react-router-dom";
import { ReactElement } from 'react';
import './Sidebar.scss'

export default function Sidebar(): ReactElement {
    const history = useHistory();
    const location = useLocation();
    const navigate=(argItem: any)=>{
        history.push(argItem.path);
    }

    return (
        <div className="base__sidebar">
            {routes.map(item=>(
                <div className={`${location.pathname.includes(item.path)? 
                'base__slectedItem': 'base__sidebarItem'}`} key={item.name} onClick={()=>navigate(item)}>
                    <DashboardIcon className={`${location.pathname.includes(item.path)? 'base__selectedicon': 'base__icon'}`}/>
                    <p className={`${location.pathname.includes(item.path)? 'base__selectedlabel': 'base__label'}`}>
                        {item.name}
                    </p>
                </div>
            ))}
        </div>
    )
}
