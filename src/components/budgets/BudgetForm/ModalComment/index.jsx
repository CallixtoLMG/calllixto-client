import { IconedButton } from "@/components/common/buttons";
import { ButtonsContainer, FieldsContainer, Flex, Form, FormField, Label, Segment } from "@/components/common/custom";
import { COLORS, ICONS } from "@/common/constants";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Modal, Transition } from "semantic-ui-react";
import { TextControlled } from "@/components/common/form";

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
        <Modal.Header>Comentarios del producto</Modal.Header>
        <Modal.Content>
          <Flex flexDirection="column" rowGap="15px">
            <FieldsContainer>
              <FormField flex="1">
                <Label>Código</Label>
                <Segment placeholder>{product?.code}</Segment>
              </FormField>
              <FormField flex="1">
                <Label>Nombre</Label>
                <Segment placeholder>{product?.name}</Segment>
              </FormField>
              <FormField width="50px">
                <Label>Cantidad</Label>
                <Segment placeholder>{product?.quantity}</Segment>
              </FormField>
            </FieldsContainer>
            <Form onSubmit={handleSubmit(onAddComment)}>
              <FieldsContainer>
                <TextControlled
                  flex="1"
                  name="dispatchComment"
                  placeholder="Comentario"
                />
              </FieldsContainer>
            </Form>
          </Flex>
        </Modal.Content>
        <Modal.Actions>
          <ButtonsContainer>
            <IconedButton text="Cancelar" icon={ICONS.CANCEL} color={COLORS.RED} onClick={() => onClose(false)} />
            <IconedButton text="Confirmar" icon={ICONS.CHECK} color={COLORS.GREEN} onClick={handleSubmit(onAddComment)} disabled={!isDirty} />
          </ButtonsContainer>
        </Modal.Actions>
      </Modal>
    </Transition>
  );
};

export default ModalComment;
