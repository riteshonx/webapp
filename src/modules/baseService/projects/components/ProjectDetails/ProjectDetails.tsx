import InputLabel from '@material-ui/core/InputLabel';
import './ProjectDetails.scss';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import React, { ReactElement, useContext, useEffect, useState } from 'react';
import { projectCurrency, projectMeasurement, projectStage,
        projectTemprature, projectTrades, projectType } from '../../../../../utils/projectMetrics';
import { Controller, useForm } from 'react-hook-form';
import { projectDetailsContext } from '../../Context/ProjectDetailsContext';
import { setProjecDetailsDirty, setProjectMetricsDetails } from '../../Context/ProjectDetailsActions';
import { canUpdateProject } from '../../../roles/utils/permission';
import { CustomPopOver } from '../../../../shared/utils/CustomPopOver';


const defaultValues: any ={
    ProjectTypes: '',
    ProjectStages: '',
    ProjectTemperatures: '',
    ProjectMeasurements: '',
    ProjectCurrencies: '',
    // ProjectTradeTypes: ''
};

export default function ProjectDetails(props: any): ReactElement {

    const [type, setType] = useState<Array<any>>([]);
    const [stage, setStage] = useState<Array<any>>([]);
    const [temperature, setTemperature] = useState<Array<any>>([]);
    const [measurement, setMeasurement] = useState<Array<any>>([]);
    const [currency, setCurrency] = useState<Array<any>>([]);
    const [trades, setTrades] = useState<Array<any>>([]);
    const {projectDetailsState, projectDetailsDispatch}: any = useContext(projectDetailsContext);
    const classes= CustomPopOver();

    const {
        handleSubmit,
        control,
        getValues,
        setValue,
        watch,
        formState: { errors }
      } = useForm<any>({
        defaultValues
    });
    useEffect(() => {
        if(projectDetailsState?.projectMetricsDetails){
             setFormValue(projectDetailsState.projectMetricsDetails);
         }
     }, [projectDetailsState?.projectMetricsDetails])

    useEffect(() => {
        setType(projectType);
        setStage(projectStage);
        setTemperature(projectTemprature);
        setMeasurement(projectMeasurement);
        setCurrency(projectCurrency);
        setTrades(projectTrades);
    }, []);

    const getProjectDetails = () => {   
        projectDetailsDispatch(setProjecDetailsDirty(true));
        projectDetailsDispatch(setProjectMetricsDetails(getValues()));
    }

    const setFormValue = (value: any) => {
        setValue('ProjectTypes',  value?.ProjectTypes, { shouldValidate: true });
        setValue('ProjectStages', value?.ProjectStages, { shouldValidate: true });
        setValue('ProjectTemperatures', value?.ProjectTemperatures, { shouldValidate: true });
        setValue('ProjectMeasurements', value?.ProjectMeasurements, { shouldValidate: true });
        setValue('ProjectCurrencies', value?.ProjectCurrencies, { shouldValidate: true });
        // setValue('ProjectTradeTypes', value?.ProjectTypes, { shouldValidate: true });
    }

    return (
        <div className="projectDetails">
            <div className="projectDetails__description">
                Make further adjustments to this project by adding more information below.
            </div>
            <div  className="projectDetails__metrics">
                <div className="projectDetails__metrics__container">
                    <div className="projectDetails__metrics__label">
                        <InputLabel required={false}>Type</InputLabel>
                    </div>
                    <div className="projectDetails__metrics__input-field">
                        <Controller 
                            render={({ field }:{field:any}) => (                        
                                <Select
                                    disabled={!canUpdateProject && !projectDetailsState?.projectUpdatePermission?.canUpdateMyProject}
                                    fullWidth
                                    {...field}
                                    autoComplete='off'
                                    placeholder="select a value"
                                    onChange={(e) => {
                                        field.onChange(e)
                                        getProjectDetails()
                                    }}
                                    MenuProps={{ classes: { paper: classes.root },
                                        anchorOrigin: {
                                        vertical: "bottom",
                                        horizontal: "left"
                                        },
                                        transformOrigin: {
                                        vertical: "top",
                                        horizontal: "left"
                                        },
                                        getContentAnchorEl: null }}
                                    >
                                    {
                                        type.map((item: any) => (
                                            <MenuItem className="mat-menu-item-sm" key={item.id} value={item.type}>{item.type}</MenuItem>
                                        ))
                                    }
                                </Select>                     
                            )}
                            name="ProjectTypes"
                            control={control}
                            rules={{
                                required: false,
                                // validate: isUniqueProjectName
                            }}
                        />
                    </div>           
                </div>

                <div className="projectDetails__metrics__container">
                    <div className="projectDetails__metrics__label">
                        <InputLabel required={false}>Stage</InputLabel>
                    </div>
                    <div className="projectDetails__metrics__input-field">
                        <Controller 
                            render={({ field }:{field:any}) => (                        
                                <Select
                                    MenuProps={{ classes: { paper: classes.root },
                                        anchorOrigin: {
                                        vertical: "bottom",
                                        horizontal: "left"
                                        },
                                        transformOrigin: {
                                        vertical: "top",
                                        horizontal: "left"
                                        },
                                        getContentAnchorEl: null }}
                                    disabled={!canUpdateProject && !projectDetailsState?.projectUpdatePermission?.canUpdateMyProject}
                                    fullWidth
                                    {...field}
                                    autoComplete='off'
                                    placeholder="select a value"
                                    onChange={(e) => {
                                        field.onChange(e)
                                        getProjectDetails()
                                    }}
                                >
                                    {
                                        stage.map((item: any) => (
                                            <MenuItem className="mat-menu-item-sm" key={item.id} value={item.stage}>{item.stage}</MenuItem>
                                        ))
                                    }
                            </Select>                  
                            )}
                            name="ProjectStages"
                            control={control}
                            rules={{
                                required: false,
                                // validate: isUniqueProjectName
                            }}
                        />
                    </div>           
                </div>

                <div className="projectDetails__metrics__container">
                    <div className="projectDetails__metrics__label">
                        <InputLabel required={false}>Temperature</InputLabel>
                    </div>
                    <div className="projectDetails__metrics__input-field">
                            <Controller 
                                render={({ field }:{field:any}) => (                                           
                                    <Select
                                        MenuProps={{ classes: { paper: classes.root },
                                            anchorOrigin: {
                                            vertical: "bottom",
                                            horizontal: "left"
                                            },
                                            transformOrigin: {
                                            vertical: "top",
                                            horizontal: "left"
                                            },
                                            getContentAnchorEl: null }}
                                        disabled={!canUpdateProject && !projectDetailsState?.projectUpdatePermission?.canUpdateMyProject}
                                        fullWidth
                                        {...field}
                                        autoComplete='off'
                                        placeholder="select a value"
                                        onChange={(e) => {
                                            field.onChange(e)
                                            getProjectDetails()
                                        }}
                                    >
                                        {
                                            temperature.map((item: any) => (
                                                <MenuItem className="mat-menu-item-sm" key={item.id} value={item.temp}>{item.temp}</MenuItem>
                                            ))
                                        }
                                    </Select>              
                                )}
                                name="ProjectTemperatures"
                                control={control}
                                rules={{
                                    required: false,
                                    // validate: isUniqueProjectName
                                }}
                            />
                    </div>           
                </div>

                <div className="projectDetails__metrics__container">
                    <div className="projectDetails__metrics__label">
                        <InputLabel required={false}>Measurement</InputLabel>
                    </div>
                    <div className="projectDetails__metrics__input-field">
                        <Controller 
                            render={({ field }:{field:any}) => (                                           
                                <Select
                                    MenuProps={{ classes: { paper: classes.root },
                                        anchorOrigin: {
                                        vertical: "bottom",
                                        horizontal: "left"
                                        },
                                        transformOrigin: {
                                        vertical: "top",
                                        horizontal: "left"
                                        },
                                        getContentAnchorEl: null }}
                                    disabled={!canUpdateProject && !projectDetailsState?.projectUpdatePermission?.canUpdateMyProject}
                                    {...field}
                                    fullWidth
                                    autoComplete='off'
                                    placeholder="select a value"
                                    onChange={(e) => {
                                        field.onChange(e)
                                        getProjectDetails()
                                    }}
                                >
                                    {
                                        measurement.map((item: any) => (
                                            <MenuItem className="mat-menu-item-sm" key={item.id} value={item.measurement}>
                                                {item.measurement}
                                            </MenuItem>
                                        ))
                                    }
                                </Select>             
                            )}
                            name="ProjectMeasurements"
                            control={control}
                            rules={{
                                required: false,
                                // validate: isUniqueProjectName
                            }}
                        />
                    </div>           
                </div>

                <div className="projectDetails__metrics__container">
                    <div className="projectDetails__metrics__label">
                        <InputLabel required={false}>Currency</InputLabel>
                    </div>
                    <div className="projectDetails__metrics__input-field">
                        <Controller 
                            render={({ field }:{field:any}) => (                                           
                                <Select
                                    MenuProps={{ classes: { paper: classes.root },
                                        anchorOrigin: {
                                        vertical: "bottom",
                                        horizontal: "left"
                                        },
                                        transformOrigin: {
                                        vertical: "top",
                                        horizontal: "left"
                                        },
                                        getContentAnchorEl: null }}
                                    disabled={!canUpdateProject && !projectDetailsState?.projectUpdatePermission?.canUpdateMyProject}
                                    fullWidth
                                    autoComplete='off'
                                    placeholder="select a value"
                                    {...field}
                                    onChange={(e) => {
                                        field.onChange(e)
                                        getProjectDetails()
                                    }}
                                >
                                    {
                                        currency.map((item: any) => (
                                            <MenuItem className="mat-menu-item-sm" key={item.id} value={item.currency}>{item.currency}</MenuItem>
                                        ))
                                    }
                                </Select>            
                            )}
                            name="ProjectCurrencies"
                            control={control}
                            rules={{
                                required: false,
                                // validate: isUniqueProjectName
                            }}
                        />
                    </div>           
                </div>

                {/* <div className="projectDetails__metrics__container">
                    <div className="projectDetails__metrics__label">
                        <InputLabel required={false}>Trades</InputLabel>
                    </div>
                    <div className="projectDetails__metrics__input-field">
                        <Controller 
                            render={({ field }:{field:any}) => (                                           
                                <Select
                                    disabled={!canUpdateProject}
                                    {...field}
                                    fullWidth
                                    autoComplete='off'
                                    placeholder="select a value"
                                >
                                    <MenuItem id="custom-list" value=""><em>None</em></MenuItem>
                                    {
                                        trades.map((item: any) => (
                                            <MenuItem key={item.id} value={item.trades}>{item.trades}</MenuItem>
                                        ))
                                    }
                                </Select>       
                            )}
                            name="ProjectTradeTypes"
                            control={control}
                            rules={{
                                required: false,
                            }}
                        />
                    </div>           
                </div> */}

            </div>
        </div>
    )
}
