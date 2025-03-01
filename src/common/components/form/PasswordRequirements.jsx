import { COLORS, ICONS } from "@/common/constants";
import { Flex, FlexColumn, Icon } from "../custom";
import styled from "styled-components";

const MessageText = styled.p`
  display: flex;
  font-size: 12px;
  margin: 0!important;
  color: #579294;
`;

export const PasswordRequirements = ({ requirements, password }) => {
  return (
    <FlexColumn marginLeft="1em" rowGap="3px">
      {requirements.map((req, index) => (
        <Flex columnGap="5px" key={index}>
          <MessageText>
            {req.test.test(password) ? (
              <Icon name={ICONS.CHECK} color={COLORS.GREEN} />
            ) : (
              <Icon name={ICONS.X} color={COLORS.RED} />
            )}
          </MessageText>
          <MessageText>{req.label}</MessageText>
        </Flex>
      ))}
    </FlexColumn>
  );
};
