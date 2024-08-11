import { Title } from "@/components/budgets/PDFfile/styles";
import { Flex } from "../custom";

export const Field = ({ label, children }) => (
  <Flex justifyContent="space-between" height="30px">
    <Title as="h4" $slim width="100px" textAlign="right">{label}</Title>
    <Title as="h4" width="120px">{children}</Title>
  </Flex>
);