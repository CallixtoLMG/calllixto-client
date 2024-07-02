import { ButtonsContainer, FieldsContainer, Form, FormField, Input, Label, Segment } from "@/components/common/custom";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button, Modal, Transition } from "semantic-ui-react";

const ModalComment = ({ isModalOpen, onClose, product, onAddComment }) => {
  const { control, handleSubmit, formState: { isDirty }, reset } = useForm();

  useEffect(() => {
    reset({ dispatchComment: '', ...product });
  }, [isModalOpen, product, reset]);

  return (
    <Transition visible={isModalOpen} animation='scale' duration={500}>
      <Modal
        closeIcon={true}
        open={isModalOpen}
        onClose={() => onClose(false)}
      >
        <Modal.Header>Comentario para remito</Modal.Header>
        <Modal.Content>
          <FieldsContainer my={15}>
            <FormField flex="1">
              <Label>Código</Label>
              <Segment>{product?.code}</Segment>
            </FormField>
            <FormField flex="1">
              <Label>Nombre</Label>
              <Segment>{product?.name}</Segment>
            </FormField>
            <FormField width="50px">
              <Label>Cantidad</Label>
              <Segment>{product?.quantity}</Segment>
            </FormField>
          </FieldsContainer>
          <Form onSubmit={handleSubmit(onAddComment)}>
            <FieldsContainer>
              <FormField flex="1">
                <Label>Comentario</Label>
                <Controller
                  name="dispatchComment"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Comentario"
                    />
                  )}
                />
              </FormField>
            </FieldsContainer>
            <ButtonsContainer>
              <Button
                disabled={!isDirty}
                type="submit"
                color="green"
              >
                Confirmar
              </Button>
              <Button
                type="button"
                color="red"
                onClick={() => onClose(false)}
              >
                Cancelar
              </Button>
            </ButtonsContainer>
          </Form>
        </Modal.Content>
      </Modal>
    </Transition>
  );
};

export default ModalComment;
