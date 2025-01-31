import { Divider, Title } from '@/components/budgets/PDFfile/styles';
import { renderContent } from '@/common/utils';
import styled from 'styled-components';
import { Flex, FlexColumn } from '../custom';

const SubTitle = styled.p`
  font-style: italic;
`;

const Field = ({
  label,
  value,
  children,
}) => {
  return (
    <Flex
      justifyContent="space-between"
      height="30px"
    >
      <Title as="h4" $slim>{label}</Title>
      {value ? (
        <Title as="h4">{value.toUpperCase()}</Title>
      ) : (
        <Title as="h4">{children}</Title>
      )}
    </Flex>
  );
};

export const TotalList = ({ items = [], readOnly, width }) => {
  return (
    <FlexColumn marginLeft="auto" rowGap={!readOnly ? "5px" : "0"} width={!width ? "250px" : width}>
      {items
        .map(({ title, amount, subtitle }, index) => (
          <FlexColumn rowGap={!readOnly ? "5px" : "0"} key={index}>
            <Field label={renderContent(title)}>
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
