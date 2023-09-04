import React, {
  ReactElement,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import "./FormFeatureTable.scss";
import { Controller } from "react-hook-form";
import { Button, FormControlLabel, Radio, RadioGroup } from "@material-ui/core";
import { InputType } from "../../../../../utils/constants";
import RfiForm from "../RfiForm/RfiForm";
import { formStateContext } from "../../Context/projectContext";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IProps {
  formData: any;
  formcontrol: any;
  isEditDisabled: boolean;
}

function FormFeatureTable({
  formData,
  formcontrol,
  isEditDisabled,
}: IProps): ReactElement {
  const [headerFields, setHeaderFields] = useState<Array<any>>([]);
  const [rowStaticFields, setRowStaticFields] = useState<Array<any>>([]);
  const [rowFields, setRowFields] = useState<Array<any>>([]);
  const { errors, setValue }: any = useContext(formStateContext);

  useEffect(() => {
    if (formData?.metaData?.colData) {
      setHeaderFields(JSON.parse(JSON.stringify(formData?.metaData?.colData)));
    }
    if (formData?.metaData?.rowData) {
      setRowStaticFields(
        JSON.parse(JSON.stringify(formData?.metaData?.rowData))
      );
    }
    if (formData?.tableFields) {
      setRowFields(JSON.parse(JSON.stringify(formData?.tableFields)));
    }
  }, [formData]);

  const clearBooleanValue = (argForm: any) => {
    if (!isEditDisabled) {
      setValue(`${argForm.elementId}-fieldTypeId${argForm.fieldTypeId}`, null);
    }
  };

  const renderCellData = useCallback(() => {
    return rowFields.map((rowItem: any, index: number) => (
      <tr key={`row-${index}`}>
        {formData.metaData?.numbered ? (
          <td className="featureFormTable__table__slnotd">{index + 1}</td>
        ) : (
          ""
        )}
        <td className="featureFormTable__table__cell">
          <div className="rowDiv">{rowStaticFields[index].caption}</div>
        </td>
        {rowItem.map((cellItem: any) => (
          <td
            className="featureFormTable__table__cell"
            key={`table-cell-${cellItem.elementId}`}
          >
            {cellItem.fieldTypeId === InputType.BOOLEAN ? (
              <React.Fragment>
                <div className="rfi-form__form-container__field__impact cellDiv">
                  <div className="cellDiv__inputs">
                    <Controller
                      render={({ field }: { field: any }) => (
                        <RadioGroup
                          aria-label="gender"
                          name="gender1"
                          className="cellDiv__inputs__groups"
                          {...field}
                          value={field.value}
                          onChange={(e) => {
                            field.onChange(e.target.value);
                          }}
                        >
                          <FormControlLabel
                            className="form-radio"
                            disabled={isEditDisabled}
                            value="true"
                            control={<Radio color="default" />}
                            label="Yes"
                          />
                          <FormControlLabel
                            className="form-radio"
                            disabled={isEditDisabled}
                            value="false"
                            control={<Radio color="default" />}
                            label="No"
                          />
                        </RadioGroup>
                      )}
                      name={`${cellItem.elementId}-fieldTypeId${cellItem.fieldTypeId}`}
                      control={formcontrol}
                      rules={{
                        required: cellItem.required ? true : false,
                      }}
                    />
                    {cellItem.fieldTypeId === InputType.BOOLEAN && (
                      <Button
                        className="rfi-form__form-container__field__impact cellDiv__inputs__label"
                        onClick={() => clearBooleanValue(cellItem)}
                      >
                        clear
                      </Button>
                    )}
                  </div>
                </div>
                {(errors[
                  `${cellItem.elementId}-fieldTypeId${cellItem.fieldTypeId}`
                ]?.type === "required" ||
                  errors[
                    `${cellItem.elementId}-comment-fieldTypeId${cellItem.fieldTypeId}`
                  ]?.type === "required") && (
                  <div className="error-wrap">
                    <p className="error-wrap__message">
                      <span>This field is mandatory.</span>
                    </p>
                  </div>
                )}
              </React.Fragment>
            ) : (
              <div className="cellDiv">
                {/* <Controller 
                        render={({ field }:{field:any}) => (
                            <RfiForm 
                                formData={cellItem} 
                                field={field} type={"TABLE"}
                                isEditAllowed={isEditAllowed}/>                          
                        )}
                        name={`${cellItem.elementId}-fieldTypeId${cellItem.fieldTypeId}`}
                        control={formcontrol}
                        rules={{
                            required: cellItem.required ? true : false
                        }}
                    /> */}
                <RfiForm
                  formData={cellItem}
                  control={formcontrol}
                  type={"TABLE"}
                  isEditDisabled={isEditDisabled}
                />
                {errors[
                  `${cellItem.elementId}-fieldTypeId${cellItem.fieldTypeId}`
                ]?.type === "required" && (
                  <div className="error-wrap">
                    <p className="error-wrap__message">
                      <span>This field is mandatory.</span>
                    </p>
                  </div>
                )}
              </div>
            )}
          </td>
        ))}
      </tr>
    ));
  }, [rowFields, isEditDisabled]);

  return (
    <div className="featureFormTable">
      <table className="featureFormTable__table">
        <thead>
          <tr>
            {formData.metaData?.numbered ? (
              <th className="featureFormTable__table__slnoth">Slno</th>
            ) : (
              ""
            )}
            <th className="featureFormTable__table__headcell">
              {formData?.metaData?.index}
            </th>
            {headerFields.map((item: any, index: number) => (
              <th
                className="featureFormTable__table__headcell"
                key={`header-cell-${item.caption}-${index}`}
              >
                {item.caption} {item.required ? " * " : ""}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{renderCellData()}</tbody>
      </table>
    </div>
  );
}

export default React.memo(FormFeatureTable);
