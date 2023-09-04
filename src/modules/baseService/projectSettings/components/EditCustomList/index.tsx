  import React, { ReactElement, useContext, useEffect, useState } from "react";
  import {
    FETCH_CUSTOM_LIST_DETAIL,
    MUTATION_CUSTOM_LIST,
    DELETE_CUSTOM_LIST,
  } from "../../graphql/queries/projectSettings";
  import { client } from "../../../../../services/graphql";
  import { projectDetailsContext } from "../../../projects/Context/ProjectDetailsContext";
  import Checkbox, { CheckboxProps } from "@material-ui/core/Checkbox";
  import Button from "@material-ui/core/Button";

  import { withStyles } from "@material-ui/core/styles";
  import { setListOfConfigValues } from "../../../customList/context/createUpdateList/customListActiions";
  import "./EditCustomList.scss";

  const GreenCheckbox = withStyles({
    root: {
      color: `#000`,
      "&$checked": {
        color: `#000`,
      },
    },
    checked: {},
  })((props: CheckboxProps) => <Checkbox color="default" {...props} />);

  function useForceUpdate() {
    const [value, setValue] = useState(0); // integer state
    return () => setValue((value) => value + 1); // update the state to force render
  }

  function editCustomList(props: any): ReactElement {
    const { projectDetailsState, projectDispatch }: any = useContext(
      projectDetailsContext
    );
    const [listState, setListState] = useState<Array<any>>([]);
    const [listStateSelected, setListStateSelected] = useState<Array<any>>([]);
    const [id, setId] = useState();
    const [structure, setStructure] = useState<Array<any>>([]);

    const [configValues, setProjectConfigValues] = useState<Array<any>>([]);
    const [addedIds, setAdded] = useState<Array<any>>([]);
    const [deletedIds, setDeleted] = useState<Array<any>>([]);
    const [isPartOf, setIsPartOf] = useState<Array<any>>([]);

    useEffect(() => {
      if (projectDetailsState?.projectToken) {
        fetchCustomList();
      }
    }, [projectDetailsState?.projectToken]);

    const fetchCustomList = async () => {
      try {
        const customList = await client.query({
          query: FETCH_CUSTOM_LIST_DETAIL,
          variables: {
            id: props.id,
          },
          fetchPolicy: "network-only",
          context: {
            role: "viewProjectCustomListAssociation",
            token: projectDetailsState?.projectToken,
          },
        });
        //   const customListResponse: any = [];
        const listArray: any = [];
        if (customList.data.configurationLists) {
          const response =
            customList.data.configurationLists[0].configurationValues;
          const configValuesTemp: any = [];
          for (
            let i = 0;
            i <
            customList.data.configurationLists[0].projectConfigAssociations
              .length;
            i++
          ) {
            configValuesTemp.push(
              customList.data.configurationLists[0].projectConfigAssociations[i]
                .configValueId
            );
          }

          // new
          const master: any = [];
          const child: any = [];

          for (let i = 0; i < response.length; i++) {
            if (response[i].parentId === null) {
              master.push({ ...response[i] });
            } else {
              child.push({ ...response[i] });
            }
          }

          const sum = master;

          for (let i = 0; i < master.length; i++) {
            for (let j = 0; j < child.length; j++) {
              if (master[i].id === child[j].parentId) {
                if (!("child" in sum[i]) === false) {
                  // child exists
                  sum[i].child.push({
                    ...child[j],
                  });
                } else {
                  //child doesn't exist
                  sum.splice(i, 1, {
                    ...sum[i],
                    child: [
                      {
                        ...child[j],
                      },
                    ],
                  });
                }
              }
            }
          }
          const structureArray = organise(sum, child);
          setStructure(structureArray);
          setProjectConfigValues(configValuesTemp);
          setId(customList.data.configurationLists[0].id);
        }
      } catch (error: any) {
        console.log(error.message);
      }
    };

    const organise = (sum: any, child: any) => {
      const temp = sum;
      for (let i = 0; i < temp.length; i++) {
        if ("child" in temp[i]) {
          child.map((childItem: any, childIndex: number) => {
            temp[i].child.map((item: any, index: number) => {
              if (childItem.parentId === item.id) {
                if (!("child" in item) === false) {
                  temp[i].child[index].child.push({
                    ...childItem,
                  });
                } else {
                  temp[i].child.splice(index, 1, {
                    ...item,
                    child: [
                      {
                        ...childItem,
                      },
                    ],
                  });
                }
              }
            });
          });
        }
      }

      return temp;
    };

    useEffect(() => {
      const temp = structure;
      const isPartOfTemp = isPartOf;
      const configTemp = configValues;

      // let's fix this
      for (let i = 0; i < temp.length; i++) {
        if (configValues.indexOf(temp[i].id) > -1) {
          temp[i].selected = true;

          if ("child" in temp[i]) {
            for (let j = 0; j < temp[i].child.length; j++) {
              temp[i].child[j].selected = true;
              if ("child" in temp[i].child[j]) {
                for (let k = 0; k < temp[i].child[j].child.length; k++) {
                  temp[i].child[j].child[k].selected = true;
                  temp[i].child[j].child[k].isPartOf = true;
                }
              }
            }
          } else {
            temp[i].selected = true;
            temp[i].isPartOf = true;
          }
        } else if (configValues.indexOf(temp[i].id) == -1) {
          // temp[i].selected = true
          if ("child" in temp[i]) {
            for (let j = 0; j < temp[i].child.length; j++) {
              if (configValues.indexOf(temp[i].child[j].id) > -1) {
                temp[i].selected = true;
                temp[i].child[j].selected = true;
                temp[i].child[j].isPartOf = true;
              } else if (configValues.indexOf(temp[i].child[j].id) == -1) {
                if ("child" in temp[i].child[j]) {
                  for (let k = 0; k < temp[i].child[j].child.length; k++) {
                    if (configValues.indexOf(temp[i].child[j].child[k].id) > -1) {
                      temp[i].selected = true;
                      temp[i].child[j].selected = true;
                      temp[i].child[j].child[k].selected = true;
                      temp[i].child[j].child[k].isPartOf = true;
                    }
                  }
                }
              }
            }
          }
        }
      }


      setStructure(temp);
      setIsPartOf(isPartOfTemp);
      forceUpdate();
    }, [configValues, structure]);

    const forceUpdate = useForceUpdate();

    const handleSelected = async (id: any) => {
      const configTemp = configValues;
      const deletedTemp = deletedIds;
      const addedValues = addedIds

      const temp = structure;
      const isPartOfTemp = isPartOf;
      // loop for master level
      for (let i = 0; i < temp.length; i++) {
        if (temp[i].id == id && !temp[i].selected && !temp[i].isPartOf) {
          // noto selected not part of meaning could have a child
          if ("child" in temp[i]) {
            for (let j = 0; j < temp[i].child.length; j++) {
              if ("child" in temp[i].child[j]) {
                for (let k = 0; k < temp[i].child[j].child.length; k++) {
                  temp[i].selected = true;
                  temp[i].child[j].selected = true;
                  temp[i].child[j].child[k].selected = true;
                  temp[i].child[j].child[k].isPartOf = true;
                  if(configTemp.indexOf(temp[i].child[j].child[k].id) == -1){
                    configTemp.push(temp[i].child[j].child[k].id);
                  addedValues.push(temp[i].child[j].child[k].id)

                  }
                //   configTemp.push(temp[i].child[j].child[k].id);
                }
              } else {
                temp[i].selected = true;
                temp[i].child[j].selected = true;
                temp[i].child[j].isPartOf = true;
                if(configTemp.indexOf(temp[i].child[j].id) == -1){
                  configTemp.push(temp[i].child[j].id);
                  addedValues.push(temp[i].child[j].id)

                }
                // configTemp.push(temp[i].child[j].id);
              }
            }
          } else {
            temp[i].selected = true;
            temp[i].isPartOf = true;
            if(configTemp.indexOf(temp[i].id) == -1){
              configTemp.push(temp[i].id);
              addedValues.push(temp[i].id)

            }
            // configTemp.push(temp[i].id);
          }
        } else if (temp[i].id == id && temp[i].selected && temp[i].isPartOf) {
          delete temp[i].selected;
          delete temp[i].isPartOf;
          configTemp.splice(configTemp.indexOf(temp[i].id), 1);
          if (deletedTemp.indexOf(temp[i].id) == -1) {
            deletedTemp.push(temp[i].id);
          }
        } else if (temp[i].id == id && temp[i].selected && !temp[i].isPartOf) {
          if ("child" in temp[i]) {
            for (let j = 0; j < temp[i].child.length; j++) {
              if (temp[i].child[j].isPartOf) {
                delete temp[i].child[j].isPartOf;
                delete temp[i].child[j].selected;
                delete temp[i].selected;
                configTemp.splice(configTemp.indexOf(temp[i].child[j].id), 1);
                if (deletedTemp.indexOf(temp[i].child[j].id) == -1) {
                  deletedTemp.push(temp[i].child[j].id);
                }
              } else if (
                temp[i].child[j].selected &&
                !temp[i].child[j].isPartOf
              ) {
                if ("child" in temp[i].child[j]) {
                  for (let k = 0; k < temp[i].child[j].child.length; k++) {
                    delete temp[i].child[j].child[k].isPartOf;
                    delete temp[i].child[j].child[k].selected;
                    delete temp[i].child[j].selected;
                    delete temp[i].selected;
                    configTemp.splice(
                      configTemp.indexOf(temp[i].child[j].child[k].id),
                      1
                    );
                    if (deletedTemp.indexOf(temp[i].child[j].child[k].id) == -1) {
                      deletedTemp.push(temp[i].child[j].child[k].id);
                    }
                  }
                }
              }
            }
          }
        }
      }

      // loop for first child level
      for (let i = 0; i < temp.length; i++) {
        if ("child" in temp[i]) {
          for (let j = 0; j < temp[i].child.length; j++) {
            if (
              temp[i].child[j].id == id &&
              temp[i].child[j].selected &&
              temp[i].child[j].isPartOf
            ) {
              delete temp[i].child[j].selected;
              delete temp[i].child[j].isPartOf;
              configTemp.splice(configTemp.indexOf(temp[i].child[j].id), 1);
              const selectedLength = getFirstChildSelectedLength(temp[i].child);
              if (selectedLength) {
                delete temp[i].selected;
              }
              if (deletedTemp.indexOf(temp[i].child[j].id) == -1) {
                deletedTemp.push(temp[i].child[j].id);
              }
            } else if (
              temp[i].child[j].id == id &&
              temp[i].child[j].selected &&
              !temp[i].child[j].isPartOf
            ) {
              if ("child" in temp[i].child[j]) {
                for (let k = 0; k < temp[i].child[j].child.length; k++) {
                  delete temp[i].child[j].child[k].isPartOf;
                  delete temp[i].child[j].child[k].selected;
                  delete temp[i].child[j].selected;
                  configTemp.splice(
                    configTemp.indexOf(temp[i].child[j].child[k].id),
                    1
                  );
                  const selectedLength = getFirstChildSelectedLength(
                    temp[i].child
                  );
                  if (deletedTemp.indexOf(temp[i].child[j].child[k].id) == -1) {
                    deletedTemp.push(temp[i].child[j].child[k].id);
                  }
                  if (selectedLength) {
                    delete temp[i].selected;
                  }
                }
              }
            } else if (
              temp[i].child[j].id == id &&
              !temp[i].child[j].selected &&
              !temp[i].child[j].isPartOf
            ) {
              if ("child" in temp[i].child[j]) {
                for (let k = 0; k < temp[i].child[j].child.length; k++) {
                  temp[i].child[j].child[k].isPartOf = true;
                  temp[i].child[j].child[k].selected = true;
                  temp[i].child[j].selected = true;
                  temp[i].selected = true;
                  if(configTemp.indexOf(temp[i].child[j].child[k].id) == -1){
                        configTemp.push(temp[i].child[j].child[k].id);
                  addedValues.push(temp[i].child[j].child[k].id)

                    }
                  // configTemp.push(temp[i].child[j].child[k].id);
                }
              } else {
                temp[i].selected = true;
                temp[i].child[j].selected = true;
                temp[i].child[j].isPartOf = true;

                if(configTemp.indexOf(temp[i].child[j].id) == -1){
                  configTemp.push(temp[i].child[j].id);
                  addedValues.push(temp[i].child[j].id)
            }
                // configTemp.push(temp[i].child[j].id);
              }
            }
          }
        }
      }

      // loop for third child level

      for (let i = 0; i < temp.length; i++) {
        if ("child" in temp[i]) {
          for (let j = 0; j < temp[i].child.length; j++) {
            if ("child" in temp[i].child[j]) {
              for (let k = 0; k < temp[i].child[j].child.length; k++) {
                if (
                  temp[i].child[j].child[k].id === id &&
                  temp[i].child[j].child[k].selected &&
                  temp[i].child[j].child[k].isPartOf
                ) {
                  delete temp[i].child[j].child[k].selected;
                  delete temp[i].child[j].child[k].isPartOf;
                  const getLastChildSelectedLength = getFirstChildSelectedLength(
                    temp[i].child[j].child
                  );
                  if (getLastChildSelectedLength) {
                    delete temp[i].child[j].selected;
                  }

                  const getChildSelectedLength = getFirstChildSelectedLength(
                    temp[i].child
                  );

                  if (getChildSelectedLength) {
                    delete temp[i].selected;
                  }
                  configTemp.splice(
                    configTemp.indexOf(temp[i].child[j].child[k].id),
                    1
                  );
                  if (deletedTemp.indexOf(temp[i].child[j].child[k].id) == -1) {
                    deletedTemp.push(temp[i].child[j].child[k].id);
                  }
                } else if (
                  temp[i].child[j].child[k].id === id &&
                  !temp[i].child[j].child[k].selected &&
                  !temp[i].child[j].child[k].isPartOf
                ) {
                  temp[i].child[j].child[k].selected = true;
                  temp[i].child[j].child[k].isPartOf = true;
                  temp[i].child[j].selected = true;
                  temp[i].selected = true;

                  if(configTemp.indexOf(temp[i].child[j].child[k].id) == -1){
                    configTemp.push(temp[i].child[j].child[k].id);
                    addedValues.push(temp[i].child[j].child[k].id)
              }
                  
                  // configTemp.push(temp[i].child[j].child[k].id);
                }
              }
            }
          }
        }
      }

      setAdded(addedValues)



      setIsPartOf(isPartOfTemp);

      setStructure(temp);
      setDeleted(deletedTemp);
      setProjectConfigValues(configTemp);
      forceUpdate();
    };

    const getFirstChildSelectedLength = (arr: any) => {
      let sum = 0;
      for (let i = 0; i < arr.length; i++) {
        if (!arr[i].selected) {
          sum = sum + 1;
        }
      }
      if (sum == arr.length) {
        return true;
      } else {
        return false;
      }
    };
    const updateProjectDetail = async () => {
      try {
        const promiseList: any = [];

        addedIds.map((item: any, index: number) => {
          promiseList.push(
            client.mutate({
              mutation: MUTATION_CUSTOM_LIST,
              variables: {
                configListId: id,
                configValueId: item,
              },
              context: {
                role: "createProjectCustomListAssociation",
                token: projectDetailsState?.projectToken,
              },
            })
          );
        })
        deletedIds.map((item: any, index: number) => {
          promiseList.push(
            client.mutate({
              mutation: DELETE_CUSTOM_LIST,
              variables: {
                configListId: id,
                configValueId: item,
              },
              context: {
                role: "deleteProjectCustomListAssociation",
                token: projectDetailsState?.projectToken,
              },
            })
          );
        });

        if (promiseList.length > 0) {
          await Promise.all(promiseList);
          props.handleClose(true);

        }
      } catch (err: any) {
        console.log(err);
        props.handleClose(true);
      }
    };

    const renderUiArray = (structure: any, flag: number) => {
      const count = flag + 1;
      return (
        <>
          {structure &&
            structure.length !== 0 &&
            structure.map((item: any, index: number) => (
              <div>
                {renderUi(item)}
                <div style={{ marginLeft: 100 }}>
                  {"child" in item && renderUiArray(item.child, flag)}
                </div>
              </div>
            ))}
        </>
      );
    };
    const renderUi = (structure: any) => {
      return (
        <div className="EditCustomList__renderUi">
          <div style={{ paddingLeft: structure.parentId === null ? 0 : 50 }}>
            <GreenCheckbox
              onChange={() => handleSelected(structure.id)}
              checked={structure?.selected ? true : false}
              disabled = { !projectDetailsState?.projectUpdatePermission?.canCreateProjectCustomListAssociation &&
                   !projectDetailsState?.projectUpdatePermission?.canDeleteProjectCustomListAssociation }
            />
          </div>
          <div>{structure.nodeName}</div>
        </div>
      );
    };

    return (
      (projectDetailsState?.projectPermission?.canViewProjectCustomListAssociation) ? (<div className="EditCustomList">
        <div className="EditCustomList__header">{props.listName} </div>
        {structure.length !== 0 &&
          structure.map(
            (struct: any, index: number) =>
              struct.parentId === null && (
                <>
                  {renderUi(struct)}
                    {"child" in struct && renderUiArray(struct.child, 0)}{" "}
                </>
              )
          )}
        <div className="EditCustomList__footer">
          <Button
            onClick={() => props.handleClose(false)}
            className="btn-secondary EditCustomList__button_cancel"
            data-testid={"cancel-create"}
            variant="outlined"
          >
            Cancel
          </Button>
          {(projectDetailsState?.projectUpdatePermission?.canCreateProjectCustomListAssociation ||
             projectDetailsState?.projectUpdatePermission?.canDeleteProjectCustomListAssociation ) &&
          <Button
      
            className="btn-primary EditCustomList__button_update"
            disabled = {!addedIds.length && !deletedIds.length}
            onClick={() => updateProjectDetail()}
            variant="outlined"
          >
            UPDATE
          </Button>}
        </div>
      </div>): (
        <div className="customList__no-permission">
            You don't have permission to view custom list
        </div>
      ) 
    );
  }
  export default editCustomList;
