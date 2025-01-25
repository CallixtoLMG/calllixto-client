import { Divider } from '@/components/budgets/PDFfile/styles';
import { Field } from '@/components/common/components/Field';
import { renderContent } from '@/utils';
import styled from 'styled-components';
import { Flex, FlexColumn } from '../custom';
const SubTitle = styled.p`
  font-style: italic;
`;

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
