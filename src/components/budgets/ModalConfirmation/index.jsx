import { IconedButton } from "@/common/components/buttons";
import { ButtonsContainer, FieldsContainer, Flex, FlexColumn } from "@/common/components/custom";
import { TextField } from "@/common/components/form";
import { CONTENT_SIZES, BUTTON_TEXTS, COLORS, ICONS, SIZES } from "@/common/constants";
import { getFormatedPhone } from "@/common/utils";
import CreateBudgetDeliveriesForm from "@/components/budgets/CreateBudgetDeliveriesForm";
import CreateBudgetPayments from "@/components/payments/CreateBudgetPayment";
import { useEffect, useMemo, useRef } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Form, Modal, Tab as SemanticTab, Transition } from "semantic-ui-react";
import { GroupedButtonsControlled } from "../../../common/components/form";
import { mapBudgetToDeliveryForm, PICK_UP_IN_STORE } from "../budgets.constants";
import { ModalContent, Tab } from "./styles";

const ModalConfirmation = ({
  isModalOpen,
  onClose,
  customer,
  budget,
  onConfirm,
  isLoading,
  total = 0,
  pickUpInStore,
}) => {
  const deliveryDefaults = useMemo(() => {
    if (!budget?.products) return { products: [], deliveryNote: "" };

    const deliveryForm = mapBudgetToDeliveryForm(budget);

    return {
      ...deliveryForm,
      deliveryNote: "",
      products: deliveryForm.products.map(product => ({
        ...product,
        delivered: 0,
        deliveryComment: "",
      })),
    };
  }, [budget]);

  const defaultValues = useMemo(() => ({
    paymentsMade: [],
    pickUpInStore,
    ...customer,
    ...deliveryDefaults,
  }), [customer, deliveryDefaults, pickUpInStore]);

  const methods = useForm({
    defaultValues,
    shouldUnregister: false,
  });
  const { watch } = methods;
  const formRef = useRef(null);
  const parsedTotal = useMemo(() => parseFloat(total.toFixed(2)), [total]);

  const watchPickUpInStore = watch("pickUpInStore");

  useEffect(() => {
    if (isModalOpen) {
      methods.reset(defaultValues);
    }
  }, [defaultValues, isModalOpen, methods]);

  const handleConfirmClick = () => {
    if (isLoading) return;

    if (formRef.current) {
      formRef.current.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }
  };

  const handleConfirm = (data) => {
    if (isLoading) return;

    const { paymentsMade, pickUpInStore, products, deliveryNote } = data;
    const payload = {
      paymentsMade,
      total: parsedTotal,
      pickUpInStore,
      products,
      deliveryNote,
    };
    onConfirm(payload);
  };

  const panes = [
    {
      menuItem: "Pago",
      render: () => (
        <SemanticTab.Pane>
          <FlexColumn $rowGap="15px">
            <FieldsContainer>
              <TextField
                flex="7"
                label="Dirección"
                disabled
                value={!watchPickUpInStore ? `${customer?.addresses?.[0]?.ref ? `${customer?.addresses?.[0]?.ref}:` : "(Sin referencia)"} ${customer?.addresses?.[0]?.address}` : PICK_UP_IN_STORE}
              />
              <TextField
                flex="4"
                label="Teléfono"
                disabled
                value={`${customer?.phoneNumbers?.[0]?.ref ? `${customer?.phoneNumbers?.[0]?.ref}:` : "(Sin referencia)"} ${getFormatedPhone(customer?.phoneNumbers?.[0])}`}
              />
            </FieldsContainer>
            <CreateBudgetPayments
              total={parsedTotal}
              maxHeight
              update
            />
          </FlexColumn>
        </SemanticTab.Pane>
      ),
    },
    {
      menuItem: "Entrega",
      render: () => (
        <SemanticTab.Pane>
          <CreateBudgetDeliveriesForm dataTestIdPrefix="budget-confirm-delivery" />
        </SemanticTab.Pane>
      ),
    },
  ];

  return (
    <FormProvider {...methods}>
      <Form ref={formRef} onSubmit={methods.handleSubmit(handleConfirm)}>
        <Transition visible={isModalOpen} animation='scale' duration={500}>
          <Modal size={SIZES.LARGE} open={isModalOpen} onClose={() => !isLoading && onClose(false)}>
            <Modal.Header>
              <Flex $alignItems="center" $justifyContent="space-between">
                Desea confirmar el presupuesto?
                <GroupedButtonsControlled
                  color={COLORS.BLUE}
                  width={CONTENT_SIZES.FIT}
                  name="pickUpInStore"
                  buttons={[
                    { text: PICK_UP_IN_STORE, icon: ICONS.WAREHOUSE, value: true },
                    { text: 'Enviar a dirección', icon: ICONS.TRUCK, value: false },
                  ]}
                />
              </Flex>
            </Modal.Header>
            <ModalContent>
              <Tab panes={panes} />
            </ModalContent>
            <Modal.Actions>
              <ButtonsContainer width="100%">
                <IconedButton
                  text={BUTTON_TEXTS.CANCEL}
                  icon={ICONS.CANCEL}
                  disabled={isLoading}
                  color={COLORS.RED}
                  onClick={() => onClose(false)}
                />
                <IconedButton
                  text={BUTTON_TEXTS.CONFIRM}
                  icon={ICONS.CHECK}
                  disabled={isLoading}
                  loading={isLoading}
                  color={COLORS.GREEN}
                  onClick={handleConfirmClick}
                  dataTestId="modal-confirm"
                />
              </ButtonsContainer>
            </Modal.Actions>
          </Modal>
        </Transition>
      </Form>
    </FormProvider>
  );
};

export default ModalConfirmation;
