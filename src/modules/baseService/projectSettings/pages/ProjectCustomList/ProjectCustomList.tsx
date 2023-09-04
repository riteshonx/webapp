import React, { ReactElement, useContext, useEffect, useState } from "react";
import { match, useRouteMatch } from "react-router-dom";
import { useDebounce } from "../../../../../customhooks/useDebounce";
import { client } from "../../../../../services/graphql";
import { myProjectRole } from "../../../../../utils/role";
import { setIsLoading } from "../../../../root/context/authentication/action";
import { stateContext } from "../../../../root/context/authentication/authContext";
import { LOAD__PROJECT_CONFIGURATION_LIST_VALUES } from "../../../customList/graphql/queries/customList";
import { ConfigurationList } from "../../../customList/models/customList";
import { projectDetailsContext } from "../../../projects/Context/ProjectDetailsContext";
import CustomListTable from "../../components/CustomListTable/CustomListTable";
import ProjectSettingsAction from "../../components/ProjectSettingsAction/ProjectSettingsAction";
import ProjectSettingsHeader from "../../components/ProjectSettingsHeader/ProjectSettingsHeader";
import "./ProjectCustomList.scss";
import EditCustomList from "../../components/EditCustomList";
export const header = "Custom List";

export const placeholder = "Search by list name";

export const noPermissionMessage =
  "You don't have permission to view this page";

export interface Params {
  projectId: string;
}

export default function ProjectCustomList(): ReactElement {
  const [searchText, setsearchText] = useState("");
  const debounceName = useDebounce(searchText, 1000);
  const { dispatch, state }: any = useContext(stateContext);
  const [customLists, setCustomLists] = useState<Array<any>>([]);
  const { projectDetailsState }: any = useContext(projectDetailsContext);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editId, setEditId] = useState(null)
  const [listName, setListName] = useState<string>("")
  const pathMatch:match<Params>= useRouteMatch();

  useEffect(() => {
      fetchCustomListsData();
  }, [
    debounceName
  ]);

  const fetchCustomListsData = async () => {
    try {
      dispatch(setIsLoading(true));
      const response: any = await client.query({
        query: LOAD__PROJECT_CONFIGURATION_LIST_VALUES,
        variables: {
          name: `%${debounceName}%`,
          projectId: Number(pathMatch.params.projectId)
        },
        fetchPolicy: "network-only",
        context: {
          role: myProjectRole.viewMyProjects,
        },
      });
      if (response.data.configurationLists.length > 0) {
        const targetList: Array<ConfigurationList> = [];
        response.data.configurationLists.forEach((item: any) => {
          const count= item.projectConfigAssociations.length>0?item.projectConfigAssociations.length:item.configurationValues.length;
          const configItem = {
            id: item.id,
            name: item.name,
            configurationValues: count,
            createdAt: item?.createdAt || "",
            updatedAt: item?.updatedAt || "",
          };
          targetList.push(configItem);
        });
        setCustomLists(targetList);
      } else {
        setCustomLists([]);
      }
      dispatch(setIsLoading(false));
    } catch (error: any) {
      console.log(error.message);
      dispatch(setIsLoading(false));
    }
  };

  const searchTextValue = (value: string) => {
    setsearchText(value);
  };

  const editCustomRow = (row: any) => {
    setListName(row.listName)
    setEditId(row.id)
    setShowEditDialog(true);
  };

  const handleClose = (argValue: boolean) => {
    if(argValue){
      fetchCustomListsData();
    }
    setShowEditDialog(false)
  }

  return (
    <div className="project-customlist">
      <ProjectSettingsHeader header={header} />
 
      {showEditDialog ? (
        <EditCustomList id={editId} handleClose={handleClose} listName = {listName}/>
      ) : projectDetailsState?.projectPermission
          ?.canViewProjectCustomListAssociation ? (
        <>
          <ProjectSettingsAction
            searchText={searchTextValue}
            placeholder={placeholder}
          />
          <CustomListTable
            editCustomRow={(row: any) => editCustomRow(row)}
            customListsData={customLists}
          />
        </>
      ) : !state.isLoading ? (
        <div className="project-customlist__nopermission">
          You don't have permission to view custom list
        </div>
      ) : (
        ""
      )}
    </div>
  );
}
