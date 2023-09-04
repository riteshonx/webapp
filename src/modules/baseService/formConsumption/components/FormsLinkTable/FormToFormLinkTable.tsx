import { useContext } from "react";
import { projectContext } from "../../Context/projectContext";
import LinkIcon from "@material-ui/icons/Link";
import CloseIcon from "@material-ui/icons/Close";
import { relationships, LinkType, LinkRelationship } from "src/utils/constants";
import { FormControl, IconButton, MenuItem, Select } from "@material-ui/core";

const FormToFormLinkTable = ({
  formToFormLinks,
  linkType,
  onClickLink,
  onDeleteLink,
  onChangeRelationShip,
  isEdit,
  classes,
}: any) => {
  const { projectState }: any = useContext(projectContext);

  return (
    <div>
      {formToFormLinks?.length > 0 && (
        <table>
          <thead>
            <tr className="LinkInput__body__rowheader">
              <td className="LinkInput__body__rowheader__name">Forms</td>
              <td className="LinkInput__body__rowheader__relationship">
                Relationship
              </td>
              {linkType !== LinkType.VIEW ? (
                projectState?.featurePermissions?.canUpdateForm ? (
                  <td className="LinkInput__body__rowheader__action">Action</td>
                ) : (
                  ""
                )
              ) : isEdit ? (
                <td className="LinkInput__body__rowheader__action">Action</td>
              ) : (
                ""
              )}
            </tr>
          </thead>
          <tbody>
            {formToFormLinks
              .sort((a: any, b: any) =>
                a.targetFeature.localeCompare(b.targetFeature)
              )
              .map((item: any, index: number) => (
                <tr
                  key={`${item.id}-${item.targetId}`}
                  className="LinkInput__body__row"
                >
                  <td className="LinkInput__body__row__name">
                    <div className="LinkInput__body__row__name__container">
                      <IconButton
                        className="LinkInput__body__row__name__container__btn"
                        onClick={() => onClickLink(item)}
                      >
                        <LinkIcon className="LinkInput__body__row__name__container__btn__icon" />
                      </IconButton>
                      {item.targetFeature}:
                      <span className="LinkInput__body__row__name__container__target">
                        {item.targetAutoIncremenId} - {item.label}
                      </span>
                    </div>
                  </td>
                  {linkType === LinkType.VIEW ? (
                    isEdit ? (
                      <td className="LinkInput__body__row__relationship">
                        <FormControl
                          key={`projectTemplate-${item.name}`}
                          variant="outlined"
                          className="LinkInput__body__row__relationship__select"
                        >
                          <Select
                            value={item.relation}
                            fullWidth
                            labelId="demo-simple-select-outlined-label"
                            id="demo-simple-select-outlined"
                            MenuProps={{
                              classes: { paper: classes.root },
                              anchorOrigin: {
                                vertical: "bottom",
                                horizontal: "left",
                              },
                              transformOrigin: {
                                vertical: "top",
                                horizontal: "left",
                              },
                              getContentAnchorEl: null,
                            }}
                            onChange={(e) => onChangeRelationShip(e, index)}
                          >
                            {relationships.map((temp: any) => (
                              <MenuItem
                                className="mat-menu-item-sm"
                                key={`tem-${temp.value}`}
                                value={temp.value}
                              >
                                {temp.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </td>
                    ) : (
                      <td className="LinkInput__body__row__relationship">
                        {item.relation === LinkRelationship.BLOCKED_BY
                          ? "Is Blocked by"
                          : item.relation === LinkRelationship.BLOCKS
                          ? "Blocks"
                          : "Relates to"}
                      </td>
                    )
                  ) : projectState?.featurePermissions?.canUpdateForm ? (
                    <td className="LinkInput__body__row__relationship">
                      <FormControl
                        key={`projectTemplate-${item.name}`}
                        variant="outlined"
                        className="LinkInput__body__row__relationship__select"
                      >
                        <Select
                          value={item.relation}
                          fullWidth
                          labelId="demo-simple-select-outlined-label"
                          id="demo-simple-select-outlined"
                          onChange={(e) => onChangeRelationShip(e, index)}
                          MenuProps={{
                            classes: { paper: classes.root },
                            anchorOrigin: {
                              vertical: "bottom",
                              horizontal: "left",
                            },
                            transformOrigin: {
                              vertical: "top",
                              horizontal: "left",
                            },
                            getContentAnchorEl: null,
                          }}
                        >
                          {relationships.map((temp: any) => (
                            <MenuItem
                              className="mat-menu-item-sm"
                              key={`tem-${temp.value}`}
                              value={temp.value}
                            >
                              {temp.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </td>
                  ) : (
                    <td className="LinkInput__body__row__relationship">
                      {item.relation === LinkRelationship.BLOCKED_BY
                        ? "Is Blocked by"
                        : item.relation === LinkRelationship.BLOCKS
                        ? "Blocks"
                        : "Relates to"}
                    </td>
                  )}
                  {linkType !== LinkType.VIEW ? (
                    projectState?.featurePermissions?.canUpdateForm ? (
                      <td className="LinkInput__body__row__action">
                        <IconButton
                          size="small"
                          className="LinkInput__body__row__action__btn"
                          onClick={() => onDeleteLink(index)}
                        >
                          <CloseIcon className="LinkInput__body__row__action__btn__icon" />
                        </IconButton>
                      </td>
                    ) : (
                      ""
                    )
                  ) : isEdit ? (
                    <td className="LinkInput__body__row__action">
                      <IconButton
                        size="small"
                        className="LinkInput__body__row__action__btn"
                        onClick={() => onDeleteLink(index)}
                      >
                        <CloseIcon className="LinkInput__body__row__action__btn__icon" />
                      </IconButton>
                    </td>
                  ) : (
                    ""
                  )}
                </tr>
              ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default FormToFormLinkTable;
