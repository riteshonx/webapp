import { Button } from "@material-ui/core";
import Popover from "@material-ui/core/Popover";
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import { FormTypeCheckbox } from "./formTypeCheckbox";
import { FormTypeGroup } from "src/modules/visualize/VisualizeView/components/Forms/groupingWhiteList/FormTypeGroup";
import { FormType } from "src/modules/visualize/VisualizeView/models/formType";
import { SelectableFormTypeGroup } from "src/modules/visualize/VisualizeView/components/Forms/FormTypeSelector/selectableFormTypeGroup";
import { useDataMode } from "src/modules/visualize/VisualizeView/utils/DataMode";
import { useAnalytics } from "src/modules/visualize/VisualizeView/utils/analytics";
import { useProjectId } from "src/modules/visualize/VisualizeView/hooks/useProjectId";
import { SelectableFormType } from "src/modules/visualize/VisualizeView/components/Forms/FormTypeSelector/selectableFormTypes";
import { stateContext } from "src/modules/root/context/authentication/authContext";
import { IssueTypes } from "src/modules/visualize/VisualizeView/components/Forms/useIssueTypes";

interface FormGroupTypeSelector {
  values: FormTypeSelector[];
  selected: boolean;
  selectedCount: number;
}

interface FormTypeSelector {
  title: string;
  selected: boolean;
  parentId: string;
}

interface FormAllTypeSelectorProps {
  assignedToTypes: Map<string, string[]>;
  setSelectedAssigneToFormTypes: (selcetedAssigneToFormTypes: string[]) => void;
  formTypeGroups?: FormTypeGroup[];
  setSelectedFormTypes: (selcetedFormTypes: FormType[]) => void;
  issueTypes: IssueTypes[];
  setSelectedIssueTypes: (selectedIssueTypes: string[]) => void;
}

