import { Popup, Icon as SIcon, Label as SLabel } from "semantic-ui-react";
import styled from "styled-components";
import { Flex } from '@/components/common/custom';

const Label = styled(SLabel)`
  width: 100%!important;
  margin: 0!important;
`;

const Icon = styled(SIcon)`
  align-self: center;
  cursor: ${({ pointer }) => pointer && "pointer"} !important;
`;

export const RuledLabel = ({ title, message, required, onDelete, readonly, popupMsg }) => {
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
        {!readonly && onDelete && (
          <Popup
            size="mini"
            position="top center"
            content={popupMsg}
            trigger={<Icon pointer name="trash" color="red" size="small" onClick={onDelete} />}
          />
        )}
      </Flex>
    </Label>
  );
};
