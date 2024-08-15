import { PAYMENT_METHODS, PAYMENT_TABLE_HEADERS } from "@/components/budgets/budgets.common";
import { useState } from "react";
import { useFieldArray } from "react-hook-form";
import { Header } from "semantic-ui-react";
import { CurrencyFormatInput, Dropdown, FieldsContainer, Flex, FlexColumn, FormField, Icon, IconedButton, Input, Label, Price, RuledLabel, Segment } from "../custom";
import { Table, TotalList } from "../table";
// reconmbrar los totalaes
// renombrear paymentsmethod, por payments

const EMPTY_PAYMENT = { method: '', amount: 0, comments: '' };

const parseFloatSafe = (value) => {
  return typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]+/g, '')) : value;
};

const calculateTotals = (payments, finalTotal) => {
  const totalAssigned = payments.reduce((sum, payment) => sum + (parseFloat(payment.amount) || 0), 0).toFixed(2);
  const totalPending = (finalTotal - totalAssigned).toFixed(2);
  return { totalAssigned: parseFloat(totalAssigned), totalPending: parseFloat(totalPending) };
};

const PaymentMethods = ({ finalTotal, maxHeight, methods }) => {

  const [payment, setPayment] = useState(EMPTY_PAYMENT);
  const [errors, setErrors] = useState({})

  const { control, setValue } = methods;

  const { fields: payments, append: appendPayment, remove: removePayment } = useFieldArray({
    control,
    name: "payments"
  });

  const { totalPending, totalAssigned } = calculateTotals(payments, finalTotal);
  const isTotalCovered = totalPending <= 0;

  const handleCompleteAmount = () => {
    setPayment({ ...payment, amount: totalPending.toFixed(2) });
  };

  const handleAddPayment = async () => {
    if (!payment.method || payment.amount <= 0) {
      setErrors({ ...errors, amount: "El monto debe ser un número mayor que 0" })
      return
    }
    setValue("comments", "pindonganegra")
    appendPayment(payment)
    setPayment(EMPTY_PAYMENT);
    console.log("payments", payments)
    setErrors({});
  };

  const handleRemovePayment = (index) => {
    removePayment(index);
  };

  const TOTAL_LIST_ITEMS = [
    { id: 1, title: "Pagado", amount: <Price value={totalAssigned?.toFixed(2)} /> },
    { id: 2, title: "Pendiente", amount: <Price value={totalPending?.toFixed(2)} /> },
    { id: 3, title: "Total", amount: <Price value={finalTotal?.toFixed(2)} /> },
  ];

  return (
    <Flex width="100%" maxHeight={maxHeight ? "55vh" : ""}>
      <Segment padding="20px 60px 20px 20px">
        <Header>Detalle de Pagos</Header>
        <FlexColumn rowGap="15px">
          <FieldsContainer width="100%" alignItems="center" rowGap="5px">
            <FormField flex="2">
              <Label>Método</Label>
              <Dropdown
                placeholder='Seleccione método de pago'
                fluid
                selection
                options={PAYMENT_METHODS.filter((method) => method.key !== "dolares")}
                onChange={(e, { value }) => setPayment({ ...payment, method: value })}
                disabled={isTotalCovered}
              />
            </FormField>
            <FormField flex="1">
              <RuledLabel title="Monto" message={errors.paymentToAdd?.amount?.message} required />
              <CurrencyFormatInput
                height="50px"
                textAlignLast="right"
                customInput={Input}
                displayType="input"
                thousandSeparator={true}
                decimalScale={2}
                allowNegative={false}
                value={payment.amount || 0}
                prefix="$ "
                onValueChange={(values) => {
                  const { floatValue } = values;
                  setPayment({ ...payment, amount: floatValue || 0 });
                }}
                disabled={isTotalCovered}
              />

            </FormField>
            <FormField flex="3">
              <Label>Comentarios</Label>
              <Input
                type='text'
                placeholder='Comentarios'
                disabled={isTotalCovered}
                onChange={(e, { value }) => setPayment({ ...payment, comments: value })}
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
                disabled={isTotalCovered}
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
                disabled={isTotalCovered}
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