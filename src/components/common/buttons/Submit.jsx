import { Button as SButton, Icon } from "semantic-ui-react";
import styled from "styled-components";

const Button = styled(SButton)`
  width: 120px!important;
  padding: 10px 0!important;
`;

export const Submit = ({ isUpdating, isLoading, isDirty, onClick, disabled, color = 'green', icon, text }) => {
  return (
    <Button
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
