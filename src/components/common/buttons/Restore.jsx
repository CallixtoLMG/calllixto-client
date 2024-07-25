import { Button, Icon } from "semantic-ui-react";

export const Restore = ({ isUpdating, isLoading, isDirty, onClick, disabled }) => {
  return (
    <Button
      icon
      labelPosition="left"
      disabled={isLoading || !isDirty || disabled}
      type="button"
      color="brown"
      onClick={onClick}
      >
      <Icon name={isUpdating ? "undo" : "delete"} />{isUpdating ? "RESTAURAR" : "LIMPIAR"}
    </Button>
  )
}

export default Restore;
