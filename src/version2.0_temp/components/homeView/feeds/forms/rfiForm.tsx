import React, {
  ReactElement,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { CircularProgress } from '@material-ui/core';

import { LOAD_FILTERS_LIST_FORM } from 'src/version2.0_temp/api/queries/formQuery';
import { client } from 'src/services/graphql';
import Notification, {
  AlertTypes,
} from 'src/modules/shared/components/Toaster/Toaster';
import './rfiForm.scss';
import { stateContext } from 'src/modules/root/context/authentication/authContext';
import { Popover } from 'src/version2.0_temp/components/common';
import { FeedRfiForm } from './feedRfiForm';

export const featureFormRoles = {
  viewForm: 'viewForm',
};

const RfiOptionElement = (props: any) => {
  const [open, setOpen] = useState(false);
  const titleRef = useRef<HTMLDivElement>(null);
  return (
    <>
      <div
        ref={titleRef}
        className="v2-form-title"
        onClick={() => setOpen(true)}
      >
        {props.subject}
      </div>
      <Popover
        trigger={<></>}
        foreignTarget={titleRef}
        foreignTrigger={true}
        position="top"
        open={open}
      >
        <FeedRfiForm onClose={() => setOpen(false)} formId={props.id} />
      </Popover>
    </>
  );
};

export const RfiForm = (props: any): ReactElement => {
  const { state }: any = useContext(stateContext);
  const [formData, setFormData] = useState([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { featureId } = props;

  const refsList = useRef<Array<HTMLDivElement>>([]);
  const [selectedRefBox, setSelectedRefBox] = useState<DOMRect>();
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [openPopover, setOpenPopover] = useState(false);

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      const formsResponse = await client.query({
        query: LOAD_FILTERS_LIST_FORM,
        variables: {
          featureId: 2,
          filterData: [],
          limit: 10,
          offset: 0,
          order: 'desc',
          orderBy: '',
        },
        fetchPolicy: 'network-only',
        context: {
          role: featureFormRoles.viewForm,
          token: state?.selectedProjectToken,
          feature: featureId,
        },
      });
      if (formsResponse) {
        // getListFormNew(formsResponse);
        const data = JSON.parse(
          JSON.stringify(formsResponse.data?.listForms_query.data)
        );
        setFormData(data);
      }
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      Notification.sendNotification(
        'Something went wrong while fetching forms',
        AlertTypes.warn
      );
      setIsLoading(false);
    }
  };

  const selectFormItem = (index: any) => {
    setSelectedRefBox(refsList.current[index]?.getBoundingClientRect());
    setSelectedIndex(index);
    setOpenPopover(true);
  };

  return (
    <React.Fragment>
      <div>
        <div>
          {isLoading ? (
            <div>
              <CircularProgress
                className="v2-circular-progress"
                size="16px"
                style={{ color: 'orange' }}
              />
            </div>
          ) : (
            formData.map((formItem: any) =>
              formItem.formsData.map((singleForm: any, index: number) => {
                return singleForm.caption === 'Subject' ? (
                  <RfiOptionElement
                    subject={singleForm?.value}
                    id={formItem.id}
                  />
                ) : null;
              })
            )
          )}
        </div>
      </div>
    </React.Fragment>
  );
};
