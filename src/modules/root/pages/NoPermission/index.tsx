import NoPermission from "src/modules/shared/components/NoPermission/NoPermission";
import { useHistory } from "react-router-dom";
import Box from "@material-ui/core/Box";

const NoPermissionPage = () => {
  const history = useHistory();
  return (
    <Box padding="2rem">
      <NoPermission
        noPermissionMessage="Uh ho! You do not have the necessary permission to complete this operation."
        header="Forms"
        navigateBack={() => history.goBack()}
      />
    </Box>
  );
};

export default NoPermissionPage;
