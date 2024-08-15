import { Title } from "@/components/budgets/PDFfile/styles";
import { Flex } from "../custom";

export const Field = ({
  label,
  value,
  children,
  justifyContent = "space-between",
  columnGap = "5px",
  minWidth = "250px",
  labelWidth = "100px",
  valueWidth = "120px",
  pdf = false,
  ...rest
}) => {

  return (
    <Flex
      justifyContent={justifyContent}
      columnGap={columnGap}
      minWidth={minWidth}
      maxWidth={pdf ? "300px" : "250px"}
      height="30px"
      {...rest}
    >
      <Title as="h4" width={labelWidth} $slim>{label}</Title>
      {value ? (
        <Title as="h4" width={valueWidth}>{value.toUpperCase()}</Title>
      ) : (
        <Title as="h4" width={valueWidth}>{children}</Title>
      )}
    </Flex>
  );
};
