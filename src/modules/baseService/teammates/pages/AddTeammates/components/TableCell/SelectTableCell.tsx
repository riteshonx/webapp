import TableCell from "@material-ui/core/TableCell";
import MultiSelect from "../MultiSelect";
import SingleSelect from "../SingleSelect";

const SelectTableCell = ({
  name,
  label,
  options = [],
  readOnly = false,
  control,
  multiple = false,
  error,
  handleApplyToAll,
  index,
  noDataFoundMessage,
  showApplyToAll,
}: any) => {
  return (
    <TableCell>
      {multiple ? (
        <MultiSelect
          name={name}
          control={control}
          label={label}
          readOnly={readOnly}
          options={options}
          error={error}
          handleApplyToAll={handleApplyToAll}
          noDataFoundMessage={noDataFoundMessage}
          index={index}
          showApplyToAll={showApplyToAll}
        />
      ) : (
        <SingleSelect
          name={name}
          control={control}
          label={label}
          readOnly={readOnly}
          options={options}
          noDataFoundMessage={noDataFoundMessage}
          error={error}
        />
      )}
    </TableCell>
  );
};

export default SelectTableCell;
