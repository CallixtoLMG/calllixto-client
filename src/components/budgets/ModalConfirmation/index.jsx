import { IconedButton } from "@/common/components/buttons";
import { ButtonsContainer, FieldsContainer, Flex, FlexColumn } from "@/common/components/custom";
import { TextField } from "@/common/components/form";
import Payments from "@/common/components/form/Payments";
import { COLORS, ICONS } from "@/common/constants";
import { getFormatedPhone } from "@/common/utils";
import { now } from "@/common/utils/dates";
import { useMemo, useRef } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Form, Modal, Transition } from "semantic-ui-react";
import { GroupedButtonsControlled } from "../../../common/components/form";
import { PICK_UP_IN_STORE } from "../budgets.constants";

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
  const { watch } = methods;
  const formRef = useRef(null);
  const parsedTotal = useMemo(() => parseFloat(total.toFixed(2)), [total]);

  const watchPickUpInStore = watch("pickUpInStore");

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
      <FormProvider {...methods}>
        <Form ref={formRef} onSubmit={methods.handleSubmit(handleConfirm)}>
          <Modal size="large" closeIcon open={isModalOpen} onClose={() => onClose(false)}>
            <Modal.Header>
              <Flex $alignItems="center" $justifyContent="space-between">
                Desea confirmar el presupuesto?
                <GroupedButtonsControlled
                  name="pickUpInStore"
                  buttons={[
                    { text: PICK_UP_IN_STORE, icon: ICONS.WAREHOUSE, value: true },
                    { text: 'Enviar a Dirección', icon: ICONS.TRUCK, value: false },
                  ]}
                />
              </Flex>
            </Modal.Header>
            <Modal.Content>
              <FlexColumn $rowGap="15px">
                <FieldsContainer>
                  <TextField
                    flex="2"
                    label="Dirección"
                    value={!watchPickUpInStore ? `${customer?.addresses?.[0]?.ref ? `${customer?.addresses?.[0]?.ref}:` : "(Sin referencia)"} ${customer?.addresses?.[0]?.address}` : PICK_UP_IN_STORE}
                  />
                  <TextField
                    flex="1"
                    label="Teléfono"
                    value={`${customer?.phoneNumbers?.[0]?.ref ? `${customer?.phoneNumbers?.[0]?.ref}:` : "(Sin referencia)"} ${getFormatedPhone(customer?.phoneNumbers?.[0])}`}
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
      </FormProvider>
    </Transition>
  );
};

export default ModalConfirmation;