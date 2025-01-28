import { Divider, Title } from '@/components/budgets/PDFfile/styles';
import { renderContent } from '@/utils';
import styled from 'styled-components';
import { Flex, FlexColumn } from '../custom';

const SubTitle = styled.p`
  font-style: italic;
`;

const Field = ({
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

export const TotalList = ({ items = [], readOnly, width, labelWidth }) => {
  return (
    <FlexColumn marginLeft="auto" rowGap={!readOnly ? "5px" : "0"} width={!width ? "250px" : width}>
      {items
        .map(({ title, amount, subtitle }, index) => (
          <FlexColumn rowGap={!readOnly ? "5px" : "0"} key={index}>
            <Field labelWidth={labelWidth} width={width} label={renderContent(title)}>
              {renderContent(amount)}
            </Field>
            {subtitle && (
              <Flex justifyContent="right">
                <SubTitle>
                  {`(${subtitle})`}
                </SubTitle>
              </Flex>
            )}
            {index < items.length - 1 && <Divider />}
          </FlexColumn>
        ))}
    </FlexColumn>
  );
};
