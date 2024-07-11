import { ButtonsContainer, Input } from "@/components/common/custom";
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button, Header, Modal, Icon as SIcon, Table, Transition } from 'semantic-ui-react';
import styled from 'styled-components';
import { Form } from "./styles";

const ProductTable = styled(Table)`
  &.ui.table {
    margin: 0;
  }
`;

const ConfirmDeleteModal = ({ open, onClose, onConfirm, products, isLoading }) => {
  const [confirmationText, setConfirmationText] = useState('');
  const [isDeleteEnabled, setIsDeleteEnabled] = useState(false);
  const { handleSubmit } = useForm();
  const inputElement = useRef(null);

  useEffect(() => {
    inputElement?.current?.focus();
    setConfirmationText('');
    setIsDeleteEnabled(false); // Resetear el estado de habilitación del botón
  }, [open]);

  const handleConfirmationTextChange = (e) => {
    const text = e.target.value;
    setConfirmationText(text);
    setIsDeleteEnabled(text.toLowerCase() === 'borrar');
  };

  return (
    <Transition visible={open} animation='scale' duration={500}>
      <Modal closeIcon open={open} onClose={onClose}>
        <Header icon='archive' content="Confirmar Eliminación" />
        <Modal.Content>
          <ProductTable celled>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Código</Table.HeaderCell>
                <Table.HeaderCell>Nombre</Table.HeaderCell>
                <Table.HeaderCell>Precio</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {products.map(product => (
                <Table.Row key={product.code}>
                  <Table.Cell>{product.code}</Table.Cell>
                  <Table.Cell>{product.name}</Table.Cell>
                  <Table.Cell>{product.price}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </ProductTable>
        </Modal.Content>
        <Modal.Actions>
          <Form onSubmit={handleSubmit(onConfirm)}>
            <Input
              height="40px"
              placeholder="Escriba 'borrar' para eliminar"
              type="text"
              value={confirmationText}
              onChange={handleConfirmationTextChange}
              ref={inputElement}
              width="220px"
            />
            <ButtonsContainer width="180px">
              <Button
                height="40px"
                disabled={!isDeleteEnabled || isLoading}
                loading={isLoading}
                color='green'
                type="submit"
              >
                <SIcon name='checkmark' />Si
              </Button>
              <Button
                height="40px"
                color='red'
                onClick={onClose}
                disabled={isLoading}
              >
                <SIcon name='trash' />No
              </Button>
            </ButtonsContainer>
          </Form>
        </Modal.Actions>
      </Modal>
    </Transition>
  );
};

export default ConfirmDeleteModal;
