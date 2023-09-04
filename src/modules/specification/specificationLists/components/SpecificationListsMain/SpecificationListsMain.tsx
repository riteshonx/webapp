import React, { ReactElement, useState, useContext, useEffect } from "react";
import SpecificationListGallery from "../SpecificationListGallery/SpecificationListGallery";
import SpecificationListTable from "../SpecificationListTable/SpecificationListTable";
import { SpecificationLibDetailsContext } from "../../context/SpecificationLibDetailsContext";
// import {SpecificationFilter} from '../SpecificationFilter/SpecificationFilter'

export default function SpecificationListsMain(props: any): ReactElement {
  const [filterFlag, setFilterFlag] = useState(false);
  const { SpecificationLibDetailsState }: any = useContext(
    SpecificationLibDetailsContext
  );

  useEffect(() => {
    setFilterFlag(SpecificationLibDetailsState?.toggleFilter);
  }, [SpecificationLibDetailsState?.toggleFilter]);

  const deleteSpecification = (specifcationDetail: any) => {
    props.deleteSpecification(specifcationDetail);
  };
  const handleRefreshSpecificationList = () => {
    props.refresh();
  };
  return (
    <>
      <SpecificationListTable
        deleteSpecification={deleteSpecification}
        refreshSpecificationList={handleRefreshSpecificationList}
        isSearchTextExist={props.isSearchTextExist}
      />

      {/* {
                filterFlag  ?  (
                    <SpecificationFilter/>
                ): null
} */}
    </>
  );
}
