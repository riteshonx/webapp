import Box from "@material-ui/core/Box";
import BoldText from "../Micro/BoldText";
import TextContent from "../Micro/TextContent";

interface VarianceInfoItemProps {
  varianceName: string;
  varianceDescription: string;
  comments?: string;
}

const VarianceInfoItem: React.VFC<VarianceInfoItemProps> = ({
  varianceName,
  varianceDescription,
  comments,
}) => {
  return (
    <Box>
      <BoldText size="1.5rem" collapseMargin>
        {varianceName}
      </BoldText>
      <TextContent content={varianceDescription} />
      {comments ? (
        <>
          <BoldText size="1.2rem" color="#797979">
            Comments
          </BoldText>
          <TextContent content={comments} />
        </>
      ):""}
    </Box>
  );
};

export default VarianceInfoItem;
