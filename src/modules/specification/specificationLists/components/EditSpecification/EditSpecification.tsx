import React, { ReactElement, useContext, useEffect, useState } from 'react';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import Button from '@material-ui/core/Button';
import './EditSpecification.scss';
import InputLabel from '@material-ui/core/InputLabel';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import TextField from '@material-ui/core/TextField';
import thumbNail from '../../../../../assets/images/dummy_thumb_nail_image.jpg';

const defaultValues: any ={
    sectionNumber: '',
    sectionName: '',
};


export default function EditSpecification(props: any): ReactElement {

    const [specificationDetails, setSpecificationDetails] = useState<any>();
    const {
        handleSubmit,
        control,
        getValues,
        setError,
        clearErrors,
        watch,
        setValue,
        formState: { errors }
      } = useForm<any>({
        defaultValues
    });
    useEffect(() => {
       if(props.selectedSpeciification?.createdAt){
            setSpecificationDetails(props.selectedSpeciification);
            setInitialValue();
       }
    }, [props.selectedSpeciification]);

    
    const setInitialValue = () => {
        setValue('sectionNumber',  props.selectedSpeciification?.sectionNumber, { shouldValidate: true });
        setValue('sectionName',  props.selectedSpeciification?.sectionName, { shouldValidate: true });
    }

    const closeSideBar = () => {
        props.closeSideBar(false)
    }

    const onSubmit = () => {
        // console.log('value')
    }

    return (
        <div className="updateSpecification">
            <div className="updateSpecification__wrapper">
                <div className="updateSpecification__wrapper__specification-image">
                    <img className="img-responsive" src={thumbNail} alt="specification" />
                    <span className="closeIcon">
                        <HighlightOffIcon className="closeIcon-svg" data-testid={'close-sideBar'} onClick={closeSideBar}/>
                    </span>
                </div>
                <form className="updateSpecification__wrapper__form" onSubmit={handleSubmit(onSubmit)}>
                    <div className="updateSpecification__wrapper__form__body">
                        <div className="updateSpecification__wrapper__form__body__header">
                           Specification Info
                        </div>
                        <div className="updateSpecification__wrapper__form-wrapper">

                            <div  className="updateSpecifcation__wrapper__form__body__container">
                                <div className="updateSpecification__wrapper__form__body__label">
                                    <InputLabel required={true}>Section No.</InputLabel>
                                </div>
                                <div className="updateSpecification__wrapper__form__body__input-field">
                                    <Controller 
                                        render={({ field }:{field:any}) => (
                                            <TextField
                                                type="text"
                                                {...field}
                                                fullWidth
                                                autoComplete="search"
                                                placeholder='Enter specification number'
                                                // onChange={(e) => {field.onChange(e), handleProjectName(e)}}
                                            />                     
                                        )}
                                        name= "SpecificationNumber"
                                        control={control}
                                        rules={{
                                            required: true
                                        }}
                                    />
                                    <div className="updateSpecification__error-wrap">
                                            <p className="updateSpecification__error-wrap__message">
                                                {
                                                    errors.SectionNumber?.type === "required" ? (
                                                        <span>Section number is required</span>
                                                    ) : (
                                                        errors.SectionNumber?.type === "unique" && (
                                                            <span>*Section number already exists</span>
                                                        )
                                                    )
                                                }
                                            </p>
                                    </div>
                                </div>
                            </div>

                            <div  className="updateSpecifcation__wrapper__form__body__container">
                                <div className="updateSpecification__wrapper__form__body__label">
                                    <InputLabel required={true}>Section Name</InputLabel>
                                </div>
                                <div className="updateSpecification__wrapper__form__body__input-field">
                                    <Controller 
                                        render={({ field }:{field:any}) => (
                                            <TextField
                                                type="text"
                                                {...field}
                                                fullWidth
                                                autoComplete="search"
                                                placeholder='Enter specification name'
                                                // onChange={(e) => {field.onChange(e), handleProjectName(e)}}
                                            />                     
                                        )}
                                        name= "SpecificationName"
                                        control={control}
                                        rules={{
                                            required: true
                                        }}
                                    />
                                    <div className="updateSpecification__error-wrap">
                                            <p className="updateSpecification__error-wrap__message">
                                                {
                                                    errors.SectionName?.type === "required" && (
                                                        <span>Section name is required</span>
                                                    )
                                                }
                                            </p>
                                    </div>
                                </div>
                            </div>


                        </div>
                           
                        
                    </div>
                    <div className="updateSpecification__wrapper__form__action">
                        <Button data-testid={'cancel-create'} variant="outlined" onClick={closeSideBar}>
                            Cancel
                        </Button>
                        <Button 
                                type="submit" 
                                data-testid={'update-specification'} 
                                variant="outlined"
                                className="specification-primary"
                                disabled={true}
                            >
                            Update 
                        </Button>
                    </div>
                </form>
            </div>

        </div>  
    )
}

