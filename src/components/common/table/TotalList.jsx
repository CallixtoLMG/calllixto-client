import { Divider } from '@/components/budgets/PDFfile/styles';
import { Field } from '@/components/common/components/Field';
import React from 'react';
import styled from 'styled-components';
import { Flex, FlexColumn } from '../custom';

const Subtitle = styled.p`
  font-style: italic;
`;

export const TotalList = ({ items = [], readOnly, width, labelWidth }) => {
  const renderContent = (content) => {
    return typeof content === 'string' ? content : (
      React.isValidElement(content) ? content : null
    );
  };

  return (
    <FlexColumn marginLeft="auto" rowGap={!readOnly ? "5px" : "0"} width={!width ? "250px" : width} >
      {items
        .filter(item => item.amount) 
        .map(({ title, amount, subtitle }, index) => (
          <FlexColumn rowGap={!readOnly ? "5px" : "0"} key={index}>
            <Field labelWidth={labelWidth} width={width} label={renderContent(title)}>
              {renderContent(amount)}
            </Field>
            {subtitle && (
              <Flex justifyContent="right">
                <Subtitle >
                  {`(${renderContent(subtitle)})`}
                </Subtitle>
              </Flex>
            )}
            {index < items.length - 1 && <Divider />}
          </FlexColumn>
        ))}
    </FlexColumn>
  );
};