export const FormAllTypeSelector = ({
  assignedToTypes,
  setSelectedAssigneToFormTypes,
  formTypeGroups,
  setSelectedFormTypes,
  issueTypes,
  setSelectedIssueTypes,
}: FormAllTypeSelectorProps): React.ReactElement => {
  const [popOverAnchor, setPopOverAnchor] = useState<
    HTMLButtonElement | undefined
  >(undefined);
  const [anchorWidth, setAnchorWidth] = useState<number>();
  const [selectedAll, setSelectedAll] = useState(false);
  const [selectedAllIssue, setSelectedAllIssue] = useState(false);
  const [allIssueTypesCount, setAllIssueTypesCount] = useState(0);
  const [selectableIssueTypeGroups, setSelectableIssueTypeGroups] =
    useState<{ [key: string]: FormGroupTypeSelector }>({});
  const [allAssigneeTypesCount, setAllAssigneeTypesCount] = useState(0);
  const [selectableAssigneToFormTypes, setSelectableAssigneToFormTypes] =
    useState<{ [key: string]: FormGroupTypeSelector }>({});
  const [selectableFormTypeGroups, setSelectableFormTypeGroups] = useState<
    SelectableFormTypeGroup[]
  >([]);
  const open = Boolean(popOverAnchor);
  const selectedFormTypesRef = useRef<FormType[]>([]);
  const { dataMode } = useDataMode();
  const { track, timeEvent } = useAnalytics();
  const projectId = useProjectId();
  const { state }: any = useContext(stateContext);

  useEffect(() => {
    if (Boolean(assignedToTypes) && assignedToTypes.size > 0) {
      let totalCount = 0;
      assignedToTypes.forEach((assignees, key: string) => {
        const _assignes: FormTypeSelector[] = assignees.map((assignee) => {
          return { title: assignee, selected: false, parentId: key };
        });
        totalCount += _assignes.length;
        selectableAssigneToFormTypes[key] = {
          selected: false,
          selectedCount: 0,
          values: _assignes,
        };
      });
      setSelectableAssigneToFormTypes(selectableAssigneToFormTypes);
      setAllAssigneeTypesCount(totalCount);
    } else {
      setSelectableAssigneToFormTypes({});
    }
  }, [assignedToTypes]);

  useEffect(() => {
    if (Boolean(formTypeGroups)) {
      const selectableFormTypeGroups = formTypeGroups!.map(
        (formTypeGroup) => new SelectableFormTypeGroup(formTypeGroup, false)
      );
      setSelectableFormTypeGroups(selectableFormTypeGroups);
    } else {
      setSelectableFormTypeGroups([]);
    }
  }, [formTypeGroups]);

  useEffect(() => {
    if (Boolean(issueTypes)) {
      let totalCount = 0;
      issueTypes.forEach((issueType) => {
        const subTypes: FormTypeSelector[] = issueType.subType.map((assignee) => {
          return { title: assignee, selected: false, parentId: issueType.value };
        });

        totalCount += (subTypes.length + 1);
        selectableIssueTypeGroups[issueType.value] = {
          selected: false,
          selectedCount: 0,
          values: subTypes,
        };
      });
      setSelectableIssueTypeGroups(selectableIssueTypeGroups);
      setAllIssueTypesCount(totalCount)
    }
  }, [issueTypes]);

  function onUnload() {
    trackSelectedFormTypes();
  }

  useEffect(() => {
    if (Boolean(selectableAssigneToFormTypes)) {
      const selectedFormTypes = Object.keys(
        selectableAssigneToFormTypes
      ).reduce((result: any, selectableParent) => {
        selectableAssigneToFormTypes[selectableParent].values.forEach(
          (selectableFormType) => {
            selectableFormType.selected && result.push(selectableFormType.title);
          }
        );
        return result;
      }, []);
      setSelectedAssigneToFormTypes(selectedFormTypes);
    }

    if (
      Boolean(selectableFormTypeGroups) &&
      selectableFormTypeGroups.length > 0
    ) {
      const selectableFormTypes = selectableFormTypeGroups
        .map((formTypeGroup) => formTypeGroup.selectableFormTypes)
        .flat();
      const selectedFormTypes = selectableFormTypes
        .filter((selectableFormType) => selectableFormType.selected)
        .map((selectableFormTypes) => selectableFormTypes.formType);

      setSelectedFormTypes(selectedFormTypes);
    }

    if (Boolean(selectableIssueTypeGroups)) {
      const selectedFormTypes = Object.keys(
        selectableIssueTypeGroups
      ).reduce((result: any, selectableParent) => {
        selectableIssueTypeGroups[selectableParent].selected && result.push(selectableParent);
        selectableIssueTypeGroups[selectableParent].values.forEach(
          (selectableFormType) => {
            selectableFormType.selected && result.push(selectableFormType.title);
          }
        );
        return result;
      }, []);
      setSelectedIssueTypes(selectedFormTypes);
    }
  }, [selectableAssigneToFormTypes, selectableFormTypeGroups, selectableIssueTypeGroups]);

  useEffect(() => {
    window.addEventListener("beforeunload", onUnload);

    return () => {
      window.removeEventListener("beforeunload", onUnload);
      onUnload();
    };
  }, []);

  const title = useMemo(() => {
    const selectedAssigneFormTypes = Object.keys(
      selectableAssigneToFormTypes
    ).reduce((result: string[], selectableParent) => {
      selectableAssigneToFormTypes[selectableParent].values.forEach(
        (selectableFormType) => {
          selectableFormType.selected && result.push(selectableFormType.title);
        }
      );
      return result;
    }, []);

    const selectedIssueTypes = Object.keys(
      selectableIssueTypeGroups
    ).reduce((result: string[], selectableParent) => {
      selectableIssueTypeGroups[selectableParent].values.forEach(
        (selectableFormType) => {
          selectableFormType.selected && result.push(selectableFormType.title);
        }
      );
      selectableIssueTypeGroups[selectableParent].selected && result.push(selectableParent);
      return result;
    }, []);

    const selectableFormTypesFromGroups = selectableFormTypeGroups
      .map(
        (selectableFormTypeGroup) => selectableFormTypeGroup.selectableFormTypes
      )
      .flat();
    const selectedFormTypes = selectableFormTypesFromGroups
      .filter((selectableFormType) => selectableFormType.selected)
      .map((selectableFormType) => selectableFormType.formTypeName);

    if (dataMode === "All") {
      selectedAssigneFormTypes.length === allAssigneeTypesCount &&
      selectedFormTypes.length === selectableFormTypesFromGroups.length && 
      selectedIssueTypes.length === allIssueTypesCount
        ? setSelectedAll(true)
        : setSelectedAll(false);
      
      selectedIssueTypes.length === allIssueTypesCount ? setSelectedAllIssue(true) : setSelectedAllIssue(false)

      if (
        selectedFormTypes.length === 1 &&
        selectedAssigneFormTypes.length === 0 &&
        selectedIssueTypes.length === 0
      ) {
        return `${selectedFormTypes[0]}`;
      }

      if (
        selectedFormTypes.length === 0 &&
        selectedAssigneFormTypes.length === 1 &&
        selectedIssueTypes.length === 0
      ) {
        return `${selectedAssigneFormTypes[0]}`;
      }

      if (
        selectedFormTypes.length === 0 &&
        selectedAssigneFormTypes.length === 0 &&
        selectedIssueTypes.length === 1
      ) {
        return `${selectedIssueTypes[0]}`;
      }

      if (selectedFormTypes.length > 0 || selectedAssigneFormTypes.length > 0 || selectedIssueTypes.length > 0) {
        return `${
          selectedFormTypes.length + selectedAssigneFormTypes.length + selectedIssueTypes.length
        } Selected`;
      }
    } else if (dataMode === "Issues") {
      selectedAssigneFormTypes.length === allAssigneeTypesCount && selectedIssueTypes.length === allIssueTypesCount
        ? setSelectedAll(true)
        : setSelectedAll(false);

      selectedIssueTypes.length === allIssueTypesCount ? setSelectedAllIssue(true) : setSelectedAllIssue(false)

      if (selectedAssigneFormTypes.length === 1 && selectedIssueTypes.length === 0) {
        return `${selectedAssigneFormTypes[0]}`;
      }

      if (selectedAssigneFormTypes.length === 0 && selectedIssueTypes.length === 1) {
        return `${selectedIssueTypes[0]}`;
      }

      if (selectedAssigneFormTypes.length > 0 || selectedIssueTypes.length > 0) {
        return `${selectedAssigneFormTypes.length + selectedIssueTypes.length} Selected`;
      }
    } else {
      selectedFormTypes.length === selectableFormTypesFromGroups.length
        ? setSelectedAll(true)
        : setSelectedAll(false);

      if (selectedFormTypes.length === 1) {
        return `${selectedFormTypes[0]}`;
      }

      if (selectedFormTypes.length > 1) {
        return `${selectedFormTypes.length} Selected`;
      }
    }

    return <span>{"Select Data to Display"}</span>;
  }, [
    selectableAssigneToFormTypes,
    selectableFormTypeGroups,
    selectableIssueTypeGroups,
    allAssigneeTypesCount,
    dataMode,
  ]);

  function onOpenClick(element: HTMLButtonElement) {
    trackSelectedFormTypes();
    setAnchorWidth(element.clientWidth);
    setPopOverAnchor(element);
  }

  function onClose() {
    const selectableFormTypesFromGroups = selectableFormTypeGroups
      .map(
        (selectableFormTypeGroup) => selectableFormTypeGroup.selectableFormTypes
      )
      .flat();
    const selectedFormTypes = selectableFormTypesFromGroups
      .filter((selectableFormType) => selectableFormType.selected)
      .map((selectableFormType) => selectableFormType.formType);

    selectedFormTypesRef.current = selectedFormTypes;

    if (
      Boolean(selectedFormTypesRef.current) &&
      selectedFormTypesRef.current.length > 0
    ) {
      timeEvent("Form-Types-Selected");
    }

    setPopOverAnchor(undefined);
  }

  function trackSelectedFormTypes() {
    if (
      Boolean(selectedFormTypesRef.current) &&
      selectedFormTypesRef.current.length > 0
    ) {
      track("Form-Types-Selected", {
        formTypes: selectedFormTypesRef.current,
        projectId: projectId,
      });
    }
  }

  function setAllSelectableIssueTypes(selected: boolean) {
    Object.keys(selectableIssueTypeGroups).forEach((selectableParent) => {
      selectableIssueTypeGroups[selectableParent].selected = selected;
      selectableIssueTypeGroups[selectableParent].values.forEach(
        (selectableFormType) => {
          selectableFormType.selected = selected;
        }
      );
    });
    setSelectableIssueTypeGroups({ ...selectableIssueTypeGroups });
    setSelectedAllIssue(selected);
  }

  function setAllSelectableFormTypes(selected: boolean) {
    if (
      Boolean(selectableAssigneToFormTypes) &&
      (dataMode === "All" || dataMode === "Issues")
    ) {
      Object.keys(selectableAssigneToFormTypes).forEach((selectableParent) => {
        selectableAssigneToFormTypes[selectableParent].selected = selected;
        selectableAssigneToFormTypes[selectableParent].values.forEach(
          (selectableFormType) => {
            selectableFormType.selected = selected;
          }
        );
      });
      setSelectableAssigneToFormTypes({ ...selectableAssigneToFormTypes });
    }

    if (
      Boolean(selectableFormTypeGroups) &&
      (dataMode === "All" || dataMode === "Checklist")
    ) {
      selectableFormTypeGroups.forEach(
        (selectableFormTypeGroup) =>
          (selectableFormTypeGroup.selected = selected)
      );
      setSelectableFormTypeGroups([...selectableFormTypeGroups]);
    }

    if (
      Boolean(setAllSelectableIssueTypes) &&
      (dataMode === "All" || dataMode === "Issues")
    ) {
      setAllSelectableIssueTypes(selected)
    }
  }

  function onAssignFormTypeChanged(
    selected: boolean,
    selectableParent: string,
    selectableChild?: string
  ) {
    if (selectableChild) {
      selectableAssigneToFormTypes[selectableParent].values.forEach(
        (selectableFormType) => {
          if (selectableFormType.title === selectableChild) {
            selectableFormType.selected = selected;
            selectableAssigneToFormTypes[selectableParent].selectedCount =
              selected
                ? selectableAssigneToFormTypes[selectableParent].selectedCount +
                  1
                : selectableAssigneToFormTypes[selectableParent].selectedCount -
                  1;
          }
        }
      );
    } else {
      selectableAssigneToFormTypes[selectableParent].selected = selected;
      selectableAssigneToFormTypes[selectableParent].selectedCount = selected
        ? selectableAssigneToFormTypes[selectableParent].values.length
        : 0;
      selectableAssigneToFormTypes[selectableParent].values.forEach(
        (selectableFormType) => {
          selectableFormType.selected = selected;
        }
      );
    }
    setSelectableAssigneToFormTypes({ ...selectableAssigneToFormTypes });
  }

  function onIssueTypeChanged(
    selected: boolean,
    selectableParent: string,
    selectableChild?: string
  ) {
    if (selectableChild) {
      selectableIssueTypeGroups[selectableParent].values.forEach(
        (selectableFormType) => {
          if (selectableFormType.title === selectableChild) {
            selectableFormType.selected = selected;
            selectableIssueTypeGroups[selectableParent].selectedCount =
              selected
                ? selectableIssueTypeGroups[selectableParent].selectedCount +
                  1
                : selectableIssueTypeGroups[selectableParent].selectedCount -
                  1;
          }
        }
      );
    } else {
      selectableIssueTypeGroups[selectableParent].selected = selected;
      selectableIssueTypeGroups[selectableParent].selectedCount = selected
        ? selectableIssueTypeGroups[selectableParent].values.length | 1
        : 0;
        selectableIssueTypeGroups[selectableParent].values.forEach(
        (selectableFormType) => {
          selectableFormType.selected = selected;
        }
      );
    }
    setSelectableIssueTypeGroups({ ...selectableIssueTypeGroups });
  }

  function onGroupChange(
    checked: boolean,
    formTypeGroup: SelectableFormTypeGroup
  ) {
    formTypeGroup.selected = checked;
    setSelectableFormTypeGroups([...selectableFormTypeGroups]);
  }

  function onFormTypeChanged(checked: boolean, formType: SelectableFormType) {
    formType.selected = checked;
    setSelectableFormTypeGroups([...selectableFormTypeGroups]);
  }

  const onKeyDownCheckBox = (e: any) => {
    if (e.keyCode == '13') {
      setAllSelectableFormTypes(!selectedAll)
      setTimeout(() => e.target.tagName === 'SPAN' ? e.target.previousSibling.focus() : e.target.nextElementSibling.focus(), 100);
    }
  }

  const onKeyDownCheckBoxIssueTypes = (e: any) => {
    if (e.keyCode == '13') {
      setAllSelectableIssueTypes(!selectedAll)
      setTimeout(() => e.target.tagName === 'SPAN' ? e.target.previousSibling.focus() : e.target.nextElementSibling.focus(), 100);
    }
  }

  return (
    <div className="v2-visualize-formTypeSelector">
      <Button
        className="dropdown-button"
        variant="outlined"
        fullWidth
        onClick={(event) => onOpenClick(event.currentTarget)}
      >
        {title}
        {open ? (
          <ExpandLessIcon fontSize="small" />
        ) : (
          <ExpandMoreIcon fontSize="small" />
        )}
      </Button>

      <Popover
        open={open}
        anchorEl={popOverAnchor}
        onClose={onClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        className={`v2-visualize v2-visualize-formTypeSelector-dropdown-content ${
          state.dashboardType === "classic" && "classic-colors"
        }`}
        PaperProps={{
          style: { width: `${anchorWidth}px` },
        }}
      >
        <div>
          <div
            className="checkbox-container"
            onClick={() => setAllSelectableFormTypes(!selectedAll)}
          >
            <input
              type="checkbox"
              key={`form_type_select_all}`}
              checked={selectedAll}
              readOnly
              tabIndex={0}
              onKeyDown={onKeyDownCheckBox}
            />
            <span tabIndex={0} onKeyDown={onKeyDownCheckBox}></span>
            <span>Select All</span>
          </div>
          {(dataMode === "All" || dataMode === "Checklist") &&
            selectableFormTypeGroups.map((formTypeGroup) => (
              <div key={`form_type_${formTypeGroup.name}_constainer`}>
                <FormTypeCheckbox
                  title={formTypeGroup.name}
                  selected={formTypeGroup.selected}
                  onChange={() => {
                    onGroupChange(!formTypeGroup.selected, formTypeGroup);
                  }}
                  key={`form_type_${formTypeGroup.name}`}
                  hideCheckBox={
                    (dataMode !== "All" &&
                      selectableFormTypeGroups.length === 1 ) ||
                    (dataMode === "All" &&
                      Object.keys(selectableAssigneToFormTypes).length === 0)
                  }
                />
                {formTypeGroup.selectableFormTypes.map((selectableFormType) => (
                  <FormTypeCheckbox
                    title={selectableFormType.formTypeName}
                    selected={selectableFormType.selected}
                    onChange={() => {
                      onFormTypeChanged(
                        !selectableFormType.selected,
                        selectableFormType
                      );
                    }}
                    subType={true}
                    key={`form_type_${selectableFormType.selectableFormTypeId}_subtype`}
                  />
                ))}
              </div>
            ))}
          {(dataMode === "All" || dataMode === "Issues") &&
            <div
              className="checkbox-container"
              onClick={() => setAllSelectableIssueTypes(!selectedAllIssue)}
            >
              <input
                type="checkbox"
                key={`form_type_select_all}`}
                checked={selectedAllIssue}
                readOnly
                tabIndex={0}
                onKeyDown={onKeyDownCheckBoxIssueTypes}
              />
              <span tabIndex={0} onKeyDown={onKeyDownCheckBoxIssueTypes}></span>
              <span>Issue Types</span>
            </div>
          }
          {(dataMode === "All" || dataMode === "Issues") &&
            Object.keys(selectableIssueTypeGroups).map(
              (selectableParent) => (
                <div key={`form_type_${selectableParent}_constainer`}>
                  <FormTypeCheckbox
                    title={selectableParent}
                    selected={selectableIssueTypeGroups[selectableParent].selected}
                    subType={true}
                    onChange={() =>
                      onIssueTypeChanged(
                        !selectableIssueTypeGroups[selectableParent]
                          .selected,
                        selectableParent
                      )
                    }
                    key={`form_type_${selectableParent}`}
                  />
                  {selectableIssueTypeGroups[selectableParent].values.sort((a, b) => a.title.localeCompare(b.title)).map(
                    (selectableFormType) => {
                      return (
                        <FormTypeCheckbox
                          title={selectableFormType.title}
                          selected={selectableFormType.selected}
                          onChange={() =>
                            onIssueTypeChanged(
                              !selectableFormType.selected,
                              selectableParent,
                              selectableFormType.title
                            )
                          }
                          lastChildType={true}
                          key={`form_type_${selectableFormType.title}_subtype`}
                        />
                      );
                    }
                  )}
                </div>
              )
            )}
          {(dataMode === "All" || dataMode === "Issues") &&
            Object.keys(selectableAssigneToFormTypes).map(
              (selectableParent) => (
                <div key={`form_type_${selectableParent}_constainer`}>
                  <FormTypeCheckbox
                    title={
                      dataMode === "All"
                        ? `Issues for ${selectableParent}`
                        : selectableParent
                    }
                    selected={
                      selectableAssigneToFormTypes[selectableParent].selected
                    }
                    onChange={() =>
                      onAssignFormTypeChanged(
                        !selectableAssigneToFormTypes[selectableParent]
                          .selected,
                        selectableParent
                      )
                    }
                    key={`form_type_${selectableParent}`}
                    hideCheckBox={
                      (dataMode !== "All" &&
                        Object.keys(selectableAssigneToFormTypes).length === 1 && Object.keys(selectableIssueTypeGroups).length === 0) ||
                      (dataMode === "All" &&
                        selectableFormTypeGroups.length === 0)
                    }
                  />
                  {selectableAssigneToFormTypes[selectableParent].values.sort((a,b)=> a.title.localeCompare(b.title)).map(
                    (selectableFormType) => {
                      return (
                        <FormTypeCheckbox
                          title={selectableFormType.title}
                          selected={selectableFormType.selected}
                          onChange={() =>
                            onAssignFormTypeChanged(
                              !selectableFormType.selected,
                              selectableParent,
                              selectableFormType.title
                            )
                          }
                          subType={true}
                          key={`form_type_${selectableFormType.title}_subtype`}
                        />
                      );
                    }
                  )}
                </div>
              )
            )}
        </div>
      </Popover>
    </div>
  );
};
