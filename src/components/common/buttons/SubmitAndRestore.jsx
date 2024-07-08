import { RestoreButton, SubmitButton } from "@/components/common/buttons";
import styled from "styled-components";
import { Flex } from '@/components/common/custom';

const ButtonsContainer = styled(Flex)`
  align-self: flex-end;
  column-gap: 20px;
`;

export const SubmitAndRestore = ({ draft, isUpdating, isLoading, isDirty, onReset, extraButton, disabled, onSubmit = () => { }, color, icon, text }) => {
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
        isDirty={draft ? true : isDirty}
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
