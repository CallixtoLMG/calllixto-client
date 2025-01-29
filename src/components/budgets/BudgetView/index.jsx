import { useUpdatePayments } from "@/api/budgets";
import { SubmitAndRestore } from "@/components/common/buttons";
import { Dropdown, FieldsContainer, Flex, Form, FormField, Icon, Input, Label, TextArea, ViewContainer } from "@/components/common/custom";
import Payments from "@/components/common/form/Payments";
import { Table, Total } from "@/components/common/table";
import { CommentTooltip } from "@/components/common/tooltips";
import { COLORS, ICONS, PICK_UP_IN_STORE, PRODUCT_STATES } from "@/constants";
import { useAllowUpdate } from "@/hooks/allowUpdate";
import { expirationDate, formatProductCodePopup, formatedDateOnly, formatedPercentage, formatedSimplePhone, getPrice, getTotal, isBudgetCancelled, isBudgetConfirmed, isProductOOS, now } from "@/utils";
import { useMutation } from "@tanstack/react-query";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Popup } from "semantic-ui-react";
import { getBudgetState } from "../budgets.common";
import { Container, Message, MessageHeader } from "./styles";
import { PriceLabel } from "../../common/form";

const BudgetView = ({ budget, subtotal, subtotalAfterDiscount, total, selectedContact, setSelectedContact }) => {
  const methods = useForm({
    defaultValues: {
      paymentsMade: budget?.paymentsMade || [],
    },
    mode: "onChange",
  });
  const { formState: { isDirty } } = methods;

  const formattedPaymentMethods = useMemo(() => budget?.paymentMethods?.join(' - '), [budget]);
  const { isUpdating, toggleButton, setIsUpdating } = useAllowUpdate({ canUpdate: true });
  const updatePayment = useUpdatePayments();
  const budgetState = getBudgetState(budget);

  const { mutate: mutateUpdatePayment, isPending: isLoadingUpdatePayment } = useMutation({
    mutationFn: async () => {
      const formData = methods.getValues();
      const updatedBudget = {
        ...budget,
        paymentsMade: formData.paymentsMade,
        updatedAt: now(),
      };

      const data = await updatePayment({ budget: updatedBudget, id: budget.id });

      return data;
    },
    onSuccess: (response) => {
      if (response.statusOk) {
        toast.success("Pagos actualizados!");
        setIsUpdating(false);
      } else {
        toast.error(response.error.message);
      }
    },
  });

  const BUDGET_FORM_PRODUCT_COLUMNS = useMemo(() => {
    return [
      {
        title: "Código",
        value: (product) => (
          <>
            <Popup
              size="tiny"
              trigger={<span>{formatProductCodePopup(product.code).formattedCode.substring(0, 2)}</span>}
              position="top center"
              on="hover"
              content={product.supplierName}
            />
            -
            <Popup
              size="tiny"
              trigger={<span>{formatProductCodePopup(product.code).formattedCode.substring(3, 5)}</span>}
              position="top center"
              on="hover"
              content={product.brandName}
            />
            -
            <span>{formatProductCodePopup(product.code).formattedCode.substring(6)}</span>
          </>
        ),
        id: 1,
        width: 1,
        align: 'left'
      },
      {
        title: "Cantidad", value: (product, index) => <p>{product?.quantity}</p>,
        id: 2,
        width: 2
      },
      {
        title: "Nombre",
        value: (product) => (
          <Container>
            {product.name} {product.fractionConfig?.active && `x ${product.fractionConfig?.value} ${product.fractionConfig?.unit}`}
            <Flex marginLeft="7px">
              {product.comments && <CommentTooltip comment={product.comments} />}
              {isProductOOS(product.state) && (
                <Label color={COLORS.ORANGE} size="tiny">{PRODUCT_STATES.OOS.singularTitle}</Label>
              )}
              {product.dispatchComment && (
                <Popup
                  size="mini"
                  content={product.dispatchComment}
                  position="top center"
                  trigger={<Icon name={ICONS.TRUCK} color={COLORS.ORANGE} />
                  }
                />
              )}
            </Flex>
          </Container>
        ),
        id: 3,
        width: 7,
        wrap: true,
        align: 'left'
      },
      {
        title: "Precio",
        value: (product) => <PriceLabel value={getPrice(product)} />,
        id: 4,
        width: 2,
      },
      {
        title: "Descuento",
        value: (product, index) => <p>{formatedPercentage(product?.discount)}</p>,
        id: 5,
        width: 1
      },
      {
        title: "Total",
        value: (product) => <PriceLabel value={getTotal(product)} />,
        id: 6,
        width: 3
      },
    ];
  }, []);

  return (
    <Form>
      <ViewContainer>
        {isBudgetCancelled(budget?.state) && (
          <Flex>
            <Message negative>
              <MessageHeader>Motivo de anulación</MessageHeader>
              <p>{budget?.cancelledMsg}</p>
            </Message>
          </Flex>
        )}
        <Flex justifyContent="space-between">
          <FieldsContainer>
            <FormField
              width="300px"
              label="Vendedor"
              control={Input}
              value={budget?.seller}
              readOnly
            />
            {budgetState && (
              <FormField
                width="300px"
                label={budgetState.label}
                control={Input}
                value={budgetState.person}
                readOnly
              />
            )}
          </FieldsContainer>
          <FieldsContainer>
            {budgetState && (
              <FormField
                label={budgetState.dateLabel}
                control={Input}
                value={budgetState.date}
                readOnly
              />
            )}
            {!isBudgetConfirmed(budget?.state) && !isBudgetCancelled(budget?.state) && (
              <FormField
                label="Fecha de vencimiento"
                control={Input}
                value={formatedDateOnly(expirationDate(budget?.expirationOffsetDays, budget?.createdAt))}
                readOnly
              />
            )}
          </FieldsContainer>
        </Flex>
        <FieldsContainer>
          <FormField
            width="300px"
            label="Cliente"
            control={Input}
            value={budget?.customer?.name ? budget?.customer?.name : "No se ha seleccionado cliente"}
            readOnly
          />
          <FormField
            flex="2"
            label="Dirección"
            control={Dropdown}
            value={budget?.pickUpInStore ? PICK_UP_IN_STORE : !budget?.customer?.addresses?.length ? 'No existe una dirección registrada' : `${budget.customer?.addresses?.[0]?.ref ? `${budget.customer?.addresses?.[0]?.ref} :` : ""} ${budget.customer?.addresses?.[0]?.address}`}
            readOnly
            selection
            options={budget?.customer?.addresses.map((address) => ({
              key: address.address,
              text: `${address.ref ? `${address.ref}: ` : ''}${address.address}`,
              value: address.address,
            }))}
            onChange={(e, { value }) => setSelectedContact({
              ...selectedContact,
              address: value
            })}
          />
          <FormField
            flex="1"
            label="Teléfono"
            control={Dropdown}
            value={!budget?.customer?.phoneNumbers?.length ? 'No existe un teléfono registrado' : budget?.customer?.phoneNumbers.length === 1 ? `${budget.customer?.phoneNumbers?.[0]?.ref ? `${budget.customer?.phoneNumbers?.[0]?.ref} : ` : ""} ${formatedSimplePhone(budget.customer?.phoneNumbers?.[0])}` : selectedContact?.phone}
            readOnly
            selection
            options={budget?.customer?.phoneNumbers.map((phone) => ({
              key: formatedSimplePhone(phone),
              text: `${phone.ref ? `${phone.ref}: ` : ''}${formatedSimplePhone(phone)}`,
              value: formatedSimplePhone(phone),
            }))}
            onChange={(e, { value }) => setSelectedContact({
              ...selectedContact,
              phone: value
            })}
          />
        </FieldsContainer>
        <Table
          mainKey="key"
          headers={BUDGET_FORM_PRODUCT_COLUMNS}
          elements={budget?.products}
        />
        <Total
          readOnly
          subtotal={subtotal}
          total={total}
          subtotalAfterDiscount={subtotalAfterDiscount}
          globalDiscount={budget?.globalDiscount}
          additionalCharge={budget?.additionalCharge}
        />
        {
          (isBudgetConfirmed(budget?.state) || isBudgetCancelled(budget?.state)) && (
            <>
              {isBudgetConfirmed(budget?.state) &&
                <Flex justifyContent="space-between">
                  {toggleButton}
                </Flex>}
              <Payments update={isUpdating} total={total} methods={methods}>
                <SubmitAndRestore
                  isUpdating={isUpdating}
                  isLoading={isLoadingUpdatePayment}
                  isDirty={isDirty}
                  onSubmit={() => mutateUpdatePayment()}
                  onReset={() => methods.reset({ paymentsMade: budget.paymentsMade })}
                  disabled={!isDirty}
                  text="Guardar"
                />
              </Payments>
            </>
          )
        }
        <FormField
          control={TextArea}
          label="Comentarios"
          width="100%"
          placeholder="Comentarios"
          value={budget?.comments}
          readOnly
        />
        <FormField
          control={Input}
          label="Métodos de pago"
          width="100%"
          value={formattedPaymentMethods}
          readOnly
        />
      </ViewContainer>
    </Form>
  );
};

export default BudgetView;
