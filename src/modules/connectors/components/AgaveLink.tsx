import { useAgaveLink } from '@agave-api/react-agave-link';
import { Button } from '@mui/material';
import React from 'react';
import { setIsLoading } from 'src/modules/root/context/authentication/action';
import { stateContext } from 'src/modules/root/context/authentication/authContext';
import Notification, {
  AlertTypes,
} from 'src/modules/shared/components/Toaster/Toaster';
import { decodeToken, getExchangeToken } from 'src/services/authservice';
import { getLinkToken, processAccountToken } from '../actions/actions';

export default function AgaveLink(): React.ReactElement {
  const {
    dispatch,
    state: { sourceSystem },
  } = React.useContext(stateContext);
  const [linkToken, setLinkToken] = React.useState<string | undefined>(
    undefined
  );
  const { userId } = decodeToken(getExchangeToken());
  const handleLoader = async (
    cb: (...rest: any[]) => Promise<any>,
    ...rest: any[]
  ): Promise<any> => {
    try {
      dispatch(setIsLoading(true));
      await cb(...rest);
    } finally {
      dispatch(setIsLoading(false));
    }
  };
  const handleLink = async () => {
    const token = await getLinkToken();
    setLinkToken(token);
  };

  const handleFailure = (err?: string) => {
    Notification.sendNotification(err || 'Login aborted', AlertTypes.error);
  };
  const { openLink, isReady } = useAgaveLink({
    referenceId: userId,
    linkToken,
    showSandboxSourceSystems: true,
    showProductionSourceSystems: true,
    onSuccess: (token: string) =>
      handleLoader(processAccountToken, token, dispatch),
    onExit: handleFailure,
    sourceSystem: ['procore', 'bim360'],
  });

  React.useEffect(() => {
    if (linkToken && isReady) openLink();
  }, [isReady, linkToken]);
  const label = sourceSystem ? ` - ${sourceSystem.name}` : '';
  return (
    <Button
      onClick={() => {
        handleLoader(handleLink);
      }}
      variant="outlined"
      data-testid="connectors-agavelink"
      className="btn-primary"
    >
      {`3rd party login${label}`}
    </Button>
  );
}
