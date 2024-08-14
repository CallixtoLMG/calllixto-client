import { PAYMENT_METHODS, PAYMENT_TABLE_HEADERS } from "@/components/budgets/budgets.common";
import { useState } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { Header } from "semantic-ui-react";
import { CurrencyFormatInput, Dropdown, FieldsContainer, Flex, FlexColumn, FormField, Icon, IconedButton, Input, Label, Price, RuledLabel, Segment } from "../custom";
import { Table, TotalList } from "../table";

const EMPTY_PAYMENT = { method: '', amount: 0, comments: '' };

const parseFloatSafe = (value) => {
  return typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]+/g, '')) : value;
};

const calculateTotals = (payments, finalTotal) => {
  const totalAssigned = payments.reduce((sum, payment) => sum + (parseFloat(payment.amount) || 0), 0).toFixed(2);
  const totalPending = (finalTotal - totalAssigned).toFixed(2);
  return { totalAssigned: parseFloat(totalAssigned), totalPending: parseFloat(totalPending) };
};

const PaymentMethods = ({ finalTotal, excludeDollars, maxHeight }) => {
  const formContext = useFormContext();
  if (!formContext) throw new Error("PaymentMethods must be used within a FormProvider.");

  const {
    control,
    setError,
    clearErrors,
    getValues,
    reset,
    watch,
    trigger,
    setValue,
    formState: { errors },
  } = formContext;

  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const payments = useWatch({ name: "payments", control });

  const paymentOptions = PAYMENT_METHODS.filter((method) =>
    excludeDollars ? method.key !== "dolares" : true
  );

  const { totalPending, totalAssigned } = calculateTotals(payments, finalTotal);
  const isTotalCovered = totalPending <= 0;

  const handleCompleteAmount = () => {
    setValue('paymentToAdd.amount', totalPending.toFixed(2));
  };

  const handleAddPayment = async () => {
    setIsAddingPayment(true);
    const valid = await trigger("paymentToAdd.amount");
    if (!valid) {
      setIsAddingPayment(false);
      return;
    }

    const { payments, paymentToAdd } = getValues();
    let amountValue = parseFloatSafe(paymentToAdd.amount);

    if (isNaN(amountValue) || amountValue <= 0) {
      setError("paymentToAdd.amount", {
        type: "manual",
        message: "El monto debe ser un número mayor que 0.",
      });
      setIsAddingPayment(false);
      return;
    }

    const newTotalAssigned = totalAssigned + amountValue;

    if (newTotalAssigned > finalTotal) {
      setError("paymentToAdd.amount", {
        type: "manual",
        message: `El pago no puede superar al monto total (${finalTotal.toFixed(2)}).`,
      });
      setIsAddingPayment(false);
      return;
    }

    reset({
      payments: [...payments, { ...paymentToAdd, amount: amountValue }],
      paymentToAdd: EMPTY_PAYMENT,
    });
    clearErrors("paymentToAdd.amount");
    setIsAddingPayment(false);
  };

  const handleRemovePayment = (index) => {
    const { payments } = getValues();
    const newPayments = [...payments];
    newPayments.splice(index, 1);
    reset({ payments: newPayments });
  };

  const TOTAL_LIST_ITEMS = [
    { id: 1, title: "Pagado", amount: <Price value={totalAssigned?.toFixed(2)} /> },
    { id: 2, title: "Pendiente", amount: <Price value={totalPending?.toFixed(2)} /> },
    { id: 3, title: "Total", amount: <Price value={finalTotal?.toFixed(2)} /> },
  ];

  return (
    <Flex maxHeight={maxHeight ? "55vh" : "auto"}>
      <Segment padding="20px 60px 20px 20px">
        <Header>Detalle de Pagos</Header>
        <FlexColumn rowGap="15px">
          <FieldsContainer width="100%" alignItems="center" rowGap="5px">
            <FormField flex="2">
              <Label>Método</Label>
              <Controller
                name="paymentToAdd.method"
                control={control}
                render={({ field }) => (
                  <Dropdown
                    {...field}
                    placeholder='Seleccione método de pago'
                    fluid
                    selection
                    options={paymentOptions}
                    onChange={(e, { value }) => field.onChange(value)}
                    disabled={isTotalCovered}
                  />
                )}
              />
            </FormField>
            <FormField flex="1">
              <RuledLabel title="Monto" message={errors.paymentToAdd?.amount?.message} required />
              <Controller
                name="paymentToAdd.amount"
                control={control}
                rules={{
                  validate: (value) => {
                    const numericValue = parseFloatSafe(value);
                    const remainingAmount = finalTotal - payments.reduce((sum, payment) => sum + (parseFloat(payment.amount) || 0), 0);

                    if (numericValue > remainingAmount) {
                      return `El monto no puede exceder el presupuesto restante (${remainingAmount.toFixed(2)})`;
                    }

                    if (isAddingPayment && (numericValue === 0 || isNaN(numericValue))) {
                      return "El monto debe ser mayor que 0";
                    }
                    return true;
                  }
                }}
                render={({ field }) => (
                  <CurrencyFormatInput
                    {...field}
                    height="50px"
                    textAlignLast="right"
                    customInput={Input}
                    displayType="input"
                    thousandSeparator={true}
                    decimalScale={2}
                    allowNegative={false}
                    value={field.value || 0}
                    prefix="$ "
                    onValueChange={(values) => {
                      const { floatValue } = values;
                      field.onChange(floatValue || 0);
                    }}
                    disabled={isTotalCovered || !watch('paymentToAdd.method')}
                  />
                )}
              />
            </FormField>
            <FormField flex="3">
              <Label>Comentarios</Label>
              <Controller
                name="paymentToAdd.comments"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type='text'
                    placeholder='Comentarios'
                    disabled={isTotalCovered || !watch('paymentToAdd.method')}
                  />
                )}
              />
            </FormField>
            <FormField minWidth="fit-content" width="fit-content">
              <IconedButton
                padding="3px 18px 3px 40px"
                size="small"
                icon
                labelPosition="left"
                color="blue"
                type="button"
                onClick={handleCompleteAmount}
                disabled={isTotalCovered || !watch('paymentToAdd.method')}
              >
                <Icon name="check" />Completar Monto
              </IconedButton>
              <IconedButton
                size="small"
                icon
                labelPosition="left"
                color="green"
                type="button"
                onClick={handleAddPayment}
                disabled={isTotalCovered || !watch('paymentToAdd.method')}
              >
                <Icon name="add" />Agregar
              </IconedButton>
            </FormField>
          </FieldsContainer>
          <Flex width="100%">
            <Table
              headers={PAYMENT_TABLE_HEADERS}
              elements={payments}
              actions={[
                {
                  id: 1,
                  icon: 'trash',
                  color: 'red',
                  onClick: (_, index) => handleRemovePayment(index),
                  tooltip: 'Eliminar',
                },
              ]}
            />
          </Flex>
          <FlexColumn marginLeft="auto" width="250px">
            <TotalList readOnly items={TOTAL_LIST_ITEMS} />
          </FlexColumn>
        </FlexColumn>
      </Segment>
    </Flex>
  );
};

export default PaymentMethods;
