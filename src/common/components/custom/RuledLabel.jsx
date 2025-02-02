import { Flex } from '@/common/components/custom';
import { COLORS, ICONS } from "@/common/constants";
import { Popup, Icon as SIcon, Label as SLabel } from "semantic-ui-react";
import styled from "styled-components";

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
          {required && <span style={{ color: message ? COLORS.RED : COLORS.TEAL }}> *</span>}
        </span>
        {message && (
          <Popup
            position="top center"
            content={message}
            trigger={<Icon name={ICONS.EXCLAMATION_CIRCLE} color={COLORS.RED} />}
          />
        )}
        {!readonly && onDelete && (
          <Popup
            size="mini"
            position="top center"
            content={popupMsg}
            trigger={<Icon pointer name={ICONS.TRASH} color={COLORS.ORANGE} size="small" onClick={onDelete} />}
          />
        )}
      </Flex>
    </Label>
  );
};
