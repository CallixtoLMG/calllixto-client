import { COLORS, ICONS } from "@/common/constants";
import styled from "styled-components";
import { Flex, FlexColumn, Icon } from "../custom";

const MessageText = styled.p`
  font-size: 12px;
  margin: 0!important;
  color: #579294;
`;

export const isPasswordConfirmationValid = (password, confirmPassword) =>
  Boolean(password) && Boolean(confirmPassword) && password === confirmPassword;

export const PASSWORD_MATCH_REQUIREMENT = {
  label: "Las contraseñas coinciden.",
  test: (password, { confirmPassword } = {}) =>
    isPasswordConfirmationValid(password, confirmPassword),
};

export const getRequirementPassed = (requirement, password, context) => {
  if (typeof requirement.test === "function") {
    return requirement.test(password, context);
  }

  return requirement.test.test(password ?? "");
};

export const PasswordRequirements = ({
  requirements,
  password,
  additionalRequirements = [],
  context = {},
}) => {
  const allRequirements = [...requirements, ...additionalRequirements];

  return (
    <FlexColumn $marginLeft="1em" $rowGap="3px">
      {allRequirements.map((req, index) => (
        <Flex $columnGap="5px" key={index}>
          <MessageText>
            {getRequirementPassed(req, password, context) ? (
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
