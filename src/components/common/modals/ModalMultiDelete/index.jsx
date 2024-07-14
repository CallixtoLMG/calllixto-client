import { ButtonsContainer, Input, Price } from "@/components/common/custom";
import { formatedPrice } from "@/utils";
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button, Header, Icon as SIcon, Table, Transition } from 'semantic-ui-react';
import { Cell, HeaderCell } from "../../table";
import { Form, Modal, ModalContent, TableRow } from "./styles";

const ConfirmDeleteModal = ({ open, onClose, onConfirm, products, isLoading }) => {
  const [confirmationText, setConfirmationText] = useState('');
  const [isDeleteEnabled, setIsDeleteEnabled] = useState(false);
  const { handleSubmit } = useForm();
  const inputElement = useRef(null);

  useEffect(() => {
    inputElement?.current?.focus();
    setConfirmationText('');
    setIsDeleteEnabled(false);
  }, [open]);

  const handleConfirmationTextChange = (e) => {
    const text = e.target.value;
    setConfirmationText(text);
    setIsDeleteEnabled(text.toLowerCase() === 'borrar');
  };

  return (
    <Transition visible={open} animation='scale' duration={500}>
      <Modal closeIcon open={open} onClose={onClose}>
        <Header icon='trash' content="Estás seguro de que desea eliminar estos productos?" ></Header>
        <ModalContent>
          <Table celled>
            <Table.Header>
              <TableRow>
                <HeaderCell width="20%" >Código</HeaderCell>
                <HeaderCell>Nombre</HeaderCell>
                <HeaderCell width="20%">Precio</HeaderCell>
              </TableRow>
            </Table.Header>
            <Table.Body>
              {products.map(product => (
                <TableRow key={product.code}>
                  <Cell align="left" >{product.code}</Cell>
                  <Cell align="left" $wrap>{product.name}</Cell>
                  <Cell><Price value={formatedPrice(product.price)} /></Cell>
                </TableRow>
              ))}
            </Table.Body>
          </Table>
        </ModalContent>
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
                color='red'
                onClick={onClose}
                disabled={isLoading}
              >
                <SIcon name='trash' />No
              </Button>
              <Button
                height="40px"
                disabled={!isDeleteEnabled || isLoading}
                loading={isLoading}
                color='green'
                type="submit"
              >
                <SIcon name='checkmark' />Si
              </Button>
            </ButtonsContainer>
          </Form>
        </Modal.Actions>
      </Modal>
    </Transition>
  );
};

export default ConfirmDeleteModal;
