import { BUTTON_TEXTS, COLORS, ICONS } from "@/common/constants";
import { IconedButton } from "./";

export const Restore = ({ isUpdating, isLoading, isDirty, onClick, disabled }) => {
  return (
    <IconedButton
      text={isUpdating ? "Restaurar" : BUTTON_TEXTS.CLEAR}
      icon={isUpdating ? ICONS.UNDO :ICONS.DELETE}
      disabled={isLoading || !isDirty || disabled}
      color={COLORS.BROWN}
      onClick={onClick}
      width="130px"
    />
  )
}

export default Restore;
