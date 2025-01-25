import { IconnedButton } from "@/components/common/buttons";
import { ButtonsContainer, FieldsContainer, Flex, FlexColumn, FormField, Label, Segment } from "@/components/common/custom";
import Payments from "@/components/common/form/Payments";
import { COLORS, ICONS, PICK_UP_IN_STORE } from "@/constants";
import { formatedSimplePhone, now } from "@/utils";
import { useMemo, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { ButtonGroup, Form, Modal, Transition } from "semantic-ui-react";

const ModalConfirmation = ({
  isModalOpen,
  onClose,
  customer,
  onConfirm,
  isLoading,
  total = 0,
  pickUpInStore,
}) => {
  const methods = useForm({
    defaultValues: {
      paymentsMade: [],
      pickUpInStore,
      ...customer
    },
  });
  const { control, watch } = methods;
  const formRef = useRef(null);
  const parsedTotal = useMemo(() => parseFloat(total.toFixed(2)), [total]);

  const watchPickUpInStore = watch("pickUpInStore")

  const handleConfirmClick = () => {
    if (formRef.current) {
      formRef.current.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }
  };

  const handleConfirm = (data) => {
    const { paymentsMade, pickUpInStore } = data;

    const payload = {
      paymentsMade: paymentsMade?.map((payment) => ({
        ...payment,
        createdAt: now()
      })),
      total: parsedTotal,
      pickUpInStore
    };
    onConfirm(payload);
  };

  return (
    <Transition visible={isModalOpen} animation='scale' duration={500}>
      <Form ref={formRef} onSubmit={methods.handleSubmit(handleConfirm)}>
        <Modal size="large" closeIcon open={isModalOpen} onClose={() => onClose(false)}>
          <Modal.Header>
            <Flex alignItems="center" justifyContent="space-between">
              Desea confirmar el presupuesto?
              <Controller
                name="pickUpInStore"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <ButtonGroup size="small">
                    <IconnedButton
                      text={PICK_UP_IN_STORE}
                      icon={ICONS.WAREHOUSE}
                      basic={!value}
                      onClick={() => onChange(true)}
                    />
                    <IconnedButton
                      text="Enviar a Dirección"
                      icon={ICONS.TRUCK}
                      basic={value}
                      onClick={() => onChange(false)}
                    />
                  </ButtonGroup>
                )}
              />
            </Flex>
          </Modal.Header>
          <Modal.Content>
            <FlexColumn rowGap="15px">
              <FieldsContainer>
                <FormField flex="1">
                  <Label>ID</Label>
                  <Segment placeholder alignContent="center" height="40px">{customer?.name}</Segment>
                </FormField>
                <FormField flex="1">
                  <Label>Dirección</Label>
                  <Segment placeholder alignContent="center" height="40px">
                    {!watchPickUpInStore ? `${customer?.addresses?.[0]?.ref ? `${customer?.addresses?.[0]?.ref}:` : "(Sin referencia)"} ${customer?.addresses?.[0]?.address}` : PICK_UP_IN_STORE}
                  </Segment>
                </FormField>
                <FormField width="200px">
                  <Label>Teléfono</Label>
                  <Segment placeholder alignContent="center" height="40px">
                    {`${customer?.phoneNumbers?.[0]?.ref ? `${customer?.phoneNumbers?.[0]?.ref}:` : "(Sin referencia)"} ${formatedSimplePhone(customer?.phoneNumbers?.[0])}`}
                  </Segment>
                </FormField>
              </FieldsContainer>
              <Payments
                methods={methods}
                total={parsedTotal}
                maxHeight
                update
              />
            </FlexColumn>
          </Modal.Content>
          <Modal.Actions>
            <ButtonsContainer width="100%">
              <IconnedButton
                text="Cancelar"
                icon={ICONS.CANCEL}
                disabled={isLoading}
                color={COLORS.RED}
                onClick={() => onClose(false)}
              />
              <IconnedButton
                text="Confirmar"
                icon={ICONS.CHECK}
                disabled={isLoading}
                loading={isLoading}
                submit
                color={COLORS.GREEN}
                onClick={handleConfirmClick}
              />
            </ButtonsContainer>
          </Modal.Actions>
        </Modal>
      </Form>
    </Transition>
  );
};

export default ModalConfirmation;