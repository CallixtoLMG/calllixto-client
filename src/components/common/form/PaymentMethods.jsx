import { Divider } from "@/components/budgets/PDFfile/styles";
import { PAYMENT_METHODS, PAYMENT_TABLE_HEADERS } from "@/components/budgets/budgets.common";
import { useEffect, useState } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { Header } from "semantic-ui-react";
import { Field } from "../components/Field";
import { CurrencyFormatInput, Dropdown, FieldsContainer, Flex, FlexColumn, FormField, Icon, IconedButton, Input, Label, Price, RuledLabel, Segment } from "../custom";
import { Table } from "../table";
const EMPTY_PAYMENT = { method: '', amount: 0, comments: '' };

// COMENTARIOS
// Como es el tema del pdf? de todos modos falta lo de gawain.
// arriba de forma de pago... titulo: detalle de pagos(crear/ confirmado / vista de confirmado) - Metodo 
// Sacar fiels de los otros lugares
// Acomodar padding para que entre bien el boton de borrar en la tabla

const parseFloatSafe = (value) => {
  return typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]+/g, '')) : value;
};

const calculateTotals = (payments, totalBudget) => {
  const totalAssigned = payments.reduce((sum, payment) => sum + (parseFloat(payment.amount) || 0), 0);
  const totalPending = totalBudget - totalAssigned;
  return { totalAssigned, totalPending };
};

const PaymentMethods = ({ totalBudget, onTotalsChange, excludeDollars }) => {
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
    formState: { errors },
  } = formContext;

  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const payments = useWatch({ name: "payments", control });

  const paymentOptions = PAYMENT_METHODS.filter((method) =>
    excludeDollars ? method.key !== "dolares" : true
  );

  useEffect(() => {
    const { totalAssigned, totalPending } = calculateTotals(payments, totalBudget);
    // onTotalsChange({ totalAssigned, totalPending });
  }, [payments, totalBudget, onTotalsChange]);

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

    const remainingAmount = totalBudget - payments.reduce((sum, payment) => sum + Number(payment.amount), 0);

    if (amountValue > remainingAmount) {
      setError("paymentToAdd.amount", {
        type: "manual",
        message: `El monto no puede exceder el presupuesto restante (${remainingAmount.toFixed(2)})`,
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

  return (
    <Segment ><Header>Detalle de pagos</Header>
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
                  const remainingAmount = totalBudget - payments.reduce((sum, payment) => sum + (parseFloat(payment.amount) || 0), 0);

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
                  disabled={!watch('paymentToAdd.method')}
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
                  disabled={!watch('paymentToAdd.method')}
                />
              )}
            />
          </FormField>
          <IconedButton
            size="small"
            icon
            labelPosition="left"
            color="green"
            type="button"
            onClick={handleAddPayment}
            disabled={!watch('paymentToAdd.method')}
          >
            <Icon name="add" />Agregar
          </IconedButton>
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
          <Field label="Pagado">
            <Price value={calculateTotals(payments, totalBudget).totalAssigned.toFixed(2)} />
          </Field>
          <Divider />
          <Field label="Pendiente">
            <Price value={calculateTotals(payments, totalBudget).totalPending.toFixed(2)} />
          </Field>
          <Divider />
          <Field label="Total"><Price value={totalBudget.toFixed(2)} /></Field>
        </FlexColumn>
      </FlexColumn>
    </Segment>
  );
};

export default PaymentMethods;
