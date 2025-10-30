import { useGetSetting } from "@/api/settings";
import { IconedButton } from "@/common/components/buttons";
import { Box, Button, ButtonsContainer, FieldsContainer, Flex, FlexColumn, Form, FormField } from "@/common/components/custom";
import { DropdownField, PriceField, TextAreaField } from "@/common/components/form";
import { DatePicker } from "@/common/components/form/DatePicker";
import { COLORS, ENTITIES, ICONS, RULES, SIZES } from "@/common/constants";
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
  isLoading
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
      <Modal open={open} onClose={handleClose} size="large">
        <Modal.Header>Agregar Pago</Modal.Header>
        <Modal.Content>
          <FlexColumn $rowGap="15px">
            <FieldsContainer >
              <Box fontSize="14px" margin="0" as={Form} >
                <FormField
                  selected={payment.date}
                  onChange={(date) => setPayment({ ...payment, date })}
                  dateFormat="dd-MM-yyyy"
                  disabled={isTotalCovered}
                  maxDate={new Date()}
                  label="Fecha"
                  $width="150px"
                  control={DatePicker}
                />
              </Box>
              <Flex as={Form}>
                <DropdownField
                  width="fit-content"
                  label="Método de Pago"
                  selection
                  options={paymentMethodOptions.filter((method) => method.key !== 'dolares')}
                  value={payment.method}
                  onChange={(e, { value }) => setPayment({ ...payment, method: value })}
                  disabled={isTotalCovered}
                  error={showErrors && !payment.method ? RULES.REQUIRED.required : undefined}
                />
              </Flex>
              <Flex as={Form}>
                <PriceField
                  placeholder="Monto"
                  width="150px"
                  label="Monto"
                  value={payment.amount}
                  onChange={(value) => {
                    setPayment({ ...payment, amount: value ?? 0 });
                    setExceedAmountError(false);
                  }}
                  disabled={isTotalCovered}
                  error={
                    showErrors && !payment.amount
                      ? RULES.REQUIRED.required
                      : exceedAmountError
                        ? "El monto no puede superar el total pendiente."
                        : undefined
                  }
                  onKeyDown={(e) => handleEnterKeyDown(e, handleAddPayment)}
                />
              </Flex>
              <Button
                padding="3px 18px 3px 40px"
                size={SIZES.SMALL}
                content="Completar"
                icon={ICONS.CHECK}
                labelPosition="left"
                color={COLORS.BLUE}
                type="button"
                onClick={() => setPayment({ ...payment, amount: parseFloat(totalPending) })}
                disabled={isTotalCovered || isLoading}
                width="fit-content"
                $alignSelf="end"
                height="38px"
              />
            </FieldsContainer>
            <FieldsContainer as={Form}>
              <TextAreaField
                label="Comentarios"
                value={payment.comments}
                onChange={e => setPayment({ ...payment, comments: e.target.value })}
                onKeyDown={(e) => handleEnterKeyDown(e, handleAddPayment)}
              />
            </FieldsContainer>
          </FlexColumn>
        </Modal.Content >
        <Modal.Actions>
          <ButtonsContainer>
            <IconedButton
              icon={ICONS.CLOSE}
              text="Cancelar"
              color={COLORS.RED}
              onClick={() => {
                handleClose()
                setIsModalPaymentOpen(false)
              }}
              disabled={isLoading}
            />
            <IconedButton
              icon={ICONS.ADD}
              text="Agregar"
              color={COLORS.GREEN}
              onClick={handleAddPayment}
              disabled={isTotalCovered || isLoading}
              loading={isLoading}
              submit
            />
          </ButtonsContainer>
        </Modal.Actions>
      </Modal >
    </Transition >
  );
};