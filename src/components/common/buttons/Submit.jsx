import { IconnedButton } from ".";

export const Submit = ({ isUpdating, isLoading, isDirty, onClick, disabled, color = 'green', icon, text }) => {
  return (
    <IconnedButton
      text={text ? text : isUpdating ? "Actualizar" : "Crear"}
      icon={icon ? icon : isUpdating ? "edit" : "add"}
      disabled={isLoading || !isDirty || disabled}
      loading={isLoading}
      submit
      color={color}
      onClick={onClick}
      width="110px"
    />
  )
}

export default Submit;
