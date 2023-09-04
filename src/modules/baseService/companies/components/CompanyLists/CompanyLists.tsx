import Tooltip from '@material-ui/core/Tooltip';
import React, { ReactElement, useContext, useEffect, useState } from 'react';
import { match, useHistory, useRouteMatch } from 'react-router-dom';
import { stateContext } from '../../../../root/context/authentication/authContext';
import NoDataMessage from '../../../../shared/components/NoDataMessage/NoDataMessage';
import companyIcon from '../../../../../assets/images/project.png';
import './CompanyLists.scss'; 

export interface Params {
    companyId: string;
}

const noPermissionMessage = 'No companies were found.'

export default function CompanyLists(props: any): ReactElement {

    const [companyLists, setCompanyLists] = useState<Array<any>>([]);
    const {dispatch, state }:any = useContext(stateContext);
    const [selectedCompanyt, setSelectedCompany] = useState<any>();
    const history = useHistory();
    const pathMatch:match<Params>= useRouteMatch();

    useEffect(() => {
        setCompanyLists(props.companyLists)
    }, [props.companyLists]);

    useEffect(() => {
        setSelectedCompany(Number(pathMatch?.params?.companyId));
    }, [Number(pathMatch?.params?.companyId)]);

    const companyDetails = (company: any) => {
        if(selectedCompanyt?.id !== company.id){
            history.push(`/base/companies/${company?.id}/details`);
            setSelectedCompany(Number(pathMatch?.params?.companyId));
            props.UpdateCompany();
        }
    }
    
    return (
        <div className="companies">
             {
            companyLists?.length > 0 ? (
             <div className="companies__grid">
                        {
                        companyLists?.map((company) => {  
                            return (
                                <div key={company.id} className={`companies__users ${Number(pathMatch?.params?.companyId) == company.id 
                                    ? "companies__users-active" : ""}`}
                                onClick={() => companyDetails(company)}>
                                    <div className="companies__user-avatar">
                                        <img className="avatar-icon" src={companyIcon} alt='user-avatar' />
                                    </div>
                                    <div className="companies__user-name">
                                        <div>
                                            <Tooltip title={company?.name} aria-label="company name">
                                                <label>
                                                { (company?.name && company?.name.length > 18) ? `${company?.name.slice(0,18)} . . .`: company?.name }
                                                </label>
                                            </Tooltip>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                        }

                </div>
                ): 
                !state.isLoading ? (
                    <div className="noUpdatePermission">
                        <div className="no-permission">
                            <NoDataMessage message={noPermissionMessage}/> 
                        </div>
                    </div>
                ) : ('')               
                
                }  
            </div>
    )
}
