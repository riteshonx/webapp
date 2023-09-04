import Dialog from "@material-ui/core/Dialog";
import { Box, Button } from "@material-ui/core";

const ErrorDialog = ({ isOpen, values }: any) => {
  return (
    <Dialog open={isOpen}>
      <Box padding="3rem">
        <Box color="red">
          <h3> Something went wrong</h3>
        </Box>
        <Box marginTop="2rem" marginBottom="2rem">
          <p>Invites were not sent to the following recipients: </p>
          {values.map((value: any) => (
            <h5 key={value}>{value}</h5>
          ))}
        </Box>
        <Button variant="outlined" onClick={() => window.location.reload()}>
          Okay
        </Button>
      </Box>
    </Dialog>
  );
};

export default ErrorDialog;
