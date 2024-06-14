import styled from "styled-components";
import { SubmitButton, RestoreButton } from "@/components/common/buttons";
import { Flex } from "rebass";

const ButtonsContainer = styled(Flex)`
  align-self: flex-end;
  column-gap: 20px;
`;

export const SubmitAndRestore = ({ isUpdating, isLoading, isDirty, onReset, extraButton, disabled, onSubmit = () => {}, color, icon, text }) => {
  return (
    <ButtonsContainer>
      <RestoreButton
        isUpdating={isUpdating}
        isLoading={isLoading}
        isDirty={isDirty}
        onClick={onReset}
        disabled={disabled}
      />
      {extraButton && extraButton}
      <SubmitButton
        isUpdating={isUpdating}
        isLoading={isLoading}
        isDirty={isDirty}
        onClick={onSubmit}
        disabled={disabled}
        color={color}
        icon={icon}
        text={text}
      />
    </ButtonsContainer>
  )
}

export default SubmitAndRestore;
