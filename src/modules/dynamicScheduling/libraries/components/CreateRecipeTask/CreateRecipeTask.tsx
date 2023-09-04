import {  Button, FormControl, InputLabel, useMediaQuery, useTheme } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import CloseIcon from '@material-ui/icons/Close';

import { gantt } from 'dhtmlx-gantt';
import moment from 'moment';

import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import NumberFormat from 'react-number-format';
import SelectListGroup from '../../../components/SelectCustom/SelectCustom';
import TextFieldCustom from '../../../components/TextFieldCustom/TextFieldCustom';
import './CreateRecipeTask.scss';
import TextField from '@material-ui/core/TextField';

const CreateRecipeTask = (props: any) => {
  const theme = useTheme();

  const [disableAdd, setDisableAdd] = useState(true);
  const [duration, setDuration] = useState("");
  const [taskType, setTaskType] = useState("");
  const [text, setText] = useState('');
  //const [type, setType] = useState('');
  const [typeOptions, setTypeOptions] = useState<any>([]);
  const [errors, setErrors] = useState<any>({
    start_date: '',
    duration: '',
    end_date: '',
    name: '',
  });

  const MAX_VAL = 999;
  const MIN_VAL = 1;
  const withValueCap = (inputObj: any) => {
    const { value } = inputObj;

    if(value == "") {
      return true;
    }

    if (value <= MAX_VAL && value >= MIN_VAL) {
       return true;
    } 
    return false;
  };

  const {
    handleSubmit,
    reset,
    control,
    setValue,
  } = useForm<any>({});

  const {
    onCloseLightBox,
    task,
    onChangeHandler,
  } = props;
  const { type, parent: parentId, isFloated } = task;

 
  useEffect(() => {
    // do nothing
    if (
      (type === 'task' || type === 'work_package') &&
      duration != "" &&
      text
    ) {
      setDisableAdd(false);
    } else {
      setDisableAdd(true);
    }
  }, [duration, text, type, taskType]);

  useEffect(() => {
    setTypeOptions(getTaskTypeOptions());
  }, [type]);

  const getTaskTypeOptions = () => {
    // Important note:

    // two level of work package
    // one level of task

    const parent = task?.parent != undefined ? gantt.getTask(task?.parent) : null;
    if(parent?.type == 'work_package') {
      if(gantt.getTask(parent?.parent).type == 'work_package') {
        return [{ value: 'task', label: 'Task' }];
      }
    }
    return [
      { value: 'work_package', label: 'Work Package' },
      { value: 'task', label: 'Task' },
    ];
  };

  const onKeyDown = (e: any) => {
    if (e.charCode === 45) {
      e.preventDefault();
      return false;
    }

    try {
      if (e.charCode === 48 && !duration) {
        e.preventDefault();
        return false;
      }
    } catch (e) {}
  };

  const onChange = (event: any) => {
    if (event?.target?.name === 'text') {
      try {
        if (event.target.value.trim()) {
          setText(event.target.value);
          
        } else {
          setText('');
          setErrors({
            ...errors,
            name: '',
          });
        }
      } catch (e) {}
    }

    if (event?.target?.name === 'type') {
      setErrors({
        ...errors,
        name: '',
      });
      switch (event.target.value) {
        case 'task':
        case 'work_package':
         // setDuration("");
          break;

        default:
        //
      }
    }

    if(event.formattedValue || event.formattedValue  == "") {
      // if (event.target.value <= 0) {
      //   setDuration(null);
      //   event.target.value = '';
      // } else {
        setDuration(event.value);
     // }
    }

   // onChangeHandler(event);

    onChangeHandler(event);
  };

  return (
    <div className="create-recipe-task">
      <Dialog
        data-testid="create-popup"
        open={props.open}
        area-labelledby="form-dialog-title"
        maxWidth="xs"
        fullWidth={true}
        disableBackdropClick={true}
      >
        <DialogContent>
          <form className="create-recipe-task__form">
            <div style={{display: "flex"}}>
              <div style={{width: "525px"}}>
              <SelectListGroup
                data-testid="type"
                className="create-recipe-task__form u-margin-bottom-medium"
                
                onChange={onChange}
                name="type"
                value={type}
                label="Type"
                options={typeOptions}
                required={true}
              ></SelectListGroup>
              </div>
              <div className='create-recipe-task__form__duration'>
              <div>
              <InputLabel id="demo-simple-select-outlined-label"
                className="create-recipe-task__form__duration__days">Duration <span style={{color: "red"}}>*</span></InputLabel>
              <FormControl variant="outlined" fullWidth>
              <Controller
                      render={({ field }: { field: any }) => (
                        <NumberFormat
                          inputMode="numeric"
                          allowNegative={false}
                          customInput={TextField}
                          isAllowed={withValueCap}
                          decimalScale={0}
                          {...field}
                          style={{ margin: "0px 0px 4px 0px" }}
                          placeholder="days"
                          fullWidth
                          margin="normal"
                          variant="outlined"
                          onValueChange={onChange}
                          InputLabelProps={{
                            shrink: true,
                          }}
                          // onChange={(e) => {
                          //   onChange(e);
                          // }}
                        />
                      )}
                      control={control}
                      name="duration"
                      rules={{
                        required: true,
                      }}
                    />
</FormControl>
                {/* <span className="create-recipe-task__form__duration__days__unit">
                  Days
                </span> */}
              </div>
            </div>

            </div>
            <TextFieldCustom
              data-testid="task-name"
              className="create-recipe-task__form u-margin-bottom-medium"
              placeholder="Enter Name"
              name="text"
              label="Name"
              value={text}
              onChange={onChange}
              error={errors.name}
              required={true}
              maxLength={500}
            ></TextFieldCustom>

            

            <div className="create-recipe-task__form__content-bottom u-margin-top-small u-margin-bottom-medium">
              <Button
                data-testid="create-recipe-task-cancel"
                variant="outlined"
                className="create-recipe-task__form__cancel"
                onClick={() => {
                  onCloseLightBox('cancel');
                }}
              >
                Cancel
              </Button>
              <Button
                data-testid="create-recipe-task-add"
                variant="outlined"
                className="btn-primary create-recipe-task__form__add"
                onClick={() => {
                  onCloseLightBox('add');
                }}
                disabled={disableAdd}
              >
                Add
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateRecipeTask;
