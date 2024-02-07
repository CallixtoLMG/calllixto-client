"use client";
import { Input } from "@/components/common/custom";
import { useEffect, useRef, useState } from 'react';
import { Flex } from "rebass";
import { Button, Header, Modal, Icon as SIcon, Transition } from 'semantic-ui-react';
import { Form } from "./styles";


const ModalDelete = ({ params, title, onDelete, showModal, setShowModal, isLoading, batch }) => {
  console.log(params)
  const [confirmationText, setConfirmationText] = useState('');
  const [isDeleteEnabled, setIsDeleteEnabled] = useState(false);

  const inputElement = useRef(null);

  useEffect(() => {
    inputElement?.current?.focus();
    setConfirmationText('');
  }, [showModal]);

  const handleConfirmationTextChange = (e) => {
    const text = e.target.value;
    setConfirmationText(text);
    setIsDeleteEnabled(text.toLowerCase() === 'borrar');
  };

  const handleDelete = async () => {
    if (batch) {
      const requestBody = {
        supplierId: params,
      };
      console.log(requestBody)
      await onDelete({ ...params, body: requestBody });
    } else {
      await onDelete(params);
    };
    setShowModal(false);
  };

  return (
    <Transition visible={showModal} animation='scale' duration={500}>
      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <Header icon='archive' content={title || ""} />
        <Modal.Actions>
          <Form>
            <Input
              placeholder="Escriba 'borrar' para eliminar"
              type="text"
              value={confirmationText}
              onChange={handleConfirmationTextChange}
              ref={inputElement}
              width="220px"
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
  )
};

export default ModalDelete;