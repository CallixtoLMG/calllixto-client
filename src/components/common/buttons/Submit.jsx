import { COLORS, ICONS } from "@/constants";
import { IconnedButton } from ".";

export const Submit = ({ isUpdating, isLoading, isDirty, onClick, disabled, color = COLORS.GREEN, icon, text }) => {
  return (
    <IconnedButton
      text={text ? text : isUpdating ? "Actualizar" : "Crear"}
      icon={icon ? icon : isUpdating ? ICONS.EDIT : ICONS.ADD}
      disabled={isLoading || !isDirty || disabled}
      loading={isLoading}
      submit
      color={color}
      onClick={onClick}
      width="130px"
    />
  )
}

export default Submit;
