import { IconedButton } from "@/common/components/buttons";
import { ButtonsContainer, FieldsContainer, Flex, Form } from "@/common/components/custom";
import { TextControlled, TextField } from "@/common/components/form";
import { COLORS, ICONS } from "@/common/constants";
import { useEffect, useRef } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Modal, Transition } from "semantic-ui-react";

const ModalComment = ({ isModalOpen, onClose, product, onAddComment }) => {
  const methods = useForm();
  const { handleSubmit, formState: { isDirty }, reset } = methods;
  const commentInputRef = useRef(null);

  useEffect(() => {
    if (isModalOpen) {
      const timeout = setTimeout(() => {
        commentInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [isModalOpen]);

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
            <FormProvider {...methods}>
              <Form onSubmit={handleSubmit(onAddComment)}>
                <FieldsContainer>
                  <TextField flex="1" label="Código" placeholder={product?.code} disabled />
                  <TextField flex="1" label="Nombre" placeholder={product?.name} disabled />
                  <TextField width="100px" label="Cantidad" placeholder={product?.quantity} disabled />
                </FieldsContainer>
                <FieldsContainer>
                  <TextControlled
                    flex="1"
                    name="dispatchComment"
                    placeholder="Comentario"
                    ref={commentInputRef}
                  />
                </FieldsContainer>
              </Form>
            </FormProvider>
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
