import React from "react";
import Skeleton from "@material-ui/lab/Skeleton";
import { Button, Grid, InputLabel, Typography } from "@material-ui/core";
import DynamicTemplateForm from "./LandingPage/DynamicTemplateForm";
import AddIcon from "@material-ui/icons/Add";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    heading: {
      position: "sticky",
      top: 0,
      padding: "16px",
      fontWeight: "bold",
      backgroundColor: "white",
      fontSize: "2rem",
      borderBottom: "1px solid #0000001f",
      zIndex: 100,
    },
    gridContainer: {
      marginTop: "2rem",
      paddingLeft: "2rem",
      paddingRight: "2rem",
    },
  })
);

interface TemplateFormListProps {
  listOfItems: Array<any>;
  selectedBuildingId?: number;
  indicators: any;
}

const TemplateFormList: React.FC<TemplateFormListProps> = ({
  listOfItems,
  indicators,
  selectedBuildingId,
}) => {
  const classes = useStyles();

  return (
    <div>
      <Typography classes={{ root: classes.heading }}>
        Id: {selectedBuildingId ? selectedBuildingId : "..."}
      </Typography>
      <Grid
        container
        className="rfi-form__form-container"
        classes={{ root: classes.gridContainer }}
      >
        {indicators.isLoading
          ? Array(8)
              .fill("")
              .map(() => (
                <Grid item xs={12} sm={3}>
                  <Skeleton variant="text" width="80%" height="100px" />
                </Grid>
              ))
          : listOfItems.map((formData: any) => {
              return (
                <Grid
                  key={formData.elementId}
                  className="rfi-form__form-container__field"
                  item
                  sm={formData.width === 50 ? 3 : 12}
                  xs={12}
                >
                  <InputLabel required={formData.required}>
                    {formData.caption}{" "}
                  </InputLabel>
                  <DynamicTemplateForm
                    formData={formData}
                    isEditAllowed={false}
                    type={"FORM"}
                  />
                </Grid>
              );
            })}
        <Grid item sm={3} xs={12} style={{ alignSelf: "center" }}>
          <Button startIcon={<AddIcon />}>Add Item</Button>
        </Grid>
      </Grid>
    </div>
  );
};

export default TemplateFormList;
