import React, { useState } from "react";
import Box from "@material-ui/core/Box";
import { Button } from "@material-ui/core";
import SlotBox from "../../components/LandingPage/SlotBox";
import BuildingList from "../../components/BuildingList";
import TemplateFormList from "../../components/TemplateFormList";
import { useForm, SubmitHandler } from "react-hook-form";
import "./CreateRfi.scss";
import { formStateContext } from "../../context/context";
import { fetchInitState } from "src/modules/shared/reducer/fetchDataReducer";

const defaultValues = {};
interface QualityControlLandingViewProps {
  templateWithDataIfAny: typeof fetchInitState;
  handleSelectedBuilding: (e: any) => void;
  selectedBuildingId?: number;
  buildingIds: Array<any>;
  sideContentIndicators: any;
  mainContentIndicators: any;
}

const QualityControlLandingView: React.FC<QualityControlLandingViewProps> = ({
  templateWithDataIfAny,
  buildingIds,
  handleSelectedBuilding,
  selectedBuildingId,
  sideContentIndicators,
  mainContentIndicators,
}) => {
  const {
    handleSubmit,
    control,
    getValues,
    setValue,
    setError,
    formState: { errors },
  } = useForm<any>({
    defaultValues,
  });

  const [isDirty, setIsDirty] = useState(false);

  console.log("qualityControlTemplate is", templateWithDataIfAny.data);

  const onSubmit: SubmitHandler<any> = (value: any) => {
    console.log("Submitted values are", value);
  };

  return (
    <Box padding="2rem" width="100%">
      <Box display="flex" justifyContent="space-between">
        <h1>Quality Control</h1>
        <Box>
          <Button variant="outlined">Cancel</Button>
          <Button
            style={{
              marginLeft: "1.5rem",
              background: "var(--onx-btn-primary)",
              color: "#fff",
            }}
            onClick={() => {
              handleSubmit(onSubmit)();
            }}
            variant="contained"
          >
            Submit
          </Button>
        </Box>
      </Box>
      <Box marginTop="2rem" height="78vh">
        <SlotBox>
          <SlotBox.Slot name="left">
            <BuildingList
              listOfItems={buildingIds}
              handleSelectedItem={handleSelectedBuilding}
              selectedItemId={selectedBuildingId}
              indicators={sideContentIndicators}
            />
          </SlotBox.Slot>
          <SlotBox.Slot name="right">
            <formStateContext.Provider
              value={{
                errors,
                setValue,
                setError,
                getValues,
                setIsDirty,
                control,
              }}
            >
              <TemplateFormList
                listOfItems={templateWithDataIfAny.data}
                indicators={mainContentIndicators}
                selectedBuildingId={selectedBuildingId}
              />
            </formStateContext.Provider>
          </SlotBox.Slot>
        </SlotBox>
      </Box>
    </Box>
  );
};

export default QualityControlLandingView;
