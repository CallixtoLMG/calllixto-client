import { Flex } from "rebass";
import { Icon, Popup, Label as SLabel } from "semantic-ui-react";
import styled from "styled-components";

const Label = styled(SLabel)`
  width: 100%!important;
  margin: 0!important;
`;

export const RuledLabel = ({ title, message, required }) => {
  return (
    <Label>
      <Flex justifyContent="space-between">
        <span>
          {title}
          {required && <span style={{ color: message ? 'red' : 'teal' }}> *</span>}
        </span>
        {message && (
          <Popup
            position="top center"
            content={message}
            trigger={<Icon name="exclamation circle" color="red" />}
          />
        )}
      </Flex>
    </Label>
  );
};
