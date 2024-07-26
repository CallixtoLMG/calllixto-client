import { Button, Icon } from "semantic-ui-react";

export const Submit = ({ isUpdating, isLoading, isDirty, onClick, disabled, color = 'green', icon, text }) => {
  return (
    <Button
      icon
      labelPosition="left"
      disabled={isLoading || !isDirty || disabled}
      loading={isLoading}
      type="submit"
      color={color}
      onClick={onClick}
      >
      <Icon name={icon ? icon : isUpdating ? "edit" : "add"} />{text ? text : isUpdating ? "Actualizar" : "Crear"}
    </Button>
  )
}

export default Submit;
