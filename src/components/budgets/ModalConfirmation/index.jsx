import { IconedButton } from "@/components/common/buttons";
import { ButtonsContainer, FieldsContainer, Flex, FlexColumn } from "@/components/common/custom";
import { TextField } from "@/components/common/form";
import Payments from "@/components/common/form/Payments";
import { COLORS, ICONS, PICK_UP_IN_STORE } from "@/common/constants";
import { formatedSimplePhone } from "@/common/utils";
import { useMemo, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { ButtonGroup, Form, Modal, Transition } from "semantic-ui-react";
import { now } from "@/common/utils/dates";

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
              {/* TODO Controlled Grouped */}
              <Controller
                name="pickUpInStore"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <ButtonGroup size="small">
                    <IconedButton
                      text={PICK_UP_IN_STORE}
                      icon={ICONS.WAREHOUSE}
                      basic={!value}
                      onClick={() => onChange(true)}
                    />
                    <IconedButton
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
                <TextField
                  flex="2"
                  label="Dirección"
                  value={!watchPickUpInStore ? `${customer?.addresses?.[0]?.ref ? `${customer?.addresses?.[0]?.ref}:` : "(Sin referencia)"} ${customer?.addresses?.[0]?.address}` : PICK_UP_IN_STORE}
                />
                <TextField
                  flex="1"
                  label="Teléfono"
                  value={`${formatedSimplePhone(customer?.phoneNumbers?.[0])}`}
                />
              </FieldsContainer>
              <Payments
                total={parsedTotal}
                maxHeight
                update
              />
            </FlexColumn>
          </Modal.Content>
          <Modal.Actions>
            <ButtonsContainer width="100%">
              <IconedButton
                text="Cancelar"
                icon={ICONS.CANCEL}
                disabled={isLoading}
                color={COLORS.RED}
                onClick={() => onClose(false)}
              />
              <IconedButton
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