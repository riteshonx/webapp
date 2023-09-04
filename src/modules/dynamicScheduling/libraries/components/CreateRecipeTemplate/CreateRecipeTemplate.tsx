import { useLazyQuery } from '@apollo/client';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import { createStyles, makeStyles, useTheme } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import React, { useContext, useEffect, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { useDebounce } from '../../../../../customhooks/useDebounce';
import { TaskRoles } from '../../../../../utils/role';
import { stateContext } from '../../../../root/context/authentication/authContext';
import {
  GET_RECIPE_LIST,
  SEARCH_RECIPE_BY_EXACT_NAME,
} from '../../grqphql/queries/recipe';

import { client } from "../../../../../services/graphql";
import './CreateRecipeTemplate.scss';

const useStyles = makeStyles(() =>
  createStyles({
    selectEmpty: {
      margin: '4px 0px 8px 0px',
    },
  })
);

const defaultValues = {
  Name: '',
  CustomType: '',
  Description: '',
  Classification: '',
  CustomId: '',
  Duration: null,
};

type FormValues = {
  Name: string;
  CustomType: string;
  Description: string;
  Classification: number;
  CustomId: string;
  Duration: number;
};

export default function CreateRecipeTemplate(props: any): any {
  const { dispatch }: any = useContext(stateContext);
  const [title, setTitle] = useState<string>();
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null
  );
  const {
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<any>({
    defaultValues,
  });

  const [
    uiniqueRecipeName,
    { loading: matchingRecipeLoading, data: matchingRecipeData, error: matchingRecipeError },
  ] = useLazyQuery(SEARCH_RECIPE_BY_EXACT_NAME, {
    fetchPolicy: 'network-only',
    context: { role: TaskRoles.viewTenantTask },
  });
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('xs'));

  const [searchRecipeName, setSearchRecipeName] = useState('');
  const debounceRecipeName = useDebounce(searchRecipeName, 1000);
  const [isUniqueRecipeName, setIsUniqueRecipeName] = useState(false);
  const [recipeNameRequired, setRecipeNameRequired] = useState(false);
  const [recipeType, setRecipeType] = useState('');
  const [recipeDescription, setRecipeDescription] = useState('');

  // to close the dialogbox
  const handleDialogClose = () => {
    reset({
      Name: '',
      CustomType: '',
      Description: '',
      CustomId: '',
    });
    props.close();
  };

  // set the initial value for the form
  useEffect(() => {
    setTitle(props?.btnName?.name);
    if (props?.recipeActionItem?.recipeData) {
      const recipeData = props?.recipeActionItem?.recipeData;
      setValue('Name', recipeData.recipeName, {
        shouldValidate: true,
        shouldDirty: true,
      });
      setValue('CustomType', recipeData.recipeType, {
        shouldValidate: true,
        shouldDirty: true,
      });
      setValue('Description', recipeData.description, {
        shouldValidate: true,
        shouldDirty: true,
      });
      setValue('CustomId', recipeData.id, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
    recipeNameHandlechange();
  }, []);

  // submit the form
  const onSubmit: SubmitHandler<FormValues> = async (value: FormValues) => {
    // console.log('on submit:', searchRecipeName);
    // await recipeNameHandlechange();
    const response: any = await client.query({
      query: SEARCH_RECIPE_BY_EXACT_NAME,
      variables: {
        recipeName: searchRecipeName,
      },
      fetchPolicy: 'network-only', context: { role: TaskRoles.viewTenantTask }
    });

    if(response?.data?.scheduleRecipeSet && response?.data?.scheduleRecipeSet.length > 0){
      setIsUniqueRecipeName(true);
      return;
    }
  
    // console.log('recipeNameHandlechange,', response);
    if(isUniqueRecipeName || errors?.CustomType?.type === 'required'){
      // console.log('error:', errors);
      return;
    }
    switch (props?.recipeActionItem?.actionType) {
      case 'create':
      case 'copy':
        await props.createRecipe(
          value.Name.trim(),
          value.CustomType,
          value.Description.trim(),
        );
        break;
      case 'edit':
          await props.editRecipe(
            Number(value.CustomId),
            value.Name.trim(),
            value.CustomType,
            value.Description.trim(),
          );
          break;
      
      default:
        console.error('unknown recipe action type:', props.recipeActionItem.actionType);
        break;
    }
    props.refreshRecipeList();
    handleDialogClose();
  };

  // check unique recipeName starts
  useEffect(() => {
    // console.log('completed downloading data:', matchingRecipeData);
    if (matchingRecipeData) {
      if (matchingRecipeData?.scheduleRecipeSet.length > 0) {
        props?.recipeActionItem?.recipeData?.id 
        && matchingRecipeData.scheduleRecipeSet[0].id === props?.recipeActionItem?.recipeData?.id
        && props?.recipeActionItem?.actionType === 'edit'
          ? setIsUniqueRecipeName(false)
          : setIsUniqueRecipeName(true);
      } else {
        setIsUniqueRecipeName(false);
      }
    }
    if (matchingRecipeError) {
      console.log(matchingRecipeError);
    }
  }, [matchingRecipeData, matchingRecipeError, matchingRecipeLoading]);

  useEffect(() => {
    if (debounceRecipeName) {
      recipeNameHandlechange();
    } else {
      setIsUniqueRecipeName(false);
    }
  }, [debounceRecipeName]);

  const recipeNameHandlechange = async () => {
    if (debounceRecipeName) {
      setIsUniqueRecipeName(false);
    }

    const response: any = await client.query({
      query: GET_RECIPE_LIST,
      variables: {
        limit: 1000,
        offset: 0,
        recipeName: searchRecipeName
      },
      fetchPolicy: 'network-only', context: { role: "viewTenantTask" }
    });

    if(response?.data?.scheduleRecipeSet && response?.data?.scheduleRecipeSet.length > 0){
      setIsUniqueRecipeName(true);
    //  return;
    }

    // await uiniqueRecipeName({
    //   variables: {
    //     recipeName: debounceRecipeName.trim().toLowerCase(),
    //   },
    // });
  };
  // check unique recipeName ends

  return (
    <div className="recipe-dialog">
      <Dialog
        open={props.open}
        disableBackdropClick={true}
        onClose={handleDialogClose}
        aria-labelledby="form-dialog-title"
        fullScreen={fullScreen}
      >
        <DialogTitle id="form-dialog-title">
          <span className="create-recipe-header">{title}</span>
        </DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="recipe-dialog__content">
              <div className="recipe-dialog__content__fields">
                <Grid container>
                  <Grid item sm={6} xs={12}>
                    <InputLabel shrink >
                      Recipe Name *
                    </InputLabel>
                    <Controller
                      render={({ field }: { field: any, }) => (
                        <TextField
                          {...field}
                          style={{ margin: "8px 0px" }}
                          placeholder="Enter recipe name"
                          fullWidth
                          InputProps={{ inputProps: { style: { textAlign: 'left' }, }, style: { borderRadius: 4 }, }} 
                          variant="outlined"
                          margin="normal"
                          onChange={(e) => {
                            field.onChange(e);
                            setSearchRecipeName(e.target.value.trim());
                            if(e.target.value.trim() == '') {
                              setRecipeNameRequired(true);
                            } else {
                              setRecipeNameRequired(false);
                            }
                          }}
                          InputLabelProps={{
                            shrink: true,
                          }}
                        />
                      )}
                      name="Name"
                      control={control}
                      rules={{
                        validate: (value) => { return !!value.trim() },
                        maxLength: 1000,
                      }}
                    />
                    <div className="error-wrap">
                      <p className="error-wrap__message">
                        {recipeNameRequired && <span>Recipe Name is required.</span>}
                        {searchRecipeName.length > 1000  && <span>Maximum 1000 characters are allowed.</span>}
                        {!errors?.Name && isUniqueRecipeName && <span>Recipe Name must be unique</span>}
                      </p>
                    </div>
                  </Grid>

                  <Grid item sm={6} xs={12}>
                    <InputLabel shrink>
                      Type *
                    </InputLabel>
                    <Controller
                      render={({ field }: { field: any }) => (
                        <Select
                          displayEmpty
                          variant="outlined"
                          {...field}
                          style={{ margin: "8px 0px", height: "42%"}}
                          placeholder="Select type"
                          fullWidth
                          MenuProps={{  anchorOrigin: {
                            vertical: "bottom",
                            horizontal: "left"
                          },
                          transformOrigin: {
                            vertical: "top",
                            horizontal: "left"
                          },
                          getContentAnchorEl: null }}
                          onChange={
                            (e: any) => {
                              field.onChange(e);
                              setRecipeType(e.target.value);
                            }
                          }
                          >
                          <MenuItem className="recipe-dialog__content__fields__select-box" value={'Non IC'}>Non IC</MenuItem>
                          <MenuItem className="recipe-dialog__content__fields__select-box" value={'IC'}>IC</MenuItem>
                        </Select>
                      )}
                      name="CustomType"
                      control={control}
                      rules={{
                        required: true
                      }}
                    />
                    <div className="error-wrap">
                      <p className="error-wrap__message">
                        {errors?.CustomType?.type === 'required' && <span>Please select the Recipe type.</span>}
                      </p>
                    </div>

                  </Grid>
                </Grid>

                <Grid container>
                  <Grid item xs={12}>
                    <InputLabel shrink >
                      Description
                    </InputLabel>
                    <Controller
                      render={({ field }: { field: any }) => (
                        <TextField
                          {...field}
                          multiline
                          InputProps={{ inputProps: { style: { textAlign: 'left' }, }, style: { borderRadius: 4 }, }} 
                          variant="outlined"
                          rows={2}
                          style={{ margin: "8px 0px" }}
                          placeholder="Enter description"
                          fullWidth
                          onChange={(e) => {
                            field.onChange(e)
                            setRecipeDescription(e.target.value.trim())
                          }}
                          margin="normal"
                          InputLabelProps={{
                            shrink: true,
                          }}
                        />
                      )}
                      name="Description"
                      control={control}
                      rules={{
                        maxLength: 1000
                      }}
                    />
                    <div className="error-wrap">
                      <p className="error-wrap__message">
                        {recipeDescription.length > 1000 && <span>Maximum 1000 characters are allowed.</span>}
                      </p>
                    </div>
                  </Grid>
                </Grid>
              </div>
            </div>
            <div className="recipe-dialog__footer">
              <Button
                data-testid={'create-recipe-clse'}
                variant="outlined"
                onClick={handleDialogClose}
                className="btn-secondary"
              >
                Cancel
              </Button>
              <Button
                data-testid={'create-recipe-save'}
                variant="outlined"
                type="submit"
                disabled={isUniqueRecipeName || recipeType?.length == 0 || searchRecipeName?.length == 0 || searchRecipeName?.length > 1000 || recipeDescription?.length > 1000 }
                className="btn-primary"
                style={{height: "36px"}}
              >
                {props?.btnName?.submit}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
