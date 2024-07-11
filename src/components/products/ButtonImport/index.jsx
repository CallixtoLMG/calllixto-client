import { Button, ButtonsContainer } from "@/components/common/custom";
import { ButtonContent, Icon } from "semantic-ui-react";
import BatchCreate from "../BatchCreate";
import BatchUpdate from "../BatchUpdate";
import { Popup, PopupContent } from "./styles";

const ButtonImport = ({ products, createBatch, editBatch }) => {
  return (
    <Popup
      trigger={
        <ButtonsContainer>
          <Button
            animated="vertical"
            color="blue"
            width="100%"
          >
            <ButtonContent hidden>
              Importar
            </ButtonContent>
            <ButtonContent visible>
              <Icon name="upload" />
            </ButtonContent>
          </Button>
        </ButtonsContainer>}
      content={
        <PopupContent>
          <BatchCreate products={products} createBatch={createBatch} />
          <BatchUpdate products={products} editBatch={editBatch} />
        </PopupContent>
      }
      on="click"
      position='bottom center'
    />
  );
};

export default ButtonImport;