import { Icon } from "semantic-ui-react";
import { IconedButton } from "../custom";

export const Submit = ({ isUpdating, isLoading, isDirty, onClick, disabled, color = 'green', icon, text }) => {
  return (
    <IconedButton
      icon
      labelPosition="left"
      disabled={isLoading || !isDirty || disabled}
      loading={isLoading}
      type="submit"
      color={color}
      onClick={onClick}
      >
      <Icon name={icon ? icon : isUpdating ? "edit" : "add"} />{text ? text : isUpdating ? "Actualizar" : "Crear"}
    </IconedButton>
  )
}

export default Submit;
