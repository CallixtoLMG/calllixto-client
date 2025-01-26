import { PAYMENT_METHODS, PAYMENT_TABLE_HEADERS } from "@/components/budgets/budgets.common";
import { COLORS, ICONS } from "@/constants";
import es from "date-fns/locale/es";
import { useMemo, useState } from "react";
import { registerLocale } from "react-datepicker";
import { useFieldArray } from "react-hook-form";
import { Header } from "semantic-ui-react";
import { Dropdown, FieldsContainer, Flex, FlexColumn, FormField, IconedButton, Input, Label, Price, RuledLabel, Segment } from "../custom";
import DatePicker from "../custom/DatePicker";
import { Table, TotalList } from "../table";

registerLocale("es", es);

const EMPTY_PAYMENT = () => ({
  method: '',
  amount: 0,
  comments: '',
  date: new Date()
});

const calculateTotals = (payments, total) => {
  const totalAssigned = payments.reduce((sum, payment) => sum + (parseFloat(payment.amount) || 0), 0).toFixed(2);
  let totalPending = (total - totalAssigned).toFixed(2);

  if (Math.abs(totalPending) < 0.01) {
    totalPending = (0).toFixed(2);
  }

  return { totalAssigned, totalPending };
};

const Payments = ({ total, maxHeight, methods, children, update }) => {
  const { control } = methods;
  const { fields: paymentsMade, append: appendPayment, remove: removePayment } = useFieldArray({
    control,
    name: "paymentsMade"
  });

  const { totalPending, totalAssigned } = useMemo(() => calculateTotals(paymentsMade, total), [total, paymentsMade]);
  const isTotalCovered = useMemo(() => totalPending <= 0, [totalPending]);
  const [payment, setPayment] = useState(EMPTY_PAYMENT());
  const [errors, setErrors] = useState({});

  const handleAddPayment = async () => {
    if (!payment.method || payment.amount <= 0) {
      setErrors({ ...errors, amount: "El monto debe ser mayor que 0" });
      return;
    }

    if (payment.amount > totalPending) {
      setErrors({ ...errors, amount: `El monto no puede superar al total pendiente ($ ${totalPending})` });
      return;
    }

    appendPayment(payment);
    setPayment(EMPTY_PAYMENT());
    setErrors({});
  };

  const TOTAL_LIST_ITEMS = [
    { id: 1, title: "Pagado", amount: <Price value={totalAssigned} /> },
    { id: 2, title: "Pendiente", amount: <Price value={totalPending} /> },
    { id: 3, title: "Total", amount: <Price value={total} /> },
  ];

  return (
    <Flex width="100%" maxHeight={maxHeight ? "55vh" : ""}>
      <Segment padding="20px 60px 20px 20px">
        <Header>
          Detalle de Pagos
        </Header>
        <FlexColumn rowGap="15px">
          {update && (
            <FieldsContainer width="100%" alignItems="center" rowGap="5px">
              <FormField height="80px" flex="1">
                <Label>Fecha de Pago</Label>
                <DatePicker
                  selected={payment.date}
                  onChange={(date) => setPayment({ ...payment, date })}
                  placeholder="Selecciona una fecha"
                  dateFormat="dd-MM-yyyy"
                  disabled={isTotalCovered}
                  maxDate={new Date()}
                />
              </FormField>
              <FormField flex="2">
                <Label>Método</Label>
                <Dropdown
                  placeholder="Seleccione método de pago"
                  fluid
                  selection
                  options={PAYMENT_METHODS.filter((method) => method.key !== 'dolares')}
                  value={payment.method}
                  onChange={(e, { value }) => setPayment({ ...payment, method: value })}
                  disabled={isTotalCovered}
                />
              </FormField>
              <FormField flex="1">
                <RuledLabel title="Monto" message={errors.amount} required />
                {/* Usar controlled input */}
                {/* <CurrencyFormatInput
                  height="50px"
                  textAlignLast="right"
                  customInput={Input}
                  displayType="input"
                  thousandSeparator
                  decimalScale={2}
                  allowNegative={false}
                  value={payment.amount || 0}
                  prefix="$ "
                  onValueChange={(values) => {
                    const { floatValue } = values;
                    setPayment({ ...payment, amount: parseFloat(floatValue) || 0 });
                  }}
                  disabled={isTotalCovered || !payment.method}
                /> */}
              </FormField>
              <FormField flex="3">
                <Label>Comentarios</Label>
                <Input
                  type="text"
                  placeholder="Comentarios"
                  disabled={isTotalCovered || !payment.method}
                  value={payment.comments}
                  onChange={(e, { value }) => setPayment({ ...payment, comments: value })}
                />
              </FormField>
              <FormField minWidth="fit-content" width="fit-content">
                <IconedButton
                  padding="3px 18px 3px 40px"
                  size="small"
                  content="Completar"
                  icon={ICONS.CHECK}
                  labelPosition="left"
                  color={COLORS.BLUE}
                  type="button"
                  onClick={() => setPayment({ ...payment, amount: parseFloat(totalPending) })}
                  disabled={isTotalCovered}
                  width="fit-content"
                />
                <IconedButton
                  size="small"
                  icon={ICONS.ADD}
                  content="Agregar"
                  labelPosition="left"
                  color={COLORS.GREEN}
                  type="button"
                  onClick={handleAddPayment}
                  disabled={isTotalCovered}
                  width="100%"
                />
              </FormField>
            </FieldsContainer>
          )}
          <Flex width="100%">
            <Table
              headers={PAYMENT_TABLE_HEADERS}
              elements={paymentsMade}
              actions={update && [
                {
                  id: 1,
                  icon: ICONS.TRASH,
                  color: COLORS.RED,
                  onClick: (_, index) => removePayment(index),
                  tooltip: 'Eliminar',
                },
              ]}
            />
          </Flex>
          <TotalList readOnly items={TOTAL_LIST_ITEMS} />
          {update && children}
        </FlexColumn>
      </Segment>
    </Flex>
  );
};

export default Payments;
