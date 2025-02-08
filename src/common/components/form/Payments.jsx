import { DropdownField, PriceField, PriceLabel, TextField } from "@/common/components/form";
import { COLORS, ICONS, RULES } from "@/common/constants";
import { PAYMENT_METHODS, PAYMENT_TABLE_HEADERS } from "@/components/budgets/budgets.constants";
import es from "date-fns/locale/es";
import { useMemo, useState } from "react";
import { registerLocale } from "react-datepicker";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Header } from "semantic-ui-react";
import { Button, FieldsContainer, Flex, FlexColumn, FormField, Segment } from "../custom";
import DatePicker from "../custom/DatePicker";
import { Table, TotalList } from "../table";

registerLocale("es", es);

const EMPTY_PAYMENT = () => ({
  method: '',
  amount: '',  
  comments: '',
  date: new Date(),
});

const calculateTotals = (payments, total) => {
  const totalAssigned = payments.reduce((sum, payment) => sum + (parseFloat(payment.amount) || 0), 0).toFixed(2);
  let totalPending = (total - totalAssigned).toFixed(2);

  if (Math.abs(totalPending) < 0.01) {
    totalPending = (0).toFixed(2);
  }

  return { totalAssigned, totalPending };
};

const Payments = ({ total, maxHeight, children, update }) => {
  const methods = useFormContext();
  const { control } = methods;
  const { fields: paymentsMade, append: appendPayment, remove: removePayment } = useFieldArray({
    control,
    name: "paymentsMade"
  });

  const { totalPending, totalAssigned } = useMemo(() => calculateTotals(paymentsMade, total), [total, paymentsMade]);
  const isTotalCovered = useMemo(() => totalPending <= 0, [totalPending]);
  const [payment, setPayment] = useState(EMPTY_PAYMENT());

  const handleAddPayment = async () => {
    if (!payment.method || payment.amount <= 0) {
      return;
    }

    if (payment.amount > totalPending) {
      return;
    }

    appendPayment(payment);

    setPayment(EMPTY_PAYMENT());
  };

  const TOTAL_LIST_ITEMS = [
    { id: 1, title: "Pagado", amount: <PriceLabel value={totalAssigned} /> },
    { id: 2, title: "Pendiente", amount: <PriceLabel value={totalPending} /> },
    { id: 3, title: "Total", amount: <PriceLabel value={total} /> },
  ];

  return (
    <Flex width="100%" maxHeight={maxHeight ? "55vh" : ""}>
      <Segment padding="25px 60px 25px 35px">
        <Header>
          Detalle de Pagos
        </Header>
        <FlexColumn rowGap="15px">
          {update && (
            <FieldsContainer>
              <FormField
                selected={payment.date}
                onChange={(date) => setPayment({ ...payment, date })}
                dateFormat="dd-MM-yyyy"
                disabled={isTotalCovered}
                maxDate={new Date()}
                label="Fecha"
                width="150px"
                control={DatePicker}>
              </FormField>
              <DropdownField
                width="fit-content"
                label="Método de Pago"
                options={PAYMENT_METHODS.filter((method) => method.key !== 'dolares')}
                value={payment.method}
                onChange={(e, { value }) => setPayment({ ...payment, method: value })}
                disabled={isTotalCovered}
                error={!payment.method && RULES.REQUIRED.required}
              />
              <PriceField
                placeholder="Monto"
                width="150px"
                label="Monto"
                value={payment.amount}   // Mantenemos este valor siempre sincronizado
                onChange={(value) => {
                  setPayment({ ...payment, amount: value || 0 });  // Asignamos siempre el valor actualizado
                }}
                disabled={false}
                error={!payment.amount && RULES.REQUIRED.required}
              />
              <TextField
                flex="1"
                label="Comentarios"
                disabled={isTotalCovered || !payment.method}
                value={payment.comments}
                onChange={e => {
                  setPayment({ ...payment, comments: e.target.value });
                }}
              />
              <FormField minWidth="fit-content" width="fit-content">
                <FlexColumn rowGap="5px">
                  <Button
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
                  <Button
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
                </FlexColumn>
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
