import { RestoreButton, SubmitButton } from "@/common/components/buttons";
import { ButtonsContainer } from '@/common/components/custom';

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
