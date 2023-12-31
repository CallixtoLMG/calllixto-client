import { Button as SButton, Icon } from "semantic-ui-react";
import styled from "styled-components";

const Button = styled(SButton)`
  width: 170px!important;
  padding: 10px 0!important;
`;

export const Submit = ({ isUpdating, isLoading, isDirty }) => {
  return (
    <Button
      disabled={isLoading || !isDirty}
      loading={isLoading}
      type="submit"
      color="green">
      <Icon name={isUpdating ? "edit" : "add"} />{isUpdating ? "Actualizar" : "Crear"}
    </Button>
  )
}

export default Submit;
