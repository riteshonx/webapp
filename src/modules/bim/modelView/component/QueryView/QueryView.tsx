import React, { useEffect, useState, useContext } from 'react';
import './QueryView.scss'
import {attributeList, operatorsList} from '../../../constants/query'
import { bimContext } from '../../../contextAPI/bimContext';
import { fetchElementName } from '../../../container/utils';
import { stateContext } from '../../../../root/context/authentication/authContext';
import { setIsLoading } from '../../../../root/context/authentication/action';
import { projectFeatureAllowedRoles } from '../../../../../utils/role';

let elementNames: any = {};

export default function QueryForm(props: any) {
    const [queryClauseList, setClauseList] = useState<any []>([]);
    const context: any = useContext(bimContext);
    const { dispatch, state }:any = useContext(stateContext);

    useEffect(()=> {
        if (props.queryId) {
            fetchElementNames();
            createOptionList()
        }
        return () => { elementNames = {}; }
    }, [])

    function createOptionList() {
        let newClauseList: any[] = [];
        newClauseList = props.query.reduce((result: any[], query: any) => {
            const attribute  = (query.type === "non_priorty") ? 
                {...attributeList[0], value: query.attribute, title: query.attribute }: 
                    attributeList.find(attrb => attrb.value === query.attribute); 
            if(attribute) {
                result.push({...query, 
                    attribute: attribute.title,
                    attributeOperator: operatorsList[attribute.type].find(operator => operator.value === query.attributeOperator)?.symbol || operatorsList[attribute.type][0].symbol,
                    values: query.values
                })
            }
            return result
        }, [] as any) 
        setClauseList(newClauseList)
    }

    async function fetchElementNames() {
        dispatch(setIsLoading(true))
        const modelIds = (context.state.isAssembly) ? context.state.assemblyModelList : [context.state.activeModel]
        elementNames = await fetchElementName(state.selectedProjectToken, projectFeatureAllowedRoles.viewBimModel, modelIds)
        dispatch(setIsLoading(false))
    }

    const getSanitizedQueryValues = (value: any, query: any) => {
        if (query.attribute === "Elements" && query.type !== "spatial" ) return value.map((a: any) => elementNames[a] || a).join(",");

        if (context.state.isAssembly) {
            return Array.isArray(value) ? value.join(",") : value
        } else {
            return Array.isArray(value) ?
                value.map((val: string) => val.replace("OST_", "")).join(",")
                : value.replace("OST_", "")
        }
    }
    
    return (
        <div className="bimQueryView">
            {
                (props.queryId) ? 
                    <div className="query-container">
                        <span className="query-details">
                            {props.name}&nbsp;
                            <span className="query-result">({props.queryResult})</span>
                        </span>
                        <div className="query-params">
                        {
                            queryClauseList.map((clause: any, index: number) => {
                                const sanitizedQueryValues = getSanitizedQueryValues(clause.values, clause);
                                return(
                                    <div key={index} className="caluse">  
                                        {(index === 0) ? '' : clause.joinOperator + ' '}
                                        <span className="green">{clause.attribute}</span>&nbsp;
                                        <span>{clause.attributeOperator}</span>&nbsp;
                                        <span className="green">{sanitizedQueryValues}</span>&nbsp;
                                    </div>
                                )
                            })
                        }
                        </div>
                    </div>: 
                    <div>A Query has not yet been added to this Filter</div>
            }
        </div>
    );
}
