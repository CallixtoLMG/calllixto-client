"use client";
import { useEffect, useRef, useState } from 'react';
import { Flex } from "rebass";
import { Button, Header, Modal, Popup, Icon as SIcon, Transition } from 'semantic-ui-react';
import { Form, Icon, Input } from "./styles";

const ButtonDelete = ({ params, deleteQuestion, onDelete }) => {
  const [confirmationText, setConfirmationText] = useState('');
  const [isDeleteEnabled, setIsDeleteEnabled] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const inputElement = useRef(null);

  useEffect(() => {
    inputElement?.current?.focus();
  }, [showModal]);

  const handleButtonClick = () => {
    setShowModal(true);
  };

  const handleConfirmationTextChange = (e) => {
    const text = e.target.value;
    setConfirmationText(text);
    setIsDeleteEnabled(text.toLowerCase() === 'borrar');
  };

  const handleDelete = async () => {
    setIsLoading(true);
    await onDelete(params);
    setIsLoading(false);
    setShowModal(false);
  };

  return (
    <>
      <Popup
        size="mini"
        content="Eliminar"
        trigger={<Button color='red' size='tiny' content={<Icon name="trash" />} onClick={handleButtonClick} />}
      />
      <Transition visible={showModal} animation='scale' duration={500}>
        <Modal open={showModal} onClose={() => setShowModal(false)}>
          <Header icon='archive' content={deleteQuestion || ""} />
          <Modal.Actions>
            <Form>
              <Input
                placeholder="Escriba 'borrar' para eliminar"
                type="text"
                value={confirmationText}
                onChange={handleConfirmationTextChange}
                ref={inputElement}
              />
              <Flex flexDirection="row-reverse">
                <Button
                  disabled={!isDeleteEnabled || isLoading}
                  loading={isLoading}
                  color='green'
                  onClick={handleDelete}
                  type="submit"
                >
                  <SIcon name='checkmark' />Si
                </Button>
                <Button color='red' onClick={() => setShowModal(false)} disabled={isLoading}>
                  <SIcon name='trash' />No
                </Button>
              </Flex>
            </Form>
          </Modal.Actions>
        </Modal>
      </Transition>
    </>
  )
};

export default ButtonDelete;