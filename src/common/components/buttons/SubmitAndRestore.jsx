import { RestoreButton, SubmitButton } from "@/common/components/buttons";
import { ButtonsContainer } from '@/common/components/custom';

export const SubmitAndRestore = ({ canSubmitWithoutChanges, submit, isUpdating, isLoading, isDirty, onReset, extraButton, disabled, onSubmit = () => { }, color, icon, text }) => {

  const submitIsDirty = canSubmitWithoutChanges ? true : isDirty;

  return (
    <ButtonsContainer>
      <RestoreButton
        isUpdating={isUpdating}
        isLoading={isLoading}
        isDirty={isDirty}
        onClick={onReset}
        disabled={disabled}
      />
      {extraButton}
      <SubmitButton
        isUpdating={isUpdating}
        isLoading={isLoading}
        isDirty={submitIsDirty}
        onClick={onSubmit}
        color={color}
        icon={icon}
        text={text}
        submit={submit}
      />
    </ButtonsContainer>
  )
}

export default SubmitAndRestore;
