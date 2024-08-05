import { Icon } from "semantic-ui-react";
import { IconedButton } from "../custom";

export const Restore = ({ isUpdating, isLoading, isDirty, onClick, disabled }) => {
  return (
    <IconedButton
      icon
      labelPosition="left"
      disabled={isLoading || !isDirty || disabled}
      type="button"
      color="brown"
      onClick={onClick}
    >
      <Icon name={isUpdating ? "undo" : "delete"} />{isUpdating ? "Restaurar" : "Limpiar"}
    </IconedButton>
  )
}

export default Restore;
