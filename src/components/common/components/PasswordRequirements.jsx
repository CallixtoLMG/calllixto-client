import { COLORS, ICONS } from "@/constants";
import { MessageText } from "../../changePassword/styled";
import { Flex, FlexColumn, Icon } from "../custom";

const PasswordRequirements = ({ requirements, password }) => {
  return (
    <FlexColumn marginBottom="1em" marginLeft="1em" rowGap="3px">
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

export default PasswordRequirements;