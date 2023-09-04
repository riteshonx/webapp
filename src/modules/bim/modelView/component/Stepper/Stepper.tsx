import React, { ReactElement, useContext } from 'react'
import { makeStyles, withStyles } from '@material-ui/core/styles';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepConnector from '@material-ui/core/StepConnector';
import { StepIconProps } from '@material-ui/core/StepIcon';
import Check from '@material-ui/icons/Check';
import clsx from 'clsx';
import './Stepper.scss'
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import { Button } from '@material-ui/core';
import { stateContext } from '../../../../root/context/authentication/authContext';

export default function BimStepper(props: any): ReactElement {
    const { dispatch, state }:any = useContext(stateContext);

    const QontoConnector = withStyles({
        alternativeLabel: {
            top: 40,
            left: 'calc(-50% + 16px)',
            right: 'calc(50% + 16px)',
        },
        active: {
            '& $line': {
                borderColor: 'green',
                borderStyle: 'solid',
            },
        },
        completed: {
            '& $line': {
                borderColor: 'green',
                borderStyle: 'solid',
            },
        },
        line: {
            borderColor: '#eaeaf0',
            borderTopWidth: 0,
            borderRadius: 0,
            borderStyle: 'dotted'
        },
    })(StepConnector);

    const useQontoStepIconStyles = makeStyles({
        root: {
            color: '#eaeaf0',
            display: 'flex',
            height: 22,
            alignItems: 'center',
        },
        active: {
            borderColor: 'green',
        },
        circle: {
            width: 10,
            height: 10,
            borderRadius: '50%',
            backgroundColor: 'currentColor',
            border: '1px solid currentColor',
            borderColor: 'inherit'
        },
        completed: {
            width: 10,
            height: 10,
            borderRadius: '50%',
            backgroundColor: 'currentColor',
            color: 'green',
        },
    });

    function QontoStepIcon(props: StepIconProps) {
        const classes = useQontoStepIconStyles();
        const { active, completed } = props;

        return (
            <div
                className={clsx(classes.root, {
                    [classes.active]: active,
                })}
            >
                {completed ? <div className={classes.completed} /> : <div className={classes.circle} />}
            </div>
        );
    }

    function getParameterList(index: number) {
        return (
            <div className="parameter">
                {props.stepDetails[index].paramters.map((key:string, idx: number)=> {
                    return (props.stepDetails[index].values[idx]) ?
                        <p className="paramList" key={props.stepDetails[index].values[idx]+ '-' +idx}>
                            {key+ ': '} <span className={`value ${(key === 'Progress')? 'paramProgress' : ''}`}>{props.stepDetails[index].values[idx]}</span>
                        </p>
                    : false ;
                })}
            </div>
        )
    }

    return (
        <Stepper className="bimStepper" alternativeLabel activeStep={props.activeStep} connector={<QontoConnector />}>
            {props.steps.map((label: string, index: number) => {
                return (
                    <Step key={label}>
                        <StepLabel StepIconComponent={QontoStepIcon}>
                            {label}
                            {index < props.activeStep ?
                                <div className="stepDetails completed">
                                    <div className="stepTitle">{props.stepDetails[index].CompletedTitle}</div>
                                    {getParameterList(index)}
                                    {props.stepSuccess && index === props.steps.length - 1 ? 
                                        <>
                                            <Button onClick={() => {props.showBimModel(props.currentModelId)}}  className="btn-primary focusVisible">Open Model</Button><br></br>
                                            {(state.projectFeaturePermissons?.candeleteBimModel) ? <Button onClick={() => {props.handleDeleteOpen(props.currentModelId)}} className="btn-primary">Delete Model</Button> : null}
                                        </>
                                        : null
                                    }
                                </div> : null
                            }
                            {index === props.activeStep ?
                                <div className="stepDetails">
                                    {props.stepError? 
                                        <>
                                            <div className="stepTitle">{props.stepDetails[index].errorTitle}</div>
                                            {getParameterList(index)}
                                            <ErrorOutlineIcon color="error" />
                                        </> : 
                                        <>
                                            <div className="stepTitle">{props.stepDetails[index].inProgressTitle}</div>
                                            {getParameterList(index)}
                                        </>
                                    }
                                </div> : null
                            }
                            {index > props.activeStep && index < props.steps.length ? <div className="blankStepDetails"></div> : null }
                        </StepLabel>
                    </Step>
                )
            })}
        </Stepper>
    )
}
