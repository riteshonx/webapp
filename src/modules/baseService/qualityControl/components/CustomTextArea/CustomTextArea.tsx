import { TextField } from "@material-ui/core";
import React, { ReactElement, useContext } from "react";
import { Controller } from "react-hook-form";
import { formStateContext } from "../../context/context";

interface Props {
  formData: any;
  control: any;
  isSpecification: boolean;
  isEditAllowed: boolean;
}

function CustomTextArea({
  formData,
  control,
  isEditAllowed,
}: Props): ReactElement {
  const { setIsDirty, setValue }: any = useContext(formStateContext);

  const handleBlur = (e: any) => {
    if (!e.target.value.trim()) {
      setValue(formData.elementId, "");
    }
  };

  return (
    <Controller
      render={({ field }) => (
        <TextField
          id={`text-area-${formData.elementId}`}
          type="text"
          {...field}
          fullWidth
          autoComplete="off"
          variant="outlined"
          multiline
          rows={3}
          rowsMax={3}
          onChange={(e) => {
            field.onChange(e), setIsDirty(true);
          }}
          disabled={isEditAllowed}
          placeholder="Text area"
          onBlur={(e) => handleBlur(e)}
        />
      )}
      name={formData.elementId}
      control={control}
      rules={{
        required: formData.required ? true : false,
      }}
    />
  );
}

export default React.memo(CustomTextArea);
