import "./ProductivityCostCodeList.scss";

const ProductivityCostCodeList = (props: any) => {
  const { classificationLabel, getCode } = props;
  const handleSelect = (items: any) => {
    getCode(items);
  };

  return (
    <>
      <div className="productivitycode__option__list">
        {classificationLabel?.map((items: any, searchIndex: number) => {
          return (
            <ul
              style={{
                display: "inlineBlock",
                marginLeft: "2px",
                borderBottom: `${
                  classificationLabel.length - 1 === searchIndex ? "none" : ""
                }`,
                listStyle: "none",
              }}
              key={items.id}
              className="productivitycode__option__list__item"
            >
              <li
                style={{ listStyle: "none" }}
                onClick={(e) => handleSelect(items)}
                className="productivitycode__option__list__name"
              >
                <span className="productivitycode__option__list__code">
                  {items.classificationCode}
                </span>
                {items.classificationCodeName}
              </li>
              <ProductivityCostCodeList
                classificationLabel={items.childrens}
                getCode={getCode}
              />
            </ul>
          );
        })}
      </div>
    </>
  );
};
export default ProductivityCostCodeList;
