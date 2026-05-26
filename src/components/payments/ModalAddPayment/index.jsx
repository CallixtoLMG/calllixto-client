import { useGetSetting } from "@/api/settings";
import { IconedButton } from "@/common/components/buttons";
import { ButtonsContainer, FieldsContainer, Form, FormField } from "@/common/components/custom";
import { DropdownField, PriceField, TextAreaField } from "@/common/components/form";
import { DatePicker } from "@/common/components/form/DatePicker";
import { TotalList } from "@/common/components/table";
import { BUTTON_TEXTS, COLORS, ENTITIES, FIELD_LABELS, ICONS, RULES, SIZES } from "@/common/constants";
import { handleEnterKeyDown, mapToDropdownOptions } from "@/common/utils";
import { useEffect, useMemo, useState } from "react";
import { Modal, Transition } from "semantic-ui-react";

const EMPTY_PAYMENT = () => ({
  method: '',
  amount: '',
  comments: '',
  date: new Date(),
});

export const ModalAddPayment = ({
  open,
  setIsModalPaymentOpen,
  onAdd,
  totalPending,
  paymentData,
  isLoading,
  totalListItem
}) => {
  const [payment, setPayment] = useState(EMPTY_PAYMENT());
  const [showErrors, setShowErrors] = useState(false);
  const [exceedAmountError, setExceedAmountError] = useState(false);
  const isTotalCovered = totalPending <= 0;

  const { data: paymentMethods, refetch } = useGetSetting(ENTITIES.GENERAL);

  useEffect(() => {
    if (open && paymentData) {
      setPayment({ ...paymentData });
      setExceedAmountError(false);
      setShowErrors(false);
    } else if (open && !paymentData) {
      setPayment(EMPTY_PAYMENT());
    }
  }, [open, paymentData]);

  const paymentMethodOptions = useMemo(() => {
    return mapToDropdownOptions(paymentMethods?.paymentMethods || []);
  }, [paymentMethods]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const handleAddPayment = () => {
    setShowErrors(true);

    const isEditing = !!paymentData?.id || !!paymentData?.paymentId;
    const adjustedTotalPending = isEditing
      ? parseFloat(totalPending) + parseFloat(paymentData?.amount ?? 0)
      : parseFloat(totalPending);

    if (!payment.method || payment.amount <= 0) {
      setExceedAmountError(false);
      return;
    }

    if (payment.amount > adjustedTotalPending) {
      setExceedAmountError(true);
      return;
    }

    onAdd(payment);
    handleClose();
  };

  const handleClose = () => {
    setPayment(EMPTY_PAYMENT());
    setShowErrors(false);
    setExceedAmountError(false);
  };

  return (
    <Transition visible={open} animation='scale' duration={500}>
      <Modal open={open} onClose={handleClose} >
        <Modal.Header>Agregar pago</Modal.Header>
        <Modal.Content>
          <Form>
            <FieldsContainer $justifyContent="space-between" $rowGap="15px" $columnGap="15px">
              <FormField
                flex="1"
                selected={payment.date}
                onChange={(date) => setPayment({ ...payment, date })}
                dateFormat="dd-MM-yyyy"
                disabled={isTotalCovered}
                maxDate={new Date()}
                label={FIELD_LABELS.DATE}
                placeholder="16-11-2025"
                control={DatePicker}
              />
              <FormField flex="1">
                <DropdownField
                  label="Método de pago"
                  selection
                  options={paymentMethodOptions.filter((method) => method.key !== 'dolares')}
                  value={payment.method}
                  onChange={(e, { value }) => setPayment({ ...payment, method: value })}
                  disabled={isTotalCovered}
                  error={showErrors && !payment.method ? RULES.REQUIRED.required : undefined}
                  dataTestId="budget-payment-method-dropdown"
                  required
                />
              </FormField>
              <FormField flex="1">
                <PriceField
                  placeholder="10000"
                  required
                  label={FIELD_LABELS.AMOUNT}
                  value={payment.amount}
                  onChange={(value) => {
                    setPayment({ ...payment, amount: value ?? 0 });
                    setExceedAmountError(false);
                  }}
                  disabled={isTotalCovered}
                  dataTestId="budget-payment-amount-field"
                  error={
                    showErrors && !payment.amount
                      ? RULES.REQUIRED.required
                      : exceedAmountError
                        ? "El monto no puede superar el total pendiente."
                        : undefined
                  }
                  onKeyDown={(e) => handleEnterKeyDown(e, handleAddPayment)}
                />
              </FormField>
              <IconedButton
                height="38px"
                size={SIZES.SMALL}
                text={payment.amount ? "Limpiar monto" : "Completar monto"}
                icon={payment.amount ? ICONS.MINUS : ICONS.ADD}
                labelPosition="left"
                color={payment.amount ? COLORS.ORANGE : COLORS.BLUE}
                type="button"
                onClick={() => {
                  setPayment({
                    ...payment,
                    amount: payment.amount ? '' : parseFloat(totalPending)
                  });
                  setExceedAmountError(false);
                }}
                disabled={isTotalCovered}
                iconOnly
                dataTestId="budget-payment-complete-amount-button"
              />
            </FieldsContainer>
            <FieldsContainer>
              <TextAreaField
                label={FIELD_LABELS.COMMENTS}
                value={payment.comments}
                placeholder="Primer pago"
                onChange={e => setPayment({ ...payment, comments: e.target.value })}
                onKeyDown={(e) => handleEnterKeyDown(e, handleAddPayment)}
                dataTestId="budget-payment-comments-field"
              />
            </FieldsContainer>
            <TotalList readOnly items={totalListItem} />
          </Form>
        </Modal.Content>
        <Modal.Actions>
          <ButtonsContainer>
            <IconedButton
              icon={ICONS.CLOSE}
              text={BUTTON_TEXTS.CANCEL}
              color={COLORS.RED}
              onClick={() => {
                handleClose()
                setIsModalPaymentOpen(false)
              }}
              disabled={isLoading}
            />
            <IconedButton
              icon={ICONS.ADD}
              text={BUTTON_TEXTS.ADD}
              color={COLORS.GREEN}
              onClick={handleAddPayment}
              disabled={isTotalCovered || isLoading}
              loading={isLoading}
              submit
              dataTestId="budget-payment-submit-button"
            />
          </ButtonsContainer>
        </Modal.Actions>
      </Modal >
    </Transition >
  );
};
