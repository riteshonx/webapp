import { Data, headCells, Order } from "../utils";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";

interface EnhancedTableProps {
  classes: ReturnType<any>;
}

export default function EnhancedTableHead(props: EnhancedTableProps) {
  const { classes } = props;

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            width={
              headCell.id === "email" || headCell.id === "projects"
                ? "15%"
                : "10%"
            }
            key={headCell.id}
          >
            <h4>
              {headCell.label}
              {headCell.required && `*`}
            </h4>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}
