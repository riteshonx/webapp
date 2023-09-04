import React, { useState, useEffect, useContext } from 'react';
import './QueryForm.scss'
import { Button } from '@material-ui/core';
import InputLabel from '@material-ui/core/InputLabel';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import {attributeList, operatorsList, attributeType} from '../../../constants/query'
import { projectFeatureAllowedRoles } from '../../../../../utils/role';
import { stateContext } from '../../../../root/context/authentication/authContext';
import { client } from '../../../../../services/graphql'
import { bimContext } from '../../../contextAPI/bimContext';
import {BIM_DISTNT_FEILD_VALUES, FETCH_ATTR_LIST, FETCH_NON_PRIOR_ATTR_LIST, FETCH_NON_PRIOR_ATTR_VALUE, FETCH_NON_PRIOR_ATTR_RESULT} from '../../../graphql/bimQuery';
import { setIsLoading } from '../../../../root/context/authentication/action';
import { setPrefetchNonPriorityList, setPrefetchPriorityList, setQuerySelectedElements} from '../../../contextAPI/action';
import { fetchElementName } from '../../../container/utils';

let orgAttributeList: any[] = [];
let elementNames: any = {};

export default function QueryForm(props: any) {
    const { dispatch, state }:any = useContext(stateContext);
    const context: any = useContext(bimContext);
    const [attrbteList, setAttrbteList] = useState<any[]>([]);
    const [attributeValueList, setAttributeValueList] = useState<any[]>([]);
    const [queryOption, setQueryOption] = useState<any>({
        attribute:  props.queryOption?.attribute || null,
        attributeOperator:  props.queryOption?.attributeOperator || operatorsList.string[0],
        values: props.queryOption?.values || null,
        joinOperator: props.queryOption?.joinOperator || 'and',
        type: props.queryOption?.type || "non_spatial"
    });
    const defaultAttributeOperatorType:keyof typeof operatorsList = queryOption.attribute?.type || 'string';
    const [operators, setOperators] = useState<any[]>(operatorsList[defaultAttributeOperatorType]);
    const [isMultpleAttr, setIsMultpleAttr] =(queryOption.attributeOperator.type === 'multiple') ? useState(true) : useState(false);
    const [isNonPriority, setIsNonPriority] = useState(props.queryOption?.type === 'non_priorty' && true);

    useEffect(() => {
        isNonPriority ? fetchNonPriorAttributeList() :fetchAttributeList()
        return (() => { elementNames = {}})
    }, [isNonPriority])

    useEffect(() => {
        context.state.querySelectedElements && queryOption?.attribute?.value === 'sourceId' && 
            setQueryOption({...queryOption, values: context.state.querySelectedElements});
    }, [context.state.querySelectedElements])

    async function fetchAttributeList() {
        dispatch(setIsLoading(true));
        const modelIds = (context.state.isAssembly) ? context.state.assemblyModelList : [context.state.activeModel]
        const data = context.state.prefetchPriorityList  || await fetchData(FETCH_ATTR_LIST, {"modelIds": modelIds})
        let newAttrList: attributeType[] = [];
        if(data && data.getFilteredBimQueryAttributes_query) {
            newAttrList = attributeList.filter(attribute => data.getFilteredBimQueryAttributes_query.attribute.includes(attribute.value) || attribute.value === 'sourceId' )
            setNewAttrbteList(newAttrList, "non_spatial");
            context.dispatch(setPrefetchPriorityList(data));
        }
        dispatch(setIsLoading(false));
    }

    async function fetchNonPriorAttributeList() {
        dispatch(setIsLoading(true));
        const modelIds = (context.state.isAssembly) ? context.state.assemblyModelList : [context.state.activeModel]
        const data = context.state.prefetchNonPriorityList || await fetchData(FETCH_NON_PRIOR_ATTR_LIST, {"modelIds": modelIds})
        if(data && data.getNonPriorityBimAttributes_query) {
            const newAttrList = data.getNonPriorityBimAttributes_query.attributes.map((attribute: string) => {
                return {
                    ...attributeList[0],
                    title: attribute,
                    value: attribute
                }
            })
            setNewAttrbteList(newAttrList, "non_priorty");
            context.dispatch(setPrefetchNonPriorityList(data));
        }
        dispatch(setIsLoading(false));
    }

    function setNewAttrbteList(newAttrList: any[], currentCaluseType: string ) {
        setAttrbteList(newAttrList)
        let selectAttr: attributeType = newAttrList[0];
        let values =  null;
        let operator = operatorsList[selectAttr?.type][0];
        setIsMultpleAttr(false)
        if(queryOption.type === currentCaluseType) {
            selectAttr = newAttrList.find(attr => attr.value === queryOption.attribute?.value) ? queryOption.attribute : newAttrList[0];
            values = queryOption.values;
            operator = queryOption.attributeOperator;
            operator.type === 'multiple' && setIsMultpleAttr(true);
            selectAttr.value === 'sourceId' && context.dispatch(setQuerySelectedElements(queryOption.values))
        }
        const clauseType = isNonPriority ?  "non_priorty" : "non_spatial";
        setOperators(operatorsList[selectAttr?.type]);
        setQueryOption({...queryOption, attribute: selectAttr, attributeOperator: operator, type: clauseType, values: values});
        selectAttr && (isNonPriority) ? updateNonPriorAttributeValueList(selectAttr):  updateAttributeValueList(selectAttr);
    }

    async function handleAttrChange(event: any, value: attributeType) {
        const newOprtor = operatorsList[value?.type || 'string'];
        setOperators(newOprtor)
        setQueryOption({...queryOption, attribute: value, attributeOperator: newOprtor[0], values: null})
        setIsMultpleAttr(value?.type === 'element' ? true : false);
        (isNonPriority) ? updateNonPriorAttributeValueList(value):  updateAttributeValueList(value);
    }

    async function updateAttributeValueList(attribute: attributeType) {
        const modelIds = (context.state.isAssembly) ? context.state.assemblyModelList : [context.state.activeModel]
        elementNames = await fetchElementName(state.selectedProjectToken, projectFeatureAllowedRoles.viewBimModel, modelIds)
        const data: any = await fetchData(BIM_DISTNT_FEILD_VALUES(attribute.attrValueTable, attribute.value, attribute.elementTableName), {"_in": modelIds})
        if (data) {
            const valueList: any[] = data[attribute.attrValueTable].reduce((result: any[],  attrValue: any) => {
                (attrValue[attribute.value]) ? result.push(String(attrValue[attribute.value])) : null;
                return result;
            }, [])
            setAttributeValueList(valueList)
            orgAttributeList = valueList;
        }
    }

    async function updateNonPriorAttributeValueList(attribute: attributeType) {
        const modelIds = (context.state.isAssembly) ? context.state.assemblyModelList : [context.state.activeModel]
        const data: any = await fetchData(FETCH_NON_PRIOR_ATTR_VALUE, {"attribute": attribute.value, "modelIds": modelIds})
        if (data&& data.getValueOfNonPriorityBimAttribute_query.attributeValue) {
            const valueList = data.getValueOfNonPriorityBimAttribute_query.attributeValue[attribute.value];
            setAttributeValueList(valueList)
            orgAttributeList = valueList;
        }
    }

    function handleOpertorChange(event: any, value: any):void {
        setQueryOption({...queryOption, attributeOperator: value,  values: null});
        if(value.type === 'multiple' && !isMultpleAttr) {
            setAttributeValueList(["Select All", ...orgAttributeList])
        } else if(value.type !== 'multiple' && isMultpleAttr) {
            setAttributeValueList(orgAttributeList)
        }
        (value.type === 'multiple') ? setIsMultpleAttr(true) : setIsMultpleAttr(false);
    }

    function handleValueChange(event: any, value: any) {
        (Array.isArray(value) && value.includes("Select All")) ? setQueryOption({...queryOption, values: [...attributeValueList.slice(1)]}) :
            setQueryOption({...queryOption, values: value});
        queryOption.attribute.value === 'sourceId' && context.dispatch(setQuerySelectedElements(value));
    }

    function handleInputValueChange(event: any, value: any) {
        if(queryOption.attribute.type === "number") {
            setAttributeValueList([...orgAttributeList, value]);
            setQueryOption({...queryOption, values: value});
        }
    }

    function handleInputValueKeyPress(event: any) {
        const invalidChars = (queryOption.attribute.type === "number") ? ["-", "+", "e", "Enter"] : ["Enter"];
        if (invalidChars.includes(event.key)) {
            event.preventDefault();
        }
    }

    function handleJoinOperatorChange(event: any, value: any):void {
        setQueryOption({...queryOption, joinOperator: value})
    }

    function handleSubmit(e: any) {
        e.preventDefault();
        context.dispatch(setQuerySelectedElements([]))
        isNonPriority ? handleNonpriortySubmit() :props.onSubmit(queryOption);
    }

    async function handleNonpriortySubmit() {
        const modelIds = (context.state.isAssembly) ? context.state.assemblyModelList : [context.state.activeModel];
        const data: any = await fetchData(FETCH_NON_PRIOR_ATTR_RESULT, 
             {"key": queryOption.attribute.value, "value": queryOption.values, "operator": queryOption.attributeOperator.value ,"modelIds": modelIds})
        setQueryOption({...queryOption, handleIds: data?.getElementsByNonPriorityBimAttribute_query?.data || []});
        props.onSubmit({...queryOption, handleIds: data?.getElementsByNonPriorityBimAttribute_query?.data || []});
    }

    function getMultpleValueOptionLabel(option: string) {
        if (!option)  return ''; 
        if (queryOption.attribute.value === 'sourceId') return elementNames[option] || option;
        return (context.state.isAssembly) ? option : option.replace("OST_","");
    }

    const fetchData = async (query: any, variables: any) => {
        let responseData;
        try {
            responseData = await client.query({
                query: query,
                variables: variables,
                fetchPolicy:'network-only',
                context:{role: projectFeatureAllowedRoles.viewBimModel, token: state.selectedProjectToken}
            });
            
        } catch(error: any) {
            console.log(error)
        } finally {
            return (responseData?.data) ? responseData.data : null;
        }
    }

    return (
        <div className="bimQueryForm">
            <form onSubmit={handleSubmit}>
                {(props.updateIndex > 0) ? 
                    <RadioGroup row value={queryOption.joinOperator} onChange={handleJoinOperatorChange} >
                        <FormControlLabel className="radioLabel" value="and" control={<Radio size={"small"} color="default" />} label="And" />
                        <FormControlLabel className="radioLabel" value="or" control={<Radio size={"small"} color="default" />} label="Or" />
                    </RadioGroup>
                : <div style={{padding: "10px"}}/>}
                <InputLabel htmlFor="attribute" style={{fontSize: "1rem"}} >Attribute type</InputLabel>
                <RadioGroup row value={isNonPriority} onChange={() => setIsNonPriority(!isNonPriority)} >
                    <FormControlLabel className="radioLabel attrType" value={false} control={<Radio size={"small"} color="default" />} label="Priority" />
                    <FormControlLabel className="radioLabel attrType" value={true} control={<Radio size={"small"} color="default" />} label="Non-Priority" />
                </RadioGroup>
                <InputLabel htmlFor="attribute" style={{fontSize: "1rem", paddingBottom: "4px"}} >Select an Attribute</InputLabel>
                <Autocomplete
                    id="attribute"
                    options={attrbteList.sort((a, b) => (a.title > b.title) ? 1 : -1)}
                    getOptionLabel={(option) => option.title}
                    onChange={handleAttrChange}
                    onKeyDown={(e: any) => e.stopPropagation()} 
                    value={queryOption.attribute}
                    disableClearable={true}
                    renderInput={(params) => 
                        <TextField     
                            {...params} 
                            className="textField" 
                            required={true} 
                            fullWidth={true} 
                            variant="outlined"
                        />
                    }
                />
                <InputLabel htmlFor="operators" style={{fontSize: "1rem", paddingBottom: "4px"}} >Operators</InputLabel>
                <Autocomplete
                    id="operators"
                    options={operators}
                    onChange={handleOpertorChange}
                    value={queryOption.attributeOperator}
                    getOptionLabel={(option) => option.title}
                    disableClearable={true}
                    onKeyDown={(e: any) => e.stopPropagation()}
                    renderInput={(params) => <TextField {...params} placeholder={"select"} required={true} className="textField" fullWidth={true} variant="outlined" />}
                />
                <InputLabel htmlFor="attributeValue" style={{fontSize: "1rem", paddingBottom: "4px"}} >Attribute Value</InputLabel>
                { isMultpleAttr ?
                <Autocomplete
                    id="attributeValue"
                    options={attributeValueList}
                    multiple={true}
                    className={!isMultpleAttr ? 'hidden' : ''} 
                    onChange={handleValueChange}
                    getOptionLabel={getMultpleValueOptionLabel}
                    value={queryOption.values || []}
                    onKeyDown={(e: any) => e.stopPropagation()}
                    renderInput={(params) => 
                        <TextField {...params}  
                            placeholder={"Select"} 
                            required={queryOption.values === null || queryOption.values?.length === 0} 
                            className="textField" 
                            fullWidth={true} 
                            variant="outlined" 
                        />
                    }
                /> :
                <Autocomplete
                    id="attributeValue"
                    options={attributeValueList}
                    freeSolo={queryOption.attribute?.type === "number"}
                    className={isMultpleAttr ? 'hidden' : ''} 
                    onChange={handleValueChange}
                    onInputChange={handleInputValueChange}
                    value={queryOption.values}
                    onKeyDown={(e: any) => e.stopPropagation()}
                    getOptionLabel={(option) => option && typeof option === 'string' ? (context.state.isAssembly) ? option : option.replace("OST_","") : ""}
                    renderInput={(params) => 
                        <TextField  {...params}  
                            type={queryOption.attribute?.type === "number" ? "number" :"text"}
                            placeholder={"Type or select"} 
                            required={true} 
                            onKeyPress={handleInputValueKeyPress}
                            className="textField" 
                            fullWidth={true} 
                            variant="outlined" 
                            inputProps={{ ...params.inputProps, step: "any"}}
                        />
                    }
                />}
                <div className="submit-section">
                    <Button className="btn-secondary" onClick={() => {props.onClose(); context.dispatch(setQuerySelectedElements([]))}} >Cancel</Button>
                    <Button className="btn-primary"  type="submit" >Apply</Button>
                </div>
            </form>
        </div>
    );
}
