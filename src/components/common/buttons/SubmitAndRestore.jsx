import styled from "styled-components";
import { SubmitButton, RestoreButton } from "@/components/common/buttons";
import { Flex } from "rebass";

const ButtonsContainer = styled(Flex)`
  align-self: flex-end;
  column-gap: 20px;
`;

export const SubmitAndRestore = ({ show, isUpdating, isLoading, isDirty, onClick }) => {
  return (
    <>
      {show && (
        <ButtonsContainer>
          <SubmitButton isUpdating={isUpdating} isLoading={isLoading} isDirty={isDirty} />
          <RestoreButton
            isUpdating={isUpdating}
            isLoading={isLoading}
            isDirty={isDirty}
            onClick={onClick}
          />
        </ButtonsContainer>
      )}</>
  )
}

export default SubmitAndRestore;
