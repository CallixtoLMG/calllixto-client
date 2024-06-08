import { ButtonsContainer, FieldsContainer, Form, FormField, Input, Label, Segment, TextArea } from "@/components/common/custom";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button, Modal, Transition } from "semantic-ui-react";

const ModalComment = ({ isModalOpen, onClose, product, onAddComment }) => {
  const { control, handleSubmit, formState: { isDirty }, reset } = useForm({
    defaultValues: {
      comment: product?.dispatchComment
    }
  });

  useEffect(() => {
    reset(isModalOpen ? { comment: product?.dispatchComment || "" } : {});
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
          <FieldsContainer>
            <FormField flex="1">
              <Label>Código</Label>
              <Segment height="40px">{product?.code}</Segment>
            </FormField>
            <FormField flex="2">
              <Label>Nombre</Label>
              <Segment height="40px">{product?.name}</Segment>
            </FormField>
          </FieldsContainer>
          <Form onSubmit={handleSubmit(onAddComment)}>
            <FieldsContainer>
              <FormField flex="1">
                <Label>Comentario</Label>
                <Controller
                  name="comment"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      height="65px"
                      as={TextArea}
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
