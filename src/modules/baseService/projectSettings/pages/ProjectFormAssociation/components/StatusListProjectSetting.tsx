import { FC, useState, useEffect } from "react";
import { IconButton, Box } from "@material-ui/core";
import BackArrowIcon from "@material-ui/icons/ArrowBackIos";
import { useLazyQuery } from "@apollo/client";
import {
  FETCH_STATUS_LIST,
  FETCH_STATUS_LIST_PROJECT_SETTING,
} from "src/modules/baseService/forms/grqphql/queries/statusList";
import CircularProgress from "@material-ui/core/CircularProgress";
import { makeStyles, createStyles } from "@material-ui/styles";
import StatusListOptionsForm from "./StatusListOptionsForm";
import { useParams } from "react-router-dom";
import { canViewTemplates } from "src/modules/baseService/forms/utils/permission";

const useStyles = makeStyles(() =>
  createStyles({
    backButton: {
      padding: "4px",
      marginRight: "1rem",
    },
    actionButton: {
      textTransform: "none",
      width: "80px",
    },
    updateButton: {
      background: "#304a50",
      color: "#fff",
      marginLeft: "3rem",
      "&:hover": {
        background: "#07676e",
      },
    },
    cancelButton: {
      color: "#304a50",
    },
  })
);

const ErrorBox = ({ children }: { children: string }) => (
  <Box color="#e20000" bgcolor="#ffd7d7" borderRadius="6px" padding="1.2rem">
    {children}
  </Box>
);

const InfoBox = ({ children }: { children: string }) => (
  <Box color="#2b464c" bgcolor="#ececec" borderRadius="6px" padding="1.2rem">
    {children}
  </Box>
);

interface StatusListProjectSettingType {
  formItem: any;
  onBackClick: () => void;
}

export type StatusListOptionType = {
  id: number;
  openStatus: boolean;
  status: string;
  disableSelect: boolean;
  selected: boolean;
};

const StatusListProjectSetting: FC<StatusListProjectSettingType> = ({
  onBackClick,
  formItem,
}) => {
  const params: any = useParams();
  const projectId = Number(params.projectId);
  const classes = useStyles();
  const [statusListOptions, setStatusListOptions] = useState([]);
  //fetch options
  const [
    loadListOptions,
    { loading: loadingOptions, data: listOptions, error },
  ] = useLazyQuery(FETCH_STATUS_LIST, {
    variables: { featureId: formItem.featureId },
    fetchPolicy: "network-only",
    context: { role: "viewFormTemplate" },
  });
  //fetch values
  const [loadListValues, { data: listValues, loading: loadingValues }] =
    useLazyQuery(FETCH_STATUS_LIST_PROJECT_SETTING, {
      variables: { featureId: formItem.featureId, projectId },
      fetchPolicy: "network-only",
      context: { role: "viewFormTemplate" },
    });

  useEffect(() => {
    if (canViewTemplates) {
      loadListOptions();
      loadListValues();
    }
  }, []);

  useEffect(() => {
    if (!loadingOptions && listOptions && !loadingValues && listValues) {
      const { formStatus } = listOptions;
      const { projectFormStatusAssociation } = listValues;
      const enrichedOptions = formStatus.map((option: any) => {
        const matchedValue = projectFormStatusAssociation.find(
          (value: any) => value.formStatusId == option.id
        );
        let selected = false;
        if (matchedValue) {
          selected = true;
        }
        const enrichedOption: StatusListOptionType = {
          id: option.id,
          openStatus: option.openStatus,
          status: option.status,
          disableSelect: option.projectFeature ? false : true,
          selected,
        };
        return enrichedOption;
      });
      setStatusListOptions(enrichedOptions);
    }
  }, [listOptions, listValues]);

  return (
    <Box padding="1rem" height="100%">
      <Box display="flex" alignItems="center" paddingBottom="1.5rem">
        <IconButton
          onClick={onBackClick}
          classes={{ root: classes.backButton }}
        >
          <BackArrowIcon />
        </IconButton>
        <h2>Status List</h2>
        <p style={{ marginLeft: "2rem", fontWeight: 500 }}>
          &gt; {formItem.formName}
        </p>
      </Box>
      {statusListOptions?.length ? (
        <StatusListOptionsForm
          featureId={formItem.featureId}
          projectId={projectId}
          onCancelClick={onBackClick}
          statusListOptions={statusListOptions}
          onPostSubmit={() => {
            setStatusListOptions([]); // so that we can remount the form
            loadListOptions();
            loadListValues();
          }}
        />
      ) : (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexDirection="column"
          height="calc(100% - 48px)"
        >
          {error ? (
            <ErrorBox>Uh! Something went wrong</ErrorBox>
          ) : loadingOptions || loadingValues ? (
            <>
              <CircularProgress style={{ color: "#000" }} />
              <p style={{ marginTop: "1rem" }}>Please wait...</p>
            </>
          ) : !canViewTemplates ? (
            <InfoBox>You do not have the permission to view this page</InfoBox>
          ) : (
            !statusListOptions.length && <InfoBox>No data found</InfoBox>
          )}
        </Box>
      )}
    </Box>
  );
};

export default StatusListProjectSetting;
