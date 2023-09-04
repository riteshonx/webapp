import { Button } from '@material-ui/core';
import Checkbox from '@material-ui/core/Checkbox';
import React, { useContext, useEffect, useState } from 'react';
import { match, useRouteMatch } from 'react-router-dom';
import ActiveAttachmentIcon from '../../../../../../assets/images/active_attachments.svg';
import ActiveLinkIcon from '../../../../../../assets/images/active_links.svg';
import AttachmentIcon from '../../../../../../assets/images/attachments.svg';
import AttachmentBlueIcon from '../../../../../../assets/images/attachment_rotate_blue_45.svg';
import EmptyData from '../../../../../../assets/images/data_empty.svg';
import DeleteIcon from '../../../../../../assets/images/delete.svg';
import LinkIcon from '../../../../../../assets/images/links.svg';
import ConfirmDialog from '../../../../../shared/components/ConfirmDialog/ConfirmDialog';
import EditProjectPlanContext from '../../../../context/editProjectPlan/editProjectPlanContext';
import EditProjectPlanLinkContext from '../../../../context/editProjectPlanLinks/editProjectPlanLinksContext';
import ProjectPlanContext from '../../../../context/projectPlan/projectPlanContext';
import { permissionKeys } from '../../../../permission/scheduling';
import AddDataLinks from '../AddDataLinks/AddDataLinks';
import FileAttachment from '../FileAttachment/FileAttachment';
import './EditTaskDetailsViewData.scss';
export interface Params {
  id: string;
}

