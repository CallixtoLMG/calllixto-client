import { COLORS, ICONS } from "@/constants";
import { IconnedButton } from ".";

export const Restore = ({ isUpdating, isLoading, isDirty, onClick, disabled }) => {
  return (
    <IconnedButton
      text={isUpdating ? "Restaurar" : "Limpiar"}
      icon={isUpdating ? ICONS.UNDO :ICONS.DELETE}
      disabled={isLoading || !isDirty || disabled}
      color={COLORS.BROWN}
      onClick={onClick}
      width="130px"
    />
  )
}

export default Restore;