const EditTaskDetailsViewData = () => {
  const [activeTab, setActiveTab] = useState('link');
  const editProjectPlanContext = useContext(EditProjectPlanContext);
  const projectPlanContext: any = useContext(ProjectPlanContext);
  const { currentTask } = projectPlanContext;
  const editProjectPlanLinkContext: any = useContext(
    EditProjectPlanLinkContext
  );

  const { addConstraint, deleteConstraint, currentTaskConstraint } =
    editProjectPlanContext;
  const [addLinkPopup, setAddLinkPopup] = useState(false);
  const [attachedFile, setAttachedFile] = useState<Array<any>>([]);
  const [deleteConfirmation, setDeleteConfirmation] = useState<any>(false);
  const pathMatch: match<Params> = useRouteMatch();
  const {
    linkFormToTask,
    getLinkedForm,
    currentTaskLinkedForm,
    deleteLinkedForm,
    updateLinkedForm,
  } = editProjectPlanLinkContext;

  const [selectedLink, setSelectedLink] = useState<any>(null);
  useEffect(() => {
    getLinkedForm(currentTask.id);
  }, [currentTask]);

  /******************************* start link  *******************************/
  const setLinkValues = (data: any) => {
    setAddLinkPopup(false);

    data = data.map((link: any) => ({
      linkType: 'RELATES_TO',
      targetId: link.id,
    }));
    linkFormToTask(currentTask.id, data);
  };

  const addAsConstraint = (e: any, link: any) => {
    if (e.target.checked) {
      link.constraint = true;
      addConstraint({
        category: `Form-${link.feature}`,
        constraintName: link.subject,
        linkId: link.id,
        status: 'open',
        taskId: currentTask.id,
      });
      // getLinkedForm(currentTask.id);
      updateLinkedForm(link.id, 1); // 1 = RELATES_TO
    } else {
      link.constraint = false;
      currentTaskConstraint.forEach((constraint: any) => {
        if (constraint.linkId === link.id) {
          deleteConstraint({ id: constraint.id, taskId: currentTask.id });
        }
      });
      updateLinkedForm(link.id, 3); // 3 = BLOCKS
    }
  };

  const navigateToLinkForm = (argItem: any) => {
    const protocol = location.protocol;

    const host = location.host;

    const url = `${protocol}//${host}`;

    const targetUrl = `${url}/base/projects/${Number(
      pathMatch.params.id
    )}/form/${argItem.featureId}/edit/${argItem.formId}`;

    window.open(targetUrl, '_blank');
  };
  /******************************* end link  *******************************/

  /******************************* start attachments  *******************************/

  // const addAttachment = (e: any) => {
  //   e.preventDefault();
  //   console.log('attachment');
  // };
  /******************************* end attachments  *******************************/

  const cancelDelete = () => {
    setSelectedLink(null);
    setDeleteConfirmation(false);
  };

  return (
    <div className="edit-task-details-view-data">
      {(currentTaskLinkedForm.length > 0 || attachedFile.length > 0) && (
        <div className="edit-task-details-view-data__action-menu">
          <a
            data-testid="edit-task-details-view-data-action-menu-link"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('link');
              const element = document.getElementById('link');
              element?.scrollIntoView(true);
            }}
          >
            <img
              src={activeTab === 'link' ? ActiveLinkIcon : LinkIcon}
              alt="link"
              className="edit-task-details-view-data__action-menu-link"
            ></img>
          </a>
          <a
            data-testid="edit-task-details-view-data-action-menu-attachments"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('attachments');
              const element = document.getElementById('attachments');
              element?.scrollIntoView(true);
            }}
          >
            <img
              src={
                activeTab === 'attachments'
                  ? ActiveAttachmentIcon
                  : AttachmentIcon
              }
              alt="attachments"
              className="edit-task-details-view-data__action-menu-attachments"
            ></img>
          </a>
        </div>
      )}

      <div className="edit-task-details-view-data__links">
        <div className="edit-task-details-view-data__links-heading">
          <span
            data-testid="edit-task-details-view-data-action-menu-link-heading"
            id="link"
          >
            Links
          </span>

          {currentTaskLinkedForm.length > 0 &&
            permissionKeys(currentTask?.assignedTo).create && (
              <Button
                data-testid="edit-task-details-view-data-link-add-link-btn"
                className="btn-text edit-task-details-view-data__links__add-link-btn"
                onClick={() => {
                  setAddLinkPopup(true);
                }}
              >
                {' '}
                + Add Link{' '}
              </Button>
            )}
        </div>
        {currentTaskLinkedForm.length === 0 && (
          <div className="edit-task-details-view-data__links-empty">
            <img
              data-testid="edit-task-details-view-data__links-empty__img"
              src={EmptyData}
              alt="no data"
              className="edit-task-details-view-data__links-empty__img"
            />
            {!permissionKeys(currentTask.assignedTo).create &&
            currentTaskLinkedForm.length == 0 ? (
              <div className="edit-task-details-view-data__links-empty__onlyview">
                No links exist
              </div>
            ) : (
              ''
            )}
            {currentTask.type !== 'wbs' &&
              permissionKeys(currentTask?.assignedTo).create && (
                <Button
                  data-testid="edit-task-details-view-data-empty-add-link"
                  variant="outlined"
                  className="btn-text edit-task-details-view-data__links-empty__add-link"
                  onClick={() => {
                    setAddLinkPopup(true);
                  }}
                >
                  + Add Link
                </Button>
              )}
          </div>
        )}

        {currentTaskLinkedForm.length > 0 && (
          <div className="edit-task-details-view-data__links-data">
            <table className="edit-task-details-view-data__links-data__form__table">
              <tr className="edit-task-details-view-data__links-data__form__table-head">
                <th data-testid="edit-task-details-view-data-form-table-th">
                  FORMS
                </th>
                <th
                  data-testid="edit-task-details-view-data-relationship-table-th"
                  colSpan={2}
                >
                  RELATIONSHIP TYPE
                </th>
              </tr>

              {currentTaskLinkedForm.map((link: any) => (
                <tr
                  data-testid="edit-task-details-view-data-table-body-link"
                  className="edit-task-details-view-data__links-data__form__table-body"
                >
                  <td className="edit-task-details-view-data__links-data__form__table-body-td-1">
                    <div className="edit-task-details-view-data__links-data__form__table-body-td-1__name">
                      <img
                        src={AttachmentBlueIcon}
                        alt="link"
                        className="edit-task-details-view-data__links-data__form__table-body-td-1__link-img"
                        onClick={() => {
                          navigateToLinkForm(link);
                        }}
                      ></img>
                      <span>
                        {link.feature.toLowerCase().toString().includes('rfi')
                          ? 'RFI'
                          : link.feature}
                        : {link.subject}
                      </span>
                    </div>
                    <div className="edit-task-details-view-data__links-data__form__table-body-td-1__constraint">
                      {permissionKeys(currentTask?.assignedTo).create &&
                        link.subject !== '-' && (
                          <Checkbox
                            className="edit-task-details-view-data__links-data__form__table-body-td-1__constraint-checkbox"
                            color="default"
                            onClick={(e: any) => addAsConstraint(e, link)}
                            checked={link.constraint}
                          ></Checkbox>
                        )}
                      {permissionKeys(currentTask?.assignedTo).create &&
                        link.subject !== '-' && <span>Add as Constraint</span>}
                    </div>
                  </td>
                  <td className="edit-task-details-view-data__links-data__form__table-body-td-2">
                    {/* {link.linkType === 'RELATES_TO'
                      ? 'Relates to'
                      : link.linkType} */}
                    RELATES TO
                  </td>
                  <td className="edit-task-details-view-data__links-data__form__table-body-td-3">
                    {permissionKeys(currentTask?.assignedTo).delete && (
                      <img
                        data-testid="edit-task-details-view-data-delete-link"
                        src={DeleteIcon}
                        alt="delete"
                        onClick={() => {
                          setSelectedLink(link);
                          setDeleteConfirmation(true);
                        }}
                      ></img>
                    )}
                  </td>
                </tr>
              ))}
            </table>
          </div>
        )}

        <AddDataLinks
          isOpen={addLinkPopup}
          setValues={setLinkValues}
          close={() => setAddLinkPopup(false)}
        />
      </div>

      {/*  {((priorityPermissions('create') == 'createComponentPlan' ||
        priorityPermissions('update') == 'updateComponentPlan') &&
        currentTask.assignedTo != null) ||
        (priorityPermissions('create') == 'createMasterPlan' && (
          <div className="edit-task-details-view-data__empty">
            <div className="edit-task-details-view-data__empty-links"></div>

            <div
              className="edit-task-details-view-data__empty-attachment-text"
              id="attachments"
            >
              Attachments
            </div>



            <FileAttachment
              isEditAllowed={false}
              getAttachedFile={(data: any) => setAttachedFile(data)}
            />
          </div>
        ))} */}
      {permissionKeys(currentTask.assignedTo).view ? (
        <div className="edit-task-details-view-data__empty">
          <div className="edit-task-details-view-data__empty-links"></div>
          <div
            className="edit-task-details-view-data__empty-attachment-text"
            id="attachments"
          >
            Attachments
          </div>
          <FileAttachment
            isEditAllowed={false}
            getAttachedFile={(data: any) => setAttachedFile(data)}
          />
        </div>
      ) : (
        ''
      )}
      {!permissionKeys(currentTask.assignedTo).create &&
      attachedFile.length == 0 ? (
        <div className="edit-task-details-view-data__noattachment">
          No attachments added
        </div>
      ) : (
        ''
      )}

      {
        <ConfirmDialog
          data-testid="delete-link"
          open={deleteConfirmation}
          message={{
            text:
              selectedLink && selectedLink.constraint
                ? 'This action will delete the constraint. Are you sure you want to remove this link/constraint?'
                : 'Are you sure you want to remove this link?',
            cancel: 'Cancel',
            proceed: 'Remove',
          }}
          close={cancelDelete}
          proceed={() => {
            deleteLinkedForm([selectedLink.id], currentTask.id);
            setDeleteConfirmation(false);
          }}
        />
      }
    </div>
  );
};

export default EditTaskDetailsViewData;
